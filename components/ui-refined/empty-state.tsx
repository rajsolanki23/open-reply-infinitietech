'use client';

import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';
import { GradientButton } from './gradient-button';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    variant?: 'primary' | 'secondary';
  };
  children?: React.ReactNode;
  className?: string;
}

export const EmptyState = memo(function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-14 px-4 ${className}`}
    >
      <div className="h-20 w-20 rounded-full bg-orange-50/60 border border-orange-100/50 flex items-center justify-center text-orange-400">
        <Icon className="h-8 w-8" />
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-slate-900 mt-4">
        {title}
      </h3>

      <p className="text-sm text-slate-500 mt-1.5 max-w-sm leading-relaxed">
        {description}
      </p>

      {action && (
        <div className="mt-6">
          <GradientButton
            variant={action.variant ?? 'primary'}
            icon={action.icon}
            onClick={action.onClick}
          >
            {action.label}
          </GradientButton>
        </div>
      )}

      {children && <div className="mt-6">{children}</div>}
    </div>
  );
});
export default EmptyState;
