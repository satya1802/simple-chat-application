/// <reference types="vite/client" />
// Without the reference above, `import.meta.env` is not typed and `tsc --noEmit` fails --
// which `vite build` does not catch, because it tree-shakes this module out when no screen
// imports it yet.
//
// Where the generated API lives.
//
// Set at build time: the platform bakes the deployed API URL into the frontend build. The
// fallback is the local backend so a bare `npm run dev` still points somewhere real.
//
// The generated screens do NOT use this yet -- they render seeded sample data, exactly as
// they were approved. This is the seam to replace that with real calls, one screen at a
// time.

/** Type aliases for the request and response bodies the API spec declares. */
export interface UserPublic {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: UserPublic;
}

export interface ConversationSummary {
  id: string;
  title: string;
  last_activity_at: string;
}

export interface ConversationCreateResponse {
  id: string;
  title: string;
}

export interface MessageOut {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const TOKEN_KEY = "pockettalk.token";

/** Read the stored session token, if any. */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Persist the session token after a successful login or register. */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Clear the session token on logout. */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} failed: ${response.status}`);
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}
