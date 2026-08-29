export const LEGAL_EFFECTIVE_DATE = "2026-08-29";

export const LEGAL_VERSIONS = Object.freeze({
  terms: "2026-08-29-v2",
  privacy: "2026-08-29-v2",
  community: "2026-08-29-v2",
});

export const LEGAL_CONTACT_EMAIL = "datehaja-concierge@agentmail.to";

export function legalVersionsMatch(versions: {
  terms: string;
  privacy: string;
  community: string;
}): boolean {
  return (
    versions.terms === LEGAL_VERSIONS.terms &&
    versions.privacy === LEGAL_VERSIONS.privacy &&
    versions.community === LEGAL_VERSIONS.community
  );
}
