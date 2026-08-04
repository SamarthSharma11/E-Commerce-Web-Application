import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cart.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// =====================================================
// Cart Routes (All Protected)
// =====================================================

// GET /api/cart — get current user's cart
router.get('/', protect, getCart);

// POST /api/cart — add item to cart
router.post('/', protect, addToCart);

// PUT /api/cart/:productId — update item quantity
router.put('/:productId', protect, updateCartItem);

// DELETE /api/cart/:productId — remove item from cart
router.delete('/:productId', protect, removeFromCart);

// DELETE /api/cart — clear entire cart
router.delete('/', protect, clearCart);

export default router;
