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

function sampleMonth(locale: LocaleCode) {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2026, 7, 29)));
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
                datehaja
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
                {t("Service note 001")} · {example.city}
              </div>
              <h1
                className="display-heading hero-title mt-6 max-w-3xl animate-fade-up"
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
              <AvailabilityDocket example={example} locale={locale} />
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="lg:sticky lg:top-28">
              <div className="docket-label text-[var(--accent-text)]">
                {t("What arrives")}
              </div>
              <h2 className="display-heading mt-4 text-[clamp(2.2rem,5vw,4rem)]">
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

            <SampleDrop example={example} locale={locale} />
          </div>
        </section>

        <ConciergeFlow example={example} locale={locale} />

        <section className="px-5 py-10 sm:px-8 sm:py-14">
          <div className="soft-section mx-auto grid max-w-6xl items-center gap-8 px-6 py-10 sm:px-10 sm:py-12 md:grid-cols-[1fr_auto]">
            <div>
              <div className="docket-label text-[var(--accent-text)]">
                {t("Your invitation is open")}
              </div>
              <h2 className="display-heading mt-3 text-[clamp(2.15rem,5vw,3.8rem)]">
                {t("When are you free?")}
              </h2>
              <p className="mt-4 text-[15px] text-soft">
                {t("That is still the only question we need answered.")}
              </p>
            </div>
            <LinkButton to="/signup" size="lg">
              {t("Plan my first date")} <span aria-hidden>→</span>
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
                datehaja
              </div>
              <div className="mt-0.5">
                {t("Let's date. We'll make the plan.")}
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

function ConciergeFlow({
  example,
  locale,
}: {
  example: LandingExample;
  locale: LocaleCode;
}) {
  const { t } = useI18n();
  const eveningA = sampleRange(locale, 18, 0, 22, 30);
  const eveningB = sampleRange(locale, 18, 30, 22, 0);
  const dateTime = sampleTime(locale, 19, 0);
  const estimate = sampleMoney(locale, example.totalAmount, example.currency);

  return (
    <section
      id="how-it-works"
      className="romance-night scroll-mt-20 overflow-hidden text-sand-50"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-3xl">
          <div className="docket-label text-ember-300">{t("How it works")}</div>
          <h2 className="display-heading mt-4 text-[clamp(2.35rem,5vw,4.4rem)]">
            {t("One free evening goes in. A real date comes out.")}
          </h2>
        </div>

        <div className="relative mt-12 overflow-hidden rounded-[2.25rem] border border-sand-500/25 bg-white/[0.035] p-5 shadow-[0_30px_80px_-52px_rgb(0_0_0/0.9)] sm:p-8">
          <span
            className="absolute -right-8 -top-10 text-[9rem] leading-none text-ember-300/[0.035]"
            aria-hidden
          >
            ♡
          </span>

          <div className="relative grid gap-3 lg:grid-cols-[0.95fr_3.5rem_1.1fr_3.5rem_0.95fr] lg:items-center">
            <article>
              <SceneHeading
                number="01"
                icon="calendar"
                title={t("Open an evening")}
              />
              <div className="mt-6 space-y-2.5">
                <AvailabilityWindow
                  label="A"
                  owner={t("You")}
                  time={eveningA}
                />
                <AvailabilityWindow
                  label="B"
                  owner={t("Match")}
                  time={eveningB}
                />
              </div>
            </article>

            <FlowThread />

            <article className="py-2 text-center">
              <SceneHeading
                number="02"
                icon="spark"
                title={t("Private date concierge")}
                centered
              />
              <div className="mt-6 flex flex-col items-center gap-4">
                <span className="relative flex h-24 w-24 items-center justify-center rounded-full border border-ember-300/40 bg-ember-300/10 shadow-[0_0_0_12px_rgb(247_155_153/0.035)]">
                  <span className="absolute -right-1 top-0 text-ember-300">
                    ✦
                  </span>
                  <Logo className="h-11 w-11" />
                </span>
                <div className="flex max-w-xs flex-wrap justify-center gap-1.5 text-[10px] font-bold text-sand-300">
                  <span className="rounded-full border border-sand-500/30 px-2.5 py-1.5">
                    {t("Match")}
                  </span>
                  <span className="rounded-full border border-sand-500/30 px-2.5 py-1.5">
                    {t("Places researched on the live web")}
                  </span>
                  <span className="rounded-full border border-sand-500/30 px-2.5 py-1.5">
                    {t("Constraints and budget respected")}
                  </span>
                </div>
              </div>
            </article>

            <FlowThread />

            <article>
              <SceneHeading
                number="03"
                icon="reply"
                title={t("Both answer privately")}
              />
              <div className="mt-6 space-y-2.5">
                <PrivateReply label="A" accept={t("Accept")} />
                <PrivateReply label="B" accept={t("Accept")} />
              </div>
            </article>
          </div>

          <div className="relative my-6 flex h-16 items-center justify-center lg:my-8">
            <span className="absolute h-full border-l border-dashed border-ember-300/35" />
            <span className="z-10 flex h-10 w-10 items-center justify-center rounded-full border border-ember-300/40 bg-[#34212a] text-[14px] text-ember-300">
              ♥
            </span>
          </div>

          <article className="relative mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-ember-300/35 bg-ember-300/[0.08] shadow-[0_24px_60px_-42px_rgb(0_0_0/0.9)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ember-300/25 px-5 py-4">
              <span className="flex items-center gap-2.5 text-[11px] font-bold text-ember-200">
                <span className="rounded-full bg-ember-500 px-2.5 py-1 text-[9px] text-white">
                  A ✓
                </span>
                <span aria-hidden>+</span>
                <span className="rounded-full bg-ember-500 px-2.5 py-1 text-[9px] text-white">
                  B ✓
                </span>
                <span className="ml-1">{t("Meet in public")}</span>
              </span>
              <span className="font-mono text-[9px] text-sand-400">DD—001</span>
            </div>
            <div className="grid sm:grid-cols-[7rem_1fr]">
              <div className="border-b border-ember-300/20 p-5 text-center sm:border-b-0 sm:border-r">
                <div className="docket-label text-[9px] text-ember-300">
                  {t("Sat")}
                </div>
                <div className="mt-1 font-display text-[38px]">29</div>
              </div>
              <div className="p-5">
                <div className="font-display text-[28px]">{dateTime}</div>
                <div className="mt-2 text-[14px] font-bold text-sand-100">
                  {example.venue} · {example.area}
                </div>
                <div className="mt-1 text-[11px] text-sand-400">
                  {example.city} · {example.zoneLabel} · ≈ {estimate} /{" "}
                  {t("person")}
                </div>
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

function FlowThread() {
  return (
    <div
      className="relative flex h-12 items-center justify-center lg:h-auto"
      aria-hidden
    >
      <span className="absolute h-full border-l border-dashed border-ember-300/35 lg:h-auto lg:w-full lg:border-l-0 lg:border-t" />
      <span className="z-10 flex h-9 w-9 rotate-90 items-center justify-center rounded-full border border-ember-300/35 bg-[#34212a] font-mono text-[14px] text-ember-300 lg:rotate-0">
        →
      </span>
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

function PrivateReply({ label, accept }: { label: string; accept: string }) {
  return (
    <div className="rounded-2xl border border-sand-500/25 bg-white/[0.035] p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[11px] font-bold text-sand-200">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ember-300/15 text-ember-200">
            {label}
          </span>
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

function AvailabilityDocket({
  example,
  locale,
}: {
  example: LandingExample;
  locale: LocaleCode;
}) {
  const { t } = useI18n();
  const availability = sampleRange(locale, 18, 0, 22, 30);

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
          <div className="mt-2 font-mono text-[9px] uppercase text-muted">
            {sampleMonth(locale)} / {example.city}
          </div>
        </div>
        <div className="p-5">
          <div className="docket-label text-muted">{t("Window submitted")}</div>
          <div className="mt-2 font-display text-[clamp(1.2rem,4vw,1.7rem)]">
            {availability}
          </div>
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
function SampleDrop({
  example,
  locale,
}: {
  example: LandingExample;
  locale: LocaleCode;
}) {
  const { t } = useI18n();
  const dinnerTime = sampleTime(locale, 19, 0);
  const dessertTime = sampleTime(locale, 20, 40);
  const dinnerAmount = sampleMoney(
    locale,
    example.dinnerAmount,
    example.currency,
  );
  const estimate = sampleMoney(locale, example.totalAmount, example.currency);

  return (
    <article className="love-note relative overflow-hidden">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-7">
        <span className="docket-label flex items-center gap-2 text-[var(--accent-text)]">
          <Logo className="h-4 w-4" /> {t("New date plan")}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
          {t("Preview / localized example")}
        </span>
      </header>

      <div className="grid sm:grid-cols-[8rem_1fr]">
        <div className="border-b border-[var(--border)] p-5 sm:border-b-0 sm:border-r sm:p-6">
          <div className="docket-label text-muted">{t("Saturday")}</div>
          <div className="mt-2 font-display text-[34px] leading-none">
            {dinnerTime}
          </div>
          <div className="mt-1 font-mono text-[10px] text-muted">
            {example.zoneLabel}
          </div>
          <div className="mt-7 docket-label text-muted">{t("Area")}</div>
          <div className="mt-1.5 text-[14px] font-semibold">{example.area}</div>
          <div className="text-[12px] text-muted">{example.city}</div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="docket-label text-muted">{t("Proposed route")}</div>
          <div className="mt-5 space-y-5">
            <PlanStop
              time={dinnerTime}
              title={example.venue}
              body={t("Dinner · calm room · about {amount}", {
                amount: dinnerAmount,
              })}
            />
            <PlanStop
              time={dessertTime}
              title={t("Quiet dessert café")}
              body={t("Four minutes on foot · open late")}
            />
          </div>

          <div className="mt-7 rounded-2xl border border-dashed border-[var(--tint-ember-border)] bg-[var(--tint-ember-bg)]/45 p-4">
            <div className="docket-label text-muted">
              {t("Who you would meet")}
            </div>
            <div className="mt-2 text-[16px] font-semibold">
              {example.person} · 29 · {example.area}
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
                ≈ {estimate} / {t("person")}
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
