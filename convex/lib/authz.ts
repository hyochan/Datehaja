import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Authorisation helpers.
 *
 * Rule: no Convex function ever accepts a caller-supplied user id for
 * authorisation. The identity always comes from the session.
 */

export async function currentUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<Id<"users"> | null> {
  return await getAuthUserId(ctx);
}

export async function requireUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not signed in.");
  return userId;
}

export async function getProfileByUser(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<Doc<"profiles"> | null> {
  return await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
}

export async function requireProfile(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<Doc<"profiles">> {
  const profile = await getProfileByUser(ctx, userId);
  if (!profile) throw new Error("Finish setting up your profile first.");
  return profile;
}

export async function requireActiveProfile(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<Doc<"profiles">> {
  const profile = await requireProfile(ctx, userId);
  if (profile.status === "suspended" || profile.moderationStatus === "suspended") {
    throw new Error("This account is suspended.");
  }
  return profile;
}

export async function getPreferencesByUser(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<Doc<"preferences"> | null> {
  return await ctx.db
    .query("preferences")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
}

export async function requirePreferences(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<Doc<"preferences">> {
  const prefs = await getPreferencesByUser(ctx, userId);
  if (!prefs) throw new Error("Finish setting your preferences first.");
  return prefs;
}

/** Ownership check for a date plan — the caller must be a participant. */
export async function requireParticipant(
  ctx: QueryCtx | MutationCtx,
  dropId: Id<"dateDrops">,
  userId: Id<"users">,
): Promise<Doc<"dateDropParticipants">> {
  const participant = await ctx.db
    .query("dateDropParticipants")
    .withIndex("by_drop_and_user", (q) => q.eq("dropId", dropId).eq("userId", userId))
    .unique();
  if (!participant) throw new Error("This date plan isn't yours.");
  return participant;
}

/** Both directions — a block always applies mutually. */
export async function isBlockedEitherWay(
  ctx: QueryCtx | MutationCtx,
  a: Id<"users">,
  b: Id<"users">,
): Promise<boolean> {
  const forward = await ctx.db
    .query("blocks")
    .withIndex("by_pair", (q) => q.eq("blockerUserId", a).eq("blockedUserId", b))
    .first();
  if (forward) return true;
  const reverse = await ctx.db
    .query("blocks")
    .withIndex("by_pair", (q) => q.eq("blockerUserId", b).eq("blockedUserId", a))
    .first();
  return reverse !== null;
}

export async function recordAudit(
  ctx: MutationCtx,
  args: {
    action: string;
    actorUserId?: Id<"users">;
    dropId?: Id<"dateDrops">;
    targetUserId?: Id<"users">;
    detail: string;
  },
): Promise<void> {
  await ctx.db.insert("auditEvents", {
    actorType: args.actorUserId ? "user" : "system",
    actorUserId: args.actorUserId,
    action: args.action,
    dropId: args.dropId,
    targetUserId: args.targetUserId,
    detail: args.detail.slice(0, 500),
  });
}

/**
 * Fixed-window rate limit. Deliberately simple and transactional — one document
 * per key, incremented inside the calling mutation.
 */
export async function checkRateLimit(
  ctx: MutationCtx,
  key: string,
  limit: number,
  windowMs: number,
  nowMs: number,
): Promise<{ ok: boolean; retryAfterMs: number }> {
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();

  if (!existing) {
    await ctx.db.insert("rateLimits", { key, windowStartMs: nowMs, count: 1 });
    return { ok: true, retryAfterMs: 0 };
  }

  if (nowMs - existing.windowStartMs >= windowMs) {
    await ctx.db.patch("rateLimits", existing._id, {
      windowStartMs: nowMs,
      count: 1,
    });
    return { ok: true, retryAfterMs: 0 };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterMs: existing.windowStartMs + windowMs - nowMs,
    };
  }

  await ctx.db.patch("rateLimits", existing._id, { count: existing.count + 1 });
  return { ok: true, retryAfterMs: 0 };
}
