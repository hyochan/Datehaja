import { v } from "convex/values";

/** Gender identity options. Used only for explicit, user-stated dating preference
 *  matching — never for hidden ranking. */
export const genderValidator = v.union(
  v.literal("woman"),
  v.literal("man"),
  v.literal("nonbinary"),
  v.literal("other"),
);
export type Gender = "woman" | "man" | "nonbinary" | "other";

export const socialEnergyValidator = v.union(
  v.literal("introvert"),
  v.literal("ambivert"),
  v.literal("extrovert"),
);

export const relationshipIntentValidator = v.union(
  v.literal("casual"),
  v.literal("open"),
  v.literal("serious"),
  v.literal("friendship"),
  v.literal("unsure"),
);

export const smokingValidator = v.union(
  v.literal("no_preference"),
  v.literal("non_smoker_only"),
  v.literal("smoker_ok"),
);

export const alcoholValidator = v.union(
  v.literal("none"),
  v.literal("occasional"),
  v.literal("social"),
  v.literal("no_preference"),
);

export const dayPreferenceValidator = v.union(
  v.literal("weekday"),
  v.literal("weekend"),
  v.literal("either"),
);

export const indoorOutdoorValidator = v.union(
  v.literal("indoor"),
  v.literal("outdoor"),
  v.literal("either"),
);

export const atmosphereValidator = v.union(
  v.literal("quiet"),
  v.literal("lively"),
  v.literal("either"),
);

/** How strongly a stated taste should influence matching. */
export const preferenceStrengthValidator = v.union(
  v.literal("important"),
  v.literal("flexible"),
  v.literal("no_preference"),
);

/** A photo is optional, and its owner decides when a match can see it. */
export const photoVisibilityValidator = v.union(
  v.literal("with_match"),
  v.literal("after_accept"),
);

export const profileStatusValidator = v.union(
  v.literal("active"),
  v.literal("paused"),
  v.literal("suspended"),
);

export const moderationStatusValidator = v.union(
  v.literal("ok"),
  v.literal("flagged"),
  v.literal("suspended"),
);

/** The primary, private reason behind an Agent's independent verdict.
 * These codes are deliberately about fit, never a person's popularity or a
 * protected characteristic. */
export const AGENT_DECISION_CODES = [
  "strong_alignment",
  "worth_exploring",
  "intent_mismatch",
  "values_mismatch",
  "communication_mismatch",
  "lifestyle_mismatch",
  "boundary_concern",
  "practical_mismatch",
  "insufficient_signal",
] as const;

export type AgentDecisionCode = (typeof AGENT_DECISION_CODES)[number];

export const agentDecisionCodeValidator = v.union(
  v.literal("strong_alignment"),
  v.literal("worth_exploring"),
  v.literal("intent_mismatch"),
  v.literal("values_mismatch"),
  v.literal("communication_mismatch"),
  v.literal("lifestyle_mismatch"),
  v.literal("boundary_concern"),
  v.literal("practical_mismatch"),
  v.literal("insufficient_signal"),
);

export const reportCategoryValidator = v.union(
  v.literal("harassment"),
  v.literal("inappropriate_content"),
  v.literal("fake_profile"),
  v.literal("underage"),
  v.literal("scam_or_spam"),
  v.literal("no_show"),
  v.literal("safety_concern"),
  v.literal("other"),
);

export const reportStatusValidator = v.union(
  v.literal("open"),
  v.literal("reviewing"),
  v.literal("actioned"),
  v.literal("dismissed"),
);

export const emailKindValidator = v.union(
  v.literal("safety"),
  v.literal("concierge_reply"),
  v.literal("agent_debrief"),
  v.literal("agent_connection"),
);

export const aiPurposeValidator = v.union(
  v.literal("moderation"),
  v.literal("agent_companion"),
  v.literal("agent_date_turn"),
  v.literal("agent_date_verdict"),
  v.literal("agent_date_review_audit"),
  v.literal("agent_date_activity"),
  v.literal("agent_date_activity_audit"),
);

/** A rotating private prompt that helps an Agent learn its owner over time. */
export const agentQuestionCategoryValidator = v.union(
  v.literal("connection_pattern"),
  v.literal("conflict_repair"),
  v.literal("social_rhythm"),
  v.literal("affection"),
  v.literal("boundaries"),
  v.literal("curiosity"),
  v.literal("date_style"),
);

export const agentQuestionStatusValidator = v.union(
  v.literal("open"),
  v.literal("answered"),
  v.literal("skipped"),
);

export const notificationKindValidator = v.union(
  v.literal("safety"),
  v.literal("message"),
  v.literal("system"),
);
