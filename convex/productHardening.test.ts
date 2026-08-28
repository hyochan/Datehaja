/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { buildCalendar, calendarEventStatus } from "./lib/calendar";

const modules = import.meta.glob("./**/*.ts");
const NOW = Date.now();

function asUser(t: ReturnType<typeof convexTest>, userId: Id<"users">) {
  return t.withIdentity({ subject: userId, tokenIdentifier: `test|${userId}` });
}

async function createDrop(
  t: ReturnType<typeof convexTest>,
  status: "inviting" | "confirmed" | "completed" = "confirmed",
) {
  return await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {
      name: "Mina",
      email: "mina@test.invalid",
    });
    const strangerId = await ctx.db.insert("users", {
      name: "Stranger",
      email: "stranger@test.invalid",
    });
    const startMs = NOW - 3 * 60 * 60 * 1000;
    const endMs = NOW - 60 * 60 * 1000;
    const dropId = await ctx.db.insert("dateDrops", {
      status,
      initiatorUserId: userId,
      countryCode: "KR",
      city: "Seoul",
      area: "Seongsu",
      approxLat: 37.54,
      approxLng: 127.06,
      timezone: "Asia/Seoul",
      startMs,
      endMs,
      title: "Dinner then dessert",
      theme: "Dinner → dessert",
      summary: "A private plan.",
      whyItFits: "You both like films.",
      itinerary: [
        {
          order: 0,
          venueName: "Test Trattoria",
          category: "restaurant",
          startOffsetMin: 0,
          durationMin: 90,
          address: "1 Test Road",
          note: "",
          mapsQuery: "Test Trattoria Seoul",
          confidence: "high",
        },
      ],
      estimatedDurationMin: 120,
      estimatedCostPerPerson: 45000,
      currency: "KRW",
      meetingInstructions: "Meet inside.",
      confirmDeadlineMs: startMs - 24 * 60 * 60 * 1000,
      candidateAttempts: 1,
      maxCandidateAttempts: 4,
      confirmedAt:
        status === "inviting" ? undefined : NOW - 24 * 60 * 60 * 1000,
      completedAt: status === "completed" ? NOW : undefined,
      isDemo: false,
      updatedAt: NOW,
    });
    const participantId = await ctx.db.insert("dateDropParticipants", {
      dropId,
      userId,
      role: "initiator",
      state: status === "inviting" ? "accepted" : "confirmed",
      privateWhyItFits: "Because films.",
      compatibilityBlurb: "You both like films.",
      invitedAt: NOW - 2 * 24 * 60 * 60 * 1000,
      respondedAt: NOW - 24 * 60 * 60 * 1000,
      calendarReservedAt: NOW - 24 * 60 * 60 * 1000,
    });
    return { userId, strangerId, dropId, participantId, startMs, endMs };
  });
}

describe("calendar lifecycle", () => {
  test("maps the existing participant lifecycle to iCalendar states", () => {
    expect(
      calendarEventStatus({
        dropStatus: "partially_accepted",
        participantState: "accepted",
        reservedAt: NOW,
      }),
    ).toBe("TENTATIVE");
    expect(
      calendarEventStatus({
        dropStatus: "confirmed",
        participantState: "confirmed",
        reservedAt: NOW,
      }),
    ).toBe("CONFIRMED");
    expect(
      calendarEventStatus({
        dropStatus: "expired_no_match",
        participantState: "expired",
        reservedAt: NOW,
      }),
    ).toBe("CANCELLED");
    expect(
      calendarEventStatus({
        dropStatus: "expired_no_match",
        participantState: "expired",
      }),
    ).toBeNull();
  });

  test("emits a stable, escaped iCalendar event", () => {
    const calendar = buildCalendar([
      {
        uid: "drop-1@datedrop",
        startMs: Date.UTC(2026, 7, 30, 9),
        endMs: Date.UTC(2026, 7, 30, 11),
        updatedAt: NOW,
        status: "TENTATIVE",
        summary: "DateDrop · reserved",
        description: "One line\nAnother, private line",
        location: "Seongsu; Seoul",
        url: "https://example.convex.site/drop/1",
      },
    ]);
    expect(calendar).toContain("STATUS:TENTATIVE\r\n");
    expect(calendar).toContain(
      "DESCRIPTION:One line\\nAnother\\, private line",
    );
    expect(calendar).toContain("LOCATION:Seongsu\\; Seoul");
    expect(calendar.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  test("the private feed updates one event from reserved to finalized to cancelled", async () => {
    const t = convexTest(schema, modules);
    const fixture = await createDrop(t, "inviting");
    const token = "a".repeat(64);
    await t.run((ctx) =>
      ctx.db.insert("calendarFeeds", {
        userId: fixture.userId,
        token,
        createdAt: NOW,
        updatedAt: NOW,
      }),
    );

    const reserved = await t.query(internal.calendar.getFeedByToken, { token });
    expect(reserved?.events).toHaveLength(1);
    expect(reserved?.events[0]?.status).toBe("TENTATIVE");

    await t.run(async (ctx) => {
      await ctx.db.patch("dateDrops", fixture.dropId, {
        status: "confirmed",
        updatedAt: NOW + 1,
      });
      await ctx.db.patch("dateDropParticipants", fixture.participantId, {
        state: "confirmed",
      });
    });
    const finalized = await t.query(internal.calendar.getFeedByToken, {
      token,
    });
    expect(finalized?.events[0]?.status).toBe("CONFIRMED");

    await t.run(async (ctx) => {
      await ctx.db.patch("dateDrops", fixture.dropId, {
        status: "cancelled",
        updatedAt: NOW + 2,
      });
      await ctx.db.patch("dateDropParticipants", fixture.participantId, {
        state: "cancelled",
      });
    });
    const cancelled = await t.query(internal.calendar.getFeedByToken, {
      token,
    });
    expect(cancelled?.events[0]?.status).toBe("CANCELLED");
  });
});

describe("private post-date feedback", () => {
  test("a participant can save and update a private response", async () => {
    const t = convexTest(schema, modules);
    const fixture = await createDrop(t, "completed");
    const user = asUser(t, fixture.userId);

    await user.mutation(api.feedback.submit, {
      dropId: fixture.dropId,
      outcome: "went",
      safety: "safe",
      meetAgain: "maybe",
      venueRating: 5,
      followUpRequested: false,
    });
    expect(
      await user.query(api.feedback.mine, { dropId: fixture.dropId }),
    ).toMatchObject({
      outcome: "went",
      safety: "safe",
      meetAgain: "maybe",
      venueRating: 5,
    });

    await user.mutation(api.feedback.submit, {
      dropId: fixture.dropId,
      outcome: "went",
      safety: "uncomfortable",
      meetAgain: "no",
      followUpRequested: true,
    });
    const rows = await t.run((ctx) =>
      ctx.db
        .query("dateFeedback")
        .withIndex("by_drop_and_user", (q) =>
          q.eq("dropId", fixture.dropId).eq("userId", fixture.userId),
        )
        .collect(),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.followUpRequested).toBe(true);
  });

  test("a stranger cannot submit feedback for someone else's date", async () => {
    const t = convexTest(schema, modules);
    const fixture = await createDrop(t, "completed");
    await expect(
      asUser(t, fixture.strangerId).mutation(api.feedback.submit, {
        dropId: fixture.dropId,
        outcome: "went",
        safety: "safe",
        meetAgain: "yes",
        followUpRequested: false,
      }),
    ).rejects.toThrow(/isn't yours/);
  });
});

describe("trusted contact safety setup", () => {
  test("requires consent and remains scoped to the signed-in user", async () => {
    const t = convexTest(schema, modules);
    const fixture = await createDrop(t, "confirmed");
    const user = asUser(t, fixture.userId);

    await expect(
      user.mutation(api.safety.saveSafetyProfile, {
        trustedContactName: "Alex",
        trustedContactEmail: "alex@example.com",
        trustedContactConsent: false,
        postDateCheckIn: true,
      }),
    ).rejects.toThrow(/agreed/);

    await user.mutation(api.safety.saveSafetyProfile, {
      trustedContactName: "Alex",
      trustedContactEmail: "alex@example.com",
      trustedContactConsent: true,
      postDateCheckIn: true,
    });
    expect(await user.query(api.safety.mySafetyProfile, {})).toEqual({
      trustedContactName: "Alex",
      trustedContactEmail: "alex@example.com",
      trustedContactConsent: true,
      postDateCheckIn: true,
    });

    const share = await user.mutation(api.safety.sharePlan, {
      dropId: fixture.dropId,
    });
    expect(share.status).toBe("queued");
  });
});
