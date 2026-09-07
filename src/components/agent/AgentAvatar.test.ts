import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AgentAvatar,
  AVATAR_OPTIONS,
  DEFAULT_AVATAR,
} from "./AgentAvatar";

describe("editable agent portraits", () => {
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
