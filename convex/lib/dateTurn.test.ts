import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { generateDateTurn, repeatedSpeech } from "./dateTurn";

const previous = "창가 자리로 가요. 커피를 마시면서 조용한 노래 하나를 골라 같이 들으면 좋겠어요. 어떤 노래가 좋으세요?";
const request = { instructions: "Speak as the owner.", input: "{}", schemaName: "turn", schema: {}, preferredModels: ["gpt-5.6-sol"], fallbackToDefaultModels: false };
const draft = (reply: string) => ({ reply, subtext: "", owner_fact_evidence: [] });
beforeEach(() => { vi.stubEnv("OPENAI_API_KEY", "test-only"); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const respond = (data: unknown[]) => vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(data.shift()) }] }] }))));

test("allows ordinary short confirmations and new replies on the same subject", () => {
  expect(repeatedSpeech("좋아요.", ["좋아요."])).toBe(false);
  expect(repeatedSpeech("커피는 제가 가져올게요. 창가 자리가 생각보다 좁네요. 가방은 여기 둘게요.", [previous])).toBe(false);
  expect(repeatedSpeech(previous.replace("!", "."), [previous])).toBe(true);
});
test("repairs a recycled long speech before it can be stored", async () => {
  const fresh = draft("저는 가사 없는 쪽이요. 얘기하다가 노래 따라 부를 것 같아서요.");
  respond([draft(previous), fresh]);
  const rejected = vi.fn(async () => {});
  expect((await generateDateTurn(request, [], [previous], rejected)).data).toEqual(fresh);
  expect(rejected).toHaveBeenCalledOnce();
  expect(fetch).toHaveBeenCalledTimes(2);
});
test("withholds a repeatedly rejected reply and retains the original evidence", async () => {
  respond([draft(previous), draft(previous)]);
  const history = [previous];
  const result = await generateDateTurn(request, [], history, async () => {});
  expect(result.ok).toBe(false);
  expect(result.data).toBeNull();
  expect(history).toEqual([previous]);
});
test("does not silently replace the tested model when it is unavailable", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: { code: "model_not_found", message: "Not available" } }), { status: 404 })));
  const result = await generateDateTurn(request, [], [], async () => {});
  expect(result.ok).toBe(false);
  expect(fetch).toHaveBeenCalledTimes(1);
});
