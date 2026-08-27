import { Suspense, lazy } from "react";
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
import { LocaleSwitcher } from "./components/layout/LocaleSwitcher";
import { Spinner } from "./components/ui/primitives";
import { useI18n } from "./i18n";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import DropPage from "./pages/DropPage";

const AvailabilityPage = lazy(() => import("./pages/AvailabilityPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PreferencesPage = lazy(() => import("./pages/PreferencesPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const SafetyPage = lazy(() => import("./pages/SafetyPage"));
const DemoPage = lazy(() => import("./pages/DemoPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

export default function App() {
  return (
    <>
      <AuthLoading>
        <FullPageLoader />
      </AuthLoading>

      <Unauthenticated>
        <Routes>
          <Route path="/" element={<LandingPage />} />
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
          <Route path="*" element={<RedirectToSignIn />} />
        </Routes>
      </Unauthenticated>

      <Authenticated>
        <AuthedRoutes />
      </Authenticated>
    </>
  );
}

function AuthedRoutes() {
  const state = useQuery(api.profiles.onboardingState);
  const location = useLocation();

  if (state === undefined) return <FullPageLoader />;

  const onboarding = location.pathname.startsWith("/onboarding");
  if (!state.complete && !onboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  if (state.complete && onboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route
          path="/"
          element={
            <Navigate
              to={state.complete ? "/dashboard" : "/onboarding"}
              replace
            />
          }
        />
        <Route path="/signin" element={<Navigate to="/dashboard" replace />} />
        <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <AppShell>
              <DashboardPage />
            </AppShell>
          }
        />
        <Route
          path="/drop/:dropId"
          element={
            <AppShell>
              <DropPage />
            </AppShell>
          }
        />
        <Route
          path="/availability"
          element={
            <AppShell>
              <AvailabilityPage />
            </AppShell>
          }
        />
        <Route
          path="/history"
          element={
            <AppShell>
              <HistoryPage />
            </AppShell>
          }
        />
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
          path="/demo"
          element={
            <AppShell>
              <DemoPage />
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
        <header className="border-b border-[var(--border-strong)] bg-[var(--bg)]">
          <div className="mx-auto flex h-20 max-w-4xl items-center justify-between px-5 sm:px-8">
            <Link
              to="/"
              className="flex items-center gap-2.5"
              aria-label={t("DateDrop home")}
            >
              <Logo className="h-8 w-8" />
              <span>
                <span className="block font-display text-[19px] leading-none">
                  DateDrop
                </span>
                <span className="docket-label mt-1 block text-[8px] text-muted">
                  {t("Public record")}
                </span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <LocaleSwitcher compact />
              <Link
                to="/signup"
                className="rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-raised)] px-3 py-2 text-[13px] font-semibold sm:px-4"
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

function RedirectToSignIn() {
  const location = useLocation();
  // Deep links (an emailed DateDrop) survive the sign-in round trip.
  const target =
    location.pathname === "/"
      ? "/"
      : `/signin?next=${encodeURIComponent(location.pathname)}`;
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
