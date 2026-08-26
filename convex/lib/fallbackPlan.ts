import { intersect } from "./matching";

/**
 * Deterministic plan composition.
 *
 * The model writes the real DateDrop. This builds a usable one from the same
 * researched venues when the model is unavailable, so an outage degrades the
 * prose rather than cancelling someone's Saturday. The copy is honest about
 * being assembled from rules — it never claims reasoning that did not happen.
 */

export type FallbackVenue = {
  name: string;
  category: string;
  district: string;
  approximatePrice: string | null;
  confidence: "high" | "medium" | "low";
  tags: string[];
};

export type FallbackInput = {
  area: string;
  city: string;
  budgetLow: number;
  budgetHigh: number;
  availableMinutes: number;
  sharedInterests: string[];
  sharedDateTypes: string[];
  atmosphere: string;
  dietary: string[];
  aName: string;
  bName: string;
  venues: FallbackVenue[];
};

export type FallbackPlan = {
  title: string;
  theme: string;
  summary: string;
  whyItFits: string;
  whyForA: string;
  whyForB: string;
  meetingInstructions: string;
  estimatedCostPerPerson: number;
  estimatedDurationMin: number;
  stops: Array<{
    venueIndex: number;
    startOffsetMin: number;
    durationMin: number;
    note: string;
  }>;
};

/** How well a venue category matches what both people said they'd enjoy. */
const DATE_TYPE_TO_CATEGORY: Record<string, string[]> = {
  coffee: ["cafe"],
  dinner: ["restaurant"],
  drinks: ["bar"],
  dessert: ["dessert", "cafe"],
  exhibition: ["exhibition"],
  museum: ["exhibition"],
  walk: ["park"],
  live_music: ["live_music", "bar"],
  casual_activity: ["activity", "park"],
  surprise: ["exhibition", "activity", "live_music"],
};

const CATEGORY_LABEL: Record<string, string> = {
  restaurant: "dinner",
  cafe: "coffee",
  dessert: "dessert",
  bar: "drinks",
  exhibition: "an exhibition",
  park: "a walk",
  live_music: "live music",
  activity: "something to do",
  other: "somewhere",
};

/** Rough minutes a stop of each kind deserves. */
const CATEGORY_MINUTES: Record<string, number> = {
  restaurant: 90,
  cafe: 60,
  dessert: 50,
  bar: 75,
  exhibition: 75,
  park: 45,
  live_music: 90,
  activity: 75,
  other: 60,
};

const ALCOHOL_CATEGORIES = new Set(["bar"]);

export function buildFallbackPlan(input: FallbackInput): FallbackPlan | null {
  const wanted = new Set(
    input.sharedDateTypes.flatMap((t) => DATE_TYPE_TO_CATEGORY[t] ?? []),
  );
  const avoidAlcohol = input.dietary.includes("no_alcohol_venue");

  const scored = input.venues
    .map((venue, index) => {
      let score = 0;
      if (wanted.has(venue.category)) score += 4;
      if (venue.confidence === "high") score += 3;
      else if (venue.confidence === "medium") score += 1;
      if (venue.district.toLowerCase() === input.area.toLowerCase()) score += 2;
      if (venue.approximatePrice) score += 1;
      if (avoidAlcohol && ALCOHOL_CATEGORIES.has(venue.category)) score -= 10;
      if (input.atmosphere === "quiet" && venue.category === "bar") score -= 1;
      return { venue, index, score };
    })
    .filter((entry) => entry.score > -5)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return null;

  const primary = scored[0];
  // A second stop only if there's time and it's a genuinely different kind of place.
  const secondary =
    input.availableMinutes >= 150
      ? scored.find(
          (entry) =>
            entry.index !== primary.index &&
            entry.venue.category !== primary.venue.category &&
            // Only pair with a venue we can actually name a purpose for.
            entry.venue.category !== "other",
        )
      : undefined;

  const primaryMinutes = CATEGORY_MINUTES[primary.venue.category] ?? 60;
  const stops = [
    {
      venueIndex: primary.index,
      startOffsetMin: 0,
      durationMin: primaryMinutes,
      note: noteFor(primary.venue, input),
    },
  ];

  if (secondary) {
    const secondaryMinutes = Math.min(
      CATEGORY_MINUTES[secondary.venue.category] ?? 60,
      Math.max(30, input.availableMinutes - primaryMinutes - 15),
    );
    if (secondaryMinutes >= 30) {
      stops.push({
        venueIndex: secondary.index,
        startOffsetMin: primaryMinutes + 15,
        durationMin: secondaryMinutes,
        note: noteFor(secondary.venue, input),
      });
    }
  }

  const totalMinutes = stops.reduce(
    (max, stop) => Math.max(max, stop.startOffsetMin + stop.durationMin),
    0,
  );

  const primaryLabel = CATEGORY_LABEL[primary.venue.category] ?? "somewhere";
  const secondaryLabel = secondary
    ? (CATEGORY_LABEL[secondary.venue.category] ?? "somewhere")
    : null;

  const theme = secondaryLabel
    ? `${capitalise(primaryLabel)} → ${secondaryLabel}`
    : capitalise(primaryLabel);

  const shared = input.sharedInterests.slice(0, 3);
  const sharedPhrase =
    shared.length >= 2
      ? `You both listed ${listPhrase(shared)}.`
      : shared.length === 1
        ? `You both listed ${shared[0]}.`
        : `You're both free at the same time and after a similar kind of evening.`;

  return {
    title: secondaryLabel ? theme : `${capitalise(primaryLabel)} in ${input.area}`,
    theme: `${theme} in ${input.area}`,
    summary: secondary
      ? `${primary.venue.name} first, then ${secondary.venue.name} a short walk away. Both are in ${input.area}, so there's no awkward journey between them.`
      : `${primary.venue.name} in ${input.area}. One place, unhurried — the simplest version of a good first date.`,
    whyItFits: `${sharedPhrase} This is the kind of ${input.atmosphere === "quiet" ? "quieter" : ""} evening you both said you'd enjoy.`.replace(
      /\s{2,}/g,
      " ",
    ),
    whyForA: `${primary.venue.name} matches what you said you'd enjoy on a first date.`,
    whyForB: `${primary.venue.name} matches what you said you'd enjoy on a first date.`,
    meetingInstructions: `Meet at ${primary.venue.name} in ${input.area}. If either of you is running late, use the one-tap notes on the DateDrop page — you won't need to swap numbers.`,
    estimatedCostPerPerson: Math.round((input.budgetLow + input.budgetHigh) / 2),
    estimatedDurationMin: Math.max(60, Math.min(240, totalMinutes)),
    stops,
  };
}

function noteFor(venue: FallbackVenue, input: FallbackInput): string {
  const overlap = intersect(venue.tags, input.sharedInterests);
  if (overlap.length > 0) return `Picked for the ${overlap[0].toLowerCase()} connection.`;
  if (venue.approximatePrice) return `Around ${venue.approximatePrice} per person.`;
  return `A ${CATEGORY_LABEL[venue.category] ?? "spot"} in ${venue.district}.`;
}

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function listPhrase(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
