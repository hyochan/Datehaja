import { describe, expect, it } from "vitest";
import {
  DAY_MS,
  HOUR_MS,
  MIN_OVERLAP_MINUTES,
  chooseDateStart,
  computeConfirmDeadline,
  describeDateTime,
  hasUsableOverlap,
  intersectWindows,
  isWeekend,
  overlapMinutes,
  validateAvailabilityWindow,
  weekdayInZone,
  windowsCollide,
} from "./time";

const NOW = Date.UTC(2026, 7, 27, 12, 0, 0); // Thursday 27 Aug 2026, 12:00 UTC

describe("window intersection", () => {
  it("returns the overlapping slice", () => {
    expect(
      intersectWindows({ startMs: 0, endMs: 100 }, { startMs: 50, endMs: 200 }),
    ).toEqual({ startMs: 50, endMs: 100 });
  });

  it("returns null when the windows only touch", () => {
    expect(
      intersectWindows({ startMs: 0, endMs: 100 }, { startMs: 100, endMs: 200 }),
    ).toBeNull();
  });

  it("returns null when the windows are disjoint", () => {
    expect(
      intersectWindows({ startMs: 0, endMs: 100 }, { startMs: 300, endMs: 400 }),
    ).toBeNull();
  });

  it("counts overlap in whole minutes", () => {
    expect(
      overlapMinutes({ startMs: 0, endMs: 3 * HOUR_MS }, { startMs: HOUR_MS, endMs: 5 * HOUR_MS }),
    ).toBe(120);
  });

  it("requires a genuinely usable block of shared time", () => {
    const a = { startMs: 0, endMs: 3 * HOUR_MS };
    const brush = { startMs: 3 * HOUR_MS - 40 * 60_000, endMs: 6 * HOUR_MS };
    expect(overlapMinutes(a, brush)).toBeLessThan(MIN_OVERLAP_MINUTES);
    expect(hasUsableOverlap(a, brush)).toBe(false);

    const real = { startMs: HOUR_MS, endMs: 6 * HOUR_MS };
    expect(hasUsableOverlap(a, real)).toBe(true);
  });

  it("detects collisions between a user's own windows", () => {
    expect(
      windowsCollide({ startMs: 0, endMs: 100 }, { startMs: 50, endMs: 150 }),
    ).toBe(true);
    expect(
      windowsCollide({ startMs: 0, endMs: 100 }, { startMs: 100, endMs: 150 }),
    ).toBe(false);
  });
});

describe("confirmation deadline", () => {
  it("defaults to 24 hours before the date", () => {
    const start = NOW + 7 * DAY_MS;
    expect(computeConfirmDeadline(start, NOW)).toBe(start - DAY_MS);
  });

  it("never lands in the past for a short-notice date", () => {
    const start = NOW + 4 * HOUR_MS;
    const deadline = computeConfirmDeadline(start, NOW);
    expect(deadline).toBeGreaterThan(NOW);
    expect(deadline).toBeLessThan(start);
  });

  it("leaves at least 30 minutes to respond", () => {
    const start = NOW + 40 * 60_000;
    const deadline = computeConfirmDeadline(start, NOW);
    expect(deadline - NOW).toBeGreaterThanOrEqual(30 * 60_000);
  });

  it("collapses to now when the date has already started", () => {
    expect(computeConfirmDeadline(NOW - HOUR_MS, NOW)).toBe(NOW);
  });
});

describe("availability validation", () => {
  const ok = { startMs: NOW + 2 * DAY_MS, endMs: NOW + 2 * DAY_MS + 4 * HOUR_MS };

  it("accepts a sensible future window", () => {
    expect(validateAvailabilityWindow(ok, NOW)).toEqual({ ok: true });
  });

  it("rejects a window in the past", () => {
    const result = validateAvailabilityWindow(
      { startMs: NOW - DAY_MS, endMs: NOW - DAY_MS + 3 * HOUR_MS },
      NOW,
    );
    expect(result.ok).toBe(false);
  });

  it("rejects an inverted window", () => {
    const result = validateAvailabilityWindow(
      { startMs: ok.endMs, endMs: ok.startMs },
      NOW,
    );
    expect(result.ok).toBe(false);
  });

  it("rejects a window shorter than 90 minutes", () => {
    const result = validateAvailabilityWindow(
      { startMs: ok.startMs, endMs: ok.startMs + 60 * 60_000 },
      NOW,
    );
    expect(result.ok).toBe(false);
  });

  it("rejects a window longer than 12 hours", () => {
    const result = validateAvailabilityWindow(
      { startMs: ok.startMs, endMs: ok.startMs + 14 * HOUR_MS },
      NOW,
    );
    expect(result.ok).toBe(false);
  });

  it("rejects a window more than 60 days out", () => {
    const result = validateAvailabilityWindow(
      { startMs: NOW + 90 * DAY_MS, endMs: NOW + 90 * DAY_MS + 3 * HOUR_MS },
      NOW,
    );
    expect(result.ok).toBe(false);
  });

  it("rejects non-finite input", () => {
    expect(validateAvailabilityWindow({ startMs: Number.NaN, endMs: 1 }, NOW).ok).toBe(
      false,
    );
  });
});

describe("choosing the date start", () => {
  it("rounds up to the next half hour inside the overlap", () => {
    const overlap = { startMs: Date.UTC(2026, 7, 29, 9, 7), endMs: Date.UTC(2026, 7, 29, 14, 0) };
    const start = chooseDateStart(overlap, 120);
    expect(start).not.toBeNull();
    expect(start! % (30 * 60_000)).toBe(0);
    expect(start!).toBeGreaterThanOrEqual(overlap.startMs);
  });

  it("falls back to the raw start when rounding would overflow", () => {
    const overlap = {
      startMs: Date.UTC(2026, 7, 29, 9, 1),
      endMs: Date.UTC(2026, 7, 29, 10, 32),
    };
    expect(chooseDateStart(overlap, 90)).toBe(overlap.startMs);
  });

  it("returns null when the date cannot fit at all", () => {
    const overlap = {
      startMs: Date.UTC(2026, 7, 29, 9, 0),
      endMs: Date.UTC(2026, 7, 29, 10, 0),
    };
    expect(chooseDateStart(overlap, 180)).toBeNull();
  });
});

describe("timezone-aware helpers", () => {
  it("reads the weekday in the target zone, not the server's", () => {
    // 2026-08-29 23:00 UTC is already Sunday in Seoul (UTC+9).
    const instant = Date.UTC(2026, 7, 29, 23, 0);
    expect(weekdayInZone(instant, "Asia/Seoul")).toBe(0); // Sunday
    expect(weekdayInZone(instant, "America/New_York")).toBe(6); // still Saturday
  });

  it("classifies weekends per zone", () => {
    const instant = Date.UTC(2026, 7, 28, 23, 0); // Fri 23:00 UTC = Sat 08:00 Seoul
    expect(isWeekend(instant, "Asia/Seoul")).toBe(true);
    expect(isWeekend(instant, "America/New_York")).toBe(false);
  });

  it("describes a time in the date's own timezone", () => {
    const instant = Date.UTC(2026, 7, 29, 10, 0); // 19:00 in Seoul
    expect(describeDateTime(instant, "Asia/Seoul")).toContain("7:00 PM");
    expect(describeDateTime(instant, "Asia/Seoul")).toContain("Saturday");
  });
});
