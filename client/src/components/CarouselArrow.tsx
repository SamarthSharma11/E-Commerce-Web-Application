import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export interface CarouselArrowProps {
  direction?: 'right' | 'left';
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

export const CarouselArrow: React.FC<CarouselArrowProps> = ({
  direction = 'right',
  onClick,
  className = '',
  ariaLabel = 'Scroll product rail',
}) => {
  const Icon = direction === 'right' ? ChevronRight : ChevronLeft;

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`w-8 h-8 rounded-full bg-white shadow-[rgba(0,0,0,0.12)_0px_4px_24px_0px] flex items-center justify-center text-[#000000] hover:bg-[#f2f4f5] transition-all cursor-pointer border-none ${className}`}
    >
      <Icon className="w-4 h-4 text-[#000000] stroke-[2.5]" />
    </button>
  );
};

export default CarouselArrow;
