import { describe, expect, it } from "vitest";
import {
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
      expect(source).toBe(`/agents/sprite-${palette}-v1.png`);
    }
  });
});
