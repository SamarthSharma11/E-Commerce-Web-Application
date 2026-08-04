import { Request, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order';
import { config } from '../config/config';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendCreated } from '../utils/helpers';

// =====================================================
// Razorpay Client Instance (lazy to avoid crashing on import when env vars are missing)
// =====================================================
const getRazorpay = (): Razorpay => {
  if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
    throw new AppError(500, 'Razorpay credentials are not configured');
  }
  return new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET,
  });
};

// =====================================================
// Payment Controller
// =====================================================

/**
 * @route   POST /api/payments/create-order
 * @desc    Create a Razorpay order for a given amount
 * @access  Private
 */
export const createRazorpayOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { amount, currency = 'INR', receipt, notes } = req.body;

  if (!amount || amount <= 0) {
    throw new AppError(400, 'Valid amount is required');
  }

  try {
    const razorpay = getRazorpay();
    const orderCreatePayload = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1,
      ...(notes && { notes }),
    } as Parameters<typeof razorpay.orders.create>[0];

    const razorpayOrder = await razorpay.orders.create(orderCreatePayload);

    sendCreated(
      res,
      {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: config.RAZORPAY_KEY_ID,
        receipt: razorpayOrder.receipt,
      },
      'Razorpay order created successfully'
    );
  } catch (error: unknown) {
    console.error('Razorpay order creation failed:', error);
    throw new AppError(500, 'Failed to create payment order');
  }
};

/**
 * @route   POST /api/payments/verify
 * @desc    Verify Razorpay payment signature
 * @access  Private
 */
export const verifyRazorpayPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError(400, 'Missing payment verification parameters');
  }

  // Verify signature
  const generatedSignature = crypto
    .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    throw new AppError(400, 'Invalid payment signature');
  }

  // Update order payment status
  if (orderId) {
    const order = await Order.findById(orderId);
    if (order) {
      order.paymentInfo = {
        ...order.paymentInfo,
        method: 'razorpay',
        status: 'paid',
        transactionId: razorpay_payment_id,
        paidAt: new Date(),
      };
      await order.save();
    }
  }

  sendSuccess(
    res,
    {
      razorpay_order_id,
      razorpay_payment_id,
      status: 'paid',
    },
    'Payment verified successfully'
  );
};

/**
 * @route   POST /api/payments/webhook
 * @desc    Razorpay webhook endpoint for async payment events
 * @access  Public (verified via webhook signature)
 */
export const handleRazorpayWebhook = async (req: Request, res: Response): Promise<void> => {
  const webhookSignature = req.headers['x-razorpay-signature'] as string;
  const webhookSecret = config.RAZORPAY_KEY_SECRET;

  if (!webhookSignature) {
    throw new AppError(400, 'Missing webhook signature');
  }

  // Verify webhook signature
  const payload = JSON.stringify(req.body);
  const generatedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  if (generatedSignature !== webhookSignature) {
    throw new AppError(400, 'Invalid webhook signature');
  }

  const event = req.body;

  try {
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event);
        break;
      case 'order.paid':
        await handleOrderPaid(event);
        break;
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error: unknown) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};

// =====================================================
// Webhook Helpers
// =====================================================

async function handlePaymentCaptured(event: Record<string, unknown>): Promise<void> {
  const payment = event.payload as Record<string, unknown>;
  const paymentEntity = payment.payment as Record<string, unknown>;
  const _orderId = paymentEntity.order_id as string;
  const paymentId = paymentEntity.id as string;

  // Find order by razorpay order ID (stored in notes or receipt)
  // Since we use receipt as `receipt_${timestamp}`, we search by payment reference
  const order = await Order.findOne({
    'paymentInfo.transactionId': paymentId,
  });

  if (order && order.paymentInfo.status !== 'paid') {
    order.paymentInfo = {
      ...order.paymentInfo,
      status: 'paid',
      transactionId: paymentId,
      paidAt: new Date(),
    };
    await order.save();
    console.log(`Payment captured for order: ${order._id}`);
  }
}

async function handlePaymentFailed(event: Record<string, unknown>): Promise<void> {
  const payment = event.payload as Record<string, unknown>;
  const paymentEntity = payment.payment as Record<string, unknown>;
  const paymentId = paymentEntity.id as string;

  const order = await Order.findOne({
    'paymentInfo.transactionId': paymentId,
  });

  if (order) {
    order.paymentInfo = {
      ...order.paymentInfo,
      status: 'failed',
    };
    await order.save();
    console.log(`Payment failed for order: ${order._id}`);
  }
}

async function handleOrderPaid(event: Record<string, unknown>): Promise<void> {
  const payment = event.payload as Record<string, unknown>;
  const paymentEntity = payment.payment as Record<string, unknown>;
  const _orderId = paymentEntity.order_id as string;
  const paymentId = paymentEntity.id as string;

  // Find order by razorpay order ID
  // In a real app, you'd store the Razorpay order ID in the order
  const order = await Order.findOne({
    'paymentInfo.transactionId': paymentId,
  });

  if (order && order.paymentInfo.status !== 'paid') {
    order.paymentInfo = {
      ...order.paymentInfo,
      status: 'paid',
      transactionId: paymentId,
      paidAt: new Date(),
    };
    await order.save();
    console.log(`Order paid via webhook: ${order._id}`);
  }
}
