---
name: review-self
description: Independently review Datehaja's current implementation, working-tree changes, or a pull request; validate findings against the code, fix the in-scope ones, rerun the affected checks, and recheck every five minutes until two clean snapshots. Use when the user says review-self, asks Claude to review its own changes, or wants current work watched for new issues after implementation.
---

# Review self

Review the current work immediately, fix validated gaps, and confirm with
recurring rounds until the result is stable.

## Preserve authority and scope

- Invocation authorizes inspecting the work, making local in-scope fixes, and
  running verification. Nothing else.
- Do not commit, push, open or edit a PR, comment, merge, or deploy unless the
  user already authorized it. `loop-review` supplies that authority when it
  calls this skill.
- Keep fixes tied to the original goal. This is not a broad audit, a speculative
  refactor, or a dependency upgrade.
- Preserve pre-existing user changes. Record the initial working-tree state and
  never sweep-stage or discard files outside the current fix batch.
- Stop and ask when a fix needs a product decision, new authority, or an
  irreversible action.

## Establish the target

1. Reconstruct the requested outcome and its acceptance criteria from the
   conversation and the repository.
2. Use an explicitly supplied PR, branch, commit range, or path. Otherwise
   review the current branch plus staged, unstaged, and untracked changes.
3. For a PR, derive the base and head from PR metadata. Otherwise use the
   upstream and merge base; do not guess a base when it is ambiguous.
4. Read `CLAUDE.md`, and `convex/_generated/ai/guidelines.md` before reviewing
   anything under `convex/`.
5. Stop with a short report when there is no reviewable diff.

## Run one round

1. Resnapshot the target from disk: the full base-to-head diff, staged and
   unstaged overlays, and untracked file contents. Never review only the latest
   commit or trust the previous round's snapshot.
2. Read the surrounding implementation, tests, and requirements needed to judge
   the change.
3. Review for evidence-backed, actionable gaps:
   - requirement completeness and end-to-end wiring, including whether the
     frontend and the Convex backend still agree on every validator and shape;
   - correctness, error paths, edge cases, state transitions, races, and data
     safety;
   - authorization on every new or changed Convex function, per `convex-authz`;
   - unbounded queries, missing indexes, and `Date.now()` inside a query;
   - i18n: every user-visible string goes through `t()` and exists in all six
     locale packs;
   - missing tests for the behavior the change introduces.
4. Use read-only subagents for separate lenses when the diff is large. Give them
   the raw target and request, never your suspected findings.
5. Validate every finding against the current code. Reject taste, cosmetic
   churn, duplicates, and unrelated nice-to-haves.
6. Fix the validated in-scope findings in one coherent batch.
7. Reread the resulting diff, then run the checks the touched paths need:

   ```bash
   bun run typecheck && bun run lint && bun run test
   ```

   Add `bun run build` when the bundle could break. Verify anything visible in
   the running app rather than assuming. Do not rerun an expensive unchanged
   check unless new state can affect it.
8. If the target has a PR, read its failed checks and unresolved feedback as
   evidence. Handle threads with one pass of `.claude/commands/review-pr.md`
   only when GitHub writes are authorized, and never enter its polling section:
   this skill owns the loop.

## Act as a review-pr fallback

When `review-pr` calls this skill because no external reviewer covered the head:

- Run exactly one complete round against the supplied base, head SHA, and
  acceptance criteria, keeping the caller's write authority.
- Do not re-enter `review-pr`, call this fallback again, or schedule this
  skill's loop.
- Return the reviewed head, findings and fixes, checks run, and a clean or
  blocked result. The caller may cache clean only for that exact head.

## Recheck at the interval

- Run the first round immediately.
- If the user asked for one pass, stop after it.
- Otherwise schedule the next round with `ScheduleWakeup` at the user's
  interval, or 300 seconds by default, with a prompt that re-enters
  `review-self`. Never emulate the loop with `sleep`, `while true`, or an
  abandoned background process, and never claim a pass was scheduled unless the
  tool accepted it.
- Keep at most one outstanding wake-up per target.
- Carry a compact state capsule in the scheduled prompt: goal and acceptance
  criteria, target and base, head and worktree fingerprints, seen findings and
  check IDs, poll count, clean count, interval, and existing authority. Keep it
  out of tracked files and revalidate against disk on every wake-up.
- Increment the clean count only when a complete round has no actionable
  findings, all verification passes, checks are terminal and successful, no
  actionable feedback remains, and the final diff has been reread. Reset it on
  any material change.
- Finish after two consecutive clean snapshots separated by the interval.
- Treat pending checks as neither clean nor failed.

## Stop safely

Stop and report the exact state when: two clean snapshots establish stability;
the user redirects; the PR is merged or closed or the branch disappears; a
finding needs authority you do not have; the same root finding survives two fix
attempts; the same environment failure blocks three consecutive rounds; or only
unchanged pending state remains for an hour.

Never call a blocked or interrupted result clean.

## Communicate

State the target, base, scope, and authority at startup. Report findings, fixes,
failures, and pushes promptly; keep no-op updates to one line. On success or
stop, summarize findings fixed, files changed, checks run, clean-count evidence,
and any unresolved blocker.
