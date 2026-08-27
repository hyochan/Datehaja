/**
 * Deterministic venue extraction.
 *
 * The model does this job properly. This is the fallback for when it is
 * unavailable or fails — a crawler outage or a spent quota must not take the
 * product down. Everything produced here is marked `low` confidence and the
 * research run records that no model was involved, so a plan built this way is
 * never presented as more certain than it is.
 */

export type HeuristicVenue = {
  name: string;
  category: string;
  address: string;
  district: string;
  openingHours: string | null;
  approximatePrice: string | null;
  evidence: string;
  tags: string[];
  confidence: "high" | "medium" | "low";
  usable: boolean;
};

const CATEGORY_HINTS: Array<[RegExp, string]> = [
  [/\b(caf[eé]|coffee|roaster|espresso)\b/i, "cafe"],
  [/\b(dessert|patisserie|bakery|gelato|ice cream)\b/i, "dessert"],
  [/\b(bar|cocktail|pub|brewery|wine|izakaya|makgeolli)\b/i, "bar"],
  [/\b(museum|gallery|exhibition|art centre|art center)\b/i, "exhibition"],
  [/\b(park|garden|trail|riverside|walk)\b/i, "park"],
  [/\b(live music|jazz club|venue|concert)\b/i, "live_music"],
  [/\b(restaurant|trattoria|osteria|bistro|kitchen|dining|pasta|pizza|noodle|bbq|grill)\b/i, "restaurant"],
];

/** Lines that look like an address rather than prose. */
const ADDRESS_RE =
  /(\d+[^\n,]{0,40}(?:-ro|-gil|-dong|-gu|street|st\.|road|rd\.|avenue|ave\.|lane|ln\.|square|boulevard|blvd)\b[^\n]{0,60})/i;
const HOURS_RE =
  /((?:mon|tue|wed|thu|fri|sat|sun|daily|open)[^\n]{0,80}?\d{1,2}(?::\d{2})?\s*(?:am|pm|:00)[^\n]{0,40})/i;
/** Just the amount, or an amount range. Nothing after it — prose that follows
 *  a price on a crawled page is almost never about the price. */
const PRICE_RE =
  /((?:[₩$€£¥]|KRW|USD|EUR|GBP|JPY)\s?[\d][\d,]{1,8}(?:\s?[–\-~]\s?(?:[₩$€£¥])?[\d][\d,]{1,8})?)/;

const STOPWORD_TITLES =
  /\b(best|top \d+|guide|things to do|where to|itinerary|list|blog|reddit|review|map|menu|near me|content|ahead|warning|caution|disclaimer|subscribe|newsletter|share this|read more|related|comments?|advertisement|sponsored|faq|conclusion|introduction|table of contents)\b/i;

/**
 * A heading is only a plausible venue name. Headline-writing conventions —
 * shouting, punctuation, sentence-length — are the cheapest way to tell a real
 * name from a listicle's editorial furniture.
 */
function looksLikeVenueName(name: string): boolean {
  if (name.length < 2 || name.length > 60) return false;
  if (/[!?]/.test(name)) return false;
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(name)) return false;
  if (name.split(/\s+/).length > 6) return false;
  if (!/[\p{L}]/u.test(name)) return false;

  // All-caps headings are almost always editorial shouting, not a name.
  const letters = name.replace(/[^\p{L}]/gu, "");
  if (letters.length >= 4) {
    const upper = letters.replace(/[^\p{Lu}]/gu, "").length;
    if (upper / letters.length > 0.7) return false;
  }
  // Sentence-shaped headings ("Where we ate in ...") rarely name a place.
  if (/^(how|why|what|where|when|who|the best|our|my|we|you|here)\b/i.test(name)) {
    return false;
  }
  return true;
}

/** A price is only useful if it survived as a bare amount. */
function cleanPrice(raw: string | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim().replace(/\s+/g, " ");
  if (value.length > 32) return null;
  if (/[*_`()\[\]]/.test(value)) return null;
  return value;
}

function classify(text: string): string {
  for (const [pattern, category] of CATEGORY_HINTS) {
    if (pattern.test(text)) return category;
  }
  return "other";
}

/**
 * A heading is not a venue just because it is a heading. Travel blogs are full
 * of section titles ("Winter trip to Seoul", "Related posts") that look
 * structurally identical to a restaurant name.
 *
 * Require corroboration: either the page states something only a real place has
 * — an address, opening hours, a price — or the text around it names a kind of
 * venue. Without a model reading the page, this is the line between a venue
 * record and a blog outline.
 */
function hasVenueEvidence(
  name: string,
  evidence: string,
  address: string,
  hours: string | null,
  price: string | null,
): boolean {
  if (address || hours || price) return true;
  return CATEGORY_HINTS.some(([pattern]) => pattern.test(`${name} ${evidence}`));
}

function cleanName(raw: string): string {
  return (
    raw
      // Markdown headings often wrap the name in a link: [Name](https://...).
      .replace(/\[([^\]]{1,80})\]\([^)]*\)/g, "$1")
      .replace(/^[#*\s\d.)-]+/, "")
      .replace(/[*_`]+/g, "")
      // A bare bracketed name, once the link target is gone.
      .replace(/^\[([^\]]{1,80})\]$/, "$1")
      .replace(/\s{2,}/g, " ")
      .replace(/\s*\([^)]{0,40}\)\s*$/, "")
      .trim()
      .slice(0, 80)
  );
}

/**
 * Pull candidate venues out of one crawled page. Markdown headings and bold
 * runs are the strongest signal a listicle gives us.
 */
export function extractVenues(
  source: { url: string; title: string; content: string },
  area: string,
  limit = 4,
): HeuristicVenue[] {
  const lines = source.content.split("\n");
  const out: HeuristicVenue[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < lines.length && out.length < limit; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const headingMatch = line.match(/^#{2,4}\s+(.{2,80})$/);
    const boldMatch = line.match(/^\*\*(.{2,60})\*\*\s*$/);
    const numberedMatch = line.match(/^\d{1,2}[.)]\s+\*{0,2}(.{2,60})/);

    const raw = headingMatch?.[1] ?? boldMatch?.[1] ?? numberedMatch?.[1];
    if (!raw) continue;

    const name = cleanName(raw);
    if (!looksLikeVenueName(name)) continue;
    if (STOPWORD_TITLES.test(name)) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;

    // Look ahead a few lines for supporting detail.
    const window = lines.slice(i + 1, i + 8).join("\n");
    const evidence = window.replace(/\s+/g, " ").trim().slice(0, 300);
    if (evidence.length < 25) continue;

    const address = window.match(ADDRESS_RE)?.[1]?.trim().slice(0, 160) ?? "";
    const openingHours = window.match(HOURS_RE)?.[1]?.trim().slice(0, 140) ?? null;
    const approximatePrice = cleanPrice(window.match(PRICE_RE)?.[1]);
    if (!hasVenueEvidence(name, evidence, address, openingHours, approximatePrice)) {
      continue;
    }

    seen.add(key);
    out.push({
      name,
      category: classify(`${name} ${evidence}`),
      address,
      district: area,
      openingHours,
      approximatePrice,
      evidence,
      tags: ["extracted-without-model"],
      // Deliberately never above "low": nothing here was verified by anything
      // smarter than a regular expression.
      confidence: "low",
      usable: true,
    });
  }

  // Some pages are a single venue's own site: the title is the venue.
  if (out.length === 0 && source.title && !STOPWORD_TITLES.test(source.title)) {
    const name = cleanName(source.title.split(/[|·—–-]/)[0]);
    if (looksLikeVenueName(name)) {
      const evidence = source.content.replace(/\s+/g, " ").trim().slice(0, 300);
      const address = source.content.match(ADDRESS_RE)?.[1]?.trim().slice(0, 160) ?? "";
      const openingHours =
        source.content.match(HOURS_RE)?.[1]?.trim().slice(0, 140) ?? null;
      const approximatePrice = cleanPrice(source.content.match(PRICE_RE)?.[1]);
      if (
        evidence.length >= 40 &&
        hasVenueEvidence(name, evidence, address, openingHours, approximatePrice)
      ) {
        out.push({
          name,
          category: classify(`${name} ${evidence}`),
          address,
          district: area,
          openingHours,
          approximatePrice,
          evidence,
          tags: ["extracted-without-model", "single-page"],
          confidence: "low",
          usable: true,
        });
      }
    }
  }

  return out;
}
