import { defineApp } from "convex/server";
import staticHosting from "@convex-dev/static-hosting/convex.config";

/**
 * App-owned root routing (Mode B).
 *
 * @convex-dev/auth registers root-level routes (`/.well-known/openid-configuration`,
 * `/.well-known/jwks.json`, `/api/auth/*`). Mounting the static component at "/"
 * with an app httpPrefix would relocate those and silently break OIDC discovery,
 * so the app keeps the root and `registerStaticRoutes` installs the catch-all last.
 */
const app = defineApp();
app.use(staticHosting);

export default app;
