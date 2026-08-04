import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductSchema,
  updateProductSchema,
} from '../controllers/product.controller';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth.middleware';
import { uploadProductImages } from '../middleware/upload';

const router = Router();

// =====================================================
// Public Product Routes
// =====================================================

// GET /api/products — list all products (with page, limit, category, minPrice, maxPrice, search, sort)
router.get('/', getProducts);

// GET /api/products/:slug — get single product details by URL slug
router.get('/:slug', getProductBySlug);

// =====================================================
// Protected Admin Product Routes
// =====================================================

// POST /api/products — create product with image uploads (Admin only)
router.post(
  '/',
  protect,
  authorize('admin'),
  uploadProductImages,
  validate(createProductSchema),
  createProduct
);

// PUT /api/products/:id — update product with optional image replacement (Admin only)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  uploadProductImages,
  validate(updateProductSchema),
  updateProduct
);

// DELETE /api/products/:id — delete product by ID (Admin only)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteProduct
);

export default router;
