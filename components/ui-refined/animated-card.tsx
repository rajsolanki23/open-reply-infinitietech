'use client';

import { ReactNode, memo } from 'react';

export interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  onClick?: () => void;
}

export const AnimatedCard = memo(function AnimatedCard({
  children,
  className = '',
  delay = 0,
  hover = true,
  onClick,
}: AnimatedCardProps) {
  return (
    <div
      style={delay ? { animationDelay: `${delay}s`, animationFillMode: 'both' } : undefined}
      onClick={onClick}
      className={`
        animate-fade-in-up rounded-2xl bg-white border border-slate-100 shadow-card
        ${hover ? 'hover:shadow-card-hover hover:-translate-y-0.5' : ''}
        transition-all duration-200 ${onClick ? 'cursor-pointer' : ''} ${className}
      `}
    >
      {children}
    </div>
  );
});

export default AnimatedCard;
