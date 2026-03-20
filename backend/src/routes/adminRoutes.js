import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  getUsers,
  getPendingHotels,
  approveHotel,
  getAllHotels,
  getAllBookings,
  deleteHotel,
  getAnalytics,
  searchTelemetry,
} from '../controllers/adminController.js';

const router = express.Router();

// Apply middleware to all routes in this router
router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.get('/hotels', getAllHotels);
router.get('/hotels/pending', getPendingHotels);
router.put('/hotels/:id/approve', approveHotel);
router.delete('/hotels/:id', deleteHotel);
router.get('/bookings', getAllBookings);
router.get('/analytics', getAnalytics);
router.get('/search', searchTelemetry);

export default router;
