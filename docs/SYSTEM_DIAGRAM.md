# How it works diagrams

Implemented on 2026-09-09 in the landing page's `#how-it-works` section.
Following the owner's clarification, the primary view is now a simple learning
loop: create an Agent, let it date, hear what happened, and give feedback.
Three explicitly illustrative examples show voice correction, partner
preferences, and positive reactions carrying into a future encounter.
The detailed diagrams below are collapsed by default and only loaded when
the visitor opens the optional explanation. The primary view contains no
input/output panels or technical gates.
The same component is available at `/how-it-works` without authentication,
including for signed-in owners whose home route opens their dashboard.
The coaching preview links to this explanation and the explanation links back
to the explicitly fictional coaching record.

The interactive diagram is explanatory, not a live search visualization.
Korean and English copy is provided; other locales currently use English.
No backend behavior was changed for this feature.

## System and data flow

```mermaid
flowchart TB
  subgraph A[Your private side]
    BA[(Own brief and memory)] --> AA[Your AI Agent]
    AA --> RA[Independent review and evidence check]
    HA[Read your letter and decide]
  end
  subgraph W[Shared encounter and coordination]
    S[Search mutually eligible active participants]
    T[(Virtual scene and saved dialogue)]
    G{Both Agents recommend?}
    C{Both humans say yes?}
    O[Open contact and stop searching]
    WAIT[Show waiting and last check]
  end
  subgraph B[Their private side]
    BB[(Own brief and memory)] --> AB[Their AI Agent]
    AB --> RB[Independent review and evidence check]
    HB[Read their letter and decide]
  end
  BA -->|Structured settings only| S
  BB -->|Structured settings only| S
  S -->|Eligible pair| T
  S -->|No pair| WAIT
  WAIT -. Later check while active .-> S
  AA <-->|Saved shared turns| T
  AB <-->|Saved shared turns| T
  RA --> G
  RB --> G
  G -->|Yes: own private letter| HA
  G -->|Yes: own private letter| HB
  G -. Otherwise: continue active search .-> S
  HA --> C
  HB --> C
  C -->|Two yeses| O
  C -. A no: close and resume active search .-> S
```

One pending human choice keeps contact sealed. The diagram's selected-step
panel explains pauses, current goal rechecks, email preferences, early endings,
review repair/failure, private projections, and the difference between a
proposed scene activity and a completed one. A review is not a correctness
guarantee.

## Feedback sequence

```mermaid
sequenceDiagram
  actor Owner
  participant Agent as Owner's Agent
  participant Memory as Private memory
  participant Date as Future date prompt
  Owner->>Agent: Saved date + speaker + line + feedback
  Memory-->>Agent: Earlier guidance alongside latest feedback
  Agent->>Memory: Merge durable corrections
  Agent-->>Owner: Private reply with a next-time example
  Memory-->>Date: Include in this Agent's next prompt
  opt Structured taste or relationship intent changes
    Agent-->>Owner: Propose a change
    Owner->>Agent: Explicitly accept or decline
    Note over Owner,Agent: Only acceptance updates the matching setting
  end
```

Feedback about self refines the owner's voice. Feedback about a counterpart
records the owner's reaction; it does not rewrite that counterpart. Past turns
remain unchanged. Pending feedback blocks the start of another encounter.

## Code references and validation

- UI: `src/components/agent/AgentLearningLoop.tsx` and
  `AgentSystemDiagram.tsx`, their CSS and copy modules;
  `src/pages/HowItWorksPage.tsx`, `LandingPage.tsx`, and `App.tsx`.
- Search: `scouting.advance`, `agentDates.createDateRequest`.
- Conversation: `agentDates.runTurn`, `buildDateTurnRequest`.
- Interpretation: `dateReview`, `dateActivityReview`, `agentDates.finalize`.
- Delivery and consent: `deliverDebriefs`, `agentDates.consent`,
  `deliverConnection`.
- Coaching: `agents.send`, `reply`, `storeReply`.
- Build and lint passed; existing suite: 351 tests in 39 files passed.
- Browser checks: Korean/English; light/dark themes; 320, 390, 1024, and
  1360 px widths; no observed horizontal overflow; visible diagram buttons
  at least 44 px high; feedback view, mobile inline explanation, tablet
  navigation to the detail, and public explanation route exercised.
- Simplified view: four steps, three feedback examples, optional diagram
  open/close, unique IDs when expanded, and avatar containment verified.
  Actual dashboard conversation starters now invite voice corrections,
  partner preferences, and positive date feedback in plain language.
- Static frontend published only to dev `adorable-boar-359`; production
  `merry-bass-190` was not changed.
