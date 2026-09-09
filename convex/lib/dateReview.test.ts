import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { auditDateReview, generateVerifiedDateReview, DATE_REVIEW_SCHEMA, type DateReviewDraft, type ReviewSource } from './dateReview';
import { structured, type StructuredRequest } from '../integrations/openai';

const source: ReviewSource = {
  owner: { relationship_intent: 'casual', memory: 'Only this owner’s private correction.' },
  your_agent: 'Same', other_agent: 'Same', setting: 'A fictional cinema',
  transcript: [
    { round: 1, speaker: 'Same', speaker_role: 'you', content: 'I pick the ambiguous film.' },
    { round: 2, speaker: 'Same', speaker_role: 'other participant', content: 'I prefer comedy.' },
    { round: 3, speaker: 'Same', speaker_role: 'you', content: 'You changed from the ambiguous film to comedy.' },
    { round: 4, speaker: 'Same', speaker_role: 'other participant', content: 'Yes, I changed my mind.' },
  ],
};
const bad: DateReviewDraft = { headline: 'Their change of mind', anchor_round: 4, question: 'How did their change feel?', verdict: 'encourage', compatibility_score: 70, decision_code: 'strong_alignment', reason: 'They changed their film choice and admitted it.', followup_question: '', next_search_note: 'Seek this flexibility.', summary: '', sparks: [], frictions: [] };
const good: DateReviewDraft = { ...bad, anchor_round: 2, headline: 'Two different film choices', question: 'Would you enjoy picking a film together?', verdict: 'curious', decision_code: 'worth_exploring', reason: 'We each made a film choice. That alone is not enough for my recommendation.', next_search_note: 'Ask what kind of connection they want.', summary: '', sparks: [], frictions: [] };
const privatePatch = (draft: DateReviewDraft) => Object.fromEntries(Object.entries(draft).filter(([key]) => !['summary', 'sparks', 'frictions'].includes(key)));
const rejected = { supported: false, issues: [{ field: 'reason', claim: bad.reason, correction: 'The other speaker picked comedy from the start. Their later agreement repeats a false premise.', source_rounds: [1, 2, 3, 4] }] };
const approved = { supported: true, issues: [] };
const request: StructuredRequest = { instructions: 'Write a private review.', input: JSON.stringify(source), schemaName: 'agent_date_verdict', schema: DATE_REVIEW_SCHEMA, preferredModels: ['gpt-5.6-luna'] };
let requests: Array<{ input: string; text: { format: { name: string } } }>;
let records: Array<{ purpose: string; ok: boolean }>;
const log = async (purpose: string, _summary: string, result: { ok: boolean }) => { records.push({ purpose, ok: result.ok }); };
function responses(values: unknown[]) {
  vi.stubGlobal('fetch', vi.fn(async (_url, options) => {
    requests.push(JSON.parse(options.body));
    const value = values.shift();
    return new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(value) }] }] }), { status: 200 });
  }));
}
beforeEach(() => { requests = []; records = []; vi.stubEnv('OPENAI_API_KEY', 'test-only'); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe('verified date reviews', () => {
  test('replaces a rejected interpretation and checks the replacement before returning it', async () => {
    responses([bad, rejected, privatePatch(good), approved]);
    expect(await generateVerifiedDateReview(request, log)).toEqual(good);
    expect(requests.map(r => r.text.format.name)).toEqual(['agent_date_verdict', 'agent_date_review_audit', 'agent_date_verdict', 'agent_date_review_audit']);
    const repairedInput = JSON.parse(requests[2].input);
    expect(repairedInput.required_corrections).toEqual(rejected.issues);
    expect(repairedInput.transcript).toEqual(source.transcript);
    expect(JSON.parse(requests[3].input).draft).toEqual(good);
    expect(records.filter(r => r.purpose === 'agent_date_verdict').map(r => r.ok)).toEqual([false, true]);
  });
  test('withholds the review after three rejected drafts instead of inventing a safe verdict', async () => {
    responses([bad, rejected, privatePatch(bad), rejected, privatePatch(bad), rejected]);
    expect(await generateVerifiedDateReview(request, log)).toBeNull();
    expect(requests).toHaveLength(6);
    expect(records.every(r => !r.ok)).toBe(true);
  });
  test('carries earlier corrections into the final repair when a different field still generalizes', async () => {
    const later = { supported: false, issues: [{ ...rejected.issues[0], field: 'next_search_note', claim: 'They always enjoy coffee.', correction: 'A one-time reaction does not establish a general preference.' }] };
    responses([bad, rejected, privatePatch(good), later, { next_search_note: good.next_search_note }, approved]);
    expect(await generateVerifiedDateReview(request, log)).toEqual(good);
    expect(JSON.parse(requests[4].input).required_corrections).toEqual([...rejected.issues, ...later.issues]);
    expect(JSON.parse(requests[5].input).draft).toEqual(good);
  });
  test('does not reject a supported review just to force a rewrite', async () => {
    responses([good, approved]);
    expect(await generateVerifiedDateReview(request, log)).toEqual(good);
    expect(requests).toHaveLength(2);
  });
  test('repairs a generalized search lesson without rewriting an already supported letter', async () => {
    const draft = { ...good, next_search_note: 'They always enjoy coffee.' };
    const issue = { supported: false, issues: [{ ...rejected.issues[0], field: 'next_search_note', claim: draft.next_search_note, correction: 'This was only a response to this cup.' }] };
    responses([draft, issue, { next_search_note: good.next_search_note }, approved]);
    expect(await generateVerifiedDateReview(request, log)).toEqual(good);
    expect(JSON.parse(requests[3].input).draft.reason).toBe(draft.reason);
    expect(JSON.parse(requests[3].input).draft.headline).toBe(draft.headline);
  });
  test('rejects a patch that tries to change an unrelated verdict', async () => {
    const issue = { supported: false, issues: [{ ...rejected.issues[0], field: 'headline' }] };
    responses([good, issue, { headline: 'A supported title', verdict: 'encourage' }]);
    expect(await generateVerifiedDateReview(request, log)).toBeNull();
    expect(requests).toHaveLength(3);
  });
  test('checks the normalized prose that will actually be saved', async () => {
    responses([{ ...good, reason: `  ${good.reason}  ` }, approved]);
    const result = await generateVerifiedDateReview(request, log);
    expect(JSON.parse(requests[1].input).draft).toEqual(result);
  });
  test('keeps speaker ownership even when both names are identical', async () => {
    responses([rejected]);
    await auditDateReview(source, bad, log);
    const input = JSON.parse(requests[0].input);
    expect(input.source.transcript[0].speaker_role).toBe('you');
    expect(input.source.transcript[1].speaker_role).toBe('other participant');
    expect(input.source.transcript).toHaveLength(4);
  });
  test.each([
    null, {}, { supported: true, issues: rejected.issues }, { supported: false, issues: [] },
    { supported: false, issues: [{ ...rejected.issues[0], source_rounds: [9] }] },
  ])('fails closed for missing or inconsistent verification: %j', async audit => {
    responses([good, audit]);
    expect(await generateVerifiedDateReview(request, log)).toBeNull();
    expect(requests).toHaveLength(2);
  });
  test('withholds an invalid anchor before it can quote an unrelated exchange', async () => {
    responses([{ ...good, anchor_round: 9 }]);
    expect(await generateVerifiedDateReview(request, log)).toBeNull();
    expect(requests).toHaveLength(1);
  });
  test('does not release a draft when the verifier is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_url, options) => {
      const r = JSON.parse(options.body); requests.push(r);
      if (r.text.format.name === 'agent_date_review_audit') return new Response(JSON.stringify({ error: { code: 'invalid_api_key', message: 'Fixture: verification unavailable' } }), { status: 401 });
      return new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(good) }] }] }));
    }));
    expect(await generateVerifiedDateReview(request, log)).toBeNull();
    expect(records.find(r => r.purpose === 'agent_date_verdict')?.ok).toBe(false);
  });
  test('does not replace an unavailable verifier with an unchecked cheaper model', async () => {
    const models: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (_url, options) => {
      const r = JSON.parse(options.body); models.push(r.model);
      return new Response(JSON.stringify({ error: { code: 'model_not_found', message: 'Fixture: unavailable verifier' } }), { status: 404 });
    }));
    expect(await auditDateReview(source, good, log)).toBeNull();
    expect(models).toEqual(['gpt-5.6-sol']);
  });
  test('a network retry cannot restart the shared verification time budget', async () => {
    let clock = 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => clock);
    const timeouts = vi.spyOn(AbortSignal, 'timeout');
    let calls = 0;
    vi.stubGlobal('fetch', vi.fn((_url, options: RequestInit) => {
      if (++calls === 1) { clock = 1009; return Promise.reject(new Error('temporary network failure')); }
      return new Promise<Response>((_resolve, reject) => {
        options.signal!.addEventListener('abort', () => reject(new Error('Aborted')), { once: true });
      });
    }));
    const result = await structured({ ...request, preferredModels: ['gpt-5.6-sol'], fallbackToDefaultModels: false, requestTimeoutMs: 90_000, deadlineMs: 1010 });
    expect(result.ok).toBe(false);
    expect(timeouts.mock.calls.map(call => call[0])).toEqual([10, 1]);
    expect(calls).toBe(2);
  });
  test('aborts a stalled verification request without retrying or changing models', async () => {
    const fetch = vi.fn((_url, options: RequestInit) => new Promise<Response>((_resolve, reject) => {
      options.signal!.addEventListener('abort', () => reject(new Error('Aborted fixture request')), { once: true });
    }));
    vi.stubGlobal('fetch', fetch);
    const result = await structured({ ...request, preferredModels: ['gpt-5.6-sol'], fallbackToDefaultModels: false, requestTimeoutMs: 5 });
    expect(result.ok).toBe(false);
    expect(result.data).toBeNull();
    expect(result.error).toBe('Model request timed out.');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
