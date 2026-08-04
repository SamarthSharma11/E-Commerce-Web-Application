import mongoose, { Schema, Document, Types } from 'mongoose';
import slugify from '../utils/slugify';

// =====================================================
// Category Document Interface
// =====================================================
export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: Types.ObjectId | ICategory | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// Category Schema
// =====================================================
const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      type: String,  // Cloudinary URL
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// =====================================================
// Indexes
// =====================================================
CategorySchema.index({ name: 1 }, { unique: true });
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ parentCategory: 1 });
CategorySchema.index({ isActive: 1 });

// =====================================================
// Pre-save Hook — Auto-generate slug from name
// =====================================================
CategorySchema.pre<ICategory>('save', async function (next) {
  if (!this.isModified('name')) return next();

  this.slug = slugify(this.name);

  // Ensure slug uniqueness: append a numeric suffix if collision
  const CategoryModel = mongoose.model<ICategory>('Category');
  let existingSlug = await CategoryModel.findOne({
    slug: this.slug,
    _id: { $ne: this._id },
  });
  let counter = 1;
  while (existingSlug) {
    this.slug = `${slugify(this.name)}-${counter++}`;
    existingSlug = await CategoryModel.findOne({
      slug: this.slug,
      _id: { $ne: this._id },
    });
  }

  next();
});

// =====================================================
// Virtual — populate sub-categories
// =====================================================
CategorySchema.virtual('subCategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory',
});

CategorySchema.set('toJSON', { virtuals: true });
CategorySchema.set('toObject', { virtuals: true });

// =====================================================
// Export
// =====================================================
const Category = mongoose.model<ICategory>('Category', CategorySchema);
export default Category;
