import { Request, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import Category from '../models/Category';
import Product from '../models/Product';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess, sendCreated } from '../utils/helpers';

// =====================================================
// Zod Validation Schemas
// =====================================================
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    image: z.string().optional(),
    parentCategory: z
      .string()
      .nullable()
      .optional()
      .refine(
        (val) => !val || mongoose.Types.ObjectId.isValid(val),
        'Invalid parent category ID format'
      ),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters').max(100).optional(),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    image: z.string().optional(),
    parentCategory: z
      .string()
      .nullable()
      .optional()
      .refine(
        (val) => !val || mongoose.Types.ObjectId.isValid(val),
        'Invalid parent category ID format'
      ),
    isActive: z.boolean().optional(),
  }),
});

// =====================================================
// Controllers
// =====================================================

/**
 * @route   GET /api/categories
 * @desc    Get all categories with optional parentCategory filter
 * @access  Public
 */
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  const { parentCategory, search, isActive } = req.query;

  const filter: Record<string, unknown> = {};

  // Handle parentCategory query parameter
  if (parentCategory === 'null' || parentCategory === 'none' || parentCategory === 'root') {
    filter.parentCategory = null;
  } else if (parentCategory && typeof parentCategory === 'string') {
    if (mongoose.Types.ObjectId.isValid(parentCategory)) {
      filter.parentCategory = parentCategory;
    }
  }

  // Active status filter (default: show active only unless explicitly specified)
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  // Search by category name
  if (search && typeof search === 'string') {
    filter.name = { $regex: search.trim(), $options: 'i' };
  }

  const categories = await Category.find(filter)
    .populate('parentCategory', 'name slug')
    .populate({
      path: 'subCategories',
      select: 'name slug image description isActive',
    })
    .sort({ name: 1 });

  sendSuccess(res, categories, 'Categories fetched successfully');
};

/**
 * @route   GET /api/categories/:slug
 * @desc    Get single category by slug
 * @access  Public
 */
export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;

  const category = await Category.findOne({ slug: slug.toLowerCase() })
    .populate('parentCategory', 'name slug')
    .populate({
      path: 'subCategories',
      select: 'name slug image description isActive',
    });

  if (!category) {
    throw new AppError(404, `Category with slug '${slug}' not found`);
  }

  sendSuccess(res, category, 'Category details fetched successfully');
};

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private / Admin
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, description, image, parentCategory, isActive } = req.body;

  // Check for duplicate category name
  const existingCategory = await Category.findOne({
    name: { $regex: `^${name.trim()}$`, $options: 'i' },
  });

  if (existingCategory) {
    throw new AppError(400, `Category with name '${name}' already exists`);
  }

  // Validate parent category if supplied
  if (parentCategory) {
    const parent = await Category.findById(parentCategory);
    if (!parent) {
      throw new AppError(400, 'Specified parent category does not exist');
    }
  }

  const category = await Category.create({
    name,
    description,
    image,
    parentCategory: parentCategory || null,
    isActive: isActive !== undefined ? isActive : true,
  });

  const populatedCategory = await Category.findById(category._id).populate(
    'parentCategory',
    'name slug'
  );

  sendCreated(res, populatedCategory, 'Category created successfully');
};

/**
 * @route   PUT /api/categories/:id
 * @desc    Update an existing category
 * @access  Private / Admin
 */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, image, parentCategory, isActive } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid category ID format');
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new AppError(404, 'Category not found');
  }

  // Check if name is being changed and conflicts with existing category
  if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
    const nameExists = await Category.findOne({
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
      _id: { $ne: id },
    });

    if (nameExists) {
      throw new AppError(400, `Category with name '${name}' already exists`);
    }

    category.name = name;
  }

  // Prevent self-referencing parentCategory
  if (parentCategory) {
    if (parentCategory === id) {
      throw new AppError(400, 'A category cannot be its own parent category');
    }
    const parent = await Category.findById(parentCategory);
    if (!parent) {
      throw new AppError(400, 'Specified parent category does not exist');
    }
    category.parentCategory = new mongoose.Types.ObjectId(parentCategory);
  } else if (parentCategory === null) {
    category.parentCategory = null;
  }

  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = image;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();

  const updatedCategory = await Category.findById(id)
    .populate('parentCategory', 'name slug')
    .populate('subCategories', 'name slug');

  sendSuccess(res, updatedCategory, 'Category updated successfully');
};

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category by ID (Blocked if sub-categories or products reference it)
 * @access  Private / Admin
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid category ID format');
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new AppError(404, 'Category not found');
  }

  // 1. Guard against sub-categories referencing this category
  const subCategoriesCount = await Category.countDocuments({ parentCategory: id });
  if (subCategoriesCount > 0) {
    throw new AppError(
      400,
      `Cannot delete category '${category.name}' because it has ${subCategoriesCount} sub-categories attached. Please delete or reassign sub-categories first.`
    );
  }

  // 2. Guard against products referencing this category
  const productCount = await Product.countDocuments({ category: id });
  if (productCount > 0) {
    throw new AppError(
      400,
      `Cannot delete category '${category.name}' because ${productCount} products are linked to it. Please reassign or remove linked products first.`
    );
  }

  await category.deleteOne();

  sendSuccess(res, null, `Category '${category.name}' deleted successfully`);
};
