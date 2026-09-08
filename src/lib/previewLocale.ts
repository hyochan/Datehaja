import { useEffect } from "react";
import { activeLocale, useI18n, type LocaleCode } from "../i18n";

/**
 * The fictional preview records are written in one language, so those pages
 * force it on arrival. The override is deliberately not persisted: the landing
 * page links here from every locale, so remembering it would leave a visitor
 * with the whole product switched on their way back. The saved choice is
 * restored when the page is left through the app.
 */
export function usePreviewLocale(forced: LocaleCode) {
  const { setLocale } = useI18n();
  useEffect(() => {
    const previous = activeLocale();
    if (previous === forced) return;
    setLocale(forced, { persist: false });
    return () => {
      // Only undo our own override, so a switch made here is respected.
      if (activeLocale() === forced) setLocale(previous, { persist: false });
    };
  }, [forced, setLocale]);
}
