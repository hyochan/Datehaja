import { Link } from "react-router-dom";
import { Logo } from "../components/layout/Logo";
import { ThemeToggle } from "../components/layout/AppShell";
import { LinkButton } from "../components/ui/primitives";

const OLD_WAY = [
  "Browse strangers",
  "Swipe on a hunch",
  "Match",
  "Perform small talk",
  "Negotiate a plan",
  "Maybe meet",
];

const DATE_DROP_WAY = [
  ["01", "Say when you're free"],
  ["02", "Receive one considered plan"],
  ["03", "Both answer privately"],
  ["04", "Meet in public"],
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-[var(--border-strong)] bg-[var(--bg)]">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <div className="leading-none">
              <div className="font-display text-[21px] font-medium tracking-tight">
                DateDrop
              </div>
              <div className="docket-label mt-1.5 text-[8px] text-muted">
                Private date concierge
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/signin"
              className="rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-raised)] px-3.5 py-2 text-[13px] font-semibold transition-colors hover:border-[var(--text-muted)] sm:px-4"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-[var(--border-strong)]">
          <div className="mx-auto grid max-w-6xl lg:grid-cols-[minmax(0,1.28fr)_minmax(20rem,0.72fr)]">
            <div className="px-5 py-14 sm:px-8 sm:py-20 lg:py-28 lg:pr-16">
              <div className="docket-label animate-fade-up text-[var(--accent-text)]">
                Service note 001 · Seoul
              </div>
              <h1
                className="mt-7 max-w-3xl animate-fade-up text-[clamp(3.25rem,9vw,6.8rem)] leading-[0.89] tracking-[-0.055em]"
                style={{ animationDelay: "40ms" }}
              >
                Bring us a free evening.
                <span className="mt-2 block text-[var(--accent-text)]">
                  We'll return a date.
                </span>
              </h1>
              <p
                className="mt-8 max-w-[38rem] animate-fade-up text-[17px] leading-[1.7] text-soft sm:text-[19px]"
                style={{ animationDelay: "80ms" }}
              >
                No profiles to browse. No conversation to keep alive. DateDrop
                finds a compatible person, researches a real place, and sends
                one private invitation to each of you.
              </p>

              <div
                className="mt-9 flex animate-fade-up flex-col items-start gap-4 sm:flex-row sm:items-center"
                style={{ animationDelay: "120ms" }}
              >
                <LinkButton to="/signup" size="lg">
                  Open an evening <span aria-hidden>→</span>
                </LinkButton>
                <Link
                  to="#how-it-works"
                  className="paper-rule py-2 text-[13px] font-semibold text-muted transition-colors hover:text-[var(--text)]"
                >
                  Read the two-minute brief
                </Link>
              </div>

              <dl
                className="mt-14 grid animate-fade-up grid-cols-3 border-y border-[var(--border)]"
                style={{ animationDelay: "160ms" }}
              >
                {[
                  ["01", "No swiping"],
                  ["02", "No chat audition"],
                  ["03", "No contacts shared"],
                ].map(([number, label], index) => (
                  <div
                    key={label}
                    className={`py-4 ${index > 0 ? "border-l border-[var(--border)] pl-4 sm:pl-6" : "pr-3"}`}
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

            <div className="border-t border-[var(--border-strong)] bg-[var(--bg-sunken)] px-5 py-10 sm:px-8 lg:border-l lg:border-t-0 lg:px-10 lg:py-20">
              <AvailabilityDocket />
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-b border-[var(--border-strong)]"
        >
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr] lg:gap-20">
              <div>
                <div className="docket-label text-[var(--accent-text)]">
                  The route
                </div>
                <h2 className="mt-4 text-[clamp(2.25rem,5vw,4.2rem)] leading-[0.98]">
                  Less matching.
                  <br />
                  More meeting.
                </h2>
                <p className="mt-5 max-w-sm text-[16px] leading-relaxed text-soft">
                  We removed every step that exists only to keep you inside a
                  dating app.
                </p>
              </div>

              <div className="grid border border-[var(--border-strong)] bg-[var(--bg-raised)] md:grid-cols-2">
                <div className="p-6 sm:p-8">
                  <div className="docket-label text-muted">The usual route</div>
                  <ol className="mt-6">
                    {OLD_WAY.map((step, index) => (
                      <li
                        key={step}
                        className="grid grid-cols-[2rem_1fr] border-t border-[var(--border)] py-3 text-[14px] text-muted first:border-t-0"
                      >
                        <span className="font-mono text-[10px]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="line-through decoration-[var(--border-strong)] decoration-1">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="border-t border-[var(--border-strong)] bg-[var(--tint-ember-bg)] p-6 sm:p-8 md:border-l md:border-t-0">
                  <div className="docket-label text-[var(--tint-ember-strong)]">
                    The DateDrop route
                  </div>
                  <ol className="mt-6">
                    {DATE_DROP_WAY.map(([number, step]) => (
                      <li
                        key={step}
                        className="grid grid-cols-[2rem_1fr] border-t border-[var(--tint-ember-border)] py-4 first:border-t-0"
                      >
                        <span className="font-mono text-[10px] text-[var(--accent-text)]">
                          {number}
                        </span>
                        <span className="text-[15px] font-semibold">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[var(--border-strong)]">
          <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="lg:sticky lg:top-28">
              <div className="docket-label text-[var(--accent-text)]">
                What arrives
              </div>
              <h2 className="mt-4 text-[clamp(2.2rem,5vw,4rem)] leading-[0.98]">
                A plan,
                <br />
                not a profile.
              </h2>
              <p className="mt-6 max-w-md text-[16px] leading-relaxed text-soft">
                A DateDrop has a time, a public place, a budget, and one honest
                reason the two of you might enjoy it. Nothing to research. One
                decision to make.
              </p>
              <ol className="mt-9 max-w-md border-y border-[var(--border)]">
                {[
                  ["01", "Places researched on the live web"],
                  ["02", "Sources and evidence attached"],
                  ["03", "Constraints and budget respected"],
                ].map(([number, text]) => (
                  <li
                    key={text}
                    className="grid grid-cols-[2.5rem_1fr] border-t border-[var(--border)] py-3.5 text-[14px] first:border-t-0"
                  >
                    <span className="docket-label text-muted">{number}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            <SampleDrop />
          </div>
        </section>

        <section className="bg-ink-950 text-sand-50">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div>
              <div className="docket-label text-ember-300">
                Private by construction
              </div>
              <h2 className="mt-4 text-[clamp(2.3rem,5vw,4.4rem)] leading-[0.98]">
                The date arrives.
                <br />
                Your details don't.
              </h2>
              <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-sand-300">
                DateDrop Concierge sends every invitation separately. Before you
                both accept, your match gets a first name, age, neighbourhood,
                and a few interests — never your inbox or number.
              </p>
            </div>

            <div className="border-y border-sand-500/50">
              {[
                "Email address",
                "Phone number",
                "Home address",
                "Exact location",
                "Full name",
                "Social handles",
              ].map((item, index) => (
                <div
                  key={item}
                  className="grid grid-cols-[2.5rem_1fr_auto] items-center border-t border-sand-500/30 py-3.5 first:border-t-0"
                >
                  <span className="font-mono text-[10px] text-sand-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[14px] text-sand-300">{item}</span>
                  <span className="docket-label text-ember-300">
                    Not shared
                  </span>
                </div>
              ))}
              <p className="border-t border-sand-500/30 py-5 text-[12px] leading-relaxed text-sand-400">
                DateDrop is 18+. We do not verify identity. Read exactly what we
                do and don't do in the{" "}
                <Link
                  to="/safety"
                  className="text-sand-200 underline underline-offset-4"
                >
                  Safety Center
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-[var(--border-strong)]">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-[1fr_auto]">
            <div>
              <div className="docket-label text-[var(--accent-text)]">
                Your invitation is open
              </div>
              <h2 className="mt-3 text-[clamp(2.15rem,5vw,3.8rem)] leading-none">
                When are you free?
              </h2>
              <p className="mt-4 text-[15px] text-soft">
                That is still the only question we need answered.
              </p>
            </div>
            <LinkButton to="/signup" size="lg">
              Get my first DateDrop <span aria-hidden>→</span>
            </LinkButton>
          </div>
        </section>
      </main>

      <footer className="bg-[var(--bg-sunken)]">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-5 py-9 text-[12px] text-muted sm:flex-row sm:items-end sm:px-8">
          <div className="flex items-center gap-2.5">
            <Logo className="h-6 w-6" />
            <div>
              <div className="font-display text-[16px] text-[var(--text)]">
                DateDrop
              </div>
              <div className="mt-0.5">We plan the date. You just say yes.</div>
            </div>
          </div>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-[var(--text)]">
              Privacy
            </Link>
            <Link to="/safety" className="hover:text-[var(--text)]">
              Safety
            </Link>
            <Link to="/signin" className="hover:text-[var(--text)]">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AvailabilityDocket() {
  return (
    <aside className="mx-auto max-w-md border border-[var(--border-strong)] bg-[var(--bg-raised)] shadow-[6px_6px_0_var(--shadow-ink)]">
      <div className="flex items-center justify-between border-b border-[var(--border-strong)] px-5 py-4">
        <span className="docket-label">Availability docket</span>
        <span className="font-mono text-[10px] text-muted">DD—001</span>
      </div>
      <div className="grid grid-cols-[5.25rem_1fr]">
        <div className="border-r border-[var(--border)] p-4 text-center">
          <div className="docket-label text-[var(--accent-text)]">Sat</div>
          <div className="mt-2 font-display text-[42px] leading-none">29</div>
          <div className="mt-2 font-mono text-[9px] text-muted">
            AUG / SEOUL
          </div>
        </div>
        <div className="p-5">
          <div className="docket-label text-muted">Window submitted</div>
          <div className="mt-2 font-display text-[27px]">18:00—22:30</div>
          <div className="mt-2 text-[13px] leading-relaxed text-soft">
            One quiet evening. Flexible on neighbourhood.
          </div>
        </div>
      </div>
      <div className="border-t border-dashed border-[var(--border-strong)] px-5 py-5">
        <div className="flex items-end justify-between gap-5">
          <div>
            <div className="docket-label text-muted">Concierge instruction</div>
            <div className="mt-2 max-w-[14rem] text-[14px] font-medium leading-snug">
              Find someone thoughtful. Keep it easy to leave, easy to extend.
            </div>
          </div>
          <div className="rotate-[-7deg] border-2 border-ember-400 px-2.5 py-2 text-center text-ember-500">
            <div className="docket-label text-[9px]">Ready</div>
            <div className="mt-0.5 font-mono text-[8px]">CONCIERGE</div>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border)] bg-[var(--bg-sunken)] px-5 py-3 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
        Next: compatibility → venue research → private invite
      </div>
    </aside>
  );
}

/** A concrete example, so the concept lands before anyone signs up. */
function SampleDrop() {
  return (
    <article className="relative border border-[var(--border-strong)] bg-[var(--bg-raised)] shadow-[7px_7px_0_var(--shadow-ink)]">
      <header className="flex items-center justify-between border-b border-[var(--border-strong)] px-5 py-4 sm:px-7">
        <span className="docket-label flex items-center gap-2 text-[var(--accent-text)]">
          <Logo className="h-4 w-4" /> New DateDrop
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
          Preview / grounded live
        </span>
      </header>

      <div className="grid sm:grid-cols-[8rem_1fr]">
        <div className="border-b border-[var(--border)] p-5 sm:border-b-0 sm:border-r sm:p-6">
          <div className="docket-label text-muted">Saturday</div>
          <div className="mt-2 font-display text-[42px] leading-none">7:00</div>
          <div className="mt-1 font-mono text-[10px] text-muted">PM · KST</div>
          <div className="mt-7 docket-label text-muted">Area</div>
          <div className="mt-1.5 text-[14px] font-semibold">Seongsu</div>
          <div className="text-[12px] text-muted">Seoul</div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="docket-label text-muted">Proposed route</div>
          <div className="mt-5 space-y-5">
            <PlanStop
              time="19:00"
              title="Charmandre British Kitchen"
              body="Dinner · calm room · about ₩28,000"
            />
            <PlanStop
              time="20:40"
              title="Quiet dessert café"
              body="Four minutes on foot · open late"
            />
          </div>

          <div className="mt-7 border-y border-dashed border-[var(--border-strong)] py-5">
            <div className="docket-label text-muted">Who you would meet</div>
            <div className="mt-2 text-[16px] font-semibold">
              Alex · 29 · Seongsu
            </div>
            <div className="mt-1 text-[12px] text-muted">
              Running / Films / Coffee
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-soft">
              You both prefer quieter first dates and share an interest in films
              and running.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="docket-label text-muted">Estimate</div>
              <div className="mt-1 text-[14px] font-semibold">
                ≈ ₩45,000 / person
              </div>
            </div>
            <div className="flex gap-2">
              <span className="rounded-[3px] border border-[var(--border-strong)] px-4 py-2 text-[13px] text-muted">
                Pass
              </span>
              <span className="rounded-[3px] border border-ember-600 bg-ember-400 px-4 py-2 text-[13px] font-semibold text-white shadow-[2px_2px_0_var(--shadow-ink)]">
                Accept
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
