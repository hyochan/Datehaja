export const EMAIL_OTP_LENGTH = 8;
const DEV_TEST_ALIAS = /^hyo\+test[\w.+-]*@hyo\.dev$/i;

const OTP_MODULUS = 100_000_000;
const UINT32_RANGE = 0x1_0000_0000;
const UNBIASED_LIMIT = Math.floor(UINT32_RANGE / OTP_MODULUS) * OTP_MODULUS;

export function isDevelopmentOtpEmail(
  identifier: string,
  configuredEmails: string,
): boolean {
  const normalizedEmail = identifier.trim().toLowerCase();
  if (DEV_TEST_ALIAS.test(normalizedEmail)) return true;
  return configuredEmails
    .split(",")
    .some((email) => email.trim().toLowerCase() === normalizedEmail);
}

/** Generate a cryptographically random eight-digit code without modulo bias. */
export function generateEmailOtp(): string {
  const values = new Uint32Array(1);
  do {
    crypto.getRandomValues(values);
  } while (values[0] >= UNBIASED_LIMIT);
  return String(values[0] % OTP_MODULUS).padStart(EMAIL_OTP_LENGTH, "0");
}

export function otpEmailContent({
  token,
  expires,
}: {
  token: string;
  expires: Date;
}) {
  const expiry = expires.toISOString();
  return {
    subject: `${token} — your Datehaja sign-in code`,
    text: `Your Datehaja sign-in code is ${token}. It expires in 10 minutes.\n\nIf you did not request this code, you can ignore this email. Never share this code with anyone.`,
    html: `<!doctype html><html><body style="margin:0;background:#fff9f7;color:#2f2028;font-family:system-ui,-apple-system,sans-serif"><div style="max-width:520px;margin:0 auto;padding:48px 24px"><p style="margin:0 0 22px;color:#c74458;font-size:12px;font-weight:800;letter-spacing:.16em">DATEHAJA · PRIVATE SIGN-IN</p><h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:34px;font-weight:500">Your Agent is waiting.</h1><p style="margin:0 0 28px;color:#745e69;line-height:1.7">Enter this one-time code to return to your private Agent.</p><div style="border:1px solid #efd4d8;border-radius:20px;background:#fff;padding:24px;text-align:center;font-size:38px;font-weight:800;letter-spacing:.24em">${token}</div><p style="margin:22px 0 0;color:#8c747f;font-size:13px;line-height:1.7">Expires in 10 minutes. Never share this code. If you did not request it, simply ignore this email.</p><p style="margin:28px 0 0;color:#b09aa4;font-size:11px">Expiry reference: ${expiry}</p></div></body></html>`,
  };
}
