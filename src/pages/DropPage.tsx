import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  PASS_REASON_OPTIONS,
  PRESET_MESSAGES,
  REPORT_CATEGORY_OPTIONS,
} from "@convex/lib/catalog";
import { Logo } from "../components/layout/Logo";
import {
  Button,
  Card,
  Chip,
  LinkButton,
  SectionHeading,
  Skeleton,
  Tag,
  TextArea,
  Toggle,
  cx,
} from "../components/ui/primitives";
import { readableError, useToast } from "../components/ui/Toast";
import { dropStatusLabel } from "../lib/status";
import { useI18n } from "../i18n";
import {
  countdown,
  durationLabel,
  formatDateTime,
  formatTime,
  mapsUrl,
  relativeTime,
} from "../lib/format";

export default function DropPage() {
  const { dropId } = useParams<{ dropId: string }>();
  const id = dropId as Id<"dateDrops">;
  const drop = useQuery(api.dateDrops.get, { dropId: id });
  const markViewed = useMutation(api.dateDrops.markViewed);
  const navigate = useNavigate();

  useEffect(() => {
    if (drop && drop.myState === "invited") {
      void markViewed({ dropId: id });
    }
  }, [drop?.myState, id, markViewed, drop]);

  if (drop === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64 w-full rounded-card" />
      </div>
    );
  }

  if (drop === null) {
    return (
      <Card className="p-8 text-center">
        <h1 className="mb-2 text-[22px]">We can't find that date plan</h1>
        <p className="mb-6 text-[15px] text-soft">
          It may have expired, or it isn't yours.
        </p>
        <Button onClick={() => navigate("/dashboard")}>
          Back to your dates
        </Button>
      </Card>
    );
  }

  const isInvitation = drop.myState === "invited" || drop.myState === "viewed";
  const isConfirmed =
    drop.status === "confirmed" || drop.status === "completed";

  return (
    <div className="date-plan-page product-page mx-auto max-w-3xl space-y-7">
      <Link
        to="/dashboard"
        className="date-plan-back inline-flex items-center gap-1.5 text-[14px] text-muted transition-colors hover:text-[var(--text)]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M14 6l-6 6 6 6" />
        </svg>
        All dates
      </Link>

      {isConfirmed && (
        <ConfirmedBanner completed={drop.status === "completed"} />
      )}

      <PlanCard
        drop={drop}
        isInvitation={isInvitation}
        isConfirmed={isConfirmed}
      />

      {drop.calendarState !== "none" && <CalendarPanel drop={drop} />}

      {drop.match && <MatchCard drop={drop} isConfirmed={isConfirmed} />}

      {isInvitation && <RespondPanel dropId={id} drop={drop} />}

      {drop.awaitingOther && <WaitingPanel drop={drop} dropId={id} />}

      {drop.status === "confirmed" && (
        <ConfirmedPanel dropId={id} drop={drop} />
      )}

      {drop.status === "completed" && <FeedbackPanel dropId={id} />}

      {(drop.status === "cancelled" || drop.status === "expired_no_match") && (
        <ClosedPanel drop={drop} />
      )}

      <Provenance dropId={id} />

      {(isInvitation || isConfirmed || drop.awaitingOther) && (
        <SafetyPanel dropId={id} />
      )}
    </div>
  );
}

/* ------------------------------- the plan ---------------------------------- */

type DropView = {
  dropId: Id<"dateDrops">;
  status: string;
  myState: string;
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
  estimatedDurationMin: number;
  meetingInstructions: string;
  itinerary: Array<{
    order: number;
    venueName: string;
    category: string;
    startOffsetMin: number;
    durationMin: number;
    address: string;
    note: string;
    mapsQuery: string;
    sourceUrl?: string;
    confidence: "high" | "medium" | "low";
  }>;
  confirmDeadlineMs: number;
  isDemo: boolean;
  revealed: boolean;
  matchPhotoUrl: string | null;
  awaitingOther: boolean;
  attendanceConfirmed: boolean;
  cancelReason: string | null;
  otherWithdrew: boolean;
  calendarState: "none" | "reserved" | "finalized" | "cancelled";
  match: {
    displayName: string;
    age: number;
    area: string;
    city: string;
    occupation: string | null;
    interests: string[];
    languages: string[];
    socialEnergy: string;
    pronouns: string | null;
    bio: string;
    personalityTraits: string[];
    styleTags: string[];
    firstDateVibe: string[];
    relationshipIntent: string | null;
    isDemo: boolean;
  } | null;
};

function ConfirmedBanner({ completed }: { completed: boolean }) {
  const { t } = useI18n();
  return (
    <div className="confirmed-ribbon animate-drop-in rounded-card border border-[var(--tint-sage-border)] bg-[var(--tint-sage-bg)] px-6 py-5 text-center">
      <div className="font-display text-[28px] leading-tight text-[var(--tint-sage-fg)]">
        {completed ? t("How did it go?") : t("It's a date.")}
      </div>
      <p className="mt-1 text-[14.5px] text-[var(--tint-sage-fg)]">
        {completed
          ? t("The plan is complete. Your private check-in is ready.")
          : t("You're both in. Here's everything you need.")}
      </p>
    </div>
  );
}

/* ------------------------------ calendar sync ----------------------------- */

function CalendarPanel({ drop }: { drop: DropView }) {
  const { t } = useI18n();
  const feed = useQuery(api.calendar.myFeed);
  const enable = useMutation(api.calendar.enable);
  const toast = useToast();
  const [enabling, setEnabling] = useState(false);

  const status =
    drop.calendarState === "reserved"
      ? {
          label: t("Reserved"),
          title: t("Your evening is held."),
          body: t(
            "The calendar event is tentative while the other person decides.",
          ),
          tone: "warn" as const,
        }
      : drop.calendarState === "finalized"
        ? {
            label: t("Finalized"),
            title: t("The date is on."),
            body: t(
              "Your calendar receives the public venue and confirmed time.",
            ),
            tone: "sage" as const,
          }
        : {
            label: t("Cancelled"),
            title: t("The evening is released."),
            body: t(
              "Subscribed calendars receive the cancellation from the same event.",
            ),
            tone: "neutral" as const,
          };

  async function ensureFeed(): Promise<string | null> {
    if (feed?.url) return feed.url;
    setEnabling(true);
    try {
      const created = await enable({});
      toast(t("Private calendar link created."), "success");
      return created.url;
    } catch (error) {
      toast(readableError(error), "error");
      return null;
    } finally {
      setEnabling(false);
    }
  }

  async function copyLink(url: string) {
    await navigator.clipboard.writeText(url);
    toast(t("Private calendar link copied."), "success");
  }

  async function openGoogleCalendar() {
    const url = await ensureFeed();
    if (!url) return;
    try {
      await copyLink(url);
      window.open(
        "https://calendar.google.com/calendar/u/0/r/settings/addbyurl",
        "_blank",
        "noopener,noreferrer",
      );
      toast(t("Paste the copied link into Google Calendar."), "info");
    } catch (error) {
      toast(readableError(error), "error");
    }
  }

  async function openCalendarApp() {
    const url = await ensureFeed();
    if (!url) return;
    window.location.href = url.replace(/^https:/, "webcal:");
  }

  return (
    <Card className="calendar-docket overflow-hidden">
      <div className="grid sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2.5">
            <Tag tone={status.tone}>{status.label}</Tag>
            <span className="text-[12px] text-muted">
              {t("Live calendar status")}
            </span>
          </div>
          <h2 className="text-[19px] leading-tight">{status.title}</h2>
          <p className="mt-1.5 max-w-lg text-[14px] leading-relaxed text-soft">
            {status.body}{" "}
            {t(
              "Subscribe once; the same event moves from reserved to finalized or cancelled.",
            )}
          </p>
        </div>
        <div className="flex flex-col gap-2 border-t border-[var(--border)] bg-[var(--bg-sunken)] p-4 sm:min-w-52 sm:border-l sm:border-t-0">
          <Button size="sm" loading={enabling} onClick={openGoogleCalendar}>
            {t("Google Calendar")}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            loading={enabling}
            onClick={openCalendarApp}
          >
            {t("Apple / calendar app")}
          </Button>
          {feed?.url && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void copyLink(feed.url)}
            >
              {t("Copy private link")}
            </Button>
          )}
          <p className="px-1 text-[10.5px] leading-relaxed text-muted">
            {t(
              "Anyone with this secret link can read your date times. Calendar apps refresh on their own schedule.",
            )}
          </p>
        </div>
      </div>
    </Card>
  );
}

function PlanCard({
  drop,
  isInvitation,
  isConfirmed,
}: {
  drop: DropView;
  isInvitation: boolean;
  isConfirmed: boolean;
}) {
  return (
    <Card className="plan-docket overflow-hidden">
      <div className="border-b border-[var(--border)] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {isInvitation ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tint-ember-bg)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--tint-ember-fg)]">
              <Logo className="h-4 w-4" />
              Your date plan is ready
            </span>
          ) : isConfirmed ? (
            <Tag tone="sage">Confirmed</Tag>
          ) : (
            <StatusTag status={drop.status} myState={drop.myState} />
          )}
          {isInvitation && (
            <span className="text-[13px] font-medium text-muted">
              {countdown(drop.confirmDeadlineMs)} to decide
            </span>
          )}
        </div>

        <h1 className="font-display text-[27px] leading-tight sm:text-[31px]">
          {formatDateTime(drop.startMs, drop.timezone)}
        </h1>
        <p className="mt-1.5 text-[16px] text-soft">
          {drop.area}, {drop.city}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-muted">
          <span className="flex items-center gap-1.5">
            <ClockIcon /> {durationLabel(drop.estimatedDurationMin)}
          </span>
          <span className="flex items-center gap-1.5">
            <WalletIcon /> ≈ {drop.costLabel} per person
          </span>
        </div>

        {drop.summary && (
          <p className="mt-4 text-[15.5px] leading-relaxed">{drop.summary}</p>
        )}
      </div>

      <div className="p-6">
        <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          The plan
        </div>
        <ol className="space-y-5">
          {drop.itinerary.map((stop, index) => (
            <li key={`${stop.venueName}-${index}`} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--tint-ember-bg)] text-[13px] font-semibold text-[var(--tint-ember-strong)]">
                  {index + 1}
                </span>
                {index < drop.itinerary.length - 1 && (
                  <span className="mt-1 w-px flex-1 bg-[var(--border-strong)]" />
                )}
              </div>
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-[17px] font-medium">{stop.venueName}</h3>
                  <span className="text-[13px] text-muted">
                    {formatTime(
                      drop.startMs + stop.startOffsetMin * 60_000,
                      drop.timezone,
                    )}
                    {" · "}
                    {durationLabel(stop.durationMin)}
                  </span>
                </div>
                <div className="mt-0.5 text-[13.5px] capitalize text-muted">
                  {stop.category.replace(/_/g, " ")}
                </div>
                {stop.note && (
                  <p className="mt-2 text-[14.5px] leading-relaxed text-soft">
                    {stop.note}
                  </p>
                )}
                {isConfirmed && stop.address && (
                  <p className="mt-2 text-[14px] text-soft">{stop.address}</p>
                )}
                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[13px]">
                  {isConfirmed && (
                    <a
                      href={mapsUrl(stop.mapsQuery)}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-medium text-[var(--accent-text)] hover:underline"
                    >
                      Open in Maps
                    </a>
                  )}
                  {stop.sourceUrl && (
                    <a
                      href={stop.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-muted underline underline-offset-2 hover:text-[var(--text)]"
                    >
                      Source
                    </a>
                  )}
                  <ConfidenceTag confidence={stop.confidence} />
                </div>
              </div>
            </li>
          ))}
        </ol>

        {isConfirmed && drop.meetingInstructions && (
          <div className="mt-6 rounded-xl bg-[var(--bg-sunken)] p-4">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
              Meeting up
            </div>
            <p className="text-[14.5px] leading-relaxed">
              {drop.meetingInstructions}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

function StatusTag({ status, myState }: { status: string; myState: string }) {
  const { label, tone } = dropStatusLabel(status, myState);
  return <Tag tone={tone}>{label}</Tag>;
}

function ConfidenceTag({
  confidence,
}: {
  confidence: "high" | "medium" | "low";
}) {
  if (confidence === "high") return null;
  return (
    <span
      className={cx(
        "rounded-full px-2 py-0.5 text-[11px] font-medium",
        confidence === "low"
          ? "bg-[var(--tint-warn-bg)] text-[var(--tint-warn-fg)]"
          : "bg-[var(--bg-sunken)] text-muted",
      )}
      title="How confidently we could confirm this from the source page"
    >
      {confidence === "low" ? "Unconfirmed details" : "Partly confirmed"}
    </span>
  );
}

/* -------------------------------- the match -------------------------------- */

function MatchCard({
  drop,
  isConfirmed,
}: {
  drop: DropView;
  isConfirmed: boolean;
}) {
  const { t } = useI18n();
  const match = drop.match!;
  return (
    <Card className="match-profile-card overflow-hidden">
      <div className="border-b border-[var(--border)] bg-[var(--bg-sunken)] px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="docket-label text-[var(--accent-text)]">
            {t(isConfirmed ? "Your date" : "Your match")}
          </div>
          <Tag tone={drop.matchPhotoUrl ? "sage" : "neutral"}>
            {drop.matchPhotoUrl ? t("Photo shared") : t("Photo optional")}
          </Tag>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start gap-4">
          {drop.matchPhotoUrl ? (
            <img
              src={drop.matchPhotoUrl}
              alt=""
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--tint-ember-bg)] font-display text-[24px] text-[var(--accent-text)]">
              {match.displayName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] leading-tight">
              {match.displayName} · {match.age}
            </h2>
            <p className="mt-0.5 text-[14.5px] text-soft">
              {match.area}
              {match.occupation ? ` · ${match.occupation}` : ""}
              {match.pronouns ? ` · ${match.pronouns}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {match.interests.map((interest) => (
                <Chip key={interest} size="sm">
                  {interest}
                </Chip>
              ))}
            </div>
            {match.isDemo && (
              <div className="mt-3">
                <Tag tone="dusk">Fictional demo profile</Tag>
              </div>
            )}
          </div>
        </div>

        {match.bio && (
          <div className="mt-5 border-l-2 border-[var(--color-ember-300)] pl-4">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
              {t("In their own words")}
            </div>
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-soft">
              {match.bio}
            </p>
          </div>
        )}

        {(match.personalityTraits.length > 0 ||
          match.styleTags.length > 0 ||
          match.firstDateVibe.length > 0 ||
          match.relationshipIntent) && (
          <div className="mt-5 grid gap-4 rounded-xl border border-[var(--border)] p-4 sm:grid-cols-2">
            {match.personalityTraits.length > 0 && (
              <ProfileDetail
                label={t("They describe themselves as")}
                values={match.personalityTraits}
              />
            )}
            {match.styleTags.length > 0 && (
              <ProfileDetail
                label={t("Their style")}
                values={match.styleTags}
              />
            )}
            {match.firstDateVibe.length > 0 && (
              <ProfileDetail
                label={t("A good first date feels")}
                values={match.firstDateVibe}
              />
            )}
            {match.relationshipIntent && (
              <ProfileDetail
                label={t("Open to")}
                values={[match.relationshipIntent.replace(/_/g, " ")]}
              />
            )}
          </div>
        )}

        {(drop.privateWhyItFits || drop.whyItFits) && (
          <div className="mt-5 rounded-xl bg-[var(--bg-sunken)] p-4">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
              Why we think this fits
            </div>
            <p className="text-[15px] leading-relaxed">
              {drop.privateWhyItFits || drop.whyItFits}
            </p>
          </div>
        )}

        {!isConfirmed && (
          <p className="mt-4 text-[13px] leading-relaxed text-muted">
            {t(
              "They receive the same kind of profile card. Contact details and exact location stay private.",
            )}{" "}
            <Link to="/privacy" className="underline underline-offset-2">
              What they see
            </Link>
          </p>
        )}
      </div>
    </Card>
  );
}

function ProfileDetail({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {values.map((value) => (
          <Chip key={value} size="sm">
            {value}
          </Chip>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ accept / pass ------------------------------ */

function RespondPanel({
  dropId,
  drop,
}: {
  dropId: Id<"dateDrops">;
  drop: DropView;
}) {
  const accept = useMutation(api.dateDrops.accept);
  const pass = useMutation(api.dateDrops.pass);
  const toast = useToast();
  const [busy, setBusy] = useState<"accept" | "pass" | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  async function handleAccept() {
    setBusy("accept");
    try {
      const result = await accept({ dropId });
      toast(
        result.confirmed
          ? "It's a date."
          : "You're in — we'll take it from here.",
        "success",
      );
    } catch (e) {
      toast(readableError(e), "error");
    } finally {
      setBusy(null);
    }
  }

  async function handlePass() {
    setBusy("pass");
    try {
      await pass({
        dropId,
        reason: (reason ?? undefined) as never,
      });
      toast("Passed. We'll keep looking.", "info");
      setShowPass(false);
    } catch (e) {
      toast(readableError(e), "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="p-6">
      {!showPass ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <Button
              size="lg"
              onClick={handleAccept}
              loading={busy === "accept"}
              className="flex-1"
            >
              Accept this date
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setShowPass(true)}
              disabled={busy !== null}
              className="flex-1"
            >
              Pass
            </Button>
          </div>
          <p className="mt-4 text-center text-[13px] leading-relaxed text-muted">
            Accepting holds your evening. Nothing is confirmed until you both
            say yes — and they never find out if you pass.
          </p>
          {drop.isDemo && (
            <p className="mt-3 text-center text-[13px] text-muted">
              This match is a demo profile. After you accept, you can play their
              side from{" "}
              <Link to="/demo" className="underline underline-offset-2">
                Demo controls
              </Link>
              .
            </p>
          )}
        </>
      ) : (
        <>
          <h3 className="mb-1 text-[18px]">
            Anything we should learn from this?
          </h3>
          <p className="mb-4 text-[14px] text-soft">
            Entirely optional — it just makes the next one better.
          </p>
          <div className="mb-5 flex flex-wrap gap-2">
            {PASS_REASON_OPTIONS.map((option) => (
              <Chip
                key={option.key}
                selected={reason === option.key}
                onClick={() =>
                  setReason(reason === option.key ? null : option.key)
                }
              >
                {option.label}
              </Chip>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="secondary"
              onClick={() => setShowPass(false)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              variant="danger"
              onClick={handlePass}
              loading={busy === "pass"}
              className="flex-1"
            >
              Pass on this date
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}

/* --------------------------------- waiting --------------------------------- */

function WaitingPanel({
  drop,
  dropId,
}: {
  drop: DropView;
  dropId: Id<"dateDrops">;
}) {
  const withdraw = useMutation(api.dateDrops.withdraw);
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  return (
    <Card className="p-6">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-dusk-300 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-dusk-500" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--tint-dusk-fg)]">
          You're in
        </span>
      </div>
      <h3 className="text-[19px] leading-tight">
        Waiting on the other person.
      </h3>
      <p className="mt-2 text-[14.5px] leading-relaxed text-soft">
        Your evening is held. If they pass, we look for someone else who fits
        this same plan rather than cancelling on you — you don't need to do
        anything.
      </p>
      <p className="mt-3 text-[13.5px] text-muted">
        We'll stop looking {relativeTime(drop.confirmDeadlineMs)} and let you
        know either way.
      </p>
      <div className="mt-5">
        <Button
          variant="ghost"
          size="sm"
          loading={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await withdraw({ dropId });
              toast("Withdrawn. Your evening is free again.", "info");
            } catch (e) {
              toast(readableError(e), "error");
            } finally {
              setBusy(false);
            }
          }}
        >
          I can't make it after all
        </Button>
      </div>
    </Card>
  );
}

/* ------------------------------- confirmed --------------------------------- */

function ConfirmedPanel({
  dropId,
  drop,
}: {
  dropId: Id<"dateDrops">;
  drop: DropView;
}) {
  const confirmAttendance = useMutation(api.dateDrops.confirmAttendance);
  const cancel = useMutation(api.dateDrops.cancel);
  const sharePlan = useMutation(api.safety.sharePlan);
  const safetyProfile = useQuery(api.safety.mySafetyProfile);
  const sendMessage = useMutation(api.messages.send);
  const messages = useQuery(api.messages.list, { dropId });
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [sharing, setSharing] = useState(false);

  return (
    <>
      <Card className="p-6">
        <SectionHeading eyebrow="Before you go" title="Quick notes" />
        <p className="-mt-2 mb-4 text-[14px] leading-relaxed text-muted">
          A short list, on purpose. Datehaja isn't a chat app — this is just for
          the things a real evening needs.
        </p>

        {messages && messages.length > 0 && (
          <ul className="mb-4 space-y-2">
            {messages.map((message) => (
              <li
                key={message._id}
                className={cx(
                  "flex flex-col gap-0.5 rounded-xl px-3.5 py-2.5 text-[14.5px]",
                  message.mine
                    ? "ml-8 bg-[var(--tint-ember-bg)] text-[var(--tint-ember-fg)]"
                    : "mr-8 bg-[var(--bg-sunken)]",
                )}
              >
                <span>{message.body}</span>
                <span className="text-[11.5px] text-muted">
                  {message.mine ? "You" : message.fromName} ·{" "}
                  {relativeTime(message._creationTime)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2">
          {PRESET_MESSAGES.map((preset) => (
            <Chip
              key={preset.key}
              size="sm"
              onClick={async () => {
                try {
                  await sendMessage({ dropId, presetKey: preset.key });
                } catch (e) {
                  toast(readableError(e), "error");
                }
              }}
            >
              {preset.body}
            </Chip>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-md">
            <div className="docket-label text-[var(--accent-text)]">
              Safety handoff
            </div>
            <h3 className="mt-2 text-[19px] leading-tight">
              Let one person know the plan.
            </h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-soft">
              We send your first name, the time, and the public venue. Your
              match's identity and contact details stay private.
            </p>
          </div>
          {safetyProfile?.trustedContactName ? (
            <Button
              variant="secondary"
              loading={sharing}
              onClick={async () => {
                setSharing(true);
                try {
                  const result = await sharePlan({ dropId });
                  toast(
                    result.status === "sent"
                      ? `Already shared with ${safetyProfile.trustedContactName}.`
                      : `Sending the plan to ${safetyProfile.trustedContactName}.`,
                    "success",
                  );
                } catch (error) {
                  toast(readableError(error), "error");
                } finally {
                  setSharing(false);
                }
              }}
            >
              Share with {safetyProfile.trustedContactName}
            </Button>
          ) : (
            <LinkButton to="/safety" variant="secondary">
              Add a trusted contact
            </LinkButton>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-3">
          {!drop.attendanceConfirmed ? (
            <Button
              loading={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await confirmAttendance({ dropId });
                  toast("Confirmed. See you there.", "success");
                } catch (e) {
                  toast(readableError(e), "error");
                } finally {
                  setBusy(false);
                }
              }}
            >
              I'll be there
            </Button>
          ) : (
            <Tag tone="sage">You've confirmed you're going</Tag>
          )}

          {!confirming ? (
            <Button variant="ghost" onClick={() => setConfirming(true)}>
              Cancel this date
            </Button>
          ) : (
            <div className="w-full rounded-xl border border-[var(--tint-ember-border)] bg-[var(--tint-ember-bg)] p-4">
              <p className="mb-3 text-[14.5px]">
                Cancelling tells them straight away and frees both evenings.
                This can't be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setConfirming(false)}
                >
                  Keep the date
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  loading={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await cancel({ dropId, reason: "They had to cancel." });
                      toast("Cancelled. We've let them know.", "info");
                    } catch (e) {
                      toast(readableError(e), "error");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Cancel it
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}

/* ----------------------------- post-date check-in -------------------------- */

type DateOutcome = "went" | "no_show" | "left_early" | "did_not_go";
type DateSafety = "safe" | "uncomfortable" | "unsafe" | "prefer_not_to_say";
type MeetAgain = "yes" | "maybe" | "no" | "prefer_not_to_say";
type ProfileAccuracy =
  "accurate" | "mostly_accurate" | "different" | "prefer_not_to_say";
type Respect = "yes" | "mostly" | "no" | "prefer_not_to_say";
type Connection = "easy" | "mixed" | "difficult" | "prefer_not_to_say";

function FeedbackPanel({ dropId }: { dropId: Id<"dateDrops"> }) {
  const { t } = useI18n();
  const feedback = useQuery(api.feedback.mine, { dropId });
  const submit = useMutation(api.feedback.submit);
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<DateOutcome | null>(null);
  const [safety, setSafety] = useState<DateSafety | null>(null);
  const [meetAgain, setMeetAgain] = useState<MeetAgain | null>(null);
  const [profileAccuracy, setProfileAccuracy] =
    useState<ProfileAccuracy | null>(null);
  const [respectful, setRespectful] = useState<Respect | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [venueRating, setVenueRating] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [followUpRequested, setFollowUpRequested] = useState(false);

  function editExisting() {
    if (feedback) {
      setOutcome(feedback.outcome);
      setSafety(feedback.safety);
      setMeetAgain(feedback.meetAgain);
      setProfileAccuracy(feedback.profileAccuracy);
      setRespectful(feedback.respectful);
      setConnection(feedback.connection);
      setVenueRating(feedback.venueRating);
      setNote(feedback.note ?? "");
      setFollowUpRequested(feedback.followUpRequested);
    }
    setEditing(true);
  }

  if (feedback === undefined)
    return <Skeleton className="h-44 w-full rounded-card" />;

  if (feedback && !editing) {
    const mutual = feedback.mutualStatus === "mutual";
    const waiting = feedback.mutualStatus === "waiting";
    return (
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Tag tone={mutual ? "sage" : "dusk"}>
              {t(mutual ? "You both said yes" : "Private response sealed")}
            </Tag>
            <h2 className="mt-3 text-[20px] leading-tight">
              {t(
                mutual
                  ? "You both want another date."
                  : waiting
                    ? "We'll only reveal a mutual yes."
                    : "Your check-in is complete.",
              )}
            </h2>
            <p className="mt-1.5 max-w-md text-[14px] leading-relaxed text-soft">
              {t(
                mutual
                  ? "Your private answers matched. Pick another activity when you're ready; every other review answer stays private."
                  : waiting
                    ? "Your answer stays sealed while we wait. Neither person sees a no, maybe, or who answered first."
                    : "Neither person sees who said no or maybe. Accuracy, respect, and safety feedback only improve future matching.",
              )}
            </p>
            {mutual && (
              <div className="mt-4">
                <LinkButton to="/availability" size="sm">
                  {t("Open another evening")}
                </LinkButton>
              </div>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={editExisting}>
            {t("Update response")}
          </Button>
        </div>
      </Card>
    );
  }

  const safetyNeedsFollowUp = safety === "uncomfortable" || safety === "unsafe";

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[var(--border)] bg-[var(--bg-sunken)] p-6">
        <div className="docket-label text-[var(--accent-text)]">
          {t("After the date")}
        </div>
        <h2 className="mt-2 text-[23px] leading-tight">
          {t("How did it feel?")}
        </h2>
        <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-soft">
          {t(
            "Your review stays private. Only an explicit yes is revealed, and only when you both choose it.",
          )}
        </p>
      </div>

      <div className="space-y-7 p-6">
        <FeedbackChoice
          label={t("What happened?")}
          value={outcome}
          onChange={setOutcome}
          options={[
            ["went", t("We met")],
            ["no_show", t("They didn't show")],
            ["left_early", t("I left early")],
            ["did_not_go", t("I didn't go")],
          ]}
        />

        {outcome === "went" && (
          <>
            <FeedbackChoice
              label={t("Did their profile feel accurate?")}
              value={profileAccuracy}
              onChange={setProfileAccuracy}
              options={[
                ["accurate", t("Yes, accurate")],
                ["mostly_accurate", t("Mostly")],
                ["different", t("Quite different")],
                ["prefer_not_to_say", t("Prefer not to say")],
              ]}
            />

            <FeedbackChoice
              label={t("Did they respect your time and boundaries?")}
              value={respectful}
              onChange={setRespectful}
              options={[
                ["yes", t("Yes")],
                ["mostly", t("Mostly")],
                ["no", t("No")],
                ["prefer_not_to_say", t("Prefer not to say")],
              ]}
            />

            <FeedbackChoice
              label={t("How did the conversation feel?")}
              value={connection}
              onChange={setConnection}
              options={[
                ["easy", t("Easy")],
                ["mixed", t("Mixed")],
                ["difficult", t("Difficult")],
                ["prefer_not_to_say", t("Prefer not to say")],
              ]}
            />
          </>
        )}

        <FeedbackChoice
          label={t("Did you feel safe?")}
          value={safety}
          onChange={(value) => {
            setSafety(value);
            if (value === "unsafe") setFollowUpRequested(true);
          }}
          options={[
            ["safe", t("Yes")],
            ["uncomfortable", t("Uncomfortable")],
            ["unsafe", t("No")],
            ["prefer_not_to_say", t("Prefer not to say")],
          ]}
        />

        <FeedbackChoice
          label={t("Would you meet them again?")}
          value={meetAgain}
          onChange={setMeetAgain}
          options={[
            ["yes", t("Yes")],
            ["maybe", t("Maybe")],
            ["no", t("No")],
            ["prefer_not_to_say", t("Prefer not to say")],
          ]}
        />

        <div>
          <div className="mb-2 text-[14px] font-medium">
            {t("How was the venue?")}{" "}
            <span className="font-normal text-muted">{t("optional")}</span>
          </div>
          <div className="flex gap-2" aria-label={t("Venue rating")}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <Chip
                key={rating}
                selected={venueRating === rating}
                onClick={() =>
                  setVenueRating(venueRating === rating ? null : rating)
                }
              >
                {rating} {rating === 1 ? t("star") : t("stars")}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="date-feedback-note"
            className="mb-2 block text-[14px] font-medium"
          >
            {t("Anything else?")}{" "}
            <span className="font-normal text-muted">{t("optional")}</span>
          </label>
          <TextArea
            id="date-feedback-note"
            value={note}
            maxLength={800}
            placeholder={t("A private note for Datehaja — never your match.")}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>

        {safetyNeedsFollowUp && (
          <div className="rounded-2xl border border-[var(--tint-warn-border)] bg-[var(--tint-warn-bg)] p-2">
            <Toggle
              checked={followUpRequested}
              onChange={setFollowUpRequested}
              label={t("I want safety follow-up")}
              description={t(
                "Save this as a private safety follow-up request. For immediate danger, contact local emergency services.",
              )}
            />
            <div className="px-3 pb-2">
              <Link
                to="/safety"
                className="text-[12.5px] underline underline-offset-2"
              >
                {t("Open the Safety Center")}
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            loading={busy}
            disabled={
              !outcome ||
              !safety ||
              !meetAgain ||
              (outcome === "went" &&
                (!profileAccuracy || !respectful || !connection))
            }
            onClick={async () => {
              if (!outcome || !safety || !meetAgain) return;
              setBusy(true);
              try {
                await submit({
                  dropId,
                  outcome,
                  safety,
                  meetAgain,
                  profileAccuracy:
                    outcome === "went"
                      ? (profileAccuracy ?? undefined)
                      : undefined,
                  respectful:
                    outcome === "went" ? (respectful ?? undefined) : undefined,
                  connection:
                    outcome === "went" ? (connection ?? undefined) : undefined,
                  venueRating: venueRating ?? undefined,
                  note: note.trim() || undefined,
                  followUpRequested,
                });
                setEditing(false);
                toast(t("Your private response is saved."), "success");
              } catch (error) {
                toast(readableError(error), "error");
              } finally {
                setBusy(false);
              }
            }}
          >
            {t("Save private response")}
          </Button>
          {feedback && (
            <Button variant="ghost" onClick={() => setEditing(false)}>
              {t("Keep previous response")}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function FeedbackChoice<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T | null;
  onChange: (value: T) => void;
  options: Array<readonly [T, string]>;
}) {
  return (
    <div>
      <div className="mb-2 text-[14px] font-medium">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map(([key, optionLabel]) => (
          <Chip
            key={key}
            selected={value === key}
            onClick={() => onChange(key)}
          >
            {optionLabel}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function ClosedPanel({ drop }: { drop: DropView }) {
  const expired = drop.status === "expired_no_match";
  return (
    <Card className="p-6">
      <h3 className="text-[19px] leading-tight">
        {expired ? "We cancelled this one." : "This date was cancelled."}
      </h3>
      <p className="mt-2 text-[14.5px] leading-relaxed text-soft">
        {expired
          ? "We couldn't find the right match for this plan before the cutoff, so we cancelled it rather than force a poor match."
          : (drop.cancelReason ?? "The date was cancelled.")}
      </p>
      <p className="mt-3 text-[14px] text-muted">
        Your availability is open again and we're already looking for the next
        one.
      </p>
      <div className="mt-5">
        <LinkButton to="/dashboard" variant="secondary">
          Back to your dates
        </LinkButton>
      </div>
    </Card>
  );
}

/* ------------------------------- provenance -------------------------------- */

function Provenance({ dropId }: { dropId: Id<"dateDrops"> }) {
  const [open, setOpen] = useState(false);
  const data = useQuery(
    api.matching.dropProvenance,
    open ? { dropId } : "skip",
  );

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-[var(--bg-sunken)]"
      >
        <div>
          <div className="text-[15px] font-medium">How we built this</div>
          <div className="mt-0.5 text-[13.5px] text-muted">
            The live sources and reasoning behind this date plan
          </div>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={cx(
            "shrink-0 text-muted transition-transform",
            open && "rotate-180",
          )}
        >
          <path d="M6 9.5l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-[var(--border)] p-5">
          {data === undefined ? (
            <Skeleton className="h-24 w-full" />
          ) : data === null ? (
            <p className="text-[14px] text-muted">
              Nothing recorded for this date plan.
            </p>
          ) : (
            <div className="space-y-5">
              {data.research && (
                <div>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                    Live web research · {data.research.provider}
                  </div>
                  <p className="mb-3 text-[14px] text-soft">
                    {data.research.venueCount} venues extracted from{" "}
                    {data.research.sourceUrls.length} pages
                    {data.research.finishedAt
                      ? ` · ${relativeTime(data.research.finishedAt)}`
                      : ""}
                    {data.research.error ? ` · ${data.research.error}` : ""}
                  </p>
                  <ul className="space-y-1.5">
                    {data.research.sourceUrls.slice(0, 8).map((url: string) => (
                      <li key={url}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="break-all text-[13px] text-muted underline underline-offset-2 hover:text-[var(--text)]"
                        >
                          {url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.venues?.length > 0 && (
                <div>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                    What the pages actually said
                  </div>
                  <ul className="space-y-3">
                    {data.venues
                      .slice(0, 5)
                      .map(
                        (venue: {
                          name: string;
                          confidence: string;
                          evidence: string;
                          openingHours: string | null;
                          approximatePrice: string | null;
                        }) => (
                          <li
                            key={venue.name}
                            className="rounded-lg bg-[var(--bg-sunken)] p-3"
                          >
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="text-[14px] font-medium">
                                {venue.name}
                              </span>
                              <span className="text-[11.5px] uppercase tracking-wide text-muted">
                                {venue.confidence}
                              </span>
                            </div>
                            {venue.evidence && (
                              <p className="mt-1.5 text-[13px] italic leading-relaxed text-muted">
                                “{venue.evidence}”
                              </p>
                            )}
                            {(venue.openingHours || venue.approximatePrice) && (
                              <p className="mt-1.5 text-[12.5px] text-muted">
                                {[venue.openingHours, venue.approximatePrice]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            )}
                          </li>
                        ),
                      )}
                  </ul>
                </div>
              )}

              {data.aiRuns?.length > 0 && (
                <div>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                    Model runs
                  </div>
                  <ul className="space-y-1.5">
                    {data.aiRuns.map(
                      (
                        run: {
                          purpose: string;
                          model: string;
                          status: string;
                          latencyMs: number;
                          totalTokens: number | null;
                          inputSummary: string;
                        },
                        index: number,
                      ) => (
                        <li key={index} className="text-[13px] text-muted">
                          <span className="font-medium text-[var(--text-soft)]">
                            {run.purpose.replace(/_/g, " ")}
                          </span>{" "}
                          · {run.model} · {run.latencyMs}ms
                          {run.totalTokens
                            ? ` · ${run.totalTokens} tokens`
                            : ""}{" "}
                          · {run.status}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}

              <p className="text-[12.5px] leading-relaxed text-muted">
                Compatibility scores stay internal by design — showing people a
                number invites them to optimise for it instead of for a good
                evening.
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/* --------------------------------- safety ---------------------------------- */

function SafetyPanel({ dropId }: { dropId: Id<"dateDrops"> }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [busy, setBusy] = useState(false);
  const report = useMutation(api.safety.report);
  const block = useMutation(api.safety.blockFromDrop);
  const toast = useToast();

  return (
    <Card className="p-5">
      {!open ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13.5px] text-muted">
            Something feel wrong?{" "}
            <Link to="/safety" className="underline underline-offset-2">
              Safety Center
            </Link>
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await block({ dropId });
                  toast("Blocked. You'll never be matched again.", "success");
                } catch (e) {
                  toast(readableError(e), "error");
                }
              }}
            >
              Block
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              Report
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="mb-1 text-[18px]">Report this person</h3>
          <p className="mb-4 text-[14px] leading-relaxed text-soft">
            This goes straight to our team with the date plan attached. If
            you're in danger, contact your local emergency services first —
            we're not an emergency service.
          </p>

          <div className="mb-4 flex flex-wrap gap-2">
            {REPORT_CATEGORY_OPTIONS.map((option) => (
              <Chip
                key={option.key}
                selected={category === option.key}
                onClick={() => setCategory(option.key)}
              >
                {option.label}
              </Chip>
            ))}
          </div>

          <TextArea
            value={details}
            maxLength={1000}
            placeholder="What happened? Anything you can tell us helps."
            onChange={(e) => setDetails(e.target.value)}
            aria-label="Report details"
          />

          <div className="my-3">
            <Toggle
              checked={alsoBlock}
              onChange={setAlsoBlock}
              label="Also block them"
              description="Cancels any shared date and stops you ever being matched again."
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={busy}
              disabled={!category}
              onClick={async () => {
                if (!category) return;
                setBusy(true);
                try {
                  await report({
                    dropId,
                    category: category as never,
                    details,
                    alsoBlock,
                  });
                  toast("Report sent. Thank you for telling us.", "success");
                  setOpen(false);
                } catch (e) {
                  toast(readableError(e), "error");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Send report
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ---------------------------------- icons ---------------------------------- */

function ClockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M16.5 12.5h2M3 10h18" />
    </svg>
  );
}
