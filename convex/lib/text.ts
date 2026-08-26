/** Input hygiene. Every user-supplied string passes through here before it is
 *  stored, so length limits and control characters are handled in one place. */

export const LIMITS = {
  displayName: 40,
  bio: 600,
  reportDetails: 1000,
  note: 140,
  cancelReason: 300,
  interest: 40,
  interestCount: 12,
  languageCount: 6,
  vibeCount: 5,
  dateTypeCount: 10,
  availabilityWindows: 12,
} as const;

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function clean(input: string, maxLength: number): string {
  return input
    .replace(CONTROL_CHARS, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Multi-line variant — keeps paragraph breaks, drops runs of blank lines. */
export function cleanMultiline(input: string, maxLength: number): string {
  return input
    .replace(CONTROL_CHARS, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

export function cleanList(
  input: string[],
  maxItems: number,
  maxItemLength: number,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input) {
    const value = clean(raw, maxItemLength);
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
    if (out.length >= maxItems) break;
  }
  return out;
}

/** Restrict a free-form list to a known vocabulary. */
export function pickFrom(
  input: string[],
  allowed: readonly string[],
  maxItems: number,
): string[] {
  const allowedSet = new Set(allowed.map((a) => a.toLowerCase()));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input) {
    const key = raw.trim().toLowerCase();
    if (!allowedSet.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push(allowed.find((a) => a.toLowerCase() === key)!);
    if (out.length >= maxItems) break;
  }
  return out;
}

export function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;
  return `${input.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

/** Model output is never trusted verbatim — it is cleaned and capped too. */
export function sanitizeModelText(input: unknown, maxLength: number): string {
  if (typeof input !== "string") return "";
  return truncate(cleanMultiline(input, maxLength * 2), maxLength);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
