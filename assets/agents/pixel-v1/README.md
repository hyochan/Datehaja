# Datehaja pixel-art production sources

These atlases were generated with the built-in image_gen tool for Datehaja,
following the pixel concept the user approved on 2026-09-07. The approved
characters have warm adult anime faces, clear pixel shading and compact
full-figure proportions. The raster artwork is original generated material;
no artwork from the reference game repository is bundled here.

`prompts.json` preserves the full production prompts. Original generated files
remain in the generator's output directory. These copies are the reproducible
inputs to `scripts/pack-pixel-avatars.mjs`.

- `female-heads.png`, `male-heads.png`: five columns (wave, crop, bob, bun,
  buzz), five rows (gentle, bright, cool, curious, closed eyes).
- `female-bodies.png`, `male-bodies.png`: four columns (cardigan, blazer,
  hoodie, starlight), three rows. The importer uses only the standing row. The two
  attempted walking rows repeat the same leading foot and are retained only
  as part of the unmodified generated source. Runtime walking instead moves
  the two legs independently while keeping the torso facing stable. The importer
  follows connected opaque trouser pixels to create each leg image, preserving
  slanted cuffs and shoe overhangs without a fixed vertical cut.
- `accessories.png`: a 2 × 2 sheet of glasses, headphones, star clip and scarf.
- `anchors.json`: generated import coordinates and mask counts for inspection.

The solid green background is a technical matte removed during import.
Hair and neck anchors are normalized before customization, and only blue
clothing becomes a recolorable mask. `public/agents/pixel-v1` is the output
served by the app; these source atlases are not shipped in the web bundle.
