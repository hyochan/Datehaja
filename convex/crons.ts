import { cronJobs } from "convex/server";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Background maintenance. The job reads the clock once in an action and passes
 * `nowMs` down, so the mutations underneath stay deterministic and testable.
 */

export const dailyTick = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const nowMs = Date.now();
    const ages = await ctx.runMutation(internal.profiles.refreshAges, { nowMs });
    console.log(`[cron] agesRefreshed=${ages}`);
    return null;
  },
});

const crons = cronJobs();

// Denormalised ages.
crons.cron("datehaja daily", "0 9 * * *", internal.crons.dailyTick, {});

export default crons;
