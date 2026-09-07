import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync, readdirSync } from "node:fs";
import {
  AgentAvatar,
  AVATAR_OPTIONS,
  DEFAULT_AVATAR,
} from "./AgentAvatar";

describe("editable agent portraits", () => {
  it("ships exactly the PNG parts required by every supported customization", () => {
    const expected = new Map<string, number>();
    for (const gender of AVATAR_OPTIONS.gender) {
      for (const hair of AVATAR_OPTIONS.hair) {
        for (const face of [...AVATAR_OPTIONS.face, "blink"]) {
          expected.set(`${gender}-${hair}-${face}.png`, 280);
        }
      }
      for (const outfit of AVATAR_OPTIONS.outfit) {
        for (const side of ["left", "right"]) expected.set(`${gender}-${outfit}-leg-${side}.png`, 660);
        for (const pose of ["idle"]) {
          expected.set(`${gender}-${outfit}-${pose}.png`, 660);
          expected.set(`${gender}-${outfit}-${pose}-dye.png`, 660);
        }
      }
    }
    for (const accessory of AVATAR_OPTIONS.accessory.filter((item) => item !== "none")) {
      expected.set(`accessory-${accessory}.png`, 0);
    }
    const directory = new URL("../../../public/agents/pixel-v1/", import.meta.url);
    expect(readdirSync(directory).sort()).toEqual([...expected.keys()].sort());
    for (const [name, height] of expected) {
      const png = readFileSync(new URL(name, directory));
      expect(png.subarray(1, 4).toString(), name).toBe("PNG");
      expect(png[25], `${name} must preserve transparency`).toBe(6);
      if (height) {
        expect(png.readUInt32BE(16), name).toBe(320);
        expect(png.readUInt32BE(20), name).toBe(height);
      }
    }
  });

  it("renders each chosen hairstyle and headphone state into the portrait", () => {
    const hairPortraits = AVATAR_OPTIONS.hair.map((hair) =>
      renderToStaticMarkup(
        createElement(AgentAvatar, {
          name: "Test Agent",
          avatar: { ...DEFAULT_AVATAR, hair },
          label: `${hair} preview`,
        }),
      ),
    );

    for (const [index, hair] of AVATAR_OPTIONS.hair.entries()) {
      expect(hairPortraits[index]).toContain(`data-avatar-hair="${hair}"`);
    }
    expect(new Set(hairPortraits).size).toBe(AVATAR_OPTIONS.hair.length);

    const headphones = renderToStaticMarkup(
      createElement(AgentAvatar, {
        name: "Test Agent",
        avatar: { ...DEFAULT_AVATAR, accessory: "headphones" },
        label: "headphones preview",
      }),
    );
    expect(headphones).toContain('data-avatar-accessory="headphones"');
    expect(headphones).toContain('data-character-accessory="headphones"');
    expect(headphones).toContain('data-character-layer="accessory"');
  });
});
