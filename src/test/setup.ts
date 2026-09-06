/**
 * The suite renders real components through `I18nProvider`, which chooses its
 * language from `navigator.languages`. Under the `edge-runtime` environment
 * that object reflects the host machine's OS language, so `AgentAvatarEditor`
 * rendered "여성 / 남성" on a Korean machine and "Woman / Man" on CI's English
 * runner — the same commit, three assertions apart, with nothing in the diff
 * to explain it.
 *
 * A test's result must not depend on where it runs. The language is pinned
 * here rather than inside any one test file, so a component test added later
 * inherits the same guarantee without knowing this was ever a problem.
 */

const PINNED_LOCALE = "en-US";

// `initialLocale()` reads `window.navigator`, so that is the object the pin has
// to land on and the one the check below has to read back. Under `edge-runtime`
// it is the same object as the bare global, but reading it through the path the
// code under test uses is what keeps this honest if the environment changes.
// The storage branch above it in `initialLocale()` never fires here: this
// environment has no `localStorage`, so detection always reaches `navigator`.
const host: { navigator?: Navigator } =
  typeof window === "undefined" ? globalThis : window;

if (!host.navigator) {
  throw new Error(
    "test setup: no `navigator` to pin, so the language would vary by host.",
  );
}

for (const [key, value] of [
  ["languages", Object.freeze([PINNED_LOCALE])],
  ["language", PINNED_LOCALE],
] as const) {
  Object.defineProperty(host.navigator, key, { value, configurable: true });
}

// A host object can refuse `defineProperty` without throwing, which would leave
// the suite host-dependent again while looking fixed.
if (
  host.navigator.language !== PINNED_LOCALE ||
  host.navigator.languages[0] !== PINNED_LOCALE
) {
  throw new Error(
    `test setup: could not pin navigator language to ${PINNED_LOCALE}.`,
  );
}
