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
    ownerSpriteUrl: "https://datehaja.com/agents/v3/male-sunset-gentle.png",
    counterpartSpriteUrl: "https://datehaja.com/agents/v3/female-sky-gentle.png",
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

describe("a short, grounded letter", () => {
  it("opens with the owner's letter, then shows its saved exchange without reprinting a summary", () => {
    const email = agentDebriefEmail({ ...base, locale: "ko-KR" });
    expect(email.html).toContain(base.reason);
    expect(email.html).toContain(base.report.moments[0].content);
    expect(email.html).toContain(base.report.moments[1].content);
    expect(email.html).toContain(base.report.moments[2].content);
    expect(email.html).not.toContain(base.report.summary);
    expect(email.html).not.toContain(base.report.sparks[0]);
    expect(email.html).not.toContain(base.report.frictions[0]);
    expect(email.html.indexOf(base.reason)).toBeLessThan(email.html.indexOf(base.report.moments[0].content));
    expect(email.html).toContain("&mdash; Sol");
    expect(email.text).toContain("— Sol");
  });

  it("puts the actual moment in the subject and asks for interpretation", () => {
    const reflection = { headline: "끝까지 남아 있던 두 자리", anchorRound: 4, question: "기다려준 그 답이 너에게도 편하게 느껴져?" };
    const email = agentDebriefEmail({ ...base, locale: "ko-KR", report: { ...base.report, reflection } });
    expect(email.subject).toBe(`Sol · ${reflection.headline}`);
    expect(email.html).toContain(reflection.question);
    expect(email.text).toContain(reflection.question);
    expect(email.html).toContain(base.conversationUrl);
    expect(email.html).toContain(base.url);
    expect(email.html).toContain("대화 다시 보기");
    expect(email.html).toContain("나 대신 동의할 수는 없어요");
  });

  it("keeps a distinct setting in legacy subjects too", () => {
    const first = agentDebriefEmail({ ...base, locale: "en-US", report: englishReport });
    const second = agentDebriefEmail({ ...base, locale: "en-US", report: { ...englishReport, setting: "The last showing" } });
    expect(first.subject).not.toBe(second.subject);
  });

  it("links to its own activity record, not an unrelated cultural article", () => {
    const email = agentDebriefEmail({ ...base, locale: "ko-KR", report: { ...base.report, sceneImageUrl: "https://datehaja.com/scenes/cafe.png", worldSourceUrl: "https://example.com/culture" } });
    expect(email.html).toContain('<img src="https://datehaja.com/scenes/cafe.png"');
    expect(email.html).not.toContain("서울 레코드 바 다시 유행");
    expect(email.html).not.toContain('href="https://example.com/culture"');
    expect(email.html).toContain('href="https://datehaja.com/agent-date/test#activity"');
    expect(email.html).toContain(base.report.ownerSpriteUrl);
    expect(email.html).toContain(base.report.counterpartSpriteUrl);
    expect(email.html).toContain("6 마디의 대화");
    expect(email.html).not.toContain("6개의 장면");
  });

  it("labels fictional previews and links to delivery settings", () => {
    const email = agentDebriefEmail({ ...base, locale: "ko-KR", report: { ...base.report, isDemo: true } });
    expect(email.html).toContain("가상의 데모 상대");
    expect(email.html).toContain('href="https://datehaja.com/settings"');
  });

  it("preserves the verified paragraphs and omits local date actions in an explicit preview", () => {
    const paragraphs = ["엽서에 써준 그 농담이 계속 생각나.", "너는 이런 장난 어때?"];
    const previewNote = "Hyo님께 보내는 테스트 · 가상 인물 서아의 편지";
    const email = agentDebriefEmail({ ...base, locale: "ko-KR", reason: paragraphs.join("\n\n"), previewNote });
    expect(email.text).toContain(paragraphs.join("\n\n"));
    expect(email.html).toContain(`${paragraphs[0]}</p><p`);
    expect(email.html).toContain(previewNote);
    expect(email.html).not.toContain(base.conversationUrl);
    expect(email.html).not.toContain(base.url);
    expect(email.text).not.toContain(base.url);
    expect(email.text).not.toContain(base.conversationUrl);
  });

  it("keeps Korean and English mail in the recipient's language", () => {
    const english = agentDebriefEmail({ ...base, locale: "en-GB", reason: "I wanted to stay through the credits. Juno waited instead of choosing for me.", report: englishReport });
    expect(english.html).not.toMatch(/[가-힣]/);
    expect(english.text).not.toMatch(/[가-힣]/);
    const korean = agentDebriefEmail({ ...base, locale: "ko-KR" });
    for (const label of ["Primary reason", "What they said", "The atmosphere", "A note from your Agent", "moments"]) expect(korean.html).not.toContain(label);
  });

  it("does not treat generated titles, questions or dialogue as HTML", () => {
    const attack = '<img src=x onerror="alert(1)">';
    const email = agentDebriefEmail({ ...base, reason: attack, report: { ...base.report, reflection: { headline: attack, question: attack, anchorRound: 2 }, moments: [{ round: 2, speakerAgentName: attack, content: attack }], worldSourceUrl: "javascript:alert(1)" } });
    expect(email.html).not.toContain(attack);
    expect(email.html).not.toContain('href="javascript:');
    expect(email.html).toContain("&lt;img");
  });

  it("keeps a pass honest and retains its future search lesson", () => {
    const email = agentDebriefEmail({ ...base, locale: "ko-KR", verdict: "pass", nextSearchNote: "다음에는 약속을 구체적으로 답하는지 볼게." });
    expect(email.html).toContain("이번엔 보내줄게요");
    expect(email.text).toContain("다음에는 약속을 구체적으로 답하는지 볼게.");
  });
});

describe("a connection notice", () => {
  it("announces the human decision without sending the whole debrief again", () => {
    const email = agentConnectionEmail({ locale: "ko-KR", firstName: "민아", counterpartFirstName: "Eli", agentReason: base.reason, report: base.report, url: base.url, conversationUrl: base.conversationUrl });
    expect(email.subject).toBe("두 사람이 모두 만나고 싶다고 답했어요");
    expect(email.html).toContain("연결 확인하기");
    expect(email.html).toContain(base.conversationUrl);
    expect(email.html).not.toContain(base.report.summary);
    expect(email.html).not.toContain(base.report.moments[0].content);
    expect(email.text).not.toContain("Two humans said yes");
  });
});

describe("activity record links", () => {
  const journal = { overview: "둘은 영화 결말을 이야기하고 카페에 가자고 제안했어요.", events: [
    { kind: "proposal" as const, title: "카페에서 이어갈 이야기", detail: "카페에는 아직 가지 않았어요.", sceneKind: "cafe" as const, rounds: [4, 5] },
  ] };
  it("shows a proposed activity with its evidence link and a usable preview CTA", () => {
    const previewUrl = "https://adorable-boar-359.convex.site/preview/date-letter";
    const email = agentDebriefEmail({ ...base, locale: "ko-KR", previewNote: "가상 인물의 테스트 편지", previewUrl, report: { ...base.report, activityJournal: journal } });
    expect(email.html).toContain("제안한 일 · 아직 진행 전");
    expect(email.html).toContain(journal.events[0].detail);
    expect(email.html).toContain(`href="${previewUrl}#turn-4"`);
    expect(email.html).toContain(`href="${previewUrl}"`);
    expect(email.text).toContain(previewUrl);
    expect(email.html).not.toContain(base.conversationUrl);
  });
  it("does not send a loopback or unsafe preview link", () => {
    for (const previewUrl of ["http://127.0.0.1:4174/preview/date-letter", "javascript:alert(1)"]) {
      const email = agentDebriefEmail({ ...base, previewNote: "Fictional preview", previewUrl, report: { ...base.report, activityJournal: journal } });
      expect(email.html).not.toContain(`href="${previewUrl}`);
      expect(email.text).not.toContain(previewUrl);
    }
  });
});
