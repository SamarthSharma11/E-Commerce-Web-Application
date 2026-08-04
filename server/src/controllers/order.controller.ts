import { Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendCreated, getPagination, buildPaginationMeta } from '../utils/helpers';

// =====================================================
// Order Controller
// =====================================================

/**
 * @route   POST /api/orders
 * @desc    Create order from user's cart
 * @access  Private
 */
export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { shippingAddress, paymentMethod, paymentInfo } = req.body;

  if (!userId) {
    throw new AppError(401, 'Not authorized to access this route');
  }

  // Validate shipping address
  if (!shippingAddress || typeof shippingAddress !== 'object') {
    throw new AppError(400, 'Shipping address is required');
  }

  const requiredAddressFields = ['fullName', 'line1', 'city', 'state', 'pincode', 'country', 'phone'];
  for (const field of requiredAddressFields) {
    if (!shippingAddress[field]) {
      throw new AppError(400, `${field} is required in shipping address`);
    }
  }

  // Validate payment method
  const validPaymentMethods = ['razorpay', 'cod', 'wallet'];
  if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
    throw new AppError(400, 'Invalid payment method. Must be razorpay, cod, or wallet');
  }

  // Fetch user's cart
  const cart = await Cart.findOne({ user: userId }).populate('items.product', 'name slug images price stock isActive');

  if (!cart || cart.items.length === 0) {
    throw new AppError(400, 'Your cart is empty');
  }

  // Validate stock and build order items
  const orderItems = [];
  let itemsPrice = 0;

  for (const cartItem of cart.items) {
    const product = cartItem.product as any;
    if (!product || !product.isActive) {
      throw new AppError(400, `Product "${product?.name || 'Unknown'}" is no longer available`);
    }

    if (product.stock < cartItem.quantity) {
      throw new AppError(400, `Insufficient stock for "${product.name}". Only ${product.stock} available`);
    }

    const itemPrice = cartItem.priceAtAdd * cartItem.quantity;
    itemsPrice += itemPrice;

    orderItems.push({
      product: cartItem.product._id || cartItem.product,
      name: product.name,
      price: cartItem.priceAtAdd,
      quantity: cartItem.quantity,
      image: product.images?.[0] || '',
    });
  }

  // Calculate totals
  const taxPrice = 0;
  const shippingPrice = itemsPrice > 1000 ? 0 : 50; // Free shipping above ₹1000
  const totalPrice = parseFloat((itemsPrice + taxPrice + shippingPrice).toFixed(2));

  // Build order
  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress: {
      fullName: shippingAddress.fullName,
      line1: shippingAddress.line1,
      line2: shippingAddress.line2 || '',
      city: shippingAddress.city,
      state: shippingAddress.state,
      pincode: shippingAddress.pincode,
      country: shippingAddress.country || 'India',
      phone: shippingAddress.phone,
    },
    paymentInfo: {
      method: paymentMethod,
      status: paymentInfo?.status === 'paid' ? 'paid' : 'pending',
      transactionId: paymentInfo?.transactionId,
      paidAt: paymentInfo?.status === 'paid' ? new Date() : undefined,
    },
    itemsPrice: parseFloat(itemsPrice.toFixed(2)),
    taxPrice,
    shippingPrice,
    totalPrice,
    orderStatus: 'pending',
  });

  // Decrement product stock
  const productIds = cart.items.map((item) => item.product._id || item.product);
  const products = await Product.find({ _id: { $in: productIds } });

  const bulkOps = products.map((product) => {
    const cartItem = cart.items.find((item) => (item.product._id || item.product).toString() === product._id.toString());
    return {
      updateOne: {
        filter: { _id: product._id },
        update: { $inc: { stock: -(cartItem?.quantity || 0) } },
      },
    };
  });

  await Product.bulkWrite(bulkOps);

  // Clear cart
  cart.items = [];
  await cart.save();

  // Populate and return order
  const populatedOrder = await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('items.product', 'name slug images');

  sendCreated(res, populatedOrder, 'Order placed successfully');
};

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get current user's order history with pagination
 * @access  Private
 */
export const getMyOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { page, limit, skip } = getPagination(req.query as Record<string, string>);

  if (!userId) {
    throw new AppError(401, 'Not authorized to access this route');
  }

  const filter: Record<string, unknown> = { user: new mongoose.Types.ObjectId(userId) };

  const [orders, totalCount] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .populate('items.product', 'name slug images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  const paginationMeta = buildPaginationMeta(totalCount, page, limit);

  sendSuccess(res, orders, 'Orders fetched successfully', 200, paginationMeta);
};

/**
 * @route   GET /api/orders/:id
 * @desc    Get order detail by ID (owner or admin only)
 * @access  Private
 */
export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    throw new AppError(401, 'Not authorized to access this route');
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid order ID format');
  }

  const order = await Order.findById(id)
    .populate('user', 'name email')
    .populate('items.product', 'name slug images');

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  // Check ownership or admin role
  const isOwner = order.user._id.toString() === userId;
  const isAdmin = userRole === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError(403, 'You are not authorized to view this order');
  }

  sendSuccess(res, order, 'Order fetched successfully');
};

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (admin only)
 * @access  Private / Admin
 */
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { orderStatus, cancelReason } = req.body;

  if (!req.user?.id) {
    throw new AppError(401, 'Not authorized to access this route');
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid order ID format');
  }

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!orderStatus || !validStatuses.includes(orderStatus)) {
    throw new AppError(400, `Invalid order status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const order = await Order.findById(id);

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  // Prevent updating delivered orders (except to cancelled? No, let's keep it simple)
  if (order.orderStatus === 'delivered' && orderStatus !== 'delivered') {
    throw new AppError(400, 'Cannot update status of a delivered order');
  }

  order.orderStatus = orderStatus;

  if (orderStatus === 'delivered') {
    order.deliveredAt = new Date();
  }

  if (orderStatus === 'cancelled') {
    order.cancelledAt = new Date();
    order.cancelReason = cancelReason || '';

    // Restore stock when order is cancelled
    const productIds = order.items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    const bulkOps = products.map((product) => {
      const orderItem = order.items.find((item) => item.product.toString() === product._id.toString());
      const qty = orderItem?.quantity || 0;
      return {
        updateOne: {
          filter: { _id: product._id },
          update: { $inc: { stock: qty } },
        },
      };
    });

    await Product.bulkWrite(bulkOps);
  }

  await order.save();

  const updatedOrder = await Order.findById(id)
    .populate('user', 'name email')
    .populate('items.product', 'name slug images');

  sendSuccess(res, updatedOrder, 'Order status updated successfully');
};

/**
 * @route   GET /api/orders
 * @desc    Get all orders (admin only) with filters
 * @access  Private / Admin
 */
export const getAllOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { page, limit, skip } = getPagination(req.query as Record<string, string>);
  const { status, startDate, endDate, user } = req.query;

  const filter: Record<string, unknown> = {};

  // Filter by order status
  if (status && typeof status === 'string') {
    filter.orderStatus = status;
  }

  // Filter by date range
  if (startDate || endDate) {
    filter.createdAt = {} as Record<string, Date>;
    if (startDate) {
      (filter.createdAt as Record<string, Date>).$gte = new Date(startDate as string);
    }
    if (endDate) {
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      (filter.createdAt as Record<string, Date>).$lte = end;
    }
  }

  // Filter by user
  if (user && mongoose.Types.ObjectId.isValid(user as string)) {
    filter.user = new mongoose.Types.ObjectId(user as string);
  }

  const [orders, totalCount] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .populate('items.product', 'name slug images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  const paginationMeta = buildPaginationMeta(totalCount, page, limit);

  sendSuccess(res, orders, 'Orders fetched successfully', 200, paginationMeta);
};
