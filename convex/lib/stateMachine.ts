import type { DropStatus, ParticipantState } from "./enums";

/**
 * Explicit date-plan lifecycle. Every transition in the app funnels through
 * `assertDropTransition` so an out-of-order webhook, a double click, or a
 * retried job can never drive a drop into an impossible state.
 */
const DROP_TRANSITIONS: Record<DropStatus, readonly DropStatus[]> = {
  draft: ["matching", "cancelled", "failed"],
  matching: ["researching", "expired_no_match", "cancelled", "failed"],
  researching: ["inviting", "expired_no_match", "cancelled", "failed"],
  inviting: [
    "partially_accepted",
    "confirmed",
    "expired_no_match",
    "cancelled",
    "failed",
  ],
  // A pass sends us back to matching for a replacement candidate.
  partially_accepted: [
    "matching",
    "researching",
    "inviting",
    "confirmed",
    "expired_no_match",
    "cancelled",
    "failed",
  ],
  confirmed: ["completed", "cancelled"],
  expired_no_match: [],
  cancelled: [],
  completed: [],
  failed: ["cancelled"],
};

export const TERMINAL_DROP_STATUSES: readonly DropStatus[] = [
  "expired_no_match",
  "cancelled",
  "completed",
];

export function canTransitionDrop(from: DropStatus, to: DropStatus): boolean {
  if (from === to) return true;
  return DROP_TRANSITIONS[from].includes(to);
}

export function assertDropTransition(from: DropStatus, to: DropStatus): void {
  if (!canTransitionDrop(from, to)) {
    throw new Error(`Illegal date-plan transition: ${from} → ${to}`);
  }
}

export function isTerminalDrop(status: DropStatus): boolean {
  return TERMINAL_DROP_STATUSES.includes(status);
}

/** A drop that should still be actively worked on by background jobs. */
export function isDropActive(status: DropStatus): boolean {
  return (
    status === "matching" ||
    status === "researching" ||
    status === "inviting" ||
    status === "partially_accepted"
  );
}

const PARTICIPANT_TRANSITIONS: Record<
  ParticipantState,
  readonly ParticipantState[]
> = {
  invited: ["viewed", "accepted", "passed", "expired", "cancelled", "replaced"],
  viewed: ["accepted", "passed", "expired", "cancelled", "replaced"],
  accepted: ["confirmed", "withdrawn", "expired", "cancelled"],
  confirmed: ["withdrawn", "cancelled"],
  passed: [],
  withdrawn: [],
  expired: [],
  cancelled: [],
  replaced: [],
};

export function canTransitionParticipant(
  from: ParticipantState,
  to: ParticipantState,
): boolean {
  if (from === to) return true;
  return PARTICIPANT_TRANSITIONS[from].includes(to);
}

export function assertParticipantTransition(
  from: ParticipantState,
  to: ParticipantState,
): void {
  if (!canTransitionParticipant(from, to)) {
    throw new Error(`Illegal participant transition: ${from} → ${to}`);
  }
}

/**
 * Derive the drop status implied by the current participant states.
 * Pure — so the same rules are used by mutations, crons and tests.
 */
export function deriveDropStatus(
  current: DropStatus,
  participants: readonly { state: ParticipantState }[],
): DropStatus {
  if (isTerminalDrop(current)) return current;

  const live = participants.filter(
    (p) => p.state !== "replaced" && p.state !== "passed" && p.state !== "withdrawn",
  );
  const accepted = live.filter(
    (p) => p.state === "accepted" || p.state === "confirmed",
  );

  if (accepted.length >= 2) return "confirmed";
  if (accepted.length === 1 && current !== "matching" && current !== "researching") {
    return "partially_accepted";
  }
  return current;
}
