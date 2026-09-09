---
name: loop-review
description: Run Datehaja's full change-to-merge loop from a fresh main — semantic branch, implement and verify, review-self until stable, commit and open a PR with its Vercel preview, poll review and checks every five minutes, fix findings, and merge only when the exact head is clean. Deploying stays a separate, user-approved step. Use when the user invokes /loop-review or asks for the recurring self-review, PR, review-until-clean, then merge workflow.
---

# Loop review

Own one Datehaja change from a fresh `main` baseline through a verified merge.
This loop ends at the merge. It never deploys.

## Load first

- `CLAUDE.md` at the repo root and at `~/Github/CLAUDE.md`.
- `convex/_generated/ai/guidelines.md` before touching anything under `convex/`.
- `.claude/skills/review-self/SKILL.md`, `.claude/commands/commit.md`, and
  `.claude/commands/review-pr.md`.
- The Convex skills that match the changed paths (`convex-expert`,
  `convex-reviewer`, `convex-authz`, `convex-deploy-guard`).

Invoking this loop authorizes the in-scope branch, commit, push, PR, review
replies, thread resolution, and merge. It does not authorize deploying to
production, changing Vercel or Convex settings, or unrelated cleanup.

## 1. Start from current main

1. Snapshot `git status --short --branch`. Preserve every existing change.
2. For new work, require a clean worktree, then `git fetch origin` and
   `git merge --ff-only origin/main` on `main`.
3. Create a semantic branch named per `.claude/commands/commit.md`.
4. Record the starting main SHA.

Never start new work on a stale `main`. If work is already in progress, treat
this as a resumed loop: verify the recorded or merge-base baseline and use
`rebase-main` when an update from `origin/main` is needed. Stop for direction if
an update would overwrite unrelated user work.

## 2. Implement and verify

Implement the requested scope, then run every check the touched paths need:

```bash
bun run typecheck && bun run lint && bun run test
```

Add `bun run build` when the change can break the production bundle. For a
change visible in the browser, verify it in the running app rather than assuming
— start the dev server through the Browser pane and check the real render.

Do not proceed while a required check is failing.

## 3. Stabilize with review-self

Run the `review-self` skill against the complete base-to-working-tree diff. Fix
every validated in-scope finding and rerun the affected checks. Re-enter it on
five-minute wake-ups until two consecutive complete snapshots are clean.

Use `ScheduleWakeup`, never a shell sleep loop. Any material diff change resets
the consecutive-clean count.

## 4. Commit and open the PR

Follow `.claude/commands/commit.md`:

- Stage only files owned by the task.
- Write an English conventional commit message, lowercase after the type.
- Push the branch and open an English PR against `main`.
- Attach evidence for anything visible: a before/after image via `SendUserFile`
  and in the PR body, plus the measurement that proves the fix.
- Label the PR. Every PR carries at least one label from `gh label list`; the
  command's table maps the change to it. An unlabelled PR is not done.

Record the PR number and the exact head SHA. Every push invalidates all prior
clean review coverage.

## 5. Review the PR until the exact head is clean

Run `.claude/commands/review-pr.md`, then re-enter it every five minutes.

Each round:

1. Fetch unresolved threads, review state, the head SHA, and the Vercel checks.
2. Fix all valid findings in one batch, push, reply to the exact inline
   comments, and resolve only fixed or outdated threads.
3. Rerun the checks the batch affects plus anything previously failing.
4. Keep polling while a check or review is pending. Do not rerun expensive
   unchanged local checks on a no-op poll.

Clean means all of these hold for the same head SHA:

- zero unresolved actionable review threads;
- the reviewer pass is clean for that exact head;
- the Vercel preview deployment is `Ready`, not `Error`;
- `bun run typecheck`, `bun run lint`, and `bun run test` pass locally on that
  head, since this repo has no CI to prove it;
- the PR is mergeable and contains every required update from `main`;
- the worktree is clean and the final diff has been reread.

## 6. Check the deploy ordering before merging

Merging `main` runs `.github/workflows/deploy.yml`, whose `Deploy backend +
convex.site` job pushes the Convex backend and publishes the static site
together, then verifies `merry-bass-190.convex.site` serves that exact bundle.
The backend is not a manual step.

Vercel rebuilds `datehaja.com` in parallel and independently, so that host can
serve a new frontend for a few minutes before the backend job lands.

So check whether that window is safe. It is safe when every backend change is
additive: new functions, arguments that are only ever optional, optional schema
fields, new tables and indexes, and no new value projected to an existing
client. Nothing that already works breaks; only the new surfaces error until
the deploy job finishes.

Require an explicit hand-back **before** merging when the diff is not additive
in that sense — a removed or renamed function, a newly required argument, a
narrowed return shape, or a changed value an existing client already reads.
State plainly what the deployed frontend would send that the backend could not
answer, and let the user decide the ordering.

Never describe the change as shipped until the deploy job has actually run and
the served bundle has been checked.

When the diff is frontend-only, say so explicitly and name the paths that
justify it.

## 7. Merge and close the loop

Refetch the PR immediately before merging and confirm the head still equals the
clean reviewed SHA. Squash merge with branch deletion unless a stricter policy
applies. Never merge a stale, pending, or failing head.

After merging:

1. Confirm the PR state is `MERGED` and record the merge commit.
2. Remove temporary review-trigger comments.
3. Switch to `main` and fast-forward when that cannot disturb other work.
4. Report the PR, merge commit, checks, review coverage, and anything skipped.

Do not deploy. Merging `main` triggers the Vercel production build on its own;
the Convex backend still needs the user's command from step 6.

## Stop conditions

Stop without merging when a required choice lacks authority, the same finding
survives two fix attempts, an access blocker repeats three rounds, the backend
gate applies and has not been handed back, or the exact head cannot satisfy the
clean gate. Report the concrete blocker. Never call a pending or partially
reviewed PR clean.
