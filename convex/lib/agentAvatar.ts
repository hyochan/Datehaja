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

/** Site-relative path of the hosted character sprite for a palette. */
export function spritePathFor(palette: AvatarPaletteName): string {
  return `/agents/sprite-${palette}-v1.png`;
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
});
