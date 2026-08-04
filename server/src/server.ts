import path from 'path';
import 'express-async-errors';
import { config } from './config/config';
import { connectDB, disconnectDB } from './config/db';
import { createApp } from './app';

// =====================================================
// Start Server
// =====================================================
const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const app = createApp();
    const PORT = config.PORT;
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ========================================');
      console.log(`🛒  E-Commerce API Server`);
      console.log(`📡  Server running on port ${PORT}`);
      console.log(`🌍  Environment: ${config.NODE_ENV}`);
      console.log(`🔗  URL: http://localhost:${PORT}`);
      console.log(`💚  Health: http://localhost:${PORT}/api/health`);
      console.log(`📄  API Docs: http://localhost:${PORT}/api/docs`);
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
