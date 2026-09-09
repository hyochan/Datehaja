import { useEffect, useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button, Card, Spinner, Tag, cx } from "../components/ui/primitives";
import { readableError } from "../components/ui/Toast";
import {
  AgentAvatar,
  type AvatarConfig,
} from "../components/agent/AgentAvatar";
import { AgentHomeWorld } from "../components/agent/AgentDateWorld";
import { useI18n } from "../i18n";
import { AgentSearchWorld } from "../components/agent/AgentSearchWorld";
import { relativeTime } from "../lib/format";

type AgentMessage = {
  _id: string;
  role: "human" | "agent";
  content: string;
  createdAt: number;
  agentDateId?: Id<"agentDates">;
};

type AgentQuestion = {
  _id: Id<"agentQuestions">;
  prompt: string;
  askedAt: number;
};

type DateDiscussion = {
  date: {
    _id: Id<"agentDates">;
    summary: string;
    status: string;
    introductionReady?: boolean;
  };
  mine: {
    agentName: string;
    avatar: AvatarConfig | null;
    reason: string;
    reflection?: { headline: string; question: string };
    consent: "pending" | "yes" | "no";
  };
  counterpart: {
    firstName: string;
    agentName: string;
    avatar: AvatarConfig | null;
    isDemo: boolean;
    contactEmail: string | null;
  };
};

const INTENT_LABELS: Record<string, string> = {
  casual: "Something casual",
  open: "Open to anything",
  serious: "Something serious",
  friendship: "Friendship first",
  unsure: "Still working it out",
};

const STRENGTH_LABELS: Record<string, string> = {
  no_preference: "No preference",
  flexible: "Flexible",
  important: "Important",
};

function looksLikeMeetIntent(content: string) {
  const normalized = content.trim().toLocaleLowerCase();
  return [
    /만나\s*(볼|봐|보고|고|자|도|겠|고 싶)/,
    /소개\s*(받|해|시켜)/,
    /연결\s*(해|할|하고)/,
    /\b(want|would like|ready|think).{0,24}\b(meet|introduction|connect)\b/,
    /\byes.{0,24}\b(meet|introduction|connect)\b/,
    /会ってみ|会いたい|紹介を希望|つながりたい/,
    /treffen|kennenlernen|vorstellen/,
    /rencontrer|présentation|mise en relation/,
    /ontmoeten|kennismaken/,
    /träffa|mötas|introduktion/,
  ].some((pattern) => pattern.test(normalized));
}

export default function AgentDashboardPage() {
  const mine = useQuery(api.agents.mine);
  const dates = useQuery(api.agentDates.listMine);
  const search = useQuery(api.scouting.mine);
  const beginSearch = useAction(api.scouting.start);
  const pauseSearch = useMutation(api.scouting.pause);
  const send = useMutation(api.agents.send);
  const consent = useMutation(api.agentDates.consent);
  const ensureQuestion = useMutation(api.agents.ensureQuestion);
  const answerQuestion = useMutation(api.agents.answerQuestion);
  const skipQuestion = useMutation(api.agents.skipQuestion);
  const proposal = useQuery(api.agents.pendingProposal);
  const respondToProposal = useMutation(api.agents.respondToProposal);
  const requestDate = useAction(api.agentDates.request);
  const readScoutAccess = useAction(api.billing.status);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawDiscussionId = searchParams.get("date");
  const discussionId =
    rawDiscussionId && /^[a-z0-9]{20,}$/.test(rawDiscussionId)
      ? (rawDiscussionId as Id<"agentDates">)
      : null;
  const discussion = useQuery(
    api.agentDates.get,
    discussionId ? { agentDateId: discussionId } : "skip",
  ) as DateDiscussion | null | undefined;
  const { locale, t } = useI18n();
  const [message, setMessage] = useState("");
  const [questionAnswer, setQuestionAnswer] = useState("");
  const [sending, setSending] = useState(false);
  const [decidingProposal, setDecidingProposal] = useState<
    "accept" | "decline" | null
  >(null);
  const [answering, setAnswering] = useState(false);
  // The card vanishes the moment it is answered and the exchange moves to the
  // conversation on the other side of the page, which reads as losing it.
  const [justAnswered, setJustAnswered] = useState<string | null>(null);
  const [consenting, setConsenting] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [dismissedConsentMessageId, setDismissedConsentMessageId] = useState<
    string | null
  >(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoutAccess, setScoutAccess] = useState<{
    allowed: boolean;
    mode: "subscription" | "demo" | "locked";
  } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (mine === null) navigate("/onboarding", { replace: true });
  }, [mine, navigate]);
  useEffect(() => {
    const chat = chatScrollRef.current;
    if (chat) chat.scrollTop = chat.scrollHeight;
  }, [mine?.messages?.length]);
  useEffect(() => {
    if (!discussion?.date._id) return;
    window.requestAnimationFrame(() => {
      document
        .getElementById("private-line")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [discussion?.date._id]);
  useEffect(() => {
    void readScoutAccess({})
      .then(setScoutAccess)
      .catch(() => {
        setScoutAccess({ allowed: false, mode: "locked" });
      });
  }, [readScoutAccess]);
  useEffect(() => {
    if (!mine?.agent?._id) return;
    void ensureQuestion({ locale }).catch(() => undefined);
  }, [ensureQuestion, locale, mine?.agent?._id]);

  if (mine === undefined || mine === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const agent = mine.agent as {
    name: string;
    avatar?: AvatarConfig;
    voice: string;
    autonomy: string;
    privateMemory: string;
    scoutingMemory?: string;
  };
  const messages = mine.messages as AgentMessage[];
  const openQuestion = (mine.openQuestion ?? null) as AgentQuestion | null;
  const visibleMessages = openQuestion
    ? messages.filter(
        (item) =>
          !(
            item.role === "agent" &&
            item.content === openQuestion.prompt &&
            item.createdAt === openQuestion.askedAt
          ),
      )
    : messages;
  const waitingForAgent =
    messages.length > 0 && messages[messages.length - 1]?.role === "human";
  const discussionPrompts = discussion
    ? [
        t("Here's how I'd say it:"),
        t("I liked this about them:"),
        t("Next time, look for someone who…"),
        t("I think I want to meet them."),
      ]
    : [];
  const latestDiscussionHumanMessage = discussion
    ? [...visibleMessages]
        .reverse()
        .find(
          (item) =>
            item.role === "human" && item.agentDateId === discussion.date._id,
        )
    : undefined;
  const showConsentConfirmation = Boolean(
    discussion &&
    discussion.date.status === "debrief_ready" &&
    discussion.date.introductionReady !== false &&
    discussion.mine.consent === "pending" &&
    latestDiscussionHumanMessage &&
    latestDiscussionHumanMessage._id !== dismissedConsentMessageId &&
    looksLikeMeetIntent(latestDiscussionHumanMessage.content),
  );

  async function submitMessage() {
    const content = message.trim();
    if (!content || sending) return;
    setMessage("");
    setSending(true);
    setError(null);
    try {
      await send({
        content,
        agentDateId: discussion?.date._id,
      });
    } catch (reason) {
      setMessage(content);
      setError(readableError(reason));
    } finally {
      setSending(false);
    }
  }

  async function submitQuestionAnswer() {
    const answer = questionAnswer.trim();
    if (!openQuestion || answer.length < 3 || answering) return;
    setAnswering(true);
    setError(null);
    try {
      await answerQuestion({ questionId: openQuestion._id, answer });
      setJustAnswered(openQuestion.prompt);
      setQuestionAnswer("");
    } catch (reason) {
      setError(readableError(reason));
    } finally {
      setAnswering(false);
    }
  }

  async function decideProposal(accept: boolean) {
    if (!proposal || decidingProposal) return;
    setDecidingProposal(accept ? "accept" : "decline");
    try {
      await respondToProposal({ proposalId: proposal._id, accept });
    } finally {
      setDecidingProposal(null);
    }
  }

  async function confirmIntroduction() {
    if (!discussion || consenting || discussion.mine.consent !== "pending") {
      return;
    }
    setConsenting(true);
    setConsentError(null);
    try {
      await consent({
        agentDateId: discussion.date._id,
        decision: "yes",
      });
    } catch (reason) {
      setConsentError(readableError(reason));
    } finally {
      setConsenting(false);
    }
  }

  async function dismissQuestion() {
    if (!openQuestion || answering) return;
    setAnswering(true);
    setError(null);
    try {
      await skipQuestion({ questionId: openQuestion._id });
      setQuestionAnswer("");
    } catch (reason) {
      setError(readableError(reason));
    } finally {
      setAnswering(false);
    }
  }

  async function tryDemoDate() {
    if (starting) return;
    if (!scoutAccess?.allowed) {
      navigate("/membership?intent=scout");
      return;
    }
    setStarting(true);
    setError(null);
    try {
      const id = await requestDate({ locale });
      navigate(`/agent-date/${id}`);
    } catch (reason) {
      setError(readableError(reason));
    } finally {
      setStarting(false);
    }
  }

  async function startSearch() {
    if (starting) return;
    if (!scoutAccess?.allowed) { navigate("/membership?intent=scout"); return; }
    setStarting(true);
    setError(null);
    try { await beginSearch({}); } catch (reason) { setError(readableError(reason)); }
    finally { setStarting(false); }
  }

  const activeDate = dates?.find(
    (date: any) => date.status === "queued" || date.status === "running",
  );
  const latestDate = dates?.[0] as any | undefined;
  const searchOngoing = search && ["searching", "waiting", "talking", "retrying"].includes(search.status);
  const readyDateId = search?.status === "match_ready" ? search.currentDateId : undefined;
  const searchHeadline = activeDate ? t("{agent} is out meeting someone.", { agent: agent.name })
    : readyDateId ? t("{agent} found someone to introduce.", { agent: agent.name })
    : search?.status === "waiting" ? t("Still looking. No match to rush.")
    : search?.status === "retrying" ? t("The search hit a pause.")
    : search?.status === "searching" ? t("{agent} is looking for you.", { agent: agent.name })
    : search?.status === "paused" ? t("Your search is paused.")
    : search?.status === "connected" ? t("Your introduction is open.")
    : t("Let {agent} keep looking for you.", { agent: agent.name });
  const profile = mine.profile as {
    displayName: string;
    city: string;
    interests: string[];
  } | null;
  const ownerName = profile?.displayName.split(/\s+/)[0] || t("You");
  const formatTime = (value: number) =>
    new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "2-digit",
    }).format(value);
  const dateStateLabel = (date: any) => {
    if (date.status === "queued") return t("Preparing the date world");
    if (date.status === "running")
      return t("{agent} is on a date", { agent: agent.name });
    if (date.status === "connected") return t("Introduction opened");
    if (date.status === "closed") return t("Closed with care");
    if (date.status === "failed") return t("Date interrupted");
    if (date.isSearchEncounter && !date.introductionReady) return t("Conversation saved · still searching");
    if (date.myVerdict === "encourage") return t("Your Dating Agent says meet");
    if (date.myVerdict === "pass") return t("Your Dating Agent says pass");
    return t("Private debrief ready");
  };

  /** Colour the state dot by what the owner can do next, not by raw status. */
  const dateStateTone = (date: any): "live" | "ready" | "quiet" => {
    if (date.status === "queued" || date.status === "running") return "live";
    if (date.status === "closed" || date.status === "failed") return "quiet";
    if (date.isSearchEncounter && !date.introductionReady) return "quiet";
    return "ready";
  };

  return (
    <div className="agent-dashboard">
      <section className="agent-command-grid">
        <Card className="agent-identity-card">
          <div className="flex items-center gap-3">
            <AgentAvatar
              name={agent.name}
              avatar={agent.avatar}
              className="agent-avatar-command"
              label={t("{agent}, your dating agent", { agent: agent.name })}
            />
            <div>
              <div className="docket-label text-[var(--accent-text)]">
                {t("Your private agent")}
              </div>
              <h1 className="agent-identity-name mt-1">{agent.name}</h1>
            </div>
          </div>
          <p className="agent-identity-intro mt-5 text-soft">
            {t(
              "Talk naturally. Correct what feels off. Every conversation helps {agent} represent the real you.",
              { agent: agent.name },
            )}
          </p>
          <div className="agent-identity-tags mt-5 flex flex-wrap gap-2">
            <Tag tone="dusk">
              {t("{voice} voice", { voice: t(agent.voice) })}
            </Tag>
            <Tag tone="sage">
              {t("{mode} mode", { mode: t(agent.autonomy) })}
            </Tag>
            <Tag tone="neutral">{t("private memory")}</Tag>
          </div>
          <button
            type="button"
            className="agent-identity-chat-link"
            onClick={() =>
              document
                .getElementById("private-line")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            <span aria-hidden>↘</span>
            {t("Talk with {agent}", { agent: agent.name })}
          </button>
        </Card>

        <Card className="agent-launch-card overflow-hidden">
          <div className="agent-launch-copy">
            <div className="docket-label text-[var(--accent-text)]">{t("An ongoing search")}</div>
            <h2 className="agent-launch-title mt-2">{searchHeadline}</h2>
            <p className="mt-3 text-[13px] leading-[1.65] text-soft">
              {activeDate ? t("A real conversation is unfolding. You can drop in and watch.")
                : readyDateId ? t("There is a specific conversation worth your attention. Read the letter before deciding.")
                : search?.status === "waiting" ? t("No new available Agent fits your boundaries right now. I'll check again automatically; you don't need to keep pressing a button.")
                : search?.status === "retrying" ? t("The last check could not finish. A retry is scheduled; no conversation has been invented.")
                : t("Your Dating Agent meets other searching Agents, learns from each conversation, and keeps going when it isn't right. You'll hear from us when there's someone to introduce.")}
            </p>
            <Button className="mt-6" fullWidth size="lg" loading={starting}
              disabled={Boolean((searchOngoing && !activeDate) || (!activeDate && !readyDateId && scoutAccess === null))}
              onClick={() => {
                if (activeDate) navigate(`/agent-date/${activeDate._id}`);
                else if (readyDateId) navigate(`/agent-date/${readyDateId}`);
                else void startSearch();
              }}>
              {activeDate ? t("Watch the date live →") : readyDateId ? t("Read the private debrief →")
                : searchOngoing ? t("Searching continues") : t("Send {agent} scouting →", { agent: agent.name })}
            </Button>
            {search && <div className="agent-search-status" role="status">
              <span>{t("Conversations completed: {count}", { count: search.encountersCompleted })}</span>
              {search.lastCheckedAt && <span>{t("Last checked {time}", { time: formatTime(search.lastCheckedAt) })}</span>}
              {searchOngoing && search.nextCheckAt && <span>{t("Next check {time}", { time: formatTime(search.nextCheckAt) })}</span>}
              {searchOngoing && <button type="button" onClick={() => void pauseSearch({}).catch(reason => setError(readableError(reason)))}>{t("Pause search")}</button>}
            </div>}
            <p className="mt-3 text-[11px] leading-relaxed text-muted">{t("Search progress stays here. We'll email only when there's someone to introduce.")}</p>
            {!searchOngoing && !readyDateId && !activeDate && <button type="button" disabled={starting || scoutAccess === null} className="mt-4 text-[12px] underline text-muted" onClick={() => void tryDemoDate()}>{t("Try a clearly labelled demo encounter")}</button>}
          </div>
          <div className="agent-launch-world">
            {search ? <AgentSearchWorld name={agent.name} avatar={agent.avatar} encounters={dates ?? []} currentDateId={search.currentDateId} />
              : <AgentHomeWorld person={{ name: agent.name, avatar: agent.avatar }} />}
          </div>
        </Card>
      </section>

      <section
        className="agent-loop-rail"
        aria-label={t("How your scout works")}
      >
        <div className="agent-loop-step is-done">
          <span>01</span>
          <strong>{t("Briefed by you")}</strong>
          <small>{t("Agent, ideal person, honest profile")}</small>
        </div>
        <i aria-hidden>→</i>
        <div className={cx("agent-loop-step", activeDate && "is-current")}>
          <span>02</span>
          <strong>{t("Scouts the agent world")}</strong>
          <small>{t("Watch the date unfold moment by moment")}</small>
        </div>
        <i aria-hidden>→</i>
        <div
          className={cx(
            "agent-loop-step",
            latestDate &&
              !["queued", "running"].includes(latestDate.status) &&
              "is-current",
          )}
        >
          <span>03</span>
          <strong>{t("Returns with a case")}</strong>
          <small>{t("Private debrief, then two human yeses")}</small>
        </div>
      </section>

      {error && (
        <p
          className="mt-5 rounded-xl border border-[var(--tint-ember-border)] bg-[var(--tint-ember-bg)] p-4 text-[14px] text-[var(--tint-ember-fg)]"
          role="alert"
        >
          {error}
        </p>
      )}

      <section
        id="private-line"
        className="agent-workspace-grid mt-8 scroll-mt-24"
      >
        <Card className="agent-chat-card flex flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-6">
            <div>
              <div className="docket-label text-muted">{t("Private line")}</div>
              <div className="mt-1 text-[14px] font-bold">
                {t("You ↔ {agent}", { agent: agent.name })}
              </div>
            </div>
            <span className="flex items-center gap-2 text-[11px] text-muted">
              <span className="h-2 w-2 rounded-full bg-[var(--color-sage-500)]" />
              {t("only you can read this")}
            </span>
          </header>
          {discussion && (
            <div className="agent-discussion-context border-b border-[var(--border)] p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="agent-discussion-pair" aria-hidden="true">
                    <AgentAvatar
                      name={discussion.mine.agentName}
                      avatar={discussion.mine.avatar}
                      className="agent-avatar-note"
                    />
                    <AgentAvatar
                      name={discussion.counterpart.agentName}
                      avatar={discussion.counterpart.avatar}
                      className="agent-avatar-note"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="docket-label text-[var(--accent-text)]">
                      {t("Debrief open")}
                    </div>
                    <strong className="mt-1 block truncate text-[14px]">
                      {discussion.mine.agentName} ×{" "}
                      {discussion.counterpart.agentName}
                    </strong>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-[var(--border)] px-3 py-1 text-[11px] font-bold text-muted hover:text-[var(--text)]"
                  onClick={() => setSearchParams({}, { replace: true })}
                >
                  {t("Close")}
                </button>
              </div>
              <p className="mt-3 line-clamp-2 text-[12px] leading-relaxed text-soft">
                {discussion.mine.reflection?.question || discussion.mine.reason}
              </p>
              <div className="agent-discussion-prompts mt-3 flex flex-wrap gap-2">
                {discussionPrompts.map((prompt) => (
                  <button
                    type="button"
                    key={prompt}
                    onClick={() => {
                      setMessage(prompt);
                      window.requestAnimationFrame(() =>
                        messageRef.current?.focus(),
                      );
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <Link
                to={`/agent-date/${discussion.date._id}`}
                className="mt-3 inline-block text-[11px] font-bold text-[var(--accent-text)]"
              >
                {t("Back to the full debrief")} →
              </Link>
            </div>
          )}
          <div
            ref={chatScrollRef}
            className="agent-chat-scroll flex-1 space-y-4 overflow-auto p-5 sm:p-6"
          >
            {visibleMessages.map((item) => (
              <div
                key={item._id}
                className={cx(
                  "flex max-w-[92%] items-end gap-2",
                  item.role === "human" ? "ml-auto justify-end" : "mr-auto",
                )}
              >
                {item.role === "agent" && (
                  <AgentAvatar
                    name={agent.name}
                    avatar={agent.avatar}
                    className="agent-avatar-chat"
                  />
                )}
                <div className="min-w-0">
                  <div
                    className={cx(
                      "mb-1 flex items-center gap-2 px-1 text-[10px] text-muted",
                      item.role === "human" && "justify-end",
                    )}
                  >
                    <strong>
                      {item.role === "human" ? ownerName : agent.name}
                    </strong>
                    <span>{formatTime(item.createdAt)}</span>
                  </div>
                  <div
                    className={cx(
                      "agent-bubble rounded-[1.35rem] px-4 py-3 text-[14.5px] leading-[1.65]",
                      item.role === "human"
                        ? "rounded-br-md bg-[var(--text)] text-[var(--bg)]"
                        : "rounded-bl-md border border-[var(--border)] bg-[var(--bg-raised)]",
                    )}
                  >
                    {item.agentDateId && (
                      <div className="docket-label mb-1 opacity-60">
                        {t("Date debrief")}
                      </div>
                    )}
                    {item.role === "agent" &&
                    // Every greeting this product has shipped, so an older
                    // stored message is re-rendered as the current one.
                    /^I'm .+, your dating agent\. I'll learn how you actually connect,|^I'm .+ — your best friend here, and your matchmaker\.|^I'm .+ — your second self\./i.test(
                      item.content,
                    )
                      ? t(
                          "I'm {agent} — your second self. Tell me what you're actually like, and I'll go on the date in your place, as you. Then I'll come home and tell you honestly what I thought.",
                          { agent: agent.name },
                        )
                      : item.content}
                  </div>
                </div>
              </div>
            ))}
            {waitingForAgent && (
              <div className="flex items-center gap-2 text-[12px] text-muted">
                <Spinner className="h-3.5 w-3.5" />{" "}
                {t("{agent} is thinking, not typing…", {
                  agent: agent.name,
                })}
              </div>
            )}
            {showConsentConfirmation && discussion && (
              <div className="agent-consent-confirmation">
                <div className="flex items-start gap-3">
                  <AgentAvatar
                    name={discussion.mine.agentName}
                    avatar={discussion.mine.avatar}
                    className="agent-avatar-note"
                  />
                  <div className="min-w-0">
                    <div className="docket-label text-[var(--accent-text)]">
                      {t("Your decision, not your Dating Agent's")}
                    </div>
                    <h3 className="mt-2 text-[22px] leading-tight">
                      {t(
                        "Shall I send your introduction request to {person}?",
                        {
                          person: discussion.counterpart.firstName,
                        },
                      )}
                    </h3>
                    <p className="mt-2 text-[12px] leading-relaxed text-soft">
                      {t(
                        "Your message helps {agent} understand you, but only the button below counts as consent. Your answer stays sealed unless both people say yes.",
                        { agent: discussion.mine.agentName },
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button
                    size="sm"
                    loading={consenting}
                    onClick={() => void confirmIntroduction()}
                  >
                    {t("Yes, send my introduction request →")}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={consenting}
                    onClick={() =>
                      setDismissedConsentMessageId(
                        latestDiscussionHumanMessage?._id ?? null,
                      )
                    }
                  >
                    {t("Not yet — keep talking")}
                  </Button>
                </div>
                {consentError && (
                  <p
                    className="mt-3 text-[12px] text-[var(--tint-ember-strong)]"
                    role="alert"
                  >
                    {consentError}
                  </p>
                )}
              </div>
            )}
            {proposal && (
              <div className="agent-consent-confirmation">
                <div className="flex items-start gap-3">
                  <AgentAvatar
                    name={proposal.agentName}
                    avatar={agent.avatar}
                    className="agent-avatar-note"
                  />
                  <div className="min-w-0">
                    <div className="docket-label text-[var(--accent-text)]">
                      {t("What I'd look for next")}
                    </div>
                    <h3 className="mt-2 text-[22px] leading-tight">
                      {t("Should I change who I look for?")}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed">
                      “{proposal.reason}”
                    </p>
                    <dl className="agent-proposal-change">
                      {proposal.traits && (
                        <div>
                          <dt>{t("Personality I look for")}</dt>
                          <dd>
                            <s>
                              {proposal.traits.from.length > 0
                                ? proposal.traits.from
                                    .map((trait) => t(trait))
                                    .join(", ")
                                : t("No preference")}
                            </s>{" "}
                            <b>
                              {proposal.traits.to
                                .map((trait) => t(trait))
                                .join(", ")}
                            </b>
                          </dd>
                        </div>
                      )}
                      {proposal.personalityPreference && (
                        <div>
                          <dt>{t("How much it matters")}</dt>
                          <dd>
                            <s>
                              {t(
                                STRENGTH_LABELS[
                                  proposal.personalityPreference.from
                                ] ?? "No preference",
                              )}
                            </s>{" "}
                            <b>
                              {t(
                                STRENGTH_LABELS[
                                  proposal.personalityPreference.to
                                ] ?? "No preference",
                              )}
                            </b>
                          </dd>
                        </div>
                      )}
                      {proposal.relationshipIntent && (
                        <div>
                          <dt>{t("What I am looking for")}</dt>
                          <dd>
                            <s>
                              {t(
                                INTENT_LABELS[
                                  proposal.relationshipIntent.from
                                ] ?? "Still working it out",
                              )}
                            </s>{" "}
                            <b>
                              {t(
                                INTENT_LABELS[proposal.relationshipIntent.to] ??
                                  "Still working it out",
                              )}
                            </b>
                          </dd>
                        </div>
                      )}
                    </dl>
                    <p className="mt-3 text-[12px] leading-relaxed text-soft">
                      {t(
                        "Nothing changes until you say so. Your age, distance, language and budget stay exactly where you set them.",
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button
                    size="sm"
                    loading={decidingProposal === "accept"}
                    disabled={decidingProposal !== null}
                    onClick={() => void decideProposal(true)}
                  >
                    {t("Yes, look for that →")}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={decidingProposal === "decline"}
                    disabled={decidingProposal !== null}
                    onClick={() => void decideProposal(false)}
                  >
                    {t("Leave it as it is")}
                  </Button>
                </div>
              </div>
            )}
            {discussion?.mine.consent === "yes" && (
              <div className="agent-consent-status">
                <span aria-hidden>✓</span>
                <div>
                  <strong>
                    {discussion.date.status === "connected"
                      ? t("You both said yes. The introduction is open.")
                      : t("Your yes is sealed.")}
                  </strong>
                  <p>
                    {discussion.date.status === "connected"
                      ? discussion.counterpart.contactEmail
                        ? t("Open the full debrief to see the shared contact.")
                        : t(
                            "This demo completed the full two-person consent flow.",
                          )
                      : t(
                          "We won't reveal whether the other person has answered unless they also say yes.",
                        )}
                  </p>
                </div>
              </div>
            )}
            {!discussion && visibleMessages.length <= 1 && (
              <div className="agent-chat-starters">
                <span>{t("Try asking")}</span>
                {[
                  t("Keep my replies short and natural."),
                  t("Look for someone who is curious about me too."),
                  t("What have you learned about me?"),
                ].map((prompt) => (
                  <button
                    type="button"
                    key={prompt}
                    onClick={() => {
                      setMessage(prompt);
                      window.requestAnimationFrame(() =>
                        messageRef.current?.focus(),
                      );
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form
            className="border-t border-[var(--border)] p-4 sm:p-5"
            onSubmit={(event) => {
              event.preventDefault();
              void submitMessage();
            }}
          >
            <div className="flex items-end gap-2 rounded-[1.35rem] border border-[var(--border-strong)] bg-[var(--bg-raised)] p-2 pl-4 focus-within:border-[var(--tint-ember-border)]">
              <textarea
                ref={messageRef}
                aria-label={t("Message {agent}", { agent: agent.name })}
                rows={2}
                value={message}
                placeholder={
                  discussion
                    ? t("Ask what your Dating Agent noticed, or correct the debrief…")
                    : t(
                        "Tell me how you'd say it, who you'd like to meet, or what felt right…",
                      )
                }
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void submitMessage();
                  }
                }}
                className="min-h-12 flex-1 resize-none bg-transparent py-2 text-[14px] leading-relaxed outline-none placeholder:text-muted"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim() || sending}
                loading={sending}
              >
                {t("Send")}
              </Button>
            </div>
          </form>
        </Card>

        <div>
          {!openQuestion && justAnswered && (
            <Card className="agent-question-sent mb-5 p-5">
              <div className="flex items-start gap-3">
                <span className="agent-question-sent-mark" aria-hidden="true">
                  ✓
                </span>
                <div className="min-w-0">
                  <div className="docket-label text-[var(--accent-text)]">
                    {t("{agent} has your answer", { agent: agent.name })}
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-soft">
                    {t(
                      "It continues in your conversation, where you can read the question and reply again.",
                    )}
                  </p>
                  <p className="agent-question-sent-quote">{t(justAnswered)}</p>
                  <button
                    type="button"
                    className="mt-3 text-[12px] font-bold text-[var(--accent-text)]"
                    onClick={() => {
                      setJustAnswered(null);
                      messageRef.current?.scrollIntoView({
                        block: "center",
                        behavior: "smooth",
                      });
                      messageRef.current?.focus();
                    }}
                  >
                    {t("Open the conversation →")}
                  </button>
                </div>
              </div>
            </Card>
          )}
          {openQuestion && (
            <Card className="agent-question-note mb-5 overflow-hidden p-5 sm:p-6">
              <div className="agent-learning-path" aria-hidden="true">
                <span className="is-current">{t("you")}</span>
                <i>→</i>
                <span>{agent.name}</span>
                <i>→</i>
                <span>{t("next date")}</span>
              </div>
              <div className="mt-5 flex items-start gap-3">
                <AgentAvatar
                  name={agent.name}
                  avatar={agent.avatar}
                  className="agent-avatar-note"
                />
                <div className="min-w-0">
                  <div className="docket-label text-[var(--accent-text)]">
                    {t("A question from {agent}", { agent: agent.name })}
                  </div>
                  <h2 className="mt-2 text-[clamp(1.45rem,3vw,2rem)] leading-[1.18]">
                    {t(openQuestion.prompt)}
                  </h2>
                </div>
              </div>
              <form
                className="mt-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  void submitQuestionAnswer();
                }}
              >
                <textarea
                  rows={3}
                  value={questionAnswer}
                  aria-label={t("Your honest answer")}
                  placeholder={t(
                    "Answer like you're talking to someone who knows you…",
                  )}
                  onChange={(event) => setQuestionAnswer(event.target.value)}
                  className="agent-question-input w-full resize-none rounded-[1.15rem] border border-[var(--border-strong)] bg-[var(--bg-raised)] px-4 py-3 text-[14px] leading-relaxed outline-none placeholder:text-muted focus:border-[var(--tint-ember-border)]"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="text-[11px] font-bold text-muted hover:text-[var(--text)]"
                    disabled={answering}
                    onClick={() => void dismissQuestion()}
                  >
                    {t("Not now")}
                  </button>
                  <Button
                    type="submit"
                    size="sm"
                    loading={answering}
                    disabled={questionAnswer.trim().length < 3}
                  >
                    {t("Let {agent} learn this", { agent: agent.name })} →
                  </Button>
                </div>
              </form>
            </Card>
          )}
          <Card className="agent-memory-note mb-5 overflow-hidden p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="docket-label text-[var(--accent-text)]">
                  {t("What {agent} remembers", { agent: agent.name })}
                </div>
                <p className="mt-3 text-[13px] leading-[1.65] text-soft">
                  {agent.privateMemory ||
                    t(
                      "Nothing distilled yet. Your corrections will become private memory here.",
                    )}
                </p>
                {agent.scoutingMemory && (
                  <div className="mt-4 border-t border-[var(--border)] pt-4">
                    <div className="docket-label text-muted">
                      {t("Learned from Agent dates")}
                    </div>
                    <p className="mt-2 whitespace-pre-line text-[13px] leading-[1.65] text-soft">
                      {agent.scoutingMemory}
                    </p>
                  </div>
                )}
              </div>
              <span
                className="agent-memory-lock"
                aria-label={t("Private to you")}
              >
                ⌾
              </span>
            </div>
            <button
              type="button"
              className="mt-4 text-[11px] font-bold text-[var(--accent-text)]"
              onClick={() => {
                setMessage(t("Please correct or forget this memory: "));
                window.requestAnimationFrame(() => messageRef.current?.focus());
              }}
            >
              {t("Correct this memory →")}
            </button>
          </Card>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <div className="docket-label text-muted">{t("Field notes")}</div>
              <h2 className="mt-1 text-[26px]">{t("Agent dates")}</h2>
            </div>
            <span className="text-[12px] text-muted">
              {t("{count} total", { count: dates?.length ?? 0 })}
            </span>
          </div>
          <div className="space-y-3">
            {dates === undefined ? (
              <Card className="p-6">
                <Spinner />
              </Card>
            ) : dates.length === 0 ? (
              <Card className="agent-empty-note p-7">
                <div className="text-[30px]">✦</div>
                <h3 className="mt-3 text-[22px]">{t("No stories yet.")}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-soft">
                  {t(
                    "Your first agent date will appear here as a transcript and an honest private debrief.",
                  )}
                </p>
              </Card>
            ) : (
              dates.slice(0, 8).map((date: any) => (
                <Link key={date._id} to={`/agent-date/${date._id}`}>
                  <Card className="mb-3 p-5 transition-transform hover:-translate-y-0.5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-3">
                        <AgentAvatar
                          name={date.counterpart?.agentName ?? "Unknown"}
                          avatar={date.counterpart?.avatar}
                          className="agent-avatar-note"
                        />
                        <div className="min-w-0">
                          <div className={`agent-date-state is-${dateStateTone(date)}`}>
                            <span className="agent-date-state-dot" aria-hidden="true" />
                            {dateStateLabel(date)}
                          </div>
                          <h3 className="mt-2 text-[21px]">
                            {agent.name} ×{" "}
                            {date.counterpart?.agentName ?? t("another agent")}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-soft">
                            {date.summary || date.setting}
                          </p>
                        </div>
                      </div>
                      {/* The state already reads once, above. This slot now
                          carries what the card was missing: when it last moved. */}
                      <time
                        className="agent-date-when"
                        dateTime={new Date(date.updatedAt).toISOString()}
                      >
                        {relativeTime(date.updatedAt)}
                      </time>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
