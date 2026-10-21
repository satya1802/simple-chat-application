/// <reference types="vite/client" />
// Without the reference above, `import.meta.env` is not typed and `tsc --noEmit` fails --
// which `vite build` does not catch, because it tree-shakes this module out when no screen
// imports it yet.
//
// Where the generated API lives.
//
// Set at build time: the platform bakes the deployed API URL into the frontend build. The
// fallback is the local backend so a bare `npm run dev` still points somewhere real.

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

/**
 * Thrown by {@link apiFetch} when the server returns a non-2xx status.
 * Carries the HTTP status code and the parsed response body (if any) so
 * callers can branch on specific error conditions (409 conflict, 422
 * validation, 401 unauthorised, etc.).
 */
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * Paths where a 401 means "wrong credentials" rather than "expired session".
 * On these screens the 401 should be surfaced to the caller so it can show
 * an inline message — not trigger a redirect to the very page the user is
 * already on.
 */
const AUTH_PATHS = new Set(["/sign-in", "/sign-up"]);

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
    let body: unknown = undefined;
    try {
      body = await response.json();
    } catch {
      // Response body was not JSON — leave body undefined.
    }

    // An authenticated request that comes back 401 means the token is
    // invalid or expired. Clear it and send the user back to sign-in —
    // but only when they are not already on a sign-in / sign-up screen,
    // where a 401 means "wrong credentials" and should show an inline
    // error instead of redirecting in a loop.
    if (response.status === 401 && token && typeof window !== "undefined") {
      const pathname = window.location.pathname;
      if (!AUTH_PATHS.has(pathname)) {
        clearToken();
        window.location.assign("/sign-in");
      }
    }

    throw new ApiError(
      response.status,
      body,
      `${init?.method ?? "GET"} ${path} failed: ${response.status}`,
    );
  }

  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

/**
 * Sign the current user out: notify the server, then clear the stored JWT.
 * The caller is responsible for navigating to /sign-in afterwards (e.g.
 * via the router's `useNavigate`), so that the transition stays within
 * the SPA.
 */
export async function signOut(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    // The server may be unreachable or the token expired — clear
    // locally regardless so the user is signed out on this device.
  }
  clearToken();
}