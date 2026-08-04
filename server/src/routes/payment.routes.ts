import { Router } from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
} from '../controllers/payment.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// =====================================================
// Payment Routes
// =====================================================

// POST /api/payments/create-order — create Razorpay order (protected)
router.post('/create-order', protect, createRazorpayOrder);

// POST /api/payments/verify — verify payment signature (protected)
router.post('/verify', protect, verifyRazorpayPayment);

// POST /api/payments/webhook — Razorpay webhook (public, signature verified)
router.post('/webhook', handleRazorpayWebhook);

export default router;
