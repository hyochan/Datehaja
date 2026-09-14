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
 * has approved Datehaja's dating/matchmaking category. Until that clears, a
 * deployment may hand out an open trial instead of a paid pass.
 */
export async function getScoutAccess(
  _ctx: ActionCtx,
  _subject: string,
): Promise<ScoutAccess> {
  return scoutAccessFor();
}

/**
 * The entitlement itself, with no caller identity attached. Background workers
 * have no signed-in identity to offer, and passing an empty subject would
 * quietly resolve every owner's access as nobody once billing becomes per-user.
 * Give this a userId at that point, and the callers already have one.
 */
export function scoutAccessFor(): ScoutAccess {
  // The open trial is safe to carry on the public deployment, which is why the
  // submitted URL does: `createCheckout` throws unconditionally so no money can
  // be taken, every date it unlocks is a fictional demo encounter that mails
  // nobody and exposes no real address, and the interface labels the pass DEMO
  // rather than ACTIVE. Without it a visitor can finish the whole brief and
  // then find the scouting button dead, which is how production spent a week
  // looking finished and being unusable.
  //
  // `DATEHAJA_DEMO_BILLING` is the development deployment's older name for the
  // same entitlement, kept working so renaming this did not lock dev out.
  if (
    process.env.DATEHAJA_OPEN_TRIAL === "1" ||
    process.env.DATEHAJA_DEMO_BILLING === "1"
  ) {
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
    return await getScoutAccess(ctx, identity.tokenIdentifier);
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
