/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
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
  test("pins the reviewed record even when a newer unfinished showcase appears", async () => {
    const t = convexTest(schema, modules);
    const { agentDateId } = await seedDate(t, { initiator: true, counterpart: true });
    await expect(t.mutation(internal.showcase.publish, { agentDateId })).rejects.toThrow("verified journal");
    await t.run(async ctx => {
      await ctx.db.patch("agentDates", agentDateId, {
        completedAt: NOW, plannedTurns: 6,
        activityJournal: { overview: "A recorded conversation.", events: [{ kind: "conversation", title: "A pause", detail: "They discussed silence.", sceneKind: "cinema", rounds: [1, 2] }] },
        initiatorReflection: { headline: "One conversation", anchorRound: 1, question: "How did that feel?" },
        counterpartReflection: { headline: "Still curious", anchorRound: 2, question: "What would you ask?" },
        setting: "The reviewed recording",
      });
    });
    await t.mutation(internal.showcase.publish, { agentDateId });
    for (let index = 0; index < 21; index++) await seedDate(t, { initiator: true, counterpart: true });
    const shown = await t.query(api.showcase.publicDate, {});
    expect(shown?.setting).toBe("The reviewed recording");
    // Pinning never upgrades a curious verdict into a recommendation.
    expect(shown?.counterpart.verdict).toBe("curious");
    await t.run(ctx => ctx.db.delete("agentDates", agentDateId));
    expect(await t.query(api.showcase.publicDate, {})).toBeNull();
  });

  test("rechecks fictional ownership even for an explicitly pinned date", async () => {
    const t = convexTest(schema, modules);
    const { agentDateId } = await seedDate(t, { initiator: true, counterpart: false });
    await expect(t.mutation(internal.showcase.publish, { agentDateId })).rejects.toThrow("fictional personas");
    await t.run(ctx => ctx.db.insert("showcasePublications", { slot: "main", agentDateId, publishedAt: NOW }));
    expect(await t.query(api.showcase.publicDate, {})).toBeNull();
    expect(await t.query(internal.showcase.preview, { agentDateId })).toBeNull();
  });

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

  test("names an unnamed Agent the way the transcript already did", async () => {
    const t = convexTest(schema, modules);
    await seedDate(t, { initiator: true, counterpart: true });
    // Both owners left their Agents unnamed, as a seeded persona normally does.
    await t.run(async (ctx) => {
      for await (const agent of ctx.db.query("agentProfiles")) {
        await ctx.db.delete("agentProfiles", agent._id);
      }
    });

    const shown = await t.query(api.showcase.publicDate, {});
    expect(shown).not.toBeNull();
    // "Agent" beside the character's own quoted words reads as a broken page.
    expect(shown?.initiator.agentName).not.toBe("Agent");
    expect(shown?.counterpart.agentName).not.toBe("Agent");
    expect(shown?.initiator.agentName).not.toBe(shown?.counterpart.agentName);
    // The face is derived too, so the character is not left blank.
    expect(shown?.initiator.avatar).not.toBeNull();
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

/** One seeded persona, optionally missing the matching boundaries a date needs. */
async function seedPersona(
  t: ReturnType<typeof convexTest>,
  name: string,
  options: { boundaries: boolean },
) {
  return await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {
      name,
      email: `${name.toLowerCase()}@demo.test.invalid`,
    });
    await ctx.db.insert("profiles", {
      userId,
      preferredLocale: "ko-KR",
      displayName: name,
      dobMs: NOW - 29 * 365.25 * 24 * 3600_000,
      ageYears: 29,
      ageConfirmed18: true,
      gender: "man",
      interestedIn: ["woman"],
      countryCode: "KR",
      city: "Seoul",
      neighborhood: "Seongsu",
      approxLat: 37.54,
      approxLng: 127.06,
      timezone: "Asia/Seoul",
      bio: "Runs in the mornings, watches films at night.",
      showOccupation: false,
      interests: ["Films"],
      hobbies: [],
      languages: ["Korean"],
      socialEnergy: "introvert",
      firstDateVibe: [],
      lifestyle: { smokes: false, drinks: "occasional" },
      onboardingStep: 7,
      onboardingComplete: true,
      status: "active",
      moderationStatus: "ok",
      isDemo: true,
      updatedAt: NOW,
    });
    await ctx.db.insert("preferences", {
      userId,
      // An older generation of seeded personas predates these three fields.
      ...(options.boundaries
        ? {
            matchLocationScope: "city" as const,
            preferredCountryCodes: ["KR"],
            preferredCities: ["Seoul"],
            allowTranslatedDates: false,
          }
        : {}),
      ageMin: 25,
      ageMax: 35,
      ageHard: true,
      maxDistanceKm: 15,
      distanceHard: true,
      relationshipIntent: "serious",
      intentHard: false,
      smoking: "no_preference",
      smokingHard: false,
      alcohol: "no_preference",
      alcoholHard: false,
      preferredDateTypes: ["coffee"],
      budgetMinPerPerson: 30000,
      budgetMaxPerPerson: 70000,
      currency: "KRW",
      budgetHard: false,
      dayPreference: "either",
      indoorOutdoor: "either",
      atmosphere: "quiet",
      dietary: [],
      accessibility: [],
      notifyEmail: false,
      notifyInvitations: false,
      notifyConfirmations: false,
      notifyReminders: false,
      dropsPaused: false,
      maxDropsPerWeek: 5,
      allowDemoMatches: true,
      updatedAt: NOW,
    });
    return userId;
  });
}

describe("showcase persona preparation", () => {
  test("never names an Agent after the person it represents", async () => {
    const t = convexTest(schema, modules);

    await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        name: "Alex",
        email: "alex@test.invalid",
      });
      await ctx.db.insert("profiles", {
        userId,
        preferredLocale: "ko-KR",
        displayName: "Alex",
        dobMs: NOW - 29 * 365.25 * 24 * 3600_000,
        ageYears: 29,
        ageConfirmed18: true,
        gender: "man",
        interestedIn: ["woman"],
        countryCode: "KR",
        city: "Seoul",
        neighborhood: "Seongsu",
        approxLat: 37.54,
        approxLng: 127.06,
        timezone: "Asia/Seoul",
        bio: "Runs in the mornings, watches films at night.",
        showOccupation: false,
        interests: ["Films"],
        hobbies: [],
        languages: ["Korean"],
        socialEnergy: "introvert",
        firstDateVibe: [],
        lifestyle: { smokes: false, drinks: "occasional" },
        onboardingStep: 7,
        onboardingComplete: true,
        status: "active",
        moderationStatus: "ok",
        isDemo: true,
        updatedAt: NOW,
      });
      await ctx.db.insert("preferences", {
        userId,
        matchLocationScope: "city",
        preferredCountryCodes: ["KR"],
        preferredCities: ["Seoul"],
        allowTranslatedDates: false,
        ageMin: 25,
        ageMax: 35,
        ageHard: true,
        maxDistanceKm: 15,
        distanceHard: true,
        relationshipIntent: "serious",
        intentHard: false,
        smoking: "no_preference",
        smokingHard: false,
        alcohol: "no_preference",
        alcoholHard: false,
        preferredDateTypes: ["coffee"],
        budgetMinPerPerson: 30000,
        budgetMaxPerPerson: 70000,
        currency: "KRW",
        budgetHard: false,
        dayPreference: "either",
        indoorOutdoor: "either",
        atmosphere: "quiet",
        dietary: [],
        accessibility: [],
        notifyEmail: false,
        notifyInvitations: false,
        notifyConfirmations: false,
        notifyReminders: false,
        dropsPaused: false,
        maxDropsPerWeek: 5,
        allowDemoMatches: true,
        updatedAt: NOW,
      });
    });

    const userId = await t.mutation(internal.showcase.preparePersona, {});
    expect(userId).not.toBeNull();

    const agentName = await t.run(async (ctx) => {
      const agent = await ctx.db
        .query("agentProfiles")
        .withIndex("by_user", (q) =>
          q.eq("userId", userId as Id<"users">),
        )
        .unique();
      return agent?.name ?? null;
    });

    // "I'm Alex, and my friend Alex runs in the mornings" is unreadable.
    expect(agentName).not.toBeNull();
    expect(agentName?.toLowerCase()).not.toBe("alex");
  });

  test("looks past the obsolete personas seeded before matching boundaries", async () => {
    const t = convexTest(schema, modules);
    // Production carries a generation of personas from an earlier product that
    // never got these fields. They sort first, and reading only a fixed first
    // page declared the entire cast unusable on their strength alone — so there
    // have to be more of them here than that page ever held.
    for (let index = 0; index < 25; index += 1) {
      await seedPersona(t, `Ghost${index}`, { boundaries: false });
    }
    const usable = await seedPersona(t, "Ready", { boundaries: true });

    expect(await t.mutation(internal.showcase.preparePersona, {})).toBe(usable);
  });

  test("gives the Agent a face that matches its person", async () => {
    const t = convexTest(schema, modules);
    const userId = await seedPersona(t, "Ready", { boundaries: true });
    await t.mutation(internal.showcase.preparePersona, {});

    const agent = await t.run((ctx) =>
      ctx.db
        .query("agentProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
    );
    // seedPersona writes gender "man"; the painted set calls that base "male".
    expect(agent?.avatar?.gender).toBe("male");
  });

  test("returns null only when no persona can start a date", async () => {
    const t = convexTest(schema, modules);
    await seedPersona(t, "Ghost1", { boundaries: false });

    expect(await t.mutation(internal.showcase.preparePersona, {})).toBeNull();
  });

  test("reuses a persona that already has an Agent", async () => {
    const t = convexTest(schema, modules);
    const first = await seedPersona(t, "Ready", { boundaries: true });
    await seedPersona(t, "Spare", { boundaries: true });

    const chosen = await t.mutation(internal.showcase.preparePersona, {});
    expect(chosen).toBe(first);
    // A second call must not mint a second Agent for a different persona.
    expect(await t.mutation(internal.showcase.preparePersona, {})).toBe(first);
    const agents = await t.run((ctx) => ctx.db.query("agentProfiles").collect());
    expect(agents).toHaveLength(1);
  });
});
