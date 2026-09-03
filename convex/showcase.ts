import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { syntheticAgentName } from "./agentDates";
import { agentAvatarValidator } from "./lib/agentAvatar";
import { hasCompleteMatchingBoundaries } from "./lib/agentMatchingBoundaries";

/**
 * A public replay of one agent date.
 *
 * The product's whole argument is what the date and the letter home feel like,
 * and until now both sat behind a sign-up. A stranger had to create an account
 * before seeing the thing they were being asked to trust.
 *
 * Everything served here comes from a date between two seeded fictional
 * personas. The guard is that BOTH profiles must be `isDemo`; a date involving
 * any real person is never eligible, so no private brief, verdict or contact
 * can reach this endpoint. The private per-turn `subtext` is dropped as well,
 * since it is an agent's internal reasoning and is never shown even to its own
 * owner.
 */
const nullableAvatarValidator = v.union(v.null(), agentAvatarValidator);

const showcaseValidator = v.object({
  setting: v.string(),
  worldSourceTitle: v.optional(v.string()),
  worldSourceUrl: v.optional(v.string()),
  summary: v.string(),
  sparks: v.array(v.string()),
  frictions: v.array(v.string()),
  completedAt: v.optional(v.number()),
  turns: v.array(
    v.object({
      round: v.number(),
      speakerAgentName: v.string(),
      content: v.string(),
      isInitiator: v.boolean(),
    }),
  ),
  initiator: v.object({
    agentName: v.string(),
    avatar: nullableAvatarValidator,
    verdict: v.string(),
    reason: v.string(),
  }),
  counterpart: v.object({
    agentName: v.string(),
    avatar: nullableAvatarValidator,
    verdict: v.string(),
    reason: v.string(),
  }),
});

/** Statuses in which a date has a full transcript and both verdicts written. */
const FINISHED = ["debrief_ready", "connected", "closed"] as const;

export const publicDate = query({
  args: {},
  returns: v.union(v.null(), showcaseValidator),
  handler: async (ctx) => {
    for (const status of FINISHED) {
      const dates = await ctx.db
        .query("agentDates")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .take(20);

      for (const date of dates) {
        const [initiator, counterpart] = await Promise.all([
          ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", date.initiatorUserId))
            .unique(),
          ctx.db
            .query("profiles")
            .withIndex("by_user", (q) =>
              q.eq("userId", date.counterpartUserId),
            )
            .unique(),
        ]);
        // The guard: only a date between two seeded personas may be public.
        if (!initiator?.isDemo || !counterpart?.isDemo) continue;
        if (!date.initiatorReason || !date.counterpartReason) continue;

        const [turns, initiatorAgent, counterpartAgent] = await Promise.all([
          ctx.db
            .query("agentDateTurns")
            .withIndex("by_date_and_round", (q) =>
              q.eq("agentDateId", date._id),
            )
            .take(7),
          ctx.db
            .query("agentProfiles")
            .withIndex("by_user", (q) => q.eq("userId", date.initiatorUserId))
            .unique(),
          ctx.db
            .query("agentProfiles")
            .withIndex("by_user", (q) =>
              q.eq("userId", date.counterpartUserId),
            )
            .unique(),
        ]);
        if (turns.length < 6) continue;

        return {
          setting: date.setting,
          worldSourceTitle: date.worldSourceTitle,
          worldSourceUrl: date.worldSourceUrl,
          summary: date.summary,
          sparks: date.sparks,
          frictions: date.frictions,
          completedAt: date.completedAt,
          // `subtext` is deliberately not projected.
          turns: turns
            .sort((a, b) => a.round - b.round)
            .map((turn) => ({
              round: turn.round,
              speakerAgentName: turn.speakerAgentName,
              content: turn.content,
              isInitiator: turn.speakerUserId === date.initiatorUserId,
            })),
          initiator: {
            agentName: initiatorAgent?.name ?? "Agent",
            avatar: initiatorAgent?.avatar ?? null,
            verdict: date.initiatorVerdict,
            reason: date.initiatorReason,
          },
          counterpart: {
            agentName: counterpartAgent?.name ?? "Agent",
            avatar: counterpartAgent?.avatar ?? null,
            verdict: date.counterpartVerdict,
            reason: date.counterpartReason,
          },
        };
      }
    }
    return null;
  },
});

/**
 * Seeded personas are created as profiles only, since the product normally
 * meets them as a counterpart and never needs them to act. The showcase needs
 * one of them to *start* a date, which requires an agent, so this gives
 * exactly one persona an agent built from its own brief.
 */
export const preparePersona = internalMutation({
  args: {},
  returns: v.union(v.null(), v.id("users")),
  handler: async (ctx) => {
    // Only a persona whose search boundaries are complete can start a date, and
    // the seeded cast spans generations: the oldest personas predate those
    // fields entirely. Judging a fixed first page would have declared the whole
    // cast unusable on the strength of its most obsolete members, so this scans
    // until an eligible persona turns up. The cap is a runaway guard, not a
    // window — the demo cast is a fixed list an order of magnitude smaller.
    const personas = ctx.db
      .query("profiles")
      .withIndex("by_demo_and_status", (q) =>
        q.eq("isDemo", true).eq("status", "active"),
      );

    let firstWithoutAgent: Doc<"profiles"> | null = null;
    let scanned = 0;
    for await (const candidate of personas) {
      if (++scanned > 500) break;
      const preferences = await ctx.db
        .query("preferences")
        .withIndex("by_user", (q) => q.eq("userId", candidate.userId))
        .unique();
      if (!hasCompleteMatchingBoundaries(candidate, preferences)) continue;
      const agent = await ctx.db
        .query("agentProfiles")
        .withIndex("by_user", (q) => q.eq("userId", candidate.userId))
        .unique();
      // Reuse an Agent that already exists before minting another one.
      if (agent?.status === "active") return candidate.userId;
      firstWithoutAgent ??= candidate;
    }

    const persona = firstWithoutAgent;
    if (!persona) return null;

    const now = Date.now();
    await ctx.db.insert("agentProfiles", {
      userId: persona.userId,
      // An Agent is its own character, never a second copy of its human. Naming
      // it after the persona produced transcripts like "I'm Alex, and my friend
      // Alex runs in the mornings", which reads as a bug to anyone watching.
      name: syntheticAgentName(persona.userId, persona.displayName),
      essence: persona.bio,
      desiredConnection:
        "Someone curious who can be direct without rushing, and who is comfortable with quiet.",
      boundaries: ["Privacy before connection"],
      voice: "warm",
      autonomy: "suggest",
      privateMemory: "",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    return persona.userId;
  },
});

/**
 * Run one date between seeded personas so the public replay has something real
 * to show. Deliberately manual: it spends model calls, so it is triggered from
 * the CLI once per deployment rather than on a cron or on a visitor's request.
 */
export const ensure = internalAction({
  args: {},
  returns: v.string(),
  handler: async (ctx): Promise<string> => {
    const existing = await ctx.runQuery(internal.showcase.existing, {});
    if (existing) return "A public showcase date already exists.";

    const personaId = await ctx.runMutation(
      internal.showcase.preparePersona,
      {},
    );
    if (!personaId) return "No seeded persona is ready to run a date.";

    const agentDateId = await ctx.runMutation(
      internal.agentDates.createRequest,
      { userId: personaId, accessMode: "demo", locale: "en-US" },
    );
    // The matcher picks the counterpart, so the pairing is not guaranteed to be
    // persona-to-persona. Say so plainly rather than leaving the operator to
    // wonder why the public page is still empty a minute later.
    return (
      `Started showcase date ${agentDateId}; it takes about a minute. ` +
      `Re-run showcase:existing afterwards — it stays false if the matcher ` +
      `paired the persona with a real account, which the public query refuses ` +
      `to serve by design.`
    );
  },
});

export const existing = internalQuery({
  args: {},
  returns: v.boolean(),
  handler: async (ctx): Promise<boolean> => {
    for (const status of FINISHED) {
      const dates = await ctx.db
        .query("agentDates")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .take(20);
      for (const date of dates) {
        const [a, b] = await Promise.all([
          ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", date.initiatorUserId))
            .unique(),
          ctx.db
            .query("profiles")
            .withIndex("by_user", (q) =>
              q.eq("userId", date.counterpartUserId),
            )
            .unique(),
        ]);
        if (a?.isDemo && b?.isDemo && date.initiatorReason) return true;
      }
    }
    return false;
  },
});
