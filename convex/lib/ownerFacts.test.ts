import { describe, expect, test } from "vitest";
import { ownerFactsSupported } from "./ownerFacts";

const brief = ["I cook fried rice on weekends.", "I grew up beside a harbour in Tongyeong."];

describe("what counts as evidence for something an agent says about its owner", () => {
  test("a real quotation supports the claim", () => {
    expect(ownerFactsSupported(
      [{ claim: "I cook on weekends", source_quote: "I cook fried rice on weekends." }], brief,
    )).toBe(true);
  });

  test("a single letter is not a quotation", () => {
    // This passed before: `"I cook fried rice on weekends."`.includes("I") is
    // true, so an agent could invent a career and cite the word I for it.
    expect(ownerFactsSupported(
      [{ claim: "I am a surgeon at Seoul National University Hospital", source_quote: "I" }], brief,
    )).toBe(false);
  });

  test("a fragment from inside longer words is not a quotation", () => {
    expect(ownerFactsSupported([{ claim: "I cook", source_quote: "ook fri" }], brief)).toBe(false);
  });

  test("a quote that appears in no brief is rejected however long", () => {
    expect(ownerFactsSupported(
      [{ claim: "I sail", source_quote: "I race yachts every summer." }], brief,
    )).toBe(false);
  });

  test("citing nothing is allowed, because most lines are not biography", () => {
    expect(ownerFactsSupported([], brief)).toBe(true);
  });

  test("one bad citation spoils the turn even beside a good one", () => {
    expect(ownerFactsSupported([
      { claim: "I cook on weekends", source_quote: "I cook fried rice on weekends." },
      { claim: "I am a surgeon", source_quote: "I" },
    ], brief)).toBe(false);
  });
});
