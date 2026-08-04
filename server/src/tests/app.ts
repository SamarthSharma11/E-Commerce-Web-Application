import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { createApp } from '../app';

// =====================================================
// Test App Factory
// =====================================================

let app: ReturnType<typeof createApp> | null = null;

export const getApp = async (): Promise<ReturnType<typeof createApp>> => {
  if (app === null) {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    app = createApp();
  }
  return app;
};

export const cleanupApp = async (): Promise<void> => {
  if (app) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};
