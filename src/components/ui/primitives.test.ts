import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Select } from "./primitives";

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
