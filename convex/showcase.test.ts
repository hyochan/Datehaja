/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const NOW = Date.now();

/** Build one finished date and say whether each side is a seeded persona. */
async function seedDate(
  t: ReturnType<typeof convexTest>,
  demo: { initiator: boolean; counterpart: boolean },
) {
  return await t.run(async (ctx) => {
    async function person(name: string, isDemo: boolean) {
      const userId = await ctx.db.insert("users", {
        name,
        email: `${name}@test.invalid`,
      });
      await ctx.db.insert("profiles", {
        userId,
        preferredLocale: "en-US",
        displayName: name,
        dobMs: NOW - 30 * 365.25 * 24 * 3600_000,
        ageYears: 30,
        ageConfirmed18: true,
        gender: "woman",
        interestedIn: ["man"],
        countryCode: "KR",
        city: "Seoul",
        neighborhood: "Seongsu",
        approxLat: 37.54,
        approxLng: 127.06,
        timezone: "Asia/Seoul",
        bio: "Likes unhurried conversation.",
        showOccupation: false,
        interests: ["Films"],
        hobbies: [],
        languages: ["Korean"],
        socialEnergy: "ambivert",
        firstDateVibe: [],
        lifestyle: { smokes: false, drinks: "occasional" },
        onboardingStep: 7,
        onboardingComplete: true,
        status: "active",
        moderationStatus: "ok",
        isDemo,
        updatedAt: NOW,
      });
      await ctx.db.insert("agentProfiles", {
        userId,
        name: `${name}-agent`,
        essence: "Warm and direct.",
        desiredConnection: "Someone curious.",
        boundaries: ["Privacy first"],
        voice: "warm",
        autonomy: "suggest",
        privateMemory: "",
        status: "active",
        createdAt: NOW,
        updatedAt: NOW,
      });
      return userId;
    }

    const initiator = await person("Ada", demo.initiator);
    const counterpart = await person("Ben", demo.counterpart);
    const agentDateId = await ctx.db.insert("agentDates", {
      initiatorUserId: initiator,
      counterpartUserId: counterpart,
      status: "debrief_ready",
      setting: "A quiet virtual cinema",
      compatibilityScore: 80,
      summary: "Calm, specific curiosity.",
      sparks: ["Silence felt safe"],
      frictions: ["Different pace"],
      initiatorVerdict: "encourage",
      counterpartVerdict: "curious",
      initiatorReason: "I would recommend one real conversation.",
      counterpartReason: "Enough here to stay curious.",
      initiatorConsent: "pending",
      counterpartConsent: "pending",
      isDemoCounterpart: demo.counterpart,
      createdAt: NOW,
      updatedAt: NOW,
    });
    for (let round = 1; round <= 6; round += 1) {
      await ctx.db.insert("agentDateTurns", {
        agentDateId,
        round,
        speakerUserId: round % 2 === 1 ? initiator : counterpart,
        speakerAgentName: round % 2 === 1 ? "Ada-agent" : "Ben-agent",
        content: `Turn ${round} in the open.`,
        subtext: `Private reasoning for turn ${round}.`,
        createdAt: NOW + round,
      });
    }
    return { agentDateId } as { agentDateId: Id<"agentDates"> };
  });
}

describe("public showcase date", () => {
  test("serves a date only when both sides are seeded personas", async () => {
    const t = convexTest(schema, modules);
    await seedDate(t, { initiator: true, counterpart: true });

    const shown = await t.query(api.showcase.publicDate, {});
    expect(shown).not.toBeNull();
    expect(shown?.turns).toHaveLength(6);
    expect(shown?.initiator.agentName).toBe("Ada-agent");
    expect(shown?.counterpart.verdict).toBe("curious");
  });

  test("never exposes a date involving a real person", async () => {
    for (const demo of [
      { initiator: false, counterpart: false },
      { initiator: true, counterpart: false },
      { initiator: false, counterpart: true },
    ]) {
      const t = convexTest(schema, modules);
      await seedDate(t, demo);
      expect(await t.query(api.showcase.publicDate, {})).toBeNull();
    }
  });

  test("withholds the agents' private per-turn reasoning", async () => {
    const t = convexTest(schema, modules);
    await seedDate(t, { initiator: true, counterpart: true });

    const shown = await t.query(api.showcase.publicDate, {});
    expect(JSON.stringify(shown)).not.toContain("Private reasoning");
  });

  test("needs no signed-in identity", async () => {
    const t = convexTest(schema, modules);
    await seedDate(t, { initiator: true, counterpart: true });

    // No withIdentity: an anonymous visitor is the whole point of this route.
    expect(await t.query(api.showcase.publicDate, {})).not.toBeNull();
  });
});
