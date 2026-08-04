import mongoose, { Schema, Document, Types } from 'mongoose';

// =====================================================
// Sub-document Interfaces
// =====================================================
export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
}

export interface IPaymentInfo {
  method: 'razorpay' | 'cod' | 'wallet';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  paidAt?: Date;
}

// =====================================================
// Order Status Enum
// =====================================================
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

// =====================================================
// Order Document Interface
// =====================================================
export interface IOrder extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentInfo: IPaymentInfo;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  orderStatus: OrderStatus;
  placedAt: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// Order Item Sub-schema
// =====================================================
const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name:     { type: String, required: true },
    price:    { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image:    { type: String, required: true },
  },
  { _id: false }   // No separate _id for embedded items
);

// =====================================================
// Shipping Address Sub-schema
// =====================================================
const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true },
    line1:    { type: String, required: true },
    line2:    { type: String },
    city:     { type: String, required: true },
    state:    { type: String, required: true },
    pincode:  { type: String, required: true },
    country:  { type: String, required: true, default: 'India' },
    phone:    { type: String, required: true },
  },
  { _id: false }
);

// =====================================================
// Payment Info Sub-schema
// =====================================================
const PaymentInfoSchema = new Schema<IPaymentInfo>(
  {
    method: {
      type: String,
      enum: ['razorpay', 'cod', 'wallet'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: { type: String },
    paidAt:        { type: Date },
  },
  { _id: false }
);

// =====================================================
// Order Schema
// =====================================================
const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user'],
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (arr: IOrderItem[]) => arr.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: [true, 'Shipping address is required'],
    },
    paymentInfo: {
      type: PaymentInfoSchema,
      required: [true, 'Payment information is required'],
    },
    itemsPrice:    { type: Number, required: true, min: 0 },
    taxPrice:      { type: Number, required: true, min: 0, default: 0 },
    shippingPrice: { type: Number, required: true, min: 0, default: 0 },
    totalPrice:    { type: Number, required: true, min: 0 },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    placedAt:     { type: Date, default: Date.now },
    deliveredAt:  { type: Date },
    cancelledAt:  { type: Date },
    cancelReason: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

// =====================================================
// Indexes
// =====================================================
OrderSchema.index({ user: 1, createdAt: -1 });    // User's order history
OrderSchema.index({ orderStatus: 1 });             // Admin filtering by status
OrderSchema.index({ 'paymentInfo.status': 1 });   // Payment status queries
OrderSchema.index({ 'paymentInfo.transactionId': 1 }, { sparse: true }); // Razorpay lookup
OrderSchema.index({ placedAt: -1 });               // Recent orders
OrderSchema.index({ createdAt: -1 });

// =====================================================
// Pre-save Hook — set deliveredAt / cancelledAt timestamps
// =====================================================
OrderSchema.pre<IOrder>('save', function (next) {
  if (this.isModified('orderStatus')) {
    if (this.orderStatus === 'delivered' && !this.deliveredAt) {
      this.deliveredAt = new Date();
    }
    if (this.orderStatus === 'cancelled' && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
  }
  next();
});

// =====================================================
// Export
// =====================================================
const Order = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
