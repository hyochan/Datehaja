import { describe, expect, it } from "vitest";
import {
  generateEmailOtp,
  isDevelopmentOtpEmail,
  otpEmailContent,
} from "./authEmail";

describe("passwordless email authentication", () => {
  it("generates eight numeric digits, including leading zeroes", () => {
    for (let index = 0; index < 50; index += 1) {
      expect(generateEmailOtp()).toMatch(/^\d{8}$/);
    }
  });

  it("builds a code-only email without exposing a sign-in URL", () => {
    const content = otpEmailContent({
      token: "00427310",
      expires: new Date("2026-09-01T00:10:00.000Z"),
    });
    expect(content.subject).toContain("00427310");
    expect(content.text).toContain("expires in 10 minutes");
    expect(content.html).toContain("00427310");
    expect(content.html).not.toContain("href=");
  });

  it("limits fixed development codes to test aliases and an allowlist", () => {
    expect(isDevelopmentOtpEmail("HYO+test1@HYO.DEV", "")).toBe(true);
    expect(isDevelopmentOtpEmail("hyo+test-pair-a@hyo.dev", "")).toBe(true);
    expect(isDevelopmentOtpEmail("owner@hyo.dev", "owner@hyo.dev")).toBe(true);
    expect(isDevelopmentOtpEmail("stranger@hyo.dev", "owner@hyo.dev")).toBe(
      false,
    );
    expect(isDevelopmentOtpEmail("hyo+demo@hyo.dev", "")).toBe(false);
  });
});
