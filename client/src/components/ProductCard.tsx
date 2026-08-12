import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag } from 'lucide-react';
import type { Product } from '../types';
import { useCartStore } from '../store/cartStore';

// =====================================================
// ProductCard Component — White-Canvas Floating Product Card
// =====================================================
interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product, 1);
  };

  const effectivePrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group bg-white rounded-[28px] border-none shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px] hover:shadow-[rgba(0,0,0,0.14)_0px_8px_16px_-2px] transition-shadow duration-200 flex flex-col p-2.5 overflow-hidden"
    >
      {/* 1:1 Image Area with 20px inner radius creating ~8px white frame */}
      <div className="relative w-full aspect-square rounded-[20px] overflow-hidden bg-[#f2f4f5] flex-shrink-0">
        <img
          src={product.images[0] || '/placeholder.png'}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2.5 right-2.5">
            <span className="block px-2.5 py-0.5 bg-[#000000] text-white text-[10px] font-normal rounded-full">
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Stock Badge */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-[#787574] text-[12px] font-normal tracking-[-0.017em]">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content Text Block (12-16px gap below image) */}
      <div className="pt-3.5 px-1.5 pb-1 flex flex-col flex-1 gap-1.5 text-left">
        <div>
          {product.brand && (
            <span className="block text-[11px] text-[#787574] tracking-[-0.058em] uppercase mb-0.5">
              {product.brand}
            </span>
          )}
          <h3 className="text-[14px] font-normal text-[#000000] tracking-[-0.014em] line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Star Rating Row */}
        <div className="flex items-center gap-1 mt-0.5">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
          <span className="text-[11px] text-[#787574] tracking-[-0.017em]">
            {product.ratingsAverage.toFixed(1)} ({product.ratingsCount})
          </span>
        </div>

        {/* Price & Add Action */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <div>
            <span className="text-[16px] font-normal text-[#000000] tracking-[-0.031em]">
              ₹{effectivePrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="ml-1.5 text-[12px] text-[#787574] line-through">
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="rounded-full bg-[#000000] text-white hover:opacity-90 disabled:bg-[#cccccc] disabled:text-[#787574] disabled:cursor-not-allowed px-3.5 py-1.5 text-[12px] font-normal tracking-[-0.017em] flex items-center gap-1.5 transition-opacity cursor-pointer"
            aria-label="Add to Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
