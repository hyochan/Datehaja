import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AVATAR_PALETTES } from "@convex/lib/agentAvatar";
import {
  ACCESSIBILITY_OPTIONS,
  DATE_TYPE_OPTIONS,
  DIETARY_OPTIONS,
  PERSONALITY_TRAIT_OPTIONS,
  STYLE_TAG_OPTIONS,
} from "@convex/lib/catalog";
import {
  SUPPORTED_LOCALES,
  agentWorkspaceCopy,
  avatarStudioCopy,
  dateLetterCopy,
  settingsCopy,
  chooseLocale,
  missingCoreTranslations,
  translate,
} from ".";
import { coachingCopy } from "./coachingCopy";
import { productCopy } from "./productCopy";
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
      "Let my Dating Agent date",
      "My Dating Agent may meet other agents",
      "Private instructions",
      "How my Dating Agent represents me",
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
    for (const [name, table] of Object.entries({ coachingCopy, productCopy, scoutingCopy })) {
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

  // Starts from the call sites rather than the pack, so a t("…") with no row
  // anywhere is caught. It sees string literals only: a key passed as a
  // variable, like the identity chip's t(option.label), still needs a reader.
  it("translates every string the app asks for", () => {
    const PROPER_NOUNS = new Set(["Agent", "Scout Pass", "Datehaja"]);
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.tsx?$/.test(full) && !full.includes(".test.")) files.push(full);
      }
    };
    walk("src");
    const asked = new Set<string>();
    for (const file of files) {
      // Both call shapes: t("…"), and translate(locale, "…") where the key is
      // the second argument. Missing the latter is how the page title and meta
      // description were deleted as unused — their only callers are the ones
      // inside this module.
      for (const m of readFileSync(file, "utf8").matchAll(
        /\bt\(\s*"((?:[^"\\]|\\.)+)"|\btranslate\(\s*[A-Za-z_$][\w$]*\s*,\s*\n?\s*"((?:[^"\\]|\\.)+)"/g,
      )) {
        asked.add(m[1] ?? m[2]);
      }
    }
    const untranslated = [...asked]
      .filter((message) => !PROPER_NOUNS.has(message))
      .filter((message) =>
        TRANSLATED_LOCALES.every((locale) => translate(locale, message) === message),
      );
    expect(untranslated).toEqual([]);
  });

  // The scan above only sees literal t("…") calls, so keys the app builds at
  // runtime stay invisible to it. The avatar editor asks for `${option} palette`,
  // which is how four of the six were nearly dropped as unused copy.
  // The seven shared tables are merged last-wins, so a key defined twice
  // silently takes the other table's copy with no diff on the table that owns
  // it. That is how four chips changed language mid-row.
  //
  // Known hole: this compares the tables only to each other. 21 keys are also
  // defined directly in the ko/ja/de/… packs, where the merge below overrides
  // them, and 33 of those cells disagree with what actually renders.
  it("defines every shared key in exactly one table", () => {
    const tables = {
      agentWorkspaceCopy,
      settingsCopy,
      avatarStudioCopy,
      dateLetterCopy,
      scoutingCopy,
      coachingCopy,
      productCopy,
    };
    const owners = new Map<string, string[]>();
    for (const [name, table] of Object.entries(tables)) {
      for (const key of Object.keys(table)) {
        owners.set(key, [...(owners.get(key) ?? []), name]);
      }
    }
    const shadowed = [...owners]
      .filter(([, names]) => names.length > 1)
      .map(([key, names]) => `${key} defined in ${names.join(" and ")}`);
    expect(shadowed).toEqual([]);
  });

  it("translates every key the app builds at runtime", () => {
    const asked = AVATAR_PALETTES.map((palette) => `${palette} palette`);
    // some(), not every(): one locale missing the row is the failure to catch,
    // and these six keys have no proper-noun rendering that equals the source.
    const untranslated = asked.flatMap((message) =>
      TRANSLATED_LOCALES.filter((locale) => translate(locale, message) === message)
        .map((locale) => `${locale}: ${message}`),
    );
    expect(untranslated).toEqual([]);
  });

  // Reads the pack source, so copy added straight to the Korean pack — quoted
  // or as a bare identifier, which is how eleven keys stayed hidden — cannot
  // slip past again.
  it("has no Korean-only copy anywhere in the pack source", () => {
    const src = readFileSync("src/i18n/index.tsx", "utf8");
    const keys = new Set<string>();
    for (const m of src.matchAll(/^  "((?:[^"\\]|\\.)+)":\s*"/gm)) keys.add(m[1]);
    for (const m of src.matchAll(/^  ([A-Za-z_$][\w$]*):\s*"/gm)) keys.add(m[1]);
    const koreanOnly = [...keys]
      .filter((message) => translate("ko-KR", message) !== message)
      .filter((message) =>
        TRANSLATED_LOCALES.filter((l) => l !== "ko-KR").every(
          (locale) => translate(locale, message) === message,
        ),
      );
    expect(koreanOnly).toEqual([]);
  });

  // A row in the table cannot fall through to English, so "resolves to its own
  // key" proves nothing here — plenty of labels are the same word in several
  // languages (Yoga, Jazz, Design, Hindi). Korean never legitimately equals an
  // English label, so that is the cell worth asserting on.
  it("gives every product-copy row real Korean", () => {
    const untranslated = Object.keys(productCopy).filter(
      (message) => translate("ko-KR", message) === message,
    );
    expect(untranslated).toEqual([]);
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
