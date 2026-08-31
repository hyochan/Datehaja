import Apple from "@auth/core/providers/apple";
import Google from "@auth/core/providers/google";
import { Email } from "@convex-dev/auth/providers/Email";
import { convexAuth, type AuthProviderConfig } from "@convex-dev/auth/server";
import type { DataModel } from "./_generated/dataModel";
import { env } from "./_generated/server";
import { sendMessage } from "./integrations/agentmail";
import { generateEmailOtp, otpEmailContent } from "./lib/authEmail";

/**
 * Passwordless email authentication.
 *
 * The six-digit code is short-lived, single-use, stored hashed by Convex Auth,
 * and protected by Convex Auth's failed-attempt rate limit. AgentMail sends the
 * message from Datehaja's existing private inbox.
 */
const DatehajaEmail = Email<DataModel>({
  id: "email",
  name: "Email code",
  maxAge: 10 * 60,
  generateVerificationToken: generateEmailOtp,
  async sendVerificationRequest({ identifier, token, expires }) {
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
