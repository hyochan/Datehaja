/**
 * Age, computed the way a calendar computes it.
 *
 * The obvious implementation — divide elapsed milliseconds by an averaged
 * 365.2425-day year and floor — is wrong on your birthday. An 18-year span
 * containing only four leap days is a few hours short of 18 averaged years, so
 * someone turning 18 today reads as 17 and is refused sign-up. Comparing
 * calendar fields instead is exact, and gives the client and the server the
 * same answer.
 *
 * Dates of birth are anchored at UTC noon so no timezone can shift the day.
 */

export function dobToMs(year: number, month: number, day: number): number {
  return Date.UTC(year, month - 1, day, 12, 0, 0, 0);
}

export function parseDobString(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ms = dobToMs(year, month, day);
  if (!Number.isFinite(ms)) return null;
  const parsed = new Date(ms);
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }
  return ms;
}

/** Completed years between a date of birth and a moment. */
export function ageOn(dobMs: number, nowMs: number): number {
  if (!Number.isFinite(dobMs) || !Number.isFinite(nowMs)) return -1;
  const dob = new Date(dobMs);
  const now = new Date(nowMs);

  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - dob.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getUTCDate() < dob.getUTCDate())
  ) {
    age -= 1;
  }
  return age;
}

export const MIN_AGE = 18;
export const MAX_AGE = 120;

export function isAdult(dobMs: number, nowMs: number): boolean {
  return ageOn(dobMs, nowMs) >= MIN_AGE;
}
