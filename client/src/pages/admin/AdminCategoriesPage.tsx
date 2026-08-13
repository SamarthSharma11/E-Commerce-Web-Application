import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import type { Category, PaginationMeta } from '../../types';

// =====================================================
// Admin Categories Page — White Canvas
// =====================================================
const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    parentCategory: '',
    isActive: true,
  });

  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', '10');
      if (search) params.set('search', search);

      const response = await api.get(`/categories?${params.toString()}`);
      setCategories(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

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
  }, [fetchCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      parentCategory: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      parentCategory: category.parentCategory && typeof category.parentCategory === 'object' ? category.parentCategory._id : (category.parentCategory as string || ''),
      isActive: category.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        image: formData.image || undefined,
        parentCategory: formData.parentCategory || null,
        isActive: formData.isActive,
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, payload);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', payload);
        toast.success('Category created successfully');
      }

      setShowModal(false);
      fetchCategories();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Operation failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This may affect products linked to it.')) return;

    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to delete category';
      toast.error(message);
    }
  };

  const inputClass = `w-full px-4 py-3 bg-white border border-[#ebebeb] rounded-full text-[14px] text-[#000000] placeholder-[#787574] focus:outline-none`;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-normal tracking-[-0.05em] text-[#000000]">Categories</h1>
          <p className="text-[#787574] text-[14px] mt-1">Manage product categories</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#000000] hover:opacity-90 text-white text-[14px] font-normal rounded-full transition-opacity cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787574]" />
        <input
          type="text"
          placeholder="Search categories..."
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
            <p className="text-[#787574] text-[14px]">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#787574] text-[14px]">No categories found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px] text-left">
              <thead className="bg-[#f2f4f5] text-[#787574] uppercase text-[12px]">
                <tr>
                  <th className="px-6 py-4 font-normal">Category</th>
                  <th className="px-6 py-4 font-normal">Slug</th>
                  <th className="px-6 py-4 font-normal">Parent</th>
                  <th className="px-6 py-4 font-normal">Status</th>
                  <th className="px-6 py-4 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebebeb]">
                {categories.map((category, idx) => (
                  <tr
                    key={category._id}
                    className="hover:bg-[#f2f4f5]/60 transition-colors animate-table-row"
                    style={{ '--row-delay': `${Math.min(idx * 30, 200)}ms` } as React.CSSProperties}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {category.image && (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-10 h-10 rounded-[14px] object-cover border border-[#ebebeb]"
                          />
                        )}
                        <div>
                          <p className="font-normal text-[#000000]">{category.name}</p>
                          <p className="text-[12px] text-[#787574] line-clamp-1">{category.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#787574] font-mono text-[12px]">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 text-[#787574]">
                      {category.parentCategory && typeof category.parentCategory === 'object'
                        ? category.parentCategory.name
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[12px] font-normal border ${
                        category.isActive
                          ? 'bg-[#000000] text-white border-[#000000]'
                          : 'bg-[#f2f4f5] text-[#525252] border-[#ebebeb]'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f2f4f5] text-[#787574] hover:text-[#000000] transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
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
            className={`relative bg-white border-none rounded-[28px] w-full max-w-lg shadow-[rgba(0,0,0,0.12)_0px_4px_24px_0px] ${modalClosing ? 'animate-modal-out' : 'animate-modal-in'}`}
          >
            <div className="border-b border-[#ebebeb] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-normal tracking-[-0.05em] text-[#000000]">
                {editingCategory ? 'Edit Category' : 'Create Category'}
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
                <label className="block text-[12px] text-[#787574] uppercase tracking-wider mb-2">Category Name</label>
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
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-[#ebebeb] rounded-[20px] text-[14px] text-[#000000] placeholder-[#787574] focus:outline-none resize-none"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-[12px] text-[#787574] uppercase tracking-wider mb-2">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className={inputClass}
                />
              </div>

              {/* Parent Category */}
              <div>
                <label className="block text-[12px] text-[#787574] uppercase tracking-wider mb-2">Parent Category</label>
                <select
                  value={formData.parentCategory}
                  onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-[#ebebeb] rounded-full text-[14px] text-[#000000] focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="">None (Root Category)</option>
                  {categories
                    .filter((cat) => cat._id !== editingCategory?._id)
                    .map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                </select>
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
                  {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
