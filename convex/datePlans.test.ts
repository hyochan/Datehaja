/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { DAY_MS } from "./lib/time";

const modules = import.meta.glob("./**/*.ts");

const NOW = Date.now();
const DATE_START = NOW + 3 * DAY_MS;
const DATE_END = DATE_START + 2 * 3600_000;

type Ctx = Awaited<ReturnType<typeof setup>>;

/**
 * Build a confirmed-shaped world: two users, profiles, preferences, matching
 * availability, and a date plan in `inviting` with both of them invited.
 */
async function setup(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    async function makeUser(
      name: string,
      email: string,
      gender: "woman" | "man",
    ) {
      const userId = await ctx.db.insert("users", { name, email });
      await ctx.db.insert("profiles", {
        userId,
        displayName: name,
        dobMs: NOW - 29 * 365.25 * 24 * 3600_000,
        ageYears: 29,
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
        interests: ["Films", "Coffee", "Running"],
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
        ageMax: 45,
        ageHard: true,
        maxDistanceKm: 30,
        distanceHard: true,
        relationshipIntent: "open",
        intentHard: false,
        smoking: "no_preference",
        smokingHard: false,
        alcohol: "no_preference",
        alcoholHard: false,
        preferredDateTypes: ["coffee", "dinner"],
        budgetMinPerPerson: 20000,
        budgetMaxPerPerson: 70000,
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
        endMs: DATE_END + 3600_000,
        timezone: "Asia/Seoul",
        status: "held",
      });
      return { userId, availabilityId };
    }

    const alice = await makeUser("Alice", "alice@test.invalid", "woman");
    const bob = await makeUser("Bob", "bob@test.invalid", "man");
    const carol = await makeUser("Carol", "carol@test.invalid", "woman");

    const dropId = await ctx.db.insert("datePlans", {
      status: "inviting",
      initiatorUserId: alice.userId,
      countryCode: "KR",
      city: "Seoul",
      area: "Seongsu",
      approxLat: 37.54,
      approxLng: 127.06,
      timezone: "Asia/Seoul",
      startMs: DATE_START,
      endMs: DATE_END,
      title: "Dinner then dessert",
      theme: "Dinner → dessert",
      summary: "A test plan.",
      whyItFits: "You both like films.",
      itinerary: [
        {
          order: 0,
          venueName: "Test Trattoria",
          category: "restaurant",
          startOffsetMin: 0,
          durationMin: 90,
          address: "1 Test Road",
          note: "",
          mapsQuery: "Test Trattoria Seoul",
          confidence: "high" as const,
        },
      ],
      estimatedDurationMin: 120,
      estimatedCostPerPerson: 45000,
      currency: "KRW",
      meetingInstructions: "Meet inside.",
      confirmDeadlineMs: DATE_START - DAY_MS,
      candidateAttempts: 1,
      maxCandidateAttempts: 4,
      isDemo: false,
      updatedAt: NOW,
    });

    for (const [person, role] of [
      [alice, "initiator"],
      [bob, "invitee"],
    ] as const) {
      await ctx.db.insert("datePlanParticipants", {
        dropId,
        userId: person.userId,
        role,
        state: "invited",
        privateWhyItFits: "Because films.",
        compatibilityBlurb: "You both like films.",
        availabilityId: person.availabilityId,
        invitedAt: NOW,
      });
      await ctx.db.patch("availability", person.availabilityId, {
        heldByDropId: dropId,
      });
    }

    return { alice, bob, carol, dropId };
  });
}

function asUser(t: ReturnType<typeof convexTest>, userId: Id<"users">) {
  return t.withIdentity({ subject: userId, tokenIdentifier: `test|${userId}` });
}

/* -------------------------------------------------------------------------- */

describe("accepting a date plan", () => {
  test("one acceptance moves the drop to partially_accepted, not confirmed", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);

    const result = await asUser(t, s.alice.userId).mutation(
      api.datePlans.accept,
      {
        dropId: s.dropId,
      },
    );
    expect(result.confirmed).toBe(false);

    const drop = await t.run((ctx) => ctx.db.get("datePlans", s.dropId));
    expect(drop?.status).toBe("partially_accepted");
  });

  test("both acceptances confirm the drop and book both calendars", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);

    await asUser(t, s.alice.userId).mutation(api.datePlans.accept, {
      dropId: s.dropId,
    });
    const result = await asUser(t, s.bob.userId).mutation(
      api.datePlans.accept,
      {
        dropId: s.dropId,
      },
    );
    expect(result.confirmed).toBe(true);

    await t.run(async (ctx) => {
      const drop = await ctx.db.get("datePlans", s.dropId);
      expect(drop?.status).toBe("confirmed");
      expect(drop?.confirmedAt).toBeTypeOf("number");

      const participants = await ctx.db
        .query("datePlanParticipants")
        .withIndex("by_drop", (q) => q.eq("dropId", s.dropId))
        .collect();
      expect(participants.every((p) => p.state === "confirmed")).toBe(true);

      for (const person of [s.alice, s.bob]) {
        const window = await ctx.db.get("availability", person.availabilityId);
        expect(window?.status).toBe("booked");
      }
    });
  });

  test("accepting twice is idempotent", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);
    await asUser(t, s.alice.userId).mutation(api.datePlans.accept, {
      dropId: s.dropId,
    });
    const second = await asUser(t, s.alice.userId).mutation(
      api.datePlans.accept,
      {
        dropId: s.dropId,
      },
    );
    expect(second.confirmed).toBe(false);
  });

  test("a stranger cannot accept someone else's date plan", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);
    await expect(
      asUser(t, s.carol.userId).mutation(api.datePlans.accept, {
        dropId: s.dropId,
      }),
    ).rejects.toThrow(/isn't yours/);
  });

  test("a signed-out caller cannot accept", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);
    await expect(
      t.mutation(api.datePlans.accept, { dropId: s.dropId }),
    ).rejects.toThrow(/Not signed in/);
  });

  test("accepting after the deadline is refused", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);
    await t.run((ctx) =>
      ctx.db.patch("datePlans", s.dropId, {
        confirmDeadlineMs: Date.now() - 1000,
      }),
    );
    await expect(
      asUser(t, s.alice.userId).mutation(api.datePlans.accept, {
        dropId: s.dropId,
      }),
    ).rejects.toThrow(/closed/);
  });
});

describe("passing on a date plan", () => {
  test("a pass frees that person's evening immediately", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);

    await asUser(t, s.bob.userId).mutation(api.datePlans.pass, {
      dropId: s.dropId,
      reason: "timing",
    });

    await t.run(async (ctx) => {
      const window = await ctx.db.get("availability", s.bob.availabilityId);
      expect(window?.status).toBe("open");
      expect(window?.heldByDropId).toBeUndefined();
    });
  });

  test("a pass after the other accepted keeps the drop alive for a replacement", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);

    await asUser(t, s.alice.userId).mutation(api.datePlans.accept, {
      dropId: s.dropId,
    });
    await asUser(t, s.bob.userId).mutation(api.datePlans.pass, {
      dropId: s.dropId,
    });

    await t.run(async (ctx) => {
      const drop = await ctx.db.get("datePlans", s.dropId);
      expect(drop?.status).toBe("partially_accepted");
      // Alice keeps her evening held.
      const window = await ctx.db.get("availability", s.alice.availabilityId);
      expect(window?.status).toBe("held");
    });
  });

  test("both passing expires the drop rather than leaving it hanging", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);

    await asUser(t, s.alice.userId).mutation(api.datePlans.pass, {
      dropId: s.dropId,
    });
    await asUser(t, s.bob.userId).mutation(api.datePlans.pass, {
      dropId: s.dropId,
    });

    const drop = await t.run((ctx) => ctx.db.get("datePlans", s.dropId));
    expect(drop?.status).toBe("expired_no_match");
  });

  test("passing after accepting is refused — that's a withdrawal", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);
    await asUser(t, s.alice.userId).mutation(api.datePlans.accept, {
      dropId: s.dropId,
    });
    await expect(
      asUser(t, s.alice.userId).mutation(api.datePlans.pass, {
        dropId: s.dropId,
      }),
    ).rejects.toThrow(/already responded/);
  });

  test("withdrawing releases the evening and keeps the drop searching", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);
    await asUser(t, s.alice.userId).mutation(api.datePlans.accept, {
      dropId: s.dropId,
    });
    await asUser(t, s.alice.userId).mutation(api.datePlans.withdraw, {
      dropId: s.dropId,
    });

    await t.run(async (ctx) => {
      const window = await ctx.db.get("availability", s.alice.availabilityId);
      expect(window?.status).toBe("open");
      const drop = await ctx.db.get("datePlans", s.dropId);
      // Bob is still deciding, so the drop stays open to him.
      expect(drop?.status).toBe("inviting");
    });
  });
});

describe("the 24-hour cutoff", () => {
  test("an overdue drop expires and frees both calendars", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);
    await asUser(t, s.alice.userId).mutation(api.datePlans.accept, {
      dropId: s.dropId,
    });

    await t.run((ctx) =>
      ctx.db.patch("datePlans", s.dropId, {
        confirmDeadlineMs: Date.now() - 60_000,
      }),
    );

    const closed = await t.mutation(internal.datePlans.expireOverdueDrops, {
      nowMs: Date.now(),
    });
    expect(closed).toBeGreaterThanOrEqual(1);

    await t.run(async (ctx) => {
      const drop = await ctx.db.get("datePlans", s.dropId);
      expect(drop?.status).toBe("expired_no_match");
      expect(drop?.cancelReason).toMatch(/cutoff/i);
      const window = await ctx.db.get("availability", s.alice.availabilityId);
      expect(window?.status).toBe("open");
    });
  });

  test("a confirmed drop is never expired by the cutoff job", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);
    await asUser(t, s.alice.userId).mutation(api.datePlans.accept, {
      dropId: s.dropId,
    });
    await asUser(t, s.bob.userId).mutation(api.datePlans.accept, {
      dropId: s.dropId,
    });

    await t.run((ctx) =>
      ctx.db.patch("datePlans", s.dropId, {
        confirmDeadlineMs: Date.now() - 60_000,
      }),
    );
    await t.mutation(internal.datePlans.expireOverdueDrops, {
      nowMs: Date.now(),
    });

    const drop = await t.run((ctx) => ctx.db.get("datePlans", s.dropId));
    expect(drop?.status).toBe("confirmed");
  });

  test("a finished date is completed and its window retired", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);
    await asUser(t, s.alice.userId).mutation(api.datePlans.accept, {
      dropId: s.dropId,
    });
    await asUser(t, s.bob.userId).mutation(api.datePlans.accept, {
      dropId: s.dropId,
    });

    const later = DATE_START + 8 * 3600_000;
    const completed = await t.mutation(internal.datePlans.completePastDrops, {
      nowMs: later,
    });
    expect(completed).toBe(1);

    await t.run(async (ctx) => {
      const drop = await ctx.db.get("datePlans", s.dropId);
      expect(drop?.status).toBe("completed");
      const window = await ctx.db.get("availability", s.alice.availabilityId);
      expect(window?.status).toBe("expired");
    });
  });
});

describe("cancellation", () => {
  test("either participant can cancel a confirmed date", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);
    await asUser(t, s.alice.userId).mutation(api.datePlans.accept, {
      dropId: s.dropId,
    });
    await asUser(t, s.bob.userId).mutation(api.datePlans.accept, {
      dropId: s.dropId,
    });

    await asUser(t, s.bob.userId).mutation(api.datePlans.cancel, {
      dropId: s.dropId,
      reason: "Something came up.",
    });

    await t.run(async (ctx) => {
      const drop = await ctx.db.get("datePlans", s.dropId);
      expect(drop?.status).toBe("cancelled");
      expect(drop?.cancelledByUserId).toBe(s.bob.userId);
      const window = await ctx.db.get("availability", s.alice.availabilityId);
      expect(window?.status).toBe("open");
    });
  });

  test("a non-participant cannot cancel", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);
    await expect(
      asUser(t, s.carol.userId).mutation(api.datePlans.cancel, {
        dropId: s.dropId,
      }),
    ).rejects.toThrow(/isn't yours/);
  });
});

describe("what a participant can see", () => {
  test("the other person is only ever a privacy-safe preview", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);

    const view = await asUser(t, s.alice.userId).query(api.datePlans.get, {
      dropId: s.dropId,
    });

    expect(view?.match?.displayName).toBe("Bob");
    const serialised = JSON.stringify(view);
    expect(serialised).not.toContain("bob@test.invalid");
    expect(serialised).not.toContain("dobMs");
    expect(serialised).not.toContain("127.06");
    expect(view?.matchPhotoUrl).toBeNull();
  });

  test("a photo stays hidden until both have accepted", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);
    const storageId = await t.run(async (ctx) =>
      ctx.storage.store(new Blob(["x"], { type: "image/png" })),
    );
    await t.run(async (ctx) => {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", s.bob.userId))
        .unique();
      await ctx.db.patch("profiles", profile!._id, {
        photoStorageId: storageId,
      });
    });

    const before = await asUser(t, s.alice.userId).query(api.datePlans.get, {
      dropId: s.dropId,
    });
    expect(before?.matchPhotoUrl).toBeNull();

    await asUser(t, s.alice.userId).mutation(api.datePlans.accept, {
      dropId: s.dropId,
    });
    await asUser(t, s.bob.userId).mutation(api.datePlans.accept, {
      dropId: s.dropId,
    });

    const after = await asUser(t, s.alice.userId).query(api.datePlans.get, {
      dropId: s.dropId,
    });
    expect(after?.matchPhotoUrl).toBeTypeOf("string");
  });

  test("a user can optionally share a photo with the initial match card", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);
    const storageId = await t.run(async (ctx) =>
      ctx.storage.store(new Blob(["x"], { type: "image/png" })),
    );
    await t.run(async (ctx) => {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", s.bob.userId))
        .unique();
      await ctx.db.patch("profiles", profile!._id, {
        photoStorageId: storageId,
        photoVisibility: "with_match",
      });
    });

    const view = await asUser(t, s.alice.userId).query(api.datePlans.get, {
      dropId: s.dropId,
    });
    expect(view?.matchPhotoUrl).toBeTypeOf("string");
  });

  test("a non-participant gets nothing at all", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);
    const view = await asUser(t, s.carol.userId).query(api.datePlans.get, {
      dropId: s.dropId,
    });
    expect(view).toBeNull();
  });

  test("accepting does not tell you whether the other person accepted", async () => {
    const t = convexTest(schema, modules);
    const s: Ctx = await setup(t);
    await asUser(t, s.alice.userId).mutation(api.datePlans.accept, {
      dropId: s.dropId,
    });

    const view = await asUser(t, s.alice.userId).query(api.datePlans.get, {
      dropId: s.dropId,
    });
    // Only a coarse "we're waiting on someone" — never their state.
    expect(view?.awaitingOther).toBe(true);
    expect(JSON.stringify(view)).not.toContain('"state"');
  });
});
