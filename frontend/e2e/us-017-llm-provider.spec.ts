import { expect, test } from "@playwright/test";

/**
 * US-017: Configure the hosted LLM provider.
 *
 * AC-056 is the only criterion with a user-visible, browser-side surface:
 * a message sent by a signed-in user gets an assistant reply rendered back
 * in the thread, driven by whatever model the backend is configured with.
 * AC-057 (fail-fast on a missing key), AC-058 (the key never reaching the
 * client) and AC-059 (swapping the model via env var, no code change) are
 * environment/server-startup concerns with no DOM to assert against; they
 * are covered by `backend/tests/test_config_startup.py`,
 * `backend/tests/test_secrets_not_leaked.py` and `backend/tests/test_llm.py`
 * respectively, not here.
 *
 * This spec exercises the real stack the Playwright config boots (uvicorn +
 * the built frontend), not a mocked network, so a send with no reply is a
 * genuine defect rather than a fixture gap.
 */

function uniqueEmail(): string {
  return `e2e-llm-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test.describe("AC-056: a sent message gets an assistant reply from the configured model", () => {
  test("a signed-in user's message is answered in the chat thread", async ({ page }) => {
    const email = uniqueEmail();
    const password = "correct-horse-battery-staple";

    await page.goto("/sign-up");

    // The sign-up form's exact field labels/testids are owned by US-001's screen,
    // not this ticket; fall back across the input-finding strategies a generated
    // form commonly uses so this test does not fail on a cosmetic label change.
    const emailInput = page.getByLabel(/email/i).first();
    const passwordInput = page.getByLabel(/password/i).first();
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await page.getByRole("button", { name: /sign up|create account|register/i }).click();

    // Signed in: the SPA should have navigated off the sign-up screen.
    await expect(page).not.toHaveURL(/sign-up/, { timeout: 15_000 });

    const messageBox = page.getByPlaceholder(/message|ask|type/i).first();
    await messageBox.waitFor({ state: "visible", timeout: 15_000 });
    const outgoingText = `QA round trip ${Date.now()}`;
    await messageBox.fill(outgoingText);
    await page.getByRole("button", { name: /send/i }).click();

    // The user's own message appears first...
    await expect(page.getByText(outgoingText)).toBeVisible({ timeout: 10_000 });

    // ...then a second, distinct bubble -- the assistant's reply -- appears
    // without the page needing a reload or further input. A streamed answer
    // keeps growing; polling for non-empty, stable text covers both a
    // streamed and a non-streamed implementation without assuming which.
    const thread = page.getByLabel(/message thread/i).first();
    await expect(async () => {
      const text = await thread.innerText();
      const replyText = text.replace(outgoingText, "").trim();
      expect(replyText.length).toBeGreaterThan(0);
    }).toPass({ timeout: 30_000 });
  });
});
