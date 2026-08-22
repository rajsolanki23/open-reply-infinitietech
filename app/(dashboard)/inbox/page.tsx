"use client";

/**
 * Messages (Inbox)
 *
 * Instagram DM conversations for the selected account, with live message
 * history, unread indicator, avatar list, and gradient reply composer.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, ArrowLeft, MoreVertical, MessageCircle, AlertCircle } from "lucide-react";
import AccountSelect, { type AccountOption } from "@/components/account-select";
import { readCache, writeCache } from "@/lib/client-cache";
import type { ConversationListItem } from "@/app/api/instagram/conversations/route";
import type { ThreadMessage } from "@/app/api/instagram/conversations/[id]/route";
import { Avatar } from "@/components/ui-refined/avatar";
import { SearchInput } from "@/components/ui-refined/search-input";
import { AnimatedCard } from "@/components/ui-refined/animated-card";

const POLL_MS = 12_000;
const CACHE_MAX_AGE_MS = 60_000;
const convCacheKey = (accountId: string) => `inbox:convs:${accountId}`;
const msgCacheKey = (conversationId: string) => `inbox:msgs:${conversationId}`;

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function InboxPage() {
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem("inbox:selectedAccount") ?? "";
  });

  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const [convError, setConvError] = useState<string | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    fetch("/api/instagram/accounts")
      .then((r) => r.json())
      .then((payload) => {
        if (!payload.success) return;
        const next: AccountOption[] = payload.data.instagramAccounts ?? [];
        setAccounts(next);
        setSelectedAccountId((prev) => {
          const stillValid = prev && next.some((a) => a.id === prev);
          return stillValid
            ? prev
            : payload.data.selectedInstagramAccountId || next[0]?.id || "";
        });
      })
      .catch(() => setAccounts([]));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !selectedAccountId) return;
    window.sessionStorage.setItem("inbox:selectedAccount", selectedAccountId);
  }, [selectedAccountId]);

  const loadConversations = useCallback(
    async (silent: boolean) => {
      if (!selectedAccountId) return;
      if (!silent) setConvLoading(true);
      try {
        const res = await fetch(
          `/api/instagram/conversations?instagramAccountId=${selectedAccountId}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (data.success) {
          setConversations(data.data.conversations);
          writeCache(convCacheKey(selectedAccountId), data.data.conversations);
          setConvError(null);
        } else if (!silent) {
          setConvError(data.error ?? "Could not load conversations");
        }
      } catch {
        if (!silent) setConvError("Could not load conversations");
      } finally {
        if (!silent) setConvLoading(false);
      }
    },
    [selectedAccountId]
  );

  useEffect(() => {
    if (!selectedAccountId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveId(null);
    setMessages([]);
    const cached = readCache<ConversationListItem[]>(
      convCacheKey(selectedAccountId),
      CACHE_MAX_AGE_MS
    );
    if (cached.data) {
      setConversations(cached.data);
      setConvLoading(false);
    } else {
      setConversations([]);
      setConvLoading(true);
    }
    void loadConversations(Boolean(cached.data));
    const timer = window.setInterval(() => void loadConversations(true), POLL_MS);
    return () => window.clearInterval(timer);
  }, [selectedAccountId, loadConversations]);

  const loadMessages = useCallback(
    async (conversationId: string, silent: boolean) => {
      if (!selectedAccountId) return;
      if (!silent) setThreadLoading(true);
      try {
        const res = await fetch(
          `/api/instagram/conversations/${conversationId}?instagramAccountId=${selectedAccountId}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (data.success) {
          setMessages(data.data.messages);
          writeCache(msgCacheKey(conversationId), data.data.messages);
        }
      } catch {
        // keep shown
      } finally {
        if (!silent) setThreadLoading(false);
      }
    },
    [selectedAccountId]
  );

  useEffect(() => {
    if (!activeId) return;
    const cached = readCache<ThreadMessage[]>(
      msgCacheKey(activeId),
      CACHE_MAX_AGE_MS
    );
    if (cached.data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages(cached.data);
      setThreadLoading(false);
    } else {
      setMessages([]);
      setThreadLoading(true);
    }
    void loadMessages(activeId, Boolean(cached.data));
    const timer = window.setInterval(
      () => void loadMessages(activeId, true),
      POLL_MS
    );
    return () => window.clearInterval(timer);
  }, [activeId, loadMessages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function openConversation(id: string) {
    setActiveId(id);
    setSendError(null);
    const cached = readCache<ThreadMessage[]>(msgCacheKey(id), CACHE_MAX_AGE_MS);
    setMessages(cached.data ?? []);
    setThreadLoading(!cached.data);
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || !active?.contact.id || sending) return;
    setSending(true);
    setSendError(null);

    const optimistic: ThreadMessage = {
      id: `optimistic-${Date.now()}`,
      text,
      fromMe: true,
      fromUsername: null,
      createdTime: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");

    try {
      const res = await fetch("/api/instagram/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagramAccountId: selectedAccountId,
          recipientId: active.contact.id,
          text,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadMessages(active.id, true);
        void loadConversations(true);
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setDraft(text);
        setSendError(data.error ?? "Could not send message — check Instagram 24-hour messaging window");
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(text);
      setSendError("Could not send message");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  const filteredConversations = conversations.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (c.contact.username ?? "").toLowerCase().includes(term) ||
      (c.lastMessage?.text ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header with Account Select */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Messages
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Read and reply directly to Instagram direct messages
          </p>
        </div>

        {accounts.length > 1 && (
          <div className="shrink-0">
            <AccountSelect
              accounts={accounts}
              value={selectedAccountId}
              onChange={setSelectedAccountId}
              includeAll={false}
            />
          </div>
        )}
      </div>

      {/* Main Chat Interface */}
      <AnimatedCard className="overflow-hidden p-0 border border-slate-100 shadow-card">
        <div className="grid h-[calc(100dvh-13rem)] min-h-[500px] grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: Conversation list */}
          <div
            className={`min-h-0 flex-col border-b md:border-b-0 md:border-r border-slate-100 bg-white md:col-span-4 xl:col-span-4 ${
              active ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="p-3.5 border-b border-slate-100 space-y-3">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search conversations..."
                className="w-full"
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-slate-50">
              {convLoading ? (
                <div className="p-6 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-slate-100" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 w-24 bg-slate-100 rounded" />
                        <div className="h-3 w-36 bg-slate-100 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : convError ? (
                <div className="p-6 text-center text-sm text-rose-600 space-y-2">
                  <AlertCircle className="h-6 w-6 mx-auto text-rose-400" />
                  <p>{convError}</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-10 text-center text-sm text-slate-400">
                  <MessageCircle className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p>No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isActive = c.id === activeId;
                  const username = c.contact.username ?? "user";

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => openConversation(c.id)}
                      className={`
                        w-full flex items-center gap-3 p-3.5 text-left transition-colors cursor-pointer
                        ${
                          isActive
                            ? "bg-orange-50/70 border-l-3 border-orange-500"
                            : "hover:bg-slate-50/80"
                        }
                      `}
                    >
                      <div className="relative shrink-0">
                        <Avatar name={username} size="md" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            @{username}
                          </p>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            {formatTime(c.updatedTime)}
                          </span>
                        </div>
                        {c.lastMessage && (
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {c.lastMessage.fromMe ? "You: " : ""}
                            {c.lastMessage.text || "(no text)"}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Chat thread */}
          <div
            className={`min-h-0 flex-col bg-slate-50/30 md:col-span-8 xl:col-span-8 ${
              active ? "flex" : "hidden md:flex"
            }`}
          >
            {!active ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-400">
                <div className="h-16 w-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-400 mb-3">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  Select a conversation
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Choose a chat from the left to read message history and reply directly.
                </p>
              </div>
            ) : (
              <>
                {/* Chat Top Header */}
                <div className="flex items-center justify-between gap-3 px-6 py-3.5 border-b border-slate-100 bg-white">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => setActiveId(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-50 md:hidden cursor-pointer"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <Avatar name={active.contact.username ?? "user"} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        @{active.contact.username ?? "user"}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Active conversation</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer"
                    aria-label="Thread options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                {/* Messages Body */}
                <div
                  ref={scrollRef}
                  className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-6 bg-slate-50/20"
                >
                  {threadLoading && messages.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-10">
                      Loading messages...
                    </p>
                  ) : messages.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-10">
                      No messages in this thread yet.
                    </p>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${
                          m.fromMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`
                            max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-xs
                            ${
                              m.fromMe
                                ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-tr-xs"
                                : "bg-white text-slate-900 border border-slate-100 rounded-tl-xs"
                            }
                          `}
                        >
                          <p className="whitespace-pre-wrap break-words leading-relaxed">
                            {m.text}
                          </p>
                          <p
                            className={`mt-1 text-[10px] ${
                              m.fromMe ? "text-orange-100" : "text-slate-400"
                            }`}
                          >
                            {formatTime(m.createdTime)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Composer */}
                <div className="p-4 border-t border-slate-100 bg-white space-y-2">
                  {sendError && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                      <span>{sendError}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      placeholder="Type a reply... (Enter to send)"
                      className="max-h-28 min-h-[44px] flex-1 resize-none rounded-full bg-slate-100/80 px-5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => void handleSend()}
                      disabled={sending || !draft.trim()}
                      className="h-11 w-11 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-glow hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center transition-all cursor-pointer shrink-0"
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 px-3">
                    Press <span className="font-semibold text-slate-600">Enter</span> to send, <span className="font-semibold text-slate-600">Shift + Enter</span> for a new line
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}
