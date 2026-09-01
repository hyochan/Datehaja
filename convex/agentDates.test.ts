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

async function setup(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    async function person(
      name: string,
      email: string,
      gender: "woman" | "man",
      agentName: string,
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
        bio: "A thoughtful person who likes honest, unhurried conversations.",
        showOccupation: false,
        interests: ["Films", "Coffee", "Books"],
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
        name: agentName,
        avatar: {
          palette: agentName === "Aster" ? "rose" : "sky",
          face: "curious",
          hair: "wave",
          outfit: "cardigan",
          accessory: "glasses",
        },
        essence:
          "Warm but direct, and more introverted than first impressions suggest.",
        desiredConnection:
          "Someone who can disagree kindly and enjoy a quiet room.",
        boundaries: ["Privacy before connection"],
        voice: "warm",
        autonomy: "suggest",
        privateMemory: "The human values consistent curiosity.",
        status: "active",
        createdAt: NOW,
        updatedAt: NOW,
      });
      return userId;
    }

    const alice = await person(
      "Alice Park",
      "alice@test.invalid",
      "woman",
      "Aster",
    );
    const bob = await person(
      "Bob Kim",
      "bob@test.invalid",
      "man",
      "Bori",
    );
    const carol = await person(
      "Carol Lee",
      "carol@test.invalid",
      "woman",
      "Clover",
    );
    const agentDateId = await ctx.db.insert("agentDates", {
      initiatorUserId: alice,
      counterpartUserId: bob,
      status: "debrief_ready",
      setting: "A quiet virtual observatory",
      worldSourceTitle: "A public culture story",
      worldSourceUrl: "https://example.com/story",
      compatibilityScore: 82,
      summary: "The Agents found a calm, specific kind of curiosity.",
      sparks: ["Silence felt safe"],
      frictions: ["Different social pace"],
      initiatorVerdict: "encourage",
      counterpartVerdict: "curious",
      initiatorReason: "I would actively recommend one real conversation.",
      counterpartReason: "There is enough here to stay curious.",
      initiatorConsent: "pending",
      counterpartConsent: "pending",
      isDemoCounterpart: false,
      createdAt: NOW,
      updatedAt: NOW,
    });
    await ctx.db.insert("agentDateTurns", {
      agentDateId,
      round: 1,
      speakerUserId: alice,
      speakerAgentName: "Aster",
      content: "What makes quiet feel companionable to your person?",
      subtext: "Private internal inference that must never leave the backend.",
      createdAt: NOW,
    });
    return { alice, bob, carol, agentDateId };
  });
}

describe("agent-date privacy and human consent", () => {
  test("persists the requested locale before the scheduled date begins", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);

    const agentDateId = await t.mutation(internal.agentDates.createRequest, {
      userId: s.carol,
      accessMode: "demo",
      locale: "ko-KR",
    });
    const date = await t.run((ctx) => ctx.db.get("agentDates", agentDateId));

    expect(date?.locale).toBe("ko-KR");
    expect(date?.setting).toBe("둘만의 가상 데이트 공간을 준비하고 있어요.");
    expect(date?.paceMode).toBe("demo");
  });

  test("keeps a demo Agent name distinct and marks turn ownership", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    const demoFallbacks = ["Juno", "Sol", "Miro", "Lumi", "Ari", "Noa"];
    const firstChoice =
      demoFallbacks[
        String(s.bob)
          .split("")
          .reduce((sum, character) => sum + character.charCodeAt(0), 0) %
          demoFallbacks.length
      ] ?? "Juno";

    await t.run(async (ctx) => {
      const myAgent = await ctx.db
        .query("agentProfiles")
        .withIndex("by_user", (q) => q.eq("userId", s.alice))
        .unique();
      const demoAgent = await ctx.db
        .query("agentProfiles")
        .withIndex("by_user", (q) => q.eq("userId", s.bob))
        .unique();
      const demoProfile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", s.bob))
        .unique();
      if (!myAgent || !demoAgent || !demoProfile) {
        throw new Error("Expected complete Agent fixtures.");
      }
      await ctx.db.patch(myAgent._id, { name: firstChoice });
      await ctx.db.delete(demoAgent._id);
      await ctx.db.patch(demoProfile._id, { isDemo: true });
    });

    const view = await asUser(t, s.alice).query(api.agentDates.get, {
      agentDateId: s.agentDateId,
    });
    expect(view?.mine.agentName).toBe(firstChoice);
    expect(view?.counterpart.agentName).not.toBe(firstChoice);
    expect(view?.turns[0].isMine).toBe(true);
    const list = await asUser(t, s.alice).query(api.agentDates.listMine, {});
    expect(list[0].counterpart?.agentName).not.toBe(firstChoice);
  });

  test("stores each live moment once and durably schedules the next one", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    await t.run((ctx) =>
      ctx.db.patch("agentDates", s.agentDateId, {
        status: "running",
        paceMode: "natural",
        activity: "thinking",
      }),
    );
    const args = {
      agentDateId: s.agentDateId,
      round: 2,
      speakerUserId: s.bob,
      speakerAgentName: "Bori",
      content: "I took a moment because that question deserved one.",
      subtext: "The pace felt safe.",
      nextDelayMs: 71_000,
      nextActivity: "reading" as const,
    };

    await t.mutation(internal.agentDates.storeTurnAndSchedule, args);
    await t.mutation(internal.agentDates.storeTurnAndSchedule, args);

    const [date, turns] = await t.run(async (ctx) => [
      await ctx.db.get("agentDates", s.agentDateId),
      await ctx.db
        .query("agentDateTurns")
        .withIndex("by_date_and_round", (q) =>
          q.eq("agentDateId", s.agentDateId),
        )
        .take(7),
    ]);
    expect(turns).toHaveLength(2);
    expect(turns.filter((turn) => turn.round === 2)).toHaveLength(1);
    expect(date?.activity).toBe("reading");
    expect(date?.nextTurnAt).toBeGreaterThan(NOW);
  });

  test("does not invent a monthly expedition cap", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    await t.run(async (ctx) => {
      for (let index = 0; index < 4; index += 1) {
        await ctx.db.insert("agentDates", {
          initiatorUserId: s.bob,
          counterpartUserId: s.alice,
          status: "debrief_ready",
          setting: `Monthly expedition ${index + 1}`,
          compatibilityScore: 70,
          summary: "A completed paid expedition.",
          sparks: [],
          frictions: [],
          initiatorVerdict: "curious",
          counterpartVerdict: "curious",
          initiatorReason: "Worth considering.",
          counterpartReason: "Worth considering.",
          initiatorConsent: "pending",
          counterpartConsent: "pending",
          isDemoCounterpart: false,
          createdAt: NOW,
          updatedAt: NOW,
        });
      }
    });

    const next = await t.mutation(internal.agentDates.createRequest, {
      userId: s.bob,
      accessMode: "subscription",
    });
    const date = await t.run((ctx) => ctx.db.get("agentDates", next));
    expect(date?.initiatorUserId).toBe(s.bob);
    expect(date?.counterpartUserId).toBe(s.carol);
  });

  test("seals the other verdict, answer, and turn subtext before mutual consent", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    const view = await asUser(t, s.alice).query(api.agentDates.get, {
      agentDateId: s.agentDateId,
    });

    expect(view?.mine.verdict).toBe("encourage");
    expect(view?.mine.avatar?.palette).toBe("rose");
    expect(view?.counterpart.avatar?.palette).toBe("sky");
    expect(view?.counterpart.verdict).toBeNull();
    expect(view?.counterpart.consent).toBe("sealed");
    expect(view?.counterpart.contactEmail).toBeNull();
    expect(view?.date).not.toHaveProperty("counterpartReason");
    expect(view?.date).not.toHaveProperty("counterpartConsent");
    expect(view?.date).not.toHaveProperty("compatibilityScore");
    expect(view?.turns[0]).not.toHaveProperty("subtext");

    const list = await asUser(t, s.alice).query(api.agentDates.listMine, {});
    expect(list[0]).not.toHaveProperty("compatibilityScore");
  });

  test("does not reveal who said yes first", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    await asUser(t, s.bob).mutation(api.agentDates.consent, {
      agentDateId: s.agentDateId,
      decision: "yes",
    });
    const view = await asUser(t, s.alice).query(api.agentDates.get, {
      agentDateId: s.agentDateId,
    });
    expect(view?.counterpart.consent).toBe("sealed");
    expect(view?.date.status).toBe("debrief_ready");
  });

  test("reveals contact symmetrically only after two human yeses", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    await asUser(t, s.bob).mutation(api.agentDates.consent, {
      agentDateId: s.agentDateId,
      decision: "yes",
    });
    await asUser(t, s.alice).mutation(api.agentDates.consent, {
      agentDateId: s.agentDateId,
      decision: "yes",
    });

    const [aliceView, bobView] = await Promise.all([
      asUser(t, s.alice).query(api.agentDates.get, {
        agentDateId: s.agentDateId,
      }),
      asUser(t, s.bob).query(api.agentDates.get, {
        agentDateId: s.agentDateId,
      }),
    ]);
    expect(aliceView?.date.status).toBe("connected");
    expect(aliceView?.counterpart.contactEmail).toBe("bob@test.invalid");
    expect(bobView?.counterpart.contactEmail).toBe("alice@test.invalid");
    expect(aliceView?.counterpart.verdict).toBe("curious");
  });

  test("rejects anyone outside the two-person date", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    await expect(
      asUser(t, s.carol).query(api.agentDates.get, {
        agentDateId: s.agentDateId,
      }),
    ).rejects.toThrow("isn't yours");
  });

  test("stores a private pass reason and carries its lesson into later dates", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    await t.mutation(internal.agentDates.finish, {
      agentDateId: s.agentDateId,
      aVerdict: "pass",
      bVerdict: "curious",
      aReason:
        "The conversation stayed polished when your brief asked for directness.",
      bReason: "There was enough warmth to stay curious.",
      aDecisionCode: "communication_mismatch",
      bDecisionCode: "worth_exploring",
      aNextSearchNote:
        "Look for someone who answers a gentle disagreement directly.",
      bNextSearchNote: "Look for one more signal about conversational pace.",
      score: 55,
      summary: "The Agents found warmth but different communication styles.",
      sparks: ["Shared curiosity"],
      frictions: ["Directness"],
      demoConsent: "pending",
    });

    const [aliceView, bobView, aliceAgent] = await Promise.all([
      asUser(t, s.alice).query(api.agentDates.get, {
        agentDateId: s.agentDateId,
      }),
      asUser(t, s.bob).query(api.agentDates.get, {
        agentDateId: s.agentDateId,
      }),
      t.run(async (ctx) =>
        ctx.db
          .query("agentProfiles")
          .withIndex("by_user", (q) => q.eq("userId", s.alice))
          .unique(),
      ),
    ]);

    expect(aliceView?.mine.decisionCode).toBe("communication_mismatch");
    expect(aliceView?.mine.nextSearchNote).toContain("gentle disagreement");
    expect(aliceAgent?.scoutingMemory).toContain("Communication did not fit");
    expect(aliceAgent?.scoutingMemory).toContain("gentle disagreement");
    expect(bobView?.mine.decisionCode).toBe("worth_exploring");
    expect(bobView?.date).not.toHaveProperty("initiatorDecisionCode");
    expect(bobView?.counterpart).not.toHaveProperty("decisionCode");
  });
});
