import { Link } from "react-router-dom";
import { Logo } from "../components/layout/Logo";
import { LocaleSwitcher } from "../components/layout/LocaleSwitcher";
import { ThemeToggle } from "../components/layout/AppShell";
import { LinkButton } from "../components/ui/primitives";
import { useI18n } from "../i18n";

const DATE_DROP_WAY = [
  { number: "01", label: "Say when you're free", icon: "calendar" },
  { number: "02", label: "Receive one considered plan", icon: "spark" },
  { number: "03", label: "Both answer privately", icon: "reply" },
  { number: "04", label: "Meet in public", icon: "meet" },
] as const;

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-dvh">
      <header className="glass-bar sticky top-0 z-30 border-b border-[var(--border)]">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <div className="leading-none">
              <div className="brand-wordmark text-[22px] font-medium">
                DateDrop
              </div>
              <div className="docket-label mt-1.5 text-[8px] text-muted">
                {t("Private date concierge")}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <LocaleSwitcher compact />
            <ThemeToggle />
            <Link
              to="/signin"
              className="whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-2 text-[13px] font-bold shadow-[var(--shadow-soft)] transition-colors hover:border-[var(--tint-ember-border)] hover:bg-[var(--tint-ember-bg)] sm:px-5"
            >
              {t("Sign in")}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <span
            className="love-doodle absolute left-[4%] top-16 hidden h-12 w-12 rotate-[-12deg] text-[18px] xl:inline-flex"
            aria-hidden
          >
            ♡
          </span>
          <span
            className="love-doodle absolute right-[3%] top-24 hidden h-9 w-9 rotate-12 text-[13px] xl:inline-flex"
            aria-hidden
          >
            ✦
          </span>
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)] lg:gap-12 lg:py-28">
            <div>
              <div className="docket-label animate-fade-up text-[var(--accent-text)]">
                <span className="mr-2" aria-hidden>
                  ♥
                </span>
                {t("Service note 001 · Seoul")}
              </div>
              <h1
                className="hero-title mt-6 max-w-3xl animate-fade-up"
                style={{ animationDelay: "40ms" }}
              >
                {t("Bring us a free evening.")}
                <span className="hero-title-accent block italic text-[var(--accent-text)]">
                  {t("We'll return a date.")}
                </span>
              </h1>
              <div
                className="mt-8 flex animate-fade-up flex-col items-start gap-4 sm:flex-row sm:items-center"
                style={{ animationDelay: "120ms" }}
              >
                <LinkButton to="/signup" size="lg">
                  {t("Open an evening")} <span aria-hidden>→</span>
                </LinkButton>
                <Link
                  to="#how-it-works"
                  className="rounded-full px-3 py-2 text-[13px] font-bold text-muted transition-colors hover:bg-[var(--bg-sunken)] hover:text-[var(--text)]"
                >
                  {t("Read the two-minute brief")}
                </Link>
              </div>

              <dl
                className="mt-14 grid animate-fade-up grid-cols-3 rounded-[1.5rem] border border-[var(--border)] bg-[var(--bg-raised)] p-1.5 shadow-[var(--shadow-soft)]"
                style={{ animationDelay: "160ms" }}
              >
                {[
                  ["01", t("No swiping")],
                  ["02", t("No chat audition")],
                  ["03", t("No contacts shared")],
                ].map(([number, label], index) => (
                  <div
                    key={label}
                    className={`rounded-[1.1rem] px-3 py-3.5 sm:px-5 ${index > 0 ? "border-l border-[var(--border)]" : ""}`}
                  >
                    <dt className="docket-label text-[var(--accent-text)]">
                      {number}
                    </dt>
                    <dd className="mt-1.5 text-[12px] font-medium leading-tight sm:text-[14px]">
                      {label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative px-1 py-4 sm:px-8 lg:px-0">
              <span
                className="love-doodle absolute -right-1 -top-3 h-14 w-14 rotate-12 text-[21px]"
                aria-hidden
              >
                ♡
              </span>
              <AvailabilityDocket />
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-y border-[var(--border)] bg-[var(--bg-raised)]/50"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-[0.58fr_1.42fr] lg:items-center lg:gap-16">
              <div className="max-w-sm">
                <div className="docket-label text-[var(--accent-text)]">
                  {t("The route")}
                </div>
                <h2 className="mt-4 text-[clamp(2.25rem,5vw,4.2rem)] leading-[0.98]">
                  {t("Less matching.")}
                  <br />
                  {t("More meeting.")}
                </h2>
              </div>
              <JourneyMap />
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="lg:sticky lg:top-28">
              <div className="docket-label text-[var(--accent-text)]">
                {t("What arrives")}
              </div>
              <h2 className="mt-4 text-[clamp(2.2rem,5vw,4rem)] leading-[0.98]">
                {t("A plan,")}
                <br />
                {t("not a profile.")}
              </h2>
              <div className="mt-8 grid max-w-md grid-cols-3 gap-2">
                {[
                  ["globe", t("Places researched on the live web")],
                  ["source", t("Sources and evidence attached")],
                  ["tune", t("Constraints and budget respected")],
                ].map(([icon, text]) => (
                  <div
                    key={text}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-3 text-center shadow-[var(--shadow-soft)]"
                  >
                    <span className="love-doodle mx-auto h-10 w-10">
                      <VisualIcon kind={icon as VisualIconKind} />
                    </span>
                    <span className="mt-2 block text-[11px] font-bold leading-snug sm:text-[12px]">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <SampleDrop />
          </div>
        </section>

        <section className="romance-night overflow-hidden text-sand-50">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div>
              <div className="docket-label text-ember-300">
                {t("Private by construction")}
              </div>
              <h2 className="mt-4 text-[clamp(2.3rem,5vw,4.4rem)] leading-[0.98]">
                {t("The date arrives.")}
                <br />
                {t("Your details don't.")}
              </h2>
              <div
                className="mt-8 flex max-w-sm items-center gap-3"
                aria-hidden
              >
                <MiniInvite label="A" />
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ember-300/35 bg-ember-300/10 text-ember-200">
                  <VisualIcon kind="lock" />
                </span>
                <MiniInvite label="B" />
              </div>
            </div>

            <div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  t("Email address"),
                  t("Phone number"),
                  t("Home address"),
                  t("Exact location"),
                  t("Full name"),
                  t("Social handles"),
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex min-h-20 flex-col justify-between rounded-2xl border border-sand-500/25 bg-white/[0.035] p-3.5"
                  >
                    <span className="flex items-center justify-between text-ember-300">
                      <VisualIcon kind="lock" />
                      <span className="font-mono text-[9px] text-sand-500">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </span>
                    <span className="mt-3 text-[12px] font-semibold text-sand-200">
                      {item}
                    </span>
                    <span className="sr-only">{t("Not shared")}</span>
                  </div>
                ))}
              </div>
              <p className="border-t border-sand-500/30 py-5 text-[12px] leading-relaxed text-sand-400">
                {t(
                  "DateDrop is 18+. We do not verify identity. Read exactly what we do and don't do in the",
                )}{" "}
                <Link
                  to="/safety"
                  className="text-sand-200 underline underline-offset-4"
                >
                  {t("Safety Center")}
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 py-10 sm:px-8 sm:py-14">
          <div className="soft-section mx-auto grid max-w-6xl items-center gap-8 px-6 py-10 sm:px-10 sm:py-12 md:grid-cols-[1fr_auto]">
            <div>
              <div className="docket-label text-[var(--accent-text)]">
                {t("Your invitation is open")}
              </div>
              <h2 className="mt-3 text-[clamp(2.15rem,5vw,3.8rem)] leading-none">
                {t("When are you free?")}
              </h2>
              <p className="mt-4 text-[15px] text-soft">
                {t("That is still the only question we need answered.")}
              </p>
            </div>
            <LinkButton to="/signup" size="lg">
              {t("Get my first DateDrop")} <span aria-hidden>→</span>
            </LinkButton>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--bg-sunken)]/65">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-5 py-9 text-[12px] text-muted sm:flex-row sm:items-end sm:px-8">
          <div className="flex items-center gap-2.5">
            <Logo className="h-6 w-6" />
            <div>
              <div className="brand-wordmark text-[17px] text-[var(--text)]">
                DateDrop
              </div>
              <div className="mt-0.5">
                {t("We plan the date. You just say yes.")}
              </div>
            </div>
          </div>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-[var(--text)]">
              {t("Privacy")}
            </Link>
            <Link to="/safety" className="hover:text-[var(--text)]">
              {t("Safety")}
            </Link>
            <Link to="/signin" className="hover:text-[var(--text)]">
              {t("Sign in")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function JourneyMap() {
  const { t } = useI18n();

  return (
    <ol className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {DATE_DROP_WAY.map((step) => (
        <li
          key={step.number}
          className="relative min-h-36 overflow-hidden rounded-[1.6rem] border border-[var(--border)] bg-[var(--bg-raised)] p-3.5 shadow-[var(--shadow-soft)] sm:p-4"
        >
          <span className="love-doodle h-11 w-11 sm:h-12 sm:w-12">
            <VisualIcon kind={step.icon} />
          </span>
          <span className="docket-label absolute right-4 top-4 text-[var(--accent-text)]">
            {step.number}
          </span>
          <span className="mt-5 block text-[13px] font-bold leading-snug sm:mt-7 sm:text-[14px]">
            {t(step.label)}
          </span>
        </li>
      ))}
    </ol>
  );
}

function MiniInvite({ label }: { label: string }) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-sand-500/30 bg-white/[0.035] p-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ember-300/15 text-[12px] font-bold text-ember-200">
        {label}
      </span>
      <span className="min-w-0 flex-1 space-y-1.5">
        <span className="block h-1.5 w-full rounded-full bg-sand-300/25" />
        <span className="block h-1.5 w-2/3 rounded-full bg-sand-300/15" />
      </span>
    </span>
  );
}

type VisualIconKind =
  | "calendar"
  | "spark"
  | "reply"
  | "meet"
  | "globe"
  | "source"
  | "tune"
  | "lock";

function VisualIcon({ kind }: { kind: VisualIconKind }) {
  const common = {
    className: "h-5 w-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (kind) {
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5.5" width="18" height="15.5" rx="4" />
          <path d="M7.5 3.5v4M16.5 3.5v4M3 10h18" />
          <path d="M9 15.2c0-1.5 2-1.8 3-.4 1-1.4 3-1.1 3 .4 0 1.3-1.4 2.2-3 3.2-1.6-1-3-1.9-3-3.2Z" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 2.8c.7 4.8 2.5 6.6 7.2 7.2-4.7.7-6.5 2.5-7.2 7.2-.7-4.7-2.5-6.5-7.2-7.2 4.7-.6 6.5-2.4 7.2-7.2Z" />
          <path d="M18.5 15.5c.3 2.1 1.1 2.9 3.2 3.2-2.1.3-2.9 1.1-3.2 3.2-.3-2.1-1.1-2.9-3.2-3.2 2.1-.3 2.9-1.1 3.2-3.2Z" />
        </svg>
      );
    case "reply":
      return (
        <svg {...common}>
          <rect x="3" y="4.5" width="18" height="15" rx="4" />
          <path d="m4.5 7 7.5 5.5L19.5 7" />
          <path d="M9.5 16c0-1.2 1.6-1.5 2.5-.4.9-1.1 2.5-.8 2.5.4 0 1-1.1 1.8-2.5 2.6-1.4-.8-2.5-1.6-2.5-2.6Z" />
        </svg>
      );
    case "meet":
      return (
        <svg {...common}>
          <path d="M4 11h6v3.5A3.5 3.5 0 0 1 6.5 18 2.5 2.5 0 0 1 4 15.5V11ZM14 11h6v4.5a2.5 2.5 0 0 1-2.5 2.5 3.5 3.5 0 0 1-3.5-3.5V11Z" />
          <path d="M3 21h18M7 8V5.5M17 8V5.5M10 5.5c.8-1.7 3.2-1.7 4 0" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.3 2.5 3.4 5.5 3.4 9S14.3 18.5 12 21c-2.3-2.5-3.4-5.5-3.4-9S9.7 5.5 12 3Z" />
        </svg>
      );
    case "source":
      return (
        <svg {...common}>
          <path d="m9.5 14.5 5-5" />
          <path
            d="M7.2 17.8 5.7 19.3a3.5 3.5 0 1 1-5-5l3.5-3.5a3.5 3.5 0 0 1 5 0"
            transform="translate(2)"
          />
          <path d="m14.8 6.2 1.5-1.5a3.5 3.5 0 1 1 5 5l-3.5 3.5a3.5 3.5 0 0 1-5 0" />
        </svg>
      );
    case "tune":
      return (
        <svg {...common}>
          <path d="M4 6h7M15 6h5M4 12h3M11 12h9M4 18h9M17 18h3" />
          <circle cx="13" cy="6" r="2" />
          <circle cx="9" cy="12" r="2" />
          <circle cx="15" cy="18" r="2" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="11" rx="3" />
          <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10M12 14v3" />
        </svg>
      );
  }
}

function AvailabilityDocket() {
  const { t } = useI18n();

  return (
    <aside className="love-note mx-auto max-w-md overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <span className="docket-label flex items-center gap-2">
          <span className="text-[var(--accent-text)]" aria-hidden>
            ♥
          </span>
          {t("Availability docket")}
        </span>
        <span className="font-mono text-[10px] text-muted">DD—001</span>
      </div>
      <div className="grid grid-cols-[5.25rem_1fr]">
        <div className="border-r border-[var(--border)] bg-[var(--tint-ember-bg)]/45 p-4 text-center">
          <div className="docket-label text-[var(--accent-text)]">
            {t("Sat")}
          </div>
          <div className="mt-2 font-display text-[42px] leading-none">29</div>
          <div className="mt-2 font-mono text-[9px] text-muted">
            {t("AUG / SEOUL")}
          </div>
        </div>
        <div className="p-5">
          <div className="docket-label text-muted">{t("Window submitted")}</div>
          <div className="mt-2 font-display text-[27px]">18:00—22:30</div>
          <div className="mt-2 text-[13px] leading-relaxed text-soft">
            {t("One quiet evening. Flexible on neighbourhood.")}
          </div>
        </div>
      </div>
      <div className="border-t border-dashed border-[var(--tint-ember-border)] px-5 py-5">
        <div className="flex items-end justify-between gap-5">
          <div>
            <div className="docket-label text-muted">
              {t("Concierge instruction")}
            </div>
            <div className="mt-2 max-w-[14rem] text-[14px] font-medium leading-snug">
              {t(
                "Find someone thoughtful. Keep it easy to leave, easy to extend.",
              )}
            </div>
          </div>
          <div className="rotate-[-5deg] rounded-full border-2 border-ember-300 bg-[var(--tint-ember-bg)] px-3.5 py-2 text-center text-ember-500">
            <div className="docket-label text-[9px]">{t("Ready")}</div>
            <div className="mt-0.5 font-mono text-[8px]">CONCIERGE</div>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border)] bg-[var(--bg-sunken)]/65 px-5 py-3 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
        {t("Next: compatibility → venue research → private invite")}
      </div>
    </aside>
  );
}

/** A concrete example, so the concept lands before anyone signs up. */
function SampleDrop() {
  const { t } = useI18n();

  return (
    <article className="love-note relative overflow-hidden">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-7">
        <span className="docket-label flex items-center gap-2 text-[var(--accent-text)]">
          <Logo className="h-4 w-4" /> {t("New DateDrop")}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
          {t("Preview / grounded live")}
        </span>
      </header>

      <div className="grid sm:grid-cols-[8rem_1fr]">
        <div className="border-b border-[var(--border)] p-5 sm:border-b-0 sm:border-r sm:p-6">
          <div className="docket-label text-muted">{t("Saturday")}</div>
          <div className="mt-2 font-display text-[42px] leading-none">7:00</div>
          <div className="mt-1 font-mono text-[10px] text-muted">PM · KST</div>
          <div className="mt-7 docket-label text-muted">{t("Area")}</div>
          <div className="mt-1.5 text-[14px] font-semibold">Seongsu</div>
          <div className="text-[12px] text-muted">Seoul</div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="docket-label text-muted">{t("Proposed route")}</div>
          <div className="mt-5 space-y-5">
            <PlanStop
              time="19:00"
              title="Charmandre British Kitchen"
              body={t("Dinner · calm room · about ₩28,000")}
            />
            <PlanStop
              time="20:40"
              title={t("Quiet dessert café")}
              body={t("Four minutes on foot · open late")}
            />
          </div>

          <div className="mt-7 rounded-2xl border border-dashed border-[var(--tint-ember-border)] bg-[var(--tint-ember-bg)]/45 p-4">
            <div className="docket-label text-muted">
              {t("Who you would meet")}
            </div>
            <div className="mt-2 text-[16px] font-semibold">
              Alex · 29 · Seongsu
            </div>
            <div className="mt-1 text-[12px] text-muted">
              {t("Running / Films / Coffee")}
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-soft">
              {t(
                "You both prefer quieter first dates and share an interest in films and running.",
              )}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="docket-label text-muted">{t("Estimate")}</div>
              <div className="mt-1 text-[14px] font-semibold">
                ≈ ₩45,000 / {t("person")}
              </div>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full border border-[var(--border)] px-4 py-2 text-[13px] text-muted">
                {t("Pass")}
              </span>
              <span className="rounded-full border border-ember-600 bg-ember-600 px-4 py-2 text-[13px] font-bold text-white shadow-[0_10px_20px_-14px_var(--shadow-ink)]">
                {t("Accept")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function PlanStop({
  time,
  title,
  body,
}: {
  time: string;
  title: string;
  body: string;
}) {
  return (
    <div className="grid grid-cols-[3.5rem_1fr] gap-3">
      <span className="font-mono text-[10px] text-[var(--accent-text)]">
        {time}
      </span>
      <div>
        <div className="text-[14px] font-semibold leading-tight">{title}</div>
        <div className="mt-1 text-[12px] leading-relaxed text-muted">
          {body}
        </div>
      </div>
    </div>
  );
}
