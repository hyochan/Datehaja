import { Component, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Button, LinkButton } from "../ui/primitives";
import { Logo } from "./Logo";
import { useI18n } from "../../i18n";

type CatchProps = {
  children: ReactNode;
  locationKey: string;
  fallback: (reset: () => void) => ReactNode;
};

type CatchState = { didError: boolean; failedAt: string | null };

/**
 * Class catcher. React only calls `getDerivedStateFromError` on class
 * components. A new location clears the recovery screen without remounting
 * the tree — a `key` on this catcher would reset the whole app on every
 * route change.
 */
class ErrorCatch extends Component<CatchProps, CatchState> {
  state: CatchState = { didError: false, failedAt: null };

  static getDerivedStateFromError(): Pick<CatchState, "didError"> {
    return { didError: true };
  }

  static getDerivedStateFromProps(
    props: CatchProps,
    state: CatchState,
  ): Partial<CatchState> | null {
    if (!state.didError) return null;
    if (state.failedAt === null) return { failedAt: props.locationKey };
    if (state.failedAt !== props.locationKey) {
      return { didError: false, failedAt: null };
    }
    return null;
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Datehaja render error", error, info.componentStack);
  }

  reset = () => {
    this.setState({ didError: false, failedAt: null });
  };

  render() {
    if (this.state.didError) return this.props.fallback(this.reset);
    return this.props.children;
  }
}

function ErrorFallback({ reset }: { reset: () => void }) {
  const { t } = useI18n();

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div
        className="not-found-page mx-auto max-w-xl px-6 py-16 text-center sm:py-24"
        role="alert"
      >
        <div className="not-found-orbit" aria-hidden="true">
          <span>!</span>
        </div>
        <Logo className="relative mx-auto mb-6 h-12 w-12" />
        <div className="docket-label text-[var(--accent-text)]">
          {t("Lost plan")}
        </div>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,7vw,4.75rem)] leading-[0.9] tracking-[-0.04em]">
          {t("This page couldn't be shown.")}
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-[15.5px] leading-relaxed text-soft">
          {t(
            "Something here broke while it was opening. Your dates are still there — you can go back and keep going.",
          )}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton to="/dashboard" size="lg">
            {t("Back to your dates")}
          </LinkButton>
          <Button variant="secondary" size="lg" onClick={reset}>
            {t("Try this page again")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <ErrorCatch
      locationKey={location.key}
      fallback={(reset) => <ErrorFallback reset={reset} />}
    >
      {children}
    </ErrorCatch>
  );
}
