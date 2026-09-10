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
  PACKS,
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
    for (const [name, table] of Object.entries({ coachingCopy, dateLetterCopy, productCopy, scoutingCopy })) {
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
    // Words that are the same in that language, checked one by one. every()
    // used to hide a message translated in one locale and English in five;
    // naming the exceptions catches that without flagging real cognates.
    const SAME_IN_LOCALE = new Set([
      "de-DE\u0000Optional",
      "fr-FR\u0000Friction",
      "fr-FR\u0000Menu",
      "fr-FR\u0000Notifications",
      "nl-NL\u0000Alcohol",
      "nl-NL\u0000Home",
      "nl-NL\u0000Menu",
      "nl-NL\u0000Privacy",
    ]);
    const untranslated = [...asked]
      .filter((message) => !PROPER_NOUNS.has(message))
      .flatMap((message) =>
        TRANSLATED_LOCALES.filter(
          (locale) =>
            translate(locale, message) === message &&
            !SAME_IN_LOCALE.has(`${locale}\u0000${message}`),
        ).map((locale) => `${locale}: ${message}`),
      );
    expect(untranslated).toEqual([]);
  });

  // The scan above only sees literal t("…") calls, so keys the app builds at
  // runtime stay invisible to it. The avatar editor asks for `${option} palette`,
  // which is how four of the six were nearly dropped as unused copy.
  // The seven shared tables are merged last-wins over the raw packs, so a key
  // defined twice silently takes the other definition's copy with no diff on
  // the one that looks like it owns the phrase. That is how four chips changed
  // language mid-row, and how 33 pack cells came to disagree with what renders.
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

  // Neither check above looks inside a single pack. "Brief" was defined twice in
  // every one of them, and the later definition — 안내, ガイド, "Guide" — won,
  // so the loop player's first frame said "notice" instead of naming the brief.
  it("never defines the same key twice within one locale pack", () => {
    const src = readFileSync("src/i18n/index.tsx", "utf8");
    const seen = new Map<string, number>();
    for (const block of src.matchAll(
      /(?:Object\.assign\(|const )(ko|ja|de|fr|nl|sv)(?:, |: TranslationPack = )\{([\s\S]*?)\n\}[;)]/g,
    )) {
      for (const entry of block[2].matchAll(
        // No value requirement: prettier wraps long values onto the next
        // line, and 371 of the 1,885 pack entries are written that way.
        /^  (?:"((?:[^"\\]|\\.)+)"|([A-Za-z_$][\w$]*)):/gm,
      )) {
        const id = `${block[1]}\u0000${entry[1] ?? entry[2]}`;
        seen.set(id, (seen.get(id) ?? 0) + 1);
      }
    }
    const repeated = [...seen]
      .filter(([, count]) => count > 1)
      .map(([id, count]) => `${id.replace("\u0000", " pack defines ")} ${count} times`);
    expect(repeated).toEqual([]);
  });

  // The check above compares the tables to each other. This one covers the
  // other direction: a phrase written straight into a locale pack that a table
  // then overrides, leaving dead source that contradicts the live copy.
  it("never defines a table key directly in a locale pack as well", () => {
    const src = readFileSync("src/i18n/index.tsx", "utf8");
    const tableKeys = new Set(
      [
        agentWorkspaceCopy,
        settingsCopy,
        avatarStudioCopy,
        dateLetterCopy,
        scoutingCopy,
        coachingCopy,
        productCopy,
      ].flatMap((table) => Object.keys(table)),
    );
    const shadowed: string[] = [];
    for (const block of src.matchAll(
      /(?:Object\.assign\(|const )(ko|ja|de|fr|nl|sv)(?:, |: TranslationPack = )\{([\s\S]*?)\n\}[;)]/g,
    )) {
      for (const entry of block[2].matchAll(
        // No value requirement: prettier wraps long values onto the next
        // line, and 371 of the 1,885 pack entries are written that way.
        /^  (?:"((?:[^"\\]|\\.)+)"|([A-Za-z_$][\w$]*)):/gm,
      )) {
        const key = entry[1] ?? entry[2];
        if (tableKeys.has(key)) shadowed.push(`${block[1]} pack redefines ${key}`);
      }
    }
    expect(shadowed).toEqual([]);
  });

  // A translation that says "Agent" where the key says "Dating Agent" is not
  // untranslated, so the check above passes it. That is how "Wake your first
  // Dating Agent." kept six values reading plain "Agent", and how the Korean and
  // Japanese coaching copy went on calling it 분신 / 分身 — the word this repo
  // reserves for "second self" — while the other four locales were renamed.
  it("names the product consistently wherever the key does", () => {
    const TERM: Record<string, RegExp> = {
      "ko-KR": /데이트 에이전트/,
      "ja-JP": /デートエージェント/,
      "de-DE": /Dating-Agent/i,
      "fr-FR": /Agent de rencontre/i,
      "nl-NL": /datingagent/i,
      "sv-SE": /dejtingagent/i,
    };
    // Korean and Japanese drop the subject here, and in each case the card
    // heading or field label directly above already names the agent. Nine
    // entries, all pro-drop: an entry for a language that does not drop
    // subjects would be hiding a gap, not recording an idiom.
    const IMPLIED_SUBJECT = new Set([
      "ko-KR\u0000My Dating Agent may meet other agents",
      "ja-JP\u0000My Dating Agent may meet other agents",
      "ko-KR\u0000Your Dating Agent looks for people whose relationship goals fit yours.",
      "ja-JP\u0000Your Dating Agent looks for people whose relationship goals fit yours.",
      "ko-KR\u0000Not quite you? Open the feedback under any line to shape your Dating Agent's voice or share how you felt about the other person.",
      "ja-JP\u0000Not quite you? Open the feedback under any line to shape your Dating Agent's voice or share how you felt about the other person.",
      "ko-KR\u0000Your Dating Agent meets other searching Agents, learns from each conversation, and keeps going when it isn't right. You'll hear from us when there's someone to introduce.",
      "ja-JP\u0000Your Dating Agent meets other searching Agents, learns from each conversation, and keeps going when it isn't right. You'll hear from us when there's someone to introduce.",
      "ja-JP\u0000Your Dating Agent only considers someone when both location settings include each other and both people share a language—or both allow translation.",
    ]);
    // Walk the merged packs, not the tables: 42 keys naming the product live
    // directly in a pack, and a rename that stops halfway there is exactly the
    // defect this guard exists for.
    const keys = new Set(
      Object.values(PACKS)
        .flatMap((pack) => Object.keys(pack ?? {}))
        .filter((key) => /Dating Agent/i.test(key)),
    );
    const wrong: string[] = [];
    for (const key of keys) {
      for (const [locale, term] of Object.entries(TERM)) {
        const value = translate(locale as (typeof TRANSLATED_LOCALES)[number], key);
        if (value === key || term.test(value)) continue;
        if (IMPLIED_SUBJECT.has(`${locale}\u0000${key}`)) continue;
        wrong.push(`${locale}: ${key}`);
      }
    }
    expect(wrong).toEqual([]);
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
