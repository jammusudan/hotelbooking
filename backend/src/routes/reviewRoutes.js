import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  addReview,
  getHotelReviews,
  addManagerResponse,
  getAllReviews,
  deleteReview,
} from '../controllers/reviewController.js';

const router = express.Router();

router.route('/hotel/:hotelId')
  .post(protect, addReview)
  .get(getHotelReviews);

router.route('/:id/response')
  .put(protect, authorize('manager', 'admin'), addManagerResponse)
  .delete(protect, authorize('admin'), deleteReview);

router.get('/all', protect, authorize('admin'), getAllReviews);

export default router;
