import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  getRooms,
  addRoom,
  updateRoom,
  deleteRoom,
} from '../controllers/roomController.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getRooms)
  .post(protect, authorize('manager', 'admin'), addRoom);

router
  .route('/:id')
  .put(protect, authorize('manager', 'admin'), updateRoom)
  .delete(protect, authorize('manager', 'admin'), deleteRoom);

export default router;
