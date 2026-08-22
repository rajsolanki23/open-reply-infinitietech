'use client';

import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const GradientButton = memo(function GradientButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  ...props
}: GradientButtonProps) {
  const sizeStyles = {
    sm: 'h-9 px-4 text-xs rounded-xl gap-1.5 font-semibold',
    md: 'h-11 px-6 text-sm rounded-xl gap-2 font-semibold',
    lg: 'h-12 px-7 text-sm sm:text-base rounded-2xl gap-2.5 font-bold',
  }[size];

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-glow hover:brightness-105 active:scale-[0.98] border-0',
    secondary:
      'bg-white border border-slate-200/90 text-slate-700 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50/30 active:scale-[0.98]',
    ghost:
      'bg-transparent text-slate-500 hover:bg-slate-100/70 hover:text-slate-900 border-0',
    danger:
      'bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 active:scale-[0.98]',
  }[variant];

  const isDisabled = disabled || loading;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComp = icon as React.ComponentType<{ className?: string }>;
    return <IconComp className="h-4 w-4 shrink-0" />;
  };

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium whitespace-nowrap transition-all duration-150 cursor-pointer select-none
        ${sizeStyles}
        ${variantStyles}
        ${isDisabled ? 'opacity-50 cursor-not-allowed hover:brightness-100 hover:scale-100 active:scale-100' : ''}
        ${className}
      `}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          <span>{children}</span>
        </span>
      ) : (
        <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
          {icon && iconPosition === 'left' && renderIcon()}
          {children}
          {icon && iconPosition === 'right' && renderIcon()}
        </span>
      )}
    </button>
  );
});

export default GradientButton;
