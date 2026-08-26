# Hackathon log

- **Project:** DateDrop
- **Event:** Convex All Gas Hackathon
- **What it does:** Asks only when you're free, then researches a real date at a real venue, matches you with someone compatible, and privately invites you both — without either of you seeing the other's contact details.
- **Live app:** https://merry-bass-190.convex.site
- **Repo:** https://github.com/hyochan/datedrop
- **Frontend:** Convex static hosting
- **Convex deployment:** https://merry-bass-190.convex.cloud
- **Components:** @convex-dev/static-hosting
- **Convex features:** schema, tables, indexes, queries, mutations, actions, HTTP actions, crons, scheduled functions, file storage, realtime queries
- **Auth:** Convex Auth
- **AI models:** gpt-5.6-terra (configured default, with a fallback ladder in `convex/integrations/openai.ts`)
- **Started:** 2026-08-26T22:04:05Z
- **Last updated:** 2026-08-26T22:20:00Z

## Log

### 2026-08-26 - 30f362e
Scaffolded the project: Vite 8, React 19, TypeScript, Tailwind v4, Convex 1.45.
Chose Convex as the only backend and decided every secret would live on the
deployment rather than in the repo (`.env.example`, `.gitignore`).

### 2026-08-26 - b1bb727
Built the data model — 18 tables covering profiles, preferences, availability,
DateDrops and participants, plus the observability tables the product needs to
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
Wrote the matching engine and the DateDrop state machine as pure functions.
Stage 1 hard filters are the only thing allowed to exclude anyone: mutual
gender interest, age ranges, distance, a genuine 90-minute availability
overlap, blocks in either direction, moderation state, budget, currency and
shared language. Stage 2 scores the survivors deterministically and returns the
signals that produced the score. Illegal lifecycle transitions throw rather
than corrupting a drop (`convex/lib/matching.ts`, `convex/lib/stateMachine.ts`).

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
(default 24 hours before the date) expires the drop and says so honestly.

Added safety — mutual blocking that cancels shared drops and frees both
calendars, reporting that restricts an account on serious categories — the
Concierge email templates, constrained preset-only pre-date messaging, and 14
clearly-marked fictional demo personas to solve the cold start. Convex
features: actions, HTTP actions, crons, scheduled functions
(`convex/matching.ts`, `convex/dateDrops.ts`, `convex/mail.ts`,
`convex/safety.ts`, `convex/demo.ts`, `convex/crons.ts`, `convex/http.ts`).

### 2026-08-26 - 312bf83
Built the web app: landing page, six-step onboarding, dashboard, DateDrop
invitation and confirmation screens, availability editor, profile, preferences,
notifications, privacy, safety centre and demo controls. The dashboard's
matching progress states map one-to-one onto real `matchingRuns` documents —
nothing animates to look busy. Each DateDrop has a "How we built this" panel
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

The tests found one real bug: withdrawing after accepting left the drop stuck
in `partially_accepted` with nobody committed. Fixed in `convex/dateDrops.ts`.

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

### 2026-08-26 - working tree
Verified integrations against the live production deployment, and recorded
exactly what is and is not proven:

- **Convex — verified.** Signed up, onboarded, added availability, ran the
  matching pipeline, accepted a DateDrop and had it confirm. A second browser
  tab left open on the dashboard moved from "You've got a DateDrop" to "Waiting
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
