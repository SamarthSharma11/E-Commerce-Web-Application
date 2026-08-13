import React from 'react';

// =====================================================
// Loading Skeleton Components
// =====================================================

export const ProductCardSkeleton = () => (
  <div className="bg-white border-none rounded-[28px] p-2 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px] animate-pulse flex flex-col">
    <div className="w-full aspect-square bg-[#f2f4f5] rounded-[20px]" />
    <div className="p-4 pt-3 space-y-2.5">
      <div className="h-4 bg-[#f2f4f5] rounded-full w-3/4" />
      <div className="h-3 bg-[#f2f4f5] rounded-full w-1/2" />
      <div className="h-5 bg-[#f2f4f5] rounded-full w-1/3 mt-2" />
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
  <div className="flex items-center gap-3 overflow-x-auto py-2 animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-9 bg-[#f2f4f5] border border-[#ebebeb] rounded-full w-28 flex-shrink-0" />
    ))}
  </div>
);

export const ReviewSkeleton = () => (
  <div className="bg-white border-none rounded-[28px] p-6 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px] space-y-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#f2f4f5]" />
      <div className="space-y-2">
        <div className="h-4 bg-[#f2f4f5] rounded-full w-32" />
        <div className="h-3 bg-[#f2f4f5] rounded-full w-20" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-[#f2f4f5] rounded-full w-full" />
      <div className="h-3 bg-[#f2f4f5] rounded-full w-5/6" />
    </div>
  </div>
);
