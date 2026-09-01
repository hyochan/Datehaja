import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import {
  currentUserId,
  getPreferencesByUser,
  getProfileByUser,
  recordAudit,
  requireProfile,
  requireUserId,
} from "./lib/authz";
import {
  ACCESSIBILITY_OPTIONS,
  defaultBudgetRange,
  DATE_TYPE_KEYS,
  DIETARY_OPTIONS,
  FIRST_DATE_VIBE_OPTIONS,
  HOBBY_OPTIONS,
  INTEREST_OPTIONS,
  LANGUAGE_OPTIONS,
  OCCUPATION_CATEGORIES,
  PERSONALITY_TRAIT_OPTIONS,
  STYLE_TAG_OPTIONS,
  findCity,
  findNeighborhood,
} from "./lib/catalog";
import {
  alcoholValidator,
  atmosphereValidator,
  dayPreferenceValidator,
  genderValidator,
  indoorOutdoorValidator,
  photoVisibilityValidator,
  preferenceStrengthValidator,
  relationshipIntentValidator,
  smokingValidator,
  socialEnergyValidator,
} from "./lib/enums";
import { coarsen } from "./lib/geo";
import { containsContactInfo, redactContactInfo } from "./lib/privacy";
import { LIMITS, clean, cleanMultiline, pickFrom } from "./lib/text";
import { MAX_AGE, MIN_AGE, ageOn } from "./lib/age";
import { legalVersionsMatch } from "./lib/legal";
import { isSupportedLocale } from "./lib/locales";
import { normaliseMatchingBoundaryInput } from "./lib/matchingPreferenceInput";

/* ------------------------------- queries -------------------------------- */

export const me = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      userId: v.id("users"),
      email: v.union(v.string(), v.null()),
      profile: v.union(v.null(), v.any()),
      preferences: v.union(v.null(), v.any()),
      hasAvailability: v.boolean(),
      photoUrl: v.union(v.string(), v.null()),
    }),
  ),
  handler: async (ctx) => {
    const userId = await currentUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get("users", userId);
    const profile = await getProfileByUser(ctx, userId);
    const preferences = await getPreferencesByUser(ctx, userId);
    const anyAvailability = profile
      ? await ctx.db
          .query("availability")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .first()
      : null;

    return {
      userId,
      email: user?.email ?? null,
      profile: profile ? stripPrivate(profile) : null,
      preferences,
      hasAvailability: anyAvailability !== null,
      photoUrl: profile?.photoStorageId
        ? await ctx.storage.getUrl(profile.photoStorageId)
        : null,
    };
  },
});

/** The signed-in user sees their own profile without the private geo fields. */
function stripPrivate(profile: Doc<"profiles">) {
  const { dobMs, approxLat, approxLng, ...rest } = profile;
  void dobMs;
  void approxLat;
  void approxLng;
  return rest;
}

export const onboardingState = query({
  args: {},
  returns: v.object({
    signedIn: v.boolean(),
    step: v.number(),
    complete: v.boolean(),
    legalAccepted: v.boolean(),
  }),
  handler: async (ctx) => {
    const userId = await currentUserId(ctx);
    if (!userId) {
      return {
        signedIn: false,
        step: 0,
        complete: false,
        legalAccepted: false,
      };
    }
    const consent = await ctx.db
      .query("legalConsents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const legalAccepted =
      consent !== null &&
      legalVersionsMatch({
        terms: consent.termsVersion,
        privacy: consent.privacyVersion,
        community: consent.communityVersion,
      });
    const profile = await getProfileByUser(ctx, userId);
    if (!profile) {
      return { signedIn: true, step: 1, complete: false, legalAccepted };
    }
    const agent = await ctx.db
      .query("agentProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return {
      signedIn: true,
      step: agent ? 7 : 1,
      complete: profile.onboardingComplete && agent !== null,
      legalAccepted,
    };
  },
});

/* ------------------------------ mutations ------------------------------- */

/** Persisted independently from browser storage so every service email uses
 *  the recipient's own language, even when another user started the flow. */
export const setPreferredLocale = mutation({
  args: { locale: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (!isSupportedLocale(args.locale)) {
      throw new Error("Choose a supported language.");
    }
    const profile = await requireProfile(ctx, userId);
    if (profile.preferredLocale === args.locale) return null;
    await ctx.db.patch("profiles", profile._id, {
      preferredLocale: args.locale,
      updatedAt: Date.now(),
    });
    return null;
  },
});

/** Existing owners can complete or revise the same explicit discovery
 * boundaries used by the compact Agent onboarding. */
export const saveAgentMatchingBoundaries = mutation({
  args: {
    languages: v.array(v.string()),
    matchLocationScope: v.union(
      v.literal("area"),
      v.literal("city"),
      v.literal("selected_cities"),
    ),
    preferredCountryCodes: v.array(v.string()),
    preferredCities: v.array(v.string()),
    preferredAreas: v.array(v.string()),
    allowTranslatedDates: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const [profile, preferences] = await Promise.all([
      requireProfile(ctx, userId),
      getPreferencesByUser(ctx, userId),
    ]);
    if (!preferences) throw new Error("Finish the basics first.");
    const normalized = normaliseMatchingBoundaryInput(profile.city, args);
    const now = Date.now();
    await Promise.all([
      ctx.db.patch("profiles", profile._id, {
        languages: normalized.languages,
        updatedAt: now,
      }),
      ctx.db.patch("preferences", preferences._id, {
        matchLocationScope: normalized.matchLocationScope,
        preferredCountryCodes: normalized.preferredCountryCodes,
        preferredCities: normalized.preferredCities,
        preferredAreas: normalized.preferredAreas,
        allowTranslatedDates: normalized.allowTranslatedDates,
        updatedAt: now,
      }),
    ]);
    await recordAudit(ctx, {
      action: "profile.matching_boundaries_updated",
      actorUserId: userId,
      detail: `${normalized.matchLocationScope} / ${normalized.preferredCities.join(",")}`,
    });
    return null;
  },
});

export const saveBasics = mutation({
  args: {
    displayName: v.string(),
    dobMs: v.number(),
    gender: genderValidator,
    pronouns: v.optional(v.string()),
    interestedIn: v.array(genderValidator),
    city: v.string(),
    neighborhood: v.string(),
    ageConfirmed18: v.boolean(),
  },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();

    if (!args.ageConfirmed18) {
      throw new Error(
        "Datehaja is for adults only. You must confirm you are 18 or over.",
      );
    }

    const displayName = clean(args.displayName, LIMITS.displayName);
    if (displayName.length < 2) throw new Error("Tell us what to call you.");
    if (containsContactInfo(displayName)) {
      throw new Error("Please use a name, not a contact handle.");
    }

    const age = ageOn(args.dobMs, now);
    if (!Number.isFinite(args.dobMs) || age < MIN_AGE) {
      throw new Error("You must be 18 or over to use Datehaja.");
    }
    if (age > MAX_AGE) throw new Error("Please check your date of birth.");

    if (args.interestedIn.length === 0) {
      throw new Error("Tell us who you'd like to meet.");
    }

    const cityInfo = findCity(args.city);
    if (!cityInfo) throw new Error("Datehaja isn't in that city yet.");
    const area = findNeighborhood(args.city, args.neighborhood);
    if (!area) throw new Error("Pick an area from the list.");

    const existing = await getProfileByUser(ctx, userId);
    const patch = {
      displayName,
      dobMs: args.dobMs,
      ageYears: age,
      ageConfirmed18: true,
      gender: args.gender,
      pronouns: args.pronouns ? clean(args.pronouns, 24) : undefined,
      interestedIn: [...new Set(args.interestedIn)],
      countryCode: cityInfo.countryCode,
      city: cityInfo.city,
      neighborhood: area.name,
      approxLat: coarsen(area.lat),
      approxLng: coarsen(area.lng),
      timezone: cityInfo.timezone,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch("profiles", existing._id, {
        ...patch,
        onboardingStep: Math.max(existing.onboardingStep, 2),
      });
      return existing._id;
    }

    const profileId = await ctx.db.insert("profiles", {
      userId,
      ...patch,
      bio: "",
      personalityTraits: [],
      styleTags: [],
      profileTruthConfirmed: false,
      showOccupation: false,
      interests: [],
      hobbies: [],
      languages: [],
      socialEnergy: "ambivert" as const,
      firstDateVibe: [],
      lifestyle: { smokes: false, drinks: "occasional" as const },
      photoVisibility: "after_accept" as const,
      onboardingStep: 2,
      onboardingComplete: false,
      status: "active" as const,
      moderationStatus: "ok" as const,
      isDemo: false,
    });

    // Sensible defaults so a half-finished profile is still internally valid.
    await ctx.db.insert("preferences", {
      userId,
      ageMin: Math.max(MIN_AGE, age - 8),
      ageMax: Math.min(MAX_AGE, age + 8),
      ageHard: true,
      maxDistanceKm: 15,
      distanceHard: true,
      preferredAreas: [area.name],
      areaHard: false,
      relationshipIntent: "open" as const,
      intentHard: false,
      smoking: "no_preference" as const,
      smokingHard: false,
      alcohol: "no_preference" as const,
      alcoholHard: false,
      preferredDateTypes: ["film", "walk", "exhibition"],
      preferredPersonalityTraits: [],
      personalityPreference: "no_preference" as const,
      preferredStyleTags: [],
      stylePreference: "no_preference" as const,
      budgetMinPerPerson: defaultBudgetRange(cityInfo.currency).min,
      budgetMaxPerPerson: defaultBudgetRange(cityInfo.currency).max,
      currency: cityInfo.currency,
      budgetHard: false,
      dayPreference: "either" as const,
      indoorOutdoor: "either" as const,
      atmosphere: "either" as const,
      dietary: [],
      accessibility: [],
      notifyEmail: true,
      notifyInvitations: true,
      notifyConfirmations: true,
      notifyReminders: true,
      dropsPaused: false,
      maxDropsPerWeek: 3,
      allowDemoMatches: true,
      updatedAt: now,
    });

    await recordAudit(ctx, {
      action: "profile.created",
      actorUserId: userId,
      detail: `${cityInfo.city} / ${area.name}`,
    });

    return profileId;
  },
});

export const saveAbout = mutation({
  args: {
    bio: v.string(),
    personalityTraits: v.array(v.string()),
    styleTags: v.array(v.string()),
    profileTruthConfirmed: v.boolean(),
    occupationCategory: v.optional(v.string()),
    showOccupation: v.boolean(),
    interests: v.array(v.string()),
    hobbies: v.array(v.string()),
    languages: v.array(v.string()),
    socialEnergy: socialEnergyValidator,
    firstDateVibe: v.array(v.string()),
    smokes: v.boolean(),
    drinks: alcoholValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireProfile(ctx, userId);

    const bio = redactContactInfo(cleanMultiline(args.bio, LIMITS.bio));
    if (!args.profileTruthConfirmed) {
      throw new Error(
        "Confirm that your profile reflects who you are today. Honest profiles make better dates.",
      );
    }

    const occupation =
      args.occupationCategory &&
      (OCCUPATION_CATEGORIES as readonly string[]).includes(
        args.occupationCategory,
      )
        ? args.occupationCategory
        : undefined;

    const interests = pickFrom(
      args.interests,
      INTEREST_OPTIONS,
      LIMITS.interestCount,
    );
    if (interests.length < 3) {
      throw new Error(
        "Pick at least three interests — they're what we match on.",
      );
    }

    await ctx.db.patch("profiles", profile._id, {
      bio,
      personalityTraits: pickFrom(
        args.personalityTraits,
        PERSONALITY_TRAIT_OPTIONS,
        5,
      ),
      styleTags: pickFrom(args.styleTags, STYLE_TAG_OPTIONS, 3),
      profileTruthConfirmed: true,
      occupationCategory: occupation,
      showOccupation: args.showOccupation && occupation !== undefined,
      interests,
      hobbies: pickFrom(args.hobbies, HOBBY_OPTIONS, LIMITS.interestCount),
      languages: pickFrom(
        args.languages,
        LANGUAGE_OPTIONS,
        LIMITS.languageCount,
      ),
      socialEnergy: args.socialEnergy,
      firstDateVibe: pickFrom(
        args.firstDateVibe,
        FIRST_DATE_VIBE_OPTIONS,
        LIMITS.vibeCount,
      ),
      lifestyle: { smokes: args.smokes, drinks: args.drinks },
      onboardingStep: Math.max(profile.onboardingStep, 3),
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const saveDatingPreferences = mutation({
  args: {
    ageMin: v.number(),
    ageMax: v.number(),
    ageHard: v.boolean(),
    maxDistanceKm: v.number(),
    distanceHard: v.boolean(),
    preferredAreas: v.array(v.string()),
    areaHard: v.boolean(),
    relationshipIntent: relationshipIntentValidator,
    intentHard: v.boolean(),
    smoking: smokingValidator,
    smokingHard: v.boolean(),
    alcohol: alcoholValidator,
    alcoholHard: v.boolean(),
    dayPreference: dayPreferenceValidator,
    preferredPersonalityTraits: v.array(v.string()),
    personalityPreference: preferenceStrengthValidator,
    preferredStyleTags: v.array(v.string()),
    stylePreference: preferenceStrengthValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireProfile(ctx, userId);
    const prefs = await ctx.db
      .query("preferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!prefs) throw new Error("Finish the basics first.");

    const ageMin = Math.round(clampNumber(args.ageMin, MIN_AGE, MAX_AGE));
    const ageMax = Math.round(clampNumber(args.ageMax, MIN_AGE, MAX_AGE));
    if (ageMax < ageMin) throw new Error("Age range is upside down.");
    const city = findCity(profile.city);
    if (!city) throw new Error("Your city is not supported yet.");
    const preferredAreas = pickFrom(
      args.preferredAreas,
      city.neighborhoods.map((area) => area.name),
      6,
    );
    if (args.areaHard && preferredAreas.length === 0) {
      throw new Error("Choose at least one required meeting area.");
    }

    await ctx.db.patch("preferences", prefs._id, {
      ageMin,
      ageMax,
      ageHard: args.ageHard,
      maxDistanceKm: Math.round(clampNumber(args.maxDistanceKm, 1, 100)),
      distanceHard: args.distanceHard,
      preferredAreas,
      areaHard: args.areaHard && preferredAreas.length > 0,
      relationshipIntent: args.relationshipIntent,
      intentHard: args.intentHard,
      smoking: args.smoking,
      smokingHard: args.smokingHard,
      alcohol: args.alcohol,
      alcoholHard: args.alcoholHard,
      dayPreference: args.dayPreference,
      preferredPersonalityTraits:
        args.personalityPreference === "no_preference"
          ? []
          : pickFrom(
              args.preferredPersonalityTraits,
              PERSONALITY_TRAIT_OPTIONS,
              5,
            ),
      personalityPreference: args.personalityPreference,
      preferredStyleTags:
        args.stylePreference === "no_preference"
          ? []
          : pickFrom(args.preferredStyleTags, STYLE_TAG_OPTIONS, 3),
      stylePreference: args.stylePreference,
      updatedAt: Date.now(),
    });

    await ctx.db.patch("profiles", profile._id, {
      onboardingStep: Math.max(profile.onboardingStep, 4),
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const saveDatePreferences = mutation({
  args: {
    preferredDateTypes: v.array(v.string()),
    indoorOutdoor: indoorOutdoorValidator,
    atmosphere: atmosphereValidator,
    budgetMinPerPerson: v.number(),
    budgetMaxPerPerson: v.number(),
    budgetHard: v.boolean(),
    dietary: v.array(v.string()),
    accessibility: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireProfile(ctx, userId);
    const prefs = await ctx.db
      .query("preferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!prefs) throw new Error("Finish the basics first.");

    const dateTypes = pickFrom(
      args.preferredDateTypes,
      DATE_TYPE_KEYS,
      LIMITS.dateTypeCount,
    );
    if (dateTypes.length === 0) {
      throw new Error("Pick at least one kind of date you'd enjoy.");
    }

    const min = Math.max(0, Math.round(args.budgetMinPerPerson));
    const max = Math.max(min, Math.round(args.budgetMaxPerPerson));

    await ctx.db.patch("preferences", prefs._id, {
      preferredDateTypes: dateTypes,
      indoorOutdoor: args.indoorOutdoor,
      atmosphere: args.atmosphere,
      budgetMinPerPerson: min,
      budgetMaxPerPerson: max,
      budgetHard: args.budgetHard,
      dietary: pickFrom(
        args.dietary,
        DIETARY_OPTIONS.map((d) => d.key),
        DIETARY_OPTIONS.length,
      ),
      accessibility: pickFrom(
        args.accessibility,
        ACCESSIBILITY_OPTIONS.map((a) => a.key),
        ACCESSIBILITY_OPTIONS.length,
      ),
      updatedAt: Date.now(),
    });

    await ctx.db.patch("profiles", profile._id, {
      onboardingStep: Math.max(profile.onboardingStep, 5),
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const completeOnboarding = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const profile = await requireProfile(ctx, userId);

    if (profile.interests.length < 3) {
      throw new Error("Add a few interests before we start matching.");
    }
    const hasWindow = await ctx.db
      .query("availability")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!hasWindow) throw new Error("Add at least one time you're free.");

    await ctx.db.patch("profiles", profile._id, {
      onboardingComplete: true,
      onboardingStep: 7,
      updatedAt: Date.now(),
    });
    await recordAudit(ctx, {
      action: "onboarding.completed",
      actorUserId: userId,
      detail: profile.city,
    });
    return null;
  },
});

/* ---------------------------- account controls --------------------------- */

export const setStatus = mutation({
  args: { status: v.union(v.literal("active"), v.literal("paused")) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireProfile(ctx, userId);
    if (profile.moderationStatus === "suspended") {
      throw new Error("This account is suspended.");
    }
    await ctx.db.patch("profiles", profile._id, {
      status: args.status,
      updatedAt: Date.now(),
    });
    await recordAudit(ctx, {
      action: `account.${args.status}`,
      actorUserId: userId,
      detail: "Set from settings",
    });
    return null;
  },
});

export const updateNotificationPreferences = mutation({
  args: {
    notifyEmail: v.optional(v.boolean()),
    notifyInvitations: v.optional(v.boolean()),
    notifyConfirmations: v.optional(v.boolean()),
    notifyReminders: v.optional(v.boolean()),
    dropsPaused: v.optional(v.boolean()),
    allowDemoMatches: v.optional(v.boolean()),
    maxDropsPerWeek: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const prefs = await ctx.db
      .query("preferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!prefs) throw new Error("No preferences yet.");

    await ctx.db.patch("preferences", prefs._id, {
      ...(args.notifyEmail !== undefined
        ? { notifyEmail: args.notifyEmail }
        : {}),
      ...(args.notifyInvitations !== undefined
        ? { notifyInvitations: args.notifyInvitations }
        : {}),
      ...(args.notifyConfirmations !== undefined
        ? { notifyConfirmations: args.notifyConfirmations }
        : {}),
      ...(args.notifyReminders !== undefined
        ? { notifyReminders: args.notifyReminders }
        : {}),
      ...(args.dropsPaused !== undefined
        ? { dropsPaused: args.dropsPaused }
        : {}),
      ...(args.allowDemoMatches !== undefined
        ? { allowDemoMatches: args.allowDemoMatches }
        : {}),
      ...(args.maxDropsPerWeek !== undefined
        ? {
            maxDropsPerWeek: Math.round(
              clampNumber(args.maxDropsPerWeek, 1, 7),
            ),
          }
        : {}),
      updatedAt: Date.now(),
    });
    return null;
  },
});

/* -------------------------------- photo ---------------------------------- */

export const generatePhotoUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireUserId(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const setPhoto = mutation({
  args: { storageId: v.union(v.id("_storage"), v.null()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireProfile(ctx, userId);

    if (args.storageId) {
      const meta = await ctx.db.system.get("_storage", args.storageId);
      if (!meta) throw new Error("Upload didn't finish.");
      if (meta.size > 6 * 1024 * 1024)
        throw new Error("Photos must be under 6MB.");
      if (!meta.contentType?.startsWith("image/")) {
        throw new Error("That file isn't an image.");
      }
    }

    if (profile.photoStorageId && profile.photoStorageId !== args.storageId) {
      await ctx.storage.delete(profile.photoStorageId);
    }
    await ctx.db.patch("profiles", profile._id, {
      photoStorageId: args.storageId ?? undefined,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const setPhotoVisibility = mutation({
  args: { visibility: photoVisibilityValidator },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireProfile(ctx, userId);
    await ctx.db.patch("profiles", profile._id, {
      photoVisibility: args.visibility,
      updatedAt: Date.now(),
    });
    return null;
  },
});

function clampNumber(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}
