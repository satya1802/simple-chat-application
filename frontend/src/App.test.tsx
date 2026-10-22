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

  it("nests Sign out as an indented child item under the Chat nav link, not a standalone button", () => {
    putSession();
    render(
      <MemoryRouter initialEntries={["/chat"]}>
        <App />
      </MemoryRouter>,
    );

    const nav = shellNav();
    const chatLink = within(nav).getByRole("link", { name: "Chat" });
    const signOutButton = within(nav).getByRole("button", { name: "Sign out" });

    // The Sign out item sits inside the same group as Chat and is
    // controlled by a toggle that names the Chat group, not a free-floating
    // button below the nav block.
    const chatGroup = chatLink.closest("div")!.parentElement!;
    expect(within(chatGroup).getByRole("button", { name: "Sign out" })).toBe(signOutButton);
    expect(signOutButton.closest("ul")?.id).toBe("chat-subnav");
  });

  it("exposes an accessible mobile menu control, and expanding the nested Chat group reveals Sign out, which still signs out the same way", async () => {
    putSession();
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(jsonResponse({ ok: true })));
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/chat"]}>
        <App />
      </MemoryRouter>,
    );

    const nav = shellNav();
    const menuToggle = within(nav).getByRole("button", { name: /toggle navigation menu/i });
    expect(menuToggle).toHaveAttribute("aria-expanded", "false");
    expect(menuToggle).toHaveAttribute("aria-controls", "shell-nav");
    await user.click(menuToggle);
    expect(menuToggle).toHaveAttribute("aria-expanded", "true");

    const collapseChat = within(nav).getByRole("button", { name: /collapse chat menu/i });
    expect(collapseChat).toHaveAttribute("aria-controls", "chat-subnav");
    expect(collapseChat).toHaveAttribute("aria-expanded", "true");

    await user.click(collapseChat);
    expect(screen.queryByRole("button", { name: "Sign out" })).toBeNull();

    const expandChat = within(nav).getByRole("button", { name: /expand chat menu/i });
    await user.click(expandChat);
    const signOutButton = within(nav).getByRole("button", { name: "Sign out" });
    expect(signOutButton).toBeInTheDocument();

    await user.click(signOutButton);
    expect(await screen.findByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(localStorage.getItem("pt_session")).toBeNull();
  });

  it("signs out correctly when the logout API call rejects, same as the prior standalone handler", async () => {
    putSession();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network down")));
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/chat"]}>
        <App />
      </MemoryRouter>,
    );

    await user.click(within(shellNav()).getByRole("button", { name: "Sign out" }));
    expect(await screen.findByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(localStorage.getItem("pt_session")).toBeNull();
  });

  it("is keyboard reachable with an accessible name of exactly 'Sign out'", () => {
    putSession();
    render(
      <MemoryRouter initialEntries={["/chat"]}>
        <App />
      </MemoryRouter>,
    );

    const signOutButton = within(shellNav()).getByRole("button", { name: "Sign out" });
    expect(signOutButton.tagName).toBe("BUTTON");
    signOutButton.focus();
    expect(signOutButton).toHaveFocus();
  });
});
