import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // CORS
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',

  // Cookie
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'cookie-secret-change-in-production',
} as const;
