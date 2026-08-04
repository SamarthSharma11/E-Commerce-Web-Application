import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Upload, Image as ImageIcon, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import type { Product, Category, PaginationMeta } from '../../types';

// =====================================================
// Admin Products Page
// =====================================================
const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    stock: '',
    sku: '',
    brand: '',
    isActive: true,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, search]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', '10');
      if (search) params.set('search', search);
      params.set('isActive', 'true');

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      discountPrice: '',
      category: '',
      stock: '',
      sku: '',
      brand: '',
      isActive: true,
    });
    setImageFiles([]);
    setImagePreviewUrls([]);
    setExistingImages([]);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      discountPrice: product.discountPrice ? String(product.discountPrice) : '',
      category: typeof product.category === 'object' ? product.category._id : product.category,
      stock: String(product.stock),
      sku: product.sku,
      brand: product.brand || '',
      isActive: product.isActive,
    });
    setExistingImages(product.images || []);
    setImageFiles([]);
    setImagePreviewUrls([]);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...imageFiles, ...files].slice(0, 10 - existingImages.length);
    setImageFiles(newFiles);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(newPreviews);
  };

  const removeImage = (index: number, isExisting = false) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
      setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      if (formData.discountPrice) data.append('discountPrice', formData.discountPrice);
      data.append('category', formData.category);
      data.append('stock', formData.stock);
      data.append('sku', formData.sku);
      if (formData.brand) data.append('brand', formData.brand);
      data.append('isActive', String(formData.isActive));

      if (editingProduct) {
        data.append('_method', 'PUT');
      }

      // Append new image files
      imageFiles.forEach((file) => {
        data.append('images', file);
      });

      // If editing and no new files, pass existing images
      if (editingProduct && imageFiles.length === 0) {
        existingImages.forEach((url) => data.append('images', url));
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product created successfully');
      }

      setShowModal(false);
      fetchProducts();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Operation failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-['Outfit']">Products</h1>
            <p className="text-[var(--color-text-muted)] mt-1">Manage your product inventory</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((prev) => prev ? { ...prev, currentPage: 1 } : null);
            }}
            className="w-full pl-12 pr-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Table */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[var(--color-text-muted)]">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[var(--color-text-muted)]">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)] uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-[var(--color-surface-2)]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.images[0] || '/placeholder.png'}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover border border-[var(--color-border)]"
                          />
                          <div>
                            <p className="font-medium text-white line-clamp-1">{product.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)]">
                        {typeof product.category === 'object' ? product.category.name : '-'}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        ₹{(product.discountPrice ?? product.price).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={product.stock > 0 ? 'text-green-400' : 'text-red-400'}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            product.isActive
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 hover:bg-indigo-500/10 rounded-lg text-indigo-400 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text-muted)]">
                Showing page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination((prev) => prev ? { ...prev, currentPage: Math.max(1, currentPage - 1) } : null)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium px-4">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setPagination((prev) => prev ? { ...prev, currentPage: Math.min(totalPages, currentPage + 1) } : null)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold font-['Outfit']">
                {editingProduct ? 'Edit Product' : 'Create Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Price & Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Category & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    min="0"
                    className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* SKU & Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--color-border)] bg-[var(--color-surface-2)] text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium">Active</label>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium mb-2">Images</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {existingImages.map((img, idx) => (
                    <div key={`existing-${idx}`} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[var(--color-border)]">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx, true)}
                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-500 rounded-full text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {imagePreviewUrls.map((url, idx) => (
                    <div key={`preview-${idx}`} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[var(--color-border)]">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-500 rounded-full text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {existingImages.length + imageFiles.length < 10 && (
                  <label className="flex items-center justify-center gap-2 w-full py-6 border-2 border-dashed border-[var(--color-border)] rounded-xl cursor-pointer hover:border-indigo-500/50 transition-colors">
                    <Upload className="w-5 h-5 text-[var(--color-text-muted)]" />
                    <span className="text-sm text-[var(--color-text-muted)]">Click to upload images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
