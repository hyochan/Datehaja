import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import {
  aiPurposeValidator,
  alcoholValidator,
  atmosphereValidator,
  availabilityStatusValidator,
  confidenceValidator,
  dayPreferenceValidator,
  dropStatusValidator,
  emailKindValidator,
  genderValidator,
  indoorOutdoorValidator,
  moderationStatusValidator,
  notificationKindValidator,
  participantStateValidator,
  passReasonValidator,
  profileStatusValidator,
  relationshipIntentValidator,
  reportCategoryValidator,
  reportStatusValidator,
  smokingValidator,
  socialEnergyValidator,
} from "./lib/enums";

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

    /** Optional. Only revealed to the other participant after BOTH accept. */
    photoStorageId: v.optional(v.id("_storage")),

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

    relationshipIntent: relationshipIntentValidator,
    intentHard: v.boolean(),

    smoking: smokingValidator,
    smokingHard: v.boolean(),

    alcohol: alcoholValidator,
    alcoholHard: v.boolean(),

    preferredDateTypes: v.array(v.string()),
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

    /** Instant "stop sending me DateDrops" switch. */
    dropsPaused: v.boolean(),
    maxDropsPerWeek: v.number(),
    /** Demo personas are fictional and clearly labelled. Users can opt out of
     *  being matched with them at any time. */
    allowDemoMatches: v.boolean(),

    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // ---- availability ----------------------------------------------------
  availability: defineTable({
    userId: v.id("users"),
    startMs: v.number(),
    endMs: v.number(),
    timezone: v.string(),
    status: availabilityStatusValidator,
    heldByDropId: v.optional(v.id("dateDrops")),
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
    dropId: v.optional(v.id("dateDrops")),
    category: reportCategoryValidator,
    details: v.string(),
    status: reportStatusValidator,
    alsoBlocked: v.boolean(),
    resolutionNote: v.optional(v.string()),
  })
    .index("by_reporter", ["reporterUserId"])
    .index("by_reported", ["reportedUserId"])
    .index("by_status", ["status"]),

  // ---- matching --------------------------------------------------------
  matchingRuns: defineTable({
    initiatorUserId: v.id("users"),
    availabilityId: v.optional(v.id("availability")),
    dropId: v.optional(v.id("dateDrops")),
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
      overlapMinutes: v.number(),
      overlapStartMs: v.number(),
      overlapEndMs: v.number(),
      budgetOverlap: v.boolean(),
      budgetLowPerPerson: v.number(),
      budgetHighPerPerson: v.number(),
      sharedDateTypes: v.array(v.string()),
      styleMatch: v.number(),
      lifestyleMatch: v.number(),
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

  // ---- the DateDrop ----------------------------------------------------
  dateDrops: defineTable({
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
    .index("by_initiator", ["initiatorUserId"]),

  dateDropParticipants: defineTable({
    dropId: v.id("dateDrops"),
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

  // ---- research (Firecrawl) -------------------------------------------
  researchRuns: defineTable({
    provider: v.string(),
    dropId: v.optional(v.id("dateDrops")),
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
    dropId: v.optional(v.id("dateDrops")),
    userId: v.optional(v.id("users")),
    matchingRunId: v.optional(v.id("matchingRuns")),
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
    .index("by_matching_run", ["matchingRunId"]),

  // ---- comms -----------------------------------------------------------
  notifications: defineTable({
    userId: v.id("users"),
    kind: notificationKindValidator,
    title: v.string(),
    body: v.string(),
    dropId: v.optional(v.id("dateDrops")),
    href: v.optional(v.string()),
    read: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "read"]),

  emailMessages: defineTable({
    userId: v.optional(v.id("users")),
    dropId: v.optional(v.id("dateDrops")),
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
    dropId: v.optional(v.id("dateDrops")),
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
    dropId: v.id("dateDrops"),
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
    dropId: v.optional(v.id("dateDrops")),
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
