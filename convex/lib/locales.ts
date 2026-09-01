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
