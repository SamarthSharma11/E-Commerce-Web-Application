import { setupTests, teardownTests, app, clearCollections, createTestUser, createTestAdmin, createTestCategory, createTestProduct } from './helpers';

// =====================================================
// Orders Integration Tests
// =====================================================

describe('Orders', () => {
  beforeAll(async () => {
    await setupTests();
  });

  afterAll(async () => {
    await teardownTests();
  });

  afterEach(async () => {
    await clearCollections();
  });

  describe('POST /api/orders', () => {
    it('should create order from cart', async () => {
      const user = await createTestUser();
      const admin = await createTestAdmin();
      const categoryId = await createTestCategory(admin.token);
      const { _id: productId } = await createTestProduct(admin.token, categoryId);

      // Add item to cart
      await app
        .post('/api/cart')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ productId, quantity: 2 })
        .expect(201);

      // Create order
      const response = await app
        .post('/api/orders')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          shippingAddress: {
            fullName: 'Test User',
            line1: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            country: 'India',
            phone: '+919876543210',
          },
          paymentMethod: 'cod',
          paymentInfo: {
            status: 'pending',
          },
        })
        .expect(201);

      expect(response.body.data.orderStatus).toBe('pending');
      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.items[0].quantity).toBe(2);
      expect(response.body.data.totalPrice).toBeGreaterThan(0);
    }, 15000);

    it('should fail with empty cart', async () => {
      const { token } = await createTestUser();

      await app
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          shippingAddress: {
            fullName: 'Test User',
            line1: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            country: 'India',
            phone: '+919876543210',
          },
          paymentMethod: 'cod',
        })
        .expect(400);
    });

    it('should fail with invalid payment method', async () => {
      const user = await createTestUser();
      const admin = await createTestAdmin();
      const categoryId = await createTestCategory(admin.token);
      const { _id: productId } = await createTestProduct(admin.token, categoryId);

      await app
        .post('/api/cart')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ productId, quantity: 1 })
        .expect(201);

      await app
        .post('/api/orders')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          shippingAddress: {
            fullName: 'Test User',
            line1: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            country: 'India',
            phone: '+919876543210',
          },
          paymentMethod: 'invalid',
        })
        .expect(400);
    });

    it('should decrement stock after order', async () => {
      const user = await createTestUser();
      const admin = await createTestAdmin();
      const categoryId = await createTestCategory(admin.token);
      const { _id: productId, slug } = await createTestProduct(admin.token, categoryId);

      // Get initial stock
      const productResponse = await app
        .get(`/api/products/${slug}`)
        .expect(200);
      
      const initialStock = productResponse.body.data.stock;

      // Add to cart and create order
      await app
        .post('/api/cart')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ productId, quantity: 2 })
        .expect(201);

      await app
        .post('/api/orders')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          shippingAddress: {
            fullName: 'Test User',
            line1: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            country: 'India',
            phone: '+919876543210',
          },
          paymentMethod: 'cod',
        })
        .expect(201);

      // Verify stock decreased
      const updatedProduct = await app
        .get(`/api/products/${slug}`)
        .expect(200);

      expect(updatedProduct.body.data.stock).toBe(initialStock - 2);
    });

    it('should clear cart after order', async () => {
      const user = await createTestUser();
      const admin = await createTestAdmin();
      const categoryId = await createTestCategory(admin.token);
      const { _id: productId } = await createTestProduct(admin.token, categoryId);

      await app
        .post('/api/cart')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ productId, quantity: 1 })
        .expect(201);

      await app
        .post('/api/orders')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          shippingAddress: {
            fullName: 'Test User',
            line1: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            country: 'India',
            phone: '+919876543210',
          },
          paymentMethod: 'cod',
        })
        .expect(201);

      const cartResponse = await app
        .get('/api/cart')
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(cartResponse.body.data.items).toEqual([]);
    });
  });

  describe('GET /api/orders/my-orders', () => {
    it('should return empty list for new user', async () => {
      const { token } = await createTestUser();

      const response = await app
        .get('/api/orders/my-orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return order details for owner', async () => {
      const user = await createTestUser();
      const admin = await createTestAdmin();
      const categoryId = await createTestCategory(admin.token);
      const { _id: productId } = await createTestProduct(admin.token, categoryId);

      await app
        .post('/api/cart')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ productId, quantity: 1 })
        .expect(201);

      const orderResponse = await app
        .post('/api/orders')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          shippingAddress: {
            fullName: 'Test User',
            line1: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            country: 'India',
            phone: '+919876543210',
          },
          paymentMethod: 'cod',
        })
        .expect(201);

      const orderId = orderResponse.body.data._id;

      const response = await app
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(response.body.data._id).toBe(orderId);
    });
  });
});
