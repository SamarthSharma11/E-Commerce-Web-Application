import mongoose from 'mongoose';
import { config } from './config';

// =====================================================
// MongoDB Connection
// =====================================================
export const connectDB = async (): Promise<void> => {
  const uri = config.MONGO_URI;

  if (!uri) {
    console.error('❌ MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      // Recommended options for stable connections
      serverSelectionTimeoutMS: 5000,  // Fail fast if server unreachable
      socketTimeoutMS: 45000,          // Close sockets after 45s inactivity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} (db: ${conn.connection.name})`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ MongoDB connection failed: ${message}`);
    process.exit(1);
  }
};

// =====================================================
// Connection Event Listeners
// =====================================================
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose: connection established');
});

mongoose.connection.on('disconnected', () => {
  console.warn('🟡 Mongoose: connection lost — attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 Mongoose: reconnected to MongoDB');
});

mongoose.connection.on('error', (err: Error) => {
  console.error(`🔴 Mongoose connection error: ${err.message}`);
});

// =====================================================
// Graceful Disconnect (used in SIGTERM/SIGINT handlers)
// =====================================================
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed gracefully.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error closing MongoDB connection: ${message}`);
  }
};
