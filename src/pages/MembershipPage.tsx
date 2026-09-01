import { useEffect, useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@convex/_generated/api";
import type { AvatarConfig } from "../components/agent/AgentAvatar";
import { AgentHomeWorld } from "../components/agent/AgentDateWorld";
import { Button, Card, Spinner, Tag } from "../components/ui/primitives";
import { readableError } from "../components/ui/Toast";
import { useI18n } from "../i18n";

type ScoutAccess = {
  allowed: boolean;
  mode: "subscription" | "demo" | "locked";
  configured: boolean;
};

export default function MembershipPage() {
  const { t } = useI18n();
  const mine = useQuery(api.agents.mine);
  const readStatus = useAction(api.billing.status);
  const createCheckout = useAction(api.billing.createCheckout);
  const createPortal = useAction(api.billing.createPortal);
  const trackMember = useMutation(api.growth.trackMember);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [access, setAccess] = useState<ScoutAccess | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trackedView = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const next = await readStatus({});
        if (!cancelled) setAccess(next);
      } catch (reason) {
        if (!cancelled) setError(readableError(reason));
      }
    };
    void refresh();
    const checkout = searchParams.get("checkout");
    if (checkout !== "success") return () => void (cancelled = true);
    const timer = window.setInterval(() => void refresh(), 1_500);
    const timeout = window.setTimeout(
      () => window.clearInterval(timer),
      15_000,
    );
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.clearTimeout(timeout);
    };
  }, [readStatus, searchParams]);

  useEffect(() => {
    if (!access || trackedView.current) return;
    trackedView.current = true;
    void trackMember({
      event: access.allowed ? "scout_pass_active_viewed" : "scout_pass_viewed",
    });
  }, [access, trackMember]);

  if (mine === undefined || mine === null || access === null) {
    return (
      <div className="flex min-h-[64vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const agent = mine.agent as { name: string; avatar?: AvatarConfig };

  async function checkout() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await trackMember({ event: "scout_checkout_started" });
      const session = await createCheckout({});
      if (!session.url) throw new Error("Checkout did not return a URL.");
      window.location.assign(session.url);
    } catch (reason) {
      setError(readableError(reason));
      setBusy(false);
    }
  }

  async function portal() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const session = await createPortal({});
      window.location.assign(session.url);
    } catch (reason) {
      setError(readableError(reason));
      setBusy(false);
    }
  }

  return (
    <div className="scout-pass-page">
      <header className="scout-pass-intro">
        <div className="scout-pass-copy">
          <div className="scout-pass-kicker docket-label text-[var(--accent-text)]">
            <span aria-hidden>✓</span>
            {t("Your brief is complete")}
          </div>
          <h1 className="scout-pass-title mt-5">
            {t("Now send your Agent into the world.")}
          </h1>
          <p className="scout-pass-summary mt-6 max-w-xl text-soft">
            {t(
              "Creating your Agent and teaching it who you are is free. A Scout Pass unlocks the deeper work: searching, researching a world, and running two independent AI Agents through a complete date.",
            )}
          </p>
          <div className="scout-pass-flow" aria-label={t("How it works")}>
            <span>
              <small>01</small>
              <strong>{t("Brief sealed")}</strong>
            </span>
            <i aria-hidden>→</i>
            <span>
              <small>02</small>
              <strong>{t("Agent scouts")}</strong>
            </span>
            <i aria-hidden>→</i>
            <span>
              <small>03</small>
              <strong>{t("You decide")}</strong>
            </span>
          </div>
        </div>
        <div className="scout-pass-world">
          <div className="scout-pass-world-meta">
            <span>
              <i aria-hidden />
              {agent.name}
            </span>
            <strong>{t("Home base")}</strong>
          </div>
          <AgentHomeWorld person={{ name: agent.name, avatar: agent.avatar }} />
          <div className="scout-pass-world-caption">
            <span className="agent-world-status-dot" />
            {access.allowed
              ? t("Your Agent is cleared to scout")
              : t("Your Agent is waiting at home")}
          </div>
        </div>
      </header>

      <section className="scout-pass-grid">
        <Card className="scout-pass-ticket overflow-hidden">
          <div className="scout-pass-ticket-top">
            <div>
              <div className="docket-label text-[var(--accent-text)]">
                {t("Scout Pass")}
              </div>
              <h2 className="mt-3 text-[38px]">
                {t("From search to a private debrief.")}
              </h2>
            </div>
            <Tag tone={access.allowed ? "sage" : "dusk"}>
              {access.mode === "demo"
                ? t("DEMO ACTIVE")
                : access.allowed
                  ? t("ACTIVE")
                  : t("PAYMENTS IN REVIEW")}
            </Tag>
          </div>
          <div className="scout-pass-ticket-body">
            <ul>
              <li>
                <span>01</span>{" "}
                {t("Candidate search inside your city and boundaries")}
              </li>
              <li>
                <span>02</span>{" "}
                {t("A live six-moment agent date you can watch")}
              </li>
              <li>
                <span>03</span>{" "}
                {t("Private debrief with sparks and honest friction")}
              </li>
              <li>
                <span>04</span> {t("Contact reveal only after two human yeses")}
              </li>
            </ul>
            <div className="scout-pass-fineprint">
              {t(
                "The pass covers scouting work — never another person's consent, a guaranteed match, or access to private data.",
              )}
            </div>
          </div>
          <div className="scout-pass-ticket-action">
            {access.allowed ? (
              <>
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => navigate("/dashboard")}
                >
                  {t("Send my Agent scouting →")}
                </Button>
                {access.mode === "subscription" && (
                  <Button
                    fullWidth
                    variant="ghost"
                    onClick={() => void portal()}
                  >
                    {t("Manage billing")}
                  </Button>
                )}
              </>
            ) : (
              <Button
                fullWidth
                size="lg"
                loading={busy}
                disabled={!access.configured}
                onClick={() => void checkout()}
              >
                {t("Start Scout Pass →")}
              </Button>
            )}
            {!access.allowed && !access.configured && (
              <p className="mt-3 text-center text-[12px] leading-relaxed text-muted">
                {t(
                  "Scout Pass payments are in merchant review. This build cannot take payment.",
                )}
              </p>
            )}
          </div>
        </Card>

        <div className="scout-pass-side">
          <div className="docket-label text-muted">{t("The contract")}</div>
          <div className="scout-contract-row">
            <span>{t("Free")}</span>
            <strong>{t("Make and brief your agent")}</strong>
          </div>
          <div className="scout-contract-row is-paid">
            <span>{t("Pass")}</span>
            <strong>{t("Tell it to go find someone")}</strong>
          </div>
          <div className="scout-contract-row">
            <span>{t("Always yours")}</span>
            <strong>{t("The final yes or no")}</strong>
          </div>
          <p>
            {t(
              "If no compatible Agent is available, your Agent simply comes home. Safety reports and blocking are always free.",
            )}
          </p>
          <Link
            to="/dashboard"
            className="text-[13px] font-bold text-[var(--accent-text)]"
          >
            {t("← Keep talking with my Agent")}
          </Link>
        </div>
      </section>

      {searchParams.get("checkout") === "cancelled" && (
        <p className="scout-pass-message">
          {t("Nothing was charged. Your Agent is still waiting at home.")}
        </p>
      )}
      {error && (
        <p className="scout-pass-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
