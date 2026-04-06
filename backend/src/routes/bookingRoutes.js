import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getHotelBookings,
  updateBooking,
  checkAvailability
} from '../controllers/bookingController.js';

const router = express.Router();

router.route('/check-availability')
  .post(checkAvailability);

router.route('/')
  .post(protect, createBooking);

router.route('/hotel-bookings')
  .get(protect, authorize('manager', 'admin'), getHotelBookings);

router.route('/mybookings')
  .get(protect, getMyBookings);

router.route('/:id')
  .get(protect, getBookingById)
  .put(protect, updateBooking);

router.route('/:id/cancel')
  .put(protect, cancelBooking);

export default router;
