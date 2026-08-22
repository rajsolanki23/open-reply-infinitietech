'use client';

import { ReactNode, memo } from 'react';

export interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggerContainer = memo(function StaggerContainer({
  children,
  className = '',
}: StaggerContainerProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
});

export const StaggerItem = memo(function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`animate-fade-in-up ${className}`}>
      {children}
    </div>
  );
});

export default StaggerContainer;
