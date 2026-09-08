# Core demonstration: one Agent, four dates

Open `/preview/agent-coaching`. This is a replay of a bounded local rehearsal
with five fictional test people using authenticated production functions:
normal opt-in search, durable scheduled turns, owner-only coaching and a later
new encounter. It is not a model call whose transcript was pasted back into a
fake date. No review is rewritten to force an introduction. The two initially withheld
notes were later rewritten from the same saved dialogue and independently
verified; they are labelled as recovered reviews, with no new introduction.

## A two-minute walkthrough

| Time | Action | Point to demonstrate |
| --- | --- | --- |
| 0:00–0:15 | Open How it works; read the four steps | Create a dating Agent, let it date, hear its story, tell it what to change. |
| 0:15–0:35 | Follow the real-record comparison link | Rio's first reply before coaching and first reply to a new partner after it. |
| 0:35–1:00 | Open the saved feedback and linked reply | The owner asks for polite, brief replies and explains what matters in a partner. The cumulative memory is visible for this fictional owner. |
| 1:00–1:25 | Select the second date and replay its dialogue | The new counterpart has her own taste. Read the real exchange, including disagreement, instead of claiming a personality score. |
| 1:25–1:45 | Select the latest date, then its full transcript | A further correction carries earlier guidance into another meeting. It is a subsequent encounter, not an edited old conversation. |
| 1:45–2:00 | Show the actual Agent note and return CTA | The human can keep shaping the Agent. An Agent recommendation is not human consent; contact still requires both owners' independent choices. |

All four transcripts, saved feedback and generated owner replies are available
on the page. Each activity journal has source-line links and can replay those
lines. A missing verified journal stays missing; it is never replaced with a
handwritten result. The page is a recorded example and does not pretend its
preview controls save feedback or start another search.

The demo is currently in Korean. Explain that the before/after comparison is
casual versus polite Korean speech, and read the meaning of the owner's
correction for an English-speaking judge. Do not imply the transcript is an
English live run or that four test people prove real-user satisfaction.

## Reproduce locally

Use an isolated local Convex backend with the development OTP allowlist and
OpenAI/Firecrawl credentials. Email notifications are disabled on every test
account. Never run the fixture against a real-user or production deployment.

```
bun scripts/local-learning-proof.ts
# If the harness is interrupted, resume the SAME records; never replace outcomes:
bun scripts/local-learning-proof.ts --resume=<run-id>
bun scripts/export-learning-proof.ts .scratch/learning-proof/<run-id>/result.json
```

The exporter only includes the explicitly selected fictional record fields.
Account tokens, raw database documents and the other participant's private
judgment stay in the ignored scratch folder. All test searches are paused when
the harness exits. Any model failure is retained for investigation. To recover completed failed
reviews through the authenticated scheduler, run
`bun scripts/local-review-recovery.ts <run-id>`. Export the recovered records
with the optional `.scratch/review-recovery/<run-id>/result.json` third argument
to `scripts/export-learning-proof.ts`; it verifies the exact original turns.

A separate 54-second browser walkthrough lives at `/demo/learning-proof.mp4`. Its screenshots are captured from this product page, not rendered from invented conversations. Playback and navigation are condensed; generation happened earlier.

The older `Datehaja-demo.mp4` covers the prior search/introduction story and does
not include this learning comparison. Do not present it as footage of this new
flow; refresh the final submission cut and its hosted link before submission.
