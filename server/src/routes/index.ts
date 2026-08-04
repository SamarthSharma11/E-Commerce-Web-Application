import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Authentication routes — /api/auth
router.use('/auth', authRoutes);

export default router;
