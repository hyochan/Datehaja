import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
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
          expect(png[24]).toBe(8); // Eight bits per RGBA channel.
          expect(png[25]).toBe(6);
          expect([...png.subarray(26, 29)]).toEqual([0, 0, 0]); // Standard compression/filtering, no interlace.
          const imageData: Buffer[] = [];
          for (let offset = 8; offset + 12 <= png.length;) {
            const length = png.readUInt32BE(offset);
            if (png.toString("ascii", offset + 4, offset + 8) === "IDAT") {
              imageData.push(png.subarray(offset + 8, offset + 8 + length));
            }
            offset += length + 12;
          }
          const pixels = inflateSync(Buffer.concat(imageData));
          expect(pixels).toHaveLength((341 * 4 + 1) * 512);
          expect(pixels[0]).toBeLessThanOrEqual(4);
          // Every PNG filter predicts zero for the first pixel of the first
          // row. After its filter byte and RGB bytes, this is decoded alpha.
          expect(pixels[4], `${path}: the background must be transparent`).toBe(0);
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
