import { LinkButton } from "../components/ui/primitives";
import { Logo } from "../components/layout/Logo";

export default function NotFoundPage() {
  return (
    <div className="not-found-page mx-auto max-w-xl px-6 py-16 text-center sm:py-24">
      <div className="not-found-orbit" aria-hidden="true">
        <span>?</span>
      </div>
      <Logo className="relative mx-auto mb-6 h-12 w-12" />
      <div className="docket-label text-[var(--accent-text)]">Lost plan</div>
      <h1 className="mt-3 font-display text-[clamp(2.5rem,7vw,4.75rem)] leading-[0.9] tracking-[-0.04em]">
        No plans here.
      </h1>
      <p className="mx-auto mt-5 max-w-sm text-[15.5px] leading-relaxed text-soft">
        That page doesn't exist — or the date plan it pointed at has already
        come and gone.
      </p>
      <div className="mt-8">
        <LinkButton to="/dashboard" size="lg">
          Back to your dates
        </LinkButton>
      </div>
    </div>
  );
}
