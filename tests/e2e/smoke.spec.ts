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
    page.getByRole("heading", { name: /My second self dates for me/i }),
  ).toBeVisible();
  const heroReplay = page.locator(".agent-loop-player").first();
  await expect(heroReplay).toBeVisible();
  await heroReplay.getByRole("button", { name: /03 Private read/i }).click();
  await expect(heroReplay.locator(".agent-loop-report")).toBeVisible();
  await heroReplay.getByRole("button", { name: /04 Your call/i }).click();
  await expect(heroReplay.locator(".agent-loop-choice")).toBeVisible();
  await expect(page.locator(".agent-sample-score")).toHaveText(/6.*moments/i);
  await expect(page.getByText("Their answer remains sealed", { exact: true })).toBeVisible();
  await expect(page.locator(".agent-product-peek")).toHaveCount(3);
  await expect(page.locator(".agent-capture-section")).not.toContainText(
    "내 에이전트",
  );
  await expect(page.getByLabel("What your Dating Agent handles")).toBeVisible();
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

test("the public replay explains its actual outcome and separates fictional perspectives", async ({ page }) => {
  await page.goto("/watch");
  await expect(page.getByRole("heading", { name: "Finding someone starts with knowing when to keep looking." })).toBeVisible();
  await expect(page.locator(".watch-discovery")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Recorded AI encounter · fictional people", { exact: true })).toBeVisible();
  const perspectives = page.getByRole("group", { name: "Choose a fictional Agent's perspective" }).getByRole("button");
  const before = await page.locator(".watch-letter-signature").innerText();
  await perspectives.nth(1).click();
  await expect(perspectives.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".watch-letter-signature")).not.toHaveText(before);
  await expect(page.locator(".watch-field-note")).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
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

test("the explanation and both fictional previews are reachable signed out", async ({
  page,
}) => {
  await page.goto("/how-it-works");
  await expect(
    page.getByRole("heading", { name: /Create your Dating Agent/i }),
  ).toBeVisible();
  await expect(
    page.getByText(/Create my dating Agent/i).first(),
  ).toBeVisible();

  // Both previews render curated Korean records, and neither may leave that
  // choice behind for a visitor who arrived in their own language.
  for (const path of ["/preview/date-letter", "/preview/agent-coaching"]) {
    await page.goto(path);
    await expect(page.locator(".date-record-transcript")).toBeVisible();
    expect(
      await page.evaluate(() => localStorage.getItem("datehaja-locale")),
    ).toBe("en-US");
  }

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /My second self dates for me/i }),
  ).toBeVisible();
});

test("nothing on the landing page is cut off on a phone", async ({ page }) => {
  // A decorative element bleeding past the edge is fine, and so is a card in a
  // horizontally scrollable strip — the landing page has both on purpose. What
  // is not fine is text or a control that loses width to an overflow-hidden
  // ancestor, because nothing can scroll to reveal it. That is how the
  // onboarding step-1 button was losing its last 12px at this width.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /My second self dates for me/i }),
  ).toBeVisible();

  const cutOff = await page.evaluate(() => {
    const reachable = (el: Element) => {
      let parent = el.parentElement;
      while (parent && parent !== document.body) {
        const style = getComputedStyle(parent);
        const scrolls =
          style.overflowX === "auto" || style.overflowX === "scroll";
        if (scrolls && parent.scrollWidth > parent.clientWidth + 2) return true;
        parent = parent.parentElement;
      }
      return false;
    };
    const lost: string[] = [];
    document
      .querySelectorAll("h1,h2,h3,h4,p,li,button,a[href],label,input,select")
      .forEach((el) => {
        const box = el.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) return;
        const visible =
          Math.max(0, Math.min(box.right, window.innerWidth) - Math.max(box.left, 0));
        if (box.width - visible > 8 && !reachable(el)) {
          lost.push(
            `${el.tagName} "${(el.textContent ?? "").trim().slice(0, 40)}" loses ${Math.round(box.width - visible)}px`,
          );
        }
      });
    return lost;
  });

  // The sibling test above asserts the document does not scroll sideways, which
  // is exactly why it could not see this: an overflow-hidden ancestor keeps the
  // page from scrolling while the content inside it is cut.
  expect(cutOff).toEqual([]);
});
