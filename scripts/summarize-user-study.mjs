import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const directory = process.argv[2];
assert(directory, "Usage: node scripts/summarize-user-study.mjs <private response directory>");
const files = readdirSync(directory).filter(name => /^datehaja-study-P\d\d\.json$/.test(name));
const rows = files.map(name => JSON.parse(readFileSync(resolve(directory, name), "utf8")));
const fields = ["schemaVersion", "evidence", "participantCode", "locale", "recordedAt", "onboarding", "firstDate", "before", "feedback", "secondDate", "after", "contactRule", "returnIntent", "blocker"].sort();
const allowed = { locale: ["en", "ko"], onboarding: ["alone", "help", "stopped", "not_tried"], firstDate: ["completed", "waiting", "failed", "not_tried"], feedback: ["saved", "failed", "not_tried"], secondDate: ["completed", "waiting", "failed", "not_tried"], contactRule: ["both_humans", "agents", "one_human", "unsure"], returnIntent: ["yes", "maybe", "no"], blocker: ["none", "signup", "setup", "waiting", "dialogue", "feedback", "privacy", "other"] };
for (const row of rows) {
  assert.deepEqual(Object.keys(row).sort(), fields, "Unexpected fields; do not process private free text");
  assert(row.schemaVersion === 1 && row.evidence === "participant_self_report", "Unsupported evidence type");
  assert(/^P(?:0[1-9]|[1-9][0-9])$/.test(row.participantCode), "Invalid participant code");
  assert(Number.isFinite(Date.parse(row.recordedAt)), "Invalid timestamp");
  for (const [field, values] of Object.entries(allowed)) assert(values.includes(row[field]), "Invalid closed answer: " + field);
  for (const field of ["before", "after"]) assert(row[field] === null || (Number.isInteger(row[field]) && row[field] >= 1 && row[field] <= 5), "Invalid rating");
  assert(row.firstDate === "completed" || row.before === null, "Rating without a first date");
  assert(row.secondDate === "completed" || row.after === null, "Rating without a new date");
  assert(row.after === null || (row.firstDate === "completed" && row.feedback === "saved"), "After rating without completed first date and saved feedback");
}
assert(new Set(rows.map(row => row.participantCode)).size === rows.length, "Duplicate participant codes; reconcile sessions before counting");
const count = (field, value) => rows.filter(row => row[field] === value).length;
const paired = rows.filter(row => row.firstDate === "completed" && row.secondDate === "completed" && row.feedback === "saved" && row.before !== null && row.after !== null);
console.log(JSON.stringify({
  evidence: "Participant self-report only. Verify independent human sessions separately; no testimonials or retention claims.",
  responses: rows.length,
  onboarding: { attempted: rows.filter(r => r.onboarding !== "not_tried").length, alone: count("onboarding", "alone"), help: count("onboarding", "help"), stopped: count("onboarding", "stopped") },
  firstDate: Object.fromEntries(allowed.firstDate.map(value => [value, count("firstDate", value)])),
  afterFeedback: { eligiblePairedRatings: paired.length, increased: paired.filter(r => r.after > r.before).length, unchanged: paired.filter(r => r.after === r.before).length, decreased: paired.filter(r => r.after < r.before).length },
  consentUnderstanding: { bothHumans: count("contactRule", "both_humans"), otherOrUnsure: rows.length - count("contactRule", "both_humans") },
  returnIntent: Object.fromEntries(allowed.returnIntent.map(value => [value, count("returnIntent", value)])),
  blockers: Object.fromEntries(allowed.blocker.map(value => [value, count("blocker", value)])),
}, null, 2));
