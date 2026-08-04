import { setupTests, teardownTests, app, clearCollections, createTestUser, createTestAdmin, createTestCategory, createTestProduct } from './helpers';

// =====================================================
// Cart Integration Tests
// =====================================================

describe('Cart', () => {
  beforeAll(async () => {
    await setupTests();
  });

  afterAll(async () => {
    await teardownTests();
  });

  afterEach(async () => {
    await clearCollections();
  });

  describe('GET /api/cart', () => {
    it('should return empty cart for new user', async () => {
      const { token } = await createTestUser();

      const response = await app
        .get('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.items).toEqual([]);
      expect(response.body.data.itemsCount).toBe(0);
    });
  });

  describe('POST /api/cart', () => {
    it('should add item to cart', async () => {
      const user = await createTestUser();
      const admin = await createTestAdmin();
      const categoryId = await createTestCategory(admin.token);
      const { _id: productId } = await createTestProduct(admin.token, categoryId);

      const response = await app
        .post('/api/cart')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          productId,
          quantity: 2,
        })
        .expect(201);

      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.items[0].quantity).toBe(2);
      expect(response.body.data.itemsCount).toBe(2);
    });

    it('should merge quantity if item already in cart', async () => {
      const user = await createTestUser();
      const admin = await createTestAdmin();
      const categoryId = await createTestCategory(admin.token);
      const { _id: productId } = await createTestProduct(admin.token, categoryId);

      await app
        .post('/api/cart')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ productId, quantity: 1 })
        .expect(201);

      const response = await app
        .post('/api/cart')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ productId, quantity: 2 })
        .expect(201);

      expect(response.body.data.items[0].quantity).toBe(3);
    });

    it('should reject adding more than available stock', async () => {
      const user = await createTestUser();
      const admin = await createTestAdmin();
      const categoryId = await createTestCategory(admin.token);
      const { _id: productId } = await createTestProduct(admin.token, categoryId);

      await app
        .post('/api/cart')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ productId, quantity: 1000 })
        .expect(400);
    });
  });

  describe('PUT /api/cart/:productId', () => {
    it('should update cart item quantity', async () => {
      const user = await createTestUser();
      const admin = await createTestAdmin();
      const categoryId = await createTestCategory(admin.token);
      const { _id: productId } = await createTestProduct(admin.token, categoryId);

      await app
        .post('/api/cart')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ productId, quantity: 1 })
        .expect(201);

      const response = await app
        .put(`/api/cart/${productId}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ quantity: 5 })
        .expect(200);

      expect(response.body.data.items[0].quantity).toBe(5);
    });
  });

  describe('DELETE /api/cart/:productId', () => {
    it('should remove item from cart', async () => {
      const user = await createTestUser();
      const admin = await createTestAdmin();
      const categoryId = await createTestCategory(admin.token);
      const { _id: productId } = await createTestProduct(admin.token, categoryId);

      await app
        .post('/api/cart')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ productId, quantity: 1 })
        .expect(201);

      const response = await app
        .delete(`/api/cart/${productId}`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(response.body.data.items.length).toBe(0);
    });
  });

  describe('DELETE /api/cart', () => {
    it('should clear entire cart', async () => {
      const user = await createTestUser();
      const admin = await createTestAdmin();
      const categoryId = await createTestCategory(admin.token);
      const { _id: productId } = await createTestProduct(admin.token, categoryId);

      await app
        .post('/api/cart')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ productId, quantity: 2 })
        .expect(201);

      const response = await app
        .delete('/api/cart')
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(response.body.data.items.length).toBe(0);
      expect(response.body.data.itemsCount).toBe(0);
    });
  });
});
