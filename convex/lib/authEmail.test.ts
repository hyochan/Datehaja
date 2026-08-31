import { describe, expect, it } from "vitest";
import { generateEmailOtp, otpEmailContent } from "./authEmail";

describe("passwordless email authentication", () => {
  it("generates six numeric digits, including leading zeroes", () => {
    for (let index = 0; index < 50; index += 1) {
      expect(generateEmailOtp()).toMatch(/^\d{6}$/);
    }
  });

  it("builds a code-only email without exposing a sign-in URL", () => {
    const content = otpEmailContent({
      token: "042731",
      expires: new Date("2026-09-01T00:10:00.000Z"),
    });
    expect(content.subject).toContain("042731");
    expect(content.text).toContain("expires in 10 minutes");
    expect(content.html).toContain("042731");
    expect(content.html).not.toContain("href=");
  });
});
