/**
 * Capture the frames `build-submission-demo.mjs` turns into the submission film.
 *
 * The builder has always been in the repository; the capture was not, so the
 * film could not be rebuilt when the product changed — which is exactly what
 * `submission/DEMO_SCRIPT.md` tells you to do. This is that missing half.
 *
 *   node scripts/capture-submission-demo.mjs [--site URL] [--out DIR]
 *   node scripts/build-submission-demo.mjs [DIR]
 *
 * It only ever visits public pages of a deployment and never signs in, so every
 * frame is a screen a judge can reach themselves. Positions are resolved from
 * selectors at capture time rather than hardcoded, because the public replay's
 * height depends on whichever record is pinned.
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const arg = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const SITE = arg("--site", "https://merry-bass-190.convex.site").replace(/\/$/, "");
const OUT = resolve(arg("--out", ".scratch/submission/capture"));
// Four frames per second of finished film. The builder retimes each beat to the
// storyboard's duration, so this only sets how smooth the motion is.
const FPS = 4;

const story = require("../submission/film-storyboard.json");
const seconds = (name) => {
  const beat = story.find((b) => b.name === name);
  if (!beat) throw new Error(`No storyboard beat named ${name}`);
  return beat.seconds;
};

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1,
  // Smooth scrolling is only disabled under this preference, and a frame
  // captured mid-glide lands somewhere nobody chose.
  reducedMotion: "reduce",
});
await page.addInitScript(() => {
  localStorage.setItem("datehaja-locale", "en-US");
  localStorage.setItem("datehaja-theme", "dark");
});

let shot = 0;
let dir = "";
const shoot = async () => {
  await page.screenshot({ path: resolve(dir, `${String(++shot).padStart(4, "0")}.png`) });
};

/** Scroll from one document position to another, one frame per step. */
async function pan(from, to, frames) {
  for (let i = 0; i < frames; i++) {
    const y = Math.round(from + ((to - from) * i) / Math.max(1, frames - 1));
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(40);
    await shoot();
  }
}

/** Sit still, letting whatever is on screen play. */
async function hold(frames, ms = 120) {
  for (let i = 0; i < frames; i++) {
    await page.waitForTimeout(ms);
    await shoot();
  }
}

/** Document-space top of the first match, so beats survive a layout change. */
async function topOf(selector, nudge = -80) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`Not on the page: ${selector}`);
  const scrollY = await page.evaluate(() => window.scrollY);
  return Math.max(0, Math.round(box.y + scrollY + nudge));
}

async function open(path) {
  await page.goto(SITE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
}

const beats = [];
async function beat(name, run) {
  dir = resolve(OUT, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  shot = 0;
  const frames = Math.round(seconds(name) * FPS);
  await run(frames);
  if (shot < 2) throw new Error(`${name} captured ${shot} frames`);
  beats.push({ name, frames: shot });
  process.stdout.write(`${name}: ${shot} frames\n`);
}

mkdirSync(OUT, { recursive: true });

/* ---- 01 the hook, on the front page ------------------------------------ */
await open("/");
await beat("01-introduction", async (frames) => {
  await pan(0, 340, frames);
});

/* ---- 11 the sponsor stack, same page ----------------------------------- */
await beat("11-execution", async (frames) => {
  const top = await topOf(".agent-stack-section", -40);
  await page.evaluate((y) => window.scrollTo(0, y), top);
  await page.waitForTimeout(400);
  await pan(top, top + 380, frames);
});

/* ---- 03 a real date, playing ------------------------------------------- */
await open("/watch");
await beat("03-generated-date", async (frames) => {
  const world = await topOf(".agent-world", -30);
  await page.evaluate((y) => window.scrollTo(0, y), world);
  await page.waitForTimeout(500);
  const replay = page.getByRole("button", { name: /replay the date/i });
  if (await replay.count()) await replay.first().click().catch(() => {});
  // Step through the saved lines so the conversation visibly advances even if
  // autoplay has already finished by the time capture starts.
  const steps = page.locator(".agent-world button").filter({ hasText: /^\d+$/ });
  const count = Math.min(await steps.count(), 16);
  const per = Math.max(2, Math.floor(frames / Math.max(1, count)));
  let used = 0;
  for (let i = 0; i < count && used < frames; i++) {
    await steps.nth(i).click().catch(() => {});
    const take = Math.min(per, frames - used);
    await hold(take, 110);
    used += take;
  }
  if (used < frames) await hold(frames - used, 110);
});

/* ---- 05 each Agent writes home, privately ------------------------------ */
await beat("05-private-reason", async (frames) => {
  const notes = await topOf(".watch-discovery", -40);
  await page.evaluate((y) => window.scrollTo(0, y), notes);
  await page.waitForTimeout(400);
  const half = Math.floor(frames / 2);
  const people = page.locator(".watch-perspectives button");
  if (await people.count()) await people.first().click().catch(() => {});
  await hold(half, 130);
  if ((await people.count()) > 1) await people.nth(1).click().catch(() => {});
  await hold(frames - half, 130);
});

/* ---- 10 only two human yeses open contact ------------------------------ */
await beat("10-human-choice", async (frames) => {
  const top = await topOf(".watch-discovery", -40);
  await pan(top + 200, top + 620, frames);
});

/* ---- the learning proof, in English ------------------------------------ */
await open("/preview/agent-coaching?lang=en");

/* ---- 07 the owner corrects their Agent --------------------------------- */
await beat("07-saved-feedback", async (frames) => {
  const top = await topOf(".learning-example", -60).catch(async () => topOf("h2", -60));
  await pan(top, top + 460, frames);
});

/* ---- 06 the same Agent, a later date ----------------------------------- */
await beat("06-before-after", async (frames) => {
  const choices = page.locator(".proof-date-choices button");
  if ((await choices.count()) > 1) await choices.nth(1).click().catch(() => {});
  await page.waitForTimeout(600);
  const top = await topOf(".proof-letter", -80).catch(async () => topOf(".date-journal", -80));
  const half = Math.floor(frames / 2);
  await pan(top, top + 420, half);
  // The unchanged Korean source sits one click away from the translation.
  const korean = page.getByRole("button", { name: /한국어/ });
  if (await korean.count()) await korean.first().click().catch(() => {});
  await page.waitForTimeout(500);
  await hold(frames - half, 130);
});

/* ---- 09 replay any encounter, starting nothing new --------------------- */
await beat("09-later-date", async (frames) => {
  const english = page.getByRole("button", { name: /^English$/ });
  if (await english.count()) await english.first().click().catch(() => {});
  await page.waitForTimeout(400);
  const choices = page.locator(".proof-date-choices button");
  if ((await choices.count()) > 3) await choices.nth(3).click().catch(() => {});
  await page.waitForTimeout(800);
  const world = await topOf(".agent-world", -30);
  await page.evaluate((y) => window.scrollTo(0, y), world);
  await page.waitForTimeout(400);
  await hold(frames, 130);
});

/* ---- 04 the journal, pointing back at saved lines ---------------------- */
await beat("04-grounded-journal", async (frames) => {
  const top = await topOf(".date-journal", -60);
  await pan(top, top + 520, frames);
});

writeFileSync(resolve(OUT, "beats.json"), JSON.stringify(beats, null, 2) + "\n");
await browser.close();

const missing = story.filter((b) => !beats.some((c) => c.name === b.name)).map((b) => b.name);
if (missing.length) throw new Error(`Storyboard beats never captured: ${missing.join(", ")}`);
console.log(`\n${beats.reduce((n, b) => n + b.frames, 0)} frames in ${OUT}`);
console.log(`Next: node scripts/build-submission-demo.mjs ${OUT}`);
