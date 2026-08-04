import request from 'supertest';
import { startMemoryDb, stopMemoryDb, clearCollections } from './db';
import { createApp } from '../app';

// =====================================================
// Base Test Helpers
// =====================================================

export const app = request(createApp());

export const setupTests = async (): Promise<void> => {
  await startMemoryDb();
};

export const teardownTests = async (): Promise<void> => {
  await clearCollections();
  await stopMemoryDb();
};

export const getAuthToken = async (email: string, password: string): Promise<string> => {
  const response = await app
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);
  
  return response.body.data.accessToken;
};

export const createTestUser = async (): Promise<{ userId: string; token: string }> => {
  const email = `test-${Date.now()}@example.com`;
  const password = 'Password123';
  
  const response = await app
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email,
      password,
      role: 'customer',
    })
    .expect(201);
  
  return {
    userId: response.body.data.user.id,
    token: response.body.data.accessToken,
  };
};

export const createTestAdmin = async (): Promise<{ userId: string; token: string }> => {
  const email = `admin-${Date.now()}@example.com`;
  const password = 'Password123';
  
  const response = await app
    .post('/api/auth/register')
    .send({
      name: 'Test Admin',
      email,
      password,
      role: 'admin',
    })
    .expect(201);
  
  return {
    userId: response.body.data.user.id,
    token: response.body.data.accessToken,
  };
};

export const createTestCategory = async (token: string): Promise<string> => {
  const response = await app
    .post('/api/categories')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Test Category',
      description: 'Test description',
      isActive: true,
    })
    .expect(201);
  
  return response.body.data._id;
};

export const createTestProduct = async (token: string, categoryId: string): Promise<{ _id: string; slug: string }> => {
  const response = await app
    .post('/api/products')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Test Product',
      description: 'Test product description',
      price: 1000,
      discountPrice: 800,
      category: categoryId,
      stock: 50,
      sku: `SKU-${Date.now()}`,
      brand: 'Test Brand',
      images: ['https://example.com/image.jpg'],
      isActive: true,
    })
    .expect(201);
  
  return {
    _id: response.body.data._id,
    slug: response.body.data.slug,
  };
};

export { clearCollections };
