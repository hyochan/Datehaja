# Agent voice coaching review — 2026-09-09

## Experience

Each saved utterance on the owner's date page has a private feedback entry:
“내 말투 다듬기” for their own agent, and “상대에 대한 피드백” for the other
participant. Owners can describe their voice or write how they would say the
line, read the agent's reply in place, then refine it again. The latest learned
memory is also readable. Feedback does not rewrite the historical transcript,
change the other agent, or consent to contact.

The existing learning loop now stores the feedback target, source round and
reply relationship. Server checks verify both date ownership and the actual
speaker. A date-specific index preserves its feedback beyond the recent home
chat window. Explicit voice corrections and partner preferences are cumulative;
structured matching preference changes still require the owner's acceptance.

Scoped line coaching receives the selected original utterance and its context,
not the agent's old positive verdict or scouting narrative. This avoids turning
the agent's enthusiasm into an opinion the owner never expressed. Voice examples
are explicitly examples, not past biographical events.

## Dialogue changes and limits

The old third-turn directive forced a relationship-intention speech, and the
locale helper demanded informal Korean even when the owner asked for polite
speech. These instructions now respect context and the owner's register.
Dialogue no longer requires a question or personal disclosure each turn.

Two live local dates with the economy model exposed repeated activity proposals
and repeated jokes. The dialogue and private-coaching model preference now
starts with Sol, with the existing economy fallback available for service
availability. A shared request builder ensures the scheduler and dialogue QA use
the same instructions and private context. Naturalness is still a qualitative
judgment; these checks are not proof every generated conversation is humanlike,
and the lower model fallback was not certified to the same standard.

The final isolated Sol run generated 12 new utterances from the persisted owner
feedback. Rio retained polite speech in every turn. The exchange progressed from
choosing music to playing it, reacting, checking its title and keeping it in the
queue. No historical date was overwritten to produce this demonstration.

The public `/preview/agent-coaching` contains only whitelisted fictional names,
avatars, dialogue and a journal. It has no database IDs, tokens or real owner
records. The example feedback form is explicitly a preview and does not claim
to save or learn. Real owner date pages use the actual mutation and reply loop.

The journal audit rejected “I'll drink now” being described as completed drinking.
A repaired draft was also rejected for leaving an eventually performed music
selection classified as an unperformed proposal. That category was manually
corrected and independently re-audited successfully. The 12 dialogue lines were
not edited. Production generation retains its bounded repair and raw-transcript
fallback when a journal cannot pass verification.

## Checks

- 351 tests across 39 files passed. New tests cover wrong owner, wrong speaker,
  missing/invalid round context, per-owner memory isolation, unchanged human
  consent and transcript, linked replies, and retention after 45 later messages.
- Real local AI coaching: three successive voice/partner corrections, a further
  correction of register and over-attributed enthusiasm, and another correction
  submitted through the browser. The browser displayed the saved request and
  reply together; old guidance remained in memory.
- Two new local scheduled dates completed with 16 utterances each. The final
  separate request-builder experiment generated another 12 utterances with Sol.
  These are finite test cases, not evidence of universal long-term quality.
- Frontend build, backend TypeScript and lint passed. Local and development
  Convex functions pushed successfully, including the new feedback index.
- Browser checks at 390px and 1100px: full transcript and coaching UI, activity
  anchors, 44px action targets, no horizontal overflow. Character thumbnails
  align with the first bubble even when a feedback form is expanded.
- Email journal numbers now sit above the body, with separated evidence metadata
  and padded links. Local HTML rendering showed all inline images loading.
  Already delivered emails remain immutable; no new mail was sent in this pass.

## Deployment

Backend and frontend target: development `adorable-boar-359`.
Production `merry-bass-190` / datehaja.com was not deployed.

Evidence: `.scratch/coaching/` contains feedback, two local date runs, the Sol
request-builder experiment, journal audits, UI artifacts and validation logs.
Local account fixtures contain authentication tokens and must remain private.

## Follow-up: current public proof

The older isolated request-builder preview described above has been replaced
by the same-owner scheduled rehearsal in `docs/LEARNING_PROOF_REVIEW.md`.
The current page preserves four complete encounter records and actual saved
feedback/replies, including two withheld reviews. The manually curated older
journal is retained as historical QA evidence, not presented as the new run.
