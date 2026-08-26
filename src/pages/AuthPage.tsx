import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { Logo } from "../components/layout/Logo";
import { Button, Field, Notice, TextInput } from "../components/ui/primitives";
import { readableError, useToast } from "../components/ui/Toast";

export default function AuthPage({ mode }: { mode: "signIn" | "signUp" }) {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const toast = useToast();

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
      setError("DateDrop is for adults only — please confirm you're 18 or over.");
      return;
    }
    if (signingUp && password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await signIn("password", {
        email: email.trim().toLowerCase(),
        password,
        flow: signingUp ? "signUp" : "signIn",
      });
      navigate(next && next.startsWith("/") ? next : "/dashboard", { replace: true });
    } catch (e) {
      const message = readableError(e);
      setError(
        /InvalidAccountId|InvalidSecret|Invalid/i.test(message)
          ? signingUp
            ? "That email is already registered. Try signing in instead."
            : "That email and password don't match."
          : message,
      );
      toast("Couldn't sign you in.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-5 pt-6 sm:px-8">
        <Link to="/" className="inline-flex items-center gap-2.5" aria-label="DateDrop home">
          <Logo className="h-7 w-7" />
          <span className="font-display text-[19px] font-medium tracking-tight">
            DateDrop
          </span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[26rem]">
          <h1 className="text-[30px] leading-tight">
            {signingUp ? "Let's find you a date." : "Welcome back."}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-soft">
            {signingUp
              ? "Two minutes of setup, then all we ever ask is when you're free."
              : "Sign in to see your DateDrops."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8" noValidate>
            <Field label="Email" htmlFor="email">
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
              label="Password"
              htmlFor="password"
              hint={signingUp ? "At least 8 characters." : undefined}
            >
              <TextInput
                id="password"
                type="password"
                autoComplete={signingUp ? "new-password" : "current-password"}
                required
                minLength={signingUp ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                invalid={Boolean(error)}
              />
            </Field>

            {signingUp && (
              <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border-strong)] p-3.5 text-[14px] leading-relaxed">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-ember-400)]"
                />
                <span>
                  I'm 18 or over, and I understand DateDrop{" "}
                  <strong className="font-medium">does not verify identity</strong>.
                </span>
              </label>
            )}

            {error && (
              <div className="mb-5">
                <Notice tone="warn">{error}</Notice>
              </div>
            )}

            <Button type="submit" size="lg" fullWidth loading={submitting}>
              {signingUp ? "Create my account" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[14.5px] text-muted">
            {signingUp ? (
              <>
                Already have an account?{" "}
                <Link to="/signin" className="font-medium text-[var(--accent-text)] hover:underline">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New here?{" "}
                <Link to="/signup" className="font-medium text-[var(--accent-text)] hover:underline">
                  Create an account
                </Link>
              </>
            )}
          </p>

          <p className="mt-8 text-center text-[13px] leading-relaxed text-muted">
            Your email is only ever used by DateDrop Concierge to reach you. It's
            never shown to another user.{" "}
            <Link to="/privacy" className="underline underline-offset-2">
              How privacy works
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
