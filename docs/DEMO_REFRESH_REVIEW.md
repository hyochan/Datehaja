# September 11 submission candidate review

Target: **development adorable-boar-359**, team hyodev / project datehaja.
Backend and frontend are deployed there. Production merry-bass-190 and
datehaja.com are unchanged by this task. No invitations, social posts or
submission form were sent. No independent human participant results exist yet.

## Reviewed public encounter

Generated with `showcase:startRefresh`, using two new explicitly fictional
profiles and the actual demo scheduler/model/review workflow. An older seed
refresh first reported no eligible Agent, so the refresh now creates its own
fictional pair with complete mutual matching boundaries and English locale.
It does not change real-user search or email settings.

- Development date ID: `pd7fcqh49yjgm64esphhsa41p58e7dh0`.
- Setting: The painting they read differently; gallery, English.
- Six contiguous turns, an explicit early ending and four grounded journal events.
- Juno and Sol both returned curious; no recommendation was forced.
- Both independently generated reflections are present. The final line is
  “Goodnight, Juno. I’m keeping the door with plausible deniability.”
- Cultural source is linked as inspiration, not evidence of a real visit.
- Public projection: [showcase.json](qa/2026-09-11/showcase.json).

`showcase:publish` pins this reviewed record only after completion, full
contiguous transcript, journal and both reflections exist. The existing
both-profiles-isDemo privacy check also applies to preview and publication.
After a pin is established, an invalid or deleted record returns null instead
of falling back to another encounter. Tests exercise privacy rejection,
incomplete publication, newer demo traffic and a deleted pinned record.

## Learning and submission evidence

The existing Korean fixture is unchanged. Its SHA-256 of the parsed JSON is
`0883dad9ea25fffa4fd19a569199bd9cf5dc072c1f173ad272c3584fab94f911`.
The editorial English translation covers all 56 turns across four dates, three
feedback requests, replies and memories, all journals and reflections. Tests
check source preservation, line identity, outcomes, review status, journal
evidence round references and transcript hashes. English does not reproduce
Korean grammatical register, so the comparison shows the original alongside it.

Film: 170 seconds, 1280×840, 24 fps, burned English captions, no audio.
The browser capture shows real UI replaying saved fictional data; navigation
and playback are edited for time. The film was decoded completely, and opening,
date, comparison and closing frames were inspected. [Verification metadata](../submission/film-verification.json)
records its hash. [Date frame](qa/2026-09-11/film-date.jpg) shows the final cut.

## Checks performed

- 43 test files, **389 tests passed**.
- Frontend TypeScript build and Convex TypeScript check passed.
- Oxlint, Vite production build and `git diff --check` passed.
- Browser: English/Korean learning toggle, four-date selection, saved reply
  expansion, record replay and private perspective controls exercised.
- 320px/390px learning and feedback pages have no horizontal overflow.
  [Public mobile learning screenshot](qa/2026-09-11/mobile-learning.jpg).
- Found and fixed a narrow-screen /watch header overflow caused by the long
  Korean signup label beside the new locale control. The approved candidate's
  compact button fits at 320px: [public screenshot](qa/2026-09-11/mobile-watch.jpg).
  Frontend types, lint and build passed again after this presentation change.
- Feedback form: closed-answer waiting/stopped test with code P99 reaches local
  download status. This was an automated UI check, not a study participant.
- Empty response directory reports zero participants and zero paired ratings.
  Tests reject incomplete-date ratings and discard private extra form fields.
- Public `/demo` loads without login, reports duration 170, and plays with
  advancing current time and no media error.
- MP4 range request: HTTP 206, `video/mp4`, 100 requested bytes.
  VTT: HTTP 200, `text/vtt; charset=utf-8`. Transcript: HTTP 200, text/plain.
- Public English learning route shows the new full-film link and translated
  records. The development static-hosting upload completed successfully.
- Public /watch returns the new English ending and journal; /feedback opens
  without login in Korean. The final frontend revision was uploaded to the same
  development target after the mobile correction.

No fresh complete authenticated two-account E2E suite was run in this task.
Existing automated tests and the generated fictional run do not prove first-use
success or consistent dialogue quality across all users. Polite speech improved
in the saved rehearsal; average reply length did not decrease.

## Remaining external actions

1. Run the prepared neutral study with 3–5 independent adults; record failures
   and waiting states, and aggregate only actually completed paired ratings.
2. Obtain explicit approval of production merry-bass-190 before rolling out
   this candidate. Review and pin a production English record before launch.
3. Verify final public URLs, send the approved social copy and submit. Save the
   actual post permalinks and submission receipt in submission/SOCIAL.md.
