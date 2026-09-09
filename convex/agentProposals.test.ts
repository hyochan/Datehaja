/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const NOW = Date.now();

function asUser(t: ReturnType<typeof convexTest>, userId: Id<"users">) {
  return t.withIdentity({ subject: userId, tokenIdentifier: `test|${userId}` });
}

async function owner(t: ReturnType<typeof convexTest>, name = "Mina") {
  return await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {
      name,
      email: `${name.toLowerCase()}@test.invalid`,
    });
    await ctx.db.insert("profiles", {
      userId,
      displayName: name,
      dobMs: NOW - 30 * 365.25 * 24 * 3_600_000,
      ageYears: 30,
      ageConfirmed18: true,
      gender: "woman",
      interestedIn: ["man"],
      countryCode: "KR",
      city: "Seoul",
      neighborhood: "Yeonnam",
      approxLat: 37.56,
      approxLng: 126.92,
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
      isDemo: false,
      updatedAt: NOW,
    });
    await ctx.db.insert("agentProfiles", {
      userId,
      name: "Sol",
      essence: "Quiet at first.",
      desiredConnection: "Someone curious.",
      boundaries: ["No pressure"],
      voice: "warm",
      autonomy: "suggest",
      privateMemory: "",
      status: "active",
      createdAt: NOW,
      updatedAt: NOW,
    });
    const preferencesId = await ctx.db.insert("preferences", {
      userId,
      matchLocationScope: "city",
      preferredCountryCodes: ["KR"],
      preferredCities: ["Seoul"],
      allowTranslatedDates: false,
      ageMin: 26,
      ageMax: 36,
      ageHard: true,
      maxDistanceKm: 20,
      distanceHard: true,
      relationshipIntent: "open",
      intentHard: false,
      preferredPersonalityTraits: ["Thoughtful", "Curious"],
      personalityPreference: "flexible",
      smoking: "no_preference",
      smokingHard: false,
      alcohol: "no_preference",
      alcoholHard: false,
      preferredDateTypes: ["coffee"],
      budgetMinPerPerson: 25000,
      budgetMaxPerPerson: 60000,
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
    return { userId, preferencesId };
  });
}

async function propose(
  t: ReturnType<typeof convexTest>,
  userId: Id<"users">,
  proposal: Record<string, unknown>,
) {
  await asUser(t, userId).mutation(api.agents.send, { content: "I want to correct what you look for." });
  const context = await t.query(internal.agents.replyContext, { userId });
  await t.mutation(internal.agents.storeReply, {
    userId,
    reply: "Got it.",
    memory: "",
    sourceMessageId: context.messages.findLast(m => m.role === "human")!._id,
    expectedContextKey: context.contextKey,
    proposal: {
      reason: "You said the quiet ones have not been landing.",
      preferredPersonalityTraits: [],
      ...proposal,
    },
  });
}

async function preferencesOf(
  t: ReturnType<typeof convexTest>,
  preferencesId: Id<"preferences">,
) {
  return await t.run((ctx) => ctx.db.get("preferences", preferencesId));
}

describe("what the Agent looks for", () => {
  test("does not ask about a setting that already says this", async () => {
    const t = convexTest(schema, modules);
    const { userId } = await owner(t);

    // Exactly the current values, in a different order.
    await propose(t, userId, {
      preferredPersonalityTraits: ["Curious", "Thoughtful"],
      personalityPreference: "flexible",
      relationshipIntent: "open",
    });

    expect(await asUser(t, userId).query(api.agents.pendingProposal, {})).toBeNull();
  });

  test("asks once, and keeps only the newest question open", async () => {
    const t = convexTest(schema, modules);
    const { userId } = await owner(t);

    await propose(t, userId, {
      preferredPersonalityTraits: ["Direct", "Warm"],
    });
    await propose(t, userId, { relationshipIntent: "serious" });

    const open = await t.run((ctx) =>
      ctx.db
        .query("agentProposals")
        .withIndex("by_user_and_status", (q) =>
          q.eq("userId", userId).eq("status", "pending"),
        )
        .collect(),
    );
    expect(open).toHaveLength(1);

    const shown = await asUser(t, userId).query(api.agents.pendingProposal, {});
    expect(shown?.relationshipIntent).toEqual({ from: "open", to: "serious" });
    // The owner sees what it would replace, not just what it wants.
    expect(shown?.traits).toBeNull();
    expect(shown?.agentName).toBe("Sol");
  });

  test("accepting is what moves the matcher", async () => {
    const t = convexTest(schema, modules);
    const { userId, preferencesId } = await owner(t);
    await propose(t, userId, {
      preferredPersonalityTraits: ["Direct", "Spontaneous"],
      personalityPreference: "important",
    });

    const shown = await asUser(t, userId).query(api.agents.pendingProposal, {});
    expect(shown?.traits).toEqual({
      from: ["Thoughtful", "Curious"],
      to: ["Direct", "Spontaneous"],
    });

    await asUser(t, userId).mutation(api.agents.respondToProposal, {
      proposalId: shown!._id,
      accept: true,
    });

    const preferences = await preferencesOf(t, preferencesId);
    expect(preferences?.preferredPersonalityTraits).toEqual([
      "Direct",
      "Spontaneous",
    ]);
    expect(preferences?.personalityPreference).toBe("important");
    // Untouched: intent was not part of this proposal.
    expect(preferences?.relationshipIntent).toBe("open");
    expect(await asUser(t, userId).query(api.agents.pendingProposal, {})).toBeNull();
  });

  test("declining leaves every setting where the owner put it", async () => {
    const t = convexTest(schema, modules);
    const { userId, preferencesId } = await owner(t);
    await propose(t, userId, { preferredPersonalityTraits: ["Bold"] });

    const shown = await asUser(t, userId).query(api.agents.pendingProposal, {});
    await asUser(t, userId).mutation(api.agents.respondToProposal, {
      proposalId: shown!._id,
      accept: false,
    });

    const preferences = await preferencesOf(t, preferencesId);
    expect(preferences?.preferredPersonalityTraits).toEqual([
      "Thoughtful",
      "Curious",
    ]);
    expect(await asUser(t, userId).query(api.agents.pendingProposal, {})).toBeNull();
  });

  test("never touches the boundaries the owner set", async () => {
    const t = convexTest(schema, modules);
    const { userId, preferencesId } = await owner(t);
    const before = await preferencesOf(t, preferencesId);
    await propose(t, userId, {
      preferredPersonalityTraits: ["Direct"],
      relationshipIntent: "casual",
    });
    const shown = await asUser(t, userId).query(api.agents.pendingProposal, {});
    await asUser(t, userId).mutation(api.agents.respondToProposal, {
      proposalId: shown!._id,
      accept: true,
    });

    const after = await preferencesOf(t, preferencesId);
    for (const field of [
      "ageMin",
      "ageMax",
      "maxDistanceKm",
      "preferredCities",
      "preferredCountryCodes",
      "allowTranslatedDates",
      "budgetMaxPerPerson",
      "smoking",
      "alcohol",
    ] as const) {
      expect(after?.[field]).toEqual(before?.[field]);
    }
  });

  test("cannot be answered by anyone else", async () => {
    const t = convexTest(schema, modules);
    const { userId: mine, preferencesId } = await owner(t, "Mina");
    const { userId: stranger } = await owner(t, "Noah");
    await propose(t, mine, { preferredPersonalityTraits: ["Direct"] });
    const shown = await asUser(t, mine).query(api.agents.pendingProposal, {});

    await expect(
      asUser(t, stranger).mutation(api.agents.respondToProposal, {
        proposalId: shown!._id,
        accept: true,
      }),
    ).rejects.toThrow(/not yours/);
    expect((await preferencesOf(t, preferencesId))?.preferredPersonalityTraits).toEqual([
      "Thoughtful",
      "Curious",
    ]);
  });
});
