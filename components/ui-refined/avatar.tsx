'use client';

import React, { memo } from 'react';

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline';
  className?: string;
}

export const Avatar = memo(function Avatar({
  src,
  name,
  size = 'md',
  status,
  className = '',
}: AvatarProps) {
  const sizeStyles = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base font-semibold',
    xl: 'h-16 w-16 text-lg font-bold',
  }[size];

  const dotSizeStyles = {
    sm: 'h-2 w-2 ring-1.5',
    md: 'h-2.5 w-2.5 ring-2',
    lg: 'h-3.5 w-3.5 ring-2',
    xl: 'h-4 w-4 ring-2',
  }[size];

  const initials = (name || 'U')
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={name}
          className={`${sizeStyles} rounded-full object-cover border border-slate-100 shadow-xs`}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div
          className={`
            ${sizeStyles} rounded-full bg-gradient-to-br from-violet-500 to-pink-500
            text-white flex items-center justify-center font-semibold shadow-xs select-none
          `}
        >
          {initials}
        </div>
      )}

      {status && (
        <span
          className={`
            absolute bottom-0 right-0 rounded-full ring-white ${dotSizeStyles}
            ${status === 'online' ? 'bg-emerald-500 animate-pulse-dot' : 'bg-slate-300'}
          `}
        />
      )}
    </div>
  );
});
export default Avatar;
