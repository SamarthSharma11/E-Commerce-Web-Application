import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Upload, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import type { Product, Category, PaginationMeta } from '../../types';

// =====================================================
// Admin Products Page — White Canvas
// =====================================================
const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
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
    if (showModal) {
      setModalVisible(true);
      setModalClosing(false);
    } else if (modalVisible) {
      setModalClosing(true);
      const t = setTimeout(() => {
        setModalVisible(false);
        setModalClosing(false);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [showModal]);

  const closeModal = () => setShowModal(false);

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
    } catch {
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
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const inputClass = `w-full px-4 py-3 bg-white border border-[#ebebeb] rounded-full text-[14px] text-[#000000] placeholder-[#787574] focus:outline-none`;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-normal tracking-[-0.05em] text-[#000000]">Products</h1>
          <p className="text-[#787574] text-[14px] mt-1">Manage your product inventory</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#000000] hover:opacity-90 text-white text-[14px] font-normal rounded-full transition-opacity cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787574]" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagination((prev) => prev ? { ...prev, currentPage: 1 } : null);
          }}
          className="w-full pl-11 pr-4 py-3 bg-white border border-[#ebebeb] rounded-full text-[14px] text-[#000000] placeholder-[#787574] focus:outline-none shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px]"
        />
      </div>

      {/* Table */}
      <div className="bg-white border-none rounded-[28px] overflow-hidden shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-[#000000] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#787574] text-[14px]">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#787574] text-[14px]">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px] text-left">
              <thead className="bg-[#f2f4f5] text-[#787574] uppercase text-[12px]">
                <tr>
                  <th className="px-6 py-4 font-normal">Product</th>
                  <th className="px-6 py-4 font-normal">Category</th>
                  <th className="px-6 py-4 font-normal">Price</th>
                  <th className="px-6 py-4 font-normal">Stock</th>
                  <th className="px-6 py-4 font-normal">Status</th>
                  <th className="px-6 py-4 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebebeb]">
                {products.map((product, idx) => (
                  <tr
                    key={product._id}
                    className="hover:bg-[#f2f4f5]/60 transition-colors animate-table-row"
                    style={{ '--row-delay': `${Math.min(idx * 30, 200)}ms` } as React.CSSProperties}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.images[0] || '/placeholder.png'}
                          alt={product.name}
                          className="w-12 h-12 rounded-[14px] object-cover border border-[#ebebeb]"
                        />
                        <div>
                          <p className="font-normal text-[#000000] line-clamp-1">{product.name}</p>
                          <p className="text-[12px] text-[#787574]">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#787574]">
                      {typeof product.category === 'object' ? product.category.name : '-'}
                    </td>
                    <td className="px-6 py-4 font-normal text-[#000000]">
                      ₹{(product.discountPrice ?? product.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={product.stock > 0 ? 'text-[#000000]' : 'text-red-500'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[12px] font-normal border ${
                        product.isActive
                          ? 'bg-[#000000] text-white border-[#000000]'
                          : 'bg-[#f2f4f5] text-[#525252] border-[#ebebeb]'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f2f4f5] text-[#787574] hover:text-[#000000] transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f2f4f5] text-[#787574] hover:text-red-500 transition-colors cursor-pointer"
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#ebebeb]">
            <p className="text-[12px] text-[#787574]">
              Showing page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination((prev) => prev ? { ...prev, currentPage: Math.max(1, currentPage - 1) } : null)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-full bg-white border border-[#ebebeb] hover:border-[#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[12px] font-normal text-[#787574] px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPagination((prev) => prev ? { ...prev, currentPage: Math.min(totalPages, currentPage + 1) } : null)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-full bg-white border border-[#ebebeb] hover:border-[#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] ${modalClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
            onClick={closeModal}
          />
          <div
            className={`relative bg-white border-none rounded-[28px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[rgba(0,0,0,0.12)_0px_4px_24px_0px] ${modalClosing ? 'animate-modal-out' : 'animate-modal-in'}`}
          >
            <div className="sticky top-0 bg-white border-b border-[#ebebeb] px-6 py-4 flex items-center justify-between rounded-t-[28px]">
              <h2 className="text-xl font-normal tracking-[-0.05em] text-[#000000]">
                {editingProduct ? 'Edit Product' : 'Create Product'}
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f2f4f5] text-[#787574] hover:text-[#000000] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-[12px] text-[#787574] uppercase tracking-wider mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[12px] text-[#787574] uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-[#ebebeb] rounded-[20px] text-[14px] text-[#000000] placeholder-[#787574] focus:outline-none resize-none"
                />
              </div>

              {/* Price & Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-[#787574] uppercase tracking-wider mb-2">Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-[#787574] uppercase tracking-wider mb-2">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    min="0"
                    step="0.01"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Category & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-[#787574] uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    disabled={categoriesLoading}
                    className="w-full px-4 py-3 bg-white border border-[#ebebeb] rounded-full text-[14px] text-[#000000] focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] text-[#787574] uppercase tracking-wider mb-2">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    min="0"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* SKU & Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-[#787574] uppercase tracking-wider mb-2">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-[#787574] uppercase tracking-wider mb-2">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className={inputClass}
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
                  className="w-4 h-4 rounded border-[#ebebeb]"
                />
                <label htmlFor="isActive" className="text-[14px] font-normal text-[#000000]">Active</label>
              </div>

              {/* Images */}
              <div>
                <label className="block text-[12px] text-[#787574] uppercase tracking-wider mb-2">Images</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {existingImages.map((img, idx) => (
                    <div key={`existing-${idx}`} className="relative w-24 h-24 rounded-[20px] overflow-hidden border border-[#ebebeb]">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx, true)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {imagePreviewUrls.map((url, idx) => (
                    <div key={`preview-${idx}`} className="relative w-24 h-24 rounded-[20px] overflow-hidden border border-[#ebebeb]">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {existingImages.length + imageFiles.length < 10 && (
                  <label className="flex items-center justify-center gap-2 w-full py-6 border border-dashed border-[#cccccc] rounded-[20px] cursor-pointer hover:border-[#000000] transition-colors">
                    <Upload className="w-4 h-4 text-[#787574]" />
                    <span className="text-[14px] text-[#787574]">Click to upload images</span>
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
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ebebeb]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-[14px] font-normal text-[#787574] hover:text-[#000000] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#000000] hover:opacity-90 disabled:bg-[#ebebeb] disabled:text-[#666666] disabled:cursor-not-allowed text-white text-[14px] font-normal rounded-full transition-opacity cursor-pointer"
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
