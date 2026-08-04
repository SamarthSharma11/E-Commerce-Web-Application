import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, getPagination, buildPaginationMeta } from '../utils/helpers';

// =====================================================
// Admin Controller
// =====================================================

/**
 * @route   GET /api/admin/stats/summary
 * @desc    Get admin dashboard summary stats
 * @access  Private / Admin
 */
export const getAdminSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // Parallel aggregation for performance
  const [totalRevenueResult, totalOrders, totalUsers, totalProducts, lowStockProducts] = await Promise.all([
    Order.aggregate([
      { $match: { 'paymentInfo.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.countDocuments(),
    User.countDocuments(),
    Product.countDocuments(),
    Product.countDocuments({ stock: { $lt: 10, $gte: 0 } }),
  ]);

  const totalRevenue = totalRevenueResult[0]?.total || 0;

  sendSuccess(res, {
    totalRevenue,
    totalOrders,
    totalUsers,
    totalProducts,
    lowStockProducts,
  }, 'Admin summary fetched successfully');
};

/**
 * @route   GET /api/admin/stats/sales-over-time
 * @desc    Get aggregated daily/monthly revenue for the last N days
 * @access  Private / Admin
 */
export const getSalesOverTime = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { period = 'daily', days = '30' } = req.query;
  const nDays = parseInt(days as string, 10) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - nDays);
  startDate.setHours(0, 0, 0, 0);

  const groupBy = period === 'monthly' ? {
    year: { $year: '$createdAt' },
    month: { $month: '$createdAt' },
  } : {
    year: { $year: '$createdAt' },
    month: { $month: '$createdAt' },
    day: { $dayOfMonth: '$createdAt' },
  };

  const salesData = await Order.aggregate([
    {
      $match: {
        'paymentInfo.status': 'paid',
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
    },
  ]);

  const formattedData = salesData.map((item) => {
    const id = item._id as Record<string, number>;
    const label = period === 'monthly'
      ? `${id.year}-${String(id.month).padStart(2, '0')}`
      : `${id.year}-${String(id.month).padStart(2, '0')}-${String(id.day).padStart(2, '0')}`;
    return {
      date: label,
      revenue: item.revenue,
      orders: item.orders,
    };
  });

  sendSuccess(res, formattedData, 'Sales over time fetched successfully');
};

/**
 * @route   GET /api/admin/stats/top-products
 * @desc    Get best-selling products by quantity sold
 * @access  Private / Admin
 */
export const getTopProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { limit = '10' } = req.query;
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));

  const topProducts = await Order.aggregate([
    { $match: { 'paymentInfo.status': 'paid' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: limitNum },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        name: '$product.name',
        images: '$product.images',
        price: '$product.price',
        totalQuantity: 1,
        totalRevenue: 1,
      },
    },
  ]);

  sendSuccess(res, topProducts, 'Top products fetched successfully');
};

/**
 * @route   GET /api/admin/users
 * @desc    Get paginated list of all users with search/filter by role
 * @access  Private / Admin
 */
export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { page, limit, skip } = getPagination(req.query as Record<string, string>);
  const { search, role } = req.query;

  const filter: Record<string, unknown> = {};

  if (search && typeof search === 'string') {
    filter.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  if (role && typeof role === 'string') {
    filter.role = role;
  }

  const [users, totalCount] = await Promise.all([
    User.find(filter)
      .select('-password -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  const paginationMeta = buildPaginationMeta(totalCount, page, limit);

  sendSuccess(res, users, 'Users fetched successfully', 200, paginationMeta);
};

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update a user's role
 * @access  Private / Admin
 */
export const updateUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { role } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid user ID format');
  }

  if (!role || !['customer', 'admin'].includes(role)) {
    throw new AppError(400, 'Invalid role. Must be either "customer" or "admin"');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  // Prevent admin from demoting themselves
  if (user._id.toString() === req.user?.id) {
    throw new AppError(400, 'You cannot change your own role');
  }

  user.role = role;
  await user.save();

  const updatedUser = await User.findById(id).select('-password -passwordResetToken -passwordResetExpires');

  sendSuccess(res, updatedUser, 'User role updated successfully');
};

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Activate/deactivate a user account
 * @access  Private / Admin
 */
export const updateUserStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid user ID format');
  }

  if (typeof isActive !== 'boolean') {
    throw new AppError(400, 'isActive must be a boolean value');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  // Prevent admin from deactivating themselves
  if (user._id.toString() === req.user?.id) {
    throw new AppError(400, 'You cannot change your own account status');
  }

  user.isActive = isActive;
  await user.save();

  const updatedUser = await User.findById(id).select('-password -passwordResetToken -passwordResetExpires');

  sendSuccess(res, updatedUser, `User account ${isActive ? 'activated' : 'deactivated'} successfully`);
};
