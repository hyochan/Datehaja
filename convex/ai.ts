import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { aiPurposeValidator } from "./lib/enums";
import { obj, structured } from "./integrations/openai";
import { sanitizeModelText, truncate } from "./lib/text";
import type { Signals } from "./lib/matching";

/**
 * The AI layer.
 *
 * Two rules hold everywhere in this file:
 *  1. The model only ever sees pairs that already passed the programmatic hard
 *     filters, and it cannot resurrect one that did not.
 *  2. Every call is recorded in `aiRuns` — model, latency, tokens, outcome — so
 *     the reasoning behind a date plan can be inspected after the fact.
 */

export const recordRun = internalMutation({
  args: {
    purpose: aiPurposeValidator,
    model: v.string(),
    endpoint: v.string(),
    dropId: v.optional(v.id("dateDrops")),
    userId: v.optional(v.id("users")),
    matchingRunId: v.optional(v.id("matchingRuns")),
    inputSummary: v.string(),
    outputPreview: v.string(),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
    totalTokens: v.optional(v.number()),
    latencyMs: v.number(),
    status: v.union(v.literal("succeeded"), v.literal("failed")),
    error: v.optional(v.string()),
  },
  returns: v.id("aiRuns"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiRuns", {
      ...args,
      inputSummary: truncate(args.inputSummary, 1200),
      outputPreview: truncate(args.outputPreview, 900),
      error: args.error ? truncate(args.error, 400) : undefined,
    });
  },
});

/* --------------------------- candidate ranking ---------------------------- */

export type RankInput = {
  matchingRunId: Id<"matchingRuns">;
  seekerUserId: Id<"users">;
  seeker: PersonBrief;
  candidates: Array<{
    candidateScoreId: Id<"candidateScores">;
    userId: Id<"users">;
    person: PersonBrief;
    deterministicScore: number;
    signals: Signals;
  }>;
};

export type PersonBrief = {
  label: string;
  age: number;
  area: string;
  city: string;
  occupation: string | null;
  bio: string;
  interests: string[];
  personalityTraits: string[];
  styleTags: string[];
  socialEnergy: string;
  firstDateVibe: string[];
  dateIdea: string | null;
  languages: string[];
  relationshipIntent: string;
  preferredDateTypes: string[];
  atmosphere: string;
  indoorOutdoor: string;
  dietary: string[];
  accessibility: string[];
  budgetRange: string;
};

export type RankedCandidate = {
  candidateScoreId: Id<"candidateScores">;
  aiScore: number;
  rationale: string;
  friction: string;
  suggestedDateType: string;
};

const RANK_SCHEMA = obj({
  ranked: {
    type: "array",
    description: "Every candidate, best first.",
    items: obj({
      candidate_index: {
        type: "integer",
        description: "0-based index of the candidate from the input list.",
      },
      compatibility_score: {
        type: "integer",
        minimum: 0,
        maximum: 100,
        description: "How well this pair fits for a single first date.",
      },
      rationale: {
        type: "string",
        description:
          "One or two sentences, warm and specific, about what these two share. Written so it could be shown to either of them. Never mention scores or that an AI ranked anyone.",
      },
      friction: {
        type: "string",
        description:
          "The most likely reason this date would not land, in one short clause. Empty string if nothing stands out.",
      },
      suggested_date_type: {
        type: "string",
        description:
          "One of: film, coffee, dinner, drinks, exhibition, museum, walk, dessert, live_music, casual_activity, surprise",
      },
    }),
  },
});

const RANK_INSTRUCTIONS = `You match adults for a single first date on Datehaja.

You are given one person (the seeker) and a shortlist of candidates who have ALREADY passed every hard requirement — age, distance, meeting area, mutual interest, availability, safety. Your job is only to rank how well each pairing would work as one specific first date, and to explain it in human terms.

Rules:
- The seeker's dateIdea is the anchor when present. Prefer someone whose own idea, interests, or preferredDateTypes show they would genuinely enjoy joining that exact activity.
- Do not turn a simple requested activity into a bigger itinerary. A film, walk, or exhibition can be the complete date.
- Rank on shared interests, compatible first-date style, energy fit, and how naturally a good evening writes itself for the two of them.
- NEVER rank on, infer, or mention gender, race, religion, nationality, disability, body, or income. If a bio implies any of these, ignore it.
- Write the rationale as something you would happily show to both people. Warm, specific, no flattery, no scores, no mention of ranking or AI.
- The friction field is for you and the operators, not the users: be blunt and short.
- Return EVERY candidate exactly once.`;

export async function rankCandidatesWithAI(
  ctx: ActionCtx,
  input: RankInput,
): Promise<{ ranked: RankedCandidate[]; usedAI: boolean; error?: string }> {
  if (input.candidates.length === 0) return { ranked: [], usedAI: false };

  const promptInput = JSON.stringify(
    {
      seeker: input.seeker,
      candidates: input.candidates.map((c, index) => ({
        index,
        person: c.person,
        shared_interests: c.signals.sharedInterests,
        shared_date_types: c.signals.sharedDateTypes,
        shared_languages: c.signals.sharedLanguages,
        minutes_of_shared_availability: c.signals.overlapMinutes,
        rough_distance_km: c.signals.distanceKm,
        budget_overlaps: c.signals.budgetOverlap,
      })),
    },
    null,
    1,
  );

  const result = await structured<{
    ranked: Array<{
      candidate_index: number;
      compatibility_score: number;
      rationale: string;
      friction: string;
      suggested_date_type: string;
    }>;
  }>({
    instructions: RANK_INSTRUCTIONS,
    input: promptInput,
    schemaName: "candidate_ranking",
    schema: RANK_SCHEMA,
    maxOutputTokens: 2400,
    reasoningEffort: "low",
  });

  await ctx.runMutation(internal.ai.recordRun, {
    purpose: "rank_candidates",
    model: result.model,
    endpoint: result.endpoint,
    userId: input.seekerUserId,
    matchingRunId: input.matchingRunId,
    inputSummary: `Ranked ${input.candidates.length} candidates in ${input.seeker.city}`,
    outputPreview: result.outputPreview,
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens,
    totalTokens: result.totalTokens,
    latencyMs: result.latencyMs,
    status: result.ok ? "succeeded" : "failed",
    error: result.error,
  });

  if (!result.ok || !result.data) {
    return { ranked: [], usedAI: false, error: result.error };
  }

  const seen = new Set<number>();
  const ranked: RankedCandidate[] = [];
  for (const row of result.data.ranked ?? []) {
    const idx = Number(row.candidate_index);
    if (!Number.isInteger(idx) || idx < 0 || idx >= input.candidates.length)
      continue;
    if (seen.has(idx)) continue;
    seen.add(idx);
    ranked.push({
      candidateScoreId: input.candidates[idx].candidateScoreId,
      aiScore: clampScore(row.compatibility_score),
      rationale: sanitizeModelText(row.rationale, 260),
      friction: sanitizeModelText(row.friction, 180),
      suggestedDateType: sanitizeModelText(
        row.suggested_date_type,
        30,
      ).toLowerCase(),
    });
  }

  return { ranked, usedAI: true };
}

function clampScore(n: unknown): number {
  const value = Number(n);
  if (!Number.isFinite(value)) return 50;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/* ------------------------------ plan building ------------------------------ */

export type PlanVenue = {
  venueId: Id<"venues">;
  name: string;
  category: string;
  address: string;
  district: string;
  openingHours: string | null;
  approximatePrice: string | null;
  reservationNeeded: boolean | null;
  evidence: string;
  sourceUrl: string;
  confidence: "high" | "medium" | "low";
  tags: string[];
};

export type PlanInput = {
  dropId?: Id<"dateDrops">;
  matchingRunId?: Id<"matchingRuns">;
  city: string;
  area: string;
  currency: string;
  whenLabel: string;
  durationMinutes: number;
  budgetLow: number;
  budgetHigh: number;
  personA: PersonBrief;
  personB: PersonBrief;
  sharedInterests: string[];
  sharedDateTypes: string[];
  dateIdea?: string;
  venues: PlanVenue[];
};

export type BuiltPlan = {
  title: string;
  theme: string;
  summary: string;
  whyItFits: string;
  whyForA: string;
  whyForB: string;
  meetingInstructions: string;
  estimatedCostPerPerson: number;
  estimatedDurationMin: number;
  stops: Array<{
    venueIndex: number;
    startOffsetMin: number;
    durationMin: number;
    note: string;
  }>;
};

const PLAN_SCHEMA = obj({
  title: {
    type: "string",
    description: "Six words or fewer. E.g. 'An indie film in Seongsu'.",
  },
  theme: {
    type: "string",
    description:
      "The shape of the date in plain language, e.g. 'One indie film' or 'Gallery → riverside walk'. Max 60 characters.",
  },
  summary: {
    type: "string",
    description: "Two sentences describing the date itself. Concrete, no hype.",
  },
  why_it_fits: {
    type: "string",
    description:
      "One or two sentences both people will see, naming what they actually share. Never mention scores, ranking, or AI.",
  },
  why_for_person_a: {
    type: "string",
    description: "One sentence written to person A about why this suits them.",
  },
  why_for_person_b: {
    type: "string",
    description: "One sentence written to person B about why this suits them.",
  },
  meeting_instructions: {
    type: "string",
    description:
      "Practical, kind meeting guidance: where exactly to meet, what to do if someone is late. Two sentences. Never suggest exchanging phone numbers or emails.",
  },
  estimated_cost_per_person: {
    type: "integer",
    description:
      "Whole number in the given currency, per person, for the whole date.",
  },
  estimated_duration_minutes: { type: "integer", minimum: 45, maximum: 300 },
  stops: {
    type: "array",
    description:
      "One or two stops, in order. Prefer one excellent stop over a busy itinerary. Only use venues from the provided list.",
    items: obj({
      venue_index: {
        type: "integer",
        description: "0-based index into the provided venues list.",
      },
      start_offset_minutes: {
        type: "integer",
        description: "Minutes after the date start time that this stop begins.",
      },
      duration_minutes: { type: "integer", minimum: 20, maximum: 180 },
      note: {
        type: "string",
        description: "One short line on why this stop, or what to order/see.",
      },
    }),
  },
});

const PLAN_INSTRUCTIONS = `You design a single first date for Datehaja.

You are given two people who have already been matched, the time window, a budget range, and a list of REAL venues found by live web research. Build one date from those venues.

Rules:
- When requested_date_idea is present, treat it as the plan's anchor. Find the simplest researched venue that makes that exact activity possible.
- One stop is a complete date. Never add food, drinks, dessert, or a walk unless the requested activity or both people's preferences genuinely call for it.
- Use ONLY the venues provided. Never invent a place, an address, or an opening time.
- One or two stops. A great first date is usually simple. Two stops only when the second genuinely improves the evening (e.g. dinner then a quiet dessert place nearby).
- Respect every dietary requirement and accessibility need listed for either person. If a venue would violate one, do not use it.
- Respect the budget. estimated_cost_per_person must land inside the given range.
- Honour a "quiet" preference over a "lively" venue, and indoor/outdoor preferences.
- Write for two people who have never met and will not exchange contact details. Never suggest they swap numbers or socials.
- Never mention gender, race, religion, nationality, disability, body, or income.
- Keep every field short. This is an invitation, not a brochure.`;

export async function buildDatePlan(
  ctx: ActionCtx,
  input: PlanInput,
): Promise<{ plan: BuiltPlan | null; error?: string; model: string }> {
  const promptInput = JSON.stringify(
    {
      city: input.city,
      area: input.area,
      when: input.whenLabel,
      available_minutes: input.durationMinutes,
      currency: input.currency,
      budget_per_person: { low: input.budgetLow, high: input.budgetHigh },
      person_a: input.personA,
      person_b: input.personB,
      shared_interests: input.sharedInterests,
      shared_date_types: input.sharedDateTypes,
      requested_date_idea: input.dateIdea ?? null,
      venues: input.venues.map((venue, index) => ({
        index,
        name: venue.name,
        category: venue.category,
        address: venue.address,
        district: venue.district,
        opening_hours: venue.openingHours,
        approximate_price: venue.approximatePrice,
        reservation_needed: venue.reservationNeeded,
        tags: venue.tags,
        evidence: truncate(venue.evidence, 400),
        confidence: venue.confidence,
      })),
    },
    null,
    1,
  );

  const result = await structured<{
    title: string;
    theme: string;
    summary: string;
    why_it_fits: string;
    why_for_person_a: string;
    why_for_person_b: string;
    meeting_instructions: string;
    estimated_cost_per_person: number;
    estimated_duration_minutes: number;
    stops: Array<{
      venue_index: number;
      start_offset_minutes: number;
      duration_minutes: number;
      note: string;
    }>;
  }>({
    instructions: PLAN_INSTRUCTIONS,
    input: promptInput,
    schemaName: "date_plan",
    schema: PLAN_SCHEMA,
    maxOutputTokens: 2200,
    reasoningEffort: "low",
  });

  await ctx.runMutation(internal.ai.recordRun, {
    purpose: "build_plan",
    model: result.model,
    endpoint: result.endpoint,
    dropId: input.dropId,
    matchingRunId: input.matchingRunId,
    inputSummary: `Planned a date in ${input.area}, ${input.city} from ${input.venues.length} researched venues`,
    outputPreview: result.outputPreview,
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens,
    totalTokens: result.totalTokens,
    latencyMs: result.latencyMs,
    status: result.ok ? "succeeded" : "failed",
    error: result.error,
  });

  if (!result.ok || !result.data) {
    return { plan: null, error: result.error, model: result.model };
  }

  const d = result.data;
  const stops = (d.stops ?? [])
    .filter(
      (s) =>
        Number.isInteger(s.venue_index) &&
        s.venue_index >= 0 &&
        s.venue_index < input.venues.length,
    )
    .slice(0, 3)
    .map((s) => ({
      venueIndex: s.venue_index,
      startOffsetMin: Math.max(
        0,
        Math.round(Number(s.start_offset_minutes) || 0),
      ),
      durationMin: Math.max(
        20,
        Math.min(180, Math.round(Number(s.duration_minutes) || 60)),
      ),
      note: sanitizeModelText(s.note, 160),
    }))
    .sort((a, b) => a.startOffsetMin - b.startOffsetMin);

  if (stops.length === 0) {
    return {
      plan: null,
      error: "Model produced no usable stops.",
      model: result.model,
    };
  }

  const cost = Number(d.estimated_cost_per_person);
  return {
    model: result.model,
    plan: {
      title:
        sanitizeModelText(d.title, 60) || "A date worth leaving the app for",
      theme: sanitizeModelText(d.theme, 70),
      summary: sanitizeModelText(d.summary, 320),
      whyItFits: sanitizeModelText(d.why_it_fits, 260),
      whyForA: sanitizeModelText(d.why_for_person_a, 220),
      whyForB: sanitizeModelText(d.why_for_person_b, 220),
      meetingInstructions: sanitizeModelText(d.meeting_instructions, 300),
      estimatedCostPerPerson: Number.isFinite(cost)
        ? Math.max(0, Math.round(cost))
        : Math.round((input.budgetLow + input.budgetHigh) / 2),
      estimatedDurationMin: Math.max(
        45,
        Math.min(300, Math.round(Number(d.estimated_duration_minutes) || 120)),
      ),
      stops,
    },
  };
}

/* --------------------------- venue normalisation --------------------------- */

export type NormalisedVenue = {
  name: string;
  category: string;
  address: string;
  district: string;
  openingHours: string | null;
  approximatePrice: string | null;
  reservationNeeded: boolean | null;
  evidence: string;
  tags: string[];
  confidence: "high" | "medium" | "low";
  usable: boolean;
};

const VENUE_SCHEMA = obj({
  venues: {
    type: "array",
    items: obj({
      source_index: { type: "integer" },
      name: { type: "string" },
      category: {
        type: "string",
        description:
          "One of: cinema, restaurant, cafe, bar, dessert, exhibition, museum, park, activity, live_music, other",
      },
      address: {
        type: "string",
        description:
          "Street address exactly as it appears in the source. Empty string if the source does not give one.",
      },
      district: { type: "string" },
      opening_hours: { type: ["string", "null"] },
      approximate_price: {
        type: ["string", "null"],
        description:
          "Price as the source states it, e.g. '₩18,000–25,000 per person'.",
      },
      reservation_needed: { type: ["boolean", "null"] },
      evidence: {
        type: "string",
        description:
          "A short verbatim quote from the source that supports the above. Max 300 characters.",
      },
      tags: { type: "array", items: { type: "string" } },
      confidence: {
        type: "string",
        description:
          "high when the source states name, address and hours; medium when partial; low when inferred.",
      },
      usable: {
        type: "boolean",
        description:
          "false when this is a listicle, an aggregator page, or you cannot identify one specific real venue.",
      },
    }),
  },
});

const VENUE_INSTRUCTIONS = `You turn crawled web pages into structured venue records for date planning.

Rules:
- Extract ONLY what the page actually says. Never fill in an address, a price, or opening hours from your own knowledge.
- If the page is a listicle covering many places, extract the individual venues it names — one record each — and keep confidence at most "medium" unless the page gives a full address.
- If you cannot identify a specific, currently-operating venue, set usable:false rather than guessing.
- evidence must be a verbatim snippet from the page.
- Prefer venues that suit a first date: somewhere you can talk, sit, or walk together.`;

export async function normaliseVenues(
  ctx: ActionCtx,
  args: {
    dropId?: Id<"dateDrops">;
    matchingRunId?: Id<"matchingRuns">;
    city: string;
    area: string;
    sources: Array<{ url: string; title: string; content: string }>;
  },
): Promise<{
  venues: Array<NormalisedVenue & { sourceUrl: string }>;
  error?: string;
}> {
  if (args.sources.length === 0) return { venues: [] };

  const promptInput = JSON.stringify(
    {
      city: args.city,
      target_area: args.area,
      sources: args.sources.map((s, index) => ({
        index,
        url: s.url,
        title: s.title,
        content: truncate(s.content, 6000),
      })),
    },
    null,
    1,
  );

  const result = await structured<{
    venues: Array<{
      source_index: number;
      name: string;
      category: string;
      address: string;
      district: string;
      opening_hours: string | null;
      approximate_price: string | null;
      reservation_needed: boolean | null;
      evidence: string;
      tags: string[];
      confidence: string;
      usable: boolean;
    }>;
  }>({
    instructions: VENUE_INSTRUCTIONS,
    input: promptInput,
    schemaName: "venue_extraction",
    schema: VENUE_SCHEMA,
    maxOutputTokens: 6000,
    reasoningEffort: "low",
  });

  await ctx.runMutation(internal.ai.recordRun, {
    purpose: "venue_summary",
    model: result.model,
    endpoint: result.endpoint,
    dropId: args.dropId,
    matchingRunId: args.matchingRunId,
    inputSummary: `Normalised ${args.sources.length} crawled pages for ${args.area}, ${args.city}`,
    outputPreview: result.outputPreview,
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens,
    totalTokens: result.totalTokens,
    latencyMs: result.latencyMs,
    status: result.ok ? "succeeded" : "failed",
    error: result.error,
  });

  if (!result.ok || !result.data) return { venues: [], error: result.error };

  const out: Array<NormalisedVenue & { sourceUrl: string }> = [];
  for (const raw of result.data.venues ?? []) {
    const source = args.sources[raw.source_index];
    if (!source) continue;
    const name = sanitizeModelText(raw.name, 90);
    if (!name) continue;
    out.push({
      sourceUrl: source.url,
      name,
      category: sanitizeModelText(raw.category, 30).toLowerCase() || "other",
      address: sanitizeModelText(raw.address, 180),
      district: sanitizeModelText(raw.district, 60) || args.area,
      openingHours: raw.opening_hours
        ? sanitizeModelText(raw.opening_hours, 160)
        : null,
      approximatePrice: raw.approximate_price
        ? sanitizeModelText(raw.approximate_price, 80)
        : null,
      reservationNeeded:
        typeof raw.reservation_needed === "boolean"
          ? raw.reservation_needed
          : null,
      evidence: sanitizeModelText(raw.evidence, 320),
      tags: (raw.tags ?? [])
        .slice(0, 8)
        .map((t) => sanitizeModelText(t, 30))
        .filter(Boolean),
      confidence: normaliseConfidence(raw.confidence),
      usable: raw.usable !== false,
    });
  }
  return { venues: out };
}

function normaliseConfidence(value: unknown): "high" | "medium" | "low" {
  const s = String(value ?? "").toLowerCase();
  if (s === "high") return "high";
  if (s === "low") return "low";
  return "medium";
}
