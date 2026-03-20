import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createNotification } from './notificationController.js';
import { getBookingInitiatedTemplate } from '../utils/emailTemplates.js';

// Initialize Razorpay
// Note: We'll set this up fully later in the payment integration phase.
// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { hotelId, roomId, checkIn, checkOut, guests } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404);
      throw new Error('Room not found');
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Calculate nights
    const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );
    const totalAmount = nights * room.pricePerNight;

    // === Double Booking Prevention Logic ===
    // Find overlapping bookings for this specific room type
    const overlappingBookings = await Booking.find({
      roomId: room._id,
      status: { $in: ['Pending', 'Confirmed'] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        },
      ],
    });

    const totalBooked = overlappingBookings.length;
    
    // Check if availability exists
    if (totalBooked >= room.count) {
      res.status(400);
      throw new Error('Room is not available for selected dates');
    }

    // Create Booking
    const booking = new Booking({
      userId: req.user._id,
      hotelId,
      roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalAmount,
      status: 'Pending', // Expires in 15 mins if not paid
    });

    const createdBooking = await booking.save();

    // Trigger Notification
    const hotel = await Hotel.findById(hotelId);
    
    const emailHtml = getBookingInitiatedTemplate({
      userName: req.user.name,
      hotelName: hotel.name,
      hotelAddress: hotel.address,
      hotelCity: hotel.city,
      roomType: room.type,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalAmount: totalAmount,
      guests: guests,
      nights: nights,
      pricePerNight: room.pricePerNight
    });

    await createNotification(
      req.app,
      req.user._id,
      'booking',
      `Your booking at ${hotel.name} (${room.type}) has been initiated. Proceed to payment to secure your stay.`,
      {
        email: req.user.email,
        subject: 'Navan: Booking Initiated',
        html: emailHtml
      }
    );

    res.status(201).json(createdBooking);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).populate(
      'hotelId',
      'name images city country'
    ).populate('roomId', 'type pricePerNight');
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
        .populate('userId', 'name email')
        .populate('hotelId', 'name address city')
        .populate('roomId', 'type pricePerNight');

    if (booking) {
      // Must be the user who booked it, or the hotel manager, or admin
      res.json(booking);
    } else {
      res.status(404);
      throw new Error('Booking not found');
    }
  } catch (error) {
    next(error);
  }
};

import { applyRefund } from '../services/paymentService.js';

// ... (other imports)

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            res.status(404);
            throw new Error('Booking not found');
        }

        // Only booking user or admin can cancel
        if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to cancel this booking');
        }

        // Handle automated refund if paid
        if (booking.paymentStatus === 'Paid') {
            await applyRefund(booking._id);
        } else {
            booking.status = 'Cancelled';
            booking.expiresAt = null; 
            await booking.save();
        }

        // Emit socket event
        const io = req.app.get('socketio');
        if (io) {
            io.to(booking.hotelId.toString()).emit('availability_changed');
        }

        // Trigger Notification
        await createNotification(
          req.app,
          req.user._id,
          'cancellation',
          `Your booking for ${booking._id} has been cancelled successfully.`,
          {
            email: req.user.email,
            subject: 'Navan: Booking Cancelled',
          }
        );

        res.json({ message: booking.paymentStatus === 'Paid' ? 'Booking cancelled and refund initiated' : 'Booking cancelled' });
    } catch (error) {
        next(error);
    }
};

// @desc    Update booking (dates)
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = async (req, res, next) => {
    try {
        const { checkIn, checkOut, guests } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            res.status(404);
            throw new Error('Booking not found');
        }

        // Only booking owner can update
        if (booking.userId.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this booking');
        }

        if (booking.status !== 'Confirmed' && booking.status !== 'Pending') {
            res.status(400);
            throw new Error('Can only update active bookings');
        }

        const room = await Room.findById(booking.roomId);
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // Check availability for NEW dates (excluding this booking)
        const overlappingBookings = await Booking.find({
            _id: { $ne: booking._id },
            roomId: room._id,
            status: { $in: ['Pending', 'Confirmed'] },
            $or: [
                {
                    checkIn: { $lt: checkOutDate },
                    checkOut: { $gt: checkInDate },
                },
            ],
        });

        if (overlappingBookings.length >= room.count) {
            res.status(400);
            throw new Error('Room is not available for the new selected dates');
        }

        // Recalculate price
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        booking.totalAmount = nights * room.pricePerNight;
        booking.checkIn = checkInDate;
        booking.checkOut = checkOutDate;
        booking.guests = guests || booking.guests;

        const updatedBooking = await booking.save();

        // Emit socket event
        const io = req.app.get('socketio');
        if (io) {
            io.to(booking.hotelId.toString()).emit('availability_changed');
        }

        res.json(updatedBooking);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all bookings for a hotel (for Manager)
// @route   GET /api/bookings/hotel-bookings
// @access  Private/Manager
const getHotelBookings = async (req, res, next) => {
    try {
        const { hotelId } = req.query;
        let query = {};

        if (hotelId) {
            // Verify manager owns this specific hotel
            const hotel = await Hotel.findOne({ _id: hotelId, managerId: req.user._id });
            if (!hotel) {
                res.status(403);
                throw new Error('Not authorized to view bookings for this property');
            }
            query = { hotelId: hotel._id };
        } else {
            // Find all hotels managed by this user
            const hotels = await Hotel.find({ managerId: req.user._id });
            const hotelIds = hotels.map(h => h._id);
            query = { hotelId: { $in: hotelIds } };
        }

        const bookings = await Booking.find(query)
            .populate('userId', 'name email')
            .populate('roomId', 'type pricePerNight')
            .populate('hotelId', 'name')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        next(error);
    }
};

// @desc    Check room availability
// @route   POST /api/bookings/check-availability
// @access  Private
const checkAvailability = async (req, res, next) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;

    if (!roomId || !checkIn || !checkOut) {
      res.status(400);
      throw new Error('Please provide roomId, checkIn, and checkOut dates');
    }

    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404);
      throw new Error('Room not found');
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      res.status(400);
      throw new Error('Check-out date must be after check-in date');
    }

    // Find overlapping bookings for this specific room type
    const overlappingBookings = await Booking.find({
      roomId: room._id,
      status: { $in: ['Pending', 'Confirmed'] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        },
      ],
    });

    const totalBooked = overlappingBookings.length;
    const available = totalBooked < room.count;

    res.json({
      available,
      remainingCount: room.count - totalBooked,
      totalCount: room.count
    });
  } catch (error) {
    next(error);
  }
};

export { createBooking, getMyBookings, getBookingById, cancelBooking, updateBooking, getHotelBookings, checkAvailability };
