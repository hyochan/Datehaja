export type AgentDatePaceMode = "demo" | "natural";

export type AgentDateActivity =
  | "arriving"
  | "reading"
  | "thinking"
  | "wandering"
  | "wrapping_up";

type AgentVoice = "warm" | "playful" | "direct" | "quiet";

type PaceInput = {
  round: number;
  previousMessageLength: number;
  voice: AgentVoice;
  mode: AgentDatePaceMode;
  /** Injected so the pacing model stays deterministic in tests. */
  random: () => number;
};

export type AgentDatePause = {
  delayMs: number;
  activity: AgentDateActivity;
};

const SECOND = 1_000;
const MINUTE = 60 * SECOND;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Produces human-shaped pauses instead of choosing from one obvious range.
 * Most replies are fairly quick, deeper moments take longer, and a small
 * number include a genuine break. Demo dates preserve the rhythm at a
 * compressed scale so a judge can still see the complete loop.
 */
export function planAgentDatePause(input: PaceInput): AgentDatePause {
  const round = clamp(Math.round(input.round), 1, 6);
  const thought = clamp(input.random(), 0, 0.999_999);
  const interruption = clamp(input.random(), 0, 0.999_999);
  const previousLength = Math.max(0, input.previousMessageLength);

  if (input.mode === "demo") {
    const arc = [0.72, 0.9, 1.08, 0.82, 1.18, 0.76][round - 1];
    const delayMs = Math.round(
      clamp((1_800 + thought ** 1.7 * 5_400) * arc, 1_400, 8_500),
    );
    return {
      delayMs,
      activity:
        round === 1
          ? "arriving"
          : interruption < 0.28
            ? "reading"
            : "thinking",
    };
  }

  // An occasional interruption creates a long tail that a 30–90 second
  // uniform timer cannot: the Agent may browse the room or briefly step away.
  if (round > 1 && interruption < 0.055) {
    return {
      delayMs: Math.round((2.5 + thought * 7.5) * MINUTE),
      activity: "wandering",
    };
  }

  const readingMs = clamp(previousLength * 46, 2.5 * SECOND, 24 * SECOND);
  const reflectionMs = 4 * SECOND + thought ** 2.25 * 105 * SECOND;
  const arc = [0.55, 0.88, 1.16, 0.82, 1.28, 0.7][round - 1];
  const voice = {
    direct: 0.72,
    playful: 0.86,
    warm: 1,
    quiet: 1.24,
  }[input.voice];
  const delayMs = Math.round(
    clamp((readingMs + reflectionMs) * arc * voice, 5 * SECOND, 3 * MINUTE),
  );

  return {
    delayMs,
    activity:
      round === 1
        ? "arriving"
        : interruption < 0.2
          ? "reading"
          : "thinking",
  };
}

export function planDebriefPause(
  mode: AgentDatePaceMode,
  random: () => number,
): AgentDatePause {
  const value = clamp(random(), 0, 0.999_999);
  return {
    delayMs:
      mode === "demo"
        ? Math.round(2_200 + value * 4_800)
        : Math.round(22 * SECOND + value ** 1.8 * 118 * SECOND),
    activity: "wrapping_up",
  };
}
