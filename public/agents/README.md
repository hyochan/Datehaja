# Agent artwork

## Editable pixel characters

`AgentCharacterArt.tsx` composes generated pixel illustrations inside an SVG
viewport. Portraits, profile chips, editor figures and date-world figures use
the same head and clothing images from `pixel-v1/`. There are two genders,
five hairstyles, four expressions, four outfits, five accessory choices and
six clothing palettes. Saved avatar configuration and legacy defaults are
unchanged. No generation service runs when someone customizes an avatar.

A grayscale clothing mask maps blue fabric to the selected palette. Skin,
hair, cream fabric and trousers retain their original pixels. Accessories
are separate transparent images; choosing `none` removes all of them.

The assembled head and its wearables use 76% of the packed size, with the
neck seated at y=230 over the body's existing neck. The head shifts slightly
left to align its three-quarter neck rather than its face center. This keeps the
head in proportion to the shoulders and leaves the neckline visible. Both
views start at y=36; portraits include the shoulders and upper torso.
The male head atlas ends at the jaw, so the body's neck connects directly
to the face without a second skin stub or a horizontal seam above the collar.

Only the two eye regions receive the matching closed-eye illustration during
a blink, keeping the selected mouth and hair. Large portraits follow the
pointer; heads nod while speaking. Date-world movement animates the legs independently around fixed thigh anchors
only while a destination changes, preserving the facing and clothing details. Reduced motion disables gaze, blinking and
walking animation. Email exports use a static open-eyed standing pose.

Run `bun run dev` and visit `/lab/avatar` to compare portrait, chip, figure and
world sizes. Its Settings section uses the production editor to check narrow
cards. This studio is excluded from production builds. Browser regressions
are covered in `tests/e2e/avatar-customization.spec.ts`, including rendered
pixel comparisons that ensure clothing palettes never recolor a face.

## Source artwork and packing

The production source atlases and full image-generation prompts live in
`assets/agents/pixel-v1/`. They are build inputs, not publicly served images.
The import script removes the technical green matte and detached gutter
fragments, normalizes the neck anchors, and extracts clothing color masks and individual leg silhouettes.
It preserves generated faces and clothing rather than drawing replacements.

```sh
ART_SHARP=/path/to/sharp node scripts/pack-pixel-avatars.mjs
```

Use an installed `sharp` package, or point `ART_SHARP` to an existing installation.
Sharp is an offline art-import dependency; the application does not need it.
The importer finishes all images in a staging directory before replacing
runtime files. `assets/agents/pixel-v1/anchors.json` records the import geometry.

## Email snapshots: `v3/<gender>-<palette>-<face>.png`

The 48 transparent 341 × 512 PNGs come from the same pixel renderer. Their
existing URLs stay available to already-sent emails; `spritePathFor` in
`convex/lib/agentAvatar.ts` remains the path contract. Regenerate after an
artwork or palette change:

```sh
bun run avatars:render
```

The exporter uses Playwright (Chrome on macOS, Chromium elsewhere; override
with `PLAYWRIGHT_CHANNEL`), embeds the local PNG parts and awaits image decoding.
It renders the entire set into a temporary directory before replacing files.
Email data contains gender, palette and expression, so its base look uses
women's waves or men's crop, a cardigan and no accessory. The app uses the
full saved configuration.

Unused older PNG families were removed in PR #29. The maintained `v3` email
snapshots and all interchangeable `pixel-v1` parts remain intentional assets.
