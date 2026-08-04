import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from './errorHandler';

// =====================================================
// Zod Validation Middleware
// =====================================================
export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        next(new ApiError(400, `Validation error: ${messages}`));
      } else {
        next(error);
      }
    }
  };
};
