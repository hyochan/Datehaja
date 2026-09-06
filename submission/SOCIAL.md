# Submission assets

**Status: nothing here has been posted yet.** Update this line when it goes out.

Everything below is copy to post from your own accounts. The submission form is
at https://vibeapps.dev/judging/convex-all-gas-hackathon-openai/submit.

Two conventions hold across every link that leaves this project:

- **Lead with `/watch`, not the front page.** A stranger's first screen should
  be a finished agent date, not a sign-up form. The front page is where they go
  after they already want one.
- **Tag every outbound link**, so the funnel can tell channels apart instead of
  reading `(direct)`: `?utm_source=x|linkedin|hn&utm_campaign=allgas`.

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

The scheduler is the part worth pausing on. A date is not a six-call animation
held open by one request: each turn is written to Convex before the next is
scheduled, so either person can close the tab mid-date, come back, and find it
still running.

**The sponsors are load-bearing, not decorative**

- **OpenAI** runs the dates. Each turn is generated for one Agent from only
  that Agent's private brief, and each verdict is written to its own human in
  their own language. The isolation is enforced in the query that builds the
  prompt, not in the prompt itself.
- **Firecrawl** decides where the date happens. It reads the live cultural web
  and the world is drawn around what it found — a cinema, a market, a gallery
  — with the source kept and shown in the debrief.
- **AgentMail** is what makes the privacy promise real. It carries the
  sign-in code and the two private letters, and the two people on one date are
  always mailed separately, so neither address ever appears in the other's
  header.

**Seeing it without an account at all**

https://merry-bass-190.convex.site/watch replays a real completed date — the
world, the six turns, and both private letters — with no sign-up. It is served
by a query that will only ever return a date between two seeded personas, so no
real person's conversation can reach it.

If you would rather drive it yourself: sign in, send your Agent scouting, and
you can watch a full date and read the private letter in about a minute, alone.
The fictional Agents are seeded and labelled as such.

Over two hundred unit and Convex tests, plus end-to-end suites that create real
accounts, take the sign-in code from a real inbox, and run a date through to the
human decision. The demo film is recorded by one of those suites against the
running product, so it cannot quietly describe an app that no longer exists.

Live: https://merry-bass-190.convex.site
Watch a date: https://merry-bass-190.convex.site/watch
Code: https://github.com/hyochan/Datehaja

---

## X / Twitter

### Option A — the inversion

> Dating apps make you go on the first date.
>
> Datehaja sends your AI instead.
>
> It meets the other person's AI, they talk in a world built around a real
> place, and yours comes home and writes you a letter about whether you should
> meet.
>
> Neither of you has the other's contact until you both say yes.
>
> Watch one, no account needed 👇
>
> https://merry-bass-190.convex.site/watch?utm_source=x&utm_campaign=allgas

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
> watch the date unfold with no refresh. The scheduler is the workflow engine:
> each turn is written before the next is scheduled, so you can close the tab
> mid-date and come back to it still running. A consent is one transaction, so
> there is no state where one person is connected and the other is not. The
> frontend is served from the same convex.site origin as the webhook.

> 6/ Contact opens only when both humans say yes, independently, without
> knowing what the other chose. If one passes, the other is told kindly and
> nobody's address moves.
>
> Watch a real one: https://merry-bass-190.convex.site/watch?utm_source=x&utm_campaign=allgas
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
> it thinks you should meet. A letter, not a compatibility score.
>
> Contact opens only after both people say yes, independently. Until then
> neither of you has the other's email.
>
> Built on Convex, which is the entire backend and also serves the app itself.
> OpenAI runs the dates, Firecrawl chooses where they happen from the live web,
> and AgentMail delivers each private letter separately.
>
> You can watch a real agent date without an account:
> https://merry-bass-190.convex.site/watch?utm_source=linkedin&utm_campaign=allgas

---

## Screenshots to capture

Capture these from the current build — the earlier frames predate the
finger-heart mark and the letter rewrite.

1. The landing hero — "Let your Agent go first."
2. The Agent editor with a face being chosen.
3. The date world mid-conversation, both sprites and a speech bubble.
4. The private letter, with the Agent's verdict badge.
5. The sealed decision — one side answered, the other still hidden.
6. The mutual yes and the revealed contact.

## Tagging

@convex @OpenAI @firecrawl @agentmail — the hackathon cohosts and partners.
Use the live convex.site URL, since that is the deployment the submission
names, and point the link at `/watch` unless the post is specifically about
signing up.
