import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SignIn from "@/screens/SignIn";

// --- helpers ---------------------------------------------------------------

function mockFetch(status: number, body: unknown): ReturnType<typeof vi.fn> {
  const fn = vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }));
  vi.stubGlobal("fetch", fn);
  return fn as unknown as ReturnType<typeof vi.fn>;
}

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

describe("SignIn", () => {
  it("calls POST /auth/login and stores the JWT on 200, then navigates to /chat", async () => {
    const user = userEvent.setup();
    const fn = mockFetch(200, {
      token: "jwt-from-login",
      user: { id: "u1", email: "a@b.com", created_at: "now" },
    });

    render(
      <MemoryRouter initialEntries={["/sign-in"]}>
        <SignIn />
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText("you@example.com"), "user@example.com");
    await user.type(screen.getByPlaceholderText("Your password"), "mypassword");
    await user.click(screen.getByRole("button", { name: /Sign in/i }));

    await vi.waitFor(() => expect(lastNavigate).toBe("chat"));

    expect(fn).toHaveBeenCalledTimes(1);
    const call = fn.mock.calls[0] as [string, RequestInit];
    const [url, init] = call;
    expect(url).toContain("/auth/login");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      email: "user@example.com",
      password: "mypassword",
    });
    expect(localStorage.getItem("pockettalk.token")).toBe("jwt-from-login");
  });

  it("displays a single 'Email or password is incorrect' message for 401 and does not reveal whether the email exists", async () => {
    const user = userEvent.setup();
    mockFetch(401, { detail: "Incorrect email or password" });

    render(
      <MemoryRouter initialEntries={["/sign-in"]}>
        <SignIn />
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText("you@example.com"), "unknown@example.com");
    await user.type(screen.getByPlaceholderText("Your password"), "wrongpass");
    await user.click(screen.getByRole("button", { name: /Sign in/i }));

    await vi.waitFor(() =>
      expect(screen.getByText(/Email or password is incorrect/i)).toBeInTheDocument(),
    );

    // The neutral message should not mention "email doesn't exist" or similar.
    const banner = screen.getByRole("alert");
    expect(banner.textContent).not.toMatch(/exist|registered|no account/i);
    // No token should be stored.
    expect(localStorage.getItem("pockettalk.token")).toBeNull();
  });

  it("shows field-level errors when the form is submitted empty", async () => {
    const user = userEvent.setup();
    const fn = mockFetch(200, { token: "nope" });

    render(
      <MemoryRouter initialEntries={["/sign-in"]}>
        <SignIn />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /Sign in/i }));

    await vi.waitFor(() =>
      expect(screen.getByText(/Enter the email you signed up with/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(/Enter your password/i)).toBeInTheDocument();
    expect(fn).not.toHaveBeenCalled();
  });

  it("shows a network error banner when the request fails without a 401", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    render(
      <MemoryRouter initialEntries={["/sign-in"]}>
        <SignIn />
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText("you@example.com"), "user@example.com");
    await user.type(screen.getByPlaceholderText("Your password"), "mypassword");
    await user.click(screen.getByRole("button", { name: /Sign in/i }));

    await vi.waitFor(() =>
      expect(screen.getByText(/couldn't reach Pocket Talk/i)).toBeInTheDocument(),
    );
    expect(localStorage.getItem("pockettalk.token")).toBeNull();
  });
});