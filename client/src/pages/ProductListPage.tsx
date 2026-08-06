import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Leaf } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import PitchDivider from '../components/PitchDivider';
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

  const currentPage     = Number(searchParams.get('page') || '1');
  const currentLimit    = Number(searchParams.get('limit') || '12');
  const currentCategory = searchParams.get('category') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSearch   = searchParams.get('search') || '';
  const currentSort     = searchParams.get('sort') || 'newest';

  // Fetch categories
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

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

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

  const clearFilters = () => { setSearchParams({}); };

  const totalPages = pagination?.totalPages || 1;
  const hasActiveFilters = currentCategory || currentMinPrice || currentMaxPrice || currentSearch;

  /* ── Sidebar ── */
  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-bold text-[var(--color-text)] mb-3 uppercase tracking-wider flex items-center gap-1.5">
          <Leaf className="w-3.5 h-3.5 text-[var(--color-primary)]" />
          Categories
        </h3>
        <div className="space-y-1">
          {categoriesLoading ? (
            <CategoryNavSkeleton />
          ) : (
            <>
              <button
                onClick={() => updateFilter('category', '')}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  !currentCategory
                    ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-semibold border border-[var(--color-primary)]/20'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)]'
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => updateFilter('category', currentCategory === cat.slug ? '' : cat.slug)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    currentCategory === cat.slug
                      ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-semibold border border-[var(--color-primary)]/20'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-xs font-bold text-[var(--color-text)] mb-3 uppercase tracking-wider">Price Range (₹)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={currentMinPrice}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
            className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder-[var(--color-text-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
          <span className="text-[var(--color-text-muted)] font-medium">–</span>
          <input
            type="number"
            placeholder="Max"
            value={currentMaxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder-[var(--color-text-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors font-medium"
        >
          <X className="w-4 h-4" />
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-7xl mx-auto px-4 md:px-[var(--space-6)] py-8">

        {/* ── Hero Banner ── */}
        <section className="hero rounded-2xl px-8 py-14 md:px-12 md:py-20 mb-10 flex flex-col items-center text-center shadow-[var(--shadow-lg)] overflow-hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-xs font-semibold text-white mb-4 backdrop-blur-sm">
            ⚽ Football Equipment
          </div>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight text-white mb-4 leading-tight">
            Gear Up. Play Harder.
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
            Premium sports gear for athletes who refuse to settle. Shop the latest collections.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[var(--color-primary-dark)] font-bold text-sm rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md"
          >
            Shop Now →
          </Link>
        </section>

        {/* Divider */}
        <hr className="chalk-line mb-8" />
        <PitchDivider className="mb-8" />

        {/* ── Search & Sort Bar ── */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search football products..."
              value={currentSearch}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder-[var(--color-text-light)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 transition-all shadow-[var(--shadow-xs)]"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`lg:hidden flex items-center gap-2 px-4 py-3 bg-[var(--color-surface)] border rounded-xl text-sm font-medium transition-all shadow-[var(--shadow-xs)] ${
                showFilters
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-subtle)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <select
              value={currentSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer shadow-[var(--shadow-xs)] hover:border-[var(--color-primary)]/50 transition-all"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* ── Results count ── */}
        {!loading && !error && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[var(--color-text-muted)]">
              {pagination?.totalCount ?? pagination?.total ?? products.length} product{(pagination?.totalCount ?? pagination?.total ?? products.length) !== 1 ? 's' : ''} found
              {currentCategory && <span className="ml-1">in <span className="font-medium text-[var(--color-primary)]">{currentCategory}</span></span>}
            </p>
          </div>
        )}

        {/* ── Layout: Sidebar + Grid ── */}
        <div className="flex gap-8">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-24 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-5 shadow-[var(--shadow-sm)]">
              <SidebarContent />
            </div>
          </aside>

          {/* Mobile Filters Drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-[var(--color-surface)] border-l border-[var(--color-border)] p-6 overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-bold">Filters</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg text-[var(--color-text-muted)] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <SidebarContent />
              </div>
            </div>
          )}

          {/* ── Product Grid ── */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <ProductListSkeleton count={currentLimit} />
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                  <X className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
                <p className="text-[var(--color-text-muted)] mb-6 text-sm">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="px-6 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-semibold rounded-xl transition-all shadow-[var(--shadow-sm)]"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-[var(--color-text-muted)]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-[var(--color-text-muted)] mb-6 text-sm">Try adjusting your filters or search terms</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-semibold rounded-xl transition-all shadow-[var(--shadow-sm)]"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => updateFilter('page', String(Math.max(1, currentPage - 1)))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary-subtle)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[var(--shadow-xs)]"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => updateFilter('page', String(page))}
                        className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                          currentPage === page
                            ? 'bg-[var(--color-primary)] text-white shadow-[var(--shadow-sm)]'
                            : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary-subtle)] text-[var(--color-text-muted)]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => updateFilter('page', String(Math.min(totalPages, currentPage + 1)))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary-subtle)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[var(--shadow-xs)]"
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
