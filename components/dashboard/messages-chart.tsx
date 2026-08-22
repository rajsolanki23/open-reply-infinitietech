"use client";

import {
  LazyAreaChart,
  LazyArea,
  LazyXAxis,
  LazyYAxis,
  LazyTooltip,
  LazyResponsiveContainer,
} from "@/components/charts/chart-registry";

interface MessagesChartProps {
  dailyDMs: Array<{ date: string; count: number }>;
}

export default function MessagesChart({ dailyDMs }: MessagesChartProps) {
  if (!dailyDMs || dailyDMs.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-slate-400">
        No message activity recorded yet
      </div>
    );
  }

  return (
    <LazyResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
      <LazyAreaChart
        data={dailyDMs}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorDms" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <LazyXAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          dy={8}
        />
        <LazyYAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          allowDecimals={false}
        />
        <LazyTooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #f1f5f9",
            borderRadius: "0.75rem",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
            fontSize: "12px",
          }}
          labelStyle={{ fontWeight: "600", color: "#0f172a" }}
          itemStyle={{ color: "#ea580c" }}
          formatter={(value: any) => [`${value} messages`, "Delivered"]}
        />
        <LazyArea
          type="monotone"
          dataKey="count"
          stroke="#f97316"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#colorDms)"
        />
      </LazyAreaChart>
    </LazyResponsiveContainer>
  );
}
