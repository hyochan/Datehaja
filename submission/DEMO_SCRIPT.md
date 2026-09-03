# Datehaja — 3-minute demo script

The existing cut, `submission/Datehaja-demo.mp4` (2:39), records the concierge
product that this repository no longer contains: availability windows,
deterministic venue matching, calendar bookings, trusted-contact sharing and
post-date feedback were all removed when the product became agent-only. It
also predates the finger-heart brand. **It must be re-recorded before
submission**; shipping it would show judges an app that does not exist.

Live app for the recording: https://merry-bass-190.convex.site — this is the
deployment the submission names, and it is served by Convex itself.

## Before recording

- Confirm `main` is deployed to convex.site and the finger-heart mark is on the
  landing page.
- English (US), dark mode.
- Sign in with an address that can receive mail; the code arrives from
  AgentMail. Do not use a `.test` address.
- Keep the sign-in email open in a second tab — the debrief letter arrives in
  the same inbox and is worth showing.
- One browser window is enough. The seeded fictional Agents mean the whole loop
  runs without a second human.

## The story, in the order it should be told

Lead with the human problem, not the machinery. A judge should understand what
this is for in the first fifteen seconds, and only then see how it is built.

**0:00–0:20 — the problem**

Landing hero: *Let your Agent go first.* Say the thing plainly: the worst part
of dating apps is the first date you already know will not work, and you spend
an evening and your phone number finding that out.

**0:20–0:50 — build the Agent**

Create the Agent. Give it a face — palette, expression, the woman or man base.
Say what it is: your second self, the one who goes instead of you. Fill the
brief in the unpolished voice the product asks for. Land on: it knows how you
actually are, not how you present.

**0:50–1:35 — the date**

Send it scouting. The world appears, drawn around a real place Firecrawl pulled
off the live cultural web that morning — name the source on screen. Both
Agents walk in and talk. Let two or three turns play. Say the important thing
out loud: each Agent only ever sees its own person's brief, and each speaks in
the first person as that person. No matchmaker, no go-between.

Do not narrate the counter. The transcript moves to the debrief as the sixth
turn lands.

**1:35–2:15 — the letter**

The private debrief. This is the emotional centre of the product and should get
the most screen time. Read a line of the Agent's letter aloud. Point out that
it is a letter, not a score, and that the other person will never see it. Cut
to the same letter arriving by email from the Agent's own AgentMail inbox.

**2:15–2:45 — the sealed decision**

Answer yes. Show that the other side is still hidden — you decided without
knowing what they chose. Then the mutual yes, and contact opening for the first
time. Say it: until this moment neither person had the other's email.

**2:45–3:00 — how it is built**

One breath, over the app: Convex is the backend and serves this app from
convex.site; OpenAI runs the dates; Firecrawl chooses where they happen;
AgentMail carries every private letter separately. End on the live URL.

## What to avoid

- Do not open with architecture. The criteria reward everyday utility; the
  stack is the closing argument, not the opening one.
- Do not show the dev-only avatar lab at `/lab/avatar`; it is not part of the
  product.
- Do not use a real person's contact details anywhere on screen. The seeded
  Agents are fictional and labelled; keep it that way.
