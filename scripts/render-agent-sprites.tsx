/** Rebuild the email-compatible PNGs from the same editable art as the app.
 * Run: bun run avatars:render
 * Requires Playwright's Chromium (or Chrome on macOS), no image service.
 */
import { mkdir, rename, rm, mkdtemp, readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium, type Browser } from "@playwright/test";
import { AgentCharacterArt } from "../src/components/agent/AgentCharacterArt";
import { PALETTES } from "../src/components/agent/AgentAvatar";
import { AVATAR_PALETTES, AVATAR_GENDERS, AVATAR_FACES, spritePathFor } from "../convex/lib/agentAvatar";

const root = resolve(import.meta.dir, "..");
const destination = resolve(root, "public/agents/v3");
await mkdir(destination, { recursive: true });
// Staging beside the final files keeps every rename on the same filesystem.
const staging = await mkdtemp(join(destination, ".render-"));
const images = new Map<string, string>();
async function embedImages(svg: string) {
  for (const [attribute, path] of svg.matchAll(/href="(\/agents\/pixel-v1\/[^"/]+\.png)"/g)) {
    let data = images.get(path);
    if (!data) {
      data = `data:image/png;base64,${(await readFile(join(root, "public", path))).toString("base64")}`;
      images.set(path, data);
    }
    svg = svg.replaceAll(attribute, `href="${data}"`);
  }
  return svg;
}
let browser: Browser | undefined;
try {
  browser = await chromium.launch({
    channel: process.env.PLAYWRIGHT_CHANNEL ?? (process.platform === "darwin" ? "chrome" : undefined),
  });
  const page = await browser.newPage({ viewport: { width: 341, height: 512 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const outputs: string[] = [];
  for (const gender of AVATAR_GENDERS) {
    for (const palette of AVATAR_PALETTES) {
      for (const face of AVATAR_FACES) {
        const config = { gender, palette, face, hair: gender === "female" ? "wave" as const : "crop" as const, outfit: "cardigan" as const, accessory: "none" as const };
        const svg = await embedImages(renderToStaticMarkup(createElement(AgentCharacterArt, { config, colors: PALETTES[palette], fullBody: true })));
        await page.setContent(`<html><head><style>html,body{margin:0;background:transparent}svg{display:block;width:341px;height:512px}image{image-rendering:pixelated}</style></head><body>${svg}</body></html>`);
        await page.locator("svg image").evaluateAll(async (nodes) => {
          await Promise.all(nodes.map((node) => {
            const image = new Image();
            image.src = node.getAttribute("href")!;
            return image.decode();
          }));
        });
        const name = spritePathFor(palette, face, gender).split("/").pop()!;
        await page.screenshot({ path: join(staging, name), omitBackground: true });
        outputs.push(name);
      }
    }
  }
  // Render every variant successfully before replacing any current assets.
  for (const name of outputs) await rename(join(staging, name), join(destination, name));
  console.log(`Rendered ${outputs.length} email sprites (341 × 512, transparent).`);
} finally {
  try {
    await browser?.close();
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}
