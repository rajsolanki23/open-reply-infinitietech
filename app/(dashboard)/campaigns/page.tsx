"use client";

/**
 * Automations List Page
 *
 * Shows all automations with rich visual cards, live previews, tag badges,
 * active/paused switch, duplicate, and delete actions.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Plus,
  Play,
  Copy,
  Check,
  MoreVertical,
  Trash2,
  CopyPlus,
  ExternalLink,
  Upload,
  Eye,
  Edit3,
} from "lucide-react";
import AccountSelect, { type AccountOption } from "@/components/account-select";
import { readCache, writeCache } from "@/lib/client-cache";
import { AnimatedCard } from "@/components/ui-refined/animated-card";
import { GradientButton } from "@/components/ui-refined/gradient-button";
import { SearchInput } from "@/components/ui-refined/search-input";
import { EmptyState } from "@/components/ui-refined/empty-state";
import { StatusBadge } from "@/components/ui-refined/status-badge";

interface Campaign {
  id: string;
  name: string;
  goal: string | null;
  postId: string | null;
  postUrl: string | null;
  pendingNextReel: boolean;
  matchAnyPost: boolean;
  keywords: string[];
  matchAnyWord: boolean;
  dmMessage: string;
  openingDmEnabled: boolean;
  openingDmMessage: string | null;
  openingDmButtonLabel: string | null;
  publicReplyEnabled: boolean;
  publicReplyMessage: string | null;
  publicReplyMessages: string[];
  requireFollow: boolean;
  followPromptMessage: string | null;
  followPromptButtonLabel: string | null;
  isActive: boolean;
  wholeWordMatch: boolean;
  instagramAccountId: string;
  instagramAccount: {
    username: string;
    instagramId: string;
  };
  reportShareSlug: string | null;
  reportShareEnabled: boolean;
  reportUrl: string | null;
  createdAt: string;
  _count: { dmLogs: number };
  trackedLinks: Array<{
    id: string;
    slug: string;
    label: string | null;
    destinationUrl: string;
    trackedUrl: string;
    _count: { clicks: number };
  }>;
  analytics: {
    sent: number;
    skipped: number;
    failed: number;
    clicks: number;
    ctr: number;
    topKeywords: { keyword: string; count: number }[];
  };
}

export default function AutomationsPage() {
  const router = useRouter();
  const [automations, setAutomations] = useState<Campaign[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [videos, setVideos] = useState<Record<string, string>>({});
  const [playingVideo, setPlayingVideo] = useState<{
    url: string;
    postUrl: string | null;
  } | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">(
    "all"
  );

  const fetchAutomations = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedAccountId !== "all") {
        params.set("instagramAccountId", selectedAccountId);
      }
      const res = await fetch(
        `/api/automations${params.size ? `?${params}` : ""}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (data.success) setAutomations(data.data);
    } catch (err) {
      console.error("Failed to fetch automations:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedAccountId]);

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
      void fetchAutomations();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchAutomations]);

  useEffect(() => {
    if (automations.length === 0) return;
    let cancelled = false;
    const accountIds = Array.from(
      new Set(automations.map((a) => a.instagramAccountId))
    ).sort();
    const cacheKey = `ig-media:${accountIds.join(",")}`;

    const cached = readCache<{
      thumbs: Record<string, string>;
      videos: Record<string, string>;
    }>(cacheKey, 15 * 60 * 1000);

    if (cached.data) {
      setThumbnails(cached.data.thumbs);
      setVideos(cached.data.videos);
    }

    Promise.all(
      accountIds.map((accountId) =>
        fetch(`/api/instagram/posts?instagramAccountId=${accountId}&limit=50`)
          .then((res) => res.json())
          .then((payload) =>
            payload.success
              ? (payload.data as {
                  id: string;
                  media_type?: string;
                  media_url?: string;
                  thumbnail_url?: string;
                }[])
              : []
          )
          .catch(() => [])
      )
    ).then((lists) => {
      if (cancelled) return;
      const thumbs: Record<string, string> = {};
      const vids: Record<string, string> = {};
      for (const list of lists) {
        for (const media of list) {
          const url = media.thumbnail_url ?? media.media_url;
          if (url) thumbs[media.id] = url;
          if (media.media_type === "VIDEO" && media.media_url) {
            vids[media.id] = media.media_url;
          }
        }
      }
      setThumbnails(thumbs);
      setVideos(vids);
      writeCache(cacheKey, { thumbs, videos: vids });
    });

    return () => {
      cancelled = true;
    };
  }, [automations]);

  useEffect(() => {
    if (!playingVideo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPlayingVideo(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playingVideo]);

  function handleAccountChange(accountId: string) {
    setLoading(true);
    setSelectedAccountId(accountId);
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      await fetch(`/api/automations?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      setAutomations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: !isActive } : a))
      );
    } catch (err) {
      console.error("Failed to toggle:", err);
    }
  }

  async function copyReelUrl(auto: Campaign) {
    setMenuOpenId(null);
    if (!auto.postUrl) return;
    try {
      await navigator.clipboard.writeText(auto.postUrl);
      setCopiedId(auto.id);
      window.setTimeout(
        () => setCopiedId((cur) => (cur === auto.id ? null : cur)),
        1500
      );
    } catch (err) {
      console.error("Failed to copy reel URL:", err);
    }
  }

  async function deleteAutomation(id: string) {
    if (!confirm("Delete this automation? This cannot be undone.")) return;
    try {
      await fetch(`/api/automations?id=${id}`, { method: "DELETE" });
      setAutomations((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  async function duplicateAutomation(auto: Campaign) {
    setMenuOpenId(null);
    const specific = !auto.matchAnyPost && !auto.pendingNextReel;
    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${auto.name} copy`,
          instagramAccountId: auto.instagramAccountId,
          postId: specific ? auto.postId : null,
          postUrl: specific ? auto.postUrl : null,
          matchAnyPost: auto.matchAnyPost,
          pendingNextReel: auto.pendingNextReel,
          matchAnyWord: auto.matchAnyWord,
          keywords: auto.keywords,
          dmMessage: auto.dmMessage,
          openingDmEnabled: auto.openingDmEnabled,
          openingDmMessage: auto.openingDmMessage,
          openingDmButtonLabel: auto.openingDmButtonLabel,
          publicReplyEnabled: auto.publicReplyEnabled,
          publicReplyMessages: auto.publicReplyMessages,
          trackedDestinationUrl: auto.trackedLinks[0]?.destinationUrl ?? "",
          secondaryDestinationUrl: auto.trackedLinks[1]?.destinationUrl ?? "",
          secondaryButtonLabel: auto.trackedLinks[1]?.label ?? "Open link",
          requireFollow: auto.requireFollow,
          followPromptMessage: auto.followPromptMessage,
          followPromptButtonLabel: auto.followPromptButtonLabel,
          wholeWordMatch: auto.wholeWordMatch,
          isActive: false,
        }),
      });
      const data = await res.json();
      if (data.success) void fetchAutomations();
      else console.error("Duplicate failed:", data.error);
    } catch (err) {
      console.error("Failed to duplicate:", err);
    }
  }

  if (loading && automations.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  const query = search.trim().toLowerCase();
  const filtered = automations.filter((a) => {
    if (statusFilter === "active" && !a.isActive) return false;
    if (statusFilter === "paused" && a.isActive) return false;
    if (!query) return true;
    return (
      a.name.toLowerCase().includes(query) ||
      a.keywords.some((k) => k.toLowerCase().includes(query)) ||
      a.dmMessage.toLowerCase().includes(query)
    );
  });

  const activeCount = automations.filter((a) => a.isActive).length;

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Automations
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {activeCount} active · {automations.length} total automation{automations.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {accounts.length > 1 && (
            <AccountSelect
              accounts={accounts}
              value={selectedAccountId}
              onChange={handleAccountChange}
            />
          )}
          <Link
            href="/campaigns/import"
            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Upload className="h-4 w-4 text-slate-400" />
            <span>Import</span>
          </Link>
          <Link href="/campaigns/new">
            <GradientButton icon={Plus} size="md">
              Create automation
            </GradientButton>
          </Link>
        </div>
      </div>

      {/* Search and Filter Row */}
      {automations.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search automations by keyword, post, or message..."
            />
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/60 shrink-0">
            {(["all", "active", "paused"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  statusFilter === s
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {automations.length === 0 && (
        <AnimatedCard className="p-8">
          <EmptyState
            icon={Zap}
            title="No automations yet"
            description="Create your first automation to automatically reply to comments on your Instagram posts and reels."
            action={{
              label: "Create automation",
              icon: Plus,
              onClick: () => router.push("/campaigns/new"),
            }}
          />
        </AnimatedCard>
      )}

      {/* No search matches */}
      {automations.length > 0 && filtered.length === 0 && (
        <AnimatedCard className="p-8 text-center text-sm text-slate-500">
          No automations found matching &ldquo;{search}&rdquo;.
        </AnimatedCard>
      )}

      {/* Automation Cards Grid / List */}
      <div className="space-y-4">
        {filtered.map((auto) => {
          const videoUrl = auto.postId ? videos[auto.postId] : undefined;
          const thumbUrl = auto.postId ? thumbnails[auto.postId] : undefined;

          return (
            <AnimatedCard
              key={auto.id}
              onClick={() => router.push(`/campaigns/${auto.id}`)}
              className="p-5 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-stretch justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Thumbnail / Reel video preview */}
                  {auto.postId && thumbUrl && (
                    <div className="shrink-0 relative group/thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbUrl}
                        alt={auto.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-100 shadow-xs"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      {videoUrl && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlayingVideo({ url: videoUrl, postUrl: auto.postUrl });
                          }}
                          aria-label="Play reel video"
                          className="absolute inset-0 bg-slate-900/40 rounded-xl flex items-center justify-center text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Play className="h-5 w-5 fill-white" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Automation Details */}
                  <div className="min-w-0 flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900 truncate">
                        {auto.name}
                      </h3>
                      <span className="rounded-full bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-0.5">
                        @{auto.instagramAccount.username}
                      </span>
                      <StatusBadge status={auto.isActive ? "active" : "paused"} />

                      {auto.pendingNextReel && (
                        <span className="rounded-full bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-0.5 border border-amber-200">
                          My next post
                        </span>
                      )}

                      {auto.matchAnyPost && (
                        <span className="rounded-full bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 border border-blue-200">
                          Any of my posts
                        </span>
                      )}

                      {auto.requireFollow && (
                        <span className="rounded-full bg-violet-50 text-violet-700 text-xs font-medium px-2.5 py-0.5 border border-violet-200">
                          Require follow
                        </span>
                      )}
                    </div>

                    {/* Keywords Tag Badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-medium mr-1">
                        Keywords:
                      </span>
                      {auto.keywords.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">Any comment</span>
                      ) : (
                        auto.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-200/80"
                          >
                            {kw}
                          </span>
                        ))
                      )}
                    </div>

                    {/* Message Preview */}
                    <p className="text-sm text-slate-500 italic truncate max-w-2xl">
                      &ldquo;{auto.dmMessage}&rdquo;
                    </p>

                    {/* Delivery & Engagement Stats */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                      <span className="font-semibold text-slate-700">
                        {auto._count.dmLogs} runs
                      </span>
                      <span>·</span>
                      <span className="font-semibold text-slate-700">
                        {auto.analytics.ctr}% conversion
                      </span>
                      <span>·</span>
                      <span className="text-emerald-600 font-medium">
                        {auto.analytics.sent} delivered
                      </span>
                      <span>·</span>
                      <span>{auto.analytics.skipped} filtered out</span>
                      <span>·</span>
                      <span>{auto.analytics.clicks} clicks</span>
                    </div>
                  </div>
                </div>

                {/* Right Side Column */}
                <div
                  className="flex flex-col justify-between sm:items-end shrink-0 gap-3 pt-2 sm:pt-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Top Row: Copy Link, Active Toggle Switch & Kebab Menu */}
                  <div className="flex items-center gap-2">
                    {auto.postUrl && (
                      <button
                        type="button"
                        onClick={() => void copyReelUrl(auto)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                      >
                        {copiedId === auto.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-slate-400" />
                            <span>Copy link</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Active Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => toggleActive(auto.id, auto.isActive)}
                      className={`
                        relative w-11 h-6 rounded-full transition-colors cursor-pointer select-none
                        ${auto.isActive ? "bg-orange-500" : "bg-slate-200"}
                      `}
                      aria-label={auto.isActive ? "Pause automation" : "Activate automation"}
                    >
                      <span
                        className={`
                          absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-xs
                          ${auto.isActive ? "left-6" : "left-1"}
                        `}
                      />
                    </button>

                    {/* Kebab dropdown menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setMenuOpenId((cur) => (cur === auto.id ? null : auto.id))
                        }
                        aria-label="More actions"
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {menuOpenId === auto.id && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setMenuOpenId(null)}
                          />
                          <div className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-elevated py-1 animate-in fade-in zoom-in-95 duration-100">
                            <Link
                              href={`/campaigns/${auto.id}`}
                              className="flex items-center gap-2 w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5 text-slate-400" />
                              <span>View details</span>
                            </Link>
                            <Link
                              href={`/campaigns/${auto.id}/edit`}
                              className="flex items-center gap-2 w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                              <span>Edit automation</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => void duplicateAutomation(auto)}
                              className="flex items-center gap-2 w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <CopyPlus className="h-3.5 w-3.5 text-slate-400" />
                              <span>Duplicate</span>
                            </button>
                            {auto.postUrl && (
                              <a
                                href={auto.postUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                                <span>View on Instagram</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setMenuOpenId(null);
                                void deleteAutomation(auto.id);
                              }}
                              className="flex items-center gap-2 w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-50 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: View & Edit Buttons parallel below */}
                  <div className="flex items-center gap-2 pt-1 sm:pt-0">
                    <Link
                      href={`/campaigns/${auto.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all shadow-2xs"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      <span>View</span>
                    </Link>
                    <Link
                      href={`/campaigns/${auto.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-200 bg-orange-50/60 text-xs font-semibold text-orange-700 hover:bg-orange-100/70 hover:border-orange-300 transition-all shadow-2xs"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-orange-500" />
                      <span>Edit</span>
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          );
        })}
      </div>

      {/* Reel Video Lightbox */}
      {playingVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4"
          onClick={() => setPlayingVideo(null)}
        >
          <div
            className="relative flex max-w-full flex-col items-end gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 text-sm">
              {playingVideo.postUrl && (
                <a
                  href={playingVideo.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-300 hover:text-white"
                >
                  Open on Instagram
                </a>
              )}
              <button
                type="button"
                onClick={() => setPlayingVideo(null)}
                className="text-slate-300 hover:text-white text-sm font-medium px-2 py-1 cursor-pointer"
              >
                Close
              </button>
            </div>
            <video
              src={playingVideo.url}
              controls
              autoPlay
              loop
              playsInline
              className="max-h-[80vh] max-w-full rounded-2xl shadow-elevated"
            />
          </div>
        </div>
      )}
    </div>
  );
}
