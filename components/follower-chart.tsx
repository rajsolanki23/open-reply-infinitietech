"use client";

/**
 * Followers Over Time Chart
 *
 * Single-series line chart over stored daily snapshots with violet-to-pink gradient line,
 * soft area gradient fill, and table view toggle.
 */

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatedCard } from "@/components/ui-refined/animated-card";
import type { FollowerChartPoint } from "@/components/charts/follower-area-chart";

const FollowerAreaChart = dynamic(
  () => import("@/components/charts/follower-area-chart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-slate-100/60 rounded-xl animate-pulse" />
    ),
  }
);

export type { FollowerChartPoint };

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
        <p className={`mt-0.5 font-semibold ${point.delta > 0 ? "text-emerald-600" : "text-rose-600"}`}>
          {formatSigned(point.delta)} that day
        </p>
      )}
    </div>
  );
}

export default function FollowerChart({
  data,
  followers,
}: {
  data: FollowerChartPoint[];
  followers: number | null;
}) {
  const [showTable, setShowTable] = useState(false);

  const current = followers ?? data.at(-1)?.followers ?? null;

  const net =
    data.length > 1 ? data[data.length - 1].followers - data[0].followers : null;

  return (
    <AnimatedCard className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-base font-semibold text-slate-900">
            Follower growth
          </h2>
          <p className="text-sm text-slate-500">
            {current === null
              ? "Follower count unavailable"
              : `${current.toLocaleString()} followers now`}
            {net !== null && (
              <>
                {" · "}
                <span className={`font-semibold ${net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {formatSigned(net)}
                </span>{" "}
                over {data.length} days
              </>
            )}
          </p>
        </div>

        {data.length > 1 && (
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            {showTable ? "Show chart" : "Show table"}
          </button>
        )}
      </div>

      {data.length < 2 ? (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-8 text-center">
          <p className="text-sm font-semibold text-slate-800">Collecting follower history</p>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {data.length === 0
              ? "No snapshots recorded yet."
              : "One day recorded so far."}{" "}
            Daily points are recorded automatically. The chart will render once two days are available.
          </p>
        </div>
      ) : showTable ? (
        <div className="mt-5 max-h-72 overflow-y-auto rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-4 font-semibold">Date</th>
                <th className="py-2.5 px-4 font-semibold text-right">Followers</th>
                <th className="py-2.5 px-4 font-semibold text-right">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...data].reverse().map((p) => (
                <tr key={p.date} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-4 text-slate-900 font-medium">
                    {formatDay(p.date)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-600">
                    {p.followers.toLocaleString()}
                  </td>
                  <td className={`py-2.5 px-4 text-right font-semibold ${p.delta && p.delta > 0 ? "text-emerald-600" : p.delta && p.delta < 0 ? "text-rose-600" : "text-slate-400"}`}>
                    {p.delta === null ? "—" : formatSigned(p.delta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6 h-60 sm:h-72">
          <FollowerAreaChart data={data} />
        </div>
      )}
    </AnimatedCard>
  );
}
