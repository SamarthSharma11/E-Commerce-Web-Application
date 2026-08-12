import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface ProductImageTileProps {
  title: string;
  imageUrl: string;
  to: string;
  aspectRatio?: 'square' | 'tall' | 'wide';
  className?: string;
}

export const ProductImageTile: React.FC<ProductImageTileProps> = ({
  title,
  imageUrl,
  to,
  aspectRatio = 'square',
  className = '',
}) => {
  let aspectClass = 'aspect-square';
  if (aspectRatio === 'tall') aspectClass = 'aspect-[3/4]';
  if (aspectRatio === 'wide') aspectClass = 'aspect-[16/9]';

  return (
    <Link
      to={to}
      className={`relative group block overflow-hidden rounded-none w-full ${aspectClass} cursor-pointer ${className}`}
    >
      {/* Full-bleed edge-to-edge image (0px card radius — image defines shape) */}
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      {/* Semi-transparent white label chip at bottom-left */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md rounded-[12px] p-[12px] shadow-md flex items-center gap-2 group-hover:bg-white transition-colors max-w-[85%]">
        <span className="text-[14px] font-normal text-[#000000] tracking-[-0.014em] truncate">
          {title}
        </span>
        <ChevronRight className="w-4 h-4 text-[#000000] flex-shrink-0 stroke-[2.5]" />
      </div>
    </Link>
  );
};

export default ProductImageTile;
