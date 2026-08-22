'use client';

import React from 'react';

export function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-100/90 ${className}`}
      {...props}
    />
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white border border-slate-100 p-5 shadow-card space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-28" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return <StatCardsSkeleton count={4} />;
}

export function ChartSkeleton() {
  return (
    <div className="h-80 rounded-2xl bg-white border border-slate-100 p-6 shadow-card space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  );
}

export function KeywordsSkeleton() {
  return (
    <div className="h-80 rounded-2xl bg-white border border-slate-100 p-6 shadow-card space-y-4">
      <Skeleton className="h-5 w-32" />
      <div className="space-y-3 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-card overflow-hidden p-4 space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-card"
        >
          <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ActivitySkeleton() {
  return <TableSkeleton rows={6} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <StatCardsSkeleton count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ChartSkeleton />
        </div>
        <div className="lg:col-span-4">
          <KeywordsSkeleton />
        </div>
      </div>
      <ActivitySkeleton />
    </div>
  );
}

export function CampaignsSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 max-w-md rounded-xl" />
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>
      <ListSkeleton count={4} />
    </div>
  );
}

export function InboxSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-10 w-48 rounded-xl" />
      </div>
      <div className="h-[calc(100vh-14rem)] min-h-[500px] rounded-2xl bg-white border border-slate-100 shadow-card grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        <div className="md:col-span-4 p-4 border-r border-slate-100 space-y-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden md:flex md:col-span-8 p-6 flex-col justify-between bg-slate-50/30">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex justify-center items-center flex-1">
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
      <StatCardsSkeleton count={6} />
      <ChartSkeleton />
      <TableSkeleton rows={5} />
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="space-y-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-card space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-card space-y-4">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function DiagnosticsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
      <Skeleton className="h-20 w-full rounded-2xl" />
      <StatCardsSkeleton count={6} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-48 rounded-2xl bg-white border border-slate-100 shadow-card p-4 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <div className="h-48 rounded-2xl bg-white border border-slate-100 shadow-card p-4 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function LoginSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default Skeleton;
