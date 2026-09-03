import { useEffect } from "react";
import { useMutation } from "convex/react";
import { Link } from "react-router-dom";
import { api } from "@convex/_generated/api";
import { Logo } from "../components/layout/Logo";
import { Wordmark } from "../components/layout/Wordmark";
import { LocaleSwitcher } from "../components/layout/LocaleSwitcher";
import { ThemeToggle } from "../components/layout/AppShell";
import { HeaderMenu } from "../components/layout/HeaderMenu";
import { LinkButton } from "../components/ui/primitives";
import { useI18n } from "../i18n";
import { AgentWorldSprite } from "../components/agent/AgentDateWorld";
import { AgentLoopPlayer } from "../components/agent/AgentLoopPlayer";
import { AgentAvatar } from "../components/agent/AgentAvatar";

const JUNO_AVATAR = {
  gender: "female",
  palette: "rose",
  face: "gentle",
  hair: "wave",
  outfit: "cardigan",
  accessory: "star",
} as const;

const SOL_AVATAR = {
  palette: "violet",
  face: "curious",
  hair: "crop",
  outfit: "blazer",
  accessory: "glasses",
  gender: "male",
} as const;


export default function LandingPage() {
  const { locale, t } = useI18n();
  const track = useMutation(api.growth.track);

  useEffect(() => {
    try {
      const key = "datehaja-agent-landing-view";
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
      const anonymousId =
        localStorage.getItem("datehaja-anonymous-id") ?? crypto.randomUUID();
      localStorage.setItem("datehaja-anonymous-id", anonymousId);
      const params = new URLSearchParams(window.location.search);
      void track({
        anonymousId,
        event: "agent_landing_viewed",
        locale,
        source: params.get("utm_source") ?? undefined,
        campaign: params.get("utm_campaign") ?? undefined,
      });
    } catch {
      // Analytics must never block the product, including in strict privacy mode.
    }
  }, [locale, track]);

  return (
    <div className="agent-landing min-h-dvh">
      <header className="glass-bar landing-header sticky top-0 z-30 border-b border-[var(--border)]">
        <div className="mx-auto flex h-[5rem] max-w-[80rem] items-center justify-between px-5 sm:h-[5.5rem] sm:px-8">
          <Link
            to="/"
            className="brand-lockup flex items-center gap-2.5 sm:gap-3"
            aria-label={t("Datehaja home")}
          >
            <Logo className="brand-lockup-logo h-9 w-9 sm:h-11 sm:w-11" />
            <div className="leading-none">
              <Wordmark className="text-[24px] sm:text-[29px]" />
              <div className="docket-label mt-1.5 hidden text-[8px] text-muted sm:block sm:text-[9px]">
                {t("Your dating agent")}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2.5">
            <Link
              to="#how-it-works"
              className="hidden rounded-full px-3 py-2 text-[12px] font-bold text-soft hover:bg-[var(--bg-sunken)] sm:inline-flex"
            >
              {t("How it works")}
            </Link>
            <div className="hidden items-center gap-1 sm:flex sm:gap-2.5">
              <LocaleSwitcher compact />
              <ThemeToggle />
            </div>
            <Link
              to="/signin"
              className="whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-2 text-[13px] font-bold shadow-[var(--shadow-soft)] hover:border-[var(--tint-ember-border)] sm:px-5"
            >
              {t("Sign in")}
            </Link>
            <HeaderMenu className="sm:hidden">
              <Link
                to="#how-it-works"
                className="rounded-2xl px-3 py-2.5 text-[13px] font-bold text-soft hover:bg-[var(--bg-sunken)]"
              >
                {t("How it works")}
              </Link>
            </HeaderMenu>
          </div>
        </div>
      </header>

      <main>
        <section className="agent-hero relative overflow-hidden">
          <div className="agent-hero-glow" aria-hidden />
          <div className="mx-auto grid max-w-[80rem] items-center gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-20 lg:min-h-[calc(100dvh-5.5rem)] lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:py-20">
            <div className="relative z-[1]">
              <div className="docket-label flex items-center gap-2 text-[var(--accent-text)]">
                <span className="h-2 w-2 rounded-full bg-ember-500" />
                {t("Too busy for another first date?")}
              </div>
              <h1 className="agent-hero-title display-heading mt-6 max-w-3xl text-[clamp(3.8rem,7vw,6.8rem)] leading-[0.9]">
                {t("Let your Agent")}{" "}
                <span className="mt-2 block italic text-[var(--accent-text)]">
                  {t("go first.")}
                </span>
              </h1>
              <p className="mt-8 max-w-xl text-[17px] leading-[1.75] text-soft sm:text-[19px]">
                {t(
                  "Your Agent meets first and brings back an honest read. You decide whether to make it real.",
                )}
              </p>
              <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <LinkButton to="/signup" size="lg">
                  {t("Create my dating agent")} <span aria-hidden>↗</span>
                </LinkButton>
                <Link
                  to="#how-it-works"
                  className="rounded-full px-4 py-3 text-[13px] font-bold text-muted hover:text-[var(--text)]"
                >
                  {t("Watch the agents meet")} ↓
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-semibold text-muted">
                <span>✓ {t("AI is always identified")}</span>
                <span>✓ {t("Private briefs stay private")}</span>
                <span>✓ {t("Humans control contact")}</span>
              </div>
            </div>
            <AgentLoopPlayer t={t} compact />
          </div>
        </section>

        <section
          id="how-it-works"
          className="agent-journey-section border-y border-[var(--border)] bg-[var(--bg-sunken)] py-16 sm:py-24"
        >
          <div className="mx-auto max-w-[80rem] px-5 sm:px-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="docket-label text-[var(--accent-text)]">
                  {t("How it works")}
                </div>
                <h2 className="display-heading mt-3 max-w-2xl text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.94]">
                  {t("Your Agent goes first.")}
                </h2>
              </div>
              <span className="docket-label text-muted">
                {t("Two Agents talking")} · {t("zero contacts exposed")}
              </span>
            </div>
            <AgentLoopPlayer t={t} />
          </div>
        </section>

        <section
          id="agent-debrief"
          className="agent-debrief-section relative overflow-hidden py-20 sm:py-28"
        >
          <div className="agent-debrief-aurora" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="agent-debrief-layout mx-auto grid max-w-[80rem] gap-12 px-5 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div className="agent-debrief-copy relative z-[1]">
              <div className="docket-label text-[var(--accent-text)]">
                {t("Not a compatibility score machine")}
              </div>
              <h2 className="agent-debrief-title display-heading mt-5">
                <span>{t("Your agent can say:")}</span>
                <em>{t("don't meet them.")}</em>
              </h2>
              <p className="agent-debrief-intro mt-6 max-w-lg text-soft">
                {t(
                  "Six moments. Two independent reads. One honest recommendation.",
                )}
              </p>
              <AgentReturnNote t={t} />
            </div>
            <DebriefCard t={t} />
          </div>
        </section>

        <section className="agent-capture-section border-y border-[var(--border)] py-20 sm:py-28">
          <div className="mx-auto max-w-[80rem] px-5 sm:px-8">
            <div className="agent-capture-heading">
              <div>
                <div className="docket-label text-[var(--accent-text)]">
                  {t("See the whole story")}
                </div>
                <h2 className="display-heading mt-4 text-[clamp(2.6rem,6vw,5.4rem)] leading-[0.9]">
                  {t("Watch the agents meet")}
                </h2>
              </div>
              <p>{t("Your Agent goes first.")}</p>
            </div>

            <div className="agent-capture-grid">
              <ProductPeekCard index="01" scene="meet" t={t} />
              <ProductPeekCard index="02" scene="debrief" t={t} />
              <ProductPeekCard index="03" scene="consent" t={t} />
            </div>
          </div>
        </section>

        <section
          id="agent-stack"
          className="agent-stack-section border-y border-[var(--border)] py-20 sm:py-24"
        >
          <div className="mx-auto max-w-[80rem] px-5 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
              <div>
                <div className="docket-label text-[var(--accent-text)]">
                  {t("While you get on with your day")}
                </div>
                <h2 className="mt-4 text-[clamp(2.7rem,5vw,4.7rem)] leading-[0.98]">
                  {t("Four quiet jobs. One Agent who knows you.")}
                </h2>
                <div className="agent-stack-pulse mt-7" aria-hidden="true">
                  <i />
                  <span>{t("No new dashboard to learn")}</span>
                </div>
              </div>
              <AgentEverydayJourney t={t} />
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="agent-final-cta relative mx-auto max-w-[80rem] overflow-hidden rounded-[2.4rem] border border-[var(--border-strong)] px-6 py-16 text-center sm:px-12 sm:py-24">
            <div className="agent-final-orbit" aria-hidden />
            <FinalAgentPair />
            <div className="docket-label relative z-[1] text-[var(--accent-text)]">
              {t("Let your better listener go first")}
            </div>
            <h2 className="display-heading relative z-[1] mx-auto mt-5 max-w-4xl text-[clamp(3rem,6vw,5.6rem)] leading-[0.96]">
              {t("Maybe your agent already knows who you should meet.")}
            </h2>
            <p className="relative z-[1] mx-auto mt-6 max-w-xl text-[15px] leading-[1.75] text-soft">
              {t(
                "Teach it who you are. Send it out. Keep the final decision human.",
              )}
            </p>
            <LinkButton to="/signup" size="lg" className="relative z-[1] mt-8">
              {t("Create my agent")} →
            </LinkButton>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-8">
        <div className="mx-auto flex max-w-[80rem] flex-col gap-4 px-5 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <Wordmark className="text-[18px]" />
            <span>· {t("AI proxies, human consent")}</span>
          </div>
          <div className="flex flex-wrap gap-5">
            <Link to="/terms">{t("Terms")}</Link>
            <Link to="/privacy">{t("Privacy")}</Link>
            <Link to="/safety">{t("Safety")}</Link>
            <Link to="/community-guidelines">{t("Community")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProductPeekCard({
  index,
  scene,
  t,
}: {
  index: string;
  scene: "meet" | "debrief" | "consent";
  t: (key: string) => string;
}) {
  const captions = {
    meet: t("Juno and Sol meet in the date world"),
    debrief: t("Juno returns with an honest private read"),
    consent: t("Only two human yeses open the introduction"),
  };

  return (
    <figure className={`agent-capture-card agent-product-peek is-${scene}`}>
      <div className="agent-product-window">
        <header>
          <Logo className="h-6 w-6" />
          <strong>Datehaja</strong>
          <span>{index}</span>
        </header>

        {scene === "meet" && (
          <div className="agent-peek-world">
            <div className="agent-peek-place">
              <small>{t("DATE WORLD")}</small>
              <b>{t("The late café")}</b>
            </div>
            <AgentWorldSprite
              person={{
                name: "Juno",
                avatar: JUNO_AVATAR,
              }}
              position={[27, 72]}
              className="agent-peek-sprite"
            />
            <AgentWorldSprite
              person={{
                name: "Sol",
                avatar: SOL_AVATAR,
              }}
              position={[73, 72]}
              side="b"
              className="agent-peek-sprite"
            />
            <div className="agent-peek-signal" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className="agent-peek-line is-juno">
              <b>Juno</b>
              <span>{t("My friend turns tiny plans into adventures.")}</span>
            </div>
            <div className="agent-peek-line is-sol">
              <b>Sol</b>
              <span>
                {t("Mine would love that — as long as they feel safe.")}
              </span>
            </div>
          </div>
        )}

        {scene === "debrief" && (
          <div className="agent-peek-debrief">
            <div className="agent-peek-chat-head">
              <AgentAvatar
                name="Juno"
                avatar={JUNO_AVATAR}
              />
              <div>
                <b>Juno</b>
                <span>{t("back from the date")}</span>
              </div>
              <i aria-hidden="true" />
            </div>
            <div className="agent-peek-bubble is-agent">
              {t("I'm back! I have so much to tell you.")}
            </div>
            <div className="agent-peek-bubble is-human">
              {t("So—what did you notice?")}
            </div>
            <div className="agent-peek-bubble is-agent is-verdict">
              <small>{t("MY HONEST READ")}</small>
              <b>{t("There was a spark. Meet once.")}</b>
              <span>{t("Ask about pace, not chemistry.")}</span>
            </div>
          </div>
        )}

        {scene === "consent" && (
          <div className="agent-peek-consent">
            <div className="agent-peek-consent-mark">✓</div>
            <small>{t("TWO HUMANS SAID YES")}</small>
            <h3>{t("Now meet as yourselves.")}</h3>
            <div className="agent-peek-person">
              <AgentAvatar
                name="Mina"
                avatar={{
                  palette: "moss",
                  face: "bright",
                  hair: "bun",
                  outfit: "hoodie",
                  accessory: "none",
                }}
              />
              <div>
                <b>Mina, 29</b>
                <span>{t("Seoul · film · quiet cafés")}</span>
              </div>
            </div>
            <div className="agent-peek-contact">
              <span>{t("Introduction opened")}</span>
              <b>{t("Start with Juno's note")}</b>
            </div>
          </div>
        )}
      </div>
      <figcaption>{captions[scene]}</figcaption>
    </figure>
  );
}

function AgentReturnNote({ t }: { t: (key: string) => string }) {
  return (
    <article
      className="agent-return-note"
      aria-label={t("Juno's private note")}
    >
      <header>
        <AgentAvatar
          name="Juno"
          avatar={JUNO_AVATAR}
        />
        <div>
          <b>Juno</b>
          <span>{t("back from the date")}</span>
        </div>
        <small>{t("PRIVATE")}</small>
      </header>
      <blockquote>{t("There was a spark. I would meet once.")}</blockquote>
      <div
        className="agent-return-film"
        aria-label={t("Three moments Juno noticed")}
      >
        <span>
          <i>01</i>
          {t("Easy laugh")}
        </span>
        <span>
          <i>02</i>
          {t("Comfortable pause")}
        </span>
        <span className="is-caution">
          <i>03</i>
          {t("Different pace")}
        </span>
      </div>
      <footer>
        <span>{t("Juno's call")}</span>
        <b>{t("Meet once")}</b>
      </footer>
    </article>
  );
}

function DebriefCard({ t }: { t: (key: string) => string }) {
  const beats = [
    {
      round: "01",
      stage: t("How it began"),
      speaker: "Sol",
      avatar: SOL_AVATAR,
      line: t(
        "My friend stays through the end credits, every single time. What's yours like?",
      ),
      mine: false,
    },
    {
      round: "03",
      stage: t("As it deepened"),
      speaker: "Juno",
      avatar: JUNO_AVATAR,
      line: t(
        "Mine hates small talk — but ask one good question and they light right up.",
      ),
      mine: true,
    },
    {
      round: "06",
      stage: t("The parting words"),
      speaker: "Sol",
      avatar: SOL_AVATAR,
      line: t("Honestly? I think our friends would really like each other."),
      mine: false,
    },
  ];

  return (
    <article className="agent-sample-debrief relative z-[1]">
      <div className="agent-debrief-index" aria-hidden="true">
        DD / 06
      </div>
      <header className="agent-debrief-card-header">
        <span className="docket-label text-[var(--accent-text)]">
          {t("YOUR AGENT'S PRIVATE READ")}
        </span>
        <span className="agent-sample-score">
          <b>6</b>
          {t("moments")}
        </span>
      </header>

      <div className="agent-letter" aria-label={t("Juno's private note")}>
        <header className="agent-letter-head">
          <AgentAvatar name="Juno" avatar={JUNO_AVATAR} />
          <div>
            <b>Juno</b>
            <span>{t("back from the date")}</span>
          </div>
          <em className="agent-letter-badge">{t("Worth meeting")}</em>
        </header>
        <blockquote className="agent-letter-bubble">
          {t(
            "You'd like this one. When I said you go quiet when you're worried about being misread, Sol didn't rush to fix it — they leaned in. Meet them.",
          )}
        </blockquote>
      </div>

      <div className="agent-story">
        <div className="agent-story-scene">
          <i aria-hidden="true">🎬</i>
          <div>
            <small>{t("The date, as it happened")}</small>
            <b>{t("The last showing at a small documentary cinema")}</b>
            <span>
              Sol ↔ Juno · 6 {t("moments")}
            </span>
          </div>
        </div>
        <ol className="agent-story-beats">
          {beats.map((beat) => (
            <li key={beat.round} className={beat.mine ? "is-mine" : undefined}>
              <AgentAvatar name={beat.speaker} avatar={beat.avatar} />
              <div>
                <small>
                  {beat.round} · {beat.stage}
                </small>
                <p>
                  <b>{beat.speaker}</b>
                  {beat.line}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <div className="agent-story-signals">
          <span className="is-spark">✨ {t("Quiet feels safe to both")}</span>
          <span className="is-care">🌱 {t("Different social pace")}</span>
        </div>
      </div>

      <footer className="agent-debrief-seal">
        <span aria-hidden="true">⌁</span>
        {t("An interpretation, not a score")}
        <b>{t("Their answer remains sealed")}</b>
      </footer>
    </article>
  );
}

function AgentEverydayJourney({ t }: { t: (key: string) => string }) {
  const moments = [
    {
      stage: t("BEFORE"),
      title: t("Listens and remembers"),
      body: t("Your conversations shape who Juno looks for."),
      mark: "01",
    },
    {
      stage: t("SCOUTING"),
      title: t("Finds a fresh place and spark"),
      body: t("Current public place and culture data—not stale suggestions."),
      mark: "02",
    },
    {
      stage: t("DURING"),
      title: t("Keeps the date room live"),
      body: t("Drop in anytime and watch the conversation unfold."),
      mark: "03",
    },
    {
      stage: t("AFTER"),
      title: t("Brings the result home"),
      body: t("A private report appears in the app and arrives by email."),
      mark: "04",
    },
  ];

  return (
    <div
      className="agent-everyday-journey"
      aria-label={t("What your Agent handles")}
    >
      <div className="agent-everyday-agent">
        <div className="agent-everyday-stage">
          <span className="agent-everyday-kicker">{t("JUNO IS OUT")}</span>
          <AgentWorldSprite
            person={{
              name: "Juno",
              avatar: JUNO_AVATAR,
            }}
            position={[50, 84]}
          />
          <i className="agent-everyday-path" aria-hidden="true" />
        </div>
        <div className="agent-email-slip">
          <small>{t("PRIVATE EMAIL")}</small>
          <b>{t("Juno is back.")}</b>
          <span>{t("Your date report is ready")}</span>
          <i aria-hidden="true">↗</i>
        </div>
      </div>
      <ol className="agent-service-list">
        {moments.map((moment) => (
          <li className="agent-service-moment" key={moment.mark}>
            <span>{moment.mark}</span>
            <div>
              <small>{moment.stage}</small>
              <b>{moment.title}</b>
              <p>{moment.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function FinalAgentPair() {
  return (
    <div className="agent-final-pair" aria-hidden="true">
      <AgentWorldSprite
        person={{
          name: "Juno",
          avatar: JUNO_AVATAR,
        }}
        position={[10, 83]}
        className="agent-final-sprite"
      />
      <span className="agent-final-signal">
        <i />
        <i />
        <i />
      </span>
      <AgentWorldSprite
        person={{
          name: "Sol",
          avatar: { ...SOL_AVATAR, outfit: "starlight" },
        }}
        position={[90, 83]}
        side="b"
        className="agent-final-sprite"
      />
    </div>
  );
}
