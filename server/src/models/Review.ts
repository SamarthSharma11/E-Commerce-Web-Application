import mongoose, { Schema, Document, Types, CallbackError } from 'mongoose';

// =====================================================
// Review Document Interface
// =====================================================
export interface IReview extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  product: Types.ObjectId;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;   // True if user actually ordered the product
  helpfulVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// Review Schema
// =====================================================
const ReviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// =====================================================
// Indexes
// =====================================================
// Compound unique: one review per user per product
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });
ReviewSchema.index({ product: 1, rating: -1 });  // Product reviews sorted by rating
ReviewSchema.index({ user: 1, createdAt: -1 });  // User's review history
ReviewSchema.index({ rating: 1 });

// =====================================================
// Static Method — Recalculate product ratingsAverage & ratingsCount
// Called after save and after remove
// =====================================================
ReviewSchema.statics.calcProductRatings = async function (productId: Types.ObjectId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  const Product = mongoose.model('Product');

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: stats[0].avgRating,
      ratingsCount: stats[0].count,
    });
  } else {
    // No reviews left — reset to defaults
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsCount: 0,
    });
  }
};

// =====================================================
// Post-save Hook — update product ratings after a new review
// =====================================================
ReviewSchema.post<IReview>('save', async function () {
  const ReviewModel = this.constructor as typeof mongoose.Model & {
    calcProductRatings: (id: Types.ObjectId) => Promise<void>;
  };
  await ReviewModel.calcProductRatings(this.product);
});

// =====================================================
// Post-deleteOne Hook — update product ratings after review removal
// =====================================================
ReviewSchema.post(
  'deleteOne',
  { document: true, query: false },
  async function (this: IReview) {
    const ReviewModel = this.constructor as typeof mongoose.Model & {
      calcProductRatings: (id: Types.ObjectId) => Promise<void>;
    };
    await (ReviewModel as unknown as { calcProductRatings: (id: Types.ObjectId) => Promise<void> })
      .calcProductRatings(this.product);
  }
);

// =====================================================
// Pre-save Hook — prevent duplicate review (belt + suspenders)
// The unique compound index above is the primary guard;
// this hook gives a friendlier error message.
// =====================================================
ReviewSchema.pre<IReview>('save', async function (next) {
  if (!this.isNew) return next();

  const existing = await mongoose.model<IReview>('Review').findOne({
    user: this.user,
    product: this.product,
  });
  if (existing) {
    return next(new Error('You have already reviewed this product') as CallbackError);
  }
  next();
});

// =====================================================
// Export
// =====================================================
const Review = mongoose.model<IReview>('Review', ReviewSchema);
export default Review;
