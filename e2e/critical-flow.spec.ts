import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const ANALYTICS_CONSENT_KEY = "np_analytics_consent";
const HYDRATION_PATTERNS = [
  /hydration/i,
  /did not match/i,
  /server rendered html/i,
  /text content does not match/i,
  /hydrating/i,
];

function installRuntimeFailureGuards(page: Page) {
  const runtimeIssues: string[] = [];

  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error") {
      runtimeIssues.push(`console.error: ${text}`);
      return;
    }

    if (HYDRATION_PATTERNS.some((pattern) => pattern.test(text))) {
      runtimeIssues.push(`console.${msg.type()} hydration-mismatch: ${text}`);
    }
  });

  page.on("pageerror", (error) => {
    runtimeIssues.push(`pageerror: ${error.message}`);
  });

  return async () => {
    expect(runtimeIssues, `Unexpected runtime/hydration issues:\n${runtimeIssues.join("\n")}`).toEqual([]);
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

  await expect(page).toHaveURL(/\/app(\/list)?$/);

  if (!/\/app\/list$/.test(page.url())) {
    await page.locator('a[href="/app/list"]').first().click();
    await expect(page).toHaveURL(/\/app\/list$/);
  }
}

async function assertShoppingListAggregated(page: Page): Promise<void> {
  const categories = page.locator(".category-card");
  const items = page.locator("li.item");
  await expect(categories.first()).toBeVisible();
  expect(await categories.count()).toBeGreaterThan(0);
  expect(await items.count()).toBeGreaterThan(0);
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
  await context.route("**/api/auth/csrf**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ csrfToken: "e2e-csrf-token" }),
    });
  });

  await context.route("**/api/auth/session**", async (route) => {
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

async function mockSignOut(context: BrowserContext, onSignOut: () => void): Promise<void> {
  await context.route("**/api/auth/signout**", async (route) => {
    onSignOut();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ url: "/" }),
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
  const assertNoRuntimeFailures = installRuntimeFailureGuards(page);
  try {
    await mockSession(page.context(), () => false);

    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();

    await completeOnboarding(page);

    await closeWeeklyCheckInIfVisible(page);

    await assertShoppingListAggregated(page);
    await expect(page.locator(".metrics-bar")).toBeVisible();
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

    await expect(page).toHaveURL(/\/app\/(prep|prep-guide)$/);
    await expect(page.locator(".prep-guide-page")).toBeVisible();
    await expect(page.locator(".cooking-tasks-section")).toBeVisible();
    await expect(page.locator(".tasks-list")).toBeVisible();
    await expect(page.locator(".prep-upgrade-callout")).toBeVisible();

    await page.locator(".prep-upgrade-callout .btn-secondary").click();
    await expect(page).toHaveURL(/\/pricing$/);
  } finally {
    await assertNoRuntimeFailures();
  }
});

test("login, logout and mocked session persistence", async ({ context, page }) => {
  const assertNoRuntimeFailures = installRuntimeFailureGuards(page);
  try {
    let authenticated = false;

    await mockSession(context, () => authenticated);
    await mockSignOut(context, () => {
      authenticated = false;
    });

    await page.goto("/auth/login?callbackUrl=/app");
    await expect(page.locator("#email")).toBeVisible();

    await page.goto("/app");
    const authButton = page.locator(".np-actions > button.np-btn.np-btn-secondary").last();
    await expect(authButton).toBeVisible();

    authenticated = true;

    await page.reload();
    const logoutButton = page.locator(".np-actions > button.np-btn.np-btn-secondary").last();
    await expect(logoutButton).toBeVisible();

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

    await logoutButton.click();
    await expect(page).toHaveURL(/\/$/);

    const sessionAfterLogout = await page.evaluate(async () => {
      const response = await fetch("/api/auth/session");
      return response.json();
    });
    expect(sessionAfterLogout?.user).toBeUndefined();

    await page.goto("/app");
    const loginButtonAfterLogout = page.locator(".np-actions > button.np-btn.np-btn-secondary").last();
    await expect(loginButtonAfterLogout).toBeVisible();
  } finally {
    await assertNoRuntimeFailures();
  }
});
