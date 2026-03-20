import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/Booking.js';
import Hotel from '../models/Hotel.js';
import sendEmail from '../utils/sendEmail.js';
import { createNotification } from './notificationController.js';
import { getPaymentConfirmedTemplate } from '../utils/emailTemplates.js';

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to pay for this booking');
    }

    // For demo/development: Check if keys are placeholders
    const isMock = !process.env.RAZORPAY_KEY_ID || 
                   process.env.RAZORPAY_KEY_ID === 'test_key_id' || 
                   process.env.RAZORPAY_KEY_ID.includes('test');

    if (isMock) {
      const mockOrder = {
        id: `order_mock_${Date.now()}`,
        amount: booking.totalAmount * 100,
        currency: 'INR',
        receipt: `receipt_order_${booking._id}`,
        status: 'created',
        isMock: true
      };
      booking.razorpayOrderId = mockOrder.id;
      await booking.save();
      return res.json(mockOrder);
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: booking.totalAmount * 100, // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_order_${booking._id}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      res.status(500);
      throw new Error('Some error occured creating order');
    }

    booking.razorpayOrderId = order.id;
    await booking.save();

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      bookingId,
    } = req.body;

    const booking = await Booking.findById(bookingId).populate('hotelId userId roomId');
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    const sendConfirmationEmail = async (b) => {
        const nights = Math.ceil((new Date(b.checkOut) - new Date(b.checkIn)) / (1000 * 60 * 60 * 24));

      const emailHtml = getPaymentConfirmedTemplate({
        userName: b.userId.name,
        hotelName: b.hotelId.name,
        hotelAddress: b.hotelId.address,
        hotelCity: b.hotelId.city,
        roomType: b.roomId.type,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        transactionId: b.razorpayPaymentId || 'N/A',
        totalAmount: b.totalAmount,
        guests: b.guests,
        nights: nights,
        pricePerNight: b.roomId.pricePerNight
      });

        await sendEmail({
            email: req.user.email,
            subject: `[Navan] Settlement Confirmed: ${b.hotelId.name}`,
            message: `Your booking at ${b.hotelId.name} (${b.roomId.type}) for ${new Date(b.checkIn).toLocaleDateString()} to ${new Date(b.checkOut).toLocaleDateString()} is confirmed. Transaction ID: ${b.razorpayPaymentId}`,
            html: emailHtml
        });
    };

    // Mock Verification for demo
    if (razorpayOrderId.startsWith('order_mock_')) {
        booking.status = 'Confirmed';
        booking.paymentStatus = 'Paid';
        booking.razorpayPaymentId = 'pay_mock_' + Date.now();
        booking.expiresAt = null;
        await booking.save();

        await sendConfirmationEmail(booking);

        const io = req.app.get('socketio');
        if (io) {
            // Public availability update
            io.to(booking.hotelId._id.toString()).emit('booking_confirmed', { room: booking.roomId });
            
            // Manager notification
            // hotel is already populated in booking.hotelId
            if (booking.hotelId) {
                io.to(`manager_${booking.hotelId.managerId.toString()}`).emit('new_reservation_alert', {
                    hotelName: booking.hotelId.name,
                    amount: booking.totalAmount,
                    guest: req.user.name
                });
            }

            // Admin global monitoring
            io.to('admin_room').emit('global_activity', {
                type: 'booking',
                amount: booking.totalAmount,
                location: booking.hotelId?.city
            });
        }

        // Trigger Notification
        await createNotification(
            req.app,
            req.user._id,
            'payment',
            `Payment of ₹${booking.totalAmount} confirmed for your stay at ${booking.hotelId.name}.`,
            {
                email: req.user.email,
                subject: 'Navan: Payment Confirmed',
            }
        );

        return res.json({ success: true, message: 'Mock payment verified successfully' });
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
    let expectedSignature = hmac.digest('hex');

    if (expectedSignature === razorpaySignature) {
        booking.status = 'Confirmed';
        booking.paymentStatus = 'Paid';
        booking.razorpayPaymentId = razorpayPaymentId;
        booking.expiresAt = null; // Remove lock
        await booking.save();

        await sendConfirmationEmail(booking);

        // Emit socket event to notify other users of availability change
        const io = req.app.get('socketio');
        if (io) {
            // Public availability
            io.to(booking.hotelId._id.toString()).emit('booking_confirmed', { room: booking.roomId });

            // Manager notification
            // hotel is already populated in booking.hotelId
            if (booking.hotelId) {
                io.to(`manager_${booking.hotelId.managerId.toString()}`).emit('new_reservation_alert', {
                    hotelName: booking.hotelId.name,
                    amount: booking.totalAmount,
                    guest: req.user.name
                });
            }

            // Admin global monitoring
            io.to('admin_room').emit('global_activity', {
                type: 'booking',
                amount: booking.totalAmount,
                location: booking.hotelId?.city
            });
        }

        // Trigger Notification
        await createNotification(
            req.app,
            req.user._id,
            'payment',
            `Payment of ₹${booking.totalAmount} confirmed for your stay at ${booking.hotelId.name}.`,
            {
                email: req.user.email,
                subject: 'LuxStay: Payment Confirmed',
            }
        );

        res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400);
      throw new Error('Invalid signature sent!');
    }
  } catch (error) {
    next(error);
  }
};

import { applyRefund } from '../services/paymentService.js';

// @desc    Process Refund (Manual/Admin)
// @route   POST /api/payments/refund/:id
// @access  Private
const processRefund = async (req, res, next) => {
    try {
        const result = await applyRefund(req.params.id);
        if (!result) {
            res.status(400);
            throw new Error('Refund not possible');
        }
        res.json(result);
    } catch (error) {
        next(error);
    }
};

// @desc    Get Invoice Data
// @route   GET /api/payments/invoice/:id
// @access  Private
const getInvoiceData = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('hotelId', 'name address city country')
            .populate('roomId', 'type')
            .populate('userId', 'name email');

        if (!booking) {
            res.status(404);
            throw new Error('Booking not found');
        }

        // Authorization check
        if (booking.userId._id.toString() !== req.user._id.toString() && 
            req.user.role !== 'admin' && 
            req.user.role !== 'manager') {
            res.status(403);
            throw new Error('Not authorized to access this invoice');
        }

        const invoice = {
            invoiceNumber: `INV-${booking._id.toString().slice(-6).toUpperCase()}`,
            date: new Date().toLocaleDateString(),
            hotel: booking.hotelId,
            guest: booking.userId,
            roomType: booking.roomId.type,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            nights: Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)),
            totalAmount: booking.totalAmount,
            status: booking.paymentStatus,
            transactionId: booking.razorpayPaymentId
        };

        res.json(invoice);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments/all
// @access  Private/Admin
const getAllPayments = async (req, res, next) => {
    try {
        const payments = await Booking.find({ paymentStatus: { $in: ['Paid', 'Refunded'] } })
            .populate('userId', 'name email')
            .populate('hotelId', 'name city')
            .populate('roomId', 'type')
            .sort('-updatedAt');
        res.json(payments);
    } catch (error) {
        next(error);
    }
};

export { createOrder, verifyPayment, processRefund, getInvoiceData, getAllPayments };
