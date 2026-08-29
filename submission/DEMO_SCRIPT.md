# Datehaja — 3-minute demo script

Completed deliverable: **`submission/Datehaja-demo.mp4`** — 2:39, 1920×1080,
H.264 video with AAC English narration.

Live app: https://datehaja.com

The finished cut is a concise visual story built from the production E2E run:
availability, deterministic matching, OpenAI ranking, Firecrawl evidence,
separate AgentMail invitations, private answers, Convex realtime confirmation,
calendar state, trusted-contact sharing, and private post-date feedback.

The live-capture rundown below is retained as the operator script if the
submission portal asks for an unedited browser walkthrough.

## Before recording

- Deploy the current `main` build and confirm the redesigned landing is live.
- Use **English (US)** and dark mode for the recording.
- Create the account with an email address that can receive mail. Do not use a
  `.test` address; the AgentMail invitation will not be deliverable.
- Keep two browser windows signed into the same account on `/dashboard`.
  Window B stays untouched until the realtime reveal.
- Keep the real invitation email open in a third tab.
- Prepare one availability window in Seoul, where the demo personas are seeded.

---

## 0:00–0:18 · Start with the date, not a profile

**On screen:** redesigned landing hero.

> Dating apps start with a wall of people. Datehaja starts with something more
> natural: what do you actually want to do with someone new?

Click **Read the two-minute brief**. Let the connected concierge flow settle on
screen: two availability slips, research, two locked answers, one date ticket.

> A film, a walk, an exhibition — bring the idea, and Datehaja finds the person.

## 0:18–0:38 · The activity is the anchor

**On screen:** availability editor.

> I choose Saturday, six to ten-thirty, and say what I want: an indie film.
> The film can be the whole date. Datehaja never adds dinner just to make the
> itinerary look busier.

Add the idea, return to the dashboard, and click **Find someone to go with**.

## 0:38–1:05 · Convex is doing the work

**On screen:** the matching progress card advancing.

> These are real Convex document updates, not a timed spinner. Hard filters in
> TypeScript enforce age, mutual interest, distance, safety state and a real
> calendar overlap. Then a deterministic score explains what fits. OpenAI ranks
> only the survivors—it cannot overrule a rule.

Keep Window B visible but untouched.

## 1:05–1:32 · A researched plan, not a profile

**On screen:** open the date plan, then expand **How we built this**.

> The date plan arrives with a time, a real public venue, a route and a budget.
> Firecrawl researched the live web around our midpoint. Here are the source
> pages, the supporting quotes and when they were checked. OpenAI composed the
> plan only from that evidence. If something is uncertain, the app says so.

Briefly show model name, latency and token evidence—do not dwell on raw logs.

## 1:32–1:50 · AgentMail keeps both people private

**On screen:** the real invitation email from Datehaja Concierge.

> AgentMail gives Datehaja its own inbox. We receive separate private
> invitations, so neither person sees the other's email address—not in the app,
> sender field or CC list. A reply goes back to Datehaja, not to the match.

## 1:50–2:12 · Both answer privately

**On screen:** Window A, then Demo controls.

> I accept. The other person still cannot see my answer.

Click **Accept this date**, open **Demo controls**, then click
**They accept** for the clearly labelled fictional persona.

> The seeded persona lets a judge drive the second side without recruiting
> another person.

## 2:12–2:30 · The realtime reveal

**On screen:** point to untouched Window B as it changes to **It's a date**.

> I have not refreshed or navigated this window. Convex queries are live
> subscriptions, so the same transactional state appears immediately on both
> screens.

## 2:30–2:50 · The plan leaves the app safely

**On screen:** confirmed date plan, then its calendar and trusted-contact actions.

> One acceptance reserves the evening; two finalize the same calendar event;
> a cancellation releases it. I can also send only my name, the time and this
> public venue to a trusted contact. The match's identity never leaves Datehaja.

Briefly reveal the private post-date check-in heading without filling it in.

> After the date, each person can respond privately. Safety answers never go
> to the match.

## 2:50–2:58 · Close

**On screen:** return to the landing hero or final date ticket.

> Tell Datehaja what you want to do. It finds someone who wants to do it too.

---

## Recording checklist

- Final duration is under 3:00, including title and end frames.
- Cursor is visible; no password manager, email address or secret is exposed.
- The AgentMail message is genuinely delivered before recording begins.
- Window B visibly remains untouched until the realtime reveal.
- The expanded provenance panel contains real Firecrawl and OpenAI evidence.
- The calendar event visibly says **Finalized** after both accept.
- The trusted-contact email shown contains no match identity or contact detail.
- Export at 1080p, H.264, with readable browser zoom and clear voice audio.

## Optional alternate ending

If there is room, use **They pass** instead of **They accept** and show that the
accepted person's evening remains held while replacement search begins. Record
that as a separate short clip; do not risk pushing the main submission over
three minutes.
