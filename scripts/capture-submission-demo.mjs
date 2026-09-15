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
 * frame but one is a screen a judge can reach themselves; the exception is the
 * letter beat, which renders the delivered message kept at
 * `submission/fixtures/introduction-letter.html`. Positions are resolved from
 * selectors at capture time rather than hardcoded, because the public replay's
 * height depends on whichever record is pinned.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
// Re-shoot one beat without spending fourteen minutes on the other nine. The
// manifest is merged rather than replaced, so the build still sees every beat.
const ONLY = arg("--only", "");
// Frames per second of finished film. The builder retimes each beat to the
// storyboard's duration, so this only sets how smooth the motion is — and it is
// the whole difference between a pan that glides and one that stutters. At four
// the 24fps output held every frame six times and every scroll juddered.
const FPS = Number(process.env.DATEHAJA_CAPTURE_FPS || 12);

const story = require("../submission/film-storyboard.json");
// A mistyped --only matches nothing, captures nothing, and would otherwise exit
// zero having done no work at all.
if (ONLY && !story.some((b) => b.name === ONLY)) {
  throw new Error(`No storyboard beat named ${ONLY}. Beats: ${story.map((b) => b.name).join(", ")}`);
}
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

/**
 * Wait for the page to stop growing.
 *
 * The journal's illustrations load late. A position measured before they
 * arrive is hundreds of pixels wrong once they do, and the beat that trusted
 * it filmed the transcript while the narration described the private letters.
 */
async function settle() {
  await page.evaluate(async () => {
    await Promise.all([...document.images].filter((i) => !i.complete).map((i) =>
      new Promise((done) => { i.addEventListener("load", done, { once: true }); i.addEventListener("error", done, { once: true }); })));
    await document.fonts?.ready;
  });
  let last = -1;
  for (let i = 0; i < 20; i++) {
    const height = await page.evaluate(() => document.body.scrollHeight);
    if (height === last) return;
    last = height;
    await page.waitForTimeout(250);
  }
}

/** Document-space top of the first match, so beats survive a layout change. */
async function topOf(selector, nudge = -80) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`Not on the page: ${selector}`);
  const scrollY = await page.evaluate(() => window.scrollY);
  return Math.max(0, Math.round(box.y + scrollY + nudge));
}

async function goTo(y) {
  await page.evaluate((top) => window.scrollTo(0, top), Math.max(0, Math.round(y)));
  await page.waitForTimeout(350);
}

/**
 * Refuse to film a screen that does not show what the beat is about.
 *
 * Every beat below asserts the one thing its captions claim is on screen. A
 * whole cut of this film narrated letters, a journal and a sponsor list that
 * were never in frame, and nothing in the pipeline could tell.
 */
async function mustSee(selector, claim) {
  const seen = await page.locator(selector).first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.height > 0 && r.top < window.innerHeight - 60 && r.bottom > 60;
  }, undefined, { timeout: 2000 }).catch(() => false);
  if (!seen) throw new Error(`Filming "${claim}" but ${selector} is not on screen`);
}

async function open(path) {
  await page.goto(SITE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle();
}

const beats = [];
async function beat(name, run) {
  if (ONLY && name !== ONLY) return;
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
  // Barely move. The hero is 638 tall in a 720 frame, so any real pan drags the
  // next section's headline in and slices it on the caption band — and the
  // simulation panel beside the headline is already animating on its own.
  await pan(0, 70, frames);
});

/* ---- 11 the four jobs, and who does each one --------------------------- */
await beat("11-execution", async (frames) => {
  const top = await topOf(".agent-stack-section", -40);
  await goTo(top);
  // The captions name Convex, OpenAI, Firecrawl and AgentMail. They are on
  // this screen, one per job card, or this beat has no business claiming them.
  await mustSee(".agent-service-runs", "Convex, OpenAI, Firecrawl, AgentMail");
  await pan(top, top + 90, frames);
});

/* ---- 03 a real date, playing ------------------------------------------- */
await open("/watch");
// Six captions, and each one wants a different thing on screen: the opening
// line, the middle of the conversation, the line counter, the source the scene
// was built from, and the ending. Stepping evenly showed none of them on time.
await beat("03-generated-date", async (frames) => {
  const world = await topOf(".agent-world", -30);
  await goTo(world);
  const replay = page.getByRole("button", { name: /replay the date/i });
  if (await replay.count()) await replay.first().click().catch(() => {});
  const steps = page.locator(".agent-world button").filter({ hasText: /^\d+$/ });
  const count = await steps.count();
  const step = async (n) => { if (n <= count) await steps.nth(n - 1).click().catch(() => {}); };
  const share = Math.round(frames / 6);

  // 3 + 4: "watch it without signing up" and "Juno starts by saying what it is".
  await step(1);
  await goTo(world);
  await mustSee(".agent-world", "a finished Agent date");
  await hold(share * 2, 110);

  // 5: the conversation moving through the bookshop.
  for (const n of [2, 3, 4, 5]) { await step(n); await hold(Math.round(share / 4), 110); }

  // 6: sixteen saved lines, stepping.
  for (const n of [7, 9, 11, 13]) { await step(n); await hold(Math.round(share / 4), 110); }

  // 7: the page the scene was built around. Firecrawl found it, and the link
  // under the scene is the only place a viewer can check that for themselves.
  const SOURCE = "a.underline[href^='http']";
  await goTo(await topOf(SOURCE, -520));
  await mustSee(SOURCE, "a page pulled off the live web");
  await hold(share, 110);

  // 8: the ending, as it was saved.
  await goTo(world);
  await step(16);
  await hold(frames - share * 5, 110);
});

/* ---- 04 the journal of the date we just watched ------------------------ */
// It used to be the coaching page's journal — a different pair, on a different
// date, directly after Juno and Sol. This one belongs to the date on screen.
await beat("04-grounded-journal", async (frames) => {
  const top = await topOf(".date-journal", -60);
  await goTo(top);
  await mustSee(".date-journal-evidence", "every card names the lines behind it");
  await pan(top, top + 760, frames);
});

/* ---- 05 each Agent writes home, privately ------------------------------ */
await beat("05-private-reason", async (frames) => {
  const notes = await topOf(".watch-discovery", -50);
  await goTo(notes);
  await mustSee(".watch-perspectives", "each Agent writes home independently");
  const half = Math.floor(frames / 2);
  const people = page.locator(".watch-perspectives button");
  if (await people.count()) await people.first().click().catch(() => {});
  await goTo(notes);
  await hold(half, 130);
  if ((await people.count()) > 1) await people.nth(1).click().catch(() => {});
  await goTo(notes);
  await hold(frames - half, 130);
});

/* ---- 10 only two human yeses open contact ------------------------------ */
await beat("10-human-choice", async (frames) => {
  const top = await topOf(".watch-discovery", -60);
  await goTo(top);
  await mustSee(".watch-discovery", "only two human yeses open contact");
  const two = Math.round((frames * 2) / 3);
  // The heading sits at the very top of this section, so a wider pan pushes it
  // off the frame while the narration is still explaining what it says.
  await pan(top, top + 40, two);
  // Close on the page's own last word rather than on a half-empty column.
  await open("/");
  await goTo(await topOf(".agent-final-cta", -40));
  await mustSee(".agent-final-cta", "Agents can advise. Humans decide.");
  await hold(frames - two, 130);
});

/* ---- 08 the letter, as it actually lands in a mailbox ------------------ */
// A real message pulled from the Concierge inbox and kept as a fixture, because
// the film otherwise never showed the one moment the whole loop exists for: the
// letter arriving. It is a saved send between two fictional personas and
// carries no address — the recipient lives in the mail metadata, not the body.
await beat("08-private-email", async (frames) => {
  const letter = readFileSync(resolve("submission/fixtures/introduction-letter.html"), "utf8");
  await page.setContent(letter, { waitUntil: "networkidle" });
  // Mail clients left-align a fixed-width table, which on a 1280 frame leaves
  // half the screen blank. Centring is framing, not a change to the letter.
  await page.addStyleTag({ content: "body>table{margin:0 auto!important}" });
  await page.waitForTimeout(900);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await pan(0, Math.max(0, height - 700), frames);
});

/* ---- the learning proof, in English ------------------------------------ */
await open("/preview/agent-coaching?lang=en");

/* ---- 07 the owner corrects their Agent --------------------------------- */
await beat("07-saved-feedback", async (frames) => {
  // The reply, the memory and the button back to the line that caused the
  // correction all live inside a closed disclosure. Three captions described
  // them over a screen showing only "Read Rio's reply and memory +".
  await page.locator(".proof-feedback details").first()
    .evaluate((node) => { node.open = true; }).catch(() => {});
  await settle();
  const top = await topOf(".proof-feedback", -70);
  await goTo(top);
  await mustSee(".proof-saved-reply", "the reply and the memory are saved");
  await pan(top, top + 620, frames);
});

/* ---- 06 four dates, and the original kept beside the translation ------- */
await beat("06-before-after", async (frames) => {
  // Two captions about the four saved dates, then three about the record that
  // was never overwritten. One cut between them, not three.
  const dates = await topOf(".proof-dates", -70);
  await goTo(dates);
  await mustSee(".proof-date-choices", "four dates, fifty-six lines");
  const onDates = Math.round((frames * 2) / 5);
  await pan(dates, dates + 60, onDates);

  const compare = await topOf(".proof-comparison", -60);
  await goTo(compare);
  await mustSee(".proof-comparison", "the original beside its translation");
  await pan(compare, compare + 620, frames - onDates);
});

/* ---- 09 replay any encounter, starting nothing new --------------------- */
await beat("09-later-date", async (frames) => {
  const choices = page.locator(".proof-date-choices button");
  if ((await choices.count()) > 3) await choices.nth(3).click().catch(() => {});
  await page.waitForTimeout(800);
  await settle();
  const world = await topOf(".agent-world", -30);
  await goTo(world);
  await mustSee(".agent-world", "replay the later encounter");
  // Let the later date actually move rather than freezing on one frame.
  const steps = page.locator(".agent-world button").filter({ hasText: /^\d+$/ });
  const count = Math.min(await steps.count(), 4);
  const per = Math.max(2, Math.floor(frames / Math.max(1, count)));
  let used = 0;
  for (let i = 0; i < count && used < frames; i++) {
    await steps.nth(i * 3).click().catch(() => {});
    const take = Math.min(per, frames - used);
    await hold(take, 130);
    used += take;
  }
  if (used < frames) await hold(frames - used, 130);
});

let manifest = beats;
if (ONLY) {
  // Merge rather than map over the old manifest: a beat captured for the very
  // first time is not in it, and mapping would drop the only thing this run
  // did. Storyboard order also keeps the manifest readable as the film's order.
  const existing = existsSync(resolve(OUT, "beats.json"))
    ? JSON.parse(readFileSync(resolve(OUT, "beats.json"), "utf8"))
    : [];
  const merged = new Map(existing.map((b) => [b.name, b]));
  for (const b of beats) merged.set(b.name, b);
  manifest = story.filter((b) => merged.has(b.name)).map((b) => merged.get(b.name));
}
writeFileSync(resolve(OUT, "beats.json"), JSON.stringify(manifest, null, 2) + "\n");
await browser.close();

const missing = story.filter((b) => !manifest.some((c) => c.name === b.name)).map((b) => b.name);
if (missing.length) throw new Error(`Storyboard beats never captured: ${missing.join(", ")}`);
console.log(`\n${manifest.reduce((n, b) => n + b.frames, 0)} frames in ${OUT}`);
console.log(`Next: node scripts/build-submission-demo.mjs ${OUT}`);
