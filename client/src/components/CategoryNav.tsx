import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Grid3x3 } from 'lucide-react';
import api from '../api/axios';
import type { Category } from '../types';

// =====================================================
// CategoryNav Component — Mega Menu / Dropdown
// =====================================================
const CategoryNav: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories?isActive=true');
        setCategories(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <nav
      className="hidden lg:flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Categories Trigger */}
      <button
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-white transition-colors rounded-xl hover:bg-[var(--color-surface-2)]"
        aria-expanded={isOpen}
      >
        <Grid3x3 className="w-4 h-4" />
        <span>Categories</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-2xl z-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)] py-4">No categories available</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {categories.map((category) => (
                  <Link
                    key={category._id}
                    to={`/products?category=${category.slug}`}
                    className="group flex flex-col items-center p-4 rounded-xl hover:bg-[var(--color-surface-2)] transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    {category.image && (
                      <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-[var(--color-border)] group-hover:border-indigo-500/50 transition-colors">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <span className="text-sm font-medium text-center text-[var(--color-text)] group-hover:text-indigo-400 transition-colors">
                      {category.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default CategoryNav;
