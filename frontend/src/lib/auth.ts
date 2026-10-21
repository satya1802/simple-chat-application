/**
 * Client auth state: the one place the session token lives, so every other
 * screen reads the same source instead of inventing its own storage.
 *
 * The password itself is never kept here or anywhere else on the client --
 * it is sent once, in the request body, and dropped.
 */
import { useEffect, useState } from "react";

import { apiFetch, ApiError } from "@/lib/api";

const SESSION_KEY = "pt_session";

export interface SessionUser {
  id: string;
  email: string;
  created_at: string;
}

export interface Session {
  token: string;
  user: SessionUser;
}

interface AuthResponse {
  token: string;
  user: SessionUser;
}

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function setSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  notify();
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  notify();
}

/** Re-renders a component whenever the session changes, in this tab or another. */
export function useSession(): Session | null {
  const [session, setLocalSession] = useState<Session | null>(() => getSession());

  useEffect(() => {
    const listener = () => setLocalSession(getSession());
    listeners.add(listener);
    window.addEventListener("storage", listener);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", listener);
    };
  }, []);

  return session;
}

export async function registerAccount(email: string, password: string): Promise<Session> {
  const response = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const session: Session = { token: response.token, user: response.user };
  setSession(session);
  return session;
}

export async function login(email: string, password: string): Promise<Session> {
  const response = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const session: Session = { token: response.token, user: response.user };
  setSession(session);
  return session;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } finally {
    clearSession();
  }
}

/** Best-effort warm of the sidebar's data source right after sign-in/sign-up. */
export async function fetchConversations(): Promise<unknown> {
  return apiFetch("/conversations");
}

export interface FieldError {
  field: "email" | "password";
  message: string;
}

/**
 * Pulls a field-level message out of a register/login failure, for the forms
 * that show it against the offending input (sign-up's duplicate-email,
 * malformed-email and too-short-password cases). Returns null when the
 * failure has no usable field-level detail -- a network error, say -- so the
 * caller can fall back to its own generic message.
 */
export function fieldErrorFrom(error: unknown): FieldError | null {
  if (!(error instanceof ApiError) || !error.body || typeof error.body !== "object") return null;
  const body = error.body as { detail?: unknown };
  const detail = body.detail;

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { loc?: unknown[]; msg?: string };
    const loc = Array.isArray(first.loc) ? first.loc : [];
    const last = loc[loc.length - 1];
    const field: FieldError["field"] = last === "password" ? "password" : "email";
    return { field, message: first.msg ?? "That value isn't valid." };
  }

  if (typeof detail === "string") {
    const field: FieldError["field"] = /password/i.test(detail) ? "password" : "email";
    return { field, message: detail };
  }

  return null;
}
