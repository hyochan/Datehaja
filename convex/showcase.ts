import { v } from "convex/values";
import { reflectionValidator, sceneKindValidator } from "./lib/dateStory";
import { dateActivityValidator } from "./lib/dateActivity";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { conversationLimit, syntheticAgentName } from "./agentDates";
import {
  agentAvatarValidator,
  defaultAvatarFor,
} from "./lib/agentAvatar";
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
  locale: v.optional(v.string()),
  setting: v.string(),
  sceneKind: v.optional(sceneKindValidator),
  sceneSituation: v.optional(v.string()),
  activityJournal: v.optional(dateActivityValidator),
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
    reflection: v.optional(reflectionValidator),
    nextSearchNote: v.optional(v.string()),
  }),
  counterpart: v.object({
    agentName: v.string(),
    avatar: nullableAvatarValidator,
    verdict: v.string(),
    reason: v.string(),
    reflection: v.optional(reflectionValidator),
    nextSearchNote: v.optional(v.string()),
  }),
});

/** Statuses in which a date has a full transcript and both verdicts written. */
const FINISHED = ["debrief_ready", "connected", "closed"] as const;

export const publicDate = query({
  args: {},
  returns: v.union(v.null(), showcaseValidator),
  handler: async (ctx) => readRecording(ctx),
});

/** Internal preview uses the very same privacy projection as the public page. */
export const preview = internalQuery({
  args: { agentDateId: v.id("agentDates") },
  returns: v.union(v.null(), showcaseValidator),
  handler: async (ctx, args) => readRecording(ctx, args.agentDateId),
});

async function readRecording(ctx: QueryCtx, candidateId?: Id<"agentDates">) {
    const publication = candidateId ? null : await ctx.db.query("showcasePublications")
      .withIndex("by_slot", q => q.eq("slot", "main")).unique();
    const selectedId = candidateId ?? publication?.agentDateId;
    for (const status of FINISHED) {
      // Keep an existing installation readable until its first reviewed record
      // is published. Once pinned, a missing/invalid record fails closed; never
      // replace it with a random date from a moving 20-row status window.
      const selected = selectedId ? await ctx.db.get("agentDates", selectedId) : null;
      const dates = selectedId ? (selected?.status === status ? [selected] : []) : await ctx.db
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
            .take(17),
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

        // An Agent whose owner never named one still spoke under a name in the
        // transcript. Resolve it exactly the way the date did, so the page can
        // never label a character "Agent" beside its own quoted words — and so
        // the face derived from that name matches too.
        const initiatorName =
          initiatorAgent?.name ?? syntheticAgentName(initiator.userId);
        const counterpartName =
          counterpartAgent?.name ??
          syntheticAgentName(counterpart.userId, initiatorName);

        // A pin must keep meeting the publish bar after later review retries.
        if (publication && (!date.completedAt || !date.activityJournal?.events.length ||
            !date.initiatorReflection || !date.counterpartReflection)) continue;

        return {
          locale: date.locale,
          setting: date.setting,
          sceneKind: date.sceneKind,
          sceneSituation: date.sceneSituation,
          activityJournal: date.activityJournal,
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
            agentName: initiatorName,
            avatar:
              initiatorAgent?.avatar ??
              defaultAvatarFor(initiatorName, initiator.gender),
            verdict: date.initiatorVerdict,
            reason: date.initiatorReason,
            reflection: date.initiatorReflection,
            nextSearchNote: date.initiatorNextSearchNote,
          },
          counterpart: {
            agentName: counterpartName,
            avatar:
              counterpartAgent?.avatar ??
              defaultAvatarFor(counterpartName, counterpart.gender),
            verdict: date.counterpartVerdict,
            reason: date.counterpartReason,
            reflection: date.counterpartReflection,
            nextSearchNote: date.counterpartNextSearchNote,
          },
        };
      }
    }
    return null;
}

export const publish = internalMutation({
  args: { agentDateId: v.id("agentDates") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const date = await ctx.db.get("agentDates", args.agentDateId);
    const projected = await readRecording(ctx, args.agentDateId);
    if (!date || !projected) throw new Error("Only a completed date between two fictional personas can be published.");
    if (!date.completedAt || !date.activityJournal?.events.length ||
        !date.initiatorReflection || !date.counterpartReflection ||
        projected.turns.length !== conversationLimit(date) ||
        projected.turns.some((turn, index) => turn.round !== index + 1)) {
      throw new Error("Finish the full conversation, verified journal and both reflections before publishing.");
    }
    const publication = await ctx.db.query("showcasePublications")
      .withIndex("by_slot", q => q.eq("slot", "main")).unique();
    if (publication) await ctx.db.patch("showcasePublications", publication._id, { agentDateId: date._id, publishedAt: Date.now() });
    else await ctx.db.insert("showcasePublications", { slot: "main", agentDateId: date._id, publishedAt: Date.now() });
    return null;
  },
});

/** Fresh, explicitly fictional participants avoid exhausting the old seed cast.
 * They never enter real search; the normal demo date pipeline generates every
 * turn, journal and independent review. No email can be sent to these owners. */
export const prepareFreshPair = internalMutation({
  args: {},
  returns: v.object({ initiatorUserId: v.id("users"), counterpartUserId: v.id("users") }),
  handler: async ctx => {
    const now = Date.now();
    const people = [
      { name: "Juno", gender: "man" as const, other: "woman" as const, voice: "playful" as const,
        essence: "I design everyday objects. I enjoy making things, dry little jokes, and unhurried coffee. I can sound outgoing, but I need quiet after a crowd. I prefer short, concrete replies to a string of questions.",
        desire: "Someone with a taste of their own. Disagreement about small things is welcome. I am interested in casual dating, taking time to get to know someone." },
      { name: "Sol", gender: "woman" as const, other: "man" as const, voice: "quiet" as const,
        essence: "I edit books and draw in the margins. I prefer tea to coffee. I am quietly funny, and I will say when an idea is not for me. I do not fill every pause. I answer what I am asked before changing the subject.",
        desire: "A person who is comfortable with independent choices and a little silence. I want casual dating, with no rush or promise of commitment." },
    ];
    const created: Id<"users">[] = [];
    for (const person of people) {
      const userId = await ctx.db.insert("users", { name: `Fictional ${person.name}`, email: `showcase-${person.name.toLowerCase()}-${now}@demo.test.invalid` });
      created.push(userId);
      await ctx.db.insert("profiles", {
        userId, preferredLocale: "en-US", displayName: `Fictional ${person.name}`,
        dobMs: Date.UTC(1994, 5, 15), ageYears: new Date(now).getUTCFullYear() - 1994 - (now < Date.UTC(new Date(now).getUTCFullYear(), 5, 15) ? 1 : 0), ageConfirmed18: true,
        gender: person.gender, interestedIn: [person.other], countryCode: "KR", city: "Seoul", neighborhood: "Seongsu",
        approxLat: 37.54, approxLng: 127.06, timezone: "Asia/Seoul", bio: person.essence,
        showOccupation: false, interests: ["Reading", "Coffee", "Art galleries"], hobbies: [], languages: ["English"],
        socialEnergy: "ambivert", firstDateVibe: [], lifestyle: { smokes: false, drinks: "occasional" },
        onboardingStep: 7, onboardingComplete: true, status: "active", moderationStatus: "ok", isDemo: true, updatedAt: now,
      });
      await ctx.db.insert("preferences", {
        userId, matchLocationScope: "area", preferredCountryCodes: ["KR"], preferredCities: ["Seoul"], preferredAreas: ["Seongsu"],
        allowTranslatedDates: false, ageMin: 25, ageMax: 40, ageHard: true, maxDistanceKm: 15, distanceHard: true,
        relationshipIntent: "casual", intentHard: true, smoking: "no_preference", smokingHard: false, alcohol: "no_preference", alcoholHard: false,
        preferredDateTypes: ["coffee"], budgetMinPerPerson: 10000, budgetMaxPerPerson: 50000, currency: "KRW", budgetHard: false,
        dayPreference: "either", indoorOutdoor: "either", atmosphere: "quiet", dietary: [], accessibility: [],
        notifyEmail: false, notifyInvitations: false, notifyConfirmations: false, notifyReminders: false,
        dropsPaused: false, maxDropsPerWeek: 5, allowDemoMatches: true, updatedAt: now,
      });
      await ctx.db.insert("agentProfiles", {
        userId, name: person.name, avatar: defaultAvatarFor(person.name, person.gender), essence: person.essence,
        desiredConnection: person.desire, boundaries: ["No pressure to meet", "No contact disclosure"], voice: person.voice,
        autonomy: "suggest", privateMemory: "", status: "active", createdAt: now, updatedAt: now,
      });
    }
    return { initiatorUserId: created[0]!, counterpartUserId: created[1]! };
  },
});

export const startRefresh = internalAction({
  args: {},
  returns: v.id("agentDates"),
  handler: async (ctx): Promise<Id<"agentDates">> => {
    const pair = await ctx.runMutation(internal.showcase.prepareFreshPair, {});
    return await ctx.runMutation(internal.agentDates.createRequest, {
      userId: pair.initiatorUserId,
      counterpartUserId: pair.counterpartUserId,
      accessMode: "demo",
      locale: "en-US",
      demoOnly: true,
    });
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
    const agentName = syntheticAgentName(persona.userId, persona.displayName);
    await ctx.db.insert("agentProfiles", {
      userId: persona.userId,
      // An Agent is its own character, never a second copy of its human. Naming
      // it after the persona produced transcripts like "I'm Alex, and my friend
      // Alex runs in the mornings", which reads as a bug to anyone watching.
      name: agentName,
      // Mint a face too. Without one the public replay derives a default from
      // the name alone, which cannot know the persona's gender and rendered a
      // seeded man as a woman.
      avatar: defaultAvatarFor(agentName, persona.gender),
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
  args: { refresh: v.optional(v.boolean()) },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    const existing = await ctx.runQuery(internal.showcase.existing, {});
    if (existing && !args.refresh) return "A public showcase date already exists.";

    const personaId = await ctx.runMutation(
      internal.showcase.preparePersona,
      {},
    );
    if (!personaId) return "No seeded persona is ready to run a date.";

    const agentDateId = await ctx.runMutation(
      internal.agentDates.createRequest,
      { userId: personaId, accessMode: "demo", locale: "en-US", demoOnly: true },
    );
    return (
      `Started showcase date ${agentDateId} between fictional personas; ` +
      `the generated conversation and independent verdicts take about a minute.`
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
