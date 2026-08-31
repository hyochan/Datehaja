import { v } from "convex/values";
import { mutation } from "./_generated/server";
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
