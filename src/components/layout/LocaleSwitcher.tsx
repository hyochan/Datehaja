import { SUPPORTED_LOCALES, useI18n, type LocaleCode } from "../../i18n";

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <label
      className="relative inline-flex items-center"
      title={t("Language and region")}
    >
      <span className="sr-only">{t("Language and region")}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as LocaleCode)}
        aria-label={t("Language and region")}
        className={`appearance-none rounded-full border border-[var(--border)] bg-[var(--bg-raised)] font-sans font-bold uppercase tracking-[0.06em] text-[var(--text)] outline-none transition-colors hover:border-[var(--tint-ember-border)] focus:border-ember-400 ${
          compact
            ? "h-9 w-[4.1rem] pl-2 pr-5 text-[9px]"
            : "h-10 max-w-[12rem] pl-3 pr-7 text-[10px]"
        }`}
      >
        {SUPPORTED_LOCALES.map((item) => (
          <option key={item.code} value={item.code}>
            {compact ? item.region : item.nativeName}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-2 text-[9px] text-muted"
      >
        ▾
      </span>
    </label>
  );
}
