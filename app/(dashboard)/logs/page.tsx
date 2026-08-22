"use client";

/**
 * Activity (DM Logs) Page
 *
 * Filterable, paginated table of automated activity, messages sent, and delivery status.
 */

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Activity as ActivityIcon } from "lucide-react";
import AccountSelect, { type AccountOption } from "@/components/account-select";
import { StatusBadge } from "@/components/ui-refined/status-badge";
import { Avatar } from "@/components/ui-refined/avatar";
import { AnimatedCard } from "@/components/ui-refined/animated-card";
import { SearchInput } from "@/components/ui-refined/search-input";

interface DmLog {
  id: string;
  commenterId: string;
  commenterName: string | null;
  commentText: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  automation: { name: string; keywords: string[] };
  instagramAccount: { username: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_TABS = [
  { key: "ALL", label: "All" },
  { key: "SENT", label: "Delivered ✓" },
  { key: "PENDING", label: "Sending..." },
  { key: "FAILED", label: "Retry needed" },
  { key: "SKIPPED_DEDUP", label: "Already replied" },
  { key: "SKIPPED_NO_MATCH", label: "Filtered out" },
];

function formatRelativeTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function LogsPage() {
  const [logs, setLogs] = useState<DmLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("all");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (selectedAccountId !== "all") {
        params.set("instagramAccountId", selectedAccountId);
      }

      const res = await fetch(`/api/logs?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data.logs);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch activity logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, selectedAccountId]);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) setAccounts(payload.data.instagramAccounts ?? []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchLogs();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchLogs]);

  function handleFilterChange(status: string) {
    setLoading(true);
    setStatusFilter(status);
    setPage(1);
  }

  function handleAccountChange(accountId: string) {
    setLoading(true);
    setSelectedAccountId(accountId);
    setPage(1);
  }

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (log.commenterName ?? "").toLowerCase().includes(term) ||
      (log.commentText ?? "").toLowerCase().includes(term) ||
      (log.automation?.name ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Recent activity
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track every automated reply, trigger comment, and delivery state
          </p>
        </div>

        {accounts.length > 1 && (
          <div className="shrink-0">
            <AccountSelect
              accounts={accounts}
              value={selectedAccountId}
              onChange={handleAccountChange}
            />
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 shrink-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleFilterChange(tab.key)}
              className={`
                px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none
                ${
                  statusFilter === tab.key
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by user or text..."
          />
        </div>
      </div>

      {/* Table Card */}
      <AnimatedCard className="overflow-hidden p-0 border border-slate-100 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-left">
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Person
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Comment
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Automation
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Account
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && logs.length === 0 && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100" />
                          <div className="h-4 w-1/3 bg-slate-100 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {!loading && filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <ActivityIcon className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">No activity recorded</p>
                    <p className="text-xs text-slate-400 mt-1">
                      New comments and sent replies will appear here in real-time.
                    </p>
                  </td>
                </tr>
              )}

              {!loading &&
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          name={log.commenterName ?? log.commenterId.slice(0, 8)}
                          size="sm"
                        />
                        <span className="font-semibold text-slate-900">
                          @{log.commenterName ?? log.commenterId.slice(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 max-w-xs">
                      <span className="text-slate-600 truncate block">
                        &ldquo;{log.commentText}&rdquo;
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-medium text-slate-800">
                        {log.automation.name}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-slate-500 text-xs">
                        @{log.instagramAccount.username}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="px-6 py-3.5 text-right text-xs text-slate-400 whitespace-nowrap">
                      {formatRelativeTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <p className="text-xs text-slate-500">
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} entries
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  setLoading(true);
                  setPage(page - 1);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>
              <span className="text-xs font-semibold text-slate-700 px-2.5">
                {page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => {
                  setLoading(true);
                  setPage(page + 1);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </AnimatedCard>
    </div>
  );
}
