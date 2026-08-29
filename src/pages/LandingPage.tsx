import { Link } from "react-router-dom";
import { Logo } from "../components/layout/Logo";
import { Wordmark } from "../components/layout/Wordmark";
import { LocaleSwitcher } from "../components/layout/LocaleSwitcher";
import { ThemeToggle } from "../components/layout/AppShell";
import { LinkButton } from "../components/ui/primitives";
import { useI18n, type LocaleCode } from "../i18n";

type LandingExample = {
  city: string;
  area: string;
  venue: string;
  currency: string;
  activityAmount: number;
  zoneLabel: string;
};

const LANDING_EXAMPLES: Record<LocaleCode, LandingExample> = {
  "en-US": {
    city: "New York",
    area: "Williamsburg",
    venue: "Independent cinema",
    currency: "USD",
    activityAmount: 18,
    zoneLabel: "EDT",
  },
  "en-GB": {
    city: "London",
    area: "Shoreditch",
    venue: "Independent cinema",
    currency: "GBP",
    activityAmount: 16,
    zoneLabel: "BST",
  },
  "en-CA": {
    city: "Toronto",
    area: "Queen West",
    venue: "Independent cinema",
    currency: "CAD",
    activityAmount: 17,
    zoneLabel: "EDT",
  },
  "en-AU": {
    city: "Sydney",
    area: "Surry Hills",
    venue: "Independent cinema",
    currency: "AUD",
    activityAmount: 22,
    zoneLabel: "AEST",
  },
  "ko-KR": {
    city: "서울",
    area: "성수",
    venue: "독립영화관",
    currency: "KRW",
    activityAmount: 15_000,
    zoneLabel: "KST",
  },
  "ja-JP": {
    city: "東京",
    area: "中目黒",
    venue: "ミニシアター",
    currency: "JPY",
    activityAmount: 2_000,
    zoneLabel: "JST",
  },
  "de-DE": {
    city: "Berlin",
    area: "Kreuzberg",
    venue: "Programmkino",
    currency: "EUR",
    activityAmount: 14,
    zoneLabel: "CEST",
  },
  "fr-FR": {
    city: "Paris",
    area: "Canal Saint-Martin",
    venue: "Cinéma indépendant",
    currency: "EUR",
    activityAmount: 13,
    zoneLabel: "CEST",
  },
  "nl-NL": {
    city: "Amsterdam",
    area: "De Pijp",
    venue: "Filmhuis",
    currency: "EUR",
    activityAmount: 15,
    zoneLabel: "CEST",
  },
  "sv-SE": {
    city: "Stockholm",
    area: "Södermalm",
    venue: "Indiebiograf",
    currency: "SEK",
    activityAmount: 160,
    zoneLabel: "CEST",
  },
};

function sampleTime(locale: LocaleCode, hour: number, minute: number) {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2026, 7, 29, hour, minute)));
}

function sampleRange(
  locale: LocaleCode,
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
) {
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });

  return formatter.formatRange(
    new Date(Date.UTC(2026, 7, 29, startHour, startMinute)),
    new Date(Date.UTC(2026, 7, 29, endHour, endMinute)),
  );
}

function sampleMoney(locale: LocaleCode, amount: number, currency: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function LandingPage() {
  const { locale, t } = useI18n();
  const example = LANDING_EXAMPLES[locale];

  return (
    <div className="landing-page min-h-dvh">
      <header className="glass-bar landing-header sticky top-0 z-30 border-b border-[var(--border)]">
        <div className="mx-auto flex h-[4.75rem] max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <div className="leading-none">
              <Wordmark className="text-[24px]" />
              <div className="docket-label mt-1.5 text-[8px] text-muted">
                {t("Let's make it a date")}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2.5">
            <Link
              to="#how-it-works"
              className="hidden rounded-full px-3 py-2 text-[12px] font-bold text-soft transition-colors hover:bg-[var(--bg-sunken)] hover:text-[var(--text)] md:inline-flex"
            >
              {t("How it works")}
            </Link>
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
        <section className="landing-hero relative overflow-hidden">
          <div className="hero-color-field hero-color-field-one" aria-hidden />
          <div className="hero-color-field hero-color-field-two" aria-hidden />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-20 lg:min-h-[calc(100dvh-4.75rem)] lg:grid-cols-[minmax(0,0.94fr)_minmax(25rem,1.06fr)] lg:gap-10 lg:py-20">
            <div className="relative z-10">
              <div className="hero-kicker docket-label animate-fade-up text-[var(--accent-text)]">
                <span className="hero-kicker-dot" aria-hidden />
                {t("New people, real plans")} · {example.city}
              </div>
              <h1
                className="display-heading hero-title mt-6 max-w-3xl animate-fade-up"
                style={{ animationDelay: "40ms" }}
              >
                {t("What do you want to do?")}
                <span className="hero-title-accent block italic text-[var(--accent-text)]">
                  {t("Find someone to do it with.")}
                </span>
              </h1>
              <p
                className="mt-7 max-w-xl animate-fade-up text-[16px] leading-[1.7] text-soft sm:text-[18px]"
                style={{ animationDelay: "80ms" }}
              >
                {t(
                  "A film, a walk, a gallery—or whatever sounds good. Tell us the date you want; we'll find someone compatible to share it.",
                )}
              </p>
              <div
                className="mt-8 flex animate-fade-up flex-col items-start gap-3 sm:flex-row sm:items-center"
                style={{ animationDelay: "120ms" }}
              >
                <LinkButton
                  to="/signup"
                  size="lg"
                  className="hero-primary-action"
                >
                  {t("Find someone to go with")}{" "}
                  <span className="text-[20px]" aria-hidden>
                    ↗
                  </span>
                </LinkButton>
                <Link
                  to="#how-it-works"
                  className="hero-text-link group inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-bold text-muted transition-colors hover:text-[var(--text)]"
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-strong)] transition-transform group-hover:translate-y-0.5"
                    aria-hidden
                  >
                    ↓
                  </span>
                  {t("See what happens next")}
                </Link>
              </div>

              <ul
                className="hero-promises mt-10 flex animate-fade-up flex-wrap gap-2.5"
                style={{ animationDelay: "160ms" }}
              >
                {[
                  t("The activity comes first"),
                  t("No forced chemistry"),
                  t("No second stop required"),
                ].map((label, index) => (
                  <li
                    key={label}
                    className={`hero-promise hero-promise-${index + 1}`}
                  >
                    <span aria-hidden>{index === 1 ? "✦" : "✓"}</span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <DateNightPreview example={example} locale={locale} />
          </div>
        </section>

        <CustomerJourney example={example} locale={locale} />

        <section className="landing-finale relative overflow-hidden px-5 py-16 sm:px-8 sm:py-24">
          <span className="finale-orbit finale-orbit-one" aria-hidden>
            ♡
          </span>
          <span className="finale-orbit finale-orbit-two" aria-hidden>
            ✦
          </span>
          <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-[2.5rem] px-7 py-12 sm:px-12 sm:py-16 md:grid-cols-[1fr_auto]">
            <div className="relative z-10">
              <div className="docket-label text-[var(--accent-text)]">
                {t("Your idea comes first")}
              </div>
              <h2 className="display-heading mt-3 max-w-3xl text-[clamp(2.4rem,6vw,5.4rem)]">
                {t("What do you want to do next?")}
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-soft sm:text-[17px]">
                {t("Bring the idea. We'll find the person.")}
              </p>
            </div>
            <div className="relative z-10 flex justify-start md:justify-end">
              <LinkButton to="/signup" size="lg" className="finale-action">
                {t("Find someone to go with")} <span aria-hidden>↗</span>
              </LinkButton>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--bg-sunken)]/65">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-5 py-9 text-[12px] text-muted sm:flex-row sm:items-end sm:px-8">
          <div className="flex items-center gap-2.5">
            <Logo className="h-6 w-6" />
            <div>
              <Wordmark className="text-[19px] text-[var(--text)]" />
              <div className="mt-0.5">
                {t("Your idea. One new person. One real date.")}
              </div>
            </div>
          </div>
          <div className="flex gap-5">
            <Link to="/terms" className="hover:text-[var(--text)]">
              {t("Terms")}
            </Link>
            <Link to="/privacy" className="hover:text-[var(--text)]">
              {t("Privacy")}
            </Link>
            <Link
              to="/community-guidelines"
              className="hover:text-[var(--text)]"
            >
              {t("Community")}
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

function CustomerJourney({
  example,
  locale,
}: {
  example: LandingExample;
  locale: LocaleCode;
}) {
  const { t } = useI18n();
  const evening = sampleRange(locale, 19, 0, 22, 0);
  const dateTime = sampleTime(locale, 19, 0);
  const activityAmount = sampleMoney(
    locale,
    example.activityAmount,
    example.currency,
  );

  return (
    <section
      id="how-it-works"
      className="romance-night journey-section scroll-mt-20 overflow-hidden text-sand-50"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div className="max-w-3xl">
            <div className="docket-label text-ember-300">
              {t("How it works")}
            </div>
            <h2 className="display-heading mt-4 text-[clamp(2.6rem,6vw,5.2rem)]">
              {t("Start with the date you actually want.")}
            </h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-sand-300 sm:text-[17px] md:pb-2 md:text-right">
            {t(
              "The plan comes first. Then we find the right person to join you.",
            )}
          </p>
        </div>

        <div className="journey-landscape relative mt-14">
          <svg
            className="journey-route"
            viewBox="0 0 1200 520"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              className="journey-route-ghost"
              d="M38 322C188 58 348 62 468 255c104 168 209 216 328 37 106-160 214-148 370 8"
            />
            <path
              className="journey-route-live"
              d="M38 322C188 58 348 62 468 255c104 168 209 216 328 37 106-160 214-148 370 8"
            />
          </svg>

          <div className="journey-beats grid gap-5 lg:grid-cols-3 lg:gap-7">
            <article className="journey-beat journey-beat-one flex min-h-[25rem] flex-col p-5 sm:p-7">
              <SceneHeading
                number="01"
                icon="calendar"
                title={t("Name the date")}
              />
              <p className="mt-4 text-[14px] leading-relaxed text-[var(--beat-muted)]">
                {t("A film and nothing after? That's a complete date.")}
              </p>
              <div className="mt-auto pt-8">
                <AvailabilityWindow
                  label="🎬"
                  owner={t("Friday")}
                  time={evening}
                />
                <div className="date-idea-ticket mt-3">
                  <span className="docket-label text-[8px] text-[var(--beat-muted)]">
                    {t("Your date idea")}
                  </span>
                  <strong>{t("Watch an indie film")}</strong>
                  <small>{t("Film only. No second stop needed.")}</small>
                </div>
              </div>
            </article>

            <article className="journey-beat journey-beat-two flex min-h-[27rem] flex-col p-5 sm:p-7">
              <SceneHeading
                number="02"
                icon="meet"
                title={t("Find someone who wants the same thing")}
              />
              <p className="mt-4 text-[14px] leading-relaxed text-[var(--beat-muted)]">
                {t(
                  "We match the activity, timing, and the person—not a restaurant reservation.",
                )}
              </p>
              <div className="journey-plan-ticket mt-auto rounded-[1.5rem] p-5">
                <div className="docket-label text-[9px] text-[var(--beat-accent)]">
                  {t("Film night")}
                </div>
                <div className="mt-3 font-display text-[26px] text-[var(--beat-text)]">
                  {dateTime} · {example.area}
                </div>
                <div className="mt-5">
                  <PlanStop
                    time={dateTime}
                    title={example.venue}
                    body={t("One screening · about {amount}", {
                      amount: activityAmount,
                    })}
                  />
                </div>
                <div className="mt-4 border-t border-[var(--beat-border)] pt-4 text-[12px] leading-relaxed text-[var(--beat-muted)]">
                  {t(
                    "You both want to see a film. Nothing else has to be added.",
                  )}
                </div>
              </div>
            </article>

            <article className="journey-beat journey-beat-three flex min-h-[25rem] flex-col p-5 sm:p-7">
              <SceneHeading
                number="03"
                icon="reply"
                title={t("Go do exactly that")}
              />
              <p className="mt-4 text-[14px] leading-relaxed text-[var(--beat-muted)]">
                {t(
                  "Both say yes. Meet in public. No pressure to make it more.",
                )}
              </p>
              <div className="mt-auto space-y-2.5 pt-8">
                <PrivateReply owner={t("You")} accept={t("Accept")} />
                <PrivateReply owner={t("Match")} accept={t("Accept")} />
                <div className="mt-3 flex items-center justify-between rounded-2xl bg-[var(--beat-accent)] px-4 py-3 text-white">
                  <span className="flex items-center gap-2 text-[12px] font-bold">
                    <span aria-hidden>♥</span> {t("It's a date")}
                  </span>
                  <span className="font-mono text-[9px] uppercase">
                    {t("Added to calendar")}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>

        <div className="journey-trust mt-10 flex flex-wrap gap-2 text-[11px] font-bold text-sand-300">
          {[
            ["lock", t("No contact details exchanged")],
            ["meet", t("Public places only")],
            ["source", t("Every venue has a live source")],
          ].map(([icon, label]) => (
            <span
              key={label}
              className="flex items-center gap-2 rounded-full border border-sand-500/30 bg-white/[0.035] px-3 py-2"
            >
              <VisualIcon kind={icon as VisualIconKind} />
              {label}
            </span>
          ))}
          <Link
            to="/safety"
            className="ml-auto rounded-full px-3 py-2 text-sand-400 underline decoration-sand-500 underline-offset-4 hover:text-sand-200"
          >
            18+ · {t("No identity verification")} · {t("Safety Center")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function SceneHeading({
  number,
  icon,
  title,
  centered = false,
}: {
  number: string;
  icon: VisualIconKind;
  title: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "text-center" : ""}>
      <div
        className={`flex items-center gap-3 text-[var(--beat-accent)] ${
          centered ? "justify-center" : "justify-between"
        }`}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--beat-border)] bg-[var(--beat-panel)]">
          <VisualIcon kind={icon} />
        </span>
        <span className="journey-step-number font-mono text-[10px]">
          {number}
        </span>
      </div>
      <h3 className="mt-5 text-[19px] font-bold text-[var(--beat-text)]">
        {title}
      </h3>
    </div>
  );
}

function AvailabilityWindow({
  label,
  owner,
  time,
}: {
  label: string;
  owner: string;
  time: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-[var(--beat-border)] bg-[var(--beat-panel)] p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--beat-accent)] text-[11px] font-bold text-white">
        {label}
      </span>
      <span className="min-w-0">
        <span className="docket-label block text-[8px] text-[var(--beat-muted)]">
          {owner}
        </span>
        <span className="mt-1 block font-mono text-[11px] text-[var(--beat-text)]">
          {time}
        </span>
      </span>
    </div>
  );
}

function PrivateReply({ owner, accept }: { owner: string; accept: string }) {
  return (
    <div className="rounded-2xl border border-[var(--beat-border)] bg-[var(--beat-panel)] p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[11px] font-bold text-[var(--beat-text)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--beat-accent)] text-white">
            ♥
          </span>
          {owner}
          <VisualIcon kind="lock" />
        </span>
        <span className="rounded-full bg-[var(--beat-accent)] px-3 py-1.5 text-[9px] font-bold text-white">
          {accept} ✓
        </span>
      </div>
    </div>
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

function DateNightPreview({
  example,
  locale,
}: {
  example: LandingExample;
  locale: LocaleCode;
}) {
  const { t } = useI18n();
  const dateTime = sampleTime(locale, 19, 0);
  const estimate = sampleMoney(
    locale,
    example.activityAmount,
    example.currency,
  );

  return (
    <aside
      className="hero-stage relative mx-auto w-full max-w-[38rem]"
      aria-label={t("Your idea, matched")}
    >
      <div className="hero-stage-wash" aria-hidden />
      <svg className="hero-loop" viewBox="0 0 600 620" fill="none" aria-hidden>
        <path d="M91 235C24 430 173 575 366 550c175-22 250-215 157-360C432 48 206 64 123 180" />
      </svg>
      <span className="hero-spark hero-spark-one" aria-hidden>
        ✦
      </span>
      <span className="hero-spark hero-spark-two" aria-hidden>
        ♡
      </span>

      <figure className="hero-photo-shell relative overflow-hidden">
        <img
          src="/movie-date-photo-v3.webp"
          alt=""
          width={1536}
          height={1024}
          fetchPriority="high"
          decoding="async"
          className="hero-photo h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#130c10]/70 via-transparent to-transparent" />
        <figcaption className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
          <div className="docket-label text-[9px] text-[#ffd2c9]">
            {t("Friday")} · {dateTime} · {example.area}
          </div>
          <div className="mt-2 max-w-sm font-display text-[25px] leading-[1.12] sm:text-[33px]">
            {t("One film. One new person. That's the whole plan.")}
          </div>
        </figcaption>
        <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-[#21151c]/65 px-3 py-2 backdrop-blur-md sm:left-6 sm:top-6">
          <span className="docket-label flex items-center gap-2 text-[9px] text-[#ffe7df]">
            <Logo className="h-4 w-4" /> {t("Your idea, matched")}
          </span>
        </div>
      </figure>

      <div className="hero-plan-card">
        <div className="flex items-center justify-between gap-5">
          <span className="docket-label text-[9px] text-[var(--accent-text)]">
            {t("Your date idea")}
          </span>
          <span className="font-mono text-[9px] text-muted">DD—001</span>
        </div>
        <div className="hero-route mt-3">
          <div className="hero-route-stop">
            <span className="hero-route-time">{dateTime}</span>
            <span className="hero-route-copy">
              <strong>{example.venue}</strong>
              <small>{t("Film only. No second stop needed.")}</small>
            </span>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <span className="rounded-full bg-[var(--bg-sunken)] px-3 py-2 text-[9px] font-bold text-soft">
            ≈ {estimate} / {t("person")}
          </span>
        </div>
      </div>

      <div className="hero-confirmation-card">
        <span className="hero-confirmation-icon" aria-hidden>
          ✓
        </span>
        <span>
          <span className="docket-label block text-[8px] opacity-70">
            {t("Both said yes")}
          </span>
          <span className="mt-1 block text-[13px] font-extrabold">
            {t("It's a date")}
          </span>
        </span>
      </div>
    </aside>
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
    <div className="grid grid-cols-[4.75rem_1fr] gap-3">
      <span className="font-mono text-[10px] text-[var(--beat-accent)]">
        {time}
      </span>
      <div>
        <div className="text-[14px] font-semibold leading-tight">{title}</div>
        <div className="mt-1 text-[12px] leading-relaxed text-[var(--beat-muted)]">
          {body}
        </div>
      </div>
    </div>
  );
}
