/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { LEGAL_VERSIONS, legalVersionsMatch } from "./lib/legal";

const modules = import.meta.glob("./**/*.ts");

function asUser(t: ReturnType<typeof convexTest>, userId: Id<"users">) {
  return t.withIdentity({ subject: userId, tokenIdentifier: `test|${userId}` });
}

async function user(t: ReturnType<typeof convexTest>) {
  return await t.run((ctx) =>
    ctx.db.insert("users", {
      name: "Legal Test",
      email: "legal@test.invalid",
    }),
  );
}

describe("versioned legal acknowledgement", () => {
  test("matches only the complete current version set", () => {
    expect(legalVersionsMatch(LEGAL_VERSIONS)).toBe(true);
    expect(legalVersionsMatch({ ...LEGAL_VERSIONS, privacy: "outdated" })).toBe(
      false,
    );
  });

  test("reports no acceptance to a signed-out visitor", async () => {
    const t = convexTest(schema, modules);
    const status = await t.query(api.legal.status, {});
    expect(status).toMatchObject({ signedIn: false, accepted: false });
    expect(status.currentVersions).toEqual(LEGAL_VERSIONS);
  });

  test("requires every agreement, adulthood, and the current versions", async () => {
    const t = convexTest(schema, modules);
    const userId = await user(t);
    const authed = asUser(t, userId);

    await expect(
      authed.mutation(api.legal.accept, {
        versions: LEGAL_VERSIONS,
        termsAccepted: true,
        privacyAcknowledged: false,
        communityAccepted: true,
        ageConfirmed: true,
        locale: "en-US",
      }),
    ).rejects.toThrow(/Privacy Notice/);

    await expect(
      authed.mutation(api.legal.accept, {
        versions: LEGAL_VERSIONS,
        termsAccepted: true,
        privacyAcknowledged: true,
        communityAccepted: true,
        ageConfirmed: false,
        locale: "en-US",
      }),
    ).rejects.toThrow(/18 or over/);

    await expect(
      authed.mutation(api.legal.accept, {
        versions: { ...LEGAL_VERSIONS, terms: "old" },
        termsAccepted: true,
        privacyAcknowledged: true,
        communityAccepted: true,
        ageConfirmed: true,
        locale: "en-US",
      }),
    ).rejects.toThrow(/changed/);
  });

  test("stores one auditable record and unlocks onboarding", async () => {
    const t = convexTest(schema, modules);
    const userId = await user(t);
    const authed = asUser(t, userId);

    const before = await authed.query(api.profiles.onboardingState, {});
    expect(before).toMatchObject({ complete: false, legalAccepted: false });

    const first = await authed.mutation(api.legal.accept, {
      versions: LEGAL_VERSIONS,
      termsAccepted: true,
      privacyAcknowledged: true,
      communityAccepted: true,
      ageConfirmed: true,
      locale: "ko-KR",
    });
    expect(first.acceptedAt).toBeTypeOf("number");

    await authed.mutation(api.legal.accept, {
      versions: LEGAL_VERSIONS,
      termsAccepted: true,
      privacyAcknowledged: true,
      communityAccepted: true,
      ageConfirmed: true,
      locale: "en-US",
    });

    const status = await authed.query(api.legal.status, {});
    expect(status).toMatchObject({ signedIn: true, accepted: true });
    const after = await authed.query(api.profiles.onboardingState, {});
    expect(after.legalAccepted).toBe(true);

    const stored = await t.run((ctx) =>
      ctx.db
        .query("legalConsents")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
    );
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      termsVersion: LEGAL_VERSIONS.terms,
      privacyVersion: LEGAL_VERSIONS.privacy,
      communityVersion: LEGAL_VERSIONS.community,
      ageConfirmed: true,
      locale: "en-US",
    });

    const audits = await t.run((ctx) =>
      ctx.db.query("auditEvents").order("desc").take(10),
    );
    expect(audits.some((event) => event.action === "legal.accepted")).toBe(
      true,
    );
  });
});
