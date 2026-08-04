import { ApiResponse, PaginationMeta } from '../types';
import { Response } from 'express';

// =====================================================
// Standardized API Response Helpers
// =====================================================

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  pagination?: PaginationMeta
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(pagination && { pagination }),
  };
  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message = 'Created successfully'
): Response => {
  return sendSuccess(res, data, message, 201);
};

export const sendError = (
  res: Response,
  message = 'Something went wrong',
  statusCode = 500
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
  };
  return res.status(statusCode).json(response);
};

// =====================================================
// Pagination Helper
// =====================================================
export const getPagination = (
  query: Record<string, string | undefined>
): { page: number; limit: number; skip: number } => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => ({
  currentPage: page,
  limit,
  totalCount: total,
  totalPages: Math.ceil(total / limit),
});

// =====================================================
// Slug Generator
// =====================================================
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
