import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { availabilityStatusValidator } from "./lib/enums";
import {
  currentUserId,
  recordAudit,
  requireProfile,
  requireUserId,
} from "./lib/authz";
import { LIMITS, clean } from "./lib/text";
import { redactContactInfo } from "./lib/privacy";
import { validateAvailabilityWindow, windowsCollide } from "./lib/time";

const availabilityDoc = v.object({
  _id: v.id("availability"),
  _creationTime: v.number(),
  userId: v.id("users"),
  startMs: v.number(),
  endMs: v.number(),
  timezone: v.string(),
  status: availabilityStatusValidator,
  heldByDropId: v.optional(v.id("datePlans")),
  note: v.optional(v.string()),
});

export const list = query({
  args: {},
  returns: v.array(availabilityDoc),
  handler: async (ctx) => {
    const userId = await currentUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("availability")
      .withIndex("by_user_and_start", (q) => q.eq("userId", userId))
      .order("asc")
      .take(50);
  },
});

/** Windows that can still turn into a date. `nowMs` comes from the client so
 *  the query never reads the wall clock (and stays cacheable). */
export const upcoming = query({
  args: { nowMs: v.number() },
  returns: v.array(availabilityDoc),
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    if (!userId) return [];
    const all = await ctx.db
      .query("availability")
      .withIndex("by_user_and_start", (q) =>
        q.eq("userId", userId).gte("startMs", args.nowMs),
      )
      .order("asc")
      .take(50);
    return all.filter(
      (w) => w.status !== "cancelled" && w.status !== "expired",
    );
  },
});

export const add = mutation({
  args: {
    startMs: v.number(),
    endMs: v.number(),
    note: v.optional(v.string()),
  },
  returns: v.id("availability"),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireProfile(ctx, userId);
    const now = Date.now();

    const check = validateAvailabilityWindow(
      { startMs: args.startMs, endMs: args.endMs },
      now,
    );
    if (!check.ok) throw new Error(check.reason);

    const existing = await ctx.db
      .query("availability")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(LIMITS.availabilityWindows + 10);

    const live = existing.filter(
      (w) => w.status !== "cancelled" && w.status !== "expired",
    );
    if (live.length >= LIMITS.availabilityWindows) {
      throw new Error(
        `You can hold ${LIMITS.availabilityWindows} open windows at a time.`,
      );
    }
    for (const w of live) {
      if (windowsCollide({ startMs: args.startMs, endMs: args.endMs }, w)) {
        throw new Error("That overlaps a window you already added.");
      }
    }

    const id = await ctx.db.insert("availability", {
      userId,
      startMs: args.startMs,
      endMs: args.endMs,
      timezone: profile.timezone,
      status: "open",
      note: args.note
        ? redactContactInfo(clean(args.note, LIMITS.note))
        : undefined,
    });

    await ctx.db.patch("profiles", profile._id, {
      onboardingStep: Math.max(profile.onboardingStep, 6),
      updatedAt: now,
    });
    await recordAudit(ctx, {
      action: "availability.added",
      actorUserId: userId,
      detail: new Date(args.startMs).toISOString(),
    });
    return id;
  },
});

export const remove = mutation({
  args: { availabilityId: v.id("availability") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const window = await ctx.db.get("availability", args.availabilityId);
    if (!window || window.userId !== userId) {
      throw new Error("That window isn't yours.");
    }
    if (window.status === "booked") {
      throw new Error(
        "This window has a confirmed date. Cancel the date first if you can't make it.",
      );
    }
    if (window.status === "held") {
      // A date plan is mid-flight on this window. Releasing it silently would
      // leave that drop pointing at an evening the user has taken back, so
      // withdraw them from it properly and let the normal departure logic
      // decide whether to look for a replacement or close the drop.
      const dropId = window.heldByDropId;
      await ctx.db.patch("availability", window._id, {
        status: "cancelled",
        heldByDropId: undefined,
      });
      // Same transaction, not scheduled: releasing the evening and leaving the
      // drop must never be able to come apart.
      if (dropId) {
        await ctx.runMutation(internal.datePlans.forceWithdraw, {
          dropId,
          userId,
          reason: "They took that evening back.",
        });
      }
      await recordAudit(ctx, {
        action: "availability.released_held",
        actorUserId: userId,
        dropId,
        detail: new Date(window.startMs).toISOString(),
      });
      return null;
    }
    await ctx.db.delete("availability", window._id);
    await recordAudit(ctx, {
      action: "availability.removed",
      actorUserId: userId,
      detail: new Date(window.startMs).toISOString(),
    });
    return null;
  },
});
