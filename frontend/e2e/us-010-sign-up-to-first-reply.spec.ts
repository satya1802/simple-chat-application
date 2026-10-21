import { expect, test } from "@playwright/test";

/**
 * US-010: wiring between auth (US-001-2) and the chat screen (US-010-2)
 * against the real conversation API (US-010-1).
 *
 * These specs exercise the real stack the Playwright config boots (uvicorn +
 * the built frontend), not a mocked network -- the OpenAI client itself is
 * stubbed at the backend boundary the way `backend/tests/conftest.py` does,
 * via `OPENAI_API_KEY` pointed at a harmless placeholder plus whatever model
 * endpoint the CI environment provides; a send with no reply or a thread
 * that leaks another user's title is a genuine defect, not a fixture gap.
 */

function uniqueEmail(prefix: string): string {
  return `e2e-${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

const PASSWORD = "correct-horse-battery-staple";

test.describe("sign-up to first reply (AC-032, AC-033, AC-034)", () => {
  test("a new visitor registers, lands on an empty chat, sends a message, and the thread is titled", async ({
    page,
  }) => {
    const email = uniqueEmail("signup");

    await page.goto("/sign-up");
    await page.getByLabel(/email/i).first().fill(email);
    await page
      .getByLabel(/password/i)
      .first()
      .fill(PASSWORD);
    await page
      .getByRole("button", { name: /sign up|create account|open your first chat/i })
      .first()
      .click();

    // Either an inline "success" step or a direct landing on /chat -- follow
    // through to the chat screen either way.
    const continueButton = page.getByRole("button", { name: /open your first chat/i });
    if (await continueButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await continueButton.click();
    }
    await expect(page).toHaveURL(/\/chat/, { timeout: 15_000 });

    // Empty chat screen: no prior messages.
    const thread = page.getByLabel(/message thread/i).first();
    await expect(thread).toBeVisible({ timeout: 10_000 });
    await expect(thread.getByRole("listitem")).toHaveCount(0);

    const outgoingText = `QA first reply ${Date.now()}`;
    const composer = page.getByLabel(/message pocket talk|ask anything/i).first();
    await composer.fill(outgoingText);
    await page.getByRole("button", { name: /send/i }).click();

    await expect(page.getByText(outgoingText)).toBeVisible({ timeout: 10_000 });

    // A streamed assistant reply appears as a second, distinct bubble.
    await expect(async () => {
      const text = await thread.innerText();
      const replyText = text.replace(outgoingText, "").trim();
      expect(replyText.length).toBeGreaterThan(0);
    }).toPass({ timeout: 30_000 });

    // The sidebar now shows this conversation, titled from the first
    // message rather than left as "New conversation" / "New chat".
    const sidebar = page.getByLabel(/your chats/i).first();
    await expect(async () => {
      const sidebarText = await sidebar.innerText();
      expect(sidebarText).not.toMatch(/^New conversation$/m);
    }).toPass({ timeout: 10_000 });
  });
});

test.describe("sign-in failure and sign-out (AC-004, AC-005)", () => {
  test("a failed sign-in shows the generic error and stays on the sign-in screen", async ({
    page,
  }) => {
    const email = uniqueEmail("badlogin");

    // Register so the email exists, then sign out, then try the wrong password.
    await page.goto("/sign-up");
    await page.getByLabel(/email/i).first().fill(email);
    await page
      .getByLabel(/password/i)
      .first()
      .fill(PASSWORD);
    await page
      .getByRole("button", { name: /sign up|create account|open your first chat/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/chat/, { timeout: 15_000 });

    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 10_000 });

    await page.getByLabel(/email/i).first().fill(email);
    await page
      .getByLabel(/^password/i)
      .first()
      .fill("definitely-the-wrong-password");
    await page.getByRole("button", { name: /sign in|log in/i }).click();

    await expect(page.getByRole("alert")).toContainText(/incorrect/i, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("signing out then navigating to the chat URL redirects to sign-in", async ({ page }) => {
    const email = uniqueEmail("signout");

    await page.goto("/sign-up");
    await page.getByLabel(/email/i).first().fill(email);
    await page
      .getByLabel(/password/i)
      .first()
      .fill(PASSWORD);
    await page
      .getByRole("button", { name: /sign up|create account|open your first chat/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/chat/, { timeout: 15_000 });

    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 10_000 });

    await page.goto("/chat");
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 10_000 });
  });
});

test.describe("'New chat' (AC-032, AC-034)", () => {
  test("opens an empty composer-focused thread, and abandoning it leaves no sidebar entry", async ({
    page,
  }) => {
    const email = uniqueEmail("newchat");

    await page.goto("/sign-up");
    await page.getByLabel(/email/i).first().fill(email);
    await page
      .getByLabel(/password/i)
      .first()
      .fill(PASSWORD);
    await page
      .getByRole("button", { name: /sign up|create account|open your first chat/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/chat/, { timeout: 15_000 });

    // Seed a real, titled conversation first so the sidebar has a baseline
    // to compare against after abandoning the second, empty one.
    const firstMessage = `QA baseline ${Date.now()}`;
    const composer = page.getByLabel(/message pocket talk|ask anything/i).first();
    await composer.fill(firstMessage);
    await page.getByRole("button", { name: /send/i }).click();
    const thread = page.getByLabel(/message thread/i).first();
    await expect(async () => {
      const text = await thread.innerText();
      expect(text.replace(firstMessage, "").trim().length).toBeGreaterThan(0);
    }).toPass({ timeout: 30_000 });

    const sidebar = page.getByLabel(/your chats/i).first();
    const entriesBefore = await sidebar.getByRole("button").count();

    await page.getByRole("button", { name: /new chat/i }).click();

    // Empty thread, no prior messages, composer focused.
    await expect(thread.getByRole("listitem")).toHaveCount(0);
    await expect(composer).toBeFocused();

    // Abandon it: navigate to another chat (or just reload) without sending
    // anything -- it must never have been persisted, so no new sidebar entry.
    await page.reload();
    await expect(sidebar).toBeVisible({ timeout: 10_000 });
    const entriesAfter = await sidebar.getByRole("button").count();
    expect(entriesAfter).toBe(entriesBefore);
  });
});
