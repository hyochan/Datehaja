import type { MutationCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';

/** A suggestion based on an older brief must never undo an owner's new choice. */
export async function supersedeAgentProposals(ctx: MutationCtx, userId: Id<'users'>) {
  for await (const proposal of ctx.db.query('agentProposals')
    .withIndex('by_user_and_status', q => q.eq('userId', userId).eq('status', 'pending'))) {
    await ctx.db.patch('agentProposals', proposal._id, { status: 'superseded', resolvedAt: Date.now() });
  }
}

/**
 * A reply can legitimately take ~3 minutes (two 90s model attempts), but a
 * scheduled action that never completes must not block its owner from dating
 * for good: Convex does not retry a failed action, and nothing else clears the
 * fence. Past this age the fence is ignored and the next message replaces it.
 */
export const PENDING_REPLY_TTL_MS = 5 * 60_000;

export function isLearningFeedback(
  agent: { pendingReplyTo?: Id<'agentMessages'>; pendingReplyAt?: number } | null | undefined,
  now: number,
): boolean {
  if (!agent?.pendingReplyTo) return false;
  return now - (agent.pendingReplyAt ?? 0) < PENDING_REPLY_TTL_MS;
}
