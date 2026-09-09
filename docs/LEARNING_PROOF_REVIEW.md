> Follow-up: the two originally withheld reviews were subsequently re-reviewed.
> See [Review recovery](REVIEW_RECOVERY.md) for unchanged transcript evidence,
> the corrected interpretation checks and the labelled recovered records.
> The chronology below preserves the original run rather than hiding its failures.

# Learning proof and quality review — 2026-09-09

This pass strengthens the core evidence: one fictional owner creates Rio, reads
a saved date, gives private voice and partner feedback, and sends the same
Agent into three subsequent scheduled encounters. This is a finite rehearsal,
not a claim that generated conversation is always natural or that real people
will feel represented.

## What changed

- Dialogue uses the tested Sol model without a silent economy fallback. A long
  near-verbatim repeat of the Agent's own recent speech, or an unsupported
  owner-fact citation, receives one repair before saving. If that also fails,
  the existing transcript remains intact and the encounter reports failure.
- Later-turn guidance no longer orders the model to keep extending the same
  mini-game, song choice, countdown or joke. Ordinary topic changes are allowed.
- `Reading`, the actual selectable interest, now maps to the bookshop instead
  of falling through to the café. This is covered by the scene-selection test.
- Private learning also stays on Sol. An unavailable model explicitly reports
  that the message was saved without claiming a completed memory update.
- Activity summaries distinguish a completed choice from its later action.
  Choosing a song is not evidence that it played; promising a sip is not proof
  of drinking. The earlier difficult 12-line example passed automatic repair
  and independent re-audit without manual category editing in this pass.
- Review repair carries **all** earlier corrections forward, including claims
  that migrate into another field. Up to three drafts/audits share a bounded
  deadline. A network retry does not restart that deadline. Unverified prose
  still cannot produce a letter, introduction or scouting lesson.
- The public coaching page shows actual before/after utterances, verbatim owner
  feedback, linked saved replies and cumulative memory, all four full date
  records, source-linked activity summaries, replay and actual owner verdicts.
  How it works links directly to this proof next to its explanatory examples.

## Evidence from the live rehearsal

The run is `.scratch/learning-proof/mtt69gep`. Its local test accounts use
Tokyo/Shibuya area boundaries, Korean, casual dating, disabled email, and the
normal authenticated search/scheduler. None of its turns or outcomes is
injected. Five fictional accounts are created for one owner's four encounters.

The first date completed with 16 lines and a verified review/journal. Rio spoke
casual Korean, as his original brief asked. The owner corrected this to polite,
short replies, then gave separate partner feedback about independent tastes
and not reading short answers as disinterest. The stored memory retained both.

The second date saved 12 lines of polite replies. Its review was withheld:
"this bitterness is fine" was generalized into a stable coffee preference. The
audit rejected that claim even when it survived into a repaired next-search
note. This failure stays in the public chronology rather than being relabeled
as a successful date. Re-running the exact saved transcript through the revised
review request builder produced a verified review; that read-only regression
**did not overwrite** the historical failed date or trigger delivery.

The owner then added another voice correction: allow uncertainty and silence,
while retaining the earlier voice and partner guidance. The third encounter
retained that cumulative memory but its 12-line review was also withheld for
proposed/completed-action and attribution errors. The review request was then
changed to focus only on the private letter, with shared summary fields left
empty; the verified shared journal now supplies the shared overview.

A fourth, newly scheduled encounter completed with 16 lines, two independent
Agent recommendations, and a verified activity journal. Its initial Rio review
needed one automatic correction; both final reviews passed. In total this run
contains **56 saved lines, 3 owner feedback/reply pairs, 2 verified dates and
2 withheld dates**. No withheld result is hidden or reclassified as success.
The final result is in `result.json`; the public fixture preserves all four.

Rio maintained polite endings in all subsequent encounters. Mean own-reply
length was 47, 46, 53 and 47 characters: this does **not** establish that the
replies got shorter. Some scenes and jokes still repeat. The demonstrated
change is speech register and retained guidance, not universal naturalness.
The last scene was selected just before the local watcher completed the
Reading mapping update, so this run does not prove the new bookshop mapping;
the deterministic selection regression does.

The rehearsal checks linked source messages, unchanged historical transcripts,
unchanged consent during coaching, no disclosure into the other participant's
coaching view, and the same shared date seen from both accounts. All of this
run's searches are paused at exit. The harness supports resuming a run without
creating replacement dates or resubmitting already saved feedback; harness
corrections and the original failed run logs remain in scratch.

## Publication and limits

`scripts/export-learning-proof.ts` explicitly selects fictional names, avatars,
turns, own notes, feedback and memory. It does not export authentication tokens,
raw database documents, actual profile/contact information or the counterpart's
private judgment. The public page labels its users fictional and its controls
as replay/preview. These are stored results, not browser-triggered new learning.

A short browser walkthrough and `submission/LEARNING_DEMO.md` demonstrate the
comparison. The older full submission film remains a separate prior artifact.
A final hosted submission cut, real newcomer testing, and broader language/
personality cohorts still need verification. Synthetic tests cannot establish
human chemistry, retention, universal factual accuracy or a chance of winning.

357 tests across 40 files passed, along with frontend build, backend TypeScript
and lint. Development backend and frontend `adorable-boar-359` were updated;
production was not changed. The hosted comparison page was checked at desktop
and 390/320-pixel mobile widths, including saved date selection, source links,
withheld records and light/dark themes. No horizontal overflow was observed.

The 54-second H.264 walkthrough is available at `/demo/learning-proof.mp4`.
An exact public media route supplies `video/mp4` because the installed static
uploader otherwise labels MP4 files as `application/octet-stream`. After the
development deployment, its GET returned 200, `video/mp4`, and 557,968 bytes.
The in-app browser played the hosted 1280×960 video: duration 54 seconds,
readyState 4, advancing playback, and no media error. Full local decode also
passed. The media route passed backend TypeScript and lint validation.

Validation logs: `.scratch/quality-*`, `.scratch/quality/activity-regression.json`,
`.scratch/quality/review-regression.json`, and `.scratch/learning-proof/`.
