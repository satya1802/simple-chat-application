import { describe, expect, it } from "vitest";

import { clearToken, getToken, setToken } from "@/lib/api";

// Integration tests for apiFetch, ApiError, signOut, route guards, and
// shell sign-out live in api.test.tsx.  This file covers the pure
// localStorage-backed token helpers in isolation.

describe("token storage helpers", () => {
  it("getToken returns null when nothing is stored", () => {
    localStorage.clear();
    expect(getToken()).toBeNull();
  });

  it("setToken and getToken round-trip", () => {
    localStorage.clear();
    setToken("round-trip");
    expect(getToken()).toBe("round-trip");
  });

  it("clearToken removes the token", () => {
    setToken("to-be-cleared");
    clearToken();
    expect(getToken()).toBeNull();
  });
});