# Rive agent character — authoring contract

Goal: one rigged character in Rive that mirrors the avatar editor exactly
(palette, face, hair, outfit, accessory) and reacts to the live agent-date
state. The production app currently uses the shared editable SVG figure.

Status (2026-09-02): the rig is BUILT in the Rive file "Datehaja Agent"
(file id 2550307, project 1514853, https://editor.rive.app/file/untitled/2550307)
entirely through the Rive MCP server. Exporting `.riv` (Publish → To .riv,
Export → For Runtime) is gated behind a paid Rive plan on this workspace, so
`public/agents/agent.riv` does not exist yet. The app side is ready:
`src/components/agent/RiveAgent.tsx` remains an experimental adapter. The
current `/lab/avatar` bench verifies the production SVG character and editor.
The rig described below predates the new character art and needs reauthoring
before adoption; it is not the production renderer.

## Where it plugs in

| Surface | Today | With Rive |
| --- | --- | --- |
| Date world (`AgentWorldSprite`) | editable SVG `AgentCharacter` | `<RiveAgent>` driven by the inputs below |
| Dashboard hero / landing loop | editable SVG `AgentCharacter` | `<RiveAgent>` |
| Lists, chips, tiny avatars | SVG `AgentAvatar` (blink + breathe) | unchanged (cheap) |
| Debrief / connection emails | PNG snapshots of the SVG | render equivalent PNG stills if adopting the rig |

Runtime: `@rive-app/react-canvas` (installed). `RiveAgent` lazy-loads
`/agents/agent.riv`, binds the view model automatically (`autoBind`) and
falls back to `AgentCharacter`, preserving every editor option, when the file
fails to load.
`prefers-reduced-motion` disables autoplay (frame 0 of `idle`).

## Artboard

- Name: `Agent`, 341 × 512, transparent background
- Hierarchy: `Character` (origin at the feet, 170.5 / 512) → `Neck`, `Coat`,
  `Outfit` (Solo `OutfitSolo`), `Head` (origin at the neck) → ears, `Face`,
  `Hair` (Solo `HairSolo`), `Brows`, `FaceSet` (Solo `FaceSolo`, each variant
  has an `Eyes` node for blinks), cheeks, `Accessory` (Solo `AccessorySolo`)
- Geometry is the SVG `AgentAvatar` scaled ×2.13125 (160 × 184 → 341 × 392),
  bottom-aligned. Rebuild script: scratchpad `rive_build.py` (session only).

## View model `Agent` (bound to the artboard, instance "Instance")

| Property | Type | Values | Bound to |
| --- | --- | --- | --- |
| `hair` | enum `Hair` | wave · crop · bob · bun · buzz | `HairSolo.activeComponent` |
| `face` | enum `Face` | gentle · bright · cool · curious | `FaceSolo.activeComponent` |
| `outfit` | enum `Outfit` | cardigan · blazer · hoodie · starlight | `OutfitSolo.activeComponent` |
| `accessory` | enum `Accessory` | none · glasses · headphones · star · scarf | `AccessorySolo.activeComponent` |
| `background` `glow` `primary` `deep` `ink` | color | the `PALETTES` set in `AgentAvatar.tsx` | every palette-coloured fill/stroke/gradient stop (49 binds) |
| `activity` | number | 0 idle · 2 reading · 3 thinking · 4 wandering · 5 wrapping_up | Activity layer conditions |
| `speaking` | boolean | true while this agent's bubble is live | Speaking layer |
| `verdict` | number | 0 none · 1 encourage · 2 curious · 3 pass | Verdict layer |
| `wave` | trigger | one-shot greeting | Wave layer |
| `arrive` | trigger | walk-in from the left, then idle | Activity layer (`idle → arriving`, exit time 100 %) |

Skin tones stay literal (`#efc8b5`, `#e6b9a8`, buzz `#d9ad9d`).

## Animations (60 fps)

| Name | Frames | Loop | What moves |
| --- | --- | --- | --- |
| `idle` | 300 | loop | breath (Character scaleY 100→102), head sway ±1.2°, blink at f200 |
| `wave` | 60 | one-shot | hop, head tilt −8°/+6°, squash |
| `speaking` | 30 | loop | FaceSet bob + widen |
| `verdict_encourage` | 70 | one-shot | big hop + tilt |
| `verdict_curious` | 60 | one-shot | head tilt −10° |
| `verdict_pass` | 70 | one-shot | soft shrug (tilt + scaleY dip) |
| `arriving` | 50 | one-shot | Character x −230 → 170.5 with lean |
| `reading` | 240 | loop | head tilt 5° + drop |
| `thinking` | 200 | loop | head tilt −6° + shift |
| `wandering` | 240 | loop | Character x ±20, head counter-sway |
| `wrapping_up` | 90 | one-shot | two nods, half-turn (scaleX 92) |

## State machine `State Machine 1`

- `Activity` layer: Entry → `idle`; `idle → arriving` on `arrive`;
  `arriving → idle` on exit time; `idle ↔ reading/thinking/wandering/wrapping_up`
  on `activity == n` / `activity != n`.
- `Wave` layer: `Rest → wave` on `wave`; back on exit time.
- `Speaking` layer: `Quiet ↔ speaking` on `speaking`.
- `Verdict` layer: `None → verdict_*` on `verdict == n`; back on `verdict != n`.
- Verified with `simulateStateMachine` (every driven transition fires and
  returns).

## Exports

- `public/agents/agent.riv` — Export → For Runtime (needs the paid plan).
- PNG stills at 341 × 512 for email — optional once the Rive look is adopted;
  today `bun run avatars:render` generates the email set in `public/agents/v3/`
  from the shared SVG renderer.

## Definition of done

1. Toggling any editor control changes the character on the dashboard
   within one frame, no reload (`/lab/avatar` proves this).
2. Date world: agents visibly arrive, think, wander and wrap up in sync with
   `agentDates.activity`.
3. `prefers-reduced-motion` freezes to `idle` frame 0.
4. Bundle: runtime lazy-loaded; `.riv` under 300 KB.
