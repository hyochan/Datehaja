import type { ParticipantState } from "./enums";

/**
 * Who counts as "the other person" on a DateDrop.
 *
 * A drop keeps every participant row it ever had — someone who passes is
 * patched to `passed`, never deleted, because the pass reason feeds future
 * matching and the audit trail has to stay intact. After a replacement search
 * a drop therefore holds three rows, and the oldest non-self row is the person
 * who *declined*, not the person you're actually meeting.
 *
 * Picking the counterpart by insertion order is the bug this module exists to
 * prevent. Everything that needs "the other participant" goes through
 * `pickCounterpart`.
 */

/** Still on the drop: yet to answer, or in. */
const ACTIVE: readonly ParticipantState[] = [
  "invited",
  "viewed",
  "accepted",
  "confirmed",
];

/** Left the drop of their own accord, or was superseded. */
const DEPARTED: readonly ParticipantState[] = ["passed", "withdrawn", "replaced"];

export function isActiveParticipant(state: string): boolean {
  return ACTIVE.includes(state as ParticipantState);
}

export function hasDeparted(state: string): boolean {
  return DEPARTED.includes(state as ParticipantState);
}

/**
 * May this person still act on the drop — cancel it, confirm attendance,
 * read its notes? Someone who passed or withdrew may not; they can still see
 * it in their history, because it happened to them.
 */
export function canActOnDrop(state: string): boolean {
  return isActiveParticipant(state);
}

/** Most-committed first, so the counterpart is whoever is actually on the date. */
const PRIORITY: Record<ParticipantState, number> = {
  confirmed: 0,
  accepted: 1,
  viewed: 2,
  invited: 3,
  expired: 4,
  cancelled: 5,
  withdrawn: 6,
  passed: 7,
  replaced: 8,
};

export type ParticipantLike = { userId: string; state: ParticipantState };

/** Loose shape so callers can keep their own extra fields on the row. */
type AnyParticipant = { userId: string; state: string };

/**
 * The person on the other side of this DateDrop, from `meUserId`'s point of
 * view. Prefers whoever is most committed; falls back to a departed row only
 * when nobody else is left, so a closed drop still renders its history.
 */
export function pickCounterpart<T extends AnyParticipant>(
  participants: readonly T[],
  meUserId: string,
): T | null {
  const others = participants.filter((p) => p.userId !== meUserId);
  if (others.length === 0) return null;
  return [...others].sort((a, b) => rank(a.state) - rank(b.state))[0];
}

function rank(state: string): number {
  return PRIORITY[state as ParticipantState] ?? 99;
}

/** Every counterpart still active — used when a drop is mid-replacement. */
export function activeCounterparts<T extends AnyParticipant>(
  participants: readonly T[],
  meUserId: string,
): T[] {
  return participants.filter(
    (p) => p.userId !== meUserId && isActiveParticipant(p.state as ParticipantState),
  );
}
