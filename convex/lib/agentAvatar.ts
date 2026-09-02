import { v } from "convex/values";

/**
 * Single source of truth for the Agent avatar palette set, the name-hash
 * fallback, and the hosted sprite path. The app renderer
 * (src/components/agent/AgentAvatar.tsx) and the email pipeline both build on
 * these so an agent shows the same face everywhere.
 */
export const AVATAR_PALETTES = [
  "rose",
  "violet",
  "moss",
  "sky",
  "sunset",
  "ink",
] as const;

export type AvatarPaletteName = (typeof AVATAR_PALETTES)[number];

export function hashAgentName(name: string): number {
  return [...(name || "Datehaja")].reduce(
    (value, character) => value + character.charCodeAt(0),
    0,
  );
}

/** The palette an agent renders with: its chosen one, else derived from name. */
export function avatarPaletteForName(
  name: string,
  palette?: string,
): AvatarPaletteName {
  if (
    palette &&
    (AVATAR_PALETTES as readonly string[]).includes(palette)
  ) {
    return palette as AvatarPaletteName;
  }
  return AVATAR_PALETTES[hashAgentName(name) % AVATAR_PALETTES.length];
}

export const AVATAR_FACES = ["gentle", "bright", "cool", "curious"] as const;
export type AvatarFaceName = (typeof AVATAR_FACES)[number];

export const AVATAR_GENDERS = ["female", "male"] as const;
export type AvatarGenderName = (typeof AVATAR_GENDERS)[number];
export const DEFAULT_AVATAR_GENDER: AvatarGenderName = "female";

/**
 * The painted sprite set: one base character per gender, recoloured into every
 * palette, with a sprite per expression. Files live in public/agents/v3 as
 * `<gender>-<palette>-<face>.png`. An expression is listed here only once its
 * art exists; anything missing falls back to the gender's first expression.
 */
export const SPRITE_V3_FACES: Record<AvatarGenderName, readonly AvatarFaceName[]> = {
  female: ["gentle", "bright", "cool", "curious"],
  male: ["gentle", "bright", "cool", "curious"],
};

/** Genders that have an eyes-closed frame (`<gender>-<palette>-blink.png`). */
export const SPRITE_V3_BLINK: Record<AvatarGenderName, boolean> = {
  female: true,
  male: true,
};

/** The eyes-closed frame layered over the sprite for a blink, if drawn. */
export function blinkSpritePathFor(
  palette: AvatarPaletteName,
  gender?: string,
): string | null {
  const who = (
    gender && (AVATAR_GENDERS as readonly string[]).includes(gender)
      ? gender
      : DEFAULT_AVATAR_GENDER
  ) as AvatarGenderName;
  if (!SPRITE_V3_BLINK[who]) return null;
  return `/agents/v3/${who}-${palette}-blink.png`;
}

/**
 * Site-relative path of the hosted character sprite: the owner's gender and
 * palette, showing the expression they picked when that art exists.
 */
export function spritePathFor(
  palette: AvatarPaletteName,
  face?: string,
  gender?: string,
): string {
  const who = (
    gender && (AVATAR_GENDERS as readonly string[]).includes(gender)
      ? gender
      : DEFAULT_AVATAR_GENDER
  ) as AvatarGenderName;
  const faces = SPRITE_V3_FACES[who] as readonly string[];
  const expression = face && faces.includes(face) ? face : faces[0];
  return `/agents/v3/${who}-${palette}-${expression}.png`;
}

export const agentAvatarValidator = v.object({
  palette: v.union(
    v.literal("rose"),
    v.literal("violet"),
    v.literal("moss"),
    v.literal("sky"),
    v.literal("sunset"),
    v.literal("ink"),
  ),
  face: v.union(
    v.literal("gentle"),
    v.literal("bright"),
    v.literal("cool"),
    v.literal("curious"),
  ),
  hair: v.union(
    v.literal("wave"),
    v.literal("crop"),
    v.literal("bob"),
    v.literal("bun"),
    v.literal("buzz"),
  ),
  outfit: v.union(
    v.literal("cardigan"),
    v.literal("blazer"),
    v.literal("hoodie"),
    v.literal("starlight"),
  ),
  accessory: v.union(
    v.literal("none"),
    v.literal("glasses"),
    v.literal("headphones"),
    v.literal("star"),
    v.literal("scarf"),
  ),
  // Optional so avatars saved before the painted set keep validating.
  gender: v.optional(v.union(v.literal("female"), v.literal("male"))),
});
