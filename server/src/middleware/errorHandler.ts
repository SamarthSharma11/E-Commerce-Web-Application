import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

// =====================================================
// Custom AppError Class for Consistent Error Responses
// Supports both AppError(404, 'Message') and AppError('Message', 404)
// =====================================================
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(
    statusCodeOrMessage: number | string,
    messageOrStatusCode?: string | number,
    isOperational = true
  ) {
    let statusCode: number;
    let message: string;

    if (typeof statusCodeOrMessage === 'number') {
      statusCode = statusCodeOrMessage;
      message = typeof messageOrStatusCode === 'string' ? messageOrStatusCode : 'An error occurred';
    } else {
      message = statusCodeOrMessage;
      statusCode = typeof messageOrStatusCode === 'number' ? messageOrStatusCode : 500;
    }

    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Alias ApiError for backward compatibility across modules
export const ApiError = AppError;

// =====================================================
// Global Error Handler Middleware
// Catch-all middleware for handling operational & runtime errors
// =====================================================
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if ('statusCode' in err && typeof (err as { statusCode: unknown }).statusCode === 'number') {
    statusCode = (err as { statusCode: number }).statusCode;
    message = err.message;
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if ((err as NodeJS.ErrnoException).code === '11000') {
    statusCode = 409;
    const match = err.message.match(/index: (?:.*_)?(\w+)_\d+ dup key: \{ (\w+): "(.*?)" \}/);
    if (match) {
      message = `Duplicate value for field '${match[2]}': "${match[3]}" already exists.`;
    } else {
      message = 'Duplicate field value entered.';
    }
  }

  // Handle JWT Verification Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again.';
  }

  // Handle Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found. Invalid ID format.';
  }

  const response: ApiResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.stack }),
  };

  res.status(statusCode).json(response);
};

// =====================================================
// 404 Not Found Middleware
// =====================================================
export const notFound = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  } as ApiResponse);
};
