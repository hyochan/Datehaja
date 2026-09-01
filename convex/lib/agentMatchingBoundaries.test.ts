import { describe, expect, it } from "vitest";
import {
  hasCompleteMatchingBoundaries,
  mutualMatchingBoundaries,
} from "./agentMatchingBoundaries";

type MatchProfile = Parameters<typeof mutualMatchingBoundaries>[0];
type MatchPreferences = NonNullable<
  Parameters<typeof mutualMatchingBoundaries>[1]
>;

function profile(overrides: Partial<MatchProfile> = {}): MatchProfile {
  return {
    countryCode: "KR",
    city: "Seoul",
    neighborhood: "Seongsu",
    languages: ["Korean", "English"],
    ...overrides,
  };
}

function preferences(
  overrides: Partial<MatchPreferences> = {},
): MatchPreferences {
  return {
    matchLocationScope: "city",
    preferredCountryCodes: ["KR"],
    preferredCities: ["Seoul"],
    preferredAreas: [],
    allowTranslatedDates: false,
    ...overrides,
  };
}

describe("Agent matching boundaries", () => {
  it("requires explicit location, language, and translation choices", () => {
    expect(hasCompleteMatchingBoundaries(profile(), preferences())).toBe(true);
    expect(
      hasCompleteMatchingBoundaries(profile({ languages: [] }), preferences()),
    ).toBe(false);
    expect(
      hasCompleteMatchingBoundaries(profile(), {
        ...preferences(),
        allowTranslatedDates: undefined,
      }),
    ).toBe(false);
    expect(
      hasCompleteMatchingBoundaries(profile(), {
        ...preferences(),
        matchLocationScope: "area",
      }),
    ).toBe(false);
  });

  it("allows a same-city pair with a shared spoken language", () => {
    expect(
      mutualMatchingBoundaries(
        profile(),
        preferences(),
        profile({ neighborhood: "Yeonnam" }),
        preferences(),
      ),
    ).toEqual({
      ok: true,
      sharedLanguages: ["Korean", "English"],
      translated: false,
    });
  });

  it("requires each person to include the other's city for cross-border dates", () => {
    const seoul = profile();
    const tokyo = profile({
      countryCode: "JP",
      city: "Tokyo",
      neighborhood: "Shibuya",
      languages: ["Japanese", "English"],
    });
    const seoulOpenToTokyo = preferences({
      matchLocationScope: "selected_cities",
      preferredCountryCodes: ["JP"],
      preferredCities: ["Tokyo"],
    });
    const tokyoOpenToSeoul = preferences({
      matchLocationScope: "selected_cities",
      preferredCountryCodes: ["KR"],
      preferredCities: ["Seoul"],
    });

    expect(
      mutualMatchingBoundaries(
        seoul,
        seoulOpenToTokyo,
        tokyo,
        tokyoOpenToSeoul,
      ),
    ).toMatchObject({ ok: true, translated: false });
    expect(
      mutualMatchingBoundaries(
        seoul,
        seoulOpenToTokyo,
        tokyo,
        preferences({
          preferredCountryCodes: ["JP"],
          preferredCities: ["Tokyo"],
        }),
      ),
    ).toEqual({ ok: false, reason: "outside_candidate_location" });
  });

  it("allows different languages only when both people opt into translation", () => {
    const korean = profile({ languages: ["Korean"] });
    const english = profile({ languages: ["English"] });
    expect(
      mutualMatchingBoundaries(
        korean,
        preferences({ allowTranslatedDates: true }),
        english,
        preferences({ allowTranslatedDates: false }),
      ),
    ).toEqual({
      ok: false,
      reason: "language_not_mutually_supported",
    });
    expect(
      mutualMatchingBoundaries(
        korean,
        preferences({ allowTranslatedDates: true }),
        english,
        preferences({ allowTranslatedDates: true }),
      ),
    ).toEqual({ ok: true, sharedLanguages: [], translated: true });
  });

  it("honors a mutually selected neighborhood boundary", () => {
    const seongsuOnly = preferences({
      matchLocationScope: "area",
      preferredAreas: ["Seongsu"],
    });
    expect(
      mutualMatchingBoundaries(
        profile(),
        seongsuOnly,
        profile({ neighborhood: "Yeonnam" }),
        preferences({
          matchLocationScope: "area",
          preferredAreas: ["Seongsu"],
        }),
      ),
    ).toEqual({ ok: false, reason: "outside_seeker_location" });
  });
});
