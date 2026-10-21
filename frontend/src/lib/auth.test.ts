import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";
import { fieldErrorFrom, getSession, login, logout, registerAccount } from "@/lib/auth";

const USER = { id: "u-1", email: "mara@example.com", created_at: "2026-10-01T00:00:00Z" };

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

describe("auth session storage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it("has no session before anyone signs in", () => {
    expect(getSession()).toBeNull();
  });

  it("registerAccount stores the returned token and user, never the password", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(jsonResponse({ token: "tok-1", user: USER })),
    );

    const session = await registerAccount("mara@example.com", "s3cret123");

    expect(session.token).toBe("tok-1");
    expect(session.user).toEqual(USER);
    expect(getSession()).toEqual(session);
    const stored = localStorage.getItem("pt_session") ?? "";
    expect(stored).not.toMatch(/s3cret123/);
  });

  it("login stores the session on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(jsonResponse({ token: "tok-2", user: USER })),
    );

    const session = await login("mara@example.com", "s3cret123");
    expect(getSession()).toEqual(session);
  });

  it("login leaves no session behind on failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(jsonResponse({ detail: "nope" }, 401)));

    await expect(login("mara@example.com", "wrong")).rejects.toBeInstanceOf(ApiError);
    expect(getSession()).toBeNull();
  });

  it("logout calls the API and clears the stored session even if the call fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(jsonResponse({ token: "tok-3", user: USER })),
    );
    await login("mara@example.com", "s3cret123");
    expect(getSession()).not.toBeNull();

    vi.stubGlobal("fetch", vi.fn().mockReturnValue(jsonResponse({}, 500)));
    await expect(logout()).rejects.toBeInstanceOf(ApiError);
    expect(getSession()).toBeNull();
  });
});

describe("fieldErrorFrom", () => {
  it("reads a pydantic-style validation error back to its field", () => {
    const error = new ApiError("failed", 422, {
      detail: [{ loc: ["body", "password"], msg: "ensure this value has at least 8 characters" }],
    });
    expect(fieldErrorFrom(error)).toEqual({
      field: "password",
      message: "ensure this value has at least 8 characters",
    });
  });

  it("reads a plain string detail as an email-field error", () => {
    const error = new ApiError("failed", 409, { detail: "Email already registered" });
    expect(fieldErrorFrom(error)).toEqual({
      field: "email",
      message: "Email already registered",
    });
  });

  it("returns null for errors with no usable body", () => {
    expect(fieldErrorFrom(new Error("network down"))).toBeNull();
  });
});
