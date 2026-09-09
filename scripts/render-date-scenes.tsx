import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "@playwright/test";
import { DateSceneArt } from "../src/components/agent/DateSceneArt";
import { sceneKinds } from "../convex/lib/dateStory";

// Local preview output only. The app draws these scenes as inline SVG, so
// writing into public/ would publish assets nothing ever loads.
const destination = resolve(import.meta.dir, "../.scratch/scenes");
await mkdir(destination, { recursive: true });
const browser = await chromium.launch({ channel: process.platform === "darwin" ? "chrome" : undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1040, height: 520 }, deviceScaleFactor: 1 });
  for (const kind of sceneKinds) {
    const svg = renderToStaticMarkup(createElement(DateSceneArt, { kind }));
    await writeFile(resolve(destination, `${kind}.svg`), svg);
    await page.setContent(`<style>html,body{margin:0}svg{display:block;width:1040px;height:520px}</style>${svg}`);
    await page.screenshot({ path: resolve(destination, `${kind}.png`) });
  }
} finally { await browser.close(); }
console.log(`Rendered ${sceneKinds.length} shared date scenes.`);
