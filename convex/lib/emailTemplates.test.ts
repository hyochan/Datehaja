import { describe, expect, it } from "vitest";
import { agentDebriefEmail } from "./emailTemplates";

const base = {
  firstName: "Mina",
  agentName: "Sol",
  counterpartAgentName: "Juno",
  verdict: "curious" as const,
  reason: "대화의 속도와 편안함이 잘 맞았어요.",
  url: "https://datehaja.com/agent-date/test",
};

describe("agent debrief email", () => {
  it("keeps the Korean debrief entirely user-facing and localized", () => {
    const email = agentDebriefEmail({ ...base, locale: "ko-KR" });

    expect(email.subject).toContain("비공개 데이트 리포트");
    expect(email.text).toContain("Mina님");
    expect(email.text).toContain("가상 데이트");
    expect(email.text).not.toContain("Your agent is back");
    expect(email.html).toContain("나만의 비공개 리포트 보기");
    expect(email.html).not.toContain("pause matching entirely");
  });

  it("retains English for English-region locales", () => {
    const email = agentDebriefEmail({ ...base, locale: "en-GB" });

    expect(email.subject).toBe("Your agent is back — a private debrief");
    expect(email.text).toContain("Hi Mina");
    expect(email.html).toContain("Open my private debrief");
  });
});
