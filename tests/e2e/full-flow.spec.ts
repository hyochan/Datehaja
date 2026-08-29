import { expect, test } from "@playwright/test";

test.skip(
  process.env.DATEHAJA_FULL_E2E !== "1",
  "Set DATEHAJA_FULL_E2E=1 to create a real disposable account and run matching.",
);

test.use({ timezoneId: "America/New_York" });

test("account to confirmed and cancelled activity date", async ({ page }) => {
  test.setTimeout(150_000);
  await page.addInitScript(() => {
    window.localStorage.setItem("datehaja-locale", "en-US");
  });

  const suffix = Date.now();
  await page.goto("/signup");
  await page
    .getByLabel("Email")
    .fill(`datehaja-playwright-${suffix}@example.test`);
  await page.getByLabel("Password").fill(`Qa!${suffix}Date`);
  await page.getByRole("checkbox", { name: /I'm 18 or over/i }).check();
  await page
    .getByRole("checkbox", { name: /I agree to the Terms of Service/i })
    .check();
  await page.getByRole("button", { name: /Create my account/i }).click();

  await expect(page).toHaveURL(/\/(legal\/accept|onboarding)/, {
    timeout: 15_000,
  });
  // The version write and the reactive route guard can settle in either order.
  // Give them one beat before deciding whether the fallback agreement is needed.
  await page.waitForTimeout(1_200);
  if (page.url().includes("/legal/accept")) {
    const legalCheckboxes = page.getByRole("checkbox");
    await expect(legalCheckboxes).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      await legalCheckboxes.nth(index).check();
    }
    const continueButton = page.getByRole("button", {
      name: "Agree and continue",
    });
    await expect(continueButton).toBeEnabled();
    await continueButton.click();
  }

  await expect(page).toHaveURL(/\/onboarding/);
  await page.getByLabel("What should we call you?").fill("Juno");
  await page.getByPlaceholder("YYYY-MM-DD").fill("1993-06-15");
  await page
    .getByRole("group", { name: "Your gender" })
    .getByRole("button", { name: "Man", exact: true })
    .click();
  await page
    .getByRole("group", { name: "Who you'd like to meet" })
    .getByRole("button", { name: "Woman", exact: true })
    .click();
  await page
    .getByRole("checkbox", {
      name: "This is the city where I want to meet people and go on dates.",
    })
    .check();
  await page
    .getByRole("checkbox", { name: /Datehaja is an adults-only service/i })
    .check();
  await page.getByRole("button", { name: "Continue" }).click();

  await page
    .getByLabel("A line or two about you")
    .fill("Film lover who enjoys calm conversation and small cinemas.");
  for (const interest of ["Films", "Coffee", "Art galleries"]) {
    await page
      .getByRole("group", { name: "Your interests" })
      .getByRole("button", { name: interest, exact: true })
      .click();
  }
  await page
    .getByRole("switch", { name: "This profile reflects who I am today" })
    .click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: "Watch a film", exact: true }).click();
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Find someone to go with" }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/profile");
  await expect(
    page.getByRole("heading", { name: "Your profile" }),
  ).toBeVisible();
  await expect(page.getByLabel("Introduce yourself")).toHaveValue(
    "Film lover who enjoys calm conversation and small cinemas.",
  );
  await expect(
    page.getByRole("switch", { name: "This profile reflects who I am today" }),
  ).toBeChecked();

  await page.goto("/preferences");
  await expect(
    page.getByRole("heading", { name: "Matching preferences" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("radiogroup", { name: "Personality preference strength" })
      .getByRole("radio", { name: "No preference" }),
  ).toBeChecked();
  await expect(
    page
      .getByRole("radiogroup", { name: "Style preference strength" })
      .getByRole("radio", { name: "No preference" }),
  ).toBeChecked();
  await expect(
    page
      .getByRole("radiogroup", { name: "Meeting area preference" })
      .getByRole("radio", { name: "Choose areas" }),
  ).toBeChecked();
  await expect(
    page
      .getByRole("group", { name: "Preferred meeting areas" })
      .getByRole("button", { name: "West Village" }),
  ).toHaveAttribute("aria-pressed", "true");

  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Find someone to go with" }).click();

  const planLink = page
    .getByRole("link")
    .filter({ hasText: /New date plan|Your date plan is ready/i })
    .first();
  await expect(planLink).toBeVisible({ timeout: 90_000 });
  const planPath = await planLink.getAttribute("href");
  expect(planPath).toMatch(/^\/drop\//);
  await planLink.click();

  await page.getByRole("button", { name: "Accept this date" }).click();
  await page.goto("/demo");
  await page.getByRole("button", { name: "They accept" }).click();
  await expect(page.getByText(/accepted.*it's a date/i)).toBeVisible({
    timeout: 15_000,
  });
  await page.goto(planPath!);
  await expect(page.getByText("It's a date.", { exact: true })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText("Finalized", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Cancel this date" }).click();
  await page.getByRole("button", { name: "Cancel it" }).click();
  await expect(
    page.getByText("Cancelled", { exact: true }).first(),
  ).toBeVisible();
});
