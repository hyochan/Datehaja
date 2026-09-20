import { expect, test, type Locator, type Page } from "@playwright/test";
import { horizontalClipping } from "./helpers/clipping";

// Opt-in because this creates a disposable development auth account. It never
// submits a profile, starts a search, sends email, or makes model requests.
test.skip(
  process.env.DATEHAJA_ONBOARDING_LAYOUT_E2E !== "1" || Boolean(process.env.E2E_BASE_URL),
  "Run against local Vite and the development backend with DATEHAJA_ONBOARDING_LAYOUT_E2E=1.",
);
test.use({ reducedMotion: "reduce", actionTimeout: 20_000 });

async function checkLayout(page: Page, action: Locator) {
  for (const width of [320, 375, 390, 1024]) {
    await page.setViewportSize({ width, height: 812 });
    await action.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(horizontalClipping), `clipping at ${width}px`).toEqual([]);
    const textFitsVertically = await action.evaluate((button) => {
      const bounds = button.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(button);
      return Array.from(range.getClientRects()).every(
        (rect) => rect.top >= bounds.top - 1 && rect.bottom <= bounds.bottom + 1,
      );
    });
    expect(textFitsVertically, `button text height at ${width}px`).toBe(true);

    const spacing = await page.locator(".dh-field-group").evaluateAll((groups) =>
      groups.map((group) => {
        const fields = Array.from(group.children).filter((el) => el.classList.contains("dh-field"));
        const first = fields[0]?.getBoundingClientRect();
        const second = fields[1]?.getBoundingClientRect();
        const next = group.nextElementSibling;
        const last = fields.at(-1)?.getBoundingClientRect();
        return {
          // Stacked fields keep a 20px gap; desktop columns align at the top.
          sibling: first && second
            ? (Math.abs(first.left - second.left) < 1 ? second.top - first.bottom : second.top - first.top)
            : null,
          exit: next?.classList.contains("dh-field") && last
            ? next.getBoundingClientRect().top - last.bottom : null,
        };
      }),
    );
    for (const gap of spacing) {
      if (gap.sibling !== null) expect(gap.sibling).toBeCloseTo(width < 640 ? 20 : 0, 0);
      if (gap.exit !== null) expect(gap.exit).toBeCloseTo(20, 0);
    }
  }
}

test("authenticated onboarding keeps fields and all step actions readable", async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => localStorage.setItem("datehaja-locale", "en-US"));
  await page.goto("/signup");
  await page.getByLabel("Email").fill(`hyo+test-layout-${Date.now()}@hyo.dev`);
  await page.getByRole("button", { name: /Use development code/i }).click();
  await expect(page.getByLabel("Verification code")).toHaveValue("68686868");
  await page.getByRole("button", { name: /Verify and continue/i }).click();
  await expect(page).toHaveURL(/\/(legal\/accept|onboarding)/, { timeout: 20_000 });
  if (page.url().includes("/legal/accept")) {
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Agree and continue" }).click();
  }
  await expect(page).toHaveURL(/\/onboarding/);
  const firstAction = page.getByRole("button", { name: /Tell .* who to find/i });
  await checkLayout(page, firstAction);
  await page.getByLabel("Name your Dating Agent").fill("Juno");
  await firstAction.click();
  const secondAction = page.getByRole("button", { name: /Now tell it about me/i });
  await checkLayout(page, secondAction);
  await page.getByRole("button", { name: "Woman", exact: true }).click();
  await page.getByLabel("What kind of person should it come home excited about?").fill(
    "Someone curious who enjoys quiet conversations and their own life.",
  );
  await secondAction.click();
  await checkLayout(page, page.getByRole("button", { name: /Seal the brief/i }));
});
