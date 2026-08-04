import { Request, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import User from '../models/User';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from '../utils/auth';
import { config } from '../config/config';
import { ApiError } from '../middleware/errorHandler';
import { sendSuccess, sendCreated } from '../utils/helpers';
import { AuthenticatedRequest } from '../types';

// =====================================================
// Zod Validation Schemas
// =====================================================
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['customer', 'admin']).optional().default('customer'),
    phone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const updateAddressesSchema = z.object({
  body: z.object({
    addresses: z.array(
      z.object({
        label: z.string().min(1, 'Label is required'),
        line1: z.string().min(1, 'Address line 1 is required'),
        line2: z.string().optional(),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        pincode: z.string().min(1, 'Pincode is required'),
        country: z.string().optional(),
        isDefault: z.boolean().optional(),
      })
    ),
  }),
});

// =====================================================
// Helper: Set Refresh Token Cookie
// =====================================================
const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// =====================================================
// Controllers
// =====================================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user, return access token & set refresh cookie
 * @access  Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role, phone } = req.body;

  // Check if user with given email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists');
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'customer',
    phone,
  });

  // Generate JWT tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Set httpOnly cookie for refresh token
  setRefreshTokenCookie(res, refreshToken);

  sendCreated(
    res,
    {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
      accessToken,
    },
    'User registered successfully'
  );
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return access token + set refresh cookie
 * @access  Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Find user and explicitly select password
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    '+password'
  );

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Please contact support.');
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Set httpOnly refresh cookie
  setRefreshTokenCookie(res, refreshToken);

  sendSuccess(
    res,
    {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
      accessToken,
    },
    'Logged in successfully'
  );
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user by clearing refresh token cookie
 * @access  Public / User
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  sendSuccess(res, null, 'Logged out successfully');
};

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Get new access token using valid refresh token cookie or body
 * @access  Public
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    throw new ApiError(401, 'Refresh token required');
  }

  try {
    const decoded = verifyToken<{ id: string }>(
      token,
      config.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const newAccessToken = generateAccessToken(user._id, user.role);

    sendSuccess(
      res,
      { accessToken: newAccessToken },
      'Access token refreshed successfully'
    );
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user's profile
 * @access  Private
 */
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Not authenticated');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ApiError(404, 'User profile not found');
  }

  sendSuccess(
    res,
    {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
    'User profile fetched successfully'
  );
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate password reset token & stub email send
 * @access  Public
 */
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (user) {
    // Generate random 32-byte hex token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token before storing in database
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 mins
    await user.save({ validateBeforeSave: false });

    console.log('');
    console.log('📧 ========================================');
    console.log(`🔑  [STUB EMAIL] Password Reset Request`);
    console.log(`👤  To: ${user.email}`);
    console.log(`🔗  Reset Token: ${resetToken}`);
    console.log(`⏰  Expires in: 10 minutes`);
    console.log('📧 ========================================');
    console.log('');
  }

  // Always return success response to prevent email enumeration
  sendSuccess(
    res,
    null,
    'If an account with that email exists, password reset instructions have been sent.'
  );
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset user password using reset token
 * @access  Public
 */
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token, newPassword } = req.body;

  // Hash candidate token to compare with DB
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(400, 'Password reset token is invalid or has expired');
  }

  // Update password (pre-save hook will hash it)
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  sendSuccess(
    res,
    null,
    'Password reset successful. You can now login with your new password.'
  );
};

/**
 * @route   PUT /api/auth/me/addresses
 * @desc    Update current user's saved addresses
 * @access  Private
 */
export const updateAddresses = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Not authenticated');
  }

  const { addresses } = req.body;

  if (!Array.isArray(addresses)) {
    throw new ApiError(400, 'Addresses must be an array');
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.addresses = addresses;
  await user.save();

  sendSuccess(
    res,
    { addresses: user.addresses },
    'Addresses updated successfully'
  );
};
