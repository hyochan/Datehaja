/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { blockKey, hardFilter, type Party } from "./lib/matching";
import { DAY_MS } from "./lib/time";
import { verifyWebhookSignature } from "./integrations/agentmail";

const modules = import.meta.glob("./**/*.ts");

const NOW = Date.now();
const DATE_START = NOW + 3 * DAY_MS;

async function seedPair(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    async function makeUser(name: string, gender: "woman" | "man") {
      const userId = await ctx.db.insert("users", {
        name,
        email: `${name.toLowerCase()}@test.invalid`,
      });
      await ctx.db.insert("profiles", {
        userId,
        displayName: name,
        dobMs: NOW - 30 * 365.25 * 24 * 3600_000,
        ageYears: 30,
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
        status: "held",
      });
      return { userId, availabilityId };
    }

    const alice = await makeUser("Alice", "woman");
    const bob = await makeUser("Bob", "man");

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
        heldByDropId: dropId,
      });
    }

    return { alice, bob, dropId };
  });
}

function asUser(t: ReturnType<typeof convexTest>, userId: Id<"users">) {
  return t.withIdentity({ subject: userId, tokenIdentifier: `test|${userId}` });
}

describe("blocking", () => {
  test("blocking cancels the shared DateDrop and frees both evenings", async () => {
    const t = convexTest(schema, modules);
    const s = await seedPair(t);

    await asUser(t, s.alice.userId).mutation(api.safety.blockFromDrop, {
      dropId: s.dropId,
    });

    await t.run(async (ctx) => {
      const drop = await ctx.db.get("dateDrops", s.dropId);
      expect(drop?.status).toBe("cancelled");
      for (const person of [s.alice, s.bob]) {
        const window = await ctx.db.get("availability", person.availabilityId);
        expect(window?.status).toBe("open");
        expect(window?.heldByDropId).toBeUndefined();
      }
    });
  });

  test("a block is recorded once and shows up in the block list", async () => {
    const t = convexTest(schema, modules);
    const s = await seedPair(t);

    await asUser(t, s.alice.userId).mutation(api.safety.blockFromDrop, {
      dropId: s.dropId,
    });
    const list = await asUser(t, s.alice.userId).query(api.safety.blockedList, {});
    expect(list).toHaveLength(1);
    expect(list[0].displayName).toBe("Bob");
  });

  test("a block applies in both directions", async () => {
    const t = convexTest(schema, modules);
    const s = await seedPair(t);
    await asUser(t, s.alice.userId).mutation(api.safety.blockFromDrop, {
      dropId: s.dropId,
    });

    const aliceSees = await asUser(t, s.alice.userId).query(api.safety.isBlocked, {
      otherUserId: s.bob.userId,
    });
    const bobSees = await asUser(t, s.bob.userId).query(api.safety.isBlocked, {
      otherUserId: s.alice.userId,
    });
    expect(aliceSees).toBe(true);
    expect(bobSees).toBe(true);
  });

  test("unblocking removes the block", async () => {
    const t = convexTest(schema, modules);
    const s = await seedPair(t);
    await asUser(t, s.alice.userId).mutation(api.safety.blockFromDrop, {
      dropId: s.dropId,
    });
    await asUser(t, s.alice.userId).mutation(api.safety.unblock, {
      userId: s.bob.userId,
    });
    expect(await asUser(t, s.alice.userId).query(api.safety.blockedList, {})).toHaveLength(
      0,
    );
  });

  test("blocked users can never be matched again", () => {
    // The matching engine consumes the same block key the mutation writes.
    const blocked = new Set([blockKey("alice", "bob")]);
    const window = { startMs: DATE_START, endMs: DATE_START + 4 * 3600_000 };
    const make = (userId: string, gender: "woman" | "man"): Party => ({
      profile: {
        userId,
        displayName: userId,
        ageYears: 30,
        ageConfirmed18: true,
        gender,
        interestedIn: gender === "woman" ? ["man"] : ["woman"],
        city: "Seoul",
        countryCode: "KR",
        neighborhood: "Seongsu",
        approxLat: 37.54,
        approxLng: 127.06,
        timezone: "Asia/Seoul",
        interests: ["Films"],
        hobbies: [],
        languages: ["English"],
        socialEnergy: "ambivert",
        firstDateVibe: [],
        lifestyle: { smokes: false, drinks: "occasional" },
        status: "active",
        moderationStatus: "ok",
        onboardingComplete: true,
        isDemo: false,
      },
      preferences: {
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
        indoorOutdoor: "either",
        atmosphere: "either",
        dietary: [],
        accessibility: [],
        dropsPaused: false,
        allowDemoMatches: true,
      },
      window,
    });

    expect(
      hardFilter(make("alice", "woman"), make("bob", "man"), { blockedPairs: blocked }),
    ).toEqual({ ok: false, reason: "blocked" });
  });
});

describe("reporting", () => {
  test("a report is stored and can also block in one action", async () => {
    const t = convexTest(schema, modules);
    const s = await seedPair(t);

    await asUser(t, s.alice.userId).mutation(api.safety.report, {
      dropId: s.dropId,
      category: "harassment",
      details: "They were abusive.",
      alsoBlock: true,
    });

    await t.run(async (ctx) => {
      const reports = await ctx.db.query("reports").collect();
      expect(reports).toHaveLength(1);
      expect(reports[0].reportedUserId).toBe(s.bob.userId);
      expect(reports[0].status).toBe("open");

      const blocks = await ctx.db.query("blocks").collect();
      expect(blocks).toHaveLength(1);
    });
  });

  test("a serious report immediately restricts the reported account", async () => {
    const t = convexTest(schema, modules);
    const s = await seedPair(t);

    await asUser(t, s.alice.userId).mutation(api.safety.report, {
      dropId: s.dropId,
      category: "underage",
      details: "Looks well under 18.",
      alsoBlock: false,
    });

    const profile = await t.run(async (ctx) =>
      ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", s.bob.userId))
        .unique(),
    );
    expect(profile?.moderationStatus).toBe("flagged");
  });

  test("a lesser report does not restrict the account", async () => {
    const t = convexTest(schema, modules);
    const s = await seedPair(t);
    await asUser(t, s.alice.userId).mutation(api.safety.report, {
      dropId: s.dropId,
      category: "no_show",
      details: "Didn't turn up.",
      alsoBlock: false,
    });
    const profile = await t.run(async (ctx) =>
      ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", s.bob.userId))
        .unique(),
    );
    expect(profile?.moderationStatus).toBe("ok");
  });

  test("you cannot report through a DateDrop you're not in", async () => {
    const t = convexTest(schema, modules);
    const s = await seedPair(t);
    const stranger = await t.run((ctx) =>
      ctx.db.insert("users", { name: "Mallory", email: "m@test.invalid" }),
    );
    await expect(
      asUser(t, stranger).mutation(api.safety.report, {
        dropId: s.dropId,
        category: "other",
        details: "x",
        alsoBlock: false,
      }),
    ).rejects.toThrow(/isn't yours/);
  });
});

describe("what the user is told about their own visibility", () => {
  test("myVisibility returns the exact preview a match receives", async () => {
    const t = convexTest(schema, modules);
    const s = await seedPair(t);
    const visibility = await asUser(t, s.alice.userId).query(api.safety.myVisibility, {});
    expect(visibility?.beforeMatch.displayName).toBe("Alice");
    expect(visibility?.neverShared).toEqual(
      expect.arrayContaining([expect.stringContaining("email")]),
    );
    expect(JSON.stringify(visibility)).not.toContain("alice@test.invalid");
  });
});

/* --------------------------- AgentMail webhook ---------------------------- */

/** Sign a payload exactly the way Svix does, so the verifier is tested for real. */
async function signSvix(secret: string, id: string, timestamp: string, body: string) {
  const raw = Uint8Array.from(atob(secret.replace(/^whsec_/, "")), (c) =>
    c.charCodeAt(0),
  );
  const key = await crypto.subtle.importKey(
    "raw",
    raw,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = new Uint8Array(
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`${id}.${timestamp}.${body}`),
    ),
  );
  return `v1,${btoa(String.fromCharCode(...mac))}`;
}

/** A throwaway signing key generated per test run — never a real credential. */
const SECRET = `whsec_${btoa(
  String.fromCharCode(...new Uint8Array(24).map((_, i) => (i * 37 + 11) % 251)),
)}`;

describe("AgentMail webhook verification", () => {
  const body = JSON.stringify({ event_type: "message.received", event_id: "evt_1" });

  test("accepts a correctly signed payload", async () => {
    const ts = String(Math.floor(NOW / 1000));
    const signature = await signSvix(SECRET, "msg_1", ts, body);
    const result = await verifyWebhookSignature({
      secret: SECRET,
      svixId: "msg_1",
      svixTimestamp: ts,
      svixSignature: signature,
      rawBody: body,
      nowMs: NOW,
    });
    expect(result).toEqual({ ok: true });
  });

  test("rejects a tampered body", async () => {
    const ts = String(Math.floor(NOW / 1000));
    const signature = await signSvix(SECRET, "msg_1", ts, body);
    const result = await verifyWebhookSignature({
      secret: SECRET,
      svixId: "msg_1",
      svixTimestamp: ts,
      svixSignature: signature,
      rawBody: body.replace("evt_1", "evt_2"),
      nowMs: NOW,
    });
    expect(result).toEqual({ ok: false, reason: "signature_mismatch" });
  });

  test("rejects a replayed payload outside the tolerance window", async () => {
    const oldTs = String(Math.floor((NOW - 20 * 60_000) / 1000));
    const signature = await signSvix(SECRET, "msg_1", oldTs, body);
    const result = await verifyWebhookSignature({
      secret: SECRET,
      svixId: "msg_1",
      svixTimestamp: oldTs,
      svixSignature: signature,
      rawBody: body,
      nowMs: NOW,
    });
    expect(result).toEqual({ ok: false, reason: "timestamp_outside_tolerance" });
  });

  test("rejects a payload signed with a different secret", async () => {
    const ts = String(Math.floor(NOW / 1000));
    const otherSecret = `whsec_${btoa(String.fromCharCode(...new Uint8Array(24).fill(7)))}`;
    const signature = await signSvix(otherSecret, "msg_1", ts, body);
    const result = await verifyWebhookSignature({
      secret: SECRET,
      svixId: "msg_1",
      svixTimestamp: ts,
      svixSignature: signature,
      rawBody: body,
      nowMs: NOW,
    });
    expect(result.ok).toBe(false);
  });

  test("rejects missing headers", async () => {
    const result = await verifyWebhookSignature({
      secret: SECRET,
      svixId: null,
      svixTimestamp: null,
      svixSignature: null,
      rawBody: body,
      nowMs: NOW,
    });
    expect(result).toEqual({ ok: false, reason: "missing_svix_headers" });
  });

  test("accepts a multi-signature header where one entry matches", async () => {
    const ts = String(Math.floor(NOW / 1000));
    const good = await signSvix(SECRET, "msg_1", ts, body);
    const result = await verifyWebhookSignature({
      secret: SECRET,
      svixId: "msg_1",
      svixTimestamp: ts,
      svixSignature: `v1,AAAA ${good}`,
      rawBody: body,
      nowMs: NOW,
    });
    expect(result).toEqual({ ok: true });
  });
});

describe("AgentMail event persistence is idempotent", () => {
  test("the same event id is stored once and reported as a duplicate", async () => {
    const t = convexTest(schema, modules);

    const args = {
      eventId: "evt_abc",
      eventType: "message.received",
      inboxId: "concierge@agentmail.to",
      threadId: "thr_1",
      messageId: "<m1@agentmail.to>",
      fromAddress: "someone@example.com",
      toAddress: "concierge@agentmail.to",
      subject: "Re: your DateDrop",
      preview: "hello",
      signatureVerified: true,
      rawPreview: "{}",
    };

    const first = await t.mutation(internal.mail.recordEvent, args);
    expect(first.duplicate).toBe(false);

    const second = await t.mutation(internal.mail.recordEvent, args);
    expect(second.duplicate).toBe(true);
    expect(second.eventDocId).toEqual(first.eventDocId);

    const events = await t.run((ctx) => ctx.db.query("agentMailEvents").collect());
    expect(events).toHaveLength(1);
  });

  test("an inbound event is linked to the participant behind its thread", async () => {
    const t = convexTest(schema, modules);
    const s = await seedPair(t);
    await t.run(async (ctx) => {
      const participant = await ctx.db
        .query("dateDropParticipants")
        .withIndex("by_drop_and_user", (q) =>
          q.eq("dropId", s.dropId).eq("userId", s.alice.userId),
        )
        .unique();
      await ctx.db.patch("dateDropParticipants", participant!._id, {
        emailThreadId: "thr_link",
        emailMessageId: "<m@agentmail.to>",
      });
    });

    const result = await t.mutation(internal.mail.recordEvent, {
      eventId: "evt_link",
      eventType: "message.received",
      threadId: "thr_link",
      signatureVerified: true,
      rawPreview: "{}",
    });

    const event = await t.run((ctx) =>
      ctx.db.get("agentMailEvents", result.eventDocId!),
    );
    expect(event?.userId).toBe(s.alice.userId);
    expect(event?.dropId).toBe(s.dropId);
  });
});
