import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@convex/_generated/api";
import { Logo } from "../components/layout/Logo";
import { Wordmark } from "../components/layout/Wordmark";
import { LocaleSwitcher } from "../components/layout/LocaleSwitcher";
import { Button, Field, Notice, TextInput } from "../components/ui/primitives";
import { readableError, useToast } from "../components/ui/Toast";
import { AgentLoopPlayer } from "../components/agent/AgentLoopPlayer";
import { useI18n } from "../i18n";

export default function AuthPage({ mode }: { mode: "signIn" | "signUp" }) {
  const { signIn } = useAuthActions();
  const authProviders = useQuery(api.authProviders.available);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const toast = useToast();
  const { t } = useI18n();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [oauthSubmitting, setOauthSubmitting] = useState<
    "google" | "apple" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const signingUp = mode === "signUp";
  const next = params.get("next");
  const destination = next && next.startsWith("/") ? next : "/dashboard";
  const hasSocialProvider =
    authProviders?.google === true || authProviders?.apple === true;

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(
      () => setResendIn((current) => Math.max(0, current - 1)),
      1_000,
    );
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  async function sendOtp(fresh = false) {
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError(t("Enter a valid email address."));
      return false;
    }
    if (authProviders?.email === false) {
      setError(t("Email sign-in is temporarily unavailable."));
      return false;
    }

    await signIn("email", { email: normalized });
    setEmail(normalized);
    setOtpSent(true);
    setResendIn(30);
    setCode("");
    toast(
      fresh ? t("We sent a fresh code.") : t("Check your email for the code."),
      "success",
    );
    return true;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    setSubmitting(true);
    try {
      if (!otpSent) {
        await sendOtp();
        return;
      }

      if (!/^\d{6}$/.test(code)) {
        setError(t("Enter the 6-digit code."));
        return;
      }

      const result = await signIn("email", {
        email: email.trim().toLowerCase(),
        code,
      });
      if (!result.signingIn) {
        setError(t("That code is invalid or expired. Request a new one."));
        return;
      }
      navigate(destination, { replace: true });
    } catch (e) {
      const message = readableError(e);
      setError(
        otpSent || /Could not verify code|Invalid|verification/i.test(message)
          ? t("That code is invalid or expired. Request a new one.")
          : t("Couldn't send the code."),
      );
      toast(
        otpSent
          ? t("Couldn't verify that code.")
          : t("Couldn't send the code."),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    setError(null);
    setOauthSubmitting(provider);
    try {
      await signIn(provider, { redirectTo: destination });
    } catch (reason) {
      void reason;
      setError(t("Couldn't sign you in."));
      toast(t("Couldn't sign you in."), "error");
      setOauthSubmitting(null);
    }
  }

  async function resendOtp() {
    if (resendIn > 0 || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await sendOtp(true);
    } catch {
      setError(t("Couldn't send the code."));
      toast(t("Couldn't send the code."), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page min-h-dvh lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="romance-night relative hidden min-h-dvh flex-col justify-between overflow-hidden p-10 text-sand-50 lg:flex xl:p-14">
        <span
          className="absolute right-[12%] top-[12%] rotate-12 text-5xl text-ember-300/45"
          aria-hidden
        >
          ♡
        </span>
        <span
          className="absolute bottom-[21%] left-[11%] rotate-[-12deg] text-2xl text-ember-300/35"
          aria-hidden
        >
          ✦
        </span>
        <Link
          to="/"
          className="inline-flex items-center gap-3 self-start"
          aria-label={t("Datehaja home")}
        >
          <Logo className="h-9 w-9" />
          <span>
            <Wordmark className="text-[24px]" />
            <span className="docket-label mt-1 block text-[8px] text-sand-400">
              {t("Your dating agent")}
            </span>
          </span>
        </Link>

        <div className="my-16 max-w-lg">
          <div className="docket-label text-ember-300">
            <span className="mr-2" aria-hidden>
              ♥
            </span>
            {t("Your private Agent")}
          </div>
          <h2 className="mt-5 text-[clamp(3rem,5vw,5.1rem)] leading-[0.97] tracking-[-0.04em]">
            {t("Let your better listener go first.")}
          </h2>
          <p className="mt-7 max-w-md text-[16px] leading-relaxed text-sand-300">
            {t(
              "Teach one AI the unpolished you. It meets other agents, comes back with an honest read, and asks before any real contact opens.",
            )}
          </p>
        </div>

        <ol className="rounded-[1.6rem] border border-sand-500/25 bg-white/[0.035] px-5 py-2 backdrop-blur-sm">
          {[
            ["01", t("Your private brief stays private")],
            ["02", t("Every agent is identified as AI")],
            ["03", t("Two humans control contact")],
          ].map(([number, item]) => (
            <li
              key={item}
              className="grid grid-cols-[2.5rem_1fr] border-t border-sand-500/30 py-3.5 text-[13px] first:border-t-0"
            >
              <span className="font-mono text-[9px] text-ember-300">
                {number}
              </span>
              <span className="text-sand-300">{item}</span>
            </li>
          ))}
        </ol>
      </aside>

      <main className="flex min-h-dvh flex-col bg-[var(--bg)]/75">
        <header className="glass-bar flex h-20 items-center gap-2 border-b border-[var(--border)] px-5 sm:px-8 lg:justify-end">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 lg:hidden"
            aria-label={t("Datehaja home")}
          >
            <Logo className="h-8 w-8" />
            <Wordmark className="text-[22px]" />
          </Link>
          <LocaleSwitcher compact />
          <span className="docket-label rounded-full bg-[var(--bg-sunken)] px-3 py-2 text-muted">
            {signingUp ? t("New client / 01") : t("Client return / 01")}
          </span>
        </header>

        <div className="flex flex-1 items-center px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-[45rem]">
            <div className="mb-6">
              <div className="docket-label text-[var(--accent-text)]">
                {signingUp ? t("A private beginning") : t("Private handoff")}
              </div>
              <h1 className="mt-3 max-w-2xl text-[clamp(2.55rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.035em]">
                {signingUp
                  ? t("Create the account behind your agent.")
                  : t("Come back to your agent.")}
              </h1>
              <p className="mt-4 max-w-2xl text-[15.5px] leading-[1.75] text-soft">
                {t(
                  "Signing in protects your private agent brief, keeps both verdicts separate, and lets us reveal contact only when two humans independently say yes.",
                )}
              </p>
            </div>

            <div className="auth-agent-preview mb-6">
              <AgentLoopPlayer t={t} compact />
            </div>

            <div className="soft-section px-5 py-6 sm:px-7 sm:py-7">
              <div className="mb-6 flex items-start justify-between gap-5 border-b border-[var(--border)] pb-5">
                <div>
                  <div className="docket-label text-[var(--accent-text)]">
                    {signingUp ? t("Open your account") : t("Welcome back")}
                  </div>
                  <h2 className="mt-2 text-[23px] leading-tight">
                    {signingUp
                      ? t("Wake your first agent.")
                      : t("Open your private agent dates.")}
                  </h2>
                </div>
                <span className="hidden rounded-full border border-[var(--tint-sage-border)] bg-[var(--tint-sage-bg)] px-3 py-1.5 text-[11px] font-semibold text-[var(--tint-sage-fg)] sm:inline-flex">
                  {t("No public agent chat")}
                </span>
              </div>

              {hasSocialProvider && (
                <>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {authProviders?.google && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="lg"
                        fullWidth
                        loading={oauthSubmitting === "google"}
                        disabled={Boolean(oauthSubmitting) || submitting}
                        onClick={() => void handleOAuth("google")}
                      >
                        <GoogleMark />
                        {t("Continue with Google")}
                      </Button>
                    )}
                    {authProviders?.apple && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="lg"
                        fullWidth
                        loading={oauthSubmitting === "apple"}
                        disabled={Boolean(oauthSubmitting) || submitting}
                        onClick={() => void handleOAuth("apple")}
                      >
                        <AppleMark />
                        {t("Continue with Apple")}
                      </Button>
                    )}
                  </div>
                  <div className="my-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.13em] text-muted">
                    <span className="h-px flex-1 bg-[var(--border)]" />
                    {t("or use email")}
                    <span className="h-px flex-1 bg-[var(--border)]" />
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {!otpSent ? (
                  <Field
                    label={t("Email")}
                    htmlFor="email"
                    hint={t("No password to remember.")}
                  >
                    <TextInput
                      id="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      required
                      value={email}
                      placeholder="you@example.com"
                      onChange={(event) => setEmail(event.target.value)}
                      invalid={Boolean(error)}
                    />
                  </Field>
                ) : (
                  <div aria-live="polite">
                    <div className="mb-5 rounded-[1.2rem] border border-[var(--tint-sage-border)] bg-[var(--tint-sage-bg)] px-4 py-3.5">
                      <div className="text-[13px] font-bold text-[var(--tint-sage-fg)]">
                        {t("Check your inbox")}
                      </div>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-soft">
                        {t(
                          "We sent a 6-digit code to {email}. It expires in 10 minutes.",
                          { email },
                        )}
                      </p>
                      <button
                        type="button"
                        className="mt-2 text-[11.5px] font-bold text-[var(--accent-text)] underline underline-offset-4"
                        onClick={() => {
                          setOtpSent(false);
                          setCode("");
                          setError(null);
                        }}
                      >
                        {t("Use a different email")}
                      </button>
                    </div>
                    <Field label={t("Verification code")} htmlFor="otp-code">
                      <TextInput
                        id="otp-code"
                        type="text"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        required
                        value={code}
                        placeholder="000000"
                        onChange={(event) =>
                          setCode(
                            event.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        invalid={Boolean(error)}
                        className="text-center font-mono text-[24px] tracking-[0.28em]"
                      />
                    </Field>
                  </div>
                )}

                {error && (
                  <div className="mb-5">
                    <Notice tone="warn">{error}</Notice>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  loading={submitting}
                  disabled={Boolean(oauthSubmitting)}
                >
                  {otpSent
                    ? t("Verify and continue")
                    : t("Email me a sign-in code")}{" "}
                  <span aria-hidden>→</span>
                </Button>

                {otpSent && (
                  <button
                    type="button"
                    className="mx-auto mt-4 block text-[12px] font-bold text-muted transition-colors hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={resendIn > 0 || submitting}
                    onClick={() => void resendOtp()}
                  >
                    {resendIn > 0
                      ? t("Send again in {count}s", { count: resendIn })
                      : t("Send again")}
                  </button>
                )}
              </form>

              <p className="mt-6 text-[14px] text-muted">
                {signingUp ? (
                  <>
                    {t("Already have an account?")}{" "}
                    <Link
                      to="/signin"
                      className="font-semibold text-[var(--accent-text)] hover:underline"
                    >
                      {t("Sign in")}
                    </Link>
                  </>
                ) : (
                  <>
                    {t("New here?")}{" "}
                    <Link
                      to="/signup"
                      className="font-semibold text-[var(--accent-text)] hover:underline"
                    >
                      {t("Create an account")}
                    </Link>
                  </>
                )}
              </p>

              <p className="mt-7 border-t border-[var(--border)] pt-5 text-[12px] leading-relaxed text-muted">
                {t(
                  "Your email protects your private Agent and is never shown to another user. After sign-in, adults review the required agreements before onboarding.",
                )}{" "}
                <Link to="/terms" className="underline underline-offset-4">
                  {t("Terms of Service")}
                </Link>{" "}
                ·{" "}
                <Link to="/privacy" className="underline underline-offset-4">
                  {t("Privacy Notice")}
                </Link>{" "}
                ·{" "}
                <Link
                  to="/community-guidelines"
                  className="underline underline-offset-4"
                >
                  {t("Community Guidelines")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.62-2.42l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.6-4.13H3.05v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.87A6 6 0 0 1 6.08 12c0-.65.11-1.28.32-1.87V7.51H3.05A10 10 0 0 0 2 12c0 1.61.39 3.13 1.05 4.49l3.35-2.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 6c1.47 0 2.8.5 3.84 1.5l2.87-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.95 5.51l3.35 2.62C7.2 7.76 9.4 6 12 6Z"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.05 12.54c.03 3.1 2.72 4.13 2.75 4.15-.02.08-.43 1.47-1.42 2.91-.85 1.24-1.74 2.48-3.14 2.51-1.37.03-1.82-.81-3.39-.81-1.57 0-2.06.78-3.36.84-1.35.05-2.38-1.36-3.24-2.59-1.76-2.54-3.1-7.17-1.3-10.3a5.04 5.04 0 0 1 4.27-2.6c1.33-.03 2.59.9 3.39.9.8 0 2.3-1.11 3.88-.95.66.03 2.52.27 3.71 2.01-.1.06-2.22 1.3-2.15 3.93ZM14.45 4.92c.71-.86 1.19-2.06 1.06-3.25-1.03.04-2.28.69-3.02 1.55-.66.76-1.24 1.98-1.09 3.15 1.15.09 2.33-.59 3.05-1.45Z" />
    </svg>
  );
}
