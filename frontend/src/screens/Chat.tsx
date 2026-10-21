// @ts-nocheck -- written against the JS runtime contract the rest of this frame uses, not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";
import { apiFetch, apiStream } from "@/lib/api";

const { Button, Textarea } = UI;
const { Plus, Menu, X, AlertCircle } = Icons;

function rgba(hex, a) {
  const h = String(hex).replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function fmtTime(d) {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatWhen(iso) {
  const d = new Date(iso);
  const now = new Date();
  const mins = (now - d) / 60000;
  if (mins < 1) return "Just now";
  if (mins < 60) return `${Math.round(mins)} min ago`;
  if (d.toDateString() === now.toDateString()) return fmtTime(d);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function byRecency(a, b) {
  return new Date(b.last_activity_at) - new Date(a.last_activity_at);
}

/** A small, safe subset of markdown -- bold, inline code, links and line
 * breaks -- for the assistant's replies. Full markdown rendering is later
 * sprint work (US-008); this just keeps replies readable while they stream. */
function Inline({ text }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null;
        if (p.length > 4 && p.startsWith("**") && p.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {p.slice(2, -2)}
            </strong>
          );
        }
        if (p.length > 2 && p.startsWith("`") && p.endsWith("`")) {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 text-[0.85em]"
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                backgroundColor: rgba(brand.neutralColor, 0.1),
                borderRadius: "4px",
              }}
            >
              {p.slice(1, -1)}
            </code>
          );
        }
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(p);
        if (link) {
          return (
            <a
              key={i}
              href={link[2]}
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-2"
              style={{ color: brand.accentColor }}
            >
              {link[1]}
            </a>
          );
        }
        return <React.Fragment key={i}>{p}</React.Fragment>;
      })}
    </>
  );
}

function MessageBubble({ message, streaming }) {
  const isUser = message.role === "user";
  return (
    <li className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className="max-w-[88%] whitespace-pre-wrap px-4 py-3 text-[0.92rem] leading-relaxed sm:max-w-[75%]"
        style={{
          borderRadius: "1.1rem",
          backgroundColor: isUser ? brand.primaryColor : "#F3EFE6",
          color: isUser ? "#FFFFFF" : "#211F1C",
          borderBottomRightRadius: isUser ? "0.3rem" : undefined,
          borderBottomLeftRadius: isUser ? undefined : "0.3rem",
        }}
      >
        <Inline text={message.content} />
        {streaming && (
          <span
            className="pt-caret ml-0.5 inline-block h-[0.95em] w-[2px] translate-y-[2px] align-text-bottom"
            style={{ backgroundColor: brand.accentColor }}
            aria-hidden="true"
          />
        )}
      </div>
    </li>
  );
}

export default function Screen() {
  const navigate = useNavigate();
  const line = rgba(brand.neutralColor, 0.2);

  const [conversations, setConversations] = React.useState(null); // null = loading
  const [conversationsError, setConversationsError] = React.useState("");
  const [activeId, setActiveId] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [messagesLoading, setMessagesLoading] = React.useState(false);
  const [messagesError, setMessagesError] = React.useState("");
  const [draft, setDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState("");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [streamingMessageId, setStreamingMessageId] = React.useState(null);

  const composerRef = React.useRef(null);
  const threadRef = React.useRef(null);
  const idRef = React.useRef(0);
  const loadedInitial = React.useRef(false);
  // Set right before `setActiveId` is called for a conversation created by
  // `handleSend` itself: that conversation's messages already live in local
  // state (the user's message, then the streamed reply), so the effect below
  // must not overwrite them with a GET that would race the still-in-flight
  // send and briefly show an empty or reverted thread.
  const skipNextMessagesFetch = React.useRef(false);

  const nextLocalId = () => {
    idRef.current += 1;
    return `local-${idRef.current}`;
  };

  const ordered = React.useMemo(
    () => (conversations ? [...conversations].sort(byRecency) : []),
    [conversations],
  );
  const activeConversation = ordered.find((c) => c.id === activeId) || null;

  async function loadConversations() {
    try {
      const list = await apiFetch("/conversations");
      setConversations(Array.isArray(list) ? list : []);
      setConversationsError("");
      return Array.isArray(list) ? list : [];
    } catch {
      setConversations([]);
      setConversationsError("Your chats couldn't be loaded. Try reloading the page.");
      return [];
    }
  }

  // Initial load: fetch the sidebar and open the most recently active chat.
  React.useEffect(() => {
    if (loadedInitial.current) return;
    loadedInitial.current = true;
    (async () => {
      const list = await loadConversations();
      if (list.length) setActiveId([...list].sort(byRecency)[0].id);
    })();
  }, []);

  // Load a selected conversation's messages from the server.
  React.useEffect(() => {
    if (!activeId) {
      setMessages([]);
      setMessagesError("");
      return;
    }
    if (skipNextMessagesFetch.current) {
      skipNextMessagesFetch.current = false;
      return;
    }
    let cancelled = false;
    setMessagesLoading(true);
    setMessagesError("");
    apiFetch(`/conversations/${activeId}/messages`)
      .then((list) => {
        if (!cancelled) setMessages(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setMessagesError("This conversation couldn't be loaded.");
      })
      .finally(() => {
        if (!cancelled) setMessagesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  React.useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, activeId]);

  function startNewChat() {
    setActiveId(null);
    setMessages([]);
    setMessagesError("");
    setSendError("");
    setSidebarOpen(false);
    if (composerRef.current) composerRef.current.focus();
  }

  function selectConversation(id) {
    if (sending) return;
    setActiveId(id);
    setSidebarOpen(false);
    setSendError("");
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending) return;

    setSendError("");
    const userMessage = { id: nextLocalId(), role: "user", content: text, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setDraft("");
    setSending(true);

    let convId = activeId;
    try {
      if (!convId) {
        const created = await apiFetch("/conversations", { method: "POST" });
        convId = created.id;
        skipNextMessagesFetch.current = true;
        setActiveId(convId);
        setConversations((prev) => [
          {
            id: created.id,
            title: created.title || "New chat",
            last_activity_at: new Date().toISOString(),
          },
          ...(prev || []),
        ]);
      }

      const assistantId = nextLocalId();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", created_at: new Date().toISOString() },
      ]);
      setStreamingMessageId(assistantId);

      await apiStream(`/conversations/${convId}/messages`, { content: text }, (chunk) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)),
        );
      });

      // The server auto-titles the conversation and bumps its activity once
      // the exchange lands; refresh the sidebar so both show up.
      await loadConversations();
    } catch {
      setSendError("That message didn't go through. Please try again.");
    } finally {
      setStreamingMessageId(null);
      setSending(false);
    }
  }

  function onComposerKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  const headingFont = { fontFamily: brand.fontHeading };

  return (
    <div className="w-full" style={{ fontFamily: brand.fontBody, color: brand.neutralColor }}>
      <style>{`
        @keyframes pt-caret { 0%, 45% { opacity: 1; } 46%, 100% { opacity: 0.1; } }
        .pt-caret { animation: pt-caret 1s steps(1) infinite; }
        @media (prefers-reduced-motion: reduce) { .pt-caret { animation: none !important; } }
      `}</style>

      <div
        className="relative mx-auto flex w-full max-w-6xl overflow-hidden border"
        style={{
          height: "min(80vh, 780px)",
          minHeight: "540px",
          borderColor: line,
          borderRadius: `calc(${brand.radius} * 2)`,
          backgroundColor: "#fff",
          boxShadow: `0 1px 2px ${rgba(brand.neutralColor, 0.08)}, 0 18px 40px -28px ${rgba(brand.neutralColor, 0.5)}`,
        }}
      >
        {/* ---------------- sidebar ---------------- */}
        <aside
          id="chat-list"
          aria-label="Your chats"
          className={`absolute inset-y-0 left-0 z-30 flex w-[18rem] max-w-[85%] flex-col border-r transition-[transform,visibility] duration-300 ease-out md:static md:w-[19rem] md:max-w-none md:translate-x-0 md:visible ${
            sidebarOpen ? "translate-x-0 visible" : "-translate-x-full invisible"
          }`}
          style={{ backgroundColor: brand.backgroundColor, borderColor: line }}
        >
          <div className="flex items-center justify-between gap-2 px-5 pb-3 pt-5">
            <h2
              className="text-[0.72rem] font-semibold uppercase tracking-[0.14em]"
              style={{ ...headingFont, color: rgba(brand.neutralColor, 0.75) }}
            >
              Your chats
            </h2>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close chat list"
              className="rounded-md p-1.5 transition-colors md:hidden"
              style={{ color: brand.neutralColor, backgroundColor: rgba(brand.neutralColor, 0.07) }}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="px-4 pb-4">
            <Button
              type="button"
              onClick={startNewChat}
              className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              New chat
            </Button>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-4" aria-label="Conversation list">
            {conversations === null ? (
              <ul className="space-y-2 px-2" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <li
                    key={i}
                    className="h-12 animate-pulse"
                    style={{ borderRadius: brand.radius, backgroundColor: rgba(brand.neutralColor, 0.08) }}
                  />
                ))}
              </ul>
            ) : conversationsError ? (
              <p className="px-3 py-2 text-sm" style={{ color: brand.accentColor }}>
                {conversationsError}
              </p>
            ) : ordered.length === 0 ? (
              <p className="px-3 py-2 text-sm" style={{ color: rgba(brand.neutralColor, 0.8) }}>
                No chats yet. Send a message to start your first one.
              </p>
            ) : (
              <ul className="space-y-1">
                {ordered.map((c) => {
                  const isActive = c.id === activeId;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => selectConversation(c.id)}
                        aria-current={isActive ? "true" : undefined}
                        className="w-full px-3 py-2.5 text-left transition-colors"
                        style={{
                          borderRadius: brand.radius,
                          backgroundColor: isActive ? rgba(brand.primaryColor, 0.1) : "transparent",
                        }}
                      >
                        <p
                          className="truncate text-sm font-medium"
                          style={{ color: isActive ? brand.primaryColor : "#211F1C" }}
                        >
                          {c.title}
                        </p>
                        <p className="mt-0.5 text-xs" style={{ color: rgba(brand.neutralColor, 0.75) }}>
                          {formatWhen(c.last_activity_at)}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>
        </aside>

        {/* ---------------- main column ---------------- */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className="flex items-start gap-3 border-b px-4 pb-4 pt-5 sm:px-7"
            style={{ borderColor: line }}
          >
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open chat list"
              aria-expanded={sidebarOpen}
              aria-controls="chat-list"
              className="mt-0.5 shrink-0 p-2 md:hidden"
              style={{ borderRadius: brand.radius, backgroundColor: rgba(brand.neutralColor, 0.08), color: brand.primaryColor }}
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="min-w-0 flex-1">
              <p
                className="text-[0.68rem] font-semibold uppercase tracking-[0.16em]"
                style={{ color: rgba(brand.neutralColor, 0.7) }}
              >
                {activeConversation ? "Conversation" : "Pocket Talk"}
              </p>
              <h1
                className="mt-1 truncate text-xl font-semibold leading-tight sm:text-[1.6rem]"
                style={{ ...headingFont, color: brand.primaryColor }}
              >
                {activeConversation ? activeConversation.title : "New chat"}
              </h1>
            </div>
          </header>

          {/* thread */}
          <div
            ref={threadRef}
            role="log"
            aria-live="polite"
            aria-label="Message thread"
            className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-7"
            style={{ backgroundColor: brand.backgroundColor }}
          >
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
              {messagesLoading ? (
                <p className="text-sm" style={{ color: rgba(brand.neutralColor, 0.8) }}>
                  Loading conversation…
                </p>
              ) : messagesError ? (
                <p className="text-sm" style={{ color: brand.accentColor }}>
                  {messagesError}
                </p>
              ) : messages.length === 0 ? (
                <p className="text-sm" style={{ color: rgba(brand.neutralColor, 0.8) }}>
                  Only you can see what you type here. Say anything to get started.
                </p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {messages.map((m) => (
                    <MessageBubble key={m.id} message={m} streaming={m.id === streamingMessageId} />
                  ))}
                </ul>
              )}
            </div>
          </div>

          {sendError && (
            <div
              role="alert"
              className="mx-4 mb-2 flex items-center gap-2 px-3.5 py-2 sm:mx-7"
              style={{ borderRadius: brand.radius, backgroundColor: rgba(brand.accentColor, 0.1), color: brand.accentColor }}
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="text-[0.82rem] font-medium">{sendError}</span>
            </div>
          )}

          {/* composer */}
          <div className="border-t px-4 py-4 sm:px-7" style={{ borderColor: line }}>
            <div className="mx-auto flex w-full max-w-2xl items-end gap-3">
              <label htmlFor="composer" className="sr-only">
                Message Pocket Talk
              </label>
              <Textarea
                id="composer"
                ref={composerRef}
                value={draft}
                disabled={sending}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onComposerKeyDown}
                placeholder="Ask anything…"
                className="min-h-[2.75rem] flex-1 resize-none"
              />
              <Button
                type="button"
                onClick={handleSend}
                disabled={sending || !draft.trim()}
                className="shrink-0 px-5 py-2.5 text-sm font-semibold"
              >
                {sending ? "Sending…" : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
