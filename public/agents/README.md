# Agent world sprites

Full-body field sprites for the agent-dating world, the dashboard hero and
the debrief emails. All resolved through `spritePathFor(palette, face, gender)`
in `convex/lib/agentAvatar.ts`, which the app (`spriteForAvatar`) and the email
pipeline share so an agent shows the same face everywhere.

## v3 (current): painted set, `v3/<gender>-<palette>-<face>.png`

- One pretty base character per gender (`female`, `male`) generated in
  ChatGPT (the "Datehaja" project, chat "Generate Sprite Image") wearing a
  flat magenta `#FF00FF` outfit, then recoloured programmatically into every
  palette (`rose`, `violet`, `moss`, `sky`, `sunset`, `ink`) so all palettes
  share the exact same face. Expressions (`gentle`, `bright`, `cool`,
  `curious`) are ChatGPT edits of the base, keyed the same way.
- `v3/<gender>-<palette>-blink.png` — optional eyes-closed frame layered over
  the sprite for a CSS blink (`.agent-world-sprite-blink`).
- A gender or expression is only used once it is listed in `SPRITE_V3_FACES`
  / `SPRITE_V3_BLINK` in `convex/lib/agentAvatar.ts`; anything missing falls
  back to the gender's first expression, and a gender with no v3 files falls
  back to the v2 set below. Partial sets are safe.
- Regenerating: ask ChatGPT for the magenta-keyed base (transparent PNG),
  then run the session `recolor.py` (hue-key magenta → palette primary/deep,
  fit to 341×512 bottom-aligned). Edits sometimes come back with a painted
  checkerboard instead of alpha; `debg.py` strips it.

## v2 (fallback): `sprite-<palette>-v2.png`

Pixel-art base sprites per palette, 341×512, kept only as the fallback for
anything the v3 manifest does not cover. `sprite-<palette>-<face>-v2.png`
variants are honoured when listed in `SPRITE_FACE_VARIANTS`.

The editable profile portrait remains vector-based (`AgentAvatar.tsx`) so
hair, expression, outfit and accessory controls stay functional; the world
sprite is the agent's painted field form and follows gender, palette and
expression.
