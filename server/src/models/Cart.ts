import mongoose, { Schema, Document, Types } from 'mongoose';

// =====================================================
// Cart Item Sub-document Interface
// =====================================================
export interface ICartItem {
  _id?: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
  priceAtAdd: number;    // Price locked at time of adding (avoids stale price)
}

// =====================================================
// Cart Document Interface
// =====================================================
export interface ICart extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
  // Virtuals
  totalItems: number;
  totalPrice: number;
}

// =====================================================
// Cart Item Sub-schema
// =====================================================
const CartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      max: [100, 'Cannot add more than 100 units of a product'],
    },
    priceAtAdd: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
  },
  { _id: true }
);

// =====================================================
// Cart Schema
// =====================================================
const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cart must belong to a user'],
      unique: true,      // One cart per user
    },
    items: {
      type: [CartItemSchema],
      default: [],
      validate: {
        validator: (arr: ICartItem[]) => arr.length <= 50,
        message: 'Cart cannot hold more than 50 different products',
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// =====================================================
// Indexes
// =====================================================
CartSchema.index({ user: 1 }, { unique: true });
CartSchema.index({ 'items.product': 1 });

// =====================================================
// Virtuals — computed cart totals
// =====================================================
CartSchema.virtual('totalItems').get(function (this: ICart) {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

CartSchema.virtual('totalPrice').get(function (this: ICart) {
  return parseFloat(
    this.items
      .reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0)
      .toFixed(2)
  );
});

// =====================================================
// Export
// =====================================================
const Cart = mongoose.model<ICart>('Cart', CartSchema);
export default Cart;
