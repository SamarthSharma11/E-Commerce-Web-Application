import { Request, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import Product from '../models/Product';
import Category from '../models/Category';
import Review from '../models/Review';
import { uploadMultipleImages } from '../utils/cloudinary';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess, sendCreated, getPagination, buildPaginationMeta } from '../utils/helpers';

// =====================================================
// Zod Validation Schemas
// =====================================================
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
    price: z.coerce.number().min(0, 'Price cannot be negative'),
    discountPrice: z.coerce.number().min(0).optional(),
    category: z.string().min(1, 'Category is required'),
    stock: z.coerce.number().int().min(0, 'Stock cannot be negative').default(0),
    sku: z.string().optional(),
    brand: z.string().max(100).optional(),
    images: z.array(z.string()).optional(),
    isActive: z.coerce.boolean().optional().default(true),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    price: z.coerce.number().min(0).optional(),
    discountPrice: z.coerce.number().min(0).optional(),
    category: z.string().optional(),
    stock: z.coerce.number().int().min(0).optional(),
    sku: z.string().optional(),
    brand: z.string().max(100).optional(),
    images: z.array(z.string()).optional(),
    isActive: z.coerce.boolean().optional(),
  }),
});

// =====================================================
// Controllers
// =====================================================

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering, search, sorting & pagination
 * @access  Public
 */
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, skip } = getPagination(req.query as Record<string, string>);
  const { category, minPrice, maxPrice, search, sort, brand, isActive } = req.query;

  const filter: Record<string, unknown> = {};

  // 1. Filter by Active Status (Public defaults to active products only)
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  } else {
    filter.isActive = true;
  }

  // 2. Filter by Category (Supports category ID or slug)
  if (category && typeof category === 'string') {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    } else {
      const categoryDoc = await Category.findOne({ slug: category.toLowerCase() });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        // Return empty result if category slug doesn't exist
        sendSuccess(res, [], 'Products fetched successfully', 200, buildPaginationMeta(0, page, limit));
        return;
      }
    }
  }

  // 3. Filter by Price Range
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      (filter.price as Record<string, number>).$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      (filter.price as Record<string, number>).$lte = Number(maxPrice);
    }
  }

  // 4. Filter by Brand
  if (brand && typeof brand === 'string') {
    filter.brand = { $regex: brand.trim(), $options: 'i' };
  }

  // 5. Full-Text Search or Regex Match
  if (search && typeof search === 'string') {
    const searchTerm = search.trim();
    filter.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { brand: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  // 6. Sorting
  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };

  switch (sort) {
    case 'price_asc':
      sortOption = { price: 1 };
      break;
    case 'price_desc':
      sortOption = { price: -1 };
      break;
    case 'newest':
      sortOption = { createdAt: -1 };
      break;
    case 'rating':
      sortOption = { ratingsAverage: -1 };
      break;
    default:
      sortOption = { createdAt: -1 };
      break;
  }

  // Execute query with total count
  const [products, totalCount] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  const paginationMeta = buildPaginationMeta(totalCount, page, limit);

  sendSuccess(res, products, 'Products fetched successfully', 200, paginationMeta);
};

/**
 * @route   GET /api/products/:slug
 * @desc    Get single product by slug with populated category & reviews
 * @access  Public
 */
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;

  const product = await Product.findOne({ slug: slug.toLowerCase() })
    .populate('category', 'name slug description image')
    .populate({
      path: 'reviews',
      options: { sort: { createdAt: -1 } },
      populate: {
        path: 'user',
        select: 'name avatar',
      },
    });

  if (!product) {
    throw new AppError(404, `Product with slug '${slug}' not found`);
  }

  sendSuccess(res, product, 'Product details fetched successfully');
};

/**
 * @route   POST /api/products
 * @desc    Create a new product with optional image upload
 * @access  Private / Admin
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const {
    name,
    description,
    price,
    discountPrice,
    category,
    stock,
    sku,
    brand,
    isActive,
  } = req.body;

  // Validate category exists
  if (!mongoose.Types.ObjectId.isValid(category)) {
    throw new AppError(400, 'Invalid category ID format');
  }
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new AppError(400, 'Specified category does not exist');
  }

  // Handle uploaded images (if multipart form with files)
  let imageUrls: string[] = [];
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    imageUrls = await uploadMultipleImages(req.files as Express.Multer.File[], 'products');
  } else if (req.body.images && Array.isArray(req.body.images)) {
    imageUrls = req.body.images;
  }

  // Generate unique SKU if not provided
  const generatedSku =
    sku || `SKU-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    discountPrice: discountPrice !== undefined ? Number(discountPrice) : undefined,
    category,
    stock: stock ? Number(stock) : 0,
    sku: generatedSku,
    brand,
    images: imageUrls,
    isActive: isActive !== undefined ? String(isActive) === 'true' || isActive === true : true,
  });

  const populatedProduct = await Product.findById(product._id).populate(
    'category',
    'name slug'
  );

  sendCreated(res, populatedProduct, 'Product created successfully');
};

/**
 * @route   PUT /api/products/:id
 * @desc    Update product details and/or images
 * @access  Private / Admin
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid product ID format');
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  const updateData: Record<string, unknown> = { ...req.body };

  // Validate category if updated
  if (updateData.category) {
    if (!mongoose.Types.ObjectId.isValid(updateData.category as string)) {
      throw new AppError(400, 'Invalid category ID format');
    }
    const categoryExists = await Category.findById(updateData.category);
    if (!categoryExists) {
      throw new AppError(400, 'Specified category does not exist');
    }
  }

  // Handle image updates if new files are uploaded
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const newImageUrls = await uploadMultipleImages(
      req.files as Express.Multer.File[],
      'products'
    );

    // Replace or append images depending on replaceImages flag
    if (req.body.replaceImages === 'true' || req.body.replaceImages === true) {
      updateData.images = newImageUrls;
    } else {
      updateData.images = [...product.images, ...newImageUrls];
    }
  }

  // Coerce numeric fields
  if (updateData.price !== undefined) updateData.price = Number(updateData.price);
  if (updateData.discountPrice !== undefined) updateData.discountPrice = Number(updateData.discountPrice);
  if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug');

  sendSuccess(res, updatedProduct, 'Product updated successfully');
};

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product by ID and remove associated reviews
 * @access  Private / Admin
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid product ID format');
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  // Delete all reviews linked to this product
  await Review.deleteMany({ product: id });

  // Delete product document
  await product.deleteOne();

  sendSuccess(res, null, `Product '${product.name}' deleted successfully`);
};
