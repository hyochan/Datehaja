import { ageOn, parseDobString } from "@convex/lib/age";

/** Display helpers. All times render in the viewer's own timezone. */

export function localTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function formatDateTime(ms: number, timeZone?: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timeZone || localTimezone(),
  }).format(new Date(ms));
}

export function formatDay(ms: number, timeZone?: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: timeZone || localTimezone(),
  }).format(new Date(ms));
}

export function formatTime(ms: number, timeZone?: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timeZone || localTimezone(),
  }).format(new Date(ms));
}

export function formatRange(startMs: number, endMs: number, timeZone?: string): string {
  return `${formatTime(startMs, timeZone)} – ${formatTime(endMs, timeZone)}`;
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function relativeTime(ms: number, nowMs = Date.now()): string {
  const diff = ms - nowMs;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (abs < minute) return "just now";
  if (abs < hour) return rtf.format(Math.round(diff / minute), "minute");
  if (abs < day) return rtf.format(Math.round(diff / hour), "hour");
  if (abs < 30 * day) return rtf.format(Math.round(diff / day), "day");
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(ms));
}

export function countdown(toMs: number, nowMs = Date.now()): string {
  const diff = toMs - nowMs;
  if (diff <= 0) return "closed";
  const hours = Math.floor(diff / 3_600_000);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} left`;
  }
  if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"} left`;
  const minutes = Math.max(1, Math.floor(diff / 60_000));
  return `${minutes} min left`;
}

export function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return `${hours} hr`;
  return `${hours} hr ${rest} min`;
}

/** Build a maps search link. We only ever link to a public venue. */
export function mapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Date-only string in the local timezone for <input type="date">. */
export function toDateInputValue(ms: number, timeZone?: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone || localTimezone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(ms));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "01";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Offset (ms) of a zone at a given instant. Positive east of UTC. */
function zoneOffsetMs(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
  );
  return asUtc - utcMs;
}

/**
 * Turn a wall-clock date + time in a specific zone into a UTC timestamp.
 *
 * "Saturday 7pm" means 7pm where the date will happen — not 7pm wherever the
 * browser happens to be. Two passes handle DST boundaries.
 */
export function fromDateAndTime(
  dateValue: string,
  timeValue: string,
  timeZone?: string,
): number {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);
  const zone = timeZone || localTimezone();
  const naive = Date.UTC(year, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0, 0, 0);
  const firstPass = naive - zoneOffsetMs(naive, zone);
  return naive - zoneOffsetMs(firstPass, zone);
}

/**
 * Age and DOB both come from convex/lib/age.ts, so the client can never
 * disagree with the server about whether someone is 18 — which would show a
 * valid adult a "you must be 18" error on their birthday.
 */
export function ageFromDateString(value: string, nowMs = Date.now()): number | null {
  const dobMs = parseDobString(value);
  if (dobMs === null) return null;
  return ageOn(dobMs, nowMs);
}

export function dobStringToMs(value: string): number {
  return parseDobString(value) ?? Number.NaN;
}
