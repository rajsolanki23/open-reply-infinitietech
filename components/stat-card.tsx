"use client";

import { StatCard as RefinedStatCard, type StatCardProps as RefinedProps } from "@/components/ui-refined/stat-card";
import { Zap } from "lucide-react";

interface LegacyStatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
}

export default function StatCard({ label, value, trend, trendUp }: LegacyStatCardProps) {
  return (
    <RefinedStatCard
      title={label}
      value={value}
      change={trend ? { value: trend, trend: trendUp ? "up" : "down" } : undefined}
      icon={Zap}
      accent="orange"
    />
  );
}
