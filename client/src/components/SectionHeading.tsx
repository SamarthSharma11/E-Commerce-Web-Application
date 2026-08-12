import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface SectionHeadingProps {
  title: string;
  to?: string;
  className?: string;
  onClick?: () => void;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  to,
  className = '',
  onClick,
}) => {
  const content = (
    <h2 className="text-[20px] font-normal text-[#000000] tracking-[-0.05em] inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity">
      <span>{title}</span>
      <ChevronRight className="w-4 h-4 text-[#000000] stroke-[2.5]" />
    </h2>
  );

  return (
    <div className={`mb-6 text-left ${className}`}>
      {to ? (
        <Link to={to} onClick={onClick} className="inline-block">
          {content}
        </Link>
      ) : onClick ? (
        <button onClick={onClick} className="inline-block bg-transparent border-none p-0 cursor-pointer text-left">
          {content}
        </button>
      ) : (
        content
      )}
    </div>
  );
};

export default SectionHeading;
