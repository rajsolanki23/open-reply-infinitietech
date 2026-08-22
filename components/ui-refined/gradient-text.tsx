import React from 'react';

export interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'accent' | 'emerald';
}

export function GradientText({
  children,
  className = '',
  variant = 'primary',
}: GradientTextProps) {
  const gradient = {
    primary: 'bg-gradient-to-r from-orange-600 to-orange-400',
    accent: 'bg-gradient-to-r from-violet-600 to-pink-500',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400',
  }[variant];

  return (
    <span className={`${gradient} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}
export default GradientText;
