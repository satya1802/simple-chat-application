// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

const { Button, Input, Textarea, Label, Switch, Badge } = UI;
const { Plus, Check, X, Menu, FileText, Clock, Trash, Edit, ArrowRight, AlertCircle, CheckCircle } =
  Icons;

const DAILY_CAP = 50;
const MAX_TITLE = 60;
const NOW = new Date("2026-10-17T10:05:00");
const ACCOUNT_EMAIL = "rosa.enwright@gmail.com";

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
  const mins = (NOW - d) / 60000;
  if (mins < 1) return "Just now";
  if (mins < 60) return `${Math.round(mins)} min ago`;
  if (d.toDateString() === NOW.toDateString()) return fmtTime(d);
  const y = new Date(NOW);
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  if ((NOW - d) / 86400000 < 7) return d.toLocaleDateString("en-GB", { weekday: "long" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const SEED_CONVERSATIONS = [
  {
    id: "c-9021",
    user_id: "u-1",
    title: "Sourdough starter will not rise",
    created_at: "2026-10-17T09:21:00",
    last_activity_at: "2026-10-17T09:42:00",
    messages: [
      {
        id: "m-1",
        role: "user",
        content:
          "My starter is six days old and barely bubbling. The kitchen sits around 18°C and I am feeding it once a day with plain white flour. What should I change?",
        created_at: "2026-10-17T09:21:00",
      },
      {
        id: "m-2",
        role: "assistant",
        content: `Six days at 18°C is early days — a sluggish starter there is normal rather than broken. Three things are most likely holding it back.\n\n### What to change\n- **Warmth.** 18°C roughly halves fermentation speed. Find a spot nearer 24-26°C: an oven with only the light on, or on top of the fridge.\n- **Flour.** Plain white flour has little of the wild yeast you want. Switch to **50% wholemeal rye** for a week — it is the single fastest fix.\n- **Rhythm.** Once it starts rising, move to twice-daily feeds at a 1:2:2 ratio (starter : flour : water).\n\nGive it four more days before you judge it. A healthy starter should roughly double within 6-8 hours of a feed.`,
        created_at: "2026-10-17T09:23:00",
      },
      {
        id: "m-3",
        role: "user",
        content: "Make that shorter — just the three things that matter.",
        created_at: "2026-10-17T09:41:00",
      },
      {
        id: "m-4",
        role: "assistant",
        content: `1. Move it somewhere warmer — 24-26°C.\n2. Feed it half wholemeal rye.\n3. Wait four more days before judging it.`,
        created_at: "2026-10-17T09:42:00",
      },
    ],
  },
  {
    id: "c-9018",
    user_id: "u-1",
    title: "Warmer, shorter launch email",
    created_at: "2026-10-17T08:02:00",
    last_activity_at: "2026-10-17T08:15:00",
    messages: [
      {
        id: "m-5",
        role: "user",
        content:
          "Here is our launch email draft. It reads like a press release. Make it warmer and about 40% shorter, keep the date and the signup link.",
        created_at: "2026-10-17T08:02:00",
      },
      {
        id: "m-6",
        role: "assistant",
        content: `Here is a tighter version. I kept the 4 November date and the link, dropped the two "industry-leading" claims, and moved the ask to the top.\n\n**Subject:** We open the doors on 4 November\n\nHi {first_name},\n\nWe have been building this quietly for a year, and on **4 November** you can finally try it. No waitlist, no sales call — you sign in and start.\n\nIf you want the early-access slot we set aside for you, [claim it here](https://example.com/early-access) before Friday.\n\nThanks for sticking with us,\nRosa`,
        created_at: "2026-10-17T08:15:00",
      },
    ],
  },
  {
    id: "c-8990",
    user_id: "u-1",
    title: "Index for the sidebar query",
    created_at: "2026-10-16T17:40:00",
    last_activity_at: "2026-10-16T17:48:00",
    messages: [
      {
        id: "m-7",
        role: "user",
        content:
          "My sidebar loads conversations for one user ordered by last_activity_at descending. Postgres is doing a sort every time. What index do I want?",
        created_at: "2026-10-16T17:40:00",
      },
      {
        id: "m-8",
        role: "assistant",
        content: `You want a composite index whose column order matches the filter first, then the sort — then Postgres can read the rows already ordered and skip the sort node entirely.\n\n\`\`\`sql\nCREATE INDEX idx_conversations_user_recent\n  ON conversations (user_id, last_activity_at DESC);\n\n-- the query it serves\nSELECT id, title, last_activity_at\n  FROM conversations\n WHERE user_id = $1\n ORDER BY last_activity_at DESC\n LIMIT 50;\n\`\`\`\n\nA few notes:\n- Put \`user_id\` first. An index on \`last_activity_at\` alone still has to filter every user's rows.\n- \`DESC\` in the definition is optional — Postgres can scan backwards — but spelling it out keeps the plan obvious to the next person.\n- Check it landed with \`EXPLAIN (ANALYZE, BUFFERS)\` and look for **Index Scan** instead of **Sort**.`,
        created_at: "2026-10-16T17:48:00",
      },
    ],
  },
  {
    id: "c-8974",
    user_id: "u-1",
    title: "Container queries, plainly",
    created_at: "2026-10-15T20:11:00",
    last_activity_at: "2026-10-15T20:14:00",
    messages: [
      {
        id: "m-9",
        role: "user",
        content: "Explain CSS container queries as if I already know media queries well.",
        created_at: "2026-10-15T20:11:00",
      },
      {
        id: "m-10",
        role: "assistant",
        content: `A media query asks "how big is the window?". A container query asks "how big is the box I was dropped into?" — which is the question a reusable component actually has.\n\nYou mark an ancestor as a container, then query it:\n\n\`\`\`css\n.card-slot { container-type: inline-size; }\n\n@container (min-width: 28rem) {\n  .card { display: grid; grid-template-columns: 8rem 1fr; }\n}\n\`\`\`\n\nThe same \`.card\` now goes two-column in a wide slot and stacks in a narrow sidebar, with no knowledge of the page layout.`,
        created_at: "2026-10-15T20:14:00",
      },
    ],
  },
  {
    id: "c-8940",
    user_id: "u-1",
    title: "Three days in Lisbon, late October",
    created_at: "2026-10-13T12:30:00",
    last_activity_at: "2026-10-13T12:36:00",
    messages: [
      {
        id: "m-11",
        role: "user",
        content:
          "Three days in Lisbon at the end of October, two of us, no car, we like walking and we eat late. Give me a loose plan, not a schedule.",
        created_at: "2026-10-13T12:30:00",
      },
      {
        id: "m-12",
        role: "assistant",
        content: `Late October is kind to walkers — high teens, low crowds, occasional rain in the afternoon.\n\n## Day one — Alfama and the river\nStart high at Miradouro da Graça and walk downhill. Expect to get lost; that is the point. Dinner around 21:30 in Alfama.\n\n## Day two — Belém\nTram 15E out early, pastéis before the queue builds, then the Gulbenkian gardens in the afternoon if the rain comes in.\n\n## Day three — Príncipe Real and the market\n- Morning: Jardim do Príncipe Real, then the bookshops on Rua Dom Pedro V\n- Lunch: Time Out Market, go at 12:00 or give up on a table\n- Late: a fado house in Bairro Alto — book two days ahead\n\n**One practical note:** buy a rechargeable Viva Viagem card at the first metro station. It covers trams, lifts and the ferry.`,
        created_at: "2026-10-13T12:36:00",
      },
    ],
  },
  {
    id: "c-8901",
    user_id: "u-1",
    title: "CI deploy failing on the migrate step",
    created_at: "2026-10-11T15:02:00",
    last_activity_at: "2026-10-11T15:05:00",
    messages: [
      {
        id: "m-13",
        role: "user",
        content:
          'Our deploy fails at the migrate step with "relation messages already exists" but only on staging. Locally it is fine. Where do I look first?',
        created_at: "2026-10-11T15:02:00",
      },
      {
        id: "m-14",
        role: "assistant",
        status: "error",
        content:
          "That error almost always means staging has the table but not the migration row recording it, so the runner tries to create it again. Check the migrations table first —",
        created_at: "2026-10-11T15:05:00",
      },
    ],
  },
];

const SUGGESTIONS = [
  "Turn these six bullet points into a short update for my team",
  "Explain SQL window functions with one worked example",
  "What should I ask a landlord before signing a one-year lease?",
];

const CANNED_REPLIES = [
  `Happy to. Here is how I would approach it.\n\n### The short answer\nStart with the part that is cheapest to undo, then work outward. Most of the risk sits in the first decision, not the last one.\n\n- **Write the smallest version first.** If it survives a day of use, grow it.\n- **Name the thing you are optimising for.** Speed, cost and clarity rarely win together.\n- **Leave a note for yourself.** Future you will not remember why.\n\nIf you tell me which constraint actually binds — time, budget or people — I can make this a lot more specific.`,
  `Here is a working version you can paste in and adjust:\n\n\`\`\`javascript\nfunction debounce(fn, wait = 250) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), wait);\n  };\n}\n\nconst onSearch = debounce((term) => {\n  console.log('searching for', term);\n}, 300);\n\`\`\`\n\nTwo things worth knowing:\n1. The timer lives in the closure, so each call to \`debounce\` gets its own.\n2. If the component unmounts mid-wait you should clear the timer, otherwise the callback fires against a dead view.`,
  `Short version: **yes, but not for the reason you would expect.**\n\nThe usual argument is performance. In practice the gain is small and the real benefit is that it forces you to be explicit about what depends on what — which is where the bugs were hiding all along.\n\nIf you want, I can sketch what the migration would look like step by step.`,
  `Here is a tighter draft:\n\n> Thanks for the invitation — I am going to pass on this one so I can keep Thursday clear for the release. If it would help, send me the notes afterwards and I will comment where it is useful.\n\nIt declines plainly, gives a real reason, and still offers something. Want it warmer, or shorter still?`,
];

function replyFor(text) {
  const t = text.toLowerCase();
  if (/code|function|sql|javascript|python|query|debounce/.test(t)) return CANNED_REPLIES[1];
  if (/email|reply|decline|draft|write/.test(t)) return CANNED_REPLIES[3];
  if (/should i|worth it|better/.test(t)) return CANNED_REPLIES[2];
  return CANNED_REPLIES[0];
}

function titleFrom(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 42) return clean.slice(0, MAX_TITLE);
  const cut = clean.slice(0, 42);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 20 ? cut.lastIndexOf(" ") : 42)}…`.slice(
    0,
    MAX_TITLE,
  );
}

function parseBlocks(src) {
  const lines = String(src).split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line.trim())) {
      const lang = line.trim().slice(3).trim();
      const body = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push({ type: "code", lang, text: body.join("\n") });
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      blocks.push({ type: "h", level: h[1].length, text: h[2] });
      i += 1;
      continue;
    }
    if (/^>\s?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "quote", text: quote.join(" ") });
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }
    if (line.trim() === "") {
      i += 1;
      continue;
    }
    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^```/.test(lines[i].trim()) &&
      !/^#{1,4}\s/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }
  return blocks;
}

export default function Screen() {
  const navigate = useNavigate();
  const line = rgba(brand.neutralColor, 0.2);
  const lineSoft = rgba(brand.neutralColor, 0.12);
  const inkSoft = rgba(brand.neutralColor, 0.95);
  const primarySoft = rgba(brand.primaryColor, 0.08);
  const accentSoft = rgba(brand.accentColor, 0.1);

  const [conversations, setConversations] = React.useState(SEED_CONVERSATIONS);
  const [activeId, setActiveId] = React.useState("c-9021");
  const [draft, setDraft] = React.useState("");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [renamingId, setRenamingId] = React.useState(null);
  const [renameValue, setRenameValue] = React.useState("");
  const [renameError, setRenameError] = React.useState("");
  const [confirmDeleteId, setConfirmDeleteId] = React.useState(null);
  const [stream, setStream] = React.useState(null);
  const [loadingId, setLoadingId] = React.useState(null);
  const [usedToday, setUsedToday] = React.useState(47);
  const [toast, setToast] = React.useState("");

  const idRef = React.useRef(1);
  const bumpRef = React.useRef(0);
  const threadRef = React.useRef(null);
  const composerRef = React.useRef(null);
  const stickRef = React.useRef(true);

  const nextId = (p = "m") => {
    idRef.current += 1;
    return `${p}-${idRef.current}`;
  };
  const bump = () => {
    bumpRef.current += 1;
    return new Date(NOW.getTime() + bumpRef.current * 1000).toISOString();
  };

  const ordered = React.useMemo(
    () =>
      [...conversations].sort(
        (a, b) => new Date(b.last_activity_at) - new Date(a.last_activity_at),
      ),
    [conversations],
  );
  const active = conversations.find((c) => c.id === activeId) || null;
  const capReached = usedToday >= DAILY_CAP;
  const streamingHere = stream && stream.convId === activeId;

  // token streaming
  React.useEffect(() => {
    if (!stream) return undefined;
    if (stream.shown >= stream.full.length) {
      const ts = bump();
      const done = stream;
      setConversations((prev) =>
        prev.map((c) =>
          c.id === done.convId
            ? {
                ...c,
                last_activity_at: ts,
                messages: [
                  ...c.messages,
                  { id: nextId(), role: "assistant", content: done.full, created_at: ts },
                ],
              }
            : c,
        ),
      );
      setStream(null);
      return undefined;
    }
    const t = setTimeout(() => {
      setStream((s) =>
        s
          ? { ...s, shown: Math.min(s.full.length, s.shown + 3 + Math.floor(Math.random() * 6)) }
          : s,
      );
    }, 18);
    return () => clearTimeout(t);
  }, [stream]);

  // conversation open "loading"
  React.useEffect(() => {
    if (!loadingId) return undefined;
    const t = setTimeout(() => setLoadingId(null), 420);
    return () => clearTimeout(t);
  }, [loadingId]);

  React.useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  React.useEffect(() => {
    const el = threadRef.current;
    if (!el || !stickRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [activeId, loadingId, stream && stream.shown, active && active.messages.length]);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setConfirmDeleteId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onThreadScroll(e) {
    const el = e.currentTarget;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  function openConversation(id) {
    stickRef.current = true;
    setActiveId(id);
    setLoadingId(id);
    setSidebarOpen(false);
    setConfirmDeleteId(null);
    setRenamingId(null);
  }

  function startNewChat() {
    stickRef.current = true;
    setActiveId(null);
    setSidebarOpen(false);
    setConfirmDeleteId(null);
    setRenamingId(null);
    if (composerRef.current) composerRef.current.focus();
  }

  function handleSend() {
    const text = draft.trim();
    if (!text || stream || capReached) return;
    const ts = bump();
    const userMsg = { id: nextId(), role: "user", content: text, created_at: ts };
    let convId = activeId;
    if (!convId) {
      convId = nextId("c");
      setConversations((prev) => [
        {
          id: convId,
          user_id: "u-1",
          title: titleFrom(text),
          created_at: ts,
          last_activity_at: ts,
          messages: [userMsg],
        },
        ...prev,
      ]);
      setActiveId(convId);
    } else {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, last_activity_at: ts, messages: [...c.messages, userMsg] } : c,
        ),
      );
    }
    setDraft("");
    setUsedToday((n) => n + 1);
    stickRef.current = true;
    setStream({ convId, full: replyFor(text), shown: 0 });
  }

  function retry(convId, messageId) {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv || stream) return;
    const failed = conv.messages.find((m) => m.id === messageId);
    const prompt = [...conv.messages].reverse().find((m) => m.role === "user");
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId ? { ...c, messages: c.messages.filter((m) => m.id !== messageId) } : c,
      ),
    );
    stickRef.current = true;
    setStream({
      convId,
      full: `${failed && failed.content ? `${failed.content.replace(/[—-]\s*$/, "").trim()}\n\n` : ""}\`\`\`sql\nSELECT * FROM schema_migrations ORDER BY version DESC LIMIT 5;\n\`\`\`\n\nIf the newest version on staging is behind the one that creates \`messages\`, insert the missing row rather than re-running the migration:\n\n1. Confirm the table really matches the migration's definition.\n2. Insert the version row by hand.\n3. Re-run the deploy — it should now skip straight past it.\n\nLonger term, make the create statement \`IF NOT EXISTS\` so a half-applied state is recoverable without manual surgery.${prompt ? "" : ""}`,
      shown: 0,
    });
  }

  function beginRename(conv) {
    setRenamingId(conv.id);
    setRenameValue(conv.title);
    setRenameError("");
    setConfirmDeleteId(null);
  }

  function saveRename(e, id) {
    if (e) e.preventDefault();
    const value = renameValue.trim();
    if (!value) {
      setRenameError("A chat needs a name. Type one, or cancel to keep the old title.");
      return;
    }
    const trimmed = value.slice(0, MAX_TITLE);
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title: trimmed } : c)));
    setRenamingId(null);
    setRenameError("");
    setToast(`Renamed to "${trimmed.length > 28 ? `${trimmed.slice(0, 28)}…` : trimmed}"`);
  }

  function confirmDelete(id) {
    const remaining = ordered.filter((c) => c.id !== id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setConfirmDeleteId(null);
    if (stream && stream.convId === id) setStream(null);
    if (activeId === id) setActiveId(remaining.length ? remaining[0].id : null);
    setToast("Chat deleted.");
  }

  const headingFont = { fontFamily: brand.fontHeading };
  const radius = brand.radius;

  return (
    <div className="w-full" style={{ fontFamily: brand.fontBody, color: brand.neutralColor }}>
      <style>{`
        @keyframes pt-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes pt-caret { 0%, 45% { opacity: 1; } 46%, 100% { opacity: 0.1; } }
        @keyframes pt-shimmer { 0% { opacity: .35; } 50% { opacity: .75; } 100% { opacity: .35; } }
        .pt-rise { animation: pt-rise .28s ease-out both; }
        .pt-caret { animation: pt-caret 1s steps(1) infinite; }
        .pt-shimmer { animation: pt-shimmer 1.4s ease-in-out infinite; }
        .pt-scroll::-webkit-scrollbar { width: 10px; }
        .pt-scroll::-webkit-scrollbar-thumb { background: ${rgba(brand.neutralColor, 0.22)}; border-radius: 99px; border: 3px solid transparent; background-clip: content-box; }
        @media (prefers-reduced-motion: reduce) {
          .pt-rise, .pt-caret, .pt-shimmer { animation: none !important; }
          * { transition-duration: .01ms !important; }
        }
      `}</style>

      <div
        className="relative mx-auto flex w-full max-w-6xl overflow-hidden border"
        style={{
          height: "min(80vh, 780px)",
          minHeight: "540px",
          borderColor: line,
          borderRadius: `calc(${radius} * 2)`,
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
              style={{
                backgroundColor: brand.primaryColor,
                color: brand.backgroundColor,
                borderRadius: `calc(${radius} * 1.6)`,
                border: "none",
              }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              New chat
            </Button>
          </div>

          <div className="pt-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-2">
            {ordered.length === 0 ? (
              <div
                className="mx-1 mt-6 px-4 py-8 text-center"
                style={{
                  borderRadius: `calc(${radius} * 1.5)`,
                  backgroundColor: rgba(brand.neutralColor, 0.05),
                }}
              >
                <p
                  className="text-sm font-semibold"
                  style={{ ...headingFont, color: brand.primaryColor }}
                >
                  Nothing saved yet
                </p>
                <p className="mt-1.5 text-[0.8rem] leading-relaxed" style={{ color: inkSoft }}>
                  Chats you start show up here, newest first. Ask something and this list fills
                  itself.
                </p>
              </div>
            ) : (
              <ul className="space-y-1">
                {ordered.map((c) => {
                  const isActive = c.id === activeId;
                  const isRenaming = renamingId === c.id;
                  return (
                    <li key={c.id} className="pt-rise">
                      {isRenaming ? (
                        <form
                          onSubmit={(e) => saveRename(e, c.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              e.stopPropagation();
                              setRenamingId(null);
                              setRenameError("");
                            }
                          }}
                          className="px-2 py-2"
                          style={{
                            borderRadius: `calc(${radius} * 1.4)`,
                            backgroundColor: "#fff",
                            border: `1px solid ${rgba(brand.primaryColor, 0.35)}`,
                          }}
                        >
                          <Label
                            htmlFor={`rename-${c.id}`}
                            className="block text-[0.68rem] font-semibold uppercase tracking-[0.12em]"
                            style={{ color: rgba(brand.neutralColor, 0.8) }}
                          >
                            Chat name
                          </Label>
                          <Input
                            id={`rename-${c.id}`}
                            value={renameValue}
                            maxLength={MAX_TITLE}
                            autoFocus
                            onChange={(e) => {
                              setRenameValue(e.target.value);
                              if (renameError) setRenameError("");
                            }}
                            className="mt-1.5 w-full px-2.5 py-1.5 text-sm"
                            style={{
                              borderRadius: radius,
                              border: `1px solid ${line}`,
                              color: brand.primaryColor,
                            }}
                          />
                          {renameError ? (
                            <p
                              className="mt-1.5 flex items-start gap-1.5 text-[0.75rem] leading-snug"
                              style={{ color: brand.accentColor }}
                            >
                              <AlertCircle
                                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                                aria-hidden="true"
                              />
                              <span>{renameError}</span>
                            </p>
                          ) : (
                            <p
                              className="mt-1.5 text-[0.72rem]"
                              style={{ color: rgba(brand.neutralColor, 0.7) }}
                            >
                              {MAX_TITLE - renameValue.length} characters left
                            </p>
                          )}
                          <div className="mt-2 flex gap-2">
                            <button
                              type="submit"
                              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[0.78rem] font-semibold"
                              style={{
                                borderRadius: radius,
                                backgroundColor: brand.primaryColor,
                                color: brand.backgroundColor,
                              }}
                            >
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRenamingId(null);
                                setRenameError("");
                              }}
                              className="px-2.5 py-1.5 text-[0.78rem] font-medium"
                              style={{
                                borderRadius: radius,
                                color: brand.neutralColor,
                                backgroundColor: rgba(brand.neutralColor, 0.08),
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div
                          className="group relative transition-colors"
                          style={{
                            borderRadius: `calc(${radius} * 1.4)`,
                            backgroundColor: isActive ? "#fff" : "transparent",
                            boxShadow: isActive
                              ? `inset 0 0 0 1px ${rgba(brand.primaryColor, 0.22)}`
                              : "none",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => openConversation(c.id)}
                            aria-current={isActive ? "true" : undefined}
                            className="w-full px-3 py-2.5 pr-16 text-left"
                            style={{ borderRadius: `calc(${radius} * 1.4)` }}
                          >
                            <span
                              className="block truncate text-[0.88rem] font-semibold"
                              style={{
                                ...headingFont,
                                color: isActive
                                  ? brand.primaryColor
                                  : rgba(brand.neutralColor, 0.95),
                              }}
                            >
                              {c.title}
                            </span>
                            <span
                              className="mt-0.5 flex items-center gap-1.5 text-[0.74rem]"
                              style={{
                                color: rgba(brand.neutralColor, 0.75),
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              {formatWhen(c.last_activity_at)}
                              <span aria-hidden="true">·</span>
                              {c.messages.length} message{c.messages.length === 1 ? "" : "s"}
                            </span>
                          </button>
                          <div
                            className="absolute right-2 top-2 flex gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 md:opacity-0"
                            style={isActive ? { opacity: 1 } : undefined}
                          >
                            <button
                              type="button"
                              onClick={() => beginRename(c)}
                              aria-label={`Rename chat ${c.title}`}
                              className="p-1.5 transition-colors"
                              style={{ borderRadius: radius, color: brand.neutralColor }}
                            >
                              <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmDeleteId(confirmDeleteId === c.id ? null : c.id)
                              }
                              aria-label={`Delete chat ${c.title}`}
                              aria-expanded={confirmDeleteId === c.id}
                              className="p-1.5 transition-colors"
                              style={{
                                borderRadius: radius,
                                color:
                                  confirmDeleteId === c.id ? brand.accentColor : brand.neutralColor,
                              }}
                            >
                              <Trash className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      )}

                      {confirmDeleteId === c.id && (
                        <div
                          className="pt-rise mx-1 mt-1.5 px-3 py-3"
                          style={{
                            borderRadius: `calc(${radius} * 1.4)`,
                            backgroundColor: accentSoft,
                            border: `1px solid ${rgba(brand.accentColor, 0.3)}`,
                          }}
                        >
                          <p
                            className="text-[0.8rem] font-semibold"
                            style={{ ...headingFont, color: brand.accentColor }}
                          >
                            Delete this chat?
                          </p>
                          <p
                            className="mt-1 text-[0.78rem] leading-relaxed"
                            style={{ color: inkSoft }}
                          >
                            Every message in it goes too. This cannot be undone.
                          </p>
                          <div className="mt-2.5 flex gap-2">
                            <button
                              type="button"
                              onClick={() => confirmDelete(c.id)}
                              className="px-2.5 py-1.5 text-[0.78rem] font-semibold"
                              style={{
                                borderRadius: radius,
                                backgroundColor: brand.accentColor,
                                color: brand.backgroundColor,
                              }}
                            >
                              Delete for good
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2.5 py-1.5 text-[0.78rem] font-medium"
                              style={{
                                borderRadius: radius,
                                color: brand.neutralColor,
                                backgroundColor: "#fff",
                              }}
                            >
                              Keep it
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t px-4 py-4" style={{ borderColor: line }}>
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center text-[0.75rem] font-semibold"
                style={{
                  borderRadius: "99px",
                  backgroundColor: rgba(brand.primaryColor, 0.14),
                  color: brand.primaryColor,
                }}
              >
                RE
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className="block truncate text-[0.78rem] font-medium"
                  style={{ color: brand.primaryColor }}
                >
                  {ACCOUNT_EMAIL}
                </span>
                <span
                  className="block text-[0.72rem]"
                  style={{
                    color: rgba(brand.neutralColor, 0.75),
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {usedToday} of {DAILY_CAP} messages today
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate("sign-in")}
              className="mt-3 w-full px-3 py-2 text-[0.8rem] font-semibold transition-colors"
              style={{
                borderRadius: `calc(${radius} * 1.4)`,
                border: `1px solid ${line}`,
                color: brand.primaryColor,
                backgroundColor: "#fff",
              }}
            >
              Sign out
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close chat list"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 z-20 md:hidden"
            style={{ backgroundColor: rgba(brand.neutralColor, 0.4) }}
          />
        )}

        {/* ---------------- main column ---------------- */}
        <div className="flex min-w-0 flex-1 flex-col" style={{ backgroundColor: "#fff" }}>
          <header
            className="flex items-start gap-3 border-b px-4 py-4 sm:px-7"
            style={{ borderColor: lineSoft }}
          >
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open chat list"
              aria-expanded={sidebarOpen}
              aria-controls="chat-list"
              className="mt-0.5 shrink-0 p-2 md:hidden"
              style={{
                borderRadius: radius,
                backgroundColor: rgba(brand.neutralColor, 0.08),
                color: brand.primaryColor,
              }}
            >
              <Menu className="h-4.5 w-4.5" aria-hidden="true" />
            </button>

            <div className="min-w-0 flex-1">
              <p
                className="text-[0.68rem] font-semibold uppercase tracking-[0.16em]"
                style={{ color: rgba(brand.neutralColor, 0.7) }}
              >
                {active ? "Conversation" : "Pocket Talk"}
              </p>
              <h1
                className="mt-1 truncate text-xl font-semibold leading-tight sm:text-[1.6rem]"
                style={{ ...headingFont, color: brand.primaryColor }}
              >
                {active ? active.title : "New chat"}
              </h1>
              <p
                className="mt-1 text-[0.78rem]"
                style={{ color: rgba(brand.neutralColor, 0.8), fontVariantNumeric: "tabular-nums" }}
              >
                {active
                  ? `${active.messages.length} message${active.messages.length === 1 ? "" : "s"} · last active ${formatWhen(active.last_activity_at).toLowerCase()}`
                  : "Only you can see what you type here."}
              </p>
            </div>

            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              <Badge
                className="px-2.5 py-1 text-[0.72rem] font-semibold"
                style={{
                  borderRadius: "99px",
                  fontVariantNumeric: "tabular-nums",
                  backgroundColor: capReached ? accentSoft : primarySoft,
                  color: capReached ? brand.accentColor : brand.primaryColor,
                  border: `1px solid ${capReached ? rgba(brand.accentColor, 0.3) : rgba(brand.primaryColor, 0.18)}`,
                }}
              >
                {usedToday}/{DAILY_CAP} today
              </Badge>
              <button
                type="button"
                onClick={startNewChat}
                className="flex items-center gap-1.5 px-3 py-2 text-[0.8rem] font-semibold md:hidden"
                style={{
                  borderRadius: `calc(${radius} * 1.4)`,
                  border: `1px solid ${line}`,
                  color: brand.primaryColor,
                }}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                New
              </button>
            </div>
          </header>

          {toast && (
            <div
              className="pt-rise mx-4 mt-3 flex items-center gap-2 px-3.5 py-2 sm:mx-7"
              role="status"
              style={{
                borderRadius: `calc(${radius} * 1.4)`,
                backgroundColor: primarySoft,
                color: brand.primaryColor,
              }}
            >
              <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="text-[0.82rem] font-medium">{toast}</span>
            </div>
          )}

          {/* thread */}
          <div
            ref={threadRef}
            onScroll={onThreadScroll}
            role="log"
            aria-live="polite"
            aria-label="Message thread"
            className="pt-scroll min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-7"
            style={{ backgroundColor: brand.backgroundColor }}
          >
            {loadingId ? (
              <div className="mx-auto w-full max-w-2xl space-y-4" aria-hidden="true">
                <div
                  className="ml-auto h-12 w-3/5 pt-shimmer"
                  style={{
                    borderRadius: `calc(${radius} * 2)`,
                    backgroundColor: rgba(brand.primaryColor, 0.14),
                  }}
                />
                <div
                  className="h-28 w-11/12 pt-shimmer"
                  style={{
                    borderRadius: `calc(${radius} * 2)`,
                    backgroundColor: rgba(brand.neutralColor, 0.12),
                  }}
                />
                <div
                  className="h-16 w-4/5 pt-shimmer"
                  style={{
                    borderRadius: `calc(${radius} * 2)`,
                    backgroundColor: rgba(brand.neutralColor, 0.1),
                  }}
                />
                <p
                  className="pt-2 text-center text-[0.8rem]"
                  style={{ color: rgba(brand.neutralColor, 0.8) }}
                >
                  Pulling this conversation back from your history…
                </p>
              </div>
            ) : !active || active.messages.length === 0 ? (
              <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center"
                  style={{
                    borderRadius: "99px",
                    backgroundColor: accentSoft,
                    color: brand.accentColor,
                  }}
                >
                  <FileText className="h-5 w-5" />
                </span>
                <h2
                  className="mt-4 text-[1.35rem] font-semibold"
                  style={{ ...headingFont, color: brand.primaryColor }}
                >
                  What is on your mind?
                </h2>
                <p className="mt-2 text-[0.92rem] leading-relaxed" style={{ color: inkSoft }}>
                  Type below and the answer writes itself out as it arrives. This chat is saved to
                  your account the moment you send the first message.
                </p>
                <ul className="mt-6 w-full space-y-2">
                  {SUGGESTIONS.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => {
                          setDraft(s);
                          if (composerRef.current) composerRef.current.focus();
                        }}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[0.87rem] transition-colors"
                        style={{
                          borderRadius: `calc(${radius} * 1.6)`,
                          backgroundColor: "#fff",
                          border: `1px solid ${line}`,
                          color: brand.primaryColor,
                        }}
                      >
                        <span>{s}</span>
                        <ArrowRight
                          className="h-4 w-4 shrink-0"
                          style={{ color: brand.accentColor }}
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ul className="mx-auto w-full max-w-2xl space-y-5">
                {active.messages.map((m) => (
                  <li
                    key={m.id}
                    className={`pt-rise flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] sm:max-w-[82%] ${m.role === "user" ? "items-end text-right" : ""}`}
                    >
                      <p
                        className="mb-1 px-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em]"
                        style={{
                          color: rgba(brand.neutralColor, 0.7),
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {m.role === "user" ? "You" : "Assistant"} ·{" "}
                        {fmtTime(new Date(m.created_at))}
                      </p>
                      <div
                        className="px-4 py-3 text-left"
                        style={{
                          borderRadius: `calc(${radius} * 2)`,
                          backgroundColor: m.role === "user" ? brand.primaryColor : "#fff",
                          color: m.role === "user" ? brand.backgroundColor : inkSoft,
                          border: m.role === "user" ? "none" : `1px solid ${line}`,
                        }}
                      >
                        <span className="sr-only">
                          {m.role === "user" ? "You said:" : "Assistant said:"}
                        </span>
                        {m.role === "user" ? (
                          <p className="whitespace-pre-wrap text-[0.92rem] leading-relaxed">
                            {m.content}
                          </p>
                        ) : (
                          <Markdown text={m.content} />
                        )}

                        {m.status === "error" && (
                          <div
                            className="mt-3 border-t pt-3"
                            style={{ borderColor: rgba(brand.accentColor, 0.25) }}
                          >
                            <p
                              className="flex items-start gap-2 text-[0.84rem] leading-relaxed"
                              style={{ color: brand.accentColor }}
                            >
                              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                              <span>
                                <strong className="font-semibold">
                                  The answer stopped part-way.
                                </strong>{" "}
                                The model connection dropped after 4 seconds. Your question is saved
                                — nothing was lost.
                              </span>
                            </p>
                            <button
                              type="button"
                              onClick={() => retry(active.id, m.id)}
                              disabled={!!stream}
                              className="mt-3 px-3 py-1.5 text-[0.8rem] font-semibold disabled:opacity-50"
                              style={{
                                borderRadius: radius,
                                backgroundColor: brand.accentColor,
                                color: brand.backgroundColor,
                              }}
                            >
                              Try the answer again
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}

                {streamingHere && (
                  <li className="flex justify-start">
                    <div className="max-w-[88%] sm:max-w-[82%]">
                      <p
                        className="mb-1 flex items-center gap-1.5 px-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em]"
                        style={{ color: brand.accentColor }}
                      >
                        <span className="pt-caret" aria-hidden="true">
                          ●
                        </span>{" "}
                        Assistant is writing
                      </p>
                      <div
                        className="px-4 py-3"
                        style={{
                          borderRadius: `calc(${radius} * 2)`,
                          backgroundColor: "#fff",
                          border: `1px solid ${rgba(brand.accentColor, 0.35)}`,
                          color: inkSoft,
                        }}
                      >
                        {stream.shown === 0 ? (
                          <p
                            className="text-[0.9rem]"
                            style={{ color: rgba(brand.neutralColor, 0.75) }}
                          >
                            Thinking it through…
                          </p>
                        ) : (
                          <Markdown text={stream.full.slice(0, stream.shown)} streaming />
                        )}
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* composer */}
          <div
            className="border-t px-4 py-4 sm:px-7"
            style={{ borderColor: lineSoft, backgroundColor: "#fff" }}
          >
            {capReached ? (
              <div
                className="pt-rise px-4 py-4"
                role="status"
                style={{
                  borderRadius: `calc(${radius} * 1.6)`,
                  backgroundColor: accentSoft,
                  border: `1px solid ${rgba(brand.accentColor, 0.32)}`,
                }}
              >
                <p
                  className="flex items-center gap-2 text-[0.92rem] font-semibold"
                  style={{ ...headingFont, color: brand.accentColor }}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  You have used all {DAILY_CAP} messages for today
                </p>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed" style={{ color: inkSoft }}>
                  The counter resets at midnight UTC, in about 13 hours. Your chats stay exactly
                  where they are.
                </p>
                {draft.trim() && (
                  <div
                    className="mt-3 px-3 py-2.5"
                    style={{
                      borderRadius: radius,
                      backgroundColor: "#fff",
                      border: `1px dashed ${rgba(brand.accentColor, 0.4)}`,
                    }}
                  >
                    <p
                      className="text-[0.7rem] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: rgba(brand.neutralColor, 0.75) }}
                    >
                      Draft kept for tomorrow
                    </p>
                    <p
                      className="mt-1 whitespace-pre-wrap text-[0.85rem] leading-relaxed"
                      style={{ color: inkSoft }}
                    >
                      {draft}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <Label htmlFor="composer" className="sr-only">
                  Your message to the assistant
                </Label>
                <div
                  className="flex items-end gap-2 px-2.5 py-2 transition-colors focus-within:border-current"
                  style={{
                    borderRadius: `calc(${radius} * 2)`,
                    border: `1px solid ${stream ? rgba(brand.accentColor, 0.4) : line}`,
                    backgroundColor: brand.backgroundColor,
                  }}
                >
                  <Textarea
                    id="composer"
                    ref={composerRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    rows={Math.min(6, Math.max(1, draft.split("\n").length))}
                    placeholder={
                      stream
                        ? "Hold on — the assistant is still replying…"
                        : "Ask anything. Shift + Enter for a new line."
                    }
                    disabled={!!stream}
                    className="min-h-[2.75rem] w-full resize-none bg-transparent px-2.5 py-2 text-[0.95rem] leading-relaxed outline-none disabled:opacity-60"
                    style={{
                      maxHeight: "9rem",
                      overflowY: "auto",
                      border: "none",
                      color: brand.primaryColor,
                    }}
                  />
                  <Button
                    type="submit"
                    disabled={!draft.trim() || !!stream}
                    className="mb-0.5 flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-[0.85rem] font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                    style={{
                      backgroundColor: brand.primaryColor,
                      color: brand.backgroundColor,
                      borderRadius: `calc(${radius} * 1.6)`,
                      border: "none",
                    }}
                  >
                    Send
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
                <p
                  className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-[0.74rem]"
                  style={{
                    color: rgba(brand.neutralColor, 0.8),
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {stream ? (
                    <span style={{ color: brand.accentColor }}>
                      One reply at a time — sending unlocks when this answer finishes.
                    </span>
                  ) : (
                    <span>Enter sends · {DAILY_CAP - usedToday} messages left today</span>
                  )}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Markdown({ text, streaming }) {
  const blocks = React.useMemo(() => parseBlocks(text), [text]);
  const neutral = rgba(brand.neutralColor, 0.95);
  return (
    <div className="space-y-3 text-[0.92rem] leading-relaxed" style={{ color: neutral }}>
      {blocks.map((b, i) => {
        const last = i === blocks.length - 1;
        if (b.type === "code") return <CodeBlock key={i} code={b.text} lang={b.lang} />;
        if (b.type === "h") {
          const size = b.level <= 2 ? "text-[1.05rem]" : "text-[0.95rem]";
          return (
            <p
              key={i}
              className={`${size} font-semibold`}
              style={{ fontFamily: brand.fontHeading, color: brand.primaryColor }}
            >
              <Inline text={b.text} />
            </p>
          );
        }
        if (b.type === "ul") {
          return (
            <ul key={i} className="ml-1 space-y-1.5">
              {b.items.map((it, k) => (
                <li key={k} className="flex gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: brand.accentColor }}
                  />
                  <span>
                    <Inline text={it} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        if (b.type === "ol") {
          return (
            <ol key={i} className="ml-1 space-y-1.5">
              {b.items.map((it, k) => (
                <li key={k} className="flex gap-2.5">
                  <span
                    className="shrink-0 font-semibold"
                    style={{ color: brand.accentColor, fontVariantNumeric: "tabular-nums" }}
                  >
                    {k + 1}.
                  </span>
                  <span>
                    <Inline text={it} />
                  </span>
                </li>
              ))}
            </ol>
          );
        }
        if (b.type === "quote") {
          return (
            <blockquote
              key={i}
              className="border-l-2 pl-3 italic"
              style={{ borderColor: rgba(brand.accentColor, 0.5) }}
            >
              <Inline text={b.text} />
            </blockquote>
          );
        }
        return (
          <p key={i}>
            <Inline text={b.text} />
            {streaming && last && (
              <span
                className="pt-caret ml-0.5 inline-block h-[0.95em] w-[2px] align-text-bottom"
                style={{ backgroundColor: brand.accentColor }}
                aria-hidden="true"
              />
            )}
          </p>
        );
      })}
    </div>
  );
}

function Inline({ text }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null;
        if (p.length > 4 && p.startsWith("**") && p.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold" style={{ color: brand.primaryColor }}>
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
                color: brand.primaryColor,
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

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  function copy() {
    try {
      if (navigator && navigator.clipboard) navigator.clipboard.writeText(code);
    } catch (err) {
      /* clipboard unavailable in this frame — the button still confirms */
    }
    setCopied(true);
  }

  return (
    <div
      className="overflow-hidden"
      style={{
        borderRadius: `calc(${brand.radius} * 1.2)`,
        border: `1px solid ${rgba(brand.neutralColor, 0.2)}`,
      }}
    >
      <div
        className="flex items-center justify-between gap-2 px-3 py-1.5"
        style={{ backgroundColor: rgba(brand.neutralColor, 0.08) }}
      >
        <span
          className="text-[0.7rem] font-semibold uppercase tracking-[0.12em]"
          style={{ color: rgba(brand.neutralColor, 0.85) }}
        >
          {lang || "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 px-2 py-1 text-[0.72rem] font-semibold transition-colors"
          style={{
            borderRadius: "6px",
            color: copied ? brand.primaryColor : rgba(brand.neutralColor, 0.9),
          }}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        className="overflow-x-auto px-3 py-3 text-[0.82rem] leading-relaxed"
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          backgroundColor: rgba(brand.primaryColor, 0.04),
          color: brand.primaryColor,
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
