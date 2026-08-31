import { describe, expect, it } from "vitest";
import { planAgentDatePause, planDebriefPause } from "./agentDatePacing";

function sequence(...values: number[]) {
  let index = 0;
  return () => values[index++] ?? values.at(-1) ?? 0;
}

describe("agent date pacing", () => {
  it("compresses the full rhythm for labelled demo dates", () => {
    const pause = planAgentDatePause({
      round: 4,
      previousMessageLength: 420,
      voice: "quiet",
      mode: "demo",
      random: sequence(0.7, 0.9),
    });
    expect(pause.delayMs).toBeGreaterThanOrEqual(1_400);
    expect(pause.delayMs).toBeLessThanOrEqual(8_500);
    expect(pause.activity).toBe("thinking");
  });

  it("lets message length, voice, and conversational arc shape natural time", () => {
    const direct = planAgentDatePause({
      round: 2,
      previousMessageLength: 40,
      voice: "direct",
      mode: "natural",
      random: sequence(0.55, 0.8),
    });
    const quiet = planAgentDatePause({
      round: 5,
      previousMessageLength: 500,
      voice: "quiet",
      mode: "natural",
      random: sequence(0.55, 0.8),
    });
    expect(quiet.delayMs).toBeGreaterThan(direct.delayMs * 2);
  });

  it("occasionally creates a real break instead of a uniform timer", () => {
    const pause = planAgentDatePause({
      round: 3,
      previousMessageLength: 120,
      voice: "warm",
      mode: "natural",
      random: sequence(0.5, 0.01),
    });
    expect(pause.activity).toBe("wandering");
    expect(pause.delayMs).toBeGreaterThan(2 * 60_000);
  });

  it("gives private verdict writing its own final pause", () => {
    expect(planDebriefPause("demo", () => 0.5)).toEqual({
      delayMs: 4_600,
      activity: "wrapping_up",
    });
    expect(planDebriefPause("natural", () => 0.9).delayMs).toBeGreaterThan(
      60_000,
    );
  });
});
