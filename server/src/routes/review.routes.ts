import { Router } from 'express';
import {
  createReview,
  getProductReviews,
  deleteReview,
  createReviewSchema,
  getProductReviewsSchema,
} from '../controllers/review.controller';
import { validate } from '../middleware/validate';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// =====================================================
// Product Review Routes
// =====================================================

// POST /api/products/:productId/reviews — create review (authenticated users only)
router.post(
  '/products/:productId/reviews',
  protect,
  validate(createReviewSchema),
  createReview
);

// GET /api/products/:productId/reviews — get all reviews for a product (public)
router.get(
  '/products/:productId/reviews',
  validate(getProductReviewsSchema),
  getProductReviews
);

// DELETE /api/reviews/:id — delete review (owner or admin only)
router.delete('/:id', protect, deleteReview);

export default router;
