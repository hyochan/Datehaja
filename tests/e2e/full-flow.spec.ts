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
  if (/^hyo\+test[\w.+-]*@hyo\.dev$/i.test(recipient)) return "68686868";

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

test.use({ timezoneId: "America/New_York" });

test("account to private agent debrief and human consent", async ({ page }) => {
  test.setTimeout(240_000);
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
  await expect(page.getByLabel("Verification code")).toHaveValue(otp);
  await page.getByRole("button", { name: /Verify and continue/i }).click();

  await expect(page).toHaveURL(/\/(legal\/accept|onboarding)/, {
    timeout: 20_000,
  });
  await page.waitForTimeout(1_200);
  if (page.url().includes("/legal/accept")) {
    await expect(page.getByText(/Required.*version 2026/i)).toBeVisible();
    const legalCheckboxes = page.getByRole("checkbox");
    await expect(legalCheckboxes).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      await legalCheckboxes.nth(index).check();
    }
    for (let index = 0; index < 3; index += 1) {
      await expect(legalCheckboxes.nth(index)).toBeChecked();
    }
    const continueButton = page.getByRole("button", {
      name: "Agree and continue",
    });
    await expect(continueButton).toBeEnabled();
    await continueButton.click();
  }

  await expect(page).toHaveURL(/\/onboarding/);
  await expect(
    page.getByRole("heading", { name: /Meet your Agent/i }),
  ).toBeVisible();
  await page.getByLabel("Name your Agent").fill("Juno");
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
      name: /What should your agent know about you/i,
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
  await expect(page.getByText("Ready to create your Agent")).toBeVisible();
  await expect(finishOnboarding).toBeEnabled();
  await finishOnboarding.click();

  await expect(page).toHaveURL(/\/membership/, { timeout: 20_000 });
  await expect(page.getByText("Your brief is complete")).toBeVisible();
  await expect(page.getByText("DEMO ACTIVE")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: /Send my Agent scouting/i }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
  await expect(
    page.getByRole("heading", { name: "Juno", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: /Juno's private room/i }),
  ).toBeVisible();
  await expect(page.getByText("What Juno remembers")).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Juno, your dating agent" }),
  ).toBeVisible();

  await page
    .getByLabel("Message Juno")
    .fill(
      "People often mistake my quietness for disinterest. Please remember that.",
    );
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText(/Juno is thinking, not typing/i)).toBeVisible();
  await expect(
    page
      .locator(".agent-bubble")
      .filter({ hasNotText: /I'm Juno/ })
      .last(),
  ).toBeVisible({ timeout: 60_000 });

  await page.getByRole("button", { name: /Send Juno scouting/i }).click();
  await expect(page).toHaveURL(/\/agent-date\//, { timeout: 20_000 });
  await expect(
    page.getByText(/explicitly AI.*private simulation/i),
  ).toBeVisible();
  await expect(page.getByText(/live transcript.*6\/6 turns/i)).toBeVisible({
    timeout: 180_000,
  });
  await expect(
    page.getByRole("button", { name: /replay the date/i }),
  ).toBeVisible();
  await expect(page.getByLabel(/Date replay moments/i)).toBeVisible();
  await expect(page.getByLabel(/Agent scouting journey/i)).toBeVisible();
  await expect(page.getByText("Why their paths crossed")).toBeVisible();
  await expect(page.getByText(/No secret compatibility score/i)).toBeVisible();
  await expect(
    page.getByRole("region", { name: /Juno and .* in/i }),
  ).toBeVisible();
  await expect(page.getByText("Your private debrief")).toBeVisible();
  await expect(page.getByText(/Primary signal|Why I passed/i)).toBeVisible({
    timeout: 120_000,
  });
  await expect(page.getByRole("button", { name: /Introduce us/i })).toBeVisible(
    { timeout: 120_000 },
  );
  await expect(page.getByText(/not a compatibility score/i)).toBeVisible();

  await page.getByRole("button", { name: /Introduce us/i }).click();
  await expect(page.getByText(/Two humans said yes/i)).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByText(/no real contact exists/i)).toBeVisible();
});
