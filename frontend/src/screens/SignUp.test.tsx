import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Screen from "@/screens/SignUp";

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

function renderScreen() {
  return render(
    <MemoryRouter>
      <Screen />
    </MemoryRouter>,
  );
}

describe("SignUp", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("registers a new account and lands on an empty chat with no verification step", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (String(url).includes("/auth/register")) {
        return jsonResponse({
          token: "tok-1",
          user: { id: "u-1", email: "new@example.com", created_at: "2026-10-01T00:00:00Z" },
        });
      }
      return jsonResponse([]);
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderScreen();

    await user.type(screen.getByLabelText(/email address/i), "new@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "s3cret123");
    await user.click(screen.getByRole("button", { name: /create account and start chatting/i }));

    expect(await screen.findByText(/you're in/i)).toBeInTheDocument();
    expect(screen.queryByText(/verify|confirmation email|check your inbox/i)).toBeNull();

    const registerCall = fetchMock.mock.calls.find((call) =>
      String(call[0]).includes("/auth/register"),
    );
    expect(registerCall).toBeTruthy();
    expect(JSON.parse(registerCall![1].body)).toEqual({
      email: "new@example.com",
      password: "s3cret123",
    });
  });

  it("shows the server's duplicate-email error against the email field and keeps the typed email", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(jsonResponse({ detail: "Email already registered" }, 409)),
    );

    const user = userEvent.setup();
    renderScreen();

    await user.type(screen.getByLabelText(/email address/i), "taken@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "s3cret123");
    await user.click(screen.getByRole("button", { name: /create account and start chatting/i }));

    expect(await screen.findByText("Email already registered")).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toHaveValue("taken@example.com");
    expect(screen.queryByText(/you're in/i)).toBeNull();
  });

  it("shows the server's too-short-password error against the password field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(
        jsonResponse(
          {
            detail: [{ loc: ["body", "password"], msg: "ensure this value has at least 8 characters" }],
          },
          422,
        ),
      ),
    );

    const user = userEvent.setup();
    renderScreen();

    await user.type(screen.getByLabelText(/email address/i), "ok@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "longenough");
    await user.click(screen.getByRole("button", { name: /create account and start chatting/i }));

    expect(
      await screen.findByText("ensure this value has at least 8 characters"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toHaveValue("ok@example.com");
  });

  it("shows a generic failure and creates no navigation when the service cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network error")));

    const user = userEvent.setup();
    renderScreen();

    await user.type(screen.getByLabelText(/email address/i), "ok@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "s3cret123");
    await user.click(screen.getByRole("button", { name: /create account and start chatting/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't reach the account service/i);
    expect(screen.getByLabelText(/email address/i)).toHaveValue("ok@example.com");
  });
});
