# Submission film — product context, then learning

The current [2:10 film](https://youtu.be/qu1VWBXuIz8) introduces Datehaja at
0:00, shows an owner's correction at 0:08.6, and reaches the before/after
comparison at 0:16.2. The [existing hackathon entry](https://vibeapps.dev/s/datehaja)
uses this final cut. The local MP4 is `.scratch/submission/Datehaja-demo.mp4`.

The earlier September 20 cut placed the product introduction at 0:42.8. This
revision restores that context while keeping the learning evidence within the
first 30 seconds. It trims the comparison's navigation lead-in rather than
speeding up narration. It also removes “then calls it a night”: the saved
bookshop conversation ends with a proposal for one more page, not a departure.

All scenes replay saved records involving fictional test people. Navigation
and playback are edited; the homepage simulation explains the product. These
are not new live generations, independent human sessions or evidence of
real-world chemistry. Polite Korean persisted in the learning rehearsal, but
average reply length did not decrease. The original records remain unchanged.

## What the film shows

| Time | Actual screen |
| --- | --- |
| 0:00–0:09 | Homepage: an AI second self dates, while humans decide |
| 0:08.6–0:16.6 | Owner correction, Rio's saved reply and memory |
| 0:16.2–0:30.2 | Before/after comparison, labelled translation and limitations |
| 0:29.8–0:41.8 | Later encounter with a different partner |
| 0:41.4–1:08.4 | Account-free Juno/Sol bookshop replay, source and saved ending |
| 1:08–1:19 | Journal tied to that conversation's source lines |
| 1:18.6–1:34.6 | Two independent Agent reflections |
| 1:34.2–1:47.2 | Delivered test email, labelled as a separate development rehearsal |
| 1:46.8–1:53.8 | Four service job cards: Convex, OpenAI, Firecrawl and AgentMail |
| 1:53.4–2:10.4 | Two human yeses to open contact, then the closing page |

Adjacent beats cross-dissolve for 0.4 seconds. The caption about retained polite
speech starts at 0:20.867; the comparison is already visible.

## Email evidence

The [delivered-message fixture](fixtures/introduction-letter.html) is a real
AgentMail message from an earlier fictional Juno/Sol development rehearsal,
shown with an explicit label above the message. It is separate from the public
bookshop date. That public pair uses `@demo.test.invalid` addresses and cannot
receive email. The fixture retains the message body, with localhost links
rewritten to the submitted app URL; its recipient address is absent. The
sender's already-public concierge inbox appears in a tracking parameter.

## Build and review

```sh
# FFmpeg and FFprobe on PATH, or DATEHAJA_FFMPEG / DATEHAJA_FFPROBE.
bun run demo:capture
bun run demo:submission
DATEHAJA_TTS=clips bun run demo:narrate
bun run demo:review
```

The capture script visits public app pages and renders the saved email fixture.
It writes numbered frames and `beats.json` to `.scratch/submission/capture`.
The directory is gitignored; a fresh clone needs to recapture first. The final
cut reuses existing captures, with no new model calls or email deliveries.

`submission/film-storyboard.json` supplies durations, captions and optional
`captureWindows`: ordered, non-overlapping half-open fractions of the original
capture. The builder selects those frames, joins them without gaps and retimes
the selection. The feedback keeps 5–55% of its original pan; the comparison
starts at 40%, after the date chooser. The bookshop beat omits the segment
paired with the removed departure narration. Invalid, overlapping or empty
selections fail before the film is replaced.

Saved narration is matched to exact caption text through
`submission/narration/voice.json`. The current film uses 28 original clips at
1× speed. Unknown wording, duplicate manifest entries or speech overruns fail
before replacement. `DATEHAJA_TTS=clips` forces offline reuse even if an API key
exists; without it, an ElevenLabs key may select a new paid reading.

The builder burns the English captions, decodes the full output and records
its duration, selected windows and SHA-256 in `film-verification.json`.
`demo:review` extracts every caption's midpoint into contact sheets. Inspect
these for picture/text agreement; metadata checks cannot establish that a
screen proves its narration. A different capture or FFmpeg version can change
the output hash.

The repository contains the [captions](Datehaja-demo.vtt),
[transcript](transcript.txt) and [verification](film-verification.json), not the
MP4. See [release review](JUDGE_CUT_REVIEW.md) for checked publication state.

## Prior versions

- September 16, 2:35: the owner confirmed permanent deletion of YouTube video
  `K35t6VaF0iI` on September 20. Its [text archive](archive/2026-09-16/transcript.txt)
  and local MP4 remain; do not treat the deleted URL as a working demo.
- September 20 learning-first cut, 2:28: video `-KZKKBA9m-I` is superseded.
  Its [text archive](archive/2026-09-20-learning-first/transcript.txt) and local
  MP4 remain. Current submission and app links must point to `qu1VWBXuIz8`.

The old `demo:record` and `demo:build` commands describe a historical take and
can overwrite the current submission files. Use `demo:submission` for this cut.
