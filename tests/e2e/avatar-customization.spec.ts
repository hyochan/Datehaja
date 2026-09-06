import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("datehaja-locale", "en-US");
    localStorage.setItem("datehaja-theme", "light");
  });
  await page.goto("/lab/avatar");
  await expect(page.getByRole("heading", { name: "A little more you." })).toBeVisible();
});

async function layerPaths(page: Page, layer: string) {
  return page.locator(".avatar-lab-portrait > .agent-avatar svg")
    .locator(`[data-character-layer="${layer}"] path`)
    .evaluateAll((paths) => paths.map((path) => path.getAttribute("d")));
}

test("all customization parts change the portrait and the live world together", async ({ page }) => {
  const editor = page.locator(".avatar-lab-editor");
  const portraits = [
    page.locator(".avatar-lab-portrait > .agent-avatar svg"),
    page.locator(".avatar-lab-figure > svg"),
    page.locator(".avatar-lab-in-world .agent-world-sprite-art"),
  ];
  const femaleHead = await layerPaths(page, "head");
  await editor.getByRole("button", { name: "Man", exact: true }).click();
  expect(await layerPaths(page, "head")).not.toEqual(femaleHead);

  for (const gender of ["Woman", "Man"]) {
    await editor.getByRole("button", { name: gender, exact: true }).click();
    for (const svg of portraits) {
      await expect(svg).toHaveAttribute("data-character-gender", gender === "Woman" ? "female" : "male");
    }
    for (const [key, layer, options] of [
      ["hair", "front-hair", ["Crop", "Bob", "Bun", "Buzz", "Wave"]],
      ["outfit", "outfit", ["Blazer", "Hoodie", "Starlight", "Cardigan"]],
      ["accessory", "accessory", ["Glasses", "Headphones", "Scarf", "None", "Star clip"]],
      ["face", "head", ["Bright", "Cool", "Curious", "Gentle"]],
    ] as const) {
      let previous = await layerPaths(page, layer);
      for (const option of options) {
        await editor.getByRole("button", { name: option, exact: true }).click();
        const next = await layerPaths(page, layer);
        expect(next, `${gender}: ${key} ${option} must change the art`).not.toEqual(previous);
        previous = next;
        for (const svg of portraits) {
          await expect(svg).toHaveAttribute(`data-character-${key}`, option === "Star clip" ? "star" : option.toLowerCase());
          const paths = await svg.locator(`[data-character-layer="${layer}"] path`)
            .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("d")));
          expect(paths, `${key} must use the same parts in every view`).toEqual(next);
        }
      }
    }
  }
  await expect(page.locator(".avatar-lab-in-world .agent-world-sprite-art-frame img")).toHaveCount(0);
});

test("every palette reaches the portrait and figure without recoloring skin", async ({ page }) => {
  for (const palette of ["rose", "violet", "moss", "sky", "sunset", "ink"]) {
    await page.locator(".avatar-lab-editor").getByRole("button", { name: `${palette} palette`, exact: true }).click();
    await expect(page.locator(".avatar-lab-editor").getByRole("button", { name: `${palette} palette`, exact: true })).toHaveAttribute("aria-pressed", "true");
    const stops = await page.locator(".avatar-lab-preview svg").evaluateAll((svgs) => svgs.map((svg) => ({
      coat: svg.querySelector('linearGradient[id$="-coat"] stop[offset=".28"]')?.getAttribute("stop-color"),
      skin: svg.querySelector('radialGradient[id$="-skin"] stop')?.getAttribute("stop-color"),
    })));
    expect(stops[0]).toEqual(stops[stops.length - 1]);
    expect(stops.every((stop) => stop.skin === "#fff1e3")).toBe(true);
  }
});

test("mobile controls fit and reduced motion stops portrait and world blinks", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".avatar-lab-editor")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  const animations = await page.locator(".agent-avatar-eyes").evaluateAll((eyes) => eyes.map((eye) => getComputedStyle(eye).animationName));
  expect(animations.length).toBeGreaterThan(0);
  expect(animations.every((animation) => animation === "none")).toBe(true);

  await page.locator(".avatar-lab-editor").getByRole("button", { name: "Headphones", exact: true }).click();
  await expect(page.locator(".avatar-lab-in-world svg[data-character-accessory='headphones']")).toHaveCount(1);
});

test("preview dialogue leaves both characters' faces visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["/", "/signup"]) {
      await page.goto(route);
      const player = page.locator(".agent-loop-player").first();
      await player.locator(".agent-loop-scenes button").nth(1).click();
      const bubbles = await player.locator(".agent-loop-date-chat p").all();
      for (const side of ["a", "b"]) {
        const head = await player.locator(`[data-side="${side}"] [data-character-layer="head"]`).boundingBox();
        expect(head).not.toBeNull();
        for (const bubble of bubbles) {
          const box = await bubble.boundingBox();
          if (head && box && box.x < head.x + head.width && box.x + box.width > head.x) {
            expect(box.y + box.height, `${route} at ${width}px: dialogue overlaps ${side}'s face`).toBeLessThan(head.y);
          }
        }
      }
    }
  }
});

test("the Settings editor preview stays inside narrow cards on wide screens", async ({ page }) => {
  await page.locator(".avatar-lab-settings summary").click();
  for (const viewport of [1024, 390]) {
    await page.setViewportSize({ width: viewport, height: 1000 });
    for (const width of [300, 580, 710]) {
      const editor = page.locator(".avatar-lab-settings-editor");
      await editor.evaluate((element, width) => { (element as HTMLElement).style.width = `${width}px`; }, width);
      const preview = await editor.locator(".avatar-editor-preview").boundingBox();
      expect(preview).not.toBeNull();
      for (const child of await editor.locator(".avatar-editor-character-preview > *").all()) {
        const box = await child.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(preview!.x);
        expect(box!.x + box!.width).toBeLessThanOrEqual(preview!.x + preview!.width);
      }
      await editor.getByRole("button", { name: "Bob", exact: true }).click();
      await expect(editor.locator("svg[data-character-hair='bob']")).toHaveCount(2);
    }
  }
});

test("iris, pupil and highlights are clipped to the selected eyelid", async ({ page }) => {
  await page.getByRole("button", { name: "Try Leo's look", exact: true }).click();
  const result = await page.locator(".avatar-lab-portrait > .agent-avatar svg").evaluate((svg) => {
    const eyes = svg.querySelectorAll('.agent-avatar-eyes > g');
    return Array.from(eyes, (eye) => {
      const iris = eye.querySelector("ellipse");
      const reference = iris?.parentElement?.getAttribute("clip-path")?.match(/^url\(#(.+)\)$/)?.[1];
      const path = reference ? document.getElementById(reference)?.querySelector("path")?.getAttribute("d") : undefined;
      const white = eye.querySelector('path[fill="#fff9ef"]')?.getAttribute("d");
      return { clipped: Boolean(path) && path === white, irisCount: iris?.parentElement?.querySelectorAll("ellipse, circle").length };
    });
  });
  expect(result).toEqual([{ clipped: true, irisCount: 3 }, { clipped: true, irisCount: 3 }]);
});
