import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { buildDateTurnRequest, buildDateReviewRequest } from "../convex/agentDates";
import { auditDateReview, type DateReviewDraft, type ReviewSource } from "../convex/lib/dateReview";

// Read-only negative controls from retained failed model drafts. Uses live
// verification; no synthetic claims are stored back into any date or profile.
assert(process.env.OPENAI_API_KEY, "Use the isolated test environment's model credentials");
const childEnv = { ...process.env };
for (const key of ["CONVEX_DEPLOYMENT", "CONVEX_DEPLOY_KEY", "CONVEX_SELF_HOSTED_URL", "CONVEX_SELF_HOSTED_ADMIN_KEY"]) delete childEnv[key];
const root = ".scratch/review-recovery";
mkdirSync(root, { recursive: true });
const all = ["quality-ai-runs-2.json", "quality-ai-runs-3.json"].flatMap(file => JSON.parse(readFileSync(`.scratch/six-person/${file}`, "utf8")));
const checkRecovered = process.argv.includes("--recovered");
const cases = checkRecovered ? [{ number: 2, side: "recovered" }, { number: 2, side: "other-private" }, { number: 3, side: "recovered" }, { number: 3, side: "other-private" }] : [{ number: 2 }, { number: 3 }];
const checks = await Promise.all(cases.map(async ({ number, side }) => {
  const original = JSON.parse(readFileSync(`.scratch/learning-proof/mtt69gep/date-${number}.json`, "utf8"));
  const old = all.find(run => run.agentDateId === original.date._id && run.purpose === "agent_date_verdict" && run.status === "failed" && run.outputPreview?.startsWith("{"));
  assert(old, "Original rejected draft required");
  const context = JSON.parse(execFileSync("bunx", ["convex", "run", "agentDates:runContext", JSON.stringify({ agentDateId: original.date._id })], { cwd: ".scratch/six-person/backend", env: childEnv, encoding: "utf8" }));
  const view = side ? JSON.parse(readFileSync(`.scratch/review-recovery/mtt69gep/date-${number}-${side}.json`, "utf8")) : null;
  const round = view ? (context.aAgent.name === view.mine.agentName ? 1 : 2) : context.date.initiatorUserId === old.userId ? 1 : 2;
  const { self, other } = buildDateTurnRequest(context, round);
  const request = buildDateReviewRequest(self, other, context.date.setting,
    context.turns.map((t: { round: number; speakerAgentName: string; speakerUserId: typeof self.userId; content: string }) => ({ ...t, speaker: t.speakerAgentName })),
    "ko-KR", round === 1 ? context.aPreferences.relationshipIntent : context.bPreferences.relationshipIntent, true);
  const source = JSON.parse(request.input) as ReviewSource;
  const who = round === 1 ? "initiator" : "counterpart";
  const reflection = context.date[`${who}Reflection`];
  const draft: DateReviewDraft = view ? { headline: reflection.headline, anchor_round: reflection.anchorRound, question: reflection.question,
    verdict: context.date[`${who}Verdict`], compatibility_score: context.date.compatibilityScore, decision_code: context.date[`${who}DecisionCode`],
    reason: context.date[`${who}Reason`], next_search_note: context.date[`${who}NextSearchNote`], followup_question: "", summary: "", sparks: [], frictions: [] } : JSON.parse(old.outputPreview);
  const logs: unknown[] = [];
  const audit = await auditDateReview(source, draft, async (purpose, summary, result) => { logs.push({ purpose, summary, result }); });
  writeFileSync(`${root}/${side ? `recheck-${number}-${side}` : `negative-${number}`}.json`, JSON.stringify({ source, draft, audit, logs }, null, 2), { mode: 0o600 });
  const passed = audit?.supported === Boolean(side);
  console.log(`${side ? "Recovered" : "Original bad"} review ${number} ${side ?? ""}: ${passed ? "expected result" : "FAILED control"}`);
  return passed;
}));
assert(checks.every(Boolean), "Review regression check failed; inspect retained audit evidence");
