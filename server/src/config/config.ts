import dotenv from 'dotenv';
dotenv.config();

// =====================================================
// Centralised Environment Configuration
// All env vars are read ONCE here and exported as a
// strongly-typed, readonly object used across the app.
// =====================================================
export const config = {
  // --------------------------------------------------
  // Server
  // --------------------------------------------------
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // --------------------------------------------------
  // Database
  // --------------------------------------------------
  MONGO_URI: process.env.MONGO_URI || '',

  // --------------------------------------------------
  // JWT
  // --------------------------------------------------
  JWT_SECRET: process.env.JWT_SECRET || 'jwt-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-change-in-production',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',

  // --------------------------------------------------
  // CORS / Client
  // --------------------------------------------------
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // --------------------------------------------------
  // Cookie
  // --------------------------------------------------
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'cookie-secret-change-in-production',

  // --------------------------------------------------
  // Razorpay Payment Gateway
  // --------------------------------------------------
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',

  // --------------------------------------------------
  // Cloudinary (Image Uploads)
  // --------------------------------------------------
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
} as const;
