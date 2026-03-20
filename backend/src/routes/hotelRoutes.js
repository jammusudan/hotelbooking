import express from 'express';
import { protect, authorize, extractUser } from '../middlewares/authMiddleware.js';
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  getMyHotels,
  getSuggestions,
} from '../controllers/hotelController.js';
import roomRoutes from './roomRoutes.js';

const router = express.Router();

// Re-route into room router
router.use('/:hotelId/rooms', roomRoutes);

router.get('/myhotels', protect, authorize('manager'), getMyHotels);
router.get('/suggestions', getSuggestions);

router.route('/')
  .get(extractUser, getHotels)
  .post(protect, authorize('manager', 'admin'), createHotel);
  
router.route('/:id')
  .get(extractUser, getHotelById)
  .put(protect, authorize('manager', 'admin'), updateHotel)
  .delete(protect, authorize('admin'), deleteHotel);

export default router;
