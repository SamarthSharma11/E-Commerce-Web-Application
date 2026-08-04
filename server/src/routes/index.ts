import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import reviewRoutes from './review.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import paymentRoutes from './payment.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Authentication routes — /api/auth
router.use('/auth', authRoutes);

// Category routes — /api/categories
router.use('/categories', categoryRoutes);

// Product routes — /api/products
router.use('/products', productRoutes);

// Review routes — nested under products and standalone
router.use('/products/:productId/reviews', reviewRoutes);
router.use('/reviews', reviewRoutes);

// Cart routes — /api/cart
router.use('/cart', cartRoutes);

// Order routes — /api/orders
router.use('/orders', orderRoutes);

// Payment routes — /api/payments
router.use('/payments', paymentRoutes);

// Admin routes — /api/admin
router.use('/admin', adminRoutes);

export default router;
