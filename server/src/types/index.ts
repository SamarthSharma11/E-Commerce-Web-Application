// =====================================================
// Global Type Definitions for the E-Commerce API
// =====================================================

import { Request } from 'express';
import { Document, Types } from 'mongoose';

// ---------------------------
// User Types
// ---------------------------
export type UserRole = 'user' | 'admin';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ---------------------------
// Product Types
// ---------------------------
export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: Types.ObjectId;
  brand?: string;
  images: string[];
  stock: number;
  sold: number;
  ratings: number;
  numReviews: number;
  reviews: IReview[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview {
  user: Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// ---------------------------
// Category Types
// ---------------------------
export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------
// Cart Types
// ---------------------------
export interface ICartItem {
  product: Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface ICart extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: ICartItem[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------
// Order Types
// ---------------------------
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface IShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    updateTime: string;
    emailAddress: string;
  };
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------
// Auth / Request Extensions
// ---------------------------
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// ---------------------------
// API Response Types
// ---------------------------
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
