import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  createCategorySchema,
  updateCategorySchema,
} from '../controllers/category.controller';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

// =====================================================
// Public Category Routes
// =====================================================

// GET /api/categories — list all categories (with optional parentCategory query filter)
router.get('/', getCategories);

// GET /api/categories/:slug — get single category details by URL slug
router.get('/:slug', getCategoryBySlug);

// =====================================================
// Protected Admin Category Routes
// =====================================================

// POST /api/categories — create new category (Admin only)
router.post(
  '/',
  protect,
  authorize('admin'),
  validate(createCategorySchema),
  createCategory
);

// PUT /api/categories/:id — update existing category (Admin only)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  validate(updateCategorySchema),
  updateCategory
);

// DELETE /api/categories/:id — delete category by ID (Admin only)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteCategory
);

export default router;
