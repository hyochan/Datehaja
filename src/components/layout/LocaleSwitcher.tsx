import { useEffect, useRef, useState } from "react";
import { SUPPORTED_LOCALES, useI18n, type LocaleCode } from "../../i18n";

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected =
    SUPPORTED_LOCALES.find((item) => item.code === locale) ??
    SUPPORTED_LOCALES[0];

  useEffect(() => {
    if (!open) return;

    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const selectLocale = (next: LocaleCode) => {
    setLocale(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("Language and region")}
        onClick={() => setOpen((value) => !value)}
        className={`group inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-raised)] shadow-[var(--shadow-soft)] transition hover:border-[var(--tint-ember-border)] hover:bg-[var(--tint-ember-bg)] ${
          compact ? "h-10 gap-1.5 px-2.5 sm:px-3" : "h-11 gap-2 px-3.5"
        }`}
      >
        <span className="text-[18px] leading-none" aria-hidden>
          {selected.flag}
        </span>
        <span
          className={`font-mono text-[9px] font-bold tracking-[0.08em] text-[var(--text)] ${
            compact ? "hidden min-[430px]:inline" : "inline"
          }`}
        >
          {compact ? selected.region : selected.nativeName}
        </span>
        <svg
          className={`h-3 w-3 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
        >
          <path
            d="m3 4.5 3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className="fixed left-4 right-4 top-[4.65rem] z-50 w-auto overflow-hidden rounded-[1.6rem] border border-[var(--border)] bg-[var(--bg-raised)] p-2.5 shadow-[var(--shadow-lift)] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+0.65rem)] sm:w-[min(21rem,calc(100vw-2rem))]"
          role="listbox"
          aria-label={t("Language and region")}
        >
          <div className="flex items-center justify-between px-2.5 pb-2 pt-1">
            <span className="docket-label text-muted">
              {t("Language and region")}
            </span>
            <span className="text-[15px] text-[var(--accent-text)]" aria-hidden>
              ♡
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {SUPPORTED_LOCALES.map((item) => {
              const active = item.code === locale;
              const [language, country] = item.nativeName.split(" · ");

              return (
                <button
                  key={item.code}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => selectLocale(item.code)}
                  className={`flex min-w-0 items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition ${
                    active
                      ? "border-[var(--tint-ember-border)] bg-[var(--tint-ember-bg)]"
                      : "border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-sunken)]"
                  }`}
                >
                  <span className="text-[21px] leading-none" aria-hidden>
                    {item.flag}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-bold">
                      {language}
                    </span>
                    <span className="mt-0.5 block truncate text-[9px] text-muted">
                      {country}
                    </span>
                  </span>
                  {active && (
                    <span className="text-[11px] font-bold text-[var(--accent-text)]">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
