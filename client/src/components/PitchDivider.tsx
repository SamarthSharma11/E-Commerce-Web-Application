import React from 'react';

// =====================================================
// PitchDivider — thin decorative horizontal line
// styled like a football pitch halfway line with
// a small centered circle. Pure CSS.
// =====================================================
interface PitchDividerProps {
  className?: string;
}

const PitchDivider: React.FC<PitchDividerProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative flex items-center py-[var(--space-4)] ${className}`}
    >
      <div className="flex-1 border-t border-[var(--color-border)]" />
      <div className="relative mx-[var(--space-4)]">
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-border)]" />
      </div>
      <div className="flex-1 border-t border-[var(--color-border)]" />
    </div>
  );
};

export default PitchDivider;