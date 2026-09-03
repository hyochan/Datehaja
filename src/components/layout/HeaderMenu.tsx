import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { SUPPORTED_LOCALES, useI18n, type LocaleCode } from "../../i18n";

/**
 * The theme lives on the document, and ThemeToggle writes it too. Subscribing
 * to the attribute keeps this panel honest no matter which control changed it;
 * a copy held in local state goes stale the moment the other one is used.
 */
function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function readTheme(): "light" | "dark" {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

/**
 * The small-screen header menu.
 *
 * On a phone the header had the wordmark, a flag, a theme button and a link
 * competing for one row, so the flag crowded the brand. Everything secondary
 * now collapses behind one button. The language list and the theme switch are
 * rendered inline here rather than reusing their own popovers, because a
 * popover opening on top of this panel reads as a bug.
 */
export function HeaderMenu({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  const { locale, setLocale, t } = useI18n();
  const me = useQuery(api.profiles.me);
  const persistPreferredLocale = useMutation(api.profiles.setPreferredLocale);
  const [open, setOpen] = useState(false);
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "light");
  const rootRef = useRef<HTMLDivElement>(null);

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

  function chooseTheme(next: "light" | "dark") {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("datehaja-theme", next);
    } catch {
      /* private mode — the choice just won't persist */
    }
  }

  function chooseLocale(next: LocaleCode) {
    setLocale(next);
    setOpen(false);
    if (me?.profile) {
      void persistPreferredLocale({ locale: next }).catch(() => {
        // Keep the visible locale responsive; the next switch retries.
      });
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t("Menu")}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-raised)] text-[var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[var(--tint-ember-border)]"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
          <path
            d={open ? "M5 5l10 10M15 5L5 15" : "M3.5 6h13M3.5 10h13M3.5 14h13"}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="group"
          aria-label={t("Menu")}
          className="fixed left-3 right-3 top-[4.6rem] z-50 overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--bg-raised)] p-3 shadow-[var(--shadow-lift)]"
        >
          {children && (
            <div className="mb-2 grid gap-1" onClick={() => setOpen(false)}>
              {children}
            </div>
          )}

          <span className="docket-label block px-1 pb-2 pt-1 text-muted">
            {t("Theme")}
          </span>
          <div className="mb-3 grid grid-cols-2 gap-1.5">
            {(["light", "dark"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => chooseTheme(mode)}
                aria-pressed={theme === mode}
                className={`rounded-2xl border px-3 py-2.5 text-[13px] font-bold transition ${
                  theme === mode
                    ? "border-[var(--tint-ember-border)] bg-[var(--tint-ember-bg)] text-[var(--accent-text)]"
                    : "border-transparent text-muted hover:border-[var(--border)] hover:bg-[var(--bg-sunken)]"
                }`}
              >
                {mode === "light" ? t("Light") : t("Dark")}
              </button>
            ))}
          </div>

          <span className="docket-label block px-1 pb-2 text-muted">
            {t("Language and region")}
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {SUPPORTED_LOCALES.map((item) => {
              const active = item.code === locale;
              const [language] = item.nativeName.split(" · ");
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => chooseLocale(item.code)}
                  aria-pressed={active}
                  className={`flex min-w-0 items-center gap-2 rounded-2xl border px-3 py-2.5 text-left transition ${
                    active
                      ? "border-[var(--tint-ember-border)] bg-[var(--tint-ember-bg)]"
                      : "border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-sunken)]"
                  }`}
                >
                  <span className="text-[18px] leading-none" aria-hidden>
                    {item.flag}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] font-bold">
                    {language}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
