import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  createOrder,
  verifyPayment,
  processRefund,
  getInvoiceData,
  getAllPayments,
  createStripeSession,
  verifyStripePayment,
  createPaymentIntent,
  verifyPaymentIntent
} from '../controllers/paymentController.js';
import { authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/create-stripe-session', protect, createStripeSession);
router.post('/verify-stripe', protect, verifyStripePayment);
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/verify-payment-intent', protect, verifyPaymentIntent);
router.post('/refund/:id', protect, processRefund);
router.get('/invoice/:id', protect, getInvoiceData);
router.get('/all', protect, authorize('admin'), getAllPayments);

export default router;
