import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const ANALYTICS_CONSENT_KEY = "np_analytics_consent";

function installConsoleErrorGuard(page: Page) {
  const consoleErrors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  return async () => {
    expect(consoleErrors, `Unexpected console errors:\n${consoleErrors.join("\n")}`).toEqual([]);
  };
}

async function closeWeeklyCheckInIfVisible(page: Page): Promise<void> {
  const modal = page.locator(".modal-overlay");
  if (await modal.isVisible()) {
    await modal.locator(".modal-footer .btn-secondary").click();
    await expect(modal).toBeHidden();
  }
}

async function completeOnboarding(page: Page): Promise<void> {
  await page.goto("/");
  await page.locator('a[href="/app"]').first().click();
  await expect(page).toHaveURL(/\/app$/);

  await page.locator(".wizard-actions .wizard-btn.primary").click();

  await page.fill("#wizard-age", "31");
  await page.fill("#wizard-weight", "72");
  await page.fill("#wizard-height", "176");
  await page.locator(".wizard-actions .wizard-btn.primary").click();

  await page.selectOption("#wizard-meals", "4");
  await page.fill("#wizard-restrictions", "peanut");
  await page.locator(".wizard-actions .wizard-btn.primary").click();

  await page.locator(".wizard-actions .wizard-btn.primary").click();

  await expect(page).toHaveURL(/\/app\/list$/);
}

async function markAtLeastPercent(page: Page, percent: number): Promise<{ total: number; target: number; purchased: number }> {
  const items = page.locator("li.item");
  const total = await items.count();
  expect(total).toBeGreaterThan(0);

  const target = Math.max(1, Math.ceil(total * (percent / 100)));
  const maxAttempts = total * 4;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const purchased = await page.locator("li.item.purchased").count();
    if (purchased >= target) {
      break;
    }

    const firstUnpurchased = page.locator("li.item:not(.purchased)").first();
    if (!(await firstUnpurchased.isVisible())) {
      break;
    }

    await firstUnpurchased.click();
    attempts += 1;
  }

  const purchased = await page.locator("li.item.purchased").count();
  return { total, target, purchased };
}

async function markUntilPrepUnlock(page: Page): Promise<void> {
  const prepLockedButton = page.locator("button.btn-prep-guide[disabled]");
  const prepUnlockedLink = page.locator('a.btn-prep-guide[href="/app/prep"]');

  if (await prepUnlockedLink.isVisible()) {
    return;
  }

  const items = page.locator("li.item");
  const total = await items.count();

  for (let index = 0; index < total; index += 1) {
    if (await prepUnlockedLink.isVisible()) {
      return;
    }

    const item = items.nth(index);
    if (!(await item.getAttribute("class"))?.includes("purchased")) {
      await item.click();
    }
  }

  await expect(prepLockedButton).toBeHidden();
  await expect(prepUnlockedLink).toBeVisible();
}

async function mockSession(context: BrowserContext, isAuthenticated: () => boolean): Promise<void> {
  await context.route("**/api/auth/session", async (route) => {
    if (!isAuthenticated()) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "{}",
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          name: "QA User",
          email: "qa@example.com",
          id: "qa-user-1",
          role: "FREE",
          subscriptionStatus: "inactive",
          stripeCustomerId: null,
        },
        expires: "2099-01-01T00:00:00.000Z",
      }),
    });
  });
}

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
  await context.addInitScript(([consentKey]) => {
    window.localStorage.clear();
    window.localStorage.setItem(consentKey, "denied");
  }, [ANALYTICS_CONSENT_KEY]);
});

test("critical flow: onboarding to prep unlock with premium gating", async ({ page }) => {
  const assertNoConsoleErrors = installConsoleErrorGuard(page);
  try {
    await completeOnboarding(page);

    await closeWeeklyCheckInIfVisible(page);

    await expect(page.locator(".category-card").first()).toBeVisible();
    await expect(page.locator(".premium-upgrade-strip")).toBeVisible();

    const { target, purchased } = await markAtLeastPercent(page, 60);
    expect(purchased).toBeGreaterThanOrEqual(target);

    const prepLockedButton = page.locator("button.btn-prep-guide[disabled]");
    const prepUnlockedLink = page.locator('a.btn-prep-guide[href="/app/prep"]');

    if (await prepLockedButton.isVisible()) {
      await expect(prepLockedButton).toHaveAttribute("disabled", "");
    }

    await markUntilPrepUnlock(page);
    await prepUnlockedLink.click();

    await expect(page).toHaveURL(/\/app\/prep$/);
    await expect(page.locator(".cooking-tasks-section")).toBeVisible();
    await expect(page.locator(".prep-upgrade-callout")).toBeVisible();
  } finally {
    await assertNoConsoleErrors();
  }
});

test("login route and mocked session persistence", async ({ context, page }) => {
  const assertNoConsoleErrors = installConsoleErrorGuard(page);
  try {
    let authenticated = false;
    await mockSession(context, () => authenticated);

    await page.goto("/auth/login?callbackUrl=/app");
    await expect(page.locator("#email")).toBeVisible();

    await page.goto("/app");
    const authButton = page.locator(".np-actions > button.np-btn.np-btn-secondary").first();
    await expect(authButton).toBeVisible();
    authenticated = true;

    await page.reload();
    const authButtonAfterMock = page.locator(".np-actions > button.np-btn.np-btn-secondary").first();
    await expect(authButtonAfterMock).toBeVisible();
    const sessionAfterMock = await page.evaluate(async () => {
      const response = await fetch("/api/auth/session");
      return response.json();
    });
    expect(sessionAfterMock?.user?.email).toBe("qa@example.com");

    await page.reload();
    const sessionAfterReload = await page.evaluate(async () => {
      const response = await fetch("/api/auth/session");
      return response.json();
    });
    expect(sessionAfterReload?.user?.email).toBe("qa@example.com");
  } finally {
    await assertNoConsoleErrors();
  }
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("critical flow works on mobile viewport", async ({ page }) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page);
    try {
      await completeOnboarding(page);
      await closeWeeklyCheckInIfVisible(page);

      await expect(page.locator(".shopping-main")).toBeVisible();
      await expect(page.locator(".shopping-actions")).toBeVisible();

      await markAtLeastPercent(page, 60);
      await expect(page.locator(".metrics-bar")).toBeVisible();
    } finally {
      await assertNoConsoleErrors();
    }
  });
});
