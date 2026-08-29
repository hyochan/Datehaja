import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
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
  const { locale } = useI18n();
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
      toast("Your choices were saved.", "success");
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
        <div className="mx-auto flex h-20 max-w-3xl items-center justify-between px-5 sm:px-8">
          <Link
            to="/"
            aria-label="Datehaja home"
            className="flex items-center gap-2.5 rounded-lg outline-none transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-[var(--color-ember-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
          >
            <Logo className="h-8 w-8" />
            <Wordmark className="text-[22px]" />
          </Link>
          <LocaleSwitcher compact />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="legal-consent-intro">
          <div className="relative z-[1] max-w-xl">
            <div className="docket-label opacity-70">Before we begin</div>
            <h1 className="mt-3 text-[clamp(2.55rem,8vw,4.7rem)] leading-[0.94] tracking-[-0.045em]">
              A clear yes,
              <br />
              before any match.
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-[1.7] opacity-75">
              Datehaja records the exact document versions you accept. No hidden
              marketing consent, no identity-verification claim.
            </p>
          </div>
          <span className="legal-consent-mark" aria-hidden>
            ✓
          </span>
        </div>

        <Card className="mt-7 p-5 sm:p-7">
          <div className="mb-6 border-b border-[var(--border)] pb-5">
            <div className="docket-label text-[var(--accent-text)]">
              Required · version {legal?.effectiveDate ?? "…"}
            </div>
            <h2 className="mt-2 text-[26px] leading-tight">Your agreement</h2>
          </div>

          <div className="space-y-3">
            <ConsentRow checked={age} onChange={setAge}>
              I confirm that I am 18 or over. I understand Datehaja does not
              verify identity or run background checks.
            </ConsentRow>
            <ConsentRow checked={terms} onChange={setTerms}>
              I agree to the{" "}
              <DocumentLink to="/terms">Terms of Service</DocumentLink> and{" "}
              <DocumentLink to="/community-guidelines">
                Community Guidelines
              </DocumentLink>
              .
            </ConsentRow>
            <ConsentRow checked={privacy} onChange={setPrivacy}>
              I acknowledge the{" "}
              <DocumentLink to="/privacy">Privacy Notice</DocumentLink>,
              including how matching and venue-planning automation uses my
              information.
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
            Agree and continue <span aria-hidden>→</span>
          </Button>
          <p className="mt-4 text-center text-[11.5px] leading-relaxed text-muted">
            Service emails are not marketing. You can control invitations,
            confirmations, and reminders later in Settings.
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
