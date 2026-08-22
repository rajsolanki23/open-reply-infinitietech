'use client';

import React, { memo } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string | React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  border?: boolean;
  className?: string;
}

export const PageHeader = memo(function PageHeader({
  title,
  description,
  action,
  children,
  border = true,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`
        flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between
        ${border ? 'border-b border-slate-100 pb-5 mb-6' : 'mb-6'}
        ${className}
      `}
    >
      <div className="space-y-1 min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight capitalize">
          {title}
        </h1>
        {description && (
          <div className="text-sm text-slate-500 leading-normal">
            {description}
          </div>
        )}
      </div>

      {action && (
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {action}
        </div>
      )}

      {children}
    </div>
  );
});
export default PageHeader;
