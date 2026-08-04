import { Router } from 'express';
import {
  getAdminSummary,
  getSalesOverTime,
  getTopProducts,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
} from '../controllers/admin.controller';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth.middleware';
import { z } from 'zod';

const router = Router();

// =====================================================
// Zod Validation Schemas
// =====================================================
export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(['customer', 'admin']),
  }),
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

// =====================================================
// All routes are admin-only
// =====================================================
router.use(protect, authorize('admin'));

// =====================================================
// Stats Routes
// =====================================================

// GET /api/admin/stats/summary
router.get('/stats/summary', getAdminSummary);

// GET /api/admin/stats/sales-over-time
router.get('/stats/sales-over-time', getSalesOverTime);

// GET /api/admin/stats/top-products
router.get('/stats/top-products', getTopProducts);

// =====================================================
// User Management Routes
// =====================================================

// GET /api/admin/users
router.get('/users', getAllUsers);

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', validate(updateUserRoleSchema), updateUserRole);

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', validate(updateUserStatusSchema), updateUserStatus);

export default router;
