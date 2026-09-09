import { describe, expect, test } from "vitest";
import {
  firstPersonRule,
  greetingExample,
  introductionRule,
  languageDirective,
  languageForLocale,
  languageNameForLocale,
  normaliseSupportedLocale,
  sharedDateLocale,
} from "./locales";

describe("sharedDateLocale", () => {
  test("keeps the requester's locale when the other person reads it", () => {
    expect(sharedDateLocale("ko-KR", ["Korean", "English"])).toBe("ko-KR");
    expect(sharedDateLocale("en-GB", ["English"])).toBe("en-GB");
  });

  test("moves to the common language when the requester's is not shared", () => {
    expect(sharedDateLocale("ko-KR", ["English"])).toBe("en-US");
    expect(sharedDateLocale("en-US", ["Korean"])).toBe("ko-KR");
  });

  test("keeps the requester's locale when nothing is shared", () => {
    // Translated dates: both sides opted in, so no common tongue exists.
    expect(sharedDateLocale("ko-KR", [])).toBe("ko-KR");
  });

  test("ignores languages the product cannot write", () => {
    expect(sharedDateLocale("ko-KR", ["Mandarin", "Thai"])).toBe("ko-KR");
    expect(sharedDateLocale("ko-KR", ["Mandarin", "Japanese"])).toBe("ja-JP");
  });

  test("treats every English variant as one language", () => {
    expect(languageForLocale("en-AU")).toBe("english");
    expect(sharedDateLocale("en-AU", ["English", "Korean"])).toBe("en-AU");
  });

  test("survives the casing and spacing a profile may carry", () => {
    expect(sharedDateLocale("en-US", [" korean "])).toBe("ko-KR");
  });
});

describe("normaliseSupportedLocale", () => {
  test("falls back to the country default, then English", () => {
    expect(normaliseSupportedLocale(undefined, "KR")).toBe("ko-KR");
    expect(normaliseSupportedLocale("zz-ZZ", "JP")).toBe("ja-JP");
    expect(normaliseSupportedLocale(undefined, undefined)).toBe("en-US");
  });
});

describe("languageDirective", () => {
  // Every verdict on an English account came back in Korean because the
  // directive quoted a Korean register hint after naming English. A directive
  // may name exactly one language.
  test("never mentions a second language", () => {
    for (const locale of ["en-US", "en-GB", "ja-JP", "de-DE", "fr-FR", "nl-NL", "sv-SE"]) {
      const directive = languageDirective(locale);
      expect(directive).toContain(languageNameForLocale(locale));
      expect(directive).not.toMatch(/[가-힣]/);
      expect(greetingExample(locale, "Juno")).not.toMatch(/[가-힣]/);
      expect(firstPersonRule(locale)).not.toMatch(/[가-힣]/);
    }
  });

  test("honors owner formality instead of forcing informal speech", () => {
    expect(languageDirective("ko-KR")).toContain("Korean");
    expect(languageDirective("ko-KR")).toContain("존댓말/반말 preference");
    expect(languageDirective("ko-KR")).toContain("Do not switch register");
    expect(greetingExample("ko-KR", "Sol")).toBe('"Sol예요."');
    expect(firstPersonRule("ko-KR")).toContain("내 친구");
  });

  test("falls back to English for an unknown or missing locale", () => {
    expect(languageDirective(undefined)).toMatch(/^English/);
    expect(languageDirective("zz-ZZ")).toMatch(/^English/);
  });
});

describe("introductionRule", () => {
  test("asks for an introduction on the first turn only", () => {
    expect(introductionRule(1, "en-US", "Juno")).toContain('"I\'m Juno"');
    expect(introductionRule(1, "ko-KR", "Sol")).toContain("Sol예요.");
    expect(introductionRule(1, "ko-KR", "봄")).toContain("봄이에요.");
    expect(introductionRule(1, "ko-KR", "루")).toContain("루예요.");
  });

  test("forbids greeting again on every later turn", () => {
    for (const round of [2, 3, 6]) {
      const rule = introductionRule(round, "en-US", "Juno");
      expect(rule).toContain("Do not greet again");
      expect(rule).not.toContain("I'm Juno");
    }
  });
});
