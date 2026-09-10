import { activityCopy, type DateActivity } from "./dateActivity";
/** Private letters from each person's AI Agent. */
import type { DateReflection, SceneKind } from "./dateStory";

export type EmailContent = { subject: string; text: string; html: string };

function letterExperienceCopy(locale?: string) {
  const copies: Record<string, { replay: string; demo: string; private: string }> = {
    en: { replay: "Replay the conversation", demo: "AI SIMULATION · FICTIONAL DEMO PARTNER", private: "AI SIMULATION · A LETTER ONLY FOR YOU" },
    ko: { replay: "대화 다시 보기", demo: "AI 시뮬레이션 · 가상의 데모 상대", private: "AI 시뮬레이션 · 나에게만 온 편지" },
    ja: { replay: "会話を振り返る", demo: "AIシミュレーション · 架空の相手", private: "AIシミュレーション · あなただけへの手紙" },
    de: { replay: "Das Gespräch ansehen", demo: "KI-SIMULATION · FIKTIVE DEMOPERSON", private: "KI-SIMULATION · NUR FÜR DICH" },
    fr: { replay: "Revoir la conversation", demo: "SIMULATION IA · PARTENAIRE FICTIF", private: "SIMULATION IA · UNE LETTRE POUR VOUS" },
    nl: { replay: "Bekijk het gesprek", demo: "AI-SIMULATIE · FICTIEVE DEMOPARTNER", private: "AI-SIMULATIE · EEN BRIEF VOOR JOU" },
    sv: { replay: "Se samtalet", demo: "AI-SIMULERING · FIKTIV DEMOPARTNER", private: "AI-SIMULERING · ETT BREV BARA TILL DIG" },
  };
  return copies[locale?.split("-")[0] ?? "en"] ?? copies.en;
}

const BRAND = {
  ink: "#16121b",
  sand: "#fcfaf7",
  ember: "#d4552b",
  wine: "#281820",
  blush: "#fff0ed",
  sage: "#e2f2df",
  muted: "#7a7183",
  border: "#ece4d9",
};

/** Light chip colours for each Agent avatar palette. */
const AVATAR_CHIPS: Record<string, { bg: string; fg: string }> = {
  rose: { bg: "#ffd9dc", fg: "#a63d4e" },
  violet: { bg: "#e6ddff", fg: "#6b4fa8" },
  moss: { bg: "#dcedd6", fg: "#4a6b3a" },
  sky: { bg: "#d8ecfb", fg: "#2f6b96" },
  sunset: { bg: "#ffe3c9", fg: "#b05c22" },
  ink: { bg: "#e4e1ea", fg: "#46405a" },
};

const DEFAULT_OWNER_CHIP = AVATAR_CHIPS.sunset;

const VERDICT_STYLES = {
  encourage: { bg: "#e7f4e4", fg: "#2f6b3a", accent: "#4c9a54" },
  curious: { bg: "#fff1d6", fg: "#8a6116", accent: "#d9a13b" },
  pass: { bg: "#efe9f0", fg: "#6d5f75", accent: "#8d7d96" },
} as const;

function chipFor(
  palette: string | undefined,
  fallback: { bg: string; fg: string },
): { bg: string; fg: string } {
  return (palette && AVATAR_CHIPS[palette]) || fallback;
}

function shell(
  body: string,
  footerNote: string,
  settingsNote = "You can change what Datehaja emails you, or pause matching entirely, in Settings.",
  hero = "",
): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.sand};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${BRAND.ink};word-break:keep-all;overflow-wrap:break-word;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.sand};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid ${BRAND.border};border-radius:18px;overflow:hidden;">
        ${
          hero ||
          `<tr><td style="padding:28px 32px 8px 32px;">
          <div style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.muted};font-weight:600;">Datehaja</div>
        </td></tr>`
        }
        <tr><td style="padding:${hero ? "24px" : "8px"} 32px 28px 32px;">${body}</td></tr>
      </table>
      <div style="max-width:520px;margin:18px auto 0;font-size:12px;line-height:1.6;color:${BRAND.muted};text-align:left;">
        ${footerNote}<br>
        ${settingsNote}
      </div>
    </td></tr>
  </table>
</body></html>`;
}

function button(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:${BRAND.ember};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 24px;border-radius:999px;">${escapeHtml(label)}</a>`;
}

function secondaryButton(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:#ffffff;color:${BRAND.wine};border:1px solid ${BRAND.border};text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:999px;">${escapeHtml(label)}</a>`;
}

function h1(text: string): string {
  return `<h1 style="margin:6px 0 14px 0;font-size:26px;line-height:1.25;font-weight:600;color:${BRAND.ink};">${escapeHtml(text)}</h1>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 14px 0;font-size:15px;line-height:1.65;color:${BRAND.ink};">${escapeHtml(text)}</p>`;
}

/** Preserve the verified letter's paragraph breaks instead of flattening it. */
function letterParagraphs(text: string): string[] {
  return text.trim().split(/\n\s*\n/).map((part) => part.replace(/\s+/g, " ").trim()).filter(Boolean);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type AgentDateEmailReport = {
  setting: string;
  sceneKind?: SceneKind;
  sceneImageUrl?: string;
  reflection?: DateReflection;
  isDemo?: boolean;
  agentName: string;
  counterpartAgentName: string;
  /** Avatar palettes, so the email carries each Agent's visual identity. */
  ownerPalette?: string;
  counterpartPalette?: string;
  /** Absolute URLs to the hosted per-palette character sprites. */
  ownerSpriteUrl?: string;
  counterpartSpriteUrl?: string;
  worldSourceTitle?: string;
  worldSourceUrl?: string;
  activityJournal?: DateActivity;
  totalMoments: number;
  summary: string;
  sparks: string[];
  frictions: string[];
  moments: Array<{
    round: number;
    speakerAgentName: string;
    /** Whether the owner's own agent spoke this moment. Agent names are
     *  user-chosen and can collide, so callers should set this from user ids. */
    isMine?: boolean;
    content: string;
  }>;
};

/**
 * Trim for email. Prefers a sentence boundary so a moment never ends
 * mid-thought, falling back to a word boundary with an ellipsis.
 */
function compactEmailText(value: string, maxLength = 240): string {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  const slice = cleaned.slice(0, maxLength);
  let lastSentenceEnd = -1;
  for (const match of slice.matchAll(/[.!?。!?…]/g)) {
    lastSentenceEnd = match.index;
  }
  if (lastSentenceEnd >= maxLength * 0.45) {
    return slice.slice(0, lastSentenceEnd + 1);
  }
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${base.trimEnd()}…`;
}

type AgentReportCopy = {
  letter: string;
  verdictEncourage: string;
  verdictCurious: string;
  verdictPass: string;
  storyEyebrow: string;
  scene: string;
  agents: string;
  moments: string;
  /** Korean and Japanese attach a counter straight to the numeral. */
  countJoin: string;
  inspiredBy: string;
  summary: string;
  conversation: string;
  stageFirst: string;
  stageMiddle: string;
  stageLast: string;
  spark: string;
  friction: string;
  noSignal: string;
};

function agentReportCopy(locale?: string): AgentReportCopy {
  const language = locale?.split("-")[0] ?? "en";
  return (
    (
      {
        ko: {
          letter: "내 데이트 에이전트가 전하는 말",
          verdictEncourage: "만나보길 추천해요",
          verdictCurious: "조금 더 궁금해요",
          verdictPass: "이번엔 보내줄게요",
          storyEyebrow: "그날의 데이트 이야기",
          scene: "어디서",
          agents: "누가",
          moments: "개의 장면",
          countJoin: "",
          inspiredBy: "이 장면의 영감",
          summary: "그날의 공기",
          conversation: "이런 대화가 오갔어요",
          stageFirst: "처음 마주한 순간",
          stageMiddle: "대화가 깊어질 때",
          stageLast: "헤어지기 전 마지막 말",
          spark: "마음이 움직인 순간",
          friction: "조금 걸렸던 부분",
          noSignal: "아직 또렷한 신호는 없었어요.",
        },
        ja: {
          letter: "デートエージェントからあなたへ",
          verdictEncourage: "会ってみる価値あり",
          verdictCurious: "もう少し知りたい",
          verdictPass: "今回は見送り",
          storyEyebrow: "デートの一部始終",
          scene: "場所",
          agents: "ふたり",
          moments: "シーン",
          countJoin: "",
          inspiredBy: "この場面のヒント",
          summary: "その日の空気",
          conversation: "交わされた言葉",
          stageFirst: "出会いの瞬間",
          stageMiddle: "会話が深まる頃",
          stageLast: "別れ際のひとこと",
          spark: "心が動いた瞬間",
          friction: "少し気になったこと",
          noSignal: "まだはっきりしたサインはありませんでした。",
        },
        de: {
          letter: "Eine Nachricht von deinem Dating-Agenten",
          verdictEncourage: "Ein Treffen lohnt sich",
          verdictCurious: "Noch neugierig",
          verdictPass: "Diesmal loslassen",
          storyEyebrow: "So lief das Date",
          scene: "Ort",
          agents: "Wer",
          moments: "Momente",
          countJoin: " ",
          inspiredBy: "Inspiration der Szene",
          summary: "Die Stimmung",
          conversation: "Das wurde gesagt",
          stageFirst: "Der Anfang",
          stageMiddle: "Als es tiefer ging",
          stageLast: "Die letzten Worte",
          spark: "Was Nähe geschaffen hat",
          friction: "Was noch offen blieb",
          noSignal: "Noch kein klares Signal.",
        },
        fr: {
          letter: "Un mot de votre Agent de rencontre",
          verdictEncourage: "Une rencontre vaut la peine",
          verdictCurious: "Encore curieux",
          verdictPass: "On laisse passer",
          storyEyebrow: "Le rendez-vous, tel qu'il s'est passé",
          scene: "Lieu",
          agents: "Qui",
          moments: "moments",
          countJoin: " ",
          inspiredBy: "Inspiration de la scène",
          summary: "L'ambiance",
          conversation: "Ce qui s'est dit",
          stageFirst: "Les premiers instants",
          stageMiddle: "Quand ça s'approfondit",
          stageLast: "Les derniers mots",
          spark: "Ce qui a créé un élan",
          friction: "Ce qui reste à éclaircir",
          noSignal: "Aucun signal net pour le moment.",
        },
        nl: {
          letter: "Een bericht van je datingagent",
          verdictEncourage: "Het waard om te ontmoeten",
          verdictCurious: "Nog nieuwsgierig",
          verdictPass: "Deze laten gaan",
          storyEyebrow: "Zo verliep de date",
          scene: "Waar",
          agents: "Wie",
          moments: "momenten",
          countJoin: " ",
          inspiredBy: "Inspiratie voor de scène",
          summary: "De sfeer",
          conversation: "Wat er gezegd werd",
          stageFirst: "Het begin",
          stageMiddle: "Toen het dieper ging",
          stageLast: "De laatste woorden",
          spark: "Wat iets losmaakte",
          friction: "Wat nog schuurt",
          noSignal: "Nog geen duidelijk signaal.",
        },
        sv: {
          letter: "Ett meddelande från din dejtingagent",
          verdictEncourage: "Värd att träffa",
          verdictCurious: "Fortfarande nyfiken",
          verdictPass: "Släpper den här",
          storyEyebrow: "Så gick dejten",
          scene: "Var",
          agents: "Vilka",
          moments: "ögonblick",
          countJoin: " ",
          inspiredBy: "Scenens inspiration",
          summary: "Känslan",
          conversation: "Det som sades",
          stageFirst: "Början",
          stageMiddle: "När det djupnade",
          stageLast: "De sista orden",
          spark: "Det som väckte något",
          friction: "Det som fortfarande skaver",
          noSignal: "Ingen tydlig signal ännu.",
        },
      } as Record<string, AgentReportCopy>
    )[language] ?? {
      letter: "A note from your Dating Agent",
      verdictEncourage: "Worth meeting",
      verdictCurious: "Still curious",
      verdictPass: "Letting this one go",
      storyEyebrow: "The date, as it happened",
      scene: "Where",
      agents: "Who",
      moments: "moments",
      countJoin: " ",
      inspiredBy: "Scene inspired by",
      summary: "The atmosphere",
      conversation: "What they said",
      stageFirst: "How it began",
      stageMiddle: "As it deepened",
      stageLast: "The parting words",
      spark: "What created a spark",
      friction: "What still needs care",
      noSignal: "No clear signal yet.",
    }
  );
}

function agentInitial(name: string): string {
  return [...name.trim()][0]?.toUpperCase() ?? "•";
}

/**
 * An Agent's face, email-safe. The remote sprite when we have one, sitting on
 * its palette chip so a client that blocks images still shows the right colour
 * and initial rather than a torn-paper icon.
 */
function agentFaceHtml(
  name: string,
  chip: { bg: string; fg: string },
  spriteUrl: string | undefined,
  size: number,
): string {
  const chipStyle = `width:${size}px;height:${size}px;border-radius:50%;background:${chip.bg};color:${chip.fg};font-size:${Math.round(size * 0.44)}px;font-weight:700;line-height:${size}px;text-align:center;overflow:hidden;`;
  if (!spriteUrl) {
    return `<div style="${chipStyle}">${escapeHtml(agentInitial(name))}</div>`;
  }
  return `<div style="${chipStyle}">
    <img src="${escapeHtml(spriteUrl)}" alt="${escapeHtml(name)}" width="${size}" height="${size}" style="display:block;width:${size}px;height:${size}px;object-fit:cover;object-position:top center;border:0;" />
  </div>`;
}

type AgentLetter = {
  agentName: string;
  ownerPalette?: string;
  spriteUrl?: string;
  /** The agent's own words, first person, unabridged apart from a safety cap. */
  message: string;
  verdict?: "encourage" | "curious" | "pass";
  /** English-only structured reason, e.g. "Strong alignment". */
  detailLabel?: string;
  detail?: string;
  /** "What I'll look for next" — shown after a pass. */
  nextLabel?: string;
  nextNote?: string;
  /** The private debrief reads as a letter; connection notices keep their card. */
  personal?: boolean;
};

/** A small caps field name, the one repeated ornament a report is allowed. */
function fieldLabel(text: string): string {
  return `<div style="font-size:11px;font-weight:700;letter-spacing:.06em;color:${BRAND.muted};">${escapeHtml(text)}</div>`;
}

/** A titled section, separated by a hairline rather than a coloured card. */
/** A label and its value on one line, the way a report states a fact. */
function factRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:0 12px 7px 0;vertical-align:top;white-space:nowrap;">${fieldLabel(label)}</td>
    <td style="padding:0 0 7px 0;vertical-align:top;font-size:13.5px;line-height:1.5;color:${BRAND.ink};">${value}</td>
  </tr>`;
}

/**
 * The Agent's read on the date: who it is, what it concluded, and why, in its
 * own words, following the saved exchange that gave the letter meaning.
 */
function agentLetterHtml(copy: AgentReportCopy, letter: AgentLetter): string {
  const style = letter.verdict
    ? VERDICT_STYLES[letter.verdict]
    : VERDICT_STYLES.encourage;
  const chip = chipFor(letter.ownerPalette, DEFAULT_OWNER_CHIP);
  const badgeLabel = letter.verdict
    ? {
        encourage: copy.verdictEncourage,
        curious: copy.verdictCurious,
        pass: copy.verdictPass,
      }[letter.verdict]
    : null;

  const verdictLine = badgeLabel
    ? `<div style="margin-top:2px;font-size:13px;font-weight:700;color:${style.fg};">${escapeHtml(badgeLabel)}</div>`
    : "";

  // One table, so both labels share a column and the values line up.
  const rows = [
    letter.detailLabel && letter.detail
      ? factRow(letter.detailLabel, escapeHtml(letter.detail))
      : "",
    letter.nextLabel && letter.nextNote
      ? factRow(
          letter.nextLabel,
          escapeHtml(compactEmailText(letter.nextNote, 220)),
        )
      : "",
  ].join("");
  const notes = rows
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:14px;">${rows}</table>`
    : "";

  const paragraphs = letterParagraphs(letter.message).map((paragraph) =>
    `<p style="margin:0 0 14px;font-size:16px;line-height:1.8;color:${BRAND.ink};">${escapeHtml(paragraph)}</p>`,
  ).join("");
  if (letter.personal) {
    return `<div style="margin:0 0 26px;">${paragraphs}
      <div style="font-size:13px;color:${BRAND.muted};">&mdash; ${escapeHtml(letter.agentName)}${badgeLabel ? ` · ${escapeHtml(badgeLabel)}` : ""}</div>${notes}</div>`;
  }

  const body = `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:12px;"><tr>
      <td style="width:52px;vertical-align:middle;">
        ${agentFaceHtml(letter.agentName, chip, letter.spriteUrl, 44)}
      </td>
      <td style="vertical-align:middle;padding-left:12px;">
        <div style="font-size:16px;font-weight:700;color:${BRAND.ink};">${escapeHtml(letter.agentName)}</div>
        ${verdictLine}
      </td>
    </tr></table>
    <div style="font-family:Georgia,'Times New Roman',serif;">${paragraphs}</div>
    <div style="margin-top:10px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:15px;color:${style.fg};">&mdash; ${escapeHtml(letter.agentName)}</div>
    ${notes}`;
  return `<div style="margin:4px 0 20px;">${body}</div>`;
}

/**
 * The two Agents standing where they met, on the product's own dark ground.
 * This is what the owner opened the email for — not a label, the scene. Falls
 * back to initial chips when a sprite is unavailable, never to an empty band.
 */
function worldBandHtml(copy: AgentReportCopy, report: AgentDateEmailReport, includeBrand = true, labels = activityCopy()): string {
  const picture = report.sceneImageUrl;
  const figure = (name: string, sprite: string | undefined, palette: string | undefined) => sprite
    ? `<img src="${escapeHtml(sprite)}" alt="${escapeHtml(name)}" width="68" height="102" style="display:block;width:68px;height:102px;object-fit:contain;border:0;" />`
    : agentFaceHtml(name, chipFor(palette, DEFAULT_OWNER_CHIP), undefined, 48);
  return `${includeBrand ? `<tr><td style="padding:20px 28px;background:#fcfaf7;">
      <table role="presentation" width="100%"><tr><td style="font-family:Georgia,serif;font-style:italic;font-size:24px;">Datehaja</td><td align="right" style="font-size:10px;letter-spacing:.12em;color:${BRAND.muted};">${escapeHtml(copy.letter)}</td></tr></table>
    </td></tr>` : ""}
    ${picture ? `<tr><td style="background:#344a5b;"><img src="${escapeHtml(picture)}" alt="${escapeHtml(report.setting)}" width="520" style="display:block;width:100%;max-width:520px;height:auto;border:0;" /></td></tr>` : ""}
    <tr><td style="background:#f1ece3;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;"><tr>
        <td style="padding:8px 32px 4px;">${figure(report.agentName, report.ownerSpriteUrl, report.ownerPalette)}<div style="font-size:11px;color:${BRAND.muted};padding-top:4px;">${escapeHtml(report.agentName)}</div></td>
        <td style="padding:8px 32px 4px;">${figure(report.counterpartAgentName, report.counterpartSpriteUrl, report.counterpartPalette)}<div style="font-size:11px;color:${BRAND.muted};padding-top:4px;">${escapeHtml(report.counterpartAgentName)}</div></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:12px 28px;background:#f1ece3;font-size:12px;color:#5d5752;">
      <b>${escapeHtml(report.setting)}</b><span style="float:right;">${report.totalMoments} ${escapeHtml(labels.lines)}</span>
      <div style="margin-top:7px;font-size:10px;line-height:1.5;">${escapeHtml(labels.illustration)}</div>
    </td></tr>`;
}

/** Tiny inline face used next to an Agent's name in running text. */
function miniFace(
  chip: { bg: string; fg: string },
  spriteUrl: string | undefined,
): string {
  if (!spriteUrl) return "";
  return `<img src="${escapeHtml(spriteUrl)}" alt="" width="18" height="18" style="vertical-align:-4px;margin-right:4px;border-radius:50%;background:${chip.bg};object-fit:cover;object-position:top center;border:0;" />`;
}

/**
 * One adjacent exchange from the saved transcript, with no repeated summary.
 */
function activityJournalHtml(report: AgentDateEmailReport, labels: ReturnType<typeof activityCopy>, recordUrl?: string): string {
  const journal = report.activityJournal;
  if (!journal) return "";
  return `<div style="margin:0 0 24px;"><h2 style="font-size:20px;line-height:1.4;margin:0 0 12px;">${escapeHtml(labels.heading)}</h2>
    <p style="font-size:14px;line-height:1.8;margin:0 0 22px;">${escapeHtml(journal.overview)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;">${journal.events.slice(0, 4).map((e, i) => `<tr>
      <td style="padding:22px 0 26px;vertical-align:top;border-bottom:1px ${e.kind === "proposal" ? "dashed" : "solid"} #e7dfd3;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td width="32" style="width:32px;vertical-align:middle;"><span style="display:block;width:32px;line-height:32px;text-align:center;border-radius:16px;background:#f1ece3;font-family:monospace;font-size:12px;color:${BRAND.muted};">${String(i + 1).padStart(2, "0")}</span></td>
          <td style="padding-left:14px;vertical-align:middle;font-size:11px;color:${e.kind === "proposal" ? "#896419" : "#58736a"};">${escapeHtml(labels[e.kind])}</td>
        </tr></table>
        <h3 style="font-size:16px;line-height:1.5;margin:14px 0 10px;">${escapeHtml(e.title)}</h3>
        <p style="font-size:14px;line-height:1.85;margin:0 0 18px;">${escapeHtml(e.detail)}</p>
        ${recordUrl ? `<a href="${escapeHtml(recordUrl.split("#")[0])}#turn-${e.rounds[0]}" style="display:inline-block;padding:12px 16px;border:1px solid #d9d0c3;border-radius:10px;background:#fcfaf7;font-size:12px;line-height:20px;text-decoration:none;color:${BRAND.ink};">${escapeHtml(labels.read)}&nbsp; ↗</a>` : ""}
        <div style="margin-top:12px;font-size:11px;line-height:1.6;color:${BRAND.muted};">${e.rounds.map(r => String(r).padStart(2, "0")).join(" · ")}</div>
      </td></tr>`).join("")}</table></div>`;
}

function agentDateReportHtml(_copy: AgentReportCopy, report: AgentDateEmailReport, labels = activityCopy()): string {
  const excerpts = report.moments.slice(0, 4).map((moment) => {
    const mine = moment.isMine ?? moment.speakerAgentName === report.agentName;
    return `<tr><td style="padding:0 0 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="28" valign="top">${miniFace(chipFor(mine ? report.ownerPalette : report.counterpartPalette, DEFAULT_OWNER_CHIP), mine ? report.ownerSpriteUrl : report.counterpartSpriteUrl)}</td>
        <td><div style="font-size:11px;color:${BRAND.muted};margin-bottom:5px;">${String(moment.round).padStart(2, "0")} · ${escapeHtml(moment.speakerAgentName)}</div>
        <div style="background:${mine ? "#f2eee7" : "#eaf0ea"};border-radius:3px 16px 16px 16px;padding:13px 16px;font-size:14px;line-height:1.6;">${escapeHtml(moment.content)}</div></td>
      </tr></table>
    </td></tr>`;
  }).join("");
  return `<div style="margin:0 0 24px;">
    <div style="font-size:11px;letter-spacing:.06em;color:${BRAND.muted};margin-bottom:13px;">${escapeHtml(labels.excerpt)} · ${report.moments.slice(0, 4).length} / ${report.totalMoments}<div style="margin-top:6px;font-size:10px;letter-spacing:0;">${escapeHtml(labels.excerptNote)}</div></div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${excerpts}</table>
  </div>`;
}

function agentLetterText(copy: AgentReportCopy, letter: AgentLetter): string {
  const badgeLabel = letter.verdict
    ? {
        encourage: copy.verdictEncourage,
        curious: copy.verdictCurious,
        pass: copy.verdictPass,
      }[letter.verdict]
    : null;
  const lines = [
    `${copy.letter} — ${letter.agentName}${badgeLabel ? ` · ${badgeLabel}` : ""}`,
    letterParagraphs(letter.message).join("\n\n"),
    `— ${letter.agentName}`,
  ];
  if (letter.detailLabel && letter.detail) {
    lines.push(`${letter.detailLabel}: ${letter.detail}`);
  }
  if (letter.nextLabel && letter.nextNote) {
    lines.push(`${letter.nextLabel}: ${compactEmailText(letter.nextNote, 220)}`);
  }
  return lines.join("\n");
}

function agentDateReportText(copy: AgentReportCopy, report: AgentDateEmailReport, labels = activityCopy()): string {
  return `${report.setting} · ${report.totalMoments} ${labels.lines}\n\n${copy.conversation}\n${report.moments.slice(0, 4).map((moment) => `${moment.speakerAgentName}: ${moment.content}`).join("\n\n")}`;
}

export function safetyEmail(args: {
  firstName: string;
  headline: string;
  body: string;
  url: string;
}): EmailContent {
  return {
    subject: args.headline,
    text: `Hi ${args.firstName},\n\n${args.body}\n\nSafety Center: ${args.url}\n\n— Datehaja Concierge`,
    html: shell(
      h1(args.headline) +
        p(args.body) +
        `<div style="margin-top:16px;">${button(args.url, "Open the Safety Center")}</div>`,
      "You're getting this because it affects your safety on Datehaja.",
    ),
  };
}

/** Auto-reply sent when someone writes back to the Concierge inbox. */
export function conciergeReply(args: {
  firstName: string;
  url: string;
}): EmailContent {
  return {
    subject: "Re: your Dating Agent's date",
    text: `Hi ${args.firstName},

Thanks for writing in — this reached Datehaja Concierge and we've logged it.

A few things you can do straight away from the app:
· Read your Dating Agent's latest date report
· Decide privately whether you want to meet
· Talk the date over with your Dating Agent
· Report someone, or block them
· Pause matching entirely

Open Datehaja: ${args.url}

If this was about safety, use the Report option in the app — it reaches us with the context attached.

— Datehaja Concierge`,
    html: shell(
      h1("We got your message.") +
        p(
          "Thanks for writing in — this reached Datehaja Concierge and we've logged it.",
        ) +
        `<ul style="margin:0 0 14px 0;padding-left:18px;font-size:15px;line-height:1.7;color:${BRAND.ink};">
           <li>Read your Dating Agent's latest date report</li>
           <li>Decide privately whether you want to meet</li>
           <li>Talk the date over with your Dating Agent</li>
           <li>Report someone, or block them</li>
           <li>Pause matching entirely</li>
         </ul>` +
        `<div style="margin-top:4px;">${button(args.url, "Open Datehaja")}</div>` +
        `<p style="margin:18px 0 0 0;font-size:13px;line-height:1.6;color:${BRAND.muted};">If this was about safety, use the Report option in the app — it reaches us with the context attached.</p>`,
      "You're getting this because you emailed Datehaja Concierge.",
    ),
  };
}

export function agentDebriefEmail(args: {
  locale?: string;
  firstName: string;
  agentName: string;
  counterpartAgentName: string;
  verdict: "encourage" | "curious" | "pass";
  reason: string;
  decisionLabel?: string;
  nextSearchNote?: string;
  report: AgentDateEmailReport;
  url: string;
  conversationUrl: string;
  /** Explicit preview delivery: explain the fictional setup and omit live actions. */
  previewNote?: string;
  /** A tested HTTPS preview record; never a local id on the production app. */
  previewUrl?: string;
}): EmailContent {
  const language = args.locale?.split("-")[0] ?? "en";
  const localized = {
    ko: {
      subject: "내 데이트 에이전트가 돌아왔어요 — 비공개 데이트 리포트",
      headline:
        args.verdict === "encourage"
          ? `${args.agentName}: 이 사람은 만나봐도 좋아요`
          : args.verdict === "pass"
            ? `${args.agentName}: 이번 만남은 보내주는 게 좋겠어요`
            : `${args.agentName}: 한 번 더 알아보고 싶어요`,
      greeting: `${args.firstName}, 나 왔어. ${args.counterpartAgentName} 만나고 돌아왔어.`,
      reason: "가장 크게 본 이유",
      next: "다음에는 이런 사람을 찾아볼게요",
      read: "대화와 리포트를 읽고 나서, 만나볼지 나만의 답을 남겨주세요",
      button: "나만의 비공개 리포트 보기",
      talk: `${args.agentName}에게 내 생각 말하기`,
      talkNote:
        "궁금한 점이나 마음에 걸리는 부분을 내 데이트 에이전트에게 말해보세요. 대화 끝에 만나고 싶다면 내가 직접 최종 승인할 수 있어요.",
      privacy:
        "상대 에이전트의 판정과 상대방의 답은 계속 비공개예요. 내 데이트 에이전트가 나 대신 동의할 수는 없어요.",
      footer: "Datehaja 에이전트 데이트에 관한 비공개 서비스 메시지예요.",
      settings:
        "설정에서 이메일 수신 방식을 바꾸거나 매칭을 잠시 멈출 수 있어요.",
    },
    ja: {
      subject: "デートエージェントが戻りました — 非公開デートレポート",
      headline:
        args.verdict === "encourage"
          ? `${args.agentName}は、会ってみる価値があると思っています`
          : args.verdict === "pass"
            ? `${args.agentName}は、今回は見送るのがよいと思っています`
            : `${args.agentName}は、もう少し知りたいと思っています`,
      greeting: `${args.firstName}さん、ただいま。${args.counterpartAgentName}に会ってきたよ。`,
      reason: "最も重要な理由",
      next: "次に探すポイント",
      read: "会話とレポートを読み、非公開で決めてください",
      button: "非公開レポートを開く",
      talk: `${args.agentName}とこのデートについて話す`,
      talkNote:
        "気になる点を自分のデートエージェントに話してください。会いたいと思ったら、会話の最後に自分で承認できます。",
      privacy:
        "相手エージェントの判定と相手の回答は非公開のままです。エージェントがあなたの代わりに同意することはありません。",
      footer: "Datehajaのエージェントデートに関する非公開メッセージです。",
      settings: "メール設定の変更やマッチングの一時停止は設定から行えます。",
    },
    de: {
      subject: "Dein Dating-Agent ist zurück — privater Date-Bericht",
      headline:
        args.verdict === "encourage"
          ? `${args.agentName} findet, ihr solltet euch treffen`
          : args.verdict === "pass"
            ? `${args.agentName} würde dieses Date loslassen`
            : `${args.agentName} ist neugierig zurückgekehrt`,
      greeting: `Hallo ${args.firstName} — ich bin zurück von meinem Date mit ${args.counterpartAgentName}.`,
      reason: "Wichtigster Grund",
      next: "Wonach ich als Nächstes suche",
      read: "Lies das Gespräch und entscheide vertraulich",
      button: "Privaten Bericht öffnen",
      talk: `Mit ${args.agentName} über dieses Date sprechen`,
      talkNote:
        "Besprich offene Fragen mit deinem Dating-Agenten. Wenn du die Person treffen möchtest, bestätigst du am Ende selbst.",
      privacy:
        "Das Urteil des anderen Agents und die Antwort der anderen Person bleiben verborgen. Dein Dating-Agent kann nicht für dich zustimmen.",
      footer: "Eine private Servicenachricht zu deinem Datehaja-Agent.",
      settings:
        "In den Einstellungen kannst du E-Mails ändern oder das Matching pausieren.",
    },
    fr: {
      subject: "Votre Agent de rencontre est de retour — compte rendu privé",
      headline:
        args.verdict === "encourage"
          ? `${args.agentName} pense que vous devriez vous rencontrer`
          : args.verdict === "pass"
            ? `${args.agentName} laisserait passer cette rencontre`
            : `${args.agentName} revient avec curiosité`,
      greeting: `Salut ${args.firstName} — je reviens de mon rendez-vous avec ${args.counterpartAgentName}.`,
      reason: "Raison principale",
      next: "Ce que je chercherai ensuite",
      read: "Lisez la conversation et décidez en privé",
      button: "Ouvrir mon compte rendu privé",
      talk: `Parler de ce rendez-vous avec ${args.agentName}`,
      talkNote:
        "Parlez à votre Agent de rencontre de ce qui vous intrigue ou vous retient. Si vous souhaitez rencontrer cette personne, vous confirmerez vous-même à la fin.",
      privacy:
        "L'avis de l'autre Agent et la réponse de l'autre personne restent secrets. Votre Agent de rencontre ne peut pas consentir à votre place.",
      footer: "Message privé concernant votre Agent de rencontre Datehaja.",
      settings:
        "Dans les réglages, vous pouvez modifier les e-mails ou suspendre les rencontres.",
    },
    nl: {
      subject: "Je datingagent is terug — privéverslag",
      headline:
        args.verdict === "encourage"
          ? `${args.agentName} vindt dat jullie elkaar moeten ontmoeten`
          : args.verdict === "pass"
            ? `${args.agentName} zou deze ontmoeting laten gaan`
            : `${args.agentName} kwam nieuwsgierig terug`,
      greeting: `Hoi ${args.firstName} — ik ben terug van mijn date met ${args.counterpartAgentName}.`,
      reason: "Belangrijkste reden",
      next: "Waar ik hierna naar zoek",
      read: "Lees het gesprek en beslis in alle rust",
      button: "Mijn privéverslag openen",
      talk: `Deze date bespreken met ${args.agentName}`,
      talkNote:
        "Bespreek je vragen of twijfels met je datingagent. Wil je daarna kennismaken, dan bevestig je dat zelf aan het einde.",
      privacy:
        "Het oordeel van de andere Agent en het antwoord van de andere persoon blijven verborgen. Je datingagent kan niet namens jou instemmen.",
      footer: "Een privébericht over je Datehaja-agent.",
      settings:
        "In Instellingen kun je e-mails aanpassen of matching pauzeren.",
    },
    sv: {
      subject: "Din dejtingagent är tillbaka — privat rapport",
      headline:
        args.verdict === "encourage"
          ? `${args.agentName} tycker att ni borde träffas`
          : args.verdict === "pass"
            ? `${args.agentName} skulle släppa den här kontakten`
            : `${args.agentName} kom tillbaka nyfiken`,
      greeting: `Hej ${args.firstName} — jag är tillbaka från min dejt med ${args.counterpartAgentName}.`,
      reason: "Viktigaste skälet",
      next: "Vad jag letar efter nästa gång",
      read: "Läs samtalet och bestäm privat",
      button: "Öppna min privata rapport",
      talk: `Prata om dejten med ${args.agentName}`,
      talkNote:
        "Prata med din dejtingagent om det som känns spännande eller osäkert. Vill du träffas bekräftar du det själv i slutet.",
      privacy:
        "Den andra Agentens omdöme och den andra personens svar förblir dolda. Din dejtingagent kan inte samtycka åt dig.",
      footer: "Ett privat servicemeddelande om din Datehaja-agent.",
      settings: "I Inställningar kan du ändra e-post eller pausa matchningen.",
    },
  }[language] ?? {
    subject: "Your Dating Agent is back — a private debrief",
    headline:
      args.verdict === "encourage"
        ? `${args.agentName} thinks you should meet`
        : args.verdict === "pass"
          ? `${args.agentName} would let this one go`
          : `${args.agentName} came back curious`,
    greeting: `Hi ${args.firstName} — I'm back from my date with ${args.counterpartAgentName}.`,
    reason: "Primary reason",
    next: "What I'll look for next",
    read: "Read the transcript and decide privately",
    button: "Open my private debrief",
    talk: `Talk this date over with ${args.agentName}`,
    talkNote:
      "Tell your Dating Agent what intrigues you or still feels uncertain. If you want to meet, you make the final confirmation yourself at the end.",
    privacy:
      "The other agent's verdict and the other person's answer remain sealed. Your Dating Agent cannot consent for you.",
    footer: "This is a private service message about your Datehaja agent.",
    settings:
      "You can change what Datehaja emails you, or pause matching entirely, in Settings.",
  };

  const copy = agentReportCopy(args.locale);
  const letter: AgentLetter = {
    agentName: args.agentName,
    ownerPalette: args.report.ownerPalette,
    spriteUrl: args.report.ownerSpriteUrl,
    message: args.reason,
    verdict: args.verdict,
    personal: true,

    nextLabel:
      args.verdict === "pass" && args.nextSearchNote
        ? localized.next
        : undefined,
    nextNote:
      args.verdict === "pass" && args.nextSearchNote
        ? args.nextSearchNote
        : undefined,
  };

  const reflection = args.report.reflection;
  const headline = reflection?.headline ?? localized.headline;
  const subject = reflection ? `${args.agentName} · ${headline}` : `${localized.headline} · ${args.report.setting}`;
  const extra = letterExperienceCopy(args.locale);
  const statusNote = args.previewNote ?? (args.report.isDemo ? extra.demo : extra.private);
  const question = reflection?.question;
  const labels = activityCopy(args.locale);
  const recordUrl = args.previewNote ? (args.previewUrl?.startsWith("https://") ? args.previewUrl : undefined) : `${args.url.split("#")[0]}#activity`;
  const recordAction = recordUrl ? `<div style="margin:22px 0 28px;">${button(recordUrl, labels.full + " →")}</div>` : "";
  const journalText = args.report.activityJournal ? `${labels.heading}\n${args.report.activityJournal.overview}\n\n${args.report.activityJournal.events.map((e, i) => `${i + 1}. [${labels[e.kind]}] ${e.title}\n${e.detail} (${e.rounds.join(", ")})`).join("\n\n")}` : "";
  const textActions = args.previewNote ? "" : `\n${localized.talk}: ${args.conversationUrl}\n${extra.replay}: ${args.url}`;
  const text = `${statusNote}\n\n${localized.greeting}\n\n${headline}\n\n${agentLetterText(copy, letter)}\n\n${journalText}\n\n${recordUrl ? `${labels.full}: ${recordUrl}` : ""}\n\n${agentDateReportText(copy, args.report, labels)}\n\n${question ?? ""}${textActions}\n\n${localized.privacy}\n— Datehaja`;
  return {
    subject,
    text,
    html: shell(
      `<div style="font-size:10px;letter-spacing:.09em;color:${BRAND.muted};margin-bottom:12px;">${escapeHtml(statusNote)}</div>` +
      h1(headline) +
      p(localized.greeting) +
      agentLetterHtml(copy, letter) +
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;border-radius:12px;overflow:hidden;">${worldBandHtml(copy, args.report, false, labels)}</table>` +
      activityJournalHtml(args.report, labels, recordUrl) +
      recordAction +
      agentDateReportHtml(copy, args.report, labels) +
      (question ? `<p style="font-size:17px;line-height:1.55;margin:22px 0 14px;font-weight:600;">${escapeHtml(question)}</p>` : "") +
      (args.previewNote ? "" : `<div>${button(args.conversationUrl, localized.talk)}</div>` +
      `<p style="margin:17px 0 0;font-size:13px;"><a style="color:${BRAND.muted};text-decoration:underline;" href="${escapeHtml(args.url)}">${escapeHtml(extra.replay)} ↗</a></p>`) +
      `<p style="margin:22px 0 0;font-size:11px;line-height:1.6;color:${BRAND.muted};">${escapeHtml(localized.privacy)}</p>`,
      localized.footer,
      `<a href="${escapeHtml(new URL("/settings", args.url).href)}" style="color:${BRAND.muted};">${escapeHtml(localized.settings)}</a>`,
    ),
  };
}

export function agentConnectionEmail(args: {
  locale?: string;
  firstName: string;
  counterpartFirstName: string;
  agentReason: string;
  report: AgentDateEmailReport;
  url: string;
  conversationUrl: string;
}): EmailContent {
  const language = args.locale?.split("-")[0] ?? "en";
  const localized = {
    ko: {
      subject: "두 사람이 모두 만나고 싶다고 답했어요",
      headline: "이제 서로를 직접 만나보세요.",
      greeting: `${args.firstName}님, ${args.counterpartFirstName}님과 서로 독립적으로 만남을 선택했어요. 이제 두 사람에게 동시에 연락처가 공개됐어요.`,
      button: "연결 확인하기",
      talk: `${args.report.agentName} 에이전트와 이 만남 이야기하기`,
      note: "에이전트는 추천했고, 결정은 두 사람이 직접 했어요.",
      footer: "Datehaja 연결에 관한 비공개 서비스 메시지예요.",
      settings:
        "설정에서 이메일 수신 방식을 바꾸거나 매칭을 잠시 멈출 수 있어요.",
    },
    ja: {
      subject: "ふたりとも会いたいと答えました",
      headline: "今度は、ふたり自身で会いましょう。",
      greeting: `${args.firstName}さんと${args.counterpartFirstName}さんは、それぞれ独立して紹介を希望しました。連絡先が同時に公開されました。`,
      button: "つながりを確認する",
      talk: `${args.report.agentName}とこの出会いについて話す`,
      note: "エージェントは提案し、決めたのはふたりです。",
      footer: "Datehajaのつながりに関する非公開メッセージです。",
      settings: "メール設定の変更やマッチングの一時停止は設定から行えます。",
    },
    de: {
      subject: "Ihr habt beide Ja gesagt",
      headline: "Jetzt trefft euch als ihr selbst.",
      greeting: `Hallo ${args.firstName}, du und ${args.counterpartFirstName} habt euch unabhängig füreinander entschieden. Die Kontaktdaten sind jetzt für euch beide gleichzeitig sichtbar.`,
      button: "Verbindung öffnen",
      talk: `Mit ${args.report.agentName} darüber sprechen`,
      note: "Die Agents haben empfohlen. Die Entscheidung war eure.",
      footer: "Eine private Servicenachricht zu deiner Datehaja-Verbindung.",
      settings:
        "In den Einstellungen kannst du E-Mails ändern oder das Matching pausieren.",
    },
    fr: {
      subject: "Vous avez tous les deux dit oui",
      headline: "À vous de vous rencontrer maintenant.",
      greeting: `Bonjour ${args.firstName}, ${args.counterpartFirstName} et vous avez choisi cette rencontre séparément. Vos coordonnées sont maintenant visibles au même moment.`,
      button: "Voir la mise en relation",
      talk: `En parler avec ${args.report.agentName}`,
      note: "Les Agents ont conseillé. La décision vous appartenait.",
      footer: "Message privé concernant votre mise en relation Datehaja.",
      settings:
        "Dans les réglages, vous pouvez modifier les e-mails ou suspendre les rencontres.",
    },
    nl: {
      subject: "Jullie hebben allebei ja gezegd",
      headline: "Ontmoet elkaar nu als jezelf.",
      greeting: `Hoi ${args.firstName}, jij en ${args.counterpartFirstName} kozen onafhankelijk voor een kennismaking. Jullie contactgegevens zijn nu tegelijk zichtbaar.`,
      button: "Verbinding openen",
      talk: `Erover praten met ${args.report.agentName}`,
      note: "De Agents adviseerden. De beslissing was van jullie.",
      footer: "Een privébericht over je Datehaja-verbinding.",
      settings:
        "In Instellingen kun je e-mails aanpassen of matching pauzeren.",
    },
    sv: {
      subject: "Ni har båda sagt ja",
      headline: "Nu kan ni träffas som er själva.",
      greeting: `Hej ${args.firstName}, du och ${args.counterpartFirstName} valde varandra oberoende av varandra. Kontaktuppgifterna visas nu för er båda samtidigt.`,
      button: "Öppna kontakten",
      talk: `Prata med ${args.report.agentName} om mötet`,
      note: "Agenterna gav ett råd. Beslutet var ert.",
      footer: "Ett privat servicemeddelande om din Datehaja-kontakt.",
      settings: "I Inställningar kan du ändra e-post eller pausa matchningen.",
    },
  }[language] ?? {
    subject: "Two humans said yes",
    headline: "Now meet as yourselves.",
    greeting: `Hi ${args.firstName}, you and ${args.counterpartFirstName} independently chose an introduction. Contact is now available to both of you at the same time.`,
    button: "Open the connection",
    talk: `Talk it over with ${args.report.agentName}`,
    note: "The agents made a recommendation. The decision was yours.",
    footer: "This is a private service message about your Datehaja connection.",
    settings:
      "You can change what Datehaja emails you, or pause matching entirely, in Settings.",
  };

  const copy = agentReportCopy(args.locale);
  // No verdict badge here: contact opens on two human yeses regardless of the
  // agent's verdict, and a badge could contradict a cautious reason.
  const letter: AgentLetter = {
    agentName: args.report.agentName,
    ownerPalette: args.report.ownerPalette,
    spriteUrl: args.report.ownerSpriteUrl,
    message: args.agentReason,
  };

  const text = `${localized.greeting}

${localized.headline}

${agentLetterText(copy, letter)}

${localized.button}: ${args.url}
${localized.talk}: ${args.conversationUrl}

${localized.note}

— Datehaja`;
  return {
    subject: localized.subject,
    text,
    html: shell(
      h1(localized.headline) +
        p(localized.greeting) +
        agentLetterHtml(copy, letter) +
        `<div style="margin-top:20px;">${button(args.url, localized.button)}</div>` +
        `<div style="margin-top:10px;">${secondaryButton(args.conversationUrl, localized.talk)}</div>` +
        `<p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:${BRAND.muted};">${escapeHtml(localized.note)}</p>`,
      localized.footer,
      localized.settings,
    ),
  };
}
