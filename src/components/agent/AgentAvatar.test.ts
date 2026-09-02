import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AgentAvatar,
  AVATAR_OPTIONS,
  AVATAR_SPRITES,
  DEFAULT_AVATAR,
  spriteForAvatar,
} from "./AgentAvatar";

describe("agent world sprites", () => {
  it("maps every avatar palette to a versioned transparent asset", () => {
    expect(Object.keys(AVATAR_SPRITES)).toEqual([...AVATAR_OPTIONS.palette]);

    for (const palette of AVATAR_OPTIONS.palette) {
      const source = spriteForAvatar({ ...DEFAULT_AVATAR, palette });
      expect(source).toBe(`/agents/sprite-${palette}-v2.png`);
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
    expect(headphones).toContain('height="29"');
  });
});
