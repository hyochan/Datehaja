import type { Gender } from "./enums";
import { haversineKm } from "./geo";
import {
  MIN_OVERLAP_MINUTES,
  intersectWindows,
  overlapMinutes,
  type Window,
} from "./time";

/* ------------------------------------------------------------------ *
 * Plain shapes so the whole matching engine is pure and unit-testable *
 * ------------------------------------------------------------------ */

export type MatchProfile = {
  userId: string;
  displayName: string;
  ageYears: number;
  ageConfirmed18: boolean;
  gender: Gender;
  interestedIn: Gender[];
  city: string;
  countryCode: string;
  neighborhood: string;
  approxLat: number;
  approxLng: number;
  timezone: string;
  interests: string[];
  hobbies: string[];
  languages: string[];
  socialEnergy: "introvert" | "ambivert" | "extrovert";
  firstDateVibe: string[];
  lifestyle: { smokes: boolean; drinks: "none" | "occasional" | "social" | "no_preference" };
  status: "active" | "paused" | "suspended";
  moderationStatus: "ok" | "flagged" | "suspended";
  onboardingComplete: boolean;
  isDemo: boolean;
};

export type MatchPreferences = {
  ageMin: number;
  ageMax: number;
  ageHard: boolean;
  maxDistanceKm: number;
  distanceHard: boolean;
  relationshipIntent: "casual" | "open" | "serious" | "friendship" | "unsure";
  intentHard: boolean;
  smoking: "no_preference" | "non_smoker_only" | "smoker_ok";
  smokingHard: boolean;
  alcohol: "none" | "occasional" | "social" | "no_preference";
  alcoholHard: boolean;
  preferredDateTypes: string[];
  budgetMinPerPerson: number;
  budgetMaxPerPerson: number;
  currency: string;
  budgetHard: boolean;
  indoorOutdoor: "indoor" | "outdoor" | "either";
  atmosphere: "quiet" | "lively" | "either";
  dietary: string[];
  accessibility: string[];
  dropsPaused: boolean;
  allowDemoMatches: boolean;
};

export type Party = {
  profile: MatchProfile;
  preferences: MatchPreferences;
  window: Window;
  availabilityId?: string;
};

export type HardFilterContext = {
  /** Either direction — a block is always mutual in effect. */
  blockedPairs: ReadonlySet<string>;
  /** Users who already passed on / were replaced in this specific drop. */
  excludedUserIds?: ReadonlySet<string>;
};

export type HardFilterResult =
  | { ok: true }
  | { ok: false; reason: string };

export function blockKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/** Ordered pair key so a candidate pair is stored exactly once. */
export function pairKey(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/* --------------------------- Stage 1: hard filters -------------------------- */

const INTENT_COMPATIBILITY: Record<string, readonly string[]> = {
  casual: ["casual", "open", "unsure"],
  open: ["casual", "open", "serious", "unsure", "friendship"],
  serious: ["serious", "open", "unsure"],
  friendship: ["friendship", "open"],
  unsure: ["casual", "open", "serious", "unsure"],
};

function genderInterest(seeker: MatchProfile, other: MatchProfile): boolean {
  // "other" is treated as an explicit opt-in on both sides, never inferred.
  return seeker.interestedIn.includes(other.gender);
}

function eligibleProfile(p: MatchProfile): HardFilterResult {
  if (!p.onboardingComplete) return { ok: false, reason: "onboarding_incomplete" };
  if (!p.ageConfirmed18) return { ok: false, reason: "age_not_confirmed" };
  if (p.ageYears < 18) return { ok: false, reason: "under_18" };
  if (p.status !== "active") return { ok: false, reason: `status_${p.status}` };
  if (p.moderationStatus !== "ok") {
    return { ok: false, reason: `moderation_${p.moderationStatus}` };
  }
  return { ok: true };
}

/**
 * Stage 1. Purely programmatic. The language model never sees a pair that
 * fails here, and can never overrule it.
 */
export function hardFilter(
  seeker: Party,
  candidate: Party,
  ctx: HardFilterContext,
): HardFilterResult {
  if (seeker.profile.userId === candidate.profile.userId) {
    return { ok: false, reason: "same_user" };
  }

  const seekerEligible = eligibleProfile(seeker.profile);
  if (!seekerEligible.ok) return { ok: false, reason: `seeker_${seekerEligible.reason}` };
  const candEligible = eligibleProfile(candidate.profile);
  if (!candEligible.ok) return { ok: false, reason: `candidate_${candEligible.reason}` };

  if (candidate.preferences.dropsPaused) {
    return { ok: false, reason: "candidate_paused_drops" };
  }

  if (ctx.excludedUserIds?.has(candidate.profile.userId)) {
    return { ok: false, reason: "already_considered" };
  }

  if (ctx.blockedPairs.has(blockKey(seeker.profile.userId, candidate.profile.userId))) {
    return { ok: false, reason: "blocked" };
  }

  // Demo personas are fictional. They only enter a real user's pool when that
  // user has explicitly kept demo matching on.
  if (candidate.profile.isDemo && !seeker.preferences.allowDemoMatches) {
    return { ok: false, reason: "demo_not_allowed" };
  }
  if (seeker.profile.isDemo && !candidate.preferences.allowDemoMatches && !candidate.profile.isDemo) {
    return { ok: false, reason: "demo_not_allowed_reverse" };
  }

  // Mutual, explicitly-stated gender interest. Never inferred.
  if (!genderInterest(seeker.profile, candidate.profile)) {
    return { ok: false, reason: "seeker_gender_preference" };
  }
  if (!genderInterest(candidate.profile, seeker.profile)) {
    return { ok: false, reason: "candidate_gender_preference" };
  }

  // Age ranges, when declared hard.
  if (
    seeker.preferences.ageHard &&
    (candidate.profile.ageYears < seeker.preferences.ageMin ||
      candidate.profile.ageYears > seeker.preferences.ageMax)
  ) {
    return { ok: false, reason: "seeker_age_range" };
  }
  if (
    candidate.preferences.ageHard &&
    (seeker.profile.ageYears < candidate.preferences.ageMin ||
      seeker.profile.ageYears > candidate.preferences.ageMax)
  ) {
    return { ok: false, reason: "candidate_age_range" };
  }

  // Geography.
  const distanceKm = haversineKm(
    seeker.profile.approxLat,
    seeker.profile.approxLng,
    candidate.profile.approxLat,
    candidate.profile.approxLng,
  );
  if (seeker.preferences.distanceHard && distanceKm > seeker.preferences.maxDistanceKm) {
    return { ok: false, reason: "seeker_distance" };
  }
  if (candidate.preferences.distanceHard && distanceKm > candidate.preferences.maxDistanceKm) {
    return { ok: false, reason: "candidate_distance" };
  }

  // A date needs a genuinely shared block of time.
  const overlap = intersectWindows(seeker.window, candidate.window);
  if (!overlap || overlapMinutes(seeker.window, candidate.window) < MIN_OVERLAP_MINUTES) {
    return { ok: false, reason: "no_availability_overlap" };
  }

  // Relationship intent, when declared hard by either side.
  const seekerOk = INTENT_COMPATIBILITY[seeker.preferences.relationshipIntent] ?? [];
  const candOk = INTENT_COMPATIBILITY[candidate.preferences.relationshipIntent] ?? [];
  if (
    seeker.preferences.intentHard &&
    !seekerOk.includes(candidate.preferences.relationshipIntent)
  ) {
    return { ok: false, reason: "seeker_intent" };
  }
  if (
    candidate.preferences.intentHard &&
    !candOk.includes(seeker.preferences.relationshipIntent)
  ) {
    return { ok: false, reason: "candidate_intent" };
  }

  // Smoking, when declared hard.
  if (
    seeker.preferences.smokingHard &&
    seeker.preferences.smoking === "non_smoker_only" &&
    candidate.profile.lifestyle.smokes
  ) {
    return { ok: false, reason: "seeker_smoking" };
  }
  if (
    candidate.preferences.smokingHard &&
    candidate.preferences.smoking === "non_smoker_only" &&
    seeker.profile.lifestyle.smokes
  ) {
    return { ok: false, reason: "candidate_smoking" };
  }

  // Alcohol: only a hard block at the extremes (teetotal vs. heavy social).
  if (
    seeker.preferences.alcoholHard &&
    seeker.preferences.alcohol === "none" &&
    candidate.profile.lifestyle.drinks === "social"
  ) {
    return { ok: false, reason: "seeker_alcohol" };
  }
  if (
    candidate.preferences.alcoholHard &&
    candidate.preferences.alcohol === "none" &&
    seeker.profile.lifestyle.drinks === "social"
  ) {
    return { ok: false, reason: "candidate_alcohol" };
  }

  // Budget.
  const budgetLow = Math.max(
    seeker.preferences.budgetMinPerPerson,
    candidate.preferences.budgetMinPerPerson,
  );
  const budgetHigh = Math.min(
    seeker.preferences.budgetMaxPerPerson,
    candidate.preferences.budgetMaxPerPerson,
  );
  const budgetOverlaps = budgetHigh >= budgetLow;
  if (
    (seeker.preferences.budgetHard || candidate.preferences.budgetHard) &&
    !budgetOverlaps
  ) {
    return { ok: false, reason: "budget_mismatch" };
  }
  if (seeker.preferences.currency !== candidate.preferences.currency) {
    return { ok: false, reason: "currency_mismatch" };
  }

  // A first date with no shared language is not a first date.
  const sharedLangs = intersect(seeker.profile.languages, candidate.profile.languages);
  if (
    seeker.profile.languages.length > 0 &&
    candidate.profile.languages.length > 0 &&
    sharedLangs.length === 0
  ) {
    return { ok: false, reason: "no_shared_language" };
  }

  return { ok: true };
}

/* ----------------------- Stage 2: deterministic scoring ---------------------- */

export type Signals = {
  sharedInterests: string[];
  sharedLanguages: string[];
  distanceKm: number;
  overlapMinutes: number;
  overlapStartMs: number;
  overlapEndMs: number;
  budgetOverlap: boolean;
  budgetLowPerPerson: number;
  budgetHighPerPerson: number;
  sharedDateTypes: string[];
  styleMatch: number;
  lifestyleMatch: number;
};

export type ScoredPair = { score: number; signals: Signals; breakdown: Record<string, number> };

function norm(s: string): string {
  return s.trim().toLowerCase();
}

export function intersect(a: string[], b: string[]): string[] {
  const setB = new Set(b.map(norm));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of a) {
    const key = norm(item);
    if (setB.has(key) && !seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

const WEIGHTS = {
  interests: 24,
  dateTypes: 18,
  distance: 13,
  availability: 10,
  budget: 10,
  lifestyle: 12,
  style: 8,
  language: 5,
} as const;

/**
 * Stage 2. Deterministic compatibility from stated facts only.
 * Returns a 0–100 score plus the signals that produced it, so the score is
 * always explainable and never a black box.
 */
export function scorePair(seeker: Party, candidate: Party): ScoredPair {
  const sp = seeker.profile;
  const cp = candidate.profile;
  const spref = seeker.preferences;
  const cpref = candidate.preferences;

  const sharedInterests = intersect(
    [...sp.interests, ...sp.hobbies],
    [...cp.interests, ...cp.hobbies],
  );
  const unionSize =
    new Set(
      [...sp.interests, ...sp.hobbies, ...cp.interests, ...cp.hobbies].map(norm),
    ).size || 1;
  // Reward absolute overlap first, Jaccard second — 3 shared loves beats
  // "we both listed exactly one thing and it matched".
  const interestScore =
    WEIGHTS.interests *
    clamp01(0.65 * clamp01(sharedInterests.length / 4) + 0.35 * (sharedInterests.length / unionSize));

  const sharedDateTypes = intersect(spref.preferredDateTypes, cpref.preferredDateTypes);
  const dateTypeScore =
    WEIGHTS.dateTypes * clamp01(sharedDateTypes.length / 3);

  const distanceKm = haversineKm(sp.approxLat, sp.approxLng, cp.approxLat, cp.approxLng);
  const tolerance = Math.max(1, Math.min(spref.maxDistanceKm, cpref.maxDistanceKm));
  const distanceScore = WEIGHTS.distance * clamp01(1 - distanceKm / tolerance);

  const overlap = intersectWindows(seeker.window, candidate.window);
  const mins = overlap ? Math.round((overlap.endMs - overlap.startMs) / 60_000) : 0;
  // 3h+ of shared time is all the room a first date needs.
  const availabilityScore = WEIGHTS.availability * clamp01(mins / 180);

  const budgetLow = Math.max(spref.budgetMinPerPerson, cpref.budgetMinPerPerson);
  const budgetHigh = Math.min(spref.budgetMaxPerPerson, cpref.budgetMaxPerPerson);
  const budgetOverlap = budgetHigh >= budgetLow;
  const seekerSpan = Math.max(1, spref.budgetMaxPerPerson - spref.budgetMinPerPerson);
  const candSpan = Math.max(1, cpref.budgetMaxPerPerson - cpref.budgetMinPerPerson);
  const budgetScore = budgetOverlap
    ? WEIGHTS.budget *
      clamp01((budgetHigh - budgetLow) / Math.min(seekerSpan, candSpan))
    : 0;

  const lifestyleMatch = lifestyleCompatibility(seeker, candidate);
  const lifestyleScore = WEIGHTS.lifestyle * lifestyleMatch;

  const styleMatch = styleCompatibility(seeker, candidate);
  const styleScore = WEIGHTS.style * styleMatch;

  const sharedLanguages = intersect(sp.languages, cp.languages);
  const languageScore = WEIGHTS.language * clamp01(sharedLanguages.length / 2);

  // Soft penalties for preferences the user marked "nice to have" rather than
  // required — they did not exclude the candidate, but they still matter.
  let penalty = 0;
  if (!spref.ageHard && (cp.ageYears < spref.ageMin || cp.ageYears > spref.ageMax)) penalty += 8;
  if (!cpref.ageHard && (sp.ageYears < cpref.ageMin || sp.ageYears > cpref.ageMax)) penalty += 8;
  if (!spref.distanceHard && distanceKm > spref.maxDistanceKm) penalty += 6;
  if (!cpref.distanceHard && distanceKm > cpref.maxDistanceKm) penalty += 6;
  if (
    !spref.intentHard &&
    !(INTENT_COMPATIBILITY[spref.relationshipIntent] ?? []).includes(cpref.relationshipIntent)
  ) {
    penalty += 7;
  }
  if (!budgetOverlap) penalty += 5;

  const breakdown = {
    interests: round1(interestScore),
    dateTypes: round1(dateTypeScore),
    distance: round1(distanceScore),
    availability: round1(availabilityScore),
    budget: round1(budgetScore),
    lifestyle: round1(lifestyleScore),
    style: round1(styleScore),
    language: round1(languageScore),
    penalty: -round1(penalty),
  };

  const raw =
    interestScore +
    dateTypeScore +
    distanceScore +
    availabilityScore +
    budgetScore +
    lifestyleScore +
    styleScore +
    languageScore -
    penalty;

  return {
    score: Math.max(0, Math.min(100, round1(raw))),
    breakdown,
    signals: {
      sharedInterests,
      sharedLanguages,
      distanceKm: round1(distanceKm),
      overlapMinutes: mins,
      overlapStartMs: overlap?.startMs ?? 0,
      overlapEndMs: overlap?.endMs ?? 0,
      budgetOverlap,
      budgetLowPerPerson: budgetLow,
      budgetHighPerPerson: budgetHigh,
      sharedDateTypes,
      styleMatch: round1(styleMatch * 100) / 100,
      lifestyleMatch: round1(lifestyleMatch * 100) / 100,
    },
  };
}

function lifestyleCompatibility(a: Party, b: Party): number {
  let score = 0;
  let parts = 0;

  // Smoking
  parts += 1;
  const smokingClash =
    (a.preferences.smoking === "non_smoker_only" && b.profile.lifestyle.smokes) ||
    (b.preferences.smoking === "non_smoker_only" && a.profile.lifestyle.smokes);
  score += smokingClash ? 0 : 1;

  // Drinking habits — closeness on a 3-point scale.
  parts += 1;
  const drinkRank = { none: 0, occasional: 1, social: 2, no_preference: 1 } as const;
  const diff = Math.abs(
    drinkRank[a.profile.lifestyle.drinks] - drinkRank[b.profile.lifestyle.drinks],
  );
  score += 1 - diff / 2;

  // Social energy — introvert+extrovert is fine, just less of a slam dunk.
  parts += 1;
  const energyRank = { introvert: 0, ambivert: 1, extrovert: 2 } as const;
  const eDiff = Math.abs(energyRank[a.profile.socialEnergy] - energyRank[b.profile.socialEnergy]);
  score += 1 - eDiff / 3;

  return clamp01(score / parts);
}

function styleCompatibility(a: Party, b: Party): number {
  let score = 0;
  let parts = 0;

  parts += 1;
  score += compatEnum(a.preferences.indoorOutdoor, b.preferences.indoorOutdoor, "either");

  parts += 1;
  score += compatEnum(a.preferences.atmosphere, b.preferences.atmosphere, "either");

  parts += 1;
  const vibes = intersect(a.profile.firstDateVibe, b.profile.firstDateVibe);
  score += clamp01(vibes.length / 2);

  return clamp01(score / parts);
}

function compatEnum(a: string, b: string, wildcard: string): number {
  if (a === wildcard || b === wildcard) return 0.75;
  return a === b ? 1 : 0.15;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/* -------------------------- Stage 3 blending ------------------------------ */

/**
 * Final ranking. The deterministic score keeps the model honest; the model
 * contributes judgement the rules cannot express. Neither can exceed 100 and
 * neither can resurrect a pair that failed Stage 1.
 */
export function blendScore(deterministic: number, ai: number | undefined): number {
  if (ai === undefined || Number.isNaN(ai)) return round1(deterministic);
  return round1(0.45 * deterministic + 0.55 * Math.max(0, Math.min(100, ai)));
}

/** How many candidates we are willing to send to the model per run. */
export const AI_RANKING_POOL_SIZE = 8;
/** How many people a single drop will ever be offered to. */
export const DEFAULT_MAX_CANDIDATE_ATTEMPTS = 4;
/** A pair below this simply is not worth anyone's Saturday. */
export const MIN_VIABLE_SCORE = 30;
