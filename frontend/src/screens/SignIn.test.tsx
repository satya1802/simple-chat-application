import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getSession } from "@/lib/auth";
import Screen from "@/screens/SignIn";

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

describe("SignIn", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("signs in with correct credentials, stores the session and fetches conversations", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (String(url).includes("/auth/login")) {
        return jsonResponse({
          token: "tok-1",
          user: { id: "u-1", email: "mara@example.com", created_at: "2026-10-01T00:00:00Z" },
        });
      }
      return jsonResponse([]);
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderScreen();

    await user.type(screen.getByLabelText(/email address/i), "mara@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "pockettalk123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/opening your conversations/i)).toBeInTheDocument();
    expect(getSession()?.token).toBe("tok-1");

    const loginCall = fetchMock.mock.calls.find((call) => String(call[0]).includes("/auth/login"));
    expect(loginCall).toBeTruthy();
    expect(JSON.parse(loginCall![1].body)).toEqual({
      email: "mara@example.com",
      password: "pockettalk123",
    });

    const conversationsCall = fetchMock.mock.calls.find((call) =>
      String(call[0]).includes("/conversations"),
    );
    expect(conversationsCall).toBeTruthy();
  });

  it("shows exactly the generic error on failed sign-in and stays on the sign-in screen", async () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(jsonResponse({ detail: "nope" }, 401)));

    const user = userEvent.setup();
    renderScreen();

    await user.type(screen.getByLabelText(/email address/i), "mara@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Email or password is incorrect")).toBeInTheDocument();
    expect(getSession()).toBeNull();
    expect(screen.getByLabelText(/email address/i)).toHaveValue("mara@example.com");
    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
  });
});
