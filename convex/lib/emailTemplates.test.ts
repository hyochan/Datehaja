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
    ownerPalette: "sunset",
    counterpartPalette: "sky",
    ownerSpriteUrl: "https://datehaja.com/agents/sprite-sunset-v1.png",
    counterpartSpriteUrl: "https://datehaja.com/agents/sprite-sky-v1.png",
    worldSourceTitle: "서울 레코드 바 다시 유행",
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
  worldSourceTitle: "Seoul's record bars are back",
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

    // The subject is the Agent's own headline now, not a system notice.
    expect(email.subject).toBe("Sol: 한 번 더 알아보고 싶어요");
    // The Agent speaks first, in its own voice, in the reader's language.
    expect(email.text).toContain("Mina, 나 왔어. Juno 만나고 돌아왔어.");
    expect(email.text).toContain("그날의 데이트 이야기");
    expect(email.text).not.toContain("Your agent is back");
    expect(email.html).toContain("나만의 비공개 리포트 보기");
    expect(email.html).toContain("늦은 저녁, 조용한 레코드 바");
    expect(email.html).toContain("마음이 움직인 순간");
    expect(email.html).toContain("Sol 에이전트와 이 데이트 더 이야기하기");
    expect(email.html).toContain(base.conversationUrl);
    expect(email.text).toContain(base.conversationUrl);
    expect(email.html).not.toContain("pause matching entirely");
  });

  it("leads with the agent's letter — its verdict and full reason", () => {
    const email = agentDebriefEmail({ ...base, locale: "ko-KR" });

    expect(email.html).toContain("내 에이전트가 전하는 말");
    expect(email.html).toContain("조금 더 궁금해요");
    expect(email.html).toContain(base.reason);
    // The agent speaks with its own face: the hosted sprite renders in the
    // letter and next to each spoken moment.
    expect(email.html).toContain(
      "https://datehaja.com/agents/sprite-sunset-v1.png",
    );
    expect(email.html).toContain(
      "https://datehaja.com/agents/sprite-sky-v1.png",
    );
    // The letter renders before the story of the date.
    expect(email.html.indexOf("내 에이전트가 전하는 말")).toBeLessThan(
      email.html.indexOf("그날의 데이트 이야기"),
    );
    expect(email.text.indexOf("내 에이전트가 전하는 말")).toBeLessThan(
      email.text.indexOf("그날의 데이트 이야기"),
    );
  });

  it("tells the date as a story: scene, stages, and both agents", () => {
    const email = agentDebriefEmail({ ...base, locale: "ko-KR" });

    expect(email.html).toContain("그날의 데이트 이야기");
    expect(email.html).toContain("처음 마주한 순간");
    expect(email.html).toContain("헤어지기 전 마지막 말");
    expect(email.html).toContain("이 장면의 영감");
    // Both agents appear in the pair line, in order, each with their own face.
    expect(email.html).toMatch(
      /sprite-sunset-v1\.png[\s\S]*Sol[\s\S]*↔[\s\S]*sprite-sky-v1\.png[\s\S]*Juno/,
    );
    expect(email.html).toContain("이런 대화가 오갔어요");
    // A pass note only appears for a pass verdict.
    expect(email.html).not.toContain("다음에는 이런 사람을 찾아볼게요");
  });

  it("states the world's source once, not twice", () => {
    const titled = agentDebriefEmail({
      ...base,
      locale: "ko-KR",
      report: {
        ...base.report,
        // What the world builder actually writes: the scene names its source.
        setting: "“서울 레코드 바 다시 유행”에서 영감을 받은 늦은 밤의 비밀 살롱",
        worldSourceTitle: "서울 레코드 바 다시 유행",
      },
    });
    expect(titled.html).not.toContain("이 장면의 영감");
    expect(titled.text).not.toContain("이 장면의 영감");
    // A scene that does not quote its source still credits it.
    expect(agentDebriefEmail({ ...base, locale: "ko-KR" }).html).toContain(
      "이 장면의 영감",
    );
  });

  it("joins a scene count the way each language writes numbers", () => {
    expect(agentDebriefEmail({ ...base, locale: "ko-KR" }).html).toContain(
      "6개의 장면",
    );
    expect(
      agentDebriefEmail({ ...base, locale: "en-GB", report: englishReport })
        .html,
    ).toContain("6 moments");
  });

  it("shows what the agent will look for next after a pass", () => {
    const email = agentDebriefEmail({
      ...base,
      locale: "ko-KR",
      verdict: "pass",
      nextSearchNote: "침묵을 편안해하는 사람을 먼저 찾아볼게요.",
    });
    expect(email.html).toContain("이번엔 보내줄게요");
    expect(email.html).toContain("다음에는 이런 사람을 찾아볼게요");
    expect(email.html).toContain("침묵을 편안해하는 사람을 먼저 찾아볼게요.");
    expect(email.text).toContain("다음에는 이런 사람을 찾아볼게요");
  });

  it("retains English for English-region locales", () => {
    const email = agentDebriefEmail({
      ...base,
      locale: "en-GB",
      reason: "The pace and emotional ease felt aligned.",
      report: englishReport,
    });

    expect(email.subject).toBe("Sol came back curious");
    expect(email.text).toContain("Hi Mina");
    expect(email.text).not.toMatch(/[가-힣]/);
    expect(email.html).toContain("Open my private debrief");
    expect(email.html).toContain("A note from your Agent");
    expect(email.html).toContain("Still curious");
    expect(email.html).toContain("The date, as it happened");
  });

  it("never cuts a moment mid-sentence", () => {
    const longSentence =
      "They talked about the films that shaped them and why quiet endings stay longer than loud ones. " +
      "Then they compared the strange comfort of a familiar cafe at closing time, the way the music drops a little, " +
      "the chairs go up one by one, and neither of them hurried to leave before the lights came on.";
    const email = agentDebriefEmail({
      ...base,
      locale: "en-GB",
      report: {
        ...englishReport,
        moments: [
          { round: 1, speakerAgentName: "Sol", content: longSentence },
        ],
      },
    });
    // The trimmed quote ends at a sentence boundary, not with a dangling cut.
    expect(email.html).toContain(
      "why quiet endings stay longer than loud ones.",
    );
    expect(email.html).not.toContain("and neither of them hurried");
  });
});

describe("agent connection email", () => {
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
    expect(korean.html).toContain("그날의 공기");
    expect(korean.html).toContain("내 에이전트가 전하는 말");
    expect(korean.html).toContain("Sol 에이전트와 이 만남 이야기하기");
    expect(korean.html).toContain(base.conversationUrl);
    expect(korean.text).not.toContain("Two humans said yes");
    expect(english.subject).toBe("Two humans said yes");
    expect(english.html).toContain("The date, as it happened");
    expect(english.html).toContain("What they said");
    expect(english.text).not.toMatch(/[가-힣]/);
  });
});

describe("the debrief as a letter", () => {
  it("speaks one language at a time", () => {
    const english = agentDebriefEmail({ ...base, locale: "en-US", reason: "The pace felt right.", report: englishReport });
    expect(english.html).not.toMatch(/[가-힣]/);
    expect(english.text).not.toMatch(/[가-힣]/);
    expect(english.subject).not.toMatch(/[가-힣]/);

    const korean = agentDebriefEmail({ ...base, locale: "ko-KR" });
    for (const label of ["Primary reason", "What they said", "The atmosphere", "A note from your Agent", "moments"]) {
      expect(korean.html).not.toContain(label);
    }
  });

  it("puts the Agent's own headline in the subject", () => {
    const email = agentDebriefEmail({ ...base, locale: "en-US", report: englishReport });
    expect(email.subject).toBe("Sol came back curious");
    expect(agentDebriefEmail({ ...base, locale: "ko-KR" }).subject).toBe(
      "Sol: 한 번 더 알아보고 싶어요",
    );
  });

  it("is signed by the Agent and opens with both of them in the world", () => {
    const email = agentDebriefEmail({ ...base, locale: "en-US", report: englishReport });
    expect(email.html).toContain("&mdash; Sol");
    expect(email.text).toContain("— Sol");
    // The band precedes the headline and carries both faces and the scene.
    const band = email.html.indexOf("sprite-sunset-v1.png");
    expect(band).toBeGreaterThan(-1);
    expect(band).toBeLessThan(email.html.indexOf("Sol came back curious"));
    expect(email.html.indexOf("sprite-sky-v1.png")).toBeLessThan(email.html.indexOf("Sol came back curious"));
    expect(email.html).toContain("A quiet record bar after dark");
  });

  it("asks to talk it over right under the letter, before the report", () => {
    const email = agentDebriefEmail({ ...base, locale: "en-US", report: englishReport });
    const letter = email.html.indexOf("&mdash; Sol");
    const talk = email.html.indexOf("Talk this date over with Sol");
    const report = email.html.indexOf("The date, as it happened");
    expect(letter).toBeLessThan(talk);
    expect(talk).toBeLessThan(report);
  });
});
