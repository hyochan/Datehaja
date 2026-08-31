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

export const availabilityStatusValidator = v.union(
  v.literal("open"),
  v.literal("held"),
  v.literal("booked"),
  v.literal("expired"),
  v.literal("cancelled"),
);

/** Date-plan lifecycle. Transitions are enforced in lib/stateMachine.ts. */
export const dropStatusValidator = v.union(
  v.literal("draft"),
  v.literal("matching"),
  v.literal("researching"),
  v.literal("inviting"),
  v.literal("partially_accepted"),
  v.literal("confirmed"),
  v.literal("expired_no_match"),
  v.literal("cancelled"),
  v.literal("completed"),
  v.literal("failed"),
);
export type DropStatus =
  | "draft"
  | "matching"
  | "researching"
  | "inviting"
  | "partially_accepted"
  | "confirmed"
  | "expired_no_match"
  | "cancelled"
  | "completed"
  | "failed";

export const participantStateValidator = v.union(
  v.literal("invited"),
  v.literal("viewed"),
  v.literal("accepted"),
  v.literal("passed"),
  v.literal("withdrawn"),
  v.literal("confirmed"),
  v.literal("expired"),
  v.literal("cancelled"),
  v.literal("replaced"),
);
export type ParticipantState =
  | "invited"
  | "viewed"
  | "accepted"
  | "passed"
  | "withdrawn"
  | "confirmed"
  | "expired"
  | "cancelled"
  | "replaced";

export const dateOutcomeValidator = v.union(
  v.literal("went"),
  v.literal("no_show"),
  v.literal("left_early"),
  v.literal("did_not_go"),
);

export const dateSafetyValidator = v.union(
  v.literal("safe"),
  v.literal("uncomfortable"),
  v.literal("unsafe"),
  v.literal("prefer_not_to_say"),
);

export const meetAgainValidator = v.union(
  v.literal("yes"),
  v.literal("maybe"),
  v.literal("no"),
  v.literal("prefer_not_to_say"),
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

export const profileAccuracyValidator = v.union(
  v.literal("accurate"),
  v.literal("mostly_accurate"),
  v.literal("different"),
  v.literal("prefer_not_to_say"),
);

export const respectValidator = v.union(
  v.literal("yes"),
  v.literal("mostly"),
  v.literal("no"),
  v.literal("prefer_not_to_say"),
);

export const connectionQualityValidator = v.union(
  v.literal("easy"),
  v.literal("mixed"),
  v.literal("difficult"),
  v.literal("prefer_not_to_say"),
);

export const passReasonValidator = v.union(
  v.literal("timing"),
  v.literal("location"),
  v.literal("activity"),
  v.literal("profile"),
  v.literal("budget"),
  v.literal("not_feeling_it"),
  v.literal("unspecified"),
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
  v.literal("welcome"),
  v.literal("invitation"),
  v.literal("accepted_waiting"),
  v.literal("confirmed"),
  v.literal("reminder"),
  v.literal("updated"),
  v.literal("cancelled"),
  v.literal("expired"),
  v.literal("safety"),
  v.literal("concierge_reply"),
  v.literal("agent_debrief"),
  v.literal("agent_connection"),
);

export const aiPurposeValidator = v.union(
  v.literal("rank_candidates"),
  v.literal("build_plan"),
  v.literal("compat_blurb"),
  v.literal("venue_summary"),
  v.literal("moderation"),
  v.literal("agent_companion"),
  v.literal("agent_date_turn"),
  v.literal("agent_date_verdict"),
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

export const confidenceValidator = v.union(
  v.literal("high"),
  v.literal("medium"),
  v.literal("low"),
);

export const notificationKindValidator = v.union(
  v.literal("invitation"),
  v.literal("accepted"),
  v.literal("confirmed"),
  v.literal("expired"),
  v.literal("cancelled"),
  v.literal("searching"),
  v.literal("research_done"),
  v.literal("reminder"),
  v.literal("safety"),
  v.literal("message"),
  v.literal("system"),
);
