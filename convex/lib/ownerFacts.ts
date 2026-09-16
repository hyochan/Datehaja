/** Evidence stays private; a scene action does not need a biographical claim. */
export type OwnerFactEvidence = { claim: string; source_quote: string };

/**
 * The shortest quote that can still be evidence.
 *
 * `source.includes(quote)` accepted any substring, so a reply could assert "I am
 * a surgeon at Seoul National University Hospital" and cite the letter `I` from
 * a brief about cooking. A quote has to be long enough that it could only have
 * come from the brief it claims to come from.
 */
const MIN_QUOTE = 12;

/** Whether a quote sits on word boundaries rather than inside longer words. */
function quotedFrom(source: string, quote: string): boolean {
  let at = source.indexOf(quote);
  while (at !== -1) {
    const before = at === 0 ? "" : source[at - 1];
    const after = source[at + quote.length] ?? "";
    // A fragment like "ook fri" out of "I cook fried rice" is not a quotation.
    if (!/[\p{L}\p{N}]/u.test(before) && !/[\p{L}\p{N}]/u.test(after)) return true;
    at = source.indexOf(quote, at + 1);
  }
  return false;
}

/**
 * An empty list means the reply asserts no biographical fact, which is the
 * normal case for a scene action. Nothing here can tell whether a reply that
 * cites nothing is nevertheless inventing a life; the prompt asks for citations
 * and this checks the ones it gets.
 */
export function ownerFactsSupported(evidence: OwnerFactEvidence[], ownerSources: string[]): boolean {
  return evidence.every((item) => {
    if (typeof item.claim !== "string" || item.claim.trim().length === 0) return false;
    if (typeof item.source_quote !== "string") return false;
    const quote = item.source_quote.trim();
    if (quote.length < MIN_QUOTE) return false;
    return ownerSources.some((source) => quotedFrom(source, quote));
  });
}
