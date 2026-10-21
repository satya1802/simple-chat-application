// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

const { Button, Input, Label, Checkbox } = UI;
const { Check, Clock, ArrowLeft, ArrowRight, AlertCircle, CheckCircle } = Icons;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The one account that signs in successfully in this prototype build.
const KNOWN_ACCOUNT = { email: 'mara.okonkwo@gmail.com', password: 'pockettalk' };

const PREVIEW_THREAD = [
  { role: 'user', text: 'Rewrite my sourdough notes as a checklist' },
  { role: 'assistant', text: 'Sure — nine steps, starter to bake. Want timings in hours or clock times?' },
  { role: 'user', text: 'Clock times, I start at 7am' }
];

const LOCK_SECONDS = 30;
const MAX_ATTEMPTS = 3;

export default function Screen() {
  const navigate = useNavigate();
  const [mode, setMode] = React.useState('signin'); // signin | forgot | sent
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [remember, setRemember] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState({});
  const [banner, setBanner] = React.useState(null); // { tone, title, body }
  const [status, setStatus] = React.useState('idle'); // idle | submitting | success | sending
  const [attempts, setAttempts] = React.useState(0);
  const [cooldown, setCooldown] = React.useState(0);
  const [sentTo, setSentTo] = React.useState('');
  const [resends, setResends] = React.useState(0);

  const emailRef = React.useRef(null);
  const passwordRef = React.useRef(null);
  const timers = React.useRef([]);

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  };

  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  React.useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  React.useEffect(() => {
    if (cooldown === 0 && attempts >= MAX_ATTEMPTS) {
      setAttempts(0);
      setBanner(null);
    }
  }, [cooldown, attempts]);

  const locked = cooldown > 0;
  const busy = status === 'submitting' || status === 'sending' || status === 'success';

  const ink = brand.primaryColor;
  const muted = brand.neutralColor;
  const hairline = brand.neutralColor + '2E';
  const ringStyle = { '--tw-ring-color': brand.primaryColor };

  const fieldClass =
    'w-full bg-white px-4 py-3 text-[15px] outline-none transition-shadow duration-150 ' +
    'focus:ring-2 focus:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2';

  const fieldStyle = (invalid) => ({
    borderRadius: brand.radius,
    border: '1px solid ' + (invalid ? brand.accentColor : hairline),
    color: ink,
    fontFamily: brand.fontBody,
    ...ringStyle
  });

  function resetFeedback() {
    setFieldErrors({});
    setBanner(null);
  }

  function handleSignIn(event) {
    event.preventDefault();
    if (busy || locked) return;

    const trimmed = email.trim();
    const errs = {};
    if (!trimmed) errs.email = 'Enter the email you signed up with.';
    else if (!EMAIL_RE.test(trimmed)) errs.email = 'That doesn’t look like an email address — check for a typo.';
    if (!password) errs.password = 'Enter your password.';

    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      setBanner(null);
      (errs.email ? emailRef : passwordRef).current?.focus();
      return;
    }

    resetFeedback();
    setStatus('submitting');

    later(() => {
      if (/@example\.com$/i.test(trimmed)) {
        setStatus('idle');
        setBanner({
          tone: 'warn',
          title: 'We couldn’t reach Pocket Talk',
          body: 'The sign-in request timed out on its way to the server. Your email and password are still here — try again in a moment.'
        });
        return;
      }

      const ok =
        trimmed.toLowerCase() === KNOWN_ACCOUNT.email && password === KNOWN_ACCOUNT.password;

      if (ok) {
        setStatus('success');
        later(() => navigate('chat'), 900);
        return;
      }

      const next = attempts + 1;
      setAttempts(next);
      setStatus('idle');
      setPassword('');

      if (next >= MAX_ATTEMPTS) {
        setCooldown(LOCK_SECONDS);
        setBanner({
          tone: 'warn',
          title: 'Too many tries',
          body: 'Sign-in is paused for a moment to keep your account safe. You can reset your password while you wait.'
        });
      } else {
        setBanner({
          tone: 'error',
          title: 'Email or password is incorrect',
          body: 'Check the password and try again — we don’t say which part was wrong on purpose.'
        });
        passwordRef.current?.focus();
      }
    }, 850);
  }

  function handleForgot(event) {
    event.preventDefault();
    if (busy) return;

    const trimmed = email.trim();
    if (!trimmed) {
      setFieldErrors({ email: 'Enter the email on your account so we know where to send the link.' });
      emailRef.current?.focus();
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setFieldErrors({ email: 'That doesn’t look like an email address — check for a typo.' });
      emailRef.current?.focus();
      return;
    }

    resetFeedback();
    setStatus('sending');
    later(() => {
      setSentTo(trimmed);
      setResends(0);
      setStatus('idle');
      setMode('sent');
    }, 850);
  }

  function goToForgot() {
    resetFeedback();
    setStatus('idle');
    setMode('forgot');
    later(() => emailRef.current?.focus(), 30);
  }

  function goToSignIn() {
    resetFeedback();
    setStatus('idle');
    setMode('signin');
    later(() => emailRef.current?.focus(), 30);
  }

  const bannerTone = banner && banner.tone === 'error'
    ? { bg: brand.accentColor + '14', border: brand.accentColor + '59', fg: brand.accentColor }
    : { bg: brand.accentColor + '0F', border: brand.accentColor + '45', fg: brand.accentColor };

  const Keyframes = (
    <style>{`
      @keyframes pt-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      @keyframes pt-pulse { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }
      .pt-rise { animation: pt-rise .36s cubic-bezier(.2,.7,.3,1) both; }
      .pt-dot { animation: pt-pulse 1.1s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) {
        .pt-rise, .pt-dot { animation: none !important; }
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
              style={{ backgroundColor: brand.accentColor, borderRadius: '1rem 1rem 0.25rem 1rem' }}
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

            <ul className="mt-9 space-y-3" aria-hidden="true">
              {PREVIEW_THREAD.map((m, i) => (
                <li
                  key={i}
                  className={'pt-rise flex ' + (m.role === 'user' ? 'justify-end' : 'justify-start')}
                  style={{ animationDelay: 90 * i + 'ms' }}
                >
                  <span
                    className={
                      'max-w-[84%] px-4 py-2.5 text-[13.5px] leading-relaxed ' +
                      (m.role === 'user' ? 'bg-white/90' : 'bg-white/12 text-white')
                    }
                    style={{
                      color: m.role === 'user' ? ink : undefined,
                      borderRadius:
                        m.role === 'user' ? '1.1rem 1.1rem 0.3rem 1.1rem' : '1.1rem 1.1rem 1.1rem 0.3rem'
                    }}
                  >
                    {m.text}
                  </span>
                </li>
              ))}
              <li className="flex justify-start">
                <span
                  className="flex items-center gap-1.5 bg-white/12 px-4 py-3"
                  style={{ borderRadius: '1.1rem 1.1rem 1.1rem 0.3rem' }}
                >
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="pt-dot block h-1.5 w-1.5 rounded-full bg-white"
                      style={{ animationDelay: d * 180 + 'ms' }}
                    />
                  ))}
                </span>
              </li>
            </ul>
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
                style={{ backgroundColor: brand.accentColor, borderRadius: '0.9rem 0.9rem 0.25rem 0.9rem' }}
                aria-hidden="true"
              >
                PT
              </span>
              <span className="text-sm font-semibold tracking-tight" style={{ color: ink }}>
                Pocket Talk
              </span>
            </div>

            {mode === 'sent' ? (
              /* ---------- Reset link sent ---------- */
              <div className="pt-rise">
                <span
                  className="mb-6 grid h-11 w-11 place-items-center"
                  style={{ backgroundColor: ink + '14', borderRadius: brand.radius }}
                >
                  <CheckCircle className="h-5 w-5" style={{ color: ink }} aria-hidden="true" />
                </span>
                <h1
                  className="text-[30px] font-semibold leading-tight tracking-tight sm:text-[34px]"
                  style={{ fontFamily: brand.fontHeading, color: ink }}
                >
                  Check your email
                </h1>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ color: muted }}>
                  If <span className="font-medium" style={{ color: ink }}>{sentTo}</span> has a Pocket Talk
                  account, a reset link is on its way. It works once and expires 30 minutes after it was sent.
                </p>

                <div className="mt-8 space-y-3">
                  <Button
                    type="button"
                    onClick={() => navigate('reset-password')}
                    className="flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold text-white transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ backgroundColor: ink, borderRadius: brand.radius, ...ringStyle }}
                  >
                    I have the link — set a new password
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    onClick={goToSignIn}
                    className="flex h-12 w-full items-center justify-center gap-2 bg-white text-[15px] font-medium transition-colors duration-150 hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ border: '1px solid ' + hairline, color: ink, borderRadius: brand.radius, ...ringStyle }}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Back to sign in
                  </Button>
                </div>

                <div className="mt-7 border-t pt-5 text-[13.5px]" style={{ borderColor: hairline, color: muted }}>
                  Nothing in your inbox after a minute? Look in spam, then{' '}
                  <button
                    type="button"
                    onClick={() => setResends((r) => r + 1)}
                    className="font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ color: ink, borderRadius: '0.25rem', ...ringStyle }}
                  >
                    send it again
                  </button>
                  .
                  <span role="status" aria-live="polite" className="block">
                    {resends > 0 && (
                      <span className="mt-2 block font-medium" style={{ color: brand.accentColor }}>
                        Sent again to {sentTo}. Older links in your inbox no longer work.
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ) : (
              /* ---------- Sign in / forgot password ---------- */
              <div>
                <h1
                  className="text-[30px] font-semibold leading-tight tracking-tight sm:text-[34px]"
                  style={{ fontFamily: brand.fontHeading, color: ink }}
                >
                  {mode === 'signin' ? 'Welcome back' : 'Forgot your password?'}
                </h1>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ color: muted }}>
                  {mode === 'signin'
                    ? 'Sign in to pick your conversations back up, mid-sentence if you like.'
                    : 'Give us the email on your account and we’ll send a single-use link that expires in 30 minutes.'}
                </p>

                {/* Banner: error / rate limit / network */}
                <div aria-live="assertive">
                  {banner && (
                    <div
                      role="alert"
                      className="pt-rise mt-6 flex gap-3 p-4"
                      style={{
                        backgroundColor: bannerTone.bg,
                        border: '1px solid ' + bannerTone.border,
                        borderRadius: brand.radius
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
                        {locked && (
                          <p
                            className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold"
                            style={{ color: bannerTone.fg, fontVariantNumeric: 'tabular-nums' }}
                          >
                            <Clock className="h-4 w-4" aria-hidden="true" />
                            Try again in {cooldown}s
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Success */}
                <div aria-live="polite">
                  {status === 'success' && (
                    <div
                      className="pt-rise mt-6 flex items-center gap-3 p-4"
                      style={{ backgroundColor: ink + '12', border: '1px solid ' + ink + '33', borderRadius: brand.radius }}
                    >
                      <CheckCircle className="h-[18px] w-[18px] shrink-0" style={{ color: ink }} aria-hidden="true" />
                      <p className="text-[14px] font-medium" style={{ color: ink }}>
                        Signed in. Opening your conversations…
                      </p>
                    </div>
                  )}
                </div>

                <form
                  className="mt-7 space-y-5"
                  onSubmit={mode === 'signin' ? handleSignIn : handleForgot}
                  noValidate
                >
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
                      aria-invalid={fieldErrors.email ? 'true' : 'false'}
                      aria-describedby={fieldErrors.email ? 'email-error' : undefined}
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

                  {mode === 'signin' && (
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
                          style={{ color: ink, borderRadius: '0.25rem', ...ringStyle }}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        ref={passwordRef}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }));
                        }}
                        placeholder="Your password"
                        aria-invalid={fieldErrors.password ? 'true' : 'false'}
                        aria-describedby={fieldErrors.password ? 'password-error' : undefined}
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
                  )}

                  {mode === 'signin' && (
                    <div className="flex items-center justify-between gap-4 pt-0.5">
                      <div className="flex items-center gap-2.5">
                        <Checkbox
                          id="remember"
                          checked={remember}
                          onChange={(e) =>
                            setRemember(e && e.target ? e.target.checked : !remember)
                          }
                          className="h-4 w-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                          style={{ accentColor: ink, ...ringStyle }}
                        />
                        <Label htmlFor="remember" className="text-[14px]" style={{ color: muted }}>
                          Keep me signed in
                        </Label>
                      </div>
                      <button
                        type="button"
                        onClick={goToForgot}
                        className="text-[14px] font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        style={{ color: ink, borderRadius: '0.25rem', ...ringStyle }}
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={busy || (mode === 'signin' && locked)}
                    className="flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold text-white transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55"
                    style={{ backgroundColor: ink, borderRadius: brand.radius, ...ringStyle }}
                  >
                    {mode === 'signin'
                      ? status === 'submitting'
                        ? 'Checking your details…'
                        : status === 'success'
                          ? 'Signed in'
                          : locked
                            ? 'Paused for ' + cooldown + 's'
                            : 'Sign in'
                      : status === 'sending'
                        ? 'Sending your link…'
                        : 'Email me a reset link'}
                  </Button>

                  {mode === 'forgot' && (
                    <Button
                      type="button"
                      onClick={goToSignIn}
                      className="flex h-11 w-full items-center justify-center gap-2 bg-transparent text-[14px] font-medium transition-colors duration-150 hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{ color: muted, borderRadius: brand.radius, ...ringStyle }}
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      Back to sign in
                    </Button>
                  )}
                </form>

                {mode === 'signin' && (
                  <>
                    <p
                      className="mt-8 border-t pt-6 text-center text-[14px]"
                      style={{ borderColor: hairline, color: muted }}
                    >
                      New to Pocket Talk?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('sign-up')}
                        className="font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        style={{ color: ink, borderRadius: '0.25rem', ...ringStyle }}
                      >
                        Create an account
                      </button>{' '}
                      — it takes an email and a password.
                    </p>

                    <div
                      className="mt-6 p-4"
                      style={{ backgroundColor: ink + '0A', borderRadius: brand.radius }}
                    >
                      <p className="text-[12.5px] font-semibold uppercase tracking-wide" style={{ color: muted }}>
                        Demo account
                      </p>
                      <p
                        className="mt-1.5 text-[13.5px] leading-relaxed"
                        style={{ color: muted, fontVariantNumeric: 'tabular-nums' }}
                      >
                        {KNOWN_ACCOUNT.email} · {KNOWN_ACCOUNT.password}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail(KNOWN_ACCOUNT.email);
                          setPassword(KNOWN_ACCOUNT.password);
                          resetFeedback();
                          later(() => passwordRef.current?.focus(), 20);
                        }}
                        className="mt-2 text-[13.5px] font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        style={{ color: brand.accentColor, borderRadius: '0.25rem', ...ringStyle }}
                      >
                        Fill these in for me
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}