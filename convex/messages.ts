import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { currentUserId, requireParticipant, requireUserId } from "./lib/authz";
import { PRESET_MESSAGES } from "./lib/catalog";
import { firstNameOnly } from "./lib/privacy";

/**
 * Pre-date logistics. Deliberately not a chat app.
 *
 * DateHaja's whole point is getting two people offline, so the only thing this
 * carries is the handful of messages a real evening actually needs. There is no
 * free-text field, which also means there is nowhere to slip a phone number.
 */

const PRESET_BY_KEY = new Map<string, string>(
  PRESET_MESSAGES.map((m) => [m.key as string, m.body]),
);

export const list = query({
  args: { dropId: v.id("dateDrops") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    if (!userId) return [];
    const me = await ctx.db
      .query("dateDropParticipants")
      .withIndex("by_drop_and_user", (q) =>
        q.eq("dropId", args.dropId).eq("userId", userId),
      )
      .unique();
    // `send` requires a confirmed participant; reading must match, or someone
    // who passed could watch the couple who replaced them make plans.
    if (!me || me.state !== "confirmed") return [];

    const messages = await ctx.db
      .query("dateMessages")
      .withIndex("by_drop", (q) => q.eq("dropId", args.dropId))
      .order("asc")
      .take(60);

    const names = new Map<string, string>();
    return await Promise.all(
      messages.map(async (message) => {
        const key = message.fromUserId as string;
        if (!names.has(key)) {
          const profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", message.fromUserId))
            .unique();
          names.set(key, profile ? firstNameOnly(profile.displayName) : "Someone");
        }
        return {
          _id: message._id,
          _creationTime: message._creationTime,
          body: message.body,
          presetKey: message.presetKey,
          mine: message.fromUserId === userId,
          fromName: names.get(key)!,
        };
      }),
    );
  },
});

export const send = mutation({
  args: { dropId: v.id("dateDrops"), presetKey: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const me = await requireParticipant(ctx, args.dropId, userId);
    if (me.state !== "confirmed") {
      throw new Error("Messages open once the date is confirmed.");
    }

    const drop = await ctx.db.get("dateDrops", args.dropId);
    if (!drop || drop.status !== "confirmed") {
      throw new Error("This date isn't confirmed.");
    }

    const body = PRESET_BY_KEY.get(args.presetKey);
    if (!body) throw new Error("That isn't one of the available messages.");

    // Enough for a real evening, not enough to become a chat thread.
    const mine = await ctx.db
      .query("dateMessages")
      .withIndex("by_drop_and_from", (q) =>
        q.eq("dropId", args.dropId).eq("fromUserId", userId),
      )
      .take(11);
    if (mine.length >= 10) {
      throw new Error("That's plenty of messages for one date.");
    }

    await ctx.db.insert("dateMessages", {
      dropId: args.dropId,
      fromUserId: userId,
      presetKey: args.presetKey,
      body,
      readByUserIds: [userId],
    });

    const participants = await ctx.db
      .query("dateDropParticipants")
      .withIndex("by_drop", (q) => q.eq("dropId", args.dropId))
      .take(10);
    const other = participants.find(
      (p) => p.userId !== userId && p.state === "confirmed",
    );
    if (other) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique();
      await ctx.runMutation(internal.notifications.create, {
        userId: other.userId,
        kind: "message",
        title: `${profile ? firstNameOnly(profile.displayName) : "Your date"} sent a note`,
        body,
        dropId: args.dropId,
        href: `/drop/${args.dropId}`,
      });
    }
    return null;
  },
});

export const presets = query({
  args: {},
  returns: v.array(v.object({ key: v.string(), body: v.string() })),
  handler: async () => PRESET_MESSAGES.map((m) => ({ key: m.key, body: m.body })),
});
