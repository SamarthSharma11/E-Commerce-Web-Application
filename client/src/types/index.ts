// =====================================================
// Client-side TypeScript Types for E-Commerce App
// =====================================================

// ---------------------------
// Auth Types
// ---------------------------
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  phone?: string;
  addresses: Address[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id?: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ---------------------------
// Product Types
// ---------------------------
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: Category | string;
  brand?: string;
  images: string[];
  stock: number;
  sku: string;
  ratingsAverage: number;
  ratingsCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id?: string;
  user: string | { _id: string; name: string; avatar?: string };
  product: string;
  rating: number;
  comment: string;
  isVerifiedPurchase?: boolean;
  helpfulVotes?: number;
  createdAt: string;
  updatedAt?: string;
}

// ---------------------------
// Category Types
// ---------------------------
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: string | Category | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------
// Cart Types
// ---------------------------
export interface CartItem {
  _id: string;
  product: string | Product;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  itemsCount: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------
// Order Types
// ---------------------------
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  product: string | Product;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber?: string;
  user: string | User;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentInfo?: {
    method: string;
    status: string;
    transactionId?: string;
    paidAt?: string;
  };
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  orderStatus: OrderStatus;
  placedAt: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
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
  currentPage: number;
  limit: number;
  totalCount: number;
  total?: number;
  totalPages: number;
}

// ---------------------------
// Product Filters
// ---------------------------
export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  brand?: string;
}
