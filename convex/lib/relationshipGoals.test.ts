import { describe, expect, test } from 'vitest';
import { mutualRelationshipGoals, type RelationshipIntent } from './relationshipGoals';
const intents: RelationshipIntent[] = ['serious', 'casual', 'open', 'friendship', 'unsure'];
const allowed: Record<RelationshipIntent, RelationshipIntent[]> = {
  serious: ['serious'], casual: ['casual', 'open', 'unsure'], open: ['casual', 'open', 'friendship', 'unsure'], friendship: ['friendship', 'open'], unsure: ['casual', 'open', 'unsure'],
};
export const relationshipGoalCases = intents.flatMap(a => intents.map(b => ({ a, b, allowed: allowed[a].includes(b) })));
describe('mutual relationship goals', () => {
  test.each(relationshipGoalCases)('$a / $b -> $allowed', ({ a, b, allowed }) => {
    expect(mutualRelationshipGoals({ relationshipIntent: a, intentHard: false }, { relationshipIntent: b, intentHard: false })).toBe(allowed);
  });
  test.each([[true, false], [false, true], [true, true]])('honors exact-goal choice from either side: %s / %s', (aHard, bHard) => {
    expect(mutualRelationshipGoals({ relationshipIntent: 'casual', intentHard: aHard }, { relationshipIntent: 'open', intentHard: bHard })).toBe(false);
    expect(mutualRelationshipGoals({ relationshipIntent: 'casual', intentHard: aHard }, { relationshipIntent: 'casual', intentHard: bHard })).toBe(true);
  });
  test('does not treat a missing goal as an open invitation', () => {
    expect(mutualRelationshipGoals(null, { relationshipIntent: 'open', intentHard: false })).toBe(false);
    expect(mutualRelationshipGoals({ relationshipIntent: 'open', intentHard: false }, undefined)).toBe(false);
  });
});
