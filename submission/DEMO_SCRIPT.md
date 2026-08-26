# DateDrop — 3-minute demo script

Target: under 3 minutes. Talk less, click through the real product.
Live app: https://merry-bass-190.convex.site

Have **two browser windows** open side by side, both signed into the same
account, both on `/dashboard`. Window A is the one you drive. Window B just
sits there — it's the proof that Convex is doing the work.

---

## 0:00 – 0:20 · The inversion

**On screen:** the landing page.

> Every dating app asks you the same question: who do you like? So you swipe
> through hundreds of people, match, text for four days, and then nobody wants
> to be the one who says "so where should we go?"
>
> DateDrop asks a different question. It only asks when you're free.

*Scroll once to the "The whole thing, backwards" comparison. Let it sit for a
beat.*

---

## 0:20 – 0:45 · Availability is the only input

**On screen:** the availability page.

> This is the entire ask. Saturday, six to ten-thirty.

*Add the window. Go to the dashboard.*

> Two evenings open. That's everything DateDrop knows about my plans.

*Click **Find me a date**.*

---

## 0:45 – 1:15 · Real Convex, real work

**On screen:** the progress card advancing.

> Every one of those steps is a real document in Convex updating live —
> nothing here is a spinner on a timer.
>
> First, hard filters in plain TypeScript: age, mutual interest, distance, a
> genuine ninety-minute overlap in our calendars, blocks, safety state. That
> stage is the only thing allowed to exclude anyone.
>
> Then a deterministic score on what we actually share. Then OpenAI ranks the
> shortlist and writes the reason — it never sees a pair that failed the rules,
> and it can't overrule them.

---

## 1:15 – 1:40 · Firecrawl doing real research

**On screen:** the DateDrop lands. Open it.

> Saturday, seven, Seongsu. Coffee, then dessert.
>
> These are real places. Firecrawl searched the live web around the midpoint
> between us, filtered by what we both said we'd enjoy and what we can spend.

*Expand **How we built this**.*

> Here are the actual pages it crawled, the exact quote from each page that
> supports the venue, and every model run behind the plan — model, latency,
> tokens. If we couldn't confirm something from a source, it says so instead
> of making it up.

---

## 1:40 – 2:00 · AgentMail keeps it private

**On screen:** the invitation email from DateDrop Concierge.

> Both of us got this privately, from DateDrop's own inbox on AgentMail. My
> address is the recipient, never the sender, never a CC — and we're mailed
> separately, so neither of us can see the other's address in a header.
>
> Reply to it and it comes back to DateDrop, not to my match.

---

## 2:00 – 2:20 · Both say yes

**On screen:** window A.

> I accept.

*Click **Accept this DateDrop**. Switch to **Demo controls**.*

> DateDrop needs two people, so this deployment seeds clearly-marked fictional
> profiles. Here's the other side of the same drop.

*Click **They accept**.*

---

## 2:20 – 2:35 · It's a date, live

**On screen:** point at window B — untouched this entire time.

> I haven't refreshed that window once.

*Window B flips to **It's a date**.*

> That's Convex. Same documents, both subscriptions, no polling, no socket
> code.

---

## 2:35 – 2:50 · What we never traded

**On screen:** the confirmed DateDrop.

> Venue, public address, time, itinerary, and how to find each other.
>
> What we never exchanged: phone numbers, email addresses, socials, or
> anything more precise than a neighbourhood. If one of us is late, there are
> eight preset lines — and no free-text field, so there's nowhere to slip a
> number and no pressure to.

---

## 2:50 – 3:00 · Close

**On screen:** landing page.

> Dating apps ask you who you like. DateDrop only asks when you're free.
>
> DateDrop — we plan the date, you just say yes.

---

## If you have 20 seconds spare, show the replacement

This is the bit that surprises people. Instead of **They accept**, hit
**They pass**:

> They passed. Notice my evening is still held — DateDrop doesn't cancel on the
> person who said yes. It goes and finds someone else who fits the same plan.
> And if it can't find the right person before the cutoff, it cancels honestly
> rather than forcing a bad match.

## Recording notes

- Use dark mode. It photographs better and the ember accent carries.
- Seoul as the city — that's where the demo personas live.
- Window B must be visibly untouched. Don't click into it before the reveal.
- Don't narrate the architecture. Point at the thing on screen doing it.
