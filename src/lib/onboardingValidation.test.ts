import { describe, expect, it } from "vitest";
import {
  ABOUT_ME_MIN_ESSENCE_CHARACTERS,
  IDEAL_PERSON_MIN_CHARACTERS,
  getAboutMeProgress,
  getIdealPersonProgress,
} from "./onboardingValidation";

describe("ideal-person onboarding validation", () => {
  it("shows the exact amount of meaningful text still needed", () => {
    const progress = getIdealPersonProgress(["woman"], "   thoughtful   ");

    expect(progress.descriptionLength).toBe("thoughtful".length);
    expect(progress.descriptionRemaining).toBe(
      IDEAL_PERSON_MIN_CHARACTERS - "thoughtful".length,
    );
    expect(progress.completedRequirements).toBe(1);
    expect(progress.isReady).toBe(false);
  });

  it("requires both an audience and a 20-character description", () => {
    const description = "12345678901234567890";

    expect(getIdealPersonProgress([], description)).toMatchObject({
      completedRequirements: 1,
      isReady: false,
    });
    expect(getIdealPersonProgress(["woman"], description)).toMatchObject({
      completedRequirements: 2,
      isReady: true,
    });
  });
});

describe("about-me onboarding validation", () => {
  const now = Date.UTC(2026, 8, 2, 12);

  it("reports every unfinished requirement separately", () => {
    const progress = getAboutMeProgress(
      {
        displayName: "A",
        dob: "19870206",
        interests: ["Films", "Coffee"],
        personalityTraits: ["Calm"],
        essence: "Too short",
      },
      now,
    );

    expect(progress).toMatchObject({
      completedRequirements: 0,
      hasAdultDob: false,
      hasEssence: false,
      hasInterests: false,
      hasName: false,
      hasPersonality: false,
      isReady: false,
    });
    expect(progress.essenceRemaining).toBe(
      ABOUT_ME_MIN_ESSENCE_CHARACTERS - "Too short".length,
    );
  });

  it("accepts a complete adult profile at the exact thresholds", () => {
    const progress = getAboutMeProgress(
      {
        displayName: "Jo",
        dob: "2008-09-02",
        interests: ["Films", "Coffee", "Museums"],
        personalityTraits: ["Calm", "Curious"],
        essence: "123456789012345678901234567890",
      },
      now,
    );

    expect(progress).toMatchObject({
      age: 18,
      completedRequirements: 5,
      isReady: true,
    });
  });

  it("uses a saved verified age only while the date field stays empty", () => {
    expect(
      getAboutMeProgress(
        {
          displayName: "Jo",
          dob: "",
          existingAge: 34,
          interests: [],
          personalityTraits: [],
          essence: "",
        },
        now,
      ).hasAdultDob,
    ).toBe(true);
    expect(
      getAboutMeProgress(
        {
          displayName: "Jo",
          dob: "not-a-date",
          existingAge: 34,
          interests: [],
          personalityTraits: [],
          essence: "",
        },
        now,
      ).hasAdultDob,
    ).toBe(false);
  });
});
