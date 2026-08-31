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
  };
  mine: {
    agentName: string;
    avatar: AvatarConfig | null;
    reason: string;
  };
  counterpart: {
    agentName: string;
    avatar: AvatarConfig | null;
  };
};

export default function AgentDashboardPage() {
  const mine = useQuery(api.agents.mine);
  const dates = useQuery(api.agentDates.listMine);
  const send = useMutation(api.agents.send);
  const ensureQuestion = useMutation(api.agents.ensureQuestion);
  const answerQuestion = useMutation(api.agents.answerQuestion);
  const skipQuestion = useMutation(api.agents.skipQuestion);
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
  const [answering, setAnswering] = useState(false);
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
        t("Explain what led you to this verdict."),
        t("What should you carry into the next search?"),
        t("Here's what your debrief got wrong:"),
      ]
    : [];

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
      setQuestionAnswer("");
    } catch (reason) {
      setError(readableError(reason));
    } finally {
      setAnswering(false);
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

  async function startDate() {
    if (starting) return;
    if (!scoutAccess?.allowed) {
      navigate("/membership?intent=scout");
      return;
    }
    setStarting(true);
    setError(null);
    try {
      const id = await requestDate({});
      navigate(`/agent-date/${id}`);
    } catch (reason) {
      setError(readableError(reason));
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="agent-dashboard">
      <section className="agent-command-grid">
        <div className="agent-command-copy">
          <div className="flex items-center gap-3">
            <AgentAvatar
              name={agent.name}
              avatar={agent.avatar}
              className="agent-avatar-command"
              label={`${agent.name}, your dating agent`}
            />
            <div>
              <div className="docket-label text-[var(--accent-text)]">
                Your private agent
              </div>
              <h1 className="mt-1 text-[clamp(3rem,7vw,5.8rem)] leading-[0.9]">
                {agent.name}
              </h1>
            </div>
          </div>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.75] text-soft">
            Talk normally. Correct what feels off. The better {agent.name}{" "}
            understands the unpolished version of you, the more honest its dates
            become.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Tag tone="dusk">{agent.voice} voice</Tag>
            <Tag tone="sage">{agent.autonomy} mode</Tag>
            <Tag tone="neutral">private memory</Tag>
          </div>
        </div>

        <Card className="agent-launch-card overflow-hidden p-6 sm:p-8">
          <AgentHomeWorld person={{ name: agent.name, avatar: agent.avatar }} />
          <div className="relative z-[1] mt-8">
            <div className="docket-label text-[var(--accent-text)]">
              {scoutAccess?.allowed ? "Scout Pass ready" : "Ready to search"}
            </div>
            <h2 className="mt-2 text-[32px]">
              Send {agent.name} out to find your person.
            </h2>
            <p className="mt-3 text-[14px] leading-[1.65] text-soft">
              Your brief is ready. Once dispatched, {agent.name} searches your
              city, meets a compatible Agent, and brings home an honest case for
              — or against — a real introduction.
            </p>
            <Button
              className="mt-6"
              fullWidth
              size="lg"
              loading={starting}
              onClick={() => void startDate()}
            >
              {scoutAccess === null
                ? "Checking Scout Pass…"
                : scoutAccess.allowed
                  ? `Send ${agent.name} scouting →`
                  : "Unlock scouting →"}
            </Button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
              {scoutAccess?.mode === "demo"
                ? "Development demo pass · no charge"
                : "The pass funds the search, not a guaranteed match. Contact stays sealed."}
            </p>
          </div>
        </Card>
      </section>

      <section className="agent-loop-rail" aria-label="How your scout works">
        <div className="agent-loop-step is-done">
          <span>01</span>
          <strong>Briefed by you</strong>
          <small>Agent, ideal person, honest profile</small>
        </div>
        <i aria-hidden>→</i>
        <div className="agent-loop-step">
          <span>02</span>
          <strong>Scouts the agent world</strong>
          <small>Watch the date unfold moment by moment</small>
        </div>
        <i aria-hidden>→</i>
        <div className="agent-loop-step">
          <span>03</span>
          <strong>Returns with a case</strong>
          <small>Private debrief, then two human yeses</small>
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
        className="mt-10 scroll-mt-24 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <Card className="agent-chat-card flex min-h-[36rem] flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-6">
            <div>
              <div className="docket-label text-muted">Private line</div>
              <div className="mt-1 text-[14px] font-bold">
                You ↔ {agent.name}
              </div>
            </div>
            <span className="flex items-center gap-2 text-[11px] text-muted">
              <span className="h-2 w-2 rounded-full bg-[var(--color-sage-500)]" />
              only you can read this
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
                {discussion.date.summary || discussion.mine.reason}
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
                  {item.content}
                </div>
              </div>
            ))}
            {waitingForAgent && (
              <div className="flex items-center gap-2 text-[12px] text-muted">
                <Spinner className="h-3.5 w-3.5" /> {agent.name} is thinking,
                not typing…
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
                aria-label={`Message ${agent.name}`}
                rows={2}
                value={message}
                placeholder={
                  discussion
                    ? t("Ask what your Agent noticed, or correct the debrief…")
                    : "Tell your agent what people usually misunderstand about you…"
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
                Send
              </Button>
            </div>
          </form>
        </Card>

        <div>
          {openQuestion && (
            <Card className="agent-question-note mb-5 overflow-hidden p-5 sm:p-6">
              <div className="agent-learning-path" aria-hidden="true">
                <span className="is-current">you</span>
                <i>→</i>
                <span>{agent.name}</span>
                <i>→</i>
                <span>next date</span>
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
                    {openQuestion.prompt}
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
                  What {agent.name} remembers
                </div>
                <p className="mt-3 text-[13px] leading-[1.65] text-soft">
                  {agent.privateMemory ||
                    "Nothing distilled yet. Your corrections will become private memory here."}
                </p>
                {agent.scoutingMemory && (
                  <div className="mt-4 border-t border-[var(--border)] pt-4">
                    <div className="docket-label text-muted">
                      Learned from Agent dates
                    </div>
                    <p className="mt-2 whitespace-pre-line text-[13px] leading-[1.65] text-soft">
                      {agent.scoutingMemory}
                    </p>
                  </div>
                )}
              </div>
              <span className="agent-memory-lock" aria-label="Private to you">
                ⌾
              </span>
            </div>
            <button
              type="button"
              className="mt-4 text-[11px] font-bold text-[var(--accent-text)]"
              onClick={() => {
                setMessage("Please correct or forget this memory: ");
                window.requestAnimationFrame(() => messageRef.current?.focus());
              }}
            >
              Correct this memory →
            </button>
          </Card>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <div className="docket-label text-muted">Field notes</div>
              <h2 className="mt-1 text-[26px]">Agent dates</h2>
            </div>
            <span className="text-[12px] text-muted">
              {dates?.length ?? 0} total
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
                <h3 className="mt-3 text-[22px]">No stories yet.</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-soft">
                  Your first agent date will appear here as a transcript and an
                  honest private debrief.
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
                          <div className="docket-label text-[var(--accent-text)]">
                            {date.status === "running" ||
                            date.status === "queued"
                              ? "in the virtual world"
                              : date.myVerdict === "encourage"
                                ? "your agent says go"
                                : "debrief ready"}
                          </div>
                          <h3 className="mt-2 text-[21px]">
                            {agent.name} ×{" "}
                            {date.counterpart?.agentName ?? "another agent"}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-soft">
                            {date.summary || date.setting}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-[var(--bg-sunken)] px-3 py-1 text-[11px] text-muted">
                        {date.status.replaceAll("_", " ")}
                      </span>
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
