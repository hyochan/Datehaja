# September 20 final cut — verification

The current film is [2:10 on YouTube](https://youtu.be/qu1VWBXuIz8), unlisted.
It replaces the video on the [existing submission](https://vibeapps.dev/s/datehaja).
The two app-link changes are included in this source revision; verify their
release through the main deployment workflow and both live pages.

## Editorial change

The intermediate cut put the correction first but delayed the explanation of
Datehaja until 0:42.8. The final cut starts with the homepage and the Agent/human
roles, then shows the owner correction at 0:08.6 and the comparison at 0:16.2.
The retained-polite-speech caption starts at 0:20.867. A later encounter follows
at 0:29.8. The reply-length limitation and original records remain visible.

Selected capture windows remove navigation lead-ins and redundant narration.
The film no longer says the bookshop pair called it a night: the record ends
with a proposal, not a departure. The sponsor names stay visible on their job
cards; narration claiming they all ran during the film was removed because
this is a playback of saved evidence.

This addresses identifiable context and timing problems. It is an editorial
judgment, not an audience comprehension test or proof of improved judging odds.

## Artifact checks

- 130.416667 seconds; H.264, 1280×840, 24 fps; AAC stereo, 44.1 kHz.
- SHA-256: `0e9f375891bb8f67f0e0a7d7306da765d296cbbbf05fc0f9f70986bcb5ec8db5`.
- Full FFmpeg decode completed. All 28 caption midpoint frames were inspected
  across four contact sheets: homepage, correction/reply/memory, comparison,
  later date, bookshop source/ending, journal, separate letters, labelled test
  email, service job cards and human consent.
- All 28 original voice clips fit at 1× speed. No new TTS calls were used.
- The builder rejects overlapping, out-of-range and empty capture windows.
  Those three negative cases were exercised in isolated temporary directories.
- Node syntax, lint and whitespace checks passed.

## Publication and limits

YouTube processing and copyright checks completed with no issues. The selected
visibility is Unlisted. The custom thumbnail is the product introduction from
the actual film. The upload uses the timed chapter description for this cut.
Playback advanced beyond 31 seconds in a separate browser (130.441 seconds
after YouTube processing). Reloading the existing submission showed both its
Video Demo link and embedded player pointing to `qu1VWBXuIz8`.

The earlier September 16 upload (`K35t6VaF0iI`) was deleted only after the owner
confirmed the permanent-deletion screen. Its public watch page then said the
uploader had deleted it. Both earlier MP4s and their caption metadata remain
archived locally; the September 20 intermediate transcript is also archived in
this repository. Its URL is superseded by the final cut.

The app still shows saved fictional rehearsals. The delivered email belongs to
a separate development rehearsal, as labelled in the film. Verified independent
study participants remain **0**. No satisfaction, demand or retention result is
claimed. Recruitment and automated outreach remain paused.
