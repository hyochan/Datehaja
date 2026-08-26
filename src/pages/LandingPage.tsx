import { Link } from "react-router-dom";
import { Logo } from "../components/layout/Logo";
import { ThemeToggle } from "../components/layout/AppShell";
import { LinkButton } from "../components/ui/primitives";

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex h-18 max-w-5xl items-center justify-between px-5 pt-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <span className="font-display text-[20px] font-medium tracking-tight">
            DateDrop
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            to="/signin"
            className="rounded-full px-4 py-2 text-[14.5px] font-medium text-muted transition-colors hover:text-[var(--text)]"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* -------------------------------- hero -------------------------------- */}
      <section className="relative overflow-hidden px-5 pb-8 pt-14 sm:px-8 sm:pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-14rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(226_112_63/0.18),transparent_66%)] blur-2xl"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="animate-fade-up text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-text)]">
            Tell us when. We handle who &amp; where.
          </p>

          <h1
            className="mt-5 animate-fade-up text-balance text-[clamp(2.6rem,8vw,4.6rem)] leading-[1.02] tracking-[-0.035em]"
            style={{ animationDelay: "60ms" }}
          >
            We plan the date.
            <br />
            <span className="text-[var(--accent-text)]">You just say yes.</span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-xl animate-fade-up text-pretty text-[17px] leading-relaxed text-soft sm:text-[19px]"
            style={{ animationDelay: "120ms" }}
          >
            DateDrop doesn't ask who you like. It asks when you're free — then
            plans a real date at a real place and privately invites someone
            compatible.
          </p>

          <div
            className="mt-9 flex animate-fade-up flex-col items-center gap-3 sm:flex-row sm:justify-center"
            style={{ animationDelay: "180ms" }}
          >
            <LinkButton to="/signup" size="lg" className="w-full sm:w-auto">
              Get my first DateDrop
            </LinkButton>
            <Link
              to="/signin"
              className="text-[15px] font-medium text-muted underline-offset-4 transition-colors hover:text-[var(--text)] hover:underline"
            >
              I already have an account
            </Link>
          </div>

          <ul
            className="mx-auto mt-9 flex max-w-lg animate-fade-up flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[14px] text-muted"
            style={{ animationDelay: "240ms" }}
          >
            <li className="flex items-center gap-1.5">
              <Cross /> No swiping
            </li>
            <li className="flex items-center gap-1.5">
              <Cross /> No endless chats
            </li>
            <li className="flex items-center gap-1.5">
              <Cross /> No exchanging contact info
            </li>
          </ul>
        </div>
      </section>

      {/* ------------------------------ inversion ----------------------------- */}
      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-9 text-center text-[clamp(1.6rem,4vw,2.3rem)] leading-tight">
            The whole thing, backwards
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-card border border-[var(--border)] bg-[var(--bg-sunken)] p-6">
              <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Every other dating app
              </div>
              <ol className="space-y-2.5 text-[15px] text-soft">
                {["Browse", "Swipe", "Match", "Chat forever", "Maybe decide to meet", "Work out where to go"].map(
                  (step, i) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="mt-0.5 w-4 shrink-0 text-[12px] font-semibold text-muted">
                        {i + 1}
                      </span>
                      <span className={i > 2 ? "line-through decoration-[var(--border-strong)]" : ""}>
                        {step}
                      </span>
                    </li>
                  ),
                )}
              </ol>
            </div>

            <div className="rounded-card border border-[var(--tint-ember-border)] bg-[var(--tint-ember-bg)] p-6">
              <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--tint-ember-strong)]">
                DateDrop
              </div>
              <ol className="space-y-2.5 text-[15px] text-[var(--text)]">
                {[
                  "Say when you're free",
                  "We find someone compatible",
                  "We plan a real date",
                  "You both say yes",
                  "You meet",
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="mt-0.5 w-4 shrink-0 text-[12px] font-semibold text-[var(--accent-text)]">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ the drop ------------------------------ */}
      <section className="px-5 pb-16 sm:px-8 sm:pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="grid items-center gap-10 sm:grid-cols-[1fr_1.05fr]">
            <div>
              <h2 className="text-[clamp(1.6rem,4vw,2.3rem)] leading-tight">
                A DateDrop is a plan, not a profile
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-soft">
                Not a name to research. Not a conversation to maintain. A time, a
                place, a reason it suits you both — and one decision to make.
              </p>
              <ul className="mt-6 space-y-3.5">
                {[
                  ["Real places", "Researched live on the web, with the source attached."],
                  ["Real reasoning", "Why this person, in plain language you could show them."],
                  ["Real privacy", "First name and neighbourhood. Nothing else, ever."],
                ].map(([title, body]) => (
                  <li key={title} className="flex gap-3">
                    <Dot />
                    <div>
                      <div className="text-[15px] font-medium">{title}</div>
                      <div className="text-[14px] leading-relaxed text-muted">{body}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <SampleDrop />
          </div>
        </div>
      </section>

      {/* ------------------------------- privacy ------------------------------ */}
      <section className="border-y border-[var(--border)] bg-[var(--bg-sunken)] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-[clamp(1.5rem,4vw,2.1rem)] leading-tight">
            They never get your email. Or your number.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-soft">
            Every invitation, confirmation and reminder comes from DateDrop
            Concierge — our inbox, not yours. Before you both say yes, all anyone
            sees is a first name, an age, a neighbourhood and a few interests.
          </p>
          <div className="mx-auto mt-7 flex max-w-md flex-wrap justify-center gap-2">
            {[
              "Email address",
              "Phone number",
              "Home address",
              "Exact location",
              "Full name",
              "Socials",
            ].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-raised)] px-3 py-1.5 text-[13px] text-muted"
              >
                <Cross />
                {item}
              </span>
            ))}
          </div>
          <p className="mt-6 text-[13px] text-muted">
            DateDrop is 18+. We don't verify identity — read exactly what we do
            and don't do in the{" "}
            <Link to="/safety" className="underline underline-offset-2 hover:text-[var(--text)]">
              Safety Center
            </Link>
            .
          </p>
        </div>
      </section>

      {/* --------------------------------- CTA -------------------------------- */}
      <section className="px-5 py-20 text-center sm:px-8 sm:py-28">
        <h2 className="mx-auto max-w-2xl text-balance text-[clamp(1.8rem,5vw,2.8rem)] leading-tight">
          When are you free this week?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[16px] text-soft">
          That's the only question we need answered.
        </p>
        <div className="mt-8">
          <LinkButton to="/signup" size="lg">
            Get my first DateDrop
          </LinkButton>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] px-5 py-9 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-[13.5px] text-muted sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo className="h-5 w-5" />
            <span>DateDrop — we plan the date, you just say yes.</span>
          </div>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-[var(--text)]">
              Privacy
            </Link>
            <Link to="/safety" className="hover:text-[var(--text)]">
              Safety
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** A concrete example, so the concept lands before anyone signs up. */
function SampleDrop() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-x-4 -bottom-3 h-full rounded-card border border-[var(--border)] bg-[var(--bg-sunken)]"
      />
      <div className="relative animate-drop-in rounded-card border border-[var(--border)] bg-[var(--bg-raised)] p-6 shadow-[var(--shadow-lift)]">
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tint-ember-bg)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--tint-ember-fg)]">
            <Logo className="h-3.5 w-3.5" />
            New DateDrop
          </span>
          <span className="text-[12px] text-muted">example</span>
        </div>

        <div className="font-display text-[24px] leading-tight">Saturday · 7:00 PM</div>
        <div className="mt-1 text-[15px] text-soft">Seongsu, Seoul</div>

        <div className="my-5 h-px bg-[var(--border)]" />

        <div className="space-y-3">
          <div className="flex gap-3">
            <Stop n="1" />
            <div>
              <div className="text-[15px] font-medium">Italian dinner</div>
              <div className="text-[13.5px] text-muted">Small room, open kitchen, no music to shout over</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Stop n="2" />
            <div>
              <div className="text-[15px] font-medium">Quiet dessert café</div>
              <div className="text-[13.5px] text-muted">Four minutes' walk, open until midnight</div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-[var(--bg-sunken)] p-4">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
            Who you'd be meeting
          </div>
          <div className="text-[15px] font-medium">Alex · 29 · Seongsu</div>
          <div className="mt-0.5 text-[13.5px] text-muted">
            Product designer · Running · Films · Coffee
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-soft">
            You both prefer quieter first dates and share an interest in films
            and running.
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-[14px] text-muted">≈ ₩45,000/person</span>
          <div className="flex gap-2">
            <span className="rounded-full border border-[var(--border-strong)] px-4 py-2 text-[14px] text-muted">
              Pass
            </span>
            <span className="rounded-full bg-ember-400 px-4 py-2 text-[14px] font-medium text-white">
              Accept
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stop({ n }: { n: string }) {
  return (
    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--tint-ember-bg)] text-[12px] font-semibold text-[var(--tint-ember-strong)]">
      {n}
    </span>
  );
}

function Cross() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
      className="text-ember-400"
    >
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

function Dot() {
  return (
    <span
      aria-hidden
      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-400"
    />
  );
}
