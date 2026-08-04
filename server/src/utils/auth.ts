import bcrypt from 'bcryptjs';
import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { config } from '../config/config';

// =====================================================
// Password Utilities
// =====================================================

/**
 * Hashes a plain-text password using bcryptjs.
 * @param password Plain-text password string
 * @param saltRounds Number of salt rounds (default: 12)
 */
export const hashPassword = async (
  password: string,
  saltRounds = 12
): Promise<string> => {
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compares a plain-text password against a hashed password.
 * @param password Plain-text password candidate
 * @param hash Stored hashed password
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// =====================================================
// JWT Token Utilities
// =====================================================

/**
 * Generates a short-lived JWT Access Token containing user ID and role.
 * @param userId User's MongoDB ObjectId or string
 * @param role User's role ('customer' | 'admin')
 */
export const generateAccessToken = (
  userId: string | Types.ObjectId,
  role: string
): string => {
  const payload = {
    id: userId.toString(),
    role,
  };

  const options: SignOptions = {
    expiresIn: config.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, config.JWT_SECRET, options);
};

/**
 * Generates a long-lived JWT Refresh Token containing user ID.
 * @param userId User's MongoDB ObjectId or string
 */
export const generateRefreshToken = (
  userId: string | Types.ObjectId
): string => {
  const payload = {
    id: userId.toString(),
  };

  const options: SignOptions = {
    expiresIn: config.REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, config.REFRESH_TOKEN_SECRET, options);
};

/**
 * Verifies and decodes a JWT token using the specified secret key.
 * @param token JWT token string
 * @param secret Secret key to verify token signature against
 * @returns Decoded payload object
 */
export const verifyToken = <T = JwtPayload>(
  token: string,
  secret: string
): T => {
  return jwt.verify(token, secret) as T;
};
