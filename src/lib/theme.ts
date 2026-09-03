/**
 * The theme lives on the document element so the boot script in index.html can
 * set it before React mounts. More than one control writes it — the header
 * toggle and the small-screen menu — so every reader subscribes to the
 * attribute instead of caching a copy. A cached copy goes stale the moment the
 * other control is used, and the stale control then acts on a value that is no
 * longer true.
 */
export type Theme = "light" | "dark";

export function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

export function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

/** Server render has no document; the boot script corrects this on the client. */
export function readServerTheme(): Theme {
  return "light";
}

/**
 * Only a deliberate choice is persisted. Writing on mount would freeze whatever
 * the system happened to be on a first visit, and the user would never follow
 * their OS setting again.
 */
export function setTheme(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem("datehaja-theme", next);
  } catch {
    /* private mode — the choice just won't persist */
  }
}
