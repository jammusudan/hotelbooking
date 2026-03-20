import express from 'express';
import { getNotifications, markAsRead, broadcastPromotion } from '../controllers/notificationController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.post('/broadcast', protect, admin, broadcastPromotion);

export default router;
