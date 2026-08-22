'use client';

import React, { memo } from 'react';

export type StatusType =
  | 'active'
  | 'paused'
  | 'delivered'
  | 'sent'
  | 'SENT'
  | 'sending'
  | 'pending'
  | 'PENDING'
  | 'needs_retry'
  | 'failed'
  | 'FAILED'
  | 'filtered'
  | 'SKIPPED_DEDUP'
  | 'SKIPPED_RATE_LIMIT'
  | 'SKIPPED_PLAN_LIMIT'
  | 'SKIPPED_NO_MATCH'
  | 'connected'
  | 'disconnected'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  dot?: boolean;
}

export const StatusBadge = memo(function StatusBadge({ status, className = '', dot = true }: StatusBadgeProps) {
  const normalized = status ? status.toString().trim() : '';

  let label = normalized;
  let styles = 'bg-slate-50 text-slate-600 border-slate-200';
  let dotColor = 'bg-slate-400';
  let pulse = false;

  switch (normalized.toUpperCase()) {
    case 'ACTIVE':
    case 'CONNECTED':
    case 'HEALTHY':
      label = normalized === 'CONNECTED' ? 'Connected' : 'Active';
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      dotColor = 'bg-emerald-500';
      break;

    case 'PAUSED':
      label = 'Paused';
      styles = 'bg-amber-50 text-amber-700 border-amber-200/80';
      dotColor = 'bg-amber-500';
      break;

    case 'SENT':
    case 'DELIVERED':
      label = 'Delivered ✓';
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      dotColor = 'bg-emerald-500';
      break;

    case 'PENDING':
    case 'SENDING':
    case 'QUEUED':
      label = 'Sending...';
      styles = 'bg-amber-50 text-amber-700 border-amber-200/80';
      dotColor = 'bg-amber-500';
      pulse = true;
      break;

    case 'FAILED':
    case 'NEEDS_RETRY':
      label = 'Needs retry';
      styles = 'bg-rose-50 text-rose-700 border-rose-200/80';
      dotColor = 'bg-rose-500';
      break;

    case 'SKIPPED_RATE_LIMIT':
    case 'RATE_LIMIT':
      label = 'Slowing down';
      styles = 'bg-amber-50 text-amber-700 border-amber-200/80';
      dotColor = 'bg-amber-500';
      break;

    case 'SKIPPED_DEDUP':
      label = 'Already replied';
      styles = 'bg-slate-50 text-slate-600 border-slate-200';
      dotColor = 'bg-slate-400';
      break;

    case 'SKIPPED_PLAN_LIMIT':
    case 'SKIPPED_NO_MATCH':
    case 'SKIPPED':
    case 'FILTERED':
      label = 'Filtered out';
      styles = 'bg-slate-50 text-slate-600 border-slate-200';
      dotColor = 'bg-slate-400';
      break;

    case 'DISCONNECTED':
      label = 'Disconnected';
      styles = 'bg-slate-50 text-slate-500 border-slate-200';
      dotColor = 'bg-slate-400';
      break;

    default:
      label = normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
      styles = 'bg-slate-50 text-slate-600 border-slate-200';
      dotColor = 'bg-slate-400';
      break;
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 select-none
        ${styles}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColor} ${
            pulse ? 'animate-pulse-dot' : ''
          }`}
        />
      )}
      <span>{label}</span>
    </span>
  );
});
export default StatusBadge;
