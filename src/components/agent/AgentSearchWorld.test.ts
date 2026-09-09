import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import { AgentSearchWorld } from "./AgentSearchWorld";

vi.mock("../../i18n", () => ({ useI18n: () => ({ locale: "en-US", t: (value: string) => value }) }));

describe("the search map shows only recorded encounters", () => {
  test("an empty search shows no agent markers or fabricated visited places", () => {
    const html = renderToStaticMarkup(createElement(MemoryRouter, {}, createElement(AgentSearchWorld, { name: "Juno", encounters: [] })));
    expect(html).not.toContain("agent-search-marker");
    expect(html).not.toContain("is-visited");
    expect(html).not.toContain("/agent-date/");
  });
  test("a real saved encounter lights its place, while an explicit demo leaves no search footprint", () => {
    const html = renderToStaticMarkup(createElement(MemoryRouter, {}, createElement(AgentSearchWorld, {
      name: "Juno", currentDateId: "actual-encounter",
      encounters: [
        { _id: "actual-encounter", sceneKind: "garden", isSearchEncounter: true, status: "running" },
        { _id: "demo", sceneKind: "cinema", isSearchEncounter: false, status: "connected" },
      ],
    })));
    expect(html.match(/agent-search-marker/g)).toHaveLength(1);
    expect(html).toContain('href="/agent-date/actual-encounter"');
    expect(html).not.toContain('href="/agent-date/demo"');
  });
});
