import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} from '../controllers/order.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

// =====================================================
// Zod Validation Schemas
// =====================================================
export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.object({
      fullName: z.string().min(1, 'Full name is required'),
      line1: z.string().min(1, 'Address line 1 is required'),
      line2: z.string().optional(),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      pincode: z.string().min(1, 'Pincode is required'),
      country: z.string().optional(),
      phone: z.string().min(1, 'Phone number is required'),
    }),
    paymentMethod: z.enum(['razorpay', 'cod', 'wallet']),
    paymentInfo: z.object({
      status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
      transactionId: z.string().optional(),
    }).optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    orderStatus: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    cancelReason: z.string().max(500).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Order ID is required'),
  }),
});

// =====================================================
// Order Routes
// =====================================================

// POST /api/orders — create order from cart (protected)
router.post('/', protect, validate(createOrderSchema), createOrder);

// GET /api/orders/my-orders — current user's order history (protected)
router.get('/my-orders', protect, getMyOrders);

// GET /api/orders/:id — order detail (owner or admin)
router.get('/:id', protect, getOrderById);

// PUT /api/orders/:id/status — update order status (admin only)
router.put(
  '/:id/status',
  protect,
  authorize('admin'),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

// GET /api/orders — all orders with filters (admin only)
router.get('/', protect, authorize('admin'), getAllOrders);

export default router;
