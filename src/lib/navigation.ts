/**
 * Dashboard `?date=` values we will send to Convex. The client validator for
 * `v.id("agentDates")` throws on anything else, and an uncaught `useQuery`
 * throw blanks the page. Callers still have to treat a well-formed id that
 * Convex rejects (wrong table, never existed) as missing.
 */
export function parseAgentDateSearchParam(raw: string | null): string | null {
  if (!raw) return null;
  return /^[a-z0-9]{20,}$/.test(raw) ? raw : null;
}

/** Keep a mail deep link inside the app through OTP and OAuth sign-in. */
export function safeAppDestination(next: string | null): string {
  if (!next?.startsWith("/") || next.startsWith("//") || (next.includes("\\") || [...next].some(c => c.charCodeAt(0) <= 32))) return "/dashboard";
  try {
    const url = new URL(next, "https://datehaja.invalid");
    return url.origin === "https://datehaja.invalid" ? `${url.pathname}${url.search}${url.hash}` : "/dashboard";
  } catch { return "/dashboard"; }
}
