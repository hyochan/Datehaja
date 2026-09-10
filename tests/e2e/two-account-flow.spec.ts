import { execFileSync } from "node:child_process";
import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

type Persona = {
  email: string;
  ownerName: string;
  agentName: string;
  dateOfBirth: string;
  gender: "Man" | "Woman";
  interestedIn: "Man" | "Woman";
  palette: "rose" | "violet";
  desiredConnection: string;
  essence: string;
};

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
  if (/^hyo\+test[\w.+-]*@hyo\.dev$/i.test(recipient)) return "68686868";

  const apiKey = localEnv("AGENTMAIL_API_KEY");
  const inboxId = localEnv("AGENTMAIL_INBOX_ID");
  if (!apiKey || !inboxId) {
    throw new Error(
      "Two-account E2E needs AGENTMAIL_API_KEY and AGENTMAIL_INBOX_ID.",
    );
  }

  const endpoint = `https://api.agentmail.to/v0/inboxes/${encodeURIComponent(inboxId)}/messages?limit=30`;
  const deadline = Date.now() + 40_000;
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
  throw new Error(`Timed out waiting for the OTP sent to ${recipient}.`);
}

async function createAccountAndAgent(page: Page, persona: Persona) {
  await page.addInitScript(() => {
    window.localStorage.setItem("datehaja-locale", "en-US");
  });

  await page.goto("/signup");
  await page.getByLabel("Email").fill(persona.email);
  const requestedAt = Date.now();
  await page
    .getByRole("button", {
      name: /Email me a sign-in code|Use development code/i,
    })
    .click();
  await expect(page.getByLabel("Verification code")).toBeVisible();
  const otp = await waitForAgentMailOtp(persona.email, requestedAt);
  await expect(page.getByLabel("Verification code")).toHaveValue(otp);
  await page.getByRole("button", { name: /Verify and continue/i }).click();

  await expect(page).toHaveURL(/\/legal\/accept/, { timeout: 20_000 });
  const consent = page.getByRole("checkbox");
  await expect(consent).toHaveCount(1);
  await consent.check();
  await page.getByRole("button", { name: "Agree and continue" }).click();

  await expect(page).toHaveURL(/\/onboarding/, { timeout: 20_000 });
  await page
    .getByRole("button", { name: `${persona.palette} palette` })
    .click();
  await page.getByLabel("Name your Dating Agent").fill(persona.agentName);
  await page
    .getByRole("button", {
      name: new RegExp(`Tell ${persona.agentName} who to find`, "i"),
    })
    .click();

  await page
    .getByRole("button", { name: persona.interestedIn, exact: true })
    .click();
  await page
    .getByLabel("What kind of person should it come home excited about?")
    .fill(persona.desiredConnection);
  for (const trait of ["Thoughtful", "Curious"]) {
    await page.getByRole("button", { name: trait, exact: true }).click();
  }
  await page.getByRole("button", { name: /Now tell it about me/i }).click();

  await page.getByLabel("What should we call you?").fill(persona.ownerName);
  await page.getByLabel("Date of birth").fill(persona.dateOfBirth);
  await page.getByRole("button", { name: persona.gender, exact: true }).click();
  await page.getByLabel("Country").selectOption("SE");
  await expect(page.getByLabel("Service city")).toHaveValue("stockholm");
  for (const interest of ["Films", "Coffee", "Art galleries"]) {
    await page.getByRole("button", { name: interest, exact: true }).click();
  }
  for (const trait of ["Thoughtful", "Curious"]) {
    await page.getByRole("button", { name: trait, exact: true }).click();
  }
  await page
    .getByLabel(`Tell ${persona.agentName} the version close friends know`)
    .fill(persona.essence);
  await page.getByRole("button", { name: /Seal the brief/i }).click();

  await expect(page).toHaveURL(/\/membership/, { timeout: 20_000 });
  await expect(page.getByText("DEMO ACTIVE")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: /Send my Dating Agent scouting/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
  await expect(page.getByRole("button", { name: "Pause search", exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: persona.agentName, exact: true }),
  ).toBeVisible();

  await page.goto("/settings");
  const mailSwitch = page.getByRole("switch", { name: /Email me at all/i });
  await expect(mailSwitch).toHaveAttribute("aria-checked", "true");
  await mailSwitch.click();
  await expect(mailSwitch).toHaveAttribute("aria-checked", "false");
  await page.goto("/dashboard");
}

test.skip(
  process.env.DATEHAJA_TWO_ACCOUNT_E2E !== "1",
  "Set DATEHAJA_TWO_ACCOUNT_E2E=1 to create two real accounts and connect them.",
);

test("two searching agents converse and connect only when the encounter earns a match", async ({
  browser,
  baseURL,
}, testInfo) => {
  test.setTimeout(360_000);
  const suffix = Date.now();
  const first: Persona = {
    email:
      process.env.DATEHAJA_E2E_EMAIL_A ?? `hyo+test-pair-a-${suffix}@hyo.dev`,
    ownerName: "Rowan",
    agentName: "Orbit",
    dateOfBirth: "1993-06-15",
    gender: "Man",
    interestedIn: "Woman",
    palette: "rose",
    desiredConnection:
      "Someone thoughtful and curious who enjoys a simple film, coffee, and an honest conversation.",
    essence:
      "I can seem reserved at first, but close friends know I am warm, dependable, and curious about how people see the world.",
  };
  const second: Persona = {
    email:
      process.env.DATEHAJA_E2E_EMAIL_B ?? `hyo+test-pair-b-${suffix}@hyo.dev`,
    ownerName: "Mira",
    agentName: "Luma",
    dateOfBirth: "1994-09-20",
    gender: "Woman",
    interestedIn: "Man",
    palette: "violet",
    desiredConnection:
      "Someone thoughtful and curious who can enjoy a film, coffee, and comfortable silence without performing.",
    essence:
      "I am playful once I feel safe, need quiet after crowded places, and appreciate people who are candid without being harsh.",
  };

  // Earlier runs leave accounts behind that are identical to the pair about to
  // be created — same city, interests and traits — and the matcher reads a
  // bounded page of active profiles per city and scores identical profiles
  // identically, breaking ties toward the oldest. Without this the new first
  // account dates a previous run's second account, and this run's second
  // account is left looking at a date it is not in.
  execFileSync(
    "npx",
    [
      "convex",
      "run",
      "testSupport:retirePriorTestAccounts",
      JSON.stringify({ keepEmails: [first.email, second.email] }),
    ],
    { stdio: "inherit" },
  );

  const contextOptions = {
    baseURL: baseURL ?? "http://127.0.0.1:4173",
    timezoneId: "Europe/Stockholm",
  };
  const firstContext = await browser.newContext(contextOptions);
  const secondContext = await browser.newContext(contextOptions);
  const firstPage = await firstContext.newPage();
  const secondPage = await secondContext.newPage();

  try {
    await createAccountAndAgent(firstPage, first);
    await createAccountAndAgent(secondPage, second);

    await firstPage.goto("/dashboard");
    await firstPage.getByRole("button", { name: /Watch the date live/i }).click({ timeout: 30_000 });
    await expect(firstPage).toHaveURL(/\/agent-date\//, { timeout: 20_000 });
    const datePath = new URL(firstPage.url()).pathname;
    await secondPage.goto(datePath);

    // Confirm the two accounts were paired with each other before waiting on a
    // debrief. Each side reads its own Agent first, so the heading is mirrored.
    for (const [page, mine, theirs] of [
      [firstPage, first.agentName, second.agentName],
      [secondPage, second.agentName, first.agentName],
    ] as const) {
      await expect(
        page.getByRole("heading", { name: `${mine} × ${theirs}` }),
      ).toBeVisible({ timeout: 20_000 });
    }

    for (const page of [firstPage, secondPage]) {
      // Not the live "6/6 turns" counter: the page swaps to the debrief as the
      // sixth turn lands, so that frame may never be painted and waiting on it
      // fails a date that actually completed. The debrief states the same count
      // and keeps stating it.
      await expect(page.getByText(/Primary signal|Why I passed/i)).toBeVisible({ timeout: 180_000 });
      await expect(
        page.locator(".date-record-transcript header span"),
      ).toHaveText(/^(?:[2-9]|[1-9]\d+) saved lines$/);
      await expect(page.getByText(/clearly-labelled demo date/i)).toHaveCount(
        0,
      );
    }

    await expect(firstPage.getByText(second.email)).toHaveCount(0);
    await expect(secondPage.getByText(first.email)).toHaveCount(0);
    if (!await firstPage.getByRole("button", { name: /Introduce us/i }).isVisible()) {
      for (const page of [firstPage, secondPage]) {
        await expect(page.getByText("A conversation, not a match.")).toBeVisible();
        await page.goto("/dashboard");
        await expect(page.getByText("Conversations completed: 1")).toBeVisible();
        await expect(page.getByRole("button", { name: "Pause search", exact: true })).toBeVisible();
      }
      await testInfo.attach("honest-outcome", { body: "The model did not recommend a mutual introduction. Both searches continued; no contact was revealed.", contentType: "text/plain" });
      return;
    }
    await firstPage.getByRole("button", { name: /Introduce us/i }).click();
    await expect(firstPage.getByText("Your answer is sealed")).toBeVisible();
    await expect(
      secondPage.getByRole("button", { name: /Introduce us/i }),
    ).toBeVisible();
    await expect(secondPage.getByText(/Two humans said yes/i)).toHaveCount(0);
    await expect(secondPage.getByText(first.email)).toHaveCount(0);

    await testInfo.attach("first-consent-stays-private", {
      body: await firstPage.screenshot({ fullPage: true }),
      contentType: "image/png",
    });

    await secondPage.getByRole("button", { name: /Introduce us/i }).click();
    await expect(firstPage.getByText(/Two humans said yes/i)).toBeVisible({
      timeout: 20_000,
    });
    await expect(secondPage.getByText(/Two humans said yes/i)).toBeVisible({
      timeout: 20_000,
    });
    await expect(firstPage.getByText(second.email)).toBeVisible();
    await expect(secondPage.getByText(first.email)).toBeVisible();

    await testInfo.attach("mutual-consent-reveals-contact", {
      body: await firstPage.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  } finally {
    for (const [page, persona] of [[firstPage, first], [secondPage, second]] as const) {
      await page.goto("/dashboard").catch(() => {});
      await page.getByRole("heading", { name: persona.agentName, exact: true }).waitFor({ timeout: 10_000 }).catch(() => {});
      const pause = page.getByRole("button", { name: "Pause search", exact: true });
      if (await pause.isVisible().catch(() => false)) await pause.click().catch(() => {});
    }
    await firstContext.close();
    await secondContext.close();
  }
});
