import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SignUp from "@/screens/SignUp";

// --- helpers ---------------------------------------------------------------

/**
 * Stub global fetch to return the given status + body for every call.
 * Returns the spy so the test can inspect the request URL and init.
 */
function mockFetch(status: number, body: unknown): ReturnType<typeof vi.fn> {
  const fn = vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }));
  vi.stubGlobal("fetch", fn);
  return fn as unknown as ReturnType<typeof vi.fn>;
}

// Capture the last route passed to useNavigate so we can assert navigation
// without depending on the real router's location object.
let lastNavigate = "";
vi.mock("@/lib/navigate", () => ({
  useNavigate: () => (route: string) => {
    lastNavigate = route;
  },
  toPath: (route: string) =>
    "/" + route.trim().replace(/^\/+|\/+$/g, "").toLowerCase(),
}));

// --- setup -----------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
  lastNavigate = "";
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

// --- tests -----------------------------------------------------------------

describe("SignUp", () => {
  it("calls POST /auth/register and stores the JWT on 201, then navigates to /chat", async () => {
    const user = userEvent.setup();
    const fn = mockFetch(201, {
      token: "jwt-from-register",
      user: { id: "u1", email: "a@b.com", created_at: "now" },
    });

    render(
      <MemoryRouter initialEntries={["/sign-up"]}>
        <SignUp />
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText("you@example.com"), "new@example.com");
    await user.type(screen.getByPlaceholderText("At least 8 characters"), "supersecret1");
    await user.click(screen.getByRole("button", { name: /Create account/i }));

    await vi.waitFor(() => expect(lastNavigate).toBe("chat"));

    expect(fn).toHaveBeenCalledTimes(1);
    const call = fn.mock.calls[0] as [string, RequestInit];
    const [url, init] = call;
    expect(url).toContain("/auth/register");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      email: "new@example.com",
      password: "supersecret1",
    });
    expect(localStorage.getItem("pockettalk.token")).toBe("jwt-from-register");
  });

  it("displays an inline error for a duplicate email (409) and keeps the email value", async () => {
    const user = userEvent.setup();
    mockFetch(409, { detail: "Email already registered" });

    render(
      <MemoryRouter initialEntries={["/sign-up"]}>
        <SignUp />
      </MemoryRouter>,
    );

    const emailInput = screen.getByPlaceholderText("you@example.com");
    await user.type(emailInput, "taken@example.com");
    await user.type(screen.getByPlaceholderText("At least 8 characters"), "supersecret1");
    await user.click(screen.getByRole("button", { name: /Create account/i }));

    await vi.waitFor(() =>
      expect(screen.getByText(/already an account with this email/i)).toBeInTheDocument(),
    );
    // Email field retains its value after the error.
    expect(emailInput).toHaveValue("taken@example.com");
  });

  it("displays an inline error for a malformed email (422)", async () => {
    const user = userEvent.setup();
    mockFetch(422, {
      detail: [
        {
          loc: ["body", "email"],
          msg: "value is not a valid email address",
          type: "value_error.email",
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={["/sign-up"]}>
        <SignUp />
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText("you@example.com"), "not-an-email");
    await user.type(screen.getByPlaceholderText("At least 8 characters"), "supersecret1");
    await user.click(screen.getByRole("button", { name: /Create account/i }));

    await vi.waitFor(() =>
      expect(screen.getByText(/doesn't look like an email/i)).toBeInTheDocument(),
    );
  });

  it("displays an inline error for a short password (422)", async () => {
    const user = userEvent.setup();
    mockFetch(422, {
      detail: [
        {
          loc: ["body", "password"],
          msg: "ensure this value has at least 8 characters",
          type: "value_error.any_str.min_length",
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={["/sign-up"]}>
        <SignUp />
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText("you@example.com"), "valid@example.com");
    await user.type(screen.getByPlaceholderText("At least 8 characters"), "short");
    await user.click(screen.getByRole("button", { name: /Create account/i }));

    await vi.waitFor(() =>
      expect(screen.getByText(/Passwords need at least 8 characters/i)).toBeInTheDocument(),
    );
  });

  it("shows a network failure message when the request throws", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    render(
      <MemoryRouter initialEntries={["/sign-up"]}>
        <SignUp />
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText("you@example.com"), "valid@example.com");
    await user.type(screen.getByPlaceholderText("At least 8 characters"), "supersecret1");
    await user.click(screen.getByRole("button", { name: /Create account/i }));

    // The visible alert (role="alert") is shown for the failed status.
    await vi.waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByRole("alert")).toHaveTextContent(/couldn't reach the account service/i);
  });
});