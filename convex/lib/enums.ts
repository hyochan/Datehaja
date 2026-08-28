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
);

export const aiPurposeValidator = v.union(
  v.literal("rank_candidates"),
  v.literal("build_plan"),
  v.literal("compat_blurb"),
  v.literal("venue_summary"),
  v.literal("moderation"),
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
