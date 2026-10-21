// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";
import { apiFetch, ApiError, setToken } from "@/lib/api";

const { Button, Input, Label, Checkbox } = UI;
const { AlertCircle, CheckCircle } = Icons;

export default function Screen() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState({});
  const [banner, setBanner] = React.useState(null); // { title, body }
  const [status, setStatus] = React.useState("idle"); // idle | submitting

  const emailRef = React.useRef(null);
  const passwordRef = React.useRef(null);

  const ink = brand.primaryColor;
  const muted = brand.neutralColor;
  const hairline = brand.neutralColor + "2E";
  const ringStyle = { "--tw-ring-color": brand.primaryColor };

  const fieldClass =
    "w-full bg-white px-4 py-3 text-[15px] outline-none transition-shadow duration-150 " +
    "focus:ring-2 focus:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2";

  const fieldStyle = (invalid) => ({
    borderRadius: brand.radius,
    border: "1px solid " + (invalid ? brand.accentColor : hairline),
    color: ink,
    fontFamily: brand.fontBody,
    ...ringStyle,
  });

  function resetFeedback() {
    setFieldErrors({});
    setBanner(null);
  }

  async function handleSignIn(event) {
    event.preventDefault();
    if (status === "submitting") return;

    const trimmed = email.trim();
    const errs = {};
    if (!trimmed) errs.email = "Enter the email you signed up with.";
    if (!password) errs.password = "Enter your password.";

    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      setBanner(null);
      (errs.email ? emailRef : passwordRef).current?.focus();
      return;
    }

    resetFeedback();
    setStatus("submitting");
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: trimmed, password }),
      });
      setToken(data.token);
      navigate("chat");
    } catch (err) {
      setStatus("idle");
      if (err instanceof ApiError && err.status === 401) {
        // One neutral message — we never reveal whether the email exists.
        setBanner({
          title: "Email or password is incorrect",
          body: "Check the password and try again — we don't say which part was wrong on purpose.",
        });
        passwordRef.current?.focus();
      } else {
        setBanner({
          title: "We couldn't reach Pocket Talk",
          body: "The sign-in request didn't get through. Your email and password are still here — try again in a moment.",
        });
      }
    }
  }

  const bannerTone = {
    bg: brand.accentColor + "14",
    border: brand.accentColor + "59",
    fg: brand.accentColor,
  };

  const Keyframes = (
    <style>{`
      @keyframes pt-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      .pt-rise { animation: pt-rise .36s cubic-bezier(.2,.7,.3,1) both; }
      @media (prefers-reduced-motion: reduce) {
        .pt-rise { animation: none !important; }
      }
    `}</style>
  );

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: brand.backgroundColor, fontFamily: brand.fontBody, color: ink }}
    >
      {Keyframes}
      <div className="mx-auto grid min-h-screen w-full max-w-6xl lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        {/* ---------- Brand panel (desktop) ---------- */}
        <aside
          className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex"
          style={{ backgroundColor: ink }}
        >
          <div className="flex items-center gap-3">
            <span
              className="grid h-9 w-9 place-items-center text-sm font-bold text-white"
              style={{ backgroundColor: brand.accentColor, borderRadius: "1rem 1rem 0.25rem 1rem" }}
              aria-hidden="true"
            >
              PT
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-white">Pocket Talk</span>
          </div>

          <div className="max-w-sm">
            <p
              className="text-[27px] font-semibold leading-snug tracking-tight text-white"
              style={{ fontFamily: brand.fontHeading }}
            >
              Your conversations are waiting, exactly where you left them.
            </p>
          </div>

          <p className="flex items-center gap-2 text-[13px] text-white/75">
            <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Every chat stays private to your account. No sharing, no public links.
          </p>
        </aside>

        {/* ---------- Form column ---------- */}
        <main className="flex items-center justify-center px-5 py-12 sm:px-12">
          <div className="w-full max-w-[25.5rem]">
            <div className="mb-9 flex items-center gap-2.5 lg:hidden">
              <span
                className="grid h-8 w-8 place-items-center text-[12px] font-bold text-white"
                style={{
                  backgroundColor: brand.accentColor,
                  borderRadius: "0.9rem 0.9rem 0.25rem 0.9rem",
                }}
                aria-hidden="true"
              >
                PT
              </span>
              <span className="text-sm font-semibold tracking-tight" style={{ color: ink }}>
                Pocket Talk
              </span>
            </div>

            <div>
              <h1
                className="text-[30px] font-semibold leading-tight tracking-tight sm:text-[34px]"
                style={{ fontFamily: brand.fontHeading, color: ink }}
              >
                Welcome back
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed" style={{ color: muted }}>
                Sign in to pick your conversations back up, mid-sentence if you like.
              </p>

              {/* Banner: incorrect credentials / network */}
              <div aria-live="assertive">
                {banner && (
                  <div
                    role="alert"
                    className="pt-rise mt-6 flex gap-3 p-4"
                    style={{
                      backgroundColor: bannerTone.bg,
                      border: "1px solid " + bannerTone.border,
                      borderRadius: brand.radius,
                    }}
                  >
                    <AlertCircle
                      className="mt-0.5 h-[18px] w-[18px] shrink-0"
                      style={{ color: bannerTone.fg }}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-[14px] font-semibold" style={{ color: bannerTone.fg }}>
                        {banner.title}
                      </p>
                      <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: muted }}>
                        {banner.body}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <form className="mt-7 space-y-5" onSubmit={handleSignIn} noValidate>
                <div>
                  <Label
                    htmlFor="email"
                    className="mb-1.5 block text-[12.5px] font-semibold uppercase tracking-wide"
                    style={{ color: muted }}
                  >
                    Email address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    ref={emailRef}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }));
                    }}
                    placeholder="you@example.com"
                    aria-invalid={fieldErrors.email ? "true" : "false"}
                    aria-describedby={fieldErrors.email ? "email-error" : undefined}
                    className={fieldClass}
                    style={fieldStyle(!!fieldErrors.email)}
                  />
                  {fieldErrors.email && (
                    <p
                      id="email-error"
                      className="mt-2 flex items-start gap-1.5 text-[13px] font-medium"
                      style={{ color: brand.accentColor }}
                    >
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <Label
                      htmlFor="password"
                      className="block text-[12.5px] font-semibold uppercase tracking-wide"
                      style={{ color: muted }}
                    >
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-pressed={showPassword}
                      className="text-[12.5px] font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{ color: ink, borderRadius: "0.25rem", ...ringStyle }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    ref={passwordRef}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password)
                        setFieldErrors((f) => ({ ...f, password: undefined }));
                    }}
                    placeholder="Your password"
                    aria-invalid={fieldErrors.password ? "true" : "false"}
                    aria-describedby={fieldErrors.password ? "password-error" : undefined}
                    className={fieldClass}
                    style={fieldStyle(!!fieldErrors.password)}
                  />
                  {fieldErrors.password && (
                    <p
                      id="password-error"
                      className="mt-2 flex items-start gap-1.5 text-[13px] font-medium"
                      style={{ color: brand.accentColor }}
                    >
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 pt-0.5">
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      id="remember"
                      checked={remember}
                      onChange={(e) => setRemember(e && e.target ? e.target.checked : !remember)}
                      className="h-4 w-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{ accentColor: ink, ...ringStyle }}
                    />
                    <Label htmlFor="remember" className="text-[14px]" style={{ color: muted }}>
                      Keep me signed in
                    </Label>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("reset-password")}
                    className="text-[14px] font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ color: ink, borderRadius: "0.25rem", ...ringStyle }}
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={status === "submitting"}
                  className="flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold text-white transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55"
                  style={{ backgroundColor: ink, borderRadius: brand.radius, ...ringStyle }}
                >
                  {status === "submitting" ? "Checking your details…" : "Sign in"}
                </Button>
              </form>

              <p
                className="mt-8 border-t pt-6 text-center text-[14px]"
                style={{ borderColor: hairline, color: muted }}
              >
                New to Pocket Talk?{" "}
                <button
                  type="button"
                  onClick={() => navigate("sign-up")}
                  className="font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ color: ink, borderRadius: "0.25rem", ...ringStyle }}
                >
                  Create an account
                </button>{" "}
                — it takes an email and a password.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}