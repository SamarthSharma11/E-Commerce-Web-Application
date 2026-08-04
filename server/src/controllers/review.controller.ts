import { Request, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import Review from '../models/Review';
import Product from '../models/Product';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendCreated } from '../utils/helpers';

// =====================================================
// Zod Validation Schemas
// =====================================================
export const createReviewSchema = z.object({
  body: z.object({
    rating: z.coerce.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment cannot exceed 1000 characters'),
  }),
  params: z.object({
    productId: z.string().min(1, 'Product ID is required'),
  }),
});

export const getProductReviewsSchema = z.object({
  params: z.object({
    productId: z.string().min(1, 'Product ID is required'),
  }),
});

// =====================================================
// Controllers
// =====================================================

/**
 * @route   POST /api/products/:productId/reviews
 * @desc    Create a new review for a product
 * @access  Private (Authenticated users only)
 */
export const createReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { productId } = req.params;
  const { rating, comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError(400, 'Invalid product ID format');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, 'Not authorized to access this route');
  }

  const existingReview = await Review.findOne({
    user: userId,
    product: productId,
  });

  if (existingReview) {
    throw new AppError(400, 'You have already reviewed this product');
  }

  const review = await Review.create({
    user: userId,
    product: productId,
    rating: Number(rating),
    comment,
  });

  const populatedReview = await Review.findById(review._id)
    .populate('user', 'name avatar')
    .populate('product', 'name slug');

  sendCreated(res, populatedReview, 'Review created successfully');
};

/**
 * @route   GET /api/products/:productId/reviews
 * @desc    Get all reviews for a product
 * @access  Public
 */
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError(400, 'Invalid product ID format');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  const reviews = await Review.find({ product: productId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

  sendSuccess(res, reviews, 'Product reviews fetched successfully');
};

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review by ID (owner or admin only)
 * @access  Private
 */
export const deleteReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid review ID format');
  }

  const review = await Review.findById(id);
  if (!review) {
    throw new AppError(404, 'Review not found');
  }

  const currentUserId = req.user?.id;
  const currentUserRole = req.user?.role;

  if (currentUserId !== review.user.toString() && currentUserRole !== 'admin') {
    throw new AppError(403, 'You are not authorized to delete this review');
  }

  await review.deleteOne();

  sendSuccess(res, null, 'Review deleted successfully');
};
