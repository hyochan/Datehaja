# Submission and social copy — September 20, 2026

**Published September 20 revision:** [short submission description](SUBMISSION_DESCRIPTION.md).
It leads with the owner correction and gives judges the date → English learning
comparison → delivered email/Convex route. The existing
[entry](https://vibeapps.dev/s/datehaja) now displays this copy and the
[new 2:28 video](https://youtu.be/-KZKKBA9m-I).
The existing social posts below are historical records, not instructions to
post again. Outreach and automated follow-ups are paused.

**Posted and submitted 2026-09-16.** The entry is live on vibeapps.dev under
the AllGasHackathon tag.
Every app link below is on the submitted production deployment and was checked
there. The current film is unlisted on YouTube (https://youtu.be/-KZKKBA9m-I); the repository keeps its
captions and transcript, not the file.

**Posting is scored, not optional.** The official page lists "Social proof —
you posted your build on X or LinkedIn. Engagement counts." among the judging
criteria, and step five of how to participate says to tag @convex, @OpenAI,
@firecrawl and @agentmail. Because engagement is counted, post before
submitting rather than after: the post has until Sep 22 12:00 PM PT to collect
any.

## September 16 submission description — historical

As submitted:

Create a private AI Dating Agent, let it meet other Agents, hear what happened, and tell it what felt like you. The next encounter carries that guidance.

**Watch a finished date, no account needed:** https://merry-bass-190.convex.site/watch — sixteen saved lines between two fictional Agents in a bookshop. Juno opens by saying what it is: an AI standing in. The journal points each moment back to the exact lines behind it. Each Agent then writes home independently; both recommended meeting, and the record stops there, because contact opens only after two human yeses. No compatibility score, no forced match.

**The learning proof:** https://merry-bass-190.convex.site/preview/agent-coaching?lang=en — one fictional owner's Agent across four actual scheduled dates and three saved corrections, 56 lines kept in full. Read the correction, the Agent's saved reply and the memory it carried, then compare its first and latest lines. The English view keeps the Korean original beside it, always labelled. Polite speech persisted; shorter replies did not consistently follow. The limits are shown with the improvement.

**What the sponsors actually do**

- **Convex** is the whole backend: it stores every turn, schedules the next one, streams the date live to anyone watching, handles auth, and enforces both the private data projections and the transactional two-sided consent. The React app is served from Convex static hosting.
- **OpenAI** generates the dialogue, the private coaching, the letters, and the reflections that are fact-checked against the transcript. A letter that fails that check is withheld rather than sent.
- **Firecrawl** searches the live web for a cultural spark near a shared interest, and the source title and URL stay attached to the date so anyone can check them.
- **AgentMail** sends the sign-in codes and the separate introduction letters, one per owner, never both to either.

Three of those four are load-bearing. Without Convex there is no app, without OpenAI there is no conversation, and without AgentMail nobody can sign in or be told the result. Firecrawl is the honest exception: if the search returns nothing the date still runs, and only the citation is missing.

**What this is not.** An Agent recommendation never opens contact — only two independent human yeses do. The simulations do not establish real-world chemistry. Independent first-use testing is prepared but not yet run, so no participant satisfaction, retention or demand results are claimed. The public examples use fictional people.

**Build log:** `hackathon.md` at the repo root records every session, including the mistakes — a public replay that was still in the wrong language, a film that narrated four things that were not on screen, and a measurement that turned out to be wrong and how.

## X post — posted

Posted 2026-09-16 from @hyodotdev. Opened as a question rather than a launch:
the product's own pages say the simulations prove nothing about real chemistry,
so a launch announcement would have been the one claim in this entry its own
evidence does not support. A question also invites replies, and replies are
what "engagement counts" means.

> Maybe it's just me, but work asks for more focus each year and dating loses
> the hours.
>
> So I built what I kept imagining: an agent that dates for me and tells me how
> it went.
>
> Not sure it's needed. Sharing anyway:
> https://merry-bass-190.convex.site/watch
>
> @convex @OpenAI @firecrawl @agentmail

276 of 280, counting the link as 23 the way X does. The four handles are in the
post itself rather than a reply, because the submission links to the post and a
judge should not have to open a thread to see that the tagging asked for in the
rules was done.

Optional reply, if the thread is worth continuing:

> How it actually works: the agent is always identified as AI and can never
> consent to contact for you. It carries only what you told it privately, and it
> comes home with the case against meeting too.
>
> Code and the full build log:
> https://github.com/hyochan/Datehaja

## LinkedIn post

Same register, more room. The first line is what shows before "see more", so it
carries the hedge and the observation on its own.

> Maybe it's just me, but work asks for more focus each year — and dating is the
> thing that quietly loses the hours.
>
> I kept imagining an agent that could go instead. Not a matchmaker, and not a
> chatbot pretending to be me: a second self that meets someone else's agent,
> has the conversation I don't have time for, and comes home and tells me how it
> went — including when it thinks I shouldn't bother.
>
> So I built it, to find out whether it is actually any use.
>
> Two things you can open without an account:
>
> → A finished agent date. Sixteen saved lines in a bookshop, a journal that
> points back at the exact dialogue behind each moment, and both agents' private
> notes afterwards.
> https://merry-bass-190.convex.site/watch
>
> → The same agent across four dates and three corrections from its owner, 56
> lines kept in full. The polite register it was asked for persisted. The
> shorter replies it was asked for did not. Both are shown.
> https://merry-bass-190.convex.site/preview/agent-coaching?lang=en
>
> What I was strict about: the agent is always identified as AI, it carries only
> what you told it privately, and it can never consent to contact for you. A
> recommendation opens nothing — only two independent human yeses do, and a no
> never reveals who said it.
>
> What I cannot claim: the people in those records are fictional, no first-time
> user study has run yet, and a simulation is not chemistry.
>
> So I honestly do not know whether this is useful or just a strange thing to
> have made. That is the part I would like to hear about.
>
> Built for the Convex All Gas hackathon with @Convex @OpenAI @Firecrawl
> @AgentMail. Code and the full build log, mistakes included:
> https://github.com/hyochan/Datehaja

Select the actual company mentions in the composer rather than assuming plain
pasted @ text creates a mention — LinkedIn does not linkify it on its own, and
an unlinked handle notifies nobody.

## Release evidence

| Evidence | Status |
| --- | --- |
| Current film and caption files | Built; see film-verification.json |
| Film, unlisted on YouTube (updated September 20) | https://youtu.be/-KZKKBA9m-I |
| Film page on the deployment | Retired; the film is on YouTube only |
| Production revision | Shipped; `verify:prod` reports `scoutAccess.ok` |
| Independent human sessions | 0 completed; USER_STUDY.md is ready |
| X post | https://x.com/hyodotdev/status/2100046684575387842 |
| X reply, carrying the safety detail | https://x.com/hyodotdev/status/2100047689652264996 |
| LinkedIn post | https://www.linkedin.com/feed/update/urn:li:activity:7505814301929156608/ |
| Sponsor tagging | Real mentions on both: X linkifies handles itself; the four LinkedIn company mentions were selected from the composer, so all four were notified |
| Final submission | Submitted 2026-09-16, listed under https://vibeapps.dev/tag/allgashackathon |

Submission form: https://vibeapps.dev/judging/convex-all-gas-hackathon-openai/submit
Official event: https://www.convex.dev/hackathons/all-gas
