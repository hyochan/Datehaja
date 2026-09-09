import { useState } from "react";
import { AgentDateWorld } from "../components/agent/AgentDateWorld";
import { DateActivityJournal } from "../components/agent/DateActivityJournal";
import { DateTranscript } from "../components/agent/DateTranscript";
import { usePreviewLocale } from "../lib/previewLocale";
import type { DateActivity } from "@convex/lib/dateActivity";
import type { SceneKind } from "@convex/lib/dateStory";
import type { AvatarConfig } from "../components/agent/AgentAvatar";
import record from "../fixtures/dateRecordPreview.json";

/** Explicitly fictional, curated QA record. Never reads or exposes a real date. */
export default function DateRecordPreviewPage() {
  usePreviewLocale("ko-KR");
  const [seek, setSeek] = useState<{ round: number; request: number }>();
  const mine = { ...record.mine, avatar: record.mine.avatar as Partial<AvatarConfig> };
  const counterpart = { ...record.counterpart, avatar: record.counterpart.avatar as Partial<AvatarConfig> };
  return <main className="date-record-preview">
    <header className="date-preview-mast"><a href="/">Datehaja</a><span>가상 인물의 데이트 기록 · 테스트 미리보기</span></header>
    <section className="date-preview-intro">
      <span className="docket-label">리오 → 재이에게</span>
      <h1>{record.headline}</h1>
      <p>메일에서 읽은 그 만남을, 처음부터 끝까지.</p>
      <a className="date-preview-coaching-link" href="/preview/agent-coaching">말투 피드백을 반영한 새 대화 보기 →</a>
      <nav className="date-record-nav"><a href="#activity">둘이 보낸 시간 ↓</a><a href="#conversation">전체 대화 {record.turns.length}마디 ↓</a><a href="#letter">리오의 편지 ↓</a></nav>
    </section>
    <div id="replay">
      <AgentDateWorld setting={record.setting} sceneKind={record.sceneKind as SceneKind} sceneSituation={record.situation}
        status="debrief_ready" mine={mine} counterpart={counterpart} turns={record.turns} activityJournal={record.journal as DateActivity} key={seek?.request ?? "preview"} initialRound={seek?.round} />
    </div>
    <DateActivityJournal journal={record.journal as DateActivity} totalLines={record.turns.length}
      onReplay={round => { setSeek({ round, request: Date.now() }); document.getElementById("replay")?.scrollIntoView({ behavior: "smooth" }); }} />
    <div className="date-preview-columns">
      <DateTranscript turns={record.turns} mine={mine} counterpart={counterpart} coaching={{ preview: true }} />
      <aside id="letter" className="date-preview-letter">
        <div className="docket-label">리오가 돌아와서 쓴 편지</div>
        <h2>{record.headline}</h2>
        {record.letter.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
        <span>— 리오</span><h3>{record.question}</h3>
        <div className="date-preview-note">이 기록의 재이·서아와 에이전트 리오·루는 모두 테스트용 가상 인물입니다. 편지는 사람이 문장을 다듬은 뒤 대화 근거 검증을 거쳤습니다. 실제 사용자의 만남이나 연락처는 포함하지 않습니다.</div>
      </aside>
    </div>
    <footer className="date-preview-footer">이 만남에 저장된 대화는 위 {record.turns.length}마디가 전부예요. 카페에서 커피를 마신 장면은 기록되지 않았고, 다음 장면으로 제안만 나눴어요.</footer>
  </main>;
}
