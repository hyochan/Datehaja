# Agent world sprites

Full-body field sprites for the agent-dating world, the dashboard hero and
the debrief emails. All resolved through `spritePathFor(palette, face, gender)`
in `convex/lib/agentAvatar.ts`, which the app (`spriteForAvatar`) and the email
pipeline share so an agent shows the same face everywhere.

## The set: `v3/<gender>-<palette>-<face>.png`

- One pretty base character per gender (`female`, `male`) generated in
  ChatGPT (the "Datehaja" project, chat "Generate Sprite Image") wearing a
  flat magenta `#FF00FF` outfit, then recoloured programmatically into every
  palette (`rose`, `violet`, `moss`, `sky`, `sunset`, `ink`) so all palettes
  share the exact same face. Expressions (`gentle`, `bright`, `cool`,
  `curious`) are ChatGPT edits of the base, keyed the same way.
- `v3/<gender>-<palette>-blink.png` — optional eyes-closed frame layered over
  the sprite for a CSS blink (`.agent-world-sprite-blink`).
- The outfit is two-tone: a reference render per gender (magenta top, cyan
  bottom) assigns each outfit pixel to the nearer garment, so tops take the
  palette's primary colour and trousers and shoes take its deep tone.
- An expression is only used once it is listed in `SPRITE_V3_FACES` /
  `SPRITE_V3_BLINK` in `convex/lib/agentAvatar.ts`; anything missing falls
  back to the gender's first expression, so partial sets are safe.
- Regenerating: ask ChatGPT for the magenta-keyed base (transparent PNG),
  then run the session `recolor2.py` (keys magenta/cyan → palette primary and
  deep, fits to 341×512 bottom-aligned against the base's content box).
  Expression edits sometimes come back with a painted checkerboard instead of
  alpha; `debg.py` strips it. `blinkmask.py` trims a blink frame to the pixels
  that differ from the open-eye frame.

The earlier pixel-art set (`sprite-<palette>-v2.png`) was removed once the
painted set covered every gender, palette and expression.

The editable profile portrait remains vector-based (`AgentAvatar.tsx`) so
hair, expression, outfit and accessory controls stay functional; the world
sprite is the agent's painted field form and follows gender, palette and
expression.
