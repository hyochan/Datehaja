# Passwordless auth and PWA handoff

Datehaja uses Convex Auth with three possible providers:

1. Email OTP through AgentMail (always the primary path).
2. Google OAuth when its client ID and secret are configured.
3. Sign in with Apple when its Services ID and signed client-secret JWT are
   configured.

The UI reads safe provider-availability booleans from Convex. It never receives
OAuth secrets, and it does not render a social button that would fail because a
provider is missing.

## Email OTP

- Six numeric digits.
- Ten-minute expiry.
- Single-use; Convex Auth stores the hash rather than the plaintext code.
- Six failed verification attempts per hour before rate limiting.
- Resend replaces the previous code and has a client-side cooldown.
- Existing accounts are linked by verified email instead of being duplicated.

AgentMail needs `AGENTMAIL_API_KEY` and `AGENTMAIL_INBOX_ID` on each Convex
deployment.

## Google

Create a Web application OAuth client and register every Convex deployment that
will handle callbacks:

```text
https://<deployment>.convex.site/api/auth/callback/google
```

Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` on that deployment. The browser
returns to the deployment's `SITE_URL` after Convex completes the exchange.

## Apple

Create a Services ID for the production web origin and register:

```text
https://<production-deployment>.convex.site/api/auth/callback/apple
```

Set `AUTH_APPLE_ID` and `AUTH_APPLE_SECRET`. Apple requires HTTPS and the
secret is a signed JWT with an expiry, so rotation must be scheduled before
launch. Use a separate configuration for previews instead of sharing the
production client.

## Installed PWA and later native shells

A browser-installed PWA uses the same top-level OAuth redirect and stored Convex
Auth session as the site. Keep `SITE_URL` on the canonical HTTPS origin
(`https://datehaja.com`) so the provider returns to the installed app's scope.
The web manifest is already linked from `index.html`, so the hosted app has a
stable standalone scope and home-screen identity. A service worker is
intentionally deferred: authentication, safety state, and live Agent activity
must not be served from a stale cache. Add a network-first worker only when the
offline product behavior is designed and tested.

If Datehaja later ships through an iOS or Android wrapper, open OAuth in the
system authentication session and return through an app/universal link. Do not
run Google or Apple login in an embedded webview. Native store builds will also
need platform-specific client identifiers while preserving the same Convex user
and verified-email linking rules.
