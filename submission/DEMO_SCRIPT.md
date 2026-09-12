# Current submission film — September 11, 2026

The canonical film is [Datehaja-demo.mp4](Datehaja-demo.mp4), **2:14**.
[Watch the development candidate](https://adorable-boar-359.convex.site/demo).
It replaces the earlier search/intro cut. Production publication is pending.

This is a browser walkthrough of the actual product. It replays previously
generated records from fictional test people; navigation is cut and playback
is retimed. The homepage examples and system diagram explain the product.
They are not new live generations, independent human sessions or evidence
of real-world chemistry. No email delivery is demonstrated by this film.

## What the film shows

| Time | Actual screen |
| --- | --- |
| 0:00–0:22 | Product introduction and four-step owner loop |
| 0:22–0:44 | Newly generated English Juno/Sol gallery encounter |
| 0:44–0:57 | Journal grounded in saved lines |
| 0:57–1:13 | Independent private reflection and a preserved non-introduction |
| 1:13–1:30 | Separate Rio rehearsal: saved correction, reply and memory |
| 1:30–1:50 | Before/after, English translation beside Korean originals |
| 1:50–2:00 | Four actual records, including recovered reviews |
| 2:00–2:15 | Replay of a later encounter with a new partner |
| 2:15–2:35 | Implemented Convex flow and sponsor responsibilities |
| 2:35–2:50 | Two independent human yeses to open contact |

The learning proof preserves all 56 source lines and outcomes. Polite Korean
persisted, but average reply length did not decrease. This is evidence of
retained guidance, not perfect learning or user satisfaction.

## Build and verify

`submission/film-storyboard.json` is the timed caption source.
The browser UI capture writes numbered screenshot bytes and a manifest to
`.scratch/submission/capture/`. It contains only public fictional records.
Recapture through the browser UI whenever the product or record changes.

```sh
# FFmpeg and FFprobe on PATH, or DATEHAJA_FFMPEG / DATEHAJA_FFPROBE.
# Optional local tools: npm install --prefix .scratch/media-tools --no-save ffmpeg-static ffprobe-static
node scripts/build-submission-demo.mjs
```

The builder validates frames and total duration, retimes the captured beats,
burns English captions below the screen, fully decodes the output to verify
it, and writes `submission/film-verification.json` with its SHA-256. Caption
failure stops the build; there is no silent uncaptioned fallback. No narration
audio. It creates:

- `public/demo/Datehaja-demo.mp4` and identical `submission/Datehaja-demo.mp4`
- `public/demo/Datehaja-demo.vtt` and `public/demo/transcript.txt`
- `public/demo/submission-poster.jpg`

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
