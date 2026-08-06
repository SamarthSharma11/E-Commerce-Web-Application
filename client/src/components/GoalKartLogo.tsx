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
  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const taglineSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-[11px]' : 'text-[10px]';

  const goalColor = variant === 'dark' ? 'text-white' : 'text-[var(--color-text)]';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Dynamic GK Monogram Icon */}
      <div className={`${iconSize} flex-shrink-0 relative flex items-center justify-center`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          {/* Dynamic Green Motion Streaks */}
          <path d="M45 42L72 20M35 55L78 26M55 48L84 32" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
          <path d="M42 45L68 25" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />

          {/* 'G' Character */}
          <path
            d="M52 35C48 27 37 25 27 31C16 38 14 53 20 63C27 74 44 76 53 67C57 63 58 57 58 52H38"
            stroke={variant === 'dark' ? '#FFFFFF' : '#1C2B21'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 'K' Diagonal Green Leg */}
          <path
            d="M38 67L64 35M47 52L68 67"
            stroke="#22C55E"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Flying Soccer Ball */}
          <g transform="translate(68, 12) scale(0.75)">
            <circle cx="15" cy="15" r="14" fill="#FFFFFF" stroke="#1C2B21" strokeWidth="2" />
            <polygon points="15,6 20,10 18,16 12,16 10,10" fill="#1C2B21" />
            <line x1="15" y1="6" x2="15" y2="1" stroke="#1C2B21" strokeWidth="1.5" />
            <line x1="20" y1="10" x2="26" y2="8" stroke="#1C2B21" strokeWidth="1.5" />
            <line x1="18" y1="16" x2="22" y2="23" stroke="#1C2B21" strokeWidth="1.5" />
            <line x1="12" y1="16" x2="8" y2="23" stroke="#1C2B21" strokeWidth="1.5" />
            <line x1="10" y1="10" x2="4" y2="8" stroke="#1C2B21" strokeWidth="1.5" />
          </g>
        </svg>
      </div>

      {/* Brand Text & Tagline */}
      <div className="flex flex-col">
        <span className={`font-black tracking-tight font-['Outfit'] ${textSize} leading-none flex items-center`}>
          <span className={goalColor}>GOAL</span>
          <span className="text-[var(--color-primary)]">KART</span>
        </span>
        {showTagline && (
          <span className={`font-bold tracking-widest uppercase ${taglineSize} text-[var(--color-text-muted)] mt-0.5 leading-none`}>
            Gear Up. Play More. Win.
          </span>
        )}
      </div>
    </div>
  );
};

export default GoalKartLogo;
