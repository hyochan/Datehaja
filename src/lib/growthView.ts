/**
 * Whether this page view should count as a visit.
 *
 * A headless browser driving the app is our own tooling — the end-to-end
 * suites and the screenshot scripts — and counting it makes every funnel
 * review argue with our own activity. `navigator.webdriver` is set by the
 * automation protocols and by nothing a person browses with, so it separates
 * the two without inspecting anything about the visitor.
 */
export function isAutomatedBrowser(): boolean {
  return typeof navigator !== "undefined" && navigator.webdriver === true;
}

/**
 * The durable, anonymous id a visit is attributed to.
 *
 * Random and stored locally: it links a person's own landing view to their own
 * onboarding start, and says nothing else about them.
 */
export function anonymousVisitorId(): string {
  const key = "datehaja-anonymous-id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(key, created);
  return created;
}

/** True the first time this browsing session reaches `key`. */
export function firstTimeThisSession(key: string): boolean {
  if (sessionStorage.getItem(key)) return false;
  sessionStorage.setItem(key, "1");
  return true;
}
