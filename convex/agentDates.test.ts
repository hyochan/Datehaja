/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, internal } from "./_generated/api";
import { conversationLimit, emailReportFor } from "./agentDates";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
// Drive scheduled callbacks explicitly; prevent jobs from another scenario from
// firing inside a later test's mocked model request.
beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });
const NOW = Date.now();
const createTestBackend = () => convexTest(schema, modules);
type TestBackend = ReturnType<typeof createTestBackend>;

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
        preferredLocale: name === "Bob Kim" ? "en-US" : "ko-KR",
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
          // Aster predates the painted bases (no gender); the other agent picked the man.
          ...(agentName === "Aster" ? {} : { gender: "male" as const }),
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
      await ctx.db.insert("preferences", {
        userId,
        matchLocationScope: "city",
        preferredCountryCodes: ["KR"],
        preferredCities: ["Seoul"],
        allowTranslatedDates: false,
        ageMin: 18,
        ageMax: 100,
        ageHard: true,
        maxDistanceKm: 30,
        distanceHard: false,
        preferredAreas: [],
        areaHard: false,
        relationshipIntent: "open",
        intentHard: false,
        smoking: "no_preference",
        smokingHard: false,
        alcohol: "no_preference",
        alcoholHard: false,
        preferredDateTypes: ["film", "coffee"],
        budgetMinPerPerson: 20_000,
        budgetMaxPerPerson: 80_000,
        currency: "KRW",
        budgetHard: false,
        dayPreference: "either",
        indoorOutdoor: "either",
        atmosphere: "either",
        dietary: [],
        accessibility: [],
        notifyEmail: false,
        notifyInvitations: true,
        notifyConfirmations: true,
        notifyReminders: false,
        dropsPaused: false,
        maxDropsPerWeek: 3,
        allowDemoMatches: true,
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
    const bob = await person("Bob Kim", "bob@test.invalid", "man", "Bori");
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


/**
 * `finish` runs from `finalize` on a live conversation, so put the row in that
 * state and return the staleness guard it checks. Deriving the count keeps the
 * tests honest when a scenario changes how many turns it plans.
 */
async function readyToFinish(t: TestBackend, dateId: Id<"agentDates">) {
  return await t.run(async (ctx) => {
    const date = (await ctx.db.get("agentDates", dateId))!;
    await ctx.db.patch("agentDates", dateId, {
      status: "running",
      completedAt: undefined,
    });
    return conversationLimit(date);
  });
}

describe("recovering a failed review without replaying the encounter", () => {
  async function failed(t: TestBackend) {
    const s = await setup(t);
    await t.run(async ctx => {
      await ctx.db.patch("agentDates", s.agentDateId, { status: "failed", initiatorVerdict: "pending", counterpartVerdict: "pending", initiatorReason: "", counterpartReason: "" });
      for (let round = 2; round <= 6; round++) await ctx.db.insert("agentDateTurns", {
        agentDateId: s.agentDateId, round, speakerUserId: round % 2 ? s.alice : s.bob,
        speakerAgentName: round % 2 ? "Aster" : "Bori", content: `Original line ${round}`, subtext: "Private", createdAt: NOW + round,
      });
    });
    return s;
  }
  test("only a participant may retry a complete failed conversation; duplicate requests schedule once", async () => {
    const t = createTestBackend(); const s = await failed(t);
    await expect(asUser(t, s.carol).mutation(api.agentDates.retryReview, { agentDateId: s.agentDateId })).rejects.toThrow("Date not found");
    await expect(t.mutation(api.agentDates.retryReview, { agentDateId: s.agentDateId })).rejects.toThrow("Not signed in");
    await asUser(t, s.alice).mutation(api.agentDates.retryReview, { agentDateId: s.agentDateId });
    await asUser(t, s.bob).mutation(api.agentDates.retryReview, { agentDateId: s.agentDateId });
    const view = await asUser(t, s.alice).query(api.agentDates.get, { agentDateId: s.agentDateId });
    expect(view?.date).toMatchObject({ status: "failed", canRetryReview: false, reviewRetrying: true });
    const jobs = await t.run(ctx => ctx.db.system.query("_scheduled_functions").collect());
    expect(jobs).toHaveLength(2); // one re-review and its timeout guard
    expect((await t.run(ctx => ctx.db.get("agentDates", s.agentDateId)))?.reviewRetryCount).toBe(1);
  });
  test("does not offer a review retry for a truncated conversation", async () => {
    const t = createTestBackend(); const s = await setup(t);
    await t.run(ctx => ctx.db.patch("agentDates", s.agentDateId, { status: "failed" }));
    expect((await asUser(t, s.alice).query(api.agentDates.get, { agentDateId: s.agentDateId }))?.date.canRetryReview).toBe(false);
    await expect(asUser(t, s.alice).mutation(api.agentDates.retryReview, { agentDateId: s.agentDateId })).rejects.toThrow("did not finish");
  });
  test("saves verified notes without changing history, memory, search, consent, or sending an introduction", async () => {
    const t = createTestBackend(); const s = await failed(t);
    await t.mutation(internal.scouting.begin, { userId: s.alice, accessMode: "demo" });
    await asUser(t, s.alice).mutation(api.scouting.pause, {});
    const snapshot = () => t.run(async ctx => ({
      turns: await ctx.db.query("agentDateTurns").collect(), agents: await ctx.db.query("agentProfiles").collect(),
      searches: await ctx.db.query("agentSearches").collect(), notifications: await ctx.db.query("notifications").collect(),
      emails: await ctx.db.query("emailMessages").collect(), messages: await ctx.db.query("agentMessages").collect(),
    }));
    const before = await snapshot();
    await asUser(t, s.alice).mutation(api.agentDates.retryReview, { agentDateId: s.agentDateId });
    const retry = (await t.run(ctx => ctx.db.get("agentDates", s.agentDateId)))!.reviewRetryStartedAt!;
    const finished = { agentDateId: s.agentDateId, expectedTurns: 6, recoveryStartedAt: retry,
      aVerdict: "encourage" as const, bVerdict: "encourage" as const, aReason: "Verified own note.", bReason: "Other private note.",
      aDecisionCode: "strong_alignment" as const, bDecisionCode: "strong_alignment" as const,
      aNextSearchNote: "New tentative lesson.", bNextSearchNote: "Other lesson.", score: 70, summary: "Saved conversation.", sparks: [], frictions: [], demoConsent: "yes" as const };
    await t.mutation(internal.agentDates.finish, { ...finished, recoveryStartedAt: retry - 1 });
    expect((await t.run(ctx => ctx.db.get("agentDates", s.agentDateId)))?.status).toBe("failed");
    await t.mutation(internal.agentDates.finish, finished);
    await t.mutation(internal.agentDates.finish, finished);
    await t.mutation(internal.agentDates.fail, { agentDateId: s.agentDateId, recoveryStartedAt: retry, reason: "Late timeout" });
    expect(await snapshot()).toEqual(before);
    const view = await asUser(t, s.alice).query(api.agentDates.get, { agentDateId: s.agentDateId });
    expect(view?.date).toMatchObject({ status: "closed", introductionReady: false, reviewRetrying: false, reviewRecoveredAt: expect.any(Number) });
    expect(view?.mine).toMatchObject({ reason: "Verified own note.", consent: "pending" });
    expect(view?.counterpart).toMatchObject({ verdict: null, consent: "sealed", contactEmail: null });
    expect(JSON.stringify(view)).not.toContain("Other private note.");
  });
  test("a failed or timed-out retry preserves pending judgments and can be tried again within the limit", async () => {
    const t = createTestBackend(); const s = await failed(t);
    await asUser(t, s.alice).mutation(api.agentDates.retryReview, { agentDateId: s.agentDateId });
    const date = (await t.run(ctx => ctx.db.get("agentDates", s.agentDateId)))!;
    await t.mutation(internal.agentDates.fail, { agentDateId: s.agentDateId, recoveryStartedAt: date.reviewRetryStartedAt, reason: "Verifier unavailable" });
    const view = await asUser(t, s.alice).query(api.agentDates.get, { agentDateId: s.agentDateId });
    expect(view?.date).toMatchObject({ status: "failed", canRetryReview: true, reviewRetrying: false });
    expect(view?.mine).toMatchObject({ verdict: "pending", reason: "", consent: "pending" });
    await t.run(ctx => ctx.db.patch("agentDates", s.agentDateId, { reviewRetryCount: 3 }));
    await expect(asUser(t, s.alice).mutation(api.agentDates.retryReview, { agentDateId: s.agentDateId })).rejects.toThrow("limit reached");
  });
  test("only a recovered closed review can be checked again, and an old timeout cannot stop the new attempt", async () => {
    const t = createTestBackend(); const s = await failed(t);
    await t.run(ctx => ctx.db.patch("agentDates", s.agentDateId, { status: "closed", initiatorConsent: "no" }));
    await asUser(t, s.alice).mutation(api.agentDates.retryReview, { agentDateId: s.agentDateId });
    expect((await t.run(ctx => ctx.db.get("agentDates", s.agentDateId)))?.status).toBe("closed");
    await t.run(ctx => ctx.db.patch("agentDates", s.agentDateId, { reviewRecoveredAt: NOW, reviewRetryCount: 1 }));
    await asUser(t, s.alice).mutation(api.agentDates.retryReview, { agentDateId: s.agentDateId });
    const first = (await t.run(ctx => ctx.db.get("agentDates", s.agentDateId)))!;
    await t.mutation(internal.agentDates.fail, { agentDateId: s.agentDateId, recoveryStartedAt: first.reviewRetryStartedAt, reason: "Temporary failure" });
    // The row is shared. A failed re-check must not leave the counterpart, who
    // closed this date, looking at a technical failure over their own decision.
    const afterFailure = (await t.run(ctx => ctx.db.get("agentDates", s.agentDateId)))!;
    expect(afterFailure.status).toBe("closed");
    expect(afterFailure.reviewRecoveredAt).toBe(NOW);
    await asUser(t, s.alice).mutation(api.agentDates.retryReview, { agentDateId: s.agentDateId });
    const second = (await t.run(ctx => ctx.db.get("agentDates", s.agentDateId)))!;
    expect(second.reviewRetryStartedAt).not.toBe(first.reviewRetryStartedAt);
    await t.mutation(internal.agentDates.fail, { agentDateId: s.agentDateId, recoveryStartedAt: first.reviewRetryStartedAt, reason: "Stale timeout" });
    const current = (await t.run(ctx => ctx.db.get("agentDates", s.agentDateId)))!;
    expect(current.reviewRetryStartedAt).toBe(second.reviewRetryStartedAt);
    expect(current.initiatorConsent).toBe("no");
  });
  test("a delayed journal can fill only the same completed transcript and cannot replace verified work", async () => {
    const t = createTestBackend(); const s = await failed(t);
    await t.run(ctx => ctx.db.patch("agentDates", s.agentDateId, { status: "closed", completedAt: NOW, initiatorReason: "Verified letter", reviewRecoveredAt: NOW }));
    const journal = { overview: "Original saved activity", events: [{ kind: "conversation" as const, title: "Talking", detail: "They talked.", sceneKind: "cafe" as const, rounds: [1, 2, 3, 4, 5, 6] }] };
    const args = { agentDateId: s.agentDateId, completedAt: NOW, expectedTurns: 6, journal };
    await t.mutation(internal.agentDates.storeActivityJournal, { ...args, completedAt: NOW - 1 });
    await t.mutation(internal.agentDates.storeActivityJournal, { ...args, expectedTurns: 5 });
    expect((await t.run(ctx => ctx.db.get("agentDates", s.agentDateId)))?.activityJournal).toBeUndefined();
    await t.mutation(internal.agentDates.storeActivityJournal, args);
    await t.mutation(internal.agentDates.storeActivityJournal, { ...args, journal: { ...journal, overview: "Duplicate replacement" } });
    const date = (await t.run(ctx => ctx.db.get("agentDates", s.agentDateId)))!;
    expect(date.activityJournal).toEqual(journal);
    expect(date.initiatorReason).toBe("Verified letter");
    expect(date.status).toBe("closed");
    expect(date.initiatorConsent).toBe("pending");
    expect(await t.run(ctx => ctx.db.query("notifications").collect())).toEqual([]);
  });
});

describe("agent-date privacy and human consent", () => {
  test("each speaking Agent receives its owner's selected relationship intent, never the counterpart's preferences", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    await t.run(async ctx => {
      await ctx.db.patch("agentDates", s.agentDateId, { status: "running" });
      for (const [userId, intent] of [[s.alice, "serious"], [s.bob, "casual"]] as const) {
        const preferences = await ctx.db.query("preferences").withIndex("by_user", q => q.eq("userId", userId)).unique();
        await ctx.db.patch("preferences", preferences!._id, { relationshipIntent: intent });
      }
    });
    let sent = "";
    vi.stubEnv("OPENAI_API_KEY", "test-only");
    vi.stubGlobal("fetch", vi.fn(async (_url, options) => {
      sent = JSON.parse(options.body).input;
      return new Response(JSON.stringify({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify({ reply: "I am looking for something casual.", subtext: "Private", ends_conversation: false }) }] }] }), { status: 200 });
    }));
    try {
      await t.action(internal.agentDates.runTurn, { agentDateId: s.agentDateId, round: 2 });
      const input = JSON.parse(sent);
      expect(input.your_private_owner_brief.relationship_intent).toBe("casual");
      expect(input).not.toHaveProperty("aPreferences");
      expect(input).not.toHaveProperty("bPreferences");
      expect(sent).not.toContain('"serious"');
    } finally { vi.unstubAllGlobals(); vi.unstubAllEnvs(); }
  });

  test("a failed review saves the dialogue without fabricating a curious verdict", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    await t.run(async ctx => {
      await ctx.db.patch("agentDates", s.agentDateId, { status: "running", initiatorVerdict: "pending", counterpartVerdict: "pending" });
      for (let round = 2; round <= 6; round++) await ctx.db.insert("agentDateTurns", {
        agentDateId: s.agentDateId, round, speakerUserId: round % 2 ? s.alice : s.bob,
        speakerAgentName: round % 2 ? "Aster" : "Bori", content: `Saved reply ${round}`, subtext: "Private", createdAt: NOW + round,
      });
    });
    vi.stubEnv("OPENAI_API_KEY", "test-only");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: { code: "invalid_api_key", message: "Test review failure" } }), { status: 401 })));
    try {
      await t.action(internal.agentDates.finalize, { agentDateId: s.agentDateId });
      const context = await t.query(internal.agentDates.runContext, { agentDateId: s.agentDateId });
      expect(context?.date.status).toBe("failed");
      expect(context?.date.initiatorVerdict).toBe("pending");
      expect(context?.date.counterpartVerdict).toBe("pending");
      expect(context?.turns).toHaveLength(6);
    } finally { vi.unstubAllGlobals(); vi.unstubAllEnvs(); }
  });

  test("a chosen ending allows one farewell, blocks extra turns and cannot be extended", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    await t.run(ctx => ctx.db.patch("agentDates", s.agentDateId, { status: "running" }));
    const turn = { agentDateId: s.agentDateId, speakerUserId: s.bob, speakerAgentName: "Bori", content: "Let's finish our tea and leave here.", subtext: "Private", nextDelayMs: 1000, nextActivity: "thinking" as const };
    await t.mutation(internal.agentDates.storeTurnAndSchedule, { ...turn, round: 2 });
    await t.mutation(internal.agentDates.storeTurnAndSchedule, { ...turn, round: 3, endsConversation: true });
    await t.mutation(internal.agentDates.storeTurnAndSchedule, { ...turn, round: 4, content: "All right, take care." });
    await t.mutation(internal.agentDates.storeTurnAndSchedule, { ...turn, round: 5, content: "An unwanted new question" });
    await t.mutation(internal.agentDates.continueConversation, { agentDateId: s.agentDateId, aQuestion: "One more question?", bQuestion: "" });
    const context = await t.query(internal.agentDates.runContext, { agentDateId: s.agentDateId });
    expect(context?.date.closingAfterRound).toBe(4);
    expect(context?.date.plannedTurns).not.toBe(10);
    expect(context?.turns).toHaveLength(4);
    const finish = { agentDateId: s.agentDateId, expectedTurns: 6, aVerdict: "pass" as const, bVerdict: "curious" as const, aReason: "We chose to leave.", bReason: "Still uncertain.", aDecisionCode: "intent_mismatch" as const, bDecisionCode: "insufficient_signal" as const, aNextSearchNote: "Seek shared intent.", bNextSearchNote: "Learn more next time.", score: 30, summary: "They finished their tea.", sparks: [], frictions: [], demoConsent: "pending" as const };
    await t.mutation(internal.agentDates.finish, finish);
    expect((await t.run(ctx => ctx.db.get("agentDates", s.agentDateId)))?.status).toBe("running");
    await t.mutation(internal.agentDates.finish, { ...finish, expectedTurns: 4 });
    expect((await t.run(ctx => ctx.db.get("agentDates", s.agentDateId)))?.status).toBe("debrief_ready");
  });

  test("one unverified letter withholds both introductions and cannot become scouting memory", async () => {
    const t = convexTest(schema, modules), s = await setup(t);
    await t.run(async ctx => {
      await ctx.db.patch("agentDates", s.agentDateId, { status: "running", isSearchEncounter: true, initiatorVerdict: "pending", counterpartVerdict: "pending", initiatorReason: "", counterpartReason: "" });
      for (let round = 2; round <= 6; round++) await ctx.db.insert("agentDateTurns", { agentDateId: s.agentDateId, round, speakerUserId: round % 2 ? s.alice : s.bob, speakerAgentName: round % 2 ? "Aster" : "Bori", content: `Original saved reply ${round}`, subtext: "Private", createdAt: NOW + round });
    });
    const requests: string[] = [];
    vi.stubEnv("OPENAI_API_KEY", "test-only");
    vi.stubGlobal("fetch", vi.fn(async (_url, options) => {
      const r = JSON.parse(options.body), input = JSON.parse(r.input);
      requests.push(r.text.format.name);
      const value = r.text.format.name === "agent_date_review_audit"
        ? input.source.your_agent === "Aster"
          ? { supported: false, issues: [{ field: "reason", claim: "UNSUPPORTED_STORY", correction: "The other speaker did not make that choice.", source_rounds: [1, 2] }] }
          : { supported: true, issues: [] }
        : { verdict: "encourage", compatibility_score: 70, reason: "UNSUPPORTED_STORY", next_search_note: "UNVERIFIED_MEMORY", decision_code: "strong_alignment", summary: "UNVERIFIED_SUMMARY", sparks: [], frictions: [], followup_question: "", headline: "A choice in the scene", anchor_round: 2, question: "How did that choice feel?" };
      const response = Object.fromEntries(Object.entries(value).filter(([key]) => r.text.format.schema.required.includes(key)));
      return new Response(JSON.stringify({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(response) }] }] }));
    }));
    try {
      await t.action(internal.agentDates.finalize, { agentDateId: s.agentDateId });
      const context = (await t.query(internal.agentDates.runContext, { agentDateId: s.agentDateId }))!;
      expect(context.date).toMatchObject({ status: "failed", initiatorVerdict: "pending", counterpartVerdict: "pending", initiatorReason: "", counterpartReason: "", initiatorConsent: "pending", counterpartConsent: "pending" });
      expect(context.turns).toHaveLength(6);
      expect(context.aAgent?.scoutingMemory ?? "").not.toContain("UNVERIFIED");
      expect(context.bAgent?.scoutingMemory ?? "").not.toContain("UNVERIFIED");
      expect(requests.filter(n => n === "agent_date_verdict")).toHaveLength(4);
      expect(requests.filter(n => n === "agent_date_review_audit")).toHaveLength(4);
      expect(await t.run(ctx => ctx.db.query("emailMessages").collect())).toHaveLength(0);
      expect(await t.run(ctx => ctx.db.query("notifications").collect())).toHaveLength(0);
      const view = (await asUser(t, s.alice).query(api.agentDates.get, { agentDateId: s.agentDateId }))!;
      expect(view.date.introductionReady).toBe(false);
      expect(view.counterpart.contactEmail).toBeNull();
      await expect(asUser(t, s.alice).mutation(api.agentDates.consent, { agentDateId: s.agentDateId, decision: "yes" })).rejects.toThrow();
    } finally { vi.unstubAllGlobals(); vi.unstubAllEnvs(); }
  });

  test("a wholly fictional showcase uses the requested language without changing real matching boundaries", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    await t.run(async ctx => {
      for (const userId of [s.carol, s.bob]) {
        const profile = await ctx.db.query("profiles").withIndex("by_user", q => q.eq("userId", userId)).unique();
        await ctx.db.patch("profiles", profile!._id, { isDemo: true });
      }
    });
    const id = await t.mutation(internal.agentDates.createRequest, { userId: s.carol, accessMode: "demo", demoOnly: true, locale: "en-US" });
    expect((await t.run(ctx => ctx.db.get("agentDates", id)))?.locale).toBe("en-US");
  });

  test("new dates can save all sixteen lines, preserve privacy and ignore stale six-line reviews", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    await t.run(async ctx => {
      await ctx.db.patch("agentDates", s.agentDateId, { status: "running", plannedTurns: 12 });
      for (let round = 2; round <= 12; round++) await ctx.db.insert("agentDateTurns", {
        agentDateId: s.agentDateId, round, speakerUserId: round % 2 ? s.alice : s.bob,
        speakerAgentName: round % 2 ? "Aster" : "Bori", content: `Public line ${round}`, subtext: "Hidden stage note", createdAt: NOW + round,
      });
    });
    await t.mutation(internal.agentDates.continueConversation, { agentDateId: s.agentDateId, aQuestion: "Private followup", bQuestion: "" });
    for (let round = 13; round <= 17; round++) await t.mutation(internal.agentDates.storeTurnAndSchedule, {
      agentDateId: s.agentDateId, round, speakerUserId: round % 2 ? s.alice : s.bob, speakerAgentName: round % 2 ? "Aster" : "Bori",
      content: `Public line ${round}`, subtext: "Hidden stage note", nextDelayMs: 1000, nextActivity: "thinking",
    });
    const own = await asUser(t, s.alice).query(api.agentDates.get, { agentDateId: s.agentDateId });
    expect(own?.turns).toHaveLength(16);
    expect(own?.turns.at(-1)?.content).toBe("Public line 16");
    const delivery = await t.query(internal.agentDates.deliveryContext, { agentDateId: s.agentDateId });
    expect(delivery?.turns).toHaveLength(16);
    expect(delivery && emailReportFor(delivery, "a").totalMoments).toBe(16);
    expect(JSON.stringify(own)).not.toContain("Hidden stage note");
    expect(JSON.stringify(own)).not.toContain("Private followup");
    await expect(asUser(t, s.carol).query(api.agentDates.get, { agentDateId: s.agentDateId })).rejects.toThrow();
  });

  test("a clarification is durable, bounded, and never exposes either private question", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    await t.run(async ctx => {
      await ctx.db.patch("agentDates", s.agentDateId, { status: "running" });
      for (let round = 2; round <= 6; round++) await ctx.db.insert("agentDateTurns", {
        agentDateId: s.agentDateId, round, speakerUserId: round % 2 ? s.alice : s.bob,
        speakerAgentName: round % 2 ? "Aster" : "Bori", content: `Saved reply ${round}`, subtext: "Private", createdAt: NOW + round,
      });
    });
    const args = { agentDateId: s.agentDateId, aQuestion: "A-private followup", bQuestion: "B-private followup" };
    await t.mutation(internal.agentDates.continueConversation, args);
    await t.mutation(internal.agentDates.continueConversation, args);
    const initial = await t.run(async ctx => ({ date: await ctx.db.get("agentDates", s.agentDateId), jobs: await ctx.db.system.query("_scheduled_functions").collect() }));
    expect(initial.date?.plannedTurns).toBe(10);
    expect(initial.jobs).toHaveLength(1);
    for (let round = 7; round <= 11; round++) await t.mutation(internal.agentDates.storeTurnAndSchedule, {
      agentDateId: s.agentDateId, round, speakerUserId: round % 2 ? s.alice : s.bob,
      speakerAgentName: round % 2 ? "Aster" : "Bori", content: `Saved reply ${round}`, subtext: "Private", nextDelayMs: 1000, nextActivity: "thinking",
    });
    const context = await t.query(internal.agentDates.runContext, { agentDateId: s.agentDateId });
    expect(context?.turns).toHaveLength(10);
    for (const userId of [s.alice, s.bob]) {
      const shown = await asUser(t, userId).query(api.agentDates.get, { agentDateId: s.agentDateId });
      expect(shown?.turns).toHaveLength(10);
      expect(JSON.stringify(shown)).not.toContain("private followup");
    }
    const finish = {
      agentDateId: s.agentDateId, expectedTurns: 6, aVerdict: "encourage" as const, bVerdict: "encourage" as const,
      aReason: "An old review", bReason: "An old review", aDecisionCode: "strong_alignment" as const, bDecisionCode: "strong_alignment" as const,
      aNextSearchNote: "Old lesson", bNextSearchNote: "Old lesson", score: 80, summary: "Old", sparks: [], frictions: [], demoConsent: "pending" as const,
    };
    await t.mutation(internal.agentDates.finish, finish);
    expect((await t.run(ctx => ctx.db.get("agentDates", s.agentDateId)))?.status).toBe("running");
    await t.mutation(internal.agentDates.finish, { ...finish, expectedTurns: 10 });
    expect((await t.run(ctx => ctx.db.get("agentDates", s.agentDateId)))?.status).toBe("debrief_ready");
  });
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

  test("projects each recipient's persisted locale for email delivery", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);

    const context = await t.query(internal.agentDates.deliveryContext, {
      agentDateId: s.agentDateId,
    });

    expect(context?.a.locale).toBe("ko-KR");
    expect(context?.b.locale).toBe("en-US");
    expect(context?.a.gender).toBeUndefined();
    expect(context?.b.gender).toBe("male");
    expect(context?.turns).toMatchObject([
      {
        round: 1,
        speakerAgentName: "Aster",
        content: "What makes quiet feel companionable to your person?",
      },
    ]);
    expect(JSON.stringify(context)).not.toContain(
      "Private internal inference that must never leave the backend.",
    );
  });

  test("ships each side's painted sprite in the debrief email", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    const context = await t.query(internal.agentDates.deliveryContext, {
      agentDateId: s.agentDateId,
    });
    const previous = process.env.SITE_URL;
    process.env.SITE_URL = "https://datehaja.com";
    try {
      const forAlice = emailReportFor(context!, "a");
      const forBob = emailReportFor(context!, "b");
      expect(forAlice.ownerSpriteUrl).toBe(
        "https://datehaja.com/agents/v3/female-rose-curious.png",
      );
      expect(forAlice.counterpartSpriteUrl).toBe(
        "https://datehaja.com/agents/v3/male-sky-curious.png",
      );
      expect(forBob.ownerSpriteUrl).toBe(forAlice.counterpartSpriteUrl);
    } finally {
      process.env.SITE_URL = previous;
    }
  });

  test("never points a debrief sprite at a host an inbox cannot reach", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    const context = await t.query(internal.agentDates.deliveryContext, {
      agentDateId: s.agentDateId,
    });
    const previousSite = process.env.SITE_URL;
    const previousAssets = process.env.EMAIL_ASSET_ORIGIN;
    // What a development deployment actually carries.
    process.env.SITE_URL = "http://localhost:5173";
    delete process.env.EMAIL_ASSET_ORIGIN;
    try {
      const report = emailReportFor(context!, "a");
      expect(report.ownerSpriteUrl).toBe(
        "https://datehaja.com/agents/v3/female-rose-curious.png",
      );
      expect(report.counterpartSpriteUrl).not.toContain("localhost");

      process.env.EMAIL_ASSET_ORIGIN = "https://staging.example.com";
      expect(emailReportFor(context!, "a").ownerSpriteUrl).toBe(
        "https://staging.example.com/agents/v3/female-rose-curious.png",
      );
    } finally {
      process.env.SITE_URL = previousSite;
      if (previousAssets === undefined) delete process.env.EMAIL_ASSET_ORIGIN;
      else process.env.EMAIL_ASSET_ORIGIN = previousAssets;
    }
  });

  test("lets an existing owner persist email locale and matching boundaries", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    const carol = asUser(t, s.carol);

    await carol.mutation(api.profiles.setPreferredLocale, { locale: "ja-JP" });
    await carol.mutation(api.profiles.saveAgentMatchingBoundaries, {
      languages: ["Korean", "Japanese"],
      matchLocationScope: "selected_cities",
      preferredCountryCodes: ["JP"],
      preferredCities: ["Tokyo"],
      preferredAreas: [],
      allowTranslatedDates: true,
    });

    const [profile, preferences] = await t.run(async (ctx) => [
      await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", s.carol))
        .unique(),
      await ctx.db
        .query("preferences")
        .withIndex("by_user", (q) => q.eq("userId", s.carol))
        .unique(),
    ]);
    expect(profile?.preferredLocale).toBe("ja-JP");
    expect(profile?.languages).toEqual(["Korean", "Japanese"]);
    expect(preferences?.preferredCountryCodes).toEqual(["JP"]);
    expect(preferences?.preferredCities).toEqual(["Tokyo"]);
    expect(preferences?.allowTranslatedDates).toBe(true);
  });

  test("rejects unsupported persisted locales and cities", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    const carol = asUser(t, s.carol);

    await expect(
      carol.mutation(api.profiles.setPreferredLocale, { locale: "xx-XX" }),
    ).rejects.toThrow("supported language");
    await expect(
      carol.mutation(api.profiles.saveAgentMatchingBoundaries, {
        languages: ["Korean"],
        matchLocationScope: "selected_cities",
        preferredCountryCodes: ["KR"],
        preferredCities: ["Atlantis"],
        preferredAreas: [],
        allowTranslatedDates: false,
      }),
    ).rejects.toThrow("supported matching cities");
  });

  test("localizes stored notifications independently for both recipients", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);

    await t.mutation(internal.agentDates.finish, {
      agentDateId: s.agentDateId,
      expectedTurns: await readyToFinish(t, s.agentDateId),
      aVerdict: "encourage",
      bVerdict: "encourage",
      aReason: "조금 더 알아볼 가치가 있어요.",
      bReason: "One more conversation could be worthwhile.",
      aDecisionCode: "worth_exploring",
      bDecisionCode: "worth_exploring",
      aNextSearchNote: "",
      bNextSearchNote: "",
      score: 70,
      summary: "A balanced date.",
      sparks: [],
      frictions: [],
      demoConsent: "pending",
    });

    const [aliceNotifications, bobNotifications] = await t.run(async (ctx) => [
      await ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", s.alice))
        .take(10),
      await ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", s.bob))
        .take(10),
    ]);
    expect(aliceNotifications.at(-1)?.title).toBe("소개하고 싶은 상대를 찾았어요");
    expect(bobNotifications.at(-1)?.title).toBe("Someone worth bringing home");
  });

  test("blocks scouting until explicit matching boundaries are complete", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    await t.run(async (ctx) => {
      const preferences = await ctx.db
        .query("preferences")
        .withIndex("by_user", (q) => q.eq("userId", s.carol))
        .unique();
      if (!preferences) throw new Error("Expected preferences.");
      await ctx.db.patch("preferences", preferences._id, {
        matchLocationScope: undefined,
      });
    });

    await expect(
      t.mutation(internal.agentDates.createRequest, {
        userId: s.carol,
        accessMode: "demo",
        locale: "ko-KR",
      }),
    ).rejects.toThrow("Finish choosing where");
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
      expectedTurns: await readyToFinish(t, s.agentDateId),
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


  test("learns from a date that went well, not only from a pass", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);

    await t.mutation(internal.agentDates.finish, {
      agentDateId: s.agentDateId,
      expectedTurns: await readyToFinish(t, s.agentDateId),
      aVerdict: "encourage",
      bVerdict: "curious",
      aReason: "Meet this one.",
      bReason: "Worth one more conversation.",
      aDecisionCode: "strong_alignment",
      bDecisionCode: "worth_exploring",
      aNextSearchNote: "Look again for someone who names the awkward thing first.",
      bNextSearchNote: "Find out earlier how they handle a changed plan.",
      score: 82,
      summary: "Easy company.",
      sparks: ["Comfortable silence"],
      frictions: ["Different pace"],
      demoConsent: "pending",
    });

    const memories = await t.run(async (ctx) => {
      const read = async (userId: typeof s.alice) =>
        (
          await ctx.db
            .query("agentProfiles")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .unique()
        )?.scoutingMemory ?? "";
      return { alice: await read(s.alice), bob: await read(s.bob) };
    });

    // An encourage is the strongest evidence of what this person wants, and it
    // used to leave nothing behind at all.
    expect(memories.alice).toContain("names the awkward thing first");
    expect(memories.bob).toContain("how they handle a changed plan");
  });

  test("keeps the six most recent lessons and never repeats one", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);

    for (let round = 1; round <= 8; round += 1) {
      await t.mutation(internal.agentDates.finish, {
        agentDateId: s.agentDateId,
        expectedTurns: await readyToFinish(t, s.agentDateId),
        aVerdict: "curious",
        bVerdict: "curious",
        aReason: "Still curious.",
        bReason: "Still curious.",
        aDecisionCode: "worth_exploring",
        bDecisionCode: "worth_exploring",
        // Round 8 repeats round 7 verbatim, as a model easily would.
        aNextSearchNote: `Lesson ${round === 8 ? 7 : round}`,
        bNextSearchNote: "Unchanged",
        score: 60,
        summary: "",
        sparks: [],
        frictions: [],
        demoConsent: "pending",
      });
    }

    const lines = await t.run(async (ctx) =>
      (
        (
          await ctx.db
            .query("agentProfiles")
            .withIndex("by_user", (q) => q.eq("userId", s.alice))
            .unique()
        )?.scoutingMemory ?? ""
      )
        .split("\n")
        .filter(Boolean),
    );

    expect(lines).toHaveLength(6);
    expect(lines.at(-1)).toContain("Lesson 7");
    // The window holds the newest six, so the first rounds have rolled off.
    expect(lines.join("\n")).not.toContain("Lesson 1");
    // A repeat moves to the end rather than occupying two slots.
    expect(lines.filter((line) => line.includes("Lesson 7"))).toHaveLength(1);
  });
});


describe("private keepsakes and quieter demo delivery", () => {
  test("projects only the owner's selected moment and question, including after mutual consent", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    const a = { headline: "Alice-only headline", anchorRound: 2, question: "Alice-only question" };
    const b = { headline: "Bob-only headline", anchorRound: 4, question: "Bob-only question" };
    await t.run(async (ctx) => ctx.db.patch("agentDates", s.agentDateId, {
      initiatorReflection: a, counterpartReflection: b, status: "connected", initiatorConsent: "yes", counterpartConsent: "yes",
      initiatorNextSearchNote: "Alice-only lesson", counterpartNextSearchNote: "Bob-only lesson",
    }));
    const mine = await asUser(t, s.alice).query(api.agentDates.get, { agentDateId: s.agentDateId });
    expect(mine?.mine.reflection).toEqual(a);
    expect(JSON.stringify(mine)).not.toContain("Bob-only");
    const history = await asUser(t, s.alice).query(api.agentDates.listMine, {});
    expect(history[0]?.myHeadline).toBe(a.headline);
    expect(history[0]?.myNextSearchNote).toBe("Alice-only lesson");
    expect(JSON.stringify(history)).not.toContain("Bob-only");
    const otherHistory = await asUser(t, s.bob).query(api.agentDates.listMine, {});
    expect(otherHistory[0]?.myNextSearchNote).toBe("Bob-only lesson");
    expect(JSON.stringify(otherHistory)).not.toContain("Alice-only");
    const context = await t.query(internal.agentDates.deliveryContext, { agentDateId: s.agentDateId });
    expect(emailReportFor(context!, "a").reflection).toEqual(a);
    expect(JSON.stringify(emailReportFor(context!, "a"))).not.toContain("Bob-only");
    expect(emailReportFor(context!, "b").reflection).toEqual(b);
  });

  test("keeps demo attempts and non-matches out of the mailbox", async () => {
    const t = convexTest(schema, modules);
    const s = await setup(t);
    await t.run(ctx => ctx.db.patch("agentDates", s.agentDateId, { isDemoCounterpart: true }));
    await t.action(internal.agentDates.deliverDebriefs, { agentDateId: s.agentDateId });
    await t.run(ctx => ctx.db.patch("agentDates", s.agentDateId, { isDemoCounterpart: false, counterpartVerdict: "curious" }));
    await t.action(internal.agentDates.deliverDebriefs, { agentDateId: s.agentDateId });
    expect(await t.run(ctx => ctx.db.query("emailMessages").collect())).toEqual([]);
  });

  test("sends a mutual recommendation through each recipient's mail preferences", async () => {
    vi.stubEnv("SITE_URL", "https://datehaja.example");
    try {
      const t = convexTest(schema, modules);
      const s = await setup(t);
      await t.run(ctx => ctx.db.patch("agentDates", s.agentDateId, { isDemoCounterpart: false, initiatorVerdict: "encourage", counterpartVerdict: "encourage" }));
      await t.action(internal.agentDates.deliverDebriefs, { agentDateId: s.agentDateId });
      const messages = await t.run(ctx => ctx.db.query("emailMessages").collect());
      expect(messages).toHaveLength(2);
      expect(messages.every(message => message.status === "skipped_preference")).toBe(true);
    } finally { vi.unstubAllEnvs(); }
  });
});

describe("a durable search, with no manufactured matches", () => {
  beforeEach(() => { vi.spyOn(Date, "now").mockReturnValue(NOW); });
  afterEach(() => { vi.restoreAllMocks(); });
  const readSearch = (t: TestBackend, userId: Id<"users">) => t.run(ctx => ctx.db.query("agentSearches").withIndex("by_user", q => q.eq("userId", userId)).unique());
  async function begin(t: TestBackend, userId: Id<"users">) {
    await t.mutation(internal.scouting.begin, { userId, accessMode: "demo" });
    return (await readSearch(t, userId))!;
  }
  async function advance(t: TestBackend, userId: Id<"users">) {
    const session = (await readSearch(t, userId))!;
    vi.mocked(Date.now).mockReturnValue(session.nextCheckAt!);
    await t.mutation(internal.scouting.advance, { searchId: session._id, revision: session.revision, allowed: true });
    return (await readSearch(t, userId))!;
  }
  async function paired(t: TestBackend) {
    const s = await setup(t);
    await begin(t, s.bob); await begin(t, s.carol);
    const search = await advance(t, s.bob);
    return { ...s, dateId: search.currentDateId! };
  }
  async function finish(t: TestBackend, dateId: Id<"agentDates">, a: "encourage" | "curious" | "pass", b: "encourage" | "curious" | "pass") {
    await t.mutation(internal.agentDates.finish, {
      agentDateId: dateId, expectedTurns: await readyToFinish(t, dateId), aVerdict: a, bVerdict: b, aReason: "I preferred a different route.", bReason: "I would like another conversation.",
      aDecisionCode: a === "encourage" ? "strong_alignment" : "insufficient_signal", bDecisionCode: b === "encourage" ? "strong_alignment" : "insufficient_signal",
      aNextSearchNote: "Notice how they answer a changed plan.", bNextSearchNote: "Notice whether they ask before choosing for me.", score: 90,
      summary: "They chose different routes.", sparks: [], frictions: [], demoConsent: "pending",
    });
  }

  test("a restart releases both searches from an encounter whose worker died", async () => {
    const t = convexTest(schema, modules); const s = await paired(t);
    for (const userId of [s.bob, s.carol]) expect((await readSearch(t, userId))?.status).toBe("talking");

    // Convex does not retry a dead action, so nothing else will ever move this
    // date on. Both owners are stuck: start is a no-op and nobody may pair them.
    await t.run(ctx => ctx.db.patch("agentDates", s.dateId, { status: "running", nextTurnAt: NOW, updatedAt: NOW }));
    vi.mocked(Date.now).mockReturnValue(NOW + 60_000);
    await t.mutation(internal.scouting.begin, { userId: s.bob, accessMode: "demo" });
    expect((await readSearch(t, s.bob))?.status).toBe("talking");

    vi.mocked(Date.now).mockReturnValue(NOW + 16 * 60_000);
    await t.mutation(internal.scouting.begin, { userId: s.bob, accessMode: "demo" });
    expect((await t.run(ctx => ctx.db.get("agentDates", s.dateId)))?.status).toBe("failed");
    for (const userId of [s.bob, s.carol]) {
      expect((await readSearch(t, userId))?.status).toBe("searching");
      expect((await readSearch(t, userId))?.currentDateId).toBeUndefined();
    }
  });

  test("resuming a paused search also releases a dead encounter for the counterpart", async () => {
    const t = convexTest(schema, modules); const s = await paired(t);
    await t.run(ctx => ctx.db.patch("agentDates", s.dateId, { status: "running", nextTurnAt: NOW, updatedAt: NOW }));
    const bobSession = (await readSearch(t, s.bob))!;
    await t.run(ctx => ctx.db.patch("agentSearches", bobSession._id, { status: "paused" }));

    vi.mocked(Date.now).mockReturnValue(NOW + 16 * 60_000);
    await t.mutation(internal.scouting.begin, { userId: s.bob, accessMode: "demo" });

    // Freeing only the owner who pressed start would leave the row running and
    // the counterpart waiting on a date nobody will finish.
    expect((await t.run(ctx => ctx.db.get("agentDates", s.dateId)))?.status).toBe("failed");
    expect((await readSearch(t, s.carol))?.status).toBe("searching");
    expect((await readSearch(t, s.bob))?.status).toBe("searching");
  });

  test("a reply that never lands stops blocking the search once it goes stale", async () => {
    const t = convexTest(schema, modules); const s = await setup(t);
    await begin(t, s.bob); await begin(t, s.carol);
    const message = await t.run(ctx => ctx.db.insert("agentMessages", {
      userId: s.bob, role: "human", content: "Speak a little more like me.", createdAt: NOW,
    }));
    const agent = await t.run(ctx => ctx.db.query("agentProfiles").withIndex("by_user", q => q.eq("userId", s.bob)).unique());
    await t.run(ctx => ctx.db.patch("agentProfiles", agent!._id, { pendingReplyTo: message, pendingReplyAt: NOW }));

    // While the agent is genuinely learning, its owner waits rather than sending
    // a stale brief into a new encounter.
    expect((await advance(t, s.bob)).currentDateId).toBeUndefined();

    // A reply that never arrives must not block dating for good.
    vi.mocked(Date.now).mockReturnValue(NOW + 6 * 60_000);
    const session = (await readSearch(t, s.bob))!;
    await t.mutation(internal.scouting.advance, { searchId: session._id, revision: session.revision, allowed: true });
    expect((await readSearch(t, s.bob))?.currentDateId).toBeDefined();
  });

  test("an empty pool stays waiting, without generating a demo, dialogue, or mail", async () => {
    const t = convexTest(schema, modules); const s = await setup(t);
    await begin(t, s.bob);
    const waiting = await advance(t, s.bob);
    expect(waiting).toMatchObject({ status: "waiting", encountersCompleted: 0, lastCheckedAt: NOW });
    expect(waiting.currentDateId).toBeUndefined();
    expect(waiting.nextCheckAt).toBe(NOW + 15 * 60_000);
    expect(await t.run(ctx => ctx.db.query("agentDates").collect())).toHaveLength(1);
    expect(await t.run(ctx => ctx.db.query("emailMessages").collect())).toHaveLength(0);
    await begin(t, s.bob); // Repeated clicks do not create more jobs or reset the clock.
    expect((await readSearch(t, s.bob))?.revision).toBe(waiting.revision);
  });

  test("only searching real Agents meet, and both workers claim one shared encounter", async () => {
    const t = convexTest(schema, modules); const s = await setup(t);
    await begin(t, s.bob); const oldCarol = await begin(t, s.carol);
    const bob = await advance(t, s.bob);
    const carol = await readSearch(t, s.carol);
    expect(bob.status).toBe("talking");
    expect(carol?.currentDateId).toBe(bob.currentDateId);
    await t.mutation(internal.scouting.advance, { searchId: oldCarol._id, revision: oldCarol.revision, allowed: true });
    const dates = await t.run(ctx => ctx.db.query("agentDates").collect());
    expect(dates).toHaveLength(2);
    expect(dates.find(date => date._id === bob.currentDateId)).toMatchObject({ isSearchEncounter: true, isDemoCounterpart: false });
  });

  test("a pass or uncertain conversation continues the search and never repeats the same pair", async () => {
    const t = convexTest(schema, modules); const s = await paired(t);
    await finish(t, s.dateId, "encourage", "curious");
    const next = await readSearch(t, s.bob);
    expect(next).toMatchObject({ status: "searching", encountersCompleted: 1 });
    expect(next?.nextCheckAt).toBeGreaterThan(NOW);
    const view = await asUser(t, s.bob).query(api.agentDates.get, { agentDateId: s.dateId });
    expect(view?.date.introductionReady).toBe(false);
    await expect(asUser(t, s.bob).mutation(api.agentDates.consent, { agentDateId: s.dateId, decision: "yes" })).rejects.toThrow("still searching");
    expect(await t.run(ctx => ctx.db.query("notifications").collect())).toHaveLength(0);
    await advance(t, s.bob);
    expect((await readSearch(t, s.bob))?.status).toBe("waiting");
    expect(await t.run(ctx => ctx.db.query("agentDates").collect())).toHaveLength(2);
  });

  test("mutual recommendations wait for two human yeses; a first yes reveals no contact", async () => {
    const t = convexTest(schema, modules); const s = await paired(t);
    await finish(t, s.dateId, "encourage", "encourage");
    expect(await readSearch(t, s.bob)).toMatchObject({ status: "match_ready", currentDateId: s.dateId });
    expect((await readSearch(t, s.bob))?.nextCheckAt).toBeUndefined();
    await asUser(t, s.bob).mutation(api.agentDates.consent, { agentDateId: s.dateId, decision: "yes" });
    const carolView = await asUser(t, s.carol).query(api.agentDates.get, { agentDateId: s.dateId });
    expect(carolView?.counterpart.contactEmail).toBeNull();
    expect(carolView?.counterpart.consent).toBe("sealed");
    await asUser(t, s.carol).mutation(api.agentDates.consent, { agentDateId: s.dateId, decision: "yes" });
    expect((await readSearch(t, s.bob))?.status).toBe("connected");
    expect((await readSearch(t, s.carol))?.status).toBe("connected");
  });

  test("a human no resumes both searches without replaying their encounter", async () => {
    const t = convexTest(schema, modules); const s = await paired(t);
    await finish(t, s.dateId, "encourage", "encourage");
    await asUser(t, s.bob).mutation(api.agentDates.consent, { agentDateId: s.dateId, decision: "no" });
    expect((await readSearch(t, s.bob))?.status).toBe("searching");
    expect((await readSearch(t, s.carol))?.status).toBe("searching");
  });

  test("pausing invalidates old callbacks and stays paused after the current conversation", async () => {
    const t = convexTest(schema, modules); const s = await paired(t);
    const old = (await readSearch(t, s.bob))!;
    await asUser(t, s.bob).mutation(api.scouting.pause, {});
    await t.mutation(internal.scouting.advance, { searchId: old._id, revision: old.revision, allowed: true });
    await finish(t, s.dateId, "pass", "curious");
    expect((await readSearch(t, s.bob))?.status).toBe("paused");
    expect((await readSearch(t, s.bob))?.nextCheckAt).toBeUndefined();
    expect((await readSearch(t, s.carol))?.status).toBe("searching");
  });

  test("does not strand the search when a model call fails", async () => {
    const t = convexTest(schema, modules); const s = await paired(t);
    await t.mutation(internal.agentDates.fail, { agentDateId: s.dateId, reason: "Provider unavailable" });
    expect(await readSearch(t, s.bob)).toMatchObject({ status: "searching", encountersCompleted: 0 });
    expect((await t.run(ctx => ctx.db.get("agentDates", s.dateId)))?.status).toBe("failed");
  });

  test("continues through the candidate pool beyond its first page", async () => {
    const t = convexTest(schema, modules); const s = await setup(t);
    await t.run(async ctx => {
      const profile = (await ctx.db.query("profiles").withIndex("by_user", q => q.eq("userId", s.carol)).unique())!;
      const { _id, _creationTime, ...data } = profile; void _creationTime;
      await ctx.db.delete("profiles", _id);
      for (let i = 0; i < 45; i++) {
        const userId = await ctx.db.insert("users", { name: `Not searching ${i}` });
        await ctx.db.insert("profiles", { ...data, userId });
      }
      await ctx.db.insert("profiles", data);
    });
    await begin(t, s.bob); await begin(t, s.carol);
    const firstPage = await advance(t, s.bob);
    expect(firstPage.status).toBe("searching");
    expect(firstPage.cursor).not.toBeNull();
    const nextPage = await advance(t, s.bob);
    expect(nextPage.status).toBe("talking");
    expect((await t.run(ctx => ctx.db.get("agentDates", nextPage.currentDateId!)))?.counterpartUserId).toBe(s.carol);
  });
});


describe('relationship needs filter the real candidate pool', () => {
  beforeEach(() => { vi.spyOn(Date, 'now').mockReturnValue(NOW); });
  afterEach(() => { vi.restoreAllMocks(); });
  test.each([
    ['serious', 'serious', true], ['casual', 'casual', true], ['friendship', 'friendship', true],
    ['serious', 'casual', false], ['casual', 'serious', false], ['serious', 'open', false], ['open', 'serious', false],
    ['serious', 'unsure', false], ['unsure', 'serious', false], ['friendship', 'casual', false], ['casual', 'friendship', false],
    ['casual', 'open', true], ['open', 'casual', true], ['open', 'unsure', true], ['friendship', 'open', true],
  ] as const)('%s / %s is eligible: %s, even with identical interests', async (a, b, allowed) => {
    const t = createTestBackend(), s = await setup(t);
    for (const [userId, relationshipIntent] of [[s.bob, a], [s.carol, b]] as const) {
      await t.run(async ctx => {
        const preferences = (await ctx.db.query('preferences').withIndex('by_user', q => q.eq('userId', userId)).unique())!;
        await ctx.db.patch('preferences', preferences._id, { relationshipIntent, intentHard: false });
      });
      await t.mutation(internal.scouting.begin, { userId, accessMode: 'demo' });
    }
    const session = (await t.run(ctx => ctx.db.query('agentSearches').withIndex('by_user', q => q.eq('userId', s.bob)).unique()))!;
    await t.mutation(internal.scouting.advance, { searchId: session._id, revision: session.revision, allowed: true });
    const result = await t.run(ctx => ctx.db.query('agentSearches').withIndex('by_user', q => q.eq('userId', s.bob)).unique());
    expect(result?.status).toBe(allowed ? 'talking' : 'waiting');
    const dates = await t.run(ctx => ctx.db.query('agentDates').collect());
    expect(dates).toHaveLength(allowed ? 2 : 1);
    if (allowed) expect(dates.find(d => d._id === result?.currentDateId)?.counterpartUserId).toBe(s.carol);
    else expect(await t.run(ctx => ctx.db.query('emailMessages').collect())).toHaveLength(0);
  });
});
