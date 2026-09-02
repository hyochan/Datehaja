import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { notificationKindValidator } from "./lib/enums";
import { currentUserId, requireUserId } from "./lib/authz";
import { truncate } from "./lib/text";

const notificationDoc = v.object({
  _id: v.id("notifications"),
  _creationTime: v.number(),
  userId: v.id("users"),
  kind: notificationKindValidator,
  title: v.string(),
  body: v.string(),
  href: v.optional(v.string()),
  read: v.boolean(),
});

export const create = internalMutation({
  args: {
    userId: v.id("users"),
    kind: notificationKindValidator,
    title: v.string(),
    body: v.string(),
    href: v.optional(v.string()),
  },
  returns: v.id("notifications"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      kind: args.kind,
      title: truncate(args.title, 120),
      body: truncate(args.body, 300),
      href: args.href,
      read: false,
    });
  },
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(notificationDoc),
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(Math.min(args.limit ?? 30, 60));
  },
});

export const unreadCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const userId = await currentUserId(ctx);
    if (!userId) return 0;
    // Bounded on purpose: the badge shows "9+" past this.
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) => q.eq("userId", userId).eq("read", false))
      .take(10);
    return unread.length;
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const notification = await ctx.db.get("notifications", args.notificationId);
    if (!notification || notification.userId !== userId) return null;
    if (!notification.read) {
      await ctx.db.patch("notifications", notification._id, { read: true });
    }
    return null;
  },
});

export const markAllRead = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) => q.eq("userId", userId).eq("read", false))
      .take(100);
    for (const n of unread) {
      await ctx.db.patch("notifications", n._id, { read: true });
    }
    return null;
  },
});
