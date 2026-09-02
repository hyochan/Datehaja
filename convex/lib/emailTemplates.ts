/** Datehaja Concierge email templates. Plain text and HTML, one source of truth. */

export type EmailContent = { subject: string; text: string; html: string };

const BRAND = {
  ink: "#16121b",
  sand: "#fcfaf7",
  ember: "#d4552b",
  wine: "#281820",
  rose: "#ff9b9f",
  blush: "#fff0ed",
  sage: "#d9efd9",
  muted: "#7a7183",
  border: "#ece4d9",
};

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

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:7px 0;font-size:13px;color:${BRAND.muted};width:118px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:7px 0;font-size:15px;color:${BRAND.ink};font-weight:500;">${escapeHtml(value)}</td>
  </tr>`;
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
  totalMoments: number;
  summary: string;
  sparks: string[];
  frictions: string[];
  moments: Array<{
    round: number;
    speakerAgentName: string;
    content: string;
  }>;
};

function compactEmailText(value: string, maxLength = 170): string {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length <= maxLength
    ? clean
    : `${clean.slice(0, maxLength - 1).trimEnd()}…`;
}

function agentDateReportCopy(locale?: string) {
  const language = locale?.split("-")[0] ?? "en";
  return (
    {
      ko: {
        eyebrow: "에이전트 데이트 기록",
        scene: "어디서",
        agents: "누가",
        moments: "개의 장면",
        summary: "데이트 분위기",
        conversation: "이런 대화를 나눴어요",
        spark: "마음이 움직인 순간",
        friction: "조금 걸렸던 부분",
        privateRead: "내 에이전트의 한마디",
        noSignal: "아직 또렷한 신호는 없었어요.",
      },
      ja: {
        eyebrow: "エージェントデート記録",
        scene: "場所",
        agents: "ふたり",
        moments: "シーン",
        summary: "デートの空気",
        conversation: "こんな話をしました",
        spark: "心が動いた瞬間",
        friction: "少し気になったこと",
        privateRead: "私のエージェントの見立て",
        noSignal: "まだはっきりしたサインはありませんでした。",
      },
      de: {
        eyebrow: "Agent-Date-Protokoll",
        scene: "Ort",
        agents: "Wer",
        moments: "Momente",
        summary: "Stimmung",
        conversation: "Darüber haben sie gesprochen",
        spark: "Was Nähe geschaffen hat",
        friction: "Was noch offen blieb",
        privateRead: "Die Einschätzung deines Agents",
        noSignal: "Noch kein klares Signal.",
      },
      fr: {
        eyebrow: "Carnet du rendez-vous des Agents",
        scene: "Lieu",
        agents: "Qui",
        moments: "moments",
        summary: "Ambiance",
        conversation: "Ce qu'ils se sont raconté",
        spark: "Ce qui a créé un élan",
        friction: "Ce qui reste à éclaircir",
        privateRead: "L'avis de votre Agent",
        noSignal: "Aucun signal net pour le moment.",
      },
      nl: {
        eyebrow: "Verslag van de Agent-date",
        scene: "Waar",
        agents: "Wie",
        moments: "momenten",
        summary: "Sfeer",
        conversation: "Waar ze over praatten",
        spark: "Wat iets losmaakte",
        friction: "Wat nog schuurt",
        privateRead: "De kijk van je Agent",
        noSignal: "Nog geen duidelijk signaal.",
      },
      sv: {
        eyebrow: "Anteckningar från Agent-dejten",
        scene: "Var",
        agents: "Vilka",
        moments: "ögonblick",
        summary: "Känslan",
        conversation: "Det här pratade de om",
        spark: "Det som väckte något",
        friction: "Det som fortfarande skaver",
        privateRead: "Din Agents läsning",
        noSignal: "Ingen tydlig signal ännu.",
      },
    }[language] ?? {
      eyebrow: "Agent date notes",
      scene: "Where",
      agents: "Who",
      moments: "moments",
      summary: "The atmosphere",
      conversation: "What they talked about",
      spark: "What created a spark",
      friction: "What still needs care",
      privateRead: "Your Agent's read",
      noSignal: "No clear signal yet.",
    }
  );
}

function agentDateReportText(
  locale: string | undefined,
  report: AgentDateEmailReport,
  privateRead: string,
): string {
  const copy = agentDateReportCopy(locale);
  const moments = report.moments
    .map(
      (moment) =>
        `${String(moment.round).padStart(2, "0")} · ${moment.speakerAgentName}: ${compactEmailText(moment.content)}`,
    )
    .join("\n");
  return `${copy.eyebrow}
${copy.scene}: ${report.setting}
${copy.agents}: ${report.agentName} ↔ ${report.counterpartAgentName}
${report.totalMoments} ${copy.moments}

${copy.summary}: ${report.summary}

${copy.conversation}
${moments}

${copy.spark}: ${report.sparks[0] ?? copy.noSignal}
${copy.friction}: ${report.frictions[0] ?? copy.noSignal}
${copy.privateRead}: ${privateRead}`;
}

function agentDateReportHtml(
  locale: string | undefined,
  report: AgentDateEmailReport,
  privateRead: string,
): string {
  const copy = agentDateReportCopy(locale);
  const moments = report.moments
    .map(
      (moment) => `<tr><td style="padding:0 0 12px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#34242d;border:1px solid #4c3541;border-radius:14px;">
          <tr>
            <td style="width:42px;padding:14px 0 14px 14px;vertical-align:top;color:${BRAND.rose};font-size:11px;font-weight:700;letter-spacing:.08em;">${String(moment.round).padStart(2, "0")}</td>
            <td style="padding:12px 14px 13px 10px;vertical-align:top;">
              <div style="margin-bottom:4px;color:#ffb2b5;font-size:12px;font-weight:700;">${escapeHtml(moment.speakerAgentName)}</div>
              <div style="color:#fff8f5;font-size:14px;line-height:1.55;">${escapeHtml(compactEmailText(moment.content))}</div>
            </td>
          </tr>
        </table>
      </td></tr>`,
    )
    .join("");

  const signalCard = (label: string, value: string, color: string) =>
    `<td width="50%" style="padding:0 5px 0 0;vertical-align:top;">
      <div style="min-height:92px;background:${color};border-radius:14px;padding:14px;">
        <div style="margin-bottom:7px;color:${BRAND.muted};font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">${escapeHtml(label)}</div>
        <div style="color:${BRAND.ink};font-size:13px;line-height:1.5;font-weight:600;">${escapeHtml(compactEmailText(value, 120))}</div>
      </div>
    </td>`;

  return `<div style="margin:22px 0 20px;background:${BRAND.wine};border-radius:20px;padding:20px;box-shadow:0 16px 34px rgba(40,24,32,.14);">
    <div style="margin-bottom:14px;color:${BRAND.rose};font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;">${escapeHtml(copy.eyebrow)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;border-collapse:separate;border-spacing:0;">
      <tr>
        <td style="width:62%;padding:14px;background:#fff7f2;border-radius:14px 0 0 14px;vertical-align:top;">
          <div style="margin-bottom:5px;color:${BRAND.muted};font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">${escapeHtml(copy.scene)}</div>
          <div style="color:${BRAND.ink};font-size:14px;line-height:1.45;font-weight:700;">${escapeHtml(compactEmailText(report.setting, 100))}</div>
        </td>
        <td style="padding:14px;background:${BRAND.blush};border-left:1px solid #ead8d3;border-radius:0 14px 14px 0;vertical-align:top;">
          <div style="margin-bottom:5px;color:${BRAND.muted};font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">${escapeHtml(copy.agents)}</div>
          <div style="color:${BRAND.ink};font-size:13px;line-height:1.45;font-weight:700;">${escapeHtml(report.agentName)} ↔ ${escapeHtml(report.counterpartAgentName)}</div>
          <div style="margin-top:5px;color:${BRAND.ember};font-size:11px;font-weight:700;">${report.totalMoments} ${escapeHtml(copy.moments)}</div>
        </td>
      </tr>
    </table>
    <div style="margin:0 0 18px;padding:0 2px;">
      <div style="margin-bottom:5px;color:#d9c5ce;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">${escapeHtml(copy.summary)}</div>
      <div style="color:#eadce2;font-size:13px;line-height:1.6;">${escapeHtml(compactEmailText(report.summary, 220))}</div>
    </div>
    <div style="margin:0 0 10px;color:#d9c5ce;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">${escapeHtml(copy.conversation)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${moments}</table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;"><tr>
      ${signalCard(copy.spark, report.sparks[0] ?? copy.noSignal, BRAND.sage)}
      ${signalCard(copy.friction, report.frictions[0] ?? copy.noSignal, BRAND.blush)}
    </tr></table>
    <div style="margin-top:10px;background:#fffaf7;border-radius:14px;padding:15px 16px;">
      <div style="margin-bottom:6px;color:${BRAND.ember};font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;">${escapeHtml(copy.privateRead)}</div>
      <div style="color:${BRAND.ink};font-size:14px;line-height:1.55;font-weight:600;">${escapeHtml(compactEmailText(privateRead, 220))}</div>
    </div>
  </div>`;
}

export type DropEmailData = {
  firstName: string;
  when: string;
  area: string;
  city: string;
  theme: string;
  costLabel: string;
  whyItFits: string;
  matchPreview: string;
  url: string;
};

export function welcomeEmail(args: {
  firstName: string;
  url: string;
}): EmailContent {
  const subject = "You're ready for your first date";
  const text = `Hi ${args.firstName},

You're set up. From here, Datehaja only needs one thing from you: when you're free.

We'll look for someone compatible in your area, plan a real date at a real place, and send it to you both privately. You say yes or pass. Nobody gets your email address, your phone number, or your exact location — not even your match.

Open Datehaja: ${args.url}

— Datehaja Concierge`;

  return {
    subject,
    text,
    html: shell(
      h1("You're set up.") +
        p(
          `Hi ${args.firstName}, from here Datehaja only needs one thing from you: when you're free.`,
        ) +
        p(
          "We'll look for someone compatible nearby, plan a real date at a real place, and send it to you both privately. You say yes or pass.",
        ) +
        p(
          "Nobody gets your email address, your phone number, or your exact location — not even your match.",
        ) +
        `<div style="margin-top:20px;">${button(args.url, "Add your availability")}</div>`,
      "You're getting this because you created a Datehaja account.",
    ),
  };
}

export function invitationEmail(d: DropEmailData): EmailContent {
  const subject = `Your date plan is ready — ${d.when}, ${d.area}`;
  const text = `Hi ${d.firstName},

Your date plan is ready.

${d.when}
${d.area}, ${d.city}
${d.theme}
About ${d.costLabel} per person

Why we think this one fits:
${d.whyItFits}

Who you'd be meeting:
${d.matchPreview}

Accept or pass: ${d.url}

If you pass, nothing happens to your profile and they never find out it was you.

— Datehaja Concierge`;

  return {
    subject,
    text,
    html: shell(
      h1("Your date plan is ready.") +
        `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:4px 0 18px 0;border-top:1px solid ${BRAND.border};">
          ${detailRow("When", d.when)}
          ${detailRow("Where", `${d.area}, ${d.city}`)}
          ${detailRow("The plan", d.theme)}
          ${detailRow("Roughly", `${d.costLabel} per person`)}
        </table>` +
        p(d.whyItFits) +
        `<div style="background:${BRAND.sand};border:1px solid ${BRAND.border};border-radius:12px;padding:14px 16px;margin:0 0 18px 0;">
           <div style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.muted};font-weight:600;margin-bottom:6px;">Who you'd be meeting</div>
           <div style="font-size:15px;line-height:1.6;">${escapeHtml(d.matchPreview)}</div>
         </div>` +
        `<div style="margin-top:4px;">${button(d.url, "Open your date plan")}</div>` +
        `<p style="margin:18px 0 0 0;font-size:13px;line-height:1.6;color:${BRAND.muted};">If you pass, nothing happens to your profile and they never find out it was you.</p>`,
      "You're getting this because you asked Datehaja to find you a date.",
    ),
  };
}

export function acceptedWaitingEmail(d: DropEmailData): EmailContent {
  const subject = `You're in — ${d.when}, ${d.area}`;
  const text = `Hi ${d.firstName},

You're in for ${d.when} in ${d.area}.

We're waiting on the other person. If they pass, we'll look for someone else who fits this same plan — you don't need to do anything.

If we can't find the right person in time, we'll cancel rather than force a bad match, and we'll tell you.

Your date plan: ${d.url}

— Datehaja Concierge`;

  return {
    subject,
    text,
    html: shell(
      h1("You're in.") +
        p(`${d.when} · ${d.area}, ${d.city}`) +
        p(
          "We're waiting on the other person. If they pass, we'll look for someone else who fits this same plan — you don't need to do anything.",
        ) +
        p(
          "If we can't find the right person in time, we'll cancel rather than force a bad match, and we'll tell you.",
        ) +
        `<div style="margin-top:16px;">${button(d.url, "View your date plan")}</div>`,
      "You're getting this because you accepted a date plan.",
    ),
  };
}

export function confirmedEmail(
  d: DropEmailData & { venue: string; address: string; instructions: string },
): EmailContent {
  const subject = `It's a date — ${d.when}, ${d.area}`;
  const text = `Hi ${d.firstName},

It's a date.

${d.when}
${d.venue}
${d.address}
${d.theme}
About ${d.costLabel} per person

${d.instructions}

You're meeting: ${d.matchPreview}

Full details: ${d.url}

You won't need to exchange numbers. If something changes, use the date plan page — there are a few one-tap messages for exactly that.

— Datehaja Concierge`;

  return {
    subject,
    text,
    html: shell(
      h1("It's a date.") +
        `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:4px 0 18px 0;border-top:1px solid ${BRAND.border};">
          ${detailRow("When", d.when)}
          ${detailRow("Where", d.venue)}
          ${detailRow("Address", d.address)}
          ${detailRow("The plan", d.theme)}
          ${detailRow("Roughly", `${d.costLabel} per person`)}
          ${detailRow("Meeting", d.matchPreview)}
        </table>` +
        p(d.instructions) +
        `<div style="margin-top:4px;">${button(d.url, "See the full plan")}</div>` +
        `<p style="margin:18px 0 0 0;font-size:13px;line-height:1.6;color:${BRAND.muted};">You won't need to exchange numbers. If something changes, use the date plan page — there are a few one-tap messages for exactly that.</p>`,
      "You're getting this because your date was confirmed.",
    ),
  };
}

export function reminderEmail(
  d: DropEmailData & { venue: string; address: string },
): EmailContent {
  const subject = `Tomorrow: your date in ${d.area}`;
  const text = `Hi ${d.firstName},

Quick reminder — your date is coming up.

${d.when}
${d.venue}
${d.address}

Details: ${d.url}

If you can't make it, cancel from the date plan page so we can tell them properly.

— Datehaja Concierge`;

  return {
    subject,
    text,
    html: shell(
      h1("Coming up.") +
        `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:4px 0 18px 0;border-top:1px solid ${BRAND.border};">
          ${detailRow("When", d.when)}
          ${detailRow("Where", d.venue)}
          ${detailRow("Address", d.address)}
        </table>` +
        `<div style="margin-top:4px;">${button(d.url, "View details")}</div>` +
        `<p style="margin:18px 0 0 0;font-size:13px;line-height:1.6;color:${BRAND.muted};">If you can't make it, cancel from the date plan page so we can tell them properly.</p>`,
      "You're getting this because you have a confirmed date.",
    ),
  };
}

export function expiredEmail(d: DropEmailData): EmailContent {
  const subject = `We cancelled your ${d.when} date plan`;
  const text = `Hi ${d.firstName},

We couldn't find the right person for your ${d.when} date in ${d.area}, so we cancelled it rather than force a poor match.

Your availability is still open and we'll keep looking for the next one.

— Datehaja Concierge`;

  return {
    subject,
    text,
    html: shell(
      h1("We cancelled this one.") +
        p(
          `We couldn't find the right person for your ${d.when} date in ${d.area}, so we cancelled it rather than force a poor match.`,
        ) +
        p(
          "Your availability is still open and we'll keep looking for the next one.",
        ) +
        `<div style="margin-top:16px;">${button(d.url, "Open Datehaja")}</div>`,
      "You're getting this because you accepted a date plan that didn't fill.",
    ),
  };
}

export function cancelledEmail(
  d: DropEmailData & { reason: string },
): EmailContent {
  const subject = `Your ${d.when} date was cancelled`;
  const text = `Hi ${d.firstName},

Your date on ${d.when} in ${d.area} was cancelled.

${d.reason}

Your availability is still open — we'll keep looking.

— Datehaja Concierge`;

  return {
    subject,
    text,
    html: shell(
      h1("That date was cancelled.") +
        p(`${d.when} · ${d.area}, ${d.city}`) +
        p(d.reason) +
        p("Your availability is still open — we'll keep looking.") +
        `<div style="margin-top:16px;">${button(d.url, "Open Datehaja")}</div>`,
      "You're getting this because you were part of a cancelled date plan.",
    ),
  };
}

export function updatedEmail(d: DropEmailData): EmailContent {
  const subject = `Your ${d.when} date plan changed a little`;
  const text = `Hi ${d.firstName},

We adjusted your date plan so it works for both of you.

${d.when}
${d.area}, ${d.city}
${d.theme}

Have a look: ${d.url}

— Datehaja Concierge`;

  return {
    subject,
    text,
    html: shell(
      h1("Small change to your date plan.") +
        p("We adjusted the plan so it works for both of you.") +
        `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:4px 0 18px 0;border-top:1px solid ${BRAND.border};">
          ${detailRow("When", d.when)}
          ${detailRow("Where", `${d.area}, ${d.city}`)}
          ${detailRow("The plan", d.theme)}
        </table>` +
        `<div style="margin-top:4px;">${button(d.url, "See what changed")}</div>`,
      "You're getting this because you're part of this date plan.",
    ),
  };
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

export function trustedContactPlanEmail(args: {
  contactName: string;
  memberFirstName: string;
  when: string;
  venue: string;
  address: string;
}): EmailContent {
  const subject = `${args.memberFirstName} shared a safety plan from Datehaja`;
  const text = `Hi ${args.contactName},

${args.memberFirstName} chose you as their trusted contact and asked Datehaja to share this plan.

When: ${args.when}
Public venue: ${args.venue}
Address: ${args.address}

This message does not include the other person's identity or contact details. Datehaja will never ask you for money, a password, or a verification code.

— Datehaja Concierge`;

  return {
    subject,
    text,
    html: shell(
      h1(`${args.memberFirstName} shared their plan.`) +
        p(
          `Hi ${args.contactName}, ${args.memberFirstName} chose you as their trusted contact and asked Datehaja to send this safety note.`,
        ) +
        `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:4px 0 18px 0;border-top:1px solid ${BRAND.border};">
          ${detailRow("When", args.when)}
          ${detailRow("Public venue", args.venue)}
          ${detailRow("Address", args.address)}
        </table>` +
        p(
          "This message does not include the other person's identity or contact details. Datehaja will never ask you for money, a password, or a verification code.",
        ),
      `${args.memberFirstName} asked Datehaja to send this one-time safety plan to you.`,
    ),
  };
}

/** Auto-reply sent when someone writes back to the Concierge inbox. */
export function conciergeReply(args: {
  firstName: string;
  url: string;
}): EmailContent {
  return {
    subject: "Re: your date plan",
    text: `Hi ${args.firstName},

Thanks for writing in — this reached Datehaja Concierge and we've logged it.

A few things you can do straight away from the app:
· Accept or pass on a date plan
· Cancel a date, or tell your match you're running late
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
           <li>Accept or pass on a date plan</li>
           <li>Cancel a date, or tell your match you're running late</li>
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

  const text = `${localized.greeting}

${localized.headline}.
${agentDateReportText(args.locale, args.report, args.reason)}

${args.decisionLabel ? `${localized.reason}: ${args.decisionLabel}\n` : ""}
${args.verdict === "pass" && args.nextSearchNote ? `\n${localized.next}: ${args.nextSearchNote}\n` : ""}

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
        agentDateReportHtml(args.locale, args.report, args.reason) +
        (args.decisionLabel
          ? p(`${localized.reason}: ${args.decisionLabel}`)
          : "") +
        (args.verdict === "pass" && args.nextSearchNote
          ? p(`${localized.next}: ${args.nextSearchNote}`)
          : "") +
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
  const text = `${localized.greeting}

${localized.headline}

${agentDateReportText(args.locale, args.report, args.agentReason)}

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
        agentDateReportHtml(args.locale, args.report, args.agentReason) +
        `<div style="margin-top:20px;">${button(args.url, localized.button)}</div>` +
        `<div style="margin-top:10px;">${secondaryButton(args.conversationUrl, localized.talk)}</div>` +
        `<p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:${BRAND.muted};">${escapeHtml(localized.note)}</p>`,
      localized.footer,
      localized.settings,
    ),
  };
}
