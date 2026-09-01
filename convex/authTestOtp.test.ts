/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

describe("development fixed OTP", () => {
  it("replaces only the current code for the requested test account", async () => {
    const t = convexTest(schema, modules);
    const originalHash = await sha256Hex("12345678");
    const fixedHash = await sha256Hex("68686868");

    const codeId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        email: "hyo+test1@hyo.dev",
      });
      const accountId = await ctx.db.insert("authAccounts", {
        userId,
        provider: "email",
        providerAccountId: "hyo+test1@hyo.dev",
      });
      return await ctx.db.insert("authVerificationCodes", {
        accountId,
        provider: "email",
        code: originalHash,
        expirationTime: Date.now() + 60_000,
        emailVerified: "hyo+test1@hyo.dev",
      });
    });

    const replaced = await t.mutation(
      internal.authTestOtp.overrideVerificationCode,
      {
        email: "hyo+test1@hyo.dev",
        provider: "email",
        originalHash,
        fixedHash,
      },
    );
    expect(replaced).toBe(true);
    expect(
      await t.run((ctx) => ctx.db.get("authVerificationCodes", codeId)),
    ).toMatchObject({ code: fixedHash });

    const staleAttempt = await t.mutation(
      internal.authTestOtp.overrideVerificationCode,
      {
        email: "hyo+test1@hyo.dev",
        provider: "email",
        originalHash,
        fixedHash: await sha256Hex("11111111"),
      },
    );
    expect(staleAttempt).toBe(false);
  });
});
