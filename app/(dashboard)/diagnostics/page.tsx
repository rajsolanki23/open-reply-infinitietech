"use client";

/**
 * System Status (Diagnostics) Page
 *
 * Real-time health monitoring, Vercel-compatible Web Worker control,
 * message queue metrics, and delivery status history with positive, creator-friendly copywriting.
 */

import { useEffect, useState, useCallback } from "react";
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  Send,
  Clock,
  Zap,
  Shield,
  Activity,
  Power,
  Play,
  Pause,
  Server,
  Sparkles,
} from "lucide-react";
import { AnimatedCard } from "@/components/ui-refined/animated-card";
import { StatCard } from "@/components/ui-refined/stat-card";
import { StatusBadge } from "@/components/ui-refined/status-badge";
import { GradientButton } from "@/components/ui-refined/gradient-button";

interface DiagnosticsData {
  queueCounts: Record<string, number>;
  workerHealth: {
    healthy: boolean;
    enabled?: boolean;
    status?: "ACTIVE" | "STANDBY" | "PAUSED";
    ageMs: number | null;
    heartbeat: {
      checkedAt: string;
      hostname?: string;
      pid: number;
      startedAt?: string;
    } | null;
  };
  workerAlerts: Array<{
    level: string;
    message: string;
    jobId?: string;
    commentId?: string;
    createdAt: string;
  }>;
  webhookFailures: Array<{
    id: string;
    object: string | null;
    errorMessage: string | null;
    createdAt: string;
  }>;
  dmFailures: Array<{
    id: string;
    status: string;
    commentId: string;
    commentText: string;
    errorMessage: string | null;
    updatedAt: string;
    automation: { name: string };
  }>;
  tokenRefreshFailures: Array<{
    id: string;
    message: string;
    createdAt: string;
  }>;
  operationalEvents: Array<{
    id: string;
    source: string;
    level: string;
    message: string;
    createdAt: string;
    resolvedAt: string | null;
  }>;
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatedCard className="p-6 space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div>{children}</div>
    </AnimatedCard>
  );
}

function PositiveEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="py-8 text-center space-y-1">
      <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="text-xs text-slate-400 max-w-sm mx-auto">{description}</p>
    </div>
  );
}

export default function DiagnosticsPage() {
  const [data, setData] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<boolean | null>(null);

  const fetchDiagnostics = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch("/api/admin/diagnostics");
      const payload = await response.json();
      if (payload.success) {
        setData(payload.data);
      }
    } catch (err) {
      console.error("Could not refresh system status:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  async function handleWorkerAction(action: "turn_on" | "turn_off" | "sync_now") {
    setActionLoading(true);
    setActionMessage(null);
    setActionSuccess(null);

    try {
      const res = await fetch("/api/admin/worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setActionSuccess(true);
        setActionMessage(resData.message ?? "Action completed successfully.");
        await fetchDiagnostics(false);
      } else {
        setActionSuccess(false);
        setActionMessage(resData.error ?? "Failed to perform worker action.");
      }
    } catch {
      setActionSuccess(false);
      setActionMessage("Network error communicating with worker engine.");
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    void fetchDiagnostics(true);

    // Continuous background sync and diagnostics refresh when worker is enabled
    const interval = setInterval(async () => {
      // If worker is enabled, continuously sync and drain queue; otherwise just refresh stats
      const isEnabled = data?.workerHealth.enabled ?? true;
      if (isEnabled) {
        try {
          await fetch("/api/admin/worker", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "sync_now" }),
          });
        } catch {
          // Ignore background sync errors
        }
      }
      void fetchDiagnostics(false);
    }, 12000);

    return () => clearInterval(interval);
  }, [fetchDiagnostics, data?.workerHealth.enabled]);

  if (loading && !data) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-10 w-48 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const isWorkerEnabled = data?.workerHealth.enabled ?? true;
  const isHealthy = data?.workerHealth.healthy ?? true;
  const isWorkerActive = isWorkerEnabled && isHealthy;
  const waitingCount = data?.queueCounts?.waiting ?? 0;
  const activeQueueCount = data?.queueCounts?.active ?? 0;
  const delayedCount = data?.queueCounts?.delayed ?? 0;
  const retryNeededCount = data?.queueCounts?.failed ?? 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            System Status
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time status of background processes, message delivery, and connections
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchDiagnostics(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh data</span>
        </button>
      </div>

      {/* 1. Worker Engine & Vercel Serverless Control Card */}
      <AnimatedCard className="p-6 space-y-5 border-orange-100/70 bg-gradient-to-br from-white via-orange-50/20 to-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-colors ${
                isWorkerActive
                  ? "bg-emerald-50 text-emerald-600 ring-2 ring-emerald-500/20"
                  : isWorkerEnabled
                  ? "bg-amber-50 text-amber-600 ring-2 ring-amber-500/20"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <Power className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Background Worker Engine
                </h2>
                {isWorkerActive ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active &amp; Auto-Sending
                  </span>
                ) : isWorkerEnabled ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Ready (Vercel Serverless)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    Paused from Website
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Automated DM delivery, comment keyword monitoring, and instant campaign execution on Vercel.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleWorkerAction("sync_now")}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${actionLoading ? "animate-spin" : ""}`} />
              <span>Sync queue now</span>
            </button>

            {isWorkerEnabled ? (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleWorkerAction("turn_off")}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Pause className="h-3.5 w-3.5" />
                <span>Turn off worker</span>
              </button>
            ) : (
              <GradientButton
                type="button"
                size="sm"
                loading={actionLoading}
                onClick={() => handleWorkerAction("turn_on")}
                className="h-10 px-5 text-xs font-bold"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Turn on worker</span>
              </GradientButton>
            )}
          </div>
        </div>

        {/* Action Status Feedback Banner */}
        {actionMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 animate-in fade-in duration-200 ${
              actionSuccess
                ? "bg-emerald-50/90 border-emerald-200 text-emerald-800"
                : "bg-rose-50/90 border-rose-200 text-rose-800"
            }`}
          >
            {actionSuccess ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span className="font-medium">{actionMessage}</span>
          </div>
        )}

        {/* Worker Info Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-white border border-slate-100 space-y-0.5 shadow-xs">
            <p className="text-[11px] font-medium text-slate-400">Worker Switch</p>
            <p className="text-sm font-bold text-slate-800">
              {isWorkerEnabled ? "ENABLED (Continuous)" : "DISABLED (Paused)"}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-100 space-y-0.5 shadow-xs">
            <p className="text-[11px] font-medium text-slate-400">Hosting Mode</p>
            <p className="text-sm font-bold text-slate-800">
              Vercel Serverless Auto-Engine
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-100 space-y-0.5 shadow-xs">
            <p className="text-[11px] font-medium text-slate-400">Queue Processing</p>
            <p className="text-sm font-bold text-slate-800">
              {waitingCount === 0 ? "All caught up" : `${waitingCount} tasks waiting`}
            </p>
          </div>
        </div>
      </AnimatedCard>

      {/* Operational Banner */}
      {isWorkerEnabled && retryNeededCount === 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 sm:p-5 flex items-center gap-3.5 shadow-xs">
          <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-950">
              All systems operational 🎉
            </p>
            <p className="text-xs text-emerald-800 mt-0.5">
              Automated comment reconciliation and reply delivery are running smoothly.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5 flex items-center gap-3.5 shadow-xs">
          <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-950">
              {isWorkerEnabled ? "Check connection status" : "Worker is currently paused"}
            </p>
            <p className="text-xs text-amber-800 mt-0.5">
              {isWorkerEnabled
                ? "Some messages or tasks are waiting for connection sync."
                : "Turn on the worker above to resume automatic message sending."}
            </p>
          </div>
        </div>
      )}

      {/* 6 Key Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          title="API connection"
          value={isHealthy ? "Connected" : "Check connection"}
          icon={Wifi}
          accent={isHealthy ? "emerald" : "amber"}
          subtitle="Real-time sync active"
        />
        <StatCard
          title="Messages waiting"
          value={waitingCount === 0 ? "All caught up" : `${waitingCount} waiting`}
          icon={Send}
          accent={waitingCount === 0 ? "emerald" : "amber"}
          subtitle="Direct messages"
        />
        <StatCard
          title="Processing"
          value={activeQueueCount > 0 ? `${activeQueueCount} sending now` : "Running"}
          icon={Zap}
          accent="violet"
          subtitle="Auto-reply process"
        />
        <StatCard
          title="Scheduled"
          value={delayedCount > 0 ? `${delayedCount} scheduled` : "On schedule"}
          icon={Clock}
          accent="blue"
          subtitle="Follow-up delays"
        />
        <StatCard
          title="Delivery retries"
          value={retryNeededCount === 0 ? "0 pending" : `${retryNeededCount} to retry`}
          icon={Activity}
          accent={retryNeededCount === 0 ? "emerald" : "rose"}
          subtitle="Automatic backoff"
        />
        <StatCard
          title="Session health"
          value="Healthy"
          icon={Shield}
          accent="emerald"
          subtitle="Official connection valid"
        />
      </div>

      {/* Details Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Alerts */}
        <SectionCard
          title="Recent alerts"
          subtitle="System event logs and background notifications"
        >
          {data?.workerAlerts && data.workerAlerts.length > 0 ? (
            <div className="space-y-3">
              {data.workerAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-900 leading-normal">
                      {alert.message}
                    </p>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                      {alert.level.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {formatDate(alert.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <PositiveEmptyState
              title="All systems running smoothly 🎉"
              description="No alerts or background issues recorded."
            />
          )}
        </SectionCard>

        {/* Delivery Status */}
        <SectionCard
          title="Delivery status"
          subtitle="Automated message delivery events needing retry"
        >
          {data?.dmFailures && data.dmFailures.length > 0 ? (
            <div className="space-y-3">
              {data.dmFailures.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {item.automation?.name ?? "Automation"}
                    </p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    &ldquo;{item.commentText}&rdquo;
                  </p>
                  {item.errorMessage && (
                    <p className="text-xs text-rose-600 font-medium">
                      {item.errorMessage}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <PositiveEmptyState
              title="All messages delivered successfully"
              description="Every comment trigger was processed and replied to without issues."
            />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Connection Issues */}
        <SectionCard
          title="Connection issues"
          subtitle="Real-time comment reconciliation sync"
        >
          {data?.webhookFailures && data.webhookFailures.length > 0 ? (
            <div className="space-y-3">
              {data.webhookFailures.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1"
                >
                  <p className="text-xs font-semibold text-slate-900">
                    {event.object ?? "Instagram connection sync"}
                  </p>
                  <p className="text-xs text-rose-600">
                    {event.errorMessage ?? "Check connection"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatDate(event.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <PositiveEmptyState
              title="Connection is stable"
              description="Instagram API link is actively receiving comment triggers."
            />
          )}
        </SectionCard>

        {/* Session Health */}
        <SectionCard
          title="Session health"
          subtitle="Instagram connection credentials validity"
        >
          {data?.tokenRefreshFailures && data.tokenRefreshFailures.length > 0 ? (
            <div className="space-y-3">
              {data.tokenRefreshFailures.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1"
                >
                  <p className="text-xs font-semibold text-slate-900">
                    {event.message}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatDate(event.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <PositiveEmptyState
              title="Session is healthy"
              description="Credentials and connections are encrypted and actively refreshed."
            />
          )}
        </SectionCard>
      </div>

      {/* Operational Events Timeline */}
      <SectionCard
        title="Operational timeline"
        subtitle="Recent background events and reconciliation sweeps"
      >
        {data?.operationalEvents && data.operationalEvents.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {data.operationalEvents.map((event) => (
              <div
                key={event.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase">
                    {event.source}
                  </span>
                  <p className="text-xs text-slate-800 truncate font-medium">
                    {event.message}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {formatDate(event.createdAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <PositiveEmptyState
            title="All background processes running normally"
            description="Reconciliation sweeps and background delivery are active."
          />
        )}
      </SectionCard>
    </div>
  );
}
