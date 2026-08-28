# Submission assets

Drafts only — nothing here has been posted. Post from your own accounts.

---

## Submission description (for vibeapps.dev)

**Datehaja — Pick a night. Let's make it a date.**

Dating apps are extraordinarily good at generating matches and extraordinarily
bad at generating dates. You swipe, you match, you text for four days, and then
nobody wants to be the one who asks "so where should we go?" — and to get that
far you handed your phone number to a stranger.

Datehaja inverts it. It never asks who you like. It asks when you're free.

Then it runs hard compatibility filters in plain TypeScript, scores the
survivors deterministically, has OpenAI rank the shortlist and explain the
pairing, sends Firecrawl to research real venues on the live web around the
midpoint between you, composes a specific date from what it found, and has
Datehaja Concierge invite you both privately by email from its own AgentMail
inbox. You each accept or pass. When both say yes, both screens say _It's a
date_ — live, no refresh.

If one person passes, the other's evening stays held while Datehaja looks for
someone else who fits the same plan. If nobody suitable turns up before the
cutoff, it cancels honestly rather than forcing a poor match.

You can complete an entire date without your match ever having your email, your
number, or anything more precise than your neighbourhood.

The same private plan can reserve, finalize, or cancel one calendar event; a
trusted contact can receive only the public meeting details; and each person can
leave an optional private safety check-in after the date.

Convex is the whole backend: schema and indexes, queries as live subscriptions,
transactional mutations, actions for every external call, HTTP actions serving
both the AgentMail webhook and the React app itself via
`@convex-dev/static-hosting`, crons for the 24-hour cutoff, and the scheduler as
the workflow engine. Every date plan carries its own provenance — the pages
Firecrawl crawled, the quote from each, and every model run — visible in the app.

199 tests. Seeded with 14 clearly-marked fictional personas so a judge can see
the whole loop in 60 seconds without recruiting a second human.

Live: https://datehaja.com
Code: https://github.com/hyochan/Datehaja

---

## X / Twitter

### Option A — the inversion

> Dating apps ask you who you like.
>
> Datehaja only asks when you're free.
>
> Then it researches a real date at a real place, finds someone compatible, and
> privately invites you both. No swiping. No four-day text thread. No
> exchanging numbers.
>
> Built for @convex All Gas 👇
>
> https://datehaja.com

### Option B — the technical thread opener

> Built Datehaja for the @convex All Gas hackathon.
>
> It's a dating app where the only input is your availability.
>
> Hard filters in TypeScript → @OpenAI ranks + explains → @firecrawl
> researches real venues live → @agentmail invites both people privately →
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
> page. You can open any date plan and read them.

> 4/ AgentMail is what makes the privacy promise real instead of aspirational.
> Every email comes from Datehaja's own Concierge inbox. Two people on the same
> date are always mailed separately, so neither can see the other's address in
> a header.

> 5/ Convex is the entire backend — including serving the frontend, from the
> same convex.site origin as the webhook. Accepting a date reads both
> participants, derives the next state, patches the drop, books two calendars
> and writes an audit event, atomically. There's no state where one person is
> confirmed and the other isn't.

> 6/ And if your match passes, Datehaja doesn't cancel on you. Your evening
> stays held while it looks for someone else who fits the same plan.
>
> Live: https://datehaja.com
> Code: https://github.com/hyochan/Datehaja

---

## LinkedIn

> **Pick a night. Let's make it a date.**
>
> Dating apps are good at creating matches and bad at creating dates.
>
> Datehaja asks for one free evening. Then it:
>
> - finds someone compatible who is actually free
> - researches a real public venue with Firecrawl
> - uses OpenAI to compose a plan from that evidence
> - sends two separate private invitations through AgentMail
> - updates both screens live through Convex when they say yes
>
> One acceptance reserves the evening. Two finalize the calendar event. If the
> other person passes, Datehaja keeps looking instead of cancelling on the
> person who said yes.
>
> No swiping. No chat audition. No exchange of phone numbers or email addresses.
> Afterward, each person can leave a private safety check-in that the other
> person never sees.
>
> Built for the Convex All Gas Hackathon with @Convex, @OpenAI, Firecrawl, and
> AgentMail.
>
> Live: https://datehaja.com
> Code: https://github.com/hyochan/Datehaja
>
> #Convex #OpenAI #Firecrawl #AgentMail #BuildInPublic

---

## Screenshots to capture

1. **Landing hero** — dark mode, the headline and the availability docket.
2. **Connected concierge flow** — both availability slips, research, two
   private replies, and the final date ticket visible in one sequence.
3. **Availability** — one window added, showing "Times are local to Seoul".
4. **Matching progress** — mid-run, with two steps ticked.
5. **A private date invitation** — plan, cost, match preview, Accept/Pass.
6. **"How we built this" expanded** — the crawled source URLs and the verbatim
   evidence quotes. This is the most convincing single screenshot in the app.
7. **It's a date** — the confirmed banner with the itinerary and address.
8. **Two windows side by side** — one just accepted, the other flipping to
   confirmed on its own.
9. **Privacy page** — the user's own real preview, plus the "never shared" list.
10. **Demo controls** — the persona list and the They accept / They pass buttons.

## Tagging

Verified 2026-08-28 against the sponsors' current official profiles:
**[@convex](https://x.com/convex) · [@OpenAI](https://x.com/OpenAI) ·
[@firecrawl](https://x.com/firecrawl) ·
[@agentmail](https://x.com/agentmail)**.
