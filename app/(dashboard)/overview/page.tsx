"use client";

/**
 * Instagram Insights (Overview) Page
 *
 * Aggregate reach/engagement across your recent posts, plus a per-post table.
 * 6 StatCards with interactive skeleton shimmer, follower growth chart,
 * responsive media list, and live post filter loading indicators.
 */

import { useEffect, useState, useCallback } from "react";
import {
  Eye,
  Users,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  ExternalLink,
  ChevronDown,
  Loader2,
  Sparkles,
} from "lucide-react";
import AccountSelect from "@/components/account-select";
import { StatCard } from "@/components/ui-refined/stat-card";
import { AnimatedCard } from "@/components/ui-refined/animated-card";
import FollowerChart from "@/components/follower-chart";
import { StatCardsSkeleton } from "@/components/ui-refined/loading-skeleton";
import type { OverviewResponse } from "@/app/api/instagram/overview/route";

function formatNumber(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

const COUNT_OPTIONS = [
  { value: "25", label: "Last 25 posts" },
  { value: "50", label: "Last 50 posts" },
  { value: "100", label: "Last 100 posts" },
  { value: "all", label: "All time" },
];

export default function OverviewPage() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState("all");
  const [count, setCount] = useState("50");

  const fetchInsights = useCallback(
    async (targetAccount: string, targetCount: string, isInitial = false) => {
      if (isInitial) setInitialLoading(true);
      setIsFiltering(true);

      const params = new URLSearchParams();
      if (targetAccount !== "all") {
        params.set("instagramAccountId", targetAccount);
      }
      params.set("count", targetCount);

      try {
        const response = await fetch(`/api/instagram/overview?${params}`);
        const res = await response.json();
        if (res.success) {
          setData(res.data);
          setError(null);
        } else {
          setError(res.error ?? "Could not load insights");
        }
      } catch {
        setError("Could not load insights");
      } finally {
        setInitialLoading(false);
        setIsFiltering(false);
      }
    },
    []
  );

  useEffect(() => {
    void fetchInsights(selectedAccountId, count, true);
  }, [fetchInsights]); // Only on mount

  function handleAccountChange(accountId: string) {
    setSelectedAccountId(accountId);
    void fetchInsights(accountId, count, false);
  }

  function handleCountChange(nextCount: string) {
    setCount(nextCount);
    void fetchInsights(selectedAccountId, nextCount, false);
  }

  if (initialLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-100 rounded-xl animate-pulse" />
        <StatCardsSkeleton count={6} />
        <div className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <AnimatedCard className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-600">{error}</p>
        {error.includes("connect") && (
          <a
            href="/api/instagram/connect"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold shadow-glow hover:bg-orange-600 transition-colors"
          >
            Connect Instagram
          </a>
        )}
      </AnimatedCard>
    );
  }

  if (!data) return null;

  const { totals, posts, accounts, insightsAvailable, followers, followerHistory } =
    data;

  const currentOptionLabel =
    COUNT_OPTIONS.find((o) => o.value === count)?.label ?? `Last ${count} posts`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Insights
            </h1>
            {isFiltering && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200/80 animate-in fade-in duration-200">
                <Loader2 className="h-3 w-3 animate-spin text-orange-500" />
                <span>Loading {count === "all" ? "all" : count} posts...</span>
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">
            {data.requestedCount === "all" ? "All-time activity" : "Recent activity"} from @{data.account.username}
            {" · "}
            {totals.posts} post{totals.posts === 1 ? "" : "s"} analyzed
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Post Filter Dropdown */}
          <div className="relative">
            <select
              value={count}
              disabled={isFiltering}
              onChange={(e) => handleCountChange(e.target.value)}
              className={`h-10 pl-3.5 pr-9 rounded-xl bg-white border text-xs font-semibold transition-all appearance-none cursor-pointer disabled:cursor-wait ${
                isFiltering
                  ? "border-orange-300 text-orange-700 bg-orange-50/30 ring-2 ring-orange-100"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              } outline-none`}
            >
              {COUNT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
              {isFiltering ? (
                <Loader2 className="h-3.5 w-3.5 text-orange-500 animate-spin" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              )}
            </div>
          </div>

          {/* Account Selector */}
          {accounts.length > 1 && (
            <AccountSelect
              accounts={accounts.map((a) => ({
                id: a.id,
                username: a.username,
                instagramId: a.id,
              }))}
              value={selectedAccountId}
              onChange={handleAccountChange}
            />
          )}
        </div>
      </div>

      {!insightsAvailable && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Media insights permission needed for full reach data
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Reconnect your Instagram account to unlock views, reach, and shares metrics.
            </p>
          </div>
          <a
            href="/api/instagram/connect"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors shrink-0 shadow-xs"
          >
            Reconnect Instagram
          </a>
        </div>
      )}

      {/* Aggregate 6 Stats Row with Shimmer Loading State */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Views"
          value={formatNumber(totals.views)}
          icon={Eye}
          accent="violet"
          loading={isFiltering}
        />
        <StatCard
          title="Reach"
          value={formatNumber(totals.reach)}
          icon={Users}
          accent="orange"
          loading={isFiltering}
        />
        <StatCard
          title="Likes"
          value={formatNumber(totals.likes)}
          icon={Heart}
          accent="rose"
          loading={isFiltering}
        />
        <StatCard
          title="Comments"
          value={formatNumber(totals.comments)}
          icon={MessageCircle}
          accent="blue"
          loading={isFiltering}
        />
        <StatCard
          title="Saved"
          value={formatNumber(totals.saved)}
          icon={Bookmark}
          accent="amber"
          loading={isFiltering}
        />
        <StatCard
          title="Shares"
          value={formatNumber(totals.shares)}
          icon={Share2}
          accent="emerald"
          loading={isFiltering}
        />
      </div>

      {/* Follower Trend Chart */}
      <div
        className={`transition-opacity duration-300 ${
          isFiltering ? "opacity-60 pointer-events-none" : "opacity-100"
        }`}
      >
        <FollowerChart data={followerHistory} followers={followers} />
      </div>

      {/* Per-Post Analytics Table with Smooth Loading Transitions */}
      <AnimatedCard className="overflow-hidden p-0 border border-slate-100 shadow-card">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Recent posts &amp; performance
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Metrics across your feed posts and reels ({currentOptionLabel})
            </p>
          </div>
          {isFiltering && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />
              <span>Updating table...</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 bg-slate-50/50">
                <th className="py-3 px-6 font-semibold">Post</th>
                <th className="py-3 px-3 font-semibold text-right">Views</th>
                <th className="py-3 px-3 font-semibold text-right">Reach</th>
                <th className="py-3 px-3 font-semibold text-right">Likes</th>
                <th className="py-3 px-3 font-semibold text-right">Comments</th>
                <th className="py-3 px-3 font-semibold text-right">Saved</th>
                <th className="py-3 px-3 font-semibold text-right">Shares</th>
                <th className="py-3 pr-6 pl-3 font-semibold text-right">Date</th>
              </tr>
            </thead>

            {isFiltering ? (
              <tbody className="divide-y divide-slate-50">
                {[...Array(6)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5 px-6 max-w-xs">
                      <div className="space-y-1.5">
                        <div className="h-4 bg-slate-200/80 rounded-md w-3/4" />
                        <div className="h-3 bg-slate-100 rounded-md w-1/3" />
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="h-4 bg-slate-100 rounded-md w-12 ml-auto" />
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="h-4 bg-slate-100 rounded-md w-12 ml-auto" />
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="h-4 bg-slate-100 rounded-md w-10 ml-auto" />
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="h-4 bg-slate-100 rounded-md w-10 ml-auto" />
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="h-4 bg-slate-100 rounded-md w-10 ml-auto" />
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="h-4 bg-slate-100 rounded-md w-10 ml-auto" />
                    </td>
                    <td className="py-3.5 pr-6 pl-3 text-right">
                      <div className="h-3 bg-slate-100 rounded-md w-14 ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : posts.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={8} className="text-sm text-slate-400 py-12 text-center">
                    No posts found for this time range.
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-slate-50 animate-in fade-in duration-200">
                {posts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3 px-6 max-w-xs">
                      {p.permalink ? (
                        <a
                          href={p.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-900 font-semibold hover:text-orange-600 truncate flex items-center gap-1.5 group"
                        >
                          <span className="truncate">
                            {p.caption || `${p.mediaType} post`}
                          </span>
                          <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-orange-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        <span className="text-slate-900 font-medium truncate block">
                          {p.caption || `${p.mediaType} post`}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600 font-medium">
                      {formatNumber(p.views)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600 font-medium">
                      {formatNumber(p.reach)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600 font-medium">
                      {formatNumber(p.likes)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600 font-medium">
                      {formatNumber(p.comments)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600 font-medium">
                      {formatNumber(p.saved)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600 font-medium">
                      {formatNumber(p.shares)}
                    </td>
                    <td className="py-3 pr-6 pl-3 text-right text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(p.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </AnimatedCard>
    </div>
  );
}
