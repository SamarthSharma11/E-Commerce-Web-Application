import React from 'react';

interface GoalKartLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  variant?: 'light' | 'dark'; // light background vs dark background
}

export const GoalKartLogo: React.FC<GoalKartLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  variant = 'light',
}) => {
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const taglineSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-[11px]' : 'text-[10px]';

  const wordmarkColor = variant === 'dark' ? 'text-white' : 'text-[var(--color-ink-black,#000000)]';

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Wordmark with single Violet Accent Dot */}
      <div className="flex flex-col">
        <span className={`font-normal tracking-[-0.05em] font-['Inter'] ${textSize} leading-none flex items-center gap-0.5`}>
          <span className={wordmarkColor}>GOALKART</span>
          <span className="w-2 h-2 rounded-full bg-[var(--color-shop-violet,#5433eb)] inline-block ml-0.5" />
        </span>
        {showTagline && (
          <span className={`font-normal tracking-widest uppercase ${taglineSize} text-[var(--color-muted-gray,#787574)] mt-0.5 leading-none`}>
            Gear Up. Play More. Win.
          </span>
        )}
      </div>
    </div>
  );
};

export default GoalKartLogo;
