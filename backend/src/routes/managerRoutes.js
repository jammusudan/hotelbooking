import express from 'express';
import {
  getDashboardStats,
  getManagerHotels,
  getManagerRooms,
  getManagerBookings,
  getManagerReviews,
  replyToReview,
  createHotel,
  updateHotel,
  deleteHotel,
  addRoom,
  updateRoom,
  deleteRoom,
  updateBookingStatus,
} from '../controllers/managerController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('manager'));

router.get('/dashboard-stats', getDashboardStats);

router.get('/hotels', getManagerHotels);
router.post('/hotels', createHotel);
router.put('/hotels/:id', updateHotel);
router.delete('/hotels/:id', deleteHotel);

router.get('/rooms', getManagerRooms);
router.post('/rooms', addRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

router.get('/bookings', getManagerBookings);
router.put('/bookings/:id/status', updateBookingStatus);
router.get('/reviews', getManagerReviews);
router.post('/reviews/reply', replyToReview);

export default router;
