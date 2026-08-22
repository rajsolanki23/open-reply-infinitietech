"use client";

import {
  LazyCartesianGrid,
  LazyArea,
  LazyAreaChart,
  LazyResponsiveContainer,
  LazyTooltip,
  LazyXAxis,
  LazyYAxis,
} from "@/components/charts/chart-registry";

export interface FollowerChartPoint {
  date: string;
  followers: number;
  delta: number | null;
}

const GRID_COLOR = "#f1f5f9";
const AXIS_TEXT = "#94a3b8";

function formatCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatDay(iso: string): string {
  try {
    return new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

function formatSigned(n: number): string {
  return `${n > 0 ? "+" : ""}${n.toLocaleString()}`;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: FollowerChartPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 text-xs shadow-elevated">
      <p className="text-slate-400 font-medium">{formatDay(point.date)}</p>
      <p className="mt-1 font-bold text-slate-900 text-sm">
        {point.followers.toLocaleString()} followers
      </p>
      {point.delta !== null && point.delta !== 0 && (
        <p
          className={`mt-0.5 font-semibold ${
            point.delta > 0 ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {formatSigned(point.delta)} that day
        </p>
      )}
    </div>
  );
}

export default function FollowerAreaChart({
  data,
}: {
  data: FollowerChartPoint[];
}) {
  return (
    <LazyResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
      <LazyAreaChart data={data} margin={{ top: 8, right: 10, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <LazyCartesianGrid vertical={false} stroke={GRID_COLOR} strokeDasharray="3 3" />
        <LazyXAxis
          dataKey="date"
          tickFormatter={formatDay}
          tick={{ fill: AXIS_TEXT, fontSize: 11 }}
          stroke={GRID_COLOR}
          tickLine={false}
          minTickGap={24}
        />
        <LazyYAxis
          tickFormatter={formatCompact}
          tick={{ fill: AXIS_TEXT, fontSize: 11 }}
          stroke={GRID_COLOR}
          tickLine={false}
          width={48}
          domain={["dataMin - 5", "dataMax + 5"]}
        />
        <LazyTooltip
          content={<ChartTooltip />}
          cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
        />
        <LazyArea
          type="monotone"
          dataKey="followers"
          stroke="#8b5cf6"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#followerGradient)"
        />
      </LazyAreaChart>
    </LazyResponsiveContainer>
  );
}
