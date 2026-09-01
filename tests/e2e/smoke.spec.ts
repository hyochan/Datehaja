import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("datehaja-locale", "en-US");
  });
});

test("landing and public legal records are reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Datehaja/i);
  await expect(
    page.getByRole("heading", { name: /Let your Agent.*go first/i }),
  ).toBeVisible();
  const heroReplay = page.locator(".agent-loop-player").first();
  await expect(heroReplay).toBeVisible();
  await heroReplay.getByRole("button", { name: /03 Private read/i }).click();
  await expect(heroReplay.locator(".agent-loop-report")).toBeVisible();
  await heroReplay.getByRole("button", { name: /04 Your call/i }).click();
  await expect(heroReplay.locator(".agent-loop-choice")).toBeVisible();
  await expect(page.locator(".agent-sample-score")).toHaveText(/6.*moments/i);
  await expect(page.getByLabel("Agent insight map")).toBeVisible();
  await expect(page.locator(".agent-insight-moment")).toHaveCount(6);
  await expect(page.locator(".agent-product-peek")).toHaveCount(3);
  await expect(page.locator(".agent-capture-section")).not.toContainText(
    "내 에이전트",
  );
  await expect(page.getByLabel("What your Agent handles")).toBeVisible();
  await expect(page.locator(".agent-service-moment")).toHaveCount(4);
  const landingOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(landingOverflow).toBeLessThanOrEqual(1);

  for (const [path, heading] of [
    ["/terms", "Terms of Service"],
    ["/privacy", "Privacy"],
    ["/community-guidelines", "Community Guidelines"],
    ["/safety", "Safety Center"],
  ] as const) {
    await page.goto(path);
    await expect(
      page.getByRole("heading", { name: heading, level: 1 }),
    ).toBeVisible();
  }
});

test("sign-up explains privacy and uses passwordless email", async ({
  page,
}) => {
  await page.goto("/signup");

  await expect(page.locator(".auth-agent-preview")).toBeVisible();

  await expect(
    page.getByText(/Signing in protects your private agent brief/i),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Terms of Service" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Community Guidelines" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Privacy Notice" }),
  ).toBeVisible();

  await expect(page.getByLabel("Password")).toHaveCount(0);
  await expect(page.getByText(/No password to remember/i)).toBeVisible();
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByRole("button", { name: /Email me a sign-in code/i }).click();
  await expect(page.getByText(/valid email address/i)).toBeVisible();
});

test("mobile landing and sign-up stay within the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const path of ["/", "/signup"]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  }
});
