import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { AuthenticatedRequest, UserRole } from '../types';
import { AppError } from './errorHandler';
import User from '../models/User';

// =====================================================
// JWT Payload Interface
// =====================================================
interface JwtPayload {
  id: string;
  role: UserRole;
  email?: string;
}

// =====================================================
// Protect Middleware
// Verifies Bearer JWT token from Authorization header or cookie,
// checks if user exists and is active, and attaches decoded user to req.user
// =====================================================
export const protect = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // 1. Check Authorization header for Bearer token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Fallback to cookie if token is not in header
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError(401, 'Not authorized to access this route. Token missing.');
    }

    // 3. Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

    // 4. Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError(401, 'The user belonging to this token no longer exists.');
    }

    if (!user.isActive) {
      throw new AppError(403, 'Your account is deactivated. Please contact support.');
    }

    // 5. Check if user changed password after token was issued
    if ((decoded as unknown as { iat?: number }).iat && user.changedPasswordAfter((decoded as unknown as { iat: number }).iat)) {
      throw new AppError(401, 'User recently changed password. Please log in again.');
    }

    // Attach user information to request object
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role as UserRole,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError(401, 'Invalid authentication token.'));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError(401, 'Authentication token has expired. Please log in again.'));
    }
    next(error);
  }
};

// Alias authenticate to protect for backward compatibility
export const authenticate = protect;

// =====================================================
// Authorize Middleware
// Restricts route access to specific user roles (e.g. 'admin', 'customer')
// =====================================================
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, 'Not authenticated. Access denied.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          403,
          `User role '${req.user.role}' is not authorized to access this route.`
        )
      );
    }

    next();
  };
};
