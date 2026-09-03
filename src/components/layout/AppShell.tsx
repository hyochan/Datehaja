import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@convex/_generated/api";
import { cx } from "../ui/primitives";
import { Logo } from "./Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { HeaderMenu } from "./HeaderMenu";
import { Wordmark } from "./Wordmark";
import { useI18n } from "../../i18n";

const NAV = [
  { to: "/dashboard", label: "My agent", icon: HomeIcon },
  { to: "/profile", label: "Human", icon: PersonIcon },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const unread = useQuery(api.notifications.unreadCount) ?? 0;
  const { t } = useI18n();

  return (
    <div className="app-shell min-h-dvh">
      <header className="app-header glass-bar sticky top-0 z-30 border-b border-[var(--border)]">
        <div className="mx-auto flex h-[5rem] max-w-[80rem] items-center justify-between gap-4 px-4 sm:h-[5.5rem] sm:px-7">
          <Link
            to="/dashboard"
            className="brand-lockup flex items-center gap-2.5 sm:gap-3"
            aria-label="Datehaja"
          >
            <Logo className="brand-lockup-logo h-9 w-9 sm:h-11 sm:w-11" />
            <span className="leading-none">
              <Wordmark className="text-[24px] sm:text-[29px]" />
              <span className="docket-label mt-1.5 hidden text-[8px] text-muted sm:block sm:text-[9px]">
                {t("Your dating agent")}
              </span>
            </span>
          </Link>

          <nav className="app-nav hidden items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-raised)] p-1 sm:flex">
            {NAV.map((item, index) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cx(
                    "relative flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[13.5px] font-semibold transition-colors lg:px-5",
                    isActive
                      ? "bg-[var(--tint-ember-bg)] text-[var(--accent-text)]"
                      : "text-muted hover:bg-[var(--bg-sunken)] hover:text-[var(--text)]",
                  )
                }
              >
                <span className="docket-label text-[8px] text-muted">
                  0{index + 1}
                </span>
                {t(item.label)}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <div className="hidden items-center gap-1 sm:flex">
              <LocaleSwitcher compact />
              <ThemeToggle />
            </div>
            <Link
              to="/notifications"
              aria-label={
                unread > 0
                  ? t("Notifications, {count} unread", { count: unread })
                  : t("Notifications")
              }
              className="relative rounded-full border border-transparent p-2.5 text-muted transition-colors hover:border-[var(--border)] hover:bg-[var(--bg-raised)] hover:text-[var(--text)]"
            >
              <BellIcon />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember-600 px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <SignOutButton />
            <HeaderMenu className="sm:hidden" />
          </div>
        </div>
      </header>

      <main
        key={location.pathname}
        className="app-main mx-auto max-w-[80rem] px-4 pb-28 pt-7 sm:px-7 sm:pb-16 sm:pt-11"
      >
        {children}
      </main>

      <nav
        className="app-mobile-nav glass-bar fixed inset-x-3 bottom-3 z-30 overflow-hidden rounded-[1.4rem] border border-[var(--border)] pb-[env(safe-area-inset-bottom)] shadow-[var(--shadow-lift)] sm:hidden"
        aria-label={t("Main")}
      >
        <div className="flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cx(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  isActive
                    ? "bg-[var(--tint-ember-bg)] text-[var(--accent-text)]"
                    : "text-muted",
                )
              }
            >
              <item.icon />
              {t(item.label)}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

function SignOutButton() {
  const { signOut } = useAuthActions();
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={() => void signOut()}
      aria-label={t("Sign out")}
      className="rounded-full border border-transparent p-2.5 text-muted transition-colors hover:border-[var(--border)] hover:bg-[var(--bg-raised)] hover:text-[var(--text)]"
    >
      <ExitIcon />
    </button>
  );
}

export function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    return (
      (document.documentElement.getAttribute("data-theme") as
        "light" | "dark") ?? "light"
    );
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Only a deliberate toggle is persisted. Writing on mount would freeze
  // whatever the system happened to be on a user's first visit, and they would
  // never follow their OS setting again.
  function choose(next: "light" | "dark") {
    setTheme(next);
    try {
      localStorage.setItem("datehaja-theme", next);
    } catch {
      /* private mode — the choice just won't persist */
    }
  }

  return (
    <button
      type="button"
      aria-label={
        theme === "dark" ? t("Switch to light mode") : t("Switch to dark mode")
      }
      onClick={() => choose(theme === "dark" ? "light" : "dark")}
      className="rounded-full border border-transparent p-2.5 text-muted transition-colors hover:border-[var(--border)] hover:bg-[var(--bg-raised)] hover:text-[var(--text)]"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

/* --------------------------------- icons ---------------------------------- */

const S = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function HomeIcon() {
  return (
    <svg {...S}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg {...S}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.05.05-2.76 2.76-.05-.05a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.1 1.65V21h-3.8v-.07A1.8 1.8 0 0 0 9 19.28a1.8 1.8 0 0 0-2 .36l-.05.05-2.76-2.76.05-.05a1.8 1.8 0 0 0 .36-2A1.8 1.8 0 0 0 3 13.8H3v-3.6h.07A1.8 1.8 0 0 0 4.72 9a1.8 1.8 0 0 0-.36-2l-.05-.05 2.76-2.76.05.05a1.8 1.8 0 0 0 2 .36A1.8 1.8 0 0 0 10.2 3H14a1.8 1.8 0 0 0 1.08 1.6 1.8 1.8 0 0 0 2-.36l.05-.05 2.76 2.76-.05.05a1.8 1.8 0 0 0-.36 2 1.8 1.8 0 0 0 1.52 1.1v3.8A1.8 1.8 0 0 0 19.4 15Z" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg {...S}>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.8 20c.7-3.7 3.7-5.8 7.2-5.8s6.5 2.1 7.2 5.8" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg {...S}>
      <path d="M6.5 9.5a5.5 5.5 0 1 1 11 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5Z" />
      <path d="M10 18.5a2.2 2.2 0 0 0 4 0" />
    </svg>
  );
}
function ExitIcon() {
  return (
    <svg {...S}>
      <path d="M14.5 4.5h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-3" />
      <path d="M10 8.5 6.5 12l3.5 3.5M6.5 12H15" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg {...S}>
      <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4 8.4 8.4 0 1 0 20 14.2Z" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg {...S}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M18.5 5.5l-1.4 1.4M6.9 17.1l-1.4 1.4" />
    </svg>
  );
}
