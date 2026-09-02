/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { verifyWebhookSignature } from "./integrations/agentmail";

const modules = import.meta.glob("./**/*.ts");

const NOW = Date.now();

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
      return { userId };
    }

    const alice = await makeUser("Alice", "woman");
    const bob = await makeUser("Bob", "man");

    const agentDateId = await ctx.db.insert("agentDates", {
      initiatorUserId: alice.userId,
      counterpartUserId: bob.userId,
      status: "debrief_ready",
      setting: "A quiet record bar after dark",
      compatibilityScore: 70,
      summary: "",
      sparks: [],
      frictions: [],
      initiatorVerdict: "curious",
      counterpartVerdict: "curious",
      initiatorReason: "",
      counterpartReason: "",
      initiatorConsent: "pending",
      counterpartConsent: "pending",
      isDemoCounterpart: false,
      createdAt: NOW,
      updatedAt: NOW,
    });

    return { alice, bob, agentDateId };
  });
}

function asUser(t: ReturnType<typeof convexTest>, userId: Id<"users">) {
  return t.withIdentity({ subject: userId, tokenIdentifier: `test|${userId}` });
}

describe("blocking", () => {
  test("blocking quietly closes the shared agent date", async () => {
    const t = convexTest(schema, modules);
    const s = await seedPair(t);

    await asUser(t, s.alice.userId).mutation(api.safety.blockFromAgentDate, {
      agentDateId: s.agentDateId,
    });

    await t.run(async (ctx) => {
      const date = await ctx.db.get("agentDates", s.agentDateId);
      expect(date?.status).toBe("closed");
    });
  });

  test("a block is recorded once and shows up in the block list", async () => {
    const t = convexTest(schema, modules);
    const s = await seedPair(t);

    await asUser(t, s.alice.userId).mutation(api.safety.blockFromAgentDate, {
      agentDateId: s.agentDateId,
    });
    const list = await asUser(t, s.alice.userId).query(
      api.safety.blockedList,
      {},
    );
    expect(list).toHaveLength(1);
    expect(list[0].displayName).toBe("Bob");
  });

  test("a block applies in both directions", async () => {
    const t = convexTest(schema, modules);
    const s = await seedPair(t);
    await asUser(t, s.alice.userId).mutation(api.safety.blockFromAgentDate, {
      agentDateId: s.agentDateId,
    });

    const aliceSees = await asUser(t, s.alice.userId).query(
      api.safety.isBlocked,
      { otherUserId: s.bob.userId },
    );
    const bobSees = await asUser(t, s.bob.userId).query(api.safety.isBlocked, {
      otherUserId: s.alice.userId,
    });
    expect(aliceSees).toBe(true);
    expect(bobSees).toBe(true);
  });

  test("unblocking removes the block", async () => {
    const t = convexTest(schema, modules);
    const s = await seedPair(t);
    await asUser(t, s.alice.userId).mutation(api.safety.blockFromAgentDate, {
      agentDateId: s.agentDateId,
    });
    await asUser(t, s.alice.userId).mutation(api.safety.unblock, {
      userId: s.bob.userId,
    });
    expect(
      await asUser(t, s.alice.userId).query(api.safety.blockedList, {}),
    ).toHaveLength(0);
  });
});

describe("reporting", () => {
  test("a report is stored and can also block in one action", async () => {
    const t = convexTest(schema, modules);
    const s = await seedPair(t);

    await asUser(t, s.alice.userId).mutation(api.safety.report, {
      agentDateId: s.agentDateId,
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
      agentDateId: s.agentDateId,
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
      agentDateId: s.agentDateId,
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

  test("you cannot report through an agent date you're not in", async () => {
    const t = convexTest(schema, modules);
    const s = await seedPair(t);
    const stranger = await t.run((ctx) =>
      ctx.db.insert("users", { name: "Mallory", email: "m@test.invalid" }),
    );
    await expect(
      asUser(t, stranger).mutation(api.safety.report, {
        agentDateId: s.agentDateId,
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
    const visibility = await asUser(t, s.alice.userId).query(
      api.safety.myVisibility,
      {},
    );
    expect(visibility?.beforeMatch.displayName).toBe("Alice");
    expect(visibility?.neverShared).toEqual(
      expect.arrayContaining([expect.stringContaining("email")]),
    );
    expect(JSON.stringify(visibility)).not.toContain("alice@test.invalid");
  });
});

/* --------------------------- AgentMail webhook ---------------------------- */

/** Sign a payload exactly the way Svix does, so the verifier is tested for real. */
async function signSvix(
  secret: string,
  id: string,
  timestamp: string,
  body: string,
) {
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
  const body = JSON.stringify({
    event_type: "message.received",
    event_id: "evt_1",
  });

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
      subject: "Re: your agent's date",
      preview: "hello",
      signatureVerified: true,
      rawPreview: "{}",
    };

    const first = await t.mutation(internal.mail.recordEvent, args);
    expect(first.duplicate).toBe(false);

    const second = await t.mutation(internal.mail.recordEvent, args);
    expect(second.duplicate).toBe(true);
    expect(second.eventDocId).toEqual(first.eventDocId);

    const events = await t.run((ctx) =>
      ctx.db.query("agentMailEvents").collect(),
    );
    expect(events).toHaveLength(1);
  });

  test("an inbound event is linked to the sender behind its address", async () => {
    const t = convexTest(schema, modules);
    const s = await seedPair(t);

    const result = await t.mutation(internal.mail.recordEvent, {
      eventId: "evt_link",
      eventType: "message.received",
      fromAddress: "Alice <alice@test.invalid>",
      signatureVerified: true,
      rawPreview: "{}",
    });

    const event = await t.run((ctx) =>
      ctx.db.get("agentMailEvents", result.eventDocId!),
    );
    expect(event?.userId).toBe(s.alice.userId);
  });
});
