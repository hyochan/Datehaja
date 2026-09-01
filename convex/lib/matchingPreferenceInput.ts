import { LANGUAGE_OPTIONS, SUPPORTED_COUNTRIES, findCity } from "./catalog";
import { pickFrom } from "./text";
import type { MatchLocationScope } from "./agentMatchingBoundaries";

export type MatchingBoundaryInput = {
  languages: string[];
  matchLocationScope: MatchLocationScope;
  preferredCountryCodes: string[];
  preferredCities: string[];
  preferredAreas: string[];
  allowTranslatedDates: boolean;
};

export function normaliseMatchingBoundaryInput(
  homeCityName: string,
  input: MatchingBoundaryInput,
) {
  const homeCity = findCity(homeCityName);
  if (!homeCity) throw new Error("Choose a supported city and area.");

  const languages = pickFrom(input.languages, LANGUAGE_OPTIONS, 8);
  if (languages.length === 0) {
    throw new Error("Choose at least one language you can date in.");
  }
  const requestedCountries = [
    ...new Set(
      input.preferredCountryCodes.map((code) => code.trim().toUpperCase()),
    ),
  ];
  if (
    requestedCountries.length === 0 ||
    requestedCountries.some(
      (code) => !SUPPORTED_COUNTRIES.some((country) => country.code === code),
    )
  ) {
    throw new Error("Choose at least one supported matching country.");
  }

  const rawCities = [
    ...new Set(
      input.preferredCities
        .map((candidate) => candidate.trim())
        .filter(Boolean),
    ),
  ];
  const selectedCities: string[] = [];
  for (const candidate of rawCities) {
    const supported = findCity(candidate);
    if (!supported) {
      throw new Error("Choose up to ten supported matching cities.");
    }
    if (!selectedCities.includes(supported.city)) {
      selectedCities.push(supported.city);
    }
  }
  if (selectedCities.length > 10) {
    throw new Error("Choose up to ten supported matching cities.");
  }

  const preferredCities =
    input.matchLocationScope === "selected_cities"
      ? selectedCities
      : [homeCity.city];
  if (preferredCities.length === 0) {
    throw new Error("Choose at least one city where your Agent may search.");
  }
  const preferredCountryCodes = [
    ...new Set(
      preferredCities.map((cityName) => findCity(cityName)!.countryCode),
    ),
  ];
  if (
    preferredCountryCodes.some(
      (countryCode) => !requestedCountries.includes(countryCode),
    ) ||
    (input.matchLocationScope !== "selected_cities" &&
      !requestedCountries.includes(homeCity.countryCode))
  ) {
    throw new Error("Matching countries must include every selected city.");
  }

  const preferredAreas = pickFrom(
    input.preferredAreas,
    homeCity.neighborhoods.map((item) => item.name),
    8,
  );
  if (input.matchLocationScope === "area" && preferredAreas.length === 0) {
    throw new Error("Choose at least one local area for matching.");
  }

  return {
    languages,
    matchLocationScope: input.matchLocationScope,
    preferredCountryCodes,
    preferredCities,
    preferredAreas: input.matchLocationScope === "area" ? preferredAreas : [],
    allowTranslatedDates: input.allowTranslatedDates,
  };
}
