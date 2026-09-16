# Growth log

Recurring review of the real activation funnel. Numbers come verbatim from
`growth:funnelSnapshot`; nothing here is estimated.

The activation funnel, in order:

```
agent_landing_viewed → agent_created → agent_message_sent
  → agent_date_requested → agent_date_completed
  → connection_consent_yes / connection_consent_no
  → contact_revealed (or demo_connection_completed)
```

---

## 2026-09-17 — production, first traffic that is not ours

Read from **production** (`merry-bass-190`), read-only. Two windows: all-time
(`sinceMs: 0`) and the last seven days.

### Funnel (uniqueActors)

| Stage | All-time | Last 7d |
| --- | ---: | ---: |
| agent_landing_viewed | 59 | 35 |
| agent_onboarding_started | 2 | 1 |
| agent_created | 4 | 3 |
| agent_message_sent | 2 | 2 |
| agent_date_requested | 6 | 5 |
| agent_date_completed | 5 | 4 |
| agent_date_failed | 1 | 1 |
| connection_consent_yes | 1 | 1 |
| connection_consent_no | 0 | 0 |
| demo_connection_completed | 1 | 1 |
| contact_revealed | 0 | 0 |
| scout_pass_viewed | 1 | 0 |
| scout_pass_active_viewed | 3 | 3 |
| scout_checkout_started | 0 | 0 |

No stage was `truncated`, so these are exact counts, not lower bounds.

Landing sources, all-time: `(direct)` 45, `watch` 26.
Landing locales, all-time: `en-US` 35, `(unknown)` 26, `ko-KR` 7, `de-DE` 2,
`sv-SE` 1.

Most of the history is recent: 35 of 59 landings and 3 of 4 agents fall in the
last seven days.

### The stage-to-stage rate at the top is not computable

`agent_onboarding_started` (2) is **lower** than `agent_created` (4). A step
cannot have fewer people than the step after it, so the top of this funnel is
not measuring what it looks like it measures.

`uniqueActors` is `row.userId ?? row.anonymousId ?? row._id`
(`convex/growth.ts:132`). `agent_landing_viewed` and
`agent_onboarding_started` are client-side and carry `anonymousId`
(`src/pages/AgentOnboardingPage.tsx:182`). `agent_created` is written
server-side and carries `userId` (`convex/agents.ts:688`). The two sides of the
landing-to-created step therefore count different identifiers for the same
person, and dividing one by the other is not a conversion rate.

`agent_onboarding_started` is additionally gated on
`firstTimeThisSession("datehaja-onboarding-start")`, so a person who returns in
a new browser session is counted again while the server-side event is not.

So the honest statement is: **59 people reached the landing page and 4 agents
exist.** Where the other 55 stopped — on the landing page, or part-way through
the brief — is not currently knowable from this data.

### What the data does support

Once someone has an agent, the product delivers. Four agents produced six date
requests and five completed dates: more dates than agents, which means repeat
use, not one-and-done. One date failed. One person said yes at the human gate
and got a demo connection.

`contact_revealed` is 0, which is expected: the counterpart in these runs is a
demo persona, so the path ends at `demo_connection_completed` by design.

`scout_checkout_started` is 0 against `scout_pass_active_viewed` 3. Billing is
intentionally locked (`convex/billing.ts`, `DATEHAJA_OPEN_TRIAL=1`), so the pass
reads DEMO and there is nothing to start. Not a signal either way.

`watch` is 26 of 71 landing events — the showcase is roughly half the traffic —
but `agent_created` carries no source, so whether watch visitors go on to build
an agent is also unknown.

Caveat on size: with four agents total, some of which are very likely the
owner's own accounts, none of the downstream rates are load-bearing. This entry
is a baseline to compare against, not a result.

### Proposed experiments

1. **Make the top of the funnel one population.** Stamp the client's
   `anonymousVisitorId()` onto `agent_created` alongside `userId`, or emit a
   client-side mirror of it, so landing → onboarding → created share an
   identifier. Metric that should move: `agent_onboarding_started` becomes ≥
   `agent_created`. Verify by re-running the snapshot and checking the ordering
   holds. Nothing else on this list is trustworthy until this is done.

2. **Carry the landing source through to creation.** `agent_created` records
   `city` and `locale` but not `source`. Adding it answers whether `/watch`
   — half of all traffic — produces agents or only spectators. Metric:
   created-by-source. Verify against `landingSources` in the same window.

3. **Measure abandonment inside the brief, not just at its ends.** The brief is
   three steps and thirteen required fields before anything happens
   (`src/pages/AgentOnboardingPage.tsx`). One event per completed step would
   show which step loses people. Metric: per-step counts. Only worth doing
   after (1), and it must stay privacy-minimal — step numbers only, never field
   contents, per the rules in `convex/growth.ts`.

No changes were made in this review.

---

## 2026-09-04 (second) — production, after /watch shipped

Read from production (`merry-bass-190`), read-only. All-time and the seven-day
window are still identical.

| stage | unique actors | previous review |
| --- | --- | --- |
| agent_landing_viewed | 12 | 7 |
| agent_created | 0 | 0 |
| agent_message_sent | 0 | 0 |
| agent_date_requested | 1 | 0 |
| agent_date_completed | 1 | 0 |
| connection_consent_yes | 0 | 0 |
| contact_revealed | 0 | 0 |
| demo_connection_completed | 0 | 0 |

- **Sources:** `(direct)` 10, `watch` 3
- **Locales:** `en-US` 7, `ko-KR` 3, `(unknown)` 3
- Monetisation intent remains zero across all three Scout Pass events. Live
  billing is locked on purpose, so this still carries no signal.

**The two non-zero movements are both ours.** The single
`agent_date_requested` / `agent_date_completed` pair is the seeded showcase
date created by `showcase:ensure` to fill `/watch`; no visitor requested it.
And the rise from 7 to 12 landing views is this session's own verification —
the `watch` source is three headless screenshot runs against `/watch`, and
several of the `(direct)` views are the same for the front page.

**So the honest reading is that external traffic is still approximately zero,
and the funnel cannot yet be diagnosed.** Landing → created is nominally a
100% drop for the second review running, but twelve visits, most of them
ours, cannot distinguish a landing page that fails from a product nobody has
been told about. The repository is still private, the demo video still shows
the deleted concierge product, and no social post has gone out.

### Decisions

1. **Stop counting our own visits.** Suppress `agent_landing_viewed` when the
   page is driven by an automated browser (`navigator.webdriver`). No personal
   data is involved and it is a few lines in `LandingPage.tsx` and
   `WatchPage.tsx`. Verify by running the screenshot scripts and confirming
   the count does not move. Until this lands, every number above is
   contaminated by our own tooling.

2. **Locate the drop before trying to fix it.** `agent_created` fires only at
   the end of a thirteen-field onboarding, so a zero cannot distinguish
   "nobody pressed the CTA" from "everybody abandoned the form". Add an
   `agent_onboarding_started` event — event name only, no profile content —
   and the next review can say which. This is the prerequisite for any hero or
   onboarding experiment being worth running.

3. **Distribution is the actual blocker, and it is not a code change.** Three
   things gate every visitor: the repository is private, `Datehaja-demo.mp4`
   still shows a product that no longer exists, and the rewritten social copy
   has never been posted. Point the post at `/watch` rather than the front
   page, so the first thing a stranger sees is a finished date rather than a
   sign-up. Verify by the appearance of any `landingSources` key that is
   neither `(direct)` nor `watch`.

Not implemented in this review; measurement and proposals only.

---

## 2026-09-04 — production, all-time and last 7 days

Read from production (`merry-bass-190`). All-time and the seven-day window are
identical, so every visit the product has ever had arrived in the last week.

| stage | unique actors (all-time) | last 7d |
| --- | --- | --- |
| agent_landing_viewed | 7 | 7 |
| agent_created | 0 | 0 |
| agent_message_sent | 0 | 0 |
| agent_date_requested | 0 | 0 |
| agent_date_completed | 0 | 0 |
| connection_consent_yes | 0 | 0 |
| connection_consent_no | 0 | 0 |
| contact_revealed | 0 | 0 |
| demo_connection_completed | 0 | 0 |

Monetisation intent is zero across `scout_pass_viewed`,
`scout_pass_active_viewed` and `scout_checkout_started`. Live billing is
locked on purpose, so this is expected and carries no signal.

- **Locales:** `en-US` 6, `ko-KR` 1
- **Sources:** `(direct)` 7 — every single visit

### Diagnosis

This is not a conversion problem and it would be a mistake to treat it as one.
The landing → created step reads as a 100% drop-off, but the denominator is
seven visits that are all direct and all from the last week, which means they
are the people building the product. Rewriting hero copy against that number
would be optimising noise.

The real finding is that **there is no acquisition channel at all**. Every
visit is `(direct)`. The landing page already reads `utm_source` and
`utm_campaign` and stores them with the view, so attribution works — it has
simply never been given anything to attribute. Nothing has been posted, and no
link with a campaign tag has ever been handed to anyone.

Until a tagged link brings in strangers, every stage below the first is
undefined rather than bad. The first honest measurement of the funnel cannot
happen before that.

### Decisions

1. Treat first traffic, not conversion, as the entire growth job this week.
2. Every link that leaves the project carries `utm_source` and `utm_campaign`,
   so the next review can compare channels rather than staring at `(direct)`.
3. Re-read the funnel once at least thirty strangers have viewed the landing
   page. Only then does the landing → created rate mean anything.

### Experiments proposed

**E1 — give the funnel a source to measure.** Post the rewritten submission
copy in `submission/SOCIAL.md` from the project accounts, each link tagged
(`?utm_source=x&utm_campaign=allgas`, `linkedin`, `hn`). Metric: `landingSources`
stops being 100% `(direct)`. Verify in the next snapshot. This is also a
hackathon judging criterion, so the growth work and the submission work are the
same work right now.

**E2 — make the demo reachable without a signup wall.** A stranger who arrives
today has to create an account before seeing a single agent date, and the
product's whole argument is what the date feels like. Measure how many landing
viewers reach `agent_created`; if E1 brings traffic and this stage still reads
near zero, the wall is the cause rather than the copy. The seeded fictional
agents already make a solo walkthrough possible, so the change is where the
wall sits, not new machinery.

**E3 — one cohort, one evening.** `submission/GROWTH_PLAN.md` argues density
beats reach: a handful of compatible people choosing the same few evenings in
one city. Invite one trusted cohort with a tagged link and watch whether
`agent_date_requested` and `connection_consent_yes` appear at all. That is the
first real test of the product loop with people who are not us.

No changes were implemented in this review.
