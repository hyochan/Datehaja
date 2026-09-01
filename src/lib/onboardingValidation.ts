import { ageOn, parseDobString } from "@convex/lib/age";

export const IDEAL_PERSON_MIN_CHARACTERS = 20;
export const ABOUT_ME_MIN_NAME_CHARACTERS = 2;
export const ABOUT_ME_MIN_INTERESTS = 3;
export const ABOUT_ME_MAX_INTERESTS = 8;
export const ABOUT_ME_MIN_PERSONALITIES = 2;
export const ABOUT_ME_MIN_ESSENCE_CHARACTERS = 30;

export function getIdealPersonProgress(
  interestedIn: readonly string[],
  desiredConnection: string,
) {
  const descriptionLength = desiredConnection.trim().length;
  const descriptionRemaining = Math.max(
    0,
    IDEAL_PERSON_MIN_CHARACTERS - descriptionLength,
  );
  const hasAudience = interestedIn.length > 0;
  const hasEnoughDescription = descriptionRemaining === 0;

  return {
    completedRequirements: Number(hasAudience) + Number(hasEnoughDescription),
    descriptionLength,
    descriptionRemaining,
    hasAudience,
    hasEnoughDescription,
    isReady: hasAudience && hasEnoughDescription,
  };
}

export function getAboutMeProgress(
  input: {
    displayName: string;
    dob: string;
    existingAge?: number;
    interests: readonly string[];
    personalityTraits: readonly string[];
    essence: string;
  },
  nowMs = Date.now(),
) {
  const nameLength = input.displayName.trim().length;
  const essenceLength = input.essence.trim().length;
  const parsedDob = input.dob ? parseDobString(input.dob) : null;
  const typedAge = parsedDob === null ? null : ageOn(parsedDob, nowMs);
  const effectiveAge = input.dob ? typedAge : (input.existingAge ?? null);
  const hasName = nameLength >= ABOUT_ME_MIN_NAME_CHARACTERS;
  const hasAdultDob =
    effectiveAge !== null && effectiveAge >= 18 && effectiveAge <= 100;
  const hasInterests = input.interests.length >= ABOUT_ME_MIN_INTERESTS;
  const hasPersonality =
    input.personalityTraits.length >= ABOUT_ME_MIN_PERSONALITIES;
  const hasEssence = essenceLength >= ABOUT_ME_MIN_ESSENCE_CHARACTERS;

  return {
    age: effectiveAge,
    completedRequirements:
      Number(hasName) +
      Number(hasAdultDob) +
      Number(hasInterests) +
      Number(hasPersonality) +
      Number(hasEssence),
    essenceLength,
    essenceRemaining: Math.max(
      0,
      ABOUT_ME_MIN_ESSENCE_CHARACTERS - essenceLength,
    ),
    hasAdultDob,
    hasEssence,
    hasInterests,
    hasName,
    hasPersonality,
    isReady:
      hasName && hasAdultDob && hasInterests && hasPersonality && hasEssence,
    nameLength,
  };
}
