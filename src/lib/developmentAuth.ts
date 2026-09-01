export const DEVELOPMENT_SIGN_IN_CODE = "68686868";

const DEVELOPMENT_TEST_EMAIL = /^hyo(?:\+test[\w.+-]*)?@hyo\.dev$/i;

export function isLocalDevelopmentTestEmail(
  identifier: string,
  isDevelopment = import.meta.env.DEV,
): boolean {
  return (
    isDevelopment &&
    DEVELOPMENT_TEST_EMAIL.test(identifier.trim().toLowerCase())
  );
}

export function localDevelopmentCodeFor(
  identifier: string,
  isDevelopment = import.meta.env.DEV,
): string | null {
  return isLocalDevelopmentTestEmail(identifier, isDevelopment)
    ? DEVELOPMENT_SIGN_IN_CODE
    : null;
}
