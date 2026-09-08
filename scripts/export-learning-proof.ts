import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import type { FunctionReturnType } from "convex/server";
import type { api } from "../convex/_generated/api";
import type { LearningProof } from "../src/lib/learningProof";

type View = NonNullable<FunctionReturnType<typeof api.agentDates.get>>;
const path = process.argv[2];
assert(path?.startsWith(".scratch/learning-proof/"), "Only local synthetic proof runs may be exported");
const source = JSON.parse(readFileSync(path, "utf8")) as {
  endpoint: string; recordedAt: string; dates: View[];
  feedback: Array<{ dateIndex: number; input: { feedbackTarget: "self" | "counterpart"; turnRound: number; content: string }; reply: string; memory: string }>;
  checks: Record<string, boolean | number>;
};
assert.equal(new URL(source.endpoint).hostname, "127.0.0.1");
assert.equal(source.dates.length, 4);
assert(source.checks.historyPreserved && source.checks.coachingPrivate && source.checks.consentUnchangedByCoaching);
const recoveryPath = process.argv[3];
if (recoveryPath) {
  assert(recoveryPath.startsWith(".scratch/review-recovery/"));
  const recovery = JSON.parse(readFileSync(recoveryPath, "utf8")) as {
    endpoint: string; results: Array<{ status: string; value: { number: number; view: View } }>;
    checks: Record<string, boolean>;
  };
  assert.equal(recovery.endpoint, source.endpoint);
  assert(recovery.checks.historyPreserved && recovery.checks.coachingAndSearchPreserved && recovery.checks.consentPreserved);
  for (const result of recovery.results) {
    assert.equal(result.status, "fulfilled");
    const { number, view } = result.value;
    const previous = source.dates[number - 1];
    assert.equal(previous.date.status, "failed");
    assert.equal(previous.date._id, view.date._id);
    assert.deepEqual(previous.turns, view.turns);
    assert(view.date.reviewRecoveredAt && !view.date.introductionReady);
    source.dates[number - 1] = view;
  }
}
// Explicit allowlist: never spread account records, database documents, private
// counterpart verdicts, auth tokens, profile details or source message IDs.
const proof: LearningProof = {
  recordedAt: source.recordedAt,
  dates: source.dates.map((view, index) => {
    assert(view.turns.length && !["queued", "running"].includes(view.date.status));
    const turns = view.turns.map(turn => ({ _id: `learning-${index}-${turn.round}`, round: turn.round, isMine: turn.isMine, speakerAgentName: turn.speakerAgentName, content: turn.content }));
    return { reviewStatus: view.date.reviewRecoveredAt ? "recovered" : view.date.status === "failed" ? "withheld" : "reviewed", reviewRecoveredAt: view.date.reviewRecoveredAt, label: ["첫 데이트", "피드백 후", "한 번 더 다듬은 뒤", "새로운 만남"][index],
      setting: view.date.setting, sceneKind: view.date.sceneKind ?? "cafe", situation: view.date.sceneSituation ?? "",
      mine: { name: view.mine.agentName, avatar: view.mine.avatar }, counterpart: { name: view.counterpart.agentName, avatar: view.counterpart.avatar },
      turns, journal: view.date.activityJournal, letter: view.mine.reason, verdict: view.mine.verdict, nextSearchNote: view.mine.nextSearchNote,
      transcriptHash: createHash("sha256").update(JSON.stringify(turns)).digest("hex"),
    };
  }),
  feedback: source.feedback.map(entry => ({ dateIndex: entry.dateIndex, target: entry.input.feedbackTarget, round: entry.input.turnRound, content: entry.input.content, reply: entry.reply, memory: entry.memory })),
};
const serialized = JSON.stringify(proof, null, 2);
assert(!/hyo@|hyo\+|refreshToken|contactEmail|sourceMessageId|speakerUserId|pendingReplyTo|counterpartConsent|initiatorUserId/.test(serialized), "Unexpected private data in public fixture");
writeFileSync("src/fixtures/learningProof.json", serialized + "\n");
console.log(`Exported ${proof.dates.length} complete dates, ${proof.feedback.length} saved feedback/reply pairs; no dialogue edits.`);
