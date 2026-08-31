import { describe, expect, test } from "vitest";
import { worldThemeFor } from "./AgentDateWorld";

describe("agent date world themes", () => {
  test.each([
    ["A film that changes how the street looks", "cinema"],
    ["Night market after the crowd", "market"],
    ["Poetry in a bookshop", "bookshop"],
    ["A slow walk through the garden", "garden"],
    ["An untitled work in a gallery", "gallery"],
    ["A quiet first conversation", "cafe"],
  ] as const)("maps %s to the %s world", (setting, key) => {
    const theme = worldThemeFor(setting);
    expect(theme.key).toBe(key);
    expect(theme.objects).toHaveLength(3);
    expect(theme.objects.every((object) => object.label.length > 0)).toBe(true);
  });
});
