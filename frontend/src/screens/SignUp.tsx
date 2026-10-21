// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";
import { apiFetch, ApiError, setToken } from "@/lib/api";

const { Button, Card, CardContent, Input, Label, Checkbox } = UI;
const { X, AlertCircle } = Icons;

function scorePassword(value) {
  if (value.length < 8) return 0;
  const variety =
    (/[a-z]/.test(value) ? 1 : 0) +
    (/[A-Z]/.test(value) ? 1 : 0) +
    (/\d/.test(value) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(value) ? 1 : 0);
  if (value.length >= 12 && variety >= 3) return 2;
  return 1;
}

// FastAPI validation errors look like { detail: [{ loc: ["body", "email"], ... }] }.
// Return the offending field name, if we can tell.
function fieldFrom422(body) {
  if (!body || !Array.isArray(body.detail)) return null;
  for (const item of body.detail) {
    const loc = item && Array.isArray(item.loc) ? item.loc : [];
    const field = loc[loc.length - 1];
    if (field === "email" || field === "password") return field;
  }
  return null;
}

export default function Screen() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [keepSignedIn, setKeepSignedIn] = React.useState(true);
  const [errors, setErrors] = React.useState({});
  const [emailTaken, setEmailTaken] = React.useState(false);
  const [status, setStatus] = React.useState("idle"); // idle | submitting | failed

  const emailRef = React.useRef(null);
  const passwordRef = React.useRef(null);

  const strength = scorePassword(password);
  const strengthWord =
    password.length === 0 ? "" : strength === 0 ? "Too short" : strength === 1 ? "Good" : "Strong";

  async function handleSubmit(event) {
    event.preventDefault();
    if (status === "submitting") return;
    setErrors({});
    setEmailTaken(false);
    setStatus("submitting");
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      setToken(data.token);
      navigate("chat");
    } catch (err) {
      setStatus("idle");
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setEmailTaken(true);
          setErrors({ email: "There's already an account with this email." });
          if (emailRef.current) emailRef.current.focus();
        } else if (err.status === 422) {
          const field = fieldFrom422(err.body);
          if (field === "email") {
            setErrors({ email: "That doesn't look like an email address — check for a typo." });
            if (emailRef.current) emailRef.current.focus();
          } else if (field === "password") {
            setErrors({ password: "Passwords need at least 8 characters." });
            if (passwordRef.current) passwordRef.current.focus();
          } else {
            setErrors({ email: "Check your email and password and try again." });
          }
        } else {
          setStatus("failed");
        }
      } else {
        setStatus("failed");
      }
    }
  }

  const css =
    "@keyframes ptRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}" +
    "@keyframes ptDot{0%,80%,100%{transform:translateY(0);opacity:.35}40%{transform:translateY(-4px);opacity:1}}" +
    ".pt-rise{animation:ptRise .36s cubic-bezier(.2,.7,.3,1) both}" +
    ".pt-dot{animation:ptDot 1.2s infinite ease-in-out}" +
    ".pt-focus:focus-visible{outline:2px solid " +
    brand.primaryColor +
    ";outline-offset:2px;border-radius:" +
    brand.radius +
    "}" +
    ".pt-field:focus-within{box-shadow:0 0 0 3px " +
    brand.primaryColor +
    "22}" +
    "@media (prefers-reduced-motion: reduce){.pt-rise,.pt-dot{animation:none!important}}";

  const labelStyle = {
    color: brand.neutralColor,
    fontSize: "0.78rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    fontWeight: 600,
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: brand.backgroundColor,
        fontFamily: brand.fontBody,
        color: "#211F1C",
      }}
    >
      <style>{css}</style>

      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-14">
        {/* Wordmark + route out to sign in */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="relative flex h-9 w-9 items-center justify-center"
              style={{
                backgroundColor: brand.primaryColor,
                borderRadius: "0.9rem 0.9rem 0.9rem 0.25rem",
              }}
              aria-hidden="true"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: brand.backgroundColor }}
              />
              <span
                className="mx-1 h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: brand.backgroundColor }}
              />
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: brand.accentColor }}
              />
            </div>
            <span
              className="text-[1.05rem] font-semibold tracking-tight"
              style={{ fontFamily: brand.fontHeading }}
            >
              Pocket&nbsp;Talk
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="hidden sm:inline" style={{ color: brand.neutralColor }}>
              Already have an account?
            </span>
            <button
              type="button"
              onClick={() => navigate("sign-in")}
              className="pt-focus rounded-md px-2 py-1 font-semibold underline underline-offset-4 transition-colors"
              style={{ color: brand.primaryColor }}
            >
              Sign in
            </button>
          </div>
        </div>

        <main className="mt-10 grid items-start gap-10 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          {/* ---------------- Focal column: the form ---------------- */}
          <section>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: brand.accentColor, letterSpacing: "0.08em" }}
              >
                FREE WHILE IN PREVIEW
              </p>
              <h1
                className="mt-3 text-[2rem] font-semibold leading-[1.12] tracking-tight sm:text-[2.6rem]"
                style={{ fontFamily: brand.fontHeading }}
              >
                Start chatting in
                <br className="hidden sm:block" /> about twenty seconds.
              </h1>
              <p
                className="mt-4 max-w-md text-base leading-relaxed"
                style={{ color: brand.neutralColor }}
              >
                An email address and a password is all it takes. No verification link to chase, no
                credit card, no set-up wizard.
              </p>

              <Card
                className="mt-8 max-w-xl border"
                style={{ borderColor: "#E4DED2", backgroundColor: "#FFFFFF" }}
              >
                <CardContent className="p-6 sm:p-8">
                  {status === "failed" && (
                    <div
                      role="alert"
                      className="pt-rise mb-6 flex items-start gap-3 p-4"
                      style={{
                        backgroundColor: brand.accentColor + "14",
                        border: "1px solid " + brand.accentColor + "4D",
                        borderRadius: brand.radius,
                      }}
                    >
                      <AlertCircle
                        className="mt-0.5 h-5 w-5 shrink-0"
                        style={{ color: brand.accentColor }}
                        aria-hidden="true"
                      />
                      <div className="text-sm">
                        <p className="font-semibold" style={{ color: brand.accentColor }}>
                          We couldn't reach the account service
                        </p>
                        <p className="mt-1" style={{ color: brand.neutralColor }}>
                          No account was created and nothing you typed was lost. Give it another
                          go — if it keeps failing, try again in a few minutes.
                        </p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="signup-email" style={labelStyle}>
                          Email address
                        </Label>
                        <div className="pt-field mt-2 rounded-lg transition-shadow">
                          <Input
                            id="signup-email"
                            ref={emailRef}
                            type="email"
                            name="email"
                            inputMode="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) setErrors({ ...errors, email: undefined });
                              setEmailTaken(false);
                            }}
                            aria-invalid={errors.email ? "true" : "false"}
                            aria-describedby={errors.email ? "signup-email-error" : undefined}
                            className="h-12 w-full text-[0.95rem]"
                            style={{
                              borderColor: errors.email ? brand.accentColor : "#DCD5C8",
                              borderRadius: brand.radius,
                              backgroundColor: "#FFFFFF",
                            }}
                          />
                        </div>
                        {errors.email && (
                          <p
                            id="signup-email-error"
                            className="pt-rise mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
                            style={{ color: brand.accentColor }}
                          >
                            <X className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>{errors.email}</span>
                            {emailTaken && (
                              <button
                                type="button"
                                onClick={() => navigate("sign-in")}
                                className="pt-focus rounded px-1 font-semibold underline underline-offset-4"
                                style={{ color: brand.primaryColor }}
                              >
                                Sign in instead
                              </button>
                            )}
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-end justify-between gap-3">
                          <Label htmlFor="signup-password" style={labelStyle}>
                            Password
                          </Label>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-pressed={showPassword}
                            className="pt-focus rounded px-1 text-xs font-semibold underline underline-offset-4"
                            style={{ color: brand.primaryColor }}
                          >
                            {showPassword ? "Hide password" : "Show password"}
                          </button>
                        </div>
                        <div className="pt-field mt-2 rounded-lg transition-shadow">
                          <Input
                            id="signup-password"
                            ref={passwordRef}
                            type={showPassword ? "text" : "password"}
                            name="password"
                            autoComplete="new-password"
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (errors.password) setErrors({ ...errors, password: undefined });
                            }}
                            aria-invalid={errors.password ? "true" : "false"}
                            aria-describedby={
                              errors.password ? "signup-password-error" : "signup-password-hint"
                            }
                            className="h-12 w-full text-[0.95rem]"
                            style={{
                              borderColor: errors.password ? brand.accentColor : "#DCD5C8",
                              borderRadius: brand.radius,
                              backgroundColor: "#FFFFFF",
                            }}
                          />
                        </div>

                        {errors.password ? (
                          <p
                            id="signup-password-error"
                            className="pt-rise mt-2 flex items-center gap-2 text-sm"
                            style={{
                              color: brand.accentColor,
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            <X className="h-4 w-4 shrink-0" aria-hidden="true" />
                            {errors.password}
                          </p>
                        ) : (
                          <div
                            id="signup-password-hint"
                            className="mt-3 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-2" aria-hidden="true">
                              {[0, 1, 2].map((i) => (
                                <span
                                  key={i}
                                  className="h-1.5 w-10 rounded-full transition-colors"
                                  style={{
                                    backgroundColor:
                                      password.length === 0
                                        ? "#E4DED2"
                                        : i <= strength
                                          ? strength === 0
                                            ? brand.accentColor
                                            : brand.primaryColor
                                            : "#E4DED2",
                                  }}
                                />
                              ))}
                            </div>
                            <p
                              className="text-xs"
                              style={{
                                color: brand.neutralColor,
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {password.length === 0
                                ? "8 characters minimum"
                                : strengthWord + " · " + password.length + " characters"}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="signup-keep"
                          checked={keepSignedIn}
                          onChange={(e) =>
                            setKeepSignedIn(e && e.target ? e.target.checked : !keepSignedIn)
                          }
                          className="pt-focus mt-0.5"
                        />
                        <Label
                          htmlFor="signup-keep"
                          className="text-sm font-normal leading-relaxed"
                        >
                          <span className="font-medium">Keep me signed in on this device</span>
                          <span className="block text-sm" style={{ color: brand.neutralColor }}>
                            Leave this off if you're on a shared or public computer.
                          </span>
                        </Label>
                      </div>

                      <div className="pt-1">
                        <Button
                          type="submit"
                          disabled={status === "submitting"}
                          aria-busy={status === "submitting" ? "true" : "false"}
                          className="pt-focus h-13 w-full px-6 py-3.5 text-[1rem] font-semibold transition-transform active:scale-[0.995] disabled:cursor-wait"
                          style={{
                            backgroundColor: brand.primaryColor,
                            color: brand.backgroundColor,
                            borderRadius: brand.radius,
                            opacity: status === "submitting" ? 0.85 : 1,
                          }}
                        >
                          {status === "submitting" ? (
                            <span className="inline-flex items-center gap-2">
                              Creating your account
                              <span className="inline-flex items-center gap-1" aria-hidden="true">
                                <span
                                  className="pt-dot inline-block h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: brand.backgroundColor }}
                                />
                                <span
                                  className="pt-dot inline-block h-1.5 w-1.5 rounded-full"
                                  style={{
                                    backgroundColor: brand.backgroundColor,
                                    animationDelay: "0.15s",
                                  }}
                                />
                                <span
                                  className="pt-dot inline-block h-1.5 w-1.5 rounded-full"
                                  style={{
                                    backgroundColor: brand.backgroundColor,
                                    animationDelay: "0.3s",
                                  }}
                                />
                              </span>
                            </span>
                          ) : status === "failed" ? (
                            "Try creating my account again"
                          ) : (
                            "Create account and start chatting"
                          )}
                        </Button>
                        <p className="sr-only" role="status" aria-live="polite">
                          {status === "submitting"
                            ? "Creating your account, one moment."
                            : status === "failed"
                              ? "We couldn't reach the account service. Your details are still in the form."
                              : ""}
                        </p>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <p
                className="mt-6 max-w-xl text-sm leading-relaxed"
                style={{ color: brand.neutralColor }}
              >
                Pocket Talk is a prototype. Your conversations are private to your account, kept
                until you delete them, and never shared or published.{" "}
                <button
                  type="button"
                  onClick={() => navigate("sign-in")}
                  className="pt-focus rounded px-0.5 font-semibold underline underline-offset-4"
                  style={{ color: brand.primaryColor }}
                >
                  Forgot a password instead?
                </button>
              </p>
            </div>
          </section>

          <aside className="hidden lg:block" aria-label="Why Pocket Talk">
            <h2 className="mb-4" style={labelStyle}>
              A thread, a minute in
            </h2>
            <div
              className="p-5"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E4DED2",
                borderRadius: "1.25rem",
              }}
            >
              <p className="text-[0.9rem] leading-relaxed" style={{ color: "#211F1C" }}>
                Ask anything and keep the thread in mind as you go — follow-ups, edits and
                tangents all stay in one place.
              </p>
            </div>

            <dl
              className="mt-6 grid grid-cols-2 gap-5 text-sm"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              <div>
                <dt style={labelStyle}>Daily messages</dt>
                <dd className="mt-1 text-base font-semibold">40 included</dd>
              </div>
              <div>
                <dt style={labelStyle}>Saved chats</dt>
                <dd className="mt-1 text-base font-semibold">Unlimited</dd>
              </div>
            </dl>
          </aside>
        </main>
      </div>
    </div>
  );
}