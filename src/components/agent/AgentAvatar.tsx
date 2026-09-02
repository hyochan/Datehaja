/* oxlint-disable react/only-export-components -- the renderer owns its compact avatar contract */
import { useId, type CSSProperties } from "react";
import {
  AVATAR_PALETTES,
  avatarPaletteForName,
  spritePathFor,
} from "@convex/lib/agentAvatar";

export type AvatarPalette = (typeof AVATAR_PALETTES)[number];
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
  palette: AVATAR_PALETTES,
  face: ["gentle", "bright", "cool", "curious"],
  hair: ["wave", "crop", "bob", "bun", "buzz"],
  outfit: ["cardigan", "blazer", "hoodie", "starlight"],
  accessory: ["none", "glasses", "headphones", "star", "scarf"],
} as const;

export const AVATAR_SPRITES = Object.fromEntries(
  AVATAR_PALETTES.map((palette) => [palette, spritePathFor(palette)]),
) as Record<AvatarPalette, string>;

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
    // Shared with the email pipeline (convex/lib/agentAvatar.ts) so an agent
    // shows the same face in the app and in every debrief email.
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

        {config.accessory === "headphones" && (
          <path
            d="M40 94V79c0-33 16-52 40-52s40 19 40 52v15"
            stroke={palette.primary}
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {config.hair === "bun" && (
          <circle cx="105" cy="38" r="18" fill={palette.ink} />
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
          <>
            <path
              d="M38 94c-8-37 11-64 42-64 30 0 48 25 42 65-8-6-11-18-10-31-10 3-21 0-30-8-7 10-18 17-34 20-1 8-3 14-10 18z"
              fill={palette.ink}
            />
            <path
              d="M43 72c6-2 10 1 14 6m51-13c-6 0-10 3-13 8"
              stroke={palette.deep}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity=".7"
            />
          </>
        )}
        {config.hair === "crop" && (
          <>
            <path
              d="M40 76c1-29 17-46 42-46 22 0 37 13 41 37-9-2-17-8-22-17-10 12-28 21-49 22l-12 4z"
              fill={palette.ink}
            />
            <path
              d="m58 49 7 8 7-13 8 10 9-14 8 11"
              stroke={palette.deep}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity=".65"
            />
          </>
        )}
        {config.hair === "bob" && (
          <>
            <path
              d="M37 92c-4-40 13-63 44-63 30 0 46 23 43 64l-10 23-7-5 2-39c-11-3-21-10-29-21-8 12-18 20-30 23l2 37-7 6z"
              fill={palette.ink}
            />
            <path
              d="M43 108c5 5 10 7 16 7m58-8c-4 5-9 7-15 7"
              stroke={palette.deep}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}
        {config.hair === "bun" && (
          <>
            <path
              d="M39 81c-2-33 16-52 43-52 25 0 42 19 40 51-12-5-22-16-27-31-10 17-28 28-56 32z"
              fill={palette.ink}
            />
            <path
              d="M88 34c8 0 15 4 20 10"
              stroke={palette.deep}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity=".7"
            />
          </>
        )}
        {config.hair === "buzz" && (
          <>
            <path
              d="M41 72c4-27 19-42 41-42 23 0 38 16 41 43-12-6-26-9-41-9-16 0-30 3-41 8z"
              fill="#d9ad9d"
              stroke={palette.ink}
              strokeWidth="2"
            />
            <path
              d="M50 59h2m8-10h2m10 8h2m8-15h2m9 13h2m8-8h2M56 66h2m15-3h2m15 1h2m13 3h2"
              stroke={palette.ink}
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity=".62"
            />
          </>
        )}

        {config.accessory === "headphones" && (
          <g>
            <rect
              x="31"
              y="82"
              width="16"
              height="29"
              rx="8"
              fill={palette.primary}
              stroke={palette.glow}
              strokeWidth="2"
            />
            <rect
              x="113"
              y="82"
              width="16"
              height="29"
              rx="8"
              fill={palette.primary}
              stroke={palette.glow}
              strokeWidth="2"
            />
            <path
              d="M37 89v15m86-15v15"
              stroke={palette.deep}
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity=".75"
            />
          </g>
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
            <g className="agent-avatar-eyes">
              <path
                d="M59 91c3 3 7 3 10 0m22 0c3 3 7 3 10 0"
                stroke={palette.ink}
                strokeWidth="2.7"
                strokeLinecap="round"
                fill="none"
              />
            </g>
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
            <g className="agent-avatar-eyes">
              <circle cx="64" cy="91" r="3.5" fill={palette.ink} />
              <circle cx="96" cy="91" r="3.5" fill={palette.ink} />
            </g>
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
            <g className="agent-avatar-eyes">
              <path
                d="M59 92h10m22 0h10"
                stroke={palette.ink}
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
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
            <g className="agent-avatar-eyes">
              <circle cx="64" cy="92" r="3.4" fill={palette.ink} />
              <path
                d="M91 91c3 3 7 3 10 0"
                stroke={palette.ink}
                strokeWidth="2.7"
                strokeLinecap="round"
                fill="none"
              />
            </g>
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
