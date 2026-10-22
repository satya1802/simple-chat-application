import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiFetch, apiStream } from "@/lib/api";
import { login } from "@/lib/auth";

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

function streamResponse(chunks: string[], status = 200) {
  const encoder = new TextEncoder();
  let i = 0;
  const body = {
    getReader() {
      return {
        read() {
          if (i >= chunks.length) return Promise.resolve({ value: undefined, done: true });
          const value = encoder.encode(chunks[i]);
          i += 1;
          return Promise.resolve({ value, done: false });
        },
      };
    },
  };
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    body,
    json: () => Promise.resolve({}),
  } as unknown as Response);
}

describe("apiFetch auth header", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("sends no Authorization header when there is no session", async () => {
    const fetchMock = vi.fn().mockReturnValue(jsonResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/conversations");

    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers.Authorization).toBeUndefined();
  });

  it("attaches the stored session's bearer token once signed in", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (String(url).includes("/auth/login")) {
        return jsonResponse({
          token: "tok-abc",
          user: { id: "u-1", email: "mara@example.com", created_at: "2026-10-01T00:00:00Z" },
        });
      }
      return jsonResponse([]);
    });
    vi.stubGlobal("fetch", fetchMock);

    await login("mara@example.com", "s3cret123");
    await apiFetch("/conversations");

    const call = fetchMock.mock.calls.find((c) => String(c[0]).includes("/conversations"));
    expect(call![1].headers.Authorization).toBe("Bearer tok-abc");
  });
});

describe("apiStream", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("delivers each decoded chunk to the callback in order", async () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(streamResponse(["Hel", "lo ", "there"])));

    const received: string[] = [];
    await apiStream("/conversations/c1/messages", { content: "hi" }, (chunk) => {
      received.push(chunk);
    });

    expect(received).toEqual(["Hel", "lo ", "there"]);
  });

  it("throws ApiError and calls no callback when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(jsonResponse({ detail: "nope" }, 500)));

    const received: string[] = [];
    await expect(
      apiStream("/conversations/c1/messages", { content: "hi" }, (chunk) => received.push(chunk)),
    ).rejects.toBeInstanceOf(ApiError);
    expect(received).toEqual([]);
  });
});
