import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export const startMemoryDb = async (): Promise<void> => {
  mongod = await MongoMemoryServer.create({
    binary: {
      version: '7.0.0',
    },
  });
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;

  // Clear require cache so config.ts picks up new MONGO_URI
  delete require.cache[require.resolve('../config/config')];
  delete require.cache[require.resolve('../config/db')];

  // Re-import config and connect
  const { connectDB } = require('../config/db');
  await connectDB();
};

export const stopMemoryDb = async (): Promise<void> => {
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
  await mongoose.disconnect();
};

export const clearCollections = async (): Promise<void> => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};
