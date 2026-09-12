import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import { studyResponse } from "../lib/userStudy";
import "./submission.css";

export default function StudyFeedbackPage() {
  const { locale } = useI18n();
  const [language, setLanguage] = useState<"ko" | "en">(locale.startsWith("ko") ? "ko" : "en");
  const [error, setError] = useState("");
  const [downloaded, setDownloaded] = useState(false);
  const say = (ko: string, en: string) => language === "ko" ? ko : en;
  const select = (name: string, question: string, options: Array<[string, string]>) => <label className="study-question" htmlFor={name}><span>{question}</span><select id={name} name={name} required defaultValue=""><option value="" disabled>{say("선택해주세요", "Choose an answer")}</option>{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>;
  const dateOptions: Array<[string, string]> = [["completed", say("완료된 대화를 읽음", "Read a completed conversation")], ["waiting", say("아직 기다리는 중", "Still waiting")], ["failed", say("오류로 완료하지 못함", "Could not complete because of an error")], ["not_tried", say("시도하지 않음", "Did not try")]];
  const ratings: Array<[string, string]> = [["not_rated", say("평가하지 않음 / 대화를 아직 못 읽음", "Not rated / no completed conversation")], ...[1, 2, 3, 4, 5].map(n => [String(n), String(n)] as [string, string])];
  function download(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    try {
      const response = studyResponse(new FormData(event.currentTarget), language);
      const url = URL.createObjectURL(new Blob([JSON.stringify(response, null, 2) + "\n"], { type: "application/json" }));
      const link = document.createElement("a"); link.href = url; link.download = `datehaja-study-${response.participantCode}.json`; link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000); setDownloaded(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to download."); }
  }
  return <main className="submission-page">
    <header className="submission-mast"><Link to="/">Datehaja</Link><div role="group" aria-label="Feedback language"><button aria-pressed={language === "ko"} onClick={() => setLanguage("ko")}>한국어</button><button aria-pressed={language === "en"} onClick={() => setLanguage("en")}>English</button></div></header>
    <span className="docket-label">{say("체험을 마친 뒤", "After your session")}</span>
    <h1>{say("직접 써보니 어땠나요?", "How was it to use?")}</h1>
    <p>{say("잘 안 됐거나 다시 쓰고 싶지 않아도 괜찮아요. 실제로 해본 만큼만 답해주세요. 아직 다음 데이트를 못 봤다면 기다리는 중을 선택하세요.", "It's okay if something failed or you would not use it again. Answer only for what you actually tried. If the next date has not happened, choose Still waiting.")}</p>
    <p className="submission-note">{say("응답은 서버로 전송되지 않습니다. 이름·이메일·대화·개인 기억을 담지 않는 파일을 내려받아 초대한 사람에게 직접 전달할 수 있어요. 참여와 전달은 선택입니다.", "Answers are not sent to a server. Download a file without your name, email, conversations or private memory, then return it to the person who invited you. Participation and sharing are optional.")}</p>
    <form onSubmit={download}>
      <label className="study-question" htmlFor="participantCode"><span>{say("진행자가 준 참가 코드", "Participant code from your host")}</span><input id="participantCode" name="participantCode" placeholder="P01" maxLength={3} pattern="[Pp](0[1-9]|[1-9][0-9])" autoComplete="off" required /></label>
      {select("onboarding", say("에이전트를 만드는 과정은 어땠나요?", "How did creating your Agent go?"), [["alone", say("도움 없이 완료", "Completed without help")], ["help", say("도움을 받아 완료", "Completed with help")], ["stopped", say("중간에 멈춤", "Stopped partway")], ["not_tried", say("시도하지 않음", "Did not try")]])}
      {select("firstDate", say("첫 번째 데이트는 어디까지 봤나요?", "How far did you get with the first date?"), dateOptions)}
      {select("before", say("첫 대화에서 에이전트는 얼마나 나 같았나요? (1 전혀 아님 — 5 매우 그럼)", "How much did the Agent feel like you on the first date? (1 Not at all — 5 Very much)"), ratings)}
      {select("feedback", say("내 생각이나 정정을 남겼나요?", "Did you leave a reaction or correction?"), [["saved", say("저장하고 답장을 받음", "Saved it and received a reply")], ["failed", say("시도했지만 완료되지 않음", "Tried, but it did not complete")], ["not_tried", say("시도하지 않음", "Did not try")]])}
      {select("secondDate", say("피드백 이후 새로운 상대와의 데이트를 봤나요?", "Did you see a new date with a different partner after feedback?"), dateOptions)}
      {select("after", say("그 새로운 대화에서 얼마나 나 같았나요? (1 전혀 아님 — 5 매우 그럼)", "How much did the Agent feel like you in that new conversation? (1 Not at all — 5 Very much)"), ratings)}
      {select("contactRule", say("내가 이해한 연락처 공개 시점은?", "When do you understand contact details become available?"), [["agents", say("에이전트들이 추천하면", "When the Agents recommend it")], ["one_human", say("사람 한 명이 동의하면", "When one person agrees")], ["both_humans", say("두 사람이 각각 동의하면", "When both people independently agree")], ["unsure", say("잘 모르겠음", "I'm not sure")]])}
      {select("returnIntent", say("혼자서 다시 사용할 생각이 있나요?", "Would you choose to use it again on your own?"), [["yes", say("있음", "Yes")], ["maybe", say("잘 모르겠음", "Maybe")], ["no", say("없음", "No")]])}
      {select("blocker", say("가장 불편했거나 막힌 부분은?", "What was the biggest point of friction?"), [["none", say("없음", "None")], ["signup", say("로그인", "Signing in")], ["setup", say("에이전트 만들기", "Creating the Agent")], ["waiting", say("대기", "Waiting")], ["dialogue", say("대화 품질", "Dialogue quality")], ["feedback", say("피드백", "Feedback")], ["privacy", say("개인정보 이해", "Understanding privacy")], ["other", say("그 외", "Something else")]])}
      {error && <p role="alert">{say("응답을 확인해주세요. ", "")}{error}</p>}
      <button className="submission-cta" type="submit">{say("응답 파일 내려받기", "Download my answers")}</button>
      {downloaded && <p role="status">{say("파일을 내려받았습니다. 원한다면 초대한 사람에게 직접 전달해주세요. 이 페이지에서는 전송하지 않았어요.", "Your file has downloaded. If you wish, return it to your host. This page has not sent it anywhere.")}</p>}
    </form>
  </main>;
}
