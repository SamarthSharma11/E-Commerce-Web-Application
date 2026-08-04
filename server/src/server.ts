import 'express-async-errors';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { config } from './config/config';
import { connectDB, disconnectDB } from './config/db';
import { errorHandler, notFound } from './middleware/errorHandler';
import indexRouter from './routes/index';

// =====================================================
// Initialize Express App
// =====================================================
const app: Application = express();

// =====================================================
// Security Middleware
// =====================================================
app.use(helmet());

// Rate limiting — 100 requests per 15 min
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// =====================================================
// CORS Configuration
// =====================================================
app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// =====================================================
// Body Parsing & Logging
// =====================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.COOKIE_SECRET));

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// =====================================================
// API Routes
// =====================================================
app.use('/api', indexRouter);

// Placeholder routes — to be expanded in subsequent tasks
// app.use('/api/auth',     authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/cart',     cartRoutes);
// app.use('/api/orders',   orderRoutes);
// app.use('/api/admin',    adminRoutes);
// app.use('/api/payments', paymentRoutes);

// =====================================================
// Error Handling
// =====================================================
app.use(notFound);
app.use(errorHandler);

// =====================================================
// Start Server
// =====================================================
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();

    const PORT = config.PORT;
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ========================================');
      console.log(`🛒  E-Commerce API Server`);
      console.log(`📡  Server running on port ${PORT}`);
      console.log(`🌍  Environment: ${config.NODE_ENV}`);
      console.log(`🔗  URL: http://localhost:${PORT}`);
      console.log(`💚  Health: http://localhost:${PORT}/api/health`);
      console.log('🚀 ========================================');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// =====================================================
// Graceful Shutdown
// =====================================================
const shutdown = async (signal: string): Promise<void> => {
  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
  await disconnectDB();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason: Error) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

startServer();

export default app;
