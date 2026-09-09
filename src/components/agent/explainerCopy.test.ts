import { describe, expect, test } from "vitest";
import { learningLoopText } from "./learningLoopCopy";
import { systemDiagramText } from "./systemDiagramCopy";

/**
 * The explainer copy lives in typed objects rather than the shared key tables,
 * so the pack-width guard in src/i18n cannot see it. TypeScript proves every
 * locale has every field; these checks cover what it cannot — empty strings,
 * short arrays, English left in a translated pack, and text pasted from the
 * wrong language.
 */
const LOCALES = ["ko-KR", "ja-JP", "de-DE", "fr-FR", "nl-NL", "sv-SE"] as const;

const HANGUL = /[가-힯]/;
const KANA = /[぀-ヿ]/;
const HAN = /[一-鿿]/;
const CYRILLIC = /[Ѐ-ӿ]/;

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

const packs = LOCALES.map((locale) => ({
  locale,
  loop: learningLoopText(locale),
  diagram: systemDiagramText(locale),
}));

describe("explainer copy", () => {
  test("every locale fills every string and every list", () => {
    for (const { locale, loop, diagram } of packs) {
      expect({ locale, empty: strings({ loop, diagram }).filter((s) => !s.trim()) })
        .toEqual({ locale, empty: [] });
      expect({ locale, steps: loop.steps.length, examples: loop.examples.length })
        .toEqual({ locale, steps: 4, examples: 3 });
      expect({
        locale,
        messages: diagram.messages.length,
        routes: diagram.sequenceRoutes.length,
        mobile: diagram.mobile.length,
      }).toEqual({ locale, messages: 5, routes: 5, mobile: 6 });
    }
  });

  test("no translated locale silently falls back to English", () => {
    const english = strings({
      loop: learningLoopText("en-US"),
      diagram: systemDiagramText("en-US"),
    });
    for (const { locale, loop, diagram } of packs) {
      const shared = strings({ loop, diagram }).filter((s) => english.includes(s));
      // A handful of words are legitimately identical across languages
      // ("Pause", "Agent"); a whole pack falling through is not.
      expect({ locale, sharedWithEnglish: shared.length < 8 }).toEqual({
        locale,
        sharedWithEnglish: true,
      });
    }
  });

  test("no locale carries text from another language's script", () => {
    for (const { locale, loop, diagram } of packs) {
      const all = strings({ loop, diagram }).join("\n");
      expect({ locale, cyrillic: CYRILLIC.test(all) }).toEqual({ locale, cyrillic: false });
      if (locale !== "ko-KR") {
        expect({ locale, hangul: HANGUL.test(all) }).toEqual({ locale, hangul: false });
      }
      if (!["ko-KR", "ja-JP"].includes(locale)) {
        expect({ locale, cjk: HAN.test(all) || KANA.test(all) }).toEqual({ locale, cjk: false });
      }
    }
    // The Japanese pack really is Japanese, not romanised or copied English.
    expect(KANA.test(strings(systemDiagramText("ja-JP")).join(""))).toBe(true);
  });
});
