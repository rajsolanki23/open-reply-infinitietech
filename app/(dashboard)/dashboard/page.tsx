"use client";

/**
 * Dashboard Home Page
 *
 * Creator-first overview with refined stat cards, AreaChart for messages over time,
 * top keywords distribution, and recent activity feed.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Zap,
  Send,
  MousePointerClick,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import dynamic from "next/dynamic";
import AccountSelect, { type AccountOption } from "@/components/account-select";
import { StatCard } from "@/components/ui-refined/stat-card";
import { AnimatedCard } from "@/components/ui-refined/animated-card";
import { StatusBadge } from "@/components/ui-refined/status-badge";
import { Avatar } from "@/components/ui-refined/avatar";
import { StatCardsSkeleton } from "@/components/ui-refined/loading-skeleton";

const MessagesChart = dynamic(
  () => import("@/components/dashboard/messages-chart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-slate-100/60 rounded-xl animate-pulse" />
    ),
  }
);

interface DashboardStats {
  userName: string | null;
  contactsCount: number;
  totalAutomations: number;
  activeAutomations: number;
  dmsSentToday: number;
  dmsSentWeek: number;
  dmsSentMonth: number;
  dmsSkippedMonth: number;
  dmsFailedMonth: number;
  totalDMs: number;
  clicksThisMonth: number;
  totalClicks: number;
  ctrThisMonth: number;
  instagramAccounts: AccountOption[];
  selectedInstagramAccountId: string | null;
  topKeywords: { keyword: string; count: number }[];
  dailyDMs: { date: string; count: number }[];
  recentLogs: Array<{
    id: string;
    commenterName: string | null;
    commentText: string;
    status: string;
    createdAt: string;
    automation: { name: string };
    instagramAccount?: { username: string };
  }>;
}

function formatRelativeTime(iso: string) {
  try {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedAccountId !== "all") {
      params.set("instagramAccountId", selectedAccountId);
    }

    fetch(`/api/dashboard/stats${params.size ? `?${params}` : ""}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedAccountId]);

  function handleAccountChange(accountId: string) {
    setLoading(true);
    setSelectedAccountId(accountId);
  }

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-14 w-64 bg-slate-100 rounded-2xl animate-pulse" />
        <StatCardsSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          <div className="lg:col-span-4 h-80 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="lg:col-span-2 h-80 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const connectedCount = stats?.instagramAccounts.length ?? 0;
  const maxKeywordCount = Math.max(
    ...(stats?.topKeywords.map((k) => k.count) ?? [1]),
    1
  );

  return (
    <div className="space-y-8">
      {/* Greeting & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Welcome back 👋
          </h1>
          <p className="text-sm text-slate-500">
            {connectedCount}{" "}
            {connectedCount === 1 ? "account connected" : "accounts connected"}
            {" · "}
            {stats?.contactsCount ?? 0} people reached
            {" · "}
            <Link
              href="/logs"
              className="text-orange-500 hover:text-orange-600 font-medium hover:underline"
            >
              View all activity
            </Link>
          </p>
        </div>

        {stats && stats.instagramAccounts.length > 1 && (
          <div className="shrink-0">
            <AccountSelect
              accounts={stats.instagramAccounts}
              value={selectedAccountId}
              onChange={handleAccountChange}
            />
          </div>
        )}
      </div>

      {/* Main 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active automations"
          value={stats?.activeAutomations ?? 0}
          icon={Zap}
          accent="orange"
          subtitle={`${stats?.totalAutomations ?? 0} total created`}
        />
        <StatCard
          title="Messages sent"
          value={(stats?.dmsSentMonth ?? 0).toLocaleString()}
          icon={Send}
          accent="violet"
          subtitle={`${stats?.dmsSentToday ?? 0} sent today`}
        />
        <StatCard
          title="Link clicks"
          value={(stats?.clicksThisMonth ?? 0).toLocaleString()}
          icon={MousePointerClick}
          accent="emerald"
          subtitle={`${stats?.totalClicks ?? 0} all-time clicks`}
        />
        <StatCard
          title="Click-through rate"
          value={`${stats?.ctrThisMonth ?? 0}%`}
          icon={TrendingUp}
          accent="rose"
          change={
            stats?.ctrThisMonth
              ? { value: `${stats.ctrThisMonth}%`, trend: "up", label: "avg conversion" }
              : undefined
          }
        />
      </div>

      {/* Chart and Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages Over Time (Area Chart) */}
        <AnimatedCard className="lg:col-span-7 xl:col-span-8 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Messages over time
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily automated replies across all active automations
              </p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
              Last 7 days
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <MessagesChart dailyDMs={stats?.dailyDMs ?? []} />
          </div>
        </AnimatedCard>

        {/* Top Keywords */}
        <AnimatedCard className="lg:col-span-5 xl:col-span-4 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">
                Top keywords
              </h2>
              <span className="text-xs text-slate-400">By comment frequency</span>
            </div>

            <div className="space-y-4 mt-4">
              {stats?.topKeywords.length === 0 ? (
                <p className="text-sm text-slate-400 py-12 text-center">
                  No keyword matches yet
                </p>
              ) : (
                stats?.topKeywords.map((item) => (
                  <div key={item.keyword} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-800 font-semibold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-100">
                        {item.keyword}
                      </span>
                      <span className="text-slate-500 font-bold">{item.count}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
                        style={{
                          width: `${Math.max((item.count / maxKeywordCount) * 100, 8)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Automatic reply trigger</span>
            <Link
              href="/campaigns"
              className="text-orange-500 font-medium hover:underline flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </AnimatedCard>
      </div>

      {/* Recent Activity List */}
      <AnimatedCard className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Recent activity
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live log of incoming comments and sent replies
            </p>
          </div>
          <Link
            href="/logs"
            className="text-xs sm:text-sm font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1 hover:underline"
          >
            <span>View all activity</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {stats?.recentLogs.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">
              No activity yet — create your first automation to get started.
            </p>
          ) : (
            stats?.recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-4 py-3.5 hover:bg-slate-50/70 -mx-3 px-3 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar name={log.commenterName ?? "User"} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        @{log.commenterName ?? "creator"}
                      </p>
                      <span className="text-xs text-slate-400">
                        {formatRelativeTime(log.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      <span className="font-medium text-slate-700">
                        {log.automation.name}
                      </span>
                      {" · "}
                      &ldquo;{log.commentText}&rdquo;
                    </p>
                  </div>
                </div>

                <StatusBadge status={log.status} />
              </div>
            ))
          )}
        </div>
      </AnimatedCard>
    </div>
  );
}
