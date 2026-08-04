import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { AuthenticatedRequest, UserRole } from '../types';
import { ApiError } from './errorHandler';

// =====================================================
// JWT Payload Interface
// =====================================================
interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

// =====================================================
// Authenticate — verifies JWT from Authorization header or cookie
// =====================================================
export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    let token: string | undefined;

    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Fallback to cookie
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new ApiError(401, 'Access denied. No token provided.');
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// =====================================================
// Authorize — role-based access control
// =====================================================
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Access denied. Insufficient permissions.'));
    }

    next();
  };
};
