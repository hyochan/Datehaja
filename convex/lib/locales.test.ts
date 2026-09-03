import { describe, expect, test } from "vitest";
import {
  languageForLocale,
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
