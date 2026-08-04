import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

// =====================================================
// Custom API Error Class
// =====================================================
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// =====================================================
// Global Error Handler Middleware
// =====================================================
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  // Mongoose duplicate key error
  if ((err as NodeJS.ErrnoException).code === '11000') {
    statusCode = 409;
    message = 'Duplicate field value entered';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  // Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
  }

  const response: ApiResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.stack }),
  };

  res.status(statusCode).json(response);
};

// =====================================================
// 404 Not Found Handler
// =====================================================
export const notFound = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  } as ApiResponse);
};
