import { v } from "convex/values";
import { internalQuery, mutation } from "./_generated/server";
import { checkRateLimit, currentUserId, requireUserId } from "./lib/authz";
import { clean } from "./lib/text";

/**
 * Privacy-minimal first-party product analytics.
 * Never accept profile prose, preferences, contact details, or precise location.
 */
export const track = mutation({
  args: {
    event: v.literal("agent_landing_viewed"),
    anonymousId: v.string(),
    locale: v.optional(v.string()),
    source: v.optional(v.string()),
    campaign: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const anonymousId = clean(args.anonymousId, 80);
    if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(anonymousId)) return null;
    const rate = await checkRateLimit(
      ctx,
      `growth:${anonymousId}`,
      5,
      24 * 60 * 60_000,
      Date.now(),
    );
    if (!rate.ok) return null;
    await ctx.db.insert("growthEvents", {
      userId: (await currentUserId(ctx)) ?? undefined,
      anonymousId,
      event: args.event,
      locale: args.locale ? clean(args.locale, 16) : undefined,
      source: args.source ? clean(args.source, 80) : undefined,
      campaign: args.campaign ? clean(args.campaign, 80) : undefined,
      createdAt: Date.now(),
    });
    return null;
  },
});

/** Authenticated conversion events for the agent → pass → expedition loop. */
export const trackMember = mutation({
  args: {
    event: v.union(
      v.literal("scout_pass_viewed"),
      v.literal("scout_pass_active_viewed"),
      v.literal("scout_checkout_started"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const rate = await checkRateLimit(
      ctx,
      `member-growth:${userId}:${args.event}`,
      3,
      24 * 60 * 60_000,
      Date.now(),
    );
    if (!rate.ok) return null;
    await ctx.db.insert("growthEvents", {
      userId,
      event: args.event,
      createdAt: Date.now(),
    });
    return null;
  },
});

/** Every event the product emits, funnel order first, ancillary signals after. */
const FUNNEL_EVENTS = [
  "agent_landing_viewed",
  "agent_created",
  "agent_message_sent",
  "agent_date_requested",
  "agent_date_completed",
  "agent_date_failed",
  "connection_consent_yes",
  "connection_consent_no",
  "contact_revealed",
  "demo_connection_completed",
  "agent_debrief_discussed",
  "agent_question_answered",
  "agent_question_skipped",
  "scout_pass_viewed",
  "scout_pass_active_viewed",
  "scout_checkout_started",
] as const;

/** Per-event row cap. 16 events × 1000 stays under Convex's 16,384-document
 *  per-transaction read limit; once an event's window outgrows this, move
 *  counting to @convex-dev/aggregate. */
const SNAPSHOT_ROWS_PER_EVENT = 1000;

/**
 * Operational funnel snapshot for growth reviews. Internal-only — run it from
 * the CLI (`npx convex run growth:funnelSnapshot '{"sinceMs": ...}'`).
 * Read-only; returns per-event totals, unique actors, and landing sources.
 */
export const funnelSnapshot = internalQuery({
  args: { sinceMs: v.optional(v.number()) },
  returns: v.any(),
  handler: async (ctx, args) => {
    const since = args.sinceMs ?? 0;
    const counts: Record<
      string,
      { total: number; uniqueActors: number; truncated: boolean }
    > = {};
    const landingSources: Record<string, number> = {};
    const landingLocales: Record<string, number> = {};

    for (const event of FUNNEL_EVENTS) {
      // The window bound lives in the index range, so reads scale with the
      // requested window instead of the table's full history.
      const rows = await ctx.db
        .query("growthEvents")
        .withIndex("by_event_and_created", (q) =>
          q.eq("event", event).gte("createdAt", since),
        )
        .order("desc")
        .take(SNAPSHOT_ROWS_PER_EVENT);
      const actors = new Set(
        rows.map((row) => row.userId ?? row.anonymousId ?? row._id),
      );
      counts[event] = {
        total: rows.length,
        uniqueActors: actors.size,
        truncated: rows.length === SNAPSHOT_ROWS_PER_EVENT,
      };
      if (event === "agent_landing_viewed") {
        for (const row of rows) {
          const source = row.source ?? "(direct)";
          landingSources[source] = (landingSources[source] ?? 0) + 1;
          const locale = row.locale ?? "(unknown)";
          landingLocales[locale] = (landingLocales[locale] ?? 0) + 1;
        }
      }
    }

    return { sinceMs: since, funnel: counts, landingSources, landingLocales };
  },
});
