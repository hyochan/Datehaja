import type { Gender } from "./enums";

/**
 * Privacy projections.
 *
 * Datehaja's contract with its users is that another person only ever sees the
 * handful of fields below — never an exact address, never an email address,
 * never a phone number, never coordinates, never the raw profile document.
 * Every path that returns another user's data goes through here.
 */

export type PublicPreview = {
  displayName: string;
  age: number;
  area: string;
  city: string;
  occupation: string | null;
  interests: string[];
  languages: string[];
  socialEnergy: string;
  pronouns: string | null;
  bio: string;
  personalityTraits: string[];
  styleTags: string[];
  firstDateVibe: string[];
  relationshipIntent: string | null;
  isDemo: boolean;
};

type ProfileLike = {
  displayName: string;
  ageYears: number;
  neighborhood: string;
  city: string;
  occupationCategory?: string;
  showOccupation: boolean;
  interests: string[];
  hobbies: string[];
  languages: string[];
  socialEnergy: string;
  pronouns?: string;
  bio: string;
  personalityTraits?: string[];
  styleTags?: string[];
  firstDateVibe: string[];
  isDemo: boolean;
};

/** Fields never shown before both people have accepted. */
export const MAX_PREVIEW_INTERESTS = 5;

export function toPublicPreview(
  profile: ProfileLike,
  relationshipIntent?: string,
): PublicPreview {
  return {
    displayName: firstNameOnly(profile.displayName),
    age: profile.ageYears,
    area: profile.neighborhood,
    city: profile.city,
    occupation: profile.showOccupation
      ? (profile.occupationCategory ?? null)
      : null,
    interests: [...profile.interests, ...profile.hobbies].slice(
      0,
      MAX_PREVIEW_INTERESTS,
    ),
    languages: profile.languages.slice(0, 3),
    socialEnergy: profile.socialEnergy,
    pronouns: profile.pronouns ?? null,
    bio: profile.bio,
    personalityTraits: (profile.personalityTraits ?? []).slice(0, 5),
    styleTags: (profile.styleTags ?? []).slice(0, 3),
    firstDateVibe: profile.firstDateVibe.slice(0, 4),
    relationshipIntent: relationshipIntent ?? null,
    isDemo: profile.isDemo,
  };
}

/**
 * Datehaja shows a first name only. If a user typed a full name we trim it
 * rather than publishing more than they meant to share.
 */
export function firstNameOnly(displayName: string): string {
  const trimmed = displayName.trim();
  if (!trimmed) return "Someone";
  const [first] = trimmed.split(/\s+/);
  return first.length > 24 ? first.slice(0, 24) : first;
}

/** Everything a user is allowed to learn once the date is confirmed. Still no
 *  email, phone, home address, or coordinates — only the venue is public. */
export type ConfirmedPreview = PublicPreview & {
  photoUrl: string | null;
};

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const PHONE_RE = /(?:\+?\d[\d\s().-]{7,}\d)/g;
const URL_RE = /\b(?:https?:\/\/|www\.)\S+/gi;
const HANDLE_RE = /(?:^|\s)@[A-Za-z0-9._]{2,}/g;
const MESSENGER_RE =
  /\b(?:kakao|katalk|카톡|카카오|line\s*id|wechat|telegram|insta(?:gram)?|snapchat|whats\s*app)\b\s*[:-]?\s*\S{2,}/gi;

/**
 * Strip contact handles out of free text before it is shown to another user.
 * The whole point of Datehaja is that you meet without trading contact details,
 * so bios and notes are scrubbed rather than trusted.
 */
export function redactContactInfo(text: string): string {
  return text
    .replace(EMAIL_RE, "[removed]")
    .replace(URL_RE, "[removed]")
    .replace(MESSENGER_RE, "[removed]")
    .replace(PHONE_RE, "[removed]")
    .replace(HANDLE_RE, " [removed]")
    .replace(/\s{3,}/g, "  ")
    .trim();
}

export function containsContactInfo(text: string): boolean {
  return redactContactInfo(text) !== text.trim();
}

/** Coarse label so we never say "3.7 km away" — that inverts to a location. */
export function describeDistance(km: number): string {
  if (km < 2) return "Just around the corner";
  if (km < 6) return "A short ride away";
  if (km < 15) return "Across town";
  if (km < 40) return "A bit of a trip";
  return "Long distance";
}

export function genderLabel(g: Gender): string {
  switch (g) {
    case "woman":
      return "Woman";
    case "man":
      return "Man";
    case "nonbinary":
      return "Non-binary";
    default:
      return "Other";
  }
}
