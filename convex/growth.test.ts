/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { SNAPSHOT_ROWS_PER_EVENT } from "./growth";

const modules = import.meta.glob("./**/*.ts");
const ANONYMOUS_ID = "4f73f251-9db1-47b4-8072-1e1ca83ddc1d";
const ANONYMOUS_ID_B = "b1c2d3e4-f5a6-7890-abcd-ef1234567890";
const ANONYMOUS_ID_C = "c1d2e3f4-a5b6-7890-abcd-ef1234567890";

function asUser(t: ReturnType<typeof convexTest>, userId: Id<"users">) {
  return t.withIdentity({ subject: userId, tokenIdentifier: `test|${userId}` });
}

describe("privacy-minimal growth analytics", () => {
  test("records only the supported landing event", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.growth.track, {
      event: "agent_landing_viewed",
      anonymousId: ANONYMOUS_ID,
      locale: "ko-KR",
      source: "organic",
      campaign: "agent-launch",
    });

    const events = await t.run((ctx) => ctx.db.query("growthEvents").collect());
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      event: "agent_landing_viewed",
      anonymousId: ANONYMOUS_ID,
      locale: "ko-KR",
      source: "organic",
      campaign: "agent-launch",
    });
    expect(events[0]?.userId).toBeUndefined();
    expect(events[0]?.agentDateId).toBeUndefined();
  });

  test("counts the step between landing and a sealed brief", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.growth.track, {
      event: "agent_landing_viewed",
      anonymousId: ANONYMOUS_ID,
      locale: "ko-KR",
    });
    await t.mutation(api.growth.track, {
      event: "agent_onboarding_started",
      anonymousId: ANONYMOUS_ID,
      locale: "ko-KR",
    });

    const snapshot = await t.query(internal.growth.funnelSnapshot, {
      sinceMs: 0,
    });
    // agent_created only fires once the whole brief is sealed. Without this
    // stage a zero there cannot say whether nobody started or everybody left.
    expect(snapshot.funnel.agent_onboarding_started.uniqueActors).toBe(1);
    expect(snapshot.funnel.agent_created.uniqueActors).toBe(0);
    // The same anonymous id links the two, and carries nothing else.
    const events = await t.run((ctx) => ctx.db.query("growthEvents").collect());
    expect(events.map((event) => event.anonymousId)).toEqual([
      ANONYMOUS_ID,
      ANONYMOUS_ID,
    ]);
    expect(events.every((event) => event.userId === undefined)).toBe(true);
  });

  test("drops malformed identifiers and limits repeat writes", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.growth.track, {
      event: "agent_landing_viewed",
      anonymousId: "not-a-browser-id",
    });
    for (let index = 0; index < 8; index += 1) {
      await t.mutation(api.growth.track, {
        event: "agent_landing_viewed",
        anonymousId: ANONYMOUS_ID,
      });
    }

    const events = await t.run((ctx) => ctx.db.query("growthEvents").collect());
    expect(events).toHaveLength(5);
  });

  test("counts an anonymous landing and a signed-in creation as two actors when they never co-occur", async () => {
    // Production shape before this fix: landing is anonymousId only,
    // agent_created is userId only. No row carries both, so the snapshot
    // must not invent a link — that is how already-written rows still read.
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) =>
      ctx.db.insert("users", { name: "Mina", email: "mina@test.invalid" }),
    );
    const now = Date.now();
    await t.run(async (ctx) => {
      await ctx.db.insert("growthEvents", {
        anonymousId: ANONYMOUS_ID,
        event: "agent_landing_viewed",
        createdAt: now,
      });
      await ctx.db.insert("growthEvents", {
        userId,
        event: "agent_created",
        createdAt: now + 1,
      });
    });

    const snapshot = await t.query(internal.growth.funnelSnapshot, {
      sinceMs: 0,
    });
    const events = await t.run((ctx) => ctx.db.query("growthEvents").collect());
    const naiveActors = new Set(
      events.map((row) => row.userId ?? row.anonymousId ?? row._id),
    );

    expect(snapshot.funnel.agent_landing_viewed.uniqueActors).toBe(1);
    expect(snapshot.funnel.agent_created.uniqueActors).toBe(1);
    expect(naiveActors.size).toBe(2);
  });

  test("counts one actor for a person seen under both identifiers", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) =>
      ctx.db.insert("users", { name: "Mina", email: "mina@test.invalid" }),
    );
    const now = Date.now();
    await t.run(async (ctx) => {
      await ctx.db.insert("growthEvents", {
        anonymousId: ANONYMOUS_ID,
        event: "agent_landing_viewed",
        createdAt: now,
      });
      await ctx.db.insert("growthEvents", {
        userId,
        anonymousId: ANONYMOUS_ID,
        event: "agent_landing_viewed",
        createdAt: now + 1,
      });
      await ctx.db.insert("growthEvents", {
        anonymousId: ANONYMOUS_ID,
        event: "agent_onboarding_started",
        createdAt: now + 2,
      });
      await ctx.db.insert("growthEvents", {
        userId,
        anonymousId: ANONYMOUS_ID,
        event: "agent_created",
        createdAt: now + 3,
      });
    });

    const snapshot = await t.query(internal.growth.funnelSnapshot, {
      sinceMs: 0,
    });
    expect(snapshot.funnel.agent_landing_viewed.uniqueActors).toBe(1);
    expect(snapshot.funnel.agent_onboarding_started.uniqueActors).toBe(1);
    expect(snapshot.funnel.agent_created.uniqueActors).toBe(1);
  });

  test("keeps onboarding ahead of created when the same people did both", async () => {
    const t = convexTest(schema, modules);
    const [userA, userB, userC] = await t.run(async (ctx) => [
      await ctx.db.insert("users", { name: "Ada", email: "ada@test.invalid" }),
      await ctx.db.insert("users", { name: "Bea", email: "bea@test.invalid" }),
      await ctx.db.insert("users", { name: "Cyd", email: "cyd@test.invalid" }),
    ]);
    const now = Date.now();
    await t.run(async (ctx) => {
      // Ada appears once as anonymous and once as signed-in at onboarding.
      // Without identity resolution those are two actors and the funnel
      // inflates; with it she is one person who also created an agent.
      await ctx.db.insert("growthEvents", {
        anonymousId: ANONYMOUS_ID,
        event: "agent_onboarding_started",
        createdAt: now,
      });
      await ctx.db.insert("growthEvents", {
        userId: userA,
        anonymousId: ANONYMOUS_ID,
        event: "agent_onboarding_started",
        createdAt: now + 1,
      });
      await ctx.db.insert("growthEvents", {
        userId: userA,
        anonymousId: ANONYMOUS_ID,
        event: "agent_created",
        createdAt: now + 2,
      });
      await ctx.db.insert("growthEvents", {
        anonymousId: ANONYMOUS_ID_B,
        event: "agent_onboarding_started",
        createdAt: now + 3,
      });
      await ctx.db.insert("growthEvents", {
        userId: userB,
        anonymousId: ANONYMOUS_ID_B,
        event: "agent_created",
        createdAt: now + 4,
      });
      await ctx.db.insert("growthEvents", {
        userId: userC,
        anonymousId: ANONYMOUS_ID_C,
        event: "agent_onboarding_started",
        createdAt: now + 5,
      });
    });

    const snapshot = await t.query(internal.growth.funnelSnapshot, {
      sinceMs: 0,
    });
    const started = snapshot.funnel.agent_onboarding_started.uniqueActors;
    const created = snapshot.funnel.agent_created.uniqueActors;
    expect(started).toBe(3);
    expect(created).toBe(2);
    expect(started).toBeGreaterThanOrEqual(created);
  });

  test("does not collapse two people who never share an identifier", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) =>
      ctx.db.insert("users", { name: "Mina", email: "mina@test.invalid" }),
    );
    const now = Date.now();
    await t.run(async (ctx) => {
      await ctx.db.insert("growthEvents", {
        anonymousId: ANONYMOUS_ID,
        event: "agent_landing_viewed",
        createdAt: now,
      });
      await ctx.db.insert("growthEvents", {
        userId,
        event: "agent_landing_viewed",
        createdAt: now + 1,
      });
    });

    const snapshot = await t.query(internal.growth.funnelSnapshot, {
      sinceMs: 0,
    });
    expect(snapshot.funnel.agent_landing_viewed.uniqueActors).toBe(2);
  });

  test("records the authenticated Scout Pass funnel without profile text", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) =>
      ctx.db.insert("users", { name: "Scout", email: "scout@test.invalid" }),
    );

    await asUser(t, userId).mutation(api.growth.trackMember, {
      event: "scout_pass_viewed",
    });
    await asUser(t, userId).mutation(api.growth.trackMember, {
      event: "scout_checkout_started",
    });

    const events = await t.run((ctx) => ctx.db.query("growthEvents").collect());
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userId, event: "scout_pass_viewed" }),
        expect.objectContaining({ userId, event: "scout_checkout_started" }),
      ]),
    );
    expect(events.every((event) => event.source === undefined)).toBe(true);
  });

  test("the same browser is one person whether its id arrives upper or lower case", async () => {
    // The shape check accepts either case; actor tokens are compared as
    // strings, so without folding one browser would read as two people.
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) =>
      ctx.db.insert("users", { name: "Rae", email: "rae@test.invalid" }),
    );
    const now = Date.now();
    await t.run(async (ctx) => {
      await ctx.db.insert("growthEvents", {
        anonymousId: ANONYMOUS_ID.toUpperCase(),
        event: "agent_landing_viewed",
        createdAt: now,
      });
      await ctx.db.insert("growthEvents", {
        anonymousId: ANONYMOUS_ID,
        event: "agent_landing_viewed",
        createdAt: now + 1,
      });
      await ctx.db.insert("growthEvents", {
        userId,
        anonymousId: ANONYMOUS_ID.toUpperCase(),
        event: "agent_created",
        createdAt: now + 2,
      });
    });
    const snapshot = await t.query(internal.growth.funnelSnapshot, {
      sinceMs: 0,
    });
    expect(snapshot.funnel.agent_landing_viewed.uniqueActors).toBe(1);
    expect(snapshot.funnel.agent_created.uniqueActors).toBe(1);
  });

  test("warns when a dropped row makes a different event's count wrong", async () => {
    // The union is built from the same capped samples as the counts, so the row
    // that gets dropped can be the one linking a visitor id to a user id. The
    // event that then miscounts is a different one, still far under its own cap
    // and still reporting truncated:false. One flag has to speak for the read.
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) =>
      ctx.db.insert("users", { name: "Io", email: "io@test.invalid" }),
    );
    const second = ANONYMOUS_ID.replace(/^.{8}/, "ffffffff");
    const now = Date.now();
    await t.run(async (ctx) => {
      // Oldest creation row carries the link that would join the first id.
      await ctx.db.insert("growthEvents", {
        userId,
        anonymousId: ANONYMOUS_ID,
        event: "agent_created",
        createdAt: now,
      });
      // Push it past the cap. Reads are newest-first, so this one falls off.
      for (let i = 1; i <= SNAPSHOT_ROWS_PER_EVENT; i++) {
        await ctx.db.insert("growthEvents", {
          userId,
          anonymousId: i === 1 ? second : undefined,
          event: "agent_created",
          createdAt: now + i,
        });
      }
      // Two onboardings, well under the cap, one per visitor id.
      await ctx.db.insert("growthEvents", {
        anonymousId: ANONYMOUS_ID,
        event: "agent_onboarding_started",
        createdAt: now + 1,
      });
      await ctx.db.insert("growthEvents", {
        anonymousId: second,
        event: "agent_onboarding_started",
        createdAt: now + 2,
      });
    });

    const snapshot = await t.query(internal.growth.funnelSnapshot, {
      sinceMs: 0,
    });
    // The linking row was dropped, so onboarding reads two people where the
    // full history has one - and onboarding itself is nowhere near its cap.
    expect(snapshot.funnel.agent_onboarding_started.truncated).toBe(false);
    expect(snapshot.funnel.agent_onboarding_started.uniqueActors).toBe(2);
    // That is the whole point of the flag: this snapshot is not exact.
    expect(snapshot.linksTruncated).toBe(true);

  });

  test("one browser is one quota and one stored id whatever case it sends", async () => {
    // The ingress fold is what keeps an alternating-case client from getting a
    // second rate-limit bucket. Reading folds too, so without this test a
    // reverted ingress fold would leave the counts right and the quota wrong.
    const t = convexTest(schema, modules);
    for (let i = 0; i < 6; i++) {
      await t.mutation(api.growth.track, {
        event: "agent_landing_viewed",
        anonymousId:
          i % 2 === 0 ? ANONYMOUS_ID.toUpperCase() : ANONYMOUS_ID,
      });
    }
    const rows = await t.run((ctx) =>
      ctx.db.query("growthEvents").collect(),
    );
    // One shared bucket of five, not two buckets of five.
    expect(rows).toHaveLength(5);
    expect(rows.every((row) => row.anonymousId === ANONYMOUS_ID)).toBe(true);
  });

  test("the same rows under the cap read as one person", async () => {
    // The counterfactual for the test above. Identical shape, two rows fewer,
    // so nothing is dropped and the linking row survives: the two onboardings
    // that read as two people when the link fell off now read as one. Without
    // this, that test could not tell "truncation broke the link" apart from
    // "the link never worked".
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) =>
      ctx.db.insert("users", { name: "Io", email: "io@test.invalid" }),
    );
    const second = ANONYMOUS_ID.replace(/^.{8}/, "ffffffff");
    const now = Date.now();
    await t.run(async (ctx) => {
      await ctx.db.insert("growthEvents", {
        userId,
        anonymousId: ANONYMOUS_ID,
        event: "agent_created",
        createdAt: now,
      });
      for (let i = 1; i <= SNAPSHOT_ROWS_PER_EVENT - 2; i++) {
        await ctx.db.insert("growthEvents", {
          userId,
          anonymousId: i === 1 ? second : undefined,
          event: "agent_created",
          createdAt: now + i,
        });
      }
      await ctx.db.insert("growthEvents", {
        anonymousId: ANONYMOUS_ID,
        event: "agent_onboarding_started",
        createdAt: now + 1,
      });
      await ctx.db.insert("growthEvents", {
        anonymousId: second,
        event: "agent_onboarding_started",
        createdAt: now + 2,
      });
    });
    const snapshot = await t.query(internal.growth.funnelSnapshot, {
      sinceMs: 0,
    });
    expect(snapshot.funnel.agent_created.truncated).toBe(false);
    expect(snapshot.linksTruncated).toBe(false);
    expect(snapshot.funnel.agent_onboarding_started.uniqueActors).toBe(1);
  });

  test("does not cry wolf on a sample that fits", async () => {
    const t = convexTest(schema, modules);
    const now = Date.now();
    await t.run(async (ctx) => {
      await ctx.db.insert("growthEvents", {
        anonymousId: ANONYMOUS_ID,
        event: "agent_landing_viewed",
        createdAt: now,
      });
    });
    const snapshot = await t.query(internal.growth.funnelSnapshot, {
      sinceMs: 0,
    });
    expect(snapshot.funnel.agent_landing_viewed.truncated).toBe(false);
    expect(snapshot.linksTruncated).toBe(false);
  });
});
