import React from 'react';

// =====================================================
// Loading Skeleton Components
// =====================================================

export const ProductCardSkeleton = () => (
  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden animate-pulse">
    <div className="w-full aspect-square bg-[var(--color-surface-2)]" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-[var(--color-surface-2)] rounded-lg w-3/4" />
      <div className="h-4 bg-[var(--color-surface-2)] rounded-lg w-1/2" />
      <div className="h-6 bg-[var(--color-surface-2)] rounded-lg w-1/3" />
    </div>
  </div>
);

export const ProductListSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const CategoryNavSkeleton = () => (
  <div className="hidden md:flex items-center gap-6 animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-4 bg-[var(--color-surface-2)] rounded w-20" />
    ))}
  </div>
);

export const ReviewSkeleton = () => (
  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-3 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)]" />
      <div className="space-y-2">
        <div className="h-4 bg-[var(--color-surface-2)] rounded w-32" />
        <div className="h-3 bg-[var(--color-surface-2)] rounded w-20" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-[var(--color-surface-2)] rounded w-full" />
      <div className="h-3 bg-[var(--color-surface-2)] rounded w-5/6" />
    </div>
  </div>
);
