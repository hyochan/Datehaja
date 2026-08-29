import { describe, expect, it } from "vitest";
import {
  MAX_PREVIEW_INTERESTS,
  containsContactInfo,
  describeDistance,
  firstNameOnly,
  redactContactInfo,
  toPublicPreview,
} from "./privacy";
import { coarsen, haversineKm, midpoint } from "./geo";

const fullProfile = {
  displayName: "Alexandra Petrova-Kim",
  ageYears: 29,
  neighborhood: "Seongsu",
  city: "Seoul",
  occupationCategory: "Design",
  showOccupation: true,
  interests: [
    "Films",
    "Running",
    "Coffee",
    "Design",
    "Photography",
    "Travel",
    "Jazz",
  ],
  hobbies: ["Home barista", "Marathon training"],
  languages: ["Korean", "English", "Russian", "French"],
  socialEnergy: "introvert",
  bio: "Documentary editor who loves small cinemas.",
  firstDateVibe: ["Quiet and slow"],
  personalityTraits: ["Curious", "Thoughtful"],
  styleTags: ["Natural"],
  pronouns: "she/her",
  isDemo: false,
};

describe("toPublicPreview", () => {
  it("shows only the first name", () => {
    expect(toPublicPreview(fullProfile).displayName).toBe("Alexandra");
  });

  it("caps how many interests leak out", () => {
    expect(toPublicPreview(fullProfile).interests).toHaveLength(
      MAX_PREVIEW_INTERESTS,
    );
  });

  it("caps languages", () => {
    expect(toPublicPreview(fullProfile).languages).toHaveLength(3);
  });

  it("honours the occupation opt-out", () => {
    expect(toPublicPreview(fullProfile).occupation).toBe("Design");
    expect(
      toPublicPreview({ ...fullProfile, showOccupation: false }).occupation,
    ).toBeNull();
  });

  it("never carries a coordinate, DOB, email, or full name through", () => {
    const preview = toPublicPreview({
      ...fullProfile,
      // Extra fields a caller might accidentally pass in.
      ...({
        dobMs: 123,
        approxLat: 37.5,
        approxLng: 127.0,
        email: "a@b.com",
      } as object),
    });
    const keys = Object.keys(preview);
    expect(keys).not.toContain("dobMs");
    expect(keys).not.toContain("approxLat");
    expect(keys).not.toContain("approxLng");
    expect(keys).not.toContain("email");
    expect(JSON.stringify(preview)).not.toContain("Petrova");
    expect(JSON.stringify(preview)).not.toContain("a@b.com");
  });

  it("marks demo personas so they can never be mistaken for real people", () => {
    expect(toPublicPreview({ ...fullProfile, isDemo: true }).isDemo).toBe(true);
  });

  it("includes only the self-description intended for a match card", () => {
    const preview = toPublicPreview(fullProfile, "serious");
    expect(preview.bio).toContain("Documentary editor");
    expect(preview.personalityTraits).toEqual(["Curious", "Thoughtful"]);
    expect(preview.styleTags).toEqual(["Natural"]);
    expect(preview.relationshipIntent).toBe("serious");
  });
});

describe("firstNameOnly", () => {
  it("keeps a single name as-is", () => {
    expect(firstNameOnly("Mina")).toBe("Mina");
  });

  it("drops everything after the first token", () => {
    expect(firstNameOnly("Kim Min Jae")).toBe("Kim");
  });

  it("survives empty and whitespace input", () => {
    expect(firstNameOnly("")).toBe("Someone");
    expect(firstNameOnly("   ")).toBe("Someone");
  });

  it("truncates an absurdly long token", () => {
    expect(firstNameOnly("A".repeat(120))).toHaveLength(24);
  });
});

describe("redactContactInfo", () => {
  const cases: Array<[string, string]> = [
    ["Email me at alex@example.com", "email"],
    ["My number is +82 10-1234-5678", "phone"],
    ["find me at instagram.com/alex", "url"],
    ["kakao: alexkim", "messenger"],
    ["Line ID: alex_kim", "messenger"],
    ["I'm @alexkim on everything", "handle"],
    ["https://t.me/alexkim", "url"],
  ];

  for (const [input, kind] of cases) {
    it(`removes a ${kind}`, () => {
      const cleaned = redactContactInfo(input);
      expect(cleaned).toContain("[removed]");
      expect(containsContactInfo(input)).toBe(true);
    });
  }

  it("leaves an ordinary bio untouched", () => {
    const bio =
      "I edit documentaries. Big on markets, small on small talk. Will make you try what I ordered.";
    expect(redactContactInfo(bio)).toBe(bio);
    expect(containsContactInfo(bio)).toBe(false);
  });

  it("does not mangle prices or times that merely contain digits", () => {
    const bio = "Usually around 25,000 won and home by 11pm.";
    expect(containsContactInfo(bio)).toBe(false);
  });
});

describe("distance is described, never measured, to another user", () => {
  it("buckets distances into vague phrases", () => {
    expect(describeDistance(0.5)).toBe("Just around the corner");
    expect(describeDistance(4)).toBe("A short ride away");
    expect(describeDistance(10)).toBe("Across town");
    expect(describeDistance(25)).toBe("A bit of a trip");
    expect(describeDistance(300)).toBe("Long distance");
  });

  it("never returns a number", () => {
    for (const km of [0.1, 1, 5, 12, 39, 41, 1000]) {
      expect(describeDistance(km)).not.toMatch(/\d/);
    }
  });
});

describe("geo", () => {
  it("coarsens coordinates to roughly a kilometre", () => {
    expect(coarsen(37.541234)).toBe(37.54);
    expect(coarsen(127.06789)).toBe(127.07);
  });

  it("measures a plausible distance across Seoul", () => {
    const km = haversineKm(37.54, 127.06, 37.5, 127.03);
    expect(km).toBeGreaterThan(3);
    expect(km).toBeLessThan(7);
  });

  it("returns zero for the same point", () => {
    expect(haversineKm(37.54, 127.06, 37.54, 127.06)).toBe(0);
  });

  it("puts the midpoint between two neighbourhoods", () => {
    const mid = midpoint(37.54, 127.06, 37.5, 127.03);
    expect(mid.lat).toBeGreaterThan(37.5);
    expect(mid.lat).toBeLessThan(37.54);
    expect(mid.lng).toBeGreaterThan(127.03);
    expect(mid.lng).toBeLessThan(127.06);
  });

  it("returns a coarsened midpoint so it cannot be inverted", () => {
    const mid = midpoint(37.541111, 127.061111, 37.502222, 127.032222);
    expect(mid.lat).toBe(coarsen(mid.lat));
    expect(mid.lng).toBe(coarsen(mid.lng));
  });
});
