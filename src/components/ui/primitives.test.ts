import { describe, expect, it } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nProvider } from "../../i18n";
import { Field, Select } from "./primitives";

describe("Select primitive", () => {
  function render(props: Record<string, unknown> = {}) {
    return renderToStaticMarkup(
      createElement(
        Select,
        { value: "b", onChange: () => {}, "aria-label": "Pick one", ...props },
        createElement("option", { value: "a" }, "A"),
        createElement("option", { value: "b" }, "B"),
      ),
    );
  }

  it("hides the native arrow and draws its own inset chevron", () => {
    const html = render();
    expect(html).toContain("appearance-none");
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
    expect(html).toMatch(/<svg[^>]*pointer-events-none/);
    expect(html).toMatch(/<option value="b" selected=""/);
  });

  it("keeps the wrapper class separate from the control", () => {
    const html = render({ className: "w-40", compact: true, invalid: true });
    expect(html).toMatch(/^<span class="[^"]*w-40[^"]*"><select/);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("pr-9");
  });
});

describe("Field primitive", () => {
  function render() {
    return renderToStaticMarkup(
      createElement(
        I18nProvider,
        null,
        createElement(
          // This suite is .ts, not .tsx — vitest only collects *.test.ts — so
          // children travel as createElement's third argument. Field declares
          // children as required, which that form does not satisfy on its own.
          Field as (props: { label: string; htmlFor?: string }) => ReactNode,
          { label: "Name your Dating Agent", htmlFor: "agent-name" },
          createElement("input", { id: "agent-name" }),
        ),
      ),
    );
  }

  it("keeps its label off the prose above it", () => {
    // A label set straight under a paragraph used to sit flush against it and
    // read as one more sentence rather than the name of the control below.
    const html = render();
    expect(html).toContain("mt-5");
  });

  it("does not open a gap above the first field in a section", () => {
    // mt-5 collapses against the previous field's mb-5, so a run of fields keeps
    // its rhythm; first:mt-0 keeps the opening field flush with its heading.
    const html = render();
    expect(html).toContain("first:mt-0");
    expect(html).toContain("mb-5");
  });
});
