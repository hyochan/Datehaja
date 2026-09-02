import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nProvider } from "../../i18n";
import { AgentAvatarEditor } from "./AgentAvatarEditor";
import { DEFAULT_AVATAR } from "./AgentAvatar";

function render(avatar = DEFAULT_AVATAR) {
  return renderToStaticMarkup(
    createElement(
      I18nProvider,
      null,
      createElement(AgentAvatarEditor, {
        name: "Juno",
        value: avatar,
        onChange: () => {},
      }),
    ),
  );
}

describe("agent avatar editor", () => {
  it("offers the woman/man base and marks the current one", () => {
    const markup = render();
    expect(markup).toContain(">Woman<");
    expect(markup).toContain(">Man<");
    expect(markup).toMatch(/aria-pressed="true"[^>]*>Woman</);
    expect(markup).toMatch(/aria-pressed="false"[^>]*>Man</);
  });

  it("treats an avatar saved before the base existed as the woman", () => {
    const { gender: _legacy, ...legacyAvatar } = DEFAULT_AVATAR;
    const markup = render({ ...legacyAvatar, palette: "sky" });
    expect(markup).toMatch(/aria-pressed="true"[^>]*>Woman</);
  });

  it("marks the man when chosen", () => {
    const markup = render({ ...DEFAULT_AVATAR, gender: "male" });
    expect(markup).toMatch(/aria-pressed="true"[^>]*>Man</);
    expect(markup).toMatch(/aria-pressed="false"[^>]*>Woman</);
  });
});
