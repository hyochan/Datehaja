/** Keep a mail deep link inside the app through OTP and OAuth sign-in. */
export function safeAppDestination(next: string | null): string {
  if (!next?.startsWith("/") || next.startsWith("//") || (next.includes("\\") || [...next].some(c => c.charCodeAt(0) <= 32))) return "/dashboard";
  try {
    const url = new URL(next, "https://datehaja.invalid");
    return url.origin === "https://datehaja.invalid" ? `${url.pathname}${url.search}${url.hash}` : "/dashboard";
  } catch { return "/dashboard"; }
}
