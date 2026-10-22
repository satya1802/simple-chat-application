/// <reference types="vite/client" />
// Without the reference above, `import.meta.env` is not typed and `tsc --noEmit` fails --
// which `vite build` does not catch, because it tree-shakes this module out when no screen
// imports it yet.
//
// Where the generated API lives.
//
// Set at build time: the platform bakes the deployed API URL into the frontend build. The
// fallback is the local backend so a bare `npm run dev` still points somewhere real.
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// `getSession` lives in `@/lib/auth`, which itself imports `apiFetch` from here. That makes
// this a circular import -- safe under ESM/Vite because neither module calls the other's
// exports at the top level, only later, inside request functions. Reading the token here
// keeps there being exactly one place a session is stored, per US-010-2's constraint not to
// duplicate token handling.
import { getSession } from "@/lib/auth";

/**
 * Thrown by `apiFetch` for a non-2xx response. Carries the parsed JSON body
 * (when there is one) so a caller that needs the server's own English error
 * message -- a duplicate-email or too-short-password detail, for instance --
 * can read it without re-fetching.
 */
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function authHeaders(): Record<string, string> {
  const session = getSession();
  return session ? { Authorization: `Bearer ${session.token}` } : {};
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(init?.headers ?? {}) },
  });
  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }
    throw new ApiError(
      `${init?.method ?? "GET"} ${path} failed: ${response.status}`,
      response.status,
      body,
    );
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

/**
 * POSTs `body` to `path` and reads back a streamed text response, calling
 * `onChunk` with each piece of text as it arrives -- for the assistant reply
 * in Chat, which renders token-by-token rather than waiting for the whole
 * message.
 */
export async function apiStream(
  path: string,
  body: unknown,
  onChunk: (text: string) => void,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = undefined;
    }
    throw new ApiError(`POST ${path} failed: ${response.status}`, response.status, errorBody);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    if (text) onChunk(text);
  }
}
