import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch, apiStream } from "@/lib/api";
import Screen from "@/screens/Chat";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, apiFetch: vi.fn(), apiStream: vi.fn() };
});

const mockedApiFetch = vi.mocked(apiFetch);
const mockedApiStream = vi.mocked(apiStream);
const LONG = { timeout: 3000 };

function renderScreen() {
  return render(
    <MemoryRouter>
      <Screen />
    </MemoryRouter>,
  );
}

function conv(id: string, title: string, lastActivity: string) {
  return { id, title, last_activity_at: lastActivity };
}

function msg(id: string, role: "user" | "assistant", content: string) {
  return { id, role, content, created_at: "2026-10-17T09:00:00Z" };
}

function sidebar() {
  return screen.getByRole("navigation", { name: /conversation list/i });
}

describe("Chat screen", () => {
  beforeEach(() => {
    mockedApiFetch.mockReset();
    mockedApiStream.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads the sidebar, opens the most recently active conversation and shows its messages", async () => {
    mockedApiFetch.mockImplementation(async (path: string) => {
      if (path === "/conversations") {
        return [
          conv("c-old", "Older chat", "2026-10-15T10:00:00Z"),
          conv("c-new", "Newest chat", "2026-10-17T10:00:00Z"),
        ];
      }
      if (path === "/conversations/c-new/messages") {
        return [msg("m-1", "user", "Hello there")];
      }
      throw new Error(`unexpected path ${path}`);
    });

    renderScreen();

    expect(await within(sidebar()).findByText("Newest chat", {}, LONG)).toBeInTheDocument();
    expect(within(sidebar()).getByText("Older chat")).toBeInTheDocument();
    expect(await screen.findByText("Hello there", {}, LONG)).toBeInTheDocument();
    expect(
      mockedApiFetch.mock.calls.some((c) => c[0] === "/conversations/c-new/messages"),
    ).toBe(true);
  });

  it("shows an empty-sidebar message when there are no conversations yet", async () => {
    mockedApiFetch.mockImplementation(async (path: string) => {
      if (path === "/conversations") return [];
      throw new Error(`unexpected path ${path}`);
    });

    renderScreen();

    expect(await screen.findByText(/no chats yet/i, {}, LONG)).toBeInTheDocument();
  });

  it("shows an error when the conversation list fails to load", async () => {
    mockedApiFetch.mockImplementation(async (path: string) => {
      if (path === "/conversations") throw new Error("network down");
      throw new Error(`unexpected path ${path}`);
    });

    renderScreen();

    expect(await screen.findByText(/couldn't be loaded/i, {}, LONG)).toBeInTheDocument();
  });

  it("New chat opens an empty thread, shows none of another conversation's messages, and focuses the composer", async () => {
    mockedApiFetch.mockImplementation(async (path: string) => {
      if (path === "/conversations") {
        return [conv("c-1", "Existing chat", "2026-10-17T10:00:00Z")];
      }
      if (path === "/conversations/c-1/messages") {
        return [msg("m-1", "user", "Something from the old chat")];
      }
      throw new Error(`unexpected path ${path}`);
    });

    renderScreen();
    expect(await screen.findByText("Something from the old chat", {}, LONG)).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /new chat/i }));

    expect(screen.queryByText("Something from the old chat")).toBeNull();
    expect(await screen.findByText(/say anything to get started/i, {}, LONG)).toBeInTheDocument();
    expect(screen.getByLabelText(/message pocket talk/i)).toHaveFocus();
  });

  it("sending the first message creates a conversation, disables the composer while streaming, and shows the server's title at the top of the sidebar", async () => {
    let listCalls = 0;
    mockedApiFetch.mockImplementation(async (path: string, init?: RequestInit) => {
      if (path === "/conversations" && init?.method === "POST") {
        return { id: "c-new", title: "New chat" };
      }
      if (path === "/conversations") {
        listCalls += 1;
        if (listCalls === 1) return [];
        return [conv("c-new", "Plans for the weekend", "2026-10-17T11:00:00Z")];
      }
      throw new Error(`unexpected call ${path}`);
    });

    let resolveStream!: () => void;
    const streamPromise = new Promise<void>((resolve) => {
      resolveStream = resolve;
    });
    mockedApiStream.mockImplementation(async (_path, _body, onChunk) => {
      onChunk("Sure, ");
      onChunk("here's an idea.");
      await streamPromise;
    });

    renderScreen();
    await screen.findByText(/say anything to get started/i, {}, LONG);

    const user = userEvent.setup();
    const composer = screen.getByLabelText(/message pocket talk/i);
    await user.type(composer, "What should I do this weekend?");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(await screen.findByText("Sure, here's an idea.", {}, LONG)).toBeInTheDocument();
    expect(composer).toBeDisabled();

    resolveStream();

    await waitFor(() => expect(composer).not.toBeDisabled(), LONG);
    expect(
      await within(sidebar()).findByText("Plans for the weekend", {}, LONG),
    ).toBeInTheDocument();

    const postCall = mockedApiFetch.mock.calls.find(
      (c) => c[0] === "/conversations" && (c[1] as RequestInit | undefined)?.method === "POST",
    );
    expect(postCall).toBeTruthy();

    const streamCall = mockedApiStream.mock.calls[0];
    expect(streamCall[0]).toBe("/conversations/c-new/messages");
    expect(streamCall[1]).toEqual({ content: "What should I do this weekend?" });
  });

  it("selecting a sidebar conversation loads its messages via GET /conversations/{id}/messages", async () => {
    mockedApiFetch.mockImplementation(async (path: string) => {
      if (path === "/conversations") {
        return [
          conv("c-1", "First chat", "2026-10-17T09:00:00Z"),
          conv("c-2", "Second chat", "2026-10-16T09:00:00Z"),
        ];
      }
      if (path === "/conversations/c-1/messages") return [msg("m-1", "user", "First chat message")];
      if (path === "/conversations/c-2/messages") return [msg("m-2", "user", "Second chat message")];
      throw new Error(`unexpected path ${path}`);
    });

    renderScreen();
    await screen.findByText("First chat message", {}, LONG);

    const user = userEvent.setup();
    await user.click(within(sidebar()).getByText("Second chat"));

    expect(await screen.findByText("Second chat message", {}, LONG)).toBeInTheDocument();
    expect(screen.queryByText("First chat message")).toBeNull();
  });
});
