import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../../i18n";
import { MissingDate } from "./MissingDate";

describe("missing date surface", () => {
  it("names the missing date and offers a way back", () => {
    const html = renderToStaticMarkup(
      createElement(
        I18nProvider,
        null,
        createElement(MemoryRouter, null, createElement(MissingDate)),
      ),
    );
    expect(html).toContain("This story isn&#x27;t here.");
    expect(html).toContain(
      "It may have ended, or it belongs to another person.",
    );
    expect(html).toContain("Back to my Dating Agent");
    expect(html).toContain('href="/dashboard"');
    expect(html).toContain('role="alert"');
  });
});
