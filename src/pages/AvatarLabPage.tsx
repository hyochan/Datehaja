import { useState } from "react";
import "./AvatarLabPage.css";
import { useI18n } from "../i18n";
import { AgentAvatar, AgentCharacter, DEFAULT_AVATAR, type AvatarConfig } from "../components/agent/AgentAvatar";
import { AgentAvatarEditor } from "../components/agent/AgentAvatarEditor";
import { AgentHomeWorld } from "../components/agent/AgentDateWorld";

const LOOKS: { name: string; avatar: AvatarConfig }[] = [
  { name: "Juno", avatar: { ...DEFAULT_AVATAR, accessory: "star" } },
  { name: "Iris", avatar: { ...DEFAULT_AVATAR, palette: "violet", hair: "bob", face: "bright", outfit: "starlight" } },
  { name: "Sage", avatar: { ...DEFAULT_AVATAR, palette: "moss", hair: "bun", face: "curious", outfit: "hoodie" } },
  { name: "Sol", avatar: { ...DEFAULT_AVATAR, gender: "male", palette: "ink", hair: "wave", outfit: "blazer", face: "gentle" } },
  { name: "Theo", avatar: { ...DEFAULT_AVATAR, gender: "male", palette: "sky", hair: "crop", face: "bright", accessory: "glasses" } },
  { name: "Leo", avatar: { ...DEFAULT_AVATAR, gender: "male", palette: "sunset", hair: "buzz", outfit: "hoodie", face: "cool", accessory: "headphones" } },
];

/** Dev-only art direction bench. Uses the real editor and world renderer. */
export default function AvatarLabPage() {
  const { t } = useI18n();
  const [avatar, setAvatar] = useState<AvatarConfig>(LOOKS[0].avatar);
  const [name, setName] = useState("Juno");

  return (
    <main className="avatar-lab">
      <header className="avatar-lab-header">
        <div>
          <span className="docket-label">{t("DATEHAJA · CHARACTER STUDIO")}</span>
          <h1>{t("A little more you.")}</h1>
          <p>{t("One character. Every little detail, yours.")}</p>
        </div>
        <a href="/" className="avatar-choice">{t("Back to Datehaja ↗")}</a>
      </header>

      <section className="avatar-lab-looks" aria-label={t("Character looks")}>
        {LOOKS.map((look) => (
          <button key={look.name} type="button" className="avatar-lab-look"
            aria-label={t("Try {agent}'s look", { agent: look.name })}
            aria-pressed={Object.entries(look.avatar).every(([key, value]) => avatar[key as keyof AvatarConfig] === value)}
            onClick={() => { setAvatar(look.avatar); setName(look.name); }}>
            <AgentAvatar name={look.name} avatar={look.avatar} />
            <strong>{look.name}</strong>
          </button>
        ))}
      </section>

      <section className="avatar-lab-workspace">
        <div className="avatar-lab-preview">
          <div className="avatar-lab-portrait">
            <span className="docket-label">{t("MY OTHER SELF")}</span>
            <AgentAvatar name={name} avatar={avatar} label={t("Preview of {agent}", { agent: name })} />
            <h2>{name}</h2>
            <div className="avatar-lab-sizes" aria-label={t("Small avatar previews")}>
              {[24, 40, 64].map((size) => (
                <span key={size} style={{ width: size }}>
                  <AgentAvatar name={name} avatar={avatar} />
                </span>
              ))}
            </div>
          </div>
          <div className="avatar-lab-figure">
            <AgentCharacter name={name} avatar={avatar} />
            <span className="docket-label">{t("READY FOR A FIRST DATE")}</span>
          </div>
        </div>
        <div className="avatar-lab-editor">
          <span className="docket-label">{t("MAKE IT YOURS")}</span>
          <h2>{t("The details make the character.")}</h2>
          <AgentAvatarEditor name={name} value={avatar} onChange={setAvatar} showPreview={false} />
        </div>
      </section>

      <section className="avatar-lab-in-world">
        <div>
          <span className="docket-label">{t("AT HOME IN THE WORLD")}</span>
          <h2>{t("Same look. A life of their own.")}</h2>
          <p>{t("Hair, expression, outfit and accessories carry through to the date.")}</p>
        </div>
        <AgentHomeWorld person={{ name, avatar }} />
      </section>

      <details className="avatar-lab-settings">
        <summary>{t("Settings")}</summary>
        <div className="avatar-lab-settings-editor">
          <AgentAvatarEditor name={name} value={avatar} onChange={setAvatar} />
        </div>
      </details>
    </main>
  );
}
