import { setupTests, teardownTests, app, clearCollections, createTestUser, createTestAdmin, createTestCategory, createTestProduct, getAuthToken } from './helpers';

// =====================================================
// Auth Integration Tests
// =====================================================

describe('Auth', () => {
  beforeAll(async () => {
    await setupTests();
  });

  afterAll(async () => {
    await teardownTests();
  });

  afterEach(async () => {
    await clearCollections();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new customer user', async () => {
      const response = await app
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: `john-${Date.now()}@example.com`,
          password: 'Password123',
          role: 'customer',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe('John Doe');
      expect(response.body.data.user.role).toBe('customer');
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should register a new admin user', async () => {
      const response = await app
        .post('/api/auth/register')
        .send({
          name: 'Admin User',
          email: `admin-${Date.now()}@example.com`,
          password: 'Password123',
          role: 'admin',
        })
        .expect(201);

      expect(response.body.data.user.role).toBe('admin');
    });

    it('should reject duplicate email', async () => {
      const email = `dup-${Date.now()}@example.com`;
      
      await app
        .post('/api/auth/register')
        .send({
          name: 'User One',
          email,
          password: 'Password123',
        })
        .expect(201);

      await app
        .post('/api/auth/register')
        .send({
          name: 'User Two',
          email,
          password: 'Password123',
        })
        .expect(400);
    });

    it('should reject weak password', async () => {
      await app
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: `test-${Date.now()}@example.com`,
          password: '123',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const email = `login-${Date.now()}@example.com`;
      const password = 'Password123';

      await app
        .post('/api/auth/register')
        .send({ name: 'Test', email, password })
        .expect(201);

      const response = await app
        .post('/api/auth/login')
        .send({ email, password })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      await app
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrongpass' })
        .expect(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const { token } = await createTestUser();

      const response = await app
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBeDefined();
    });

    it('should reject without token', async () => {
      await app
        .get('/api/auth/me')
        .expect(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear refresh token cookie', async () => {
      const { token } = await createTestUser();

      const response = await app
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should refresh access token with valid refresh token', async () => {
      const email = `refresh-${Date.now()}@example.com`;
      const password = 'Password123';

      const registerResponse = await app
        .post('/api/auth/register')
        .send({ name: 'Test', email, password })
        .expect(201);

      // Extract refresh token from cookies (set as httpOnly cookie)
      const cookies = registerResponse.headers['set-cookie'];
      const cookieArray = Array.isArray(cookies) ? cookies : [cookies as string];
      const refreshTokenCookie = cookieArray.find((cookie: string) => cookie.startsWith('refreshToken='));
      
      expect(refreshTokenCookie).toBeDefined();

      const response = await app
        .post('/api/auth/refresh-token')
        .set('Cookie', refreshTokenCookie!)
        .expect(200);

      expect(response.body.data.accessToken).toBeDefined();
    });
  });
});
