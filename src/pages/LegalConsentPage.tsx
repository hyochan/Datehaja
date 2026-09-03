import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@convex/_generated/api";
import { Logo } from "../components/layout/Logo";
import { LocaleSwitcher } from "../components/layout/LocaleSwitcher";
import { Wordmark } from "../components/layout/Wordmark";
import { Button, Card, Notice } from "../components/ui/primitives";
import { readableError, useToast } from "../components/ui/Toast";
import { useI18n } from "../i18n";

export default function LegalConsentPage() {
  const legal = useQuery(api.legal.status);
  const accept = useMutation(api.legal.accept);
  const { signOut } = useAuthActions();
  const { locale, t } = useI18n();
  const toast = useToast();
  const [age, setAge] = useState(false);
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = age && terms && privacy && legal !== undefined;

  async function submit() {
    if (!legal || !ready) return;
    setBusy(true);
    setError(null);
    try {
      await accept({
        versions: legal.currentVersions,
        termsAccepted: terms,
        communityAccepted: terms,
        privacyAcknowledged: privacy,
        ageConfirmed: age,
        locale,
      });
      toast(t("Your choices were saved."), "success");
    } catch (reason) {
      const message = readableError(reason);
      setError(message);
      toast(message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="legal-consent-page min-h-dvh">
      <header className="glass-bar border-b border-[var(--border)]">
        <div className="mx-auto flex h-[5rem] max-w-3xl items-center justify-between px-5 sm:h-[5.5rem] sm:px-8">
          <Link
            to="/"
            aria-label={t("Datehaja home")}
            className="brand-lockup flex items-center gap-2.5 rounded-lg outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[var(--color-ember-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] sm:gap-3"
          >
            <Logo className="brand-lockup-logo h-9 w-9 sm:h-11 sm:w-11" />
            <Wordmark className="text-[24px] sm:text-[28px]" />
          </Link>
          <div className="flex items-center gap-2">
            <LocaleSwitcher compact />
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-full border border-[var(--border)] px-3 py-2 text-[12px] font-semibold text-muted transition-colors hover:bg-[var(--bg-raised)] hover:text-[var(--text)]"
            >
              {t("Sign out")}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="legal-consent-intro">
          <div className="relative z-[1] max-w-xl">
            <div className="docket-label opacity-70">{t("Before we begin")}</div>
            <h1 className="mt-3 text-[clamp(2.55rem,7vw,4.1rem)] leading-[0.98] tracking-[-0.04em]">
              {t("Agents explore.")}
              <br />
              {t("Humans decide.")}
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-[1.7] opacity-75">
              {t(
                "Your Agent may simulate a date and make a recommendation. It goes into the virtual world as you, is always identified as AI, and can never consent to real contact for you.",
              )}
            </p>
          </div>
          <span className="legal-consent-mark" aria-hidden>
            ✓
          </span>
        </div>

        <Card className="mt-7 p-5 sm:p-7">
          <div className="mb-6 border-b border-[var(--border)] pb-5">
            <div className="docket-label text-[var(--accent-text)]">
              {t("Required · version {version}", {
                version: legal?.effectiveDate ?? "…",
              })}
            </div>
            <h2 className="mt-2 text-[26px] leading-tight">
              {t("Your agreement")}
            </h2>
          </div>

          <div className="space-y-3">
            <ConsentRow checked={age} onChange={setAge}>
              {t(
                "I confirm that I am 18 or over. I understand Datehaja does not verify identity or run background checks, and an agent's analysis is not a safety guarantee.",
              )}
            </ConsentRow>
            <ConsentRow checked={terms} onChange={setTerms}>
              {t("I agree to the")} {" "}
              <DocumentLink to="/terms">{t("Terms of Service")}</DocumentLink>{" "}
              {t("and")} {" "}
              <DocumentLink to="/community-guidelines">
                {t("Community Guidelines")}
              </DocumentLink>
              .
            </ConsentRow>
            <ConsentRow checked={privacy} onChange={setPrivacy}>
              {t("I acknowledge the")} {" "}
              <DocumentLink to="/privacy">{t("Privacy Notice")}</DocumentLink>
              {t(
                ", including how my private agent brief, memory, simulated transcripts, and consent decisions are processed.",
              )}
            </ConsentRow>
          </div>

          {error && (
            <div className="mt-5">
              <Notice tone="warn">{error}</Notice>
            </div>
          )}

          <Button
            className="mt-6"
            size="lg"
            fullWidth
            disabled={!ready}
            loading={busy}
            onClick={submit}
          >
            {t("Agree and continue")} <span aria-hidden>→</span>
          </Button>
          <p className="mt-4 text-center text-[11.5px] leading-relaxed text-muted">
            {t(
              "Your private agent messages never become the other agent's brief. Contact opens only after two independent human yeses.",
            )}
          </p>
        </Card>
      </main>
    </div>
  );
}

function ConsentRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="legal-consent-row">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{children}</span>
    </label>
  );
}

function DocumentLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      target="_blank"
      rel="noreferrer"
      className="font-bold text-[var(--accent-text)] underline decoration-[var(--tint-ember-border)] underline-offset-4"
    >
      {children}
    </Link>
  );
}
