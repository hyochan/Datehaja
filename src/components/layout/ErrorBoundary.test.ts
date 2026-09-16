// @vitest-environment jsdom
import { createElement, useEffect, type ReactNode } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Link, MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { I18nProvider } from "../../i18n";
import { ErrorBoundary } from "./ErrorBoundary";

afterEach(() => {
  cleanup();
});

function Boom(): ReactNode {
  throw new Error("render exploded for the test");
}

function Working({ label }: { label: string }): ReactNode {
  return createElement("h1", null, label);
}

function renderWithBoundary(child: ReactNode, path = "/dashboard") {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const view = render(
    createElement(
      I18nProvider,
      null,
      createElement(
        MemoryRouter,
        { initialEntries: [path] },
        createElement(ErrorBoundary, null, child),
      ),
    ),
  );
  return { ...view, errorSpy };
}

describe("root ErrorBoundary", () => {
  it("is wired around the app so a render error cannot blank the page", () => {
    const main = readFileSync("src/main.tsx", "utf8");
    expect(main).toMatch(/<ErrorBoundary>/);
    expect(main).toMatch(/<\/ErrorBoundary>/);
  });

  it("shows a recovery surface instead of an empty page when a child throws", () => {
    const { getByRole, queryByText, errorSpy } = renderWithBoundary(
      createElement(Boom),
    );

    expect(
      getByRole("heading", { name: "This page couldn't be shown." }),
    ).toBeTruthy();
    expect(
      getByRole("link", { name: "Back to your dates" }).getAttribute("href"),
    ).toBe("/dashboard");
    expect(getByRole("button", { name: "Try this page again" })).toBeTruthy();
    expect(queryByText("render exploded for the test")).toBeNull();
    expect(queryByText(/ArgumentValidationError|at ErrorCatch/)).toBeNull();
    errorSpy.mockRestore();
  });

  it("lets Try this page again remount a child that has recovered", () => {
    let shouldThrow = true;
    function Flaky(): ReactNode {
      if (shouldThrow) throw new Error("still broken");
      return createElement(Working, { label: "Recovered view" });
    }

    const { getByRole, errorSpy } = renderWithBoundary(createElement(Flaky));
    expect(
      getByRole("heading", { name: "This page couldn't be shown." }),
    ).toBeTruthy();

    shouldThrow = false;
    fireEvent.click(getByRole("button", { name: "Try this page again" }));
    expect(getByRole("heading", { name: "Recovered view" })).toBeTruthy();
    errorSpy.mockRestore();
  });

  it("leaving the broken URL shows the next page", () => {
    function Probe(): ReactNode {
      const location = useLocation();
      if (location.search.includes("crash")) {
        throw new Error("broken link");
      }
      return createElement("h1", null, "Safe page");
    }

    const { getByRole, errorSpy } = renderWithBoundary(
      createElement(Probe),
      "/dashboard?crash=1",
    );
    expect(
      getByRole("heading", { name: "This page couldn't be shown." }),
    ).toBeTruthy();

    fireEvent.click(getByRole("link", { name: "Back to your dates" }));
    expect(getByRole("heading", { name: "Safe page" })).toBeTruthy();
    errorSpy.mockRestore();
  });

  it("does not remount the app when the route changes", () => {
    let mounts = 0;
    function Probe(): ReactNode {
      useEffect(() => {
        mounts += 1;
      }, []);
      return createElement(
        "div",
        null,
        createElement("h1", null, "Home"),
        createElement(Link, { to: "/profile" }, "Profile"),
      );
    }

    const { getByRole, errorSpy } = renderWithBoundary(createElement(Probe));
    expect(getByRole("heading", { name: "Home" })).toBeTruthy();
    fireEvent.click(getByRole("link", { name: "Profile" }));
    expect(mounts).toBe(1);
    errorSpy.mockRestore();
  });
});
