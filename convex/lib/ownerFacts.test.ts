import { describe, expect, test } from 'vitest';
import { ownerFactsSupported } from './ownerFacts';
describe('private evidence for owner facts', () => {
  test('rejects invented support and support from the other person', () => {
    expect(ownerFactsSupported([{ claim: 'I pretend to pick any menu item.', source_quote: 'I pretend to pick any menu item.' }], ['I cook fried rice on weekends.'])).toBe(false);
    expect(ownerFactsSupported([{ claim: 'I cook.', source_quote: '' }], ['I cook fried rice on weekends.'])).toBe(false);
  });
  test('allows a supported owner fact or a present action without an invented past', () => {
    expect(ownerFactsSupported([{ claim: 'I cook fried rice.', source_quote: 'cook fried rice' }], ['I cook fried rice on weekends.'])).toBe(true);
    expect(ownerFactsSupported([], ['I cook fried rice on weekends.'])).toBe(true);
  });
});
