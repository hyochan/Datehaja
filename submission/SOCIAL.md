# Submission assets

Drafts only — nothing here has been posted. Post from your own accounts.

---

## Submission description (for vibeapps.dev)

**DateDrop — We plan the date. You just say yes.**

Dating apps are extraordinarily good at generating matches and extraordinarily
bad at generating dates. You swipe, you match, you text for four days, and then
nobody wants to be the one who asks "so where should we go?" — and to get that
far you handed your phone number to a stranger.

DateDrop inverts it. It never asks who you like. It asks when you're free.

Then it runs hard compatibility filters in plain TypeScript, scores the
survivors deterministically, has OpenAI rank the shortlist and explain the
pairing, sends Firecrawl to research real venues on the live web around the
midpoint between you, composes a specific date from what it found, and has
DateDrop Concierge invite you both privately by email from its own AgentMail
inbox. You each accept or pass. When both say yes, both screens say *It's a
date* — live, no refresh.

If one person passes, the other's evening stays held while DateDrop looks for
someone else who fits the same plan. If nobody suitable turns up before the
cutoff, it cancels honestly rather than forcing a poor match.

You can complete an entire date without your match ever having your email, your
number, or anything more precise than your neighbourhood.

Convex is the whole backend: schema and indexes, queries as live subscriptions,
transactional mutations, actions for every external call, HTTP actions serving
both the AgentMail webhook and the React app itself via
`@convex-dev/static-hosting`, crons for the 24-hour cutoff, and the scheduler as
the workflow engine. Every DateDrop carries its own provenance — the pages
Firecrawl crawled, the quote from each, and every model run — visible in the app.

187 tests. Seeded with 14 clearly-marked fictional personas so a judge can see
the whole loop in 60 seconds without recruiting a second human.

Live: https://merry-bass-190.convex.site
Code: https://github.com/hyochan/datedrop

---

## X / Twitter

### Option A — the inversion

> Dating apps ask you who you like.
>
> DateDrop only asks when you're free.
>
> Then it researches a real date at a real place, finds someone compatible, and
> privately invites you both. No swiping. No four-day text thread. No
> exchanging numbers.
>
> Built for @convex All Gas 👇
>
> https://merry-bass-190.convex.site

### Option B — the technical thread opener

> Built DateDrop for the @convex All Gas hackathon.
>
> It's a dating app where the only input is your availability.
>
> Hard filters in TypeScript → @OpenAI ranks + explains → @firecrawl_dev
> researches real venues live → @agentmailto invites both people privately →
> both screens say "It's a date" with no refresh.
>
> 🧵

**Thread continuation:**

> 2/ The model never filters. Age, distance, mutual interest, real availability
> overlap, blocks, safety state — all plain TypeScript. A pair that fails those
> rules is never shown to the model, and no model score can resurrect it.

> 3/ Firecrawl isn't a restaurant database here. It searches the live web
> around the midpoint between two people, filtered by what they both said
> they'd enjoy. Every venue keeps its source URL and a verbatim quote from the
> page. You can open any DateDrop and read them.

> 4/ AgentMail is what makes the privacy promise real instead of aspirational.
> Every email comes from DateDrop's own Concierge inbox. Two people on the same
> date are always mailed separately, so neither can see the other's address in
> a header.

> 5/ Convex is the entire backend — including serving the frontend, from the
> same convex.site origin as the webhook. Accepting a date reads both
> participants, derives the next state, patches the drop, books two calendars
> and writes an audit event, atomically. There's no state where one person is
> confirmed and the other isn't.

> 6/ And if your match passes, DateDrop doesn't cancel on you. Your evening
> stays held while it looks for someone else who fits the same plan.
>
> Live: https://merry-bass-190.convex.site
> Code: https://github.com/hyochan/datedrop

---

## LinkedIn

> **We plan the date. You just say yes.**
>
> I built DateDrop for the Convex All Gas Hackathon, and the idea started with
> something that has always bothered me about dating apps: they're excellent at
> producing matches and terrible at producing dates.
>
> You browse hundreds of profiles. You swipe. You match. Then you spend four
> days on a text conversation whose only purpose is deciding whether to have one
> drink — and most of those conversations quietly die. The ones that survive
> stall on the question nobody wants to ask first: so where should we go?
>
> And to get that far, you handed your phone number to someone you've never met.
>
> DateDrop inverts the whole thing. It never asks who you like. It asks when
> you're free.
>
> From there: hard compatibility filters run in plain TypeScript. OpenAI ranks
> what survives and explains the pairing in language you could show either
> person. Firecrawl researches real venues on the live web around the midpoint
> between you, filtered by what you both said you'd enjoy and what you can
> spend. The plan is composed from what it actually found — with the source
> page and a verbatim quote attached to every venue, visible in the app.
>
> Then DateDrop Concierge invites you both privately, from its own inbox on
> AgentMail. You each accept or pass. When both say yes, both screens say "It's
> a date" — live, no refresh, because Convex queries are subscriptions.
>
> Two details I'm most pleased with:
>
> If one person passes, DateDrop doesn't cancel on the person who said yes. It
> keeps their evening held and looks for someone else who fits the same plan.
> And if it can't find the right person before the cutoff, it cancels honestly
> rather than forcing a poor match.
>
> And you can complete an entire date without your match ever having your email
> address, your phone number, or anything more precise than your neighbourhood.
>
> Convex is the whole backend — database, transactional mutations, actions for
> every external call, the scheduler as the workflow engine, crons for the
> cutoff, and the HTTP router serving both the AgentMail webhook and the React
> app itself.
>
> Live: https://merry-bass-190.convex.site
> Code: https://github.com/hyochan/datedrop
>
> #Convex #OpenAI #Firecrawl #AgentMail #buildinpublic

---

## Screenshots to capture

1. **Landing hero** — dark mode, the headline and the three "no" items.
2. **The comparison** — "The whole thing, backwards", both columns visible.
3. **Availability** — one window added, showing "Times are local to Seoul".
4. **Matching progress** — mid-run, with two steps ticked.
5. **A DateDrop invitation** — plan, cost, match preview, Accept/Pass.
6. **"How we built this" expanded** — the crawled source URLs and the verbatim
   evidence quotes. This is the most convincing single screenshot in the app.
7. **It's a date** — the confirmed banner with the itinerary and address.
8. **Two windows side by side** — one just accepted, the other flipping to
   confirmed on its own.
9. **Privacy page** — the user's own real preview, plus the "never shared" list.
10. **Demo controls** — the persona list and the They accept / They pass buttons.

## Tagging

Where submission rules require sponsor tags: **@convex · @OpenAI · @firecrawl ·
@agentmail**. Check the current handles before posting — the ones above are the
commonly used forms, not verified account names.
