# Submission assets

Drafts only — nothing here has been posted. Post from your own accounts.

---

## Submission description (for vibeapps.dev)

**Datehaja — let your Agent go first.**

The problem with dating apps is not matching. It is the first date. You match,
you text for four days, you meet, and within ten minutes you both know it is
not going to work — and you spent an evening and your phone number finding out.

Datehaja sends someone else. You create one AI Agent that knows the unpolished
version of you: how you actually are in a crowded room, what you need after
one, where your boundaries sit. It is not a matchmaker and not a middleman —
it is you, out there, with a face you design.

When it finds someone worth exploring, the two Agents meet — not in a chat log,
but in a small world drawn around a real place Firecrawl pulled off the live web
that morning. They talk for six turns — as themselves, in the first person.
Nobody is being set up and nobody is bragging about a friend: it is simply two
people meeting. Neither can see the other's private brief.

Then each Agent goes home and writes to its own human, privately, in their own
language. Not a compatibility score — a letter. What it noticed, what it liked,
where it hesitated, and whether it thinks you should meet. The other person
never sees your Agent's letter, and you never see theirs.

Contact opens only after both humans say yes, independently, without knowing
what the other decided. Until then neither of you has the other's email.

**Why this is a Convex app, not an app with a database**

Convex is the whole backend and the whole delivery. Schema and indexes,
queries as live subscriptions so both people watch the date unfold without a
refresh, transactional mutations so a consent can never land half-applied,
actions for every external call, HTTP actions serving both the AgentMail
webhook and the React app itself through `@convex-dev/static-hosting`, crons,
the scheduler as the workflow engine that walks a date through its six turns,
file storage, pagination, and Convex Auth. The app you are looking at is served
from the same convex.site origin as its own webhook.

**The sponsors are load-bearing, not decorative**

- **OpenAI** runs the dates. Each turn is generated for one Agent from only
  that Agent's private brief, and each verdict is written to its own human in
  their own language.
- **Firecrawl** decides where the date happens. It reads the live cultural web
  and the world is drawn around what it found, with the source kept and shown.
- **AgentMail** is what makes the privacy promise real. It carries the
  sign-in code and the debrief letters, and the two people on one date are
  always mailed separately, so neither address ever appears in the other's
  header.

**Seeing it without an account at all**

https://datehaja.com/watch replays a real completed date — the world, the six
turns, and both private letters — with no sign-up. It is served by a query that
will only ever return a date between two seeded personas, so no real person's
conversation can reach it.

If you would rather drive it yourself: sign in, send your Agent scouting, and
you can watch a full date and read the private debrief in about a minute,
alone. The fictional Agents are seeded and labelled as such.

204 tests, plus end-to-end suites that create real accounts, take the sign-in
code from a real inbox, and run a date through to the human decision.

Live: https://datehaja.com (also served from https://merry-bass-190.convex.site)
Watch a date: https://datehaja.com/watch
Code: https://github.com/hyochan/Datehaja

---

## X / Twitter

### Option A — the inversion

> Dating apps make you go on the first date.
>
> Datehaja sends your AI instead.
>
> It meets the other person's AI, they talk in a world built around a real
> place, and yours comes home and tells you honestly whether you should meet.
>
> Neither of you has the other's contact until you both say yes.
>
> Built for @convex All Gas 👇
>
> https://merry-bass-190.convex.site

### Option B — the technical thread opener

> Built Datehaja for the @convex All Gas hackathon.
>
> Two AI second selves go on a date as the people they stand in for, then each
> writes home privately about it.
>
> @OpenAI runs the conversation → @firecrawl picks the real place it happens in
> → @agentmail delivers each private letter separately → @convex serves the
> whole thing, app included, from convex.site.
>
> 🧵

**Thread continuation:**

> 2/ Each Agent only ever sees its own person's brief. The other human's
> answers, and the other Agent's private reasoning, are never in its context.
> The isolation is enforced in the query that builds the prompt, not in the
> prompt itself.

> 3/ Firecrawl isn't a venue database here. It reads the live cultural web that
> morning and the date world is drawn around what it found — a cinema, a
> market, a gallery. The source URL travels with the date and is shown in the
> debrief.

> 4/ AgentMail makes the privacy claim real rather than aspirational. Both
> people on one date are mailed separately from the Agent's own inbox, so
> neither address is ever in the other's header. The same inbox carries the
> sign-in code.

> 5/ Convex is the backend and the delivery. Live queries mean both people
> watch the date unfold with no refresh; the scheduler walks it through six
> turns; a consent is one transaction, so there is no state where one person
> is connected and the other is not. The frontend is served from the same
> convex.site origin as the webhook.

> 6/ Contact opens only when both humans say yes, independently, without
> knowing what the other chose. If one passes, the other is told kindly and
> nobody's address moves.
>
> Live: https://merry-bass-190.convex.site
> Code: https://github.com/hyochan/Datehaja

---

## LinkedIn

> I spent this hackathon on the part of dating nobody enjoys: the first date
> you already know is not going to work.
>
> Datehaja sends an AI Agent in your place. You build one Agent that knows the
> unpolished version of you. It meets another person's Agent in a world drawn
> around a real place, they talk for six turns, and then each Agent writes
> privately to its own human — what it noticed, where it hesitated, and whether
> it thinks you should meet.
>
> Contact opens only after both people say yes, independently. Until then
> neither of you has the other's email.
>
> Built on Convex, which is the entire backend and also serves the app itself.
> OpenAI runs the dates, Firecrawl chooses where they happen from the live web,
> and AgentMail delivers each private letter separately.
>
> https://merry-bass-190.convex.site

---

## Screenshots to capture

Re-capture after the finger-heart brand landed; the older frames show the
previous mark.

1. The landing hero — "Let your Agent go first."
2. The Agent editor with a face being chosen.
3. The date world mid-conversation, both sprites and a speech bubble.
4. The private debrief letter, with the Agent's verdict badge.
5. The sealed decision — one side answered, the other still hidden.
6. The mutual yes and the revealed contact.

## Tagging

@convex @OpenAI @firecrawl @agentmail — the hackathon cohosts and partners.
Use the live convex.site URL, since that is the deployment the submission
names.
