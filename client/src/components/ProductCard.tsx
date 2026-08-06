import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Trophy } from 'lucide-react';
import type { Product } from '../types';
import { useCartStore } from '../store/cartStore';

// =====================================================
// ProductCard Component
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
      className="group bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] overflow-hidden hover:-translate-y-1.5 hover:shadow-[var(--shadow-glow)] hover:border-[var(--color-primary)]/30 transition-all duration-300 flex flex-col shadow-[var(--shadow-xs)]"
    >
      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden bg-[var(--color-surface-2)]">
        <img
          src={product.images[0] || '/placeholder.png'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Sale Badge */}
        {hasDiscount && (
          <div className="absolute top-3 right-3">
            <span className="block px-3 py-1 bg-[var(--color-secondary)] text-white text-xs font-bold rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Stock Badge */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-[var(--color-text-muted)] font-semibold text-sm">Out of Stock</span>
          </div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute top-3 left-3">
            <span className="block px-2.5 py-1 bg-[var(--color-warning)] text-white text-xs font-bold rounded-full shadow-sm">
              Low Stock
            </span>
          </div>
        )}
        {product.stock > 5 && (
          <div className="absolute top-3 left-3">
            <span className="block px-2.5 py-1 bg-[var(--color-success)] text-white text-xs font-bold rounded-full shadow-sm">
              In Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-sm text-[var(--color-text)] line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors leading-snug">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
          <span className="text-xs text-[var(--color-text-muted)]">
            {product.ratingsAverage.toFixed(1)} ({product.ratingsCount})
          </span>
          {product.ratingsAverage >= 4.5 && (
            <Trophy className="w-3.5 h-3.5 text-[var(--color-secondary)] fill-[var(--color-secondary)]" />
          )}
        </div>

        {/* Price */}
        <div className="flex items-end gap-2 mt-auto pt-1">
          <span className="text-xl font-bold font-['Outfit'] text-[var(--color-text)]">
            ₹{effectivePrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-xs text-[var(--color-text-muted)] line-through mb-0.5">
              ₹{product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="mt-2 w-full py-2.5 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:bg-[var(--color-surface-2)] disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)]"
        >
          <ShoppingCart className="w-4 h-4" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
