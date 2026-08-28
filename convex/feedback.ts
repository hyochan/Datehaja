import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { recordAudit, requireParticipant, requireUserId } from "./lib/authz";
import {
  dateOutcomeValidator,
  dateSafetyValidator,
  meetAgainValidator,
} from "./lib/enums";
import { cleanMultiline } from "./lib/text";

const feedbackValidator = v.object({
  outcome: dateOutcomeValidator,
  safety: dateSafetyValidator,
  meetAgain: meetAgainValidator,
  venueRating: v.union(v.number(), v.null()),
  note: v.union(v.string(), v.null()),
  followUpRequested: v.boolean(),
  updatedAt: v.number(),
});

export const mine = query({
  args: { dropId: v.id("dateDrops") },
  returns: v.union(v.null(), feedbackValidator),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await requireParticipant(ctx, args.dropId, userId);
    const feedback = await ctx.db
      .query("dateFeedback")
      .withIndex("by_drop_and_user", (q) =>
        q.eq("dropId", args.dropId).eq("userId", userId),
      )
      .unique();
    if (!feedback) return null;
    return {
      outcome: feedback.outcome,
      safety: feedback.safety,
      meetAgain: feedback.meetAgain,
      venueRating: feedback.venueRating ?? null,
      note: feedback.note ?? null,
      followUpRequested: feedback.followUpRequested,
      updatedAt: feedback.updatedAt,
    };
  },
});

/** Private, optional post-date feedback. Never disclosed to the match. */
export const submit = mutation({
  args: {
    dropId: v.id("dateDrops"),
    outcome: dateOutcomeValidator,
    safety: dateSafetyValidator,
    meetAgain: meetAgainValidator,
    venueRating: v.optional(v.number()),
    note: v.optional(v.string()),
    followUpRequested: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await requireParticipant(ctx, args.dropId, userId);
    const drop = await ctx.db.get("dateDrops", args.dropId);
    if (!drop) throw new Error("That date plan is gone.");

    const now = Date.now();
    if (
      drop.status !== "completed" &&
      !(drop.status === "confirmed" && now >= drop.endMs)
    ) {
      throw new Error("You can check in after the date has ended.");
    }

    const venueRating =
      args.venueRating === undefined
        ? undefined
        : Math.round(Math.min(5, Math.max(1, args.venueRating)));
    const note = args.note ? cleanMultiline(args.note, 800) : undefined;
    const existing = await ctx.db
      .query("dateFeedback")
      .withIndex("by_drop_and_user", (q) =>
        q.eq("dropId", args.dropId).eq("userId", userId),
      )
      .unique();

    const values = {
      outcome: args.outcome,
      safety: args.safety,
      meetAgain: args.meetAgain,
      venueRating,
      note,
      followUpRequested: args.followUpRequested,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch("dateFeedback", existing._id, values);
    } else {
      await ctx.db.insert("dateFeedback", {
        dropId: args.dropId,
        userId,
        ...values,
        createdAt: now,
      });
    }

    if (args.followUpRequested && !existing?.followUpRequested) {
      await ctx.db.insert("notifications", {
        userId,
        kind: "safety",
        title: "Your private check-in is saved",
        body: "You asked for safety follow-up. Your response is private and attached to this date plan.",
        dropId: args.dropId,
        href: `/drop/${args.dropId}`,
        read: false,
      });
    }

    await recordAudit(ctx, {
      action: existing ? "feedback.updated" : "feedback.submitted",
      actorUserId: userId,
      dropId: args.dropId,
      detail: args.followUpRequested
        ? "Private follow-up requested"
        : "Private response",
    });
    return null;
  },
});
