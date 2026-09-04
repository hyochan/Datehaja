/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const ANONYMOUS_ID = "4f73f251-9db1-47b4-8072-1e1ca83ddc1d";

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
});
