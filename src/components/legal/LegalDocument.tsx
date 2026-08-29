import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LEGAL_EFFECTIVE_DATE } from "@convex/lib/legal";
import { PageIntro } from "../layout/PageIntro";
import { Card } from "../ui/primitives";

export function LegalDocument({
  eyebrow,
  title,
  summary,
  motif,
  children,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  motif: string;
  children: ReactNode;
}) {
  return (
    <article className="legal-document product-page mx-auto max-w-3xl space-y-8">
      <PageIntro
        eyebrow={eyebrow}
        title={title}
        description={summary}
        motif={motif}
        tone="sage"
      />

      <Card className="legal-document-meta p-4 sm:p-5">
        <div>
          <div className="docket-label text-[var(--accent-text)]">
            Effective date
          </div>
          <div className="mt-1 text-[14px]">{LEGAL_EFFECTIVE_DATE}</div>
        </div>
        <nav aria-label="Legal documents" className="flex flex-wrap gap-2">
          <LegalLink to="/terms">Terms</LegalLink>
          <LegalLink to="/privacy">Privacy</LegalLink>
          <LegalLink to="/community-guidelines">Community</LegalLink>
          <LegalLink to="/safety">Safety</LegalLink>
        </nav>
      </Card>

      <div className="space-y-5">{children}</div>
    </article>
  );
}

export function LegalSection({
  number,
  title,
  children,
  id,
}: {
  number: string;
  title: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="legal-section scroll-mt-28">
      <Card className="overflow-hidden">
        <div className="grid sm:grid-cols-[4.5rem_1fr]">
          <div className="legal-section-number">{number}</div>
          <div className="p-5 sm:p-7">
            <h2 className="text-[clamp(1.5rem,4vw,2rem)] leading-tight">
              {title}
            </h2>
            <div className="legal-copy mt-4 space-y-3 text-[14.5px] leading-[1.75] text-soft">
              {children}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

function LegalLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-full border border-[var(--border)] bg-[var(--bg-raised)] px-3 py-2 text-[12px] font-bold transition-colors hover:border-[var(--tint-ember-border)] hover:bg-[var(--tint-ember-bg)]"
    >
      {children}
    </Link>
  );
}
