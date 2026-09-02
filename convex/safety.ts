import { v } from "convex/values";
import {
  internalAction,
  mutation,
  query,
} from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import {
  currentUserId,
  isBlockedEitherWay,
  recordAudit,
  requireUserId,
} from "./lib/authz";
import { reportCategoryValidator } from "./lib/enums";
import { firstNameOnly, toPublicPreview } from "./lib/privacy";
import { LIMITS, cleanMultiline } from "./lib/text";
import { appUrl, sendConciergeEmail } from "./mail";
import { safetyEmail } from "./lib/emailTemplates";

/**
 * Safety.
 *
 * Blocking is mutual and immediate: a blocked pair can never appear in each
 * other's Agent scouting pool again, in either direction, and any live agent
 * date between them closes quietly. Reporting is separate from blocking so
 * someone can flag a real problem without being forced to also cut contact,
 * and vice versa.
 *
 * Datehaja does NOT verify identity. Nothing in the product claims that it does.
 */

/* -------------------------------- blocking -------------------------------- */

export const blockFromAgentDate = mutation({
  args: {
    agentDateId: v.id("agentDates"),
    reason: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const other = await counterpartOnAgentDate(ctx, args.agentDateId, userId);
    await blockUserInternal(ctx, userId, other, args.reason);
    return null;
  },
});

async function counterpartOnAgentDate(
  ctx: MutationCtx,
  agentDateId: Id<"agentDates">,
  userId: Id<"users">,
): Promise<Id<"users">> {
  const date = await ctx.db.get("agentDates", agentDateId);
  if (!date) throw new Error("That agent date is gone.");
  if (date.initiatorUserId === userId) return date.counterpartUserId;
  if (date.counterpartUserId === userId) return date.initiatorUserId;
  throw new Error("That agent date isn't yours.");
}

async function blockUserInternal(
  ctx: MutationCtx,
  blockerUserId: Id<"users">,
  blockedUserId: Id<"users">,
  reason?: string,
): Promise<void> {
  if (blockerUserId === blockedUserId)
    throw new Error("You can't block yourself.");

  const existing = await ctx.db
    .query("blocks")
    .withIndex("by_pair", (q) =>
      q.eq("blockerUserId", blockerUserId).eq("blockedUserId", blockedUserId),
    )
    .unique();

  if (!existing) {
    await ctx.db.insert("blocks", {
      blockerUserId,
      blockedUserId,
      reason: reason ? cleanMultiline(reason, 200) : undefined,
    });
  }

  // Quietly close every live agent date the two of them share, in either
  // direction. The pair-scoped index bounds the read to this pair's dates, so
  // heavy users cannot age an old live date out of the sweep. Neither side is
  // told who ended it.
  const now = Date.now();
  const [initiated, received] = await Promise.all([
    ctx.db
      .query("agentDates")
      .withIndex("by_initiator_and_counterpart", (q) =>
        q
          .eq("initiatorUserId", blockerUserId)
          .eq("counterpartUserId", blockedUserId),
      )
      .take(200),
    ctx.db
      .query("agentDates")
      .withIndex("by_initiator_and_counterpart", (q) =>
        q
          .eq("initiatorUserId", blockedUserId)
          .eq("counterpartUserId", blockerUserId),
      )
      .take(200),
  ]);
  for (const date of [...initiated, ...received]) {
    if (date.status === "closed" || date.status === "failed") continue;
    await ctx.db.patch("agentDates", date._id, {
      status: "closed",
      updatedAt: now,
    });
  }

  await recordAudit(ctx, {
    action: "safety.blocked",
    actorUserId: blockerUserId,
    targetUserId: blockedUserId,
    detail: reason ? "With reason" : "No reason given",
  });
}

/* -------------------------------- reporting -------------------------------- */

export const report = mutation({
  args: {
    agentDateId: v.id("agentDates"),
    category: reportCategoryValidator,
    details: v.string(),
    alsoBlock: v.boolean(),
  },
  returns: v.id("reports"),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const reportedUserId = await counterpartOnAgentDate(
      ctx,
      args.agentDateId,
      userId,
    );

    const reportId = await ctx.db.insert("reports", {
      reporterUserId: userId,
      reportedUserId,
      agentDateId: args.agentDateId,
      category: args.category,
      details: cleanMultiline(args.details, LIMITS.reportDetails),
      status: "open",
      alsoBlocked: args.alsoBlock,
    });

    // Reports that allege something serious immediately restrict the account
    // pending review, rather than waiting for a human.
    if (args.category === "underage" || args.category === "harassment") {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", reportedUserId))
        .unique();
      if (profile && profile.moderationStatus === "ok") {
        await ctx.db.patch("profiles", profile._id, {
          moderationStatus: "flagged",
          updatedAt: Date.now(),
        });
      }
    }

    if (args.alsoBlock) {
      await blockUserInternal(ctx, userId, reportedUserId, "Reported");
    }

    await recordAudit(ctx, {
      action: "safety.reported",
      actorUserId: userId,
      targetUserId: reportedUserId,
      agentDateId: args.agentDateId,
      detail: args.category,
    });

    await ctx.scheduler.runAfter(0, internal.safety.acknowledgeReport, {
      reporterUserId: userId,
      reportId,
    });

    return reportId;
  },
});

export const acknowledgeReport = internalAction({
  args: { reporterUserId: v.id("users"), reportId: v.id("reports") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const recipient = (await ctx.runQuery(internal.mail.getRecipient, {
      userId: args.reporterUserId,
    })) as { firstName: string };

    await ctx.runMutation(internal.notifications.create, {
      userId: args.reporterUserId,
      kind: "safety",
      title: "We got your report",
      body: "Thanks for telling us. We've logged it and taken the immediate steps you asked for.",
      href: "/safety",
    });

    await sendConciergeEmail(ctx, {
      userId: args.reporterUserId,
      kind: "safety",
      content: safetyEmail({
        firstName: recipient.firstName,
        headline: "We got your report",
        body: "Thanks for telling us. We've logged it, taken the immediate steps you asked for, and it's now in front of our team. If you're ever in danger, contact your local emergency services first — we're not an emergency service.",
        url: appUrl("/safety"),
      }),
      idempotencyKey: `report-ack-${args.reportId}`,
      labels: ["safety"],
    });
    return null;
  },
});

export const blockedList = query({
  args: {},
  returns: v.array(
    v.object({ userId: v.id("users"), displayName: v.string() }),
  ),
  handler: async (ctx) => {
    const userId = await currentUserId(ctx);
    if (!userId) return [];
    const blocks = await ctx.db
      .query("blocks")
      .withIndex("by_blocker", (q) => q.eq("blockerUserId", userId))
      .take(100);

    const out: Array<{ userId: Id<"users">; displayName: string }> = [];
    for (const block of blocks) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", block.blockedUserId))
        .unique();
      out.push({
        userId: block.blockedUserId,
        displayName: profile ? firstNameOnly(profile.displayName) : "Someone",
      });
    }
    return out;
  },
});

export const unblock = mutation({
  args: { userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await requireUserId(ctx);
    const block = await ctx.db
      .query("blocks")
      .withIndex("by_pair", (q) =>
        q.eq("blockerUserId", me).eq("blockedUserId", args.userId),
      )
      .unique();
    if (!block) return null;
    await ctx.db.delete("blocks", block._id);
    await recordAudit(ctx, {
      action: "safety.unblocked",
      actorUserId: me,
      targetUserId: args.userId,
      detail: "Removed from block list",
    });
    return null;
  },
});

/** "What can the other person see about me?" — answered honestly. */
export const myVisibility = query({
  args: {},
  returns: v.union(v.null(), v.any()),
  handler: async (ctx) => {
    const userId = await currentUserId(ctx);
    if (!userId) return null;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return null;
    const preferences = await ctx.db
      .query("preferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const preview = toPublicPreview(profile, preferences?.relationshipIntent);

    return {
      beforeMatch: preview,
      afterMatch: {
        ...preview,
        photo: profile.photoStorageId ? "Your photo" : "No photo uploaded",
        photoVisibility: profile.photoVisibility ?? "after_accept",
      },
      neverShared: [
        "Your email address",
        "Your phone number",
        "Your exact address or coordinates",
        "Your date of birth",
        "Your full name (we only show your first name)",
        "Your other agent dates, past or present",
      ],
    };
  },
});

export const isBlocked = query({
  args: { otherUserId: v.id("users") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    if (!userId) return false;
    return await isBlockedEitherWay(ctx, userId, args.otherUserId);
  },
});
