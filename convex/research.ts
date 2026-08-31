import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { confidenceValidator } from "./lib/enums";
import {
  NOISE_DOMAINS,
  hasFirecrawlKey,
  scrape,
  search,
} from "./integrations/firecrawl";
import { normaliseVenues } from "./ai";
import { hasOpenAI } from "./integrations/openai";
import { truncate } from "./lib/text";
import { DATE_TYPE_OPTIONS, DIETARY_OPTIONS } from "./lib/catalog";
import { extractVenues } from "./lib/venueHeuristics";

/**
 * The Datehaja research engine.
 *
 * Firecrawl does live web research for real, currently-open places near the
 * midpoint of two people, then the model turns those pages into structured
 * venue records. Every record keeps its source URL, a verbatim evidence
 * snippet, and a timestamp, so a plan can always be traced back to the page it
 * came from. When something cannot be confirmed it is marked low-confidence
 * rather than invented.
 */

const queryValidator = v.object({
  city: v.string(),
  area: v.string(),
  whenIso: v.string(),
  timezone: v.string(),
  budgetMin: v.number(),
  budgetMax: v.number(),
  currency: v.string(),
  interests: v.array(v.string()),
  dateTypes: v.array(v.string()),
  dateIdea: v.optional(v.string()),
  vibe: v.string(),
  dietary: v.array(v.string()),
  accessibility: v.array(v.string()),
  indoorOutdoor: v.string(),
  desiredDurationMin: v.number(),
});

export type ResearchQuery = {
  city: string;
  area: string;
  whenIso: string;
  timezone: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  interests: string[];
  dateTypes: string[];
  dateIdea?: string;
  vibe: string;
  dietary: string[];
  accessibility: string[];
  indoorOutdoor: string;
  desiredDurationMin: number;
};

export const startRun = internalMutation({
  args: {
    dropId: v.optional(v.id("datePlans")),
    requestedByUserId: v.optional(v.id("users")),
    query: queryValidator,
    live: v.boolean(),
  },
  returns: v.id("researchRuns"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("researchRuns", {
      provider: "firecrawl",
      dropId: args.dropId,
      requestedByUserId: args.requestedByUserId,
      query: args.query,
      status: "running",
      calls: [],
      venueCount: 0,
      sourceUrls: [],
      live: args.live,
      startedAt: Date.now(),
    });
  },
});

export const finishRun = internalMutation({
  args: {
    researchRunId: v.id("researchRuns"),
    status: v.union(
      v.literal("succeeded"),
      v.literal("partial"),
      v.literal("failed"),
    ),
    calls: v.array(
      v.object({
        endpoint: v.string(),
        query: v.string(),
        httpStatus: v.number(),
        ms: v.number(),
        resultCount: v.number(),
        error: v.optional(v.string()),
      }),
    ),
    sourceUrls: v.array(v.string()),
    venues: v.array(
      v.object({
        name: v.string(),
        category: v.string(),
        address: v.string(),
        district: v.string(),
        city: v.string(),
        countryCode: v.string(),
        sourceUrl: v.string(),
        officialUrl: v.optional(v.string()),
        openingHours: v.optional(v.string()),
        approximatePrice: v.optional(v.string()),
        reservationNeeded: v.optional(v.boolean()),
        evidence: v.string(),
        tags: v.array(v.string()),
        mapsQuery: v.string(),
        confidence: confidenceValidator,
      }),
    ),
    error: v.optional(v.string()),
  },
  returns: v.array(v.id("venues")),
  handler: async (ctx, args) => {
    const now = Date.now();
    const ids: Id<"venues">[] = [];
    for (const venue of args.venues) {
      ids.push(
        await ctx.db.insert("venues", {
          researchRunId: args.researchRunId,
          ...venue,
          researchedAt: now,
        }),
      );
    }
    await ctx.db.patch("researchRuns", args.researchRunId, {
      status: args.status,
      calls: args.calls.slice(0, 20),
      sourceUrls: args.sourceUrls.slice(0, 30),
      venueCount: ids.length,
      error: args.error ? truncate(args.error, 400) : undefined,
      finishedAt: now,
    });
    return ids;
  },
});

export const getVenues = internalQuery({
  args: { researchRunId: v.id("researchRuns") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("venues")
      .withIndex("by_research_run", (q) =>
        q.eq("researchRunId", args.researchRunId),
      )
      .take(40);
  },
});

/* ------------------------------ the engine ------------------------------- */

const DATE_TYPE_LABEL = new Map<string, string>(
  DATE_TYPE_OPTIONS.map((d) => [d.key as string, d.label.toLowerCase()]),
);
const DIETARY_LABEL = new Map<string, string>(
  DIETARY_OPTIONS.map((d) => [d.key as string, d.label.toLowerCase()]),
);

/** Turn matched preferences into the searches a thoughtful friend would run. */
export function buildSearchQueries(q: ResearchQuery): string[] {
  const year = new Date(q.whenIso).getFullYear();
  const dietary = q.dietary
    .map((d) => DIETARY_LABEL.get(d) ?? d)
    .filter((d) => d !== "alcohol-free venue")
    .slice(0, 2)
    .join(" ");
  const primary = q.dateTypes[0]
    ? (DATE_TYPE_LABEL.get(q.dateTypes[0]) ?? "activity")
    : "activity";
  const secondary = q.dateTypes[1]
    ? (DATE_TYPE_LABEL.get(q.dateTypes[1]) ?? "coffee")
    : "coffee";
  const vibe =
    q.vibe === "quiet" ? "quiet intimate" : q.vibe === "lively" ? "lively" : "";

  const requested = q.dateIdea?.trim();
  const queries = [
    requested
      ? `${requested} in ${q.area} ${q.city} ${year} venue address opening hours`.replace(
          /\s+/g,
          " ",
        )
      : `best ${vibe} ${primary} ${dietary} in ${q.area} ${q.city} ${year} address opening hours`.replace(
          /\s+/g,
          " ",
        ),
    `${secondary} spots in ${q.area} ${q.city} good for a date ${year}`,
  ];

  if (q.interests.length > 0) {
    queries.push(
      `${q.interests.slice(0, 2).join(" ")} things to do in ${q.area} ${q.city} ${year}`,
    );
  }
  if (q.indoorOutdoor === "outdoor") {
    queries.push(`outdoor walk or park near ${q.area} ${q.city}`);
  }
  return queries.slice(0, 4).map((s) => s.trim());
}

export type ResearchOutcome = {
  researchRunId: Id<"researchRuns">;
  venueIds: Id<"venues">[];
  venueCount: number;
  live: boolean;
  status: "succeeded" | "partial" | "failed";
  error?: string;
};

export async function researchDateOptions(
  ctx: ActionCtx,
  args: {
    dropId?: Id<"datePlans">;
    matchingRunId?: Id<"matchingRuns">;
    requestedByUserId?: Id<"users">;
    countryCode: string;
    query: ResearchQuery;
  },
): Promise<ResearchOutcome> {
  const researchRunId: Id<"researchRuns"> = await ctx.runMutation(
    internal.research.startRun,
    {
      dropId: args.dropId,
      requestedByUserId: args.requestedByUserId,
      query: args.query,
      live: true,
    },
  );

  const calls: Array<{
    endpoint: string;
    query: string;
    httpStatus: number;
    ms: number;
    resultCount: number;
    error?: string;
  }> = [];
  const sources: Array<{ url: string; title: string; content: string }> = [];
  const seenUrls = new Set<string>();

  const queries = buildSearchQueries(args.query);

  for (const query of queries) {
    const { hits, log } = await search(query, {
      limit: 5,
      country: args.countryCode,
      location: `${args.query.city}`,
      excludeDomains: NOISE_DOMAINS,
      withMarkdown: true,
    });
    calls.push(log);

    for (const hit of hits) {
      if (seenUrls.has(hit.url)) continue;
      seenUrls.add(hit.url);
      const content = hit.markdown ?? `${hit.title}\n\n${hit.description}`;
      if (content.trim().length < 80) continue;
      sources.push({ url: hit.url, title: hit.title, content });
    }
    if (sources.length >= 10) break;
  }

  // Follow up on the most promising pages that came back without much content.
  // This works without an API key; individual URLs can still 403 when Firecrawl
  // refuses that site, which the call log records per-URL.
  const thin = sources.filter((s) => s.content.length < 400).slice(0, 2);
  for (const source of thin) {
    const result = await scrape(source.url, { maxAgeMs: 24 * 60 * 60 * 1000 });
    calls.push(result.log);
    if (result.markdown.length > source.content.length) {
      source.content = result.markdown;
      if (result.title) source.title = result.title;
    }
  }

  if (sources.length === 0) {
    await ctx.runMutation(internal.research.finishRun, {
      researchRunId,
      status: "failed",
      calls,
      sourceUrls: [],
      venues: [],
      error: hasFirecrawlKey()
        ? "Firecrawl returned no usable results."
        : "Firecrawl returned no usable results (running unauthenticated).",
    });
    return {
      researchRunId,
      venueIds: [],
      venueCount: 0,
      live: true,
      status: "failed",
      error: "No venues found.",
    };
  }

  // Preferred path: the model reads the crawled pages and extracts structured
  // venues. Fallback: deterministic extraction, always marked low-confidence,
  // so a model outage degrades the plan rather than cancelling the date.
  let venues: Array<{
    sourceUrl: string;
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
  }> = [];
  let error: string | undefined;
  let extractedBy: "model" | "heuristics" = "model";

  if (hasOpenAI()) {
    const result = await normaliseVenues(ctx, {
      dropId: args.dropId,
      matchingRunId: args.matchingRunId,
      city: args.query.city,
      area: args.query.area,
      sources: sources.slice(0, 8),
    });
    venues = result.venues;
    error = result.error;
  } else {
    error =
      "OPENAI_API_KEY is not configured — venues extracted without a model.";
  }

  if (venues.length === 0) {
    extractedBy = "heuristics";
    venues = sources.slice(0, 8).flatMap((source) =>
      extractVenues(source, args.query.area, 4).map((venue) => ({
        ...venue,
        sourceUrl: source.url,
        reservationNeeded: null,
      })),
    );
    if (venues.length > 0 && !error) {
      error =
        "Model extraction returned nothing — fell back to rule-based extraction.";
    }
  }
  void extractedBy;

  const usable = venues
    .filter((venue) => venue.usable && venue.name.length > 1)
    .slice(0, 14)
    .map((venue) => ({
      name: venue.name,
      category: venue.category,
      address: venue.address,
      district: venue.district,
      city: args.query.city,
      countryCode: args.countryCode,
      sourceUrl: venue.sourceUrl,
      officialUrl: undefined,
      openingHours: venue.openingHours ?? undefined,
      approximatePrice: venue.approximatePrice ?? undefined,
      reservationNeeded: venue.reservationNeeded ?? undefined,
      evidence: venue.evidence,
      tags: venue.tags,
      mapsQuery:
        `${venue.name} ${venue.address || venue.district} ${args.query.city}`.trim(),
      confidence: venue.confidence,
    }));

  const status =
    usable.length > 0 ? (error ? "partial" : "succeeded") : "failed";

  const venueIds: Id<"venues">[] = await ctx.runMutation(
    internal.research.finishRun,
    {
      researchRunId,
      status,
      calls,
      sourceUrls: sources.map((s) => s.url),
      venues: usable,
      error,
    },
  );

  return {
    researchRunId,
    venueIds,
    venueCount: venueIds.length,
    live: true,
    status,
    error,
  };
}
