import mongoose, { Schema, Document, Types } from 'mongoose';
import slugify from '../utils/slugify';

// =====================================================
// Product Document Interface
// =====================================================
export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: Types.ObjectId;
  images: string[];          // Cloudinary URLs
  stock: number;
  sku: string;               // Stock Keeping Unit — unique
  brand?: string;
  ratingsAverage: number;
  ratingsCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Virtual
  effectivePrice: number;
  discountPercent: number;
}

// =====================================================
// Product Schema
// =====================================================
const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      validate: {
        validator: function (this: IProduct, val: number) {
          return val < this.price;
        },
        message: 'Discount price must be less than the regular price',
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.length <= 10,
        message: 'A product cannot have more than 10 images',
      },
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [100, 'Brand name cannot exceed 100 characters'],
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
      set: (val: number) => Math.round(val * 10) / 10,  // Round to 1 decimal
    },
    ratingsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// =====================================================
// Indexes
// =====================================================
// Text index for full-text search on name and description
ProductSchema.index(
  { name: 'text', description: 'text', brand: 'text' },
  { weights: { name: 10, brand: 5, description: 1 }, name: 'product_text_search' }
);
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ sku: 1 }, { unique: true });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ ratingsAverage: -1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ createdAt: -1 });
// Compound: active products in a category sorted by rating
ProductSchema.index({ isActive: 1, category: 1, ratingsAverage: -1 });

// =====================================================
// Virtuals
// =====================================================
ProductSchema.virtual('effectivePrice').get(function (this: IProduct) {
  return this.discountPrice ?? this.price;
});

ProductSchema.virtual('discountPercent').get(function (this: IProduct) {
  if (!this.discountPrice || this.discountPrice >= this.price) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

// Virtual reverse-populate reviews
ProductSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

// =====================================================
// Pre-save Hook — Auto-generate slug from name
// =====================================================
ProductSchema.pre<IProduct>('save', async function (next) {
  if (!this.isModified('name')) return next();

  this.slug = slugify(this.name);

  // Collision-safe slug: append SKU suffix if slug exists
  const ProductModel = mongoose.model<IProduct>('Product');
  const existing = await ProductModel.findOne({
    slug: this.slug,
    _id: { $ne: this._id },
  });
  if (existing) {
    this.slug = `${this.slug}-${this.sku.toLowerCase()}`;
  }

  next();
});

// =====================================================
// Export
// =====================================================
const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
