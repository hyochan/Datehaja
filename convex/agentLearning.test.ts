/// <reference types="vite/client" />
import { convexTest } from 'convex-test';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { api, internal } from './_generated/api';
import type { Id } from './_generated/dataModel';
import schema from './schema';
import { conversationLimit } from './agentDates';

const modules = import.meta.glob('./**/*.ts');
const createBackend = () => convexTest(schema, modules);
type Backend = ReturnType<typeof createBackend>;
const DAY = 86_400_000;
const asUser = (t: Backend, userId: Id<'users'>) => t.withIdentity({ subject: userId, tokenIdentifier: `test|${userId}` });
const brief = {
  displayName: 'Mina', agentName: 'Momo', dobMs: Date.UTC(1993, 5, 15),
  gender: 'woman' as const, interestedIn: ['man' as const], city: 'Seoul', neighborhood: 'Seongsu',
  interests: ['Reading', 'Coffee', 'Cooking'], personalityTraits: ['Thoughtful', 'Calm'],
  avatar: { palette: 'moss' as const, face: 'gentle' as const, hair: 'wave' as const, outfit: 'cardigan' as const, accessory: 'none' as const },
  essence: 'I am quiet at first and used to think short answers meant a lack of interest.',
  desiredConnection: 'Someone who can share small everyday mistakes without judgment.',
  boundaries: ['No pressure to meet quickly'], voice: 'warm' as const, autonomy: 'suggest' as const,
  relationshipIntent: 'open' as const, preferredPersonalityTraits: ['Thoughtful'], personalityPreference: 'important' as const,
  preferredStyleTags: [], stylePreference: 'no_preference' as const, locale: 'en-US', languages: ['English'],
  matchLocationScope: 'city' as const, preferredCountryCodes: ['KR'], preferredCities: ['Seoul'], preferredAreas: [], allowTranslatedDates: false,
};
async function person(t: Backend, name: string, gender: 'man' | 'woman' = 'woman', traits = ['Thoughtful']) {
  const userId = await t.run(ctx => ctx.db.insert('users', { name, email: `${name}@test.invalid` }));
  await asUser(t, userId).mutation(api.agents.bootstrap, { ...brief, displayName: name, agentName: name, gender, interestedIn: [gender === 'man' ? 'woman' : 'man'], personalityTraits: [...traits, 'Calm'] });
  await asUser(t, userId).mutation(api.profiles.updateNotificationPreferences, { notifyEmail: false });
  return userId;
}
const agent = (t: Backend, userId: Id<'users'>) => t.run(ctx => ctx.db.query('agentProfiles').withIndex('by_user', q => q.eq('userId', userId)).unique());
const prefs = (t: Backend, userId: Id<'users'>) => t.run(ctx => ctx.db.query('preferences').withIndex('by_user', q => q.eq('userId', userId)).unique());
async function feedback(t: Backend, userId: Id<'users'>, content: string, agentDateId?: Id<'agentDates'>) {
  await asUser(t, userId).mutation(api.agents.send, { content, agentDateId });
  const context = await t.query(internal.agents.replyContext, { userId });
  return { userId, sourceMessageId: context.messages.findLast(m => m.role === 'human')!._id, expectedContextKey: context.contextKey };
}
const settleReply = (t: Backend, source: Awaited<ReturnType<typeof feedback>>, memory: string) => t.mutation(internal.agents.storeReply, { ...source, memory, reply: 'I will carry that correction into my choices.' });
const search = (t: Backend, userId: Id<'users'>) => t.run(ctx => ctx.db.query('agentSearches').withIndex('by_user', q => q.eq('userId', userId)).unique());
const begin = (t: Backend, userId: Id<'users'>) => t.mutation(internal.scouting.begin, { userId, accessMode: 'demo' });
async function advance(t: Backend, userId: Id<'users'>) {
  const s = (await search(t, userId))!;
  vi.spyOn(Date, 'now').mockReturnValue(s.nextCheckAt!);
  await t.mutation(internal.scouting.advance, { searchId: s._id, revision: s.revision, allowed: true });
  return (await search(t, userId))!;
}
async function complete(t: Backend, dateId: Id<'agentDates'>, lesson: string) {
  await t.run(async ctx => {
    const date = (await ctx.db.get('agentDates', dateId))!;
    await ctx.db.patch('agentDates', dateId, { status: 'running', plannedTurns: 6, closingAfterRound: 2 });
    for (let round = 1; round <= 2; round++) await ctx.db.insert('agentDateTurns', {
      agentDateId: dateId, round, speakerUserId: round === 1 ? date.initiatorUserId : date.counterpartUserId,
      speakerAgentName: round === 1 ? 'Mina' : 'Candidate', content: `Visible fixture exchange ${round}`, subtext: 'OTHER_PRIVATE_INFERENCE', createdAt: Date.now() + round,
    });
  });
  await t.mutation(internal.agentDates.finish, {
    agentDateId: dateId, expectedTurns: 2, aVerdict: 'pass', bVerdict: 'curious', aReason: 'A stated need differed.', bReason: 'OTHER_SEALED_REASON',
    aDecisionCode: 'communication_mismatch', bDecisionCode: 'worth_exploring', aNextSearchNote: lesson, bNextSearchNote: `OTHER_PRIVATE_LESSON ${lesson}`,
    score: 40, summary: 'A fixture conversation.', sparks: [], frictions: [], demoConsent: 'pending',
  });
}

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('owner feedback over subsequent encounters', () => {
  test('keeps line coaching private, speaker-bound and attached after later home chats', async () => {
    const t = createBackend(), userId = await person(t, 'Mina'), candidate = await person(t, 'Noah', 'man'), stranger = await person(t, 'Outsider');
    await begin(t, userId); await begin(t, candidate);
    const dateId = (await advance(t, userId)).currentDateId!;
    await complete(t, dateId, 'A tentative lesson.');
    const before = (await asUser(t, userId).query(api.agentDates.get, { agentDateId: dateId }))!.turns;
    const input = { agentDateId: dateId, content: 'Keep my replies short. I would say: sure, you carry the popcorn.', feedbackTarget: 'self' as const, turnRound: 1 };
    await expect(asUser(t, stranger).mutation(api.agents.send, input)).rejects.toThrow();
    await expect(asUser(t, stranger).query(api.agents.dateCoaching, { agentDateId: dateId })).rejects.toThrow();
    await expect(asUser(t, candidate).mutation(api.agents.send, input)).rejects.toThrow();
    await expect(asUser(t, userId).mutation(api.agents.send, { ...input, turnRound: 99 })).rejects.toThrow();
    await expect(asUser(t, userId).mutation(api.agents.send, { ...input, agentDateId: undefined })).rejects.toThrow();
    await asUser(t, userId).mutation(api.agents.send, input);
    const context = await t.query(internal.agents.replyContext, { userId });
    const source = context.messages.findLast(m => m.role === 'human')!;
    await t.mutation(internal.agents.storeReply, { userId, sourceMessageId: source._id, expectedContextKey: context.contextKey, reply: 'Next time I could say: sure, you carry the popcorn.', memory: 'Keep replies short; no question in every turn.' });
    // More than the home chat's recent-message window must not lose date feedback.
    await t.run(async ctx => { for (let i = 0; i < 45; i++) await ctx.db.insert('agentMessages', { userId, role: 'agent', content: `Later home chat ${i}`, createdAt: Date.now() + 1000 + i }); });
    const own = await asUser(t, userId).query(api.agents.dateCoaching, { agentDateId: dateId });
    expect(own.pending).toBe(false);
    expect(own.messages).toHaveLength(2);
    expect(own.messages[1]).toMatchObject({ replyTo: source._id, feedbackTarget: 'self', turnRound: 1, agentDateId: dateId });
    expect(own.memory).toContain('Keep replies short');
    const other = await asUser(t, candidate).query(api.agents.dateCoaching, { agentDateId: dateId });
    expect(other.messages).toHaveLength(0);
    expect(other.memory).not.toContain('Keep replies short');
    expect((await asUser(t, userId).query(api.agentDates.get, { agentDateId: dateId }))!.turns).toEqual(before);
  });

  test('grounds counterpart feedback in their saved line without changing either human consent', async () => {
    const t = createBackend(), userId = await person(t, 'Mina'), candidate = await person(t, 'Noah', 'man');
    await begin(t, userId); await begin(t, candidate);
    const dateId = (await advance(t, userId)).currentDateId!;
    await complete(t, dateId, 'A tentative lesson.');
    const source = await feedback(t, userId, 'Keep my replies short.');
    await settleReply(t, source, 'Speak briefly; do not ask a question every time.');
    await asUser(t, userId).mutation(api.agents.send, { agentDateId: dateId, content: 'I liked their short answer. Please do not mistake brevity for disinterest in future matches.', feedbackTarget: 'counterpart', turnRound: 2 });
    const requests: Array<{ input: string }> = [];
    vi.stubEnv('OPENAI_API_KEY', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async (_url, options) => {
      requests.push(JSON.parse(options.body));
      return new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ reply: 'I will consider the meaning of short answers, and keep my own replies brief.', memory_update: 'Speak briefly; do not ask a question every time. Short answers from others are not necessarily disinterest.', preference_shift: { changed: false, reason: '', personality_traits: [], personality_weight: '', relationship_intent: '' } }) }] }] }), { status: 200 });
    }));
    await t.action(internal.agents.reply, { userId });
    const input = JSON.parse(requests[0].input);
    expect(input.feedback_focus).toBe('counterpart');
    expect(input.private_date_debrief).toBeNull();
    expect(input.owner.existing_scouting_memory).toBe('');
    expect(input.surrounding_saved_utterances).toHaveLength(2);
    expect(input.selected_saved_utterance).toMatchObject({ round: 2, content: 'Visible fixture exchange 2' });
    expect(input.owner.existing_memory).toContain('Speak briefly');
    const saved = await asUser(t, userId).query(api.agents.dateCoaching, { agentDateId: dateId });
    expect(saved.memory).toContain('Speak briefly');
    expect(saved.memory).toContain('Short answers from others');
    expect(await asUser(t, userId).query(api.agents.pendingProposal, {})).toBeNull();
    const view = (await asUser(t, userId).query(api.agentDates.get, { agentDateId: dateId }))!;
    expect(view.mine.consent).toBe('pending');
    expect(view.counterpart.contactEmail).toBeNull();
  });

  test('ignores old and duplicate model callbacks, even when two corrections share a timestamp', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.UTC(2026, 8, 8));
    const t = convexTest(schema, modules), userId = await person(t, 'Mina');
    const old = await feedback(t, userId, 'I like lots of questions.');
    const latest = await feedback(t, userId, 'Correction: short answers are fine; do not interrogate me.');
    await settleReply(t, latest, 'Short answers are not disinterest. Share a small mishap instead of interviewing.');
    await settleReply(t, old, 'Ask more and more questions.');
    await settleReply(t, latest, 'Duplicate that would otherwise overwrite the memory.');
    const saved = (await agent(t, userId))!;
    expect(saved.privateMemory).toContain('not disinterest');
    expect(saved.lastReplyTo).toBe(latest.sourceMessageId);
    expect(saved.pendingReplyTo).toBeUndefined();
    const messages = (await asUser(t, userId).query(api.agents.mine, {}))!.messages;
    expect(messages.filter(m => m.content === 'I will carry that correction into my choices.')).toHaveLength(1);
  });

  test('rebases a reply if a date lesson or owner edit arrived while the model was thinking', async () => {
    const t = convexTest(schema, modules), userId = await person(t, 'Mina');
    const old = await feedback(t, userId, 'Do not mistake short answers for disinterest.');
    const before = (await agent(t, userId))!;
    await t.run(ctx => ctx.db.patch('agentProfiles', before._id, { scoutingMemory: 'A newly completed encounter taught a separate lesson.' }));
    await settleReply(t, old, 'Stale summary');
    expect((await agent(t, userId))?.privateMemory).toBe('');
    const context = await t.query(internal.agents.replyContext, { userId });
    await settleReply(t, { ...old, expectedContextKey: context.contextKey }, 'Short answers are fine.');
    expect((await agent(t, userId))?.scoutingMemory).toContain('newly completed');
    const another = await feedback(t, userId, 'Please keep that correction.');
    await asUser(t, userId).mutation(api.agents.update, { name: 'New Momo', avatar: brief.avatar, essence: brief.essence, desiredConnection: brief.desiredConnection, boundaries: brief.boundaries, voice: 'quiet', autonomy: 'suggest' });
    await settleReply(t, another, 'An obsolete reply from the old brief');
    expect((await agent(t, userId))?.privateMemory).toBe('Short answers are fine.');
  });

  test('revisiting onboarding preserves learned memory and does not resurrect an outdated proposal', async () => {
    const t = convexTest(schema, modules), userId = await person(t, 'Mina');
    const source = await feedback(t, userId, 'I want to look for playful people.');
    await t.mutation(internal.agents.storeReply, { ...source, memory: 'Short answers are fine.', reply: 'May I look for Playful instead?', proposal: { reason: 'Your correction', preferredPersonalityTraits: ['Playful'] } });
    const proposal = (await asUser(t, userId).query(api.agents.pendingProposal, {}))!;
    await feedback(t, userId, 'Actually leave the search settings as they were.');
    await asUser(t, userId).mutation(api.agents.respondToProposal, { proposalId: proposal._id, accept: true });
    expect((await prefs(t, userId))?.preferredPersonalityTraits).toEqual(['Thoughtful']);
    expect(await asUser(t, userId).query(api.agents.pendingProposal, {})).toBeNull();
    await asUser(t, userId).mutation(api.agents.bootstrap, brief);
    expect((await agent(t, userId))?.privateMemory).toBe('Short answers are fine.');
  });

  test('waits for feedback from either participant before claiming the next encounter', async () => {
    const t = convexTest(schema, modules), userId = await person(t, 'Mina'), candidate = await person(t, 'Noah', 'man');
    await begin(t, userId); await begin(t, candidate);
    const source = await feedback(t, userId, 'Give me room before the next date.');
    const waiting = await advance(t, userId);
    expect(waiting.status).toBe('searching');
    expect(waiting.currentDateId).toBeUndefined();
    expect((await advance(t, candidate)).currentDateId).toBeUndefined();
    expect(await t.run(ctx => ctx.db.query('agentDates').collect())).toHaveLength(0);
    await settleReply(t, source, 'Short answers are fine.');
    const paired = await advance(t, userId);
    expect(paired.status).toBe('talking');
    expect((await t.query(internal.agentDates.runContext, { agentDateId: paired.currentDateId! }))?.aAgent?.privateMemory).toContain('Short answers');
  });

  test.each([false, true])('changes the next candidate only when the owner accepts: %s', async accept => {
    const t = convexTest(schema, modules), userId = await person(t, 'Mina');
    const thoughtful = await person(t, 'Noah', 'man', ['Thoughtful']);
    const playful = await person(t, 'Finn', 'man', ['Playful']);
    const before = (await prefs(t, userId))!;
    const source = await feedback(t, userId, 'I now prefer playful people.');
    await t.mutation(internal.agents.storeReply, { ...source, memory: 'Owner is considering Playful.', reply: 'Shall I change who I look for?', proposal: { reason: 'An explicit correction', preferredPersonalityTraits: ['Playful'], personalityPreference: 'important' } });
    expect((await prefs(t, userId))?.preferredPersonalityTraits).toEqual(['Thoughtful']);
    const proposal = (await asUser(t, userId).query(api.agents.pendingProposal, {}))!;
    await asUser(t, userId).mutation(api.agents.respondToProposal, { proposalId: proposal._id, accept });
    await begin(t, userId); await begin(t, thoughtful); await begin(t, playful);
    const paired = await advance(t, userId);
    const date = await t.run(ctx => ctx.db.get('agentDates', paired.currentDateId!));
    expect(date?.counterpartUserId).toBe(accept ? playful : thoughtful);
    const after = (await prefs(t, userId))!;
    for (const key of ['ageMin', 'ageMax', 'ageHard', 'preferredCities', 'allowTranslatedDates', 'maxDistanceKm', 'relationshipIntent'] as const) expect(after[key]).toEqual(before[key]);
    const context = await t.query(internal.agents.replyContext, { userId });
    expect(context.latestProposal?.status).toBe(accept ? 'accepted' : 'declined');
  });

  test.each([false, true])('chooses the next matching relationship goal only after approval: %s', async accept => {
    const t = convexTest(schema, modules), userId = await person(t, 'Mina');
    const casual = await person(t, 'Noah', 'man'), serious = await person(t, 'Finn', 'man');
    await t.run(async ctx => {
      for (const [who, intent] of [[userId, 'casual'], [casual, 'casual'], [serious, 'serious']] as const) {
        const p = (await ctx.db.query('preferences').withIndex('by_user', q => q.eq('userId', who)).unique())!;
        await ctx.db.patch('preferences', p._id, { relationshipIntent: intent });
      }
    });
    await begin(t, userId); await begin(t, casual); await begin(t, serious);
    const source = await feedback(t, userId, 'I now want a serious relationship. Propose that change.');
    await t.mutation(internal.agents.storeReply, { ...source, memory: 'Owner is considering a serious relationship.', reply: 'Shall I change the goal?', proposal: { reason: 'An explicit correction', preferredPersonalityTraits: [], relationshipIntent: 'serious' } });
    expect((await prefs(t, userId))?.relationshipIntent).toBe('casual');
    const proposal = (await asUser(t, userId).query(api.agents.pendingProposal, {}))!;
    await asUser(t, userId).mutation(api.agents.respondToProposal, { proposalId: proposal._id, accept });
    const paired = await advance(t, userId);
    expect((await t.run(ctx => ctx.db.get('agentDates', paired.currentDateId!)))?.counterpartUserId).toBe(accept ? serious : casual);
  });

  test('closes an incompatible pending introduction after a goal change without inventing a human no', async () => {
    const t = convexTest(schema, modules), userId = await person(t, 'Mina'), candidate = await person(t, 'Noah', 'man');
    await begin(t, userId); await begin(t, candidate);
    const paired = await advance(t, userId), dateId = paired.currentDateId!;
    await t.run(async ctx => {
      await ctx.db.patch('agentDates', dateId, { status: 'debrief_ready', initiatorVerdict: 'encourage', counterpartVerdict: 'encourage' });
      for (const who of [userId, candidate]) {
        const session = (await ctx.db.query('agentSearches').withIndex('by_user', q => q.eq('userId', who)).unique())!;
        await ctx.db.patch('agentSearches', session._id, { status: 'match_ready' });
      }
    });
    await asUser(t, candidate).mutation(api.agentDates.consent, { agentDateId: dateId, decision: 'yes' });
    const source = await feedback(t, userId, 'I now want only a serious relationship.');
    await t.mutation(internal.agents.storeReply, { ...source, memory: 'A serious relationship.', reply: 'Shall I change the goal?', proposal: { reason: 'An explicit correction', preferredPersonalityTraits: [], relationshipIntent: 'serious' } });
    const proposal = (await asUser(t, userId).query(api.agents.pendingProposal, {}))!;
    await asUser(t, userId).mutation(api.agents.respondToProposal, { proposalId: proposal._id, accept: true });
    const closed = await t.run(ctx => ctx.db.get('agentDates', dateId));
    expect(closed).toMatchObject({ status: 'closed', initiatorConsent: 'pending', counterpartConsent: 'yes' });
    expect((await search(t, userId))?.status).toBe('searching');
    expect((await search(t, candidate))?.status).toBe('searching');
    expect((await asUser(t, userId).query(api.agentDates.get, { agentDateId: dateId }))?.counterpart.contactEmail).toBeNull();
    await expect(asUser(t, userId).mutation(api.agentDates.consent, { agentDateId: dateId, decision: 'yes' })).rejects.toThrow();
  });

  test('passes retained corrections to the next speaker and verdict, without the other owner’s private feedback', async () => {
    const t = convexTest(schema, modules), userId = await person(t, 'Mina'), candidate = await person(t, 'Noah', 'man');
    const source = await feedback(t, userId, 'Short answers are not disinterest.');
    await settleReply(t, source, 'OWNER_CORRECTION: Short answers are not disinterest.');
    const otherSource = await feedback(t, candidate, 'A private reason I do not disclose.');
    await settleReply(t, otherSource, 'OTHER_OWNER_SECRET');
    await begin(t, userId); await begin(t, candidate);
    const paired = await advance(t, userId), dateId = paired.currentDateId!;
    await t.run(ctx => ctx.db.patch('agentDates', dateId, { status: 'running', plannedTurns: 6 }));
    const requests: Array<{ instructions: string; input: string; text: { format: { name: string } } }> = [];
    vi.stubEnv('OPENAI_API_KEY', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async (_url, options) => {
      const request = JSON.parse(options.body);
      requests.push(request);
      const value = request.text.format.name === 'agent_date_review_audit'
        ? { supported: true, issues: [] }
        : request.text.format.name === 'agent_date_turn'
        ? { reply: "I'd probably burn the egg in this kitchen; we could still rescue dinner.", subtext: 'Private', ends_conversation: false }
        : { verdict: 'curious', reason: 'A short answer did not mean disinterest.', next_search_note: 'Check the ordinary response.', decision_code: 'worth_exploring', compatibility_score: 50, summary: 'A brief fixture exchange.', sparks: [], frictions: [], followup_question: '', headline: 'The egg in the kitchen', anchor_round: 2, question: 'How did that short reply feel?' };
      return new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(value) }] }] }), { status: 200 });
    }));
    await t.action(internal.agentDates.runTurn, { agentDateId: dateId, round: 1 });
    const turnInput = JSON.parse(requests[0].input);
    expect(turnInput.your_private_owner_brief.memory).toContain('OWNER_CORRECTION');
    expect(requests[0].input).not.toContain('OTHER_OWNER_SECRET');
    await t.run(async ctx => {
      for (let round = 2; round <= 6; round++) await ctx.db.insert('agentDateTurns', { agentDateId: dateId, round, speakerUserId: round % 2 ? userId : candidate, speakerAgentName: round % 2 ? 'Mina' : 'Noah', content: `Fixture reply ${round}`, subtext: 'Private', createdAt: Date.now() + round });
    });
    await t.action(internal.agentDates.finalize, { agentDateId: dateId });
    const verdicts = requests.filter(r => r.text.format.name === 'agent_date_verdict');
    expect(verdicts).toHaveLength(2);
    expect(verdicts[0].input).toContain('OWNER_CORRECTION');
    expect(verdicts[0].input).not.toContain('OTHER_OWNER_SECRET');
    expect(verdicts[1].input).toContain('OTHER_OWNER_SECRET');
    expect(verdicts[1].input).not.toContain('OWNER_CORRECTION');
    const audits = requests.filter(r => r.text.format.name === 'agent_date_review_audit');
    expect(audits).toHaveLength(2);
    expect(audits[0].input).toContain('OWNER_CORRECTION');
    expect(audits[0].input).not.toContain('OTHER_OWNER_SECRET');
    expect(audits[1].input).toContain('OTHER_OWNER_SECRET');
    expect(audits[1].input).not.toContain('OWNER_CORRECTION');
  });

  test('keeps prior learning intact when the feedback model fails, and acknowledges that failure honestly', async () => {
    const t = convexTest(schema, modules), userId = await person(t, 'Mina');
    const source = await feedback(t, userId, 'Short answers are fine.');
    await settleReply(t, source, 'A durable correction.');
    await feedback(t, userId, 'Change your mind about this date.');
    vi.stubEnv('OPENAI_API_KEY', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: { code: 'invalid_api_key', message: 'Fixture failure' } }), { status: 401 })));
    await t.action(internal.agents.reply, { userId });
    const home = (await asUser(t, userId).query(api.agents.mine, {}))!;
    expect(home.agent.privateMemory).toBe('A durable correction.');
    expect(home.messages.some(m => m.role === 'agent' && m.content.includes("couldn't update"))).toBe(true);
    expect(await asUser(t, userId).query(api.agents.pendingProposal, {})).toBeNull();
    const candidate = await person(t, 'Noah', 'man');
    await begin(t, userId); await begin(t, candidate);
    const paired = await advance(t, userId);
    const next = await t.query(internal.agentDates.runContext, { agentDateId: paired.currentDateId! });
    expect(next?.aFeedback).toContain('Change your mind about this date.');
  });

  test('reads all ten moments of an extended debrief while keeping the counterpart verdict sealed', async () => {
    const t = convexTest(schema, modules), userId = await person(t, 'Mina'), candidate = await person(t, 'Noah', 'man');
    await begin(t, userId); await begin(t, candidate);
    const paired = await advance(t, userId), dateId = paired.currentDateId!;
    await complete(t, dateId, 'A tentative lesson.');
    await t.run(async ctx => {
      await ctx.db.patch('agentDates', dateId, { plannedTurns: 10, closingAfterRound: undefined });
      for (let round = 3; round <= 10; round++) await ctx.db.insert('agentDateTurns', { agentDateId: dateId, round, speakerUserId: round % 2 ? userId : candidate, speakerAgentName: round % 2 ? 'Mina' : 'Noah', content: round === 10 ? 'The last reply changed my interpretation.' : `Moment ${round}`, subtext: 'OTHER_PRIVATE_INFERENCE', createdAt: Date.now() + round });
    });
    await feedback(t, userId, 'It was the last reply I meant. Please consider that.', dateId);
    const context = await t.query(internal.agents.replyContext, { userId });
    expect(context.dateContext?.turns).toHaveLength(10);
    expect(context.dateContext?.turns.at(-1)?.content).toContain('last reply');
    expect(JSON.stringify(context.dateContext)).not.toContain('OTHER_SEALED_REASON');
    expect(JSON.stringify(context.dateContext)).not.toContain('OTHER_PRIVATE_INFERENCE');
    await expect(asUser(t, candidate).query(api.agents.mine, {})).resolves.not.toHaveProperty('contextKey');
  });

  test('repairs an unsupported autobiographical claim before it can enter the saved conversation', async () => {
    const t = convexTest(schema, modules), userId = await person(t, 'Mina'), candidate = await person(t, 'Noah', 'man');
    await begin(t, userId); await begin(t, candidate);
    const paired = await advance(t, userId), dateId = paired.currentDateId!;
    await t.run(ctx => ctx.db.patch('agentDates', dateId, { status: 'running', plannedTurns: 6 }));
    let calls = 0;
    vi.stubEnv('OPENAI_API_KEY', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => {
      calls++;
      const value = calls === 1
        ? { reply: 'I have a secret menu-picking habit.', subtext: '', owner_fact_evidence: [{ claim: 'menu-picking habit', source_quote: 'A sentence absent from every owner source.' }], ends_conversation: false }
        : { reply: "I'd pick this coffee and see what happens.", subtext: '', owner_fact_evidence: [], ends_conversation: false };
      return new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(value) }] }] }), { status: 200 });
    }));
    await t.action(internal.agentDates.runTurn, { agentDateId: dateId, round: 1 });
    const context = await t.query(internal.agentDates.runContext, { agentDateId: dateId });
    expect(calls).toBe(2);
    expect(context?.turns).toHaveLength(1);
    expect(context?.turns[0].content).not.toContain('habit');
    expect(context?.turns[0].content).toContain("I'd pick");
    expect(context?.turns[0]).not.toHaveProperty('owner_fact_evidence');
  });

  test('retains an explicit correction across 180 simulated days and 36 new encounters, with no recycled pair or private leak', async () => {
    const start = Date.UTC(2026, 8, 8);
    vi.spyOn(Date, 'now').mockReturnValue(start);
    const t = convexTest(schema, modules), userId = await person(t, 'Mina');
    const source = await feedback(t, userId, 'Short answers do not mean disinterest. Share a small mishap first.');
    const durable = 'Short answers do not mean disinterest. Share a small mishap first.';
    await settleReply(t, source, durable);
    await begin(t, userId);
    const partners = [];
    for (let i = 0; i < 36; i++) {
      vi.spyOn(Date, 'now').mockReturnValue(start + (i + 1) * 5 * DAY);
      const candidate = await person(t, `Partner${i}`, 'man');
      partners.push(candidate);
      await begin(t, candidate);
      const paired = await advance(t, candidate);
      const dateId = paired.currentDateId!;
      expect(dateId).toBeDefined();
      await complete(t, dateId, `Separate observation ${i}`);
      const a = (await agent(t, userId))!;
      expect(a.privateMemory).toBe(durable);
      expect((a.scoutingMemory ?? '').split('\n')).toHaveLength(Math.min(6, i + 1));
      const view = (await asUser(t, candidate).query(api.agentDates.get, { agentDateId: dateId }))!;
      expect(JSON.stringify(view)).not.toContain(durable);
      expect(view.counterpart.contactEmail).toBeNull();
      await asUser(t, candidate).mutation(api.scouting.pause, {});
    }
    await begin(t, partners[0]);
    const revisiting = await advance(t, partners[0]);
    expect(revisiting.status).toBe('waiting');
    expect(revisiting.currentDateId).toBeUndefined();
    expect(await t.run(ctx => ctx.db.query('agentDates').collect())).toHaveLength(36);
    expect((await agent(t, userId))?.privateMemory).toBe(durable);
    expect(await t.run(ctx => ctx.db.query('emailMessages').collect())).toHaveLength(0);
  });
});

test('a stale positive verdict cannot introduce people whose goals changed during the date', async () => {
  const t = createBackend(), userId = await person(t, 'Mina'), candidate = await person(t, 'Noah', 'man');
  await begin(t, userId); await begin(t, candidate);
  const paired = await advance(t, userId), dateId = paired.currentDateId!;
  const source = await feedback(t, userId, 'I have decided I want a serious relationship.');
  await t.mutation(internal.agents.storeReply, { ...source, memory: 'A serious relationship.', reply: 'Shall I change the goal?', proposal: { reason: 'An explicit correction', preferredPersonalityTraits: [], relationshipIntent: 'serious' } });
  const proposal = (await asUser(t, userId).query(api.agents.pendingProposal, {}))!;
  await asUser(t, userId).mutation(api.agents.respondToProposal, { proposalId: proposal._id, accept: true });
  await t.mutation(internal.agentDates.finish, {
    agentDateId: dateId, expectedTurns: await t.run(async ctx => {
      const date = (await ctx.db.get('agentDates', dateId))!;
      await ctx.db.patch('agentDates', dateId, { status: 'running', completedAt: undefined });
      return conversationLimit(date);
    }),
    aVerdict: 'encourage', bVerdict: 'encourage', aReason: 'An old positive opinion.', bReason: 'An old positive opinion.',
    aDecisionCode: 'strong_alignment', bDecisionCode: 'strong_alignment', aNextSearchNote: 'A shared moment.', bNextSearchNote: 'A shared moment.',
    score: 90, summary: 'An existing conversation.', sparks: [], frictions: [], demoConsent: 'pending',
  });
  const view = await asUser(t, userId).query(api.agentDates.get, { agentDateId: dateId });
  expect(view?.date).toMatchObject({ status: 'closed', introductionReady: false });
  expect(view?.counterpart.contactEmail).toBeNull();
  expect((await search(t, userId))?.status).toBe('searching');
  expect(await t.run(ctx => ctx.db.query('notifications').collect())).toHaveLength(0);
  expect(await t.run(ctx => ctx.db.query('emailMessages').collect())).toHaveLength(0);
});

test('a failed reply never lowers the fence a newer message raised', async () => {
  const t = createBackend();
  const userId = await person(t, 'Mina');
  const agent = (await t.run(ctx => ctx.db.query('agentProfiles').withIndex('by_user', q => q.eq('userId', userId)).unique()))!;
  const [first, second] = await t.run(async ctx => [
    await ctx.db.insert('agentMessages', { userId, role: 'human', content: 'Speak more like me.', createdAt: 1 }),
    await ctx.db.insert('agentMessages', { userId, role: 'human', content: 'Actually, keep it shorter.', createdAt: 2 }),
  ]);

  // The second message is the one being learned when the first attempt dies.
  await t.run(ctx => ctx.db.patch('agentProfiles', agent._id, { pendingReplyTo: second, pendingReplyAt: 2 }));
  await t.mutation(internal.agents.releaseFeedbackFence, { userId, sourceMessageId: first });
  expect((await t.run(ctx => ctx.db.get('agentProfiles', agent._id)))?.pendingReplyTo).toBe(second);

  // Its own failure does lower it.
  await t.mutation(internal.agents.releaseFeedbackFence, { userId, sourceMessageId: second });
  const cleared = await t.run(ctx => ctx.db.get('agentProfiles', agent._id));
  expect(cleared?.pendingReplyTo).toBeUndefined();
  expect(cleared?.pendingReplyAt).toBeUndefined();
});
