/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const NOW = Date.now();

describe("global demo world", () => {
  test("repairs a cold city with match-ready demo profiles", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("users", {
        name: "New York tester",
        email: "new-york@test.invalid",
      });
      await ctx.db.insert("profiles", {
        userId: id,
        displayName: "New York tester",
        dobMs: NOW - 30 * 365.25 * 24 * 3_600_000,
        ageYears: 30,
        ageConfirmed18: true,
        gender: "woman",
        interestedIn: ["man"],
        countryCode: "US",
        city: "New York",
        neighborhood: "Williamsburg",
        approxLat: 40.71,
        approxLng: -74.01,
        timezone: "America/New_York",
        bio: "A thoughtful test profile.",
        showOccupation: false,
        interests: ["Films"],
        hobbies: [],
        languages: ["English"],
        socialEnergy: "ambivert",
        firstDateVibe: [],
        lifestyle: { smokes: false, drinks: "occasional" },
        onboardingStep: 7,
        onboardingComplete: true,
        status: "active",
        moderationStatus: "ok",
        isDemo: false,
        updatedAt: NOW,
      });
      return id;
    });

    await expect(
      t.query(internal.demo.hasReadyWorldFor, { userId }),
    ).resolves.toBe(false);

    await t.mutation(internal.demo.seed, { nowMs: NOW });

    await expect(
      t.query(internal.demo.hasReadyWorldFor, { userId }),
    ).resolves.toBe(true);
    const newYorkDemos = await t.run((ctx) =>
      ctx.db
        .query("profiles")
        .withIndex("by_status_and_city", (q) =>
          q.eq("status", "active").eq("city", "New York"),
        )
        .take(40),
    );
    expect(newYorkDemos.filter((profile) => profile.isDemo)).toHaveLength(4);
  });


  test("retires the cast seeded under the product's previous name", async () => {
    const t = convexTest(schema, modules);
    const legacy = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        name: "Narae",
        // The address the seed used before the product was renamed.
        email: "narae@demo.datedrop.invalid",
      });
      await ctx.db.insert("profiles", {
        userId,
        displayName: "Narae",
        dobMs: NOW - 30 * 365.25 * 24 * 3_600_000,
        ageYears: 30,
        ageConfirmed18: true,
        gender: "woman",
        interestedIn: ["man"],
        countryCode: "KR",
        city: "Seoul",
        neighborhood: "Yeonnam",
        approxLat: 37.56,
        approxLng: 126.92,
        timezone: "Asia/Seoul",
        bio: "Seeded before matching boundaries existed.",
        showOccupation: false,
        interests: ["Films"],
        hobbies: [],
        languages: ["Korean"],
        socialEnergy: "ambivert",
        firstDateVibe: [],
        lifestyle: { smokes: false, drinks: "social" },
        onboardingStep: 7,
        onboardingComplete: true,
        status: "active",
        moderationStatus: "ok",
        isDemo: true,
        updatedAt: NOW,
      });
      return userId;
    });

    const result = await t.mutation(internal.demo.seed, { nowMs: NOW });
    expect(result.retired).toBe(1);

    const [retired, current] = await t.run(async (ctx) => {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", legacy))
        .unique();
      const user = await ctx.db
        .query("users")
        .withIndex("email", (q) =>
          q.eq("email", "alex@demo.datehaja.invalid"),
        )
        .first();
      const alex = user
        ? await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .unique()
        : null;
      return [profile, alex];
    });

    // Paused, not deleted: dates and messages that reference it stay intact.
    expect(retired?.status).toBe("paused");
    expect(retired?.isDemo).toBe(true);
    // The current cast is untouched by the retirement pass.
    expect(current?.status).toBe("active");

    // Running it again finds nothing left to retire.
    expect((await t.mutation(internal.demo.seed, { nowMs: NOW })).retired).toBe(
      0,
    );
  });
});
