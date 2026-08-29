import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { PageIntro } from "../components/layout/PageIntro";
import {
  Button,
  Card,
  SectionHeading,
  Skeleton,
  Toggle,
} from "../components/ui/primitives";
import { readableError, useToast } from "../components/ui/Toast";

type Preferences = {
  notifyEmail: boolean;
  notifyInvitations: boolean;
  notifyConfirmations: boolean;
  notifyReminders: boolean;
  dropsPaused: boolean;
  allowDemoMatches: boolean;
};

export default function SettingsPage() {
  const me = useQuery(api.profiles.me);
  const blocked = useQuery(api.safety.blockedList);
  const calendarFeed = useQuery(api.calendar.myFeed);
  const updatePrefs = useMutation(api.profiles.updateNotificationPreferences);
  const setStatus = useMutation(api.profiles.setStatus);
  const unblock = useMutation(api.safety.unblock);
  const rotateCalendar = useMutation(api.calendar.rotate);
  const disableCalendar = useMutation(api.calendar.disable);
  const { signOut } = useAuthActions();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  if (me === undefined) {
    return <Skeleton className="h-96 w-full rounded-card" />;
  }
  if (!me) return null;

  const prefs = me.preferences as Preferences | null;
  const profile = me.profile as {
    status?: string;
    displayName?: string;
  } | null;
  const paused = prefs?.dropsPaused === true || profile?.status === "paused";

  async function update(patch: Partial<Preferences>) {
    setBusy(true);
    try {
      await updatePrefs(patch);
    } catch (e) {
      toast(readableError(e), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="product-page mx-auto max-w-3xl space-y-10">
      <PageIntro
        eyebrow="Your account"
        title="Settings"
        description={
          <>
            Signed in as {me.email ?? "—"}. Your email is never shown to another
            user.
          </>
        }
        motif="◌"
        tone="sage"
      />

      {/* -------------------------- the big switch -------------------------- */}
      <section>
        <SectionHeading eyebrow="Control" title="Matching" />
        <Card className="p-2">
          <Toggle
            checked={!paused}
            disabled={busy}
            onChange={async (next) => {
              await update({ dropsPaused: !next });
              try {
                await setStatus({ status: next ? "active" : "paused" });
                toast(
                  next
                    ? "Matching is on again."
                    : "Paused. You won't get any more.",
                  "success",
                );
              } catch (e) {
                toast(readableError(e), "error");
              }
            }}
            label={paused ? "Matching is paused" : "Find dates for me"}
            description={
              paused
                ? "You won't be matched with anyone and nobody will see your profile. Nothing is deleted."
                : "Turn this off any time. You leave everyone's candidate pool straight away; a search already in flight may still deliver one last invitation."
            }
          />
          <Toggle
            checked={prefs?.allowDemoMatches ?? true}
            disabled={busy}
            onChange={(next) => update({ allowDemoMatches: next })}
            label="Include demo profiles"
            description="This deployment seeds clearly-marked fictional profiles so the product works from day one. Turn off to match only with real people."
          />
        </Card>
      </section>

      {/* ---------------------------- notifications ------------------------- */}
      <section>
        <SectionHeading eyebrow="Email" title="What Concierge sends you" />
        <Card className="p-2">
          <Toggle
            checked={prefs?.notifyEmail ?? true}
            disabled={busy}
            onChange={(next) => update({ notifyEmail: next })}
            label="Email me at all"
            description="Off means everything below is off too. Safety notices always send."
          />
          <Toggle
            checked={prefs?.notifyInvitations ?? true}
            disabled={busy || prefs?.notifyEmail === false}
            onChange={(next) => update({ notifyInvitations: next })}
            label="New date plans"
            description="The invitation itself, with the plan and who you'd be meeting."
          />
          <Toggle
            checked={prefs?.notifyConfirmations ?? true}
            disabled={busy || prefs?.notifyEmail === false}
            onChange={(next) => update({ notifyConfirmations: next })}
            label="Confirmations and changes"
            description="When it's a date, when something moves, when one is cancelled."
          />
          <Toggle
            checked={prefs?.notifyReminders ?? true}
            disabled={busy || prefs?.notifyEmail === false}
            onChange={(next) => update({ notifyReminders: next })}
            label="Reminders"
            description="A single nudge the day before a confirmed date."
          />
        </Card>
      </section>

      <section>
        <SectionHeading eyebrow="Connected apps" title="Private calendar" />
        <Card className="p-5">
          {calendarFeed === undefined ? (
            <Skeleton className="h-16 w-full rounded-card" />
          ) : calendarFeed === null ? (
            <p className="text-[14px] leading-relaxed text-muted">
              No calendar feed exists. Datehaja creates one only when you ask
              from a date plan.
            </p>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[15px] font-semibold">
                  Calendar subscription active
                </div>
                <p className="mt-1 max-w-md text-[13px] leading-relaxed text-muted">
                  Anyone with its secret link can read your Datehaja event
                  times. Rotate a leaked link or revoke it completely.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await rotateCalendar({});
                      toast("Private calendar link rotated.", "success");
                    } catch (error) {
                      toast(readableError(error), "error");
                    }
                  }}
                >
                  Rotate link
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={async () => {
                    try {
                      await disableCalendar({});
                      toast("Private calendar feed revoked.", "success");
                    } catch (error) {
                      toast(readableError(error), "error");
                    }
                  }}
                >
                  Revoke
                </Button>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* ------------------------------- links ------------------------------ */}
      <section>
        <SectionHeading eyebrow="Your account" title="Profile & matching" />
        <Card className="divide-y divide-[var(--border)]">
          <SettingsLink
            to="/profile"
            title="Profile"
            body="Name, bio, interests, photo"
          />
          <SettingsLink
            to="/preferences"
            title="Matching preferences"
            body="Age, distance, intent, budget, dietary and accessibility needs"
          />
          <SettingsLink
            to="/availability"
            title="Availability"
            body="When you're free"
          />
          <SettingsLink
            to="/privacy"
            title="Privacy"
            body="Exactly what another person can see about you"
          />
          <SettingsLink
            to="/terms"
            title="Terms of Service"
            body="The agreement and current effective date"
          />
          <SettingsLink
            to="/community-guidelines"
            title="Community Guidelines"
            body="Consent, conduct, reporting, and appeals"
          />
          <SettingsLink
            to="/safety"
            title="Safety Center"
            body="Blocking, reporting, and what we do and don't verify"
          />
          <SettingsLink
            to="/demo"
            title="Demo controls"
            body="Play the other side of a date plan with a demo profile"
          />
        </Card>
      </section>

      {/* ------------------------------ blocked ----------------------------- */}
      <section>
        <SectionHeading eyebrow="Safety" title="Blocked people" />
        {blocked === undefined ? (
          <Skeleton className="h-16 w-full rounded-card" />
        ) : blocked.length === 0 ? (
          <Card className="p-5 text-[14.5px] text-muted">
            You haven't blocked anyone. Blocking is mutual and permanent until
            you undo it here.
          </Card>
        ) : (
          <Card className="divide-y divide-[var(--border)]">
            {blocked.map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center justify-between gap-3 p-4"
              >
                <span className="text-[15px]">{entry.displayName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    try {
                      await unblock({ userId: entry.userId as Id<"users"> });
                      toast("Unblocked.", "success");
                    } catch (e) {
                      toast(readableError(e), "error");
                    }
                  }}
                >
                  Unblock
                </Button>
              </div>
            ))}
          </Card>
        )}
      </section>

      <div className="pb-4">
        <Button variant="secondary" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
    </div>
  );
}

function SettingsLink({
  to,
  title,
  body,
}: {
  to: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-[var(--bg-sunken)]"
    >
      <span className="min-w-0">
        <span className="block text-[15px] font-medium">{title}</span>
        <span className="mt-0.5 block text-[13.5px] text-muted">{body}</span>
      </span>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="shrink-0 text-muted"
      >
        <path d="M10 6l6 6-6 6" />
      </svg>
    </Link>
  );
}
