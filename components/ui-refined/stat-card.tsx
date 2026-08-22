'use client';

import { memo } from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type AccentColor = 'orange' | 'violet' | 'emerald' | 'rose' | 'amber' | 'blue';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number | string;
    label?: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: LucideIcon;
  accent?: AccentColor;
  className?: string;
  subtitle?: string;
  loading?: boolean;
}

const accentStyles: Record<
  AccentColor,
  { container: string; icon: string; borderHover: string }
> = {
  orange: {
    container: 'bg-orange-50/80 text-orange-500',
    icon: 'text-orange-500',
    borderHover: 'hover:border-orange-200',
  },
  violet: {
    container: 'bg-violet-50/80 text-violet-500',
    icon: 'text-violet-500',
    borderHover: 'hover:border-violet-200',
  },
  emerald: {
    container: 'bg-emerald-50/80 text-emerald-600',
    icon: 'text-emerald-600',
    borderHover: 'hover:border-emerald-200',
  },
  rose: {
    container: 'bg-rose-50/80 text-rose-500',
    icon: 'text-rose-500',
    borderHover: 'hover:border-rose-200',
  },
  amber: {
    container: 'bg-amber-50/80 text-amber-500',
    icon: 'text-amber-500',
    borderHover: 'hover:border-amber-200',
  },
  blue: {
    container: 'bg-blue-50/80 text-blue-500',
    icon: 'text-blue-500',
    borderHover: 'hover:border-blue-200',
  },
};

export const StatCard = memo(function StatCard({
  title,
  value,
  change,
  icon: Icon,
  accent = 'orange',
  className = '',
  subtitle,
  loading = false,
}: StatCardProps) {
  const styles = accentStyles[accent] ?? accentStyles.orange;

  return (
    <div
      className={`
        rounded-2xl bg-white border border-slate-100 p-5 shadow-card
        hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200
        flex flex-col justify-between
        ${styles.borderHover} ${className}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-medium text-slate-500 capitalize">
            {title}
          </p>
          {loading ? (
            <div className="h-7 w-20 bg-slate-100 rounded-lg animate-pulse my-0.5" />
          ) : (
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </p>
          )}
          {subtitle && (
            <p className="text-xs text-slate-400">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${styles.container}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {change && (
        <div className="mt-3 pt-2 flex items-center gap-1.5">
          <span
            className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
              ${
                change.trend === 'up'
                  ? 'bg-emerald-50 text-emerald-600'
                  : change.trend === 'down'
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-slate-50 text-slate-500'
              }
            `}
          >
            {change.trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {change.trend === 'down' && <TrendingDown className="h-3 w-3" />}
            {change.trend === 'neutral' && <Minus className="h-3 w-3" />}
            <span>{typeof change.value === 'number' && change.value > 0 ? `+${change.value}%` : `${change.value}`}</span>
          </span>
          {change.label && (
            <span className="text-[11px] text-slate-400 font-normal">
              {change.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
});
export default StatCard;
