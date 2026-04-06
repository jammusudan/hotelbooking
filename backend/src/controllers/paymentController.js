import Razorpay from 'razorpay';
import Stripe from 'stripe';
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
        transactionId: b.stripePaymentId || b.razorpayPaymentId || 'N/A',
        totalAmount: b.totalAmount,
        guests: b.guests,
        nights: nights,
        pricePerNight: b.roomId.pricePerNight
      });

      await sendEmail({
        email: b.userId.email,
        subject: `[Navan] Settlement Confirmed: ${b.hotelId.name}`,
        message: `Your booking at ${b.hotelId.name} is confirmed.`,
        html: emailHtml
      });
    };

    const handleSuccessfulPayment = async (b, paymentId, gateway = 'razorpay') => {
      b.status = 'Confirmed';
      b.paymentStatus = 'Paid';
      if (gateway === 'razorpay') b.razorpayPaymentId = paymentId;
      else b.stripePaymentId = paymentId;
      b.expiresAt = null;
      await b.save();

      await sendConfirmationEmail(b);

      const io = req.app.get('socketio');
      if (io) {
        io.to(b.hotelId._id.toString()).emit('booking_confirmed', { room: b.roomId });
        if (b.hotelId) {
          io.to(`manager_${b.hotelId.managerId.toString()}`).emit('new_reservation_alert', {
            hotelName: b.hotelId.name,
            amount: b.totalAmount,
            guest: b.userId.name
          });
        }
        io.to('admin_room').emit('global_activity', {
          type: 'booking',
          amount: b.totalAmount,
          location: b.hotelId?.city
        });
      }

      await createNotification(
        req.app,
        b.userId._id,
        'payment',
        `Payment of ₹${b.totalAmount} confirmed for your stay at ${b.hotelId.name}.`,
        {
          email: b.userId.email,
          subject: 'Navan: Payment Confirmed',
        }
      );
    };

    // Mock Verification for demo
    if (razorpayOrderId.startsWith('order_mock_')) {
      await handleSuccessfulPayment(booking, 'pay_mock_' + Date.now(), 'razorpay');
      return res.json({ success: true, message: 'Mock payment verified successfully' });
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
    let expectedSignature = hmac.digest('hex');

    if (expectedSignature === razorpaySignature) {
      await handleSuccessfulPayment(booking, razorpayPaymentId, 'razorpay');
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
    const booking = await Booking.findById(req.params.id).populate('hotelId');
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Authorization: Admin or Manager of this hotel
    if (req.user.role !== 'admin' &&
      (req.user.role === 'manager' && booking.hotelId.managerId.toString() !== req.user._id.toString())) {
      res.status(403);
      throw new Error('Not authorized to process this refund');
    }

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

// @desc    Create Stripe Session
// @route   POST /api/payments/create-stripe-session
// @access  Private
const createStripeSession = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate('hotelId roomId');

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    const isMock = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('test');

    if (isMock) {
      booking.stripeSessionId = `sess_mock_${Date.now()}`;
      await booking.save();
      return res.json({ id: booking.stripeSessionId, url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/${bookingId}?success=true&gateway=stripe`, isMock: true });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'upi'],
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `${booking.hotelId.name} - ${booking.roomId.type}`,
              description: `Booking from ${new Date(booking.checkIn).toLocaleDateString()} to ${new Date(booking.checkOut).toLocaleDateString()}`,
            },
            unit_amount: booking.totalAmount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/${bookingId}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/${bookingId}?cancelled=true`,
      metadata: {
        bookingId: booking._id.toString(),
      },
    });

    booking.stripeSessionId = session.id;
    await booking.save();

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Stripe Payment
// @route   POST /api/payments/verify-stripe
// @access  Private
const verifyStripePayment = async (req, res, next) => {
  try {
    const { sessionId, bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate('hotelId userId roomId');

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    if (booking.paymentStatus === 'Paid') {
      return res.json({ success: true, message: 'Already paid' });
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
        transactionId: b.stripePaymentId || b.razorpayPaymentId || 'N/A',
        totalAmount: b.totalAmount,
        guests: b.guests,
        nights: nights,
        pricePerNight: b.roomId.pricePerNight
      });

      await sendEmail({
        email: b.userId.email,
        subject: `[Navan] Settlement Confirmed: ${b.hotelId.name}`,
        message: `Your booking at ${b.hotelId.name} is confirmed.`,
        html: emailHtml
      });
    };

    if (sessionId.startsWith('sess_mock_')) {
      await handleSuccessfulPayment(booking, 'pay_stripe_mock_' + Date.now(), 'stripe');
      return res.json({ success: true });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      await handleSuccessfulPayment(booking, session.payment_intent, 'stripe');
      res.json({ success: true });
    } else {
      res.status(400);
      throw new Error('Payment not completed');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create Stripe Payment Intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate('hotelId roomId');

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.totalAmount * 100,
      currency: 'inr',
      payment_method_types: ['card', 'upi'],
      metadata: { bookingId: booking._id.toString() },
      description: `Payment for booking ${booking._id}`,
      shipping: {
        name: req.user.name,
        address: {
          line1: 'Placeholder Address', // Stripe often requires this for some Indian regulations
          city: booking.hotelId.city,
          country: 'IN',
          postal_code: '000000'
        }
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Stripe Payment Intent
// @route   POST /api/payments/verify-payment-intent
// @access  Private
const verifyPaymentIntent = async (req, res, next) => {
  try {
    const { paymentIntentId, bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate('hotelId userId roomId');

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    if (booking.paymentStatus === 'Paid') {
      return res.json({ success: true, message: 'Already paid' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status === 'succeeded') {
      // Need to define handleSuccessfulPayment here if not shared
      // Oh wait, handleSuccessfulPayment is defined internally in verifyPayment and verifyStripePayment...
      // This is a bad pattern. Let's refactor it or just copy it for now.
      // Actually, handleSuccessfulPayment was defined INSIDE verifyPayment. 
      // Let's make it a separate helper or just use the logic.

      // Let's copy the logic for now to avoid breaking other things, 
      // but better would be to pull it out.

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
          transactionId: b.stripePaymentId || b.razorpayPaymentId || 'N/A',
          totalAmount: b.totalAmount,
          guests: b.guests,
          nights: nights,
          pricePerNight: b.roomId.pricePerNight
        });

        await sendEmail({
          email: b.userId.email,
          subject: `[Navan] Settlement Confirmed: ${b.hotelId.name}`,
          message: `Your booking at ${b.hotelId.name} is confirmed.`,
          html: emailHtml
        });
      };

      booking.status = 'Confirmed';
      booking.paymentStatus = 'Paid';
      booking.stripePaymentId = intent.id;
      booking.expiresAt = null;
      await booking.save();

      await sendConfirmationEmail(booking);

      const io = req.app.get('socketio');
      if (io) {
        io.to(booking.hotelId._id.toString()).emit('booking_confirmed', { room: booking.roomId });
      }

      await createNotification(
        req.app,
        booking.userId._id,
        'payment',
        `Payment of ₹${booking.totalAmount} confirmed for your stay at ${booking.hotelId.name}.`,
        {
          email: booking.userId.email,
          subject: 'Navan: Payment Confirmed',
        }
      );

      res.json({ success: true });
    } else {
      res.status(400);
      throw new Error('Payment not succeeded');
    }
  } catch (error) {
    next(error);
  }
};

export { createOrder, verifyPayment, processRefund, getInvoiceData, getAllPayments, createStripeSession, verifyStripePayment, createPaymentIntent, verifyPaymentIntent };
