import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  forgotPassword,
  resetPassword,
  updateAddresses,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateAddressesSchema,
} from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

// =====================================================
// Public Auth Routes
// =====================================================

// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// POST /api/auth/logout
router.post('/logout', logout);

// POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// =====================================================
// Protected Auth Routes
// =====================================================

// GET /api/auth/me — requires valid access token
router.get('/me', authenticate, getMe);

// PUT /api/auth/me/addresses — update saved addresses
router.put('/me/addresses', authenticate, validate(updateAddressesSchema), updateAddresses);

export default router;
