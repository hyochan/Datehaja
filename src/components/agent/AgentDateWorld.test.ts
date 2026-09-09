import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { AgentDateWorld, worldThemeFor } from "./AgentDateWorld";

// Without a locale the component silently falls back to English copy, which
// would hide a regression in the localized strings it renders.
vi.mock("../../i18n", () => ({ useI18n: () => ({ t: (value: string) => value, locale: "en-US" }) }));

describe("agent date world themes", () => {
  test("the final turn never adds a romantic reaction just because it is last", () => {
    const html = renderToStaticMarkup(createElement(AgentDateWorld, {
      setting: "A quiet gallery", sceneKind: "gallery", status: "running",
      mine: { name: "Juno" }, counterpart: { name: "Sol" },
      turns: Array.from({ length: 6 }, (_, index) => ({
        _id: String(index), round: index + 1,
        speakerAgentName: index % 2 === 0 ? "Juno" : "Sol",
        content: index === 5 ? "I'd rather leave it there. Good night." : "A line from the conversation.",
      })),
    }));
    expect(html).toContain("Good night.");
    // The replay rests on the closing line: it is the caption, the last timeline
    // step is the selected one, and no seventh step was invented.
    expect(html).toContain("06 / 6");
    expect(html).toContain('aria-pressed="true">6<');
    expect(html).not.toContain("7 / 6");
  });
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
