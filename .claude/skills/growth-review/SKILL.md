---
name: growth-review
description: Recurring growth review for Datehaja — pull the real activation funnel from the deployment, find the biggest drop-off, and propose concrete product experiments. Use when the user asks for a growth review, funnel check, 그로스 점검, or /growth-review; also suitable for /loop or scheduled runs.
---

# Datehaja growth review

You are running a recurring growth review for Datehaja, an agent-dating product.
Work only from real first-party data; never invent numbers.

## 1. Pull the funnel (read-only)

Announce which deployment you are reading, then run the snapshot. Default to
dev; only read prod when the user says so (reading prod is safe, but say it).

```bash
npx convex run growth:funnelSnapshot '{"sinceMs": 0}'
```

For a windowed view compute `sinceMs` (e.g. last 7 days = now − 604800000).
Run once with `sinceMs: 0` (all-time) and once for the recent window so trends
are visible. Add `--prod` for production.

The activation funnel, in order:

```
agent_landing_viewed → agent_created → agent_message_sent
  → agent_date_requested → agent_date_completed
  → connection_consent_yes / connection_consent_no
  → contact_revealed (or demo_connection_completed)
```

Monetisation events: `scout_pass_viewed`, `scout_pass_active_viewed`,
`scout_checkout_started` (live billing is intentionally locked — see
docs/PRODUCT_MEMORY.md — so treat these as intent signals, not revenue).

## 2. Analyse

- Compute stage-to-stage conversion on `uniqueActors` (not totals).
- Name the single biggest drop-off stage. That is this review's focus.
- Check `landingSources` / `landingLocales`: which acquisition source and
  locale actually reach `agent_created`?
- Compare against the previous entry in `docs/GROWTH_LOG.md` if it exists.
- If a stage shows `truncated: true`, say counts are lower bounds and suggest
  moving that event to an aggregate.

## 3. Propose experiments

Propose 2–3 concrete, small experiments tied to the actual codebase, aimed at
the biggest drop-off. Typical levers per stage:

- landing → created: hero copy/CTA in `src/pages/LandingPage.tsx`, onboarding
  friction in `src/pages/AgentOnboardingPage.tsx`.
- created → message_sent: the agent's first message and question prompts in
  `convex/agents.ts`.
- message → date_requested: dashboard CTA in `src/pages/AgentDashboardPage.tsx`,
  Scout Pass gating in `convex/billing.ts`.
- date_completed → consent: debrief email (`convex/lib/emailTemplates.ts`) and
  the consent UI in `src/pages/AgentDatePage.tsx`.

Each experiment: what to change, which metric should move, and how to verify.

## 4. Record and report

Append a dated section to `docs/GROWTH_LOG.md` (create it if missing) with:
the window, the funnel table, conversion rates, biggest drop-off, decisions.
Then give the user a short report in their language: funnel table, one-line
diagnosis, the proposed experiments. Do not implement changes in this run
unless the user asks — this skill's job is measurement and proposals.

## Rules

- Read-only against deployments: never run mutations from this skill.
- Growth events are privacy-minimal by design; never propose adding profile
  text, message content, or contact details to `growthEvents` (the schema and
  `convex/growth.ts` forbid it deliberately).
- Numbers you report must come from the snapshot output verbatim.
