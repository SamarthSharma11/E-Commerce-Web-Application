import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { ProductListSkeleton, CategoryNavSkeleton } from '../components/LoadingSkeleton';
import type { Product, Category, PaginationMeta } from '../types';

// =====================================================
// ProductListPage
// =====================================================
const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const currentPage = Number(searchParams.get('page') || '1');
  const currentLimit = Number(searchParams.get('limit') || '12');
  const currentCategory = searchParams.get('category') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';

  // Fetch categories for sidebar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories?isActive=true');
        setCategories(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', String(currentLimit));
      if (currentCategory) params.set('category', currentCategory);
      if (currentMinPrice) params.set('minPrice', currentMinPrice);
      if (currentMaxPrice) params.set('maxPrice', currentMaxPrice);
      if (currentSearch) params.set('search', currentSearch);
      if (currentSort) params.set('sort', currentSort);
      params.set('isActive', 'true');

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch products';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentLimit, currentCategory, currentMinPrice, currentMaxPrice, currentSearch, currentSort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const totalPages = pagination?.totalPages || 1;
  const hasActiveFilters = currentCategory || currentMinPrice || currentMaxPrice || currentSearch;

  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Categories</h3>
        <div className="space-y-2">
          {categoriesLoading ? (
            <CategoryNavSkeleton />
          ) : (
            categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => updateFilter('category', currentCategory === cat.slug ? '' : cat.slug)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  currentCategory === cat.slug
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-2)]'
                }`}
              >
                {cat.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={currentMinPrice}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
            className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500"
          />
          <span className="text-[var(--color-text-muted)]">-</span>
          <input
            type="number"
            placeholder="Max"
            value={currentMaxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          <X className="w-4 h-4" />
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-['Outfit'] mb-2">Products</h1>
          <p className="text-[var(--color-text-muted)]">Discover our curated collection</p>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search products..."
              value={currentSearch}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm font-medium hover:border-indigo-500/50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <select
              value={currentSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
              <SidebarContent />
            </div>
          </aside>

          {/* Mobile Filters Drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-[var(--color-bg)] border-l border-[var(--color-border)] p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <SidebarContent />
              </div>
            </div>
          )}

          {/* Product Grid */}
          <main className="flex-1">
            {loading ? (
              <ProductListSkeleton count={currentLimit} />
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                  <X className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
                <p className="text-[var(--color-text-muted)] mb-4">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-[var(--color-text-muted)]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-[var(--color-text-muted)] mb-4">Try adjusting your filters or search terms</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => updateFilter('page', String(Math.max(1, currentPage - 1)))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => updateFilter('page', String(page))}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-indigo-500/50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => updateFilter('page', String(Math.min(totalPages, currentPage + 1)))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
