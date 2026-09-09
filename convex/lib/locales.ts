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

const LANGUAGE_NAME: Record<string, string> = {
  en: "English",
  ko: "Korean",
  ja: "Japanese",
  de: "German",
  fr: "French",
  nl: "Dutch",
  sv: "Swedish",
};

/** The language a supported locale is written in, as a prompt names it. */
export function languageNameForLocale(locale?: string): string {
  return LANGUAGE_NAME[normaliseSupportedLocale(locale).split("-")[0]] ?? "English";
}

/**
 * How a prompt asks for its output language.
 *
 * Naming the language was not enough. Every prompt followed it with a register
 * hint that quoted Korean for every language — "write in English (in Korean,
 * 친근한 반말)" — and a model reading that took the last cue it saw: every
 * verdict on an English account came back in Korean. The hint now exists only
 * in the language it applies to, so the directive never mentions a second one.
 */
export function languageDirective(locale?: string): string {
  const language = languageNameForLocale(locale);
  if (language === "Korean") {
    return "Korean, in natural spoken language. Follow the owner's explicit 존댓말/반말 preference; otherwise use relaxed polite speech with a new acquaintance. Do not switch register merely because the other speaker did.";
  }
  return `${language}, in natural spoken language, honoring the owner's preferred level of formality`;
}

/** A first-turn greeting example in the date's own language, and only that one. */
export function greetingExample(locale: string | undefined, name: string): string {
  const last = name.charCodeAt(name.length - 1);
  const hasFinalConsonant = last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
  return languageNameForLocale(locale) === "Korean"
    ? `"${name}${hasFinalConsonant ? "이에요" : "예요"}."`
    : `"I'm ${name}"`;
}

/** The first-person pronouns to insist on, in the date's own language only. */
export function firstPersonRule(locale?: string): string {
  return languageNameForLocale(locale) === "Korean"
    ? 'Use first-person speech when needed (나/저 matching your register), with natural subject omission. Never say "내 친구" or "네 친구" as a way to speak for your owner.'
    : 'Speak in the first person throughout — "I" — and never say "my friend" or "your friend".';
}

/**
 * What to say about introducing yourself, given which turn this is.
 *
 * The prompt used to ask for an introduction on "your first turn only", but
 * an economy model given every turn the same instruction kept greeting Sol
 * afresh on turn three — and the debrief email quotes those turns. A later
 * turn now gets the opposite instruction, not a caveat on the same one.
 */
export function introductionRule(
  round: number,
  locale: string | undefined,
  name: string,
): string {
  if (round <= 1) {
    return `This is your first turn: introduce yourself briefly in your own preferred register (a neutral example is ${greetingExample(locale, name)}), then get to the point.`;
  }
  return "You already introduced yourself earlier in this conversation. Do not greet again and do not introduce yourself again — pick up exactly where the last message left off.";
}
