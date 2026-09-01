# Datehaja product memory

Last updated: 2026-09-01

This file is the durable product decision record for future work. Read it before
changing priorities, billing, launch scope, or deployment.

## Current north star

Datehaja is an 18+ agent-dating product: each person creates one private AI
Agent that learns their preferences and boundaries, meets another person’s
Agent in a visible virtual date, returns a candid private debrief, and may
encourage the humans to meet. Contact is revealed only after two independent
human yeses.

The Agent is the user’s matchmaker and embodied representative. Do not add a
second “matchmaker character” or imply that the Agent is literally the human.
Agent simulations can reveal useful questions and friction; they are not proof
of real-world chemistry.

The Agent is an ongoing relationship, not a one-time onboarding form. It asks
one private, localized question at a time, learns from the answer, and folds the
durable signal into later scouting. An unanswered question blocks further
prompts; answering or skipping schedules the next one a week later. The prompt
rotation is deterministic and free. Only an answer invokes the low-cost
companion model. Answers and distilled memory stay private and never enter
analytics payloads or another Agent’s brief.

Every completed Agent date remains discussable with the owner’s Agent. Messages
opened from a private debrief are linked to that Agent date, so the Agent can
explain or be challenged on its own verdict without seeing the other side’s
sealed verdict or decision. The owner’s reactions and corrections update both
private personal memory and compact scouting memory for future candidate
selection. Analytics may record the internal date ID and that a discussion
occurred, never the conversation text.

## Priority now: win the Convex hackathon

Until the hackathon closes, optimize for one convincing, reliable story:

1. A person creates and styles their Agent.
2. The Agent learns whom to seek and what matters privately.
3. The person sends the Agent scouting with the labelled demo pass.
4. Two Agents complete a six-moment virtual date in real time.
5. Each Agent returns a separate, candid debrief.
6. Each human decides privately; only two yeses reveal contact.

Agent dates are durable scheduled conversations, not a six-call animation. Each
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

## When priorities may change

Leave hackathon-only mode only when either:

- the hackathon has closed and the submission artifacts are complete; or
- the user explicitly changes the priority.

At that point, revisit this plan against current provider policies and actual
funnel data before implementing billing or entering a new market.
