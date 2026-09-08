import { mutualRelationshipGoals } from "./lib/relationshipGoals";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { action, internalAction, internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { getScoutAccess, scoutAccessFor } from "./billing";
import { createDateRequest } from "./agentDates";
import { getPreferencesByUser, getProfileByUser, requireActiveProfile, requireUserId } from "./lib/authz";
import { hasCompleteMatchingBoundaries } from "./lib/agentMatchingBoundaries";
import { storySeed } from "./lib/dateStory";
import { isLearningFeedback } from "./lib/agentLearning";

const statusValidator = v.union(v.literal("searching"), v.literal("waiting"), v.literal("talking"), v.literal("match_ready"), v.literal("paused"), v.literal("connected"), v.literal("retrying"));
const CHECK_INTERVAL = 15 * 60_000;

/**
 * An encounter whose worker died leaves both sides in `talking` with a date
 * nobody will finish: Convex does not retry a dead action, and nothing sweeps
 * these rows. Well past both the longest legitimate turn gap and the action
 * ceiling, treat it as abandoned so a restart can release both searches.
 */
const ABANDONED_ENCOUNTER_MS = 15 * 60_000;

function isAbandonedEncounter(date: Doc<"agentDates">, now: number) {
  if (!["queued", "running"].includes(date.status)) return false;
  return now - Math.max(date.nextTurnAt ?? 0, date.updatedAt) > ABANDONED_ENCOUNTER_MS;
}

async function releaseAbandonedEncounter(ctx: MutationCtx, date: Doc<"agentDates">) {
  await ctx.db.patch("agentDates", date._id, {
    status: "failed",
    nextTurnAt: undefined,
    failureReason: "The encounter stopped before it finished. Its saved conversation is kept.",
    updatedAt: Date.now(),
  });
  const released = (await ctx.db.get("agentDates", date._id))!;
  await settleSearchEncounter(ctx, released, "continue");
}

async function byUser(ctx: MutationCtx, userId: Id<"users">) {
  return ctx.db.query("agentSearches").withIndex("by_user", q => q.eq("userId", userId)).unique();
}

/** Revision tokens make pause, restart and paired search workers invalidate old callbacks. */
async function schedule(ctx: MutationCtx, session: Doc<"agentSearches">, delayMs: number, status: "searching" | "waiting" | "retrying") {
  const revision = session.revision + 1;
  const nextCheckAt = Date.now() + delayMs;
  await ctx.db.patch("agentSearches", session._id, { status, revision, nextCheckAt, currentDateId: undefined, updatedAt: Date.now() });
  await ctx.scheduler.runAt(nextCheckAt, internal.scouting.tick, { searchId: session._id, revision });
}

export const start = action({
  args: {}, returns: v.null(),
  handler: async ctx => {
    const [identity, userId] = await Promise.all([ctx.auth.getUserIdentity(), getAuthUserId(ctx)]);
    if (!identity || !userId) throw new Error("Not signed in.");
    const access = await getScoutAccess(ctx, identity.tokenIdentifier);
    if (!access.allowed) throw new Error("A Scout Pass is required before your agent can search.");
    await ctx.runMutation(internal.scouting.begin, { userId, accessMode: access.mode === "subscription" ? "subscription" : "demo" });
    return null;
  },
});

export const begin = internalMutation({
  args: { userId: v.id("users"), accessMode: v.union(v.literal("demo"), v.literal("subscription")) }, returns: v.null(),
  handler: async (ctx, args) => {
    const profile = await requireActiveProfile(ctx, args.userId);
    const preferences = await getPreferencesByUser(ctx, args.userId);
    const agent = await ctx.db.query("agentProfiles").withIndex("by_user", q => q.eq("userId", args.userId)).unique();
    if (profile.status !== "active" || agent?.status !== "active" || preferences?.dropsPaused) throw new Error("Your agent is paused in Settings.");
    if (!hasCompleteMatchingBoundaries(profile, preferences)) throw new Error("Finish choosing where and in which languages your agent may search.");
    let session = await byUser(ctx, args.userId);
    if (session && !["paused", "connected"].includes(session.status)) {
      const stalled = session.status === "talking" && session.currentDateId
        ? await ctx.db.get("agentDates", session.currentDateId)
        : null;
      if (!stalled || !isAbandonedEncounter(stalled, Date.now())) return null;
      await releaseAbandonedEncounter(ctx, stalled);
      session = await byUser(ctx, args.userId);
    }
    if (session?.currentDateId && session.status === "paused") {
      const current = await ctx.db.get("agentDates", session.currentDateId);
      const resumeStatus = current && ["queued", "running"].includes(current.status) && !isAbandonedEncounter(current, Date.now()) ? "talking" : current?.status === "debrief_ready" && current.initiatorVerdict === "encourage" && current.counterpartVerdict === "encourage" ? "match_ready" : null;
      if (resumeStatus) {
        await ctx.db.patch("agentSearches", session._id, { status: resumeStatus, revision: session.revision + 1, nextCheckAt: undefined, updatedAt: Date.now() });
        return null;
      }
    }
    if (!session) {
      const id = await ctx.db.insert("agentSearches", { userId: args.userId, accessMode: args.accessMode, status: "searching", revision: 0, cityIndex: 0, cursor: null, encountersCompleted: 0, startedAt: Date.now(), updatedAt: Date.now() });
      session = (await ctx.db.get("agentSearches", id))!;
    }
    await schedule(ctx, session, 0, "searching");
    return null;
  },
});

export const mine = query({
  args: {}, returns: v.union(v.null(), v.object({ status: statusValidator, currentDateId: v.optional(v.id("agentDates")), nextCheckAt: v.optional(v.number()), lastCheckedAt: v.optional(v.number()), encountersCompleted: v.number(), startedAt: v.number() })),
  handler: async ctx => {
    const userId = await requireUserId(ctx);
    const session = await ctx.db.query("agentSearches").withIndex("by_user", q => q.eq("userId", userId)).unique();
    if (!session) return null;
    const preferences = await getPreferencesByUser(ctx, userId);
    return { status: preferences?.dropsPaused ? "paused" as const : session.status, currentDateId: session.currentDateId, nextCheckAt: session.nextCheckAt, lastCheckedAt: session.lastCheckedAt, encountersCompleted: session.encountersCompleted, startedAt: session.startedAt };
  },
});

export const pause = mutation({
  args: {}, returns: v.null(),
  handler: async ctx => {
    const session = await byUser(ctx, await requireUserId(ctx));
    if (session) await ctx.db.patch("agentSearches", session._id, { status: "paused", revision: session.revision + 1, nextCheckAt: undefined, updatedAt: Date.now() });
    return null;
  },
});

export const tick = internalAction({
  args: { searchId: v.id("agentSearches"), revision: v.number() }, returns: v.null(),
  handler: async (ctx, args) => {
    try {
      await ctx.runMutation(internal.scouting.advance, { ...args, allowed: scoutAccessFor().allowed });
    } catch (error) {
      console.error("[scouting] candidate check interrupted", String(error));
      await ctx.runMutation(internal.scouting.retry, args);
    }
    return null;
  },
});

export const advance = internalMutation({
  args: { searchId: v.id("agentSearches"), revision: v.number(), allowed: v.boolean() }, returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db.get("agentSearches", args.searchId);
    if (!session || session.revision !== args.revision || !["waiting", "searching", "retrying"].includes(session.status) || (session.nextCheckAt ?? Infinity) > Date.now()) return null;
    const [profile, preferences, agent] = await Promise.all([
      getProfileByUser(ctx, session.userId), getPreferencesByUser(ctx, session.userId),
      ctx.db.query("agentProfiles").withIndex("by_user", q => q.eq("userId", session.userId)).unique(),
    ]);
    if (!args.allowed || profile?.status !== "active" || profile.moderationStatus !== "ok" || preferences?.dropsPaused || agent?.status !== "active" || !hasCompleteMatchingBoundaries(profile, preferences)) {
      await ctx.db.patch("agentSearches", session._id, { status: "paused", revision: session.revision + 1, nextCheckAt: undefined, updatedAt: Date.now() });
      return null;
    }
    if (isLearningFeedback(agent, Date.now())) {
      // The owner just sent feedback. Wait for the agent to finish learning it
      // rather than sending a stale brief into a new encounter.
      await schedule(ctx, session, 30_000, "searching");
      return null;
    }
    const dateId = await createDateRequest(ctx, { userId: session.userId, accessMode: session.accessMode, searchId: session._id });
    if (dateId) return null;
    const checked = (await ctx.db.get("agentSearches", session._id))!;
    const finishedPass = checked.cursor === null && checked.cityIndex === 0;
    await schedule(ctx, checked, finishedPass ? CHECK_INTERVAL : 10_000, finishedPass ? "waiting" : "searching");
    return null;
  },
});

export const retry = internalMutation({
  args: { searchId: v.id("agentSearches"), revision: v.number() }, returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db.get("agentSearches", args.searchId);
    if (session?.revision === args.revision) {
      await ctx.db.patch("agentSearches", session._id, { cursor: null, cityIndex: 0 });
      await schedule(ctx, session, CHECK_INTERVAL, "retrying");
    }
    return null;
  },
});

/** Called in the transaction that completes, closes or interrupts an actual encounter. */
export async function settleSearchEncounter(ctx: MutationCtx, date: Doc<"agentDates">, outcome: "continue" | "match_ready" | "connected", completed = false) {
  if (!date.isSearchEncounter) return;
  for (const userId of [date.initiatorUserId, date.counterpartUserId]) {
    const session = await byUser(ctx, userId);
    if (!session || session.currentDateId !== date._id || !["talking", "match_ready", "paused"].includes(session.status)) continue;
    if (completed && ["talking", "paused"].includes(session.status)) await ctx.db.patch("agentSearches", session._id, { encountersCompleted: session.encountersCompleted + 1 });
    if (outcome === "continue") {
      if (session.status !== "paused") await schedule(ctx, session, 60_000 + storySeed(`${date._id}:${userId}`) % 180_000, "searching");
    } else if (session.status !== "paused" || outcome === "connected") {
      await ctx.db.patch("agentSearches", session._id, { status: outcome, revision: session.revision + 1, nextCheckAt: undefined, updatedAt: Date.now() });
    }
  }
}


/** Reconsider only an existing search: changing preferences never opts someone in. */
export async function refreshAfterPreferencesChange(ctx: MutationCtx, userId: Id<"users">) {
  let session = await byUser(ctx, userId);
  if (!session || session.status === "connected") return;
  if (session.currentDateId && ["match_ready", "paused"].includes(session.status)) {
    const date = await ctx.db.get("agentDates", session.currentDateId);
    if (date?.status === "debrief_ready" && date.isSearchEncounter) {
      const [a, b] = await Promise.all([
        getPreferencesByUser(ctx, date.initiatorUserId), getPreferencesByUser(ctx, date.counterpartUserId),
      ]);
      if (!mutualRelationshipGoals(a, b)) {
        // Preserve both private verdicts and human decisions as history. Closing
        // an outdated introduction is not a fabricated human rejection.
        await ctx.db.patch("agentDates", date._id, { status: "closed", updatedAt: Date.now() });
        await settleSearchEncounter(ctx, date, "continue");
        session = (await byUser(ctx, userId))!;
      }
    }
  }
  if (["waiting", "searching", "retrying"].includes(session.status)) {
    await ctx.db.patch("agentSearches", session._id, { cursor: null, cityIndex: 0 });
    await schedule(ctx, session, 0, "searching");
  }
}
