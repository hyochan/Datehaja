# Agent artwork

## Editable characters

`src/components/agent/AgentCharacterArt.tsx` draws the portrait and transparent
full figure from the same SVG parts. `AgentAvatar` frames the portrait;
`AgentCharacter` renders the figure in the world and editor. Both support two
genders, five hairstyles, four expressions, four outfits, five accessories and
six palettes. Skin and hair have independent colors.

The eye layer clips the iris, pupil and catchlights to the selected eyelid.
CSS animates that layer directly, so mirroring the world figure also mirrors
its blink. Reduced-motion preferences stop idle and blink animations. No
remote images or generation API are needed to customize a character.

Run `bun run dev` and open `/lab/avatar` to compare looks at portrait, chip,
full-figure and world sizes. The Settings section renders the production
editor with its own preview for checking narrow cards. The studio is excluded
from production builds. Browser regressions are covered in
`tests/e2e/avatar-customization.spec.ts`.

## Email snapshots: `v3/<gender>-<palette>-<face>.png`

Emails need static images. The 48 transparent 341 × 512 PNGs are rendered
from the current vector art, preserving the existing URLs for already-sent
emails. `spritePathFor` in `convex/lib/agentAvatar.ts` remains the path contract.
Regenerate after an artwork or palette change:

```sh
bun run avatars:render
```

This uses the installed Playwright browser (Chrome on macOS, Chromium
elsewhere; override with `PLAYWRIGHT_CHANNEL`). It finishes rendering the
whole set in a temporary directory beside the destination PNGs before
replacing the current assets. This keeps file renames on the same filesystem.

The email delivery context contains gender, palette and expression, so each
snapshot uses a base look: women's waves or men's crop, cardigan, no accessory.
The app supports the full saved configuration. The unused painted blink
frames and old recoloring pipeline have been removed.
