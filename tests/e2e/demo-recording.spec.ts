import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Records the submission demo from the product as it exists right now.
 *
 * The previous cut was recorded by hand against the concierge product this
 * repository no longer contains, and nothing tied it to the code, so it went
 * stale silently. This spec drives the same flow the full-flow E2E proves —
 * signup, Agent creation, a private message, a live Agent conversation, the private
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

const MARKS_PATH = ".scratch/demo/marks.json";
const CAPTURES = "submission/captures";

test.skip(
  process.env.DATEHAJA_DEMO_RECORD !== "1",
  "Set DATEHAJA_DEMO_RECORD=1 to record the submission demo.",
);

test.use({
  // Trace screenshots share Playwright's screencast and can reduce video
  // frames to trace resolution, leaving gray padding in a 1080p recording.
  trace: "off",
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

test("record the submission demo", async ({ page, browser, baseURL }, testInfo) => {
  // A full run is signup, onboarding, a real date and two model verdicts.
  test.setTimeout(20 * 60_000);
  page.setDefaultTimeout(30_000);

  if (baseURL && !/^http:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(baseURL)) {
    throw new Error("Record against local UI and the development deployment; no production test accounts or email.");
  }
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
    await expect(consents).toHaveCount(3);
    const total = await consents.count();
    for (let index = 0; index < total; index += 1) {
      await consents.nth(index).check();
    }
    const agree = page.getByRole("button", { name: "Agree and continue" });
    await expect(agree).toBeEnabled();
    await agree.click();
  }
  await expect(page).toHaveURL(/\/onboarding/, { timeout: 30_000 });
  await expect(
    page.getByRole("heading", { name: /Meet your Dating Agent/i }),
  ).toBeVisible();

  // ------------------------------------------------------------------ agent
  // Give it a face, then tell it the things that do not fit in a profile.
  begin("agent");
  await hold(1_800);
  await page.getByLabel("Name your Dating Agent").pressSequentially("Juno", {
    delay: 140,
  });
  await hold(900);
  await page.getByRole("button", { name: "Man", exact: true }).click();
  await hold(900);
  await page.getByRole("button", { name: "sky palette" }).click();
  await hold(1_100);
  await page.getByRole("button", { name: "Blazer", exact: true }).click();
  await hold(900);
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
  await page.getByLabel("Country").selectOption("SE");
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
  await page.getByRole("button", { name: /Send my Dating Agent scouting/i }).click();

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
      .locator(".agent-bubble.rounded-bl-md")
      .filter({ hasNotText: /I'm Juno/ })
      .last(),
  ).toBeVisible({ timeout: 120_000 });
  await hold(2_500);
  end();

  // These disposable accounts use the real search; keep all delivery disabled.
  await disableMail(page);
  await page.goto("/dashboard");
  begin("search");
  await expect(page.getByText("Still looking. No match to rush.", { exact: true })).toBeVisible({ timeout: 30_000 });
  await page.locator(".agent-launch-card").scrollIntoViewIfNeeded();
  await hold(8_000);
  await still("03-ongoing-search");
  end();

  // A second independent test owner opts in. No fictional demo is inserted
  // into the pool, and no verdict is chosen by this recording.
  const otherContext = await browser.newContext({ baseURL, locale: "en-US", timezoneId: "Europe/Stockholm" });
  const otherPage = await otherContext.newPage();
  try {
  await prepareSecondOwner(otherPage);

  // ------------------------------------------------------------------- date
  // Two Agents meet as the two people they stand in for, in a world drawn
  // around a cultural source Firecrawl found on the live web.
  begin("date");
  await page.getByRole("button", { name: /Watch the date live/i }).click();
  await expect(page).toHaveURL(/\/agent-date\//, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: /^Juno × Sol$/ })).toBeVisible();
  // Verify the second signed-in owner sees this exact encounter too. Recording
  // must never silently capture an unrelated participant from the search pool.
  await otherPage.goto(page.url());
  await expect(otherPage.getByRole("heading", { name: /^Sol × Juno$/ })).toBeVisible();
  await expect(page.getByText(/explicitly AI.*private simulation/i)).toBeVisible(
    { timeout: 60_000 },
  );
  await hold(2_000);
  // Far enough in that two Agents are talking, not so far that the page has
  // already handed off to the debrief.
  await hold(4_000);
  const worldTop = await page.locator(".agent-world").evaluate(
    (element) => element.getBoundingClientRect().top + window.scrollY,
  );
  await glide(worldTop - 110);
  await hold(10_000);
  await still("04-date-world");
  await expect(
    page.locator(".date-record-transcript header span"),
  ).toHaveText(/^(?:[2-9]|[1-9]\d+) saved lines$/, { timeout: 300_000 });
  await hold(2_500);
  end();

  // ----------------------------------------------------------------- letter
  // The emotional centre. It gets the most screen time on purpose.
  // Model latency belongs between beats, so the letter starts fully written.
  await expect(page.locator(".agent-return-letter")).toBeVisible({
    timeout: 180_000,
  });
  const debriefTop = await page.getByText("Your private debrief").evaluate(
    (element) => element.getBoundingClientRect().top + window.scrollY,
  );
  await glide(debriefTop - 140);
  begin("letter");
  await hold(7_500);
  await still("05-private-notes");
  await page.mouse.wheel(0, 420);
  await hold(3_500);
  await page.mouse.wheel(0, 420);
  await hold(4_000);
  end();

  // --------------------------------------------------------------- decision
  // Keep the generated outcome. A non-match is the reason to continue, never
  // an excuse to manufacture a more photogenic yes.
  begin("decision");
  const introduce = page.getByRole("button", { name: /Introduce us/i });
  if (await introduce.count()) {
    await introduce.scrollIntoViewIfNeeded();
    await hold(4_000);
    await introduce.click();
    await hold(4_000);
    await otherPage.goto(page.url());
    await otherPage.getByRole("button", { name: /Introduce us/i }).click();
    await expect(page.getByText(/Two humans said yes/i)).toBeVisible({ timeout: 30_000 });
  } else {
    await expect(page.getByText("A conversation, not a match.", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Check the search", exact: true }).click();
    await expect(page.locator(".agent-search-lesson")).toBeVisible();
    await page.locator(".agent-launch-card").scrollIntoViewIfNeeded();
  }
  await hold(8_000);
  await still("06-next-step");
  end();

  // Pause both disposable searches outside the recorded beats.
  for (const ownerPage of [page, otherPage]) {
    await ownerPage.goto("/dashboard");
    await expect(ownerPage.getByRole("heading", { name: /^(Juno|Sol)$/ })).toBeVisible();
    const pause = ownerPage.getByRole("button", { name: "Pause search", exact: true });
    if (await pause.count()) await pause.click();
  }
  } finally {
    for (const ownerPage of [page, otherPage]) {
      try {
        await ownerPage.goto("/dashboard");
        await expect(ownerPage.getByRole("heading", { name: /^(Juno|Sol)$/ })).toBeVisible({ timeout: 10_000 });
        const pause = ownerPage.getByRole("button", { name: "Pause search", exact: true });
        if (await pause.count()) await pause.click();
      } catch { /* Keep the original failure; the take has not been published. */ }
    }
    await otherContext.close();
  }


  // ------------------------------------------------------------------ stack
  // One breath over the product, ending where a judge can go themselves.
  begin("stack");
  await page.goto("/watch");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  // The closing shot is the page a judge can open without an account, so it has
  // to actually contain a date. An empty /watch means the deployment has no
  // seeded showcase date yet — run the pre-flight in DEMO_SCRIPT.md rather than
  // letting the film end on an empty room.
  await expect(page.locator(".watch-discovery")).toBeVisible({
    timeout: 30_000,
  });
  await hold(4_000);
  const replayTop = await page.locator(".watch-discovery").evaluate(
    (element) => element.getBoundingClientRect().top + window.scrollY,
  );
  await glide(replayTop - 110, 2_000);
  await hold(8_000);
  end();

  const video = page.video();
  const rawPath = video ? testInfo.outputPath("demo-raw.webm") : null;
  // Playwright relocates its temporary video after the test. Save an explicit
  // copy after closing the context so the builder receives a durable path.
  await page.context().close();
  if (video && rawPath) await video.saveAs(rawPath);
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

async function disableMail(page: Page) {
  await page.goto("/settings");
  const toggle = page.getByRole("switch", { name: /Email me at all/i });
  await expect(toggle).toBeVisible();
  if (await toggle.getAttribute("aria-checked") === "true") await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
}

async function prepareSecondOwner(page: Page) {
  await page.addInitScript(() => localStorage.setItem("datehaja-locale", "en-US"));
  await page.goto("/signup");
  await page.getByLabel("Email").fill(`hyo+test-film-sol-${Date.now()}@hyo.dev`);
  await page.getByRole("button", { name: /Use development code/i }).click();
  await expect(page.getByLabel("Verification code")).toHaveValue("68686868");
  await page.getByRole("button", { name: /Verify and continue/i }).click();
  await expect(page).toHaveURL(/legal\/accept/);
  const consents = page.getByRole("checkbox");
  await expect(consents).toHaveCount(3);
  for (let index = 0; index < 3; index++) await consents.nth(index).check();
  await page.getByRole("button", { name: "Agree and continue" }).click();
  await page.getByLabel("Name your Dating Agent").fill("Sol");
  await page.getByRole("button", { name: "Woman", exact: true }).click();
  await page.getByRole("button", { name: "rose palette" }).click();
  await page.getByRole("button", { name: /Tell Sol who to find/i }).click();
  await page.getByRole("button", { name: "Man", exact: true }).click();
  await page.getByLabel("What kind of person should it come home excited about?").fill("Someone curious who has a point of view, can disagree kindly, and enjoys ordinary things together.");
  for (const trait of ["Thoughtful", "Curious"]) await page.getByRole("button", { name: trait, exact: true }).click();
  await page.getByRole("button", { name: /Now tell it about me/i }).click();
  await page.getByLabel("What should we call you?").fill("Mira");
  await page.getByLabel("Date of birth").fill("1994-09-20");
  await page.getByRole("button", { name: "Woman", exact: true }).click();
  await page.getByLabel("Country").selectOption("SE");
  for (const interest of ["Films", "Coffee", "Art galleries"]) await page.getByRole("button", { name: interest, exact: true }).click();
  for (const trait of ["Thoughtful", "Curious"]) await page.getByRole("button", { name: trait, exact: true }).click();
  await page.getByLabel("Tell Sol the version close friends know").fill("I am direct, curious, and playful. I prefer the quiet corner after a crowded room. I like people who can say what they actually want instead of just agreeing with me.");
  await page.getByRole("button", { name: /Seal the brief/i }).click();
  await expect(page.getByText("DEMO ACTIVE")).toBeVisible();
  await page.getByRole("button", { name: /Send my Dating Agent scouting/i }).click();
  await disableMail(page);
  await page.goto("/dashboard");
}
