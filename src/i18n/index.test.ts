import { describe, expect, it } from "vitest";
import {
  ACCESSIBILITY_OPTIONS,
  DATE_TYPE_OPTIONS,
  DIETARY_OPTIONS,
  PERSONALITY_TRAIT_OPTIONS,
  STYLE_TAG_OPTIONS,
} from "@convex/lib/catalog";
import {
  SUPPORTED_LOCALES,
  chooseLocale,
  missingCoreTranslations,
  translate,
} from ".";
import { coachingCopy } from "./coachingCopy";
import { scoutingCopy } from "./scoutingCopy";

describe("internationalisation", () => {
  it("offers ten distinct country locales", () => {
    expect(SUPPORTED_LOCALES).toHaveLength(10);
    expect(new Set(SUPPORTED_LOCALES.map((item) => item.code)).size).toBe(10);
    expect(new Set(SUPPORTED_LOCALES.map((item) => item.region)).size).toBe(10);
  });

  it("prefers an exact country locale", () => {
    expect(chooseLocale(["en-AU", "en-US"])).toBe("en-AU");
    expect(chooseLocale(["ko-KR"])).toBe("ko-KR");
  });

  it("falls back by language and then to US English", () => {
    expect(chooseLocale(["fr-BE"])).toBe("fr-FR");
    expect(chooseLocale(["pt-BR"])).toBe("en-US");
  });

  it("interpolates translated accessibility labels", () => {
    expect(
      translate("ko-KR", "Notifications, {count} unread", { count: 3 }),
    ).toBe("읽지 않은 알림 3개");
  });

  it("localizes the agent workspace, replay world, and saved prompts", () => {
    expect(
      translate(
        "ko-KR",
        "I'm {agent} — your second self. Tell me what you're actually like, and I'll go on the date in your place, as you. Then I'll come home and tell you honestly what I thought.",
        {
          agent: "Sol",
        },
      ),
    ).toContain("안녕! 나는 Sol — 너의 또 다른 나야");
    expect(translate("ko-KR", "The last showing")).toBe(
      "마지막 상영이 끝난 뒤",
    );
    expect(
      translate(
        "ja-JP",
        "Think of someone you felt instantly at ease with. What did they do that made it easy?",
      ),
    ).not.toMatch(/^Think of someone/);
  });

  it("localizes every new matching-boundary control", () => {
    const boundaryMessages = [
      "MATCHING BOUNDARY",
      "Where may {agent} look?",
      "A match happens only when both people's location choices include each other.",
      "My selected area",
      "Anywhere in my city",
      "Cities I choose",
      "Languages you can comfortably use",
      "Choose at least one. A shared language is required unless both people allow translation.",
      "Allow translated Agent dates",
      "Only when the other person opts in too.",
    ];

    for (const locale of [
      "ko-KR",
      "ja-JP",
      "de-DE",
      "fr-FR",
      "nl-NL",
      "sv-SE",
    ] as const) {
      for (const message of boundaryMessages) {
        expect(translate(locale, message, { agent: "Juno" })).not.toBe(message);
      }
    }
  });

  it("keeps preference chips out of English on the Korean surface", () => {
    const labels = [
      ...DATE_TYPE_OPTIONS.map((option) => option.label),
      ...PERSONALITY_TRAIT_OPTIONS,
      ...STYLE_TAG_OPTIONS,
      ...DIETARY_OPTIONS.map((option) => option.label),
      ...ACCESSIBILITY_OPTIONS.map((option) => option.label),
      "Optional",
    ];

    for (const label of labels) {
      expect(translate("ko-KR", label)).not.toBe(label);
    }
  });

  it("localizes the complete Agent settings surface", () => {
    const settingsMessages = [
      "Private control room",
      "Agent settings",
      "Let my agent date",
      "My agent may meet other agents",
      "Private instructions",
      "How my agent represents me",
      "What arrives by email",
      "Agent debriefs",
      "Mutual introductions",
      "Profile, matching, and policy",
      "Blocked people",
    ];

    for (const locale of [
      "ko-KR",
      "ja-JP",
      "de-DE",
      "fr-FR",
      "nl-NL",
      "sv-SE",
    ] as const) {
      for (const message of settingsMessages) {
        expect(translate(locale, message)).not.toBe(message);
      }
    }
  });

  // CORE_TRANSLATION_MESSAGES only walks the German pack, so copy added to one
  // pack alone is invisible to the check below. These two guard the tables that
  // are meant to fill every pack at once.
  const TRANSLATED_LOCALES = [
    "ko-KR",
    "ja-JP",
    "de-DE",
    "fr-FR",
    "nl-NL",
    "sv-SE",
  ] as const;

  it("gives every shared copy table one entry per translated locale", () => {
    for (const [name, table] of Object.entries({ coachingCopy, scoutingCopy })) {
      for (const [message, values] of Object.entries(table)) {
        expect(
          { table: name, message, count: values.length },
          `${name}[${message}] must cover all ${TRANSLATED_LOCALES.length} translated locales`,
        ).toEqual({
          table: name,
          message,
          count: TRANSLATED_LOCALES.length,
        });
        expect(values.every((value) => value.trim().length > 0)).toBe(true);
      }
    }
  });

  it("translates the per-turn coaching surface in every locale", () => {
    for (const locale of TRANSLATED_LOCALES) {
      const untranslated = Object.keys(coachingCopy).filter(
        (message) => translate(locale, message) === message,
      );
      expect(untranslated).toEqual([]);
    }
  });

  it("has complete core copy for every non-English locale", () => {
    const legitimatelyIdentical = new Set([
      "Match",
      "AUG / SEOUL",
      "Notifications",
      "Privacy",
      "Home",
      "person",
      "Open",
      "Budget",
      "Text",
      "Brief",
      "Man",
      "Agent",
      "Menu",
      "Japan",
      "Canada",
      "France",
    ]);
    for (const locale of [
      "ko-KR",
      "ja-JP",
      "de-DE",
      "fr-FR",
      "nl-NL",
      "sv-SE",
    ] as const) {
      expect(
        missingCoreTranslations(locale).filter(
          (message) => !legitimatelyIdentical.has(message),
        ),
      ).toEqual([]);
    }
  });
});
