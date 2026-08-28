import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { emailKindValidator } from "./lib/enums";
import {
  conciergeInboxId,
  hasAgentMail,
  parseAddress,
  sendMessage,
} from "./integrations/agentmail";
import type { EmailContent } from "./lib/emailTemplates";
import { conciergeReply } from "./lib/emailTemplates";
import { firstNameOnly } from "./lib/privacy";
import { truncate } from "./lib/text";

/**
 * DateHaja Concierge — the product's email identity.
 *
 * Every message is sent from DateHaja's own AgentMail inbox. Participants are
 * addressed individually, never CC'd together, so no one ever learns the other
 * person's address. Notification preferences are checked before every send.
 */

export function appUrl(path = "/"): string {
  const base = process.env.SITE_URL?.replace(/\/$/, "") ?? "";
  return `${base}${path}`;
}

export const logEmail = internalMutation({
  args: {
    userId: v.optional(v.id("users")),
    dropId: v.optional(v.id("dateDrops")),
    kind: emailKindValidator,
    toAddress: v.string(),
    fromAddress: v.string(),
    subject: v.string(),
    agentMailMessageId: v.optional(v.string()),
    agentMailThreadId: v.optional(v.string()),
    status: v.union(
      v.literal("sent"),
      v.literal("failed"),
      v.literal("skipped_preference"),
      v.literal("skipped_no_provider"),
    ),
    error: v.optional(v.string()),
  },
  returns: v.id("emailMessages"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailMessages", {
      ...args,
      error: args.error ? truncate(args.error, 300) : undefined,
      sentAt: Date.now(),
    });
  },
});

export const attachThreadToParticipant = internalMutation({
  args: {
    dropId: v.id("dateDrops"),
    userId: v.id("users"),
    messageId: v.string(),
    threadId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("dateDropParticipants")
      .withIndex("by_drop_and_user", (q) =>
        q.eq("dropId", args.dropId).eq("userId", args.userId),
      )
      .unique();
    if (!participant) return null;
    await ctx.db.patch("dateDropParticipants", participant._id, {
      emailMessageId: args.messageId,
      emailThreadId: args.threadId,
    });
    return null;
  },
});

/** Everything the mailer needs about a recipient, resolved in one read. */
export const getRecipient = internalQuery({
  args: { userId: v.id("users") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const user = await ctx.db.get("users", args.userId);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    const preferences = await ctx.db
      .query("preferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    return {
      email: user?.email ?? null,
      firstName: profile ? firstNameOnly(profile.displayName) : "there",
      preferences,
    };
  },
});

export type SendOutcome = {
  status: "sent" | "failed" | "skipped_preference" | "skipped_no_provider";
  messageId?: string;
  threadId?: string;
  error?: string;
};

type EmailKind =
  | "welcome"
  | "invitation"
  | "accepted_waiting"
  | "confirmed"
  | "reminder"
  | "updated"
  | "cancelled"
  | "expired"
  | "safety"
  | "concierge_reply";

/** Which preference toggle governs which kind of message. Safety mail always sends. */
function isAllowed(
  kind: EmailKind,
  prefs: {
    notifyEmail: boolean;
    notifyInvitations: boolean;
    notifyConfirmations: boolean;
    notifyReminders: boolean;
  } | null,
): boolean {
  if (kind === "safety") return true;
  if (!prefs) return true;
  if (!prefs.notifyEmail) return false;
  switch (kind) {
    case "invitation":
      return prefs.notifyInvitations;
    case "confirmed":
    case "accepted_waiting":
    case "updated":
    case "cancelled":
    case "expired":
      return prefs.notifyConfirmations;
    case "reminder":
      return prefs.notifyReminders;
    default:
      return true;
  }
}

/**
 * Send one Concierge email. Never throws — a mail failure must not take down
 * the date plan it was describing.
 */
export async function sendConciergeEmail(
  ctx: ActionCtx,
  args: {
    userId: Id<"users">;
    dropId?: Id<"dateDrops">;
    kind: EmailKind;
    content: EmailContent;
    /** Makes retries safe — the same key never sends twice. */
    idempotencyKey: string;
    labels?: string[];
  },
): Promise<SendOutcome> {
  const recipient = (await ctx.runQuery(internal.mail.getRecipient, {
    userId: args.userId,
  })) as {
    email: string | null;
    firstName: string;
    preferences: {
      notifyEmail: boolean;
      notifyInvitations: boolean;
      notifyConfirmations: boolean;
      notifyReminders: boolean;
    } | null;
  };

  const inboxId = conciergeInboxId();
  const fromAddress = inboxId ?? "concierge@datehaja";

  if (!recipient.email) {
    await ctx.runMutation(internal.mail.logEmail, {
      userId: args.userId,
      dropId: args.dropId,
      kind: args.kind,
      toAddress: "(none)",
      fromAddress,
      subject: args.content.subject,
      status: "failed",
      error: "No email address on file.",
    });
    return { status: "failed", error: "No email address on file." };
  }

  if (!isAllowed(args.kind, recipient.preferences)) {
    await ctx.runMutation(internal.mail.logEmail, {
      userId: args.userId,
      dropId: args.dropId,
      kind: args.kind,
      toAddress: recipient.email,
      fromAddress,
      subject: args.content.subject,
      status: "skipped_preference",
    });
    return { status: "skipped_preference" };
  }

  if (!hasAgentMail() || !inboxId) {
    await ctx.runMutation(internal.mail.logEmail, {
      userId: args.userId,
      dropId: args.dropId,
      kind: args.kind,
      toAddress: recipient.email,
      fromAddress,
      subject: args.content.subject,
      status: "skipped_no_provider",
      error: "AgentMail is not configured on this deployment.",
    });
    return { status: "skipped_no_provider" };
  }

  try {
    const sent = await sendMessage({
      inboxId,
      to: recipient.email,
      subject: args.content.subject,
      text: args.content.text,
      html: args.content.html,
      labels: args.labels ?? [args.kind],
      headers: args.dropId ? { "X-DateHaja-Id": args.dropId } : undefined,
      idempotencyKey: args.idempotencyKey,
    });

    await ctx.runMutation(internal.mail.logEmail, {
      userId: args.userId,
      dropId: args.dropId,
      kind: args.kind,
      toAddress: recipient.email,
      fromAddress: inboxId,
      subject: args.content.subject,
      agentMailMessageId: sent.message_id,
      agentMailThreadId: sent.thread_id,
      status: "sent",
    });

    if (args.dropId) {
      await ctx.runMutation(internal.mail.attachThreadToParticipant, {
        dropId: args.dropId,
        userId: args.userId,
        messageId: sent.message_id,
        threadId: sent.thread_id,
      });
    }

    return {
      status: "sent",
      messageId: sent.message_id,
      threadId: sent.thread_id,
    };
  } catch (e) {
    const error = String(e);
    await ctx.runMutation(internal.mail.logEmail, {
      userId: args.userId,
      dropId: args.dropId,
      kind: args.kind,
      toAddress: recipient.email,
      fromAddress: inboxId,
      subject: args.content.subject,
      status: "failed",
      error,
    });
    return { status: "failed", error };
  }
}

/* --------------------------- inbound webhook side -------------------------- */

/**
 * Persist an AgentMail event. `eventId` is the idempotency key: an event that
 * has already been stored is acknowledged and ignored, so a webhook retry can
 * never double-process.
 */
export const recordEvent = internalMutation({
  args: {
    eventId: v.string(),
    eventType: v.string(),
    inboxId: v.optional(v.string()),
    threadId: v.optional(v.string()),
    messageId: v.optional(v.string()),
    fromAddress: v.optional(v.string()),
    toAddress: v.optional(v.string()),
    subject: v.optional(v.string()),
    preview: v.optional(v.string()),
    signatureVerified: v.boolean(),
    rawPreview: v.string(),
  },
  returns: v.object({
    duplicate: v.boolean(),
    eventDocId: v.union(v.id("agentMailEvents"), v.null()),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agentMailEvents")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
      .unique();
    if (existing) return { duplicate: true, eventDocId: existing._id };

    // Associate the event with the user and drop behind the thread, if we know it.
    let userId: Id<"users"> | undefined;
    let dropId: Id<"dateDrops"> | undefined;

    if (args.threadId) {
      const participant = await ctx.db
        .query("dateDropParticipants")
        .withIndex("by_thread", (q) => q.eq("emailThreadId", args.threadId))
        .first();
      if (participant) {
        userId = participant.userId;
        dropId = participant.dropId;
      }
    }
    if (!userId && args.fromAddress) {
      const address = parseAddress(args.fromAddress);
      const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", address))
        .first();
      if (user) userId = user._id;
    }

    const eventDocId = await ctx.db.insert("agentMailEvents", {
      eventId: args.eventId,
      eventType: args.eventType,
      inboxId: args.inboxId,
      threadId: args.threadId,
      messageId: args.messageId,
      fromAddress: args.fromAddress,
      toAddress: args.toAddress,
      subject: args.subject ? truncate(args.subject, 200) : undefined,
      preview: args.preview ? truncate(args.preview, 300) : undefined,
      userId,
      dropId,
      signatureVerified: args.signatureVerified,
      processed: false,
      receivedAt: Date.now(),
      rawPreview: truncate(args.rawPreview, 1500),
    });

    return { duplicate: false, eventDocId };
  },
});

export const markEventProcessed = internalMutation({
  args: {
    eventDocId: v.id("agentMailEvents"),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("agentMailEvents", args.eventDocId, {
      processed: true,
      processedAt: Date.now(),
      processingError: args.error ? truncate(args.error, 300) : undefined,
    });
    return null;
  },
});

export const getEvent = internalQuery({
  args: { eventDocId: v.id("agentMailEvents") },
  returns: v.any(),
  handler: async (ctx, args) => ctx.db.get("agentMailEvents", args.eventDocId),
});

/**
 * React to inbound mail. Someone replying to a date invitation gets a
 * Concierge reply pointing them back into the app — DateHaja deliberately does
 * not accept "yes" by email, because acting on a date needs a real session.
 */
export const handleInbound = internalAction({
  args: { eventDocId: v.id("agentMailEvents") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const event = (await ctx.runQuery(internal.mail.getEvent, {
      eventDocId: args.eventDocId,
    })) as {
      _id: Id<"agentMailEvents">;
      eventType: string;
      userId?: Id<"users">;
      dropId?: Id<"dateDrops">;
      fromAddress?: string;
    } | null;

    if (!event) return null;

    try {
      if (event.eventType.startsWith("message.received") && event.userId) {
        const recipient = (await ctx.runQuery(internal.mail.getRecipient, {
          userId: event.userId,
        })) as { firstName: string };

        await sendConciergeEmail(ctx, {
          userId: event.userId,
          dropId: event.dropId,
          kind: "concierge_reply",
          content: conciergeReply({
            firstName: recipient.firstName,
            url: appUrl(event.dropId ? `/drop/${event.dropId}` : "/dashboard"),
          }),
          idempotencyKey: `concierge-reply-${args.eventDocId}`,
          labels: ["concierge_reply"],
        });

        await ctx.runMutation(internal.notifications.create, {
          userId: event.userId,
          kind: "message",
          title: "We got your email",
          body: "DateHaja Concierge replied with what you can do from here.",
          dropId: event.dropId,
          href: event.dropId ? `/drop/${event.dropId}` : "/dashboard",
        });
      }

      await ctx.runMutation(internal.mail.markEventProcessed, {
        eventDocId: args.eventDocId,
      });
    } catch (e) {
      await ctx.runMutation(internal.mail.markEventProcessed, {
        eventDocId: args.eventDocId,
        error: String(e),
      });
    }
    return null;
  },
});
