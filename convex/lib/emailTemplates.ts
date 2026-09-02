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

/** Mirror of the app's scene detection so the email shows the same world. */
function sceneEmojiFor(setting: string): string {
  const value = setting.toLowerCase();
  if (/film|movie|cinema|screen|director/.test(value)) return "🎬";
  if (/market|street|stall|night|food/.test(value)) return "🏮";
  if (/book|library|poem|writing|novel/.test(value)) return "📚";
  if (/park|garden|walk|river|flower|outdoor/.test(value)) return "🌿";
  if (/gallery|museum|art|exhibit|painting/.test(value)) return "🖼️";
  return "☕";
}

function shell(
  body: string,
  footerNote: string,
  settingsNote = "You can change what Datehaja emails you, or pause matching entirely, in Settings.",
): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.sand};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${BRAND.ink};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.sand};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid ${BRAND.border};border-radius:18px;overflow:hidden;">
        <tr><td style="padding:28px 32px 8px 32px;">
          <div style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.muted};font-weight:600;">Datehaja</div>
        </td></tr>
        <tr><td style="padding:8px 32px 28px 32px;">${body}</td></tr>
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
 * The agent's face, email-safe. Remote sprite image when we have one (with the
 * palette chip behind it as the blocked-image fallback), initial chip otherwise.
 */
function agentFaceHtml(
  name: string,
  chip: { bg: string; fg: string },
  spriteUrl: string | undefined,
  size: number,
): string {
  if (spriteUrl) {
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${chip.bg};overflow:hidden;text-align:center;">
      <img src="${escapeHtml(spriteUrl)}" alt="${escapeHtml(name)}" width="${size}" height="${size}" style="display:block;width:${size}px;height:${size}px;object-fit:cover;object-position:top center;border:0;" />
    </div>`;
  }
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${chip.bg};color:${chip.fg};font-size:${Math.round(size * 0.45)}px;font-weight:800;line-height:${size}px;text-align:center;">${escapeHtml(agentInitial(name))}</div>`;
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

/**
 * The Agent speaking directly to its human: avatar, name, a clear verdict
 * badge, and the full reason in the Agent's own voice. This leads the email —
 * the agent's read is the thing the owner opened it for.
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

  const badge = badgeLabel
    ? `<span style="display:inline-block;margin-top:5px;background:#ffffff;border:1px solid ${style.accent};color:${style.fg};font-size:12px;font-weight:700;padding:3px 11px;border-radius:999px;">${escapeHtml(badgeLabel)}</span>`
    : "";

  const detail =
    letter.detailLabel && letter.detail
      ? `<div style="margin-top:10px;font-size:12px;font-weight:600;color:${style.fg};">${escapeHtml(letter.detailLabel)} · ${escapeHtml(letter.detail)}</div>`
      : "";

  const next =
    letter.nextLabel && letter.nextNote
      ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(22,18,27,.09);">
          <div style="margin-bottom:4px;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${style.fg};">${escapeHtml(letter.nextLabel)}</div>
          <div style="font-size:13px;line-height:1.6;color:${BRAND.ink};">${escapeHtml(compactEmailText(letter.nextNote, 220))}</div>
        </div>`
      : "";

  return `<div style="margin:20px 0 14px;background:${style.bg};border-radius:18px;padding:18px 18px 16px;">
    <div style="margin-bottom:12px;font-size:11px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:${style.fg};">${escapeHtml(copy.letter)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="width:62px;vertical-align:top;">
        ${agentFaceHtml(letter.agentName, chip, letter.spriteUrl, 52)}
      </td>
      <td style="vertical-align:middle;padding-left:8px;">
        <div style="font-size:17px;font-weight:700;color:${BRAND.ink};">${escapeHtml(letter.agentName)}</div>
        ${badge}
      </td>
    </tr></table>
    <div style="margin:10px 0 0 16px;width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-bottom:10px solid #ffffff;"></div>
    <div style="background:#ffffff;border-radius:4px 16px 16px 16px;padding:14px 16px;">
      <div style="font-size:15px;line-height:1.7;color:${BRAND.ink};">“${escapeHtml(compactEmailText(letter.message, 640))}”</div>
      ${detail}${next}
    </div>
  </div>`;
}

/** Tiny inline face used next to an Agent's name in running text. */
function miniFace(
  chip: { bg: string; fg: string },
  spriteUrl: string | undefined,
): string {
  if (!spriteUrl) return "";
  return `<img src="${escapeHtml(spriteUrl)}" alt="" width="18" height="18" style="vertical-align:-4px;margin-right:3px;border-radius:50%;background:${chip.bg};object-fit:cover;object-position:top center;border:0;" />`;
}

/**
 * The date as a story: the scene the Agents met in, the mood, a three-beat
 * timeline of what was actually said, and what sparked or snagged. Everything
 * here also exists in the app, so the email never claims more than the replay.
 */
function agentDateStoryHtml(
  copy: AgentReportCopy,
  report: AgentDateEmailReport,
): string {
  const ownerChip = chipFor(report.ownerPalette, DEFAULT_OWNER_CHIP);
  const counterpartChip = chipFor(
    report.counterpartPalette,
    DEFAULT_COUNTERPART_CHIP,
  );
  const emoji = sceneEmojiFor(report.setting);

  const inspiredBy = report.worldSourceTitle
    ? `<div style="margin-top:6px;font-size:11px;color:${BRAND.muted};">${escapeHtml(copy.inspiredBy)}: ${escapeHtml(compactEmailText(report.worldSourceTitle, 90))}</div>`
    : "";

  const sceneBanner = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;background:#fff7f2;border-radius:14px;">
    <tr>
      <td style="width:62px;padding:14px 0 14px 14px;vertical-align:top;">
        <div style="width:44px;height:44px;border-radius:50%;background:#ffffff;border:1px solid ${BRAND.border};font-size:22px;line-height:44px;text-align:center;">${emoji}</div>
      </td>
      <td style="padding:13px 14px 13px 10px;vertical-align:top;">
        <div style="margin-bottom:3px;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${BRAND.muted};">${escapeHtml(copy.scene)}</div>
        <div style="font-size:14px;line-height:1.45;font-weight:700;color:${BRAND.ink};">${escapeHtml(compactEmailText(report.setting, 110))}</div>
        <div style="margin-top:6px;font-size:12px;font-weight:600;color:${BRAND.ember};">${miniFace(ownerChip, report.ownerSpriteUrl)}${escapeHtml(report.agentName)} ↔ ${miniFace(counterpartChip, report.counterpartSpriteUrl)}${escapeHtml(report.counterpartAgentName)} · ${report.totalMoments} ${escapeHtml(copy.moments)}</div>
        ${inspiredBy}
      </td>
    </tr>
  </table>`;

  const narration = `<div style="margin:0 2px 16px;">
    <div style="margin-bottom:4px;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${BRAND.muted};">${escapeHtml(copy.summary)}</div>
    <div style="font-size:14px;line-height:1.65;color:${BRAND.ink};">${escapeHtml(compactEmailText(report.summary, 300))}</div>
  </div>`;

  const total = report.moments.length;
  const timeline = report.moments
    .map((moment, index) => {
      const isOwner =
        moment.isMine ?? moment.speakerAgentName === report.agentName;
      const chip = isOwner ? ownerChip : counterpartChip;
      const spriteUrl = isOwner
        ? report.ownerSpriteUrl
        : report.counterpartSpriteUrl;
      const bubbleBg = isOwner ? BRAND.blush : "#f7f4f0";
      return `<tr>
        <td style="width:40px;vertical-align:top;padding:17px 0 0;">
          ${agentFaceHtml(moment.speakerAgentName, chip, spriteUrl, 30)}
        </td>
        <td style="padding:0 0 14px 8px;vertical-align:top;">
          <div style="margin-bottom:3px;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${BRAND.muted};">${String(moment.round).padStart(2, "0")} · ${escapeHtml(stageLabelFor(copy, index, total))}</div>
          <div style="background:${bubbleBg};border-radius:4px 12px 12px 12px;padding:11px 14px;">
            <div style="margin-bottom:3px;font-size:12px;font-weight:700;color:${chip.fg};">${escapeHtml(moment.speakerAgentName)}</div>
            <div style="font-size:14px;line-height:1.6;color:${BRAND.ink};">${escapeHtml(compactEmailText(moment.content, 240))}</div>
          </div>
        </td>
      </tr>`;
    })
    .join("");

  const signalCard = (
    emojiMark: string,
    label: string,
    value: string,
    bg: string,
    fg: string,
  ) =>
    `<td width="50%" style="padding:0 5px 0 0;vertical-align:top;">
      <div style="min-height:88px;background:${bg};border-radius:14px;padding:13px 14px;">
        <div style="margin-bottom:6px;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:${fg};">${emojiMark} ${escapeHtml(label)}</div>
        <div style="font-size:13px;line-height:1.55;font-weight:600;color:${BRAND.ink};">${escapeHtml(compactEmailText(value, 130))}</div>
      </div>
    </td>`;

  return `<div style="margin:0 0 20px;border:1px solid ${BRAND.border};border-radius:18px;padding:18px 18px 14px;background:#ffffff;">
    <div style="margin-bottom:13px;font-size:11px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:${BRAND.ember};">${escapeHtml(copy.storyEyebrow)}</div>
    ${sceneBanner}
    ${narration}
    <div style="margin:0 0 9px;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${BRAND.muted};">${escapeHtml(copy.conversation)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${timeline}</table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:2px;"><tr>
      ${signalCard("✨", copy.spark, report.sparks[0] ?? copy.noSignal, BRAND.sage, "#2f6b3a")}
      ${signalCard("🌱", copy.friction, report.frictions[0] ?? copy.noSignal, BRAND.blush, "#a34f2a")}
    </tr></table>
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
    `“${compactEmailText(letter.message, 640)}”`,
  ];
  if (letter.detailLabel && letter.detail) {
    lines.push(`${letter.detailLabel}: ${letter.detail}`);
  }
  if (letter.nextLabel && letter.nextNote) {
    lines.push(`${letter.nextLabel}: ${compactEmailText(letter.nextNote, 220)}`);
  }
  return lines.join("\n");
}

function agentDateStoryText(
  copy: AgentReportCopy,
  report: AgentDateEmailReport,
): string {
  const total = report.moments.length;
  const timeline = report.moments
    .map(
      (moment, index) =>
        `${moment.round}. ${stageLabelFor(copy, index, total)} · ${moment.speakerAgentName}: “${compactEmailText(moment.content, 200)}”`,
    )
    .join("\n");
  const inspiredBy = report.worldSourceTitle
    ? `\n${copy.inspiredBy}: ${compactEmailText(report.worldSourceTitle, 90)}`
    : "";
  return `${copy.storyEyebrow}
${sceneEmojiFor(report.setting)} ${copy.scene}: ${report.setting}
${copy.agents}: ${report.agentName} ↔ ${report.counterpartAgentName} · ${report.totalMoments} ${copy.moments}${inspiredBy}
${copy.summary}: ${compactEmailText(report.summary, 300)}

${copy.conversation}
${timeline}

✨ ${copy.spark}: ${report.sparks[0] ?? copy.noSignal}
🌱 ${copy.friction}: ${report.frictions[0] ?? copy.noSignal}`;
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
      greeting: `${args.firstName}님, ${args.agentName}와 ${args.counterpartAgentName}가 가상 데이트를 마치고 돌아왔어요.`,
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
      greeting: `${args.firstName}さん、${args.agentName}と${args.counterpartAgentName}がバーチャルデートから戻りました。`,
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
      greeting: `Hallo ${args.firstName}, ${args.agentName} und ${args.counterpartAgentName} sind von ihrem virtuellen Date zurück.`,
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
      greeting: `Bonjour ${args.firstName}, ${args.agentName} et ${args.counterpartAgentName} sont revenus de leur rendez-vous virtuel.`,
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
      greeting: `Hoi ${args.firstName}, ${args.agentName} en ${args.counterpartAgentName} zijn terug van hun virtuele date.`,
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
      greeting: `Hej ${args.firstName}, ${args.agentName} och ${args.counterpartAgentName} är tillbaka från sin virtuella dejt.`,
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
    greeting: `Hi ${args.firstName}, ${args.agentName} and ${args.counterpartAgentName} are back from their virtual date.`,
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

${agentDateStoryText(copy, args.report)}

${localized.talkNote}
${localized.talk}: ${args.conversationUrl}

${localized.read}: ${args.url}

${localized.privacy}

— Datehaja`;

  return {
    subject: localized.subject,
    text,
    html: shell(
      h1(localized.headline) +
        p(localized.greeting) +
        agentLetterHtml(copy, letter) +
        agentDateStoryHtml(copy, args.report) +
        p(localized.talkNote) +
        `<div style="margin-top:20px;">${button(args.conversationUrl, localized.talk)}</div>` +
        `<div style="margin-top:10px;">${secondaryButton(args.url, localized.button)}</div>` +
        `<p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:${BRAND.muted};">${escapeHtml(localized.privacy)}</p>`,
      localized.footer,
      localized.settings,
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

${agentDateStoryText(copy, args.report)}

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
        agentDateStoryHtml(copy, args.report) +
        `<div style="margin-top:20px;">${button(args.url, localized.button)}</div>` +
        `<div style="margin-top:10px;">${secondaryButton(args.conversationUrl, localized.talk)}</div>` +
        `<p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:${BRAND.muted};">${escapeHtml(localized.note)}</p>`,
      localized.footer,
      localized.settings,
    ),
  };
}
