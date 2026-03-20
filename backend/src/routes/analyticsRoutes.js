import express from 'express';
import { getManagerAnalytics } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/manager', protect, authorize('manager', 'admin'), getManagerAnalytics);

export default router;
