import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueries, type RequestForQueries } from "convex/react";
import { Link, useParams } from "react-router-dom";
import { api } from "@convex/_generated/api";
import {
  Button,
  Card,
  LinkButton,
  Spinner,
  Tag,
  cx,
} from "../components/ui/primitives";
import { readableError } from "../components/ui/Toast";
import {
  AgentAvatar,
  type AvatarConfig,
} from "../components/agent/AgentAvatar";
import { DateActivityJournal } from "../components/agent/DateActivityJournal";
import { DateTranscript } from "../components/agent/DateTranscript";
import { CoachedDateTranscript } from "../components/agent/CoachedDateTranscript";
import type { Id } from "@convex/_generated/dataModel";
import { activityCopy, type DateActivity } from "@convex/lib/dateActivity";
import { AgentDateWorld } from "../components/agent/AgentDateWorld";
import { useI18n } from "../i18n";
import { type DateReflection, type SceneKind } from "@convex/lib/dateStory";

type Verdict = "pending" | "encourage" | "curious" | "pass";
type AgentDecisionCode =
  | "strong_alignment"
  | "worth_exploring"
  | "intent_mismatch"
  | "values_mismatch"
  | "communication_mismatch"
  | "lifestyle_mismatch"
  | "boundary_concern"
  | "practical_mismatch"
  | "insufficient_signal";
type AgentDateActivity =
  | "arriving"
  | "reading"
  | "thinking"
  | "wandering"
  | "wrapping_up";
type DateView = {
  date: {
    _id: string;
    status:
      | "queued"
      | "running"
      | "debrief_ready"
      | "connected"
      | "closed"
      | "failed";
    setting: string;
    sceneKind?: SceneKind;
    sceneSituation?: string;
    activityJournal?: DateActivity;
    introductionReady: boolean;
    isSearchEncounter?: boolean;
    worldSourceTitle?: string;
    worldSourceUrl?: string;
    summary: string;
    sparks: string[];
    frictions: string[];
    scoutSignals: string[];
    failureReason?: string;
    canRetryReview: boolean;
    reviewRetrying: boolean;
    reviewRecoveredAt?: number;
    paceMode: "demo" | "natural";
    activity?: AgentDateActivity;
    nextTurnAt?: number;
  };
  turns: Array<{
    _id: string;
    round: number;
    isMine: boolean;
    speakerAgentName: string;
    content: string;
  }>;
  mine: {
    firstName: string;
    agentName: string;
    avatar: AvatarConfig | null;
    verdict: Verdict;
    reason: string;
    reflection?: DateReflection;
    decisionCode: AgentDecisionCode | null;
    nextSearchNote: string | null;
    consent: "pending" | "yes" | "no";
  };
  counterpart: {
    firstName: string;
    agentName: string;
    avatar: AvatarConfig | null;
    age: number;
    area: string;
    interests: string[];
    photoUrl: string | null;
    verdict: Verdict | null;
    consent: "yes" | "sealed";
    isDemo: boolean;
    contactEmail: string | null;
  };
  simulationOnly: boolean;
};

const VERDICT_COPY: Record<
  Exclude<Verdict, "pending">,
  { kicker: string; title: string }
> = {
  encourage: {
    kicker: "Your agent is advocating",
    title: "I think you should meet.",
  },
  curious: {
    kicker: "Your agent sees a maybe",
    title: "One human conversation could be worth it.",
  },
  pass: {
    kicker: "Your agent is protecting your time",
    title: "I wouldn't push this one.",
  },
};

const DECISION_REASON_COPY: Record<AgentDecisionCode, string> = {
  strong_alignment: "Strong alignment",
  worth_exploring: "Worth exploring",
  intent_mismatch: "Different relationship intentions",
  values_mismatch: "Values didn't align",
  communication_mismatch: "Conversation style didn't fit",
  lifestyle_mismatch: "Different daily rhythms",
  boundary_concern: "A boundary needs protecting",
  practical_mismatch: "The practical fit was weak",
  insufficient_signal: "Not enough clear signal",
};

const ACTIVITY_COPY: Record<AgentDateActivity, string> = {
  arriving: "walking into the world",
  reading: "reading the last thought",
  thinking: "choosing what to say",
  wandering: "taking a real pause",
  wrapping_up: "writing separate private notes",
};

function describeWait(
  nextTurnAt: number | undefined,
  now: number,
  t: (message: string, values?: Record<string, string | number>) => string,
) {
  if (!nextTurnAt || now === 0) return "";
  const seconds = Math.max(0, Math.ceil((nextTurnAt - now) / 1_000));
  if (seconds < 5) return t("any moment");
  if (seconds < 60) return t("about {seconds}s", { seconds });
  return t("about {minutes}m", { minutes: Math.ceil(seconds / 60) });
}

function localizeLegacyTurn(
  content: string,
  locale: string,
  round: number,
  speakerName: string,
) {
  if (!locale.startsWith("ko")) return content;
  const localized = content
    .replace(/^안녕 ([^,]+), I'm ([^.]+)\.\s*/i, "안녕하세요, $1. $2예요. ")
    .replace(/^I'm ([^.]+)\.\s*/i, "$1예요. ")
    .replace(/^요, 저는 ([^.]+)입니다\.\s*/, "안녕하세요, $1예요. ");
  if (round === 1) return localized;
  const escapedName = speakerName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return localized
    .replace(new RegExp(`^${escapedName}예요\\.\\s*`), "")
    .replace(
      new RegExp(`^안녕하세요,?\\s*${escapedName}예요\\.\\s*`),
      "",
    );
}

function localizeScoutSignal(
  signal: string,
  t: (message: string, values?: Record<string, string | number>) => string,
) {
  const city = signal.match(/^Both are looking in (.+)$/)?.[1];
  if (city) return t("Both are looking in {city}", { city: t(city) });
  const interests = signal.match(/^Shared pull toward (.+)$/)?.[1];
  if (interests) {
    return t("Shared pull toward {interests}", {
      interests: interests
        .split(" and ")
        .map((interest) => t(interest))
        .join(" · "),
    });
  }
  const traits = signal.match(/^(.+) matched the brief$/)?.[1];
  if (traits) return t("{traits} matched the brief", { traits });
  return t(signal);
}

export default function AgentDatePage() {
  const { agentDateId } = useParams();
  const queries = useMemo((): RequestForQueries => {
    if (!agentDateId) return {};
    return { record: { query: api.agentDates.get, args: { agentDateId: agentDateId as Id<"agentDates"> } } };
  }, [agentDateId]);
  const { record } = useQueries(queries);
  const result = record instanceof Error ? null : record as DateView | null | undefined;
  const consent = useMutation(api.agentDates.consent);
  const retryReview = useMutation(api.agentDates.retryReview);
  const [retryBusy, setRetryBusy] = useState(false);
  const { locale, t } = useI18n();
  const [busy, setBusy] = useState<"yes" | "no" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seek, setSeek] = useState<{ round: number; request: number }>();
  async function recheckReview() {
    if (!result) return;
    setRetryBusy(true); setError(null);
    try { await retryReview({ agentDateId: result.date._id as Id<"agentDates"> }); }
    catch (e) { setError(readableError(e)); }
    finally { setRetryBusy(false); }
  }
  const copy = activityCopy(locale);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (
      result?.date.status !== "queued" &&
      result?.date.status !== "running"
    ) {
      return;
    }
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [result?.date.status]);

  if (result === undefined) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (!result) {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-[32px]">{t("This story isn't here.")}</h1>
        <p className="mt-3 text-soft">
          {t("It may have ended, or it belongs to another person.")}
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-block text-[14px] font-bold text-[var(--accent-text)]"
        >
          {t("Back to my agent →")}
        </Link>
      </Card>
    );
  }

  const { date, mine, counterpart, turns } = result;
  const inProgress = date.status === "queued" || date.status === "running";
  const canDecide =
    date.status === "debrief_ready" && date.introductionReady && mine.consent === "pending";
  const verdict =
    mine.verdict === "pending" ? null : VERDICT_COPY[mine.verdict];
  const activity = date.activity
    ? t(ACTIVITY_COPY[date.activity])
    : date.status === "queued"
      ? t("finding a place")
      : t("staying in the moment");
  const wait = describeWait(date.nextTurnAt, now, t);
  const displayTurns = turns.map((turn) => ({
    ...turn,
    content: localizeLegacyTurn(
      turn.content,
      locale,
      turn.round,
      turn.speakerAgentName,
    ),
  }));
  const liveActivity = inProgress
    ? `${activity}${wait ? ` · ${wait}` : ""}`
    : undefined;

  async function decide(decision: "yes" | "no") {
    if (!agentDateId || busy) return;
    setBusy(decision);
    setError(null);
    try {
      await consent({ agentDateId: agentDateId as never, decision });
    } catch (reason) {
      setError(readableError(reason));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="agent-date-page">
      <header className="agent-date-mast">
        <div>
          <div className="docket-label flex items-center gap-2 text-[var(--accent-text)]">
            <span
              className={cx(
                "h-2 w-2 rounded-full",
                inProgress
                  ? "animate-pulse bg-ember-500"
                  : "bg-[var(--color-sage-500)]",
              )}
            />
            {t("explicitly AI · private simulation")}
          </div>
          <h1 aria-label={`${mine.agentName} × ${counterpart.agentName}`}>
            <span>{mine.agentName}</span>
            <em aria-hidden>×</em>
            <span>{counterpart.agentName}</span>
          </h1>
          <p>{date.setting}</p>
        </div>
        <div className="agent-pair" aria-hidden>
          <AgentAvatar
            name={mine.agentName}
            avatar={mine.avatar}
            className="agent-avatar-pair"
          />
          <div className="agent-pair-signal">
            <i />
            <i />
            <i />
          </div>
          <AgentAvatar
            name={counterpart.agentName}
            avatar={counterpart.avatar}
            className="agent-avatar-pair"
          />
        </div>
      </header>

      <nav className="date-record-nav" aria-label={copy.full}>
        <a href="#activity">{copy.heading} ↓</a><a href="#conversation">{t("Read the whole conversation")} ↓</a>
      </nav>

      <div
        className="agent-date-live-capture mt-4"
        data-replay-label={t("PLAYABLE DATE REPLAY")}
      >
        <AgentDateWorld
          setting={date.setting}
          activityJournal={date.activityJournal}
          sceneSituation={date.sceneSituation}
          key={seek?.request ?? date._id}
          initialRound={seek?.round}
          sceneKind={date.sceneKind}
          sourceTitle={date.worldSourceTitle}
          status={date.status}
          mine={{ name: mine.agentName, avatar: mine.avatar }}
          counterpart={{
            name: counterpart.agentName,
            avatar: counterpart.avatar,
          }}
          turns={displayTurns}
          liveActivity={liveActivity}
        />
      </div>

      <DateActivityJournal journal={date.activityJournal} totalLines={turns.length}
        onReplay={round => { setSeek({ round, request: Date.now() }); document.querySelector(".agent-date-live-capture")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} />

      {date.scoutSignals.length > 0 && (
        <details className="agent-crossed-paths mt-7 rounded-3xl border border-[var(--border)] bg-[var(--bg-raised)] p-5 sm:p-6">
          <summary className="cursor-pointer">
            <div className="docket-label text-[var(--accent-text)]">
              {t("Why their paths crossed")}
            </div>
            <p>
              {t("Explainable signals only. No secret compatibility score.")}
            </p>
          </summary>
          <ul>
            {date.scoutSignals.map((signal) => (
              <li key={signal}>{localizeScoutSignal(signal, t)}</li>
            ))}
          </ul>
        </details>
      )}

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          {inProgress ? <DateTranscript turns={displayTurns} mine={{ name: mine.agentName, avatar: mine.avatar }} counterpart={{ name: counterpart.agentName, avatar: counterpart.avatar }} />
            : <CoachedDateTranscript agentDateId={date._id as Id<"agentDates">} turns={displayTurns} mine={{ name: mine.agentName, avatar: mine.avatar }} counterpart={{ name: counterpart.agentName, avatar: counterpart.avatar }} />}
          {inProgress && <p className="flex items-center gap-2 text-sm"><Spinner className="h-3.5 w-3.5" />{liveActivity}</p>}

        </div>

        <div className="space-y-5">
          <Card className="p-6 sm:p-7">
            <div className="docket-label text-muted">
              {t("Your private debrief")}
            </div>
            {inProgress ? (
              <>
                <h2 className="mt-3 text-[29px]">{t("No verdict yet.")}</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-soft">
                  {t(
                    "{agent} will come back to you after listening through the whole date.",
                    { agent: mine.agentName },
                  )}
                </p>
              </>
            ) : verdict ? (
              <>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="docket-label text-[var(--accent-text)]">
                      {t(verdict.kicker)}
                    </div>
                    <h2 className="mt-2 text-[29px] leading-[1.05]">
                      {t(verdict.title)}
                    </h2>
                  </div>
                  <AgentAvatar name={mine.agentName} avatar={mine.avatar} className="agent-avatar-pair" />
                </div>
                <p className="agent-return-letter mt-5 text-[17px] leading-[1.8] text-soft">{mine.reason}</p>
                <p className="mt-3 font-[var(--font-display)] italic text-[var(--accent-text)]">— {mine.agentName}</p>
                {mine.reflection?.question && <p className="mt-5 border-t border-[var(--border)] pt-5 text-[18px] leading-relaxed">{mine.reflection.question}</p>}
                {mine.decisionCode && (
                  <details className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-sunken)] p-4">
                    <summary className="docket-label cursor-pointer text-[var(--accent-text)]">
                      {mine.verdict === "pass"
                        ? t("Why I passed")
                        : t("Primary signal")}
                    </summary>
                    <p className="mt-2 text-[14px] font-bold">
                      {t(DECISION_REASON_COPY[mine.decisionCode])}
                    </p>
                    {mine.verdict === "pass" && mine.nextSearchNote && (
                      <div className="mt-4 border-t border-[var(--border)] pt-4">
                        <div className="docket-label text-muted">
                          {t("Next scout brief")}
                        </div>
                        <p className="mt-2 text-[13px] leading-[1.65] text-soft">
                          {mine.nextSearchNote}
                        </p>
                      </div>
                    )}
                  </details>
                )}
                <p className="mt-4 border-t border-[var(--border)] pt-4 text-[11px] leading-relaxed text-muted">
                  {t(
                    "This is {agent}'s interpretation of a simulation, not a compatibility score or a prediction of real chemistry.",
                    { agent: mine.agentName },
                  )}
                </p>
                <div className="agent-debrief-dialogue mt-5 rounded-[1.35rem] border border-[var(--tint-ember-border)] bg-[var(--tint-ember-bg)] p-4">
                  <div className="flex items-start gap-3">
                    <AgentAvatar
                      name={mine.agentName}
                      avatar={mine.avatar}
                      className="agent-avatar-note"
                    />
                    <div>
                      <div className="docket-label text-[var(--accent-text)]">
                        {t("The debrief keeps learning")}
                      </div>
                      <p className="mt-2 text-[13px] leading-[1.6] text-soft">
                        {t(
                          "Challenge the verdict or tell {agent} what felt right. Your reaction becomes private context for the next search.",
                          { agent: mine.agentName },
                        )}
                      </p>
                    </div>
                  </div>
                  <LinkButton
                    to={`/dashboard?date=${date._id}`}
                    variant="secondary"
                    size="sm"
                    fullWidth
                    className="mt-4"
                  >
                    {t("Talk this date over with {agent}", {
                      agent: mine.agentName,
                    })}{" "}
                    →
                  </LinkButton>
                </div>
              </>
            ) : (
              <p className="mt-4 text-soft">
                {t("The debrief could not be completed.")}
              </p>
            )}
          </Card>

          {!inProgress && !date.activityJournal && Boolean(date.summary || date.sparks.length || date.frictions.length) && (
            <details className="rounded-3xl border border-[var(--border)] p-6 sm:p-7">
              <summary className="cursor-pointer text-[12px] font-bold text-muted">{t("What the agents noticed")}</summary>
              <p className="mt-3 text-[14px] leading-[1.7] text-soft">
                {date.summary}
              </p>
              <SignalList
                title={t("Sparks")}
                values={date.sparks}
                tone="good"
              />
              <SignalList
                title={t("Friction")}
                values={date.frictions}
                tone="warn"
              />
            </details>
          )}
        </div>
      </section>

      {!inProgress && date.status !== "failed" && date.introductionReady && (
        <section className="agent-human-gate mt-7 overflow-hidden rounded-[2rem] border border-[var(--border-strong)] bg-[var(--bg-raised)]">
          <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
            <div className="border-b border-[var(--border)] p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="docket-label text-[var(--accent-text)]">
                {t("The person behind the Agent")}
              </div>
              <div className="mt-4 flex items-center gap-4">
                {counterpart.photoUrl ? (
                  <img
                    src={counterpart.photoUrl}
                    alt=""
                    className="h-20 w-20 rounded-full border border-[var(--border)] object-cover"
                  />
                ) : (
                  <div className="grid h-20 w-20 place-items-center rounded-full border border-[var(--border)] bg-[var(--bg-sunken)] font-[var(--font-display)] text-[32px] italic text-[var(--accent-text)]">
                    {counterpart.firstName.slice(0, 1)}
                  </div>
                )}
                <div>
                  <h2 className="text-[36px]">
                    {counterpart.firstName}, {counterpart.age}
                  </h2>
                  <p className="mt-1 text-[14px] text-soft">
                    {t(counterpart.area)}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {counterpart.interests.map((interest) => (
                  <Tag key={interest}>{t(interest)}</Tag>
                ))}
              </div>
              <p className="mt-5 text-[11px] leading-relaxed text-muted">
                {t(
                  "Contact stays hidden. A photo appears only if they chose to share it. Their agent's verdict and answer stay sealed until mutual consent.",
                )}
              </p>
            </div>
            <div className="p-6 sm:p-8">
              {date.status === "connected" ? (
                <>
                  <div className="docket-label text-[var(--color-sage-600)]">
                    {t("Two humans said yes")}
                  </div>
                  <h2 className="mt-3 text-[36px]">
                    {t("Now meet as yourselves.")}
                  </h2>
                  {counterpart.contactEmail ? (
                    <a
                      className="mt-6 block rounded-2xl border border-[var(--tint-sage-border)] bg-[var(--tint-sage-bg)] p-5 text-[16px] font-bold"
                      href={`mailto:${counterpart.contactEmail}`}
                    >
                      {counterpart.contactEmail} ↗
                    </a>
                  ) : (
                    <p className="mt-4 rounded-2xl bg-[var(--bg-sunken)] p-4 text-[13px] leading-relaxed text-soft">
                      {t(
                        "This was a clearly-labelled demo date, so no real contact exists. Your consent flow worked end to end.",
                      )}
                    </p>
                  )}
                </>
              ) : date.status === "closed" || mine.consent === "no" ? (
                <>
                  <div className="docket-label text-muted">
                    {t("Closed with care")}
                  </div>
                  <h2 className="mt-3 text-[36px]">
                    {t("No contact was shared.")}
                  </h2>
                  <p className="mt-4 text-[14px] leading-relaxed text-soft">
                    {t(
                      "A good Agent should save you from the wrong meeting as often as it finds the right one.",
                    )}
                  </p>
                </>
              ) : mine.consent === "yes" ? (
                <>
                  <div className="docket-label text-[var(--accent-text)]">
                    {t("Your answer is sealed")}
                  </div>
                  <h2 className="mt-3 text-[36px]">
                    {t("You said yes. We won't say whether they have.")}
                  </h2>
                  <p className="mt-4 text-[14px] leading-relaxed text-soft">
                    {t(
                      "If both people choose an introduction, contact opens to both at the same moment.",
                    )}
                  </p>
                </>
              ) : canDecide ? (
                <>
                  <div className="docket-label text-[var(--accent-text)]">
                    {t("Human consent gate")}
                  </div>
                  <h2 className="mt-3 text-[36px]">
                    {t("Should the humans meet?")}
                  </h2>
                  <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-soft">
                    {t(
                      "This answer is private. A yes reveals nothing unless {person} independently says yes too.",
                      { person: counterpart.firstName },
                    )}
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button
                      size="lg"
                      loading={busy === "yes"}
                      onClick={() => void decide("yes")}
                    >
                      {t("Introduce us →")}
                    </Button>
                    <Button
                      size="lg"
                      variant="secondary"
                      loading={busy === "no"}
                      onClick={() => void decide("no")}
                    >
                      {t("Not for me")}
                    </Button>
                  </div>
                </>
              ) : null}
              {error && (
                <p
                  className="mt-4 text-[13px] text-[var(--tint-ember-strong)]"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {!inProgress && date.isSearchEncounter && !date.introductionReady && date.status !== "failed" && (
        <Card className="mt-7 p-7">
          <div className="docket-label text-[var(--accent-text)]">{t("The search continues")}</div>
          <h2 className="mt-3 text-[28px]">{t("A conversation, not a match.")}</h2>
          <p className="mt-3 text-[14px] text-soft">{t("This encounter stays in your Agent's memory. It will keep looking; there is no introduction to approve here.")}</p>
          <LinkButton to="/dashboard" variant="secondary" className="mt-5">{t("Check the search")}</LinkButton>
        </Card>
      )}
      {date.reviewRecoveredAt && (
        <Card className="mt-7 p-7">
          <div className="docket-label">{t("Review recovered from the saved conversation")}</div>
          <h2 className="mt-3 text-[28px]">{mine.reflection?.headline ?? t("Your Agent's private note")}</h2>
          <p className="mt-4 whitespace-pre-line text-soft">{mine.reason}</p>
          <p className="mt-5 text-[13px] text-muted">{t("Only the review was updated. Your conversation, feedback and meeting decisions stay as they were.")}</p>
          {/* A re-check no longer rewrites the shared status, so this record keeps
              its own state and needs to say the check is running on its own. */}
          {date.reviewRetrying && <p className="mt-5 text-[14px] text-soft">{t("Your Agent is rewriting and checking its private note. The original conversation stays unchanged.")}</p>}
          {date.canRetryReview && <Button className="mt-5" variant="secondary" disabled={retryBusy} onClick={recheckReview}>{t("Recheck this date's review")}</Button>}
          {error && <p role="alert" className="mt-4 text-[var(--accent-text)]">{error}</p>}
        </Card>
      )}
      {date.status === "failed" && (
        <Card className="mt-7 p-7">
          <h2 className="text-[28px]">{t(date.reviewRetrying ? "Checking the saved conversation again" : "This world went quiet.")}</h2>
          <p className="mt-2 text-soft">
            {date.reviewRetrying ? t("Your Agent is rewriting and checking its private note. The original conversation stays unchanged.") : date.failureReason ??
              t("Your agent couldn't finish this date. No contact was shared.")}
          </p>
          {date.canRetryReview && <Button className="mt-5" variant="secondary" disabled={retryBusy} onClick={recheckReview}>{t("Recheck this date's review")}</Button>}
          {error && <p role="alert" className="mt-4 text-[var(--accent-text)]">{error}</p>}
        </Card>
      )}

      <div className="mt-8 text-center">
        <Link
          to="/dashboard"
          className="text-[13px] font-bold text-muted hover:text-[var(--text)]"
        >
          {t("← Back to my agent")}
        </Link>
      </div>
    </div>
  );
}

function SignalList({
  title,
  values,
  tone,
}: {
  title: string;
  values: string[];
  tone: "good" | "warn";
}) {
  if (values.length === 0) return null;
  return (
    <div className="mt-5">
      <div className="docket-label text-muted">{title}</div>
      <ul className="mt-2 space-y-2">
        {values.map((value) => (
          <li
            key={value}
            className="flex gap-2 text-[13px] leading-relaxed text-soft"
          >
            <span
              className={
                tone === "good"
                  ? "text-[var(--color-sage-600)]"
                  : "text-[var(--accent-text)]"
              }
            >
              {tone === "good" ? "＋" : "±"}
            </span>
            {value}
          </li>
        ))}
      </ul>
    </div>
  );
}
