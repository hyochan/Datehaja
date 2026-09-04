import { v } from "convex/values";
import { env, internalMutation } from "./_generated/server";
import { isEndToEndTestAlias } from "./lib/authEmail";

/**
 * Retire the accounts an earlier end-to-end run left behind.
 *
 * The two-account suite needs the two accounts it just created to match each
 * other, and nothing makes them. The matcher reads a bounded page of active
 * profiles per city and scores identical profiles identically, while every run
 * mints a pair with the same city, interests and traits. On a deployment that
 * has collected earlier runs the new account is therefore paired with an older
 * twin, or crowded out of the page entirely, and the tie breaks toward
 * whichever was created first.
 *
 * Pausing the leftovers takes them out of the candidate index while leaving
 * the dates and messages that reference them intact.
 *
 * Two guards, because this pauses real rows: it runs only on a development
 * deployment, and only for the plus-tagged aliases the suites sign up with,
 * never for a person's own address.
 */
/**
 * Every address shape the end-to-end suites have ever signed up with.
 *
 * The plus-tagged alias the current suites use, plus the reserved `.test`
 * top-level domain an earlier harness used. RFC 6761 sets `.test` aside so it
 * can never resolve, which is what makes it safe to act on: no real person can
 * hold an account there.
 */
function isTestAccountEmail(email: string): boolean {
  return isEndToEndTestAlias(email) || email.endsWith(".test");
}

export const retirePriorTestAccounts = internalMutation({
  args: { keepEmails: v.array(v.string()) },
  returns: v.object({ retired: v.number() }),
  handler: async (ctx, args) => {
    if (env.ENVIRONMENT !== "development") {
      throw new Error(
        "retirePriorTestAccounts is development-only; it pauses real profiles.",
      );
    }

    const keep = new Set(
      args.keepEmails.map((email) => email.trim().toLowerCase()),
    );
    let retired = 0;
    for await (const profile of ctx.db
      .query("profiles")
      .withIndex("by_status_and_city", (q) => q.eq("status", "active"))) {
      const user = await ctx.db.get("users", profile.userId);
      const email = user?.email?.trim().toLowerCase();
      if (!email || !isTestAccountEmail(email) || keep.has(email)) continue;
      await ctx.db.patch("profiles", profile._id, {
        status: "paused",
        updatedAt: Date.now(),
      });
      retired += 1;
    }
    return { retired };
  },
});
