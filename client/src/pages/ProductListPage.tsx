import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Leaf, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import ProductImageTile from '../components/ProductImageTile';
import { ProductListSkeleton, CategoryNavSkeleton } from '../components/LoadingSkeleton';
import type { Product, Category, PaginationMeta } from '../types';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '../data/mockProducts';

// =====================================================
// ProductListPage — White-Canvas Floating Product Constellation
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

  // Fetch categories with fallback
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories?isActive=true');
        if (response.data?.data?.length > 0) {
          setCategories(response.data.data);
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }
      } catch (err) {
        console.warn('Backend unavailable, using fallback categories:', err);
        setCategories(FALLBACK_CATEGORIES);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products with fallback
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
      if (response.data?.data?.length > 0) {
        setProducts(response.data.data);
        setPagination(response.data.pagination || null);
      } else {
        applyFallbackProducts();
      }
    } catch (err: unknown) {
      console.warn('Backend API unavailable, using fallback products:', err);
      applyFallbackProducts();
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentLimit, currentCategory, currentMinPrice, currentMaxPrice, currentSearch, currentSort]);

  const applyFallbackProducts = () => {
    let filtered = [...FALLBACK_PRODUCTS];

    if (currentCategory) {
      filtered = filtered.filter(
        (p) =>
          (typeof p.category === 'object' && p.category?.slug === currentCategory) ||
          p.category === currentCategory
      );
    }

    if (currentSearch) {
      const query = currentSearch.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    if (currentMinPrice) {
      const min = Number(currentMinPrice);
      filtered = filtered.filter((p) => (p.discountPrice ?? p.price) >= min);
    }

    if (currentMaxPrice) {
      const max = Number(currentMaxPrice);
      filtered = filtered.filter((p) => (p.discountPrice ?? p.price) <= max);
    }

    if (currentSort === 'price_asc') {
      filtered.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
    } else if (currentSort === 'price_desc') {
      filtered.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
    } else if (currentSort === 'rating') {
      filtered.sort((a, b) => b.ratingsAverage - a.ratingsAverage);
    }

    setProducts(filtered);
    setPagination({
      currentPage: 1,
      limit: 12,
      totalCount: filtered.length,
      totalPages: 1,
    });
    setError(null);
  };

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Only reset to page 1 when changing a filter — NOT when changing the page itself
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => { setSearchParams({}); };

  const totalPages = pagination?.totalPages || 1;
  const hasActiveFilters = currentCategory || currentMinPrice || currentMaxPrice || currentSearch;

  /* Category Tiles Data for "Shop by Category" Tile Grid */
  const categoryTiles = [
    { title: 'Match Balls & Footballs', image: '/products/ball-pro-match.png', slug: 'match-balls-footballs' },
    { title: 'Football Boots & Shoes', image: '/products/football-boots-beginner.jpg', slug: 'football-boots-shoes' },
    { title: 'Jerseys & Performance Apparel', image: '/products/training-jacket.jpg', slug: 'jerseys-apparel' },
    { title: 'Goalkeeper Gear & Protection', image: '/products/goalkeeper-gloves-training.jpg', slug: 'shin-guards-gk-gear' },
  ];

  /* ── Sidebar ── */
  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-[12px] font-normal text-[#000000] mb-3 uppercase tracking-wider flex items-center gap-1.5">
          <Leaf className="w-3.5 h-3.5 text-[#5433eb]" />
          Categories
        </h3>
        <div className="space-y-1">
          {categoriesLoading ? (
            <CategoryNavSkeleton />
          ) : (
            <>
              <button
                onClick={() => updateFilter('category', '')}
                className={`block w-full text-left px-3 py-2 rounded-[12px] text-[14px] transition-all cursor-pointer ${
                  !currentCategory
                    ? 'bg-[#f2f4f5] text-[#000000] font-normal'
                    : 'text-[#787574] hover:text-[#000000] hover:bg-[#f2f4f5]'
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => updateFilter('category', currentCategory === cat.slug ? '' : cat.slug)}
                  className={`block w-full text-left px-3 py-2 rounded-[12px] text-[14px] transition-all cursor-pointer ${
                    currentCategory === cat.slug
                      ? 'bg-[#f2f4f5] text-[#000000] font-normal'
                      : 'text-[#787574] hover:text-[#000000] hover:bg-[#f2f4f5]'
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
        <h3 className="text-[12px] font-normal text-[#000000] mb-3 uppercase tracking-wider">Price Range (₹)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={currentMinPrice}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#ebebeb] rounded-full text-[14px] text-[#000000] placeholder-[#787574] focus:outline-none"
          />
          <span className="text-[#787574] font-normal">–</span>
          <input
            type="number"
            placeholder="Max"
            value={currentMaxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#ebebeb] rounded-full text-[14px] text-[#000000] placeholder-[#787574] focus:outline-none"
          />
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 text-[14px] text-red-500 hover:text-red-600 transition-colors font-normal cursor-pointer"
        >
          <X className="w-4 h-4" />
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full animate-fade-in py-2">

        {/* ── Hero Showcase: Floating Product Constellation ── */}
        <section className="relative py-8 md:py-12 mb-8 flex flex-col items-center text-center">
          
          {/* Floating Product Cards Constellation */}
          <div className="w-full flex items-center justify-center gap-4 md:gap-6 mb-8 overflow-x-auto pb-4 pt-2 no-scrollbar px-2">
            
            {/* Floating Card 1 */}
            <div className="w-44 md:w-52 bg-white rounded-[28px] shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px] p-0 overflow-hidden flex-shrink-0 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="p-2">
                <img
                  src="/products/ball-pro-match.png"
                  alt="GoalKart Pro Match"
                  className="w-full aspect-square object-cover rounded-[20px]"
                />
              </div>
              <div className="px-3 pb-3 text-left">
                <h4 className="text-[14px] font-normal text-[#000000] tracking-[-0.014em] truncate">GoalKart Pro Match</h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-yellow-400 text-[10px]">★★★★★</span>
                  <span className="text-[9px] text-[#787574] tracking-[-0.058em]">4.9 (245)</span>
                </div>
              </div>
            </div>

            {/* Floating Card 2 (Center Hero Spotlight Tile) */}
            <div className="w-48 md:w-56 bg-white rounded-[28px] shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px] p-0 overflow-hidden flex-shrink-0 transform -translate-y-2 hover:translate-y-0 transition-transform duration-300">
              <div className="p-2">
                <img
                  src="/products/football-boots-beginner.jpg"
                  alt="Firm Ground Boots"
                  className="w-full aspect-square object-cover rounded-[20px]"
                />
              </div>
              <div className="px-3 pb-3 text-left">
                <h4 className="text-[14px] font-normal text-[#000000] tracking-[-0.014em] truncate">Firm Ground Boots</h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-yellow-400 text-[10px]">★★★★★</span>
                  <span className="text-[9px] text-[#787574] tracking-[-0.058em]">4.8 (180)</span>
                </div>
              </div>
            </div>

            {/* Floating Card 3 */}
            <div className="w-44 md:w-52 bg-white rounded-[28px] shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px] p-0 overflow-hidden flex-shrink-0 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="p-2">
                <img
                  src="/products/training-jacket.jpg"
                  alt="Pro Training Jacket"
                  className="w-full aspect-square object-cover rounded-[20px]"
                />
              </div>
              <div className="px-3 pb-3 text-left">
                <h4 className="text-[14px] font-normal text-[#000000] tracking-[-0.014em] truncate">Pro Training Jacket</h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-yellow-400 text-[10px]">★★★★★</span>
                  <span className="text-[9px] text-[#787574] tracking-[-0.058em]">4.7 (96)</span>
                </div>
              </div>
            </div>

          </div>

          {/* Centered Wordmark with Single Violet Dot Accent */}
          <h1 className="text-4xl md:text-6xl font-normal tracking-[-0.05em] text-[#000000] flex items-center justify-center gap-1.5 mb-6">
            goalkart
            <span className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-[#5433eb] inline-block" />
          </h1>

          {/* Search Bar with Circular Violet Submit Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateFilter('search', currentSearch);
            }}
            className="w-full max-w-2xl bg-white rounded-full border border-[#000000]/10 shadow-sm flex items-center py-1 pl-6 pr-1 mb-8 transition-all hover:border-[#000000]/20"
          >
            <input
              type="text"
              placeholder="What are you looking for today?"
              value={currentSearch}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="flex-1 bg-transparent text-[16px] tracking-[-0.031em] text-[#000000] placeholder-[#787574] focus:outline-none border-none p-0"
            />
            <button
              type="submit"
              className="w-12 h-12 rounded-full bg-[#5433eb] text-white flex items-center justify-center flex-shrink-0 shadow-[rgba(69,36,219,0.34)_0px_4px_24px_0px] hover:opacity-95 transition-opacity cursor-pointer"
              aria-label="Search"
            >
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </form>

          {/* Centered Category Pills Row */}
          <div className="flex items-center justify-center flex-wrap gap-2.5 max-w-3xl mx-auto">
            <button
              onClick={() => updateFilter('category', '')}
              className={`rounded-full bg-white border border-[#ebebeb] shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px] px-4 py-2 flex items-center gap-2 text-[14px] text-[#000000] tracking-[-0.031em] cursor-pointer hover:bg-[#f2f4f5] transition-colors ${
                !currentCategory ? 'ring-1 ring-[#000000] bg-[#f2f4f5]' : ''
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#000000]" />
              All Products
            </button>
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat._id}
                onClick={() => updateFilter('category', currentCategory === cat.slug ? '' : cat.slug)}
                className={`rounded-full bg-white border border-[#ebebeb] shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px] px-4 py-2 flex items-center gap-2 text-[14px] text-[#000000] tracking-[-0.031em] cursor-pointer hover:bg-[#f2f4f5] transition-colors ${
                  currentCategory === cat.slug ? 'ring-1 ring-[#5433eb] bg-[#f2f4f5]' : ''
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#787574]" />
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* ── Shop by Category Section (ProductImageTile Grid) ── */}
        {!currentSearch && !currentCategory && (
          <section className="mb-12">
            <SectionHeading title="Shop by Category" to="/products" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categoryTiles.map((tile) => (
                <ProductImageTile
                  key={tile.slug}
                  title={tile.title}
                  imageUrl={tile.image}
                  to={`/products?category=${tile.slug}`}
                  aspectRatio="square"
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Sort & Controls Bar ── */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <SectionHeading title={currentCategory ? currentCategory : "All Gear"} />
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-[#ebebeb] rounded-full text-[14px] transition-all cursor-pointer ${
                showFilters ? 'bg-[#f2f4f5] text-[#000000]' : 'text-[#787574]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <select
              value={currentSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="px-4 py-2 bg-white border border-[#ebebeb] rounded-full text-[14px] text-[#000000] focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* ── Layout: Sidebar + Product Cards Grid ── */}
        <div className="flex gap-8">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-8 bg-white border-none rounded-[28px] p-6 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">
              <SidebarContent />
            </div>
          </aside>

          {/* Mobile Filters Drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[16px] font-normal">Filters</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-[#f2f4f5] rounded-full text-[#787574] transition-colors cursor-pointer"
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
                <div className="w-16 h-16 rounded-full bg-[#f2f4f5] flex items-center justify-center mb-4">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-[16px] font-normal mb-2">Something went wrong</h3>
                <p className="text-[#787574] mb-6 text-[14px]">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="btn btn-primary px-6 py-2.5 text-[14px]"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-white border border-[#ebebeb] flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-[#787574]" />
                </div>
                <h3 className="text-[16px] font-normal mb-2">No products found</h3>
                <p className="text-[#787574] mb-6 text-[14px]">Try adjusting your search or category filters</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="btn btn-primary px-6 py-2.5 text-[14px]"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product, idx) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      staggerDelay={Math.min(idx * 50, 300)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => updateFilter('page', String(Math.max(1, currentPage - 1)))}
                      disabled={currentPage === 1}
                      className="p-2.5 rounded-full bg-white border border-[#ebebeb] hover:bg-[#f2f4f5] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px] cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => updateFilter('page', String(page))}
                        className={`w-10 h-10 rounded-full text-[14px] font-normal transition-all cursor-pointer ${
                          currentPage === page
                            ? 'bg-[#000000] text-white shadow-sm'
                            : 'bg-white border border-[#ebebeb] hover:bg-[#f2f4f5] text-[#787574]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => updateFilter('page', String(Math.min(totalPages, currentPage + 1)))}
                      disabled={currentPage === totalPages}
                      className="p-2.5 rounded-full bg-white border border-[#ebebeb] hover:bg-[#f2f4f5] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px] cursor-pointer"
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
  );
};

export default ProductListPage;
