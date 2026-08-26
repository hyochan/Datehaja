import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { PASS_REASON_OPTIONS, PRESET_MESSAGES, REPORT_CATEGORY_OPTIONS } from "@convex/lib/catalog";
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
        <h1 className="mb-2 text-[22px]">We can't find that DateDrop</h1>
        <p className="mb-6 text-[15px] text-soft">
          It may have expired, or it isn't yours.
        </p>
        <Button onClick={() => navigate("/dashboard")}>Back to your DateDrops</Button>
      </Card>
    );
  }

  const isInvitation = drop.myState === "invited" || drop.myState === "viewed";
  const isConfirmed = drop.status === "confirmed" || drop.status === "completed";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-[14px] text-muted transition-colors hover:text-[var(--text)]"
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
        All DateDrops
      </Link>

      {isConfirmed && <ConfirmedBanner />}

      <PlanCard drop={drop} isInvitation={isInvitation} isConfirmed={isConfirmed} />

      {drop.match && <MatchCard drop={drop} isConfirmed={isConfirmed} />}

      {isInvitation && <RespondPanel dropId={id} drop={drop} />}

      {drop.awaitingOther && <WaitingPanel drop={drop} dropId={id} />}

      {isConfirmed && <ConfirmedPanel dropId={id} drop={drop} />}

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
    isDemo: boolean;
  } | null;
};

function ConfirmedBanner() {
  return (
    <div className="animate-drop-in rounded-card border border-[var(--tint-sage-border)] bg-[var(--tint-sage-bg)] px-6 py-5 text-center">
      <div className="font-display text-[28px] leading-tight text-[var(--tint-sage-fg)]">
        It's a date.
      </div>
      <p className="mt-1 text-[14.5px] text-[var(--tint-sage-fg)]">
        You're both in. Here's everything you need.
      </p>
    </div>
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
    <Card className="overflow-hidden">
      <div className="border-b border-[var(--border)] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {isInvitation ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tint-ember-bg)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--tint-ember-fg)]">
              <Logo className="h-4 w-4" />
              You've got a DateDrop
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
                    {formatTime(drop.startMs + stop.startOffsetMin * 60_000, drop.timezone)}
                    {" · "}
                    {durationLabel(stop.durationMin)}
                  </span>
                </div>
                <div className="mt-0.5 text-[13.5px] capitalize text-muted">
                  {stop.category.replace(/_/g, " ")}
                </div>
                {stop.note && (
                  <p className="mt-2 text-[14.5px] leading-relaxed text-soft">{stop.note}</p>
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
            <p className="text-[14.5px] leading-relaxed">{drop.meetingInstructions}</p>
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

function ConfidenceTag({ confidence }: { confidence: "high" | "medium" | "low" }) {
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

function MatchCard({ drop, isConfirmed }: { drop: DropView; isConfirmed: boolean }) {
  const match = drop.match!;
  return (
    <Card className="p-6">
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        {isConfirmed ? "You're meeting" : "Who you'd be meeting"}
      </div>

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
          That's everything they can see about you too — first name, age, area, a
          few interests. No email, no number, no exact location.{" "}
          <Link to="/privacy" className="underline underline-offset-2">
            What they see
          </Link>
        </p>
      )}
    </Card>
  );
}

/* ------------------------------ accept / pass ------------------------------ */

function RespondPanel({ dropId, drop }: { dropId: Id<"dateDrops">; drop: DropView }) {
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
      toast(result.confirmed ? "It's a date." : "You're in — we'll take it from here.", "success");
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
              Accept this DateDrop
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
            Accepting holds your evening. Nothing is confirmed until you both say
            yes — and they never find out if you pass.
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
          <h3 className="mb-1 text-[18px]">Anything we should learn from this?</h3>
          <p className="mb-4 text-[14px] text-soft">
            Entirely optional — it just makes the next one better.
          </p>
          <div className="mb-5 flex flex-wrap gap-2">
            {PASS_REASON_OPTIONS.map((option) => (
              <Chip
                key={option.key}
                selected={reason === option.key}
                onClick={() => setReason(reason === option.key ? null : option.key)}
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
              Pass on this DateDrop
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}

/* --------------------------------- waiting --------------------------------- */

function WaitingPanel({ drop, dropId }: { drop: DropView; dropId: Id<"dateDrops"> }) {
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
      <h3 className="text-[19px] leading-tight">Waiting on the other person.</h3>
      <p className="mt-2 text-[14.5px] leading-relaxed text-soft">
        Your evening is held. If they pass, we look for someone else who fits this
        same plan rather than cancelling on you — you don't need to do anything.
      </p>
      <p className="mt-3 text-[13.5px] text-muted">
        We'll stop looking {relativeTime(drop.confirmDeadlineMs)} and let you know
        either way.
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

function ConfirmedPanel({ dropId, drop }: { dropId: Id<"dateDrops">; drop: DropView }) {
  const confirmAttendance = useMutation(api.dateDrops.confirmAttendance);
  const cancel = useMutation(api.dateDrops.cancel);
  const sendMessage = useMutation(api.messages.send);
  const messages = useQuery(api.messages.list, { dropId });
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <Card className="p-6">
        <SectionHeading eyebrow="Before you go" title="Quick notes" />
        <p className="-mt-2 mb-4 text-[14px] leading-relaxed text-muted">
          A short list, on purpose. DateDrop isn't a chat app — this is just for
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
                Cancelling tells them straight away and frees both evenings. This
                can't be undone.
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setConfirming(false)}>
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

function ClosedPanel({ drop }: { drop: DropView }) {
  const expired = drop.status === "expired_no_match";
  return (
    <Card className="p-6">
      <h3 className="text-[19px] leading-tight">
        {expired ? "We cancelled this one." : "This DateDrop was cancelled."}
      </h3>
      <p className="mt-2 text-[14.5px] leading-relaxed text-soft">
        {expired
          ? "We couldn't find the right match for this plan before the cutoff, so we cancelled it rather than force a poor match."
          : (drop.cancelReason ?? "The DateDrop was cancelled.")}
      </p>
      <p className="mt-3 text-[14px] text-muted">
        Your availability is open again and we're already looking for the next one.
      </p>
      <div className="mt-5">
        <LinkButton to="/dashboard" variant="secondary">
          Back to your DateDrops
        </LinkButton>
      </div>
    </Card>
  );
}

/* ------------------------------- provenance -------------------------------- */

function Provenance({ dropId }: { dropId: Id<"dateDrops"> }) {
  const [open, setOpen] = useState(false);
  const data = useQuery(api.matching.dropProvenance, open ? { dropId } : "skip");

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
            The live sources and the reasoning behind this DateDrop
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
          className={cx("shrink-0 text-muted transition-transform", open && "rotate-180")}
        >
          <path d="M6 9.5l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-[var(--border)] p-5">
          {data === undefined ? (
            <Skeleton className="h-24 w-full" />
          ) : data === null ? (
            <p className="text-[14px] text-muted">Nothing recorded for this DateDrop.</p>
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
                    {data.venues.slice(0, 5).map(
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
                            <span className="text-[14px] font-medium">{venue.name}</span>
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
                          {run.totalTokens ? ` · ${run.totalTokens} tokens` : ""} ·{" "}
                          {run.status}
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
            This goes straight to our team with the DateDrop attached. If you're
            in danger, contact your local emergency services first — we're not an
            emergency service.
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
              description="Cancels any shared DateDrop and stops you ever being matched again."
            />
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
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
