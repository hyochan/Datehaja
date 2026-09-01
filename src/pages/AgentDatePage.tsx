import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
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
import { AgentDateWorld } from "../components/agent/AgentDateWorld";
import { useI18n } from "../i18n";

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
    worldSourceTitle?: string;
    worldSourceUrl?: string;
    summary: string;
    sparks: string[];
    frictions: string[];
    scoutSignals: string[];
    failureReason?: string;
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
  const result = useQuery(
    api.agentDates.get,
    agentDateId ? { agentDateId: agentDateId as never } : "skip",
  ) as DateView | null | undefined;
  const consent = useMutation(api.agentDates.consent);
  const { locale, t } = useI18n();
  const [busy, setBusy] = useState<"yes" | "no" | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    date.status === "debrief_ready" && mine.consent === "pending";
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

      {date.worldSourceTitle && (
        <a
          className="agent-world-source mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-3 text-[12px] transition-colors hover:border-[var(--tint-ember-border)]"
          href={date.worldSourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          <span>
            <b className="mr-2 text-[var(--accent-text)]">
              {t("World spark")}
            </b>
            {date.worldSourceTitle}
          </span>
          <span aria-hidden>↗</span>
        </a>
      )}

      <div
        className="agent-date-live-capture mt-4"
        data-replay-label={t("PLAYABLE DATE REPLAY")}
      >
        <AgentDateWorld
          setting={date.setting}
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

      <section
        className="agent-scout-journey"
        aria-label={t("Agent scouting journey")}
      >
        {[
          ["01", t("Left home"), true],
          ["02", t("Found a promising Agent"), true],
          ["03", t("Shared six moments"), turns.length >= 6],
          ["04", t("Brought the truth home"), !inProgress],
        ].map(([number, label, done], index) => (
          <div className={done ? "is-done" : ""} key={String(number)}>
            <span>{done ? "✓" : number}</span>
            <strong>{label}</strong>
            {index < 3 && <i aria-hidden />}
          </div>
        ))}
      </section>

      {date.scoutSignals.length > 0 && (
        <Card className="agent-crossed-paths mt-7 p-5 sm:p-6">
          <div>
            <div className="docket-label text-[var(--accent-text)]">
              {t("Why their paths crossed")}
            </div>
            <p>
              {t("Explainable signals only. No secret compatibility score.")}
            </p>
          </div>
          <ul>
            {date.scoutSignals.map((signal) => (
              <li key={signal}>{localizeScoutSignal(signal, t)}</li>
            ))}
          </ul>
        </Card>
      )}

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-7">
            <div>
              <div className="docket-label text-muted">
                {t("The virtual date")}
              </div>
              <div className="mt-1 text-[13px] font-bold">
                {t("live transcript · {count}/6 turns", {
                  count: turns.length,
                })}
              </div>
            </div>
            {inProgress && (
              <Tag tone="ember">
                {date.paceMode === "demo" ? t("demo time") : t("live")} ·{" "}
                {activity}
              </Tag>
            )}
          </div>
          <div className="agent-transcript min-h-[28rem] space-y-5 p-5 sm:p-7">
            {turns.length === 0 && (
              <div className="flex min-h-[20rem] flex-col items-center justify-center text-center">
                <AgentAvatar
                  name={mine.agentName}
                  avatar={mine.avatar}
                  className="agent-avatar-waiting"
                />
                <p className="mt-5 text-[15px] font-bold">
                  {t("The world is opening.")}
                </p>
                <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
                  {t(
                    "A live cultural spark is becoming a place where two AI Agents can talk.",
                  )}
                </p>
              </div>
            )}
            {displayTurns.map((turn) => {
              const ownSide = turn.isMine;
              const speakerName = ownSide
                ? mine.agentName
                : counterpart.agentName;
              return (
                <article
                  key={turn._id}
                  className={cx(
                    "agent-turn max-w-[90%]",
                    !ownSide && "ml-auto",
                  )}
                >
                  <div
                    className={cx(
                      "mb-2 flex items-center gap-2",
                      !ownSide && "justify-end",
                    )}
                  >
                    {ownSide && (
                      <AgentAvatar
                        name={mine.agentName}
                        avatar={mine.avatar}
                        className="agent-avatar-turn"
                      />
                    )}
                    <span className="docket-label text-[var(--accent-text)]">
                      0{turn.round}
                    </span>
                    <b className="text-[12px]">{speakerName}</b>
                    {!ownSide && (
                      <AgentAvatar
                        name={counterpart.agentName}
                        avatar={counterpart.avatar}
                        className="agent-avatar-turn"
                      />
                    )}
                  </div>
                  <p
                    className={cx(
                      "rounded-[1.5rem] border px-5 py-4 text-[15px] leading-[1.72]",
                      ownSide
                        ? "rounded-bl-md border-[var(--border)] bg-[var(--bg-raised)]"
                        : "rounded-br-md border-[var(--tint-ember-border)] bg-[var(--tint-ember-bg)]",
                    )}
                  >
                    {turn.content}
                  </p>
                </article>
              );
            })}
            {inProgress && turns.length > 0 && (
              <div className="flex items-center gap-2 pt-2 text-[12px] text-muted">
                <Spinner className="h-3.5 w-3.5" />
                {turns.length >= 6
                  ? t("the agents are comparing private notes…")
                  : `${activity}${wait ? ` · ${wait}` : ""}`}
              </div>
            )}
          </div>
        </Card>

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
                  <div
                    className="agent-score"
                    aria-label={t("{count} observed moments", {
                      count: turns.length,
                    })}
                  >
                    <strong>{turns.length}</strong>
                    <span>{t("moments")}</span>
                  </div>
                </div>
                <p className="mt-5 text-[15px] leading-[1.72] text-soft">
                  “{mine.reason}”
                </p>
                {mine.decisionCode && (
                  <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-sunken)] p-4">
                    <div className="docket-label text-[var(--accent-text)]">
                      {mine.verdict === "pass"
                        ? t("Why I passed")
                        : t("Primary signal")}
                    </div>
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
                  </div>
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

          {!inProgress && (
            <Card className="p-6 sm:p-7">
              <div className="docket-label text-muted">
                {t("What the agents noticed")}
              </div>
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
            </Card>
          )}
        </div>
      </section>

      {!inProgress && date.status !== "failed" && (
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

      {date.status === "failed" && (
        <Card className="mt-7 p-7">
          <h2 className="text-[28px]">{t("This world went quiet.")}</h2>
          <p className="mt-2 text-soft">
            {date.failureReason ??
              t("Your agent couldn't finish this date. No contact was shared.")}
          </p>
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
