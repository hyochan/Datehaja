---
name: rebase-main
description: Safely update local main with a fast-forward-only pull, rebase the current branch onto it, resolve conflicts without losing local work, and restore staged, unstaged, and untracked changes. Use when the user asks to pull main and rebase, update a branch from main, fix rebase conflicts, or says rebase-main.
---

# Rebase main

Update `main`, rebase the current branch, and preserve every pre-existing
working-tree change. Do not commit or push unless separately authorized.

## Establish the target

1. Record the current branch, `HEAD`, upstream, staged and unstaged changes,
   untracked files, and the ignored env files this repo depends on
   (`.env.local` carries the Convex dev URL) with content fingerprints.
2. Stop if the checkout is detached, the current branch is `main`, another
   merge, rebase, or cherry-pick is active, or `main` is checked out in another
   worktree.
3. Use `origin` and `main`.

## Safeguard local work

If the worktree is dirty:

1. Capture status and content fingerprints so restoration can be verified.
2. Create one clearly named stash with `--include-untracked`. Never use `--all`:
   `.env.local`, credentials, and build caches must stay in place.
3. Record the stash object and confirm the tracked and untracked worktree is
   clean.
4. If a changed ignore rule makes a previously ignored file appear untracked, do
   not stash, move, or delete it. Add its exact path to `.git/info/exclude` as a
   recorded temporary safeguard, and only after confirming neither `main` nor
   the work branch tracks that path.
5. If stashing fails or changes remain unexplained, stop before switching
   branches.

Treat the stash as a recovery point. Do not drop it until restoration is
verified.

## Update main and rebase

Before every branch switch, compare each recorded ignored path against the
destination tree and stop on a tracked-path collision. Use
`git checkout --no-overwrite-ignore <branch>` for these transitions.

1. `git fetch origin main`, then check the recorded ignored paths against both
   the current `main` tree and the fetched `origin/main`.
2. Check out `main` with `--no-overwrite-ignore`.
3. `git merge --ff-only origin/main`. Never reset, force-update, or create a
   merge commit for a divergent local `main`.
4. Confirm `main` and `origin/main` are the same commit. If local `main` is
   ahead, stop and report that divergence instead of rebasing onto unpublished
   work.
5. Check out the work branch with `--no-overwrite-ignore` after repeating the
   collision check.
6. `git rebase origin/main`.
7. For each conflict, inspect the base, the main side, and the branch side.
   Preserve both compatible intents; never apply blanket `ours` or `theirs`.
8. Run `git rebase --continue` only after reviewing the resolved files and the
   staged diff. If intent is ambiguous, stop with the conflict list and keep the
   rebase recoverable.

Never use `git reset --hard`, `git checkout --`, or `git clean`.

## Restore and verify

1. Apply the stash with its index so staged state returns.
2. Resolve restoration conflicts with the same care. Do not drop the stash while
   any mismatch remains.
3. Remove temporary `.git/info/exclude` entries once the restored ignore rules
   cover those paths again.
4. Compare the restored staged, unstaged, and untracked state against the
   initial snapshot. Confirm `.env.local` still exists and was not added to Git.
5. Drop only the named safeguard stash.
6. Run `git status`, `git diff --check`, and `bun run typecheck`. Confirm the
   branch is based on the updated `main` and report the old and new heads.

If the branch was already pushed, explain that the rewritten history needs a
later `git push --force-with-lease`. Never run that push unless authorized.
