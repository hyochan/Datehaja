import { describe, expect, it } from "vitest";
import { dateScene, sceneKindFor, sceneKinds, selectExchange, selectLetterExchanges, storySeed, needsClarification } from "./dateStory";

describe("evidence from a date", () => {
  it("clarifies a specific uncertainty once, without prolonging a pass or manufacturing interest", () => {
    const uncertain = { verdict: "curious", followup_question: "Would you tell me you wanted to leave?" };
    expect(needsClarification(6, uncertain, { verdict: "encourage" })).toBe(true);
    expect(needsClarification(6, uncertain, { verdict: "pass" })).toBe(false);
    expect(needsClarification(6, { verdict: "pass" }, uncertain)).toBe(false);
    expect(needsClarification(6, { verdict: "curious" }, { verdict: "curious" })).toBe(false);
    expect(needsClarification(6, { verdict: "encourage" }, { verdict: "encourage" })).toBe(false);
    expect(needsClarification(10, uncertain, uncertain)).toBe(false);
    expect(needsClarification(12, uncertain, uncertain)).toBe(true);
    expect(needsClarification(16, uncertain, uncertain)).toBe(false);
  });
  const turns = [1, 2, 3, 4, 5, 6].map((round) => ({ round, content: `Saved line ${round}` }));
  it("keeps the prompt and its actual response together instead of disconnected highlights", () => {
    expect(selectExchange(turns, 4)).toEqual(turns.slice(2, 4));
    expect(selectExchange(turns, 6)).toEqual(turns.slice(4, 6));
    expect(selectExchange(turns, 999)).toEqual(turns.slice(2, 4));
    expect(selectExchange([], 2)).toEqual([]);
    expect(selectLetterExchanges(turns, 5).map(t => t.round)).toEqual([1, 2, 4, 5]);
    expect(selectLetterExchanges(turns, 2)).toEqual(turns.slice(0, 2));
  });
  it("uses a stable situation across durable turns but offers different situations across dates", () => {
    const seed = storySeed("date-1");
    expect(dateScene("cinema", seed, "ko-KR")).toEqual(dateScene("cinema", seed, "ko-KR"));
    expect(new Set([0, 1, 2].map((n) => dateScene("cinema", n).situation)).size).toBe(3);
    const cinemaDates = Array.from({ length: 60 }, (_, n) => `date-${n}`).filter(id => storySeed(id) % 3 === 0);
    expect(new Set(cinemaDates.map(id => dateScene("cinema", storySeed(`${id}:situation`)).situation)).size).toBe(3);
  });
  it("names each world in each supported language and resolves Korean interests", () => {
    for (const kind of sceneKinds) {
      expect(dateScene(kind, 0, "ko-KR").title).toMatch(/[가-힣]/);
      expect(dateScene(kind, 0, "en-US").title).not.toMatch(/[가-힣]/);
      for (const locale of ["ja-JP", "de-DE", "fr-FR", "nl-NL", "sv-SE"]) expect(dateScene(kind, 0, locale).title).not.toBe(dateScene(kind, 0, "en-US").title);
    }
    expect(sceneKindFor("영화")).toBe("cinema");
    expect(sceneKindFor("책")).toBe("bookshop");
    expect(sceneKindFor("Reading")).toBe("bookshop");
  });
});
