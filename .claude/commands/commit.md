---
description: Commit Datehaja changes with the repo's conventions, optionally push and open a PR with its Vercel preview.
---

# Commit changes

## Usage

```
/commit                  # commit staged or task-owned files
/commit --all            # stage every task-owned change, then commit
/commit --all --pr       # commit, push the branch, open a PR
```

## 1. Check the branch

```bash
git status --short --branch
git rev-parse --abbrev-ref HEAD
```

Never commit directly to `main`. If you are on `main`, create a semantic branch
first:

```
<type>/<short-kebab-summary>
```

`type` is one of `feat`, `fix`, `refactor`, `chore`, `docs`, `test`. Examples:
`fix/avatar-spark-badge`, `feat/agent-date-retry`, `chore/i18n-cleanup`.

## 2. Stage only what the task owns

```bash
git status --short
git add <explicit paths>
git diff --cached --stat
```

Never `git add -A` when unrelated changes are present. Never stage `.env.local`,
`.vercel/`, `dist/`, or anything under `convex/_generated/` unless the generator
produced it as part of this task.

## 3. Review before committing

```bash
git diff --cached
git diff --check
```

Run the checks the touched paths need:

```bash
bun run typecheck && bun run lint && bun run test
```

## 4. Commit

English conventional commit, lowercase after the type prefix:

```
<type>(<scope>): <imperative summary under 72 chars>

<body: why the change was needed and what it does, wrapped at 80>

<attribution trailer>
```

Use the exact `Co-Authored-By` trailer the current session specifies. It names
the model and changes between sessions, so read it from the session rather than
copying an older commit.

Scope is the area, not the file: `avatar`, `agent-date`, `email`, `i18n`, `ui`,
`growth`, `safety`. One logical change per commit.

Good:

```
fix(avatar): keep the spark badge off the agent's face
feat(email): show each side's painted sprite in the debrief
refactor(i18n): drop the unused onboarding keys
```

Bad: `Fix bug`, `updates`, `WIP`, anything past tense or capitalized after the
colon.

When the change spans the backend and the frontend, commit the Convex side
first so the history reads in dependency order.

## 5. Push and open the PR (`--pr`)

```bash
git push -u origin <branch>
```

Open an English PR against `main`:

```markdown
## What

One paragraph: the problem, and what the change does about it.

## Measured

The evidence that the change works — before/after numbers, the failing case
that now passes, or the check output. Skip this heading only when the change is
genuinely unmeasurable.

## Checks

- `bun run typecheck`, `bun run lint`, `bun run test` (N tests) pass.
- Anything verified in the running app, and how.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

For a visible change, attach a before/after image: send it to the user with
`SendUserFile` and reference it in the PR body. Do not commit one-off preview
media into the repo.

Vercel builds a preview for every branch and posts it as a PR check. Record the
preview URL in your report so the user can review the rendered change. The
preview is behind Vercel SSO, so the user opens it, not Claude.

## 6. Stop at the PR

Opening the PR ends this command. Do not merge, and do not deploy: the user
reviews the PR first. Production deploys are `main` merging (frontend, via
Vercel) plus `bunx convex deploy -y` run by the user (backend).
