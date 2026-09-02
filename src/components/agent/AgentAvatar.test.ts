import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AgentAvatar,
  AVATAR_OPTIONS,
  AVATAR_SPRITES,
  blinkSpriteForAvatar,
  DEFAULT_AVATAR,
  spriteForAvatar,
} from "./AgentAvatar";

describe("agent world sprites", () => {
  it("maps every avatar palette to a painted v3 sprite for the default look", () => {
    expect(Object.keys(AVATAR_SPRITES)).toEqual([...AVATAR_OPTIONS.palette]);

    for (const palette of AVATAR_OPTIONS.palette) {
      const source = spriteForAvatar({ ...DEFAULT_AVATAR, palette });
      expect(source).toBe(`/agents/v3/female-${palette}-gentle.png`);
    }
  });

  it("shows the chosen gender and expression, and blinks over it", () => {
    expect(
      spriteForAvatar({ ...DEFAULT_AVATAR, palette: "sky", face: "curious" }),
    ).toBe("/agents/v3/female-sky-curious.png");
    expect(
      spriteForAvatar({
        ...DEFAULT_AVATAR,
        palette: "ink",
        face: "cool",
        gender: "male",
      }),
    ).toBe("/agents/v3/male-ink-cool.png");
    expect(
      blinkSpriteForAvatar({ ...DEFAULT_AVATAR, palette: "moss" }),
    ).toBe("/agents/v3/female-moss-blink.png");
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
