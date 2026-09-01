import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * Replace the just-created random OTP with a fixed development OTP.
 *
 * This is internal-only and requires the caller to prove which random hash it
 * is replacing. Production never calls it; eligibility is enforced in the
 * email provider before this mutation is reached.
 */
export const overrideVerificationCode = internalMutation({
  args: {
    email: v.string(),
    provider: v.string(),
    originalHash: v.string(),
    fixedHash: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", args.provider).eq("providerAccountId", args.email),
      )
      .unique();
    if (!account) return false;

    const verificationCode = await ctx.db
      .query("authVerificationCodes")
      .withIndex("accountId", (q) => q.eq("accountId", account._id))
      .unique();
    if (!verificationCode || verificationCode.code !== args.originalHash) {
      return false;
    }

    // Convex Auth looks OTPs up by their global hash. Keep that lookup unique.
    const previousFixedCode = await ctx.db
      .query("authVerificationCodes")
      .withIndex("code", (q) => q.eq("code", args.fixedHash))
      .unique();
    if (previousFixedCode && previousFixedCode._id !== verificationCode._id) {
      await ctx.db.delete(previousFixedCode._id);
    }

    await ctx.db.patch(verificationCode._id, { code: args.fixedHash });
    return true;
  },
});
