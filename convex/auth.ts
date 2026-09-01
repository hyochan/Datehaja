import Apple from "@auth/core/providers/apple";
import Google from "@auth/core/providers/google";
import { Email } from "@convex-dev/auth/providers/Email";
import {
  convexAuth,
  type AuthProviderConfig,
  type GenericActionCtxWithAuthConfig,
} from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { env } from "./_generated/server";
import { sendMessage } from "./integrations/agentmail";
import {
  generateEmailOtp,
  isDevelopmentOtpEmail,
  otpEmailContent,
} from "./lib/authEmail";

const DEFAULT_DEV_OTP = "68686868";

type SendVerificationRequestArgs = {
  identifier: string;
  token: string;
  expires: Date;
  provider: { id: string };
};

function devFixedOtpFor(identifier: string): string | null {
  if (env.ENVIRONMENT !== "development") return null;

  if (
    !isDevelopmentOtpEmail(
      identifier,
      env.DEV_FIXED_OTP_EMAILS ?? "hyo@hyo.dev",
    )
  ) {
    return null;
  }

  const code = (env.DEV_FIXED_OTP_CODE ?? DEFAULT_DEV_OTP).trim();
  if (!/^\d{8}$/.test(code)) {
    throw new Error("DEV_FIXED_OTP_CODE must contain exactly eight digits.");
  }
  return code;
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function applyDevelopmentOtp(
  ctx: GenericActionCtxWithAuthConfig<DataModel>,
  identifier: string,
  originalToken: string,
  provider: string,
): Promise<boolean> {
  const fixedCode = devFixedOtpFor(identifier);
  if (!fixedCode) return false;

  const email = identifier.trim().toLowerCase();
  const replaced = await ctx.runMutation(
    internal.authTestOtp.overrideVerificationCode,
    {
      email,
      provider,
      originalHash: await sha256Hex(originalToken),
      fixedHash: await sha256Hex(fixedCode),
    },
  );
  if (!replaced) {
    throw new Error("Could not prepare the development sign-in code.");
  }

  console.info("[auth] Development OTP enabled", { email, provider });
  return true;
}

/**
 * Passwordless email authentication.
 *
 * The eight-digit code is short-lived, single-use, stored hashed by Convex Auth,
 * and protected by Convex Auth's failed-attempt rate limit. AgentMail sends the
 * message from Datehaja's existing private inbox.
 */
const DatehajaEmail = Email<DataModel>({
  id: "email",
  name: "Email code",
  maxAge: 10 * 60,
  generateVerificationToken: generateEmailOtp,
  async sendVerificationRequest(
    { identifier, token, expires, provider }: SendVerificationRequestArgs,
    ctx?: GenericActionCtxWithAuthConfig<DataModel>,
  ) {
    const developmentOtp = devFixedOtpFor(identifier);
    if (developmentOtp && !ctx) {
      throw new Error("Development sign-in requires a Convex action context.");
    }
    if (
      ctx &&
      (await applyDevelopmentOtp(ctx, identifier, token, provider.id))
    ) {
      return;
    }

    const inboxId = env.AGENTMAIL_INBOX_ID?.trim();
    if (!env.AGENTMAIL_API_KEY || !inboxId) {
      throw new Error("Email sign-in is not configured on this deployment.");
    }

    const content = otpEmailContent({ token, expires });
    await sendMessage({
      inboxId,
      to: identifier.trim().toLowerCase(),
      subject: content.subject,
      text: content.text,
      html: content.html,
      labels: ["authentication", "otp"],
      idempotencyKey: `auth-otp-${identifier}-${token}`,
    });
  },
});

const providers: AuthProviderConfig[] = [DatehajaEmail];

if (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
  );
}

if (env.AUTH_APPLE_ID && env.AUTH_APPLE_SECRET) {
  providers.push(
    Apple({
      clientId: env.AUTH_APPLE_ID,
      clientSecret: env.AUTH_APPLE_SECRET,
    }),
  );
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers,
  signIn: {
    maxFailedAttempsPerHour: 6,
  },
});
