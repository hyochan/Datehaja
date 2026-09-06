import { expect, test } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Records the submission demo from the product as it exists right now.
 *
 * The previous cut was recorded by hand against the concierge product this
 * repository no longer contains, and nothing tied it to the code, so it went
 * stale silently. This spec drives the same flow the full-flow E2E proves —
 * signup, Agent creation, a private message, a live six-turn date, the private
 * letter, and the sealed human decision — while a video records it.
 *
 * It marks where each storyboard beat begins and ends in the raw capture.
 * `scripts/build-demo.mjs` then trims each span and time-scales it to exactly
 * the duration `submission/demo-beats.json` asks for, so the finished film is
 * the same length whatever the models did that day, and DEMO_CAPTIONS.srt
 * lines up without being retimed by hand.
 *
 *   bun run demo:record   (sets DATEHAJA_DEMO_RECORD=1 for the guard below)
 *   bun run demo:build
 */

type Beat = { id: string; label: string; targetSeconds: number };

const storyboard = JSON.parse(
  readFileSync("submission/demo-beats.json", "utf8"),
) as { width: number; height: number; beats: Beat[] };

const MARKS_PATH = "test-results/demo-marks.json";
const CAPTURES = "submission/captures";

test.skip(
  process.env.DATEHAJA_DEMO_RECORD !== "1",
  "Set DATEHAJA_DEMO_RECORD=1 to record the submission demo.",
);

test.use({
  viewport: { width: storyboard.width, height: storyboard.height },
  video: {
    mode: "on",
    size: { width: storyboard.width, height: storyboard.height },
  },
  // The demo is narrated in English; the product picks its language from the
  // stored locale, so both are pinned rather than left to the machine running
  // the recording.
  locale: "en-US",
  timezoneId: "America/New_York",
});

test("record the submission demo", async ({ page }) => {
  // A full run is signup, onboarding, a real date and two model verdicts.
  test.setTimeout(20 * 60_000);

  const started = Date.now();
  const at = () => (Date.now() - started) / 1000;
  const marks: Array<{ id: string; start: number; end: number }> = [];
  let pending: { id: string; start: number } | null = null;

  /** Everything between `end()` and the next `begin()` is cut. */
  const begin = (id: string) => {
    pending = { id, start: at() };
  };
  const end = () => {
    if (pending) marks.push({ ...pending, end: at() });
    pending = null;
  };

  /** A held frame reads as composure; a cut on the same frame reads as a bug. */
  const hold = (ms: number) => page.waitForTimeout(ms);

  const glide = async (top: number, settleMs = 1200) => {
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "smooth" }),
      top,
    );
    await page.waitForTimeout(settleMs);
  };

  // The submission needs six stills of the same six moments. Taking them here
  // means they are captured from the same run as the film, so a screenshot can
  // never describe a screen the product no longer has.
  mkdirSync(CAPTURES, { recursive: true });
  const still = (name: string) =>
    page.screenshot({ path: `${CAPTURES}/${name}.png` });

  await page.addInitScript(() => {
    window.localStorage.setItem("datehaja-locale", "en-US");
  });

  // ---------------------------------------------------------------- problem
  // Lead with the human problem. A judge should know what this is for before
  // seeing a single piece of machinery.
  begin("problem");
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  await hold(4_000);
  await still("01-landing-hero");
  await glide(760, 1_800);
  await glide(1_560, 1_800);
  await glide(2_400, 1_800);
  await glide(0, 1_400);
  end();

  // Signing in is plumbing, not story: it happens between beats and is cut.
  const email =
    process.env.DATEHAJA_DEMO_EMAIL ?? `hyo+test-demo-${Date.now()}@hyo.dev`;
  await page.goto("/signup");
  await page.getByLabel("Email").fill(email);
  await page
    .getByRole("button", {
      name: /Email me a sign-in code|Use development code/i,
    })
    .click();
  await expect(page.getByLabel("Verification code")).toBeVisible();
  await expect(page.getByLabel("Verification code")).not.toHaveValue("", {
    timeout: 60_000,
  });
  await page.getByRole("button", { name: /Verify and continue/i }).click();

  await expect(page).toHaveURL(/\/(legal\/accept|onboarding)/, {
    timeout: 30_000,
  });
  if (page.url().includes("/legal/accept")) {
    const consents = page.getByRole("checkbox");
    const total = await consents.count();
    for (let index = 0; index < total; index += 1) {
      await consents.nth(index).check();
    }
    await page.getByRole("button", { name: "Agree and continue" }).click();
  }
  await expect(page).toHaveURL(/\/onboarding/, { timeout: 30_000 });
  await expect(
    page.getByRole("heading", { name: /Meet your Agent/i }),
  ).toBeVisible();

  // ------------------------------------------------------------------ agent
  // Give it a face, then tell it the things that do not fit in a profile.
  begin("agent");
  await hold(1_800);
  await page.getByLabel("Name your Agent").pressSequentially("Juno", {
    delay: 140,
  });
  await hold(900);
  await page.getByRole("button", { name: "sky palette" }).click();
  await hold(1_100);
  await page.getByRole("button", { name: "Glasses", exact: true }).click();
  await hold(1_600);
  await still("02-agent-editor");
  await page.getByRole("button", { name: /Tell Juno who to find/i }).click();

  await expect(
    page.getByRole("heading", { name: /Who do you hope it notices/i }),
  ).toBeVisible();
  await hold(1_200);
  await page.getByRole("button", { name: "Woman", exact: true }).click();
  await page
    .getByLabel("What kind of person should it come home excited about?")
    .pressSequentially(
      "Someone I can disagree with safely, who enjoys their own life and can share calm silences.",
      { delay: 22 },
    );
  await hold(1_600);
  await page.getByRole("button", { name: /Now tell it about me/i }).click();

  await expect(
    page.getByRole("heading", {
      name: /What should your agent know about you/i,
    }),
  ).toBeVisible();
  await page.getByLabel("What should we call you?").fill("Juno");
  await page.getByLabel("Date of birth").fill("1993-06-15");
  await page.getByRole("button", { name: "Man", exact: true }).click();
  for (const interest of ["Films", "Coffee", "Art galleries"]) {
    await page.getByRole("button", { name: interest, exact: true }).click();
  }
  for (const trait of ["Thoughtful", "Curious"]) {
    await page.getByRole("button", { name: trait, exact: true }).click();
  }
  // The unpolished sentence is the whole argument for the product; let it be
  // read rather than pasted.
  await page
    .getByLabel("Tell Juno the version close friends know")
    .pressSequentially(
      "I look outgoing at first, but I need quiet after crowded rooms. I value curious people who do not perform confidence.",
      { delay: 20 },
    );
  await hold(2_200);
  await page.getByRole("button", { name: /Seal the brief/i }).click();

  await expect(page).toHaveURL(/\/membership/, { timeout: 30_000 });
  await expect(page.getByText("DEMO ACTIVE")).toBeVisible({ timeout: 30_000 });
  await hold(2_000);
  await page.getByRole("button", { name: /Send my Agent scouting/i }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
  await expect(
    page.getByRole("group", { name: /Juno's private room/i }),
  ).toBeVisible();
  await hold(1_800);
  await page
    .getByLabel("Message Juno")
    .pressSequentially(
      "People often mistake my quietness for disinterest. Please remember that.",
      { delay: 20 },
    );
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(
    page
      .locator(".agent-bubble")
      .filter({ hasNotText: /I'm Juno/ })
      .last(),
  ).toBeVisible({ timeout: 120_000 });
  await hold(2_500);
  end();

  // ------------------------------------------------------------------- date
  // Two Agents meet as the two people they stand in for, in a world drawn
  // around a place Firecrawl found on the live web that morning.
  begin("date");
  await page.getByRole("button", { name: /Send Juno scouting/i }).click();
  await expect(page).toHaveURL(/\/agent-date\//, { timeout: 30_000 });
  await expect(page.getByText(/explicitly AI.*private simulation/i)).toBeVisible(
    { timeout: 60_000 },
  );
  await hold(2_000);
  // Far enough in that two Agents are talking, not so far that the page has
  // already handed off to the debrief.
  await hold(14_000);
  await still("03-date-world");
  await expect(page.getByText(/live transcript.*6\/6 turns/i)).toBeVisible({
    timeout: 300_000,
  });
  await hold(2_500);
  end();

  // ----------------------------------------------------------------- letter
  // The emotional centre. It gets the most screen time on purpose.
  begin("letter");
  await page.getByText("Your private debrief").scrollIntoViewIfNeeded();
  await hold(3_000);
  await expect(page.getByText(/Primary signal|Why I passed/i)).toBeVisible({
    timeout: 180_000,
  });
  await hold(4_500);
  await still("04-private-letter");
  await page.mouse.wheel(0, 420);
  await hold(3_500);
  await page.mouse.wheel(0, 420);
  await hold(4_000);
  end();

  // --------------------------------------------------------------- decision
  // You answer without knowing what they answered. Contact opens only when
  // both people have said yes.
  begin("decision");
  const introduce = page.getByRole("button", { name: /Introduce us/i });
  await introduce.scrollIntoViewIfNeeded();
  await hold(3_000);
  await still("05-sealed-decision");
  await introduce.click();
  await expect(page.getByText(/Two humans said yes/i)).toBeVisible({
    timeout: 30_000,
  });
  await hold(5_000);
  await still("06-contact-opens");
  end();

  // ------------------------------------------------------------------ stack
  // One breath over the product, ending where a judge can go themselves.
  begin("stack");
  await page.goto("/watch");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  // The closing shot is the page a judge can open without an account, so it has
  // to actually contain a date. An empty /watch means the deployment has no
  // seeded showcase date yet — run the pre-flight in DEMO_SCRIPT.md rather than
  // letting the film end on an empty room.
  await expect(page.getByText(/6\s*\/\s*6/).first()).toBeVisible({
    timeout: 30_000,
  });
  await hold(4_000);
  await glide(600, 2_000);
  end();

  const video = page.video();
  const rawPath = video ? await video.path() : null;
  mkdirSync(dirname(MARKS_PATH), { recursive: true });
  writeFileSync(
    MARKS_PATH,
    `${JSON.stringify({ rawPath, recordedAt: new Date().toISOString(), marks }, null, 2)}\n`,
  );

  // Every beat the storyboard names has to exist, or the build would silently
  // ship a shorter film than the captions describe.
  const recorded = new Set(marks.map((mark) => mark.id));
  for (const beat of storyboard.beats) {
    expect(recorded.has(beat.id), `beat "${beat.id}" was not recorded`).toBe(
      true,
    );
  }
});
