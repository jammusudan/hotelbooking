import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
    getPromotions,
    getPublicPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    validatePromotion
} from '../controllers/promotionController.js';

const router = express.Router();

// Public route for landing page
router.get('/public', getPublicPromotions);

// Publicly validated but needs login
router.post('/validate', protect, validatePromotion);

// Admin only routes
router.use(protect, authorize('admin'));
router.route('/')
    .get(getPromotions)
    .post(createPromotion);

router.route('/:id')
    .put(updatePromotion)
    .delete(deletePromotion);

export default router;
