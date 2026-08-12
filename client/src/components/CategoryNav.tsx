import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CircleDot, Footprints, Shirt, Shield, Flame, Briefcase, Tag
} from 'lucide-react';
import api from '../api/axios';
import type { Category } from '../types';
import { FALLBACK_CATEGORIES } from '../data/mockProducts';

// Helper to assign small native-color icons per category
const getCategoryIconDetails = (slugOrName: string) => {
  const str = slugOrName.toLowerCase();
  if (str.includes('ball')) {
    return { Icon: CircleDot, iconColor: 'text-[#16a34a]' }; // Green
  } else if (str.includes('boot') || str.includes('shoe')) {
    return { Icon: Footprints, iconColor: 'text-[#b45309]' }; // Brown/Amber
  } else if (str.includes('jersey') || str.includes('apparel')) {
    return { Icon: Shirt, iconColor: 'text-[#2563eb]' }; // Blue
  } else if (str.includes('shin') || str.includes('protection') || str.includes('gk')) {
    return { Icon: Shield, iconColor: 'text-[#9333ea]' }; // Purple
  } else if (str.includes('train')) {
    return { Icon: Flame, iconColor: 'text-[#ea580c]' }; // Orange
  } else if (str.includes('bag') || str.includes('accessory')) {
    return { Icon: Briefcase, iconColor: 'text-[#0d9488]' }; // Teal
  }
  return { Icon: Tag, iconColor: 'text-[#787574]' };
};

// =====================================================
// CategoryNav Component — Row of Pill Chips
// =====================================================
const CategoryNav: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories?isActive=true');
        if (response.data?.data?.length > 0) {
          setCategories(response.data.data);
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }
      } catch (error) {
        console.warn('Backend categories unavailable, using fallback categories:', error);
        setCategories(FALLBACK_CATEGORIES);
      }
    };
    fetchCategories();
  }, []);

  return (
    <nav className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center justify-center gap-2.5 min-w-max mx-auto px-4">
        {/* All Products Pill */}
        <Link
          to="/products"
          className={`rounded-full bg-white border border-[#ebebeb] shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px] py-[6px] pl-[6px] pr-[16px] inline-flex items-center gap-2 flex-shrink-0 cursor-pointer hover:bg-[#f2f4f5] transition-colors ${
            !currentCategory ? 'ring-1 ring-[#000000] bg-[#f2f4f5]' : ''
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-[#000000] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <span className="text-[16px] font-normal text-[#000000] tracking-[-0.031em]">
            All
          </span>
        </Link>

        {/* Category Pill Chips */}
        {categories.map((category) => {
          const { Icon, iconColor } = getCategoryIconDetails(category.slug || category.name);
          const isActive = currentCategory === category.slug;

          return (
            <Link
              key={category._id}
              to={`/products?category=${category.slug}`}
              className={`rounded-full bg-white border border-[#ebebeb] shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px] py-[6px] pl-[6px] pr-[16px] inline-flex items-center gap-2 flex-shrink-0 cursor-pointer hover:bg-[#f2f4f5] transition-colors ${
                isActive ? 'ring-1 ring-[#5433eb] bg-[#f2f4f5]' : ''
              }`}
            >
              <div className="w-4 h-4 rounded-full flex items-center justify-center">
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              <span className="text-[16px] font-normal text-[#000000] tracking-[-0.031em]">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default CategoryNav;
