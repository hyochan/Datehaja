import type { Doc } from '../_generated/dataModel';

export type RelationshipIntent = Doc<'preferences'>['relationshipIntent'];
type Goal = Pick<Doc<'preferences'>, 'relationshipIntent' | 'intentHard'>;

/** Eligibility, not a quality score: no relationship goal outranks another.
 * Serious means a shared serious intention. Open/unsure do not imply that
 * commitment. Other exploratory goals may coexist unless either owner asks
 * for the exact same goal. Friendship and casual-only do not imply each other.
 */
const COMPATIBLE: Record<RelationshipIntent, readonly RelationshipIntent[]> = {
  serious: ['serious'],
  casual: ['casual', 'open', 'unsure'],
  open: ['casual', 'open', 'friendship', 'unsure'],
  friendship: ['friendship', 'open'],
  unsure: ['casual', 'open', 'unsure'],
};

export function mutualRelationshipGoals(a: Goal | null | undefined, b: Goal | null | undefined): boolean {
  if (!a || !b) return false;
  if ((a.intentHard || b.intentHard) && a.relationshipIntent !== b.relationshipIntent) return false;
  return (COMPATIBLE[a.relationshipIntent] ?? []).includes(b.relationshipIntent)
    && (COMPATIBLE[b.relationshipIntent] ?? []).includes(a.relationshipIntent);
}
