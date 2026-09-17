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
    event: v.union(
      v.literal("agent_landing_viewed"),
      v.literal("agent_onboarding_started"),
    ),
    anonymousId: v.string(),
    locale: v.optional(v.string()),
    source: v.optional(v.string()),
    campaign: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Canonicalise before the value is used for anything: the rate-limit key
    // below and the stored row both key on it, and the shape check accepts
    // either case, so an alternating-case client would otherwise get its own
    // quota bucket and its own identity.
    const anonymousId = normaliseVisitorId(clean(args.anonymousId, 80));
    if (!isAnonymousVisitorId(anonymousId)) return null;
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
  // Between the two: agent_created only fires when a thirteen-field brief is
  // sealed, so without this a zero cannot say whether nobody started or
  // everybody abandoned.
  "agent_onboarding_started",
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

/**
 * Per-event row cap. Seventeen events at this cap is up to 17,000 documents in
 * one transaction — an earlier version of this comment called that "under
 * Convex's 16,384-document limit", which is its own arithmetic refuting itself,
 * and `convex/_generated/ai/guidelines.md` states no such number, so no limit is
 * asserted here. What is true: production is under 100 rows per event, the read
 * is an indexed range with a `take`, and once any event's window outgrows this
 * cap the counting belongs in @convex-dev/aggregate rather than a larger cap.
 */
export const SNAPSHOT_ROWS_PER_EVENT = 1000;

/**
 * Browser-minted visitor id: a random value from the client, not a personal
 * identifier. The shape check is deliberately loose — it rejects an email, a
 * handle or prose, which is what it is for, but it is not RFC UUID validation
 * and does not prove who a value belongs to.
 */
export function isAnonymousVisitorId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(value);
}

/**
 * The shape check accepts either case, but every use of a visitor id compares
 * it as a string — the rate-limit bucket, the stored row, the actor token — so
 * `4F73…` and `4f73…` would be two quotas and two people. Both mutations that
 * accept one fold it on the way in; the snapshot folds again when reading rows
 * written before that.
 */
export function normaliseVisitorId(value: string): string {
  return value.toLowerCase();
}

type ActorRow = {
  _id: string;
  userId?: string;
  anonymousId?: string;
  source?: string;
  locale?: string;
};

function actorToken(row: ActorRow): string {
  if (row.userId) return `user:${row.userId}`;
  if (row.anonymousId) return `anon:${normaliseVisitorId(row.anonymousId)}`;
  return `row:${row._id}`;
}

/**
 * Collapse a userId and an anonymousId into one actor when they co-occur on
 * any row in the window. Only an observed co-occurrence creates a link, never
 * a guess — but the window is the whole window, so one new row carrying both
 * identifiers does join up that person's older rows that carried only one.
 */
export function resolveActorId(
  rows: ActorRow[],
): (row: ActorRow) => string {
  const parent = new Map<string, string>();

  const find = (token: string): string => {
    let root = token;
    while (parent.has(root) && parent.get(root) !== root) {
      root = parent.get(root)!;
    }
    if (!parent.has(root)) parent.set(root, root);
    let walk = token;
    while (walk !== root) {
      const next = parent.get(walk);
      if (next === undefined) break;
      parent.set(walk, root);
      walk = next;
    }
    return root;
  };

  for (const row of rows) {
    if (row.userId && row.anonymousId) {
      const user = find(`user:${row.userId}`);
      const anon = find(`anon:${normaliseVisitorId(row.anonymousId)}`);
      if (user !== anon) parent.set(user, anon);
    }
  }

  return (row) => find(actorToken(row));
}

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
    const rowsByEvent: ActorRow[][] = [];
    const allRows: ActorRow[] = [];

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
      rowsByEvent.push(rows);
      allRows.push(...rows);
    }

    const actorId = resolveActorId(allRows);

    for (const [index, event] of FUNNEL_EVENTS.entries()) {
      const rows = rowsByEvent[index] ?? [];
      const actors = new Set(rows.map(actorId));
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

    // A truncated event does not only undercount itself. The identity union is
    // built from the same samples, so a dropped row can be the one that linked a
    // visitor id to a user id — and then some *other* event, still well under the
    // cap and still reporting `truncated: false`, counts one person as two. Say
    // once, for the whole snapshot, that no count can be trusted as exact.
    const linksTruncated = FUNNEL_EVENTS.some(
      (event) => counts[event]?.truncated === true,
    );

    return {
      sinceMs: since,
      funnel: counts,
      landingSources,
      landingLocales,
      linksTruncated,
    };
  },
});
