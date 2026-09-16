import { expect, test } from "@playwright/test";

test("a malformed dashboard date id shows a recovery surface, not a blank page", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("datehaja-locale", "en-US");
  });

  await page.goto("/signin");
  await page.getByLabel("Email").fill("hyo+test1@hyo.dev");
  await page.getByRole("button", { name: /Use development code/i }).click();
  await page.getByRole("button", { name: /Verify and continue/i }).click();
  await expect(page).not.toHaveURL(/\/signin/, { timeout: 20_000 });

  await page.goto("/dashboard?date=aaaaaaaaaaaaaaaaaaaa");
  await expect(
    page.getByRole("heading", { name: "This story isn't here." }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.locator("#root")).not.toBeEmpty();
  await expect(
    page.getByRole("link", { name: "Back to my Dating Agent →" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Back to my Dating Agent →" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText("Your private Dating Agent")).toBeVisible();
});
