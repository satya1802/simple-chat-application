import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

function putSession() {
  localStorage.setItem(
    "pt_session",
    JSON.stringify({
      token: "tok-1",
      user: { id: "u-1", email: "mara@example.com", created_at: "2026-10-01T00:00:00Z" },
    }),
  );
}

// The app shell's own nav, as opposed to the chat screen's unrelated sidebar
// (which has its own, unwired "Sign out" button left over from the prototype).
function shellNav() {
  return screen.getByText("Simple chat application").closest("aside")!;
}

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

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

  it("redirects a signed-out visitor who opens the chat screen to sign in", () => {
    render(
      <MemoryRouter initialEntries={["/chat"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
  });

  it("lets a signed-in user open the chat screen", () => {
    putSession();
    render(
      <MemoryRouter initialEntries={["/chat"]}>
        <App />
      </MemoryRouter>,
    );
    expect(within(shellNav()).getByRole("link", { name: "Chat" })).toBeInTheDocument();
  });

  it("signing out clears the session and a subsequent attempt to open chat redirects to sign-in", async () => {
    putSession();
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(jsonResponse({ ok: true })));

    const user = userEvent.setup();
    const { unmount } = render(
      <MemoryRouter initialEntries={["/chat"]}>
        <App />
      </MemoryRouter>,
    );

    await user.click(within(shellNav()).getByRole("button", { name: /sign out/i }));
    expect(await screen.findByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(localStorage.getItem("pt_session")).toBeNull();
    unmount();

    render(
      <MemoryRouter initialEntries={["/chat"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
  });
});
