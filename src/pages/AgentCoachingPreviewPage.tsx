import { useEffect, useState } from "react";
import { useConvexAuth } from "convex/react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { usePreviewLocale } from "../lib/previewLocale";
import { DateTranscript } from "../components/agent/DateTranscript";
import { DateActivityJournal } from "../components/agent/DateActivityJournal";
import { AgentDateWorld } from "../components/agent/AgentDateWorld";
import { AgentAvatar } from "../components/agent/AgentAvatar";
import { speakingStats, type LearningProof } from "../lib/learningProof";
import raw from "../fixtures/learningProof.json";
import "./learning-proof.css";

const proof = raw as LearningProof;
export default function AgentCoachingPreviewPage() {
  const { isAuthenticated } = useConvexAuth();
  usePreviewLocale("ko-KR");
  const [params] = useSearchParams();
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
  if (proof.dates.length < 4) return <main className="date-record-preview"><h1>실행 기록을 준비하고 있어요.</h1></main>;
  const record = proof.dates[selected];
  const before = proof.dates[0], after = proof.dates[proof.dates.length - 1];
  const firstWords = (date: LearningProof["dates"][number]) => date.turns.find(turn => turn.isMine)!;
  const selectDate = (index: number) => { setSeek(undefined); setJump(undefined); navigate({ search: `?date=${index + 1}`, hash }, { replace: true, preventScrollReset: true }); };
  const showLine = (index: number, round: number) => {
    setSeek(undefined);
    navigate({ search: `?date=${index + 1}`, hash: `#turn-${round}` }, { replace: true, preventScrollReset: true });
    setJump(current => ({ date: index, round, request: (current?.request ?? 0) + 1 }));
  };
  return <main className="date-record-preview learning-proof">
    <header className="date-preview-mast"><Link to="/">Datehaja</Link><span>가상 인물 · 실제 저장된 데이트와 피드백</span></header>
    <section className="date-preview-intro">
      <span className="docket-label">조금씩, 더 나답게</span>
      <h1>“나는 그렇게 말하지 않아.”<br />다음 만남은 달라질까요?</h1>
      <p>재이의 데이트 에이전트 리오가 네 사람을 만났어요. 첫 대화를 읽고 말투를 고치고, 상대를 보는 기준을 알려준 뒤, 새로운 세 만남까지 이어간 기록입니다.</p>
      <nav className="date-record-nav"><a href="#comparison">바뀐 말투 비교하기 ↓</a><a href="#coaching">실제로 남긴 피드백 ↓</a><a href="#dates">네 번의 데이트 살펴보기 ↓</a><a href="/demo/learning-proof.mp4?v=review-recovery">54초 시연 영상 ↗</a></nav>
    </section>

    <section className="proof-comparison" id="comparison" aria-labelledby="proof-comparison-title">
      <header><span className="docket-label">같은 리오, 다음 만남</span><h2 id="proof-comparison-title">반말에서, 내가 편한 존댓말로.</h2><p>첫 만남과 세 번의 피드백을 거친 최근 만남에서, 리오가 처음 한 말을 그대로 옮겼어요.</p></header>
      <div className="proof-comparison-grid">
        {[before, after].map((date, index) => <article key={date.label} className={index ? "is-after" : "is-before"}>
          <div className="proof-quote-heading"><AgentAvatar name={date.mine.name} avatar={date.mine.avatar} className="proof-avatar" /><div><span>{index ? "피드백을 받은 뒤" : "수정하기 전"}</span><strong>리오 → {date.counterpart.name}</strong></div></div>
          <blockquote>{firstWords(date).content}</blockquote>
          <button type="button" onClick={() => showLine(index === 0 ? 0 : proof.dates.length - 1, firstWords(date).round)}>앞뒤 대화 함께 읽기 <span aria-hidden="true">↓</span></button>
        </article>)}
      </div>
      <div className="proof-owner-note"><span>재이가 남긴 수정</span><p>“처음 만난 사람에게는 존댓말을 끝까지 유지해줘. 나는 한두 문장으로 짧게 말하고, 매번 질문으로 끝내지 않아.”</p><a href="#coaching">수정 요청과 리오의 답장 전체 보기 ↓</a></div>
      <p className="proof-caption">이미 지난 대화는 그대로 두고, 피드백 이후 새로 만난 상대와의 대화를 비교합니다. 아래에는 좋은 반응뿐 아니라 실제 판정과 아쉬운 점도 함께 남겼어요.</p>
    </section>

    <section className="proof-feedback" id="coaching" aria-labelledby="proof-feedback-title">
      <header><span className="docket-label">내 에이전트와 나눈 이야기</span><h2 id="proof-feedback-title">말투도, 사람을 보는 기준도.</h2><p>테스트 사용자가 실제로 보낸 문장과 리오가 저장한 답장입니다. 다음 수정은 앞서 배운 내용을 이어받습니다.</p></header>
      {proof.feedback.map((entry, index) => <article key={index}>
        <div className="proof-feedback-label"><span>{String(index + 1).padStart(2, "0")}</span><h3>{entry.target === "counterpart" ? "어떤 상대가 좋은지" : index === 0 ? "내 말투를 고치기" : "다음 만남 뒤, 한 번 더"}</h3><span>{proof.dates[entry.dateIndex].counterpart.name}와의 대화 후</span></div>
        <blockquote>{entry.content}</blockquote>
        <details><summary>리오의 답장과 기억 보기 <span aria-hidden="true">+</span></summary><div className="proof-saved-reply"><strong>리오의 답장</strong><p>{entry.reply}</p><strong>다음 만남에 가져간 기억</strong><p>{entry.memory}</p><button type="button" onClick={() => showLine(entry.dateIndex, entry.round)}>이 피드백을 남긴 대화 보기 ↓</button></div></details>
      </article>)}
    </section>

    <section className="proof-dates" id="dates" aria-labelledby="proof-dates-title">
      <header><span className="docket-label">네 번의 만남, 하나의 에이전트</span><h2 id="proof-dates-title">대화와 결과를 직접 확인해보세요.</h2></header>
      <div className="proof-date-choices" role="group" aria-label="데이트 기록 선택">
        {proof.dates.map((date, index) => <button type="button" key={date.label} aria-pressed={selected === index} onClick={() => selectDate(index)}><span>{String(index + 1).padStart(2, "0")} · {date.label}</span><strong>리오와 {date.counterpart.name}</strong><span>{date.turns.length}마디{date.reviewStatus === "withheld" ? " · 회고 보류" : date.reviewStatus === "recovered" ? " · 회고 재검증 완료" : " · 회고 확인"}</span></button>)}
      </div>
      <p className="proof-date-context" aria-live="polite">{record.label} · {record.setting} · 리오의 답변 {speakingStats(record.turns).replies}개, 평균 {speakingStats(record.turns).averageLength}자. 길이는 변화를 살펴보는 참고이며, 대화의 좋고 나쁨을 매긴 점수가 아니에요.</p>
    </section>
    <div id="replay"><AgentDateWorld setting={record.setting} sceneKind={record.sceneKind} sceneSituation={record.situation} status={record.reviewStatus === "withheld" ? "failed" : "debrief_ready"} mine={record.mine} counterpart={record.counterpart} turns={record.turns} activityJournal={record.journal} key={`${selected}-${seek?.request ?? "preview"}`} initialRound={seek?.round} /></div>
    <DateActivityJournal journal={record.journal} totalLines={record.turns.length} onReplay={round => { setSeek({ round, request: Date.now() }); document.getElementById("replay")?.scrollIntoView({ behavior: "smooth" }); }} />
    <section className="proof-letter" id="review" aria-labelledby="proof-letter-title">
      <span className="docket-label">만나고 돌아온 리오의 생각</span>
      {record.reviewStatus === "recovered" && <p className="proof-caption">처음에는 해석 오류로 보류됐던 편지예요. 같은 대화를 바탕으로 회고를 다시 작성하고 검증을 마쳤어요. 지난 대화와 피드백은 그대로이며, 이 재검토로 새 소개가 발송되지는 않습니다.</p>}
      <h2 id="proof-letter-title">{record.reviewStatus === "withheld" ? "이 만남의 회고는 보류했어요" : record.verdict === "encourage" ? "한 번 만나보면 좋겠어요" : record.verdict === "pass" ? "다른 사람을 더 찾아볼게요" : "아직 더 알아보고 싶어요"}</h2>
      {record.reviewStatus === "withheld" ? <p>대화를 해석한 내용이 검증을 통과하지 못해서 편지와 소개를 보류했어요. 저장된 대화는 그대로 남아 있고, 리오는 다음 사람을 찾아 만났습니다. 이 기록도 숨기거나 성공한 만남으로 고쳐 쓰지 않았어요.</p> : <><p>{record.letter}</p>{record.nextSearchNote && <details><summary>{record.reviewStatus === "recovered" ? "이 회고에서 남은 질문" : "다음 탐색에서 참고할 점"}</summary><p>{record.nextSearchNote}</p></details>}<small>이것은 리오의 판단입니다. 사람의 만남 결정이나 연락처 공개를 대신하지 않아요.</small></>}
    </section>
    <DateTranscript key={selected} turns={record.turns} mine={record.mine} counterpart={record.counterpart} coaching={{ preview: true }} />
    <footer className="date-preview-footer proof-footer"><p>재이, 루, 미로, 하루, 모아는 테스트용 가상 인물입니다. 같은 테스트 계정의 실제 탐색·예약 실행·피드백 저장 경로로 얻은 네 데이트를 공개용으로 옮겼어요. 대사와 기억은 그대로 보존하고, 다시 검증한 회고에는 그 사실을 표시했습니다. 실제 사용자의 비공개 기록은 공개되지 않습니다.</p><p>시연은 저장된 기록을 재생합니다. 이 페이지에서 누르는 버튼이 새 데이트나 학습을 실행하지는 않아요.</p><Link className="learning-loop-cta" to={isAuthenticated ? "/dashboard#private-line" : "/signup"}>{isAuthenticated ? "내 데이트 에이전트와 이야기하기" : "내 데이트 에이전트 만들기"}<span aria-hidden="true">→</span></Link><Link to="/how-it-works">어떻게 동작하나요? ↗</Link></footer>
  </main>;
}
