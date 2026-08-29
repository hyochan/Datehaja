import { v } from "convex/values";
import { env, internalQuery, mutation, query } from "./_generated/server";
import { recordAudit, requireUserId } from "./lib/authz";
import { calendarEventStatus, type CalendarEvent } from "./lib/calendar";

const feedResultValidator = v.object({
  url: v.string(),
  createdAt: v.number(),
});

function feedUrl(token: string): string {
  return `${siteOrigin()}/calendar/${token}.ics`;
}

function siteOrigin(): string {
  // Convex supplies this in every deployment. convex-test intentionally does
  // not, so the deterministic local origin keeps backend tests self-contained.
  return (env.CONVEX_SITE_URL || "https://datehaja.test").replace(/\/$/, "");
}

function newToken(): string {
  return `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, "");
}

export const myFeed = query({
  args: {},
  returns: v.union(v.null(), feedResultValidator),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const feed = await ctx.db
      .query("calendarFeeds")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return feed
      ? { url: feedUrl(feed.token), createdAt: feed.createdAt }
      : null;
  },
});

/** Create the secret subscription URL only when a user asks for it. */
export const enable = mutation({
  args: {},
  returns: feedResultValidator,
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("calendarFeeds")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      return { url: feedUrl(existing.token), createdAt: existing.createdAt };
    }

    const now = Date.now();
    const token = newToken();
    await ctx.db.insert("calendarFeeds", {
      userId,
      token,
      createdAt: now,
      updatedAt: now,
    });
    await recordAudit(ctx, {
      action: "calendar.enabled",
      actorUserId: userId,
      detail: "Created private calendar subscription",
    });
    return { url: feedUrl(token), createdAt: now };
  },
});

/** Replace a leaked subscription URL without changing any date plan. */
export const rotate = mutation({
  args: {},
  returns: feedResultValidator,
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("calendarFeeds")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const now = Date.now();
    const token = newToken();
    if (existing) {
      await ctx.db.patch("calendarFeeds", existing._id, {
        token,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("calendarFeeds", {
        userId,
        token,
        createdAt: now,
        updatedAt: now,
      });
    }
    await recordAudit(ctx, {
      action: "calendar.rotated",
      actorUserId: userId,
      detail: "Rotated private calendar subscription",
    });
    return { url: feedUrl(token), createdAt: existing?.createdAt ?? now };
  },
});

/** Revoke the capability URL. A user can create a fresh one later. */
export const disable = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("calendarFeeds")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      await ctx.db.delete("calendarFeeds", existing._id);
      await recordAudit(ctx, {
        action: "calendar.disabled",
        actorUserId: userId,
        detail: "Revoked private calendar subscription",
      });
    }
    return null;
  },
});

const calendarEventValidator = v.object({
  uid: v.string(),
  startMs: v.number(),
  endMs: v.number(),
  updatedAt: v.number(),
  status: v.union(
    v.literal("TENTATIVE"),
    v.literal("CONFIRMED"),
    v.literal("CANCELLED"),
  ),
  summary: v.string(),
  description: v.string(),
  location: v.string(),
  url: v.string(),
});

/** The HTTP endpoint calls this with an unguessable capability token. */
export const getFeedByToken = internalQuery({
  args: { token: v.string() },
  returns: v.union(
    v.null(),
    v.object({ events: v.array(calendarEventValidator) }),
  ),
  handler: async (ctx, args) => {
    const feed = await ctx.db
      .query("calendarFeeds")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!feed) return null;

    const memberships = await ctx.db
      .query("dateDropParticipants")
      .withIndex("by_user", (q) => q.eq("userId", feed.userId))
      .order("desc")
      .take(100);

    const events: CalendarEvent[] = [];
    const site = siteOrigin();
    for (const membership of memberships) {
      const drop = await ctx.db.get("dateDrops", membership.dropId);
      if (!drop) continue;
      const status = calendarEventStatus({
        dropStatus: drop.status,
        participantState: membership.state,
        reservedAt: membership.calendarReservedAt,
      });
      if (!status) continue;

      const firstStop = drop.itinerary[0];
      const dateUrl = `${site}/drop/${drop._id}`;
      events.push({
        // Keep the pre-rename namespace forever: changing a VEVENT UID creates
        // duplicate calendar entries for existing subscribers.
        uid: `${drop._id}@datehaja`,
        startMs: drop.startMs,
        endMs: drop.endMs,
        updatedAt: drop.updatedAt,
        status,
        summary:
          status === "TENTATIVE"
            ? "Datehaja · reserved"
            : status === "CANCELLED"
              ? "Datehaja · cancelled"
              : `Datehaja · ${drop.theme || drop.title}`,
        description:
          status === "TENTATIVE"
            ? `Your evening is reserved while both people decide. This event updates automatically. ${dateUrl}`
            : status === "CANCELLED"
              ? `This date is no longer going ahead. ${dateUrl}`
              : `Your date is finalized. Open the private plan for live details: ${dateUrl}`,
        location:
          status === "CONFIRMED"
            ? firstStop?.address || `${drop.area}, ${drop.city}`
            : `${drop.area}, ${drop.city}`,
        url: dateUrl,
      });
    }

    events.sort((a, b) => a.startMs - b.startMs);
    return { events };
  },
});
