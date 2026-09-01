import type { Doc } from "../_generated/dataModel";

export type MatchLocationScope = "area" | "city" | "selected_cities";

type MatchProfile = Pick<
  Doc<"profiles">,
  "countryCode" | "city" | "neighborhood" | "languages"
>;

type MatchPreferences = Pick<
  Doc<"preferences">,
  | "matchLocationScope"
  | "preferredCountryCodes"
  | "preferredCities"
  | "preferredAreas"
  | "allowTranslatedDates"
>;
type CompleteMatchPreferences = MatchPreferences & {
  matchLocationScope: MatchLocationScope;
  preferredCountryCodes: string[];
  preferredCities: string[];
  allowTranslatedDates: boolean;
};

export type BoundaryResult =
  | {
      ok: true;
      sharedLanguages: string[];
      translated: boolean;
    }
  | {
      ok: false;
      reason:
        | "seeker_preferences_incomplete"
        | "candidate_preferences_incomplete"
        | "outside_seeker_location"
        | "outside_candidate_location"
        | "language_not_mutually_supported";
    };

function normalized(values: readonly string[] | undefined) {
  return [
    ...new Set((values ?? []).map((value) => value.trim()).filter(Boolean)),
  ];
}

function includesCaseInsensitive(values: readonly string[], value: string) {
  const needle = value.trim().toLocaleLowerCase("en-US");
  return values.some(
    (item) => item.trim().toLocaleLowerCase("en-US") === needle,
  );
}

export function hasCompleteMatchingBoundaries(
  profile: MatchProfile,
  preferences: MatchPreferences | null | undefined,
): preferences is CompleteMatchPreferences {
  if (!preferences?.matchLocationScope) return false;
  if (typeof preferences.allowTranslatedDates !== "boolean") return false;
  if (normalized(profile.languages).length === 0) return false;
  if (normalized(preferences.preferredCountryCodes).length === 0) return false;
  if (normalized(preferences.preferredCities).length === 0) return false;
  if (
    preferences.matchLocationScope === "area" &&
    normalized(preferences.preferredAreas).length === 0
  ) {
    return false;
  }
  return true;
}

export function candidateCitiesFor(
  profile: MatchProfile,
  preferences: CompleteMatchPreferences,
) {
  if (preferences.matchLocationScope === "selected_cities") {
    return normalized(preferences.preferredCities).slice(0, 10);
  }
  return [profile.city];
}

export function locationAllows(
  owner: MatchProfile,
  preferences: CompleteMatchPreferences,
  candidate: MatchProfile,
) {
  const countries = normalized(preferences.preferredCountryCodes);
  const cities = normalized(preferences.preferredCities);
  if (
    !includesCaseInsensitive(countries, candidate.countryCode) ||
    !includesCaseInsensitive(cities, candidate.city)
  ) {
    return false;
  }
  if (preferences.matchLocationScope === "area") {
    return (
      candidate.countryCode.toUpperCase() === owner.countryCode.toUpperCase() &&
      candidate.city.toLocaleLowerCase("en-US") ===
        owner.city.toLocaleLowerCase("en-US") &&
      includesCaseInsensitive(
        normalized(preferences.preferredAreas),
        candidate.neighborhood,
      )
    );
  }
  if (preferences.matchLocationScope === "city") {
    return (
      candidate.countryCode.toUpperCase() === owner.countryCode.toUpperCase() &&
      candidate.city.toLocaleLowerCase("en-US") ===
        owner.city.toLocaleLowerCase("en-US")
    );
  }
  return true;
}

export function mutualMatchingBoundaries(
  seeker: MatchProfile,
  seekerPreferences: MatchPreferences | null | undefined,
  candidate: MatchProfile,
  candidatePreferences: MatchPreferences | null | undefined,
): BoundaryResult {
  if (!hasCompleteMatchingBoundaries(seeker, seekerPreferences)) {
    return { ok: false, reason: "seeker_preferences_incomplete" };
  }
  if (!hasCompleteMatchingBoundaries(candidate, candidatePreferences)) {
    return { ok: false, reason: "candidate_preferences_incomplete" };
  }
  if (!locationAllows(seeker, seekerPreferences, candidate)) {
    return { ok: false, reason: "outside_seeker_location" };
  }
  if (!locationAllows(candidate, candidatePreferences, seeker)) {
    return { ok: false, reason: "outside_candidate_location" };
  }

  const candidateLanguages = normalized(candidate.languages);
  const sharedLanguages = normalized(seeker.languages).filter((language) =>
    includesCaseInsensitive(candidateLanguages, language),
  );
  const translated =
    sharedLanguages.length === 0 &&
    seekerPreferences.allowTranslatedDates === true &&
    candidatePreferences.allowTranslatedDates === true;
  if (sharedLanguages.length === 0 && !translated) {
    return { ok: false, reason: "language_not_mutually_supported" };
  }
  return { ok: true, sharedLanguages, translated };
}
