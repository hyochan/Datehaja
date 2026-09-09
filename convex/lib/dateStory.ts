import { v } from "convex/values";

export const sceneKinds = ["cinema", "market", "bookshop", "garden", "gallery", "cafe"] as const;
export type SceneKind = (typeof sceneKinds)[number];
export const sceneKindValidator = v.union(...sceneKinds.map((kind) => v.literal(kind)));
export const reflectionValidator = v.object({
  headline: v.string(),
  anchorRound: v.number(),
  question: v.string(),
});
export type DateReflection = { headline: string; anchorRound: number; question: string };

const SCENES: Record<SceneKind, { titles: Record<string, string>; situations: string[] }> = {
  cinema: {
    titles: { en: "After the end credits", ko: "엔딩 크레딧이 끝난 뒤", ja: "エンドロールのあと", de: "Nach dem Abspann", fr: "Après le générique", nl: "Na de aftiteling", sv: "Efter eftertexterna" },
    situations: [
      "In this fictional screening, the last frame shows an empty hillside path under a pale moon. Nobody returns before the cut. The credits have finished. One person can stay with the last image; the other can suggest leaving. The question is whether they make room for different reactions to the ending.",
      "Two short films are screening next: an ambiguous, quiet film and a chaotic comedy. They have time for one. Let them choose without assuming they want the same thing.",
      "They find a blank postcard asking for an alternative ending. Each can offer one small idea; see whether the second builds on it or takes it somewhere else.",
    ],
  },
  market: {
    titles: { en: "One stall still open", ko: "아직 문을 연 작은 가게", ja: "まだ開いている屋台", de: "Ein Stand hat noch offen", fr: "Un dernier stand ouvert", nl: "Nog één kraam open", sv: "Ett stånd har fortfarande öppet" },
    situations: [
      "The night market forks: a busy music stall or a quiet side street. They choose a route together, without inventing food preferences or buying anything.",
      "One stall is closing; there is time to browse one last thing or keep walking. Notice how they negotiate different tempos.",
      "A small rain shower begins under the lanterns. They can wait under an awning or walk to the covered arcade. Let a practical choice reveal how they make room for each other.",
    ],
  },
  bookshop: {
    titles: { en: "A note between the pages", ko: "책갈피 사이에 남긴 쪽지", ja: "ページの間のメモ", de: "Eine Notiz zwischen den Seiten", fr: "Un mot entre les pages", nl: "Een briefje tussen de bladzijden", sv: "En lapp mellan sidorna" },
    situations: [
      'A table holds two fictional opening sentences: "I returned the spare key" and "The front door was still open." They choose which they would continue and explain a little, without inventing a favourite author.',
      "There is one reading lamp and two chairs. One person proposes reading a line aloud or simply browsing together. The other may prefer a different kind of company.",
      "A notebook asks visitors to leave one question for a stranger. They choose what to write together. Make the question specific and answerable, not a life philosophy interview.",
    ],
  },
  garden: {
    titles: { en: "The longer way around", ko: "조금 돌아가는 산책길", ja: "少し遠回りの道", de: "Der längere Weg", fr: "Le chemin le plus long", nl: "De langere route", sv: "Den lite längre vägen" },
    situations: [
      "A path divides between a warm glasshouse and a bench by the reflecting pool. They decide where to spend the last few minutes; neither route is more correct.",
      "An unfamiliar plant has a missing label. They can make a playful guess or leave the mystery alone. Notice the response without turning it into a personality diagnosis.",
      "The lights along the path begin to come on. There is space for a pause. One can name something they notice instead of asking another interview question.",
    ],
  },
  gallery: {
    titles: { en: "The painting they read differently", ko: "서로 다르게 읽은 그림", ja: "ふたりで違って見えた絵", de: "Zwei Blicke auf ein Bild", fr: "Deux regards sur un tableau", nl: "Twee blikken op een schilderij", sv: "Två sätt att se en tavla" },
    situations: [
      "An untitled painting shows a green circle partly hidden by a terracotta triangle, with a pale small moon at its edge. It can look like a beginning or a goodbye. Let each react in their own way. Agreement is possible, but do not smooth over a difference just to seem compatible.",
      "They are asked to choose a title for an abstract work. One offers a title; the other can build on it, joke, or disagree kindly.",
      "The small gallery is closing. They can revisit one piece or leave. Let them make an actual choice instead of discussing their general communication style.",
    ],
  },
  cafe: {
    titles: { en: "The table by the rainy window", ko: "빗소리가 들리는 창가 자리", ja: "雨の窓辺のテーブル", de: "Der Tisch am Regenfenster", fr: "La table près de la pluie", nl: "De tafel bij het regenraam", sv: "Bordet vid regnfönstret" },
    situations: [
      "The café has a shared music queue with one empty slot. One proposes a mood for the next song; the other can suggest a different one. Do not invent specific music tastes.",
      "Rain begins against the window just as they could leave. They decide whether to stay for a few minutes or end the date here. Staying is not automatically a better result.",
      "There is a small sketchbook on the table. One can offer a doodle idea, make a joke about it, or prefer to talk. Respond to the actual suggestion without manufacturing common ground.",
    ],
  },
};

export function sceneKindFor(value: string): SceneKind {
  if (/film|movie|cinema|영화|映画/i.test(value)) return "cinema";
  if (/book|reading|poem|writing|책|독서|読書/i.test(value)) return "bookshop";
  if (/gallery|museum|art|미술|전시|美術/i.test(value)) return "gallery";
  if (/garden|hiking|walk|outdoor|산책|등산|散歩/i.test(value)) return "garden";
  if (/food|market|cook|음식|요리|料理/i.test(value)) return "market";
  return "cafe";
}

export function storySeed(value: string): number {
  let hash = [...value].reduce((result, letter) => (Math.imul(result, 31) + letter.charCodeAt(0)) >>> 0, 7);
  // Mix the whole id so picking a place does not also fix its situation.
  hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
  hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
  return (hash ^ (hash >>> 16)) >>> 0;
}

export function dateScene(kind: SceneKind, seed: number, locale?: string) {
  const scene = SCENES[kind];
  return {
    kind,
    title: scene.titles[locale?.split("-")[0] ?? "en"] ?? scene.titles.en,
    situation: scene.situations[seed % scene.situations.length],
  };
}

/** A beat is an opportunity, never a scripted reaction or a forced attraction. */
export function turnBeat(round: number, plannedTurns = 6): string {
  if (round === plannedTurns && [10, 16].includes(plannedTurns)) return "Answer the last question concretely before closing or pausing. Do not add another unanswered question just to keep talking. Never promise a future human date, contact, attraction or consent. A next-time idea remains a proposal, not an event that already happened.";
  if (round === plannedTurns) return "Answer the last question concretely and react to what you have actually done together. This is a checkpoint, not a deadline: do not invent a reason to leave or say goodbye just because of the turn count. You may choose to end if that is what you want. Never promise a future human date, contact or consent. Keep a next-time idea distinct from an event that happened.";
  const opening = [
    "Arrive. Notice one thing in the supplied scene and make one small invitation or choice. No résumé, no list of interests.",
    "Respond to their actual invitation. Choose, hesitate, or counter-propose from your own taste. Do not simply mirror them.",
    "Stay with what they just said. A short reaction, a small disagreement or simply answering is enough. Let a topic breathe instead of switching to a relationship questionnaire. No required question or personal disclosure.",
    "Respond in your own rhythm. If they ask what you want, answer honestly from your OWN brief; do not mirror their intention. If nobody asked, do not force a statement of relationship goals into the conversation. A clear incompatibility or wish to leave should be respected.",
    "Follow their last answer. If you have already agreed on a small action, let it happen in this fictional scene and react to it in spoken words, or make the next concrete choice. Do not spend another turn promising the same plan. You may simply enjoy the scene; do not manufacture surprise, a changed mind, a disagreement, or an unresolved issue. Do not recap the date or declare compatibility.",
    "Respond to the last thing they actually said. Do not invent a deadline or leave just because this is the sixth turn. If either person has chosen to leave, respect that and close honestly. No promises on behalf of either human.",
  ];
  if (round <= opening.length) return opening[Math.max(0, round - 1)];
  if (round > 12) return "Continue from the last reply. Resolve the one specific uncertainty if still unanswered; do not restart the scene or repeat the relationship-intent interview. Respect any wish to leave.";
  return "Respond to what was actually just said, in your own voice. Answer a pending question before introducing another. Once a small activity or joke has run its course, let it rest: an ordinary comment, a different topic from your own interests, or a comfortable pause is enough. Do not keep extending the same mini-game, song choice, countdown or invitation merely to fill turns. If you choose a new action, do your own part without inventing the other's reaction. No required question, punchline, scene change or compatibility speech. Respect a wish to leave.";
}

/** Clarify thin evidence once; never prolong a refusal or force a recommendation. */
export function needsClarification(turns: number, a: { verdict: string; followup_question?: string }, b: { verdict: string; followup_question?: string }): boolean {
  return [6, 12].includes(turns) && a.verdict !== "pass" && b.verdict !== "pass"
    && (a.verdict === "curious" || b.verdict === "curious")
    && Boolean(a.followup_question?.trim() || b.followup_question?.trim());
}

/** Keep an actual adjacent exchange, including the reply that gave it meaning. */
export function selectExchange<T extends { round: number }>(turns: T[], anchorRound?: number): T[] {
  const ordered = [...turns].sort((a, b) => a.round - b.round);
  if (ordered.length <= 2) return ordered;
  const anchor = ordered.findIndex((turn) => turn.round === anchorRound);
  const end = anchor >= 0 ? Math.max(1, anchor) : Math.min(3, ordered.length - 1);
  return ordered.slice(end - 1, end + 1);
}

/** Show how it began as well as the exchange behind the letter, in order. */
export function selectLetterExchanges<T extends { round: number }>(turns: T[], anchorRound?: number): T[] {
  const opening = [...turns].sort((a, b) => a.round - b.round).slice(0, 2);
  return [...new Map([...opening, ...selectExchange(turns, anchorRound)].map(t => [t.round, t])).values()].sort((a, b) => a.round - b.round);
}
