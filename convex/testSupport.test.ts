/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
type TestConvex = ReturnType<typeof convexTest>;
const NOW = Date.now();

async function account(
  t: TestConvex,
  email: string,
  city = "Stockholm",
) {
  return await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", { name: email, email });
    const profileId = await ctx.db.insert("profiles", {
      userId,
      displayName: "Tester",
      dobMs: NOW - 30 * 365.25 * 24 * 3_600_000,
      ageYears: 30,
      ageConfirmed18: true,
      gender: "woman",
      interestedIn: ["man"],
      countryCode: "SE",
      city,
      neighborhood: "Södermalm",
      approxLat: 59.31,
      approxLng: 18.07,
      timezone: "Europe/Stockholm",
      bio: "Seeded by a test.",
      showOccupation: false,
      interests: ["Films"],
      hobbies: [],
      languages: ["English"],
      socialEnergy: "ambivert",
      firstDateVibe: [],
      lifestyle: { smokes: false, drinks: "occasional" },
      onboardingStep: 7,
      onboardingComplete: true,
      status: "active",
      moderationStatus: "ok",
      isDemo: false,
      updatedAt: NOW,
    });
    return profileId;
  });
}

async function statusOf(t: TestConvex, profileId: Id<"profiles">) {
  return await t.run(async (ctx) => {
    const profile = await ctx.db.get("profiles", profileId);
    return profile?.status ?? null;
  });
}

describe("retiring prior end-to-end accounts", () => {
  const previous = process.env.ENVIRONMENT;
  beforeEach(() => {
    process.env.ENVIRONMENT = "development";
  });
  afterEach(() => {
    if (previous === undefined) delete process.env.ENVIRONMENT;
    else process.env.ENVIRONMENT = previous;
  });

  test("pauses earlier runs and keeps the current pair", async () => {
    const t = convexTest(schema, modules);
    const oldA = await account(t, "hyo+test-pair-a-111@hyo.dev");
    const oldB = await account(t, "hyo+test-pair-b-111@hyo.dev");
    const newA = await account(t, "hyo+test-pair-a-222@hyo.dev");
    const newB = await account(t, "hyo+test-pair-b-222@hyo.dev");

    const result = await t.mutation(internal.testSupport.retirePriorTestAccounts, {
      keepEmails: ["hyo+test-pair-a-222@hyo.dev", "hyo+test-pair-b-222@hyo.dev"],
    });

    expect(result.retired).toBe(2);
    expect(await statusOf(t, oldA)).toBe("paused");
    expect(await statusOf(t, oldB)).toBe("paused");
    expect(await statusOf(t, newA)).toBe("active");
    expect(await statusOf(t, newB)).toBe("active");
  });

  test("never touches an address that is not a test alias", async () => {
    const t = convexTest(schema, modules);
    // The developer's own account is a configured development sign-in, and is
    // exactly the row this must not pause.
    const mine = await account(t, "hyo@hyo.dev");
    const stranger = await account(t, "someone@example.com");
    const leftover = await account(t, "hyo+test-pair-a-111@hyo.dev");

    const result = await t.mutation(internal.testSupport.retirePriorTestAccounts, {
      keepEmails: [],
    });

    expect(result.retired).toBe(1);
    expect(await statusOf(t, mine)).toBe("active");
    expect(await statusOf(t, stranger)).toBe("active");
    expect(await statusOf(t, leftover)).toBe("paused");
  });

  test("covers the address shapes older harnesses used", async () => {
    const t = convexTest(schema, modules);
    // A previous end-to-end harness signed up at the reserved .test domain,
    // which the current plus-tagged alias pattern does not match.
    const qa = await account(t, "datehaja.qa.1787938904341@example.test");
    const playwright = await account(t, "datehaja-playwright-1@example.test");
    const real = await account(t, "someone@example.com");

    expect(
      (
        await t.mutation(internal.testSupport.retirePriorTestAccounts, {
          keepEmails: [],
        })
      ).retired,
    ).toBe(2);
    expect(await statusOf(t, qa)).toBe("paused");
    expect(await statusOf(t, playwright)).toBe("paused");
    expect(await statusOf(t, real)).toBe("active");
  });

  test("finds them in every city, not just the first", async () => {
    const t = convexTest(schema, modules);
    await account(t, "hyo+test-a@hyo.dev", "Stockholm");
    await account(t, "hyo+test-b@hyo.dev", "Seoul");
    await account(t, "hyo+test-c@hyo.dev", "Tokyo");

    expect(
      (
        await t.mutation(internal.testSupport.retirePriorTestAccounts, {
          keepEmails: [],
        })
      ).retired,
    ).toBe(3);
  });

  test("refuses to run outside development", async () => {
    process.env.ENVIRONMENT = "production";
    const t = convexTest(schema, modules);
    const leftover = await account(t, "hyo+test-pair-a-111@hyo.dev");

    await expect(
      t.mutation(internal.testSupport.retirePriorTestAccounts, {
        keepEmails: [],
      }),
    ).rejects.toThrow(/development-only/);
    expect(await statusOf(t, leftover)).toBe("active");
  });
});
