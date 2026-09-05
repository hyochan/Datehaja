/** Datehaja Concierge email templates. Plain text and HTML, one source of truth. */

export type EmailContent = { subject: string; text: string; html: string };

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
const DEFAULT_COUNTERPART_CHIP = AVATAR_CHIPS.ink;

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
<body style="margin:0;padding:0;background:${BRAND.sand};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${BRAND.ink};">
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
  agentName: string;
  counterpartAgentName: string;
  /** Avatar palettes, so the email carries each Agent's visual identity. */
  ownerPalette?: string;
  counterpartPalette?: string;
  /** Absolute URLs to the hosted per-palette character sprites. */
  ownerSpriteUrl?: string;
  counterpartSpriteUrl?: string;
  worldSourceTitle?: string;
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
          letter: "내 에이전트가 전하는 말",
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
          letter: "エージェントからあなたへ",
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
          letter: "Eine Nachricht von deinem Agent",
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
          letter: "Un mot de votre Agent",
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
          letter: "Een bericht van je Agent",
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
          letter: "Ett meddelande från din Agent",
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
      letter: "A note from your Agent",
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

function stageLabelFor(
  copy: AgentReportCopy,
  index: number,
  total: number,
): string {
  if (index === 0) return copy.stageFirst;
  if (index === total - 1) return copy.stageLast;
  return copy.stageMiddle;
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
};

/** A small caps field name, the one repeated ornament a report is allowed. */
function fieldLabel(text: string): string {
  return `<div style="font-size:11px;font-weight:700;letter-spacing:.06em;color:${BRAND.muted};">${escapeHtml(text)}</div>`;
}

/** A titled section, separated by a hairline rather than a coloured card. */
function section(title: string, body: string, opening = false): string {
  const rule = opening
    ? "padding:0;"
    : `padding:18px 0 0;border-top:1px solid ${BRAND.border};`;
  return `<div style="margin:0;${rule}">
    <div style="margin-bottom:9px;font-size:13px;font-weight:700;color:${BRAND.ink};">${escapeHtml(title)}</div>
    ${body}
  </div>`;
}

/** A label and its value on one line, the way a report states a fact. */
function factRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:0 12px 7px 0;vertical-align:top;white-space:nowrap;">${fieldLabel(label)}</td>
    <td style="padding:0 0 7px 0;vertical-align:top;font-size:13.5px;line-height:1.5;color:${BRAND.ink};">${value}</td>
  </tr>`;
}

/**
 * The Agent's read on the date: who it is, what it concluded, and why, in its
 * own words. This is what the owner opened the email for, so it comes first
 * and is stated plainly rather than dressed as a chat message.
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

  const body = `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:12px;"><tr>
      <td style="width:52px;vertical-align:middle;">
        ${agentFaceHtml(letter.agentName, chip, letter.spriteUrl, 44)}
      </td>
      <td style="vertical-align:middle;padding-left:12px;">
        <div style="font-size:16px;font-weight:700;color:${BRAND.ink};">${escapeHtml(letter.agentName)}</div>
        ${verdictLine}
      </td>
    </tr></table>
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.72;color:${BRAND.ink};">${escapeHtml(compactEmailText(letter.message, 900))}</div>
    <div style="margin-top:10px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:15px;color:${style.fg};">&mdash; ${escapeHtml(letter.agentName)}</div>
    ${notes}`;
  return `<div style="margin:4px 0 20px;">${section(copy.letter, body, true)}</div>`;
}

/**
 * Whether the world's source deserves its own line. The scene is normally
 * written around the source title, and a report that states one fact twice
 * reads as padding.
 */
function showsSource(report: AgentDateEmailReport): boolean {
  const title = report.worldSourceTitle?.trim();
  if (!title) return false;
  return !report.setting.includes(title.slice(0, 40));
}

/**
 * The two Agents standing where they met, on the product's own dark ground.
 * This is what the owner opened the email for — not a label, the scene. Falls
 * back to initial chips when a sprite is unavailable, never to an empty band.
 */
function worldBandHtml(
  copy: AgentReportCopy,
  report: AgentDateEmailReport,
): string {
  const ownerChip = chipFor(report.ownerPalette, DEFAULT_OWNER_CHIP);
  const counterpartChip = chipFor(
    report.counterpartPalette,
    DEFAULT_COUNTERPART_CHIP,
  );
  const figure = (
    name: string,
    chip: { bg: string; fg: string },
    spriteUrl: string | undefined,
  ) =>
    spriteUrl
      ? `<img src="${escapeHtml(spriteUrl)}" alt="${escapeHtml(name)}" width="72" height="104" style="display:block;width:72px;height:104px;object-fit:contain;object-position:bottom center;border:0;" />`
      : agentFaceHtml(name, chip, undefined, 56);
  return `<tr><td style="padding:0;background:#21171d;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#21171d;">
      <tr><td style="padding:22px 32px 0;">
        <div style="font-family:Georgia,serif;font-style:italic;font-size:22px;font-weight:600;color:#fff9f6;">Datehaja</div>
      </td></tr>
      <tr><td align="center" style="padding:14px 32px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:bottom;padding:0 10px;">${figure(report.agentName, ownerChip, report.ownerSpriteUrl)}</td>
          <td style="vertical-align:middle;padding:0 4px 30px;color:#ff9b9a;font-size:18px;letter-spacing:4px;">&middot;&middot;&middot;</td>
          <td style="vertical-align:bottom;padding:0 10px;">${figure(report.counterpartAgentName, counterpartChip, report.counterpartSpriteUrl)}</td>
        </tr></table>
        <div style="margin:-14px auto 0;width:240px;height:22px;border-radius:50%;background:#3d2530;"></div>
      </td></tr>
      <tr><td align="center" style="padding:14px 32px 24px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#b798a3;">${escapeHtml(copy.scene)}</div>
        <div style="margin-top:6px;font-size:14px;line-height:1.5;color:#f3e4e6;">${escapeHtml(compactEmailText(report.setting, 110))}</div>
      </td></tr>
    </table>
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
 * The date itself, written as a report: the facts of the meeting, what the
 * Agent made of the mood, the excerpts that carried the most, and the two
 * signals worth acting on. Everything here also exists in the app, so the
 * email never claims more than the replay.
 */
function agentDateReportHtml(
  copy: AgentReportCopy,
  report: AgentDateEmailReport,
): string {
  const ownerChip = chipFor(report.ownerPalette, DEFAULT_OWNER_CHIP);
  const counterpartChip = chipFor(
    report.counterpartPalette,
    DEFAULT_COUNTERPART_CHIP,
  );

  const moments = `${report.totalMoments}${copy.countJoin}${escapeHtml(copy.moments)}`;
  const facts = [
    factRow(
      copy.agents,
      `<span style="font-weight:600;">${miniFace(ownerChip, report.ownerSpriteUrl)}${escapeHtml(report.agentName)}</span>` +
        `<span style="color:${BRAND.muted};"> \u2194 </span>` +
        `<span style="font-weight:600;">${miniFace(counterpartChip, report.counterpartSpriteUrl)}${escapeHtml(report.counterpartAgentName)}</span>` +
        `<span style="color:${BRAND.muted};"> &middot; ${moments}</span>`,
    ),
    factRow(copy.scene, escapeHtml(compactEmailText(report.setting, 140))),
    // The scene is usually named after the source, so repeating the title
    // underneath it just says the same thing twice.
    showsSource(report)
      ? factRow(
          copy.inspiredBy,
          escapeHtml(compactEmailText(report.worldSourceTitle!, 90)),
        )
      : "",
  ].join("");

  const total = report.moments.length;
  const excerpts = report.moments
    .map((moment, index) => {
      const isOwner =
        moment.isMine ?? moment.speakerAgentName === report.agentName;
      const accent = isOwner ? BRAND.ember : BRAND.muted;
      return `<div style="margin-bottom:14px;">
        <div style="margin-bottom:4px;font-size:11px;font-weight:700;color:${BRAND.muted};">${String(moment.round).padStart(2, "0")} &middot; ${escapeHtml(stageLabelFor(copy, index, total))}</div>
        <div style="padding-left:12px;border-left:2px solid ${accent};">
          <div style="margin-bottom:2px;font-size:12.5px;font-weight:700;color:${accent};">${escapeHtml(moment.speakerAgentName)}</div>
          <div style="font-size:14px;line-height:1.6;color:${BRAND.ink};">${escapeHtml(compactEmailText(moment.content, 240))}</div>
        </div>
      </div>`;
    })
    .join("");

  const signals = `<table role="presentation" cellpadding="0" cellspacing="0">
    ${factRow(copy.spark, escapeHtml(compactEmailText(report.sparks[0] ?? copy.noSignal, 150)))}
    ${factRow(copy.friction, escapeHtml(compactEmailText(report.frictions[0] ?? copy.noSignal, 150)))}
  </table>`;

  return (
    section(
      copy.storyEyebrow,
      `<table role="presentation" cellpadding="0" cellspacing="0" width="100%">${facts}</table>`,
    ) +
    `<div style="height:18px;"></div>` +
    section(
      copy.summary,
      `<div style="font-size:14px;line-height:1.65;color:${BRAND.ink};">${escapeHtml(compactEmailText(report.summary, 300))}</div>
       <div style="height:14px;"></div>${signals}`,
    ) +
    `<div style="height:18px;"></div>` +
    section(copy.conversation, excerpts) +
    `<div style="height:4px;"></div>`
  );
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
    compactEmailText(letter.message, 900),
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

function agentDateReportText(
  copy: AgentReportCopy,
  report: AgentDateEmailReport,
): string {
  const total = report.moments.length;
  const excerpts = report.moments
    .map(
      (moment, index) =>
        `${String(moment.round).padStart(2, "0")} ${stageLabelFor(copy, index, total)}\n${moment.speakerAgentName}: ${compactEmailText(moment.content, 200)}`,
    )
    .join("\n\n");
  const inspiredBy = showsSource(report)
    ? `\n${copy.inspiredBy}: ${compactEmailText(report.worldSourceTitle!, 90)}`
    : "";
  return `${copy.storyEyebrow}
${copy.agents}: ${report.agentName} \u2194 ${report.counterpartAgentName} \u00b7 ${report.totalMoments}${copy.countJoin}${copy.moments}
${copy.scene}: ${compactEmailText(report.setting, 140)}${inspiredBy}

${copy.summary}
${compactEmailText(report.summary, 300)}
${copy.spark}: ${report.sparks[0] ?? copy.noSignal}
${copy.friction}: ${report.frictions[0] ?? copy.noSignal}

${copy.conversation}
${excerpts}`;
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
    subject: "Re: your agent's date",
    text: `Hi ${args.firstName},

Thanks for writing in — this reached Datehaja Concierge and we've logged it.

A few things you can do straight away from the app:
· Read your Agent's latest date report
· Decide privately whether you want to meet
· Talk the date over with your Agent
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
           <li>Read your Agent's latest date report</li>
           <li>Decide privately whether you want to meet</li>
           <li>Talk the date over with your Agent</li>
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
}): EmailContent {
  const language = args.locale?.split("-")[0] ?? "en";
  const localized = {
    ko: {
      subject: "내 에이전트가 돌아왔어요 — 비공개 데이트 리포트",
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
      talk: `${args.agentName} 에이전트와 이 데이트 더 이야기하기`,
      talkNote:
        "궁금한 점이나 마음에 걸리는 부분을 내 에이전트에게 말해보세요. 대화 끝에 만나고 싶다면 내가 직접 최종 승인할 수 있어요.",
      privacy:
        "상대 에이전트의 판정과 상대방의 답은 계속 비공개예요. 내 에이전트가 나 대신 동의할 수는 없어요.",
      footer: "Datehaja 에이전트 데이트에 관한 비공개 서비스 메시지예요.",
      settings:
        "설정에서 이메일 수신 방식을 바꾸거나 매칭을 잠시 멈출 수 있어요.",
    },
    ja: {
      subject: "エージェントが戻りました — 非公開デートレポート",
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
        "気になる点を自分のエージェントに話してください。会いたいと思ったら、会話の最後に自分で承認できます。",
      privacy:
        "相手エージェントの判定と相手の回答は非公開のままです。エージェントがあなたの代わりに同意することはありません。",
      footer: "Datehajaのエージェントデートに関する非公開メッセージです。",
      settings: "メール設定の変更やマッチングの一時停止は設定から行えます。",
    },
    de: {
      subject: "Dein Agent ist zurück — privater Date-Bericht",
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
        "Besprich offene Fragen mit deinem Agent. Wenn du die Person treffen möchtest, bestätigst du am Ende selbst.",
      privacy:
        "Das Urteil des anderen Agents und die Antwort der anderen Person bleiben verborgen. Dein Agent kann nicht für dich zustimmen.",
      footer: "Eine private Servicenachricht zu deinem Datehaja-Agent.",
      settings:
        "In den Einstellungen kannst du E-Mails ändern oder das Matching pausieren.",
    },
    fr: {
      subject: "Votre Agent est de retour — compte rendu privé",
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
        "Parlez à votre Agent de ce qui vous intrigue ou vous retient. Si vous souhaitez rencontrer cette personne, vous confirmerez vous-même à la fin.",
      privacy:
        "L'avis de l'autre Agent et la réponse de l'autre personne restent secrets. Votre Agent ne peut pas consentir à votre place.",
      footer: "Message privé concernant votre Agent Datehaja.",
      settings:
        "Dans les réglages, vous pouvez modifier les e-mails ou suspendre les rencontres.",
    },
    nl: {
      subject: "Je Agent is terug — privéverslag",
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
        "Bespreek je vragen of twijfels met je Agent. Wil je daarna kennismaken, dan bevestig je dat zelf aan het einde.",
      privacy:
        "Het oordeel van de andere Agent en het antwoord van de andere persoon blijven verborgen. Je Agent kan niet namens jou instemmen.",
      footer: "Een privébericht over je Datehaja-agent.",
      settings:
        "In Instellingen kun je e-mails aanpassen of matching pauzeren.",
    },
    sv: {
      subject: "Din Agent är tillbaka — privat rapport",
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
        "Prata med din Agent om det som känns spännande eller osäkert. Vill du träffas bekräftar du det själv i slutet.",
      privacy:
        "Den andra Agentens omdöme och den andra personens svar förblir dolda. Din Agent kan inte samtycka åt dig.",
      footer: "Ett privat servicemeddelande om din Datehaja-agent.",
      settings: "I Inställningar kan du ändra e-post eller pausa matchningen.",
    },
  }[language] ?? {
    subject: "Your agent is back — a private debrief",
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
      "Tell your Agent what intrigues you or still feels uncertain. If you want to meet, you make the final confirmation yourself at the end.",
    privacy:
      "The other agent's verdict and the other person's answer remain sealed. Your agent cannot consent for you.",
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
    detailLabel: args.decisionLabel ? localized.reason : undefined,
    detail: args.decisionLabel,
    nextLabel:
      args.verdict === "pass" && args.nextSearchNote
        ? localized.next
        : undefined,
    nextNote:
      args.verdict === "pass" && args.nextSearchNote
        ? args.nextSearchNote
        : undefined,
  };

  const text = `${localized.greeting}

${agentLetterText(copy, letter)}

${agentDateReportText(copy, args.report)}

${localized.talkNote}
${localized.talk}: ${args.conversationUrl}

${localized.read}: ${args.url}

${localized.privacy}

— Datehaja`;

  return {
    // The Agent's own headline is the subject: what it concluded, in its
    // voice, before the mail is even opened.
    subject: localized.headline,
    text,
    html: shell(
      h1(localized.headline) +
        p(localized.greeting) +
        agentLetterHtml(copy, letter) +
        `<div style="margin:2px 0 26px;">${button(args.conversationUrl, localized.talk)}</div>` +
        agentDateReportHtml(copy, args.report) +
        p(localized.talkNote) +
        `<div style="margin-top:14px;">${secondaryButton(args.url, localized.button)}</div>` +
        `<p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:${BRAND.muted};">${escapeHtml(localized.privacy)}</p>`,
      localized.footer,
      localized.settings,
      worldBandHtml(copy, args.report),
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

${agentDateReportText(copy, args.report)}

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
        agentDateReportHtml(copy, args.report) +
        `<div style="margin-top:20px;">${button(args.url, localized.button)}</div>` +
        `<div style="margin-top:10px;">${secondaryButton(args.conversationUrl, localized.talk)}</div>` +
        `<p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:${BRAND.muted};">${escapeHtml(localized.note)}</p>`,
      localized.footer,
      localized.settings,
    ),
  };
}
