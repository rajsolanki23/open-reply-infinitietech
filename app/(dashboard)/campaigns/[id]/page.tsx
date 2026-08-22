"use client";

/**
 * Automation Detail Page
 *
 * Summary of an individual automation on the left, and Insights / Preview tabs
 * on the right with positive copywriting and clean design tokens.
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3, Pause, Play } from "lucide-react";
import CampaignPreview, { type PreviewTab } from "@/components/campaign-preview";
import { AnimatedCard } from "@/components/ui-refined/animated-card";
import { StatusBadge } from "@/components/ui-refined/status-badge";
import { StatCard } from "@/components/ui-refined/stat-card";
import { Zap, Send, MousePointerClick, TrendingUp } from "lucide-react";

interface AutomationDetail {
  id: string;
  name: string;
  postId: string | null;
  postUrl: string | null;
  pendingNextReel: boolean;
  matchAnyPost: boolean;
  keywords: string[];
  matchAnyWord: boolean;
  dmTriggerEnabled: boolean;
  dmMessage: string;
  openingDmEnabled: boolean;
  openingDmMessage: string | null;
  openingDmButtonLabel: string | null;
  linkButtonLabel: string | null;
  requireFollow: boolean;
  followPromptMessage: string | null;
  followPromptButtonLabel: string | null;
  followUpEnabled: boolean;
  followUpMessage: string | null;
  followUpDelayMinutes: number | null;
  publicReplyEnabled: boolean;
  publicReplyMessage: string | null;
  publicReplyMessages: string[];
  isActive: boolean;
  instagramAccountId: string;
  instagramAccount: { username: string };
  trackedLinks?: {
    destinationUrl: string;
    label?: string | null;
    trackedUrl?: string;
  }[];
  analytics: {
    sent: number;
    skipped: number;
    failed: number;
    clicks: number;
    ctr: number;
  };
}

type Tab = "insights" | "preview";

export default function AutomationDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [automation, setAutomation] = useState<AutomationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [postThumb, setPostThumb] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("insights");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("dm");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/automations", { cache: "no-store" })
      .then((r) => r.json())
      .then((payload) => {
        if (!payload.success) return setNotFound(true);
        const found = (payload.data as AutomationDetail[]).find((c) => c.id === id);
        if (!found) return setNotFound(true);
        setAutomation(found);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!automation) return;
    const acct = automation.instagramAccountId;
    fetch(`/api/instagram/profile?instagramAccountId=${acct}`)
      .then((r) => r.json())
      .then((d) =>
        setAvatarUrl(d.success ? d.data.profilePictureUrl ?? null : null)
      )
      .catch(() => setAvatarUrl(null));

    if (automation.postId) {
      fetch(`/api/instagram/posts?instagramAccountId=${acct}&limit=50`)
        .then((r) => r.json())
        .then((payload) => {
          if (!payload.success) return;
          const hit = (
            payload.data as {
              id: string;
              thumbnail_url?: string;
              media_url?: string;
            }[]
          ).find((p) => p.id === automation.postId);
          setPostThumb(hit?.thumbnail_url ?? hit?.media_url ?? null);
        })
        .catch(() => setPostThumb(null));
    }
  }, [automation]);

  async function toggleActive() {
    if (!automation) return;
    setBusy(true);
    try {
      await fetch(`/api/automations?id=${automation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !automation.isActive }),
      });
      setAutomation({ ...automation, isActive: !automation.isActive });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />;
  }
  if (notFound || !automation) {
    return (
      <AnimatedCard className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-500">Automation not found.</p>
        <button
          onClick={() => router.push("/campaigns")}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          Back to automations
        </button>
      </AnimatedCard>
    );
  }

  const publicReplies =
    automation.publicReplyMessages && automation.publicReplyMessages.length > 0
      ? automation.publicReplyMessages
      : automation.publicReplyMessage
        ? [automation.publicReplyMessage]
        : [];
  const hasLink = Boolean(automation.trackedLinks?.[0]?.destinationUrl);
  const hasSecondLink = Boolean(automation.trackedLinks?.[1]?.destinationUrl);

  const trigger = automation.matchAnyPost
    ? "Any of my posts"
    : automation.pendingNextReel
      ? "My next post"
      : "Choose a post or reel";
  const matchText = automation.matchAnyWord
    ? "Any comment"
    : automation.keywords.join(", ") || "No keywords";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/campaigns"
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            aria-label="Back to automations"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-bold text-slate-900">
                {automation.name}
              </h1>
              <StatusBadge status={automation.isActive ? "active" : "paused"} />
            </div>
            <p className="text-xs text-slate-400">
              @{automation.instagramAccount.username}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/campaigns/${automation.id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Edit3 className="h-3.5 w-3.5 text-slate-400" />
            <span>Edit</span>
          </Link>
          <button
            type="button"
            onClick={toggleActive}
            disabled={busy}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-xs ${
              automation.isActive
                ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                : "bg-orange-500 text-white hover:bg-orange-600 shadow-glow"
            }`}
          >
            {automation.isActive ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Activate</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left: config summary */}
        <div className="lg:col-span-7 space-y-4">
          <AnimatedCard className="p-6 space-y-5">
            <Summary title="When someone comments on...">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                {postThumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={postThumb}
                    alt="Post"
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-500">
                    Post
                  </div>
                )}
                <span className="text-sm font-semibold text-slate-900">{trigger}</span>
              </div>
            </Summary>

            <Summary title="Reply when comment contains...">
              <FieldBox>{matchText}</FieldBox>
              {automation.dmTriggerEnabled && (
                <p className="text-xs text-slate-400">
                  Also replies when someone messages{" "}
                  {automation.matchAnyWord ? "anything" : "these words"}.
                </p>
              )}
              {publicReplies.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-xs font-medium text-slate-500">Public reply under post</p>
                  {publicReplies.map((m, i) => (
                    <FieldBox key={i}>{m}</FieldBox>
                  ))}
                </div>
              )}
            </Summary>

            {automation.openingDmEnabled && (
              <Summary title="Opening greeting message">
                <FieldBox>{automation.openingDmMessage || "Opening message"}</FieldBox>
                <FieldBox>{automation.openingDmButtonLabel || "Button label"}</FieldBox>
              </Summary>
            )}

            {automation.requireFollow && (
              <Summary title="Require follow to unlock">
                <FieldBox>
                  {automation.followPromptMessage ||
                    "Quick favor before I send your link! Make sure you're following me, then tap the button below:"}
                </FieldBox>
                <FieldBox>
                  {automation.followPromptButtonLabel || "I'm following"}
                </FieldBox>
              </Summary>
            )}

            <Summary title="Direct message reply">
              <FieldBox>{automation.dmMessage}</FieldBox>
              {hasLink && (
                <FieldBox>{automation.linkButtonLabel || "Open link"}</FieldBox>
              )}
              {hasSecondLink && (
                <FieldBox>
                  {automation.trackedLinks?.[1]?.label || "Open link"}
                </FieldBox>
              )}
            </Summary>

            {hasLink && (
              <Summary title="Tracked link sent">
                {automation.trackedLinks
                  ?.filter((link) => link.destinationUrl)
                  .map((link, i) => (
                    <div key={i} className="space-y-1">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2">
                        <p className="select-all break-all font-mono text-xs text-slate-900 font-medium">
                          {link.trackedUrl ?? link.destinationUrl}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400">
                        {link.label ? `${link.label} · ` : ""}redirects to{" "}
                        <span className="break-all font-medium text-slate-600">
                          {link.destinationUrl}
                        </span>
                      </p>
                    </div>
                  ))}
              </Summary>
            )}

            {automation.followUpEnabled && automation.followUpMessage && (
              <Summary title="Your Follow-up message">
                <FieldBox>{automation.followUpMessage}</FieldBox>
                <p className="text-xs text-slate-400">
                  {automation.followUpDelayMinutes && automation.followUpDelayMinutes > 0
                    ? `Sent ${automation.followUpDelayMinutes} min after the link.`
                    : "Sent right after the link."}
                </p>
              </Summary>
            )}
          </AnimatedCard>
        </div>

        {/* Right: tabs + preview/insights */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setTab("insights")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tab === "insights"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Performance
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tab === "preview"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Preview
            </button>
          </div>

          {tab === "insights" && (
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                title="Messages sent"
                value={automation.analytics.sent}
                icon={Send}
                accent="emerald"
              />
              <StatCard
                title="Link clicks"
                value={automation.analytics.clicks}
                icon={MousePointerClick}
                accent="orange"
              />
              <StatCard
                title="Conversion rate"
                value={`${automation.analytics.ctr}%`}
                icon={TrendingUp}
                accent="violet"
              />
              <StatCard
                title="Filtered out"
                value={automation.analytics.skipped}
                icon={Zap}
                accent="amber"
              />
            </div>
          )}

          {tab === "preview" && (
            <div className="bg-slate-50/70 rounded-3xl p-4 sm:p-6 border border-slate-100 flex flex-col items-center">
              <CampaignPreview
                tab={previewTab}
                onTabChange={setPreviewTab}
                username={automation.instagramAccount.username}
                avatarUrl={avatarUrl}
                postThumb={postThumb}
                caption=""
                sampleComment={
                  automation.matchAnyWord
                    ? "nice!"
                    : automation.keywords[0] ?? "LINK"
                }
                dmTriggerEnabled={automation.dmTriggerEnabled}
                publicReplyEnabled={automation.publicReplyEnabled}
                publicReplyMessage={publicReplies[0] ?? ""}
                openingDmEnabled={automation.openingDmEnabled}
                openingDmMessage={automation.openingDmMessage ?? ""}
                openingDmButtonLabel={automation.openingDmButtonLabel ?? ""}
                revealMessage={automation.dmMessage}
                hasLink={hasLink}
                linkButtonLabel={automation.linkButtonLabel ?? "Open link"}
                linkUrl={
                  automation.trackedLinks?.[0]?.trackedUrl ??
                  automation.trackedLinks?.[0]?.destinationUrl
                }
                hasSecondLink={hasSecondLink}
                secondLinkButtonLabel={
                  automation.trackedLinks?.[1]?.label ?? "Open link"
                }
                requireFollow={automation.requireFollow}
                followPromptMessage={automation.followPromptMessage ?? ""}
                followPromptButtonLabel={
                  automation.followPromptButtonLabel ?? "i'm following"
                }
                followUpEnabled={automation.followUpEnabled ?? false}
                followUpMessage={automation.followUpMessage ?? ""}
                followUpDelayMinutes={automation.followUpDelayMinutes ?? 0}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Summary({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </h2>
      {children}
    </div>
  );
}

function FieldBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 font-medium">
      {children}
    </div>
  );
}
