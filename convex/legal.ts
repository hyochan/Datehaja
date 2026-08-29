import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { currentUserId, recordAudit, requireUserId } from "./lib/authz";
import {
  LEGAL_EFFECTIVE_DATE,
  LEGAL_VERSIONS,
  legalVersionsMatch,
} from "./lib/legal";

const versionsValidator = v.object({
  terms: v.string(),
  privacy: v.string(),
  community: v.string(),
});

export const status = query({
  args: {},
  returns: v.object({
    signedIn: v.boolean(),
    accepted: v.boolean(),
    acceptedAt: v.union(v.number(), v.null()),
    effectiveDate: v.string(),
    currentVersions: versionsValidator,
  }),
  handler: async (ctx) => {
    const userId = await currentUserId(ctx);
    if (!userId) {
      return {
        signedIn: false,
        accepted: false,
        acceptedAt: null,
        effectiveDate: LEGAL_EFFECTIVE_DATE,
        currentVersions: LEGAL_VERSIONS,
      };
    }

    const consent = await ctx.db
      .query("legalConsents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return {
      signedIn: true,
      accepted:
        consent !== null &&
        legalVersionsMatch({
          terms: consent.termsVersion,
          privacy: consent.privacyVersion,
          community: consent.communityVersion,
        }),
      acceptedAt: consent?.acceptedAt ?? null,
      effectiveDate: LEGAL_EFFECTIVE_DATE,
      currentVersions: LEGAL_VERSIONS,
    };
  },
});

export const accept = mutation({
  args: {
    versions: versionsValidator,
    termsAccepted: v.boolean(),
    privacyAcknowledged: v.boolean(),
    communityAccepted: v.boolean(),
    ageConfirmed: v.boolean(),
    locale: v.string(),
  },
  returns: v.object({ acceptedAt: v.number() }),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (
      !args.termsAccepted ||
      !args.privacyAcknowledged ||
      !args.communityAccepted
    ) {
      throw new Error(
        "Accept the Terms and Community Guidelines and acknowledge the Privacy Notice to continue.",
      );
    }
    if (!args.ageConfirmed) {
      throw new Error(
        "Datehaja is for adults only. Confirm that you are 18 or over.",
      );
    }
    if (!legalVersionsMatch(args.versions)) {
      throw new Error(
        "The legal documents changed. Review the latest versions and try again.",
      );
    }

    const acceptedAt = Date.now();
    const existing = await ctx.db
      .query("legalConsents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const values = {
      termsVersion: LEGAL_VERSIONS.terms,
      privacyVersion: LEGAL_VERSIONS.privacy,
      communityVersion: LEGAL_VERSIONS.community,
      acceptedAt,
      ageConfirmed: true,
      locale: args.locale.trim().slice(0, 16) || "en-US",
    };

    if (existing) {
      await ctx.db.patch("legalConsents", existing._id, values);
    } else {
      await ctx.db.insert("legalConsents", { userId, ...values });
    }

    await recordAudit(ctx, {
      action: "legal.accepted",
      actorUserId: userId,
      detail: `terms=${LEGAL_VERSIONS.terms}; privacy=${LEGAL_VERSIONS.privacy}; community=${LEGAL_VERSIONS.community}`,
    });

    return { acceptedAt };
  },
});
