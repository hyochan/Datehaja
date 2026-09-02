import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { aiPurposeValidator } from "./lib/enums";
import { truncate } from "./lib/text";

/**
 * AI observability. Every model call the product makes — Agent chat, date
 * turns, verdicts — is recorded in `aiRuns` with model, latency, tokens, and
 * outcome, so the reasoning behind an Agent's behaviour can be inspected
 * after the fact.
 */

export const recordRun = internalMutation({
  args: {
    purpose: aiPurposeValidator,
    model: v.string(),
    endpoint: v.string(),
    userId: v.optional(v.id("users")),
    agentDateId: v.optional(v.id("agentDates")),
    inputSummary: v.string(),
    outputPreview: v.string(),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
    totalTokens: v.optional(v.number()),
    latencyMs: v.number(),
    status: v.union(v.literal("succeeded"), v.literal("failed")),
    error: v.optional(v.string()),
  },
  returns: v.id("aiRuns"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiRuns", {
      ...args,
      inputSummary: truncate(args.inputSummary, 1200),
      outputPreview: truncate(args.outputPreview, 900),
      error: args.error ? truncate(args.error, 400) : undefined,
    });
  },
});
