"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * 100% Pixel-Accurate Native Instagram Mobile Preview
 *
 * Faithfully matches real-life Instagram iOS light mode:
 * - Soft-grey (#f0f2f5) incoming bubbles with black text (#050505)
 * - White rounded button cards inside the grey bubble (matching official Instagram generic templates)
 * - Signature violet-purple (#6b35ff) outgoing user reply bubbles
 * - Full multi-line text wrapping without truncation for long messages & button labels
 * - Comment trigger notification banners, WhatsApp link styling, and native composer
 */

import React from "react";

export type PreviewTab = "post" | "comments" | "dm" | "dmTrigger";

interface CampaignPreviewProps {
  tab: PreviewTab;
  onTabChange: (tab: PreviewTab) => void;
  username: string;
  avatarUrl: string | null;
  postThumb: string | null;
  caption: string;
  sampleComment: string;
  dmTriggerEnabled: boolean;
  publicReplyEnabled: boolean;
  publicReplyMessage: string;
  openingDmEnabled: boolean;
  openingDmMessage: string;
  openingDmButtonLabel: string;
  revealMessage: string;
  hasLink: boolean;
  linkButtonLabel: string;
  linkUrl?: string;
  hasSecondLink: boolean;
  secondLinkButtonLabel: string;
  requireFollow: boolean;
  followPromptMessage: string;
  followPromptButtonLabel: string;
  followUpEnabled: boolean;
  followUpMessage: string;
  followUpDelayMinutes?: number;
}

const SAMPLE_USER = "username";

/* ----------------------------- Native Instagram Icons ----------------------------- */

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Ico = {
  back: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  heart: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  comment: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018.5 8.5z" />
    </svg>
  ),
  share: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  ),
  bookmark: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  ),
  home: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <path d="M3 10l9-7 9 7v9a2 2 0 01-2 2h-4v-6H9v6H5a2 2 0 01-2-2z" />
    </svg>
  ),
  search: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  plus: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  plusCircle: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  reels: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M7 3l3 5M14 3l3 5M10 12l5 3-5 3v-6z" />
    </svg>
  ),
  phone: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  ),
  video: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  addContact: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <circle cx="10" cy="10" r="7" />
      <path d="M8 9.5h.01M12 9.5h.01M8 12.5a3.5 3.5 0 004 0" />
      <path d="M19 6v6M16 9h6" />
    </svg>
  ),
  camera: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  mic: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  image: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  sticker: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={2.5} />
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={2.5} />
    </svg>
  ),
};

function VerifiedBadge({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-[#0095f6] shrink-0 ${className}`}>
      <path d="M10.5 2.5a2 2 0 0 1 3 0l.9.9a2 2 0 0 0 1.4.6h1.3a2 2 0 0 1 2 2v1.3a2 2 0 0 0 .6 1.4l.9.9a2 2 0 0 1 0 3l-.9.9a2 2 0 0 0-.6 1.4v1.3a2 2 0 0 1-2 2h-1.3a2 2 0 0 0-1.4.6l-.9.9a2 2 0 0 1-3 0l-.9-.9a2 2 0 0 0-1.4-.6H6.3a2 2 0 0 1-2-2v-1.3a2 2 0 0 0-.6-1.4l-.9-.9a2 2 0 0 1 0-3l.9-.9a2 2 0 0 0 .6-1.4V6.3a2 2 0 0 1 2-2h1.3a2 2 0 0 0 1.4-.6l.9-.9z" />
      <path
        d="M9 12l2 2 4-4"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ----------------------------- Helpers ----------------------------- */

/**
 * Parses message text to dynamically format URLs, WhatsApp links, and tokens in Instagram blue.
 */
function renderMessageText(text: string, hasLink: boolean, linkUrl?: string) {
  const withName = text.replace(/\{username\}/g, SAMPLE_USER);

  // Regex to split by URLs or {link} token
  const tokenRegex = /(https?:\/\/[^\s]+|\{link\})/g;
  const parts = withName.split(tokenRegex);

  return parts.map((part, i) => {
    if (part === "{link}") {
      return (
        <span
          key={i}
          className={
            linkUrl || hasLink
              ? "text-[#0064e0] underline break-all font-normal"
              : "text-zinc-400 italic"
          }
        >
          {linkUrl || (hasLink ? "your link" : "{link}")}
        </span>
      );
    }
    if (/^https?:\/\/[^\s]+$/i.test(part)) {
      return (
        <span key={i} className="text-[#0064e0] underline break-all font-normal">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function Avatar({
  url,
  size = 28,
  hasStory = false,
}: {
  url: string | null;
  size?: number;
  hasStory?: boolean;
}) {
  const inner = url ? (
    <img
      src={url}
      alt=""
      referrerPolicy="no-referrer"
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="shrink-0 rounded-full bg-black text-white font-bold flex items-center justify-center text-[10px]"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-purple-400">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" />
      </svg>
    </div>
  );

  if (!hasStory) return inner;

  return (
    <div className="rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
      <div className="rounded-full p-[1px] bg-white">{inner}</div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-3 text-[11px] font-semibold text-black tracking-tight shrink-0 select-none bg-white">
      <div className="flex items-center gap-1">
        <span>11:56</span>
        {/* Subtle vibration icon */}
        <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 stroke-black fill-none stroke-2">
          <path d="M2 8v8M6 5v14M18 5v14M22 8v8" />
        </svg>
      </div>
      <div className="flex items-center gap-1.5">
        <svg viewBox="0 0 20 12" className="h-2.5 w-4 fill-black">
          <rect x="0" y="7" width="3" height="5" rx="0.5" />
          <rect x="5" y="4" width="3" height="8" rx="0.5" />
          <rect x="10" y="1.5" width="3" height="10.5" rx="0.5" />
          <rect x="15" y="0" width="3" height="12" rx="0.5" />
        </svg>
        <svg viewBox="0 0 20 14" className="h-3 w-4 fill-black">
          <path d="M10 3c2.7 0 5.2 1 7 2.7l-1.4 1.5A7.9 7.9 0 0010 5c-2.1 0-4 .8-5.6 2.2L3 5.7A10 10 0 0110 3z" />
          <path d="M10 8c1.3 0 2.5.5 3.4 1.3L10 12.8 6.6 9.3A5 5 0 0110 8z" />
        </svg>
        {/* Battery pill with 80% */}
        <div className="flex items-center gap-0.5 border border-black rounded-[4px] px-1 py-0.2 text-[8px] font-bold leading-tight">
          <span>80</span>
        </div>
      </div>
    </div>
  );
}

function Phone({ children }: { children: React.ReactNode }) {
  const btn = "absolute w-[3px] rounded-sm bg-gradient-to-r from-zinc-400 to-zinc-600";
  return (
    <div className="relative w-[320px] max-w-full">
      {/* Physical side buttons */}
      <span className={`${btn} -left-[2px] top-[96px] h-7`} />
      <span className={`${btn} -left-[2px] top-[140px] h-12`} />
      <span className={`${btn} -left-[2px] top-[200px] h-12`} />
      <span className={`${btn} -right-[2px] left-auto top-[150px] h-20 bg-gradient-to-l`} />
      <span className={`${btn} -right-[2px] left-auto top-[250px] h-9 bg-gradient-to-l`} />

      {/* Titanium Frame */}
      <div className="relative rounded-[3.2rem] bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-500 p-[3px] shadow-2xl">
        <div className="rounded-[3rem] bg-black p-[7px]">
          <div className="relative h-[660px] overflow-hidden rounded-[2.55rem] bg-white text-black">
            {/* Dynamic Island */}
            <div className="absolute left-1/2 top-2 z-30 h-5.5 w-24 -translate-x-1/2 rounded-full bg-black pointer-events-none shadow-sm" />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Native Instagram Screens ----------------------------- */

function DmScreen({
  username,
  avatarUrl,
  openingDmEnabled,
  openingDmMessage,
  openingDmButtonLabel,
  revealMessage,
  hasLink,
  linkButtonLabel,
  hasSecondLink,
  secondLinkButtonLabel,
  requireFollow,
  followPromptMessage,
  followPromptButtonLabel,
  followUpEnabled,
  followUpMessage,
  followUpDelayMinutes = 0,
  linkUrl,
  inboundMessage,
}: {
  username: string;
  avatarUrl: string | null;
  openingDmEnabled: boolean;
  openingDmMessage: string;
  openingDmButtonLabel: string;
  revealMessage: string;
  hasLink: boolean;
  linkButtonLabel: string;
  linkUrl?: string;
  hasSecondLink: boolean;
  secondLinkButtonLabel: string;
  requireFollow: boolean;
  followPromptMessage: string;
  followPromptButtonLabel: string;
  followUpEnabled: boolean;
  followUpMessage: string;
  followUpDelayMinutes?: number;
  inboundMessage?: string;
}) {
  return (
    <div className="flex h-full flex-col text-black select-none bg-white">
      <StatusBar />

      {/* Native Instagram Light Mode Header */}
      <div className="flex items-center gap-2.5 px-3 py-2 shrink-0 border-b border-zinc-100 bg-white z-10">
        <span className="w-5 cursor-pointer">{Ico.back("h-5 w-5 text-black")}</span>
        <Avatar url={avatarUrl} size={32} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-[14.5px] font-bold text-black truncate tracking-tight">
              {username}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-black shrink-0">
          <span className="cursor-pointer">{Ico.addContact("h-5 w-5")}</span>
          <span className="cursor-pointer">{Ico.phone("h-5 w-5")}</span>
          <span className="cursor-pointer">{Ico.video("h-5 w-5")}</span>
        </div>
      </div>

      {/* Scrollable Conversation Thread */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3.5 px-3 py-2.5 overscroll-contain preview-scrollbar bg-white">
        {/* Comment Trigger Notification Banner */}
        <div className="space-y-1 my-1">
          <p className="text-center text-[10.5px] font-medium text-zinc-400">
            11:50 AM
          </p>
          <p className="text-center text-[10.5px] text-zinc-500 leading-snug px-3">
            <span className="font-semibold text-zinc-800">{username}</span> messaged you about a comment that you made on their post.{" "}
            <span className="font-semibold text-zinc-800 cursor-pointer hover:underline">
              See post
            </span>
          </p>
        </div>

        {/* 1. Inbound User Keyword DM (if triggered by user message) */}
        {inboundMessage !== undefined && (
          <div className="flex justify-end">
            <div className="max-w-[85%] bg-[#f0f2f5] text-black rounded-[18px] rounded-br-[4px] px-3.5 py-2 text-[13.5px] whitespace-pre-wrap break-words">
              {inboundMessage || "Hyperlocal"}
            </div>
          </div>
        )}

        {/* 2. Opening Greeting Message with White Card Button */}
        {openingDmEnabled && (
          <div className="space-y-2">
            <div className="flex items-end gap-2 max-w-[88%]">
              <Avatar url={avatarUrl} size={28} />
              {/* Grey Container */}
              <div className="flex-1 min-w-0 bg-[#f0f2f5] text-black rounded-[20px] rounded-bl-[4px] p-3 shadow-xs">
                <p className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-[#050505] font-normal">
                  {openingDmMessage || "Hey there! 👋\nThanks for your interest in Hyperlocal! 🚀"}
                </p>
                {/* Embedded White Button Card (100% matching real Instagram) */}
                <div className="mt-2.5 w-full bg-white rounded-xl py-2 px-3 text-center text-[13.5px] font-semibold text-black border border-zinc-200/80 shadow-xs hover:bg-zinc-50 transition-colors cursor-pointer select-none break-words leading-snug">
                  {openingDmButtonLabel || "Explore Hyperlocal ?"}
                </div>
              </div>
            </div>

            {/* Outgoing Tapped User Response (Instagram Signature Purple Pill) */}
            <div className="flex justify-end">
              <div className="max-w-[85%] bg-[#6b35ff] text-white rounded-[20px] rounded-br-[4px] px-4 py-2.5 text-[13.5px] font-normal shadow-xs break-words leading-snug">
                {openingDmButtonLabel || "Explore Hyperlocal ?"}
              </div>
            </div>
          </div>
        )}

        {/* 3. Follow Gate Prompt with White Card Button */}
        {requireFollow && (
          <div className="space-y-2">
            <div className="flex items-end gap-2 max-w-[88%]">
              <Avatar url={avatarUrl} size={28} />
              <div className="flex-1 min-w-0 bg-[#f0f2f5] text-black rounded-[20px] rounded-bl-[4px] p-3 shadow-xs">
                <p className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-[#050505] font-normal">
                  {followPromptMessage ||
                    "Quick favor before I send your link! Please make sure you're following our page so messages deliver reliably."}
                </p>
                <div className="mt-2.5 w-full bg-white rounded-xl py-2 px-3 text-center text-[13.5px] font-semibold text-black border border-zinc-200/80 shadow-xs hover:bg-zinc-50 transition-colors cursor-pointer select-none break-words leading-snug">
                  {followPromptButtonLabel || "I'm following ✅"}
                </div>
              </div>
            </div>

            {/* Outgoing User Tapped Confirmation */}
            <div className="flex justify-end">
              <div className="max-w-[85%] bg-[#6b35ff] text-white rounded-[20px] rounded-br-[4px] px-4 py-2.5 text-[13.5px] font-normal shadow-xs break-words leading-snug">
                {followPromptButtonLabel || "I'm following ✅"}
              </div>
            </div>
          </div>
        )}

        {/* 4. Main Reveal / Link Message with White Card Buttons */}
        {(() => {
          const resolved = revealMessage.replace(/\{username\}/g, SAMPLE_USER);
          const hasToken = resolved.includes("{link}");
          const showCard = hasLink && hasToken;
          const bodyText = showCard
            ? resolved.replace(/\s*\{link\}\s*/g, " ").trim()
            : resolved;

          return (
            <div className="flex items-end gap-2 max-w-[92%]">
              <Avatar url={avatarUrl} size={28} />
              <div className="flex-1 min-w-0 bg-[#f0f2f5] text-black rounded-[20px] rounded-bl-[4px] p-3 shadow-xs">
                {(!showCard || bodyText) && (
                  <p className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-[#050505] font-normal">
                    {!revealMessage
                      ? "Want to see how Hyperlocal can help you take your business online and reach more customers?"
                      : showCard
                      ? bodyText
                      : renderMessageText(revealMessage, hasLink, linkUrl)}
                  </p>
                )}

                {/* Primary White Button Card */}
                {showCard && (
                  <div className="mt-2.5 w-full bg-white rounded-xl py-2.5 px-3.5 text-center text-[13.5px] font-semibold text-black border border-zinc-200/80 shadow-xs hover:bg-zinc-50 transition-colors cursor-pointer select-none break-words leading-snug">
                    {linkButtonLabel || "Check Hyperlocal!"}
                  </div>
                )}

                {/* Secondary White Button Card */}
                {showCard && hasSecondLink && (
                  <div className="mt-2 w-full bg-white rounded-xl py-2.5 px-3.5 text-center text-[13.5px] font-semibold text-black border border-zinc-200/80 shadow-xs hover:bg-zinc-50 transition-colors cursor-pointer select-none break-words leading-snug">
                    {secondLinkButtonLabel || "View Pricing & Demos"}
                  </div>
                )}
              </div>

              {/* Floating Paper Airplane Share Icon */}
              <span className="mb-1 text-zinc-400 hover:text-zinc-600 cursor-pointer shrink-0">
                {Ico.share("h-4 w-4")}
              </span>
            </div>
          );
        })()}

        {/* 5. Follow-Up Thank You Message */}
        {followUpEnabled && (
          <div className="space-y-1.5 pt-1">
            <p className="text-center text-[10.5px] font-medium text-zinc-400">
              {followUpDelayMinutes > 0 ? `${followUpDelayMinutes} min later` : "A few moments later"}
            </p>
            <div className="flex items-end gap-2 max-w-[92%]">
              <Avatar url={avatarUrl} size={28} />
              <div className="flex-1 min-w-0 bg-[#f0f2f5] text-black rounded-[20px] rounded-bl-[4px] p-3 shadow-xs">
                <p className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-[#050505] font-normal">
                  {followUpMessage.trim()
                    ? renderMessageText(followUpMessage, false, undefined)
                    : "Thanks for checking out Hyperlocal! 🙌\n\nIf you have any questions, need help getting started, or want to know more, feel free to connect with our team directly.\n\nYou can reach out on WhatsApp here 👇\nhttps://wa.me/919328972168\n\nHe'll be happy to help! 😊"}
                </p>
              </div>
              <span className="mb-1 text-zinc-400 hover:text-zinc-600 cursor-pointer shrink-0">
                {Ico.share("h-4 w-4")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Native Instagram Light Mode Composer */}
      <div className="flex items-center gap-2 px-3 py-2 shrink-0 border-t border-zinc-100 bg-white">
        {/* Blue-Purple Camera Button */}
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#4f46e5] text-white shadow-xs cursor-pointer">
          {Ico.camera("h-4 w-4")}
        </span>

        {/* Input Capsule */}
        <div className="flex-1 h-9 rounded-full bg-[#f0f2f5] px-3.5 flex items-center justify-between">
          <span className="text-[13px] text-zinc-500">Message…</span>
          <div className="flex items-center gap-2 text-zinc-800">
            <span className="cursor-pointer hover:text-black">{Ico.mic("h-4.5 w-4.5")}</span>
            <span className="cursor-pointer hover:text-black">{Ico.image("h-4.5 w-4.5")}</span>
            <span className="cursor-pointer hover:text-black">{Ico.sticker("h-4.5 w-4.5")}</span>
            <span className="cursor-pointer hover:text-black">{Ico.plusCircle("h-4.5 w-4.5")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostScreen({
  username,
  avatarUrl,
  postThumb,
  caption,
}: {
  username: string;
  avatarUrl: string | null;
  postThumb: string | null;
  caption: string;
}) {
  return (
    <div className="flex h-full flex-col text-black select-none bg-white">
      <StatusBar />

      {/* Top Feed Nav */}
      <div className="flex items-center justify-between px-3 py-2 shrink-0 border-b border-zinc-100">
        <span className="w-6 cursor-pointer">{Ico.back("h-5 w-5 text-black")}</span>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
            {username}
          </p>
          <p className="text-sm font-bold text-black">Posts</p>
        </div>
        <span className="w-6" />
      </div>

      {/* Scrollable Post Content */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain preview-scrollbar">
        {/* Post Author Row */}
        <div className="flex items-center gap-2.5 px-3 py-2 shrink-0">
          <Avatar url={avatarUrl} size={30} hasStory />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[13px] font-bold text-black leading-none">
                {username}
              </span>
              <VerifiedBadge className="h-3 w-3" />
            </div>
            <p className="text-[10px] text-zinc-500 leading-none mt-1">Audio · Original</p>
          </div>
          <span className="ml-auto text-zinc-500 font-bold tracking-widest text-sm">
            ···
          </span>
        </div>

        {/* Media Container */}
        <div className="relative aspect-square w-full bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-100 flex items-center justify-center overflow-hidden">
          {postThumb ? (
            <img
              src={postThumb}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center p-6 space-y-2">
              <div className="h-14 w-14 rounded-2xl bg-orange-500/20 text-orange-600 flex items-center justify-center mx-auto border border-orange-500/30">
                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-orange-500">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-zinc-700">Instagram Reel / Post</p>
              <p className="text-[10.5px] text-zinc-500">Auto-DM trigger configured</p>
            </div>
          )}
          <div className="absolute top-2.5 right-2.5 p-1 rounded-md bg-black/60 backdrop-blur-xs text-white">
            {Ico.reels("h-3.5 w-3.5")}
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex shrink-0 items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 cursor-pointer">
              {Ico.heart("h-6 w-6 text-black hover:text-rose-500 transition-colors")}
              <span className="text-xs font-bold text-black">128</span>
            </span>
            <span className="flex items-center gap-1.5 cursor-pointer">
              {Ico.comment("h-6 w-6 text-black")}
              <span className="text-xs font-bold text-black">14</span>
            </span>
            <span className="cursor-pointer">{Ico.share("h-6 w-6 text-black")}</span>
          </div>
          <span className="cursor-pointer">{Ico.bookmark("h-6 w-6 text-black")}</span>
        </div>

        {/* Likes summary */}
        <div className="px-3 pb-1">
          <p className="text-xs font-bold text-black">128 likes</p>
        </div>

        {/* Caption & Comments */}
        <div className="px-3 pb-4 text-xs leading-relaxed space-y-1">
          <p className="text-zinc-800 whitespace-pre-wrap break-words">
            <span className="font-bold text-black mr-1.5">{username}</span>
            {caption ||
              "Comment \"hyperlocal\" below to get instant access to the guide! 🚀"}
          </p>
          <p className="text-zinc-500 cursor-pointer pt-0.5">View all 14 comments</p>
          <p className="text-[10px] uppercase text-zinc-400 font-medium tracking-wider">
            2 HOURS AGO
          </p>
        </div>
      </div>

      {/* Bottom Instagram 5-Tab Bar */}
      <div className="flex shrink-0 items-center justify-around border-t border-zinc-100 px-2 py-3 text-black bg-white">
        <span className="cursor-pointer">{Ico.home("h-6 w-6 text-black")}</span>
        <span className="cursor-pointer">{Ico.search("h-6 w-6 text-zinc-500")}</span>
        <span className="cursor-pointer">{Ico.plus("h-6 w-6 text-zinc-500")}</span>
        <span className="cursor-pointer">{Ico.reels("h-6 w-6 text-zinc-500")}</span>
        <span className="cursor-pointer">
          <Avatar url={avatarUrl} size={24} />
        </span>
      </div>
    </div>
  );
}

function CommentsScreen({
  username,
  avatarUrl,
  sampleComment,
  publicReplyEnabled,
  publicReplyMessage,
}: {
  username: string;
  avatarUrl: string | null;
  sampleComment: string;
  publicReplyEnabled: boolean;
  publicReplyMessage: string;
}) {
  const reactions = ["❤️", "🙌", "🔥", "👏", "😢", "😍", "😮", "😂"];
  return (
    <div className="flex h-full flex-col text-black select-none bg-white">
      <StatusBar />
      <div className="h-14 bg-zinc-100 shrink-0 border-b border-zinc-200" />

      {/* Native Instagram Comments Drawer */}
      <div className="flex flex-1 min-h-0 flex-col rounded-t-[1.8rem] bg-white px-3.5 pt-2.5 shadow-lg border-t border-zinc-200">
        {/* Drawer Grab Handle */}
        <div className="mx-auto mb-2 h-1 w-9 rounded-full bg-zinc-300 shrink-0" />
        <p className="text-center text-xs font-bold text-black pb-2.5 border-b border-zinc-100 shrink-0">
          Comments
        </p>

        {/* Scrollable Comments Thread */}
        <div className="flex-1 min-h-0 overflow-y-auto py-3 space-y-4 overscroll-contain preview-scrollbar">
          {/* User Comment */}
          <div className="flex items-start gap-2.5">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-black">
                <span className="font-bold mr-1.5">{SAMPLE_USER}</span>
                <span className="text-zinc-400 text-[10.5px]">2h</span>
              </p>
              <p className="text-[13px] text-zinc-800 mt-0.5 whitespace-pre-wrap break-words">
                {sampleComment || "Hyperlocal"}
              </p>
              <div className="flex items-center gap-3.5 mt-1 text-[11px] font-semibold text-zinc-500">
                <span className="cursor-pointer hover:text-black">Reply</span>
                <span className="cursor-pointer hover:text-black">Send</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-0.5 pt-1 text-zinc-400 cursor-pointer">
              {Ico.heart("h-3.5 w-3.5 hover:text-rose-500")}
              <span className="text-[10px]">1</span>
            </div>
          </div>

          {/* Nested Public Creator Reply */}
          {publicReplyEnabled && (
            <div className="flex items-start gap-2 pl-7 pt-1 relative">
              <div className="absolute left-2.5 top-0 bottom-6 w-3 border-l-2 border-b-2 border-zinc-300 rounded-bl-lg" />
              <Avatar url={avatarUrl} size={26} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[12px] font-bold text-black">
                    {username}
                  </span>
                  <VerifiedBadge className="h-3 w-3" />
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-orange-500/10 text-orange-600 uppercase tracking-wider">
                    Author
                  </span>
                  <span className="text-zinc-400 text-[10.5px] ml-1">Now</span>
                </div>
                <p className="text-[12.5px] text-zinc-800 mt-0.5 leading-normal whitespace-pre-wrap break-words">
                  {publicReplyMessage || "Check your DM! 📩"}
                </p>
                <div className="flex items-center gap-3 mt-1 text-[11px] font-semibold text-zinc-500">
                  <span className="cursor-pointer hover:text-black">Reply</span>
                </div>
              </div>
              <div className="flex flex-col items-center pt-1 text-zinc-400">
                {Ico.heart("h-3.5 w-3.5")}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Quick Reactions & Comment Box */}
        <div className="mt-auto shrink-0 pt-2 border-t border-zinc-100">
          <div className="flex items-center justify-between px-1 pb-2.5 text-base">
            {reactions.map((r) => (
              <span
                key={r}
                className="cursor-pointer hover:scale-125 transition-transform"
              >
                {r}
              </span>
            ))}
          </div>

          <div className="mb-3 flex items-center gap-2">
            <Avatar url={avatarUrl} size={28} />
            <div className="flex-1 rounded-full bg-zinc-100 border border-zinc-200 px-3.5 py-2 flex items-center justify-between text-xs">
              <span className="text-zinc-400 truncate">
                Add a comment for {username}…
              </span>
              <span className="text-[#0095f6] font-bold cursor-pointer">Post</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Root Preview Wrapper ----------------------------- */

export default function CampaignPreview(props: CampaignPreviewProps) {
  const { tab, onTabChange } = props;
  const tabs: { key: PreviewTab; label: string }[] = [
    { key: "post", label: "Post" },
    { key: "comments", label: "Comments" },
    { key: "dm", label: "DM" },
    ...(props.dmTriggerEnabled
      ? [{ key: "dmTrigger" as const, label: "DM trigger" }]
      : []),
  ];

  const activeTab: PreviewTab =
    tab === "dmTrigger" && !props.dmTriggerEnabled ? "dm" : tab;

  return (
    <div className="flex flex-col items-center gap-5">
      <Phone>
        {activeTab === "post" && (
          <PostScreen
            username={props.username}
            avatarUrl={props.avatarUrl}
            postThumb={props.postThumb}
            caption={props.caption}
          />
        )}
        {activeTab === "comments" && (
          <CommentsScreen
            username={props.username}
            avatarUrl={props.avatarUrl}
            sampleComment={props.sampleComment}
            publicReplyEnabled={props.publicReplyEnabled}
            publicReplyMessage={props.publicReplyMessage}
          />
        )}
        {activeTab === "dm" && (
          <DmScreen
            username={props.username}
            avatarUrl={props.avatarUrl}
            openingDmEnabled={props.openingDmEnabled}
            openingDmMessage={props.openingDmMessage}
            openingDmButtonLabel={props.openingDmButtonLabel}
            revealMessage={props.revealMessage}
            hasLink={props.hasLink}
            linkButtonLabel={props.linkButtonLabel}
            hasSecondLink={props.hasSecondLink}
            secondLinkButtonLabel={props.secondLinkButtonLabel}
            requireFollow={props.requireFollow}
            followPromptMessage={props.followPromptMessage}
            followPromptButtonLabel={props.followPromptButtonLabel}
            followUpEnabled={props.followUpEnabled}
            followUpMessage={props.followUpMessage}
            followUpDelayMinutes={props.followUpDelayMinutes}
            linkUrl={props.linkUrl}
          />
        )}
        {activeTab === "dmTrigger" && (
          <DmScreen
            username={props.username}
            avatarUrl={props.avatarUrl}
            openingDmEnabled={false}
            openingDmMessage=""
            openingDmButtonLabel=""
            revealMessage={props.revealMessage}
            hasLink={props.hasLink}
            linkButtonLabel={props.linkButtonLabel}
            hasSecondLink={props.hasSecondLink}
            secondLinkButtonLabel={props.secondLinkButtonLabel}
            requireFollow={props.requireFollow}
            followPromptMessage={props.followPromptMessage}
            followPromptButtonLabel={props.followPromptButtonLabel}
            followUpEnabled={props.followUpEnabled}
            followUpMessage={props.followUpMessage}
            followUpDelayMinutes={props.followUpDelayMinutes}
            linkUrl={props.linkUrl}
            inboundMessage={props.sampleComment}
          />
        )}
      </Phone>

      {/* Screen Mode Switcher */}
      <div className="inline-flex rounded-full bg-slate-100 p-1 border border-slate-200/70 shadow-xs">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onTabChange(t.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === t.key
                ? "bg-white font-bold text-slate-900 shadow-xs ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
