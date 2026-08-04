import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// =====================================================
// Global Test Setup — In-Memory MongoDB
// =====================================================

let mongod: MongoMemoryServer | null = null;

export const startMemoryDb = async (): Promise<string> => {
  mongod = await MongoMemoryServer.create({
    binary: {
      version: '7.0.0',
    },
  });
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  return uri;
};

export const stopMemoryDb = async (): Promise<void> => {
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
  await mongoose.disconnect();
};

// =====================================================
// Jest Global Hooks
// =====================================================

export default async (): Promise<void> => {
  await startMemoryDb();
};

export const globalTeardown = async (): Promise<void> => {
  await stopMemoryDb();
};
