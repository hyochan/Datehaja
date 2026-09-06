import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { AVATAR_FACES, AVATAR_GENDERS, AVATAR_PALETTES, spritePathFor } from "./agentAvatar";

describe("email avatar assets", () => {
  it("keeps every email URL backed by a transparent 341 × 512 PNG", () => {
    for (const gender of AVATAR_GENDERS) {
      for (const palette of AVATAR_PALETTES) {
        for (const face of AVATAR_FACES) {
          const path = spritePathFor(palette, face, gender);
          const png = readFileSync(new URL(`../../public${path}`, import.meta.url));
          expect([...png.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
          expect(png.readUInt32BE(16)).toBe(341);
          expect(png.readUInt32BE(20)).toBe(512);
          expect(png[25]).toBe(6); // RGBA, rather than a painted backdrop.
        }
      }
    }
  });

  it("preserves fallback paths for older saved avatars", () => {
    expect(spritePathFor("rose")).toBe("/agents/v3/female-rose-gentle.png");
    expect(spritePathFor("ink", "unknown", "unknown")).toBe("/agents/v3/female-ink-gentle.png");
    expect(spritePathFor("sky", "curious", "male")).toBe("/agents/v3/male-sky-curious.png");
  });
});
