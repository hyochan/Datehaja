# Date activity record review — 2026-09-09

The reported email showed only two of six saved utterances, called them six
“scenes,” and sent the owner to an ACC press release via the scene inspiration
link. That URL was cultural source material, not the Agents' date record.

## Implemented experience

- A shared journal groups the entire saved conversation into concrete events.
  Each event distinguishes activity in the virtual scene, a conversation topic,
  or an unperformed proposal; titles/details link to their source rounds.
- The journal is written using public dialogue only and independently audited
  by Sol. One repair is re-audited. A rejected or unavailable audit leaves the
  full original transcript accessible without a fabricated journal.
- Email shows a short personal letter, scene/characters, up to four activity
  entries, an explicit full-record button, and up to four original utterances
  from the opening exchange and the exchange behind the letter. It identifies
  the excerpt count. The cultural article is no longer a record destination.
- The private date page and fictional public showcase show all saved dialogue.
  Records link to exact lines and can replay from the corresponding point.
  Proposals do not move the replay's actual setting. Speech is fully readable
  under the artwork, with both characters standing at floor level.
- Newly created encounters have a twelve-turn initial checkpoint and one
  possible extension to sixteen for a specific uncertainty. An Agent can leave
  earlier, with one farewell. A checkpoint itself must not force a goodbye.
  Existing six/ten-turn records remain readable; no missing history is invented.
- Private mail links retain their query and evidence anchor through sign-in.
  The return destination stays within the app. Both the OTP callback and the
  authenticated-route transition honor the same destination, preventing the
  dashboard redirect from winning an authentication-state race.

## Concrete checks

A new pair of fictional casual-seeking owners was created through local OTP,
legal acknowledgement, profile and search APIs, isolated to Gangnam. Email
notifications stayed off. Their new date saved twelve model-generated turns,
five independently audited journal events, and separate private letters. Both
Agents recommended an introduction; both human decisions remained pending and
neither view exposed contact. The journal correctly kept the coffee story inside
their imagined alternative movie ending, rather than declaring an actual café
visit. One run establishes this path, not universal narrative quality.

The six-line original was also preserved as an explicitly fictional, curated
preview. Its edited journal was independently rechecked; the already edited
letter retained its prior source verification. The audit caught an incorrect change from discussing a film to watching it;
the corrected preview was independently rechecked.
The final preview records the café as a proposal and leaves the final question
unanswered. The three activity entries do not pretend six utterances were six
completed activities.

Browser checks at 390 px and 1100 px verified no horizontal overflow, all six
original lines, activity-to-line links and playback. Following the actual
preview email button opened the published development record without sign-in.
The phone email preview loaded all seven image references (three unique inline
PNGs). This is browser rendering evidence, not a new Gmail inbox rendering test.

A fresh browser sign-in through the real local OTP UI also returned to the
private date at `#turn-12`, showing all twelve lines and five journal events.

Final verification: 349 tests across 39 files, frontend build, backend TypeScript
check and lint passed.

Backend tests include all sixteen turns reaching both the owner query and mail
preparation, unrelated-user refusal, private-note isolation, legacy extension,
explicit departure, duplicate scheduled callbacks, journal audit failure/repair,
missing or invented evidence, and preview/record link behavior.

## Deployment and delivery

Only static frontend assets were published to the **development** deployment
`adorable-boar-359`. Its backend has not been upgraded in this turn; the public
preview is a fixed fictional record that performs no date API calls.
Backend changes compiled and pushed successfully to the isolated local
anonymous deployment at `127.0.0.1:3210` (04:17 KST). No production deployment
was performed. Production target `merry-bass-190` needs explicit approval.

Preview: https://adorable-boar-359.convex.site/preview/date-letter#activity

One updated preview was accepted for `hyo@hyo.dev` at 04:16 KST, with subject
`[활동 기록 미리보기] 리오 · 팝콘값 얘기가 여기까지 왔네`. Provider retrieval
confirmed the sent message. Inline images use the validated CID path. This is
send acceptance, not proof of placement or opening in the recipient inbox.

Evidence is in `.scratch/date-activity/`: source/audits, original and edited
journal, local live-pair run, browser screenshots, send receipt and provider
message. Authentication tokens remain in excluded local fixture files.

Subsequent coaching pass: the development backend was upgraded together with
the frontend. Per-line feedback, spacing fixes and a separately generated
new-dialogue preview are documented in `AGENT_COACHING_REVIEW.md`.
