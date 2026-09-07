import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("datehaja-locale", "en-US");
    localStorage.setItem("datehaja-theme", "light");
  });
  await page.goto("/lab/avatar");
  await expect(page.getByRole("heading", { name: "A little more you." })).toBeVisible();
});

async function layerImages(page: Page, layer: string) {
  return page.locator(".avatar-lab-portrait > .agent-avatar svg")
    .locator(`[data-character-layer="${layer}"] image`)
    .evaluateAll((images) => images.filter((image) => !image.closest(".pixel-walking")).map((image) => image.getAttribute("href")));
}

test("all customization parts change the portrait and the live world together", async ({ page }) => {
  const editor = page.locator(".avatar-lab-editor");
  const portraits = [
    page.locator(".avatar-lab-portrait > .agent-avatar svg"),
    page.locator(".avatar-lab-figure > svg"),
    page.locator(".avatar-lab-in-world .agent-world-sprite-art"),
  ];
  const femaleHead = await layerImages(page, "head");
  await editor.getByRole("button", { name: "Man", exact: true }).click();
  expect(await layerImages(page, "head")).not.toEqual(femaleHead);

  for (const gender of ["Woman", "Man"]) {
    await editor.getByRole("button", { name: gender, exact: true }).click();
    for (const svg of portraits) {
      await expect(svg).toHaveAttribute("data-character-gender", gender === "Woman" ? "female" : "male");
    }
    for (const [key, layer, options] of [
      ["hair", "head", ["Crop", "Bob", "Bun", "Buzz", "Wave"]],
      ["outfit", "outfit", ["Blazer", "Hoodie", "Starlight", "Cardigan"]],
      ["accessory", "accessory", ["Glasses", "Headphones", "Scarf", "None", "Star clip"]],
      ["face", "head", ["Bright", "Cool", "Curious", "Gentle"]],
    ] as const) {
      let previous = await layerImages(page, layer);
      for (const option of options) {
        await editor.getByRole("button", { name: option, exact: true }).click();
        const next = await layerImages(page, layer);
        expect(next, `${gender}: ${key} ${option} must change the art`).not.toEqual(previous);
        previous = next;
        await portraits[0].locator("image").evaluateAll(async (nodes) => {
          await Promise.all(nodes.map((node) => {
            const image = new Image(); image.src = node.getAttribute("href")!;
            return image.decode();
          }));
        });
        for (const svg of portraits) {
          await expect(svg).toHaveAttribute(`data-character-${key}`, option === "Star clip" ? "star" : option.toLowerCase());
          const paths = await svg.locator(`[data-character-layer="${layer}"] image`)
            .evaluateAll((nodes) => nodes.filter((image) => !image.closest(".pixel-walking")).map((node) => node.getAttribute("href")));
          expect(paths, `${key} must use the same parts in every view`).toEqual(next);
        }
      }
    }
  }
  await expect(page.locator(".avatar-lab-in-world .agent-world-sprite-art-frame img")).toHaveCount(0);
});

test("every palette recolors clothing while keeping the original face pixels", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const rendered = [];
  for (const palette of ["rose", "violet", "moss", "sky", "sunset", "ink"]) {
    const button = page.locator(".avatar-lab-editor").getByRole("button", { name: `${palette} palette`, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    const frames = await page.locator(".avatar-lab-preview svg").evaluateAll(async (svgs) => Promise.all(svgs.map(async (svg) => {
      const clone = svg.cloneNode(true) as SVGSVGElement;
      for (const node of clone.querySelectorAll("image")) {
        const blob = await (await fetch(node.getAttribute("href")!)).blob();
        const data = await new Promise<string>((resolve) => {
          const reader = new FileReader(); reader.onload = () => resolve(reader.result as string); reader.readAsDataURL(blob);
        });
        node.setAttribute("href", data);
      }
      clone.setAttribute("width", "320"); clone.setAttribute("height", "660");
      clone.setAttribute("viewBox", "0 0 320 660");
      const image = new Image();
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
      await image.decode();
      const canvas = document.createElement("canvas"); canvas.width = 320; canvas.height = 660;
      const context = canvas.getContext("2d")!; context.drawImage(image, 0, 0);
      return {
        face: Array.from(context.getImageData(140, 178, 35, 30).data),
        coat: Array.from(context.getImageData(148, 295, 25, 35).data),
      };
    })));
    expect(frames.length).toBeGreaterThan(1);
    expect(frames[0].face.some((value) => value > 0)).toBe(true);
    for (const frame of frames) {
      expect(frame.face).toEqual(frames[0].face);
      expect(frame.coat).toEqual(frames[0].coat);
    }
    rendered.push(frames[0]);
  }
  expect(new Set(rendered.map((frame) => JSON.stringify(frame.coat))).size).toBe(6);
  expect(new Set(rendered.map((frame) => JSON.stringify(frame.face))).size).toBe(1);
});

test("heads fit the shoulders and stay connected to every outfit", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const editor = page.locator(".avatar-lab-editor");
  await editor.getByRole("button", { name: "None", exact: true }).click();
  for (const gender of ["Woman", "Man"]) {
    await editor.getByRole("button", { name: gender, exact: true }).click();
    // Expression atlases can have different jaw contours. Cross every male
    // expression with every outfit, including Bright + Blazer.
    for (const face of gender === "Man" ? ["Gentle", "Bright", "Cool", "Curious"] : ["Gentle"]) {
      await editor.getByRole("button", { name: face, exact: true }).click();
      for (const hair of ["Wave", "Crop", "Bob", "Bun", "Buzz"]) {
        await editor.getByRole("button", { name: hair, exact: true }).click();
        for (const outfit of ["Cardigan", "Blazer", "Hoodie", "Starlight"]) {
          await editor.getByRole("button", { name: outfit, exact: true }).click();
          const result = await page.locator(".avatar-lab-figure > svg").evaluate(async (svg) => {
            const visibleWidth = async (node: SVGImageElement) => {
              const image = new Image(); image.src = node.getAttribute("href")!; await image.decode();
              const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height;
              const context = canvas.getContext("2d")!; context.drawImage(image, 0, 0);
              const pixels = context.getImageData(0, 0, image.width, image.height).data;
              let left = image.width, right = 0;
              for (let i = 0; i < pixels.length; i += 4) if (pixels[i + 3]) {
                left = Math.min(left, i / 4 % image.width); right = Math.max(right, i / 4 % image.width);
              }
              const matrix = node.getCTM()!;
              return (right - left + 1) * Math.hypot(matrix.a, matrix.b);
            };
            const head = await visibleWidth(svg.querySelector('[data-character-layer="head"] > image')!);
            const body = await visibleWidth(svg.querySelector('.pixel-standing > image')!);
            const clone = svg.cloneNode(true) as SVGSVGElement;
            clone.setAttribute("viewBox", "0 0 320 660");
            clone.setAttribute("width", "320"); clone.setAttribute("height", "660");
            for (const node of clone.querySelectorAll("image")) {
              const blob = await (await fetch(node.getAttribute("href")!)).blob();
              const data = await new Promise<string>((resolve) => {
                const reader = new FileReader(); reader.onload = () => resolve(reader.result as string); reader.readAsDataURL(blob);
              });
              node.setAttribute("href", data);
            }
            const neckPixels = async (removedLayer: string) => {
              const layer = clone.cloneNode(true) as SVGSVGElement;
              layer.querySelectorAll(`[data-character-layer="${removedLayer}"]`).forEach((node) => node.remove());
              const image = new Image();
              image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(layer))}`;
              await image.decode();
              const canvas = document.createElement("canvas"); canvas.width = 320; canvas.height = 660;
              const context = canvas.getContext("2d")!; context.drawImage(image, 0, 0);
              return context.getImageData(151, 216, 18, 38).data;
            };
            // Require real overlap between the head and the body's neck. Sampling
            // just the assembled body would also pass when the head floats above it.
            const headPixels = await neckPixels("outfit"), bodyPixels = await neckPixels("head");
            let neckOverlap = 0;
            for (let i = 3; i < headPixels.length; i += 4) {
              if (headPixels[i] > 240 && bodyPixels[i] > 240) neckOverlap++;
            }
            return { ratio: head / body, neckOverlap };
          });
          const look = `${gender} / ${face} / ${hair} / ${outfit}`;
          expect(result.ratio, `${look}: head overwhelms the shoulders`).toBeLessThan(1.14);
          expect(result.neckOverlap, `${look}: head does not join the body's neck`).toBeGreaterThan(72);
        }
      }
    }
  }
});

test("mobile controls fit and reduced motion stops portrait and world blinks", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".avatar-lab-editor")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  const animations = await page.locator(".pixel-blink, .character-head, .pixel-standing, .pixel-leg").evaluateAll((eyes) => eyes.map((eye) => getComputedStyle(eye).animationName));
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
        // A bitmap's SVG box includes transparent packing gutters. Measure the
        // visible hair/face pixels so overlap checks use the actual character.
        const head = await player.locator(`[data-side="${side}"] [data-character-layer="head"] > image`).evaluate(async (node) => {
          const image = new Image(); image.src = node.getAttribute("href")!; await image.decode();
          const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height;
          const context = canvas.getContext("2d")!; context.drawImage(image, 0, 0);
          const pixels = context.getImageData(0, 0, image.width, image.height).data;
          let left = image.width, top = image.height, right = 0, bottom = 0;
          for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
            if (pixels[(y * image.width + x) * 4 + 3] > 0) {
              left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
            }
          }
          if (right <= left) throw new Error("The character head is empty");
          const matrix = (node as SVGGraphicsElement).getScreenCTM()!;
          const points = [[left, top], [right, top], [left, bottom], [right, bottom]].map(([x, y]) => new DOMPoint(x, y).matrixTransform(matrix));
          const x = Math.min(...points.map((point) => point.x)), y = Math.min(...points.map((point) => point.y));
          return { x, y, width: Math.max(...points.map((point) => point.x)) - x };
        });
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

test("blink uses the selected hairstyle and is limited to the eyes", async ({ page }) => {
  for (const name of ["Juno", "Leo"]) {
    await page.getByRole("button", { name: `Try ${name}'s look`, exact: true }).click();
    const result = await page.locator(".avatar-lab-portrait > .agent-avatar svg").evaluate((svg) => {
      const blink = svg.querySelector(".pixel-blink")!;
      const id = blink.getAttribute("clip-path")!.slice(5, -1);
      const clip = document.getElementById(id)!;
      return {
        image: blink.querySelector("image")!.getAttribute("href"),
        regions: clip.children.length,
        bounds: Array.from(clip.children, (region) => (region as SVGGraphicsElement).getBBox().height),
        animation: getComputedStyle(blink).animationName,
      };
    });
    expect(result.image).toContain(name === "Juno" ? "female-wave-blink.png" : "male-buzz-blink.png");
    expect(result.regions).toBe(2);
    expect(result.bounds.every((height) => height <= 30)).toBe(true);
    expect(result.animation).toBe("pixel-blink");
  }
});

test("large portraits respond to the pointer and settle on exit", async ({ page }) => {
  const portrait = page.locator(".avatar-lab-portrait > .agent-avatar");
  const bounds = await portrait.boundingBox();
  expect(bounds).not.toBeNull();
  await portrait.hover({ position: { x: bounds!.width - 8, y: bounds!.height / 2 } });
  const look = await portrait.evaluate((element) => parseFloat((element as HTMLElement).style.getPropertyValue("--look-x")));
  expect(look).toBeGreaterThan(1);
  await page.mouse.move(0, 0);
  expect(await portrait.evaluate((element) => (element as HTMLElement).style.getPropertyValue("--look-x"))).toBe("");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await portrait.hover({ position: { x: bounds!.width - 8, y: bounds!.height / 2 } });
  await expect(portrait.locator(".character-look")).not.toHaveCount(0);
  const transforms = await portrait.locator(".character-look").evaluateAll((elements) => elements.map((element) => getComputedStyle(element).transform));
  expect(transforms.every((transform) => transform === "none")).toBe(true);
});

test("walking moves both legs without flipping clothing and respects reduced motion", async ({ page }) => {
  const sprite = page.locator(".avatar-lab-in-world .agent-world-sprite");
  // Destination/timer transitions are covered by AgentWorldSprite.test.ts;
  // hold that state here to inspect the actual browser animation.
  await sprite.evaluate((element) => element.classList.add("is-walking"));
  const phase = (time: number) => sprite.evaluate((element, time) => {
    for (const animation of element.getAnimations({ subtree: true })) {
      animation.pause(); animation.currentTime = time;
    }
    return {
      legs: Array.from(element.querySelectorAll(".pixel-leg"), (leg) => getComputedStyle(leg).transform),
      torso: getComputedStyle(element.querySelector(".pixel-walking > g")!).transform,
      visible: getComputedStyle(element.querySelector(".pixel-walking")!).visibility,
    };
  }, time);
  const first = await phase(0), second = await phase(390);
  expect(first.legs).toHaveLength(2);
  expect(first.legs[0]).not.toBe(first.legs[1]);
  expect(first.legs[0]).not.toBe(second.legs[0]);
  expect(first.torso).toBe("none"); expect(second.torso).toBe("none");
  expect(first.visible).toBe("visible");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await sprite.locator(".pixel-walking").evaluate((element) => getComputedStyle(element).visibility)).toBe("hidden");
  expect(await sprite.locator(".pixel-standing").evaluate((element) => getComputedStyle(element).visibility)).toBe("visible");
  const animations = await sprite.locator(".pixel-leg").evaluateAll((legs) => legs.map((leg) => getComputedStyle(leg).animationName));
  expect(animations).toEqual(["none", "none"]);
});
