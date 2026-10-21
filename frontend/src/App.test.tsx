import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

// --- setup -----------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// Mock Chat so we don't pull in its heavyweight internals / @ts-nocheck module.
vi.mock("@/screens/Chat", () => ({
  default: () => <div data-testid="chat-screen">Chat</div>,
}));

// --- tests -----------------------------------------------------------------

describe("App", () => {
  it("opens on Sign in, with no menu around it", () => {
    const { container } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(container.firstChild).not.toBeNull();
    // The menu belongs to the screens behind sign-in, so none of its links is here.
    expect(screen.queryByRole("link", { name: "Set a new password" })).toBeNull();
  });

  it("redirects unauthenticated access to /chat back to /sign-in", () => {
    render(
      <MemoryRouter initialEntries={["/chat"]}>
        <App />
      </MemoryRouter>,
    );
    // The route guard should redirect — the Chat screen must not render.
    expect(screen.queryByTestId("chat-screen")).toBeNull();
    // The Sign in heading should be visible instead.
    expect(screen.getByRole("heading", { name: /Welcome back/i })).toBeInTheDocument();
  });

  it("renders the Chat screen for authenticated users at /chat", () => {
    localStorage.setItem("pockettalk.token", "valid-token");

    render(
      <MemoryRouter initialEntries={["/chat"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("chat-screen")).toBeInTheDocument();
  });
});