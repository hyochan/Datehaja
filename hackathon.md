# Hackathon log

- **Project:** Datehaja
- **Event:** Convex All Gas Hackathon
- **What it does:** Each person creates one private AI Agent that is their second self. There is no matchmaker: two clearly labelled Agents simply date each other as the two people they stand in for, return with independent debriefs, and open human contact only after two sealed human yeses.
- **Live app:** https://merry-bass-190.convex.site — the rules require a convex.site or chatgpt.site URL judges can open without an invite. Everything a judge or an emailed link touches now points here: the app, the sign-in codes, the debriefs, the introduction letters. A custom domain still resolves to the same build and is being taken down; nothing in the submission depends on it.
- **See it without an account:** https://merry-bass-190.convex.site/watch — a real completed date between two seeded personas, both letters included
- **Repo:** https://github.com/hyochan/Datehaja
- **Frontend:** Convex static hosting
- **Convex deployment:** https://merry-bass-190.convex.cloud
- **Components:** @convex-dev/static-hosting
- **Convex features:** schema, tables, indexes, queries, mutations, actions, HTTP actions, crons, scheduled functions, file storage, realtime queries, pagination
- **Auth:** Convex Auth
- **AI models:** gpt-5.6-sol for date dialogue, private coaching, letters and factual verification, with no silent economy fallback on these paths. Unverified letters are withheld; lower-cost models remain available for unrelated integrations.
- **Started:** 2026-08-26T22:04:05Z
- **Last updated:** 2026-09-16
- **Latest verified candidate:** https://merry-bass-190.convex.site — production carries `DATEHAJA_OPEN_TRIAL`, and `bun run verify:prod` reports `scoutAccess.ok: true`. A new account signed up there with a real mailed code, completed the brief and ran a twelve-turn date.

## Rules, as verified on the official page

Read from https://www.convex.dev/hackathons/all-gas on 2026-09-04, quoted:

- **Deadline:** "Submissions are due Sep 22, 12:00 PM PT."
- **Frontend URL:** "Must be a convex.site or chatgpt.site URL judges or an
  agent can open without an invite." A custom domain does not satisfy this. The
  project runs one alongside, serving the same build; it is being taken down so
  that nothing competes with the submitted URL, and nothing depends on it in
  the meantime.
- **Repository:** "All GitHub repos must be public to qualify." Public since
  2026-09-06. It was private until then, which would have been a hard gate
  rather than a preference.
- **Tooling:** "Codex is ideal and required for the chatgpt.site. Feel free to
  use your favorite IDE (e.g., Claude, Cursor, GitHub Copilot, or any other
  IDE) to build your app." Using more than one is fine; Codex is only *required*
  for the chatgpt.site route, which this project does not take.

## Log

### 2026-09-16 - a date request only ever saw the oldest forty people in a city

`createDateRequest` read forty active profiles per city and only then
dropped the caller, prior dates, demo rows and anyone without an Agent.
The forty-first person in that city was not a candidate. A city of real
users older than the demo cast would also hide the demo world from the
button.

The durable search already paginates; that path was fine. The explicit
request now reads two hundred per city, which is past the size this
product will reach, and a test puts the only matchable Agent behind
forty unfinished profiles.

Left alone, because they are speed at a scale this app does not have: a
`by_status` index on `agentSearches` (nothing scans that table by
status), cursor pagination on `listMine` and the notification list (both
already `.take(30)`), and moving the rate-limit increment to after the
write (the increment lives in the same mutation as the write, so a throw
rolls it back). The age cron already walks a saved cursor two hundred
rows at a time.

### 2026-09-16 - a photo upload id was enough to take someone else's file

`profiles.setPhoto` accepted any storage id. It checked that the blob
existed and looked like an image, not that this caller was the one who
uploaded it. Attaching another profile's photo, then replacing your own,
would delete their file.

The mutation now refuses a storage id already on another profile or on a
site asset. Agent `essence` was also flagged in the same audit; it never
leaves its owner as a field — only the date turns do, and those now go
through the same contact redaction as bios.


### 2026-09-16 - a failed extra turn after twelve lines killed a finished date

`continueConversation` raises `plannedTurns` 12 → 16 before round 13 is
stored. `fail()` did not close the conversation at the stored length, so
a model miss on turn 13, 14 or 15 left the row `failed` with twelve to
fifteen turns and a plan of sixteen. Recheck requires the stored turns
to match the plan. The twelve-line date was complete, its letters were
never written, and the owner saw "This world went quiet" with no way
back.

`fail()` now records `closingAfterRound` at the stored length, so Recheck
sees a finished conversation rather than a plan that will never be met.

This is deliberately wider than the extension case that exposed it. Any
date carrying at least six stored turns is closed at the length it
actually reached and becomes reviewable — a date that dies at turn eight
of twelve was never recoverable before either, and eight turns is a real
conversation to write a letter about. Below six turns nothing changes:
there is no date there to review, and the row stays failed and
unreviewable. Both halves of that line are pinned by tests.

A leave on the last planned turn is allowed one farewell instead of
ending on the goodbye. Turns 7–16 cycle the six-beat pause instead of
reusing the wrap-up beat.


### 2026-09-16 - a bad date link took the whole app to a white screen

There was no root ErrorBoundary. Opening `/dashboard?date=` with a
malformed Convex id made `agentDates.get` throw at the argument
validator, and React had nothing to catch it. The page went blank. A
judge following a stale or edited link would have no way back.

The dashboard now treats an unusable date id as the same "this story
isn't here" surface the date page already had, instead of throwing.
A root boundary covers every other render error with a recovery
screen in the 404's language — what happened, and a way back to
the dates — never a stack trace.


### 2026-09-16 - any signed-in account could rebuild the demo world

`demo.reseed` was a public mutation. It called `requireUserId`, so any signed-in
account could retire and recreate the entire demo cast. Nothing in the product
called it. `npx convex run` can invoke internal functions, which is the
ability the comment claimed needed a public export.

It is an `internalMutation` now. The public API no longer includes it.


### 2026-09-16 - an Agent name could carry contact details through to the other person

`containsContactInfo` only ran on the profile display name in `saveBasics`. The
two mutations that actually write an Agent's name, and the owner display name
used after onboarding, are `agents.bootstrap` and `agents.update`. They did not
call it.

A name that was an email or a handle stored as the Agent name, then showed up
on the counterpart dashboard and in the date view, with no consent anywhere.
The same for a contact-bearing display name written at bootstrap, which
`saveBasics` would have refused.

Both public write paths now use the same helper and the same error as the
profile check.


### 2026-09-16 - the date itself was the one path still taking the cheap model

This file has said since 2026-09-08 that date dialogue, coaching, letters and
verification run on `gpt-5.6-sol` with no silent economy fallback. The letters
set `fallbackToDefaultModels: false`. So do the journal, the coaching and the
verification. The turn request — the conversation those are all written about —
did not.

So an unavailable Sol did not produce an honest failed turn. It walked the
ladder to luna, then mini, then nano, and whatever came back was stored as an
ordinary line of the date. The unit test that pins the honest failure passes a
request that carries the flag the production builder omits.

Turns were also the only model call in the product with no deadline, which is
the first half of a separate finding: a request that never answers takes the
action to the runtime ceiling with nothing scheduled after it. Both are set
now, and a test reads the real request rather than a fixture.


### 2026-09-16 - the log said the domain was retired, and it was not

An audit pass opened `datehaja.com` and got a 200. Three entries in this file
said the custom domain had been retired. What actually happened that morning was
smaller: it was cut out of `convex/mail.ts`, out of `vercel.json`, out of the
test fixtures, out of the docs, and out of production `SITE_URL`. Nothing points
at it any more. The DNS was never touched, so it still serves the same build.

That is the same defect this submission has been correcting all week, made by
the person correcting them. The entries now say what is true: the domain is
being taken down, nothing depends on it, and the submitted URL is the only one
anything references.


### 2026-09-16 - submitted, after an outside reader found one claim that was not true

The entry is in: https://vibeapps.dev/tag/allgashackathon. Film unlisted on
YouTube, both social posts up with real sponsor mentions, and the submitted URL
is the convex.site one.

The description nearly went in with a sentence that a judge could have
disproved from this repository. It said of Convex, OpenAI, Firecrawl and
AgentMail that "each one is load-bearing: remove it and the step above it
stops". Three of those are. Firecrawl is not: `convex/agentDates.ts` takes
`research.hits[...]`, and when the search returns nothing the scene still comes
from `dateScene()` and the date runs without a citation. The sentence now names
that exception itself, which is a better claim than the one it replaced,
because the other three become checkable rather than decorative.

Two smaller things went with it. The Convex paragraph listed features without
ever saying auth, which is one of the words the judging criteria uses. And the
description opened by repeating the app title, which the form already carries
twice.

The custom domain was cut out of the code, the documents and `SITE_URL` the
same day, so everything a judge or an emailed link touches is on the submitted
deployment. The domain itself still resolves to the same build until it is
taken off the host — this entry said "retired", which was not true of the DNS.

What is still not claimed: no independent user has used this. The submission
says so.


### 2026-09-16 - every debrief email was leading with a broken image

Asking whether the custom domain could be the submitted URL turned up something
worse than the answer. `/scenes/<kind>.png` is the 520px band at the top of
every debrief email. Those six files had never been committed: they existed
only in a gitignored scratch directory, so neither host has ever served them.

The reason nobody noticed is that the custom domain answered `200` for them.
It answers `200` for everything — it is a single-page app, so a missing file
gets `index.html` with `content-type: text/html` rather than a `404`. The
submitted deployment returns an honest `404` for the same path, which is how it
surfaced. A mail client asked for an image, was handed a web page, and drew a
broken icon.

The six scenes are committed now. With them fixed, the rest followed: the
custom domain is being retired, so the email asset origin, the default that
email images fall back to, the Content-ID domain, the auth note and the test
fixtures all point at the submitted deployment instead, and `SITE_URL` on
production was changed to match. Everything a judge touches — the app, a
sign-in code, a debrief, an introduction letter — now lands on the URL that
gets submitted.

Older entries still name the custom domain. They are describing deploys that
really did go there.


### 2026-09-16 - the film moved to YouTube and the page it lived on went with it

The submission film is now unlisted at https://youtu.be/K35t6VaF0iI, which is
where the form asks for it and where a judge expects a video to be. With that
settled, `/demo` had nothing left to do: a page whose only job was to serve a
7MB file the deployment no longer needs to serve.

Gone with it: the page and its route, `src/demoAssets.ts` and the hash-stamping
that got the film past the CDN, the deploy step that checked the served bytes,
and the two static-hosting routes for the film and its captions. The film's own
file is out of git too. `learning-proof.mp4` stays; it is a different artifact
and older entries point at it.

Kept, because they are the part worth reading: the captions and the transcript,
moved to `submission/` where the rest of the submission evidence lives, and
`film-verification.json`, which now records where the film is published as well
as what it hashes to. The pipeline still rebuilds it — into `.scratch/` rather
than into the repository — and the rebuild after all of this produced the same
SHA-256 as the file that went up to YouTube.

The cost is stated plainly: the film is now one unlisted link away from being
unavailable, and a clone of this repository no longer contains the thing every
entry above discusses. That was the call; the script, the storyboard, the
narration clips and the capture code are all still here, so it can be made
again.


### 2026-09-16 - the film was accurate and it was a metronome

Everything in it was true and nothing in it had a pulse. Thirty-four captions,
each about the same length, each with the voice starting on its tick, and every
beat butting against the next with a hard cut. Watched end to end it read as a
correct slideshow.

Three changes, none of which touch a caption or a clip, so no line had to be
re-rendered. Beats cross-dissolve over four tenths of a second instead of
cutting, which costs 3.6 seconds of running time and is why caption times are
now figured on the joined timeline rather than the sum of the beats. Each
line's voice now enters a share of whatever time that line can spare, so a
dense line comes in almost at once and a sparse one lets the screen sit for a
second first — between 0.09s and 1.0s across the film, where before every line
started on the tick. And the two beats that were being cut away from while they
were still landing, the opening hook and the closing card, got two and three
seconds more.

Two minutes thirty-five, -16.4 LUFS, still no line played at a speed nobody
spoke it at. The frame-to-caption check was re-run: every caption still shows
the screen it describes, and no caption now overlaps the dissolve into the next
beat.


### 2026-09-16 - say on screen whose date the letter is

The film spends forty seconds in a bookshop and then shows a delivered
introduction letter. The letter is real, and it is a different encounter — an
earlier Juno and Sol rehearsal in a salon scene, sent to a test account's
mailbox, because the showcase pair pinned at `/watch` carry
`@demo.test.invalid` addresses and cannot be mailed at all. That was documented
and not shown, which left a viewer to assume continuity that is not there.

The beat now carries a band above the message, outside it and in the film's own
colour so it cannot read as part of the email, saying what it is. No caption
changed, so the narration did not have to be re-rendered.

Two stale descriptions went with it: the product memory still described the
initial conversation as six turns extending to ten, which is the legacy path —
new dates run twelve and extend to sixteen — and one log entry said "the current
film is 134 seconds" in the present tense inside a dated entry.


### 2026-09-16 - the film narrated four things that were not on screen

The narration was fixed; nobody had checked the picture. Pulling one frame from
the middle of each of the thirty-four captions and reading them side by side
found four beats describing a screen the viewer was not being shown.

The worst was the one that matters most here. Ten seconds say "Convex, OpenAI,
Firecrawl, AgentMail — not logos, every one of them ran in this film", over a
landing section that names none of them. Searching every text node of the
rendered page for those four words returned nothing at all. The four job cards
now name the service that does each job, so the claim is checkable on the
screen it is spoken over.

Fourteen seconds of the learning proof were a fully Korean page. The capture
clicked the Korean toggle to show the untouched source, the toggle re-rendered
the page and reset the scroll to the top, and the frames held there while the
English narration explained that the original sits beside a labelled
translation. Sixteen seconds meant to show each Agent's private letter showed
the end of the transcript instead: the journal's illustrations load late, the
beat measured its scroll position before they arrived, and everything moved
several hundred pixels after the camera had settled. The journal beat was
filming a different couple's date than the one the film had just watched.

Positions are now measured only after the page stops growing, and every beat
asserts that the thing its captions talk about is actually in frame — the
sponsor tags, the line-evidence chips, the private-notes panel, the four-date
chooser, the source link. A beat that cannot see its own subject fails the
capture instead of being narrated over.

Two captions were also swapped so the two lines about the four saved dates sit
together, which turned three cuts inside one beat into one, and the film now
closes on the product's own last word rather than on a half-empty column.


### 2026-09-16 - the new film deployed, and the old one kept playing

The deploy reported success, the bundle was current, and the submitted URL was
still serving the previous release's film. The captions and transcript beside
it had already updated, which is what made it visible: three files published
together from the same directory, two of them new and one of them not.

The film sits behind a four-hour CDN cache and keeps its name across rebuilds,
so the cache had no way to know it had changed. The stale entry had been warmed
minutes earlier — by a check asking whether production was serving the new film
yet, which is the sort of thing that only has to happen once.

The page now asks for the film, its captions and its poster by hash. The build
writes that hash from the bytes it just produced, so it cannot point at a film
that is not the one on disk, and every rebuild is a new object to the cache.
The deploy then fetches the same URL a visitor would and compares the bytes
against `film-verification.json`, because the existing check only proved the
bundle was current — which it always was.


### 2026-09-16 - the narration was cutting its own words off

Twenty-seven of the film's thirty-four spoken lines ended while sound was still
coming out. The cut was taken from the last word's end time plus a fixed 0.14s,
but a word's end time marks where the vowel resolves, not where the room goes
quiet — so tails kept landing inside the decay. The loudest offender was still
sounding when it stopped, which is what a listener reported. Each clip was
re-cut with a one-off alignment script kept outside the repository: it walks
forward from the last word's boundary until the tail has decayed, then applies
15ms and 80ms fades so the joins do not click. Measured on the committed clips
with `volumedetect` over decoded PCM, no tail is above -41 dB across its last
30ms, or above -58 dB across its last 10ms.

Those numbers were wrong when this entry was first written. They were taken by
seeking inside the MP3s, where a seek lands on a frame boundary — which for a
30ms window is most of the window — and they read far quieter than the audio
actually is. Decode first, then measure.

One cut was a genuine content loss, not a rough edge. Speech recognition splits
`AgentMail` into two tokens, and the aligner stopped at the first, so the line
naming the sponsors was cut to "Convex, OpenAI, Firecrawl, Agent-". The matcher
now consumes source tokens until the caption's word is covered, which the other
compound names in the script needed too.

Correct tails are longer tails, and five lines then no longer fit their beat.
Rather than speed those lines up, the beats were widened. Nothing in the film is
now played at a speed nobody spoke it at, and integrated loudness is -16.4 LUFS.

The script was rewritten in the same pass. Sixteen captions carried the whole
134-second film, which left long stretches of screen with nothing said about
them; it is now thirty-four across 154 seconds, still inside the three-minute
limit. The opening was the weakest part — it described the product before
showing why anyone would want it — so it was put to an outside reader for
criticism and reworked from that.

The voice is ElevenLabs `eleven_v3`, not the macOS one the previous entry
describes. `submission/narration/` now carries that reading — one MP3 per
caption, plus a manifest naming the voice and the exact line each clip reads —
so `bun run demo:submission && bun run demo:narrate` rebuilds the film with no
key and nothing to pay for. On the machine that shot the frames, from the same
capture directory, that rebuild reproduced the submitted SHA-256 exactly. A
fresh clone cannot: the capture directory is deliberately outside git, so it
has to shoot the pages again, and frames taken at a different moment will not
hash the same. A key still takes precedence and renders a fresh reading.
If a caption is edited without re-rendering, narration stops and names the line
instead of shipping a voice that describes a screen that no longer exists.

Two references to a specific country went with it. They were describing the
test data rather than the product, and the product does not care which language
an Agent learns.

### 2026-09-15 - the film speaks

The film had no audio. It now reads its own burned captions aloud, taken from
the VTT the builder writes, so the voice cannot drift from the words on screen
and anyone watching muted loses nothing at all.

Each line sits at its own caption's start; one line that would have outrun its
caption is quickened to fit rather than allowed to spill onto the next screen.
Still 134 seconds, mean -23.8 dB with no clipping.

The voice is the one built into macOS, which costs nothing. The same step
switches to ElevenLabs when a key exists, and swapping either way re-runs
narration alone — the 536 captured frames are untouched.

### 2026-09-15 - the public replay was still Korean, and the film could not be rebuilt

The link every document offers a stranger first — `/watch`, no account needed —
was serving a six-line Korean conversation with no activity journal. The
September 11 audit had found exactly this and a later change fixed it, but on
development: production was never pinned, so it kept falling back to whatever
the moving twenty-row window happened to hold. An English-speaking judge
clicking the primary public link got 591 Hangul characters.

It is now a pinned, reviewed English record: sixteen saved lines in a bookshop,
five journal events, both Agents independently recommending an introduction and
neither human having answered. The guard earned its keep on the way — the first
generated candidate was refused for ending at five turns.

Journals were the reason it took three attempts. `auditActivity` returned null
both when it rejected a draft and when its request never answered, and the
caller withheld the journal either way, so a single timeout threw away a journal
no editor had read. Same defect as the letter path, in the module next door: it
now asks a second time when nothing answered, and still fails closed the moment
an answer arrives and does not hold up.

The film is rebuilt from the record judges will actually see, and for the first
time it can be rebuilt at all. `build-submission-demo.mjs` was in the repository
but the capture that feeds it never was, so `DEMO_SCRIPT.md` instructed a
recapture that nothing could perform. `bun run demo:capture` drives the public
pages, signs in nowhere and resolves every position from selectors, so a longer
pinned record cannot shift a beat off screen. Two burned captions described the
old record and were wrong the moment the pin changed; they now describe what is
on screen.

Still 134 seconds, still under the three-minute limit.

### 2026-09-15 - the whole path, run on the URL that gets submitted

A browser drove `merry-bass-190` from nothing to a finished date, with no
development shortcut anywhere in it: a new account, a real sign-in code
delivered by AgentMail and read back out of the Concierge inbox, the consent
record, the whole brief, a labelled DEMO pass, a coaching message and the
Agent's reply, a twelve-turn English conversation, a private letter that passed
factual verification, both human yeses, and a paused search at the end. Six
minutes twelve seconds. Nothing here is a fixture: production has no
`ENVIRONMENT=development`, so the fixed sign-in code does not exist there and
the mail had to actually arrive.

That is the claim the rules care about — that a stranger can open the submitted
URL and use the thing — and until today it had only ever been checked against
development, which is why it was wrong for a week without any check going red.

The scene's Firecrawl source is now a link on the date itself, not only on the
public replay. Twenty of the last twenty dates carried one, and the end-to-end
test asserts the link rather than trusting the integration still contributes.

What remains is not code. Independent user sessions completed: **0**. Nothing
has been posted and the submission form has not been filled in.

### 2026-09-14 - make the submitted deployment usable, and fix the test that should have said so

Production carried nine environment variables and none of them opened scouting,
so `scoutAccessFor` returned `locked` for everybody. A visitor could create an
account, finish the entire brief, and find the button dead. The entitlement is
now `DATEHAJA_OPEN_TRIAL`, it is documented as belonging on the public
deployment rather than only on development, `scripts/push-env.mjs` can carry it
so it stops being a per-deployment manual step, and `bun run verify` reports
`scoutAccess` so the same drift is visible without reading env by hand. Nothing
about payment changed: `createCheckout` still throws on every deployment.

The dashboard hid the demo encounter while a search was running. With an empty
pool that left the only person in it with a disabled button and no way to reach
the thing that works, so it is now offered during a search too, and disabled
while the Agent is still replying — pressing it in that window threw the
backend's refusal on screen as an uncaught error.

The full account-to-debrief browser test was repaired against the UI that
shipped. It asserted a dashboard group that had been renamed, an
`Agent scouting journey` label no component renders any more — the string was
still in the locale files, and is now gone — and it raced the agent's reply.
Its timeouts were also calibrated for a six-turn date; two measured runs took
4m08s and 4m16s from request to `debrief_ready`, and the old four-minute
ceiling failed by seconds. It now runs with reduced motion, because
`html { scroll-behavior: smooth }` is switched off only for that preference and
one run spent twelve minutes retrying a chip that kept resolving mid-scroll as
"outside of the viewport". A new `afterEach` stops that account's search
whether or not the run passed, which earlier failures did not do.

`smoke` and `avatar-customization` now run in CI. They create no accounts and
read no inbox, and they are advisory on main so they cannot stand between a fix
and the submitted URL. The account-creating suites stay manual.

Both landed on production. `bun run verify:prod` reports
`scoutAccess: { allowed: true, mode: "demo", ok: true }`, where it had reported
`locked` for everybody.

Running that flow against the submitted URL rather than against development
then found a second fault, and it is the more interesting one. A finished
twelve-turn date produced no letters. One owner's review was written, rejected
by the factual editor for a single overreach, rewritten and verified — a good
letter. The other owner's request never answered, and the drafting loop gave up
on the spot with two of three attempts and roughly 140 seconds of its
180-second budget unused, because it treated a request that never answered the
same as a draft that failed verification. Since the caller discards both
reviews when either is missing, the verified letter went with it. A failed
request now drafts again; an answer that arrives and cannot be normalized still
fails closed on the first try.

Independent user sessions completed: still **0**. Social posts and the
submission form have not been sent.

### 2026-09-11 - audit the app a judge can actually try

Verified the public repository, current production deployment workflow and
public coaching preview. 383 unit/Convex tests, build, lint and 15 browser checks
passed. The full account-to-debrief browser test failed on a stale dashboard
selector, before generating its date, so it is not reported as a successful
end-to-end run.

A separate development API probe reused that fictional test account with email
disabled and searching paused. One explicit demo completed in 160 seconds with
12 saved turns, a verified activity journal and an encouraging private review;
no contact was exposed. This proves one current generation path, not a full
browser flow or real-user consent. The audit account's search remains paused.

Read-only production checks found that scouting access is locked, and the
public replay still uses a Korean six-turn recording completed on September 3
UTC. The stronger four-date learning proof is available in production but its
page is Korean-only. The final film is under three minutes; public final-video,
social-post and submission-completion links remain unverified. The detailed
report separates these gaps from current code deployment and passing tests.

### 2026-09-11 - a reviewable English submission and a real-user study kit

The new development `/watch` replay is an actual generated English gallery
encounter between fictional Juno and Sol. Its six-line explicit ending, four
journal events and two independent curious verdicts are preserved. An internal
publication pointer pins the reviewed record; newer demo traffic cannot silently
replace it. Publication rejects unfinished records and any real participant.

The four-date learning proof now has an editorial English translation of all
56 lines, three corrections, saved replies, memories, journals and reflections.
The unchanged Korean source remains one click away. Polite speech persisted;
average reply length did not decrease. Neither this nor the showcase is evidence
of independent user satisfaction.

The film as of this entry is `submission/Datehaja-demo.mp4`: 134 seconds,
actual browser screens of saved fictional records, burned English captions, VTT
and transcript. `/demo` plays it publicly on the development candidate. This
supersedes the older film described in historical entries below, and is itself
superseded by the 154-second narrated cut in the September 16 entries above. Capture/build provenance and
the SHA-256 are in `submission/DEMO_SCRIPT.md` and `film-verification.json`.

`/feedback` provides a bilingual, local-only response download. Recruitment
drafts, neutral tasks and an aggregate-only summarizer are ready for 3–5 adult
first-time users. Independent sessions completed: **0**. Invitations, social
posts and final submission have not been sent in this task. Production rollout
still needs explicit approval of `merry-bass-190`.


### 2026-09-09 - make the learning loop the product

The owner corrected an explanation that exposed every backend gate as a
user-facing step. The main experience now explains four things: create a dating
Agent, let it date, hear what happened, and give feedback. Voice corrections,
preferences about a future partner, and positive reactions each have a clearly
labelled illustrative example. The detailed architecture is optional and lazy
loaded. The actual private chat also offers those kinds of feedback in plain
language.

Per-line coaching links the owner's correction to the saved date, speaker, and
utterance, accumulates private memory, and carries it into later prompts.
351 automated tests pass. Live local runs also exposed repeated dialogue and
an activity interpretation needing repair; a later Sol experiment retained the
owner's polite register over twelve utterances. These are bounded checks, not
proof of universal naturalness. Full evidence and the remaining submission work
are in `docs/AGENT_COACHING_REVIEW.md` and `docs/SUBMISSION_READINESS.md`.

The current film still needs to demonstrate a date, the owner's feedback, and
a subsequent changed date together. The final public video, social-post and
submission links remain unverified. The latest feature code is on development;
this entry does not claim a production rollout or completed submission.

### 2026-09-08 - let uncertainty change the conversation

The first revision still had a deeper scripted behaviour: turn six instructed
the Agents to leave, and the verdict then treated that early exit as a lack of
evidence. The date now allows one bounded clarification. At six turns, an Agent
with a specific unresolved question can continue the same encounter for four
more turns, provided neither recommends passing and nobody has chosen to leave.
Both reviews then use the full transcript. Tests cover the one-extension limit,
private-question isolation, ten-turn persistence, and stale review races.

Removed the automatic last-turn heart and staged progression toward closeness.
The search screen now shows one neighbourhood with actual saved footprints,
selectable encounters, and the owner's lesson for the next search. The public
replay preserves a non-match outcome and allows switching fictional private
perspectives; real owners' private projections remain isolated.

The submission film uses two independently signed-in development accounts on
the real search path. It verifies that both see the same encounter, disables
mail, preserves generated verdicts and pauses both searches. Recording output
is isolated from other Playwright tests. These changes are development-verified;
production rollout and final submission links require separate verification.

### 2026-09-08 - give the date something to do and the letter something to remember

Repeated demos exposed a product problem: the Agents interviewed each other
about abstract compatibility, then the email repeated the same conclusion as
a letter, an atmosphere summary, signals, and disconnected transcript excerpts.

The development experience now gives the Agents a concrete shared situation
inside one of six illustrated sets. A route to choose, a title to propose, or
an ending to change gives the next Agent something specific to answer. Each
date keeps its chosen situation across scheduled turns. The quality model goes
first for dialogue and letters; an unavailable model leaves an honest failed
turn instead of inserting canned conversation.

Each private letter selects an actual adjacent exchange, names that moment,
and asks the owner how they read it. The app and email show the same scene.
The remaining transcript and detailed observations are available on demand.
Each owner's reflection stays sealed, including after mutual consent.

Scouting now persists beyond a single encounter. It considers real Agents
whose owners have opted into searching, paginates the available pool, saves
actual encounters, and moves on when the conversation does not earn a mutual
recommendation. An empty pool becomes an honest waiting state with a last
check time, not an invented demo. Only a promising introduction sends a letter;
the two humans still decide independently. Explicit fictional demos stay
separate and do not send mail.

Tests cover empty pools, candidate pagination, pair deduplication, continued
search after an uncertain encounter or human no, paused jobs, model failure,
and sealed consent. Development browser runs use disposable accounts with
email disabled. This revision has not yet been rolled out to production; the
final submission recording must reflect the continuous search experience.

### 2026-09-06 - the film had drifted, and nothing could have noticed

The demo the submission would have carried records a product this repository
no longer contains. `Datehaja-demo.mp4` was last written on 2026-08-29, before
the concierge surface was deleted; its captions open with "when are you free",
then describe deterministic venue matching, a walking handoff and a calendar
booking. None of those exist. Every check in the repository passed the whole
time, because nothing in the repository knew the film existed.

That is the actual defect: the film was made by hand, so it could go stale
silently. It is recorded by a spec now. `tests/e2e/demo-recording.spec.ts`
drives the same flow — signup, Agent creation, a private message, a live
six-turn date, the private letter, the sealed decision — through the same
selectors the end-to-end suite already proves, so the app cannot move without
a test failing first.

The storyboard became data. `submission/demo-beats.json` names six beats and
the seconds each one gets; the spec marks where each beat begins and ends in
the raw capture, and `scripts/build-demo.mjs` trims those spans and
time-scales each to its target. Two things follow. The film is 2:55 whatever
the models did that day — a slow date is compressed rather than allowed to run
long, and the build refuses to ship anything over the three-minute limit
rather than leaving it to be noticed later. And the captions can be written
once against the storyboard instead of being retimed after every take, which
is what made them drift from the product in the first place. Everything
between beats — signing in, waiting on a page — is cut, so it costs the film
nothing.

The repository is public as of today. The history was scanned for credentials
before publishing and carries none; `.env` has never been tracked, only
`.env.example`. The commits keep their AI co-author trailers, which the rules
explicitly permit — "feel free to use your favorite IDE" — and rewriting
ninety-five commits to hide a permitted tool would have been risk without a
reason.

### 2026-09-05 - the letter, recorded and then rewritten

Recorded the demo footage from the real product: six segments, 1080p, driven
by Playwright against the development deployment, following the storyboard in
`submission/DEMO_SCRIPT.md`. The first take was unusable for a reason no test
had caught — the private debrief, the emotional centre of the whole product,
came back in Korean for an English account whose profile, transcript and date
locale were all English. The logged runs showed every verdict that day had.

The cause was not locale plumbing. Both sides resolved to English and the
prompt said so, then ended the sentence with a register hint that quoted
Korean for every language — "naturally in English … (in Korean, 친근한
반말)" — and the model followed the last cue it saw. A prompt now asks for its
language through one directive that names exactly one language; three tests
guarantee a non-Korean date never sees a Hangul token in its instructions.
The second take, recorded after the fix, is English in all ten text fields.

The same email was then rewritten as what the storyboard calls it: a letter.
Its subject is the Agent's own headline; it opens with the two of them
standing where they met, on the product's dark ground; the Agent speaks
first, in the first person and in the reader's language; the letter is set as
prose and signed; and the invitation to talk it over sits directly under the
signature rather than at the end of a report. The sender is now simply
Datehaja. Tests hold the email to one language at a time.

One more thing the excerpts exposed: an economy model given "introduce
yourself on your first turn only" on every turn kept greeting afresh on turn
three. A later turn now gets the opposite instruction, not a caveat.

### 2026-09-04 - what shipping to production found

Three things were wrong with the debrief email at once, and none of them were
visible from the code alone. The transcript came back in English while the rest
of the mail was Korean, because a date took its language from whichever UI
locale the requester happened to have open while the mail took its language
from the reader's stored profile. Every avatar was a broken image, because
sprite URLs followed SITE_URL and on a development deployment that is
localhost — reachable from the developer's browser and from nowhere an inbox
lives. And the mail itself had accumulated three nested cards, seven uppercase
eyebrows, chat bubbles with speech tails and an avatar beside every quoted line;
it is a report, so it now reads as one.

Then the public replay shipped, the backend deployed, and `showcase:ensure`
answered that no seeded persona was ready to run a date — on a deployment
holding fifty-four of them. The scan read a fixed first page of demo profiles,
oldest first, and production still carried fourteen personas seeded under the
product's previous name, from before matching boundaries existed as fields.
They can never start a date, they sort first, and they filled the page. The
scan now iterates until it finds an eligible persona, and the seed retires that
generation rather than leaving profiles active that nobody can ever match with.

The page then went live labelling one character "Agent" directly beside a
speech bubble signed "Sol", and drawing a seeded man as a woman. Both came from
the projection inventing an identity instead of reproducing the one the date
already used. Names resolve through the same stand-in pool now, and a missing
avatar falls back to a default derived from the Agent's name and its person's
gender.

Every one of these was found by looking at the deployed product rather than at
the diff. The regression tests for the last two fail against the previous
implementation rather than merely describing the new one.

### 2026-09-04 - the Agent became a second self, not a matchmaker

Replaced the model the product had been built on. Until today the Agent was
framed as a best friend and matchmaker: it met another Agent, bragged about
"my friend", scouted theirs, and the two of them compared notes about people
who were not in the room. Read back in a debrief, that is a strange thing to
have paid attention to — a conversation about you rather than one you had.

The Agent is now the person's second self. Two Agents simply date each other as
the two people they stand in for, in the first person, with no matchmaker and
no go-between. That removed the third-person habit from every date prompt, and
with it the need for an Agent to say its owner's name out loud to a stranger's
Agent at all.

The change had to land everywhere at once or it would read as a bug: the date
and verdict prompts, the private companion prompt, the greeting an Agent opens
with, the landing page's sample transcript in seven languages, the onboarding
and legal copy, the product memory that would otherwise have told the next
session to put the matchmaker back, and the README, social and demo script.
The safety framing was kept intact and restated for the new model — the Agent
is labelled AI wherever it appears, and standing in for someone is not the same
as being them.

### 2026-09-04 - agent-only product, painted cast, and a brand of its own

Cut the product down to the agent loop and deleted the concierge past rather
than leaving it dormant. Twelve legacy tables went with it — availability, date
plans and participants, feedback, messages, matching runs, candidate scores,
research runs, venues, calendar feeds, safety plan shares and safety profiles —
along with their functions, tests and two pages. Production data for those
tables was cleared. The i18n packs lost 457 keys that nothing referenced any
more. The suite is 183 tests now rather than 254 because the removed surface
took its own tests with it, not because coverage was dropped.

Rewrote the debrief and connection emails so the Agent speaks rather than a
report renders. Each mail opens with the Agent's own letter beside its avatar
and a verdict badge, then retells the date as a three-beat story with the two
agents' sprites against the world Firecrawl chose. The AI prompts were rewritten
in the same pass: the Agent is a best friend bragging about "my friend" and
scouting the other one, the way teenagers set friends up, not a neutral
evaluator. Both are wired through one delivery context so the app, the emails
and the world always show the same face.

Replaced the pixel field sprites with a painted cast. One base character per
gender was generated with a magenta-keyed outfit, then recoloured
programmatically into all six palettes so every palette shares one face, with
four expressions and an eyes-only blink frame layered over any of them. A
two-tone reference render splits each outfit into top and bottom. The avatar
contract gained an optional gender that flows from the editor through the
delivery context into the emails; sixty sprites replace the twelve pixel ones,
and the old set was deleted once the new one covered every combination.

Gave the product a mark of its own. The old symbol was a heart inside two
brackets inside two rings, which said nothing this product does not share with
every dating app. It is now the Korean finger heart — a gesture someone makes,
which is the proposition — traced from a flat silhouette with an OpenCV contour
trace and carrying a warm gradient. The wordmark moved off the body serif onto
DM Serif Display, and on phones the header's secondary controls collapse behind
one menu so the flag stops crowding the brand.

Added the agent workflow this log now runs under. `/loop-review` and its
dependencies were ported from another repository and adapted: the reviewer is
the code-review skill rather than a bot this repo does not have, the gates are
this repo's typecheck, lint and tests because there is no CI, and the merge gate
is the Convex backend, since merging publishes the frontend on its own while the
backend does not follow. Reviewing this work through that loop found seven real
bugs across three rounds, including two theme controls that each cached their
own copy of the document attribute, so changing the theme in one left the other
acting on a value that was no longer true.

Convex production was redeployed and verified: 86 functions, the avatar
validator accepting the new field, every integration reporting healthy, and all
sixty sprite URLs the mail pipeline can build resolving on the live domain.

Running the end-to-end suite that AgentMail's first-week recipient cap had
gated exposed a gap the unit tests could not see: production had been brought
forward while the development deployment still carried the deleted concierge
surface — 154 functions against production's 86, and an avatar validator that
rejected the new field the client now sends. Onboarding failed against it while
passing against production. Development was brought back in line, which meant
clearing legacy rows that the current schema no longer admits: `aiRuns` with a
`build_plan` purpose, and `auditEvents`, `emailMessages` and `notifications`
still carrying `dropId`. The lesson is that a deployment left behind is not
neutral; it silently tests a product that no longer exists.

With development back in line the full suite runs. The single-account journey —
signup, OTP, agent creation, the ideal-person and about-me briefs, an agent
date, the private debrief and the human decision — passes end to end in two
minutes. The two-account journey completes in the data too: six stored turns in
about a minute, independent `encourage` and `curious` verdicts with their own
private reasoning, and an earlier run recorded with both consents and a
`connected` status. Its assertion still fails, because it waits to see the
transcript counter reach six while the page moves to the debrief as the sixth
turn lands, so the final count is never painted. That is a test watching for a
frame the product does not render, not a broken flow.

### 2026-09-01 - real product capture and launch review

Replayed the product with the existing authenticated demo account and captured
the real Agent world, six-turn transcript, persistent private Agent room,
report correction conversation, and the two-human consent result. Curated the
privacy-safe sequence under `submission/captures/` and reused three frames in a
new visual landing triptych so a visitor can see the real shipped product
instead of reading another explanation. The captures contain labelled demo
people and no real contact details.

Re-ran lint, the production build, all 254 unit and Convex tests, and the public
desktop/mobile Playwright suite. The enabled browser tests passed; the two
fresh-account suites remain intentionally gated until AgentMail's first-week
ten-recipient restriction lifts on 2026-09-03T12:24:00.593Z.

The Convex launch-readiness pass found no production errors, read-limit events,
or OCC warnings in `merry-bass-190` over the last 72 hours. Development had one
successful automatic OCC retry on an analytics rate-limit row and two expected
AgentMail 429 responses from the temporary recipient restriction; neither
affected production.

### 2026-08-31 - agent dating and spatial-world pivot

Rebuilt the active product around personal AI Agents rather than automated
restaurant planning. A user now creates and styles one persistent character—the
same Agent that listens privately and goes into the virtual world as them—then
sends it to meet another person&apos;s Agent.
The two agents receive isolated private briefs, alternate through six stored
turns, and independently return `encourage`, `curious`, or `pass`. The other
agent&apos;s private reasoning and the other human&apos;s answer remain sealed. Contact
is fetched only after two transactional human yeses; demo dates never contain a
real contact to expose.

Added a spatial experience inspired by the mechanics that make virtual social
spaces legible: persistent identity, location, proximity, interactive objects,
and ambient presence. Firecrawl&apos;s live cultural source selects a cinema,
market, bookshop, garden, gallery, or café world. Two small autonomous sprites
move as each turn arrives, objects explain the local context, and the complete
date becomes a six-moment replay. The dashboard now gives the Agent a private
home and exposes its compact memory to its human for correction.

Removed numeric compatibility from the user-facing debrief. The model still
helps rank scarce candidates internally, but the product shows the transcript,
specific sparks, specific friction, and the Agent&apos;s plain-language
interpretation. It explicitly says that a simulation is not a prediction of
real chemistry.

The current active flow is signup → legal consent → Agent creation → private
agent chat → agent-date request → realtime six-turn world → independent
debrief → sealed human decision → mutual contact gate. The legacy concierge
entries below remain as an implementation history; their routes are no longer
the current product surface.

## Earlier commits, oldest first

Everything above this line is newest first. Everything below it is the original
build log, kept in the order it was written.

Live Scout Pass billing is deliberately locked while merchant approval is in
progress. Stripe does not support a direct South Korean merchant account, and
Lemon Squeezy and Paddle prohibit dating services. The launch plan uses an
approved Korean recurring-payment PG plus an approved international channel,
orchestrated through PortOne. Until both the provider and acquirer approve the
actual matchmaking category, the app exposes only a labelled, non-paying demo
pass and cannot collect card data.

### 2026-08-26 - 30f362e

Scaffolded the project: Vite 8, React 19, TypeScript, Tailwind v4, Convex 1.45.
Chose Convex as the only backend and decided every secret would live on the
deployment rather than in the repo (`.env.example`, `.gitignore`).

### 2026-08-26 - b1bb727

Built the data model — 18 tables covering profiles, preferences, availability,
date plans and participants, plus the observability tables the product needs to
be honest about itself: `matchingRuns`, `candidateScores`, `researchRuns`,
`venues`, `aiRuns`, `agentMailEvents`, `auditEvents`. Every table carries the
indexes its real queries use; no hot path does a full scan. Registered the
`staticHosting` component. Convex features: schema, tables, indexes, components
(`convex/schema.ts`, `convex/convex.config.ts`).

### 2026-08-26 - d71abaf

Added Convex Auth (email + password) and the authorisation layer. No Convex
function accepts a caller-supplied user id for authorisation — identity always
comes from the session. Wrote `convex/lib/privacy.ts` as the single projection
every cross-user read passes through: first name, age, neighbourhood, a few
interests, and nothing else. Convex features: queries, mutations, file storage,
Convex Auth (`convex/auth.ts`, `convex/lib/authz.ts`, `convex/profiles.ts`).

### 2026-08-26 - 47ee5e5

Wrote the matching engine and the date-plan state machine as pure functions.
Stage 1 hard filters are the only thing allowed to exclude anyone: mutual
gender interest, age ranges, distance, a genuine 90-minute availability
overlap, blocks in either direction, moderation state, budget, currency and
shared language. Stage 2 scores the survivors deterministically and returns the
signals that produced the score. Illegal lifecycle transitions throw rather
than corrupting a date plan (`convex/lib/matching.ts`, `convex/lib/stateMachine.ts`).

### 2026-08-26 - 4944cbb

Integrated the three sponsor services.

OpenAI via `/v1/responses` with strict JSON Schema for candidate ranking, venue
extraction and plan writing, plus a model ladder and hard-stop handling so a
spent quota fails fast instead of burning retries.

Firecrawl v2 for live venue research; every source URL, evidence snippet and
call latency is persisted.

AgentMail REST for the Concierge inbox. Its webhooks are Svix-signed, and the
`svix` npm package depends on Node crypto and cannot run inside a Convex HTTP
action — so the verification algorithm is implemented directly with Web Crypto.

Also added deterministic fallbacks for venue extraction and plan composition so
a provider outage degrades the prose rather than cancelling someone's Saturday.
Anything produced that way is marked low confidence and never presented as
model reasoning that did not happen. Convex features: actions
(`convex/integrations/`, `convex/ai.ts`, `convex/research.ts`).

### 2026-08-26 - 996ca20

Built the orchestration: hard filter → deterministic scoring → AI ranking →
live research → plan generation → private invitations, chained with
`ctx.scheduler`. A pass keeps the accepted person's evening held and searches
for a replacement rather than cancelling on them; a configurable cutoff
(default 24 hours before the date) expires the plan and says so honestly.

Added safety — mutual blocking that cancels shared plans and frees both
calendars, reporting that restricts an account on serious categories — the
Concierge email templates, constrained preset-only pre-date messaging, and 14
clearly-marked fictional demo personas to solve the cold start. Convex
features: actions, HTTP actions, crons, scheduled functions
(`convex/matching.ts`, `convex/datePlans.ts`, `convex/mail.ts`,
`convex/safety.ts`, `convex/demo.ts`, `convex/crons.ts`, `convex/http.ts`).

### 2026-08-26 - 312bf83

Built the web app: landing page, six-step onboarding, dashboard, date
invitation and confirmation screens, availability editor, profile, preferences,
notifications, privacy, safety centre and demo controls. The dashboard's
matching progress states map one-to-one onto real `matchingRuns` documents —
nothing animates to look busy. Each date plan has a "How we built this" panel
showing the pages Firecrawl actually crawled and the model runs behind the
plan. Convex features: realtime queries (`src/`).

### 2026-08-26 - 1b4e4f3

Added 163 tests. Unit tests cover the hard filters (every exclusion reason and
its soft counterpart), scoring bounds, all illegal lifecycle transitions,
expiry and deadline rules, availability overlap, timezone handling, and the
privacy projections. `convex-test` integration tests drive accept, pass,
withdraw, cancel, expire and complete as real signed-in users and assert the
negative authorisation cases. Provider parsing is tested against mocked
responses, and the Svix verifier against real signatures, tampered bodies,
replays and wrong secrets.

The tests found one real bug: withdrawing after accepting left the plan stuck
in `partially_accepted` with nobody committed. Fixed in `convex/datePlans.ts`.

### 2026-08-26 - 41483ba

Deployed to production and ran the whole flow against the live site.

Backend deployed to `merry-bass-190`; the React SPA is uploaded to
`merry-bass-190.convex.site` by `@convex-dev/static-hosting`, sharing the origin
with Convex Auth's `/.well-known/*` routes and the AgentMail webhook (which is
why the app keeps root routing and the static catch-all is registered last).

Running it live surfaced three bugs, all fixed:

- Availability was interpreted in the browser's timezone rather than the city
  the date happens in, so "Saturday 7pm" meant different things to different
  users.
- The chip selector lost rapid successive taps because each toggle read a stale
  selection; it now takes an updater.
- The onboarding summary showed no age after a reload, because `dobMs` is
  deliberately never returned to the client. It now falls back to the
  denormalised `ageYears`.

### 2026-08-26 - 88184b6

Verified integrations against the live production deployment, and recorded
exactly what is and is not proven:

- **Convex — verified.** Signed up, onboarded, added availability, ran the
  matching pipeline, accepted a date plan and had it confirm. A second browser
  tab left open on the dashboard moved from "Your date plan is ready" to "Waiting
  on the other person" to "It's a date" without a reload or a navigation.
- **Firecrawl — verified live, unauthenticated.** Real `/v2/search` calls from
  a Convex action against Seoul venues returned HTTP 200 with real results
  (8.3s and 12.0s), producing 14 venue records from 10 source pages, all
  persisted with their source URLs. `/v2/scrape` returns 403 without an API key,
  so it is skipped when running keyless. No participant credits were claimed.
- **OpenAI — implemented, not verified.** No `OPENAI_API_KEY` is set on the
  deployment, so no model call has succeeded. The deterministic fallbacks
  handled extraction and planning instead, and the app labelled the result
  "Unconfirmed details" as designed.
- **AgentMail — implemented, not verified.** No `AGENTMAIL_API_KEY` is set, so
  no mail has been sent or received. Sends are logged as
  `skipped_no_provider` with the reason.

Both unverified integrations are complete against the real APIs — no mocked
adapters — and `setup:provisionAgentMail` will create the Concierge inbox and
signed webhook in one call once a key exists. `GET /healthz` reports which
integrations are live on the deployment.

### 2026-08-26 - 58ba634

Added the OG image, touch icon and submission assets, and fixed four things
found by using the deployed app: a confirmed date hid the way to ask for
another date plan; heuristic venue names kept their markdown link brackets; a
price capture dragged surrounding prose along with it; and fallback plan notes
read awkwardly.

### 2026-08-26 - 8cc3b85

Ran a 44-agent adversarial audit across authorization, privacy, correctness,
integration robustness, frontend/accessibility and copy honesty — every finding
independently verified by a separate skeptic before being accepted. 38 findings
raised, 12 refuted, 26 confirmed. Fixed all of them.

Two root causes accounted for most of the serious ones.

**Identity by insertion order.** A date plan keeps every participant row it ever
had, so after a replacement the oldest non-self row is the person who
_declined_. Six call sites picked "the other person" that way: the replacement's
invitation email described the person who passed, blocking from a plan blocked
the wrong account (leaving the real match still matchable, with no error shown),
reporting filed against an uninvolved user and auto-flagged their account, and
the date-plan page named the wrong counterpart. All of it now routes through
`convex/lib/participants.ts`, which resolves the counterpart by commitment.

**Authorization that checked membership but not liveness.** Someone who had
passed could cancel a confirmed date between two other people, confirm
attendance on it, read the confirmed pair's logistics notes, receive the other
person's photo once the plan confirmed around them, and see it as an upcoming
date on their own dashboard.

Also fixed: a replacement could be attached to an availability window another
plan already held; a replacement run could be left `running` forever, blocking
the user's next search for ten minutes; releasing a held evening orphaned the
plan rather than standing it down (now atomic, and it cancels a confirmed date
rather than letting the other person turn up alone); the reminder and age sweeps
could never reach rows past their first page; and the client and server
disagreed about age on a user's 18th birthday, hard-blocking a valid sign-up —
both now use calendar arithmetic in `convex/lib/age.ts` instead of dividing by
an averaged year.

`aiRuns` rows are written before the plan document exists, so "How we built
this" showed no model runs despite the README saying it would; provenance now
reads them by matching run as well.

Two copy claims outran the code and were corrected rather than papered over:
pausing removes you from the candidate pool immediately, but a search already in
flight can still deliver one final invitation, and the Safety Center and README
now say exactly that.

Frontend: budget inputs no longer snap back mid-edit, the theme toggle no longer
freezes the system theme on a first visit, action chips no longer advertise
themselves as toggles, and the segmented control supports arrow-key navigation
as its `radiogroup` role promises.

15 new regression tests covering the replacement flow specifically. 180 total,
all passing. Redeployed and re-verified against production: a replacement plan
now names the replacement, not the persona who passed.

### 2026-08-27 - 642710e

Wired the real credentials and verified each integration with a live call.

- **Firecrawl — verified, now authenticated.** With a key, `/v2/search` returns
  in 400–900ms against 8–18s unauthenticated. Also corrected an earlier wrong
  inference: `/v2/scrape` does NOT require a key. The 403s seen earlier were
  per-site refusals ("we do not support this site" — Reddit, Facebook), not
  auth failures, and the code had been gating the scrape follow-up behind
  `hasFirecrawlKey()` for that wrong reason. Gate removed; those domains are
  now excluded at search time instead.
- **AgentMail — verified end to end.** Verified the dedicated Datehaja Concierge
  inbox and its webhook at `https://merry-bass-190.convex.site/webhooks/agentmail`
  subscribed to message.received, message.sent, message.delivered and
  message.bounced. Sent a real message (AWS SES message id returned), and the
  resulting `message.sent` and `message.delivered` webhooks arrived, **passed
  Svix signature verification**, and were persisted idempotently. The Web Crypto
  verifier works against real AgentMail signatures, not just synthetic ones.
  `message.received` is still unexercised — it needs a human to reply to the
  Concierge inbox.
- **OpenAI — key created, still blocked on credit.** The account has no prepaid
  balance, so every call returns `429 insufficient_quota`. Adding credit is a
  payment action and is the one remaining human step.

One real bug surfaced by doing this rather than assuming: AgentMail rejects an
`Idempotency-Key` containing anything outside `A-Z a-z 0-9 - . _ ~`, and returns
a 400 that names the header rather than the character. Keys built from email
addresses or ISO timestamps therefore failed silently at send time. Sanitising
in the client means no call site has to remember. 187 tests.

### 2026-08-27 - 4aa019f

Credit added to the OpenAI account, so the model path runs for the first time.
All three stages now succeed against the live deployment: `rank_candidates`
(5.9s), `venue_summary` (13.3s), `build_plan` (4.8s).

The difference in output is the whole argument for the model path. Before, the
rule-based fallback produced generic plans from headings like "Cash and Tipping
in South Korea". The model path instead grounded a concrete plan in a verified
public venue and explained why it suited both people.

That production check used a restaurant request. Datehaja now treats the user's
exact activity request as the anchor, so a film, walk, exhibition, live show, or
meal can each be the complete date without an automatic second stop.

Picked the model by measuring rather than by price list. On the hardest task —
extracting venues from eight crawled pages — gpt-5-nano let blog headings
through, gpt-5.6-luna and gpt-5-mini both returned six real venues, and luna did
it 2.5x faster than mini at a lower price. gpt-5.6-terra, the most expensive
candidate tried, could not run the request at all: a new account's
tokens-per-minute allowance is too small for the payload, so it returns
`429 Request too large`. The ladder is now ordered cheapest-capable first, and a
TPM refusal drops to the next model instead of failing, since smaller models
carry roomier allowances.

One date plan costs ~22,800 tokens end to end, about $0.0066. Venue extraction is
80% of that, since it reads the crawled pages.

### 2026-08-28 - 8b85c6f

Prepared the submission assets for recording and social launch. The demo
checklist now requires a deliverable email before the take so the real
AgentMail invitation can be shown. Verified the sponsors' current X handles,
updated the public test count, and reran the suite: 188 tests pass
(`submission/DEMO_SCRIPT.md`, `submission/SOCIAL.md`).

### 2026-08-28 - 1f9281e

Reworked the product around a private-concierge docket rather than a generic
rounded dashboard: paper-and-ink tokens, compact status stamps, editorial
layouts, and a rebuilt landing and authentication flow. Applied the same visual
language to the app shell, onboarding, public records, and date-plan cards.
Checked dark and light themes at 390px and 1440px with no overflow or browser
errors. Rechecked the landing-to-signup route, adult-confirmation guard,
sign-in, privacy, safety, protected-route redirect, and theme switch in a real
browser; 188 tests and the production build pass (`src/`).

### 2026-08-28 - a2628f8

Added country-aware internationalization for ten launch markets: the United
States, United Kingdom, Canada, Australia, South Korea, Japan, Germany, France,
the Netherlands, and Sweden. The selected locale is detected, persisted, and
applied to document metadata, accessibility labels, dates, times, money, and
the core journey from landing and signup through onboarding, dashboard,
availability, history, notifications, privacy, and safety. Verified every
locale in a real browser, including reload persistence and a 390px Korean
mobile layout; 193 tests and the production build pass (`src/i18n/`, `src/`).

### 2026-08-28 - 32afc54

Softened the concierge aesthetic into a warmer, more personal couple-service
experience without borrowing another product's characters or layout. Replaced
the institutional grid, square controls, and offset stamp shadows with a cream,
blush, coral, and plum palette; pill-shaped actions; soft invitation cards; and
small hand-placed heart and sparkle details. Added locale-aware typography:
DM Serif Display and Nunito Sans for Latin scripts, Gowun Batang and Gowun
Dodum for Korean, and Zen Maru Gothic for Japanese. The landing, authentication,
app shell, mobile navigation, onboarding, dashboard, date-plan cards, public
records, logo, and favicon now share the same visual language.

Verified English and Korean at 1280px and 390px with no horizontal overflow,
checked the light and aubergine dark themes, exercised language switching and
the signup adult-confirmation guard in a real browser, and raised small-text and
button contrast to accessible levels. The production build, lint (no errors),
and all 193 tests pass (`src/`, `public/favicon.svg`, `index.html`).

### 2026-08-28 - bf0c538

Replaced the Korean display serif after visual review showed that its calligraphic
forms and English-tuned tight leading made the hero feel dated and crowded.
Korean now uses Noto Sans KR at a controlled 700 weight, with script-specific
font sizing, 1.18 line height, balanced wrapping, and deliberate spacing between
the two hero sentences. Removed synthetic Korean italics and widened the hero
copy column so the desktop sentences each hold a clean line. Rechecked at
1280px and 390px in a real browser with no horizontal overflow; the production
build and all 193 tests pass (`index.html`, `src/styles/index.css`,
`src/pages/LandingPage.tsx`).

### 2026-08-28 - 4c14fb9

Kept the real Vite development server and browser open for continuous visual
review. The first landing-to-signup walkthrough exposed two issues that static
checks missed: dark-mode invitation cards had a light-theme glow bright enough
to wash out their contents, and React Router preserved the landing page's
scroll position so signup could open with its header and title clipped. Added a
theme-specific low-luminance plum glow and a pathname-based scroll reset. A
second real-browser walkthrough now opens signup at the top, both themes keep
the invitation legible, there are no browser errors, and the production build,
lint (no errors), and all 193 tests pass (`src/App.tsx`,
`src/styles/index.css`).

### 2026-08-28 - db70df1

Replaced the landing page's long explanatory copy with a visual product story:
a four-card date journey, hand-drawn evidence icons, a concrete invitation
preview, and an A-to-B privacy diagram with locked data tiles. The hero now
asks for one action without an AI-like paragraph, while the remaining copy is
kept only where it proves the product or states a safety limit. Also made hash
links land on their intended section without breaking the route-level scroll
reset.

Checked Korean and English at 1280px and 390px, including long-label wrapping,
in-page navigation, sign-in scroll position, and horizontal overflow. The real
browser reported no errors; the production build, lint (no errors), and all 193
tests pass (`src/pages/LandingPage.tsx`, `src/App.tsx`, `src/i18n/index.tsx`).

### 2026-08-28 - 1c46100

Replaced the abstract landing steps and repeated privacy panel with a complete
visual service scenario. The new flow shows two availability windows entering
the concierge, compatibility and live venue research, two separate private
acceptances, and the final public-place date ticket. Kept safety facts as
compact visual badges instead of another explanatory paragraph, and localized
the new stage label for all ten launch markets.

Unified display-heading rhythm with one locale-aware line-height token: 1.08
for Latin scripts and 1.18 for Korean and Japanese. Browser-computed values now
match across every landing heading. Verified the flow at 1280px and 390px,
checked long German labels for clipping, and fixed direct hash loads that could
run before the authenticated shell rendered the anchor. No browser errors or
horizontal overflow; the production build, lint (no errors), and all 193 tests
pass (`src/pages/LandingPage.tsx`, `src/styles/index.css`, `src/App.tsx`,
`src/i18n/index.tsx`).

### 2026-08-28 - cef5dba

Turned the service scenario into one connected concierge desk: two availability
slips travel through Datehaja's live research, become separate locked replies,
and merge into a final public-place date ticket. The landing example now adapts
its city, neighbourhood, time format, time zone, currency, budget, venue, and
sample person to each of the ten launch locales instead of presenting Seoul to
every visitor.

Replaced the compact native locale select with a warm flag-led country menu and
fixed its mobile positioning after real-browser review exposed left-edge
clipping. Verified English, German, and Korean locale switching, in-page
navigation, 1280px desktop and 390px mobile layouts, and zero horizontal
overflow. The production build, lint (no errors), and all 193 tests pass
(`src/pages/LandingPage.tsx`, `src/components/layout/LocaleSwitcher.tsx`,
`src/i18n/index.tsx`).

### 2026-08-28 - 3fae84d

Rewrote the submission recording plan around the final connected-concierge
landing and a 2:58 product walkthrough. The shot list now opens with the visual
service flow, then proves live Convex state, Firecrawl evidence, OpenAI model
runs, a genuinely delivered AgentMail invitation, two private acceptances, and
an untouched second window changing to a confirmed date. Added explicit guards
against recording a stale deployment, a non-deliverable `.test` mailbox, or
private information on screen, and updated submission copy to the current 193
tests. The video itself is not yet recorded (`submission/DEMO_SCRIPT.md`,
`submission/SOCIAL.md`, `README.md`).

### 2026-08-29 - fce2091

Finished the private product-hardening pass around the full date lifecycle. The
sign-in page now explains the product reason for an account through a complete
visual handoff: each invitation belongs to one person, each answer stays
private, and the calendar updates without exchanging contact details. The new
copy and the safety/calendar/check-in journey are localized across the ten
launch-market locale system.

One private iCalendar subscription now derives directly from Convex state. A
first acceptance creates a tentative reservation, two acceptances finalize the
same event, and a withdrawal, cancellation, or unsuccessful replacement marks
that event cancelled. Users can add it to Google Calendar or any `webcal`
client. After a completed date, each participant can optionally record what
happened, whether they felt safe, whether they would meet again, a venue score,
and a private note. None of it is returned to the other participant.

Added a consent-based safety circle rather than collecting raw identity
documents: one trusted contact can receive the user's first name, confirmed
time, and public venue on explicit request, while the match's identity and
contact details stay private. Datehaja continues to state plainly that it does
not verify identity. The growth plan concentrates liquidity in one Seoul wedge
before expanding city by city, and the three-minute demo now includes the
calendar and trusted-contact proof.

Verified 199 tests, typecheck, lint with no errors, and the production build.
Desktop and 390px browser checks found no overflow or console errors. A
read-only Convex launch audit found no 72-hour resource/OCC insights and no
recent failed executions on the existing production deployment; the new
backend was pushed only to the personal dev deployment `adorable-boar-359`.
Production and repository visibility were intentionally left unchanged during
this private hardening pass.

### 2026-08-29 - 4c920bf

Promoted the complete private hardening build to Convex production
`merry-bass-190` and to `https://datehaja.com`. The deploy included the
calendar-feed, date-feedback, safety-profile, and trusted-contact schemas and
indexes, set the production `SITE_URL` to the custom domain, and uploaded the
same build to the Convex static-hosting fallback. Static deployment:
`210e31f0-56fb-472c-ae60-8211f0a0f533`.

Production verification exercised every configured integration. Firecrawl
returned three live results in 3161 ms; OpenAI `gpt-5.6-luna` completed in
5661 ms using 82 tokens; AgentMail reported two inboxes and an enabled,
signed webhook subscribed to received, sent, delivered, and bounced events.
The health endpoint reported every integration ready, and the production
snapshot contained verified, processed AgentMail events including a received
message.

A fresh production account completed protected-route redirect, sign-up, all
six onboarding steps, Seoul availability, and the full matching pipeline. The
researched plan arrived in about 36 seconds with live venue sources and a clear
cost estimate. One acceptance changed the plan to Reserved;
a second fictional-persona acceptance changed an untouched browser tab to
“It's a date” through a realtime Convex query without refresh. The same event
then appeared as Finalized with Google Calendar and webcal actions. Trusted
contact sharing, the optional private post-date check-in, and the explicit
limits on identity verification were also checked. No browser console errors
were emitted.

The active production AgentMail address was migrated to
`datehaja-concierge@agentmail.to`; both development and production now use the
same branded inbox and signed webhook.
Completed a 2:39 narrated 1080p H.264/AAC submission cut at
`submission/Datehaja-demo.mp4`, based on the production E2E evidence above.

### 2026-08-29 - 1c07262

Normalized the product name casing to `Datehaja`, reflecting that
“haja” is a single Korean verb rather than a second name. Updated every
user-visible surface and technical reference: the 10-locale dictionary,
authentication and safety copy, Concierge emails, calendar events, metadata,
Open Graph artwork, README, growth and social material, demo script, captions,
and the narrated video itself. Renamed the final asset to
`submission/Datehaja-demo.mp4`; an exact tracked-file search finds no old-case
occurrences.

Verified all 199 tests, typecheck, production build, and lint with no errors
(existing warnings only). Re-encoded and fully decoded the 159.3-second,
1920×1080 H.264/AAC video and visually checked its title and final frames.

Deployed the new casing to Convex production `merry-bass-190`, the Convex
static-hosting fallback (deployment
`af3772aa-857d-4951-a21b-30146c7a9a23`), and Vercel production (deployment
`dpl_2MYSHjJAjAAaFjde8kaBUei1GfNJ`, aliased to
`https://datehaja.com`). Fresh production HTML from both hosts and a real
browser accessibility pass contain `Datehaja` only. The health endpoint still
reports OpenAI, Firecrawl, AgentMail, its inbox, and its webhook ready.

### 2026-08-29 - active invitation brand and growth loop

Shifted the brand voice from product narration to a direct human invitation.
That direction later evolved into the activity-first promise documented below.

Added the operational growth unit, **Datehaja Night**: concentrate a trusted
Seoul cohort into three upcoming evenings, match the pool together, collect
private next-morning check-ins, and reopen availability in one tap. The growth
plan now distinguishes density, anonymous proof, and venue loops and uses safe
completed dates per active neighbourhood per week as its north-star metric.

Verified 199 tests, typecheck, and production build. Browser QA confirmed the
new English and Korean landing layouts, language switcher, CTA labels, metadata,
and 1200×630 social artwork.

Deployed the updated landing to Vercel production (deployment
`dpl_E4QsU1ieEciML7B9qeG3Q3qLQbz3`, aliased to `https://datehaja.com`) and the
Convex static-hosting fallback (deployment
`134efd45-59f8-49b1-812d-664aad59fed2`). Fresh HTML from both hosts contains
the new title, and `/healthz` reports OpenAI, Firecrawl, AgentMail, its inbox,
and its webhook ready.

### 2026-08-29 - date-window brand mark

Replaced the literal two-people-and-table illustration with a simpler symbol:
two open availability windows face each other and a small heart appears in the
shared space. The mark now communicates the product's actual transformation —
two schedules becoming one date — without relying on a generic AI sparkle.

Applied the same geometry to the React interface, SVG favicon, 180×180 Apple
touch icon, and 1200×630 Open Graph card. Verified the icon at 512px, 180px,
32px, and in the social composition, then passed all 199 tests, typecheck, and
the production build.

Deployed the mark to Vercel production (deployment
`dpl_B6WffSbmcf1c5a2gW2h9WjGV8nnt`, aliased to `https://datehaja.com`) and the
Convex static-hosting fallback (deployment
`c8486661-85d2-4e3b-9bb3-d1781e0a7465`). The live favicon and Open Graph PNG
match the local assets byte for byte, and production integration health remains
fully ready.

### 2026-08-29 - customer-centred landing story

Replaced the landing page's internal-system diagrams with the customer's actual
journey. Removed the large A/B pipeline and technical “availability docket”
presentation.

The new three-moment flow is written entirely from the user's perspective and
ends with a calendar-ready confirmed date. Added complete translations for
every new phrase across all ten supported locales.

The first version used a restaurant illustration. It has since been replaced by
the activity-first movie-date photography described in the current entry.

That earlier version was deployed to Vercel and the Convex static-hosting
fallback. Its production verification passed before the activity-first pivot.

### 2026-08-29 - activity-first product pivot

Reframed Datehaja around a simple customer promise: say what you genuinely want
to do, then find a new person who wants to do it with you. The product no longer
assumes that a date is a meal or that a one-stop plan needs padding. Watching one
film, walking one route, seeing one exhibition, or hearing one live set can be
the entire date.

This is a working product flow, not landing-page copy. Each availability window
now carries a specific date idea. Matching uses it when evaluating candidates,
Firecrawl searches for that exact activity near both people, and OpenAI is told
to preserve the request as the plan anchor. The deterministic fallback also
understands cinemas and keeps an explicit film request to one stop.

Replaced the previous restaurant illustration with a candid, text-free image of
two adults at a small independent cinema. Updated the landing, onboarding,
dashboard, preferences, demo script, submission copy, metadata, growth plan,
and all supported landing locales to tell the same activity-first story.

## 2026-09-09 — Core learning demonstration

- [Saved before/after learning proof](https://adorable-boar-359.convex.site/preview/agent-coaching): one fictional owner, four scheduled encounters, 56 saved lines, and three linked feedback/reply pairs. All original dialogue is preserved. Two initially withheld reviews were subsequently corrected and independently verified; the page labels those recovered notes. Both records now include verified activity journals. Recovery changes neither human consent nor prior coaching memory.
- [54-second browser walkthrough](https://adorable-boar-359.convex.site/demo/learning-proof.mp4): actual product screens replaying those records, with English captions. It is a recorded Korean rehearsal, not a live generation claim.
- 365 tests pass. See `docs/REVIEW_RECOVERY.md` and `docs/LEARNING_PROOF_REVIEW.md` for limitations; polite register improved, average reply length did not. This does not establish real-user satisfaction or universal dialogue quality.
- This updates the development candidate; the older full submission film and public submission/social steps remain separate.
