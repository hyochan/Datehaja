import { expect, test } from "@playwright/test";

test("development test accounts use the fixed code without email", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("datehaja-locale", "en-US");
  });

  await page.goto("/signin");
  await page.getByLabel("Email").fill("hyo+test1@hyo.dev");

  await expect(
    page.getByText("Development account — no email will be sent."),
  ).toBeVisible();
  await page.getByRole("button", { name: /Use development code/i }).click();

  await expect(page.getByText("Development sign-in")).toBeVisible();
  await expect(page.getByText("Check your inbox")).toHaveCount(0);
  await expect(page.getByLabel("Verification code")).toHaveValue("68686868");

  await page.getByRole("button", { name: /Verify and continue/i }).click();
  await expect(page).not.toHaveURL(/\/signin/, { timeout: 20_000 });
});
