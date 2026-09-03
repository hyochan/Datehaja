export const SUPPORTED_LOCALES = [
  "en-US",
  "en-GB",
  "en-CA",
  "en-AU",
  "ko-KR",
  "ja-JP",
  "de-DE",
  "fr-FR",
  "nl-NL",
  "sv-SE",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const COUNTRY_DEFAULT_LOCALE: Record<string, SupportedLocale> = {
  AU: "en-AU",
  CA: "en-CA",
  DE: "de-DE",
  FR: "fr-FR",
  GB: "en-GB",
  JP: "ja-JP",
  KR: "ko-KR",
  NL: "nl-NL",
  SE: "sv-SE",
  US: "en-US",
};

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function normaliseSupportedLocale(
  value?: string,
  countryCode?: string,
): SupportedLocale {
  if (value && isSupportedLocale(value)) return value;
  return COUNTRY_DEFAULT_LOCALE[countryCode?.toUpperCase() ?? ""] ?? "en-US";
}

/**
 * Profile languages are free-standing catalogue names; dates are conducted in a
 * locale. Only languages the product actually speaks appear here — a pair whose
 * only shared language is one we cannot write in falls back to the requester's
 * own locale rather than pretending.
 */
const LOCALE_FOR_LANGUAGE: Record<string, SupportedLocale> = {
  english: "en-US",
  korean: "ko-KR",
  japanese: "ja-JP",
  german: "de-DE",
  french: "fr-FR",
  dutch: "nl-NL",
  swedish: "sv-SE",
};

/** The catalogue language a supported locale is written in. */
export function languageForLocale(locale: SupportedLocale): string {
  const language = locale.split("-")[0];
  const found = Object.entries(LOCALE_FOR_LANGUAGE).find(([, value]) =>
    value.startsWith(`${language}-`),
  );
  return found?.[0] ?? "english";
}

/**
 * The language two Agents hold their date in.
 *
 * The requester's own locale wins whenever both people read it, so the date
 * matches the debrief email they will be sent. It only moves when the other
 * person does not share that language — a date neither side can read is worse
 * than one conducted in their common tongue.
 */
export function sharedDateLocale(
  preferred: SupportedLocale,
  sharedLanguages: readonly string[],
): SupportedLocale {
  const shared = sharedLanguages
    .map((language) => language.trim().toLowerCase())
    .filter(Boolean);
  if (shared.length === 0) return preferred;
  if (shared.includes(languageForLocale(preferred))) return preferred;
  for (const language of shared) {
    const locale = LOCALE_FOR_LANGUAGE[language];
    if (locale) return locale;
  }
  return preferred;
}
