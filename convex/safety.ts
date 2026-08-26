import { v } from "convex/values";
import { internalAction, mutation, query } from "./_generated/server";
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
 * other's candidate pool again, in either direction. Reporting is separate from
 * blocking so someone can flag a real problem without being forced to also cut
 * contact, and vice versa.
 *
 * DateDrop does NOT verify identity. Nothing in the product claims that it does.
 */

export const blockFromDrop = mutation({
  args: {
    dropId: v.id("dateDrops"),
    reason: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const me = await ctx.db
      .query("dateDropParticipants")
      .withIndex("by_drop_and_user", (q) =>
        q.eq("dropId", args.dropId).eq("userId", userId),
      )
      .unique();
    if (!me) throw new Error("That DateDrop isn't yours.");

    const participants = await ctx.db
      .query("dateDropParticipants")
      .withIndex("by_drop", (q) => q.eq("dropId", args.dropId))
      .take(10);
    const other = participants.find((p) => p.userId !== userId);
    if (!other) throw new Error("There's nobody to block on this DateDrop.");

    await blockUserInternal(ctx, userId, other.userId, args.reason);
    return null;
  },
});

async function blockUserInternal(
  ctx: MutationCtx,
  blockerUserId: Id<"users">,
  blockedUserId: Id<"users">,
  reason?: string,
): Promise<void> {
  if (blockerUserId === blockedUserId) throw new Error("You can't block yourself.");

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

  // Stand down every live DateDrop the two of them share.
  const myDrops = await ctx.db
    .query("dateDropParticipants")
    .withIndex("by_user", (q) => q.eq("userId", blockerUserId))
    .order("desc")
    .take(40);

  for (const membership of myDrops) {
    const drop = await ctx.db.get("dateDrops", membership.dropId);
    if (!drop) continue;
    if (
      drop.status === "cancelled" ||
      drop.status === "completed" ||
      drop.status === "expired_no_match"
    ) {
      continue;
    }
    const others = await ctx.db
      .query("dateDropParticipants")
      .withIndex("by_drop", (q) => q.eq("dropId", drop._id))
      .take(10);
    if (!others.some((p) => p.userId === blockedUserId)) continue;

    const now = Date.now();
    await ctx.db.patch("dateDrops", drop._id, {
      status: "cancelled",
      cancelledAt: now,
      cancelledByUserId: blockerUserId,
      cancelReason: "This DateDrop was cancelled for safety reasons.",
      updatedAt: now,
    });
    for (const p of others) {
      if (
        p.state !== "passed" &&
        p.state !== "replaced" &&
        p.state !== "withdrawn"
      ) {
        await ctx.db.patch("dateDropParticipants", p._id, { state: "cancelled" });
      }
      if (p.availabilityId) {
        const window = await ctx.db.get("availability", p.availabilityId);
        if (window && window.heldByDropId === drop._id) {
          await ctx.db.patch("availability", window._id, {
            status: window.startMs > now ? "open" : "expired",
            heldByDropId: undefined,
          });
        }
      }
    }
    await ctx.db.insert("notifications", {
      userId: blockedUserId,
      kind: "cancelled",
      title: "A DateDrop was cancelled",
      body: "One of your DateDrops was cancelled. Your availability is open again.",
      dropId: drop._id,
      href: "/dashboard",
      read: false,
    });
  }

  await recordAudit(ctx, {
    action: "safety.blocked",
    actorUserId: blockerUserId,
    targetUserId: blockedUserId,
    detail: reason ? "With reason" : "No reason given",
  });
}

export const report = mutation({
  args: {
    dropId: v.optional(v.id("dateDrops")),
    category: reportCategoryValidator,
    details: v.string(),
    alsoBlock: v.boolean(),
  },
  returns: v.id("reports"),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    let reportedUserId: Id<"users"> | null = null;
    if (args.dropId) {
      const me = await ctx.db
        .query("dateDropParticipants")
        .withIndex("by_drop_and_user", (q) =>
          q.eq("dropId", args.dropId!).eq("userId", userId),
        )
        .unique();
      if (!me) throw new Error("That DateDrop isn't yours.");
      const participants = await ctx.db
        .query("dateDropParticipants")
        .withIndex("by_drop", (q) => q.eq("dropId", args.dropId!))
        .take(10);
      reportedUserId = participants.find((p) => p.userId !== userId)?.userId ?? null;
    }
    if (!reportedUserId) {
      throw new Error("We need a DateDrop to attach this report to.");
    }

    const reportId = await ctx.db.insert("reports", {
      reporterUserId: userId,
      reportedUserId,
      dropId: args.dropId,
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
      dropId: args.dropId,
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
  returns: v.array(v.object({ userId: v.id("users"), displayName: v.string() })),
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

    return {
      beforeMatch: toPublicPreview(profile),
      afterMatch: {
        ...toPublicPreview(profile),
        photo: profile.photoStorageId ? "Your photo" : "No photo uploaded",
      },
      neverShared: [
        "Your email address",
        "Your phone number",
        "Your exact address or coordinates",
        "Your date of birth",
        "Your full name (we only show your first name)",
        "Your other DateDrops, past or present",
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
