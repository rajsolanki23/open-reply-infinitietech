'use client';

import { ReactNode, memo } from 'react';

export interface FadeInProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn = memo(function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.3,
  className = '',
}: FadeInProps) {
  const animationClass = direction === 'none' ? 'animate-fade-in' : 'animate-fade-in-up';

  return (
    <div
      style={{
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        animationFillMode: 'both',
      }}
      className={`${animationClass} ${className}`}
    >
      {children}
    </div>
  );
});

export default FadeIn;
