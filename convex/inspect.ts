import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

/**
 * Read-only operational snapshot used by `scripts/verify-integrations.ts` and
 * by hand during QA. Internal-only: it never reaches the browser.
 */
export const snapshot = internalQuery({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const research = await ctx.db.query("researchRuns").order("desc").take(3);
    const venues = await ctx.db.query("venues").order("desc").take(8);
    const drops = await ctx.db.query("datePlans").order("desc").take(3);
    const matching = await ctx.db.query("matchingRuns").order("desc").take(3);
    const ai = await ctx.db.query("aiRuns").order("desc").take(5);
    const emails = await ctx.db.query("emailMessages").order("desc").take(6);
    const events = await ctx.db.query("agentMailEvents").order("desc").take(5);

    return {
      matching: matching.map((m) => ({
        status: m.status,
        stage: m.stage,
        intent: m.intent,
        pool: m.poolSize,
        hardPass: m.hardPassCount,
        scored: m.scoredCount,
        aiRanked: m.aiRankedCount,
        error: m.error ?? null,
      })),
      research: research.map((r) => ({
        status: r.status,
        live: r.live,
        venueCount: r.venueCount,
        sources: r.sourceUrls.length,
        calls: r.calls.map((c) => `${c.endpoint} ${c.httpStatus} ${c.ms}ms ${c.resultCount}`),
        error: r.error ?? null,
      })),
      venues: venues.map((venue) => ({
        name: venue.name,
        category: venue.category,
        confidence: venue.confidence,
        address: venue.address,
        hours: venue.openingHours ?? null,
        price: venue.approximatePrice ?? null,
        source: venue.sourceUrl,
      })),
      drops: drops.map((d) => ({
        status: d.status,
        title: d.title,
        theme: d.theme,
        area: d.area,
        cost: d.estimatedCostPerPerson,
        currency: d.currency,
        stops: d.itinerary.map((s) => `${s.venueName} (${s.category}, ${s.confidence})`),
        whyItFits: d.whyItFits,
        deadline: new Date(d.confirmDeadlineMs).toISOString(),
        attempts: `${d.candidateAttempts}/${d.maxCandidateAttempts}`,
      })),
      ai: ai.map((a) => ({
        purpose: a.purpose,
        model: a.model,
        status: a.status,
        latencyMs: a.latencyMs,
        promptTokens: a.promptTokens ?? null,
        completionTokens: a.completionTokens ?? null,
        totalTokens: a.totalTokens ?? null,
        error: a.error ?? null,
      })),
      emails: emails.map((e) => ({
        kind: e.kind,
        status: e.status,
        to: e.toAddress,
        subject: e.subject,
        error: e.error ?? null,
      })),
      agentMailEvents: events.map((e) => ({
        type: e.eventType,
        verified: e.signatureVerified,
        processed: e.processed,
        from: e.fromAddress ?? null,
      })),
    };
  },
});
