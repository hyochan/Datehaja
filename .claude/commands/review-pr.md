---
description: Handle a Datehaja pull request until its exact head is clean — review threads, checks, fixes, replies, and five-minute polling.
---

# Review PR

## Arguments

`$PR_NUMBER` — the pull request to work. Defaults to the PR for the current
branch (`gh pr view --json number`).

## Repo facts

- Repository: `hyochan/Datehaja`.
- Checks on a PR: the `Verify + Deploy` workflow
  (`.github/workflows/deploy.yml`), whose `Typecheck + lint + test + build` job
  runs `bun run typecheck`, `bun run lint`, `bun run test` and `bun run build`
  on every pull request, plus the Vercel preview deployment. CI is the record
  for the exact head.
- CodeRabbit reviews pull requests, but skips any diff over 100 files. When it
  skips, the reviewer is the `code-review` skill, run against the exact head.
- Local gates: `bun run typecheck`, `bun run lint`, `bun run test`. These are
  faster than waiting on CI; add `bun run build`, which CI also runs, whenever
  the bundle could break.

## Response rules

**Never reply "will address in a follow-up".** Fix every valid review comment
now, in this PR, before replying. This applies to architectural findings too:
"tracked as a follow-up", "its own refactor", "belongs in a dedicated PR" are
deferrals dressed up. If the finding is a real correctness or operational gap,
implement the fix here however much code it takes.

Push back only when the finding is wrong on the merits, and back the pushback
with concrete repository evidence.

For each comment:

1. Read the code it points at.
2. Fix it.
3. Commit and push.
4. Reply to the inline review comment, not a general PR comment.
5. Resolve the thread.

## Reviewer pass

After each fix batch is pushed, run the `code-review` skill against the new
head. Record the head SHA it covered: a clean result is valid only for that
exact SHA and is invalidated by the next push.

If a round produces no findings and the head has not moved, do not rerun it.

## Replying to inline comments

```bash
# List inline comments with their IDs
gh api repos/hyochan/Datehaja/pulls/$PR_NUMBER/comments \
  --jq '.[] | {id, path, line, body: .body[:100]}'

# Reply to one
gh api repos/hyochan/Datehaja/pulls/$PR_NUMBER/comments/$COMMENT_ID/replies \
  -X POST -f body="Fixed in $COMMIT_SHA. $WHAT_CHANGED"
```

Do not use `gh pr comment` for a reply — that posts a general comment instead of
threading.

## Resolving threads

```bash
gh api graphql -f query='
query($num: Int!) {
  repository(owner: "hyochan", name: "Datehaja") {
    pullRequest(number: $num) {
      reviewThreads(first: 50) {
        nodes { id isResolved isOutdated path comments(first: 1) { nodes { databaseId } } }
      }
    }
  }
}' -F num=$PR_NUMBER

gh api graphql -f query='
mutation($id: ID!) {
  resolveReviewThread(input: {threadId: $id}) { thread { id isResolved } }
}' -F id="$THREAD_ID"
```

Rules:

- Resolve a thread after the fix is pushed and you replied with the commit SHA.
- Sweep `isOutdated` threads without a reply once per round: the code moved out
  from under them.
- Do not resolve a thread just because the last comment is yours.
- Do not resolve suggestions the user has not acknowledged, or threads waiting
  on user clarification.

## Checks

```bash
gh pr view $PR_NUMBER --json statusCheckRollup \
  --jq '[.statusCheckRollup[]? | {name: (.name // .context), state: (.state // .conclusion)}]'
```

A Vercel check in `ERROR` means the preview build failed — read its log before
anything else:

```bash
vercel inspect <preview-url> --logs
```

A preview that builds but renders blank is usually a missing `VITE_*` variable
in the Preview environment; the production values do not apply to previews.

## Polling loop

After pushing a fix batch, schedule a wake-up in ~300 seconds with
`ScheduleWakeup`, passing `/review-pr $PR_NUMBER` back as the prompt. Each
firing:

1. Re-fetch unresolved threads, the head SHA, and the checks.
2. New findings → fix, push, rerun the reviewer, schedule another wake-up.
3. No unresolved threads, checks terminal and successful, reviewer clean for the
   current head, local gates passing → the PR is clean. Clean up temporary
   automation comments, end the loop, and report.

Never emulate this with a shell sleep loop. If the same finding survives two fix
attempts, stop scheduling and hand back with a summary of what is disputed.

## Stop at clean

This command ends when the PR is clean. Merging belongs to `loop-review`, and
merging is what deploys — there is no separate deploy step to hand over.
