/* oxlint-disable react/only-export-components -- the renderer owns its compact avatar contract */
import type { CSSProperties } from "react";
import { AgentCharacterArt } from "./AgentCharacterArt";
import {
  AVATAR_GENDERS,
  AVATAR_PALETTES,
  DEFAULT_AVATAR_GENDER,
  avatarPaletteForName,
} from "@convex/lib/agentAvatar";

export type AvatarPalette = (typeof AVATAR_PALETTES)[number];
export type AvatarFace = "gentle" | "bright" | "cool" | "curious";
export type AvatarHair = "wave" | "crop" | "bob" | "bun" | "buzz";
export type AvatarOutfit = "cardigan" | "blazer" | "hoodie" | "starlight";
export type AvatarAccessory =
  "none" | "glasses" | "headphones" | "star" | "scarf";
export type AvatarGender = (typeof AVATAR_GENDERS)[number];

export type AvatarConfig = {
  palette: AvatarPalette;
  face: AvatarFace;
  hair: AvatarHair;
  outfit: AvatarOutfit;
  accessory: AvatarAccessory;
  /** Face shape and body proportions; older saved avatars have no gender. */
  gender?: AvatarGender;
};

export const DEFAULT_AVATAR: AvatarConfig = {
  palette: "rose",
  face: "gentle",
  hair: "wave",
  outfit: "cardigan",
  accessory: "none",
  gender: DEFAULT_AVATAR_GENDER,
};

export const AVATAR_OPTIONS = {
  gender: AVATAR_GENDERS,
  palette: AVATAR_PALETTES,
  face: ["gentle", "bright", "cool", "curious"],
  hair: ["wave", "crop", "bob", "bun", "buzz"],
  outfit: ["cardigan", "blazer", "hoodie", "starlight"],
  accessory: ["none", "glasses", "headphones", "star", "scarf"],
} as const;

/** Seconds to offset idle motion so a row of agents never blinks in unison. */
export function idleDelayForName(name: string) {
  return (hashName(name || "Datehaja") % 47) / 10;
}

export const PALETTES: Record<
  AvatarPalette,
  {
    background: string;
    glow: string;
    primary: string;
    deep: string;
    ink: string;
  }
> = {
  rose: {
    background: "#f8dedf",
    glow: "#fff4eb",
    primary: "#bc697c",
    deep: "#6b3045",
    ink: "#2e1d27",
  },
  violet: {
    background: "#e8e0f5",
    glow: "#fff5fa",
    primary: "#9584b9",
    deep: "#483667",
    ink: "#261e31",
  },
  moss: {
    background: "#dfe9dc",
    glow: "#fff7e8",
    primary: "#70927d",
    deep: "#345143",
    ink: "#1d2d25",
  },
  sky: {
    background: "#dcecf4",
    glow: "#fff8ee",
    primary: "#789db6",
    deep: "#31536f",
    ink: "#1c2934",
  },
  sunset: {
    background: "#f5dfcf",
    glow: "#fff6d9",
    primary: "#c88d68",
    deep: "#7b3e3c",
    ink: "#34231f",
  },
  ink: {
    background: "#d9d9dc",
    glow: "#f8f1e7",
    primary: "#646774",
    deep: "#20212a",
    ink: "#14141a",
  },
};

function hashName(name: string) {
  return [...name].reduce(
    (value, character) => value + character.charCodeAt(0),
    0,
  );
}

export function avatarForName(
  name: string,
  avatar?: Partial<AvatarConfig> | null,
): AvatarConfig {
  const hash = hashName(name || "Datehaja");
  return {
    // Keep palette selection stable across the app and legacy email assets.
    palette: avatarPaletteForName(name, avatar?.palette),
    face:
      avatar?.face ?? AVATAR_OPTIONS.face[hash % AVATAR_OPTIONS.face.length],
    hair:
      avatar?.hair ??
      AVATAR_OPTIONS.hair[(hash * 3) % AVATAR_OPTIONS.hair.length],
    outfit:
      avatar?.outfit ??
      AVATAR_OPTIONS.outfit[(hash * 5) % AVATAR_OPTIONS.outfit.length],
    accessory:
      avatar?.accessory ??
      AVATAR_OPTIONS.accessory[(hash * 7) % AVATAR_OPTIONS.accessory.length],
    gender: avatar?.gender ?? DEFAULT_AVATAR_GENDER,
  };
}

export function AgentAvatar({
  name,
  avatar,
  className = "",
  label,
}: {
  name: string;
  avatar?: Partial<AvatarConfig> | null;
  className?: string;
  label?: string;
}) {
  const config = avatarForName(name, avatar);
  const palette = PALETTES[config.palette];

  return (
    <span
      className={`agent-avatar ${className}`.trim()}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-avatar-gender={config.gender}
      data-avatar-hair={config.hair}
      data-avatar-accessory={config.accessory}
      style={
        {
          "--avatar-bg": palette.background,
          "--avatar-glow": palette.glow,
          "--avatar-primary": palette.primary,
          "--avatar-deep": palette.deep,
          "--avatar-ink": palette.ink,
          // Stagger the idle animations per agent so a row of avatars never
          // blinks or breathes in unison.
          "--avatar-anim-delay": `${(hashName(name || "Datehaja") % 47) / 10}s`,
        } as CSSProperties
      }
    >
      <AgentCharacterArt config={config} colors={palette} />
      <span className="agent-avatar-spark" aria-hidden>
        ✦
      </span>
    </span>
  );
}

/** Transparent full figure, composed from the same parts as the portrait. */
export function AgentCharacter({
  name,
  avatar,
  className = "",
}: {
  name: string;
  avatar?: Partial<AvatarConfig> | null;
  className?: string;
}) {
  const config = avatarForName(name, avatar);
  return (
    <AgentCharacterArt
      config={config}
      colors={PALETTES[config.palette]}
      fullBody
      className={className}
    />
  );
}
