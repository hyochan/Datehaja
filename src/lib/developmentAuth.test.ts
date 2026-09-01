import { describe, expect, it } from "vitest";
import {
  DEVELOPMENT_SIGN_IN_CODE,
  isLocalDevelopmentTestEmail,
  localDevelopmentCodeFor,
} from "./developmentAuth";

describe("local development authentication", () => {
  it("recognizes the owner and disposable test aliases", () => {
    expect(isLocalDevelopmentTestEmail("hyo@hyo.dev", true)).toBe(true);
    expect(isLocalDevelopmentTestEmail("HYO+test1@HYO.DEV", true)).toBe(true);
    expect(isLocalDevelopmentTestEmail("hyo+test-pair-a@hyo.dev", true)).toBe(
      true,
    );
  });

  it("never exposes the fixed code outside local development", () => {
    expect(localDevelopmentCodeFor("hyo@hyo.dev", false)).toBeNull();
    expect(localDevelopmentCodeFor("person@example.com", true)).toBeNull();
    expect(localDevelopmentCodeFor("hyo+demo@hyo.dev", true)).toBeNull();
  });

  it("returns the shared fixed code for a local test account", () => {
    expect(localDevelopmentCodeFor("hyo+test42@hyo.dev", true)).toBe(
      DEVELOPMENT_SIGN_IN_CODE,
    );
  });
});
