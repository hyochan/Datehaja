# Datehaja — the submission demo

The film is recorded from the running product, not assembled by hand. That is
deliberate: the previous cut was made by hand against the concierge product
this repository no longer contains, and because nothing tied it to the code it
went stale silently while every check stayed green. A recording that is driven
by the same selectors the end-to-end suite uses cannot drift away from the app
without a test noticing first.

```bash
# 1. the app under test (development deployment, compressed demo pacing)
bunx convex dev            # in one terminal

# 2. pre-flight: the deployment needs a cast to date and a finished date to
#    replay, or the film ends on an empty room
bunx convex run demo:reseed '{}'      # the labelled fictional Agents
bunx convex run showcase:ensure '{}'  # the completed date /watch replays

# 3. record, then cut
DATEHAJA_DEMO_RECORD=1 bun run demo:record
bun run demo:build         # → submission/Datehaja-demo.mp4
```

The recording needs `ffmpeg` on PATH for the cut, and the closing beat asserts
that `/watch` actually holds a date, so a missed pre-flight fails the run
rather than shipping an empty final shot.

To record against the deployment the submission names instead, point the run at
it — the sign-in code then arrives in the real AgentMail inbox rather than
through the development path:

```bash
E2E_BASE_URL=https://merry-bass-190.convex.site \
DATEHAJA_DEMO_RECORD=1 bun run demo:record
```

## How the timing works

`submission/demo-beats.json` is the storyboard as data: six beats and the exact
number of seconds each one gets in the finished film. The recording spec marks
where each beat begins and ends in the raw capture; `scripts/build-demo.mjs`
trims those spans and time-scales each one to its target.

Two things follow from that. The film is the same length whatever the models
did that day — a slow date is sped up rather than allowed to run long. And
`DEMO_CAPTIONS.srt` can be written once against the storyboard instead of being
retimed after every take. Everything between beats — signing in, waiting for a
page — is cut entirely, so it costs the film nothing.

| beat | window | what it has to land |
| --- | --- | --- |
| `problem` | 0:00–0:20 | the human problem, before any machinery |
| `agent` | 0:20–0:50 | a face, a private brief, the private room |
| `date` | 0:50–1:35 | two Agents meeting as themselves, in a real place |
| `letter` | 1:35–2:15 | the private debrief — the emotional centre |
| `decision` | 2:15–2:45 | a sealed answer, then two yeses and contact |
| `stack` | 2:45–2:55 | how it is built, ending on the public replay |

Total 2:55. The rules require under three minutes, and the build fails rather
than shipping something longer.

Captions are burned in by default, because a judge may well watch this muted.
`bun run demo:build --no-burn` leaves the footage clean and the `.srt` as a
sidecar for a voice-over take.

## The story, in the order it should be told

Lead with the human problem, not the machinery. A judge should understand what
this is for in the first fifteen seconds, and only then see how it is built.

**0:00–0:20 — the problem.** The landing hero. Say it plainly: the worst part
of dating apps is the first date you already know will not work, and you spend
an evening and your phone number finding that out.

**0:20–0:50 — build the Agent.** Give it a face — palette, expression, the
woman or man base. Say what it is: your second self, the one who goes instead
of you. Fill the brief in the unpolished voice the product asks for. Land on:
it knows how you actually are, not how you present. Then the private room, and
the fact that nothing said in it reaches anyone else's Agent.

**0:50–1:35 — the date.** The world appears, drawn around a real place
Firecrawl pulled off the live cultural web that morning — name the source on
screen. Both Agents walk in and talk. Say the important thing out loud: each
Agent only ever sees its own person's brief, and each speaks in the first
person as that person. No matchmaker, no go-between.

Do not narrate the counter. The transcript moves to the debrief as the sixth
turn lands.

**1:35–2:15 — the letter.** The private debrief, and the most screen time of
any beat. Read a line of the Agent's letter aloud. Point out that it is a
letter, not a score, and that the other person will never see it. The same
letter arrives by mail from the Agent's own AgentMail inbox.

**2:15–2:45 — the sealed decision.** Answer yes. Show that the other side is
still hidden — you decided without knowing what they chose. Then the mutual
yes, and contact opening for the first time. Say it: until this moment neither
person had the other's email.

**2:45–2:55 — how it is built.** One breath: Convex is the backend and serves
this app from convex.site; OpenAI runs the dates; Firecrawl chooses where they
happen; AgentMail carries every private letter separately. End on the public
replay at `/watch`, which is where a judge can go without an account.

## What to avoid

- Do not open with architecture. The criteria reward everyday utility; the
  stack is the closing argument, not the opening one.
- Do not show the dev-only avatar lab at `/lab/avatar`; it is not part of the
  product.
- Do not use a real person's contact details anywhere on screen. The seeded
  Agents are fictional and labelled; keep it that way.
- Do not hand-edit `Datehaja-demo.mp4`. Change the storyboard or the spec and
  record again, so the film and the product stay tied together.
