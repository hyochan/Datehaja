import { Suspense, lazy, useEffect } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { api } from "@convex/_generated/api";
import { AppShell } from "./components/layout/AppShell";
import { Logo } from "./components/layout/Logo";
import { Wordmark } from "./components/layout/Wordmark";
import { LocaleSwitcher } from "./components/layout/LocaleSwitcher";
import { Spinner } from "./components/ui/primitives";
import { useI18n } from "./i18n";
import { safeAppDestination } from "./lib/navigation";
import LandingPage from "./pages/LandingPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import AuthPage from "./pages/AuthPage";
import AgentOnboardingPage from "./pages/AgentOnboardingPage";
import AgentDashboardPage from "./pages/AgentDashboardPage";
import AgentDatePage from "./pages/AgentDatePage";
import MembershipPage from "./pages/MembershipPage";

const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PreferencesPage = lazy(() => import("./pages/PreferencesPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const SafetyPage = lazy(() => import("./pages/SafetyPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const CommunityGuidelinesPage = lazy(
  () => import("./pages/CommunityGuidelinesPage"),
);
const LegalConsentPage = lazy(() => import("./pages/LegalConsentPage"));
const WatchPage = lazy(() => import("./pages/WatchPage"));
const DateRecordPreviewPage = lazy(() => import("./pages/DateRecordPreviewPage"));
const AgentCoachingPreviewPage = lazy(
  () => import("./pages/AgentCoachingPreviewPage"),
);
// Dev-only bench. The import lives inside the DEV branch so a production
// build drops the chunk instead of publishing it unreachable.
const labRoute = import.meta.env.DEV
  ? (() => {
      const AvatarLabPage = lazy(() => import("./pages/AvatarLabPage"));
      return <Route path="/lab/avatar" element={<AvatarLabPage />} />;
    })()
  : null;

export default function App() {
  const location = useLocation();
  // The explanation remains reachable when the home route redirects signed-in users.
  if (location.pathname === "/how-it-works") return <><HowItWorksPage /><ScrollToTop /></>;
  // The explicitly fictional preview must work from mail without an account.
  if (location.pathname === "/preview/date-letter") return <Suspense fallback={<FullPageLoader />}><DateRecordPreviewPage /><ScrollToTop /></Suspense>;
  if (location.pathname === "/preview/agent-coaching") return <Suspense fallback={<FullPageLoader />}><AgentCoachingPreviewPage /><ScrollToTop /></Suspense>;
  return (
    <>
      <ScrollToTop />

      <AuthLoading>
        <FullPageLoader />
      </AuthLoading>

      <Unauthenticated>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/watch" element={<WatchPage />} />
          <Route path="/signin" element={<AuthPage mode="signIn" />} />
          <Route path="/signup" element={<AuthPage mode="signUp" />} />
          <Route
            path="/privacy"
            element={
              <PublicPage>
                <PrivacyPage />
              </PublicPage>
            }
          />
          <Route
            path="/safety"
            element={
              <PublicPage>
                <SafetyPage />
              </PublicPage>
            }
          />
          <Route
            path="/terms"
            element={
              <PublicPage>
                <TermsPage />
              </PublicPage>
            }
          />
          <Route
            path="/community-guidelines"
            element={
              <PublicPage>
                <CommunityGuidelinesPage />
              </PublicPage>
            }
          />
          {labRoute}
          <Route path="*" element={<RedirectToSignIn />} />
        </Routes>
      </Unauthenticated>

      <Authenticated>
        <AuthedRoutes />
      </Authenticated>
    </>
  );
}

/** Open routes at the top while preserving intentional in-page links. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const scrollToAnchor = () => {
        const target = document.getElementById(hash.slice(1));
        if (target) {
          target.scrollIntoView();
          return true;
        }
        return false;
      };
      if (scrollToAnchor()) return;
      // Mail links can arrive before the lazy route or authenticated query.
      const observer = new MutationObserver(() => {
        if (scrollToAnchor()) observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      const timeout = window.setTimeout(() => observer.disconnect(), 10_000);
      return () => { observer.disconnect(); window.clearTimeout(timeout); };
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function AuthedRoutes() {
  const state = useQuery(api.profiles.onboardingState);
  const location = useLocation();
  const returnDestination = safeAppDestination(new URLSearchParams(location.search).get("next"));

  if (state === undefined) return <FullPageLoader />;

  const onboarding = location.pathname.startsWith("/onboarding");
  const legalAcceptance = location.pathname === "/legal/accept";
  const readableWithoutConsent = [
    "/terms",
    "/privacy",
    "/community-guidelines",
    "/safety",
  ].includes(location.pathname);

  if (!state.legalAccepted && !legalAcceptance && !readableWithoutConsent) {
    return <Navigate to="/legal/accept" replace />;
  }
  if (state.legalAccepted && legalAcceptance) {
    return (
      <Navigate to={state.complete ? "/dashboard" : "/onboarding"} replace />
    );
  }
  if (
    !state.complete &&
    !onboarding &&
    !legalAcceptance &&
    !readableWithoutConsent
  ) {
    return <Navigate to="/onboarding" replace />;
  }
  if (state.complete && onboarding) {
    return <Navigate to="/membership" replace />;
  }

  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        <Route path="/legal/accept" element={<LegalConsentPage />} />
        <Route path="/onboarding" element={<AgentOnboardingPage />} />
        <Route path="/watch" element={<WatchPage />} />
        {labRoute}
        <Route
          path="/"
          element={
            <Navigate
              to={state.complete ? "/dashboard" : "/onboarding"}
              replace
            />
          }
        />
        <Route path="/signin" element={<Navigate to={returnDestination} replace />} />
        <Route path="/signup" element={<Navigate to={returnDestination} replace />} />
        <Route
          path="/dashboard"
          element={
            <AppShell>
              <AgentDashboardPage />
            </AppShell>
          }
        />
        <Route
          path="/agent-date/:agentDateId"
          element={
            <AppShell>
              <AgentDatePage />
            </AppShell>
          }
        />
        <Route
          path="/membership"
          element={
            <AppShell>
              <MembershipPage />
            </AppShell>
          }
        />
        <Route
          path="/availability"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route path="/history" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/settings"
          element={
            <AppShell>
              <SettingsPage />
            </AppShell>
          }
        />
        <Route
          path="/profile"
          element={
            <AppShell>
              <ProfilePage />
            </AppShell>
          }
        />
        <Route
          path="/preferences"
          element={
            <AppShell>
              <PreferencesPage />
            </AppShell>
          }
        />
        <Route
          path="/notifications"
          element={
            <AppShell>
              <NotificationsPage />
            </AppShell>
          }
        />
        <Route
          path="/privacy"
          element={
            <AppShell>
              <PrivacyPage />
            </AppShell>
          }
        />
        <Route
          path="/safety"
          element={
            <AppShell>
              <SafetyPage />
            </AppShell>
          }
        />
        <Route
          path="/terms"
          element={
            <AppShell>
              <TermsPage />
            </AppShell>
          }
        />
        <Route
          path="/community-guidelines"
          element={
            <AppShell>
              <CommunityGuidelinesPage />
            </AppShell>
          }
        />
        <Route
          path="*"
          element={
            <AppShell>
              <NotFoundPage />
            </AppShell>
          }
        />
      </Routes>
    </Suspense>
  );
}

function PublicPage({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();

  return (
    <Suspense fallback={<FullPageLoader />}>
      <div className="min-h-dvh">
        <header className="glass-bar border-b border-[var(--border)]">
          <div className="mx-auto flex h-20 max-w-4xl items-center justify-between px-5 sm:px-8">
            <Link
              to="/"
              className="brand-lockup flex items-center gap-2.5 sm:gap-3"
              aria-label={t("Datehaja home")}
            >
              <Logo className="brand-lockup-logo h-9 w-9 sm:h-11 sm:w-11" />
              <span>
                <Wordmark className="text-[24px] sm:text-[28px]" />
                <span className="docket-label mt-1.5 hidden text-[8px] text-muted sm:block sm:text-[9px]">
                  {t("Public record")}
                </span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <LocaleSwitcher compact />
              <Link
                to="/signup"
                className="rounded-full border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-2 text-[13px] font-bold shadow-[var(--shadow-soft)] transition-colors hover:border-[var(--tint-ember-border)] hover:bg-[var(--tint-ember-bg)] sm:px-5"
              >
                {t("Get started")}
              </Link>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
          {children}
        </div>
      </div>
    </Suspense>
  );
}

/**
 * Paths that exist but need a session. A signed-out visitor to one of these
 * should sign in and land back on it; a signed-out visitor to anything else
 * typed a dead URL and deserves the 404 rather than a sign-in form.
 */
const AUTHED_PATHS = [
  "/dashboard",
  "/onboarding",
  "/profile",
  "/preferences",
  "/settings",
  "/notifications",
  "/membership",
  "/history",
  "/availability",
  "/legal/accept",
  "/agent-date/",
];

function needsSession(pathname: string) {
  return AUTHED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`) || pathname.startsWith(path.endsWith("/") ? path : `${path}/`),
  );
}

function RedirectToSignIn() {
  const location = useLocation();
  // Emailed date-plan links survive the sign-in round trip.
  if (location.pathname === "/") return <Navigate to="/" replace />;
  if (!needsSession(location.pathname)) {
    // PublicPage carries the Suspense boundary the lazy page needs, plus the
    // header, so a dead link looks like the rest of the signed-out site.
    return (
      <PublicPage>
        <NotFoundPage />
      </PublicPage>
    );
  }
  const target = `/signin?next=${encodeURIComponent(location.pathname + location.search + location.hash)}`;
  return <Navigate to={target} replace />;
}

function FullPageLoader() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Spinner className="h-7 w-7 text-ember-400" />
      <span className="sr-only">{t("Loading")}</span>
    </div>
  );
}
