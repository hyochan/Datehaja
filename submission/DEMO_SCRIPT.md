# Current submission film — September 16, 2026

The canonical film is [Datehaja-demo.mp4](Datehaja-demo.mp4), **2:34**, narrated.
[Watch it on the submitted URL](https://merry-bass-190.convex.site/demo).
It replaces the earlier search/intro cut, and production now serves it.

This is a browser walkthrough of the actual product. It replays previously
generated records from fictional test people; navigation is cut and playback
is retimed. The homepage examples and system diagram explain the product.
They are not new live generations, independent human sessions or evidence
of real-world chemistry.

## What the film shows

| Time | Actual screen |
| --- | --- |
| 0:00–0:07 | Product hook |
| 0:07–0:39 | The pinned public replay: Juno and Sol, sixteen saved lines |
| 0:39–0:50 | Journal grounded in saved lines |
| 0:50–1:06 | Each Agent's independent note, and two recommendations nobody has answered |
| 1:06–1:19 | The introduction letter as it landed in a mailbox, sent through AgentMail |
| 1:19–1:34 | Separate Rio rehearsal: saved correction, reply and memory |
| 1:34–1:58 | Before/after, English translation beside the untouched originals |
| 1:58–2:10 | Replay of a later encounter with a new partner |
| 2:10–2:20 | Convex / OpenAI / Firecrawl / AgentMail — load-bearing |
| 2:20–2:34 | Two independent human yeses to open contact |

The letter beat is one real message, taken from the Concierge inbox after
AgentMail delivered it and kept at
[fixtures/introduction-letter.html](fixtures/introduction-letter.html) so the
film can be rebuilt without opening a mailbox on camera. It is a send between
two fictional personas; only its localhost links were rewritten to the
submitted URL, and it carries no address, because the recipient lives in the
mail metadata rather than the body. Nothing else in the film is a fixture.

The learning proof preserves all 56 source lines and outcomes. Polite Korean
persisted, but average reply length did not decrease. This is evidence of
retained guidance, not perfect learning or user satisfaction.

## Build and verify

`submission/film-storyboard.json` is the timed caption source.
`scripts/capture-submission-demo.mjs` drives the public pages of a deployment
and writes numbered screenshot bytes and a manifest to
`.scratch/submission/capture/`. It never signs in, so every frame is a screen a
judge can reach themselves, and it resolves positions from selectors rather
than fixed offsets so a differently sized pinned record does not shift a beat
off screen. Recapture whenever the product or the pinned record changes.

```sh
# FFmpeg and FFprobe on PATH, or DATEHAJA_FFMPEG / DATEHAJA_FFPROBE.
# Optional local tools: npm install --prefix .scratch/media-tools --no-save ffmpeg-static ffprobe-static
bun run demo:capture      # add --site URL to film a different deployment
bun run demo:submission
bun run demo:narrate      # reads submission/narration; a key re-renders it
```

The narration reads the burned captions verbatim, from the VTT the builder just
wrote, so the voice cannot drift from the words on screen and a viewer with the
sound off loses nothing.

`submission/narration/` holds the reading that shipped — one MP3 per caption,
plus a `voice.json` naming the voice and the exact line each clip reads. Those
two steps therefore rebuild the submitted film byte for byte on any machine
with FFmpeg, with no key and nothing to pay for. Setting `ELEVENLABS_API_KEY`
takes precedence and renders a fresh reading instead; `DATEHAJA_TTS=say` falls
back to the voice built into macOS. If a caption is edited without re-rendering,
`demo:narrate` stops and names the line rather than shipping a voice reading
something that is no longer on screen.

The builder validates frames and total duration, retimes the captured beats,
burns English captions below the screen, fully decodes the output to verify
it, and writes `submission/film-verification.json` with its SHA-256 and the
voice that read it. Caption failure stops the build; there is no silent
uncaptioned fallback. It creates:

- `public/demo/Datehaja-demo.mp4` and identical `submission/Datehaja-demo.mp4`
- `public/demo/Datehaja-demo.vtt` and `public/demo/transcript.txt`
- `public/demo/submission-poster.jpg`
- `src/demoAssets.ts`, holding the new film's hash

That last one is what gets the film past the CDN. These files keep their names
across rebuilds and are cached for four hours at the submitted URL, so `/demo`
asks for them by hash instead. Commit it with the film; the deploy fetches the
same URL a visitor would and fails if the bytes do not match
`film-verification.json`.

The old `demo:record` and `demo:build` commands describe the earlier
authenticated-account take and can overwrite the submission copy. For this
release use `demo:submission`. `learning-proof.mp4` is historical supporting
footage, not the current full film.

## Refresh the public record

Target development `adorable-boar-359`. Generate with
`showcase:startRefresh {}`, inspect the returned date using
`showcase:preview`, and publish that exact completed record using
`showcase:publish`. Both participants must be fictional and the journal,
reflections, contiguous full transcript and completion must exist. Do not
edit dialogue or verdicts to manufacture an introduction. See
`docs/DEMO_REFRESH_REVIEW.md` for the reviewed September 11 record.

Production `merry-bass-190` requires explicit target approval. Deploy backend
before frontend, preview the production record before pinning it, verify the
film with no login, then use the updated social/submission drafts. Posting
and final submission are still separate, unsent actions.
