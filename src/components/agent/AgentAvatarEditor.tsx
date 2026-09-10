import {
  AgentAvatar,
  AgentCharacter,
  PALETTES,
  AVATAR_OPTIONS,
  type AvatarConfig,
} from "./AgentAvatar";
import type { CSSProperties, ReactNode } from "react";
import { useI18n } from "../../i18n";

const LABELS = {
  gender: {
    female: "Woman",
    male: "Man",
  },
  face: {
    gentle: "Gentle",
    bright: "Bright",
    cool: "Cool",
    curious: "Curious",
  },
  hair: {
    wave: "Wave",
    crop: "Crop",
    bob: "Bob",
    bun: "Bun",
    buzz: "Buzz",
  },
  outfit: {
    cardigan: "Cardigan",
    blazer: "Blazer",
    hoodie: "Hoodie",
    starlight: "Starlight",
  },
  accessory: {
    none: "None",
    glasses: "Glasses",
    headphones: "Headphones",
    star: "Star clip",
    scarf: "Scarf",
  },
} as const;

export function AgentAvatarEditor({
  name,
  value,
  onChange,
  showPreview = true,
}: {
  name: string;
  value: AvatarConfig;
  onChange: (avatar: AvatarConfig) => void;
  showPreview?: boolean;
}) {
  const { t } = useI18n();

  function set<K extends keyof AvatarConfig>(key: K, next: AvatarConfig[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div
      className={`avatar-editor ${showPreview ? "avatar-editor-with-preview" : ""}`}
    >
      {showPreview && (
        <div className="avatar-editor-preview">
          <div className="avatar-editor-character-preview">
            <AgentAvatar
              name={name}
              avatar={value}
              className="agent-avatar-editor-hero"
              label={t("Preview of {agent}", { agent: name || t("my Dating Agent") })}
            />
            <AgentCharacter name={name} avatar={value} className="avatar-editor-full-figure" />
          </div>
          <span className="docket-label">{t("MY OTHER SELF")}</span>
          <strong>{name || t("Name pending")}</strong>
        </div>
      )}

      <div className="avatar-editor-controls">
        <AvatarChoice label={t("Agent")}>
          {AVATAR_OPTIONS.gender.map((option) => (
            <ChoiceButton
              key={option}
              selected={(value.gender ?? "female") === option}
              onClick={() => set("gender", option)}
            >
              {t(LABELS.gender[option])}
            </ChoiceButton>
          ))}
        </AvatarChoice>
        <AvatarChoice label={t("Color")}>
          {AVATAR_OPTIONS.palette.map((option) => (
            <button
              key={option}
              type="button"
              className="avatar-swatch"
              aria-label={t(`${option} palette`)}
              aria-pressed={value.palette === option}
              style={{ "--swatch": PALETTES[option].primary } as CSSProperties}
              onClick={() => set("palette", option)}
            >
              <span />
            </button>
          ))}
        </AvatarChoice>
        <AvatarChoice label={t("Expression")}>
          {AVATAR_OPTIONS.face.map((option) => (
            <ChoiceButton
              key={option}
              selected={value.face === option}
              onClick={() => set("face", option)}
            >
              {t(LABELS.face[option])}
            </ChoiceButton>
          ))}
        </AvatarChoice>
        <AvatarChoice label={t("Hair")}>
          {AVATAR_OPTIONS.hair.map((option) => (
            <ChoiceButton
              key={option}
              selected={value.hair === option}
              onClick={() => set("hair", option)}
            >
              {t(LABELS.hair[option])}
            </ChoiceButton>
          ))}
        </AvatarChoice>
        <AvatarChoice label={t("Outfit")}>
          {AVATAR_OPTIONS.outfit.map((option) => (
            <ChoiceButton
              key={option}
              selected={value.outfit === option}
              onClick={() => set("outfit", option)}
            >
              {t(LABELS.outfit[option])}
            </ChoiceButton>
          ))}
        </AvatarChoice>
        <AvatarChoice label={t("Little detail")}>
          {AVATAR_OPTIONS.accessory.map((option) => (
            <ChoiceButton
              key={option}
              selected={value.accessory === option}
              onClick={() => set("accessory", option)}
            >
              {t(LABELS.accessory[option])}
            </ChoiceButton>
          ))}
        </AvatarChoice>
      </div>
    </div>
  );
}

function AvatarChoice({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="avatar-choice-row">
      <span>{label}</span>
      <div>{children}</div>
    </div>
  );
}

function ChoiceButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="avatar-choice"
      aria-pressed={selected}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
