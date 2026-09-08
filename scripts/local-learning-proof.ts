import { ConvexHttpClient } from "convex/browser";
import type { FunctionReturnType } from "convex/server";
import { api } from "../convex/_generated/api";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";

// Real authenticated calls and durable scheduled dates, restricted to an isolated
// localhost backend. No injected turns, verdicts, memory, or introduction emails.
const endpoint = process.env.DATEHAJA_LOCAL_CONVEX_URL ?? "http://127.0.0.1:3210";
assert(["localhost", "127.0.0.1", "[::1]"].includes(new URL(endpoint).hostname), "Local backend required");
const resume = process.argv.find(arg => arg.startsWith("--resume="))?.split("=")[1];
assert(!resume || /^[a-z0-9]+$/.test(resume), "Invalid run ID");
const run = resume ?? Date.now().toString(36);
const output = `.scratch/learning-proof/${run}`;
mkdirSync(output, { recursive: true });
const save = (name: string, value: unknown) => writeFileSync(`${output}/${name}.json`, JSON.stringify(value, null, 2), { mode: 0o600 });
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const delay = () => new Promise(resolve => setTimeout(resolve, 3000));
type View = NonNullable<FunctionReturnType<typeof api.agentDates.get>>;
type Person = { client: ConvexHttpClient; name: string; email: string };
const people: Person[] = [];
const records: View[] = [];
const feedback: unknown[] = [];

async function person(index: number, name: string, gender: "man" | "woman", essence: string, voice: "warm" | "playful" | "quiet" = "warm") {
  const client = new ConvexHttpClient(endpoint);
  const email = `hyo+test-learning-${run}-${index}@hyo.dev`;
  if (resume && existsSync(`${output}/account-${index}.json`)) {
    const saved = JSON.parse(readFileSync(`${output}/account-${index}.json`, "utf8"));
    client.setAuth(saved.tokens.token);
    const result = { client, name, email }; people.push(result); return result;
  }
  await client.action(api.auth.signIn, { provider: "email", params: { email } });
  const auth = await client.action(api.auth.signIn, { provider: "email", params: { email, code: "68686868" } });
  assert(auth.tokens, "Local test OTP not configured");
  client.setAuth(auth.tokens.token);
  const legal = await client.query(api.legal.status, {});
  await client.mutation(api.legal.accept, { versions: legal.currentVersions, termsAccepted: true, privacyAcknowledged: true, communityAccepted: true, ageConfirmed: true, locale: "ko-KR" });
  const bootstrap = {
    displayName: index === 0 ? "재이" : `테스트 ${name}`, agentName: name,
    dobMs: Date.UTC(1994, 5, 15), gender, interestedIn: [gender === "man" ? "woman" as const : "man" as const],
    city: "Tokyo", neighborhood: "Shibuya", interests: index === 4 ? ["Reading", "Museums", "Hiking"] : ["Coffee", "Reading", "Music"], personalityTraits: ["Playful", "Thoughtful"],
    essence, desiredConnection: "지금은 가볍게 알아가는 데이트가 좋다. 웃기려고 애쓰지 않고 서로 다른 생각도 편하게 말할 수 있는 사람.",
    boundaries: ["No sexual pressure", "No pressure to meet quickly"], voice, autonomy: "suggest" as const,
    relationshipIntent: "casual" as const, preferredPersonalityTraits: [], personalityPreference: "flexible" as const,
    preferredStyleTags: [], stylePreference: "no_preference" as const,
    avatar: { palette: index === 0 ? "moss" as const : "violet" as const, face: "curious" as const, hair: "wave" as const, outfit: "cardigan" as const, accessory: "none" as const, gender: gender === "man" ? "male" as const : "female" as const },
    locale: "ko-KR", languages: ["Korean"], matchLocationScope: "area" as const, preferredCountryCodes: ["JP"], preferredCities: ["Tokyo"], preferredAreas: ["Shibuya"], allowTranslatedDates: false,
  };
  await client.mutation(api.agents.bootstrap, bootstrap);
  await client.mutation(api.profiles.updateNotificationPreferences, { notifyEmail: false });
  save(`account-${index}`, { email, tokens: auth.tokens, bootstrap });
  const result = { client, name, email }; people.push(result); return result;
}

async function encounter(owner: Person, partner: Person) {
  const savedPath = `${output}/date-${records.length + 1}.json`;
  if (resume && existsSync(savedPath)) {
    const saved = JSON.parse(readFileSync(savedPath, "utf8")) as View;
    const current = (await owner.client.query(api.agentDates.get, { agentDateId: saved.date._id }))!;
    assert.equal(hash(current.turns), hash(saved.turns));
    // A failed review remains part of this chronological rehearsal.
    records.push(saved); return saved;
  }
  await owner.client.action(api.scouting.start, {});
  await partner.client.action(api.scouting.start, {});
  let previous = "";
  for (let tick = 0; tick < 260; tick++) {
    const dates = await owner.client.query(api.agentDates.listMine, {});
    const row = dates.find(d => !records.some(r => r.date._id === d._id));
    if (row) {
      const view = (await owner.client.query(api.agentDates.get, { agentDateId: row._id }))!;
      save(`date-${records.length + 1}-current`, view);
      assert.equal(view.counterpart.agentName, partner.name, "Unexpected cohort pairing");
      const progress = `${records.length + 1}: ${view.date.status}, ${view.turns.length} lines`;
      if (previous !== progress) { console.log(progress); previous = progress; }
      if (!["queued", "running"].includes(view.date.status)) {
        records.push(view); save(`date-${records.length}`, view);
        if (view.date.status === "failed") console.log("Review withheld; keep its transcript and continue the feedback rehearsal.");
        assert.equal(view.date.isSearchEncounter, true);
        assert.equal(view.mine.consent, "pending");
        assert.equal(view.counterpart.contactEmail, null);
        const other = await partner.client.query(api.agentDates.get, { agentDateId: view.date._id });
        assert.equal(other?.turns.length, view.turns.length);
        await owner.client.mutation(api.scouting.pause, {});
        await partner.client.mutation(api.scouting.pause, {});
        return view;
      }
    }
    await delay();
  }
  throw Error("Scheduled encounter timed out; intermediate evidence retained");
}

async function coach(owner: Person, partner: Person, view: View, target: "self" | "counterpart", content: string) {
  if (resume && existsSync(`${output}/feedback.json`)) {
    const saved = JSON.parse(readFileSync(`${output}/feedback.json`, "utf8")) as Array<{ input: { agentDateId: string; content: string } }>;
    const cached = saved.find(entry => entry.input.agentDateId === view.date._id && entry.input.content === content);
    if (cached) { feedback.push(cached); return; }
  }
  const currentBefore = (await owner.client.query(api.agentDates.get, { agentDateId: view.date._id }))!;
  const round = view.turns.find(turn => turn.isMine === (target === "self"))!.round;
  const input = { agentDateId: view.date._id, feedbackTarget: target, turnRound: round, content };
  const beforeHash = hash(view.turns);
  const otherBefore = await partner.client.query(api.agents.dateCoaching, { agentDateId: view.date._id });
  const earlier = await owner.client.query(api.agents.dateCoaching, { agentDateId: view.date._id });
  const existing = resume && earlier.messages.find(message => message.role === "human" && message.content === content && message.turnRound === round);
  if (!existing) await owner.client.mutation(api.agents.send, input);
  const sent = await owner.client.query(api.agents.dateCoaching, { agentDateId: view.date._id });
  const messageId = (existing || sent.messages.findLast(message => message.role === "human" && message.content === content))?._id;
  assert(messageId, "Source human message was not saved");
  for (let tick = 0; tick < 100; tick++) {
    const learned = await owner.client.query(api.agents.dateCoaching, { agentDateId: view.date._id });
    if (!learned.pending) {
      const reply = learned.messages.find(message => message.replyTo === messageId && message.role === "agent");
      assert(reply, "Feedback did not produce a linked saved reply");
      const after = (await owner.client.query(api.agentDates.get, { agentDateId: view.date._id }))!;
      assert.equal(hash(after.turns), beforeHash, "Feedback changed historical dialogue");
      assert.equal(after.mine.consent, currentBefore.mine.consent);
      assert.equal(after.counterpart.contactEmail, null);
      const otherAfter = await partner.client.query(api.agents.dateCoaching, { agentDateId: view.date._id });
      assert.deepEqual(otherAfter, otherBefore, "Owner coaching crossed participant privacy boundary");
      const evidence = { dateIndex: records.length - 1, input, reply: reply.content, memory: learned.memory, sourceMessageId: messageId, originalTranscriptHash: beforeHash };
      feedback.push(evidence); save("feedback", feedback);
      console.log(`Saved ${target} feedback and linked reply; history and consent unchanged`);
      return;
    }
    await delay();
  }
  throw Error("Feedback timed out");
}

try {
  console.log(`Evidence directory: ${output}`);
  const owner = await person(0, "리오", "man", "커피, 음악, 책이 좋다. 내 생각을 구체적으로 말하고 장난을 주고받는 편이다. 처음 만났어도 편하게 반말한다. 상대가 나와 다른 선택을 해도 괜찮다.", "playful");
  const first = await person(1, "루", "woman", "카페에서 조용히 이야기하는 게 좋다. 취향이 다르면 억지로 맞추지 않고 내 선택을 말한다. 말이 많진 않지만 상대의 작은 농담을 좋아한다. 처음엔 존댓말을 쓴다.", "quiet");
  const before = await encounter(owner, first);
  await coach(owner, first, before, "self", "대화를 읽어보니 반말은 나 같지 않아. 처음 만난 사람에게는 존댓말을 끝까지 유지해줘. 나는 한두 문장으로 짧게 말하고, 매번 질문으로 끝내지 않아. 같은 농담을 계속 늘리기보다는 한 번 받아주고 다른 이야기도 하고 싶어. 관계는 여전히 가볍게 알아가고 싶어.");
  await coach(owner, first, before, "counterpart", "다음에는 자기 취향을 분명히 말하는 여성을 만나고 싶어. 나와 다른 메뉴나 음악을 골라도 그 자체를 안 맞는다고 보지 마. 짧게 대답하는 것만으로 관심 없다고 단정하지도 말고. 방금 말한 내 존댓말과 짧은 말투는 그대로 기억해줘.");
  if ((await owner.client.query(api.agentDates.get, { agentDateId: before.date._id }))?.date.status === "debrief_ready") await owner.client.mutation(api.agentDates.consent, { agentDateId: before.date._id, decision: "no" });
  const second = await person(2, "미로", "woman", "커피보다 차를 더 좋아하고 음악도 조용한 연주곡을 선호한다. 상대 취향에 무조건 맞추지는 않는다. 의견이 다르면 내 쪽을 짧게 말하고 같이 정한다. 친해지기 전에는 존댓말을 쓴다. 상대가 말이 없어도 잠깐 기다릴 수 있다.", "quiet");
  const after = await encounter(owner, second);
  await coach(owner, second, after, "self", "앞으로도 존댓말과 짧은 말투는 유지해줘. 조금 더 나답게, 답을 정하기 어려우면 그냥 잘 모르겠다고 말해도 돼. 침묵을 매번 질문이나 농담으로 채우지 않아도 괜찮아. 이건 말투에 대한 수정이고 원하는 관계와 상대 조건은 바뀌지 않았어.");
  if ((await owner.client.query(api.agentDates.get, { agentDateId: after.date._id }))?.date.status === "debrief_ready") await owner.client.mutation(api.agentDates.consent, { agentDateId: after.date._id, decision: "no" });
  const third = await person(3, "하루", "woman", "독립 서점을 구경하고 차를 마시는 걸 좋아한다. 처음엔 짧은 존댓말로 말한다. 질문에 답을 바로 못 하면 모른다고 말해도 편하다. 남의 선택을 따라가기보다 내 쪽을 말하지만 사소한 차이로 실랑이하는 것은 싫다.", "quiet");
  await encounter(owner, third);
  const fourth = await person(4, "모아", "woman", "출판사에서 책을 편집한다. 쉬는 날에는 가방에 들어갈 얇은 책을 골라 공원에서 읽는 걸 좋아한다. 모르는 작품은 솔직히 모른다고 말한다. 처음엔 짧은 존댓말로 말하고, 억지로 웃기려 하기보다는 작은 관찰을 나누는 편이다. 당장은 가볍게 알아가는 만남이 좋다.", "quiet");
  await encounter(owner, fourth);
  const memory = await owner.client.query(api.agents.mine, {});
  save("result", { run, recordedAt: new Date().toISOString(), endpoint, dates: records, feedback, finalMemory: memory?.agent.privateMemory, checks: { scheduledDates: records.length, verifiedDates: records.filter(r => r.date.status !== "failed").length, withheldDates: records.filter(r => r.date.status === "failed").length, ownerFeedback: feedback.length, historyPreserved: true, coachingPrivate: true, consentUnchangedByCoaching: true, emailNotificationsDisabled: true }, transcriptHashes: records.map(r => hash(r.turns)) });
  console.log("Four scheduled dates complete; full generated outcomes preserved.");
} finally {
  for (const participant of people) await participant.client.mutation(api.scouting.pause, {}).catch(() => {});
  console.log(`Paused only this run's ${people.length} fictional participants.`);
}
