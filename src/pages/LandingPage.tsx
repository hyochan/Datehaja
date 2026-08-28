import { Link } from "react-router-dom";
import { Logo } from "../components/layout/Logo";
import { LocaleSwitcher } from "../components/layout/LocaleSwitcher";
import { ThemeToggle } from "../components/layout/AppShell";
import { LinkButton } from "../components/ui/primitives";
import { useI18n, type LocaleCode } from "../i18n";

type LandingExample = {
  city: string;
  area: string;
  venue: string;
  person: string;
  currency: string;
  dinnerAmount: number;
  totalAmount: number;
  zoneLabel: string;
};

const LANDING_EXAMPLES: Record<LocaleCode, LandingExample> = {
  "en-US": {
    city: "New York",
    area: "Williamsburg",
    venue: "Neighborhood bistro",
    person: "Alex",
    currency: "USD",
    dinnerAmount: 38,
    totalAmount: 62,
    zoneLabel: "EDT",
  },
  "en-GB": {
    city: "London",
    area: "Shoreditch",
    venue: "Neighbourhood bistro",
    person: "Jamie",
    currency: "GBP",
    dinnerAmount: 32,
    totalAmount: 52,
    zoneLabel: "BST",
  },
  "en-CA": {
    city: "Montréal",
    area: "Mile End",
    venue: "Neighbourhood bistro",
    person: "Riley",
    currency: "CAD",
    dinnerAmount: 42,
    totalAmount: 68,
    zoneLabel: "EDT",
  },
  "en-AU": {
    city: "Melbourne",
    area: "Fitzroy",
    venue: "Neighbourhood bistro",
    person: "Taylor",
    currency: "AUD",
    dinnerAmount: 46,
    totalAmount: 74,
    zoneLabel: "AEST",
  },
  "ko-KR": {
    city: "서울",
    area: "성수",
    venue: "동네 비스트로",
    person: "민준",
    currency: "KRW",
    dinnerAmount: 28_000,
    totalAmount: 45_000,
    zoneLabel: "KST",
  },
  "ja-JP": {
    city: "東京",
    area: "中目黒",
    venue: "街のビストロ",
    person: "ハル",
    currency: "JPY",
    dinnerAmount: 4_600,
    totalAmount: 7_500,
    zoneLabel: "JST",
  },
  "de-DE": {
    city: "Berlin",
    area: "Kreuzberg",
    venue: "Bistro im Viertel",
    person: "Luca",
    currency: "EUR",
    dinnerAmount: 34,
    totalAmount: 56,
    zoneLabel: "CEST",
  },
  "fr-FR": {
    city: "Paris",
    area: "Canal Saint-Martin",
    venue: "Bistrot du quartier",
    person: "Camille",
    currency: "EUR",
    dinnerAmount: 36,
    totalAmount: 58,
    zoneLabel: "CEST",
  },
  "nl-NL": {
    city: "Amsterdam",
    area: "De Pijp",
    venue: "Bistro in de buurt",
    person: "Sam",
    currency: "EUR",
    dinnerAmount: 35,
    totalAmount: 57,
    zoneLabel: "CEST",
  },
  "sv-SE": {
    city: "Stockholm",
    area: "Södermalm",
    venue: "Kvartersbistro",
    person: "Noah",
    currency: "SEK",
    dinnerAmount: 390,
    totalAmount: 650,
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
    <div className="min-h-dvh">
      <header className="glass-bar sticky top-0 z-30 border-b border-[var(--border)]">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <div className="leading-none">
              <div className="brand-wordmark text-[22px] font-medium">
                Datehaja
              </div>
              <div className="docket-label mt-1.5 text-[8px] text-muted">
                {t("Let's make it a date")}
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
                {t("Service note 001")} · {example.city}
              </div>
              <h1
                className="display-heading hero-title mt-6 max-w-3xl animate-fade-up"
                style={{ animationDelay: "40ms" }}
              >
                {t("Pick a night.")}
                <span className="hero-title-accent block italic text-[var(--accent-text)]">
                  {t("Let's make it a date.")}
                </span>
              </h1>
              <p
                className="mt-7 max-w-2xl animate-fade-up text-[16px] leading-relaxed text-soft sm:text-[18px]"
                style={{ animationDelay: "80ms" }}
              >
                {t(
                  "Tell us when you're free. We'll find someone compatible, plan a real date, and send it to you both.",
                )}
              </p>
              <div
                className="mt-8 flex animate-fade-up flex-col items-start gap-4 sm:flex-row sm:items-center"
                style={{ animationDelay: "120ms" }}
              >
                <LinkButton to="/signup" size="lg">
                  {t("Find me a date")} <span aria-hidden>→</span>
                </LinkButton>
                <Link
                  to="#how-it-works"
                  className="rounded-full px-3 py-2 text-[13px] font-bold text-muted transition-colors hover:bg-[var(--bg-sunken)] hover:text-[var(--text)]"
                >
                  {t("See what happens next")}
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
              <DateNightPreview example={example} locale={locale} />
            </div>
          </div>
        </section>

        <CustomerJourney example={example} locale={locale} />

        <section className="px-5 py-10 sm:px-8 sm:py-14">
          <div className="soft-section mx-auto grid max-w-6xl items-center gap-8 px-6 py-10 sm:px-10 sm:py-12 md:grid-cols-[1fr_auto]">
            <div>
              <div className="docket-label text-[var(--accent-text)]">
                {t("One night is enough")}
              </div>
              <h2 className="display-heading mt-3 text-[clamp(2.15rem,5vw,3.8rem)]">
                {t("Shall we make it a date?")}
              </h2>
              <p className="mt-4 text-[15px] text-soft">
                {t("That is still the only question we need answered.")}
              </p>
            </div>
            <LinkButton to="/signup" size="lg">
              {t("Find me a date")} <span aria-hidden>→</span>
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
                Datehaja
              </div>
              <div className="mt-0.5">
                {t("Pick a night. Let's make it a date.")}
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
  const dinnerAmount = sampleMoney(
    locale,
    example.dinnerAmount,
    example.currency,
  );

  return (
    <section
      id="how-it-works"
      className="romance-night scroll-mt-20 overflow-hidden text-sand-50"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-3xl">
          <div className="docket-label text-ember-300">{t("How it works")}</div>
          <h2 className="display-heading mt-4 text-[clamp(2.35rem,5vw,4.4rem)]">
            {t("From “I'm free” to “see you there.”")}
          </h2>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-sand-300 sm:text-[17px]">
            {t("Three small choices. No audition in between.")}
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          <article className="flex min-h-[25rem] flex-col rounded-[2rem] border border-sand-500/25 bg-white/[0.04] p-5 sm:p-7">
            <SceneHeading
              number="01"
              icon="calendar"
              title={t("Choose a night")}
            />
            <p className="mt-4 text-[14px] leading-relaxed text-sand-300">
              {t("Friday, 7–10 PM. That's all we need.")}
            </p>
            <div className="mt-auto pt-8">
              <AvailabilityWindow
                label="♥"
                owner={t("Friday")}
                time={evening}
              />
              <div className="mt-3 flex items-center gap-2 px-1 text-[11px] font-bold text-ember-200">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ember-500 text-[9px] text-white">
                  ✓
                </span>
                {t("Window submitted")}
              </div>
            </div>
          </article>

          <article className="flex min-h-[25rem] flex-col rounded-[2rem] border border-ember-300/30 bg-ember-300/[0.07] p-5 sm:p-7">
            <SceneHeading
              number="02"
              icon="meet"
              title={t("Receive one considered plan")}
            />
            <p className="mt-4 text-[14px] leading-relaxed text-sand-300">
              {t("One person, one public place, one plan that fits.")}
            </p>
            <div className="mt-auto rounded-[1.5rem] border border-ember-300/25 bg-[#291a22] p-5 shadow-[0_24px_50px_-38px_rgb(0_0_0/0.9)]">
              <div className="docket-label text-[9px] text-ember-300">
                {t("New date plan")}
              </div>
              <div className="mt-3 font-display text-[26px] text-sand-50">
                {dateTime} · {example.area}
              </div>
              <div className="mt-5">
                <PlanStop
                  time={dateTime}
                  title={example.venue}
                  body={t("Dinner · calm room · about {amount}", {
                    amount: dinnerAmount,
                  })}
                />
              </div>
              <div className="mt-4 border-t border-ember-300/15 pt-4 text-[12px] leading-relaxed text-sand-300">
                {t(
                  "You both prefer quieter first dates and share an interest in films and running.",
                )}
              </div>
            </div>
          </article>

          <article className="flex min-h-[25rem] flex-col rounded-[2rem] border border-sand-500/25 bg-white/[0.04] p-5 sm:p-7">
            <SceneHeading
              number="03"
              icon="reply"
              title={t("Both answer privately")}
            />
            <p className="mt-4 text-[14px] leading-relaxed text-sand-300">
              {t(
                "When you both choose yes, the date is ready for your calendar.",
              )}
            </p>
            <div className="mt-auto space-y-2.5 pt-8">
              <PrivateReply owner={t("You")} accept={t("Accept")} />
              <PrivateReply owner={t("Match")} accept={t("Accept")} />
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-ember-500 px-4 py-3 text-white">
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

        <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-bold text-sand-300">
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
        className={`flex items-center gap-3 text-ember-300 ${
          centered ? "justify-center" : "justify-between"
        }`}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ember-300/30 bg-ember-300/10">
          <VisualIcon kind={icon} />
        </span>
        <span className="font-mono text-[10px]">{number}</span>
      </div>
      <h3 className="mt-4 text-[16px] font-bold text-sand-50">{title}</h3>
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
    <div className="flex items-center gap-2.5 rounded-2xl border border-sand-500/25 bg-white/[0.035] p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ember-300/15 text-[11px] font-bold text-ember-200">
        {label}
      </span>
      <span className="min-w-0">
        <span className="docket-label block text-[8px] text-sand-400">
          {owner}
        </span>
        <span className="mt-1 block font-mono text-[11px] text-sand-100">
          {time}
        </span>
      </span>
    </div>
  );
}

function PrivateReply({ owner, accept }: { owner: string; accept: string }) {
  return (
    <div className="rounded-2xl border border-sand-500/25 bg-white/[0.035] p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[11px] font-bold text-sand-200">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ember-300/15 text-ember-200">♥</span>
          {owner}
          <VisualIcon kind="lock" />
        </span>
        <span className="rounded-full bg-ember-500 px-3 py-1.5 text-[9px] font-bold text-white">
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
  const estimate = sampleMoney(locale, example.totalAmount, example.currency);

  return (
    <aside className="love-note mx-auto max-w-md overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src="/date-night-illustration.webp"
          alt=""
          width={1440}
          height={960}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b1117] via-transparent to-[#1b1117]/15" />
        <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-[#21151c]/80 px-3 py-2 backdrop-blur-md">
          <span className="docket-label flex items-center gap-2 text-[9px] text-ember-200">
            <Logo className="h-4 w-4" /> {t("Your Friday, planned")}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <div className="docket-label text-[9px] text-ember-200">
            {t("Friday")} · {dateTime} · {example.area}
          </div>
          <div className="mt-2 font-display text-[26px] leading-tight sm:text-[30px]">
            {t("Dinner, then dessert if it feels right.")}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-2 text-[10px] font-bold text-muted">
          <span className="rounded-full bg-[var(--tint-ember-bg)] px-3 py-2">
            {t("Meet in public")}
          </span>
          <span className="rounded-full bg-[var(--tint-ember-bg)] px-3 py-2">
            ≈ {estimate} / {t("person")}
          </span>
          <span className="rounded-full bg-[var(--tint-ember-bg)] px-3 py-2">
            {t("Your contact details stay yours")}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-[var(--tint-ember-border)] bg-[var(--tint-ember-bg)] px-4 py-3">
          <span>
            <span className="docket-label block text-[8px] text-muted">
              {t("Both said yes")}
            </span>
            <span className="mt-1 block text-[14px] font-bold text-[var(--accent-text)]">
              {t("It's a date")}
            </span>
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ember-500 text-white">
            ♥
          </span>
        </div>
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
