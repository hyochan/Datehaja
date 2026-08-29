import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { recordAudit, requireParticipant, requireUserId } from "./lib/authz";
import {
  connectionQualityValidator,
  dateOutcomeValidator,
  dateSafetyValidator,
  meetAgainValidator,
  profileAccuracyValidator,
  respectValidator,
} from "./lib/enums";
import { pickCounterpart } from "./lib/participants";
import { cleanMultiline } from "./lib/text";

const feedbackValidator = v.object({
  outcome: dateOutcomeValidator,
  safety: dateSafetyValidator,
  meetAgain: meetAgainValidator,
  profileAccuracy: v.union(profileAccuracyValidator, v.null()),
  respectful: v.union(respectValidator, v.null()),
  connection: v.union(connectionQualityValidator, v.null()),
  venueRating: v.union(v.number(), v.null()),
  note: v.union(v.string(), v.null()),
  followUpRequested: v.boolean(),
  updatedAt: v.number(),
  otherSubmitted: v.boolean(),
  mutualStatus: v.union(
    v.literal("waiting"),
    v.literal("complete"),
    v.literal("mutual"),
  ),
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
    const drop = await ctx.db.get("dateDrops", args.dropId);
    const responses = await ctx.db
      .query("dateFeedback")
      .withIndex("by_drop", (q) => q.eq("dropId", args.dropId))
      .take(10);
    const otherSubmitted = responses.some((row) => row.userId !== userId);
    return {
      outcome: feedback.outcome,
      safety: feedback.safety,
      meetAgain: feedback.meetAgain,
      profileAccuracy: feedback.profileAccuracy ?? null,
      respectful: feedback.respectful ?? null,
      connection: feedback.connection ?? null,
      venueRating: feedback.venueRating ?? null,
      note: feedback.note ?? null,
      followUpRequested: feedback.followUpRequested,
      updatedAt: feedback.updatedAt,
      otherSubmitted,
      mutualStatus: drop?.mutualMeetAgainAt
        ? ("mutual" as const)
        : otherSubmitted
          ? ("complete" as const)
          : ("waiting" as const),
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
    profileAccuracy: v.optional(profileAccuracyValidator),
    respectful: v.optional(respectValidator),
    connection: v.optional(connectionQualityValidator),
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
    if (
      args.outcome === "went" &&
      (!args.profileAccuracy || !args.respectful || !args.connection)
    ) {
      throw new Error(
        "Complete the profile accuracy, respect, and conversation check-in.",
      );
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
    const participants = await ctx.db
      .query("dateDropParticipants")
      .withIndex("by_drop", (q) => q.eq("dropId", args.dropId))
      .take(10);
    const counterpart = pickCounterpart(participants, userId);

    const values = {
      reviewedUserId: counterpart?.userId,
      outcome: args.outcome,
      safety: args.safety,
      meetAgain: args.meetAgain,
      profileAccuracy:
        args.outcome === "went" ? args.profileAccuracy : undefined,
      respectful: args.outcome === "went" ? args.respectful : undefined,
      connection: args.outcome === "went" ? args.connection : undefined,
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

    const otherFeedback = counterpart
      ? await ctx.db
          .query("dateFeedback")
          .withIndex("by_drop_and_user", (q) =>
            q.eq("dropId", args.dropId).eq("userId", counterpart.userId),
          )
          .unique()
      : null;
    const isMutual =
      args.meetAgain === "yes" && otherFeedback?.meetAgain === "yes";

    if (isMutual && !drop.mutualMeetAgainAt && counterpart) {
      await ctx.db.patch("dateDrops", drop._id, {
        mutualMeetAgainAt: now,
        updatedAt: now,
      });
      for (const recipientId of [userId, counterpart.userId]) {
        await ctx.db.insert("notifications", {
          userId: recipientId,
          kind: "system",
          title: "You both want another date",
          body: "Your answers matched. Open another evening when you're ready.",
          dropId: args.dropId,
          href: `/drop/${args.dropId}`,
          read: false,
        });
      }
    } else if (!isMutual && drop.mutualMeetAgainAt && counterpart) {
      await ctx.db.patch("dateDrops", drop._id, {
        mutualMeetAgainAt: undefined,
        updatedAt: now,
      });
      for (const recipientId of [userId, counterpart.userId]) {
        await ctx.db.insert("notifications", {
          userId: recipientId,
          kind: "system",
          title: "Follow-up preference updated",
          body: "The mutual follow-up is closed. We never reveal who changed an answer.",
          dropId: args.dropId,
          href: `/drop/${args.dropId}`,
          read: false,
        });
      }
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
