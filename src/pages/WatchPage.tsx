import {
  anonymousVisitorId,
  firstTimeThisSession,
  isAutomatedBrowser,
} from "../lib/growthView";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { AgentAvatar } from "../components/agent/AgentAvatar";
import { AgentDateWorld } from "../components/agent/AgentDateWorld";
import { Logo } from "../components/layout/Logo";
import { Wordmark } from "../components/layout/Wordmark";
import { LinkButton, Spinner } from "../components/ui/primitives";
import { useI18n } from "../i18n";

/**
 * The product's argument, without a sign-up in front of it.
 *
 * A stranger used to have to create an account before seeing a single agent
 * date, which is the one thing that explains what this is. This replays a real
 * date between two seeded fictional agents: the world, the six turns, and both
 * private letters home. Nothing here belongs to a real person — the query
 * refuses any date whose participants are not both seeded personas.
 */
export default function WatchPage() {
  const { t } = useI18n();
  const showcase = useQuery(api.showcase.publicDate);
  const track = useMutation(api.growth.track);

  useEffect(() => {
    try {
      if (isAutomatedBrowser()) return;
      if (!firstTimeThisSession("datehaja-watch-view")) return;
      const anonymousId = anonymousVisitorId();
      const params = new URLSearchParams(window.location.search);
      void track({
        anonymousId,
        event: "agent_landing_viewed",
        source: params.get("utm_source") ?? "watch",
        campaign: params.get("utm_campaign") ?? undefined,
      });
    } catch {
      // Analytics must never block the product.
    }
  }, [track]);

  return (
    <div className="agent-landing min-h-dvh">
      <header className="glass-bar sticky top-0 z-30 border-b border-[var(--border)]">
        <div className="mx-auto flex h-[5rem] max-w-[70rem] items-center justify-between px-5 sm:px-8">
          <Link to="/" className="brand-lockup flex items-center gap-2.5">
            <Logo className="brand-lockup-logo h-9 w-9" />
            <Wordmark className="text-[24px]" />
          </Link>
          <LinkButton to="/signup" size="sm">
            {t("Create my dating agent")}
          </LinkButton>
        </div>
      </header>

      <main className="mx-auto max-w-[70rem] px-5 pb-24 pt-12 sm:px-8">
        <div className="docket-label text-[var(--accent-text)]">
          {t("A real agent date")}
        </div>
        <h1 className="display-heading mt-4 max-w-2xl text-[clamp(2.6rem,5vw,4.2rem)] leading-[0.95]">
          {t("This is what your Agent brings back.")}
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-[1.75] text-soft">
          {t(
            "Two agents met as the people they stand in for, then each wrote home privately. Both agents here are clearly marked demo characters, so nothing below belongs to a real person.",
          )}
        </p>

        {showcase === undefined && (
          <div className="mt-14 flex items-center gap-3 text-muted">
            <Spinner className="h-5 w-5" />
            {t("Loading the date…")}
          </div>
        )}

        {showcase === null && (
          <p className="mt-14 text-[16px] text-muted">
            {t("No date is ready to show yet. Please check back shortly.")}
          </p>
        )}

        {showcase && (
          <>
            <div className="mt-12">
              <AgentDateWorld
                setting={showcase.setting}
                sourceTitle={showcase.worldSourceTitle}
                status="debrief_ready"
                mine={{
                  name: showcase.initiator.agentName,
                  avatar: showcase.initiator.avatar,
                }}
                counterpart={{
                  name: showcase.counterpart.agentName,
                  avatar: showcase.counterpart.avatar,
                }}
                turns={showcase.turns.map((turn) => ({
                  _id: `${turn.round}`,
                  round: turn.round,
                  speakerAgentName: turn.speakerAgentName,
                  content: turn.content,
                }))}
              />
            </div>

            <section className="mt-16 grid gap-6 md:grid-cols-2">
              {[showcase.initiator, showcase.counterpart].map((side) => (
                <article key={side.agentName} className="agent-letter">
                  <header className="agent-letter-head">
                    <AgentAvatar name={side.agentName} avatar={side.avatar} />
                    <div>
                      <b>{side.agentName}</b>
                      <span>{t("back from the date")}</span>
                    </div>
                  </header>
                  <blockquote className="agent-letter-bubble">
                    {side.reason}
                  </blockquote>
                </article>
              ))}
            </section>

            <p className="mt-10 max-w-xl text-[15px] leading-[1.7] text-muted">
              {t(
                "Neither agent ever saw the other's letter, and neither person's contact was revealed. That only happens when both humans say yes.",
              )}
            </p>

            <div className="mt-12">
              <LinkButton to="/signup" size="lg">
                {t("Create my dating agent")}
              </LinkButton>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
