import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";

// Recover the two preserved synthetic failures through the authenticated app
// mutation and durable scheduler. Never inject a review, turn, or model verdict.
const endpoint = process.env.DATEHAJA_LOCAL_CONVEX_URL ?? "http://127.0.0.1:3210";
assert.equal(new URL(endpoint).hostname, "127.0.0.1", "Local test deployment only");
const run = process.argv[2] ?? "mtt69gep";
assert(/^[a-z0-9]+$/.test(run));
const refresh = (process.argv.find(arg => arg.startsWith("--refresh="))?.slice(10) ?? "").split(",").filter(Boolean).map(Number);
assert(refresh.every(number => number === 2 || number === 3));
const root = `.scratch/learning-proof/${run}`;
const output = `.scratch/review-recovery/${run}`;
mkdirSync(output, { recursive: true });
const save = (name: string, value: unknown) => writeFileSync(`${output}/${name}.json`, JSON.stringify(value, null, 2), { mode: 0o600 });
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
async function account(index: number) {
  const saved = JSON.parse(readFileSync(`${root}/account-${index}.json`, "utf8"));
  const client = new ConvexHttpClient(endpoint);
  const auth = await client.action(api.auth.signIn, { refreshToken: saved.tokens.refreshToken });
  assert(auth.tokens, "Test session could not be refreshed");
  client.setAuth(auth.tokens.token);
  writeFileSync(`${root}/account-${index}.json`, JSON.stringify({ ...saved, tokens: auth.tokens }, null, 2), { mode: 0o600 });
  return client;
}
const owner = await account(0);
const partners = [await account(2), await account(3)];
const state = async (client: ConvexHttpClient) => ({ agent: await client.query(api.agents.mine, {}), search: await client.query(api.scouting.mine, {}) });
const beforeState = await Promise.all([owner, ...partners].map(state));
save("private-before", beforeState);
const results = await Promise.allSettled([2, 3].map(async (number, index) => {
  const original = JSON.parse(readFileSync(`${root}/date-${number}.json`, "utf8"));
  const args = { agentDateId: original.date._id };
  const before = (await owner.query(api.agentDates.get, args))!;
  const beforeOther = (await partners[index].query(api.agentDates.get, args))!;
  assert.equal(hash(before.turns), hash(original.turns));
  save(`date-${number}-before`, before);
  if (!before.date.reviewRecoveredAt || refresh.includes(number)) {
    await owner.mutation(api.agentDates.retryReview, args);
    const queued = (await owner.query(api.agentDates.get, args))!;
    assert(queued.date.reviewRetrying, "Recovery must be durably scheduled before replay");
  }
  let prior = "";
  for (let tick = 0; tick < 205; tick++) {
    const view = (await owner.query(api.agentDates.get, args))!;
    const progress = `Date ${number}: ${view.date.reviewRetrying ? "checking" : view.date.reviewRecoveredAt ? "recovered" : view.date.status}, ${view.turns.length} original lines`;
    if (progress !== prior) { console.log(progress); prior = progress; }
    save(`date-${number}-current`, view);
    if (view.date.reviewRecoveredAt) {
      const other = (await partners[index].query(api.agentDates.get, args))!;
      assert.equal(hash(view.turns), hash(original.turns), "Historical dialogue changed");
      assert.equal(view.mine.consent, before.mine.consent);
      assert.equal(other.mine.consent, beforeOther.mine.consent);
      assert.equal(view.counterpart.contactEmail, null);
      assert.equal(other.counterpart.contactEmail, null);
      assert.equal(view.date.introductionReady, false);
      assert.equal(other.date.introductionReady, false);
      assert(view.mine.reason && other.mine.reason, "Both independent reviews required");
      assert(view.date.activityJournal, "A verified journal is required for this rehearsal");
      save(`date-${number}-recovered`, view);
      save(`date-${number}-other-private`, other);
      return { number, before, view, transcriptHash: hash(view.turns) };
    }
    if (!view.date.reviewRetrying) throw new Error(`Date ${number}: retry withheld; original and logs retained`);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  throw new Error(`Date ${number}: recovery timed out`);
}));
const afterState = await Promise.all([owner, ...partners].map(state));
save("private-after", afterState);
assert.deepEqual(afterState, beforeState, "Recovery changed coaching, memory or search");
save("result", { run, endpoint, recordedAt: new Date().toISOString(), results, checks: { historyPreserved: true, consentPreserved: true, coachingAndSearchPreserved: true, noIntroductions: true } });
for (const result of results) if (result.status === "rejected") console.error(String(result.reason));
assert(results.every(result => result.status === "fulfilled"), "Some reviews still need repair");
console.log("Both original failed dates recovered; dialogue, feedback, memory, search and consent unchanged.");
