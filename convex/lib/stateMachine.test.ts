import { describe, expect, it } from "vitest";
import {
  assertDropTransition,
  assertParticipantTransition,
  canTransitionDrop,
  canTransitionParticipant,
  deriveDropStatus,
  isDropActive,
  isTerminalDrop,
} from "./stateMachine";
import type { DropStatus, ParticipantState } from "./enums";

const ALL_STATUSES: DropStatus[] = [
  "draft",
  "matching",
  "researching",
  "inviting",
  "partially_accepted",
  "confirmed",
  "expired_no_match",
  "cancelled",
  "completed",
  "failed",
];

describe("DateDrop transitions", () => {
  it("walks the happy path", () => {
    expect(canTransitionDrop("draft", "matching")).toBe(true);
    expect(canTransitionDrop("matching", "researching")).toBe(true);
    expect(canTransitionDrop("researching", "inviting")).toBe(true);
    expect(canTransitionDrop("inviting", "confirmed")).toBe(true);
    expect(canTransitionDrop("confirmed", "completed")).toBe(true);
  });

  it("allows a pass to send a drop back to matching for a replacement", () => {
    expect(canTransitionDrop("inviting", "partially_accepted")).toBe(true);
    expect(canTransitionDrop("partially_accepted", "matching")).toBe(true);
    expect(canTransitionDrop("partially_accepted", "confirmed")).toBe(true);
  });

  it("treats terminal states as terminal", () => {
    for (const terminal of ["expired_no_match", "cancelled", "completed"] as const) {
      expect(isTerminalDrop(terminal)).toBe(true);
      for (const target of ALL_STATUSES) {
        if (target === terminal) continue;
        expect(canTransitionDrop(terminal, target)).toBe(false);
      }
    }
  });

  it("refuses to resurrect an expired drop", () => {
    expect(() => assertDropTransition("expired_no_match", "confirmed")).toThrow(
      /Illegal DateDrop transition/,
    );
  });

  it("refuses to skip straight from draft to confirmed", () => {
    expect(() => assertDropTransition("draft", "confirmed")).toThrow();
  });

  it("treats a no-op transition as allowed so retries are idempotent", () => {
    for (const status of ALL_STATUSES) {
      expect(canTransitionDrop(status, status)).toBe(true);
      expect(() => assertDropTransition(status, status)).not.toThrow();
    }
  });

  it("knows which drops background jobs should still work on", () => {
    expect(isDropActive("inviting")).toBe(true);
    expect(isDropActive("partially_accepted")).toBe(true);
    expect(isDropActive("confirmed")).toBe(false);
    expect(isDropActive("cancelled")).toBe(false);
  });

  it("always allows cancelling a live drop", () => {
    for (const status of ALL_STATUSES) {
      if (isTerminalDrop(status)) continue;
      expect(canTransitionDrop(status, "cancelled")).toBe(true);
    }
  });
});

describe("participant transitions", () => {
  it("walks invited → viewed → accepted → confirmed", () => {
    expect(canTransitionParticipant("invited", "viewed")).toBe(true);
    expect(canTransitionParticipant("viewed", "accepted")).toBe(true);
    expect(canTransitionParticipant("accepted", "confirmed")).toBe(true);
  });

  it("makes a pass final", () => {
    const finalStates: ParticipantState[] = ["passed", "withdrawn", "expired", "replaced"];
    for (const state of finalStates) {
      expect(canTransitionParticipant(state, "accepted")).toBe(false);
    }
    expect(() => assertParticipantTransition("passed", "accepted")).toThrow(
      /Illegal participant transition/,
    );
  });

  it("lets someone withdraw after accepting but not after passing", () => {
    expect(canTransitionParticipant("accepted", "withdrawn")).toBe(true);
    expect(canTransitionParticipant("passed", "withdrawn")).toBe(false);
  });
});

describe("deriveDropStatus", () => {
  it("confirms once two participants have accepted", () => {
    expect(
      deriveDropStatus("inviting", [{ state: "accepted" }, { state: "accepted" }]),
    ).toBe("confirmed");
  });

  it("moves to partially_accepted with one acceptance", () => {
    expect(
      deriveDropStatus("inviting", [{ state: "accepted" }, { state: "invited" }]),
    ).toBe("partially_accepted");
  });

  it("stays put while everyone is still deciding", () => {
    expect(
      deriveDropStatus("inviting", [{ state: "invited" }, { state: "viewed" }]),
    ).toBe("inviting");
  });

  it("ignores people who passed, withdrew, or were replaced", () => {
    expect(
      deriveDropStatus("partially_accepted", [
        { state: "accepted" },
        { state: "passed" },
        { state: "replaced" },
        { state: "withdrawn" },
      ]),
    ).toBe("partially_accepted");
  });

  it("never moves a terminal drop", () => {
    for (const terminal of ["cancelled", "expired_no_match", "completed"] as const) {
      expect(
        deriveDropStatus(terminal, [{ state: "accepted" }, { state: "accepted" }]),
      ).toBe(terminal);
    }
  });

  it("does not jump to partially_accepted while still matching", () => {
    expect(deriveDropStatus("matching", [{ state: "accepted" }])).toBe("matching");
  });

  it("confirms a replacement pairing", () => {
    expect(
      deriveDropStatus("partially_accepted", [
        { state: "confirmed" },
        { state: "passed" },
        { state: "accepted" },
      ]),
    ).toBe("confirmed");
  });
});
