import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import type { DataModel } from "./_generated/dataModel";

/**
 * Email + password auth.
 *
 * We deliberately keep the auth record minimal: the `users` row holds only the
 * account e-mail, which is NEVER exposed to another user. Everything a match can
 * see lives in `profiles` and is filtered through `lib/privacy.ts`.
 */
const DateHajaPassword = Password<DataModel>({
  profile(params) {
    const email = String(params.email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Enter a valid email address.");
    }
    const password = String(params.password ?? "");
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }
    return { email };
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [DateHajaPassword],
});
