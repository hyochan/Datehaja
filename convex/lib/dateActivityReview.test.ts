import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { generateVerifiedActivity, normalizeActivity, type ActivitySource } from "./dateActivityReview";
import type { DateActivity } from "./dateActivity";
const source: ActivitySource = { setting: "Cinema", sceneKind: "cinema", locale: "en-US", transcript: [
  { round: 1, speaker: "Same", participant: "a", content: "Shall we go to a café?" },
  { round: 2, speaker: "Same", participant: "b", content: "If we go, I would choose tea. What would you pick?" },
] };
const good: DateActivity = { overview: "They proposed a café visit. The final question has no answer yet.", events: [
  { kind: "proposal", title: "A possible café stop", detail: "A proposed going; B described a conditional tea choice and asked A what they would pick.", sceneKind: "cafe", rounds: [1, 2] },
] };
const bad = { ...good, overview: "They went to the café and had tea." };
const approved = { supported: true, issues: [] };
const rejected = { supported: false, issues: ["The visit was proposed, not performed."] };
let inputs: unknown[];
const log = async () => {};
function responses(data: unknown[]) {
  vi.stubGlobal("fetch", vi.fn(async (_url, options) => {
    inputs.push(JSON.parse(options.body));
    return new Response(JSON.stringify({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(data.shift()) }] }] }));
  }));
}
beforeEach(() => { inputs = []; vi.stubEnv("OPENAI_API_KEY", "test-only"); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("activity evidence", () => {
  test("keeps a proposed destination distinct from an actual scene change", async () => {
    responses([good, approved]);
    expect(await generateVerifiedActivity(source, log)).toEqual(good);
    expect(inputs).toHaveLength(2);
    const sent = JSON.parse((inputs[1] as { input: string }).input);
    expect(sent.source.transcript.map((t: { participant: string }) => t.participant)).toEqual(["a", "b"]);
    expect(sent.draft.events[0].kind).toBe("proposal");
  });
  test("repairs a fabricated completed action, then audits the exact repair", async () => {
    responses([bad, rejected, good, approved]);
    expect(await generateVerifiedActivity(source, log)).toEqual(good);
    expect(inputs).toHaveLength(4);
    expect(JSON.parse((inputs[3] as { input: string }).input).draft).toEqual(good);
  });
  test("withholds a twice rejected journal while the source transcript remains intact", async () => {
    responses([bad, rejected, bad, rejected]);
    expect(await generateVerifiedActivity(source, log)).toBeNull();
    expect(source.transcript).toHaveLength(2);
    expect(inputs).toHaveLength(4);
  });
  test.each([null, {}, { supported: true, issues: ["Still invented"] }])("withholds when the auditor is malformed: %s", async audit => {
    responses([good, audit]);
    expect(await generateVerifiedActivity(source, log)).toBeNull();
    expect(inputs).toHaveLength(2);
  });
  test("refuses invented anchors and journals that omit the final reply", async () => {
    for (const rounds of [[1], [1, 3], [0, 1, 2], [1, 1.5, 2]]) {
      const incomplete = { ...good, events: [{ ...good.events[0], rounds }] };
      expect(normalizeActivity(incomplete, source)).toBeNull();
      responses([incomplete]);
      expect(await generateVerifiedActivity(source, log)).toBeNull();
      expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
    }
  });
});
