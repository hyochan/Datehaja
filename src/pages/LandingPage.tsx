import { useEffect } from "react";
import { useMutation } from "convex/react";
import { Link } from "react-router-dom";
import { api } from "@convex/_generated/api";
import { Logo } from "../components/layout/Logo";
import { Wordmark } from "../components/layout/Wordmark";
import { LocaleSwitcher } from "../components/layout/LocaleSwitcher";
import { ThemeToggle } from "../components/layout/AppShell";
import { LinkButton } from "../components/ui/primitives";
import { useI18n } from "../i18n";
import { AgentWorldSprite } from "../components/agent/AgentDateWorld";
import { AgentLoopPlayer } from "../components/agent/AgentLoopPlayer";

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
        <div className="mx-auto flex h-[4.75rem] max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            to="/"
            className="flex items-center gap-3"
            aria-label={t("Datehaja home")}
          >
            <Logo className="h-9 w-9" />
            <div className="leading-none">
              <Wordmark className="text-[24px]" />
              <div className="docket-label mt-1.5 text-[8px] text-muted">
                {t("Your dating agent")}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2.5">
            <Link
              to="#how-it-works"
              className="hidden rounded-full px-3 py-2 text-[12px] font-bold text-soft hover:bg-[var(--bg-sunken)] md:inline-flex"
            >
              {t("How it works")}
            </Link>
            <LocaleSwitcher compact />
            <ThemeToggle />
            <Link
              to="/signin"
              className="whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-2 text-[13px] font-bold shadow-[var(--shadow-soft)] hover:border-[var(--tint-ember-border)] sm:px-5"
            >
              {t("Sign in")}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="agent-hero relative overflow-hidden">
          <div className="agent-hero-glow" aria-hidden />
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-20 lg:min-h-[calc(100dvh-4.75rem)] lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:py-20">
            <div className="relative z-[1]">
              <div className="docket-label flex items-center gap-2 text-[var(--accent-text)]">
                <span className="h-2 w-2 rounded-full bg-ember-500" />
                {t("Too busy for another first date?")}
              </div>
              <h1 className="agent-hero-title display-heading mt-6 max-w-3xl text-[clamp(4rem,9vw,8.3rem)] leading-[0.84]">
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
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
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
          <div className="agent-debrief-layout mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
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
              <div className="agent-principle-path mt-9">
                <SmallPrinciple
                  symbol="◎"
                  title={t("Two independent verdicts")}
                  body={t(
                    "Each agent judges from its own human's private values.",
                  )}
                />
                <SmallPrinciple
                  symbol="⌁"
                  title={t("No forced optimism")}
                  body={t("Curious and pass are valid outcomes—not failures.")}
                />
                <SmallPrinciple
                  symbol="◇"
                  title={t("No consent theatre")}
                  body={t("Your yes stays sealed until there are two yeses.")}
                />
              </div>
            </div>
            <DebriefCard t={t} />
          </div>
        </section>

        <section
          id="agent-stack"
          className="agent-stack-section border-y border-[var(--border)] py-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
              <div>
                <div className="docket-label text-[var(--accent-text)]">
                  {t("A real agent stack")}
                </div>
                <h2 className="mt-4 text-[clamp(2.7rem,5vw,4.7rem)] leading-[0.98]">
                  {t("Not a chatbot wearing a heart icon.")}
                </h2>
                <div className="agent-stack-pulse mt-7" aria-hidden="true">
                  <i />
                  <span>{t("Four live systems · one private Agent")}</span>
                </div>
              </div>
              <AgentStackMap t={t} />
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="agent-final-cta relative mx-auto max-w-6xl overflow-hidden rounded-[2.4rem] border border-[var(--border-strong)] px-6 py-16 text-center sm:px-12 sm:py-24">
            <div className="agent-final-orbit" aria-hidden />
            <FinalAgentPair t={t} />
            <div className="docket-label relative z-[1] text-[var(--accent-text)]">
              {t("Let your better listener go first")}
            </div>
            <h2 className="display-heading relative z-[1] mx-auto mt-5 max-w-4xl text-[clamp(3.4rem,8vw,7rem)] leading-[0.9]">
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
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
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

function SmallPrinciple({
  symbol,
  title,
  body,
}: {
  symbol: string;
  title: string;
  body: string;
}) {
  return (
    <div className="agent-principle">
      <span>{symbol}</span>
      <div>
        <b>{title}</b>
        <p>{body}</p>
      </div>
    </div>
  );
}

function DebriefCard({ t }: { t: (key: string) => string }) {
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
      <div className="agent-debrief-verdict">
        <span aria-hidden="true">↗</span>
        <div>
          <small>{t("PRIVATE VERDICT")}</small>
          <h3>{t("I think you should meet.")}</h3>
        </div>
      </div>
      <blockquote>
        {t(
          "The easy banter wasn't the strongest signal. It was how Sol slowed down when your fear of being misunderstood came up.",
        )}
      </blockquote>
      <div className="agent-insight-map" aria-label={t("Agent insight map")}>
        <div className="agent-insight-map-title">
          {t("Six moments → one private read")}
        </div>
        <svg viewBox="0 0 640 230" aria-hidden="true">
          <path
            className="agent-insight-route"
            d="M76 150 C170 44 242 188 320 105 C397 24 466 186 566 84"
          />
          <path
            className="agent-insight-route is-echo"
            d="M82 160 C190 202 242 62 324 120 C408 180 478 36 562 94"
          />
          {[94, 178, 263, 358, 452, 548].map((cx, index) => (
            <circle
              key={cx}
              className={`agent-insight-moment moment-${index + 1}`}
              cx={cx}
              cy={index % 2 === 0 ? 126 : 102}
              r="5"
            />
          ))}
        </svg>
        <div className="agent-insight-node is-spark">
          <span>✦</span>
          <small>{t("SPARK")}</small>
          <strong>{t("Quiet feels safe to both")}</strong>
        </div>
        <AgentWorldSprite
          person={{
            name: t("Your Agent"),
            avatar: {
              palette: "rose",
              face: "gentle",
              hair: "wave",
              outfit: "cardigan",
              accessory: "star",
            },
          }}
          position={[50, 85]}
          emote="✦"
          className="agent-insight-sprite"
        />
        <div className="agent-insight-node is-friction">
          <span>?</span>
          <small>{t("ASK ABOUT")}</small>
          <strong>{t("Different social pace")}</strong>
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

function AgentStackMap({ t }: { t: (key: string) => string }) {
  return (
    <div className="agent-stack-map" aria-label={t("A real agent stack")}>
      <svg viewBox="0 0 760 420" aria-hidden="true">
        <path d="M146 92 C250 92 252 205 380 205" />
        <path d="M614 92 C510 92 508 205 380 205" />
        <path d="M146 330 C250 330 252 215 380 215" />
        <path d="M614 330 C510 330 508 215 380 215" />
      </svg>
      <div className="agent-stack-core">
        <Logo className="h-11 w-11" />
        <strong>{t("Your Agent")}</strong>
        <span>{t("listening")}</span>
      </div>
      <StackCell
        className="is-openai"
        label="OpenAI"
        symbol="◌"
        text={t(
          "Gives each Agent an isolated mind, voice, and independent verdict.",
        )}
      />
      <StackCell
        className="is-firecrawl"
        label="Firecrawl"
        symbol="✦"
        text={t(
          "Finds a live cultural spark that becomes tonight's virtual world.",
        )}
      />
      <StackCell
        className="is-convex"
        label="Convex"
        symbol="⌁"
        text={t(
          "Streams every turn and keeps consent state consistent in real time.",
        )}
      />
      <StackCell
        className="is-agentmail"
        label="AgentMail"
        symbol="↗"
        text={t(
          "Delivers private debriefs without exposing the other person's answer.",
        )}
      />
    </div>
  );
}

function StackCell({
  className,
  label,
  symbol,
  text,
}: {
  className: string;
  label: string;
  symbol: string;
  text: string;
}) {
  return (
    <div className={`agent-stack-node ${className}`}>
      <span aria-hidden="true">{symbol}</span>
      <div>
        <div className="docket-label">{label}</div>
        <p>{text}</p>
      </div>
    </div>
  );
}

function FinalAgentPair({ t }: { t: (key: string) => string }) {
  return (
    <div className="agent-final-pair" aria-hidden="true">
      <AgentWorldSprite
        person={{
          name: t("Your Agent"),
          avatar: {
            palette: "rose",
            face: "gentle",
            hair: "wave",
            outfit: "cardigan",
            accessory: "star",
          },
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
          name: t("Their Agent"),
          avatar: {
            palette: "violet",
            face: "curious",
            hair: "crop",
            outfit: "starlight",
            accessory: "glasses",
          },
        }}
        position={[90, 83]}
        side="b"
        className="agent-final-sprite"
      />
    </div>
  );
}
