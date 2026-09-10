export type MatchLocationScope = "area" | "city" | "selected_cities";


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
