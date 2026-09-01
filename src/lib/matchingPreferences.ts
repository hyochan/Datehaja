export type MatchLocationScope = "area" | "city" | "selected_cities";

export const LANGUAGE_NATIVE_NAMES: Record<string, string> = {
  English: "English",
  Korean: "한국어",
  Japanese: "日本語",
  Mandarin: "普通话",
  Cantonese: "廣東話",
  Spanish: "Español",
  French: "Français",
  German: "Deutsch",
  Italian: "Italiano",
  Portuguese: "Português",
  Russian: "Русский",
  Arabic: "العربية",
  Hindi: "हिन्दी",
  Vietnamese: "Tiếng Việt",
  Thai: "ไทย",
  Indonesian: "Bahasa Indonesia",
  Dutch: "Nederlands",
  Swedish: "Svenska",
};

export function defaultLanguageForLocale(locale: string): string {
  const language = locale.split("-")[0];
  return (
    {
      ko: "Korean",
      ja: "Japanese",
      de: "German",
      fr: "French",
      nl: "Dutch",
      sv: "Swedish",
    }[language] ?? "English"
  );
}
