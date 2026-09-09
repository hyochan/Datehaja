import { v } from "convex/values";
import { env, query } from "./_generated/server";

/** Safe public capability flags. Secrets never leave the deployment. */
export const available = query({
  args: {},
  returns: v.object({
    email: v.boolean(),
    google: v.boolean(),
    apple: v.boolean(),
  }),
  handler: async () => ({
    // Development OTP sign-in is available without a mail provider. The auth
    // action still enforces its explicit test-email allowlist before bypassing
    // delivery; this flag grants no authentication or broader access.
    email: Boolean(env.AGENTMAIL_API_KEY && env.AGENTMAIL_INBOX_ID) || env.ENVIRONMENT === "development",
    google: Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET),
    apple: Boolean(env.AUTH_APPLE_ID && env.AUTH_APPLE_SECRET),
  }),
});
