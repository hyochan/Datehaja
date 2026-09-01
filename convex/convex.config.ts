import { defineApp } from "convex/server";
import { v } from "convex/values";
import staticHosting from "@convex-dev/static-hosting/convex.config";

/**
 * App-owned root routing (Mode B).
 *
 * @convex-dev/auth registers root-level routes (`/.well-known/openid-configuration`,
 * `/.well-known/jwks.json`, `/api/auth/*`). Mounting the static component at "/"
 * with an app httpPrefix would relocate those and silently break OIDC discovery,
 * so the app keeps the root and `registerStaticRoutes` installs the catch-all last.
 */
const app = defineApp({
  env: {
    AGENTMAIL_API_KEY: v.optional(v.string()),
    AGENTMAIL_INBOX_ID: v.optional(v.string()),
    AUTH_GOOGLE_ID: v.optional(v.string()),
    AUTH_GOOGLE_SECRET: v.optional(v.string()),
    AUTH_APPLE_ID: v.optional(v.string()),
    AUTH_APPLE_SECRET: v.optional(v.string()),
    ENVIRONMENT: v.optional(v.string()),
    DEV_FIXED_OTP_CODE: v.optional(v.string()),
    DEV_FIXED_OTP_EMAILS: v.optional(v.string()),
    SITE_URL: v.optional(v.string()),
  },
});
app.use(staticHosting);

export default app;
