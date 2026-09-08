# Datehaja submission film

The new core learning comparison is documented in [LEARNING_DEMO.md](LEARNING_DEMO.md).
The film below is the earlier search/intro cut and must not be mistaken for footage
of the new feedback → subsequent-date proof.

The current story is an ongoing search: start once, meet when another searching
Agent fits both owners' boundaries, learn from the actual conversation, and
continue when it does not earn an introduction. A private introduction letter
requires two independent Agent recommendations. Contact still requires two
independent human yeses.

The recording uses two disposable development accounts, each controlled through
its own signed-in browser. They use the real search, not seeded demo matches.
Their email preferences are disabled. The recording verifies that both owners
see the same encounter before capturing its dialogue. It never overrides a
verdict to obtain a more convenient ending, and pauses both searches afterwards.

## Record and build

Use the development deployment `adorable-boar-359` and the local Vite app.
The recorder intentionally refuses a production URL. Production deployment,
public video hosting and posting the submission remain separate launch steps.

```bash
bunx convex dev --once --typecheck enable --tail-logs disable
# Only needed if the fictional public replay is missing or stale.
# Generates a new encounter; does not send email or force a recommendation.
bunx convex run showcase:ensure '{"refresh":true}'
# Wait for its recorded dialogue and notes to appear at /watch.
bun run demo:record
bun run demo:build
```

Do not run another test that starts a search in the same city during recording:
that test account may correctly become the counterpart before the intended
second owner starts. The recorder rejects a different pairing. A failed take
must be investigated before another run; never edit a verdict or transcript.

## The cut

| Beat | Window | What the viewer sees |
| --- | --- | --- |
| `problem` | 0:00–0:12 | Your Agent does the looking; the human decides |
| `agent` | 0:12–0:40 | A face, a private brief, and a correction in the private room |
| `search` | 0:40–1:05 | An actual empty pool, check times, and an ongoing search |
| `date` | 1:05–1:41 | A generated conversation between the two test owners' Agents |
| `letter` | 1:41–2:11 | A selected real exchange, the owner's note, and its limits |
| `decision` | 2:11–2:35 | The actual outcome: continued searching, or independent human consent |
| `stack` | 2:35–2:55 | Public replay with fictional people, independent reflections and the outcome |

A non-match ending is valid and desirable to show when that is what happened.
The film calls the private encounter record a note; it does not claim that
unmatched encounters generate email. In the recommendation branch, each test
owner separately clicks consent. No production contact is shown.

`demo-beats.json` specifies the durations. The Playwright recording writes
actual spans to `.scratch/demo/marks.json`. The builder cuts those spans
and retimes each to the storyboard; unrecorded setup and model waits are cut.
New encounters start with twelve turns and can extend once to sixteen for a specific uncertainty; earlier six/ten-turn records remain readable. The film keeps
that generated outcome and never forces an introduction. The total is 2:55, with a checked ceiling below three minutes. Captions are
burned into the footage by default; this version has no narration audio.

The current screenshots are captured during the same run as the film:
`01-landing-hero`, `02-agent-editor`, `03-ongoing-search`, `04-date-world`,
`05-private-notes`, and `06-next-step`. Older stills remain historical and should
not be used to describe the current experience.

## Before submitting

Review the final encoded video, including the captioned opening, the actual
outcome and the closing shot. Deploy the verified code and refresh the public
fictional replay in the approved production deployment. Confirm its language
and that /watch works without login. Upload the final film to a publicly
accessible video host, verify that link signed out, then complete the required
social/submission steps. Do not declare these complete from passing tests.
