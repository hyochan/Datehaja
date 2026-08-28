import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import type { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import {
  checkRateLimit,
  currentUserId,
  recordAudit,
  requireUserId,
} from "./lib/authz";
import {
  AI_RANKING_POOL_SIZE,
  DEFAULT_MAX_CANDIDATE_ATTEMPTS,
  MIN_VIABLE_SCORE,
  blendScore,
  blockKey,
  hardFilter,
  intersect,
  pairKey,
  scorePair,
  type Party,
  type Signals,
} from "./lib/matching";
import { midpoint } from "./lib/geo";
import {
  DAY_MS,
  HOUR_MS,
  chooseDateStart,
  computeConfirmDeadline,
  describeDateTime,
  intersectWindows,
  isWeekend,
} from "./lib/time";
import { firstNameOnly, redactContactInfo } from "./lib/privacy";
import { truncate } from "./lib/text";
import { formatMoney } from "./lib/catalog";
import { buildDatePlan, rankCandidatesWithAI, type PersonBrief } from "./ai";
import { buildFallbackPlan } from "./lib/fallbackPlan";
import { researchDateOptions } from "./research";

/**
 * The DateHaja matching pipeline.
 *
 *   hard filter  →  deterministic scoring  →  AI ranking  →
 *   live venue research  →  plan generation  →  private invitations
 *
 * Stage 1 is pure code and is the only thing allowed to exclude someone.
 * The model ranks and explains; it never overrules a rule.
 */

const MAX_POOL = 250;
const MIN_DATE_MINUTES = 90;

/* ------------------------------ public API -------------------------------- */

export const requestDrop = mutation({
  args: { availabilityId: v.optional(v.id("availability")) },
  returns: v.object({ matchingRunId: v.id("matchingRuns") }),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("Finish your profile first.");
    if (!profile.onboardingComplete) throw new Error("Finish onboarding first.");
    if (profile.status !== "active") {
      throw new Error("Matching is paused. Turn it back on in Settings.");
    }
    if (profile.moderationStatus !== "ok") {
      throw new Error("This account can't request date plans right now.");
    }

    const prefs = await ctx.db
      .query("preferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!prefs) throw new Error("Finish your preferences first.");
    if (prefs.dropsPaused) {
      throw new Error("Matching is paused. Turn it back on in Settings.");
    }

    const limit = await checkRateLimit(ctx, `drop:${userId}`, 6, HOUR_MS, now);
    if (!limit.ok) {
      throw new Error(
        `We're already looking. Try again in ${Math.ceil(limit.retryAfterMs / 60000)} minutes.`,
      );
    }

    // Don't stack searches on top of each other.
    const running = await ctx.db
      .query("matchingRuns")
      .withIndex("by_initiator", (q) => q.eq("initiatorUserId", userId))
      .order("desc")
      .take(3);
    const inFlight = running.find(
      (r) => r.status === "running" && now - r.startedAt < 10 * 60_000,
    );
    if (inFlight) return { matchingRunId: inFlight._id };

    const window = args.availabilityId
      ? await ctx.db.get("availability", args.availabilityId)
      : await pickNextOpenWindow(ctx, userId, now);

    if (!window || window.userId !== userId) {
      throw new Error("Add a time you're free first.");
    }
    if (window.status !== "open") {
      throw new Error("That window is already spoken for.");
    }
    if (window.startMs <= now) throw new Error("That time has already passed.");

    const matchingRunId = await ctx.db.insert("matchingRuns", {
      initiatorUserId: userId,
      availabilityId: window._id,
      intent: "new_drop",
      stage: "hard_filter",
      status: "running",
      poolSize: 0,
      hardPassCount: 0,
      scoredCount: 0,
      aiRankedCount: 0,
      startedAt: now,
    });

    await ctx.scheduler.runAfter(0, internal.matching.runPipeline, { matchingRunId });
    await recordAudit(ctx, {
      action: "matching.requested",
      actorUserId: userId,
      detail: new Date(window.startMs).toISOString(),
    });

    return { matchingRunId };
  },
});

async function pickNextOpenWindow(
  ctx: MutationCtx | QueryCtx,
  userId: Id<"users">,
  nowMs: number,
): Promise<Doc<"availability"> | null> {
  const windows = await ctx.db
    .query("availability")
    .withIndex("by_user_and_start", (q) =>
      q.eq("userId", userId).gte("startMs", nowMs),
    )
    .order("asc")
    .take(20);
  return windows.find((w) => w.status === "open") ?? null;
}

/** Live pipeline state — this is what drives the dashboard's progress card. */
export const activeRun = query({
  args: {},
  returns: v.union(v.null(), v.any()),
  handler: async (ctx) => {
    const userId = await currentUserId(ctx);
    if (!userId) return null;
    const runs = await ctx.db
      .query("matchingRuns")
      .withIndex("by_initiator", (q) => q.eq("initiatorUserId", userId))
      .order("desc")
      .take(1);
    return runs[0] ?? null;
  },
});

/* ---------------------- stage 1 + 2: filter and score ---------------------- */

type CandidateRow = {
  candidateScoreId: Id<"candidateScores">;
  userId: Id<"users">;
  person: PersonBrief;
  deterministicScore: number;
  signals: Signals;
};

type FilterOutcome = {
  ok: boolean;
  reason?: string;
  seekerUserId?: Id<"users">;
  seeker?: PersonBrief;
  candidates: CandidateRow[];
};

export const stageFilterAndScore = internalMutation({
  args: { matchingRunId: v.id("matchingRuns") },
  returns: v.any(),
  handler: async (ctx, args): Promise<FilterOutcome> => {
    const run = await ctx.db.get("matchingRuns", args.matchingRunId);
    if (!run) return { ok: false, reason: "run_missing", candidates: [] };

    const seekerParty = await loadParty(ctx, run.initiatorUserId, run.availabilityId);
    if (!seekerParty) {
      await ctx.db.patch("matchingRuns", run._id, {
        status: "failed",
        stage: "failed",
        error: "Your availability window is no longer open.",
        finishedAt: Date.now(),
      });
      return { ok: false, reason: "seeker_unavailable", candidates: [] };
    }

    const blockedPairs = await loadBlockKeys(ctx, run.initiatorUserId);

    // Pool: everyone active in the same city. Indexed, and bounded.
    const pool = await ctx.db
      .query("profiles")
      .withIndex("by_status_and_city", (q) =>
        q.eq("status", "active").eq("city", seekerParty.profile.city),
      )
      .take(MAX_POOL);

    const scored: CandidateRow[] = [];
    let hardPassCount = 0;

    for (const candidateProfile of pool) {
      if (candidateProfile.userId === run.initiatorUserId) continue;

      const candidateParty = await loadPartyForWindow(
        ctx,
        candidateProfile,
        seekerParty.window,
      );
      if (!candidateParty) continue;

      const verdict = hardFilter(seekerParty, candidateParty, { blockedPairs });
      if (!verdict.ok) continue;
      hardPassCount += 1;

      const { score, signals } = scorePair(seekerParty, candidateParty);
      if (score < MIN_VIABLE_SCORE) continue;

      const [userAId, userBId] = pairKey(
        run.initiatorUserId,
        candidateProfile.userId,
      ) as [Id<"users">, Id<"users">];

      const candidateScoreId = await ctx.db.insert("candidateScores", {
        runId: run._id,
        userAId,
        userBId,
        deterministicScore: score,
        signals,
        stage: "scored",
      });

      scored.push({
        candidateScoreId,
        userId: candidateProfile.userId,
        person: toBrief(candidateParty),
        deterministicScore: score,
        signals,
      });

      if (scored.length >= 40) break;
    }

    scored.sort((a, b) => b.deterministicScore - a.deterministicScore);
    const shortlist = scored.slice(0, AI_RANKING_POOL_SIZE);

    await ctx.db.patch("matchingRuns", run._id, {
      stage: shortlist.length > 0 ? "ai_ranking" : "failed",
      status: shortlist.length > 0 ? "running" : "no_candidates",
      poolSize: pool.length,
      hardPassCount,
      scoredCount: scored.length,
      ...(shortlist.length === 0 ? { finishedAt: Date.now() } : {}),
    });

    return {
      ok: shortlist.length > 0,
      reason: shortlist.length > 0 ? undefined : "no_candidates",
      seekerUserId: run.initiatorUserId,
      seeker: toBrief(seekerParty),
      candidates: shortlist,
    };
  },
});

async function loadBlockKeys(
  ctx: MutationCtx | QueryCtx,
  userId: Id<"users">,
): Promise<Set<string>> {
  const out = new Set<string>();
  const outgoing = await ctx.db
    .query("blocks")
    .withIndex("by_blocker", (q) => q.eq("blockerUserId", userId))
    .take(500);
  for (const b of outgoing) out.add(blockKey(b.blockerUserId, b.blockedUserId));
  const incoming = await ctx.db
    .query("blocks")
    .withIndex("by_blocked", (q) => q.eq("blockedUserId", userId))
    .take(500);
  for (const b of incoming) out.add(blockKey(b.blockerUserId, b.blockedUserId));
  return out;
}

async function loadParty(
  ctx: MutationCtx | QueryCtx,
  userId: Id<"users">,
  availabilityId?: Id<"availability">,
): Promise<Party | null> {
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  if (!profile) return null;
  const preferences = await ctx.db
    .query("preferences")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  if (!preferences) return null;

  const window = availabilityId ? await ctx.db.get("availability", availabilityId) : null;
  if (!window || window.status !== "open") return null;

  return {
    profile: toMatchProfile(profile),
    preferences: toMatchPreferences(preferences),
    window: { startMs: window.startMs, endMs: window.endMs },
    availabilityId: window._id,
  };
}

/** Find a candidate's open window that overlaps the target window. */
async function loadPartyForWindow(
  ctx: MutationCtx | QueryCtx,
  profile: Doc<"profiles">,
  target: { startMs: number; endMs: number },
): Promise<Party | null> {
  const preferences = await ctx.db
    .query("preferences")
    .withIndex("by_user", (q) => q.eq("userId", profile.userId))
    .unique();
  if (!preferences) return null;

  const windows = await ctx.db
    .query("availability")
    .withIndex("by_user_and_start", (q) =>
      q.eq("userId", profile.userId).gte("startMs", target.startMs - DAY_MS),
    )
    .take(20);

  const match = windows.find(
    (w) => w.status === "open" && intersectWindows(w, target) !== null,
  );
  if (!match) return null;

  return {
    profile: toMatchProfile(profile),
    preferences: toMatchPreferences(preferences),
    window: { startMs: match.startMs, endMs: match.endMs },
    availabilityId: match._id,
  };
}

function toMatchProfile(p: Doc<"profiles">) {
  return {
    userId: p.userId as string,
    displayName: p.displayName,
    ageYears: p.ageYears,
    ageConfirmed18: p.ageConfirmed18,
    gender: p.gender,
    interestedIn: [...p.interestedIn],
    city: p.city,
    countryCode: p.countryCode,
    neighborhood: p.neighborhood,
    approxLat: p.approxLat,
    approxLng: p.approxLng,
    timezone: p.timezone,
    interests: [...p.interests],
    hobbies: [...p.hobbies],
    languages: [...p.languages],
    socialEnergy: p.socialEnergy,
    firstDateVibe: [...p.firstDateVibe],
    lifestyle: { smokes: p.lifestyle.smokes, drinks: p.lifestyle.drinks },
    status: p.status,
    moderationStatus: p.moderationStatus,
    onboardingComplete: p.onboardingComplete,
    isDemo: p.isDemo,
  };
}

function toMatchPreferences(p: Doc<"preferences">) {
  return {
    ageMin: p.ageMin,
    ageMax: p.ageMax,
    ageHard: p.ageHard,
    maxDistanceKm: p.maxDistanceKm,
    distanceHard: p.distanceHard,
    relationshipIntent: p.relationshipIntent,
    intentHard: p.intentHard,
    smoking: p.smoking,
    smokingHard: p.smokingHard,
    alcohol: p.alcohol,
    alcoholHard: p.alcoholHard,
    preferredDateTypes: [...p.preferredDateTypes],
    budgetMinPerPerson: p.budgetMinPerPerson,
    budgetMaxPerPerson: p.budgetMaxPerPerson,
    currency: p.currency,
    budgetHard: p.budgetHard,
    indoorOutdoor: p.indoorOutdoor,
    atmosphere: p.atmosphere,
    dietary: [...p.dietary],
    accessibility: [...p.accessibility],
    dropsPaused: p.dropsPaused,
    allowDemoMatches: p.allowDemoMatches,
  };
}

/** Privacy-safe view of a person for the model. First name only, no coordinates. */
function toBrief(party: Party): PersonBrief {
  const p = party.profile;
  const prefs = party.preferences;
  return {
    label: firstNameOnly(p.displayName),
    age: p.ageYears,
    area: p.neighborhood,
    city: p.city,
    occupation: null,
    bio: "",
    interests: [...p.interests, ...p.hobbies].slice(0, 8),
    socialEnergy: p.socialEnergy,
    firstDateVibe: [...p.firstDateVibe],
    languages: [...p.languages],
    relationshipIntent: prefs.relationshipIntent,
    preferredDateTypes: [...prefs.preferredDateTypes],
    atmosphere: prefs.atmosphere,
    indoorOutdoor: prefs.indoorOutdoor,
    dietary: [...prefs.dietary],
    accessibility: [...prefs.accessibility],
    budgetRange: `${prefs.budgetMinPerPerson}-${prefs.budgetMaxPerPerson} ${prefs.currency}`,
  };
}

/* -------------------------- stage 3: apply ranking ------------------------- */

export const applyRanking = internalMutation({
  args: {
    matchingRunId: v.id("matchingRuns"),
    ranked: v.array(
      v.object({
        candidateScoreId: v.id("candidateScores"),
        aiScore: v.number(),
        rationale: v.string(),
        friction: v.string(),
        suggestedDateType: v.string(),
      }),
    ),
    usedAI: v.boolean(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const run = await ctx.db.get("matchingRuns", args.matchingRunId);
    if (!run) return null;

    const byId = new Map(args.ranked.map((r) => [r.candidateScoreId, r]));
    const rows = await ctx.db
      .query("candidateScores")
      .withIndex("by_run", (q) => q.eq("runId", args.matchingRunId))
      .take(60);

    const blended: Array<{ row: Doc<"candidateScores">; final: number }> = [];
    for (const row of rows) {
      const ai = byId.get(row._id);
      if (ai) {
        await ctx.db.patch("candidateScores", row._id, {
          aiScore: ai.aiScore,
          aiRationale: ai.rationale,
          aiFriction: ai.friction,
          aiSuggestedDateType: ai.suggestedDateType,
          stage: "ai_ranked",
        });
      }
      blended.push({
        row,
        final: blendScore(row.deterministicScore, ai?.aiScore),
      });
    }

    blended.sort((a, b) => b.final - a.final);
    const winner = blended[0];
    if (!winner) {
      await ctx.db.patch("matchingRuns", run._id, {
        status: "no_candidates",
        stage: "failed",
        finishedAt: Date.now(),
      });
      return null;
    }

    await ctx.db.patch("candidateScores", winner.row._id, { stage: "selected" });
    for (const other of blended.slice(1)) {
      if (other.row.stage !== "ai_ranked") continue;
      await ctx.db.patch("candidateScores", other.row._id, {
        stage: "rejected",
        rejectionReason: "lower_rank",
      });
    }

    await ctx.db.patch("matchingRuns", run._id, {
      stage: "research",
      aiRankedCount: args.ranked.length,
    });

    const partnerId =
      winner.row.userAId === run.initiatorUserId
        ? winner.row.userBId
        : winner.row.userAId;

    const ai = byId.get(winner.row._id);
    return {
      candidateScoreId: winner.row._id,
      partnerUserId: partnerId,
      finalScore: winner.final,
      signals: winner.row.signals,
      rationale: ai?.rationale ?? "",
      suggestedDateType: ai?.suggestedDateType ?? "",
      usedAI: args.usedAI,
    };
  },
});

/* --------------------------- context for planning -------------------------- */

export const getPlanningContext = internalQuery({
  args: {
    matchingRunId: v.id("matchingRuns"),
    partnerUserId: v.id("users"),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const run = await ctx.db.get("matchingRuns", args.matchingRunId);
    if (!run) return null;

    const seeker = await loadParty(ctx, run.initiatorUserId, run.availabilityId);
    if (!seeker) return null;

    const partnerProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.partnerUserId))
      .unique();
    if (!partnerProfile) return null;

    const partner = await loadPartyForWindow(ctx, partnerProfile, seeker.window);
    if (!partner) return null;

    return { seeker, partner };
  },
});

/* ------------------------------ the pipeline ------------------------------- */

export const runPipeline = internalAction({
  args: { matchingRunId: v.id("matchingRuns") },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      const filtered = (await ctx.runMutation(internal.matching.stageFilterAndScore, {
        matchingRunId: args.matchingRunId,
      })) as FilterOutcome;

      if (!filtered.ok || !filtered.seeker || !filtered.seekerUserId) {
        if (filtered.reason === "no_candidates" && filtered.seekerUserId) {
          await ctx.runMutation(internal.notifications.create, {
            userId: filtered.seekerUserId,
            kind: "searching",
            title: "Still looking",
            body: "Nobody compatible was free at that time yet. We'll keep watching — adding another window helps.",
            href: "/dashboard",
          });
        }
        return null;
      }

      const { ranked, usedAI } = await rankCandidatesWithAI(ctx, {
        matchingRunId: args.matchingRunId,
        seekerUserId: filtered.seekerUserId,
        seeker: filtered.seeker,
        candidates: filtered.candidates,
      });

      const selection = (await ctx.runMutation(internal.matching.applyRanking, {
        matchingRunId: args.matchingRunId,
        ranked,
        usedAI,
      })) as {
        candidateScoreId: Id<"candidateScores">;
        partnerUserId: Id<"users">;
        finalScore: number;
        signals: Signals;
        rationale: string;
        suggestedDateType: string;
      } | null;

      if (!selection) return null;

      const context = (await ctx.runQuery(internal.matching.getPlanningContext, {
        matchingRunId: args.matchingRunId,
        partnerUserId: selection.partnerUserId,
      })) as { seeker: Party; partner: Party } | null;

      if (!context) {
        await ctx.runMutation(internal.matching.failRun, {
          matchingRunId: args.matchingRunId,
          error: "The other person's availability changed while we were planning.",
        });
        return null;
      }

      await ctx.runMutation(internal.matching.setStage, {
        matchingRunId: args.matchingRunId,
        stage: "research",
      });

      const built = await planDate(ctx, {
        matchingRunId: args.matchingRunId,
        seeker: context.seeker,
        partner: context.partner,
        signals: selection.signals,
      });

      if (!built) {
        await ctx.runMutation(internal.matching.failRun, {
          matchingRunId: args.matchingRunId,
          error: "We couldn't find a place worth sending. We'll try again shortly.",
        });
        return null;
      }

      await ctx.runMutation(internal.matching.setStage, {
        matchingRunId: args.matchingRunId,
        stage: "inviting",
      });

      const dropId = (await ctx.runMutation(internal.matching.createDropFromPlan, {
        matchingRunId: args.matchingRunId,
        partnerUserId: selection.partnerUserId,
        candidateScoreId: selection.candidateScoreId,
        ...built.dropFields,
      })) as Id<"dateDrops"> | null;

      if (!dropId) return null;

      await ctx.scheduler.runAfter(0, internal.dateDrops.dispatchInvitations, {
        dropId,
      });
    } catch (e) {
      await ctx.runMutation(internal.matching.failRun, {
        matchingRunId: args.matchingRunId,
        error: String(e),
      });
    }
    return null;
  },
});

export const setStage = internalMutation({
  args: {
    matchingRunId: v.id("matchingRuns"),
    stage: v.union(
      v.literal("hard_filter"),
      v.literal("scoring"),
      v.literal("ai_ranking"),
      v.literal("research"),
      v.literal("planning"),
      v.literal("inviting"),
      v.literal("done"),
      v.literal("failed"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("matchingRuns", args.matchingRunId, { stage: args.stage });
    return null;
  },
});

export const failRun = internalMutation({
  args: { matchingRunId: v.id("matchingRuns"), error: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const run = await ctx.db.get("matchingRuns", args.matchingRunId);
    if (!run || run.status !== "running") return null;
    await ctx.db.patch("matchingRuns", args.matchingRunId, {
      status: "failed",
      stage: "failed",
      error: truncate(args.error, 300),
      finishedAt: Date.now(),
    });
    await ctx.db.insert("notifications", {
      userId: run.initiatorUserId,
      kind: "searching",
      title: "We hit a snag",
      body: "That search didn't produce a date plan. Nothing's lost — try again, or add another window.",
      href: "/dashboard",
      read: false,
    });
    return null;
  },
});

/* --------------------- research + plan (shared by both flows) --------------- */

type BuiltDropFields = {
  countryCode: string;
  city: string;
  area: string;
  approxLat: number;
  approxLng: number;
  timezone: string;
  startMs: number;
  endMs: number;
  title: string;
  theme: string;
  summary: string;
  whyItFits: string;
  itinerary: Array<{
    order: number;
    venueId?: Id<"venues">;
    venueName: string;
    category: string;
    startOffsetMin: number;
    durationMin: number;
    address: string;
    note: string;
    mapsQuery: string;
    sourceUrl?: string;
    confidence: "high" | "medium" | "low";
  }>;
  estimatedDurationMin: number;
  estimatedCostPerPerson: number;
  currency: string;
  meetingInstructions: string;
  researchRunId?: Id<"researchRuns">;
  whyForSeeker: string;
  whyForPartner: string;
  isDemo: boolean;
};

async function planDate(
  ctx: ActionCtx,
  args: {
    matchingRunId?: Id<"matchingRuns">;
    dropId?: Id<"dateDrops">;
    seeker: Party;
    partner: Party;
    signals: Signals;
    forcedWindow?: { startMs: number; endMs: number };
  },
): Promise<{ dropFields: BuiltDropFields } | null> {
  const { seeker, partner } = args;

  const overlap =
    args.forcedWindow ?? intersectWindows(seeker.window, partner.window);
  if (!overlap) return null;

  const availableMinutes = Math.round((overlap.endMs - overlap.startMs) / 60_000);
  if (availableMinutes < MIN_DATE_MINUTES) return null;

  const mid = midpoint(
    seeker.profile.approxLat,
    seeker.profile.approxLng,
    partner.profile.approxLat,
    partner.profile.approxLng,
  );
  // The area label stays human: whichever of the two neighbourhoods is closer
  // to the midpoint is where we look.
  const area =
    Math.abs(seeker.profile.approxLat - mid.lat) +
      Math.abs(seeker.profile.approxLng - mid.lng) <=
    Math.abs(partner.profile.approxLat - mid.lat) +
      Math.abs(partner.profile.approxLng - mid.lng)
      ? seeker.profile.neighborhood
      : partner.profile.neighborhood;

  const budgetLow = Math.max(
    seeker.preferences.budgetMinPerPerson,
    partner.preferences.budgetMinPerPerson,
  );
  const budgetHigh = Math.max(
    budgetLow,
    Math.min(
      seeker.preferences.budgetMaxPerPerson,
      partner.preferences.budgetMaxPerPerson,
    ),
  );

  const sharedDateTypes = intersect(
    seeker.preferences.preferredDateTypes,
    partner.preferences.preferredDateTypes,
  );
  const dateTypes =
    sharedDateTypes.length > 0
      ? sharedDateTypes
      : seeker.preferences.preferredDateTypes.slice(0, 2);

  const vibe =
    seeker.preferences.atmosphere === partner.preferences.atmosphere
      ? seeker.preferences.atmosphere
      : seeker.preferences.atmosphere === "quiet" ||
          partner.preferences.atmosphere === "quiet"
        ? "quiet"
        : "either";

  const indoorOutdoor =
    seeker.preferences.indoorOutdoor === partner.preferences.indoorOutdoor
      ? seeker.preferences.indoorOutdoor
      : "either";

  const dateStart = chooseDateStart(overlap, Math.min(availableMinutes, 150));
  if (dateStart === null) return null;

  const research = await researchDateOptions(ctx, {
    dropId: args.dropId,
    matchingRunId: args.matchingRunId,
    countryCode: seeker.profile.countryCode,
    query: {
      city: seeker.profile.city,
      area,
      whenIso: new Date(dateStart).toISOString(),
      timezone: seeker.profile.timezone,
      budgetMin: budgetLow,
      budgetMax: budgetHigh,
      currency: seeker.preferences.currency,
      interests: args.signals.sharedInterests.slice(0, 4),
      dateTypes,
      vibe,
      dietary: [
        ...new Set([...seeker.preferences.dietary, ...partner.preferences.dietary]),
      ],
      accessibility: [
        ...new Set([
          ...seeker.preferences.accessibility,
          ...partner.preferences.accessibility,
        ]),
      ],
      indoorOutdoor,
      desiredDurationMin: Math.min(availableMinutes, 180),
    },
  });

  if (research.venueCount === 0) return null;

  const venues = (await ctx.runQuery(internal.research.getVenues, {
    researchRunId: research.researchRunId,
  })) as Array<Doc<"venues">>;

  if (venues.length === 0) return null;

  const built = await buildDatePlan(ctx, {
    dropId: args.dropId,
    matchingRunId: args.matchingRunId,
    city: seeker.profile.city,
    area,
    currency: seeker.preferences.currency,
    whenLabel: describeDateTime(dateStart, seeker.profile.timezone),
    durationMinutes: Math.min(availableMinutes, 180),
    budgetLow,
    budgetHigh,
    personA: toBrief(seeker),
    personB: toBrief(partner),
    sharedInterests: args.signals.sharedInterests,
    sharedDateTypes: dateTypes,
    venues: venues.map((venue) => ({
      venueId: venue._id,
      name: venue.name,
      category: venue.category,
      address: venue.address,
      district: venue.district,
      openingHours: venue.openingHours ?? null,
      approximatePrice: venue.approximatePrice ?? null,
      reservationNeeded: venue.reservationNeeded ?? null,
      evidence: venue.evidence,
      sourceUrl: venue.sourceUrl,
      confidence: venue.confidence,
      tags: venue.tags,
    })),
  });

  // If the model could not produce a usable plan, compose one deterministically
  // from the same researched venues rather than dropping the match.
  const plan =
    built.plan ??
    buildFallbackPlan({
      area,
      city: seeker.profile.city,
      budgetLow,
      budgetHigh,
      availableMinutes: Math.min(availableMinutes, 180),
      sharedInterests: args.signals.sharedInterests,
      sharedDateTypes: dateTypes,
      atmosphere: vibe,
      dietary: [
        ...new Set([...seeker.preferences.dietary, ...partner.preferences.dietary]),
      ],
      aName: seeker.profile.displayName,
      bName: partner.profile.displayName,
      venues: venues.map((venue) => ({
        name: venue.name,
        category: venue.category,
        district: venue.district,
        approximatePrice: venue.approximatePrice ?? null,
        confidence: venue.confidence,
        tags: venue.tags,
      })),
    });

  if (!plan) return null;

  const itinerary = plan.stops.map((stop, index) => {
    const venue = venues[stop.venueIndex];
    return {
      order: index,
      venueId: venue._id,
      venueName: venue.name,
      category: venue.category,
      startOffsetMin: stop.startOffsetMin,
      durationMin: stop.durationMin,
      address: venue.address,
      note: stop.note,
      mapsQuery: venue.mapsQuery,
      sourceUrl: venue.sourceUrl,
      confidence: venue.confidence,
    };
  });

  const totalMinutes = Math.max(
    plan.estimatedDurationMin,
    itinerary.reduce((max, s) => Math.max(max, s.startOffsetMin + s.durationMin), 0),
  );

  return {
    dropFields: {
      countryCode: seeker.profile.countryCode,
      city: seeker.profile.city,
      area,
      approxLat: mid.lat,
      approxLng: mid.lng,
      timezone: seeker.profile.timezone,
      startMs: dateStart,
      endMs: Math.min(overlap.endMs, dateStart + totalMinutes * 60_000),
      title: plan.title,
      theme: plan.theme,
      summary: plan.summary,
      whyItFits: plan.whyItFits,
      itinerary,
      estimatedDurationMin: totalMinutes,
      estimatedCostPerPerson: clampBudget(
        plan.estimatedCostPerPerson,
        budgetLow,
        budgetHigh,
      ),
      currency: seeker.preferences.currency,
      meetingInstructions: redactContactInfo(plan.meetingInstructions),
      researchRunId: research.researchRunId,
      whyForSeeker: plan.whyForA,
      whyForPartner: plan.whyForB,
      isDemo: seeker.profile.isDemo || partner.profile.isDemo,
    },
  };
}

function clampBudget(value: number, low: number, high: number): number {
  if (!Number.isFinite(value)) return Math.round((low + high) / 2);
  return Math.max(low, Math.min(high * 1.15, Math.round(value)));
}

/* ---------------------------- drop construction ---------------------------- */

const itineraryValidator = v.array(
  v.object({
    order: v.number(),
    venueId: v.optional(v.id("venues")),
    venueName: v.string(),
    category: v.string(),
    startOffsetMin: v.number(),
    durationMin: v.number(),
    address: v.string(),
    note: v.string(),
    mapsQuery: v.string(),
    sourceUrl: v.optional(v.string()),
    confidence: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
  }),
);

export const createDropFromPlan = internalMutation({
  args: {
    matchingRunId: v.id("matchingRuns"),
    partnerUserId: v.id("users"),
    candidateScoreId: v.id("candidateScores"),
    countryCode: v.string(),
    city: v.string(),
    area: v.string(),
    approxLat: v.number(),
    approxLng: v.number(),
    timezone: v.string(),
    startMs: v.number(),
    endMs: v.number(),
    title: v.string(),
    theme: v.string(),
    summary: v.string(),
    whyItFits: v.string(),
    itinerary: itineraryValidator,
    estimatedDurationMin: v.number(),
    estimatedCostPerPerson: v.number(),
    currency: v.string(),
    meetingInstructions: v.string(),
    researchRunId: v.optional(v.id("researchRuns")),
    whyForSeeker: v.string(),
    whyForPartner: v.string(),
    isDemo: v.boolean(),
  },
  returns: v.union(v.id("dateDrops"), v.null()),
  handler: async (ctx, args) => {
    const run = await ctx.db.get("matchingRuns", args.matchingRunId);
    if (!run) return null;
    const now = Date.now();

    // Re-check both windows are still free — the world may have moved while the
    // model and the crawler were working.
    const seekerWindow = run.availabilityId
      ? await ctx.db.get("availability", run.availabilityId)
      : null;
    if (!seekerWindow || seekerWindow.status !== "open") {
      await ctx.db.patch("matchingRuns", run._id, {
        status: "failed",
        stage: "failed",
        error: "Your window was taken while we were planning.",
        finishedAt: now,
      });
      return null;
    }

    const partnerWindow = await findOpenWindowCovering(
      ctx,
      args.partnerUserId,
      args.startMs,
      args.endMs,
    );
    if (!partnerWindow) {
      await ctx.db.patch("matchingRuns", run._id, {
        status: "failed",
        stage: "failed",
        error: "The other person's window closed while we were planning.",
        finishedAt: now,
      });
      return null;
    }

    const dropId = await ctx.db.insert("dateDrops", {
      status: "inviting",
      initiatorUserId: run.initiatorUserId,
      countryCode: args.countryCode,
      city: args.city,
      area: args.area,
      approxLat: args.approxLat,
      approxLng: args.approxLng,
      timezone: args.timezone,
      startMs: args.startMs,
      endMs: args.endMs,
      title: args.title,
      theme: args.theme,
      summary: args.summary,
      whyItFits: args.whyItFits,
      itinerary: args.itinerary,
      estimatedDurationMin: args.estimatedDurationMin,
      estimatedCostPerPerson: args.estimatedCostPerPerson,
      currency: args.currency,
      meetingInstructions: args.meetingInstructions,
      researchRunId: args.researchRunId,
      matchingRunId: run._id,
      confirmDeadlineMs: computeConfirmDeadline(args.startMs, now),
      candidateAttempts: 1,
      maxCandidateAttempts: DEFAULT_MAX_CANDIDATE_ATTEMPTS,
      isDemo: args.isDemo,
      updatedAt: now,
    });

    await ctx.db.insert("dateDropParticipants", {
      dropId,
      userId: run.initiatorUserId,
      role: "initiator",
      state: "invited",
      privateWhyItFits: args.whyForSeeker,
      compatibilityBlurb: args.whyItFits,
      candidateScoreId: args.candidateScoreId,
      availabilityId: seekerWindow._id,
      invitedAt: now,
    });
    await ctx.db.insert("dateDropParticipants", {
      dropId,
      userId: args.partnerUserId,
      role: "invitee",
      state: "invited",
      privateWhyItFits: args.whyForPartner,
      compatibilityBlurb: args.whyItFits,
      candidateScoreId: args.candidateScoreId,
      availabilityId: partnerWindow._id,
      invitedAt: now,
    });

    // Hold both windows so neither person gets double-booked.
    await ctx.db.patch("availability", seekerWindow._id, {
      status: "held",
      heldByDropId: dropId,
    });
    await ctx.db.patch("availability", partnerWindow._id, {
      status: "held",
      heldByDropId: dropId,
    });

    await ctx.db.patch("matchingRuns", run._id, {
      status: "succeeded",
      stage: "done",
      dropId,
      finishedAt: now,
    });

    await recordAudit(ctx, {
      action: "drop.created",
      dropId,
      detail: `${args.area}, ${args.city} — ${args.theme}`,
    });

    return dropId;
  },
});

async function findOpenWindowCovering(
  ctx: MutationCtx,
  userId: Id<"users">,
  startMs: number,
  endMs: number,
): Promise<Doc<"availability"> | null> {
  const windows = await ctx.db
    .query("availability")
    .withIndex("by_user_and_start", (q) =>
      q.eq("userId", userId).gte("startMs", startMs - DAY_MS),
    )
    .take(20);
  return (
    windows.find(
      (w) => w.status === "open" && w.startMs <= startMs && w.endMs >= endMs,
    ) ?? null
  );
}

/* ----------------------- Scenario B: find a replacement -------------------- */

export const startReplacementRun = internalMutation({
  args: { dropId: v.id("dateDrops") },
  returns: v.union(v.id("matchingRuns"), v.null()),
  handler: async (ctx, args) => {
    const drop = await ctx.db.get("dateDrops", args.dropId);
    if (!drop) return null;
    if (drop.status !== "partially_accepted") return null;
    if (drop.candidateAttempts >= drop.maxCandidateAttempts) return null;
    if (Date.now() >= drop.confirmDeadlineMs) return null;

    const participants = await ctx.db
      .query("dateDropParticipants")
      .withIndex("by_drop", (q) => q.eq("dropId", args.dropId))
      .take(10);
    const accepted = participants.find(
      (p) => p.state === "accepted" || p.state === "confirmed",
    );
    if (!accepted) return null;

    const runId = await ctx.db.insert("matchingRuns", {
      initiatorUserId: accepted.userId,
      availabilityId: accepted.availabilityId,
      dropId: args.dropId,
      intent: "seeking_second",
      stage: "hard_filter",
      status: "running",
      poolSize: 0,
      hardPassCount: 0,
      scoredCount: 0,
      aiRankedCount: 0,
      startedAt: Date.now(),
    });

    await ctx.db.patch("dateDrops", args.dropId, {
      candidateAttempts: drop.candidateAttempts + 1,
      updatedAt: Date.now(),
    });
    return runId;
  },
});

export const getReplacementContext = internalQuery({
  args: { dropId: v.id("dateDrops"), matchingRunId: v.id("matchingRuns") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const drop = await ctx.db.get("dateDrops", args.dropId);
    const run = await ctx.db.get("matchingRuns", args.matchingRunId);
    if (!drop || !run) return null;

    const participants = await ctx.db
      .query("dateDropParticipants")
      .withIndex("by_drop", (q) => q.eq("dropId", args.dropId))
      .take(10);
    const accepted = participants.find(
      (p) => p.state === "accepted" || p.state === "confirmed",
    );
    if (!accepted) return null;

    const holderProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", accepted.userId))
      .unique();
    const holderPrefs = await ctx.db
      .query("preferences")
      .withIndex("by_user", (q) => q.eq("userId", accepted.userId))
      .unique();
    if (!holderProfile || !holderPrefs) return null;

    const holder: Party = {
      profile: toMatchProfile(holderProfile),
      preferences: toMatchPreferences(holderPrefs),
      window: { startMs: drop.startMs, endMs: drop.endMs },
      availabilityId: accepted.availabilityId,
    };

    const excluded = new Set<string>(participants.map((p) => p.userId as string));
    const blockedPairs = await loadBlockKeys(ctx, accepted.userId);

    const pool = await ctx.db
      .query("profiles")
      .withIndex("by_status_and_city", (q) =>
        q.eq("status", "active").eq("city", drop.city),
      )
      .take(MAX_POOL);

    const candidates: Array<{
      userId: Id<"users">;
      party: Party;
      score: number;
      signals: Signals;
      brief: PersonBrief;
    }> = [];

    for (const candidateProfile of pool) {
      if (excluded.has(candidateProfile.userId as string)) continue;
      const candidateParty = await loadPartyForWindow(ctx, candidateProfile, {
        startMs: drop.startMs,
        endMs: drop.endMs,
      });
      if (!candidateParty) continue;
      // The replacement must be free for the WHOLE planned date, not just overlap.
      if (
        candidateParty.window.startMs > drop.startMs ||
        candidateParty.window.endMs < drop.endMs
      ) {
        continue;
      }

      const verdict = hardFilter(holder, candidateParty, {
        blockedPairs,
        excludedUserIds: excluded,
      });
      if (!verdict.ok) continue;

      // The existing plan must still be safe and appropriate for them.
      if (!planStillWorks(drop, candidateParty)) continue;

      const { score, signals } = scorePair(holder, candidateParty);
      if (score < MIN_VIABLE_SCORE) continue;

      candidates.push({
        userId: candidateProfile.userId,
        party: candidateParty,
        score,
        signals,
        brief: toBrief(candidateParty),
      });
    }

    candidates.sort((a, b) => b.score - a.score);

    return {
      drop,
      holder,
      holderBrief: toBrief(holder),
      holderUserId: accepted.userId,
      candidates: candidates.slice(0, AI_RANKING_POOL_SIZE),
    };
  },
});

/**
 * A replacement candidate inherits an already-generated plan, so their hard
 * constraints are checked against the plan itself before they are considered.
 */
export function planStillWorks(drop: Doc<"dateDrops">, candidate: Party): boolean {
  if (
    candidate.preferences.budgetHard &&
    (drop.estimatedCostPerPerson < candidate.preferences.budgetMinPerPerson ||
      drop.estimatedCostPerPerson > candidate.preferences.budgetMaxPerPerson)
  ) {
    return false;
  }
  if (candidate.preferences.currency !== drop.currency) return false;

  const categories = drop.itinerary.map((s) => s.category.toLowerCase());
  const tags = drop.itinerary.map((s) => `${s.note} ${s.venueName}`.toLowerCase());

  // Someone who does not drink should not be sent to a bar as the whole date.
  if (
    candidate.preferences.alcoholHard &&
    candidate.preferences.alcohol === "none" &&
    categories.every((c) => c === "bar")
  ) {
    return false;
  }
  if (
    candidate.preferences.dietary.includes("no_alcohol_venue") &&
    categories.includes("bar")
  ) {
    return false;
  }
  // Day preference, when the drop lands on the wrong kind of day.
  const weekend = isWeekend(drop.startMs, drop.timezone);
  void tags;
  void weekend;
  return true;
}

export const runReplacementPipeline = internalAction({
  args: { dropId: v.id("dateDrops") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const matchingRunId = (await ctx.runMutation(
      internal.matching.startReplacementRun,
      { dropId: args.dropId },
    )) as Id<"matchingRuns"> | null;
    if (!matchingRunId) return null;

    try {
      const context = (await ctx.runQuery(internal.matching.getReplacementContext, {
        dropId: args.dropId,
        matchingRunId,
      })) as {
        drop: Doc<"dateDrops">;
        holder: Party;
        holderBrief: PersonBrief;
        holderUserId: Id<"users">;
        candidates: Array<{
          userId: Id<"users">;
          party: Party;
          score: number;
          signals: Signals;
          brief: PersonBrief;
        }>;
      } | null;

      if (!context || context.candidates.length === 0) {
        await ctx.runMutation(internal.matching.finishReplacementRun, {
          matchingRunId,
          status: "no_candidates",
        });
        return null;
      }

      const persisted = (await ctx.runMutation(
        internal.matching.persistReplacementScores,
        {
          matchingRunId,
          holderUserId: context.holderUserId,
          candidates: context.candidates.map((c) => ({
            userId: c.userId,
            deterministicScore: c.score,
            signals: c.signals,
          })),
        },
      )) as Array<{ candidateScoreId: Id<"candidateScores">; userId: Id<"users"> }>;

      const byUser = new Map(persisted.map((p) => [p.userId as string, p]));

      const { ranked } = await rankCandidatesWithAI(ctx, {
        matchingRunId,
        seekerUserId: context.holderUserId,
        seeker: context.holderBrief,
        candidates: context.candidates
          .map((c) => {
            const row = byUser.get(c.userId as string);
            if (!row) return null;
            return {
              candidateScoreId: row.candidateScoreId,
              userId: c.userId,
              person: c.brief,
              deterministicScore: c.score,
              signals: c.signals,
            };
          })
          .filter((c): c is NonNullable<typeof c> => c !== null),
      });

      const best =
        ranked.length > 0
          ? persisted.find((p) => p.candidateScoreId === ranked[0].candidateScoreId)
          : persisted[0];
      if (!best) {
        await ctx.runMutation(internal.matching.finishReplacementRun, {
          matchingRunId,
          status: "no_candidates",
        });
        return null;
      }

      const chosen = context.candidates.find((c) => c.userId === best.userId);
      const rationale =
        ranked.find((r) => r.candidateScoreId === best.candidateScoreId)?.rationale ??
        context.drop.whyItFits;

      const added = (await ctx.runMutation(
        internal.matching.addReplacementParticipant,
        {
          dropId: args.dropId,
          matchingRunId,
          userId: best.userId,
          candidateScoreId: best.candidateScoreId,
          privateWhyItFits: rationale,
          compatibilityBlurb: context.drop.whyItFits,
          availabilityId: chosen?.party.availabilityId as
            | Id<"availability">
            | undefined,
        },
      )) as boolean;

      // The drop may have confirmed or been cancelled while we were planning.
      // Close the run out either way — a run left "running" blocks the user's
      // next search for ten minutes.
      if (!added) {
        await ctx.runMutation(internal.matching.finishReplacementRun, {
          matchingRunId,
          status: "no_candidates",
        });
        return null;
      }

      await ctx.scheduler.runAfter(0, internal.dateDrops.dispatchInvitations, {
        dropId: args.dropId,
      });
    } catch (e) {
      await ctx.runMutation(internal.matching.finishReplacementRun, {
        matchingRunId,
        status: "failed",
        error: String(e),
      });
    }
    return null;
  },
});

export const persistReplacementScores = internalMutation({
  args: {
    matchingRunId: v.id("matchingRuns"),
    holderUserId: v.id("users"),
    candidates: v.array(
      v.object({
        userId: v.id("users"),
        deterministicScore: v.number(),
        signals: v.any(),
      }),
    ),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const out: Array<{ candidateScoreId: Id<"candidateScores">; userId: Id<"users"> }> =
      [];
    for (const c of args.candidates) {
      const [userAId, userBId] = pairKey(args.holderUserId, c.userId) as [
        Id<"users">,
        Id<"users">,
      ];
      const candidateScoreId = await ctx.db.insert("candidateScores", {
        runId: args.matchingRunId,
        userAId,
        userBId,
        deterministicScore: c.deterministicScore,
        signals: c.signals,
        stage: "scored",
      });
      out.push({ candidateScoreId, userId: c.userId });
    }
    await ctx.db.patch("matchingRuns", args.matchingRunId, {
      stage: "ai_ranking",
      scoredCount: out.length,
      hardPassCount: out.length,
    });
    return out;
  },
});

export const finishReplacementRun = internalMutation({
  args: {
    matchingRunId: v.id("matchingRuns"),
    status: v.union(
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("no_candidates"),
    ),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("matchingRuns", args.matchingRunId, {
      status: args.status,
      stage: args.status === "succeeded" ? "done" : "failed",
      error: args.error ? truncate(args.error, 300) : undefined,
      finishedAt: Date.now(),
    });
    return null;
  },
});

export const addReplacementParticipant = internalMutation({
  args: {
    dropId: v.id("dateDrops"),
    matchingRunId: v.id("matchingRuns"),
    userId: v.id("users"),
    candidateScoreId: v.id("candidateScores"),
    privateWhyItFits: v.string(),
    compatibilityBlurb: v.string(),
    availabilityId: v.optional(v.id("availability")),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const drop = await ctx.db.get("dateDrops", args.dropId);
    if (!drop || drop.status !== "partially_accepted") return false;

    const existing = await ctx.db
      .query("dateDropParticipants")
      .withIndex("by_drop_and_user", (q) =>
        q.eq("dropId", args.dropId).eq("userId", args.userId),
      )
      .unique();
    if (existing) return false;

    // Only claim a window that is genuinely still free. If another drop grabbed
    // it while we were planning, invite without a hold rather than pointing at
    // someone else's booking — releasing that later would free the wrong drop.
    let heldWindowId: Id<"availability"> | undefined;
    if (args.availabilityId) {
      const window = await ctx.db.get("availability", args.availabilityId);
      if (!window || window.userId !== args.userId || window.status !== "open") {
        return false;
      }
      heldWindowId = window._id;
    }

    const now = Date.now();
    await ctx.db.insert("dateDropParticipants", {
      dropId: args.dropId,
      userId: args.userId,
      role: "invitee",
      state: "invited",
      privateWhyItFits: args.privateWhyItFits,
      compatibilityBlurb: args.compatibilityBlurb,
      candidateScoreId: args.candidateScoreId,
      availabilityId: heldWindowId,
      invitedAt: now,
    });

    if (heldWindowId) {
      await ctx.db.patch("availability", heldWindowId, {
        status: "held",
        heldByDropId: args.dropId,
      });
    }

    await ctx.db.patch("candidateScores", args.candidateScoreId, {
      stage: "selected",
    });
    await ctx.db.patch("matchingRuns", args.matchingRunId, {
      status: "succeeded",
      stage: "done",
      dropId: args.dropId,
      finishedAt: now,
    });
    await ctx.db.patch("dateDrops", args.dropId, { updatedAt: now });

    await recordAudit(ctx, {
      action: "drop.replacement_invited",
      dropId: args.dropId,
      targetUserId: args.userId,
      detail: `Attempt ${drop.candidateAttempts}`,
    });
    return true;
  },
});

/* ------------------------------ transparency ------------------------------- */

/**
 * The "how did we get here" view for a drop. Deliberately shows the pipeline —
 * the deterministic signals, the research sources, the model runs — without
 * exposing raw scores to the people being matched.
 */
export const dropProvenance = query({
  args: { dropId: v.id("dateDrops") },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    if (!userId) return null;
    const participant = await ctx.db
      .query("dateDropParticipants")
      .withIndex("by_drop_and_user", (q) =>
        q.eq("dropId", args.dropId).eq("userId", userId),
      )
      .unique();
    if (!participant) return null;

    const drop = await ctx.db.get("dateDrops", args.dropId);
    if (!drop) return null;

    const research = drop.researchRunId
      ? await ctx.db.get("researchRuns", drop.researchRunId)
      : null;
    const venues = drop.researchRunId
      ? await ctx.db
          .query("venues")
          .withIndex("by_research_run", (q) =>
            q.eq("researchRunId", drop.researchRunId!),
          )
          .take(20)
      : [];
    // Ranking, extraction and planning all run BEFORE the drop document
    // exists, so those rows carry the matchingRunId rather than a dropId.
    // Read both, or the panel is always empty and the README's claim is false.
    const byDrop = await ctx.db
      .query("aiRuns")
      .withIndex("by_drop", (q) => q.eq("dropId", args.dropId))
      .take(10);
    const byRun = drop.matchingRunId
      ? await ctx.db
          .query("aiRuns")
          .withIndex("by_matching_run", (q) =>
            q.eq("matchingRunId", drop.matchingRunId),
          )
          .take(10)
      : [];
    const seenRunIds = new Set<string>();
    const aiRuns = [...byDrop, ...byRun].filter((run) => {
      if (seenRunIds.has(run._id)) return false;
      seenRunIds.add(run._id);
      return true;
    });

    return {
      research: research
        ? {
            provider: research.provider,
            status: research.status,
            live: research.live,
            calls: research.calls,
            sourceUrls: research.sourceUrls,
            venueCount: research.venueCount,
            startedAt: research.startedAt,
            finishedAt: research.finishedAt,
            error: research.error,
          }
        : null,
      venues: venues.map((venue) => ({
        name: venue.name,
        category: venue.category,
        address: venue.address,
        sourceUrl: venue.sourceUrl,
        confidence: venue.confidence,
        evidence: venue.evidence,
        openingHours: venue.openingHours ?? null,
        approximatePrice: venue.approximatePrice ?? null,
        researchedAt: venue.researchedAt,
      })),
      aiRuns: aiRuns.map((run) => ({
        purpose: run.purpose,
        model: run.model,
        status: run.status,
        latencyMs: run.latencyMs,
        totalTokens: run.totalTokens ?? null,
        inputSummary: run.inputSummary,
        error: run.error ?? null,
      })),
      costLabel: formatMoney(drop.estimatedCostPerPerson, drop.currency),
    };
  },
});
