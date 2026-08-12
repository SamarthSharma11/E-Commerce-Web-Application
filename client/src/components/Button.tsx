import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'search-submit';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'btn inline-flex items-center justify-center font-normal transition-all rounded-full cursor-pointer focus:outline-none';

  let variantClasses = '';
  switch (variant) {
    case 'primary':
      // Black fill, white text (for Add to Cart, primary actions)
      variantClasses = 'bg-[#000000] text-white border-none hover:opacity-90';
      break;
    case 'secondary':
      // White fill, black text with pill shadow
      variantClasses = 'bg-white text-black border-none shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px] hover:bg-[#f2f4f5]';
      break;
    case 'ghost':
      // Cookie/pill style: white fill with hairline #ebebeb border
      variantClasses = 'bg-white text-black border border-[#ebebeb] shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px] hover:bg-[#f2f4f5]';
      break;
    case 'search-submit':
      // THE SINGLE violet accent button in the app (search submit button only)
      variantClasses = 'bg-[#5433eb] text-white border-none shadow-[rgba(69,36,219,0.34)_0px_4px_24px_0px] hover:opacity-95';
      break;
  }

  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'px-4 py-1.5 text-[12px] tracking-[-0.017em]';
      break;
    case 'md':
      sizeClasses = 'px-6 py-2.5 text-[14px] tracking-[-0.031em]';
      break;
    case 'lg':
      sizeClasses = 'px-8 py-3.5 text-[16px] tracking-[-0.031em]';
      break;
    case 'icon':
      sizeClasses = 'w-12 h-12 p-0 flex items-center justify-center';
      break;
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
