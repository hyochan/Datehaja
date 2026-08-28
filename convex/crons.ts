import { cronJobs } from "convex/server";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Background maintenance. Each job reads the clock once in an action and passes
 * `nowMs` down, so the mutations underneath stay deterministic and testable.
 */

export const tick = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const nowMs = Date.now();
    const expired = await ctx.runMutation(internal.dateDrops.expireOverdueDrops, {
      nowMs,
    });
    const completed = await ctx.runMutation(internal.dateDrops.completePastDrops, {
      nowMs,
    });
    const staleWindows = await ctx.runMutation(
      internal.dateDrops.expireStaleAvailability,
      { nowMs },
    );
    if (expired || completed || staleWindows) {
      console.log(
        `[cron] expired=${expired} completed=${completed} staleWindows=${staleWindows}`,
      );
    }
    return null;
  },
});

export const dailyTick = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const nowMs = Date.now();
    const reminders = await ctx.runMutation(internal.dateDrops.queueReminders, {
      nowMs,
    });
    const ages = await ctx.runMutation(internal.dateDrops.refreshAges, { nowMs });
    console.log(`[cron] reminders=${reminders} agesRefreshed=${ages}`);
    return null;
  },
});

const crons = cronJobs();

// Deadlines, completions and stale windows.
crons.interval("datehaja maintenance", { minutes: 10 }, internal.crons.tick, {});

// Reminders and denormalised ages.
crons.cron("datehaja daily", "0 9 * * *", internal.crons.dailyTick, {});

export default crons;
