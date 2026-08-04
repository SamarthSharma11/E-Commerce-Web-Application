import { setupTests, teardownTests, app, clearCollections, createTestAdmin, createTestCategory, createTestProduct, getAuthToken } from './helpers';

// =====================================================
// Products Integration Tests
// =====================================================

describe('Products', () => {
  beforeAll(async () => {
    await setupTests();
  });

  afterAll(async () => {
    await teardownTests();
  });

  afterEach(async () => {
    await clearCollections();
  });

  describe('GET /api/products', () => {
    it('should return empty list when no products', async () => {
      const response = await app
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return products with pagination metadata', async () => {
      const admin = await createTestAdmin();
      const categoryId = await createTestCategory(admin.token);
      
      await createTestProduct(admin.token, categoryId);
      await createTestProduct(admin.token, categoryId);

      const response = await app
        .get('/api/products?page=1&limit=10')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalCount).toBeGreaterThanOrEqual(2);
    });

    it('should filter products by category', async () => {
      const admin = await createTestAdmin();
      const categoryId = await createTestCategory(admin.token);
      await createTestProduct(admin.token, categoryId);

      const response = await app
        .get(`/api/products?category=${categoryId}`)
        .expect(200);

      expect(response.body.data.every((p: any) => {
        const cat = typeof p.category === 'object' ? p.category._id : p.category;
        return cat === categoryId;
      })).toBe(true);
    });

    it('should search products by name', async () => {
      const admin = await createTestAdmin();
      const categoryId = await createTestCategory(admin.token);
      await createTestProduct(admin.token, categoryId);

      const response = await app
        .get('/api/products?search=Test')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product as admin', async () => {
      const admin = await createTestAdmin();
      const categoryId = await createTestCategory(admin.token);

      const response = await app
        .post('/api/products')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          name: 'New Product',
          description: 'Product description here',
          price: 1500,
          discountPrice: 1200,
          category: categoryId,
          stock: 30,
          sku: `SKU-${Date.now()}`,
          brand: 'BrandX',
          images: ['https://example.com/img.jpg'],
          isActive: true,
        })
        .expect(201);

      expect(response.body.data.name).toBe('New Product');
      expect(response.body.data.price).toBe(1500);
    });

    it('should reject creation without auth', async () => {
      await app
        .post('/api/products')
        .send({ name: 'Test' })
        .expect(401);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product as admin', async () => {
      const admin = await createTestAdmin();
      const categoryId = await createTestCategory(admin.token);
      const { _id: productId } = await createTestProduct(admin.token, categoryId);

      const response = await app
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          name: 'Updated Product',
          price: 2000,
        })
        .expect(200);

      expect(response.body.data.name).toBe('Updated Product');
      expect(response.body.data.price).toBe(2000);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product as admin', async () => {
      const admin = await createTestAdmin();
      const categoryId = await createTestCategory(admin.token);
      const { _id: productId } = await createTestProduct(admin.token, categoryId);

      await app
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      const response = await app
        .get(`/api/products?search=Updated Product`)
        .expect(200);

      expect(response.body.data.find((p: any) => p._id === productId)).toBeUndefined();
    });
  });
});
