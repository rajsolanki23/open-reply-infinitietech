"use client";

/**
 * Automation Builder
 *
 * Two-pane automation editor: a creator-friendly control panel on the left and a live
 * Instagram phone preview on the right. Used for creating and editing an automation.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Sparkles,
  ArrowLeft,
  Check,
  Plus,
  Link as LinkIcon,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import AccountSelect, { type AccountOption } from "@/components/account-select";
import PostPicker from "@/components/post-picker";
import CampaignPreview, { type PreviewTab } from "@/components/campaign-preview";
import { readCache, writeCache } from "@/lib/client-cache";
import {
  IMPORT_QUEUE_KEY,
  IMPORT_ACCOUNT_KEY,
  type ImportRow,
} from "@/lib/import-queue";
import { GradientButton } from "@/components/ui-refined/gradient-button";
import { AnimatedCard } from "@/components/ui-refined/animated-card";

type TriggerScope = "specific" | "any" | "next";
type MatchMode = "specific" | "any";

interface LoadedCampaign {
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
  trackedLinks?: { destinationUrl: string; label?: string | null }[];
}

interface CampaignBuilderProps {
  mode: "new" | "edit";
  campaignId?: string;
}

function Section({
  title,
  description,
  step,
  children,
}: {
  title: string;
  description?: string;
  step?: number;
  children: React.ReactNode;
}) {
  return (
    <AnimatedCard className="p-6 space-y-4">
      <div className="flex items-start gap-3">
        {step && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xs font-bold text-orange-600 border border-orange-200">
            {step}
          </span>
        )}
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description && (
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-3 pt-1">{children}</div>
    </AnimatedCard>
  );
}

function RadioCard({
  checked,
  onSelect,
  title,
  description,
  children,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      onClick={onSelect}
      className={`
        rounded-2xl border p-4 transition-all duration-150 cursor-pointer
        ${
          checked
            ? "border-orange-400 bg-orange-50/40 shadow-xs ring-1 ring-orange-400/30"
            : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/40"
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all ${
            checked
              ? "border-orange-500 bg-orange-500 text-white"
              : "border-slate-300 bg-white"
          }`}
        >
          {checked && <span className="h-2 w-2 rounded-full bg-white" />}
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {checked && children && <div className="mt-3 pt-3 border-t border-orange-100">{children}</div>}
    </div>
  );
}

function Toggle({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer select-none ${
        on ? "bg-orange-500" : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform shadow-xs ${
          on ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

export default function CampaignBuilder({ mode, campaignId }: CampaignBuilderProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(mode === "edit");
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  const [triggerScope, setTriggerScope] = useState<TriggerScope>("specific");
  const [postId, setPostId] = useState<string | null>(null);
  const [postUrl, setPostUrl] = useState<string | null>(null);
  const [postThumb, setPostThumb] = useState<string | null>(null);
  const [postCaption, setPostCaption] = useState("");

  const [usedPosts, setUsedPosts] = useState<Record<string, string>>({});

  const [matchMode, setMatchMode] = useState<MatchMode>("specific");
  const [keywordText, setKeywordText] = useState("");
  const [dmTriggerEnabled, setDmTriggerEnabled] = useState(false);

  const [publicReplyEnabled, setPublicReplyEnabled] = useState(false);
  const [publicReplyMessages, setPublicReplyMessages] = useState<string[]>([""]);

  const [openingDmEnabled, setOpeningDmEnabled] = useState(false);
  const [openingDmMessage, setOpeningDmMessage] = useState("");
  const [openingDmButtonLabel, setOpeningDmButtonLabel] = useState("");

  const [dmMessage, setDmMessage] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [trackedDestinationUrl, setTrackedDestinationUrl] = useState("");
  const [linkButtonLabel, setLinkButtonLabel] = useState("Open link");
  const [secondLinkOpen, setSecondLinkOpen] = useState(false);
  const [secondaryDestinationUrl, setSecondaryDestinationUrl] = useState("");
  const [secondaryButtonLabel, setSecondaryButtonLabel] = useState("Open link");
  const [requireFollow, setRequireFollow] = useState(false);
  const [followPromptMessage, setFollowPromptMessage] = useState("");
  const [followPromptButtonLabel, setFollowPromptButtonLabel] =
    useState("i'm following");
  const [followUpEnabled, setFollowUpEnabled] = useState(false);
  const [followUpMessage, setFollowUpMessage] = useState("");
  const [followUpDelayMinutes, setFollowUpDelayMinutes] = useState(0);

  const [previewTab, setPreviewTab] = useState<PreviewTab>("dm");

  const [importQueue, setImportQueue] = useState<ImportRow[] | null>(null);
  const [importTotal, setImportTotal] = useState(0);

  const keywords = useMemo(
    () =>
      keywordText
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    [keywordText]
  );

  useEffect(() => {
    if (!selectedAccountId) return;
    let cancelled = false;
    const cacheKey = `ig-avatar:${selectedAccountId}`;
    const cached = readCache<string | null>(cacheKey, 30 * 60 * 1000);
    if (cached.data !== null) setAvatarUrl(cached.data);

    const params = new URLSearchParams({ instagramAccountId: selectedAccountId });
    fetch(`/api/instagram/profile?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const url = d.success ? d.data.profilePictureUrl ?? null : null;
        setAvatarUrl(url);
        writeCache(cacheKey, url);
      })
      .catch(() => {
        if (!cancelled && cached.data === null) setAvatarUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedAccountId]);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((payload) => {
        if (!payload.success) return;
        const next: AccountOption[] = payload.data.instagramAccounts ?? [];
        setAccounts(next);
        setSelectedAccountId(
          (prev) => prev || payload.data.selectedInstagramAccountId || next[0]?.id || ""
        );
      })
      .catch(() => setAccounts([]));
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !campaignId) return;
    fetch("/api/automations", { cache: "no-store" })
      .then((r) => r.json())
      .then((payload) => {
        if (!payload.success) return setNotFound(true);
        const c = (payload.data as LoadedCampaign[]).find((x) => x.id === campaignId);
        if (!c) return setNotFound(true);
        setName(c.name);
        setSelectedAccountId(c.instagramAccountId);
        setTriggerScope(
          c.matchAnyPost ? "any" : c.pendingNextReel ? "next" : "specific"
        );
        setPostId(c.postId);
        setPostUrl(c.postUrl);
        setMatchMode(c.matchAnyWord ? "any" : "specific");
        setKeywordText(c.keywords.join(", "));
        setDmTriggerEnabled(c.dmTriggerEnabled ?? false);
        setPublicReplyEnabled(c.publicReplyEnabled);
        setPublicReplyMessages(
          c.publicReplyMessages?.length
            ? c.publicReplyMessages
            : c.publicReplyMessage
              ? [c.publicReplyMessage]
              : [""]
        );
        setOpeningDmEnabled(c.openingDmEnabled);
        setOpeningDmMessage(c.openingDmMessage ?? "");
        setOpeningDmButtonLabel(c.openingDmButtonLabel ?? "");
        setDmMessage(c.dmMessage);
        setLinkButtonLabel(c.linkButtonLabel ?? "Open link");
        setIsActive(c.isActive);
        const link = c.trackedLinks?.[0]?.destinationUrl ?? "";
        setTrackedDestinationUrl(link);
        setLinkOpen(Boolean(link));
        const secondLink = c.trackedLinks?.[1];
        setSecondaryDestinationUrl(secondLink?.destinationUrl ?? "");
        setSecondaryButtonLabel(secondLink?.label ?? "Open link");
        setSecondLinkOpen(Boolean(secondLink?.destinationUrl));
        setRequireFollow(c.requireFollow ?? false);
        setFollowPromptMessage(c.followPromptMessage ?? "");
        setFollowPromptButtonLabel(
          c.followPromptButtonLabel ?? "i'm following"
        );
        setFollowUpEnabled(c.followUpEnabled ?? false);
        setFollowUpMessage(c.followUpMessage ?? "");
        setFollowUpDelayMinutes(c.followUpDelayMinutes ?? 0);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [mode, campaignId]);

  useEffect(() => {
    if (!selectedAccountId) return;
    let cancelled = false;
    fetch("/api/automations", { cache: "no-store" })
      .then((r) => r.json())
      .then((payload) => {
        if (cancelled || !payload.success) return;
        const map: Record<string, string> = {};
        for (const a of payload.data as LoadedCampaign[]) {
          if (!a.postId) continue;
          if (a.instagramAccountId !== selectedAccountId) continue;
          if (mode === "edit" && a.id === campaignId) continue;
          map[a.postId] = a.name;
        }
        setUsedPosts(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selectedAccountId, mode, campaignId]);

  function prefillFromRow(row: ImportRow) {
    setName(row.name ?? "");
    setTriggerScope("specific");
    setPostId(null);
    setPostUrl(null);
    setPostThumb(null);
    setPostCaption("");
    setMatchMode("specific");
    setKeywordText((row.keywords ?? []).join(", "));
    setDmMessage(row.dmMessage ?? "");
    setPublicReplyEnabled(Boolean(row.publicReply));
    setPublicReplyMessages(row.publicReply ? [row.publicReply] : [""]);
    const hasOpening = Boolean(row.openingDmMessage);
    setOpeningDmEnabled(hasOpening);
    setOpeningDmMessage(row.openingDmMessage ?? "");
    setOpeningDmButtonLabel(
      row.openingDmButtonLabel || (hasOpening ? "Send link" : "")
    );
    const link = row.trackedUrl ?? "";
    setTrackedDestinationUrl(link);
    setLinkOpen(Boolean(link));
    setError(null);
  }

  useEffect(() => {
    if (mode !== "new") return;
    try {
      const raw = window.localStorage.getItem(IMPORT_QUEUE_KEY);
      const acct = window.localStorage.getItem(IMPORT_ACCOUNT_KEY);
      if (!raw) return;
      const queue = JSON.parse(raw) as ImportRow[];
      if (!Array.isArray(queue) || queue.length === 0) return;
      setImportQueue(queue);
      setImportTotal(queue.length);
      if (acct) setSelectedAccountId(acct);
      prefillFromRow(queue[0]);
    } catch {
      // ignore
    }
  }, [mode]);

  const username =
    accounts.find((a) => a.id === selectedAccountId)?.username ?? "yourbrand";

  function handlePostSelect(
    id: string,
    url?: string,
    thumb?: string,
    caption?: string
  ) {
    setPostId(id);
    setPostUrl(url ?? null);
    setPostThumb(thumb ?? null);
    setPostCaption(caption ?? "");
  }

  function ensureLinkToken() {
    setDmMessage((cur) => (cur.includes("{link}") ? cur : `${cur.trim()} {link}`.trim()));
  }

  async function handleSubmit(activeValue: boolean) {
    setError(null);

    if (!selectedAccountId) return setError("Please connect an Instagram account first.");
    if (triggerScope === "specific" && !postId)
      return setError("Please choose a post or reel to trigger the automation.");
    if (matchMode === "specific" && keywords.length === 0)
      return setError("Please add at least one keyword, or choose 'Any word'.");
    if (!dmMessage.trim()) return setError("Please write the reply message to send.");
    if (openingDmEnabled && (!openingDmMessage.trim() || !openingDmButtonLabel.trim()))
      return setError("Your opening message needs both text and a button label.");

    setSaving(true);

    const payload = {
      name: name.trim() || `@${username} — Auto-reply`,
      instagramAccountId: selectedAccountId,
      postId: triggerScope === "specific" ? postId : null,
      postUrl: triggerScope === "specific" ? postUrl : null,
      matchAnyPost: triggerScope === "any",
      pendingNextReel: triggerScope === "next",
      matchAnyWord: matchMode === "any",
      keywords: matchMode === "any" ? [] : keywords,
      dmTriggerEnabled,
      dmMessage,
      openingDmEnabled,
      openingDmMessage: openingDmEnabled ? openingDmMessage : null,
      openingDmButtonLabel: openingDmEnabled ? openingDmButtonLabel : null,
      publicReplyEnabled,
      publicReplyMessages: publicReplyEnabled
        ? publicReplyMessages.map((m) => m.trim()).filter(Boolean)
        : [],
      trackedDestinationUrl: trackedDestinationUrl.trim() || "",
      linkButtonLabel: linkButtonLabel.trim() || "Open link",
      secondaryDestinationUrl: secondaryDestinationUrl.trim() || "",
      secondaryButtonLabel: secondaryButtonLabel.trim() || "Open link",
      requireFollow,
      followPromptMessage: requireFollow ? followPromptMessage.trim() : "",
      followPromptButtonLabel: requireFollow
        ? followPromptButtonLabel.trim() || "i'm following"
        : "",
      followUpEnabled,
      followUpMessage: followUpEnabled ? followUpMessage.trim() : "",
      followUpDelayMinutes: followUpEnabled ? followUpDelayMinutes : 0,
      isActive: activeValue,
    };

    try {
      const res =
        mode === "new"
          ? await fetch("/api/automations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/automations?id=${campaignId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
      const data = await res.json();
      if (data.success) {
        if (triggerScope === "specific" && postId) {
          const assignedPostId = postId;
          setUsedPosts((prev) => ({ ...prev, [assignedPostId]: payload.name }));
        }
        if (importQueue && importQueue.length > 1) {
          const remaining = importQueue.slice(1);
          try {
            window.localStorage.setItem(
              IMPORT_QUEUE_KEY,
              JSON.stringify(remaining)
            );
          } catch {
            // ignore
          }
          setImportQueue(remaining);
          prefillFromRow(remaining[0]);
          setSaving(false);
          if (typeof window !== "undefined") window.scrollTo({ top: 0 });
          return;
        }
        if (importQueue) {
          try {
            window.localStorage.removeItem(IMPORT_QUEUE_KEY);
            window.localStorage.removeItem(IMPORT_ACCOUNT_KEY);
          } catch {
            // ignore
          }
        }
        router.push("/campaigns");
        router.refresh();
      } else {
        const fieldErrors = data.details?.fieldErrors as
          | Record<string, string[]>
          | undefined;
        const firstField = fieldErrors && Object.keys(fieldErrors)[0];
        setError(
          firstField
            ? `${firstField}: ${fieldErrors[firstField][0]}`
            : data.error ?? "Could not save automation"
        );
        if (typeof window !== "undefined")
          window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setError("Could not save automation");
    } finally {
      setSaving(false);
    }
  }

  function skipRow() {
    if (!importQueue) return;
    setError(null);
    if (importQueue.length > 1) {
      const remaining = importQueue.slice(1);
      try {
        window.localStorage.setItem(IMPORT_QUEUE_KEY, JSON.stringify(remaining));
      } catch {
        // ignore
      }
      setImportQueue(remaining);
      prefillFromRow(remaining[0]);
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
      return;
    }
    try {
      window.localStorage.removeItem(IMPORT_QUEUE_KEY);
      window.localStorage.removeItem(IMPORT_ACCOUNT_KEY);
    } catch {
      // ignore
    }
    router.push("/campaigns");
    router.refresh();
  }

  if (loading) {
    return <div className="h-80 rounded-2xl bg-slate-100 animate-pulse" />;
  }

  if (notFound) {
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

  return (
    <div className="space-y-6">
      {importQueue && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50/70 px-4 py-3 text-sm flex items-center justify-between">
          <span className="font-semibold text-orange-950">
            Importing {importTotal - importQueue.length + 1} of {importTotal}.
          </span>
          <span className="text-orange-800 text-xs">
            Review fields, pick the reel, and publish to load the next one.
          </span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/campaigns")}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            aria-label="Back to automations"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 truncate">
              {mode === "edit" ? name || "Edit automation" : "Create automation"}
            </h1>
            <p className="text-xs text-slate-400">
              Configure trigger posts, keywords, and instant DM reply
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {importQueue && (
            <button
              type="button"
              onClick={skipRow}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              {importQueue.length > 1 ? "Skip" : "Skip & finish"}
            </button>
          )}

          {mode === "edit" && (
            <button
              type="button"
              onClick={() => handleSubmit(!isActive)}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {isActive ? "Pause" : "Activate"}
            </button>
          )}

          <GradientButton
            onClick={() => handleSubmit(mode === "new" ? true : isActive)}
            loading={saving}
            icon={Sparkles}
            size="md"
          >
            {mode === "new" ? "Publish automation" : "Save changes"}
          </GradientButton>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Main Grid: Form Controls (60%) + Phone Preview (40%) */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Form Steps */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6">
          {/* Automation Name & Account */}
          <AnimatedCard className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Automation name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Spring collection giveaway"
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                maxLength={100}
              />
            </div>

            {accounts.length > 1 && (
              <div className="pt-2">
                <AccountSelect
                  accounts={accounts}
                  value={selectedAccountId}
                  onChange={(id) => {
                    setSelectedAccountId(id);
                    setPostId(null);
                    setPostUrl(null);
                    setPostThumb(null);
                  }}
                  includeAll={false}
                  label="Instagram account"
                />
              </div>
            )}
          </AnimatedCard>

          {/* Step 1: Choose post */}
          <Section
            step={1}
            title="When someone comments on..."
            description="Choose which posts or reels will trigger this automatic reply"
          >
            <div className="space-y-3">
              <RadioCard
                checked={triggerScope === "specific"}
                onSelect={() => setTriggerScope("specific")}
                title="Choose a post or reel"
                description="Select an existing post from your Instagram feed"
              >
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2">
                  <PostPicker
                    selectedPostId={postId}
                    instagramAccountId={selectedAccountId}
                    usedPostIds={usedPosts}
                    onSelect={handlePostSelect}
                  />
                </div>
              </RadioCard>

              <RadioCard
                checked={triggerScope === "any"}
                onSelect={() => setTriggerScope("any")}
                title="Any of my posts"
                description="Trigger on all published posts and reels"
              />

              <RadioCard
                checked={triggerScope === "next"}
                onSelect={() => setTriggerScope("next")}
                title="My next post"
                description="Automatically apply to the very next reel you publish"
              />
            </div>
          </Section>

          {/* Step 2: Keywords */}
          <Section
            step={2}
            title="Reply when comment contains..."
            description="Set the trigger keywords that viewers must comment"
          >
            <div className="space-y-3">
              <RadioCard
                checked={matchMode === "specific"}
                onSelect={() => setMatchMode("specific")}
                title="These keywords"
                description="Triggers only when the comment includes specified keywords"
              >
                <div className="space-y-2">
                  <input
                    value={keywordText}
                    onChange={(e) => setKeywordText(e.target.value)}
                    placeholder="e.g. LINK, GUIDE, ACCESS"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  />
                  <p className="text-xs text-slate-400">
                    Separate multiple keywords with commas (e.g. link, guide, send)
                  </p>
                </div>
              </RadioCard>

              <RadioCard
                checked={matchMode === "any"}
                onSelect={() => setMatchMode("any")}
                title="Any comment"
                description="Replies to every single comment regardless of what they write"
              />

              {/* DM Trigger option */}
              <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Also reply when someone messages these keywords
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Replies if someone DMs you the keyword directly
                  </p>
                </div>
                <Toggle
                  on={dmTriggerEnabled}
                  onToggle={() => setDmTriggerEnabled(!dmTriggerEnabled)}
                />
              </div>

              {/* Public comment reply */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Public comment reply
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Post an automatic comment under their comment
                    </p>
                  </div>
                  <Toggle
                    on={publicReplyEnabled}
                    onToggle={() => setPublicReplyEnabled(!publicReplyEnabled)}
                  />
                </div>

                {publicReplyEnabled && (
                  <div className="space-y-2 pt-2 border-t border-slate-200/60">
                    {publicReplyMessages.map((msg, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          value={msg}
                          onChange={(e) =>
                            setPublicReplyMessages((prev) =>
                              prev.map((m, idx) => (idx === i ? e.target.value : m))
                            )
                          }
                          placeholder="Sent you a message! 📩"
                          maxLength={1000}
                          className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                        />
                        {publicReplyMessages.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setPublicReplyMessages((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              )
                            }
                            className="p-2 text-slate-400 hover:text-rose-500 cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {publicReplyMessages.length < 10 && (
                      <button
                        type="button"
                        onClick={() =>
                          setPublicReplyMessages((prev) => [...prev, ""])
                        }
                        className="text-xs font-semibold text-orange-600 hover:underline cursor-pointer"
                      >
                        + Add alternate reply (randomly selected)
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* Step 3: Write reply */}
          <Section
            step={3}
            title="Write your reply message"
            description="The message and link they will receive in their Instagram inbox"
          >
            {/* Opening DM */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Opening greeting message
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Send a quick greeting before revealing the link
                  </p>
                </div>
                <Toggle
                  on={openingDmEnabled}
                  onToggle={() => setOpeningDmEnabled(!openingDmEnabled)}
                />
              </div>

              {openingDmEnabled && (
                <div className="space-y-2 pt-2 border-t border-slate-200/60">
                  <textarea
                    value={openingDmMessage}
                    onChange={(e) => setOpeningDmMessage(e.target.value)}
                    placeholder="Hey! So happy you're here 😊 Tap below to get your link:"
                    rows={3}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none resize-none"
                    maxLength={1000}
                  />
                  <input
                    value={openingDmButtonLabel}
                    onChange={(e) => setOpeningDmButtonLabel(e.target.value)}
                    placeholder="Send me the link"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                    maxLength={64}
                  />
                </div>
              )}
            </div>

            {/* Follow Requirement */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Require follow to unlock
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ask them to follow you before delivering the link
                  </p>
                </div>
                <Toggle
                  on={requireFollow}
                  onToggle={() => setRequireFollow(!requireFollow)}
                />
              </div>

              {requireFollow && (
                <div className="space-y-2 pt-2 border-t border-slate-200/60">
                  <textarea
                    value={followPromptMessage}
                    onChange={(e) => setFollowPromptMessage(e.target.value)}
                    placeholder="Quick favor before I send your link! Make sure you're following me, then tap the button below:"
                    rows={3}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none resize-none"
                    maxLength={1000}
                  />
                  <input
                    value={followPromptButtonLabel}
                    onChange={(e) => setFollowPromptButtonLabel(e.target.value)}
                    placeholder="I'm following"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                    maxLength={20}
                  />
                </div>
              )}
            </div>

            {/* Main Message with Link */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
              <p className="text-sm font-semibold text-slate-900">
                Main message &amp; link
              </p>
              <textarea
                value={dmMessage}
                onChange={(e) => setDmMessage(e.target.value)}
                placeholder="Here is the link you requested: {link} Have an amazing day!"
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none resize-none"
                maxLength={1000}
              />

              {linkOpen ? (
                <div className="space-y-2 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-orange-500 shrink-0" />
                    <input
                      value={trackedDestinationUrl}
                      onChange={(e) => setTrackedDestinationUrl(e.target.value)}
                      onBlur={ensureLinkToken}
                      placeholder="https://yourwebsite.com/resource"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                    />
                  </div>
                  <input
                    value={linkButtonLabel}
                    onChange={(e) => setLinkButtonLabel(e.target.value)}
                    placeholder="Button label (e.g. Open link)"
                    maxLength={20}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                  />

                  {secondLinkOpen ? (
                    <div className="space-y-2 pt-2 border-t border-slate-200/60">
                      <input
                        value={secondaryDestinationUrl}
                        onChange={(e) => setSecondaryDestinationUrl(e.target.value)}
                        placeholder="https://yourwebsite.com/second"
                        className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                      />
                      <input
                        value={secondaryButtonLabel}
                        onChange={(e) => setSecondaryButtonLabel(e.target.value)}
                        placeholder="Second button label"
                        maxLength={20}
                        className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSecondLinkOpen(true)}
                      className="w-full py-2 text-xs font-semibold text-orange-600 hover:bg-orange-50/50 rounded-xl border border-dashed border-orange-200 transition-colors cursor-pointer"
                    >
                      + Add a second button
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setLinkOpen(true)}
                  className="w-full py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-50/50 rounded-xl border border-dashed border-orange-200 transition-colors cursor-pointer"
                >
                  + Add tracked link button
                </button>
              )}
              <p className="text-xs text-slate-400">
                Use <code className="text-orange-600 font-mono">{"{username}"}</code> to personalize and <code className="text-orange-600 font-mono">{"{link}"}</code> for link position.
              </p>
            </div>

            {/* Follow-Up Message */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Your Follow-up message
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Send a delayed message after they tap through your link
                  </p>
                </div>
                <Toggle
                  on={followUpEnabled}
                  onToggle={() => setFollowUpEnabled(!followUpEnabled)}
                />
              </div>

              {followUpEnabled && (
                <div className="space-y-3 pt-2 border-t border-slate-200/60">
                  <textarea
                    value={followUpMessage}
                    onChange={(e) => setFollowUpMessage(e.target.value)}
                    placeholder="Thanks for checking out Hyperlocal! 🙌&#10;&#10;If you have any questions, need help getting started, or want to know more, feel free to connect with our team directly."
                    rows={4}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none resize-none"
                    maxLength={1000}
                  />

                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-xs text-slate-500 whitespace-nowrap">Send it</span>
                    <input
                      type="number"
                      min={0}
                      max={1440}
                      value={followUpDelayMinutes}
                      onChange={(e) =>
                        setFollowUpDelayMinutes(
                          Math.max(0, Math.min(1440, parseInt(e.target.value, 10) || 0))
                        )
                      }
                      className="w-16 h-9 px-2.5 text-center rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                    />
                    <span className="text-xs text-slate-500 whitespace-nowrap">minutes after the link</span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sent {followUpDelayMinutes || 5} min after they tap through.{" "}
                    <code className="text-orange-600 font-mono text-[10px]">{"{username}"}</code> personalizes it.
                    Max 24 hours, to stay inside Instagram&apos;s messaging window.
                  </p>
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* Right Column: Sticky Live Phone Mockup Preview */}
        <div className="lg:col-span-5 xl:col-span-5 sticky top-20">
          <div className="bg-slate-50/70 rounded-3xl p-4 sm:p-6 border border-slate-100 flex flex-col items-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Live Instagram Preview
            </p>
            <CampaignPreview
              tab={previewTab}
              onTabChange={setPreviewTab}
              username={username}
              avatarUrl={avatarUrl}
              postThumb={postThumb}
              caption={postCaption}
              sampleComment={keywords[0] ?? ""}
              dmTriggerEnabled={dmTriggerEnabled}
              publicReplyEnabled={publicReplyEnabled}
              publicReplyMessage={publicReplyMessages.find((m) => m.trim()) ?? ""}
              openingDmEnabled={openingDmEnabled}
              openingDmMessage={openingDmMessage}
              openingDmButtonLabel={openingDmButtonLabel}
              revealMessage={dmMessage}
              hasLink={Boolean(trackedDestinationUrl.trim())}
              linkButtonLabel={linkButtonLabel || "Open link"}
              linkUrl={trackedDestinationUrl.trim() || undefined}
              hasSecondLink={
                secondLinkOpen && Boolean(secondaryDestinationUrl.trim())
              }
              secondLinkButtonLabel={secondaryButtonLabel || "Open link"}
              requireFollow={requireFollow}
              followPromptMessage={followPromptMessage}
              followPromptButtonLabel={followPromptButtonLabel || "i'm following"}
              followUpEnabled={followUpEnabled}
              followUpMessage={followUpMessage}
              followUpDelayMinutes={followUpDelayMinutes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
