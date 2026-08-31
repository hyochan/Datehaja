# Hackathon log

- **Project:** Datehaja
- **Event:** Convex All Gas Hackathon
- **What it does:** Each person creates one private AI Agent that is simultaneously their matchmaker, confidant, and visible character in the virtual world. Two clearly labelled Agents date, return with independent debriefs, and open human contact only after two sealed human yeses.
- **Live app:** https://datehaja.com
- **Repo:** private
- **Frontend:** Vercel custom-domain delivery + Convex static-hosting fallback
- **Convex deployment:** https://merry-bass-190.convex.cloud
- **Components:** @convex-dev/static-hosting
- **Convex features:** schema, tables, indexes, queries, mutations, actions, HTTP actions, crons, scheduled functions, file storage, realtime queries, pagination
- **Auth:** Convex Auth
- **AI models:** gpt-5-nano for active Agent chat/dates, with gpt-5.6-luna as the first quality fallback and the proven default for heavier legacy extraction
- **Started:** 2026-08-26T22:04:05Z
- **Last updated:** 2026-08-31T00:00:00+09:00

## Log

### 2026-08-31 - agent dating and spatial-world pivot

Rebuilt the active product around personal AI Agents rather than automated
restaurant planning. A user now creates and styles one persistent character—the
same Agent that listens privately, acts as matchmaker, and goes into the virtual
world—then sends it to meet another person&apos;s Agent.
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
