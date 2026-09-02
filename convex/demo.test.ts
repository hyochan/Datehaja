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
});
