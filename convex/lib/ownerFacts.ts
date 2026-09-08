/** Evidence stays private; a scene action does not need a biographical claim. */
export type OwnerFactEvidence = { claim: string; source_quote: string };
export function ownerFactsSupported(evidence: OwnerFactEvidence[], ownerSources: string[]): boolean {
  return evidence.every(item => typeof item.claim === 'string' && item.claim.trim().length > 0
    && typeof item.source_quote === 'string' && item.source_quote.trim().length > 0
    && ownerSources.some(source => source.includes(item.source_quote)));
}
