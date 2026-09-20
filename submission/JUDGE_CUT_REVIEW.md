# September 20 judge cut — verification

Status: local replacement ready; no new YouTube upload or submission edit yet.
The existing entry and 2:35 upload remain available.

## What changed

The owner correction moved from 1:19 to the opening. Saved feedback runs from
0:00 to 0:12, the before/after screen appears at 0:19.6, and the caption about
polite speech on a later date begins at 0:23.6. The unchanged-history and reply
length limitations remain visible. The later replay follows at 0:31.2.

The cut reuses the existing fictional-record captures and all 34 original
voice clips. No new dates, model calls, email delivery or production changes
were needed. Exact-text voice lookup keeps each reordered caption paired with
its original MP3; unknown text, duplicate manifest entries and voice overruns
fail before replacing the film.

## Checks completed

- Build, offline narration and full FFmpeg decode: **148.416667 seconds**,
  H.264, 1280×840, 24 fps; AAC, stereo, 44.1 kHz.
- SHA-256: `b204c5e6217a986399acff508cb45e1cee51649ca4145e926419ffec4b5d2b8a`.
- Visually inspected all 34 caption midpoint frames in four contact sheets:
  saved reply/memory, date chooser, Korean/English comparison, replay, journal,
  owner letters, delivered-message label, sponsor cards and consent copy.
- All clips fit their caption windows. One 3.29-second line uses 1.20× tempo;
  no other clip in this cut requires speeding up.
- Negative checks reject unrecorded caption text, duplicate manifest captions
  and a caption too short for its clip. Node syntax check, lint and
  `git diff --check` passed.
- Local Markdown links resolve. The shortened submission description is
  212 whitespace-delimited words.
- Browser verification: the existing Vibe Apps entry displays the old video
  URL; `/watch` loads all 16 saved lines and both viewpoint controls without
  sign-in; the English `#comparison` URL shows source/translation, all four
  dates and the reply-length limitation.

These checks verify the artifact and public evidence path. They do not add an
independent participant or establish demand. Verified independent sessions: 0.

## Publication handoff

The MP4 is `.scratch/submission/Datehaja-demo.mp4`; original published metadata
is preserved under `submission/archive/2026-09-16/`. The original MP4 is also
backed up locally. Upload the new cut as unlisted, verify playback, and replace
the existing entry's video URL and description together. Update this status
and current-film links only after those actions are verified. The app's own
video links still point to the old upload; changing them would need a separate
production release. The old film remains a valid walkthrough.

The September 22 22:00 KST content cutoff leaves six hours for public links and
critical errors before September 23 04:00 KST. Recruitment remains paused.
