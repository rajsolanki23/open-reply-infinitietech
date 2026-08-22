'use client';

import dynamic from 'next/dynamic';
import React from 'react';

function ChartLoadingSkeleton() {
  return (
    <div className="h-full w-full bg-slate-100/70 rounded-xl animate-pulse flex items-center justify-center">
      <div className="h-4 w-24 bg-slate-200/60 rounded" />
    </div>
  );
}

export const LazyResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false, loading: () => <ChartLoadingSkeleton /> }
);

export const LazyAreaChart = dynamic(
  () => import('recharts').then((m) => m.AreaChart),
  { ssr: false, loading: () => <ChartLoadingSkeleton /> }
);

export const LazyLineChart = dynamic(
  () => import('recharts').then((m) => m.LineChart),
  { ssr: false, loading: () => <ChartLoadingSkeleton /> }
);

export const LazyBarChart = dynamic(
  () => import('recharts').then((m) => m.BarChart),
  { ssr: false, loading: () => <ChartLoadingSkeleton /> }
);

export const LazyArea = dynamic(
  () => import('recharts').then((m) => m.Area),
  { ssr: false }
);

export const LazyLine = dynamic(
  () => import('recharts').then((m) => m.Line),
  { ssr: false }
);

export const LazyBar = dynamic(
  () => import('recharts').then((m) => m.Bar),
  { ssr: false }
);

export const LazyXAxis = dynamic(
  () => import('recharts').then((m) => m.XAxis),
  { ssr: false }
);

export const LazyYAxis = dynamic(
  () => import('recharts').then((m) => m.YAxis),
  { ssr: false }
);

export const LazyCartesianGrid = dynamic(
  () => import('recharts').then((m) => m.CartesianGrid),
  { ssr: false }
);

export const LazyTooltip = dynamic(
  () => import('recharts').then((m) => m.Tooltip),
  { ssr: false }
);

export const LazyLegend = dynamic(
  () => import('recharts').then((m) => m.Legend),
  { ssr: false }
);

export const LazyCell = dynamic(
  () => import('recharts').then((m) => m.Cell),
  { ssr: false }
);
