/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { DAY_MS } from "./lib/time";
import { pickCounterpart } from "./lib/participants";

/**
 * Regression suite for the replacement flow.
 *
 * A drop keeps every participant row it ever had, so after a replacement the
 * OLDEST non-self row is the person who declined. Picking "the other person" by
 * insertion order silently targeted them — which leaked their profile into the
 * replacement's invitation, blocked the wrong account, filed reports against an
 * uninvolved user, and let someone who had already passed cancel a confirmed
 * date between two other people. Every one of those has a test here.
 */

const modules = import.meta.glob("./**/*.ts");

const NOW = Date.now();
const DATE_START = NOW + 3 * DAY_MS;

async function seedThreeWay(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    async function makeUser(name: string, gender: "woman" | "man") {
      const userId = await ctx.db.insert("users", {
        name,
        email: `${name.toLowerCase()}@test.invalid`,
      });
      await ctx.db.insert("profiles", {
        userId,
        displayName: name,
        dobMs: Date.UTC(1994, 5, 15, 12),
        ageYears: 32,
        ageConfirmed18: true,
        gender,
        interestedIn: gender === "woman" ? ["man"] : ["woman"],
        countryCode: "KR",
        city: "Seoul",
        neighborhood: "Seongsu",
        approxLat: 37.54,
        approxLng: 127.06,
        timezone: "Asia/Seoul",
        bio: "",
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
      await ctx.db.insert("preferences", {
        userId,
        ageMin: 20,
        ageMax: 50,
        ageHard: true,
        maxDistanceKm: 30,
        distanceHard: true,
        relationshipIntent: "open",
        intentHard: false,
        smoking: "no_preference",
        smokingHard: false,
        alcohol: "no_preference",
        alcoholHard: false,
        preferredDateTypes: ["coffee"],
        budgetMinPerPerson: 10000,
        budgetMaxPerPerson: 90000,
        currency: "KRW",
        budgetHard: false,
        dayPreference: "either",
        indoorOutdoor: "either",
        atmosphere: "either",
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
      const availabilityId = await ctx.db.insert("availability", {
        userId,
        startMs: DATE_START - 3600_000,
        endMs: DATE_START + 4 * 3600_000,
        timezone: "Asia/Seoul",
        status: "open",
      });
      return { userId, availabilityId };
    }

    const alice = await makeUser("Alice", "woman"); // initiator, accepts
    const bob = await makeUser("Bob", "man"); // first invitee, passes
    const carl = await makeUser("Carl", "man"); // replacement, accepts

    const dropId = await ctx.db.insert("dateDrops", {
      status: "inviting",
      initiatorUserId: alice.userId,
      countryCode: "KR",
      city: "Seoul",
      area: "Seongsu",
      approxLat: 37.54,
      approxLng: 127.06,
      timezone: "Asia/Seoul",
      startMs: DATE_START,
      endMs: DATE_START + 2 * 3600_000,
      title: "Coffee",
      theme: "Coffee",
      summary: "",
      whyItFits: "",
      itinerary: [],
      estimatedDurationMin: 90,
      estimatedCostPerPerson: 20000,
      currency: "KRW",
      meetingInstructions: "",
      confirmDeadlineMs: DATE_START - DAY_MS,
      candidateAttempts: 1,
      maxCandidateAttempts: 4,
      isDemo: false,
      updatedAt: NOW,
    });

    // Insertion order matters: initiator first, then the invitee who will pass.
    for (const [person, role] of [
      [alice, "initiator"],
      [bob, "invitee"],
    ] as const) {
      await ctx.db.insert("dateDropParticipants", {
        dropId,
        userId: person.userId,
        role,
        state: "invited",
        privateWhyItFits: "",
        compatibilityBlurb: "",
        availabilityId: person.availabilityId,
        invitedAt: NOW,
      });
      await ctx.db.patch("availability", person.availabilityId, {
        status: "held",
        heldByDropId: dropId,
      });
    }

    return { alice, bob, carl, dropId };
  });
}

function asUser(t: ReturnType<typeof convexTest>, userId: Id<"users">) {
  return t.withIdentity({ subject: userId, tokenIdentifier: `test|${userId}` });
}

/** Alice accepts, Bob passes, Carl is added as the replacement. */
async function toReplacementState(
  t: ReturnType<typeof convexTest>,
  s: Awaited<ReturnType<typeof seedThreeWay>>,
) {
  await asUser(t, s.alice.userId).mutation(api.dateDrops.accept, { dropId: s.dropId });
  await asUser(t, s.bob.userId).mutation(api.dateDrops.pass, { dropId: s.dropId });

  const runId = await t.run(async (ctx) =>
    ctx.db.insert("matchingRuns", {
      initiatorUserId: s.alice.userId,
      dropId: s.dropId,
      intent: "seeking_second",
      stage: "inviting",
      status: "running",
      poolSize: 1,
      hardPassCount: 1,
      scoredCount: 1,
      aiRankedCount: 0,
      startedAt: NOW,
    }),
  );
  const scoreId = await t.run(async (ctx) =>
    ctx.db.insert("candidateScores", {
      runId,
      userAId: s.alice.userId,
      userBId: s.carl.userId,
      deterministicScore: 70,
      signals: {
        sharedInterests: ["Films"],
        sharedLanguages: ["English"],
        distanceKm: 0,
        overlapMinutes: 240,
        overlapStartMs: DATE_START,
        overlapEndMs: DATE_START + 4 * 3600_000,
        budgetOverlap: true,
        budgetLowPerPerson: 10000,
        budgetHighPerPerson: 90000,
        sharedDateTypes: ["coffee"],
        styleMatch: 1,
        lifestyleMatch: 1,
      },
      stage: "scored",
    }),
  );

  const added = await t.mutation(internal.matching.addReplacementParticipant, {
    dropId: s.dropId,
    matchingRunId: runId,
    userId: s.carl.userId,
    candidateScoreId: scoreId,
    privateWhyItFits: "You both like films.",
    compatibilityBlurb: "You both like films.",
    availabilityId: s.carl.availabilityId,
  });
  expect(added).toBe(true);
  return { runId, scoreId };
}

/* -------------------------------------------------------------------------- */

describe("picking the other participant", () => {
  test("prefers the most committed, not the oldest row", () => {
    const rows = [
      { userId: "alice", state: "accepted" as const },
      { userId: "bob", state: "passed" as const },
      { userId: "carl", state: "confirmed" as const },
    ];
    expect(pickCounterpart(rows, "alice")?.userId).toBe("carl");
    expect(pickCounterpart(rows, "carl")?.userId).toBe("alice");
  });

  test("falls back to a departed row when nobody else is left", () => {
    const rows = [
      { userId: "alice", state: "accepted" as const },
      { userId: "bob", state: "passed" as const },
    ];
    expect(pickCounterpart(rows, "alice")?.userId).toBe("bob");
  });

  test("returns null when there is no other participant", () => {
    expect(pickCounterpart([{ userId: "alice", state: "accepted" as const }], "alice")).toBeNull();
  });
});

describe("a participant who passed", () => {
  test("cannot cancel a confirmed date between the other two", async () => {
    const t = convexTest(schema, modules);
    const s = await seedThreeWay(t);
    await toReplacementState(t, s);
    await asUser(t, s.carl.userId).mutation(api.dateDrops.accept, { dropId: s.dropId });

    const before = await t.run((ctx) => ctx.db.get("dateDrops", s.dropId));
    expect(before?.status).toBe("confirmed");

    await expect(
      asUser(t, s.bob.userId).mutation(api.dateDrops.cancel, { dropId: s.dropId }),
    ).rejects.toThrow(/not on this date plan/i);

    const after = await t.run((ctx) => ctx.db.get("dateDrops", s.dropId));
    expect(after?.status).toBe("confirmed");
  });

  test("cannot confirm attendance on it", async () => {
    const t = convexTest(schema, modules);
    const s = await seedThreeWay(t);
    await toReplacementState(t, s);
    await asUser(t, s.carl.userId).mutation(api.dateDrops.accept, { dropId: s.dropId });

    await expect(
      asUser(t, s.bob.userId).mutation(api.dateDrops.confirmAttendance, {
        dropId: s.dropId,
      }),
    ).rejects.toThrow(/not on this date plan/i);
  });

  test("never receives the replacement's photo", async () => {
    const t = convexTest(schema, modules);
    const s = await seedThreeWay(t);
    await toReplacementState(t, s);

    const storageId = await t.run((ctx) =>
      ctx.storage.store(new Blob(["x"], { type: "image/png" })),
    );
    await t.run(async (ctx) => {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", s.carl.userId))
        .unique();
      await ctx.db.patch("profiles", profile!._id, { photoStorageId: storageId });
    });

    await asUser(t, s.carl.userId).mutation(api.dateDrops.accept, { dropId: s.dropId });

    const bobsView = await asUser(t, s.bob.userId).query(api.dateDrops.get, {
      dropId: s.dropId,
    });
    expect(bobsView?.matchPhotoUrl).toBeNull();

    // ...while the people actually on the date do get it.
    const alicesView = await asUser(t, s.alice.userId).query(api.dateDrops.get, {
      dropId: s.dropId,
    });
    expect(alicesView?.matchPhotoUrl).toBeTypeOf("string");
  });

  test("cannot read the confirmed pair's logistics notes", async () => {
    const t = convexTest(schema, modules);
    const s = await seedThreeWay(t);
    await toReplacementState(t, s);
    await asUser(t, s.carl.userId).mutation(api.dateDrops.accept, { dropId: s.dropId });

    await asUser(t, s.alice.userId).mutation(api.messages.send, {
      dropId: s.dropId,
      presetKey: "im_here",
    });

    expect(
      await asUser(t, s.bob.userId).query(api.messages.list, { dropId: s.dropId }),
    ).toEqual([]);
    expect(
      await asUser(t, s.carl.userId).query(api.messages.list, { dropId: s.dropId }),
    ).toHaveLength(1);
  });

  test("sees the drop in history, never as an upcoming date", async () => {
    const t = convexTest(schema, modules);
    const s = await seedThreeWay(t);
    await toReplacementState(t, s);
    await asUser(t, s.carl.userId).mutation(api.dateDrops.accept, { dropId: s.dropId });

    const board = (await asUser(t, s.bob.userId).query(api.dateDrops.dashboard, {})) as {
      upcoming: unknown[];
      waiting: unknown[];
      history: Array<{ myState: string }>;
    };
    expect(board.upcoming).toHaveLength(0);
    expect(board.waiting).toHaveLength(0);
    expect(board.history).toHaveLength(1);
    expect(board.history[0].myState).toBe("passed");
  });
});

describe("safety actions target the right person", () => {
  test("blocking blocks the replacement, not the person who passed", async () => {
    const t = convexTest(schema, modules);
    const s = await seedThreeWay(t);
    await toReplacementState(t, s);
    await asUser(t, s.carl.userId).mutation(api.dateDrops.accept, { dropId: s.dropId });

    await asUser(t, s.alice.userId).mutation(api.safety.blockFromDrop, {
      dropId: s.dropId,
    });

    const blocks = await t.run((ctx) => ctx.db.query("blocks").collect());
    expect(blocks).toHaveLength(1);
    expect(blocks[0].blockedUserId).toBe(s.carl.userId);
    expect(blocks[0].blockedUserId).not.toBe(s.bob.userId);
  });

  test("reporting files against the replacement, not the person who passed", async () => {
    const t = convexTest(schema, modules);
    const s = await seedThreeWay(t);
    await toReplacementState(t, s);
    await asUser(t, s.carl.userId).mutation(api.dateDrops.accept, { dropId: s.dropId });

    await asUser(t, s.alice.userId).mutation(api.safety.report, {
      dropId: s.dropId,
      category: "harassment",
      details: "Made me uncomfortable.",
      alsoBlock: false,
    });

    const reports = await t.run((ctx) => ctx.db.query("reports").collect());
    expect(reports).toHaveLength(1);
    expect(reports[0].reportedUserId).toBe(s.carl.userId);

    // The uninvolved person must not have been auto-flagged.
    const bobProfile = await t.run((ctx) =>
      ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", s.bob.userId))
        .unique(),
    );
    expect(bobProfile?.moderationStatus).toBe("ok");
  });
});

describe("what the replacement is shown", () => {
  test("their date plan describes the person still on it", async () => {
    const t = convexTest(schema, modules);
    const s = await seedThreeWay(t);
    await toReplacementState(t, s);

    const carlsView = await asUser(t, s.carl.userId).query(api.dateDrops.get, {
      dropId: s.dropId,
    });
    expect(carlsView?.match?.displayName).toBe("Alice");
    expect(JSON.stringify(carlsView)).not.toContain("Bob");
  });
});

describe("replacement bookkeeping", () => {
  test("a window another drop already holds is never claimed", async () => {
    const t = convexTest(schema, modules);
    const s = await seedThreeWay(t);
    await asUser(t, s.alice.userId).mutation(api.dateDrops.accept, { dropId: s.dropId });
    await asUser(t, s.bob.userId).mutation(api.dateDrops.pass, { dropId: s.dropId });

    // Somebody else grabs Carl's evening first.
    await t.run((ctx) =>
      ctx.db.patch("availability", s.carl.availabilityId, { status: "held" }),
    );

    const runId = await t.run((ctx) =>
      ctx.db.insert("matchingRuns", {
        initiatorUserId: s.alice.userId,
        dropId: s.dropId,
        intent: "seeking_second",
        stage: "inviting",
        status: "running",
        poolSize: 1,
        hardPassCount: 1,
        scoredCount: 1,
        aiRankedCount: 0,
        startedAt: NOW,
      }),
    );
    const scoreId = await t.run((ctx) =>
      ctx.db.insert("candidateScores", {
        runId,
        userAId: s.alice.userId,
        userBId: s.carl.userId,
        deterministicScore: 70,
        signals: {
          sharedInterests: [],
          sharedLanguages: [],
          distanceKm: 0,
          overlapMinutes: 240,
          overlapStartMs: DATE_START,
          overlapEndMs: DATE_START,
          budgetOverlap: true,
          budgetLowPerPerson: 0,
          budgetHighPerPerson: 0,
          sharedDateTypes: [],
          styleMatch: 1,
          lifestyleMatch: 1,
        },
        stage: "scored",
      }),
    );

    const added = await t.mutation(internal.matching.addReplacementParticipant, {
      dropId: s.dropId,
      matchingRunId: runId,
      userId: s.carl.userId,
      candidateScoreId: scoreId,
      privateWhyItFits: "",
      compatibilityBlurb: "",
      availabilityId: s.carl.availabilityId,
    });

    expect(added).toBe(false);
    const participants = await t.run((ctx) =>
      ctx.db
        .query("dateDropParticipants")
        .withIndex("by_drop", (q) => q.eq("dropId", s.dropId))
        .collect(),
    );
    expect(participants.some((p) => p.userId === s.carl.userId)).toBe(false);
  });

  test("adding to a drop that already closed is refused", async () => {
    const t = convexTest(schema, modules);
    const s = await seedThreeWay(t);
    await asUser(t, s.alice.userId).mutation(api.dateDrops.accept, { dropId: s.dropId });
    await asUser(t, s.bob.userId).mutation(api.dateDrops.pass, { dropId: s.dropId });
    await asUser(t, s.alice.userId).mutation(api.dateDrops.cancel, {
      dropId: s.dropId,
      reason: "Changed my mind.",
    });

    const runId = await t.run((ctx) =>
      ctx.db.insert("matchingRuns", {
        initiatorUserId: s.alice.userId,
        dropId: s.dropId,
        intent: "seeking_second",
        stage: "inviting",
        status: "running",
        poolSize: 0,
        hardPassCount: 0,
        scoredCount: 0,
        aiRankedCount: 0,
        startedAt: NOW,
      }),
    );
    const scoreId = await t.run((ctx) =>
      ctx.db.insert("candidateScores", {
        runId,
        userAId: s.alice.userId,
        userBId: s.carl.userId,
        deterministicScore: 50,
        signals: {
          sharedInterests: [],
          sharedLanguages: [],
          distanceKm: 0,
          overlapMinutes: 0,
          overlapStartMs: 0,
          overlapEndMs: 0,
          budgetOverlap: true,
          budgetLowPerPerson: 0,
          budgetHighPerPerson: 0,
          sharedDateTypes: [],
          styleMatch: 0,
          lifestyleMatch: 0,
        },
        stage: "scored",
      }),
    );

    expect(
      await t.mutation(internal.matching.addReplacementParticipant, {
        dropId: s.dropId,
        matchingRunId: runId,
        userId: s.carl.userId,
        candidateScoreId: scoreId,
        privateWhyItFits: "",
        compatibilityBlurb: "",
        availabilityId: s.carl.availabilityId,
      }),
    ).toBe(false);
  });
});

describe("taking back a held evening", () => {
  test("stands the date plan down instead of orphaning it", async () => {
    const t = convexTest(schema, modules);
    const s = await seedThreeWay(t);
    await asUser(t, s.alice.userId).mutation(api.dateDrops.accept, { dropId: s.dropId });

    // Alice removes the very window her accepted drop is holding.
    await asUser(t, s.alice.userId).mutation(api.availability.remove, {
      availabilityId: s.alice.availabilityId,
    });

    await t.run(async (ctx) => {
      const window = await ctx.db.get("availability", s.alice.availabilityId);
      expect(window?.status).toBe("cancelled");
      expect(window?.heldByDropId).toBeUndefined();

      const participant = await ctx.db
        .query("dateDropParticipants")
        .withIndex("by_drop_and_user", (q) =>
          q.eq("dropId", s.dropId).eq("userId", s.alice.userId),
        )
        .unique();
      // She is off the drop, not silently still on it with no evening.
      expect(participant?.state).toBe("withdrawn");
    });
  });

  test("cancels a confirmed date rather than letting the other person turn up alone", async () => {
    const t = convexTest(schema, modules);
    const s = await seedThreeWay(t);
    await asUser(t, s.alice.userId).mutation(api.dateDrops.accept, { dropId: s.dropId });
    await asUser(t, s.bob.userId).mutation(api.dateDrops.accept, { dropId: s.dropId });

    await t.run((ctx) =>
      ctx.db.patch("availability", s.alice.availabilityId, { status: "held" }),
    );
    await asUser(t, s.alice.userId).mutation(api.availability.remove, {
      availabilityId: s.alice.availabilityId,
    });

    const drop = await t.run((ctx) => ctx.db.get("dateDrops", s.dropId));
    expect(drop?.status).toBe("cancelled");
  });
});
