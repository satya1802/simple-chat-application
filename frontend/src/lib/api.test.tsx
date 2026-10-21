import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/App";
import { apiFetch, ApiError, clearToken, getToken, setToken, signOut } from "@/lib/api";


function mockFetch(responses) {
  const calls = [];
  const fn = vi.fn(async (input, init) => {
    calls.push({ input: String(input), init });
    const key = `${(init && init.method) || "GET"} ${String(input)}`;
    const entry = responses[key] ?? responses.default;
    if (!entry) throw new Error(`unexpected fetch ${key}`);
    const status = entry.status ?? 200;
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => entry.body,
    };
  });
  vi.stubGlobal("fetch", fn);
  return { fn, calls };
}

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("apiFetch", () => {
  beforeEach(() => localStorage.clear());

  it("sends the stored JWT as a Bearer header", async () => {
    setToken("bearer-token-123");
    const { fn } = mockFetch({
      "GET http://localhost:8000/anything": { status: 200, body: { ok: true } },
    });
    await apiFetch("/anything");
    const headers = fn.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe("Bearer bearer-token-123");
  });

  it("omits the Authorization header when no token is stored", async () => {
    const { fn } = mockFetch({
      "GET http://localhost:8000/anything": { status: 200, body: { ok: true } },
    });
    await apiFetch("/anything");
    const headers = fn.mock.calls[0][1].headers;
    expect(headers.Authorization).toBeUndefined();
  });

  it("throws an ApiError carrying the status and body", async () => {
    mockFetch({
      "POST http://localhost:8000/auth/register": { status: 409, body: { detail: "dup" } },
    });
    await expect(
      apiFetch("/auth/register", { method: "POST", body: "{}" }),
    ).rejects.toMatchObject({ status: 409, body: { detail: "dup" } });
  });

  it("clears the JWT and redirects to /sign-in on a 401", async () => {
    setToken("doomed");
    const assign = vi.fn();
    // jsdom does not implement navigation; stub it so the redirect is observable.
    vi.stubGlobal("window", Object.defineProperty(window, "location", {
      value: { pathname: "/chat", assign },
      configurable: true,
    }));
    mockFetch({
      "GET http://localhost:8000/secret": { status: 401, body: { detail: "no" } },
    });

    await expect(apiFetch("/secret")).rejects.toBeInstanceOf(ApiError);
    expect(getToken()).toBeNull();
    expect(assign).toHaveBeenCalledWith("/sign-in");

    // Restore for afterEach cleanup.
    vi.unstubAllGlobals();
  });

  it("does not redirect when the 401 happens on /sign-in itself", async () => {
    setToken("irrelevant");
    const assign = vi.fn();
    vi.stubGlobal("window", Object.defineProperty(window, "location", {
      value: { pathname: "/sign-in", assign },
      configurable: true,
    }));
    mockFetch({
      "POST http://localhost:8000/auth/login": { status: 401, body: { detail: "bad" } },
    });

    await expect(
      apiFetch("/auth/login", { method: "POST", body: "{}" }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(assign).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe("signOut", () => {
  beforeEach(() => localStorage.clear());

  it("POSTs /auth/logout and clears the stored token", async () => {
    setToken("session-token");
    const { fn } = mockFetch({
      "POST http://localhost:8000/auth/logout": { status: 200, body: { ok: true } },
    });
    await signOut();
    expect(getToken()).toBeNull();
    expect(fn).toHaveBeenCalled();
    const [, init] = fn.mock.calls[0];
    expect(init.method).toBe("POST");
  });

  it("clears the token even if the server call fails", async () => {
    setToken("session-token");
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("network down");
    }));
    await signOut();
    expect(getToken()).toBeNull();
  });
});

describe("route guard", () => {
  beforeEach(() => localStorage.clear());

  it("redirects unauthenticated access to /chat back to /sign-in", () => {
    clearToken();
    render(
      <MemoryRouter initialEntries={["/chat"]}>
        <App />
      </MemoryRouter>,
    );
    // The SignIn screen renders at /sign-in after the guard redirects.
    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
  });

  it("shows the chat screen when a token is present", async () => {
    setToken("valid-session");
    render(
      <MemoryRouter initialEntries={["/chat"]}>
        <App />
      </MemoryRouter>,
    );
    // Chat renders its sidebar heading; the sign-in heading must not appear.
    await waitFor(() => {
      expect(screen.getByText("Your chats")).toBeInTheDocument();
    });
    expect(screen.queryByRole("heading", { name: /welcome back/i })).toBeNull();
  });
});

describe("App shell sign-out", () => {
  beforeEach(() => localStorage.clear());

  it("signs out and returns to /sign-in", async () => {
    const user = userEvent.setup();
    setToken("shell-session");
    const { fn } = mockFetch({
      "POST http://localhost:8000/auth/logout": { status: 200, body: { ok: true } },
    });
    render(
      <MemoryRouter initialEntries={["/chat"]}>
        <App />
      </MemoryRouter>,
    );

    const shellHeading = screen.getByText("Simple chat application");
    const aside = shellHeading.closest("aside");
    expect(aside).not.toBeNull();
    const signOutButton = within(aside).getByRole("button", { name: /sign out/i });
    await user.click(signOutButton);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    });
    expect(getToken()).toBeNull();
    expect(fn).toHaveBeenCalled();
  });
});