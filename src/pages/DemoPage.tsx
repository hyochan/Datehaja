import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import { LocaleSwitcher } from "../components/layout/LocaleSwitcher";
import "./submission.css";

export default function DemoPage() {
  const { locale } = useI18n();
  const say = (ko: string, en: string) => locale.startsWith("ko") ? ko : en;
  return <main className="submission-page">
    <header className="submission-mast"><Link to="/">Datehaja</Link><LocaleSwitcher compact /><Link to="/signup">{say("내 에이전트 만들기", "Create my Agent")} ↗</Link></header>
    <span className="docket-label">{say("제품 시연 · 영어 자막", "Product walkthrough · English captions")}</span>
    <h1>{say("먼저 만나고, 돌아와서 배우는 나의 에이전트.", "An Agent that dates, comes home, and learns from you.")}</h1>
    <p>{say("실제 제품 화면에서 가상 인물의 저장된 데이트와 피드백을 살펴봅니다. 영상의 대화는 녹화 전에 생성됐고, 재생과 이동 시간은 편집됐습니다.", "A walkthrough of the actual product, replaying saved dates and feedback from fictional test people. Conversations were generated before recording; playback and navigation are edited for time.")}</p>
    <video className="submission-video" controls playsInline preload="metadata" poster="/demo/submission-poster.jpg" aria-label="Datehaja product demonstration with English captions">
      <source src="/demo/Datehaja-demo.mp4" type="video/mp4" />
      <track kind="captions" src="/demo/Datehaja-demo.vtt" srcLang="en" label="English" />
      {say("아래 링크에서 영상을 내려받을 수 있어요.", "Download the video using the link below.")}
    </video>
    <nav className="submission-links"><a href="/demo/Datehaja-demo.mp4" download>{say("영상 내려받기", "Download video")}</a><a href="/demo/Datehaja-demo.vtt" download>{say("영어 자막", "English captions")}</a><a href="/demo/transcript.txt">{say("시연 대본 읽기", "Read the walkthrough transcript")}</a></nav>
    <div className="submission-cards">
      <Link to="/watch"><span>01</span><h2>{say("실제 생성된 데이트", "A generated date")}</h2><p>{say("대화, 활동 기록, 각자의 솔직한 소감을 직접 살펴보세요.", "Explore the dialogue, source-linked activity journal and independent reflections.")}</p></Link>
      <Link to="/preview/agent-coaching?lang=en"><span>02</span><h2>{say("피드백 이후 달라진 만남", "What feedback changed")}</h2><p>{say("같은 에이전트의 네 만남과 누적 기억. 한국어 원문과 영어 번역을 함께 봅니다.", "Four encounters, one Agent, and retained guidance. Read the English translation alongside the Korean source.")}</p></Link>
    </div>
    <p className="submission-note">{say("가상 에이전트의 추천은 사람의 동의가 아닙니다. 두 사람이 각각 동의해야 연락처가 열립니다. 실제 사용자 만족도 검증은 별도로 진행합니다.", "An Agent recommendation is not human consent. Only two independent human yeses open contact. These fictional rehearsals do not establish real-user satisfaction.")}</p>
  </main>;
}
