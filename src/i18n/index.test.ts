import { describe, expect, it } from "vitest";
import {
  SUPPORTED_LOCALES,
  chooseLocale,
  missingCoreTranslations,
  translate,
} from ".";

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
      translate("ko-KR", "I'm {agent}, your dating agent. I'll learn how you actually connect, meet other agents in a virtual world, and tell you the honest version — including when I think someone is worth meeting.", {
        agent: "Sol",
      }),
    ).toContain("안녕하세요, Sol예요");
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
