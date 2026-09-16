/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const NOW = Date.now();

function asUser(t: ReturnType<typeof convexTest>, userId: Id<"users">) {
  return t.withIdentity({ subject: userId, tokenIdentifier: `test|${userId}` });
}

async function seedPeople(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    async function person(name: string) {
      const userId = await ctx.db.insert("users", {
        name,
        email: `${name.toLowerCase()}@test.invalid`,
      });
      await ctx.db.insert("profiles", {
        userId,
        displayName: name,
        dobMs: NOW - 30 * 365.25 * 24 * 3600_000,
        ageYears: 30,
        ageConfirmed18: true,
        gender: "woman",
        interestedIn: ["man"],
        countryCode: "KR",
        city: "Seoul",
        neighborhood: "Seongsu",
        approxLat: 37.54,
        approxLng: 127.06,
        timezone: "Asia/Seoul",
        bio: "A thoughtful person who likes honest conversations.",
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
      return userId;
    }
    return { alice: await person("Alice"), bob: await person("Bob") };
  });
}

async function storeImage(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const storageId = await ctx.storage.store(
      new Blob(["fake-photo"], { type: "image/png" }),
    );
    await ctx.db.patch("_storage", storageId, { contentType: "image/png" });
    return storageId;
  });
}

describe("profile photo ownership", () => {
  test("a caller cannot attach another person's uploaded photo", async () => {
    const t = convexTest(schema, modules);
    const { alice, bob } = await seedPeople(t);
    const storageId = await storeImage(t);
    await asUser(t, alice).mutation(api.profiles.setPhoto, { storageId });
    await expect(
      asUser(t, bob).mutation(api.profiles.setPhoto, { storageId }),
    ).rejects.toThrow("That upload isn't yours.");
    const bobProfile = await asUser(t, bob).query(api.profiles.me, {});
    expect(bobProfile?.profile?.photoStorageId).toBeUndefined();
  });

  test("the owner can attach their own upload", async () => {
    const t = convexTest(schema, modules);
    const { alice } = await seedPeople(t);
    const storageId = await storeImage(t);
    await asUser(t, alice).mutation(api.profiles.setPhoto, { storageId });
    const mine = await asUser(t, alice).query(api.profiles.me, {});
    expect(mine?.profile?.photoStorageId).toBe(storageId);
  });
});
