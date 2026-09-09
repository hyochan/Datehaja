# Datehaja product memory

Last updated: 2026-09-09
Experience revision: 2026-09-09 (latest backend and frontend on development adorable-boar-359; production rollout pending)

This file is the durable product decision record for future work. Read it before
changing priorities, billing, launch scope, or deployment.

## Current north star

Datehaja is an 18+ agent-dating product: each person creates one private AI
Agent that is their second self. It learns their preferences and boundaries,
goes on a visible virtual date as them, comes home with a candid private
debrief, and may encourage the humans to meet. Contact is revealed only after
two independent human yeses.

There is no matchmaker and no go-between. Two Agents meet as the two people
they stand in for: they speak in the first person, never describe their humans
in the third person, never say “my friend”, and never name the person they
belong to. Do not reintroduce a separate matchmaker character or a “best
friend setting you up” framing — that was an earlier model and it is gone.

The Agent is a stand-in, not a disguise. It is labelled AI everywhere it
appears and must never claim or imply that it is the human it represents, or
that the reader is talking to that person. Agent simulations can reveal useful
questions and friction; they are not proof of real-world chemistry.

The primary explanation is a simple owner loop: create an Agent and send it
out, let it date autonomously, hear what happened, then talk about what to keep
or change. Voice corrections, preferences about future partners, and positive
reactions all matter. Show how feedback carries into a future encounter; do
not turn the first screen into a backend diagram or a series of approval
tasks. Detailed architecture is optional, collapsed behind this explanation.
Progress is the owner's actual remembered guidance and changed behavior,
never invented experience points or claims of retraining the underlying model.

The Agent is an ongoing relationship, not a one-time onboarding form. It asks
one private, localized question at a time, learns from the answer, and folds the
durable signal into later scouting. An unanswered question blocks further
prompts; answering or skipping schedules the next one a week later. The prompt
rotation is deterministic and free. Only an answer invokes the low-cost
companion model. Answers and distilled memory stay private and never enter
analytics payloads or another Agent’s brief.

What the Agent learns has to be able to reach the matcher, or it is not
learning the owner can feel. The matcher reads structured taste, so a shifted
ideal changes nothing until it lands in `preferences`. It lands there only
through an explicit yes: the Agent proposes the change, states what it would
replace and why, and the owner accepts or declines. Never write an owner’s
stated preferences from a model inference alone — an Agent that quietly
rewrites them is deciding for the person it represents. Proposals are limited
to taste: personality traits, how much they weigh, and relationship intent.
Boundaries — age, distance, location, language, budget, smoking and alcohol —
are the owner’s to set and are never proposed. One proposal is open at a time;
a queue of them turns a conversation into a form.

Every completed Agent date remains discussable with the owner’s Agent. Messages
opened from a private debrief are linked to that Agent date, so the Agent can
explain or be challenged on its own verdict without seeing the other side’s
sealed verdict or decision. The owner’s reactions and corrections update both
private personal memory and compact scouting memory for future candidate
selection. Analytics may record the internal date ID and that a discussion
occurred, never the conversation text.

Every verdict leaves a lesson, not only a pass. A date that went well is the
strongest evidence of what this person actually wants, and learning only from
refusals threw that away — after an encourage the Agent records what worked and
is worth seeking again, after a curious what it still needs to find out, after
a pass what to look for differently. Scouting memory keeps the six most recent
lessons; a repeated lesson moves to the end rather than taking a second slot.
The seeded persona on the other side of a demo date still learns nothing, since
there is no owner there to learn for.

Agent matching boundaries are explicit and mutual. Every real participant must
choose at least one supported search location and one date language before
entering the pool. A pair is eligible only when each person’s country, city and,
when selected, neighborhood boundary includes the other. Different languages
are allowed only when both people opt into Agent-translated dates. These are
practical meeting boundaries, never nationality filters. Missing or one-sided
settings mean no match rather than a speculative fallback.

Relationship needs are also mutual eligibility requirements, never a quality
ranking. Serious seekers meet other declared serious seekers. Casual dating,
friendship, and exploratory connections are equally legitimate; never steer
them toward commitment or reward seriousness. `open` means seeing what develops,
not an assumption of commitment or a label for a non-monogamous relationship.
Casual/open/unsure may explore together; friendship/open may explore together.
Friendship-only and casual-only do not imply each other. Either owner's exact
goal setting restricts eligibility to the same selected goal. Incompatible
declared goals are excluded before an encounter, regardless of shared interests.
Conversation still checks whether the actual expectations fit.

An approved feedback proposal or explicit preferences edit refreshes an existing
search immediately; it never opts someone in or unpauses them. Recheck current
goals when a conversation finishes and before human consent. An outdated,
incompatible introduction closes without inventing a human rejection, and an
active search continues. Existing mutually consented connections remain intact.

The signed-in locale is part of the private profile. Agent notifications,
verdict reasons, debrief email, and mutual-contact email must be rendered in
each recipient’s saved locale independently; one date must never reuse the
initiator’s locale for the other recipient.

Agent emails are short private letters with a visual keepsake. Open with a
greeting and two brief first-person paragraphs, then show the same illustrated
setting as the app and an actual adjacent exchange selected by the owner's
Agent. End with one easy question about the owner's own reaction or preference,
not a request to evaluate the other person's personality. Preserve verified
paragraph breaks. Do not repeat the letter as an atmosphere summary,
spark/friction table, and another transcript. A connection notice opens the
introduction without resending the full debrief. Internal subtext and the
other side's private reflection never enter the owner's email or projection.

Scouting is an ongoing, opt-in background search. Only other real Agents whose
owners have started searching are eligible. Candidate scans paginate through
the chosen cities and honor both owners' boundaries. A pair meets only once;
its actual saved dialogue teaches the next search. If the encounter does not
produce a mutual Agent recommendation, the search continues automatically.
If the available pool is exhausted, show a waiting state and the actual last
check time when the owner visits. Do not invent movement, conversations,
progress numbers, or a match to keep the screen busy.

Only a mutual Agent recommendation creates an introduction and a private
letter. Both humans must still independently consent before contact opens.
A human no resumes the search; a mutual yes stops it. The owner can pause the
search, and stale background callbacks must respect that pause. Failed model
calls preserve the transcript and let the search recover without canned turns.

Demo encounters are an explicitly requested, separate preview with fictional
partners. They never populate the real search or generate debrief emails.
Unmatched encounters and routine search progress stay in the app. All real
introduction delivery still respects the recipient's email preferences.

A simulated date needs something to happen. Six illustrated sets (cinema,
market, bookshop, garden, gallery, café) each offer several small decisions.
The Agents respond to actual invitations and choices using only their own
brief, rather than giving each other compatibility speeches. An initial six-turn
conversation does not force a goodbye. If either Agent is still curious and
has a concrete, safe follow-up question, and neither recommends passing, the
same encounter may continue for four additional turns. This happens at most
once, and never after a participant has chosen to leave. The two Agents then
review the full transcript independently. Private follow-up questions never
enter public or owner projections. Stale initial reviews cannot finish an
extended encounter or overwrite a human decision. The source is
credited as inspiration for a fictional setting, not evidence of a real visit.
New encounters allow up to twelve conversational turns before the initial
review, with one extension to sixteen for a specific unresolved question.
An explicit ending allows one farewell and stops earlier. Existing six/ten-turn
records remain valid.
A shared activity journal is generated from the full public dialogue and
independently checked by Sol before display. It distinguishes performed
virtual activities, discussed topics and unperformed proposals, with source
rounds for every event. A failed audit leaves the complete transcript readable
without an invented journal. Letters link to the private activity record;
cultural inspiration is never the destination of a date-record link.
Date dialogue and private companion learning use gpt-5.6-sol with no silent
economy-model fallback. Long near-verbatim recycled replies and unsupported
owner-fact citations are retried once before failing with the saved transcript
intact. A completed mini-game may give way to ordinary conversation. Private
verdict letters use gpt-5.6-sol with medium reasoning and no cheaper fallback;
the stronger writer must preserve facts while sounding like a candid personal
note, avoiding abstract compatibility language and invented intimacy.
Before a date review can become a letter or scouting lesson, a separate
gpt-5.6-sol request checks every field against chronological speaker evidence.
Up to three drafts may be written, each independently audited, within a shared
three-minute deadline. Repairs retain all earlier corrections. Shared overview
comes from the verified activity journal, not a second retelling in each private
letter. If the
verifier is unavailable or every allowed repair fails, retain the transcript and
continue searching without an introduction or inferred lesson. Verification
and repair never fall back to the economy model ladder; each request is bounded
to 90 seconds. Preserve both owners' isolation in the audit input.
If a turn cannot be generated, retain the saved turns
and report failure instead of substituting canned dialogue.

## Priority now: win the Convex hackathon

Until the hackathon closes, optimize for one convincing, reliable story:

1. A person creates and styles their Agent.
2. The Agent learns whom to seek and what matters privately.
3. The person starts an ongoing search; an explicit fictional demo is separate.
4. Searching Agents meet in a virtual scene, clarify when useful, and learn from it.
5. Unmatched encounters lead to more searching; a promising introduction brings a private letter.
6. Each human decides privately; only two yeses reveal contact.

Agent dates are durable scheduled conversations. Each
turn is written to Convex before the next is scheduled, so either person can
open the world midway, leave, refresh, and return without losing the live state.
Natural pacing is shaped by reading length, conversational depth, Agent voice,
and occasional longer pauses rather than one uniform delay range. Clearly
labelled demo counterparts use the same state machine with compressed waits so
the complete hackathon story can be shown within a few minutes.

Work that improves this loop, its three-minute demo, judge comprehension,
reliability, safety, or sponsor evidence is in scope. Broad growth work,
production monetization, and simultaneous multi-country launch are deferred.

### Hackathon quality bar

- The core loop must work from a fresh account in browser E2E.
- Convex must visibly power realtime state, durable turns, private projections,
  transactional consent, scheduled work, storage, and first-party analytics.
- OpenAI, Firecrawl, and AgentMail must each have an honest, inspectable role.
- Demo people and non-paying access must always be labelled.
- No secret compatibility score, hidden contact leak, or claim that AI predicts
  chemistry.
- Repository stays private until the user decides the competition permits or
  requires publication.
- Production deployment always requires a fresh, explicit confirmation of the
  exact target. Development deployment remains the default.

## Authentication decision

Authentication is passwordless: email OTP is the reliable default, with Google
and Apple OAuth added when their deployment credentials are present. Do not
restore a public password form.

- Email OTP is eight digits, single-use, expires after 10 minutes, and is sent by
  the existing AgentMail inbox.
- Development deployments may use `68686868` only for `hyo+test…@hyo.dev`
  aliases or an explicit email allowlist. The bypass is disabled unless the
  deployment is explicitly marked `ENVIRONMENT=development`.
- Convex Auth stores only the hashed verification code and rate-limits failed
  attempts.
- Verified email identities link to an existing account with the same email, so
  people created under the earlier password prototype keep their data.
- Google and Apple buttons must never be displayed unless that provider is
  actually configured.
- The OAuth callback stays on the Convex HTTP origin and returns to `SITE_URL`.
  This works for browser-installed PWAs. A future native wrapper must use a
  system authentication session and deep-link handoff, not an embedded webview.

## Payment decision: deliberately deferred

Live checkout is locked. `DATEHAJA_DEMO_BILLING=1` is only for a labelled,
non-paying development experience. The application must not collect payment
or card details while merchant approval is pending.

Rejected shortcuts:

- Direct Stripe for the current Korean entity: South Korea is not a supported
  direct Stripe merchant country.
- Lemon Squeezy: its prohibited-products policy includes dating sites.
- Paddle: its prohibited-business policy includes dating services/apps.
- Presenting Datehaja as generic SaaS to bypass review: never misclassify the
  actual matchmaking product.

Do not reintroduce any of these providers merely because an account or API key
is available.

## Post-hackathon payment plan

Execute only after the hackathon and only after written category approval:

1. Apply through PortOne using the real description: an 18+ AI-assisted
   matchmaking service, no adult content, escorting, paid contact sale, or
   guaranteed match.
2. Contract a Korean recurring-payment channel such as Toss Payments for
   Korean cards and KRW.
3. Contract an international recurring-payment channel such as Eximbay or
   Payletter for overseas cards and currencies. PayPal can be a secondary
   overseas option, not a Korean domestic rail.
4. For native apps, use Apple In-App Purchase and Google Play Billing for the
   digital Scout Pass subscription. A service such as RevenueCat may unify
   store entitlements but is not the payment processor.
5. Normalize every approved source into one provider-neutral Convex entitlement
   model with signed, idempotent webhooks. Store entitlement state, never card
   data.
6. Add refunds, cancellation, tax, receipts, chargebacks, renewal notices, and
   reconciliation before enabling the first real charge.

The billing cadence and included scouting count are deliberately undecided.
Do not promise an invented monthly quota such as four expeditions in product
copy or backend access rules before real usage and unit economics exist.

Required inputs before payment implementation:

- approved provider and acquirer names;
- merchant/channel IDs and sandbox credentials;
- approved countries, currencies, billing cadence, and product wording;
- refund/cancellation rules and tax/accounting decision;
- explicit user authorization to enable live checkout.

A US entity through Stripe Atlas is a later option only if overseas traction or
fundraising justifies the tax and compliance overhead. Online dating remains a
Stripe restricted business requiring approval, and incorporation does not
guarantee Stripe Payments approval.

## Post-hackathon growth sequence

Global availability does not mean launching an empty network everywhere.
Expand city by city after proving the loop:

1. Prove activation and completed demo dates with the hackathon audience.
2. Run a small, invite-led Seoul cohort and measure real candidate liquidity.
3. Select the next city from waitlist density, completion, safety, and mutual
   consent data—not intuition alone.
4. Localize trust, safety, age, legal, and payment operations before opening a
   new country.
5. Spend on paid acquisition only after activation, date completion, and early
   retention are healthy enough to estimate payback.

The canonical funnel is:

```text
landing → agent created → first private message → scouting requested
        → agent date completed → debrief viewed → human decision
        → mutual yes/contact reveal → later safety and meet-again feedback
```

Analytics must use internal IDs and structured properties; never copy profile
text, private Agent memory, transcripts, contact details, or precise location
into growth events.

The debrief loop continues after email. Every Agent debrief and mutual
connection email must offer a deep link back to the date-scoped private chat.
There, the person can question or correct their Agent before deciding. A phrase
such as “I want to meet them” may reveal an explicit confirmation card, but it
must never change consent by itself. Only the person's final confirmation
button records a yes; the Agent cannot approve, consent, or send the request on
their behalf. The answer stays sealed until both people independently say yes.

## When priorities may change

Leave hackathon-only mode only when either:

- the hackathon has closed and the submission artifacts are complete; or
- the user explicitly changes the priority.

At that point, revisit this plan against current provider policies and actual
funnel data before implementing billing or entering a new market.

## Experience proof and presentation

The six-person local rehearsal on 2026-09-08 found that the membership CTA
must actually start search and that selected relationship intent must reach
each Agent's own dialogue and review input. A recommendation concerns an
optional first human conversation; material intent must be assessed from what
was actually said. Shared interests do not override a stated intent mismatch.

An explicit ending is durable (`closingAfterRound`): allow one farewell and
review the saved conversation, even before six turns. No extension may reopen
it. Failed reviews preserve the dialogue as a failure, never a fabricated
`curious` verdict. Letters do not require a fixed opening or obligatory final
uncertainty. See `docs/SIX_PERSON_LOCAL_REVIEW.md`; these additional changes
are local-only pending deployment.

The search world is a single illustrated neighbourhood. Only saved real search
encounters produce footprints; selecting one opens its owner's headline and
next-search lesson. Multiple encounters in one venue remain individually
reachable. A speaking animation never invents attraction or growing closeness.

The public replay uses only two seeded fictional profiles, is generated in its
requested language, and shows the actual outcome. Visitors can switch between
fictional private perspectives, with an explicit explanation that real owners
can read only their own. A curious/pass outcome demonstrates continued search;
it is not rewritten to make the demo look successful.

The submission recorder uses two independently authenticated disposable dev
accounts on the actual search path and verifies they share the same encounter.
Email is disabled and searches are paused after recording. Generated outcomes
are preserved. Recording output and marks live in `.scratch/demo` so other
Playwright test runs cannot erase an in-progress film. Public deployment,
video hosting and social posting must be verified separately from local tests.


## 2026-09-09 — Feedback across subsequent dates

- Local-only review: `docs/FEEDBACK_LONGITUDINAL_REVIEW.md`. Six new fictional users, four live-model encounters (23 turns), and a separate 180-day/36-encounter deterministic regression. 265 tests, build and lint pass; these changes are not yet in cloud development or production.
- Keep explicit owner feedback separate from tentative date observations. Only the owner's model receives their cumulative memory and latest three raw human messages. New corrections outrank old inferred observations, while approved structured settings and boundaries remain authoritative.
- Scope every companion write to the source human message and the state it read. Ignore stale/duplicate replies; re-read after concurrent lessons or edits. Do not start a new encounter for either participant while their feedback is being processed. Re-onboarding must preserve learned memory.
- New feedback or explicit brief/taste edits supersede outdated proposals. Acceptance remains the only path from a proposed taste change to matching settings. Carry accepted/declined decisions into subsequent companion context.
- Live feedback found that a cheap companion model confused its own positive verdict with the owner's negative reaction. Use Luna first for learning, put the owner's latest words last, and ground proposal reasons in those words. Preserve failed samples in QA evidence.
- Do not invent biographical habits to make a date feel personal. Ask for private source evidence for autobiographical claims, verify the cited source, and retry once before saving an unsupported turn. This reduces fabrication; it is not a guarantee of semantic correctness. Include all ten moments when discussing an extended date.
- Long-term claims must distinguish a simulated clock/fixture model test from actual months of human use. Never claim that a regression suite proves real-world chemistry or long-term satisfaction.

## 2026-09-09 — Mutual relationship needs

- User clarification: serious people should meet serious people; people seeking other kinds of connection may freely meet people whose needs fit. No goal is superior. See `docs/RELATIONSHIP_GOALS_REVIEW.md` for the explicit eligibility matrix and local evidence.
- Six fresh fictional participants with identical interest tags formed serious/serious, casual/casual, and friendship/friendship pairs through normal authenticated search. Prior fixtures remain preserved and paused outside this cohort.
- Live review found mistaken speaker attribution and formulaic surprise at the fifth turn. Remove forced surprise, check who made each choice, and correct mistaken premises instead of agreeing with them. Agreed fictional actions should happen rather than repeat as promises. Letters describe moments without round numbers or evaluation jargon.
- Preserve flawed transcripts alongside reruns. Passing an eligibility test or obtaining two positive Agent verdicts is not evidence that every generated conversation is convincing.
- The earlier re-review still treated a falsely attributed film choice as evidence. The subsequent fix adds an independent audit and bounded repair, documented in `docs/LETTER_GROUNDING_REVIEW.md`. Its original bad letter and four other error cases are now rejected while supported casual/friendship control letters pass. Historical failed samples remain intact; passing this regression is not a claim about every possible future generation.

### Per-line voice coaching (2026-09-09)

Owners can refine their own agent's voice or react to the other participant
under a saved transcript line. These are separate private learning signals;
coaching never edits historical dialogue, the other person's agent, or human
consent. Keep accumulated voice corrections when learning partner preferences.
Do not force a relationship-intent question at a fixed turn or override an
owner's preferred speech register. The fictional public coaching preview shows
an independently generated new conversation, not a rewritten past encounter.
See `docs/AGENT_COACHING_REVIEW.md` for finite test evidence and quality limits.
The coaching pass upgrades the development backend as well as its frontend;
production remains unchanged.

### Core learning proof (2026-09-09)

The public coaching preview now preserves a single fictional owner's four
authenticated scheduled encounters (56 lines), three saved coaching/reply pairs,
and the same cumulative memory. Two historical reviews were withheld; the
subsequent encounter passed after the review contract was narrowed. Do not
hide failures, overwrite old turns, claim shorter replies from unchanged mean
length, or treat this rehearsal as real-user satisfaction evidence.
See `docs/LEARNING_PROOF_REVIEW.md` and `submission/LEARNING_DEMO.md`.
A 54-second browser walkthrough accompanies the public comparison.

### Recovery of withheld notes (2026-09-09)

Withholding an inaccurate letter is necessary but does not resolve the owner's
missing review. Correct only the rejected fields and dependent claims, then
independently check the merged letter. Distinguish an expressed opinion from
initiating a choice, and a one-cup reaction from a general taste.

Owners can request a bounded review retry for a complete failed encounter.
A recovered historical record preserves the exact dialogue, coaching, memory,
search state and human consent. It does not retroactively create an introduction
or email. Mark recovered notes explicitly. Preserve a verified activity journal
during a letter retry; a missing journal can be recovered separately without
regenerating verified letters. See `docs/REVIEW_RECOVERY.md` for the two original
failure cases, an initially missed negative control, and final verification.
