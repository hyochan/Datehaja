# Recovery of the two withheld date reviews

The original rehearsal contains two completed 12-line encounters whose private
reviews failed factual verification. Simply displaying a withheld state did
not resolve their missing notes.

## Causes and changes

- Coffee: a response to this cup's bitterness became a general coffee/bitter
  taste preference, or an unsupported difference between the participants.
- Sketchbook: agreement that the unfinished drawing looked good became a
  decision about when to stop. Proposed closing, drinking and book discussion
  sometimes became completed actions.
- Whole-letter repair could fix one field while introducing an interpretation
  into another. Repairs now replace only rejected fields and their dependent
  claims. The merged, normalized full draft is independently audited again.
  Earlier corrections remain in the repair context.
- The auditor explicitly checks one-time reactions versus enduring tastes,
  preferences versus decisions, who initiated an action, and unperformed plans.
  Its factual standard, model policy and three-minute review budget remain in
  force. No successful or curious verdict is substituted for model failure.

## Recovery behavior

`agentDates.retryReview` authenticates the participant and requires a complete
failed transcript, or a previously recovered closed review. It schedules the
same private review and shared journal generators used for normal dates. An
ended encounter cannot gain new turns or an extension during recovery.

Both private reviews must pass before the recovered record is saved. The
record closes with a recovery timestamp. This operation does not start a new
introduction, send a notification/email, update human consent, restart search,
or insert a retroactive scouting lesson into newer owner feedback. Each owner
still sees only their own letter. Recovery is explicitly labelled in the app
and public fictional replay.

The mutation deduplicates concurrent requests, caps retries at three, and adds
a durable timeout guard. A verified journal is reused across letter retries. If a journal is missing, a
separate bounded job can fill it without rewriting verified letters. Its audit
reserves 9,000 output tokens because the old 5,000-token limit sometimes ended
during reasoning, before a verdict was returned.

Every retry has a distinct timestamp; stale results
and old timeout jobs cannot alter a later retry or completed review. An
ordinary closed/connected encounter cannot be reopened with this endpoint.

## Evidence and reproducibility

Original dialogue and first failure evidence remain in
`.scratch/learning-proof/mtt69gep` and `.scratch/six-person/quality-ai-runs*`.
Recovery evidence is under `.scratch/review-recovery/`; these files contain
private synthetic account data and must not be published wholesale.

The first recovery completed both reviews, but an additional negative control
showed the auditor accepting an old decision-attribution error. Manual reading
also found the phrase “자기 쓴맛 취향” in a recovered counterpart letter. That
first recovery is preserved in `attempt-1`; it is not counted as the final
quality result. The explicit distinctions above were then added, the original
bad drafts were rechecked, and the coffee encounter was reviewed again.

Run against the isolated local deployment only:

```sh
bun scripts/local-review-recovery.ts mtt69gep
# Explicitly re-review a recovered note after a further correction:
bun scripts/local-review-recovery.ts mtt69gep --refresh=2
bun --env-file=.scratch/six-person/backend/.env.simulation scripts/check-review-regressions.ts
bun --env-file=.scratch/six-person/backend/.env.simulation scripts/check-review-regressions.ts --recovered
```

The authenticated rehearsal compares the exact transcript hashes, both owners'
consent, companion messages, private/scouting memory and paused search before
and after. The public exporter checks the matching original record and exact
unchanged turns before allowing a recovered note into the fictional fixture.
No manually written replacement verdict is passed into the backend.

Final local result: both original 12-line encounters have two verified private
notes and a verified activity journal. Both known bad drafts were rejected by
the strengthened auditor, and all four final private notes passed a separate
live audit. The final authenticated replay confirmed exact unchanged turns,
both human decisions, messages, memory and search state. A journal-only retry
repaired the output-budget failure without rewriting the verified notes.

365 tests across 40 files, frontend build, backend TypeScript and lint passed.
The development backend was pushed successfully to `adorable-boar-359`.
The public exporter includes both recovered records and labels their recovery;
the original failed samples and intermediate unsuccessful checks remain in QA.

Development frontend verification confirmed both recovered labels, their
actual private notes, record switching and 12 unchanged lines per encounter.
Desktop and 390/320-pixel mobile layouts had no horizontal overflow. The
54-second walkthrough now includes the recovered note; its hosted GET returns
200 with `video/mp4` and 562,807 bytes. Local full decode and browser playback
were checked. Production remains unchanged.

Factual verification and a positive matchmaking recommendation are separate:
an accurate letter may still say the participants' relationship intentions
were not discussed. These finite synthetic regressions do not prove universal
model accuracy or real-user chemistry.
