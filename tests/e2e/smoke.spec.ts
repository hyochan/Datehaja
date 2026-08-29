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
    page.getByRole("heading", { name: /What do you want to do\?/i }),
  ).toBeVisible();

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

test("sign-up explains privacy and requires adult consent", async ({
  page,
}) => {
  await page.goto("/signup");

  await expect(
    page.getByText(
      /Signing in lets us show the right plan to the right person/i,
    ),
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

  await page
    .getByLabel("Email")
    .fill(`missing-consent-${Date.now()}@example.test`);
  await page.getByLabel("Password").fill("Testing!1234");
  await page.getByRole("button", { name: /Create my account/i }).click();

  await expect(page.getByText(/for adults only/i)).toBeVisible();
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
