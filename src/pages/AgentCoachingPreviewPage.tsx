import { useEffect, useState } from "react";
import { useConvexAuth } from "convex/react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { usePreviewLocale } from "../lib/previewLocale";
import { activeLocale } from "../i18n";
import { englishProof } from "../fixtures/learningProofEnglish";
import { DateTranscript } from "../components/agent/DateTranscript";
import { DateActivityJournal } from "../components/agent/DateActivityJournal";
import { AgentDateWorld } from "../components/agent/AgentDateWorld";
import { AgentAvatar } from "../components/agent/AgentAvatar";
import { speakingStats, type LearningProof } from "../lib/learningProof";
import raw from "../fixtures/learningProof.json";
import "./learning-proof.css";

const original = raw as LearningProof;
export default function AgentCoachingPreviewPage() {
  const { isAuthenticated } = useConvexAuth();
  const [params, setParams] = useSearchParams();
  const [initialLanguage] = useState(() => activeLocale().startsWith("ko") ? "ko" : "en");
  const language = params.get("lang") === "ko" ? "ko" : params.get("lang") === "en" ? "en" : initialLanguage;
  usePreviewLocale(language === "ko" ? "ko-KR" : "en-US");
  const proof = language === "ko" ? original : englishProof;
  const say = (ko: string, en: string) => language === "ko" ? ko : en;
  const { hash } = useLocation();
  const navigate = useNavigate();
  const requested = Number(params.get("date"));
  const selected = Number.isInteger(requested) && requested >= 1 && requested <= proof.dates.length ? requested - 1 : proof.dates.length - 1;
  const [jump, setJump] = useState<{ date: number; round: number; request: number }>();
  useEffect(() => {
    if (!jump || jump.date !== selected) return;
    const frame = requestAnimationFrame(() => document.getElementById(`turn-${jump.round}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
    return () => cancelAnimationFrame(frame);
  }, [selected, jump]);
  const [seek, setSeek] = useState<{ round: number; request: number }>();
  if (proof.dates.length < 4) return <main className="date-record-preview"><h1>{say("실행 기록을 준비하고 있어요.", "Preparing the saved records.")}</h1></main>;
  const record = proof.dates[selected];
  const before = proof.dates[0], after = proof.dates[proof.dates.length - 1];
  const firstWords = (date: LearningProof["dates"][number]) => date.turns.find(turn => turn.isMine)!;
  const selectDate = (index: number) => { setSeek(undefined); setJump(undefined); navigate({ search: `?date=${index + 1}&lang=${language}`, hash }, { replace: true, preventScrollReset: true }); };
  const showLine = (index: number, round: number) => {
    setSeek(undefined);
    navigate({ search: `?date=${index + 1}&lang=${language}`, hash: `#turn-${round}` }, { replace: true, preventScrollReset: true });
    setJump(current => ({ date: index, round, request: (current?.request ?? 0) + 1 }));
  };
  return <main className="date-record-preview learning-proof">
    <header className="date-preview-mast"><Link to="/">Datehaja</Link><span>{say("가상 인물 · 실제 저장된 데이트와 피드백", "Fictional people · actual saved dates and feedback")}</span><div className="proof-language" role="group" aria-label="Record language">{(["en", "ko"] as const).map(lang => <button key={lang} type="button" aria-pressed={language === lang} onClick={() => { const next = new URLSearchParams(params); next.set("lang", lang); setParams(next, { replace: true, preventScrollReset: true }); }}>{lang === "en" ? "English" : "한국어 원문"}</button>)}</div></header>
    <section className="date-preview-intro">
      <span className="docket-label">{say("조금씩, 더 나답게", "A little more like me")}</span>
      <h1>{say("“나는 그렇게 말하지 않아.”", "“That's not how I talk.”")}<br />{say("다음 만남은 달라질까요?", "Does the next date change?")}</h1>
      <p>{say("재이의 데이트 에이전트 리오가 네 사람을 만났어요. 첫 대화를 읽고 말투를 고치고, 상대를 보는 기준을 알려준 뒤, 새로운 세 만남까지 이어간 기록입니다.", "Jae's Dating Agent, Rio, met four people. After the first date, the test owner corrected its voice and explained what to notice in a partner. These records follow the same Agent through three new encounters.")}</p>
      <nav className="date-record-nav"><a href="#comparison">{say("바뀐 말투 비교하기 ↓", "Compare before and after ↓")}</a><a href="#coaching">{say("실제로 남긴 피드백 ↓", "Read the saved feedback ↓")}</a><a href="#dates">{say("네 번의 데이트 살펴보기 ↓", "Explore all four dates ↓")}</a><a href="/demo">{say("2분 50초 전체 시연 ↗", "2:50 full walkthrough ↗")}</a></nav><p className="proof-caption">{say("한국어 원문입니다. English를 누르면 같은 기록의 번역을 볼 수 있어요.", "English translation of Korean records. Switch to 한국어 원문 to read the unchanged source. This is recorded evidence, not a new live generation.")}</p>
    </section>

    <section className="proof-comparison" id="comparison" aria-labelledby="proof-comparison-title">
      <header><span className="docket-label">{say("같은 리오, 다음 만남", "Same Rio. A later encounter.")}</span><h2 id="proof-comparison-title">{say("반말에서, 내가 편한 존댓말로.", "From informal speech to the polite voice I asked for.")}</h2><p>{say("첫 만남과 세 번의 피드백을 거친 최근 만남에서, 리오가 처음 한 말을 그대로 옮겼어요.", "Rio's first reply on the first date and on the latest date, after three pieces of feedback. Korean changes from informal endings to polite ones; English alone cannot reproduce that grammatical distinction.")}</p></header>
      <div className="proof-comparison-grid">
        {[before, after].map((date, index) => <article key={date.label} className={index ? "is-after" : "is-before"}>
          <div className="proof-quote-heading"><AgentAvatar name={date.mine.name} avatar={date.mine.avatar} className="proof-avatar" /><div><span>{index ? say("피드백을 받은 뒤", "After feedback · polite Korean") : say("수정하기 전", "Before feedback · informal Korean")}</span><strong>{date.mine.name} → {date.counterpart.name}</strong></div></div>
          <blockquote>{firstWords(date).content}</blockquote>
          {language === "en" && <p className="proof-original" lang="ko">{firstWords(original.dates[index === 0 ? 0 : original.dates.length - 1]).content}</p>}
          <button type="button" onClick={() => showLine(index === 0 ? 0 : proof.dates.length - 1, firstWords(date).round)}>{say("앞뒤 대화 함께 읽기", "Read the surrounding conversation")} <span aria-hidden="true">↓</span></button>
        </article>)}
      </div>
      <div className="proof-owner-note"><span>{say("재이가 남긴 수정", "The owner's correction")}</span><p>{say("“처음 만난 사람에게는 존댓말을 끝까지 유지해줘. 나는 한두 문장으로 짧게 말하고, 매번 질문으로 끝내지 않아.”", "“Please keep using polite Korean throughout when meeting someone for the first time. I speak briefly, in one or two sentences, and don't end every reply with a question.”")}</p><a href="#coaching">{say("수정 요청과 리오의 답장 전체 보기 ↓", "Read the full request and Rio's reply ↓")}</a></div>
      <p className="proof-caption">{say("이미 지난 대화는 그대로 두고, 피드백 이후 새로 만난 상대와의 대화를 비교합니다. 아래에는 좋은 반응뿐 아니라 실제 판정과 아쉬운 점도 함께 남겼어요.", "Past conversations stay unchanged. These are new partners and new dates. Polite speech persisted; average reply length did not decrease. This demonstrates retained guidance, not perfect learning or real-user satisfaction.")}</p>
    </section>

    <section className="proof-feedback" id="coaching" aria-labelledby="proof-feedback-title">
      <header><span className="docket-label">{say("내 에이전트와 나눈 이야기", "A private conversation with my Agent")}</span><h2 id="proof-feedback-title">{say("말투도, 사람을 보는 기준도.", "How I talk. What I notice in someone.")}</h2><p>{say("테스트 사용자가 실제로 보낸 문장과 리오가 저장한 답장입니다. 다음 수정은 앞서 배운 내용을 이어받습니다.", "The test owner's actual requests and Rio's saved replies. Each later correction carries earlier guidance forward.")}</p></header>
      {proof.feedback.map((entry, index) => <article key={index}>
        <div className="proof-feedback-label"><span>{String(index + 1).padStart(2, "0")}</span><h3>{entry.target === "counterpart" ? say("어떤 상대가 좋은지", "What to notice in a partner") : index === 0 ? say("내 말투를 고치기", "Correcting my voice") : say("다음 만남 뒤, 한 번 더", "One more correction after a later date")}</h3><span>{say("대화 후: ", "After the date with ")}{proof.dates[entry.dateIndex].counterpart.name}</span></div>
        <blockquote>{entry.content}</blockquote>
        <details><summary>{say("리오의 답장과 기억 보기", "Read Rio's reply and memory")} <span aria-hidden="true">+</span></summary><div className="proof-saved-reply"><strong>{say("리오의 답장", "Rio's saved reply")}</strong><p>{entry.reply}</p><strong>{say("다음 만남에 가져간 기억", "Memory carried into the next encounter")}</strong><p>{entry.memory}</p><button type="button" onClick={() => showLine(entry.dateIndex, entry.round)}>{say("이 피드백을 남긴 대화 보기 ↓", "Read the line this feedback refers to ↓")}</button></div></details>
      </article>)}
    </section>

    <section className="proof-dates" id="dates" aria-labelledby="proof-dates-title">
      <header><span className="docket-label">{say("네 번의 만남, 하나의 에이전트", "Four encounters. One Agent.")}</span><h2 id="proof-dates-title">{say("대화와 결과를 직접 확인해보세요.", "Read the conversations and their actual outcomes.")}</h2></header>
      <div className="proof-date-choices" role="group" aria-label={say("데이트 기록 선택", "Choose a recorded date")}>
        {proof.dates.map((date, index) => <button type="button" key={date.label} aria-pressed={selected === index} onClick={() => selectDate(index)}><span>{String(index + 1).padStart(2, "0")} · {date.label}</span><strong>{date.mine.name} & {date.counterpart.name}</strong><span>{date.turns.length} {say("마디", "lines")}{date.reviewStatus === "withheld" ? say(" · 회고 보류", " · Review withheld") : date.reviewStatus === "recovered" ? say(" · 회고 재검증 완료", " · Review recovered") : say(" · 회고 확인", " · Review verified")}</span></button>)}
      </div>
      <p className="proof-date-context" aria-live="polite">{record.label} · {record.setting} · {say("한국어 원문 기준: ", "Korean original: ")}{speakingStats(original.dates[selected].turns).replies} {say("개의 리오 답변, 평균 ", "Rio replies, averaging ")}{speakingStats(original.dates[selected].turns).averageLength} {say("자. 길이는 대화 품질 점수가 아니에요.", "characters. Length is an observation, not a quality score.")}</p>
    </section>
    <div id="replay"><AgentDateWorld setting={record.setting} sceneKind={record.sceneKind} sceneSituation={record.situation} status={record.reviewStatus === "withheld" ? "failed" : "debrief_ready"} mine={record.mine} counterpart={record.counterpart} turns={record.turns} activityJournal={record.journal} key={`${language}-${selected}-${seek?.request ?? "preview"}`} initialRound={seek?.round} /></div>
    <DateActivityJournal journal={record.journal} totalLines={record.turns.length} onReplay={round => { setSeek({ round, request: Date.now() }); document.getElementById("replay")?.scrollIntoView({ behavior: "smooth" }); }} />
    <section className="proof-letter" id="review" aria-labelledby="proof-letter-title">
      <span className="docket-label">{say("만나고 돌아온 리오의 생각", "Rio's own reflection after the date")}</span>
      {record.reviewStatus === "recovered" && <p className="proof-caption">{say("처음에는 해석 오류로 보류됐던 편지예요. 같은 대화를 바탕으로 회고를 다시 작성하고 검증을 마쳤어요. 지난 대화와 피드백은 그대로이며, 이 재검토로 새 소개가 발송되지는 않습니다.", "This review was initially withheld for interpretation errors, then rewritten and verified against the same conversation. The original dialogue and feedback are unchanged. Recovery did not create a new introduction.")}</p>}
      <h2 id="proof-letter-title">{record.reviewStatus === "withheld" ? say("이 만남의 회고는 보류했어요", "This review was withheld") : record.verdict === "encourage" ? say("한 번 만나보면 좋겠어요", "I'd suggest meeting once") : record.verdict === "pass" ? say("다른 사람을 더 찾아볼게요", "I'll keep looking") : say("아직 더 알아보고 싶어요", "I'd like to know more first")}</h2>
      {record.reviewStatus === "withheld" ? <p>{say("대화를 해석한 내용이 검증을 통과하지 못해서 편지와 소개를 보류했어요. 저장된 대화는 그대로 남아 있고, 리오는 다음 사람을 찾아 만났습니다. 이 기록도 숨기거나 성공한 만남으로 고쳐 쓰지 않았어요.", "The interpretation did not pass verification, so the letter and introduction were withheld. Every saved line remains available, and Rio continued searching. This record was not hidden or rewritten as a successful match.")}</p> : <><p>{record.letter}</p>{record.nextSearchNote && <details><summary>{record.reviewStatus === "recovered" ? say("이 회고에서 남은 질문", "Questions from this recovered review") : say("다음 탐색에서 참고할 점", "What to carry into the next search")}</summary><p>{record.nextSearchNote}</p></details>}<small>{say("이것은 리오의 판단입니다. 사람의 만남 결정이나 연락처 공개를 대신하지 않아요.", "This is Rio's judgment. It is not human consent and does not open contact.")}</small></>}
    </section>
    <DateTranscript key={language + selected} turns={record.turns} mine={record.mine} counterpart={record.counterpart} coaching={{ preview: true }} />
    <footer className="date-preview-footer proof-footer"><p>{say("재이, 루, 미로, 하루, 모아는 테스트용 가상 인물입니다. 같은 테스트 계정의 실제 탐색·예약 실행·피드백 저장 경로로 얻은 네 데이트를 공개용으로 옮겼어요. 대사와 기억은 그대로 보존하고, 다시 검증한 회고에는 그 사실을 표시했습니다. 실제 사용자의 비공개 기록은 공개되지 않습니다.", "Jae, Lou, Miro, Haru and Moa are fictional test people. These dates used the actual authenticated search, scheduler and private feedback path. English is an editorial translation of the saved Korean records; source lines and outcomes are preserved. No real user's private records are published.")}</p><p>{say("시연은 저장된 기록을 재생합니다. 이 페이지에서 누르는 버튼이 새 데이트나 학습을 실행하지는 않아요.", "This page replays saved records. Its preview controls do not start a date or save new learning.")}</p><Link className="learning-loop-cta" to={isAuthenticated ? "/dashboard#private-line" : "/signup"}>{isAuthenticated ? say("내 데이트 에이전트와 이야기하기", "Talk to my Dating Agent") : say("내 데이트 에이전트 만들기", "Create my Dating Agent")}<span aria-hidden="true">→</span></Link><Link to="/how-it-works">{say("어떻게 동작하나요? ↗", "How does it work? ↗")}</Link></footer>
  </main>;
}
