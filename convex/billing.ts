import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { action } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";

const scoutAccessValidator = v.object({
  allowed: v.boolean(),
  mode: v.union(
    v.literal("subscription"),
    v.literal("demo"),
    v.literal("locked"),
  ),
  configured: v.boolean(),
});

export type ScoutAccess = {
  allowed: boolean;
  mode: "subscription" | "demo" | "locked";
  configured: boolean;
};

/**
 * Live billing stays locked until a Korean and international merchant channel
 * has approved Datehaja's dating/matchmaking category. Demo access belongs only
 * on a development deployment and can never collect money.
 */
export async function getScoutAccess(
  _ctx: ActionCtx,
  _subject: string,
): Promise<ScoutAccess> {
  if (process.env.DATEHAJA_DEMO_BILLING === "1") {
    return { allowed: true, mode: "demo", configured: false };
  }
  return { allowed: false, mode: "locked", configured: false };
}

export const status = action({
  args: {},
  returns: scoutAccessValidator,
  handler: async (ctx): Promise<ScoutAccess> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { allowed: false, mode: "locked" as const, configured: false };
    }
    return await getScoutAccess(ctx, identity.subject);
  },
});

export const createCheckout = action({
  args: {},
  returns: v.object({
    sessionId: v.string(),
    url: v.union(v.string(), v.null()),
  }),
  handler: async (ctx): Promise<{ sessionId: string; url: string | null }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in.");
    throw new Error(
      "Scout Pass payments are not open while our merchant account is under review. No payment can be taken.",
    );
  },
});

export const createPortal = action({
  args: {},
  returns: v.object({ url: v.string() }),
  handler: async (ctx): Promise<{ url: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in.");
    throw new Error(
      "Billing management will open after the payment provider review is complete.",
    );
  },
});
