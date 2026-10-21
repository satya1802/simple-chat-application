// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

const { Button, Input, Label, Separator } = UI;
const {
  Check,
  X,
  ChevronRight,
  ChevronDown,
  Clock,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} = Icons;

const RESET_REQUEST = {
  email: "maya.okonkwo@gmail.com",
  requestedAt: "Today at 09:14",
  origin: "Chrome on macOS · Lisbon, PT",
  minLength: 10,
  secondsLeft: 2533,
};

// Passwords the server refuses because they appear in known breach lists.
const BREACHED = ["password123", "letmein1234", "qwertyuiop1", "pockettalk1"];

const PT_CSS = `
@keyframes pt-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes pt-dot{0%,80%,100%{opacity:.2}40%{opacity:1}}
@keyframes pt-spin{to{transform:rotate(360deg)}}
.pt-rise{animation:pt-rise .34s cubic-bezier(.2,.7,.3,1) both}
.pt-dot{animation:pt-dot 1.1s infinite}
.pt-spin{animation:pt-spin .9s linear infinite}
.pt-bar{transition:width .3s ease, background-color .3s ease}
@media (prefers-reduced-motion: reduce){
  .pt-rise,.pt-dot,.pt-spin{animation:none!important}
  .pt-bar{transition:none!important}
}
`;

export default function Screen() {
  const navigate = useNavigate();
  const [stage, setStage] = React.useState("checking"); // checking | form | saving | success | expired | resending | resent
  const [expiredReason, setExpiredReason] = React.useState("timeout");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [reveal, setReveal] = React.useState(false);
  const [fieldError, setFieldError] = React.useState(null); // 'password' | 'confirm'
  const [submitError, setSubmitError] = React.useState(null);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [seconds, setSeconds] = React.useState(RESET_REQUEST.secondsLeft);

  const timers = React.useRef([]);
  const passwordRef = React.useRef(null);

  const addTimer = (fn, ms) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  };

  React.useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, []);

  // Verifying the single-use token from the link.
  React.useEffect(() => {
    addTimer(() => setStage("form"), 850);
  }, []);

  // The link's own clock. When it runs out while the page is open, say so.
  React.useEffect(() => {
    if (stage !== "form" && stage !== "saving") return undefined;
    const id = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          setExpiredReason("timeout");
          setStage("expired");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [stage]);

  React.useEffect(() => {
    if (stage === "form" && passwordRef.current) passwordRef.current.focus();
  }, [stage]);

  const localPart = RESET_REQUEST.email.split("@")[0].toLowerCase();
  const rules = [
    {
      label: `At least ${RESET_REQUEST.minLength} characters`,
      met: password.length >= RESET_REQUEST.minLength,
    },
    {
      label: "Doesn't contain your email name",
      met: password.length > 0 && !password.toLowerCase().includes(localPart),
    },
    { label: "Both fields match", met: password.length > 0 && password === confirm },
  ];

  const strength = (() => {
    if (!password) return -1;
    let s = 0;
    if (password.length >= RESET_REQUEST.minLength) s += 1;
    if (password.length >= 14) s += 1;
    if (/[^A-Za-z0-9]/.test(password) || (/[0-9]/.test(password) && /[A-Za-z]/.test(password)))
      s += 1;
    return Math.min(s, 3);
  })();
  const strengthWord = ["Too short", "Weak", "Good", "Strong"][Math.max(strength, 0)];

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitError(null);
    if (password.trim().length < RESET_REQUEST.minLength) {
      setFieldError("password");
      setSubmitError(
        `Your new password needs at least ${RESET_REQUEST.minLength} characters. You have ${password.trim().length}.`,
      );
      if (passwordRef.current) passwordRef.current.focus();
      return;
    }
    if (password !== confirm) {
      setFieldError("confirm");
      setSubmitError(
        "The two passwords are different. Check the second field — nothing you typed has been cleared.",
      );
      return;
    }
    setFieldError(null);
    setStage("saving");
    addTimer(() => {
      if (BREACHED.includes(password.toLowerCase())) {
        setStage("form");
        setFieldError("password");
        setSubmitError(
          "That password turns up in known breach lists, so we can’t save it. A few unrelated words work well.",
        );
        return;
      }
      setStage("success");
    }, 1150);
  };

  const requestNewLink = () => {
    setStage("resending");
    addTimer(() => setStage("resent"), 1000);
  };

  const groupKey = stage === "saving" ? "form" : stage;
  const surface = "#FFFFFF";
  const hairline = "rgba(110, 103, 94, 0.18)";
  const softTint = "rgba(47, 93, 80, 0.07)";
  const accentTint = "rgba(180, 85, 45, 0.10)";

  const focusRing = {
    outlineColor: brand.primaryColor,
  };

  const labelStyle = {
    color: brand.neutralColor,
    fontFamily: brand.fontBody,
    letterSpacing: "0.02em",
  };

  const quietButton =
    "inline-flex items-center gap-1.5 text-sm font-medium rounded-md px-2 py-1 -mx-2 transition-colors hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

  const renderChecking = () => (
    <div className="py-6">
      <h1
        className="text-[1.6rem] leading-tight font-semibold"
        style={{ color: brand.primaryColor, fontFamily: brand.fontHeading }}
      >
        Checking your link
      </h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed" style={{ color: brand.neutralColor }}>
        One moment while we confirm this reset link hasn&rsquo;t been used already.
      </p>
      <div className="mt-7 flex items-center gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="pt-dot block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: brand.primaryColor, animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>
      <p role="status" className="sr-only">
        Checking your reset link.
      </p>
    </div>
  );

  const renderForm = () => (
    <div>
      <div
        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
        style={{
          backgroundColor: accentTint,
          color: brand.accentColor,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <Icons.Clock className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Link valid for {mmss}</span>
      </div>

      <h1
        className="mt-5 text-[1.75rem] leading-tight font-semibold tracking-tight"
        style={{ color: brand.primaryColor, fontFamily: brand.fontHeading }}
      >
        Set a new password
      </h1>
      <p className="mt-2 text-[0.95rem] leading-relaxed" style={{ color: brand.neutralColor }}>
        For{" "}
        <span className="font-medium" style={{ color: "#2A2621" }}>
          {RESET_REQUEST.email}
        </span>
        . Once it&rsquo;s saved we&rsquo;ll sign you straight in on this device.
      </p>

      {submitError ? (
        <div
          role="alert"
          className="pt-rise mt-5 flex gap-3 rounded-lg p-3.5"
          style={{ backgroundColor: accentTint, borderLeft: `3px solid ${brand.accentColor}` }}
        >
          <Icons.AlertCircle
            className="h-5 w-5 shrink-0"
            style={{ color: brand.accentColor }}
            aria-hidden="true"
          />
          <p className="text-[0.875rem] leading-relaxed" style={{ color: "#2A2621" }}>
            {submitError}
          </p>
        </div>
      ) : null}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <div className="flex items-baseline justify-between">
            <Label
              htmlFor="new-password"
              className="text-xs font-semibold uppercase"
              style={labelStyle}
            >
              New password
            </Label>
            {password ? (
              <span className="text-xs font-medium" style={{ color: brand.neutralColor }}>
                {strengthWord}
              </span>
            ) : null}
          </div>
          <div className="relative mt-1.5">
            <Input
              id="new-password"
              ref={passwordRef}
              type={reveal ? "text" : "password"}
              value={password}
              autoComplete="new-password"
              aria-describedby="password-rules"
              aria-invalid={fieldError === "password" ? "true" : "false"}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldError(null);
              }}
              className="w-full pr-24"
              style={{
                borderColor: fieldError === "password" ? brand.accentColor : hairline,
                backgroundColor: surface,
                ...focusRing,
              }}
            />
            <button
              type="button"
              onClick={() => setReveal((r) => !r)}
              aria-pressed={reveal}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ color: brand.primaryColor, backgroundColor: softTint, ...focusRing }}
            >
              {reveal ? "Hide" : "Show"}
            </button>
          </div>

          <div className="mt-2.5 flex gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="pt-bar h-1 flex-1 rounded-full"
                style={{
                  backgroundColor: strength > i ? brand.primaryColor : "rgba(110,103,94,0.16)",
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <Label
            htmlFor="confirm-password"
            className="text-xs font-semibold uppercase"
            style={labelStyle}
          >
            Type it again
          </Label>
          <Input
            id="confirm-password"
            type={reveal ? "text" : "password"}
            value={confirm}
            autoComplete="new-password"
            aria-invalid={fieldError === "confirm" ? "true" : "false"}
            onChange={(e) => {
              setConfirm(e.target.value);
              setFieldError(null);
            }}
            className="mt-1.5 w-full"
            style={{
              borderColor: fieldError === "confirm" ? brand.accentColor : hairline,
              backgroundColor: surface,
              ...focusRing,
            }}
          />
        </div>

        <ul id="password-rules" className="space-y-2">
          {rules.map((rule) => (
            <li key={rule.label} className="flex items-center gap-2 text-[0.875rem]">
              {rule.met ? (
                <Icons.Check
                  className="h-4 w-4 shrink-0"
                  style={{ color: brand.primaryColor }}
                  aria-hidden="true"
                />
              ) : (
                <Icons.X
                  className="h-4 w-4 shrink-0"
                  style={{ color: "rgba(110,103,94,0.55)" }}
                  aria-hidden="true"
                />
              )}
              <span style={{ color: rule.met ? "#2A2621" : brand.neutralColor }}>
                {rule.label}
                <span className="sr-only">{rule.met ? " — done" : " — not yet"}</span>
              </span>
            </li>
          ))}
        </ul>

        <Button
          type="submit"
          disabled={stage === "saving"}
          className="w-full justify-center py-3 text-[0.95rem] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            backgroundColor: brand.primaryColor,
            color: "#FAF7F1",
            borderRadius: brand.radius,
            opacity: stage === "saving" ? 0.72 : 1,
            outlineColor: brand.primaryColor,
          }}
        >
          {stage === "saving" ? (
            <span className="inline-flex items-center gap-2">
              <span
                className="pt-spin inline-block h-4 w-4 rounded-full border-2 border-transparent"
                style={{ borderTopColor: "#FAF7F1", borderRightColor: "#FAF7F1" }}
                aria-hidden="true"
              />
              Saving your password…
            </span>
          ) : (
            "Save password and sign in"
          )}
        </Button>
      </form>

      <Separator className="my-6" style={{ backgroundColor: hairline }} />

      <div>
        <button
          type="button"
          onClick={() => setHelpOpen((o) => !o)}
          aria-expanded={helpOpen}
          aria-controls="reset-help"
          className={quietButton}
          style={{ color: brand.primaryColor, ...focusRing }}
        >
          {helpOpen ? (
            <Icons.ChevronDown className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Icons.ChevronRight className="h-4 w-4" aria-hidden="true" />
          )}
          Link not working?
        </button>
        {helpOpen ? (
          <div
            id="reset-help"
            className="pt-rise mt-3 rounded-lg p-4"
            style={{ backgroundColor: softTint }}
          >
            <p className="text-[0.875rem] leading-relaxed" style={{ color: "#2A2621" }}>
              This link was sent {RESET_REQUEST.requestedAt.toLowerCase()} from{" "}
              {RESET_REQUEST.origin}. Reset links last 60 minutes and work once only — if you opened
              an older email, it won&rsquo;t go through.
            </p>
            <button
              type="button"
              onClick={() => {
                setExpiredReason("requested");
                setStage("expired");
              }}
              className={`${quietButton} mt-3`}
              style={{ color: brand.accentColor, ...focusRing }}
            >
              Request a fresh link instead
              <Icons.ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );

  const renderExpired = () => (
    <div>
      <span
        className="inline-flex h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: accentTint }}
      >
        <Icons.AlertCircle
          className="h-6 w-6"
          style={{ color: brand.accentColor }}
          aria-hidden="true"
        />
      </span>
      <h1
        className="mt-5 text-[1.75rem] leading-tight font-semibold tracking-tight"
        style={{ color: brand.primaryColor, fontFamily: brand.fontHeading }}
      >
        {expiredReason === "timeout" ? "This link has expired" : "Let’s send a fresh link"}
      </h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed" style={{ color: brand.neutralColor }}>
        {expiredReason === "timeout"
          ? `The 60 minutes ran out while this page was open, so it can no longer be used. Nothing about your account has changed and your old password still works.`
          : `We'll email ${RESET_REQUEST.email} a new single-use link. The one in your inbox now will stop working the moment the new one is sent.`}
      </p>

      <dl className="mt-6 space-y-3 rounded-lg p-4" style={{ backgroundColor: softTint }}>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-xs font-semibold uppercase" style={labelStyle}>
            Sent to
          </dt>
          <dd className="text-[0.875rem] font-medium" style={{ color: "#2A2621" }}>
            {RESET_REQUEST.email}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-xs font-semibold uppercase" style={labelStyle}>
            Requested
          </dt>
          <dd
            className="text-[0.875rem] font-medium"
            style={{ color: "#2A2621", fontVariantNumeric: "tabular-nums" }}
          >
            {RESET_REQUEST.requestedAt}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-xs font-semibold uppercase" style={labelStyle}>
            Status
          </dt>
          <dd className="text-[0.875rem] font-medium" style={{ color: brand.accentColor }}>
            {expiredReason === "timeout" ? "Expired" : "Still valid"}
          </dd>
        </div>
      </dl>

      <Button
        type="button"
        onClick={requestNewLink}
        disabled={stage === "resending"}
        className="mt-6 w-full justify-center py-3 text-[0.95rem] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          backgroundColor: brand.primaryColor,
          color: "#FAF7F1",
          borderRadius: brand.radius,
          opacity: stage === "resending" ? 0.72 : 1,
          outlineColor: brand.primaryColor,
        }}
      >
        {stage === "resending" ? (
          <span className="inline-flex items-center gap-2">
            <span
              className="pt-spin inline-block h-4 w-4 rounded-full border-2 border-transparent"
              style={{ borderTopColor: "#FAF7F1", borderRightColor: "#FAF7F1" }}
              aria-hidden="true"
            />
            Sending…
          </span>
        ) : (
          "Email me a new link"
        )}
      </Button>

      <button
        type="button"
        onClick={() => navigate("sign-in")}
        className={`${quietButton} mt-5`}
        style={{ color: brand.primaryColor, ...focusRing }}
      >
        <Icons.ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to sign in
      </button>
    </div>
  );

  const renderResent = () => (
    <div>
      <span
        className="inline-flex h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: softTint }}
      >
        <Icons.CheckCircle
          className="h-6 w-6"
          style={{ color: brand.primaryColor }}
          aria-hidden="true"
        />
      </span>
      <h1
        className="mt-5 text-[1.75rem] leading-tight font-semibold tracking-tight"
        style={{ color: brand.primaryColor, fontFamily: brand.fontHeading }}
      >
        Check your inbox
      </h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed" style={{ color: brand.neutralColor }}>
        If {RESET_REQUEST.email} has a Pocket Talk account, a new link is on its way. It works once
        and expires after 60 minutes.
      </p>
      <p className="mt-4 text-[0.875rem] leading-relaxed" style={{ color: brand.neutralColor }}>
        Nothing after a minute or two? Look in spam, or try signing up — the address may not have an
        account yet.
      </p>

      <div className="mt-7 flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={() => navigate("sign-in")}
          className="justify-center px-5 py-3 text-[0.95rem] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            backgroundColor: brand.primaryColor,
            color: "#FAF7F1",
            borderRadius: brand.radius,
            outlineColor: brand.primaryColor,
          }}
        >
          Back to sign in
        </Button>
        <button
          type="button"
          onClick={() => navigate("sign-up")}
          className="rounded-md px-5 py-3 text-[0.95rem] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            color: brand.primaryColor,
            border: `1px solid ${hairline}`,
            borderRadius: brand.radius,
            ...focusRing,
          }}
        >
          Create an account
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div>
      <span
        className="inline-flex h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: softTint }}
      >
        <Icons.CheckCircle
          className="h-6 w-6"
          style={{ color: brand.primaryColor }}
          aria-hidden="true"
        />
      </span>
      <h1
        className="mt-5 text-[1.75rem] leading-tight font-semibold tracking-tight"
        style={{ color: brand.primaryColor, fontFamily: brand.fontHeading }}
      >
        Password updated
      </h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed" style={{ color: brand.neutralColor }}>
        You&rsquo;re signed in as{" "}
        <span className="font-medium" style={{ color: "#2A2621" }}>
          {RESET_REQUEST.email}
        </span>
        . That reset link has been used up, so it won&rsquo;t work again.
      </p>

      <Button
        type="button"
        onClick={() => navigate("chat")}
        className="mt-7 w-full justify-center py-3 text-[0.95rem] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          backgroundColor: brand.primaryColor,
          color: "#FAF7F1",
          borderRadius: brand.radius,
          outlineColor: brand.primaryColor,
        }}
      >
        Open my chats
      </Button>
      <button
        type="button"
        onClick={() => navigate("sign-in")}
        className={`${quietButton} mt-5`}
        style={{ color: brand.primaryColor, ...focusRing }}
      >
        <Icons.ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Sign in on another device
      </button>
    </div>
  );

  let body;
  if (stage === "checking") body = renderChecking();
  else if (stage === "form" || stage === "saving") body = renderForm();
  else if (stage === "expired" || stage === "resending") body = renderExpired();
  else if (stage === "resent") body = renderResent();
  else body = renderSuccess();

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center px-5 py-10 sm:py-16"
      style={{ backgroundColor: brand.backgroundColor, fontFamily: brand.fontBody }}
    >
      <style>{PT_CSS}</style>

      <main className="w-full max-w-[27rem]">
        <div className="mb-7 flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-[0.95rem] font-bold"
            style={{
              backgroundColor: brand.primaryColor,
              color: "#FAF7F1",
              borderBottomLeftRadius: "0.35rem",
            }}
            aria-hidden="true"
          >
            P
          </span>
          <span
            className="text-[0.95rem] font-semibold tracking-tight"
            style={{ color: brand.primaryColor }}
          >
            Pocket Talk
          </span>
        </div>

        <section
          key={groupKey}
          className="pt-rise p-7 sm:p-8"
          style={{
            backgroundColor: surface,
            border: `1px solid ${hairline}`,
            borderRadius: `calc(${brand.radius} * 2)`,
            boxShadow: "0 1px 2px rgba(42,38,33,0.04), 0 12px 32px -18px rgba(42,38,33,0.28)",
          }}
        >
          {body}
        </section>

        <p
          className="mt-6 text-center text-xs leading-relaxed"
          style={{ color: brand.neutralColor }}
        >
          Reset links are single-use and expire after 60 minutes. Your conversations stay private to
          your account.
        </p>
      </main>
    </div>
  );
}
