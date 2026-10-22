import { expect, test } from "@playwright/test";

/**
 * US-020: "Sign out" moves from a standalone sidebar button into the left
 * nav, nested under "Chat", and still ends the session the same way.
 *
 * These specs exercise the real stack the Playwright config boots (uvicorn +
 * the built frontend), not a mocked network.
 */

const PASSWORD = "correct-horse-battery-staple";

function uniqueEmail(prefix: string): string {
  return `e2e-${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

async function signUp(page: import("@playwright/test").Page, email: string) {
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

  const continueButton = page.getByRole("button", { name: /open your first chat/i });
  if (await continueButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await continueButton.click();
  }
  await expect(page).toHaveURL(/\/chat/, { timeout: 15_000 });
}

test.describe("desktop: Sign out lives under Chat in the left nav (AC-068, AC-069)", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("a signed-in user opens the left nav, signs out under Chat, and a reload does not restore the chat screen", async ({
    page,
  }) => {
    const email = uniqueEmail("desktop-signout");
    await signUp(page, email);

    const nav = page.getByRole("navigation", { name: /main/i });
    await expect(nav).toBeVisible();

    const chatLink = nav.getByRole("link", { name: "Chat" });
    await expect(chatLink).toBeVisible();

    // "Chat" is a group; "Sign out" is nested inside it, not a standalone
    // button floating outside the nav.
    const signOutInNav = nav.getByRole("button", { name: "Sign out" });
    await expect(signOutInNav).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign out" })).toHaveCount(1);

    await signOutInNav.click();
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 10_000 });

    // AC-069: the signed-out state survives a reload -- the chat screen is
    // not restored from any cached state.
    await page.reload();
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 10_000 });
    await expect(page.getByRole("heading", { name: /welcome back|sign in/i })).toBeVisible({
      timeout: 10_000,
    });

    // A direct attempt to return to /chat after reload is also rejected.
    await page.goto("/chat");
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 10_000 });
  });
});

test.describe("mobile: the collapsed nav opens, Chat expands, and Sign out completes sign-out (AC-070)", () => {
  test.use({ viewport: { width: 375, height: 700 } });

  test("a signed-in user opens the collapsed menu, expands Chat, and signs out", async ({
    page,
  }) => {
    const email = uniqueEmail("mobile-signout");
    await signUp(page, email);

    const nav = page.locator("#shell-nav");

    // The nav starts collapsed on a narrow viewport.
    await expect(nav).toBeHidden();

    const menuToggle = page.getByRole("button", { name: /toggle navigation menu/i });
    await expect(menuToggle).toBeVisible();
    await expect(menuToggle).toHaveAttribute("aria-expanded", "false");

    await menuToggle.click();
    await expect(menuToggle).toHaveAttribute("aria-expanded", "true");
    await expect(nav).toBeVisible();

    const chatLink = nav.getByRole("link", { name: "Chat" });
    await expect(chatLink).toBeVisible();

    // The Chat group may already be expanded by default; if it is collapsed,
    // expand it before Sign out can be reached.
    let signOutButton = nav.getByRole("button", { name: "Sign out" });
    if (!(await signOutButton.isVisible({ timeout: 2_000 }).catch(() => false))) {
      const expandChat = nav.getByRole("button", { name: /expand chat menu/i });
      await expect(expandChat).toBeVisible();
      await expandChat.click();
      signOutButton = nav.getByRole("button", { name: "Sign out" });
    }

    await expect(signOutButton).toBeVisible();
    await signOutButton.click();

    await expect(page).toHaveURL(/\/sign-in/, { timeout: 10_000 });

    await page.reload();
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 10_000 });
    await page.goto("/chat");
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 10_000 });
  });
});
