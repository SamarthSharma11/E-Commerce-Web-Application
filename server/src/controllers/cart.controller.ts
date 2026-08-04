import { Response } from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils/helpers';

// =====================================================
// Cart Controller
// =====================================================

/**
 * @route   GET /api/cart
 * @desc    Get current user's cart with populated product details
 * @access  Private
 */
export const getCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(401, 'Not authorized to access this route');
  }

  const cart = await Cart.findOne({ user: userId }).populate('items.product', 'name slug images price stock isActive');

  if (!cart) {
    sendSuccess(res, {
      items: [],
      itemsCount: 0,
      subtotal: 0,
    }, 'Cart fetched successfully');
    return;
  }

  const cartResponse = {
    _id: cart._id,
    items: cart.items.map((item) => ({
      _id: item._id,
      product: item.product,
      quantity: item.quantity,
      priceAtAdd: item.priceAtAdd,
    })),
    itemsCount: (cart.totalItems as number) || 0,
    subtotal: (cart.totalPrice as number) || 0,
  };

  sendSuccess(res, cartResponse, 'Cart fetched successfully');
};

/**
 * @route   POST /api/cart
 * @desc    Add item to cart (merge quantity if already exists)
 * @access  Private
 */
export const addToCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { productId, quantity = 1 } = req.body;

  if (!userId) {
    throw new AppError(401, 'Not authorized to access this route');
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError(400, 'Invalid product ID format');
  }

  if (quantity < 1 || quantity > 100) {
    throw new AppError(400, 'Quantity must be between 1 and 100');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  if (!product.isActive) {
    throw new AppError(400, 'This product is not available');
  }

  if (product.stock < quantity) {
    throw new AppError(400, `Only ${product.stock} units available in stock`);
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [
        {
          product: productId,
          quantity,
          priceAtAdd: product.discountPrice ?? product.price,
        },
      ],
    });
  } else {
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > 100) {
        throw new AppError(400, 'Cannot add more than 100 units of a product');
      }

      if (newQuantity > product.stock) {
        throw new AppError(400, `Only ${product.stock} units available in stock`);
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        priceAtAdd: product.discountPrice ?? product.price,
      });
    }

    await cart.save();
  }

  const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name slug images price stock isActive');

  const cartResponse = {
    _id: populatedCart!._id,
    items: populatedCart!.items.map((item) => ({
      _id: item._id,
      product: item.product,
      quantity: item.quantity,
      priceAtAdd: item.priceAtAdd,
    })),
    itemsCount: (populatedCart!.totalItems as number) || 0,
    subtotal: (populatedCart!.totalPrice as number) || 0,
  };

  sendSuccess(res, cartResponse, 'Item added to cart successfully', 201);
};

/**
 * @route   PUT /api/cart/:productId
 * @desc    Update quantity of a specific cart item
 * @access  Private
 */
export const updateCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!userId) {
    throw new AppError(401, 'Not authorized to access this route');
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError(400, 'Invalid product ID format');
  }

  if (quantity === undefined || quantity === null) {
    throw new AppError(400, 'Quantity is required');
  }

  if (quantity < 1 || quantity > 100) {
    throw new AppError(400, 'Quantity must be between 1 and 100');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  if (quantity > product.stock) {
    throw new AppError(400, `Only ${product.stock} units available in stock`);
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new AppError(404, 'Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    throw new AppError(404, 'Item not found in cart');
  }

  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].priceAtAdd = product.discountPrice ?? product.price;

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name slug images price stock isActive');

  const cartResponse = {
    _id: populatedCart!._id,
    items: populatedCart!.items.map((item) => ({
      _id: item._id,
      product: item.product,
      quantity: item.quantity,
      priceAtAdd: item.priceAtAdd,
    })),
    itemsCount: (populatedCart!.totalItems as number) || 0,
    subtotal: (populatedCart!.totalPrice as number) || 0,
  };

  sendSuccess(res, cartResponse, 'Cart updated successfully');
};

/**
 * @route   DELETE /api/cart/:productId
 * @desc    Remove item from cart
 * @access  Private
 */
export const removeFromCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { productId } = req.params;

  if (!userId) {
    throw new AppError(401, 'Not authorized to access this route');
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError(400, 'Invalid product ID format');
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new AppError(404, 'Cart not found');
  }

  const initialLength = cart.items.length;
  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  if (cart.items.length === initialLength) {
    throw new AppError(404, 'Item not found in cart');
  }

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name slug images price stock isActive');

  const cartResponse = {
    _id: populatedCart!._id,
    items: populatedCart!.items.map((item) => ({
      _id: item._id,
      product: item.product,
      quantity: item.quantity,
      priceAtAdd: item.priceAtAdd,
    })),
    itemsCount: (populatedCart!.totalItems as number) || 0,
    subtotal: (populatedCart!.totalPrice as number) || 0,
  };

  sendSuccess(res, cartResponse, 'Item removed from cart successfully');
};

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart
 * @access  Private
 */
export const clearCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(401, 'Not authorized to access this route');
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new AppError(404, 'Cart not found');
  }

  cart.items = [];
  await cart.save();

  const cartResponse = {
    _id: cart._id,
    items: [],
    itemsCount: 0,
    subtotal: 0,
  };

  sendSuccess(res, cartResponse, 'Cart cleared successfully');
};
