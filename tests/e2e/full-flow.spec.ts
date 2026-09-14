import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

function localEnv(name: string): string | undefined {
  if (process.env[name]) return process.env[name];
  try {
    const source = readFileSync(".env.local", "utf8");
    const value = source.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]?.trim();
    return value?.replace(/^['"]|['"]$/g, "");
  } catch {
    return undefined;
  }
}

async function waitForAgentMailOtp(
  recipient: string,
  requestedAt: number,
): Promise<string> {
  // The fixed code exists only where ENVIRONMENT=development, which production
  // deliberately is not. Pointed at any other deployment the real code has to
  // come out of the Concierge inbox, test alias or not.
  const fixedCodeDeployment = !process.env.E2E_BASE_URL;
  if (fixedCodeDeployment && /^hyo\+test[\w.+-]*@hyo\.dev$/i.test(recipient)) {
    return "68686868";
  }

  const apiKey = localEnv("AGENTMAIL_API_KEY");
  const inboxId = localEnv("AGENTMAIL_INBOX_ID");
  if (!apiKey || !inboxId) {
    throw new Error(
      "Full auth E2E needs AGENTMAIL_API_KEY and AGENTMAIL_INBOX_ID.",
    );
  }

  const endpoint = `https://api.agentmail.to/v0/inboxes/${encodeURIComponent(inboxId)}/messages?limit=30`;
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) {
      throw new Error(`AgentMail inbox lookup failed (${response.status}).`);
    }
    const payload = (await response.json()) as {
      messages?: Array<{
        timestamp?: string;
        subject?: string;
        to?: string[];
      }>;
    };
    const message = payload.messages?.find((candidate) => {
      const sentAt = candidate.timestamp
        ? new Date(candidate.timestamp).getTime()
        : 0;
      return (
        sentAt >= requestedAt - 5_000 &&
        candidate.to?.some((address) => address.includes(recipient)) &&
        /^\d{8}\b/.test(candidate.subject ?? "")
      );
    });
    const code = message?.subject?.match(/^\d{8}/)?.[0];
    if (code) return code;
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error("Timed out waiting for the AgentMail OTP.");
}

test.skip(
  process.env.DATEHAJA_FULL_E2E !== "1",
  "Set DATEHAJA_FULL_E2E=1 to create a disposable account and run an agent date.",
);

// `html { scroll-behavior: smooth }` is only switched off under reduced motion,
// so without this every scroll-into-view animates and a click can resolve its
// target mid-flight — one run spent twelve minutes retrying a chip that kept
// landing "outside of the viewport". The action timeout stops a stuck click
// from eating the whole budget the way that one did; the long waits below set
// their own. This test is about the flow, not about animation.
test.use({
  timezoneId: "America/New_York",
  reducedMotion: "reduce",
  actionTimeout: 30_000,
});

// Whether or not the assertions passed. A failed run used to leave its
// disposable account scouting forever: spending model calls on every tick and
// sitting in the candidate pool as somebody no real person can be matched with.
test.afterEach(async ({ page }) => {
  const pause = page.getByRole("button", { name: "Pause search", exact: true });
  try {
    await page.goto("/dashboard");
    await pause.waitFor({ state: "visible", timeout: 10_000 });
  } catch {
    return; // Never signed in, or never started a search. Nothing to stop.
  }
  await pause.click();
  // The button itself is the signal. The headline is not: a date still running
  // says "out meeting someone" and hides the paused state behind it, which is
  // exactly the situation a failed run leaves behind.
  await expect(pause).toBeHidden({ timeout: 20_000 });
});

test("account to private agent debrief and human consent", async ({ page }, testInfo) => {
  // Four minutes was calibrated for a six-turn date. A conversation that earns
  // its extension now runs twelve, and the private letter is written after the
  // last line, so the whole flow needs roughly three times the room it used to.
  test.setTimeout(720_000);
  await page.addInitScript(() => {
    window.localStorage.setItem("datehaja-locale", "en-US");
  });

  const suffix = Date.now();
  const email =
    process.env.DATEHAJA_E2E_EMAIL ?? `hyo+test-agent-${suffix}@hyo.dev`;
  await page.goto("/signup");
  await page.getByLabel("Email").fill(email);
  const requestedAt = Date.now();
  await page
    .getByRole("button", {
      name: /Email me a sign-in code|Use development code/i,
    })
    .click();
  await expect(page.getByLabel("Verification code")).toBeVisible();
  const otp = await waitForAgentMailOtp(email, requestedAt);
  const codeField = page.getByLabel("Verification code");
  // A development deployment prefills its fixed code. Everywhere else the field
  // starts empty and the mailed code has to be typed.
  if ((await codeField.inputValue()) !== otp) await codeField.fill(otp);
  await expect(codeField).toHaveValue(otp);
  await page.getByRole("button", { name: /Verify and continue/i }).click();

  await expect(page).toHaveURL(/\/(legal\/accept|onboarding)/, {
    timeout: 20_000,
  });
  await page.waitForTimeout(1_200);
  if (page.url().includes("/legal/accept")) {
    await expect(page.getByText(/Required.*version 2026/i)).toBeVisible();
    const consent = page.getByRole("checkbox");
    await expect(consent).toHaveCount(1);
    await consent.check();
    await expect(consent).toBeChecked();
    const continueButton = page.getByRole("button", {
      name: "Agree and continue",
    });
    await expect(continueButton).toBeEnabled();
    await continueButton.click();
  }

  await expect(page).toHaveURL(/\/onboarding/);
  await expect(
    page.getByRole("heading", { name: /Meet your Dating Agent/i }),
  ).toBeVisible();
  await page.getByLabel("Name your Dating Agent").fill("Juno");
  const skyPalette = page.getByRole("button", { name: "sky palette" });
  await skyPalette.click();
  await expect(skyPalette).toHaveAttribute("aria-pressed", "true");
  const glasses = page.getByRole("button", { name: "Glasses", exact: true });
  await glasses.click();
  await expect(glasses).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /Tell Juno who to find/i }).click();

  await expect(
    page.getByRole("heading", { name: /Who do you hope it notices/i }),
  ).toBeVisible();
  const idealPersonNext = page.getByRole("button", {
    name: /Now tell it about me/i,
  });
  await expect(idealPersonNext).toBeDisabled();
  await expect(page.getByText("0/2", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Woman", exact: true }).click();
  await expect(page.getByText("1/2", { exact: true })).toBeVisible();
  await page
    .getByLabel("What kind of person should it come home excited about?")
    .fill("1234567890123456789");
  await expect(page.getByText("1 more characters")).toBeVisible();
  await expect(idealPersonNext).toBeDisabled();
  await page
    .getByLabel("What kind of person should it come home excited about?")
    .fill(
      "Someone I can disagree with safely, who enjoys their own life and can share calm silences.",
    );
  await expect(page.getByText("Ready for the next step")).toBeVisible();
  await expect(idealPersonNext).toBeEnabled();
  await idealPersonNext.click();

  await expect(
    page.getByRole("heading", {
      name: /What should your Dating Agent know about you/i,
    }),
  ).toBeVisible();
  const finishOnboarding = page.getByRole("button", {
    name: /Seal the brief/i,
  });
  await expect(page.getByText("Complete these to continue")).toBeVisible();
  await expect(finishOnboarding).toBeDisabled();
  await page.getByLabel("What should we call you?").fill("Juno");
  await page.getByLabel("Date of birth").fill("1993-06-15");
  await page.getByRole("button", { name: "Man", exact: true }).click();

  for (const interest of ["Films", "Coffee", "Art galleries"]) {
    await page.getByRole("button", { name: interest, exact: true }).click();
  }
  for (const trait of ["Thoughtful", "Curious"]) {
    await page.getByRole("button", { name: trait, exact: true }).click();
  }
  await page
    .getByLabel("Tell Juno the version close friends know")
    .fill(
      "I look outgoing at first, but I need quiet after crowded rooms. I value curious people who do not perform confidence.",
    );
  await expect(page.getByText("Ready to create your Dating Agent")).toBeVisible();
  await expect(finishOnboarding).toBeEnabled();
  await finishOnboarding.click();

  await expect(page).toHaveURL(/\/membership/, { timeout: 20_000 });
  await expect(page.getByText("Your brief is complete")).toBeVisible();
  await expect(page.getByText("DEMO ACTIVE")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: /Send my Dating Agent scouting/i }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
  await expect(page.getByRole("button", { name: "Pause search", exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Juno", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Your Dating Agent's world" }),
  ).toBeVisible();
  await expect(page.getByText("What Juno remembers")).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Juno, your dating agent" }),
  ).toBeVisible();

  // Browser verification should not fill a real mailbox with demo letters.
  if (process.env.DATEHAJA_E2E_SEND_EMAIL !== "1") {
    await page.goto("/settings");
    const mailSwitch = page.getByRole("switch", { name: /Email me at all/i });
    await expect(mailSwitch).toHaveAttribute("aria-checked", "true");
    await mailSwitch.click();
    await expect(mailSwitch).toHaveAttribute("aria-checked", "false");
    await page.goto("/dashboard");
  }

  await page
    .getByLabel("Message Juno")
    .fill(
      "People often mistake my quietness for disinterest. Please remember that.",
    );
  await page.getByRole("button", { name: "Send", exact: true }).click();
  const thinking = page.getByText(/Juno is thinking, not typing/i);
  await expect(thinking).toBeVisible();
  await expect(
    page
      .locator(".agent-bubble")
      .filter({ hasNotText: /I'm Juno/ })
      .last(),
  ).toBeVisible({ timeout: 60_000 });
  // Wait for the reply to actually land, not just for a bubble to exist. The
  // backend refuses a date while the agent is still reading, so leaving this
  // out made the next step fail on a race rather than on anything real.
  await expect(thinking).toBeHidden({ timeout: 60_000 });

  // Reachable while the search is still running. The pool is usually empty at
  // this point, which leaves the button above disabled — so this is the only
  // thing a first visitor can actually press, and it has to be on screen.
  const demoEncounter = page.getByRole("button", {
    name: /Try a clearly labelled demo encounter/i,
  });
  await expect(demoEncounter).toBeVisible();
  await demoEncounter.click();
  await expect(page).toHaveURL(/\/agent-date\//, { timeout: 20_000 });
  await expect(
    page.getByText(/explicitly AI.*private simulation/i),
  ).toBeVisible();
  await expect(
    page.locator(".date-record-transcript header span"),
  ).toHaveText(/^(?:[2-9]|[1-9]\d+) saved lines$/, { timeout: 180_000 });
  await expect(
    page.getByRole("button", { name: /replay the date/i }),
  ).toBeVisible();
  await expect(page.getByLabel(/Date replay moments/i)).toBeVisible();
  await expect(page.getByText("Why their paths crossed")).toBeVisible();
  await expect(page.getByText(/No secret compatibility score/i)).toBeVisible();
  await expect(
    page.getByRole("region", { name: /Juno and .* in/i }),
  ).toBeVisible();
  await expect(page.getByText("Your private debrief")).toBeVisible();
  // The transcript fills while the date is still going, so reaching this point
  // says nothing about the date being over — the wait below covers almost the
  // whole date. Two measured runs took 4m08s and 4m16s from request to
  // debrief_ready, and both failed a 2-minute and a 4-minute wait by seconds.
  await expect(page.getByText(/Primary signal|Why I passed/i)).toBeVisible({
    timeout: 360_000,
  });
  await expect(page.getByRole("button", { name: /Introduce us/i })).toBeVisible(
    { timeout: 360_000 },
  );
  await expect(page.getByText(/not a compatibility score/i)).toBeVisible();

  const letterScreenshot = testInfo.outputPath("private-letter.png");
  await page.screenshot({ path: letterScreenshot, fullPage: true });
  await testInfo.attach("private-letter", { path: letterScreenshot, contentType: "image/png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const mobileScreenshot = testInfo.outputPath("private-letter-mobile.png");
  await page.screenshot({ path: mobileScreenshot, fullPage: true });
  await testInfo.attach("private-letter-mobile", { path: mobileScreenshot, contentType: "image/png" });
  await testInfo.attach("date-url", { body: page.url(), contentType: "text/plain" });

  await page.getByRole("button", { name: /Introduce us/i }).click();
  await expect(page.getByText(/Two humans said yes/i)).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByText(/no real contact exists/i)).toBeVisible();
  await page.goto("/dashboard");
  await expect(page.getByText("Still looking. No match to rush.")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Conversations completed: 0")).toBeVisible();
  await expect(page.getByRole("group", { name: "Your Dating Agent's world" })).toBeVisible();
  await expect(page.getByText(/Last checked/)).toBeVisible();
  const searchScreenshot = testInfo.outputPath("search-waiting-mobile.png");
  await page.screenshot({ path: searchScreenshot, fullPage: true });
  await testInfo.attach("search-waiting-mobile", { path: searchScreenshot, contentType: "image/png" });
  await page.getByRole("button", { name: "Pause search", exact: true }).click();
  await expect(page.getByText("Your search is paused.")).toBeVisible();
});
