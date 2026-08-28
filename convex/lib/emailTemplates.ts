/** Datehaja Concierge email templates. Plain text and HTML, one source of truth. */

export type EmailContent = { subject: string; text: string; html: string };

const BRAND = {
  ink: "#16121b",
  sand: "#fcfaf7",
  ember: "#d4552b",
  muted: "#7a7183",
  border: "#ece4d9",
};

function shell(body: string, footerNote: string): string {
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
        You can change what Datehaja emails you, or pause matching entirely, in Settings.
      </div>
    </td></tr>
  </table>
</body></html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${BRAND.ember};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 24px;border-radius:999px;">${label}</a>`;
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
