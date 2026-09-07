// @vitest-environment jsdom
import { createElement } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { I18nProvider } from "../../i18n";
import { AgentWorldSprite } from "./AgentDateWorld";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function sprite(position?: readonly [number, number]) {
  return createElement(I18nProvider, null, createElement(AgentWorldSprite, { person: { name: "Juno" }, position }));
}

test("walking follows real travel, restarts on a new destination and settles", () => {
  const { container, rerender } = render(sprite([20, 50]));
  const character = container.querySelector(".agent-world-sprite")!;
  expect(character.classList.contains("is-walking")).toBe(false);
  rerender(sprite([45, 55]));
  expect(character.classList.contains("is-walking")).toBe(true);
  act(() => vi.advanceTimersByTime(400));
  rerender(sprite([60, 55]));
  act(() => vi.advanceTimersByTime(400));
  expect(character.classList.contains("is-walking")).toBe(true);
  act(() => vi.advanceTimersByTime(380));
  expect(character.classList.contains("is-walking")).toBe(false);
});

test("leaving a moving world clears the outstanding travel timer", () => {
  const { rerender, unmount } = render(sprite([20, 50]));
  rerender(sprite([50, 50]));
  expect(vi.getTimerCount()).toBe(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
