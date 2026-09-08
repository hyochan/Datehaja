import { v, type Infer } from "convex/values";
import { sceneKindValidator } from "./dateStory";

/** Shared observations only. No owner's brief, private verdict or inferred feelings. */
export const dateActivityValidator = v.object({
  overview: v.string(),
  events: v.array(v.object({
    kind: v.union(v.literal("activity"), v.literal("conversation"), v.literal("proposal")),
    title: v.string(),
    detail: v.string(),
    sceneKind: sceneKindValidator,
    rounds: v.array(v.number()),
  })),
});
export type DateActivity = Infer<typeof dateActivityValidator>;
export type DateActivityEvent = DateActivity["events"][number];

export function activityCopy(locale?: string) {
  const lang = locale?.split("-")[0] ?? "en";
  const labels = {
    en: ["Their time together", "In the virtual scene", "Talked about", "Suggested · not yet done", "Full activity & conversation", "saved lines", "The exchange that stayed with me", "Scene setup", "Read these lines", "Replay from here", "No activity summary yet. Every saved line is below.", "Illustration of the virtual setting", "of", "An excerpt from the full conversation"],
    ko: ["둘이 보낸 시간", "가상 공간에서 한 일", "나눈 이야기", "제안한 일 · 아직 진행 전", "활동과 대화 전체 보기", "마디의 대화", "내게 남은 대화", "시작할 때의 상황", "이 대화 읽기", "여기부터 재생", "활동 요약은 아직 없어요. 저장된 대화는 아래에서 모두 볼 수 있어요.", "가상 공간을 표현한 그림", "중", "전체 대화 중 일부를 골랐어요"],
    ja: ["ふたりで過ごした時間", "仮想空間でしたこと", "話したこと", "提案・まだ実行前", "活動と会話をすべて見る", "件の発言", "心に残った会話", "始まりの状況", "この会話を読む", "ここから再生", "活動の要約はまだありません。保存した会話はすべて下にあります。", "仮想空間のイラスト", "/", "会話全体からの抜粋"],
    de: ["Ihre gemeinsame Zeit", "In der virtuellen Szene", "Besprochen", "Vorgeschlagen · noch nicht passiert", "Alle Aktivitäten und Gespräche", "Gesprächsbeiträge", "Das Gespräch, das mir blieb", "Ausgangsszene", "Diese Zeilen lesen", "Ab hier abspielen", "Noch keine Zusammenfassung. Alle gespeicherten Beiträge stehen unten.", "Illustration der virtuellen Szene", "von", "Ein Auszug aus dem gesamten Gespräch"],
    fr: ["Leur moment ensemble", "Dans la scène virtuelle", "Sujets abordés", "Proposé · pas encore réalisé", "Voir les activités et la conversation", "prises de parole", "L’échange qui m’est resté", "La scène au départ", "Lire cet échange", "Rejouer à partir d’ici", "Pas encore de résumé. Tous les échanges enregistrés sont ci-dessous.", "Illustration du décor virtuel", "sur", "Un extrait de la conversation complète"],
    nl: ["Hun tijd samen", "In de virtuele scène", "Besproken", "Voorgesteld · nog niet gedaan", "Alle activiteiten en gesprekken", "gespreksbijdragen", "Het gesprek dat me bijbleef", "De beginscène", "Lees deze regels", "Speel vanaf hier", "Nog geen samenvatting. Alle opgeslagen regels staan hieronder.", "Illustratie van de virtuele omgeving", "van", "Een fragment uit het hele gesprek"],
    sv: ["Deras stund tillsammans", "I den virtuella scenen", "Pratade om", "Föreslaget · inte gjort än", "Se alla aktiviteter och samtal", "repliker", "Samtalet som stannade kvar", "Scenen i början", "Läs dessa repliker", "Spela härifrån", "Ingen sammanfattning ännu. Alla sparade repliker finns nedan.", "Illustration av den virtuella miljön", "av", "Ett utdrag ur hela samtalet"],
  };
  const c = labels[lang as keyof typeof labels] ?? labels.en;
  return { pause: ({ en: "Pause", ko: "일시정지", ja: "一時停止", de: "Pause", fr: "Pause", nl: "Pauze", sv: "Pausa" } as Record<string, string>)[lang] ?? "Pause", heading: c[0], activity: c[1], conversation: c[2], proposal: c[3], full: c[4], lines: c[5], excerpt: c[6], setup: c[7], read: c[8], replay: c[9], unavailable: c[10], illustration: c[11], of: c[12], excerptNote: c[13] };
}
