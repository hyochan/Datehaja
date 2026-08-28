/** Time + availability helpers. Everything is stored as UTC epoch millis;
 *  timezone strings are IANA identifiers used only for display. */

export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

export type Window = { startMs: number; endMs: number };

/** Intersection of two windows, or null when they do not truly overlap. */
export function intersectWindows(a: Window, b: Window): Window | null {
  const startMs = Math.max(a.startMs, b.startMs);
  const endMs = Math.min(a.endMs, b.endMs);
  return endMs > startMs ? { startMs, endMs } : null;
}

export function overlapMinutes(a: Window, b: Window): number {
  const i = intersectWindows(a, b);
  return i ? Math.round((i.endMs - i.startMs) / MINUTE_MS) : 0;
}

/** A real date needs a real block of time, not a 15-minute brush. */
export const MIN_OVERLAP_MINUTES = 90;

export function hasUsableOverlap(a: Window, b: Window): boolean {
  return overlapMinutes(a, b) >= MIN_OVERLAP_MINUTES;
}

/**
 * Confirmation deadline: matching stops this long before the date starts.
 * Defaults to 24h, but never in the past and never after the date itself —
 * a drop planned for tonight still gets a (shorter) window.
 */
export function computeConfirmDeadline(
  startMs: number,
  nowMs: number,
  leadMs: number = DAY_MS,
): number {
  const ideal = startMs - leadMs;
  if (ideal > nowMs) return ideal;
  // Short-notice drop: give it half the remaining time, at least 30 minutes.
  const remaining = startMs - nowMs;
  if (remaining <= 0) return nowMs;
  return nowMs + Math.max(30 * MINUTE_MS, Math.floor(remaining / 2));
}

export function isFuture(ms: number, nowMs: number): boolean {
  return ms > nowMs;
}

/** Windows must be in the future, sane in length, and not absurdly far out. */
export const MIN_WINDOW_MINUTES = 90;
export const MAX_WINDOW_HOURS = 12;
export const MAX_LEAD_DAYS = 60;

export type WindowValidation = { ok: true } | { ok: false; reason: string };

export function validateAvailabilityWindow(
  w: Window,
  nowMs: number,
): WindowValidation {
  if (!Number.isFinite(w.startMs) || !Number.isFinite(w.endMs)) {
    return { ok: false, reason: "Invalid time." };
  }
  if (w.endMs <= w.startMs) {
    return { ok: false, reason: "End time must be after the start time." };
  }
  if (w.startMs <= nowMs) {
    return { ok: false, reason: "Availability must be in the future." };
  }
  const minutes = (w.endMs - w.startMs) / MINUTE_MS;
  if (minutes < MIN_WINDOW_MINUTES) {
    return { ok: false, reason: "Give us at least a 90-minute window." };
  }
  if (minutes > MAX_WINDOW_HOURS * 60) {
    return { ok: false, reason: "Keep a single window under 12 hours." };
  }
  if (w.startMs > nowMs + MAX_LEAD_DAYS * DAY_MS) {
    return { ok: false, reason: "We only plan up to 60 days ahead." };
  }
  return { ok: true };
}

/** True when two windows belonging to the same user collide. */
export function windowsCollide(a: Window, b: Window): boolean {
  return a.startMs < b.endMs && b.startMs < a.endMs;
}

/**
 * Pick the actual date start inside an overlap: begin at the overlap start,
 * rounded up to the next half hour, leaving room for the planned duration.
 */
export function chooseDateStart(
  overlap: Window,
  durationMin: number,
): number | null {
  const rounded = Math.ceil(overlap.startMs / (30 * MINUTE_MS)) * (30 * MINUTE_MS);
  if (rounded + durationMin * MINUTE_MS > overlap.endMs) {
    // Fall back to the raw overlap start if rounding pushed us out of range.
    if (overlap.startMs + durationMin * MINUTE_MS <= overlap.endMs) {
      return overlap.startMs;
    }
    return null;
  }
  return rounded;
}

const WEEKEND_DAYS = new Set([0, 6]);

/** Day-of-week in a given IANA timezone (0 = Sunday). */
export function weekdayInZone(ms: number, timeZone: string): number {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(new Date(ms));
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
}

export function isWeekend(ms: number, timeZone: string): boolean {
  return WEEKEND_DAYS.has(weekdayInZone(ms, timeZone));
}

export function formatInZone(
  ms: number,
  timeZone: string,
  opts: Intl.DateTimeFormatOptions = {},
): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, ...opts }).format(
    new Date(ms),
  );
}

/** "Saturday, 7:00 PM" — the phrasing used in invitations and emails. */
export function describeDateTime(ms: number, timeZone: string): string {
  const day = formatInZone(ms, timeZone, { weekday: "long", month: "short", day: "numeric" });
  const time = formatInZone(ms, timeZone, { hour: "numeric", minute: "2-digit" });
  return `${day} · ${time}`;
}
