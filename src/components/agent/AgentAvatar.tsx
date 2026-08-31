/* oxlint-disable react/only-export-components -- the renderer owns its compact avatar contract */
import { useId, type CSSProperties } from "react";

export type AvatarPalette =
  "rose" | "violet" | "moss" | "sky" | "sunset" | "ink";
export type AvatarFace = "gentle" | "bright" | "cool" | "curious";
export type AvatarHair = "wave" | "crop" | "bob" | "bun" | "buzz";
export type AvatarOutfit = "cardigan" | "blazer" | "hoodie" | "starlight";
export type AvatarAccessory =
  "none" | "glasses" | "headphones" | "star" | "scarf";

export type AvatarConfig = {
  palette: AvatarPalette;
  face: AvatarFace;
  hair: AvatarHair;
  outfit: AvatarOutfit;
  accessory: AvatarAccessory;
};

export const DEFAULT_AVATAR: AvatarConfig = {
  palette: "rose",
  face: "gentle",
  hair: "wave",
  outfit: "cardigan",
  accessory: "none",
};

export const AVATAR_OPTIONS = {
  palette: ["rose", "violet", "moss", "sky", "sunset", "ink"],
  face: ["gentle", "bright", "cool", "curious"],
  hair: ["wave", "crop", "bob", "bun", "buzz"],
  outfit: ["cardigan", "blazer", "hoodie", "starlight"],
  accessory: ["none", "glasses", "headphones", "star", "scarf"],
} as const;

export const AVATAR_SPRITES: Record<AvatarPalette, string> = {
  rose: "/agents/sprite-rose-v1.png",
  violet: "/agents/sprite-violet-v1.png",
  moss: "/agents/sprite-moss-v1.png",
  sky: "/agents/sprite-sky-v1.png",
  sunset: "/agents/sprite-sunset-v1.png",
  ink: "/agents/sprite-ink-v1.png",
};

export function spriteForAvatar(avatar: AvatarConfig) {
  return AVATAR_SPRITES[avatar.palette];
}

const PALETTES: Record<
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
    primary: "#d94f68",
    deep: "#6b3045",
    ink: "#2e1d27",
  },
  violet: {
    background: "#e8e0f5",
    glow: "#fff5fa",
    primary: "#8665c8",
    deep: "#483667",
    ink: "#261e31",
  },
  moss: {
    background: "#dfe9dc",
    glow: "#fff7e8",
    primary: "#5c8b6a",
    deep: "#345143",
    ink: "#1d2d25",
  },
  sky: {
    background: "#dcecf4",
    glow: "#fff8ee",
    primary: "#4e91b6",
    deep: "#31536f",
    ink: "#1c2934",
  },
  sunset: {
    background: "#f5dfcf",
    glow: "#fff6d9",
    primary: "#df7b4f",
    deep: "#7b3e3c",
    ink: "#34231f",
  },
  ink: {
    background: "#d9d9dc",
    glow: "#f8f1e7",
    primary: "#444751",
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
    palette:
      avatar?.palette ??
      AVATAR_OPTIONS.palette[hash % AVATAR_OPTIONS.palette.length],
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
  const id = useId().replaceAll(":", "");
  const config = avatarForName(name, avatar);
  const palette = PALETTES[config.palette];

  return (
    <span
      className={`agent-avatar ${className}`.trim()}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={
        {
          "--avatar-bg": palette.background,
          "--avatar-glow": palette.glow,
          "--avatar-primary": palette.primary,
          "--avatar-deep": palette.deep,
          "--avatar-ink": palette.ink,
        } as CSSProperties
      }
    >
      <svg viewBox="0 0 160 184" focusable="false">
        <defs>
          <linearGradient id={`${id}-back`} x1="18" y1="12" x2="142" y2="174">
            <stop stopColor={palette.glow} />
            <stop offset="1" stopColor={palette.background} />
          </linearGradient>
          <linearGradient id={`${id}-coat`} x1="52" y1="118" x2="112" y2="180">
            <stop stopColor={palette.primary} />
            <stop offset="1" stopColor={palette.deep} />
          </linearGradient>
        </defs>

        <rect
          x="3"
          y="3"
          width="154"
          height="178"
          rx="38"
          fill={`url(#${id}-back)`}
        />
        <circle cx="26" cy="31" r="10" fill={palette.primary} opacity=".1" />
        <circle cx="137" cy="62" r="18" fill={palette.primary} opacity=".08" />
        <path
          d="M16 150c28-11 52-14 73-10 23 4 42 1 57-8v49H16z"
          fill={palette.primary}
          opacity=".08"
        />

        {config.hair === "bun" && (
          <circle cx="103" cy="42" r="20" fill={palette.ink} />
        )}

        <path d="M68 116h24v25H68z" fill="#e6b9a8" />
        <path
          d="M37 178c2-30 17-47 43-47s41 17 43 47z"
          fill={`url(#${id}-coat)`}
        />

        {config.outfit === "cardigan" && (
          <>
            <path d="M80 134 66 178h28z" fill={palette.glow} opacity=".95" />
            <path
              d="m80 134-10 18m10-18 10 18"
              stroke={palette.deep}
              strokeWidth="2.5"
              fill="none"
            />
            <circle cx="80" cy="159" r="2" fill={palette.deep} />
          </>
        )}
        {config.outfit === "blazer" && (
          <>
            <path
              d="m80 134-16 8 12 15 4 21zM80 134l16 8-12 15-4 21z"
              fill={palette.deep}
              opacity=".84"
            />
            <path d="M76 134h8l-1 16h-6z" fill={palette.glow} />
          </>
        )}
        {config.outfit === "hoodie" && (
          <>
            <path
              d="M55 145c4-14 13-21 25-21s21 7 25 21"
              stroke={palette.glow}
              strokeWidth="8"
              fill="none"
              opacity=".72"
            />
            <path
              d="M72 142v18m16-18v18"
              stroke={palette.glow}
              strokeWidth="2"
            />
            <circle cx="72" cy="161" r="2.5" fill={palette.glow} />
            <circle cx="88" cy="161" r="2.5" fill={palette.glow} />
          </>
        )}
        {config.outfit === "starlight" && (
          <>
            <path
              d="M48 156h64"
              stroke={palette.glow}
              strokeWidth="1"
              opacity=".6"
            />
            <path
              d="m63 146 2 4 4 2-4 2-2 4-2-4-4-2 4-2zm32 14 1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z"
              fill={palette.glow}
            />
          </>
        )}

        <ellipse cx="80" cy="87" rx="42" ry="45" fill="#efc8b5" />
        <circle cx="38" cy="90" r="7" fill="#e6b9a8" />
        <circle cx="122" cy="90" r="7" fill="#e6b9a8" />

        {config.hair === "wave" && (
          <path
            d="M39 90c-8-38 15-61 45-58 29 3 43 25 36 62-7-7-8-17-8-28-13 3-28-2-39-13-7 13-19 22-34 25z"
            fill={palette.ink}
          />
        )}
        {config.hair === "crop" && (
          <path
            d="M41 74c1-29 18-45 42-45 23 0 39 15 40 40-12-6-22-15-26-26-10 15-31 26-56 31z"
            fill={palette.ink}
          />
        )}
        {config.hair === "bob" && (
          <path
            d="M38 91c-5-39 13-61 43-61 31 0 46 23 42 65l-12 17-2-42c-10-3-21-9-29-20-8 12-18 20-31 22l1 40z"
            fill={palette.ink}
          />
        )}
        {config.hair === "bun" && (
          <path
            d="M39 81c-2-33 16-52 43-52 25 0 42 19 40 51-12-5-22-16-27-31-10 17-28 28-56 32z"
            fill={palette.ink}
          />
        )}
        {config.hair === "buzz" && (
          <path
            d="M41 70c5-27 20-39 41-39 22 0 36 14 40 39-15-7-28-16-39-28-10 12-24 22-42 28z"
            fill={palette.ink}
          />
        )}

        <path
          d="M58 80c4-3 9-3 13 0M89 80c4-3 9-3 13 0"
          stroke={palette.ink}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity=".75"
        />

        {config.face === "gentle" && (
          <>
            <path
              d="M59 91c3 3 7 3 10 0m22 0c3 3 7 3 10 0"
              stroke={palette.ink}
              strokeWidth="2.7"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M71 106c6 5 12 5 18 0"
              stroke={palette.deep}
              strokeWidth="2.7"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}
        {config.face === "bright" && (
          <>
            <circle cx="64" cy="91" r="3.5" fill={palette.ink} />
            <circle cx="96" cy="91" r="3.5" fill={palette.ink} />
            <path
              d="M69 105c7 9 15 9 22 0"
              stroke={palette.deep}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}
        {config.face === "cool" && (
          <>
            <path
              d="M59 92h10m22 0h10"
              stroke={palette.ink}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M73 108h14"
              stroke={palette.deep}
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </>
        )}
        {config.face === "curious" && (
          <>
            <circle cx="64" cy="92" r="3.4" fill={palette.ink} />
            <path
              d="M91 91c3 3 7 3 10 0"
              stroke={palette.ink}
              strokeWidth="2.7"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M73 108c5 3 10 3 15-1"
              stroke={palette.deep}
              strokeWidth="2.7"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}

        <circle cx="53" cy="101" r="5" fill={palette.primary} opacity=".14" />
        <circle cx="107" cy="101" r="5" fill={palette.primary} opacity=".14" />

        {config.accessory === "glasses" && (
          <g fill="none" stroke={palette.deep} strokeWidth="2.2">
            <circle cx="64" cy="92" r="11" />
            <circle cx="96" cy="92" r="11" />
            <path d="M75 91h10m-33-2-12-4m68 4 12-4" />
          </g>
        )}
        {config.accessory === "headphones" && (
          <g fill="none" stroke={palette.primary} strokeWidth="5">
            <path d="M43 87c0-29 14-45 37-45s37 16 37 45" />
            <path d="M42 85v19m76-19v19" strokeLinecap="round" />
          </g>
        )}
        {config.accessory === "star" && (
          <path
            d="m111 55 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"
            fill={palette.primary}
          />
        )}
        {config.accessory === "scarf" && (
          <path
            d="M62 126c11 7 25 7 36 0l4 13c-14 8-30 8-44 0z"
            fill={palette.glow}
            stroke={palette.primary}
            strokeWidth="2"
          />
        )}
      </svg>
      <span className="agent-avatar-spark" aria-hidden>
        ✦
      </span>
    </span>
  );
}
