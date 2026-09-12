import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import {
  aiPurposeValidator,
  agentQuestionCategoryValidator,
  agentQuestionStatusValidator,
  agentDecisionCodeValidator,
  alcoholValidator,
  atmosphereValidator,
  dayPreferenceValidator,
  emailKindValidator,
  genderValidator,
  indoorOutdoorValidator,
  moderationStatusValidator,
  notificationKindValidator,
  profileStatusValidator,
  photoVisibilityValidator,
  preferenceStrengthValidator,
  relationshipIntentValidator,
  reportCategoryValidator,
  reportStatusValidator,
  smokingValidator,
  socialEnergyValidator,
} from "./lib/enums";
import { agentAvatarValidator } from "./lib/agentAvatar";
import { reflectionValidator, sceneKindValidator } from "./lib/dateStory";
import { dateActivityValidator } from "./lib/dateActivity";

export default defineSchema({
  // ---- auth (users, authAccounts, authSessions, ...) -------------------
  ...authTables,

  // ---- profile ---------------------------------------------------------
  profiles: defineTable({
    userId: v.id("users"),

    /** User-selected product/email locale. Optional while existing rows migrate. */
    preferredLocale: v.optional(v.string()),

    displayName: v.string(),
    /** Private. Never returned to another user. */
    dobMs: v.number(),
    /** Denormalised age, refreshed daily by cron so queries never read the clock. */
    ageYears: v.number(),
    ageConfirmed18: v.boolean(),

    gender: genderValidator,
    pronouns: v.optional(v.string()),
    interestedIn: v.array(genderValidator),

    countryCode: v.string(),
    city: v.string(),
    /** District / neighbourhood — the coarsest useful unit. This IS shown to matches. */
    neighborhood: v.string(),
    /** Approximate centroid, rounded to ~1km. Never exposed to another user. */
    approxLat: v.number(),
    approxLng: v.number(),
    timezone: v.string(),

    bio: v.string(),
    /** Optional self-described traits. These are safer than a numeric beauty rank. */
    personalityTraits: v.optional(v.array(v.string())),
    styleTags: v.optional(v.array(v.string())),
    profileTruthConfirmed: v.optional(v.boolean()),
    occupationCategory: v.optional(v.string()),
    showOccupation: v.boolean(),
    interests: v.array(v.string()),
    hobbies: v.array(v.string()),
    languages: v.array(v.string()),
    socialEnergy: socialEnergyValidator,
    firstDateVibe: v.array(v.string()),
    lifestyle: v.object({
      smokes: v.boolean(),
      drinks: alcoholValidator,
      exercise: v.optional(v.string()),
      earlyBird: v.optional(v.boolean()),
    }),

    /** Optional. Visibility is controlled separately and defaults to after accept. */
    photoStorageId: v.optional(v.id("_storage")),
    photoVisibility: v.optional(photoVisibilityValidator),

    onboardingStep: v.number(),
    onboardingComplete: v.boolean(),
    status: profileStatusValidator,
    moderationStatus: moderationStatusValidator,
    /** True for seeded demo personas. Demo and real users never match each other
     *  unless the real user is themselves in demo mode. */
    isDemo: v.boolean(),

    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status_and_city", ["status", "city"])
    .index("by_demo_and_status", ["isDemo", "status"]),

  // ---- dating preferences ---------------------------------------------
  preferences: defineTable({
    userId: v.id("users"),

    /** Explicit geographic boundary for Agent discovery. Optional only for
     *  legacy rows; real matching rejects incomplete boundaries. */
    matchLocationScope: v.optional(
      v.union(
        v.literal("area"),
        v.literal("city"),
        v.literal("selected_cities"),
      ),
    ),
    preferredCountryCodes: v.optional(v.array(v.string())),
    preferredCities: v.optional(v.array(v.string())),
    /** Translation is used only when both people explicitly enable it. */
    allowTranslatedDates: v.optional(v.boolean()),

    ageMin: v.number(),
    ageMax: v.number(),
    ageHard: v.boolean(),

    maxDistanceKm: v.number(),
    distanceHard: v.boolean(),
    /** Neighbourhoods where this person is comfortable having the date. */
    preferredAreas: v.optional(v.array(v.string())),
    areaHard: v.optional(v.boolean()),

    relationshipIntent: relationshipIntentValidator,
    /** Restrict to the exact chosen goal; incompatible goals are always excluded. */
    intentHard: v.boolean(),

    smoking: smokingValidator,
    smokingHard: v.boolean(),

    alcohol: alcoholValidator,
    alcoholHard: v.boolean(),

    preferredDateTypes: v.array(v.string()),
    preferredPersonalityTraits: v.optional(v.array(v.string())),
    personalityPreference: v.optional(preferenceStrengthValidator),
    preferredStyleTags: v.optional(v.array(v.string())),
    stylePreference: v.optional(preferenceStrengthValidator),
    budgetMinPerPerson: v.number(),
    budgetMaxPerPerson: v.number(),
    currency: v.string(),
    budgetHard: v.boolean(),

    dayPreference: dayPreferenceValidator,
    indoorOutdoor: indoorOutdoorValidator,
    atmosphere: atmosphereValidator,
    dietary: v.array(v.string()),
    accessibility: v.array(v.string()),

    notifyEmail: v.boolean(),
    notifyInvitations: v.boolean(),
    notifyConfirmations: v.boolean(),
    notifyReminders: v.boolean(),

    /** Instant "stop finding dates for me" switch. */
    dropsPaused: v.boolean(),
    maxDropsPerWeek: v.number(),
    /** Demo personas are fictional and clearly labelled. Users can opt out of
     *  being matched with them at any time. */
    allowDemoMatches: v.boolean(),

    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // ---- personal dating agents ----------------------------------------
  /** Private instructions and user-approved public traits for the user's AI Agent. */
  agentProfiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    /** A user-built visual identity for the Agent. Optional during rollout. */
    avatar: v.optional(agentAvatarValidator),
    /** The user's own description. Private to their agent. */
    essence: v.string(),
    desiredConnection: v.string(),
    boundaries: v.array(v.string()),
    voice: v.union(
      v.literal("warm"),
      v.literal("playful"),
      v.literal("direct"),
      v.literal("quiet"),
    ),
    autonomy: v.union(
      v.literal("observe"),
      v.literal("suggest"),
      v.literal("advocate"),
    ),
    /** Compact private memory learned from human-agent conversations. */
    privateMemory: v.string(),
    /** Human message being learned; prevents a new encounter racing feedback. */
    pendingReplyTo: v.optional(v.id("agentMessages")),
    /** When the fence went up, so a lost reply cannot block dating forever. */
    pendingReplyAt: v.optional(v.number()),
    /** Idempotency fence for retried or out-of-order model replies. */
    lastReplyTo: v.optional(v.id("agentMessages")),
    /** Compact lessons from the Agent's own private date verdicts. */
    scoutingMemory: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("paused")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  /** Conversations are only between a person and their own agent. */
  agentMessages: defineTable({
    userId: v.id("users"),
    /** Present when this message discusses one of the user's Agent dates. */
    agentDateId: v.optional(v.id("agentDates")),
    /** Owner-only coaching attached to a saved public utterance. */
    feedbackTarget: v.optional(v.union(v.literal("self"), v.literal("counterpart"))),
    turnRound: v.optional(v.number()),
    replyTo: v.optional(v.id("agentMessages")),
    role: v.union(v.literal("human"), v.literal("agent")),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_user_and_created", ["userId", "createdAt"])
    .index("by_user_and_date_and_created", ["userId", "agentDateId", "createdAt"])
    .index("by_user_role_created", ["userId", "role", "createdAt"]),

  /**
   * A change to what the Agent looks for, proposed by the Agent and decided by
   * its owner.
   *
   * Learning that only changes how the Agent talks is not learning the owner
   * can feel: the matcher reads structured taste, so a shifted ideal has to
   * reach these fields to change who the Agent actually meets. It reaches them
   * only through an explicit yes — an Agent that quietly rewrote its owner's
   * stated preferences would be deciding for them.
   *
   * Deliberately limited to taste. Boundaries — age, distance, location,
   * language, budget, smoking and alcohol — are the owner's to set and are
   * never proposed here.
   */
  agentProposals: defineTable({
    userId: v.id("users"),
    /** The date whose debrief prompted this, when one did. */
    agentDateId: v.optional(v.id("agentDates")),
    /** Why, in the Agent's voice and the owner's language. */
    reason: v.string(),
    preferredPersonalityTraits: v.optional(v.array(v.string())),
    personalityPreference: v.optional(preferenceStrengthValidator),
    relationshipIntent: v.optional(relationshipIntentValidator),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("superseded"),
    ),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_user_and_status", ["userId", "status"])
    .index("by_user_and_created", ["userId", "createdAt"]),

  /** Private, periodic prompts through which an Agent learns its owner. */
  agentQuestions: defineTable({
    userId: v.id("users"),
    category: agentQuestionCategoryValidator,
    prompt: v.string(),
    locale: v.string(),
    status: agentQuestionStatusValidator,
    askedAt: v.number(),
    answeredAt: v.optional(v.number()),
  })
    .index("by_user_and_status", ["userId", "status"])
    .index("by_user_and_asked", ["userId", "askedAt"]),

  /** A simulated date between two explicitly-labelled AI proxies. */
  agentDates: defineTable({
    initiatorUserId: v.id("users"),
    counterpartUserId: v.id("users"),
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("debrief_ready"),
      v.literal("connected"),
      v.literal("closed"),
      v.literal("failed"),
    ),
    /** Real matches unfold naturally; labelled demo matches compress the waits. */
    paceMode: v.optional(v.union(v.literal("demo"), v.literal("natural"))),
    /** Locale selected by the initiating human; both Agents share it in-world. */
    locale: v.optional(v.string()),
    activity: v.optional(
      v.union(
        v.literal("arriving"),
        v.literal("reading"),
        v.literal("thinking"),
        v.literal("wandering"),
        v.literal("wrapping_up"),
      ),
    ),
    nextTurnAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    /** Re-review a completed failed transcript without restarting its encounter. */
    reviewRetryStartedAt: v.optional(v.number()),
    reviewRetryCount: v.optional(v.number()),
    reviewRecoveredAt: v.optional(v.number()),
    setting: v.string(),
    sceneKind: v.optional(sceneKindValidator),
    sceneSituation: v.optional(v.string()),
    /** Legacy 6/10-turn records remain readable; new encounters allow 12/16. */
    plannedTurns: v.optional(v.union(v.literal(6), v.literal(10), v.literal(12), v.literal(16))),
    activityJournal: v.optional(dateActivityValidator),
    /** A participant chose to end; allow one reply, then review this encounter. */
    closingAfterRound: v.optional(v.number()),
    initiatorFollowup: v.optional(v.string()),
    counterpartFollowup: v.optional(v.string()),
    isSearchEncounter: v.optional(v.boolean()),
    worldSourceTitle: v.optional(v.string()),
    worldSourceUrl: v.optional(v.string()),
    compatibilityScore: v.number(),
    summary: v.string(),
    sparks: v.array(v.string()),
    frictions: v.array(v.string()),
    initiatorVerdict: v.union(
      v.literal("pending"),
      v.literal("encourage"),
      v.literal("curious"),
      v.literal("pass"),
    ),
    counterpartVerdict: v.union(
      v.literal("pending"),
      v.literal("encourage"),
      v.literal("curious"),
      v.literal("pass"),
    ),
    initiatorReason: v.string(),
    counterpartReason: v.string(),
    initiatorReflection: v.optional(reflectionValidator),
    counterpartReflection: v.optional(reflectionValidator),
    /** Private structured explanations. Only the owning side is projected. */
    initiatorDecisionCode: v.optional(agentDecisionCodeValidator),
    counterpartDecisionCode: v.optional(agentDecisionCodeValidator),
    initiatorNextSearchNote: v.optional(v.string()),
    counterpartNextSearchNote: v.optional(v.string()),
    initiatorConsent: v.union(
      v.literal("pending"),
      v.literal("yes"),
      v.literal("no"),
    ),
    counterpartConsent: v.union(
      v.literal("pending"),
      v.literal("yes"),
      v.literal("no"),
    ),
    isDemoCounterpart: v.boolean(),
    demoLetterQueued: v.optional(v.boolean()),
    /** Public, explainable reasons these proxies crossed paths. No raw score. */
    scoutSignals: v.optional(v.array(v.string())),
    failureReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_initiator", ["initiatorUserId"])
    .index("by_counterpart", ["counterpartUserId"])
    .index("by_initiator_and_counterpart", [
      "initiatorUserId",
      "counterpartUserId",
    ])
    .index("by_status", ["status"]),

  /** One explicitly reviewed fictional recording for the public entry point. */
  showcasePublications: defineTable({
    slot: v.literal("main"),
    agentDateId: v.id("agentDates"),
    publishedAt: v.number(),
  }).index("by_slot", ["slot"]),

  agentSearches: defineTable({
    userId: v.id("users"),
    status: v.union(v.literal("searching"), v.literal("waiting"), v.literal("talking"), v.literal("match_ready"), v.literal("paused"), v.literal("connected"), v.literal("retrying")),
    accessMode: v.union(v.literal("demo"), v.literal("subscription")),
    revision: v.number(),
    currentDateId: v.optional(v.id("agentDates")),
    nextCheckAt: v.optional(v.number()),
    lastCheckedAt: v.optional(v.number()),
    cityIndex: v.number(),
    cursor: v.union(v.string(), v.null()),
    encountersCompleted: v.number(),
    startedAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  agentDateTurns: defineTable({
    agentDateId: v.id("agentDates"),
    round: v.number(),
    speakerUserId: v.id("users"),
    speakerAgentName: v.string(),
    content: v.string(),
    subtext: v.string(),
    createdAt: v.number(),
  }).index("by_date_and_round", ["agentDateId", "round"]),

  /** First-party growth events. Never store profile text or sensitive traits here. */
  growthEvents: defineTable({
    userId: v.optional(v.id("users")),
    anonymousId: v.optional(v.string()),
    event: v.string(),
    city: v.optional(v.string()),
    locale: v.optional(v.string()),
    source: v.optional(v.string()),
    campaign: v.optional(v.string()),
    agentDateId: v.optional(v.id("agentDates")),
    createdAt: v.number(),
  })
    .index("by_event", ["event"])
    .index("by_event_and_created", ["event", "createdAt"])
    .index("by_user", ["userId"])
    .index("by_date", ["agentDateId"]),

  // ---- legal acknowledgement -----------------------------------------
  /** Versioned proof of the documents a user accepted. One record per user. */
  legalConsents: defineTable({
    userId: v.id("users"),
    termsVersion: v.string(),
    privacyVersion: v.string(),
    communityVersion: v.string(),
    acceptedAt: v.number(),
    ageConfirmed: v.boolean(),
    locale: v.string(),
  }).index("by_user", ["userId"]),

  // ---- safety ----------------------------------------------------------
  blocks: defineTable({
    blockerUserId: v.id("users"),
    blockedUserId: v.id("users"),
    reason: v.optional(v.string()),
  })
    .index("by_blocker", ["blockerUserId"])
    .index("by_blocked", ["blockedUserId"])
    .index("by_pair", ["blockerUserId", "blockedUserId"]),

  reports: defineTable({
    reporterUserId: v.id("users"),
    reportedUserId: v.id("users"),
    agentDateId: v.optional(v.id("agentDates")),
    category: reportCategoryValidator,
    details: v.string(),
    status: reportStatusValidator,
    alsoBlocked: v.boolean(),
    resolutionNote: v.optional(v.string()),
  })
    .index("by_reporter", ["reporterUserId"])
    .index("by_reported", ["reportedUserId"])
    .index("by_status", ["status"]),

  // ---- AI observability -----------------------------------------------
  aiRuns: defineTable({
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
  })
    .index("by_purpose", ["purpose"])
    .index("by_agent_date", ["agentDateId"]),

  // ---- comms -----------------------------------------------------------
  /** Retained for earlier development rows. New demo attempts never send mail. */
  demoDebriefBatches: defineTable({
    userId: v.id("users"),
    latestDateId: v.id("agentDates"),
    count: v.number(),
    pending: v.boolean(),
    sendAfter: v.number(),
    lastSentAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  notifications: defineTable({
    userId: v.id("users"),
    kind: notificationKindValidator,
    title: v.string(),
    body: v.string(),
    href: v.optional(v.string()),
    read: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "read"]),

  emailMessages: defineTable({
    userId: v.optional(v.id("users")),
    kind: emailKindValidator,
    toAddress: v.string(),
    fromAddress: v.string(),
    subject: v.string(),
    agentMailMessageId: v.optional(v.string()),
    agentMailThreadId: v.optional(v.string()),
    status: v.union(
      v.literal("sent"),
      v.literal("failed"),
      v.literal("skipped_preference"),
      v.literal("skipped_no_provider"),
    ),
    error: v.optional(v.string()),
    sentAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_thread", ["agentMailThreadId"]),

  agentMailEvents: defineTable({
    /** Provider event id — the idempotency key. */
    eventId: v.string(),
    eventType: v.string(),
    inboxId: v.optional(v.string()),
    threadId: v.optional(v.string()),
    messageId: v.optional(v.string()),
    fromAddress: v.optional(v.string()),
    toAddress: v.optional(v.string()),
    subject: v.optional(v.string()),
    preview: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    signatureVerified: v.boolean(),
    processed: v.boolean(),
    processingError: v.optional(v.string()),
    receivedAt: v.number(),
    processedAt: v.optional(v.number()),
    rawPreview: v.string(),
  })
    .index("by_event_id", ["eventId"])
    .index("by_thread", ["threadId"])
    .index("by_user", ["userId"])
    .index("by_processed", ["processed"]),

  auditEvents: defineTable({
    actorType: v.union(v.literal("user"), v.literal("system")),
    actorUserId: v.optional(v.id("users")),
    action: v.string(),
    agentDateId: v.optional(v.id("agentDates")),
    targetUserId: v.optional(v.id("users")),
    detail: v.string(),
  })
    .index("by_actor", ["actorUserId"])
    .index("by_action", ["action"]),

  /** Resume points for cron sweeps that are larger than one transaction. */
  jobCursors: defineTable({
    job: v.string(),
    cursor: v.union(v.string(), v.null()),
    updatedAt: v.number(),
  }).index("by_job", ["job"]),

  /** Rate limiting for expensive user-triggered work. */
  rateLimits: defineTable({
    key: v.string(),
    windowStartMs: v.number(),
    count: v.number(),
  }).index("by_key", ["key"]),

  /** Static frontend served from this deployment's *.convex.site domain. */
  siteAssets: defineTable({
    path: v.string(),
    storageId: v.id("_storage"),
    contentType: v.string(),
    size: v.number(),
    hash: v.string(),
    immutable: v.boolean(),
    buildId: v.string(),
  })
    .index("by_path", ["path"])
    .index("by_build", ["buildId"]),
});
