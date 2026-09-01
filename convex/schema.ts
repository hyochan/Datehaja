import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import type { GenericId, VId } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import {
  aiPurposeValidator,
  agentQuestionCategoryValidator,
  agentQuestionStatusValidator,
  agentDecisionCodeValidator,
  alcoholValidator,
  atmosphereValidator,
  availabilityStatusValidator,
  confidenceValidator,
  dateOutcomeValidator,
  dateSafetyValidator,
  dayPreferenceValidator,
  dropStatusValidator,
  emailKindValidator,
  genderValidator,
  indoorOutdoorValidator,
  moderationStatusValidator,
  connectionQualityValidator,
  meetAgainValidator,
  notificationKindValidator,
  participantStateValidator,
  passReasonValidator,
  profileStatusValidator,
  photoVisibilityValidator,
  preferenceStrengthValidator,
  profileAccuracyValidator,
  relationshipIntentValidator,
  reportCategoryValidator,
  reportStatusValidator,
  respectValidator,
  smokingValidator,
  socialEnergyValidator,
} from "./lib/enums";
import { agentAvatarValidator } from "./lib/agentAvatar";

/**
 * Runtime-compatible validator for references created before dateDrops was
 * renamed to datePlans. The cast deliberately keeps new application code
 * typed to datePlans while Convex can continue validating immutable legacy
 * production history. All current writers emit datePlans IDs only.
 */
const datePlanIdValidator = v.union(
  v.id("datePlans"),
  v.id("dateDrops"),
) as unknown as VId<GenericId<"datePlans">>;

export default defineSchema({
  // ---- auth (users, authAccounts, authSessions, ...) -------------------
  ...authTables,

  // ---- profile ---------------------------------------------------------
  profiles: defineTable({
    userId: v.id("users"),

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

    ageMin: v.number(),
    ageMax: v.number(),
    ageHard: v.boolean(),

    maxDistanceKm: v.number(),
    distanceHard: v.boolean(),
    /** Neighbourhoods where this person is comfortable having the date. */
    preferredAreas: v.optional(v.array(v.string())),
    areaHard: v.optional(v.boolean()),

    relationshipIntent: relationshipIntentValidator,
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
    role: v.union(v.literal("human"), v.literal("agent")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_user_and_created", ["userId", "createdAt"]),

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
    setting: v.string(),
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
    /** Public, explainable reasons these proxies crossed paths. No raw score. */
    scoutSignals: v.optional(v.array(v.string())),
    failureReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_initiator", ["initiatorUserId"])
    .index("by_counterpart", ["counterpartUserId"])
    .index("by_status", ["status"]),

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

  // ---- availability ----------------------------------------------------
  availability: defineTable({
    userId: v.id("users"),
    startMs: v.number(),
    endMs: v.number(),
    timezone: v.string(),
    status: availabilityStatusValidator,
    heldByDropId: v.optional(datePlanIdValidator),
    note: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_start", ["userId", "startMs"])
    .index("by_status_and_start", ["status", "startMs"])
    .index("by_drop", ["heldByDropId"]),

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
    dropId: v.optional(datePlanIdValidator),
    category: reportCategoryValidator,
    details: v.string(),
    status: reportStatusValidator,
    alsoBlocked: v.boolean(),
    resolutionNote: v.optional(v.string()),
  })
    .index("by_reporter", ["reporterUserId"])
    .index("by_reported", ["reportedUserId"])
    .index("by_status", ["status"]),

  /** Optional private safety setup. Never returned to another user. */
  safetyProfiles: defineTable({
    userId: v.id("users"),
    trustedContactName: v.optional(v.string()),
    trustedContactEmail: v.optional(v.string()),
    trustedContactConsent: v.boolean(),
    postDateCheckIn: v.boolean(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  /** A user-triggered copy of a confirmed plan sent to their trusted contact. */
  safetyPlanShares: defineTable({
    userId: v.id("users"),
    dropId: datePlanIdValidator,
    status: v.union(
      v.literal("queued"),
      v.literal("sent"),
      v.literal("failed"),
      v.literal("skipped_no_provider"),
    ),
    error: v.optional(v.string()),
    sentAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_drop_and_user", ["dropId", "userId"]),

  // ---- matching --------------------------------------------------------
  matchingRuns: defineTable({
    initiatorUserId: v.id("users"),
    availabilityId: v.optional(v.id("availability")),
    dropId: v.optional(datePlanIdValidator),
    /** "seeking_second" when re-matching after a pass. */
    intent: v.union(v.literal("new_drop"), v.literal("seeking_second")),
    stage: v.union(
      v.literal("hard_filter"),
      v.literal("scoring"),
      v.literal("ai_ranking"),
      v.literal("research"),
      v.literal("planning"),
      v.literal("inviting"),
      v.literal("done"),
      v.literal("failed"),
    ),
    status: v.union(
      v.literal("running"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("no_candidates"),
    ),
    poolSize: v.number(),
    hardPassCount: v.number(),
    scoredCount: v.number(),
    aiRankedCount: v.number(),
    error: v.optional(v.string()),
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
  })
    .index("by_initiator", ["initiatorUserId"])
    .index("by_drop", ["dropId"])
    .index("by_status", ["status"]),

  candidateScores: defineTable({
    runId: v.id("matchingRuns"),
    /** Lexicographically ordered so a pair is only stored one way. */
    userAId: v.id("users"),
    userBId: v.id("users"),
    deterministicScore: v.number(),
    signals: v.object({
      sharedInterests: v.array(v.string()),
      sharedLanguages: v.array(v.string()),
      distanceKm: v.number(),
      sharedAreas: v.optional(v.array(v.string())),
      areaMatch: v.optional(v.number()),
      overlapMinutes: v.number(),
      overlapStartMs: v.number(),
      overlapEndMs: v.number(),
      budgetOverlap: v.boolean(),
      budgetLowPerPerson: v.number(),
      budgetHighPerPerson: v.number(),
      sharedDateTypes: v.array(v.string()),
      styleMatch: v.number(),
      lifestyleMatch: v.number(),
      personalityMatch: v.optional(v.number()),
      tasteMatch: v.optional(v.number()),
      trustMatch: v.optional(v.number()),
    }),
    aiScore: v.optional(v.number()),
    aiRationale: v.optional(v.string()),
    aiFriction: v.optional(v.string()),
    aiSuggestedDateType: v.optional(v.string()),
    aiRunId: v.optional(v.id("aiRuns")),
    stage: v.union(
      v.literal("scored"),
      v.literal("ai_ranked"),
      v.literal("selected"),
      v.literal("rejected"),
    ),
    rejectionReason: v.optional(v.string()),
  })
    .index("by_run", ["runId"])
    .index("by_run_and_stage", ["runId", "stage"])
    .index("by_userA", ["userAId"])
    .index("by_userB", ["userBId"]),

  // ---- date plans ------------------------------------------------------
  datePlans: defineTable({
    status: dropStatusValidator,
    initiatorUserId: v.id("users"),

    countryCode: v.string(),
    city: v.string(),
    area: v.string(),
    approxLat: v.number(),
    approxLng: v.number(),
    timezone: v.string(),

    startMs: v.number(),
    endMs: v.number(),

    title: v.string(),
    theme: v.string(),
    summary: v.string(),
    whyItFits: v.string(),
    itinerary: v.array(
      v.object({
        order: v.number(),
        venueId: v.optional(v.id("venues")),
        venueName: v.string(),
        category: v.string(),
        startOffsetMin: v.number(),
        durationMin: v.number(),
        address: v.string(),
        note: v.string(),
        mapsQuery: v.string(),
        sourceUrl: v.optional(v.string()),
        confidence: confidenceValidator,
      }),
    ),
    estimatedDurationMin: v.number(),
    estimatedCostPerPerson: v.number(),
    currency: v.string(),
    meetingInstructions: v.string(),

    researchRunId: v.optional(v.id("researchRuns")),
    planAiRunId: v.optional(v.id("aiRuns")),
    matchingRunId: v.optional(v.id("matchingRuns")),

    confirmDeadlineMs: v.number(),
    candidateAttempts: v.number(),
    maxCandidateAttempts: v.number(),

    confirmedAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
    cancelledByUserId: v.optional(v.id("users")),
    cancelReason: v.optional(v.string()),
    expiredAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    /** Set only when both private post-date answers are an explicit yes. */
    mutualMeetAgainAt: v.optional(v.number()),
    failureReason: v.optional(v.string()),

    isDemo: v.boolean(),
    /** Set once reminders have been queued, so a backlog drains instead of the
     *  sweep re-picking the same soonest batch every run. */
    remindersQueuedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_status_and_deadline", ["status", "confirmDeadlineMs"])
    .index("by_status_and_start", ["status", "startMs"])
    .index("by_status_and_end", ["status", "endMs"])
    .index("by_initiator", ["initiatorUserId"]),

  datePlanParticipants: defineTable({
    dropId: datePlanIdValidator,
    userId: v.id("users"),
    role: v.union(v.literal("initiator"), v.literal("invitee")),
    state: participantStateValidator,

    /** Personalised, privacy-safe reasoning shown to THIS participant. */
    privateWhyItFits: v.string(),
    compatibilityBlurb: v.string(),
    candidateScoreId: v.optional(v.id("candidateScores")),
    availabilityId: v.optional(v.id("availability")),

    invitedAt: v.number(),
    viewedAt: v.optional(v.number()),
    respondedAt: v.optional(v.number()),
    /** Set the first time this participant accepts, so a calendar feed can
     *  preserve a later cancellation without adding declined invitations. */
    calendarReservedAt: v.optional(v.number()),
    passReason: v.optional(passReasonValidator),
    attendanceConfirmed: v.optional(v.boolean()),

    emailMessageId: v.optional(v.string()),
    emailThreadId: v.optional(v.string()),
    expiryNotified: v.optional(v.boolean()),
    reminderSentAt: v.optional(v.number()),
  })
    .index("by_drop", ["dropId"])
    .index("by_user", ["userId"])
    .index("by_user_and_state", ["userId", "state"])
    .index("by_drop_and_user", ["dropId", "userId"])
    .index("by_thread", ["emailThreadId"]),

  /** Private post-date response. It is never shown to the other participant. */
  dateFeedback: defineTable({
    dropId: datePlanIdValidator,
    userId: v.id("users"),
    /** Counterpart being reviewed. Optional for legacy feedback rows. */
    reviewedUserId: v.optional(v.id("users")),
    outcome: dateOutcomeValidator,
    safety: dateSafetyValidator,
    meetAgain: meetAgainValidator,
    profileAccuracy: v.optional(profileAccuracyValidator),
    respectful: v.optional(respectValidator),
    connection: v.optional(connectionQualityValidator),
    venueRating: v.optional(v.number()),
    note: v.optional(v.string()),
    followUpRequested: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_drop", ["dropId"])
    .index("by_user", ["userId"])
    .index("by_reviewed_user", ["reviewedUserId"])
    .index("by_drop_and_user", ["dropId", "userId"]),

  /** Secret capability URL for a user's read-only iCalendar subscription. */
  calendarFeeds: defineTable({
    userId: v.id("users"),
    token: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_token", ["token"]),

  // ---- research (Firecrawl) -------------------------------------------
  researchRuns: defineTable({
    provider: v.string(),
    dropId: v.optional(datePlanIdValidator),
    requestedByUserId: v.optional(v.id("users")),
    query: v.object({
      city: v.string(),
      area: v.string(),
      whenIso: v.string(),
      timezone: v.string(),
      budgetMin: v.number(),
      budgetMax: v.number(),
      currency: v.string(),
      interests: v.array(v.string()),
      dateTypes: v.array(v.string()),
      dateIdea: v.optional(v.string()),
      vibe: v.string(),
      dietary: v.array(v.string()),
      accessibility: v.array(v.string()),
      indoorOutdoor: v.string(),
      desiredDurationMin: v.number(),
    }),
    status: v.union(
      v.literal("running"),
      v.literal("succeeded"),
      v.literal("partial"),
      v.literal("failed"),
    ),
    calls: v.array(
      v.object({
        endpoint: v.string(),
        query: v.string(),
        httpStatus: v.number(),
        ms: v.number(),
        resultCount: v.number(),
        error: v.optional(v.string()),
      }),
    ),
    venueCount: v.number(),
    sourceUrls: v.array(v.string()),
    error: v.optional(v.string()),
    live: v.boolean(),
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
  })
    .index("by_drop", ["dropId"])
    .index("by_status", ["status"]),

  venues: defineTable({
    researchRunId: v.id("researchRuns"),
    name: v.string(),
    category: v.string(),
    address: v.string(),
    district: v.string(),
    city: v.string(),
    countryCode: v.string(),
    sourceUrl: v.string(),
    officialUrl: v.optional(v.string()),
    openingHours: v.optional(v.string()),
    approximatePrice: v.optional(v.string()),
    priceLevel: v.optional(v.number()),
    reservationNeeded: v.optional(v.boolean()),
    /** Verbatim snippet from the crawled page that supports the above. */
    evidence: v.string(),
    tags: v.array(v.string()),
    mapsQuery: v.string(),
    confidence: confidenceValidator,
    researchedAt: v.number(),
  })
    .index("by_research_run", ["researchRunId"])
    .index("by_city_and_category", ["city", "category"]),

  // ---- AI observability -----------------------------------------------
  aiRuns: defineTable({
    purpose: aiPurposeValidator,
    model: v.string(),
    endpoint: v.string(),
    dropId: v.optional(datePlanIdValidator),
    userId: v.optional(v.id("users")),
    matchingRunId: v.optional(v.id("matchingRuns")),
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
    .index("by_drop", ["dropId"])
    .index("by_purpose", ["purpose"])
    .index("by_matching_run", ["matchingRunId"])
    .index("by_agent_date", ["agentDateId"]),

  // ---- comms -----------------------------------------------------------
  notifications: defineTable({
    userId: v.id("users"),
    kind: notificationKindValidator,
    title: v.string(),
    body: v.string(),
    dropId: v.optional(datePlanIdValidator),
    href: v.optional(v.string()),
    read: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "read"]),

  emailMessages: defineTable({
    userId: v.optional(v.id("users")),
    dropId: v.optional(datePlanIdValidator),
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
    .index("by_drop", ["dropId"])
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
    dropId: v.optional(datePlanIdValidator),
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

  /** Deliberately constrained pre-date logistics. Not a chat app. */
  dateMessages: defineTable({
    dropId: datePlanIdValidator,
    fromUserId: v.id("users"),
    presetKey: v.string(),
    body: v.string(),
    readByUserIds: v.array(v.id("users")),
  })
    .index("by_drop", ["dropId"])
    .index("by_drop_and_from", ["dropId", "fromUserId"]),

  auditEvents: defineTable({
    actorType: v.union(v.literal("user"), v.literal("system")),
    actorUserId: v.optional(v.id("users")),
    action: v.string(),
    dropId: v.optional(datePlanIdValidator),
    targetUserId: v.optional(v.id("users")),
    detail: v.string(),
  })
    .index("by_drop", ["dropId"])
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
