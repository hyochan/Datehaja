# Agent world sprites

Full-body field sprites for the agent-dating world and the debrief emails.
Generated with OpenAI image generation (ChatGPT, "Datehaja" project) in a
warm adult indie-game pixel-art direction, exported as transparent PNGs and
resized to 341×512.

## Files

- `sprite-<palette>-v2.png` — the base sprite for each palette
  (`rose`, `violet`, `moss`, `sky`, `sunset`, `ink`). Always present.
- `sprite-<palette>-<face>-v2.png` — optional expression variants
  (`gentle`, `bright`, `cool`, `curious`). A variant is only used once it is
  listed in `SPRITE_FACE_VARIANTS` in `convex/lib/agentAvatar.ts`; until then
  the base sprite is shown, so partial sets are safe.

`spritePathFor(palette, face)` in `convex/lib/agentAvatar.ts` is the single
resolver used by the app (`spriteForAvatar`) and by the email pipeline, so an
agent shows the same face everywhere.

The editable profile portrait remains vector-based (`AgentAvatar.tsx`) so
hair, expression, outfit, and accessory controls stay functional. The world
sprite is the agent's compact field form and follows the selected palette,
plus the selected expression when a variant exists.
