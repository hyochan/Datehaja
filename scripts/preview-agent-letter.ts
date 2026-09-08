/** Render a saved deliveryContext locally. This never calls the mail provider. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { emailReportFor } from "../convex/agentDates";
import { agentDebriefEmail } from "../convex/lib/emailTemplates";

const source = process.argv[2];
if (!source) throw new Error("Usage: bun scripts/preview-agent-letter.ts <delivery-context.json> [output.html]");
const destination = resolve(process.argv[3] ?? ".scratch/experience/letter.html");
const context = JSON.parse(await readFile(source, "utf8")) as Parameters<typeof emailReportFor>[0];
if (context.date.initiatorVerdict === "pending") throw new Error("This date has no letter yet.");
// Local images let the preview include assets that are not deployed yet.
const previewOrigin = process.env.DATEHAJA_PREVIEW_ORIGIN ?? "http://127.0.0.1:4173";
process.env.EMAIL_ASSET_ORIGIN = previewOrigin;
const letter = agentDebriefEmail({
  locale: context.a.locale,
  firstName: context.a.firstName,
  agentName: context.a.agentName,
  counterpartAgentName: context.b.agentName,
  verdict: context.date.initiatorVerdict,
  reason: context.date.initiatorReason,
  nextSearchNote: context.date.initiatorNextSearchNote,
  report: emailReportFor(context, "a"),
  url: `${previewOrigin}/agent-date/${context.date._id}`,
  conversationUrl: `${previewOrigin}/dashboard?date=${context.date._id}`,
});
await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, letter.html);
await writeFile(destination.replace(/\.html$/, ".txt"), `${letter.subject}\n\n${letter.text}`);
console.log(`Local letter preview: ${destination}`);
