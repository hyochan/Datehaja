import { describe, expect, it } from "vitest";
import { agentConnectionEmail, agentDebriefEmail } from "./emailTemplates";

const base = {
  firstName: "Mina",
  agentName: "Sol",
  counterpartAgentName: "Juno",
  verdict: "curious" as const,
  reason: "대화의 속도와 편안함이 잘 맞았어요.",
  report: {
    setting: "늦은 저녁, 조용한 레코드 바",
    agentName: "Sol",
    counterpartAgentName: "Juno",
    totalMoments: 6,
    summary: "음악과 여행 얘기에서 긴장이 풀렸고, 침묵도 편안했어요.",
    sparks: ["서로의 침묵을 재촉하지 않았어요."],
    frictions: ["주말을 보내는 속도는 조금 달랐어요."],
    moments: [
      {
        round: 1,
        speakerAgentName: "Sol",
        content: "사람이 많은 곳에서도 둘만의 리듬을 찾는 편인가요?",
      },
      {
        round: 3,
        speakerAgentName: "Juno",
        content: "말이 없어도 어색하지 않은 사람이 좋다고 했어요.",
      },
      {
        round: 6,
        speakerAgentName: "Sol",
        content: "그 침묵을 부담으로 만들지 않는다는 점이 마음에 남네요.",
      },
    ],
  },
  url: "https://datehaja.com/agent-date/test",
  conversationUrl: "https://datehaja.com/dashboard?date=test",
};

const englishReport = {
  ...base.report,
  setting: "A quiet record bar after dark",
  summary: "They relaxed into music, travel, and comfortable silence.",
  sparks: ["Neither rushed to fill the silence."],
  frictions: ["Their weekend pace may differ."],
  moments: base.report.moments.map((moment) => ({
    ...moment,
    content: "They talked about what makes silence feel comfortable.",
  })),
};

describe("agent debrief email", () => {
  it("keeps the Korean debrief entirely user-facing and localized", () => {
    const email = agentDebriefEmail({ ...base, locale: "ko-KR" });

    expect(email.subject).toContain("비공개 데이트 리포트");
    expect(email.text).toContain("Mina님");
    expect(email.text).toContain("가상 데이트");
    expect(email.text).not.toContain("Your agent is back");
    expect(email.html).toContain("나만의 비공개 리포트 보기");
    expect(email.html).toContain("에이전트 데이트 기록");
    expect(email.html).toContain("늦은 저녁, 조용한 레코드 바");
    expect(email.html).toContain("이런 대화를 나눴어요");
    expect(email.html).toContain("마음이 움직인 순간");
    expect(email.html).toContain("Sol ↔ Juno");
    expect(email.html).toContain("Sol 에이전트와 이 데이트 더 이야기하기");
    expect(email.html).toContain(base.conversationUrl);
    expect(email.text).toContain(base.conversationUrl);
    expect(email.html).not.toContain("pause matching entirely");
  });

  it("retains English for English-region locales", () => {
    const email = agentDebriefEmail({
      ...base,
      locale: "en-GB",
      reason: "The pace and emotional ease felt aligned.",
      report: englishReport,
    });

    expect(email.subject).toBe("Your agent is back — a private debrief");
    expect(email.text).toContain("Hi Mina");
    expect(email.text).not.toMatch(/[가-힣]/);
    expect(email.html).toContain("Open my private debrief");
  });

  it("localizes a mutual connection to each recipient", () => {
    const korean = agentConnectionEmail({
      locale: "ko-KR",
      firstName: "민아",
      counterpartFirstName: "Eli",
      agentReason: base.reason,
      report: base.report,
      url: base.url,
      conversationUrl: base.conversationUrl,
    });
    const english = agentConnectionEmail({
      locale: "en-US",
      firstName: "Eli",
      counterpartFirstName: "Mina",
      agentReason: "The conversation felt warm and unhurried.",
      report: englishReport,
      url: base.url,
      conversationUrl: base.conversationUrl,
    });

    expect(korean.subject).toBe("두 사람이 모두 만나고 싶다고 답했어요");
    expect(korean.html).toContain("연결 확인하기");
    expect(korean.html).toContain("데이트 분위기");
    expect(korean.html).toContain("내 에이전트의 한마디");
    expect(korean.html).toContain("Sol 에이전트와 이 만남 이야기하기");
    expect(korean.html).toContain(base.conversationUrl);
    expect(korean.text).not.toContain("Two humans said yes");
    expect(english.subject).toBe("Two humans said yes");
    expect(english.html).toContain("Agent date notes");
    expect(english.html).toContain("What they talked about");
    expect(english.text).not.toMatch(/[가-힣]/);
  });
});
