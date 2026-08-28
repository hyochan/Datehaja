import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import {
  currentUserId,
  recordAudit,
  requireParticipant,
  requireUserId,
} from "./lib/authz";
import {
  assertDropTransition,
  deriveDropStatus,
  isTerminalDrop,
} from "./lib/stateMachine";
import { passReasonValidator } from "./lib/enums";
import {
  activeCounterparts,
  canActOnDrop,
  hasDeparted,
  isActiveParticipant,
  pickCounterpart,
} from "./lib/participants";
import {
  firstNameOnly,
  toPublicPreview,
  type PublicPreview,
} from "./lib/privacy";
import { describeDateTime, DAY_MS } from "./lib/time";
import { ageOn } from "./lib/age";
import { formatMoney } from "./lib/catalog";
import { LIMITS, clean, truncate } from "./lib/text";
import { appUrl, sendConciergeEmail } from "./mail";
import {
  acceptedWaitingEmail,
  cancelledEmail,
  confirmedEmail,
  expiredEmail,
  invitationEmail,
  reminderEmail,
  type DropEmailData,
} from "./lib/emailTemplates";
import { calendarEventStatus } from "./lib/calendar";

/**
 * DateDrop lifecycle.
 *
 * A participant only ever sees: the plan, a privacy-safe preview of the other
 * person, and why the two of them fit. They never see the other's response
 * until DateDrop decides it is appropriate to disclose — which is when the
 * drop is confirmed, or when their own commitment needs an update.
 */

/* --------------------------------- views ---------------------------------- */

export type DropView = {
  dropId: Id<"dateDrops">;
  status: string;
  myState: string;
  role: string;
  title: string;
  theme: string;
  summary: string;
  whyItFits: string;
  privateWhyItFits: string;
  area: string;
  city: string;
  timezone: string;
  startMs: number;
  endMs: number;
  whenLabel: string;
  costLabel: string;
  estimatedCostPerPerson: number;
  currency: string;
  estimatedDurationMin: number;
  meetingInstructions: string;
  itinerary: Doc<"dateDrops">["itinerary"];
  confirmDeadlineMs: number;
  isDemo: boolean;
  /** Only present once both people have accepted. */
  revealed: boolean;
  match: PublicPreview | null;
  matchPhotoUrl: string | null;
  /** How many people are still deciding — never *who*, and never their answer. */
  awaitingOther: boolean;
  attendanceConfirmed: boolean;
  cancelReason: string | null;
  otherWithdrew: boolean;
  calendarState: "none" | "reserved" | "finalized" | "cancelled";
};

async function buildDropView(
  ctx: QueryCtx,
  drop: Doc<"dateDrops">,
  me: Doc<"dateDropParticipants">,
): Promise<DropView> {
  const participants = await ctx.db
    .query("dateDropParticipants")
    .withIndex("by_drop", (q) => q.eq("dropId", drop._id))
    .take(10);

  const others = participants.filter((p) => p.userId !== me.userId);
  const liveOther = pickCounterpart(participants, me.userId);

  // Revealing is gated on the VIEWER's own state as well as the drop's.
  // Someone who passed must never receive the photo of the person who ended up
  // going, even once the drop confirms around them.
  const revealed =
    (drop.status === "confirmed" || drop.status === "completed") &&
    (me.state === "confirmed" || me.state === "accepted");

  let match: PublicPreview | null = null;
  let matchPhotoUrl: string | null = null;
  if (liveOther) {
    const otherProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", liveOther.userId))
      .unique();
    if (otherProfile) {
      match = toPublicPreview(otherProfile);
      if (revealed && otherProfile.photoStorageId) {
        matchPhotoUrl = await ctx.storage.getUrl(otherProfile.photoStorageId);
      }
    }
  }

  const iAccepted = me.state === "accepted" || me.state === "confirmed";
  const otherAnswered =
    liveOther?.state === "accepted" || liveOther?.state === "confirmed";
  const externalCalendarStatus = calendarEventStatus({
    dropStatus: drop.status,
    participantState: me.state,
    reservedAt: me.calendarReservedAt,
  });

  return {
    dropId: drop._id,
    status: drop.status,
    myState: me.state,
    role: me.role,
    title: drop.title,
    theme: drop.theme,
    summary: drop.summary,
    whyItFits: drop.whyItFits,
    privateWhyItFits: me.privateWhyItFits,
    area: drop.area,
    city: drop.city,
    timezone: drop.timezone,
    startMs: drop.startMs,
    endMs: drop.endMs,
    whenLabel: describeDateTime(drop.startMs, drop.timezone),
    costLabel: formatMoney(drop.estimatedCostPerPerson, drop.currency),
    estimatedCostPerPerson: drop.estimatedCostPerPerson,
    currency: drop.currency,
    estimatedDurationMin: drop.estimatedDurationMin,
    meetingInstructions: drop.meetingInstructions,
    itinerary: drop.itinerary,
    confirmDeadlineMs: drop.confirmDeadlineMs,
    isDemo: drop.isDemo,
    revealed,
    match,
    matchPhotoUrl,
    // Deliberately coarse: "we're waiting on someone", not "they said yes".
    awaitingOther: iAccepted && !otherAnswered && !isTerminalDrop(drop.status),
    attendanceConfirmed: me.attendanceConfirmed ?? false,
    cancelReason: drop.cancelReason ?? null,
    otherWithdrew: others.some((p) => p.state === "withdrawn"),
    calendarState:
      externalCalendarStatus === "TENTATIVE"
        ? "reserved"
        : externalCalendarStatus === "CONFIRMED"
          ? "finalized"
          : externalCalendarStatus === "CANCELLED"
            ? "cancelled"
            : "none",
  };
}

export const get = query({
  args: { dropId: v.id("dateDrops") },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    if (!userId) return null;
    const me = await ctx.db
      .query("dateDropParticipants")
      .withIndex("by_drop_and_user", (q) =>
        q.eq("dropId", args.dropId).eq("userId", userId),
      )
      .unique();
    if (!me) return null;
    const drop = await ctx.db.get("dateDrops", args.dropId);
    if (!drop) return null;
    return await buildDropView(ctx, drop, me);
  },
});

/** Everything the dashboard needs, in one subscription. */
export const dashboard = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await currentUserId(ctx);
    if (!userId) return null;

    const memberships = await ctx.db
      .query("dateDropParticipants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(60);

    const invitations: DropView[] = [];
    const upcoming: DropView[] = [];
    const waiting: DropView[] = [];
    const history: DropView[] = [];

    for (const membership of memberships) {
      const drop = await ctx.db.get("dateDrops", membership.dropId);
      if (!drop) continue;
      const view = await buildDropView(ctx, drop, membership);

      // Whatever happened to the drop afterwards, someone who passed or
      // withdrew is no longer part of it — it is history to them.
      if (hasDeparted(membership.state)) {
        history.push(view);
        continue;
      }

      if (membership.state === "invited" || membership.state === "viewed") {
        if (!isTerminalDrop(drop.status)) {
          invitations.push(view);
          continue;
        }
      }
      if (
        drop.status === "confirmed" &&
        isActiveParticipant(membership.state)
      ) {
        upcoming.push(view);
        continue;
      }
      if (
        (membership.state === "accepted" || membership.state === "confirmed") &&
        !isTerminalDrop(drop.status)
      ) {
        waiting.push(view);
        continue;
      }
      history.push(view);
    }

    invitations.sort((a, b) => a.startMs - b.startMs);
    upcoming.sort((a, b) => a.startMs - b.startMs);
    waiting.sort((a, b) => a.startMs - b.startMs);
    history.sort((a, b) => b.startMs - a.startMs);

    return {
      invitations,
      upcoming,
      waiting,
      history: history.slice(0, 25),
    };
  },
});

/* -------------------------------- responses -------------------------------- */

export const markViewed = mutation({
  args: { dropId: v.id("dateDrops") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const me = await requireParticipant(ctx, args.dropId, userId);
    if (me.state !== "invited") return null;
    await ctx.db.patch("dateDropParticipants", me._id, {
      state: "viewed",
      viewedAt: Date.now(),
    });
    return null;
  },
});

export const accept = mutation({
  args: { dropId: v.id("dateDrops") },
  returns: v.object({ confirmed: v.boolean() }),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const me = await requireParticipant(ctx, args.dropId, userId);
    const drop = await ctx.db.get("dateDrops", args.dropId);
    if (!drop) throw new Error("That DateDrop is gone.");

    if (isTerminalDrop(drop.status)) {
      throw new Error("This DateDrop is already closed.");
    }
    if (me.state === "accepted" || me.state === "confirmed") {
      return { confirmed: drop.status === "confirmed" };
    }
    if (me.state !== "invited" && me.state !== "viewed") {
      throw new Error("You've already responded to this one.");
    }
    const now = Date.now();
    if (now >= drop.confirmDeadlineMs) {
      throw new Error("The window to accept this DateDrop has closed.");
    }

    await ctx.db.patch("dateDropParticipants", me._id, {
      state: "accepted",
      respondedAt: now,
      calendarReservedAt: me.calendarReservedAt ?? now,
    });

    const participants = await ctx.db
      .query("dateDropParticipants")
      .withIndex("by_drop", (q) => q.eq("dropId", args.dropId))
      .take(10);

    const nextStatus = deriveDropStatus(drop.status, participants);
    assertDropTransition(drop.status, nextStatus);

    if (nextStatus === "confirmed") {
      await confirmDrop(ctx, drop, participants, now);
      return { confirmed: true };
    }

    await ctx.db.patch("dateDrops", drop._id, {
      status: nextStatus,
      updatedAt: now,
    });
    await recordAudit(ctx, {
      action: "drop.accepted",
      actorUserId: userId,
      dropId: drop._id,
      detail: `now ${nextStatus}`,
    });

    await ctx.scheduler.runAfter(0, internal.dateDrops.notifyAcceptedWaiting, {
      dropId: drop._id,
      userId,
    });
    return { confirmed: false };
  },
});

async function confirmDrop(
  ctx: MutationCtx,
  drop: Doc<"dateDrops">,
  participants: Doc<"dateDropParticipants">[],
  now: number,
): Promise<void> {
  await ctx.db.patch("dateDrops", drop._id, {
    status: "confirmed",
    confirmedAt: now,
    updatedAt: now,
  });

  for (const p of participants) {
    if (p.state === "accepted") {
      await ctx.db.patch("dateDropParticipants", p._id, { state: "confirmed" });
    }
    if (p.availabilityId) {
      const window = await ctx.db.get("availability", p.availabilityId);
      if (window && window.heldByDropId === drop._id) {
        await ctx.db.patch("availability", window._id, { status: "booked" });
      }
    }
  }

  await recordAudit(ctx, {
    action: "drop.confirmed",
    dropId: drop._id,
    detail: `${drop.area}, ${drop.city}`,
  });

  await ctx.scheduler.runAfter(0, internal.dateDrops.notifyConfirmed, {
    dropId: drop._id,
  });
}

export const pass = mutation({
  args: {
    dropId: v.id("dateDrops"),
    reason: v.optional(passReasonValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const me = await requireParticipant(ctx, args.dropId, userId);
    const drop = await ctx.db.get("dateDrops", args.dropId);
    if (!drop) throw new Error("That DateDrop is gone.");
    if (me.state !== "invited" && me.state !== "viewed") {
      throw new Error("You've already responded to this one.");
    }

    const now = Date.now();
    await ctx.db.patch("dateDropParticipants", me._id, {
      state: "passed",
      respondedAt: now,
      passReason: args.reason ?? "unspecified",
    });

    // Give this person their evening back straight away.
    if (me.availabilityId) {
      const window = await ctx.db.get("availability", me.availabilityId);
      if (
        window &&
        window.heldByDropId === drop._id &&
        window.status === "held"
      ) {
        await ctx.db.patch("availability", window._id, {
          status: "open",
          heldByDropId: undefined,
        });
      }
    }

    await recordAudit(ctx, {
      action: "drop.passed",
      actorUserId: userId,
      dropId: drop._id,
      detail: args.reason ?? "unspecified",
    });

    await resolveAfterDeparture(ctx, drop, now);
    return null;
  },
});

export const withdraw = mutation({
  args: { dropId: v.id("dateDrops") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const me = await requireParticipant(ctx, args.dropId, userId);
    const drop = await ctx.db.get("dateDrops", args.dropId);
    if (!drop) throw new Error("That DateDrop is gone.");
    if (me.state !== "accepted") {
      throw new Error("There's nothing to withdraw from.");
    }
    const now = Date.now();

    await ctx.db.patch("dateDropParticipants", me._id, {
      state: "withdrawn",
      respondedAt: now,
    });
    if (me.availabilityId) {
      const window = await ctx.db.get("availability", me.availabilityId);
      if (window && window.heldByDropId === drop._id) {
        await ctx.db.patch("availability", window._id, {
          status: "open",
          heldByDropId: undefined,
        });
      }
    }
    await recordAudit(ctx, {
      action: "drop.withdrawn",
      actorUserId: userId,
      dropId: drop._id,
      detail: "Withdrew before confirmation",
    });
    await resolveAfterDeparture(ctx, drop, now);
    return null;
  },
});

/**
 * Someone left an unconfirmed drop. If a committed participant remains, keep
 * their evening alive and look for a replacement rather than cancelling.
 */
async function resolveAfterDeparture(
  ctx: MutationCtx,
  drop: Doc<"dateDrops">,
  now: number,
): Promise<void> {
  const participants = await ctx.db
    .query("dateDropParticipants")
    .withIndex("by_drop", (q) => q.eq("dropId", drop._id))
    .take(10);

  const stillIn = participants.filter(
    (p) => p.state === "accepted" || p.state === "confirmed",
  );
  const stillDeciding = participants.filter(
    (p) => p.state === "invited" || p.state === "viewed",
  );

  if (stillIn.length === 0 && stillDeciding.length === 0) {
    await closeDrop(
      ctx,
      drop,
      "expired_no_match",
      now,
      "Nobody was available.",
    );
    return;
  }

  if (stillIn.length === 0) {
    // Nobody is committed any more, but someone is still deciding. Roll the
    // drop back to plain "inviting" so it doesn't sit in a partially-accepted
    // state with no acceptance behind it.
    if (drop.status === "partially_accepted") {
      assertDropTransition(drop.status, "inviting");
      await ctx.db.patch("dateDrops", drop._id, {
        status: "inviting",
        updatedAt: now,
      });
    }
    return;
  }

  const canRetry =
    drop.candidateAttempts < drop.maxCandidateAttempts &&
    now < drop.confirmDeadlineMs;

  if (drop.status !== "partially_accepted") {
    assertDropTransition(drop.status, "partially_accepted");
    await ctx.db.patch("dateDrops", drop._id, {
      status: "partially_accepted",
      updatedAt: now,
    });
  }

  if (stillDeciding.length === 0) {
    if (canRetry) {
      await ctx.scheduler.runAfter(
        0,
        internal.matching.runReplacementPipeline,
        {
          dropId: drop._id,
        },
      );
    } else {
      await closeDrop(
        ctx,
        drop,
        "expired_no_match",
        now,
        "We ran out of good matches for this plan.",
      );
    }
  }
}

async function closeDrop(
  ctx: MutationCtx,
  drop: Doc<"dateDrops">,
  status: "expired_no_match" | "cancelled",
  now: number,
  reason: string,
  cancelledByUserId?: Id<"users">,
): Promise<void> {
  const fresh = await ctx.db.get("dateDrops", drop._id);
  if (!fresh || isTerminalDrop(fresh.status)) return;

  assertDropTransition(fresh.status, status);
  await ctx.db.patch("dateDrops", drop._id, {
    status,
    cancelReason: truncate(reason, LIMITS.cancelReason),
    ...(status === "cancelled"
      ? { cancelledAt: now, cancelledByUserId }
      : { expiredAt: now }),
    updatedAt: now,
  });

  const participants = await ctx.db
    .query("dateDropParticipants")
    .withIndex("by_drop", (q) => q.eq("dropId", drop._id))
    .take(10);

  for (const p of participants) {
    if (p.state === "accepted" || p.state === "confirmed") {
      await ctx.db.patch("dateDropParticipants", p._id, {
        state: status === "cancelled" ? "cancelled" : "expired",
      });
    } else if (p.state === "invited" || p.state === "viewed") {
      await ctx.db.patch("dateDropParticipants", p._id, { state: "expired" });
    }
    if (p.availabilityId) {
      const window = await ctx.db.get("availability", p.availabilityId);
      if (
        window &&
        window.heldByDropId === drop._id &&
        window.status !== "cancelled"
      ) {
        await ctx.db.patch("availability", window._id, {
          status: window.startMs > now ? "open" : "expired",
          heldByDropId: undefined,
        });
      }
    }
  }

  await recordAudit(ctx, {
    action: `drop.${status}`,
    actorUserId: cancelledByUserId,
    dropId: drop._id,
    detail: reason,
  });

  await ctx.scheduler.runAfter(0, internal.dateDrops.notifyClosed, {
    dropId: drop._id,
    status,
  });
}

export const cancel = mutation({
  args: { dropId: v.id("dateDrops"), reason: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const me = await requireParticipant(ctx, args.dropId, userId);
    // Passing or withdrawing takes you off the drop. It must not leave you
    // holding the power to cancel a date that later confirms without you.
    if (!canActOnDrop(me.state)) {
      throw new Error("You're not on this DateDrop any more.");
    }
    const drop = await ctx.db.get("dateDrops", args.dropId);
    if (!drop) throw new Error("That DateDrop is gone.");
    if (isTerminalDrop(drop.status)) return null;

    const reason = args.reason
      ? clean(args.reason, LIMITS.cancelReason)
      : "The other person had to cancel.";

    await closeDrop(ctx, drop, "cancelled", Date.now(), reason, userId);
    return null;
  },
});

export const confirmAttendance = mutation({
  args: { dropId: v.id("dateDrops") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const me = await requireParticipant(ctx, args.dropId, userId);
    if (me.state !== "confirmed") {
      throw new Error("You're not on this DateDrop.");
    }
    const drop = await ctx.db.get("dateDrops", args.dropId);
    if (!drop || drop.status !== "confirmed") {
      throw new Error("This date isn't confirmed.");
    }
    await ctx.db.patch("dateDropParticipants", me._id, {
      attendanceConfirmed: true,
    });
    return null;
  },
});

/**
 * Withdraw someone from a drop on the system's behalf — used when they take
 * back the evening the drop was holding. Same departure logic as `withdraw`,
 * without requiring them to be the caller.
 */
export const forceWithdraw = internalMutation({
  args: {
    dropId: v.id("dateDrops"),
    userId: v.id("users"),
    reason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await ctx.db
      .query("dateDropParticipants")
      .withIndex("by_drop_and_user", (q) =>
        q.eq("dropId", args.dropId).eq("userId", args.userId),
      )
      .unique();
    if (!me || !isActiveParticipant(me.state)) return null;

    const drop = await ctx.db.get("dateDrops", args.dropId);
    if (!drop || isTerminalDrop(drop.status)) return null;

    const now = Date.now();
    await ctx.db.patch("dateDropParticipants", me._id, {
      state: "withdrawn",
      respondedAt: now,
    });

    await recordAudit(ctx, {
      action: "drop.force_withdrawn",
      dropId: args.dropId,
      targetUserId: args.userId,
      detail: truncate(args.reason, 200),
    });

    // A confirmed date can't quietly lose a participant — cancel it and tell
    // the other person, rather than leaving them to turn up alone.
    if (drop.status === "confirmed") {
      await closeDrop(ctx, drop, "cancelled", now, args.reason, args.userId);
      return null;
    }

    await resolveAfterDeparture(ctx, drop, now);
    return null;
  },
});

/* ----------------------------- notifications ------------------------------- */

export const getDropContext = internalQuery({
  args: { dropId: v.id("dateDrops") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const drop = await ctx.db.get("dateDrops", args.dropId);
    if (!drop) return null;
    const participants = await ctx.db
      .query("dateDropParticipants")
      .withIndex("by_drop", (q) => q.eq("dropId", args.dropId))
      .take(10);

    const enriched = [];
    for (const p of participants) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", p.userId))
        .unique();
      enriched.push({
        participantId: p._id,
        userId: p.userId,
        state: p.state,
        role: p.role,
        privateWhyItFits: p.privateWhyItFits,
        emailMessageId: p.emailMessageId ?? null,
        reminderSentAt: p.reminderSentAt ?? null,
        expiryNotified: p.expiryNotified ?? false,
        firstName: profile ? firstNameOnly(profile.displayName) : "there",
        preview: profile ? toPublicPreview(profile) : null,
      });
    }
    return { drop, participants: enriched };
  },
});

type DropContext = {
  drop: Doc<"dateDrops">;
  participants: Array<{
    participantId: Id<"dateDropParticipants">;
    userId: Id<"users">;
    state: string;
    role: string;
    privateWhyItFits: string;
    emailMessageId: string | null;
    reminderSentAt: number | null;
    expiryNotified: boolean;
    firstName: string;
    preview: PublicPreview | null;
  }>;
};

function emailData(
  ctx: DropContext,
  recipientFirstName: string,
  otherPreview: PublicPreview | null,
  whyItFits: string,
): DropEmailData {
  const drop = ctx.drop;
  return {
    firstName: recipientFirstName,
    when: describeDateTime(drop.startMs, drop.timezone),
    area: drop.area,
    city: drop.city,
    theme: drop.theme || drop.title,
    costLabel: formatMoney(drop.estimatedCostPerPerson, drop.currency),
    whyItFits,
    matchPreview: otherPreview
      ? `${otherPreview.displayName}, ${otherPreview.age} · ${otherPreview.area}${
          otherPreview.occupation ? ` · ${otherPreview.occupation}` : ""
        } · ${otherPreview.interests.slice(0, 3).join(" · ")}${
          otherPreview.isDemo ? " · (demo profile)" : ""
        }`
      : "Someone compatible nearby",
    url: appUrl(`/drop/${drop._id}`),
  };
}

/** Send the invitation email + in-app notification to everyone still invited. */
export const dispatchInvitations = internalAction({
  args: { dropId: v.id("dateDrops") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const context = (await ctx.runQuery(internal.dateDrops.getDropContext, {
      dropId: args.dropId,
    })) as DropContext | null;
    if (!context) return null;

    for (const participant of context.participants) {
      if (participant.state !== "invited") continue;
      if (participant.emailMessageId) continue; // already invited

      // After a replacement, the oldest other row is the person who PASSED.
      // Never describe them to the new invitee.
      const others = activeCounterparts(
        context.participants,
        participant.userId,
      );
      const other = others.find((p) => p.userId !== participant.userId) ?? null;

      await ctx.runMutation(internal.notifications.create, {
        userId: participant.userId,
        kind: "invitation",
        title: "You've got a DateDrop",
        body: `${describeDateTime(context.drop.startMs, context.drop.timezone)} · ${context.drop.area} — ${context.drop.theme || context.drop.title}`,
        dropId: args.dropId,
        href: `/drop/${args.dropId}`,
      });

      await sendConciergeEmail(ctx, {
        userId: participant.userId,
        dropId: args.dropId,
        kind: "invitation",
        content: invitationEmail(
          emailData(
            context,
            participant.firstName,
            other?.preview ?? null,
            participant.privateWhyItFits || context.drop.whyItFits,
          ),
        ),
        idempotencyKey: `invite-${args.dropId}-${participant.userId}`,
        labels: ["invitation"],
      });
    }
    return null;
  },
});

export const notifyAcceptedWaiting = internalAction({
  args: { dropId: v.id("dateDrops"), userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const context = (await ctx.runQuery(internal.dateDrops.getDropContext, {
      dropId: args.dropId,
    })) as DropContext | null;
    if (!context) return null;
    const me = context.participants.find((p) => p.userId === args.userId);
    if (!me) return null;

    await ctx.runMutation(internal.notifications.create, {
      userId: args.userId,
      kind: "accepted",
      title: "You're in",
      body: "We're waiting on the other person. We'll tell you the moment it's a date.",
      dropId: args.dropId,
      href: `/drop/${args.dropId}`,
    });

    await sendConciergeEmail(ctx, {
      userId: args.userId,
      dropId: args.dropId,
      kind: "accepted_waiting",
      content: acceptedWaitingEmail(
        emailData(context, me.firstName, null, context.drop.whyItFits),
      ),
      idempotencyKey: `accepted-${args.dropId}-${args.userId}`,
      labels: ["accepted_waiting"],
    });
    return null;
  },
});

export const notifyConfirmed = internalAction({
  args: { dropId: v.id("dateDrops") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const context = (await ctx.runQuery(internal.dateDrops.getDropContext, {
      dropId: args.dropId,
    })) as DropContext | null;
    if (!context) return null;

    const firstStop = context.drop.itinerary[0];
    for (const participant of context.participants) {
      if (participant.state !== "confirmed") continue;
      const other = context.participants.find(
        (p) => p.userId !== participant.userId && p.state === "confirmed",
      );

      await ctx.runMutation(internal.notifications.create, {
        userId: participant.userId,
        kind: "confirmed",
        title: "It's a date",
        body: `${describeDateTime(context.drop.startMs, context.drop.timezone)} · ${firstStop?.venueName ?? context.drop.area}`,
        dropId: args.dropId,
        href: `/drop/${args.dropId}`,
      });

      await sendConciergeEmail(ctx, {
        userId: participant.userId,
        dropId: args.dropId,
        kind: "confirmed",
        content: confirmedEmail({
          ...emailData(
            context,
            participant.firstName,
            other?.preview ?? null,
            context.drop.whyItFits,
          ),
          venue: firstStop?.venueName ?? context.drop.area,
          address:
            firstStop?.address || `${context.drop.area}, ${context.drop.city}`,
          instructions: context.drop.meetingInstructions,
        }),
        idempotencyKey: `confirmed-${args.dropId}-${participant.userId}`,
        labels: ["confirmed"],
      });
    }
    return null;
  },
});

export const notifyClosed = internalAction({
  args: {
    dropId: v.id("dateDrops"),
    status: v.union(v.literal("expired_no_match"), v.literal("cancelled")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const context = (await ctx.runQuery(internal.dateDrops.getDropContext, {
      dropId: args.dropId,
    })) as DropContext | null;
    if (!context) return null;

    const expired = args.status === "expired_no_match";
    for (const participant of context.participants) {
      // Only tell people who had actually committed or were still deciding.
      if (participant.state === "passed" || participant.state === "replaced")
        continue;
      if (participant.expiryNotified) continue;

      const data = emailData(
        context,
        participant.firstName,
        null,
        context.drop.whyItFits,
      );

      await ctx.runMutation(internal.notifications.create, {
        userId: participant.userId,
        kind: expired ? "expired" : "cancelled",
        title: expired
          ? "We cancelled this one"
          : "That DateDrop was cancelled",
        body: expired
          ? "We couldn't find the right person for this plan, so we cancelled it rather than force a poor match."
          : (context.drop.cancelReason ?? "The DateDrop was cancelled."),
        dropId: args.dropId,
        href: `/drop/${args.dropId}`,
      });

      await sendConciergeEmail(ctx, {
        userId: participant.userId,
        dropId: args.dropId,
        kind: expired ? "expired" : "cancelled",
        content: expired
          ? expiredEmail(data)
          : cancelledEmail({
              ...data,
              reason:
                context.drop.cancelReason ?? "The DateDrop was cancelled.",
            }),
        idempotencyKey: `closed-${args.dropId}-${participant.userId}`,
        labels: [expired ? "expired" : "cancelled"],
      });

      await ctx.runMutation(internal.dateDrops.markExpiryNotified, {
        participantId: participant.participantId,
      });
    }
    return null;
  },
});

export const markExpiryNotified = internalMutation({
  args: { participantId: v.id("dateDropParticipants") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("dateDropParticipants", args.participantId, {
      expiryNotified: true,
    });
    return null;
  },
});

export const markReminderSent = internalMutation({
  args: { participantId: v.id("dateDropParticipants") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("dateDropParticipants", args.participantId, {
      reminderSentAt: Date.now(),
    });
    return null;
  },
});

export const sendReminders = internalAction({
  args: { dropId: v.id("dateDrops") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const context = (await ctx.runQuery(internal.dateDrops.getDropContext, {
      dropId: args.dropId,
    })) as DropContext | null;
    if (!context || context.drop.status !== "confirmed") return null;

    const firstStop = context.drop.itinerary[0];
    for (const participant of context.participants) {
      if (participant.state !== "confirmed") continue;
      if (participant.reminderSentAt) continue;

      await ctx.runMutation(internal.notifications.create, {
        userId: participant.userId,
        kind: "reminder",
        title: "Your DateDrop is coming up",
        body: `${describeDateTime(context.drop.startMs, context.drop.timezone)} · ${firstStop?.venueName ?? context.drop.area}`,
        dropId: args.dropId,
        href: `/drop/${args.dropId}`,
      });

      await sendConciergeEmail(ctx, {
        userId: participant.userId,
        dropId: args.dropId,
        kind: "reminder",
        content: reminderEmail({
          ...emailData(
            context,
            participant.firstName,
            null,
            context.drop.whyItFits,
          ),
          venue: firstStop?.venueName ?? context.drop.area,
          address:
            firstStop?.address || `${context.drop.area}, ${context.drop.city}`,
        }),
        idempotencyKey: `reminder-${args.dropId}-${participant.userId}`,
        labels: ["reminder"],
      });

      await ctx.runMutation(internal.dateDrops.markReminderSent, {
        participantId: participant.participantId,
      });
    }
    return null;
  },
});

/* ------------------------------- maintenance ------------------------------- */

/** Cron: close drops that ran past their confirmation deadline. */
export const expireOverdueDrops = internalMutation({
  args: { nowMs: v.number() },
  returns: v.number(),
  handler: async (ctx, args) => {
    let closed = 0;
    for (const status of [
      "inviting",
      "partially_accepted",
      "matching",
      "researching",
    ] as const) {
      const overdue = await ctx.db
        .query("dateDrops")
        .withIndex("by_status_and_deadline", (q) =>
          q.eq("status", status).lte("confirmDeadlineMs", args.nowMs),
        )
        .take(25);
      for (const drop of overdue) {
        await closeDrop(
          ctx,
          drop,
          "expired_no_match",
          args.nowMs,
          "We couldn't find the right second person before the cutoff.",
        );
        closed += 1;
      }
    }
    return closed;
  },
});

/** Cron: mark dates complete as soon as their planned end passes. */
export const completePastDrops = internalMutation({
  args: { nowMs: v.number() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const past = await ctx.db
      .query("dateDrops")
      .withIndex("by_status_and_end", (q) =>
        q.eq("status", "confirmed").lte("endMs", args.nowMs),
      )
      .take(25);

    for (const drop of past) {
      await ctx.db.patch("dateDrops", drop._id, {
        status: "completed",
        completedAt: args.nowMs,
        updatedAt: args.nowMs,
      });
      const participants = await ctx.db
        .query("dateDropParticipants")
        .withIndex("by_drop", (q) => q.eq("dropId", drop._id))
        .take(10);
      for (const p of participants) {
        if (p.availabilityId) {
          const window = await ctx.db.get("availability", p.availabilityId);
          if (window && window.status === "booked") {
            await ctx.db.patch("availability", window._id, {
              status: "expired",
            });
          }
        }

        const safetyProfile = await ctx.db
          .query("safetyProfiles")
          .withIndex("by_user", (q) => q.eq("userId", p.userId))
          .unique();
        if (safetyProfile?.postDateCheckIn !== false) {
          await ctx.db.insert("notifications", {
            userId: p.userId,
            kind: "safety",
            title: "How did your DateDrop feel?",
            body: "Your private check-in is optional and is never shown to your match.",
            dropId: drop._id,
            href: `/drop/${drop._id}`,
            read: false,
          });
        }
      }
      await recordAudit(ctx, {
        action: "drop.completed",
        dropId: drop._id,
        detail: `${drop.area}, ${drop.city}`,
      });
    }
    return past.length;
  },
});

/** Cron: 24-hour reminders for confirmed dates. */
export const queueReminders = internalMutation({
  args: { nowMs: v.number() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const soon = await ctx.db
      .query("dateDrops")
      .withIndex("by_status_and_start", (q) =>
        q
          .eq("status", "confirmed")
          .gt("startMs", args.nowMs)
          .lte("startMs", args.nowMs + DAY_MS),
      )
      .take(60);

    let queued = 0;
    for (const drop of soon) {
      // Without this marker the sweep would re-pick the same soonest batch
      // every run and never reach a backlog behind it.
      if (drop.remindersQueuedAt) continue;
      await ctx.db.patch("dateDrops", drop._id, {
        remindersQueuedAt: args.nowMs,
      });
      await ctx.scheduler.runAfter(0, internal.dateDrops.sendReminders, {
        dropId: drop._id,
      });
      queued += 1;
      if (queued >= 25) break;
    }
    return queued;
  },
});

/** Cron: retire availability windows that have simply passed. */
export const expireStaleAvailability = internalMutation({
  args: { nowMs: v.number() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const stale = await ctx.db
      .query("availability")
      .withIndex("by_status_and_start", (q) =>
        q.eq("status", "open").lt("startMs", args.nowMs),
      )
      .take(50);
    for (const window of stale) {
      await ctx.db.patch("availability", window._id, { status: "expired" });
    }
    return stale.length;
  },
});

/** Cron: keep denormalised ages accurate so queries never read the clock. */
/**
 * Keep denormalised ages accurate. Paginated with a persisted cursor so the
 * sweep covers every profile across runs instead of re-reading the first page
 * forever once the table outgrows one batch.
 */
export const refreshAges = internalMutation({
  args: { nowMs: v.number() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const JOB = "refreshAges";
    const saved = await ctx.db
      .query("jobCursors")
      .withIndex("by_job", (q) => q.eq("job", JOB))
      .unique();

    const page = await ctx.db
      .query("profiles")
      .paginate({ numItems: 200, cursor: saved?.cursor ?? null });

    let updated = 0;
    for (const profile of page.page) {
      const age = ageOn(profile.dobMs, args.nowMs);
      if (age !== profile.ageYears) {
        await ctx.db.patch("profiles", profile._id, { ageYears: age });
        updated += 1;
      }
    }

    // Restart from the top once we reach the end.
    const nextCursor = page.isDone ? null : page.continueCursor;
    if (saved) {
      await ctx.db.patch("jobCursors", saved._id, {
        cursor: nextCursor,
        updatedAt: args.nowMs,
      });
    } else {
      await ctx.db.insert("jobCursors", {
        job: JOB,
        cursor: nextCursor,
        updatedAt: args.nowMs,
      });
    }
    return updated;
  },
});
