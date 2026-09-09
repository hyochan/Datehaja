/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

function asUser(t: ReturnType<typeof convexTest>, userId: Id<"users">) {
  return t.withIdentity({ subject: userId, tokenIdentifier: `test|${userId}` });
}

async function setup(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const owner = await ctx.db.insert("users", {
      name: "Mina",
      email: "mina@test.invalid",
    });
    const stranger = await ctx.db.insert("users", {
      name: "Noah",
      email: "noah@test.invalid",
    });
    const outsider = await ctx.db.insert("users", {
      name: "Owen",
      email: "owen@test.invalid",
    });
    await ctx.db.insert("agentProfiles", {
      userId: owner,
      name: "Dali",
      essence: "Quiet at first, playful once a conversation feels safe.",
      desiredConnection: "Someone curious who can be direct without rushing.",
      boundaries: ["No pressure"],
      voice: "warm",
      autonomy: "suggest",
      privateMemory: "",
      status: "active",
      createdAt: 1,
      updatedAt: 1,
    });
    return { owner, stranger, outsider };
  });
}

describe("periodic Agent learning", () => {
  test("fresh Agent onboarding stores required matching boundaries", async () => {
    const t = convexTest(schema, modules);
    const owner = await t.run((ctx) =>
      ctx.db.insert("users", {
        name: "Rowan",
        email: "rowan@test.invalid",
      }),
    );

    await asUser(t, owner).mutation(api.agents.bootstrap, {
      displayName: "Rowan",
      dobMs: Date.UTC(1993, 5, 15),
      gender: "man",
      interestedIn: ["woman"],
      city: "Stockholm",
      neighborhood: "Södermalm",
      interests: ["Films", "Coffee", "Art galleries"],
      personalityTraits: ["Thoughtful", "Curious"],
      agentName: "Orbit",
      avatar: {
        palette: "rose",
        face: "gentle",
        hair: "wave",
        outfit: "cardigan",
        accessory: "star",
      },
      essence:
        "I am quiet at first, then warm and playful once I feel safe with someone.",
      desiredConnection:
        "Someone thoughtful who enjoys honest conversation and comfortable silence.",
      boundaries: ["No pressure"],
      voice: "warm",
      autonomy: "suggest",
      relationshipIntent: "open",
      preferredPersonalityTraits: ["Thoughtful", "Curious"],
      personalityPreference: "flexible",
      preferredStyleTags: [],
      stylePreference: "no_preference",
      locale: "en-US",
      languages: ["English"],
      matchLocationScope: "city",
      preferredCountryCodes: ["SE"],
      preferredCities: ["Stockholm"],
      preferredAreas: [],
      allowTranslatedDates: false,
    });

    const result = await t.run(async (ctx) => ({
      profile: await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", owner))
        .unique(),
      preferences: await ctx.db
        .query("preferences")
        .withIndex("by_user", (q) => q.eq("userId", owner))
        .unique(),
    }));

    expect(result.profile?.languages).toEqual(["English"]);
    expect(result.preferences?.matchLocationScope).toBe("city");
    expect(result.preferences?.preferredCountryCodes).toEqual(["SE"]);
    expect(result.preferences?.preferredCities).toEqual(["Stockholm"]);
    expect(result.preferences?.allowTranslatedDates).toBe(false);
  });

  test("accepts a one-syllable Korean Agent name and keeps the chosen sprite through edits", async () => {
    const t = convexTest(schema, modules);
    const owner = await t.run((ctx) =>
      ctx.db.insert("users", {
        name: "Rowan",
        email: "rowan@test.invalid",
      }),
    );

    await asUser(t, owner).mutation(api.agents.bootstrap, {
      displayName: "Rowan",
      dobMs: Date.UTC(1993, 5, 15),
      gender: "man",
      interestedIn: ["woman"],
      city: "Stockholm",
      neighborhood: "Södermalm",
      interests: ["Films", "Coffee", "Art galleries"],
      personalityTraits: ["Thoughtful", "Curious"],
      agentName: "봄",
      avatar: {
        palette: "sky",
        face: "cool",
        hair: "crop",
        outfit: "hoodie",
        accessory: "none",
        gender: "male",
      },
      essence:
        "I am quiet at first, then warm and playful once I feel safe with someone.",
      desiredConnection:
        "Someone thoughtful who enjoys honest conversation and comfortable silence.",
      boundaries: ["No pressure"],
      voice: "warm",
      autonomy: "suggest",
      relationshipIntent: "open",
      preferredPersonalityTraits: ["Thoughtful", "Curious"],
      personalityPreference: "flexible",
      preferredStyleTags: [],
      stylePreference: "no_preference",
      locale: "en-US",
      languages: ["English"],
      matchLocationScope: "city",
      preferredCountryCodes: ["SE"],
      preferredCities: ["Stockholm"],
      preferredAreas: [],
      allowTranslatedDates: false,
    });

    const saved = await t.run((ctx) =>
      ctx.db
        .query("agentProfiles")
        .withIndex("by_user", (q) => q.eq("userId", owner))
        .unique(),
    );
    expect(saved?.avatar).toMatchObject({ palette: "sky", face: "cool", gender: "male" });
    expect(saved?.name).toBe("봄");

    await asUser(t, owner).mutation(api.agents.update, {
      name: "준",
      avatar: {
        palette: "sky",
        face: "cool",
        hair: "crop",
        outfit: "hoodie",
        accessory: "none",
        gender: "female",
      },
      essence: "Quiet at first, playful once a conversation feels safe.",
      desiredConnection: "Someone curious who can be direct without rushing.",
      boundaries: ["No pressure"],
      voice: "warm",
      autonomy: "suggest",
    });
    const edited = await t.run((ctx) =>
      ctx.db
        .query("agentProfiles")
        .withIndex("by_user", (q) => q.eq("userId", owner))
        .unique(),
    );
    expect(edited?.avatar?.gender).toBe("female");
    expect(edited?.name).toBe("준");
  });

  test("renaming an Agent updates its generated introduction", async () => {
    const t = convexTest(schema, modules);
    const { owner } = await setup(t);
    await t.run((ctx) =>
      ctx.db.insert("agentMessages", {
        userId: owner,
        role: "agent",
        content:
          "I'm Dali, your dating agent. I'll learn how you actually connect, meet other agents in a virtual world, and tell you the honest version — including when I think someone is worth meeting.",
        createdAt: 1,
      }),
    );

    await asUser(t, owner).mutation(api.agents.update, {
      name: "Juno",
      avatar: {
        palette: "rose",
        face: "gentle",
        hair: "wave",
        outfit: "cardigan",
        accessory: "star",
      },
      essence: "Quiet at first, playful once a conversation feels safe.",
      desiredConnection: "Someone curious who can be direct without rushing.",
      boundaries: ["No pressure"],
      voice: "warm",
      autonomy: "suggest",
    });

    const result = await t.run(async (ctx) => ({
      agent: await ctx.db
        .query("agentProfiles")
        .withIndex("by_user", (q) => q.eq("userId", owner))
        .unique(),
      message: await ctx.db
        .query("agentMessages")
        .withIndex("by_user_and_created", (q) => q.eq("userId", owner))
        .first(),
    }));
    expect(result.agent?.name).toBe("Juno");
    expect(result.message?.content).toMatch(/^I'm Juno — your second self\./);
    // The Agent goes out as its person, so the greeting never casts it as a
    // friend or a matchmaker standing between two people.
    expect(result.message?.content).not.toMatch(/friend|matchmaker/i);
  });

  test("creates one localized open question and never duplicates it", async () => {
    const t = convexTest(schema, modules);
    const { owner } = await setup(t);
    const ownerApp = asUser(t, owner);

    await ownerApp.mutation(api.agents.ensureQuestion, { locale: "ko-KR" });
    await ownerApp.mutation(api.agents.ensureQuestion, { locale: "ko-KR" });
    const mine = await ownerApp.query(api.agents.mine, {});

    const result = await t.run(async (ctx) => {
      const questions = await ctx.db
        .query("agentQuestions")
        .withIndex("by_user_and_asked", (q) => q.eq("userId", owner))
        .collect();
      const messages = await ctx.db
        .query("agentMessages")
        .withIndex("by_user_and_created", (q) => q.eq("userId", owner))
        .collect();
      const notifications = await ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", owner))
        .collect();
      return { questions, messages, notifications };
    });

    expect(result.questions).toHaveLength(1);
    expect(mine?.openQuestion?._id).toBe(result.questions[0]._id);
    expect(result.questions[0].status).toBe("open");
    expect(result.questions[0].locale).toBe("ko-KR");
    expect(result.questions[0].prompt).toContain("편안했던 사람");
    expect(result.messages).toHaveLength(1);
    expect(result.notifications).toHaveLength(0);
  });

  test("stores an answer privately and schedules reflection plus the next prompt", async () => {
    const t = convexTest(schema, modules);
    const { owner } = await setup(t);
    const ownerApp = asUser(t, owner);
    await ownerApp.mutation(api.agents.ensureQuestion, { locale: "en-US" });
    const question = await t.run(async (ctx) =>
      ctx.db
        .query("agentQuestions")
        .withIndex("by_user_and_status", (q) =>
          q.eq("userId", owner).eq("status", "open"),
        )
        .unique(),
    );
    if (!question) throw new Error("Expected an open question.");

    await ownerApp.mutation(api.agents.answerQuestion, {
      questionId: question._id,
      answer:
        "I relax when someone remembers a small detail without making a performance of it.",
    });

    const result = await t.run(async (ctx) => ({
      question: await ctx.db.get("agentQuestions", question._id),
      messages: await ctx.db
        .query("agentMessages")
        .withIndex("by_user_and_created", (q) => q.eq("userId", owner))
        .collect(),
      events: await ctx.db
        .query("growthEvents")
        .withIndex("by_user", (q) => q.eq("userId", owner))
        .collect(),
      scheduled: await ctx.db.system.query("_scheduled_functions").collect(),
    }));

    expect(result.question?.status).toBe("answered");
    expect(result.question?.answeredAt).toBeTypeOf("number");
    expect(result.messages.at(-1)?.content).toContain("small detail");
    expect(result.messages.at(-1)?.role).toBe("human");
    expect(result.events.map((event) => event.event)).toContain(
      "agent_question_answered",
    );
    expect(result.scheduled).toHaveLength(2);
  });

  test("keeps another person's question private", async () => {
    const t = convexTest(schema, modules);
    const { owner, stranger } = await setup(t);
    const ownerApp = asUser(t, owner);
    await ownerApp.mutation(api.agents.ensureQuestion, { locale: "en-US" });
    const question = await t.run(async (ctx) =>
      ctx.db
        .query("agentQuestions")
        .withIndex("by_user_and_status", (q) =>
          q.eq("userId", owner).eq("status", "open"),
        )
        .unique(),
    );
    if (!question) throw new Error("Expected an open question.");

    await expect(
      asUser(t, stranger).mutation(api.agents.answerQuestion, {
        questionId: question._id,
        answer: "I should not be able to write here.",
      }),
    ).rejects.toThrow("isn't yours");
  });

  test("waits a week, then rotates to a new question with an in-app alert", async () => {
    const t = convexTest(schema, modules);
    const { owner } = await setup(t);
    const ownerApp = asUser(t, owner);
    await ownerApp.mutation(api.agents.ensureQuestion, { locale: "en-US" });
    const first = await t.run(async (ctx) =>
      ctx.db
        .query("agentQuestions")
        .withIndex("by_user_and_status", (q) =>
          q.eq("userId", owner).eq("status", "open"),
        )
        .unique(),
    );
    if (!first) throw new Error("Expected an open question.");
    await ownerApp.mutation(api.agents.skipQuestion, {
      questionId: first._id,
    });

    await t.mutation(internal.agents.askScheduledQuestion, {
      userId: owner,
      nowMs: first.askedAt + 7 * 24 * 60 * 60 * 1000,
    });

    const result = await t.run(async (ctx) => ({
      questions: await ctx.db
        .query("agentQuestions")
        .withIndex("by_user_and_asked", (q) => q.eq("userId", owner))
        .collect(),
      notifications: await ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", owner))
        .collect(),
    }));
    expect(result.questions).toHaveLength(2);
    expect(result.questions[1].category).not.toBe(first.category);
    expect(result.notifications).toHaveLength(1);
    expect(result.notifications[0].href).toBe("/dashboard");
  });

  test("links debrief conversation to private context and future scouting memory", async () => {
    const t = convexTest(schema, modules);
    const { owner, stranger, outsider } = await setup(t);
    const agentDateId = await t.run(async (ctx) => {
      await ctx.db.insert("agentProfiles", {
        userId: stranger,
        name: "Noah",
        essence: "Friendly but measured.",
        desiredConnection: "A calm and curious person.",
        boundaries: [],
        voice: "quiet",
        autonomy: "observe",
        privateMemory: "",
        status: "active",
        createdAt: 1,
        updatedAt: 1,
      });
      const id = await ctx.db.insert("agentDates", {
        initiatorUserId: owner,
        counterpartUserId: stranger,
        status: "debrief_ready",
        setting: "A quiet virtual listening room",
        compatibilityScore: 74,
        summary: "The Agents found warmth but different conversational pacing.",
        sparks: ["Small details were remembered"],
        frictions: ["Different pace"],
        initiatorVerdict: "curious",
        counterpartVerdict: "pass",
        initiatorReason: "The quiet felt easy enough to explore.",
        counterpartReason: "This sealed reason belongs only to Noah.",
        initiatorDecisionCode: "worth_exploring",
        counterpartDecisionCode: "communication_mismatch",
        initiatorNextSearchNote: "Keep testing comfortable silence.",
        counterpartNextSearchNote: "Look for quicker conversational repair.",
        initiatorConsent: "pending",
        counterpartConsent: "pending",
        isDemoCounterpart: false,
        createdAt: 1,
        updatedAt: 1,
      });
      await ctx.db.insert("agentDateTurns", {
        agentDateId: id,
        round: 1,
        speakerUserId: owner,
        speakerAgentName: "Dali",
        content: "What makes silence feel companionable?",
        subtext: "Private hidden inference.",
        createdAt: 1,
      });
      return id;
    });

    await asUser(t, owner).mutation(api.agents.send, {
      agentDateId,
      content: "I liked that they remembered the small detail.",
    });
    const context = await t.query(internal.agents.replyContext, {
      userId: owner,
    });
    expect(context.dateContext?.agentDateId).toBe(agentDateId);
    expect(context.dateContext?.myReason).toContain("quiet felt easy");
    expect(context.dateContext?.counterpartAgentName).toBe("Noah");
    expect(JSON.stringify(context.dateContext)).not.toContain(
      "sealed reason belongs only to Noah",
    );
    expect(context.messages.at(-1)?.agentDateId).toBe(agentDateId);

    await t.run(async (ctx) => {
      await ctx.db.insert("agentProfiles", {
        userId: outsider,
        name: "Owen",
        essence: "An outsider who must not see another person's debrief.",
        desiredConnection: "Someone unrelated to this private Agent date.",
        boundaries: [],
        voice: "direct",
        autonomy: "observe",
        privateMemory: "",
        status: "active",
        createdAt: 1,
        updatedAt: 1,
      });
    });
    await expect(
      asUser(t, outsider).mutation(api.agents.send, {
        agentDateId,
        content: "Let me into someone else's debrief.",
      }),
    ).rejects.toThrow("isn't yours");

    await t.mutation(internal.agents.storeReply, {
      userId: owner,
      agentDateId,
      reply: "I'll carry that signal into the next search.",
      memory: "Mina relaxes when small details are remembered.",
      sourceMessageId: context.messages.findLast(m => m.role === "human")!._id,
      expectedContextKey: context.contextKey,
    });
    const learned = await t.run(async (ctx) => {
      const agent = await ctx.db
        .query("agentProfiles")
        .withIndex("by_user", (q) => q.eq("userId", owner))
        .unique();
      const messages = await ctx.db
        .query("agentMessages")
        .withIndex("by_user_and_created", (q) => q.eq("userId", owner))
        .order("desc")
        .take(1);
      const events = await ctx.db
        .query("growthEvents")
        .withIndex("by_user", (q) => q.eq("userId", owner))
        .take(10);
      return { agent, latest: messages[0], events };
    });
    expect(learned.agent?.privateMemory).toContain("remember");
    expect(learned.latest?.agentDateId).toBe(agentDateId);
    expect(learned.events[0].event).toBe("agent_debrief_discussed");
    expect(JSON.stringify(learned.events)).not.toContain("small detail");
  });
});
