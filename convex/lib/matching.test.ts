import { describe, expect, it } from "vitest";
import {
  blendScore,
  blockKey,
  hardFilter,
  intersect,
  pairKey,
  scorePair,
  type MatchPreferences,
  type MatchProfile,
  type Party,
} from "./matching";
import { DAY_MS } from "./time";

/* ------------------------------- fixtures -------------------------------- */

const NOW = Date.UTC(2026, 7, 27, 12, 0, 0);
const SATURDAY_EVENING = {
  startMs: NOW + 2 * DAY_MS,
  endMs: NOW + 2 * DAY_MS + 5 * 3600_000,
};

function profile(overrides: Partial<MatchProfile> = {}): MatchProfile {
  return {
    userId: "user_a",
    displayName: "Alex",
    ageYears: 29,
    ageConfirmed18: true,
    gender: "man",
    interestedIn: ["woman"],
    city: "Seoul",
    countryCode: "KR",
    neighborhood: "Seongsu",
    approxLat: 37.54,
    approxLng: 127.06,
    timezone: "Asia/Seoul",
    bio: "Film lover.",
    interests: ["Films", "Running", "Coffee"],
    hobbies: ["Home barista"],
    languages: ["Korean", "English"],
    socialEnergy: "introvert",
    firstDateVibe: ["Quiet and slow"],
    lifestyle: { smokes: false, drinks: "occasional" },
    status: "active",
    moderationStatus: "ok",
    onboardingComplete: true,
    isDemo: false,
    ...overrides,
  };
}

function preferences(
  overrides: Partial<MatchPreferences> = {},
): MatchPreferences {
  return {
    ageMin: 24,
    ageMax: 36,
    ageHard: true,
    maxDistanceKm: 20,
    distanceHard: true,
    relationshipIntent: "open",
    intentHard: false,
    smoking: "no_preference",
    smokingHard: false,
    alcohol: "no_preference",
    alcoholHard: false,
    preferredDateTypes: ["coffee", "dinner"],
    budgetMinPerPerson: 20000,
    budgetMaxPerPerson: 70000,
    currency: "KRW",
    budgetHard: false,
    indoorOutdoor: "either",
    atmosphere: "quiet",
    dietary: [],
    accessibility: [],
    dropsPaused: false,
    allowDemoMatches: true,
    ...overrides,
  };
}

function party(
  profileOverrides: Partial<MatchProfile> = {},
  prefOverrides: Partial<MatchPreferences> = {},
  window = SATURDAY_EVENING,
): Party {
  return {
    profile: profile(profileOverrides),
    preferences: preferences(prefOverrides),
    window,
  };
}

const seeker = () =>
  party({ userId: "seeker", gender: "woman", interestedIn: ["man"] });
const candidate = () =>
  party({ userId: "candidate", gender: "man", interestedIn: ["woman"] });

const noBlocks = { blockedPairs: new Set<string>() };

/* ------------------------------ hard filters ------------------------------ */

describe("hardFilter", () => {
  it("passes a mutually compatible pair with overlapping availability", () => {
    expect(hardFilter(seeker(), candidate(), noBlocks)).toEqual({ ok: true });
  });

  it("never matches someone with themselves", () => {
    const me = seeker();
    expect(hardFilter(me, me, noBlocks)).toEqual({
      ok: false,
      reason: "same_user",
    });
  });

  it("rejects anyone under 18 even if their profile claims otherwise", () => {
    const minor = party({
      userId: "minor",
      gender: "man",
      interestedIn: ["woman"],
      ageYears: 17,
    });
    expect(hardFilter(seeker(), minor, noBlocks)).toEqual({
      ok: false,
      reason: "candidate_under_18",
    });
  });

  it("rejects anyone who has not confirmed they are 18+", () => {
    const unconfirmed = party({
      userId: "unconfirmed",
      gender: "man",
      interestedIn: ["woman"],
      ageConfirmed18: false,
    });
    expect(hardFilter(seeker(), unconfirmed, noBlocks).ok).toBe(false);
  });

  it("requires gender interest in BOTH directions", () => {
    const notInterested = party({
      userId: "c",
      gender: "man",
      interestedIn: ["man"],
    });
    expect(hardFilter(seeker(), notInterested, noBlocks)).toEqual({
      ok: false,
      reason: "candidate_gender_preference",
    });

    const seekerWantsWomen = party({
      userId: "s",
      gender: "woman",
      interestedIn: ["woman"],
    });
    expect(hardFilter(seekerWantsWomen, candidate(), noBlocks)).toEqual({
      ok: false,
      reason: "seeker_gender_preference",
    });
  });

  it("enforces a hard age range from either side", () => {
    const older = party({
      userId: "c",
      gender: "man",
      interestedIn: ["woman"],
      ageYears: 44,
    });
    expect(hardFilter(seeker(), older, noBlocks)).toEqual({
      ok: false,
      reason: "seeker_age_range",
    });
  });

  it("treats a soft age range as a preference, not an exclusion", () => {
    const older = party({
      userId: "c",
      gender: "man",
      interestedIn: ["woman"],
      ageYears: 44,
    });
    const relaxed = party(
      { userId: "seeker", gender: "woman", interestedIn: ["man"] },
      { ageHard: false, ageMax: 36 },
    );
    expect(hardFilter(relaxed, older, noBlocks).ok).toBe(true);
    // ...but it costs them.
    const strong = scorePair(relaxed, candidate()).score;
    const weak = scorePair(relaxed, older).score;
    expect(weak).toBeLessThan(strong);
  });

  it("rejects two strict meeting-area lists that do not overlap", () => {
    const west = party(
      { userId: "seeker", gender: "woman", interestedIn: ["man"] },
      { preferredAreas: ["Yeonnam"], areaHard: true },
    );
    const east = party(
      { userId: "candidate", gender: "man", interestedIn: ["woman"] },
      { preferredAreas: ["Jamsil"], areaHard: true },
    );
    expect(hardFilter(west, east, noBlocks)).toEqual({
      ok: false,
      reason: "meeting_area",
    });
  });

  it("honours one strict area when the other person has no preference", () => {
    const strict = party(
      { userId: "seeker", gender: "woman", interestedIn: ["man"] },
      { preferredAreas: ["Euljiro"], areaHard: true },
    );
    const open = party(
      { userId: "candidate", gender: "man", interestedIn: ["woman"] },
      { preferredAreas: [], areaHard: false },
    );
    expect(hardFilter(strict, open, noBlocks)).toEqual({ ok: true });
  });

  it("excludes blocked pairs in both directions", () => {
    const ctx = { blockedPairs: new Set([blockKey("seeker", "candidate")]) };
    expect(hardFilter(seeker(), candidate(), ctx)).toEqual({
      ok: false,
      reason: "blocked",
    });
    // The block key is order-independent, so the reverse lookup is also blocked.
    expect(hardFilter(candidate(), seeker(), ctx)).toEqual({
      ok: false,
      reason: "blocked",
    });
  });

  it("excludes a paused candidate", () => {
    const paused = party(
      { userId: "c", gender: "man", interestedIn: ["woman"] },
      { dropsPaused: true },
    );
    expect(hardFilter(seeker(), paused, noBlocks)).toEqual({
      ok: false,
      reason: "candidate_paused_drops",
    });
  });

  it("excludes suspended and flagged accounts", () => {
    const suspended = party({
      userId: "c",
      gender: "man",
      interestedIn: ["woman"],
      status: "suspended",
    });
    expect(hardFilter(seeker(), suspended, noBlocks).ok).toBe(false);

    const flagged = party({
      userId: "c",
      gender: "man",
      interestedIn: ["woman"],
      moderationStatus: "flagged",
    });
    expect(hardFilter(seeker(), flagged, noBlocks).ok).toBe(false);
  });

  it("requires a real block of shared time, not a brush", () => {
    const barelyOverlapping = party(
      { userId: "c", gender: "man", interestedIn: ["woman"] },
      {},
      {
        startMs: SATURDAY_EVENING.endMs - 30 * 60_000,
        endMs: SATURDAY_EVENING.endMs + 3 * 3600_000,
      },
    );
    expect(hardFilter(seeker(), barelyOverlapping, noBlocks)).toEqual({
      ok: false,
      reason: "no_availability_overlap",
    });
  });

  it("rejects a pair with no availability overlap at all", () => {
    const differentDay = party(
      { userId: "c", gender: "man", interestedIn: ["woman"] },
      {},
      { startMs: NOW + 9 * DAY_MS, endMs: NOW + 9 * DAY_MS + 4 * 3600_000 },
    );
    expect(hardFilter(seeker(), differentDay, noBlocks)).toEqual({
      ok: false,
      reason: "no_availability_overlap",
    });
  });

  it("rejects a pair with no shared language", () => {
    const monolingual = party({
      userId: "c",
      gender: "man",
      interestedIn: ["woman"],
      languages: ["Portuguese"],
    });
    expect(hardFilter(seeker(), monolingual, noBlocks)).toEqual({
      ok: false,
      reason: "no_shared_language",
    });
  });

  it("respects a hard non-smoker requirement", () => {
    const strict = party(
      { userId: "seeker", gender: "woman", interestedIn: ["man"] },
      { smoking: "non_smoker_only", smokingHard: true },
    );
    const smoker = party({
      userId: "c",
      gender: "man",
      interestedIn: ["woman"],
      lifestyle: { smokes: true, drinks: "occasional" },
    });
    expect(hardFilter(strict, smoker, noBlocks)).toEqual({
      ok: false,
      reason: "seeker_smoking",
    });
  });

  it("ignores a soft non-smoker preference", () => {
    const lenient = party(
      { userId: "seeker", gender: "woman", interestedIn: ["man"] },
      { smoking: "non_smoker_only", smokingHard: false },
    );
    const smoker = party({
      userId: "c",
      gender: "man",
      interestedIn: ["woman"],
      lifestyle: { smokes: true, drinks: "occasional" },
    });
    expect(hardFilter(lenient, smoker, noBlocks).ok).toBe(true);
  });

  it("keeps teetotal users away from heavy drinkers when declared hard", () => {
    const teetotal = party(
      { userId: "seeker", gender: "woman", interestedIn: ["man"] },
      { alcohol: "none", alcoholHard: true },
    );
    const socialDrinker = party({
      userId: "c",
      gender: "man",
      interestedIn: ["woman"],
      lifestyle: { smokes: false, drinks: "social" },
    });
    expect(hardFilter(teetotal, socialDrinker, noBlocks)).toEqual({
      ok: false,
      reason: "seeker_alcohol",
    });
  });

  it("enforces hard budget and currency compatibility", () => {
    const cheap = party(
      { userId: "seeker", gender: "woman", interestedIn: ["man"] },
      {
        budgetMinPerPerson: 10000,
        budgetMaxPerPerson: 20000,
        budgetHard: true,
      },
    );
    const expensive = party(
      { userId: "c", gender: "man", interestedIn: ["woman"] },
      { budgetMinPerPerson: 90000, budgetMaxPerPerson: 200000 },
    );
    expect(hardFilter(cheap, expensive, noBlocks)).toEqual({
      ok: false,
      reason: "budget_mismatch",
    });

    const otherCurrency = party(
      { userId: "c", gender: "man", interestedIn: ["woman"] },
      { currency: "USD" },
    );
    expect(hardFilter(seeker(), otherCurrency, noBlocks)).toEqual({
      ok: false,
      reason: "currency_mismatch",
    });
  });

  it("enforces relationship intent only when declared hard", () => {
    const serious = party(
      { userId: "seeker", gender: "woman", interestedIn: ["man"] },
      { relationshipIntent: "serious", intentHard: true },
    );
    const friendly = party(
      { userId: "c", gender: "man", interestedIn: ["woman"] },
      { relationshipIntent: "friendship" },
    );
    expect(hardFilter(serious, friendly, noBlocks)).toEqual({
      ok: false,
      reason: "seeker_intent",
    });

    const soft = party(
      { userId: "seeker", gender: "woman", interestedIn: ["man"] },
      { relationshipIntent: "serious", intentHard: false },
    );
    expect(hardFilter(soft, friendly, noBlocks).ok).toBe(true);
  });

  it("keeps demo personas out of the pool when the user opted out", () => {
    const optedOut = party(
      { userId: "seeker", gender: "woman", interestedIn: ["man"] },
      { allowDemoMatches: false },
    );
    const persona = party({
      userId: "c",
      gender: "man",
      interestedIn: ["woman"],
      isDemo: true,
    });
    expect(hardFilter(optedOut, persona, noBlocks)).toEqual({
      ok: false,
      reason: "demo_not_allowed",
    });
    expect(hardFilter(seeker(), persona, noBlocks).ok).toBe(true);
  });

  it("skips people already considered for this drop", () => {
    const ctx = {
      blockedPairs: new Set<string>(),
      excludedUserIds: new Set(["candidate"]),
    };
    expect(hardFilter(seeker(), candidate(), ctx)).toEqual({
      ok: false,
      reason: "already_considered",
    });
  });

  it("excludes incomplete profiles", () => {
    const halfDone = party({
      userId: "c",
      gender: "man",
      interestedIn: ["woman"],
      onboardingComplete: false,
    });
    expect(hardFilter(seeker(), halfDone, noBlocks).ok).toBe(false);
  });
});

/* -------------------------------- scoring --------------------------------- */

describe("scorePair", () => {
  it("scores a pair with a lot in common above a pair with little", () => {
    const alike = party({
      userId: "c",
      gender: "man",
      interestedIn: ["woman"],
      interests: ["Films", "Running", "Coffee"],
      hobbies: ["Home barista"],
    });
    const different = party({
      userId: "c2",
      gender: "man",
      interestedIn: ["woman"],
      interests: ["Football", "Skiing", "Techno"],
      hobbies: ["Fishing"],
    });
    expect(scorePair(seeker(), alike).score).toBeGreaterThan(
      scorePair(seeker(), different).score,
    );
  });

  it("always returns a score inside 0–100", () => {
    const awful = party(
      {
        userId: "c",
        gender: "man",
        interestedIn: ["woman"],
        ageYears: 60,
        interests: [],
        hobbies: [],
        languages: [],
        firstDateVibe: [],
        approxLat: 37.9,
        approxLng: 127.9,
      },
      {
        ageHard: false,
        distanceHard: false,
        intentHard: false,
        relationshipIntent: "friendship",
        budgetMinPerPerson: 500000,
        budgetMaxPerPerson: 900000,
        preferredDateTypes: [],
        atmosphere: "lively",
      },
    );
    const score = scorePair(seeker(), awful).score;
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("reports the signals that produced the score", () => {
    const { signals } = scorePair(seeker(), candidate());
    expect(signals.sharedInterests).toEqual(
      expect.arrayContaining(["Films", "Running", "Coffee"]),
    );
    expect(signals.sharedLanguages).toEqual(
      expect.arrayContaining(["Korean", "English"]),
    );
    expect(signals.overlapMinutes).toBe(300);
    expect(signals.budgetOverlap).toBe(true);
    expect(signals.distanceKm).toBe(0);
  });

  it("prefers a closer candidate, all else equal", () => {
    const near = candidate();
    const far = party({
      userId: "far",
      gender: "man",
      interestedIn: ["woman"],
      approxLat: 37.5,
      approxLng: 127.2,
    });
    expect(scorePair(seeker(), near).score).toBeGreaterThan(
      scorePair(seeker(), far).score,
    );
  });

  it("prefers a shared meeting area over disjoint soft preferences", () => {
    const person = seeker();
    person.preferences.preferredAreas = ["Seongsu", "Euljiro"];

    const aligned = candidate();
    aligned.preferences.preferredAreas = ["Euljiro"];

    const different = candidate();
    different.profile.userId = "other-area";
    different.preferences.preferredAreas = ["Jamsil"];

    const alignedScore = scorePair(person, aligned);
    const differentScore = scorePair(person, different);
    expect(alignedScore.score).toBeGreaterThan(differentScore.score);
    expect(alignedScore.signals.sharedAreas).toEqual(["Euljiro"]);
  });

  it("prefers a longer availability overlap", () => {
    const short = party(
      { userId: "short", gender: "man", interestedIn: ["woman"] },
      {},
      {
        startMs: SATURDAY_EVENING.startMs,
        endMs: SATURDAY_EVENING.startMs + 100 * 60_000,
      },
    );
    expect(scorePair(seeker(), candidate()).score).toBeGreaterThan(
      scorePair(seeker(), short).score,
    );
  });

  it("uses mutual personality and style preferences without beauty scores", () => {
    const person = seeker();
    person.profile.personalityTraits = ["Curious", "Warm"];
    person.profile.styleTags = ["Natural"];
    person.preferences.preferredPersonalityTraits = ["Thoughtful"];
    person.preferences.personalityPreference = "important";
    person.preferences.preferredStyleTags = ["Classic"];
    person.preferences.stylePreference = "flexible";

    const aligned = candidate();
    aligned.profile.personalityTraits = ["Thoughtful", "Calm"];
    aligned.profile.styleTags = ["Classic"];
    aligned.preferences.preferredPersonalityTraits = ["Warm"];
    aligned.preferences.personalityPreference = "important";
    aligned.preferences.preferredStyleTags = ["Natural"];
    aligned.preferences.stylePreference = "flexible";

    const mismatched = candidate();
    mismatched.profile.userId = "other";
    mismatched.profile.personalityTraits = ["Direct"];
    mismatched.profile.styleTags = ["Bold"];
    mismatched.preferences.preferredPersonalityTraits = ["Playful"];
    mismatched.preferences.personalityPreference = "important";

    expect(scorePair(person, aligned).score).toBeGreaterThan(
      scorePair(person, mismatched).score,
    );
    expect(scorePair(person, aligned).signals.personalityMatch).toBeGreaterThan(
      scorePair(person, mismatched).signals.personalityMatch,
    );
  });
});

/* -------------------------------- helpers --------------------------------- */

describe("helpers", () => {
  it("orders a pair key deterministically", () => {
    expect(pairKey("b", "a")).toEqual(["a", "b"]);
    expect(pairKey("a", "b")).toEqual(["a", "b"]);
    expect(blockKey("b", "a")).toBe(blockKey("a", "b"));
  });

  it("intersects case-insensitively without duplicates", () => {
    expect(intersect(["Films", "films", "Coffee"], ["FILMS", "Tea"])).toEqual([
      "Films",
    ]);
  });

  it("falls back to the deterministic score when the model is unavailable", () => {
    expect(blendScore(62, undefined)).toBe(62);
    expect(blendScore(62, Number.NaN)).toBe(62);
  });

  it("blends model and deterministic scores, clamping the model's contribution", () => {
    expect(blendScore(60, 80)).toBeCloseTo(0.45 * 60 + 0.55 * 80, 5);
    // A model returning nonsense cannot push the blend outside 0–100.
    expect(blendScore(60, 5000)).toBeCloseTo(0.45 * 60 + 0.55 * 100, 5);
    expect(blendScore(60, -400)).toBeCloseTo(0.45 * 60, 5);
  });
});
