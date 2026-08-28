import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { Logo } from "../components/layout/Logo";
import { LocaleSwitcher } from "../components/layout/LocaleSwitcher";
import { Button, Field, Notice, TextInput } from "../components/ui/primitives";
import { readableError, useToast } from "../components/ui/Toast";
import { useI18n } from "../i18n";

export default function AuthPage({ mode }: { mode: "signIn" | "signUp" }) {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const toast = useToast();
  const { t } = useI18n();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signingUp = mode === "signUp";
  const next = params.get("next");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (signingUp && !ageConfirmed) {
      setError(
        t("DateHaja is for adults only — please confirm you're 18 or over."),
      );
      return;
    }
    if (signingUp && password.length < 8) {
      setError(t("Use at least 8 characters."));
      return;
    }

    setSubmitting(true);
    try {
      await signIn("password", {
        email: email.trim().toLowerCase(),
        password,
        flow: signingUp ? "signUp" : "signIn",
      });
      navigate(next && next.startsWith("/") ? next : "/dashboard", {
        replace: true,
      });
    } catch (e) {
      const message = readableError(e);
      setError(
        /InvalidAccountId|InvalidSecret|Invalid/i.test(message)
          ? signingUp
            ? t("That email is already registered. Try signing in instead.")
            : t("That email and password don't match.")
          : message,
      );
      toast(t("Couldn't sign you in."), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[0.9fr_1.1fr]">
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
          aria-label={t("DateHaja home")}
        >
          <Logo className="h-9 w-9" />
          <span>
            <span className="brand-wordmark block text-[22px]">datehaja</span>
            <span className="docket-label mt-1 block text-[8px] text-sand-400">
              {t("Private date concierge")}
            </span>
          </span>
        </Link>

        <div className="my-16 max-w-lg">
          <div className="docket-label text-ember-300">
            <span className="mr-2" aria-hidden>
              ♥
            </span>
            {t("Concierge brief")}
          </div>
          <h2 className="mt-5 text-[clamp(3rem,5vw,5.1rem)] leading-[0.97] tracking-[-0.04em]">
            {t("Your free time is enough to begin.")}
          </h2>
          <p className="mt-7 max-w-md text-[16px] leading-relaxed text-sand-300">
            {t(
              "Give us an evening. We handle compatibility, the place, the plan, and two private invitations.",
            )}
          </p>
        </div>

        <ol className="rounded-[1.6rem] border border-sand-500/25 bg-white/[0.035] px-5 py-2 backdrop-blur-sm">
          {[
            ["01", t("Your contact details stay yours")],
            ["02", t("Every venue has a live source")],
            ["03", t("Both people answer in private")],
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
            aria-label={t("DateHaja home")}
          >
            <Logo className="h-8 w-8" />
            <span className="brand-wordmark text-[21px] font-medium">
              datehaja
            </span>
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
                  ? t("Start with an account only you can open.")
                  : t("Come back to your evening.")}
              </h1>
              <p className="mt-4 max-w-2xl text-[15.5px] leading-[1.75] text-soft">
                {t(
                  "Every invitation is private. Signing in lets us show the right plan to the right person, keep each answer secret, and update your calendar without sharing contact details.",
                )}
              </p>
            </div>

            <div className="mb-6 grid gap-2.5 sm:grid-cols-3">
              {[
                {
                  icon: "⌁",
                  title: t("Your invitation"),
                  body: t("Only you can open it."),
                },
                {
                  icon: "♡",
                  title: t("Your answer"),
                  body: t("Your match never sees a pass."),
                },
                {
                  icon: "◷",
                  title: t("Your calendar"),
                  body: t("Reserved, finalized, or cancelled."),
                },
              ].map((reason) => (
                <div
                  key={reason.title}
                  className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-3.5 shadow-[var(--shadow-soft)]"
                >
                  <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--tint-ember-bg)] text-[14px] text-[var(--tint-ember-strong)]">
                    {reason.icon}
                  </div>
                  <div className="text-[13.5px] font-semibold">
                    {reason.title}
                  </div>
                  <div className="mt-0.5 text-[12.5px] leading-relaxed text-muted">
                    {reason.body}
                  </div>
                </div>
              ))}
            </div>

            <div className="soft-section px-5 py-6 sm:px-7 sm:py-7">
              <div className="mb-6 flex items-start justify-between gap-5 border-b border-[var(--border)] pb-5">
                <div>
                  <div className="docket-label text-[var(--accent-text)]">
                    {signingUp ? t("Open your account") : t("Welcome back")}
                  </div>
                  <h2 className="mt-2 text-[23px] leading-tight">
                    {signingUp
                      ? t("Reserve your first evening.")
                      : t("Open your private dates.")}
                  </h2>
                </div>
                <span className="hidden rounded-full border border-[var(--tint-sage-border)] bg-[var(--tint-sage-bg)] px-3 py-1.5 text-[11px] font-semibold text-[var(--tint-sage-fg)] sm:inline-flex">
                  {t("No public profile")}
                </span>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <Field label={t("Email")} htmlFor="email">
                  <TextInput
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    placeholder="you@example.com"
                    onChange={(e) => setEmail(e.target.value)}
                    invalid={Boolean(error)}
                  />
                </Field>

                <Field
                  label={t("Password")}
                  htmlFor="password"
                  hint={signingUp ? t("At least 8 characters.") : undefined}
                >
                  <TextInput
                    id="password"
                    type="password"
                    autoComplete={
                      signingUp ? "new-password" : "current-password"
                    }
                    required
                    minLength={signingUp ? 8 : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    invalid={Boolean(error)}
                  />
                </Field>

                {signingUp && (
                  <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-3.5 text-[14px] leading-relaxed">
                    <input
                      type="checkbox"
                      checked={ageConfirmed}
                      onChange={(e) => setAgeConfirmed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[var(--color-ember-400)]"
                    />
                    <span>
                      {t(
                        "I'm 18 or over, and I understand DateHaja does not verify identity.",
                      )}
                    </span>
                  </label>
                )}

                {error && (
                  <div className="mb-5">
                    <Notice tone="warn">{error}</Notice>
                  </div>
                )}

                <Button type="submit" size="lg" fullWidth loading={submitting}>
                  {signingUp ? t("Create my account") : t("Sign in")}{" "}
                  <span aria-hidden>→</span>
                </Button>
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
                  "Your email is used only by DateHaja Concierge to reach you. It is never shown to another user.",
                )}{" "}
                <Link to="/privacy" className="underline underline-offset-4">
                  {t("How privacy works")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
