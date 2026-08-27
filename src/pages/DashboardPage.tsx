import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { DropCard, type DropSummary } from "../components/dates/DropCard";
import { Logo } from "../components/layout/Logo";
import {
  Button,
  Card,
  EmptyState,
  LinkButton,
  SectionHeading,
  Skeleton,
  Tag,
  cx,
} from "../components/ui/primitives";
import { readableError, useToast } from "../components/ui/Toast";
import { formatDay, formatRange } from "../lib/format";
import { useI18n } from "../i18n";

export default function DashboardPage() {
  const nowMs = useMemo(() => Date.now(), []);
  const board = useQuery(api.dateDrops.dashboard);
  const windows = useQuery(api.availability.upcoming, { nowMs });
  const run = useQuery(api.matching.activeRun);
  const me = useQuery(api.profiles.me);
  const requestDrop = useMutation(api.matching.requestDrop);
  const toast = useToast();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);

  const searching =
    run !== undefined && run !== null && run.status === "running";

  async function findMeADate() {
    setBusy(true);
    try {
      await requestDrop({});
      toast(t("On it — we're looking now."), "success");
    } catch (e) {
      toast(readableError(e), "error");
    } finally {
      setBusy(false);
    }
  }

  const firstName =
    (me?.profile as { displayName?: string } | null)?.displayName ?? "";
  const openWindows = (windows ?? []).filter((w) => w.status === "open");
  const invitations = (board?.invitations ?? []) as DropSummary[];
  const upcoming = (board?.upcoming ?? []) as DropSummary[];
  const waiting = (board?.waiting ?? []) as DropSummary[];
  // The hero slot already offers the search when there's nothing else to show.
  const showingIdleCta =
    board !== undefined &&
    invitations.length === 0 &&
    !searching &&
    upcoming.length === 0;

  return (
    <div className="space-y-10">
      <header>
        <div className="docket-label mb-2 text-[var(--accent-text)]">
          {t("Your concierge desk")}
        </div>
        <h1 className="text-[30px] leading-tight">
          {firstName
            ? t("Hi, {name}.", { name: firstName.split(" ")[0] })
            : t("Your DateDrops")}
        </h1>
        <p className="mt-1.5 text-[15.5px] text-soft">
          {t("Tell us when. We handle who & where.")}
        </p>
      </header>

      {/* ------------------------- your next DateDrop ------------------------- */}
      <section aria-labelledby="next-heading">
        <h2 id="next-heading" className="sr-only">
          {t("Your next DateDrop")}
        </h2>

        {board === undefined ? (
          <Card className="p-6">
            <Skeleton className="mb-3 h-5 w-40" />
            <Skeleton className="mb-2 h-8 w-64" />
            <Skeleton className="h-4 w-52" />
          </Card>
        ) : invitations.length > 0 ? (
          <div className="space-y-3">
            <SectionHeading
              eyebrow={t("Waiting on you")}
              title={
                invitations.length === 1
                  ? t("You've got a DateDrop")
                  : t("You've got {count} DateDrops", {
                      count: invitations.length,
                    })
              }
            />
            <ul className="space-y-3">
              {invitations.map((drop) => (
                <DropCard key={drop.dropId} drop={drop} variant="invitation" />
              ))}
            </ul>
          </div>
        ) : searching ? (
          <SearchProgress stage={run?.stage ?? "hard_filter"} />
        ) : upcoming.length > 0 ? (
          <div className="space-y-3">
            <SectionHeading eyebrow={t("Confirmed")} title={t("It's a date")} />
            <ul className="space-y-3">
              {upcoming.map((drop) => (
                <DropCard key={drop.dropId} drop={drop} variant="confirmed" />
              ))}
            </ul>
          </div>
        ) : (
          <IdleCard
            openWindowCount={openWindows.length}
            nextWindow={openWindows[0]}
            busy={busy}
            onFind={findMeADate}
          />
        )}
      </section>

      {/* ------------------------------ waiting ------------------------------ */}
      {waiting.length > 0 && (
        <section aria-labelledby="waiting-heading">
          <SectionHeading
            eyebrow={t("You said yes")}
            title={t("Waiting on the other person")}
          />
          <p className="mb-4 -mt-2 max-w-lg text-[14px] leading-relaxed text-muted">
            {t(
              "Your evening is held. If they pass, we look for someone else who fits the same plan rather than cancelling on you.",
            )}
          </p>
          <ul className="space-y-3">
            {waiting.map((drop) => (
              <DropCard key={drop.dropId} drop={drop} />
            ))}
          </ul>
        </section>
      )}

      {/* ---------------------------- upcoming ------------------------------- */}
      {upcoming.length > 0 && invitations.length > 0 && (
        <section aria-labelledby="upcoming-heading">
          <SectionHeading eyebrow={t("Confirmed")} title={t("Coming up")} />
          <ul className="space-y-3">
            {upcoming.map((drop) => (
              <DropCard key={drop.dropId} drop={drop} variant="confirmed" />
            ))}
          </ul>
        </section>
      )}

      {/* ---------------------------- availability --------------------------- */}
      <section aria-labelledby="availability-heading">
        <SectionHeading
          eyebrow={t("Your availability")}
          title={t("When you're free")}
          action={
            <Link
              to="/availability"
              className="text-[14px] font-medium text-[var(--accent-text)] hover:underline"
            >
              {t("Edit")}
            </Link>
          }
        />
        {/* You can always ask for another DateDrop, even with one confirmed —
            as long as you have an evening free and nothing is already running. */}
        {openWindows.length > 0 && !searching && !showingIdleCta && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-card border border-[var(--border)] bg-[var(--bg-sunken)] px-4 py-3.5">
            <p className="min-w-0 flex-1 text-[14.5px] text-soft">
              {openWindows.length === 1
                ? t("You've still got an evening open.")
                : t("You've still got {count} evenings open.", {
                    count: openWindows.length,
                  })}{" "}
              {t("Want another DateDrop?")}
            </p>
            <Button onClick={findMeADate} loading={busy} size="sm">
              {t("Find me a date")}
            </Button>
          </div>
        )}
        {windows === undefined ? (
          <Skeleton className="h-20 w-full rounded-card" />
        ) : openWindows.length === 0 ? (
          <Card>
            <EmptyState
              title={t("No open windows")}
              body={t("Add an evening you're free and we'll start looking straight away.")}
              action={
                <LinkButton to="/availability">{t("Add availability")}</LinkButton>
              }
            />
          </Card>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {openWindows.slice(0, 4).map((window) => (
              <li key={window._id}>
                <Card className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <div className="text-[14.5px] font-medium">
                      {formatDay(window.startMs, window.timezone)}
                    </div>
                    <div className="text-[13px] text-muted">
                      {formatRange(
                        window.startMs,
                        window.endMs,
                        window.timezone,
                      )}
                    </div>
                  </div>
                  <Tag tone="sage">{t("Open")}</Tag>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------- history ----------------------------- */}
      {board && board.history.length > 0 && (
        <section aria-labelledby="history-heading">
          <SectionHeading
            eyebrow={t("Previously")}
            title={t("History")}
            action={
              <Link
                to="/history"
                className="text-[14px] font-medium text-[var(--accent-text)] hover:underline"
              >
                {t("See all")}
              </Link>
            }
          />
          <ul className="space-y-3">
            {(board.history as DropSummary[]).slice(0, 3).map((drop) => (
              <DropCard key={drop.dropId} drop={drop} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/* ---------------------------- idle / call to action ------------------------ */

function IdleCard({
  openWindowCount,
  nextWindow,
  busy,
  onFind,
}: {
  openWindowCount: number;
  nextWindow?: { startMs: number; endMs: number; timezone: string };
  busy: boolean;
  onFind: () => void;
}) {
  const { t } = useI18n();

  if (openWindowCount === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Logo className="h-10 w-10" />}
          title={t("We only need one thing")}
          body={t("Tell us when you're free. We'll find someone compatible, plan a real date, and send it to you both.")}
          action={
            <LinkButton to="/availability" size="lg">
              {t("Add availability")}
            </LinkButton>
          }
        />
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-7">
      <div className="docket-label mb-1 text-muted">{t("Your next DateDrop")}</div>
      <h2 className="font-display text-[24px] leading-tight sm:text-[27px]">
        {nextWindow ? (
          t("You're free {date}.", {
            date: formatDay(nextWindow.startMs, nextWindow.timezone),
          })
        ) : (
          t("You're free soon.")
        )}
      </h2>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-soft">
        {openWindowCount === 1
          ? t("One window open. Ask us to look now, or add more times to widen the net.")
          : t("{count} windows open. We'll use whichever finds the best match first.", {
              count: openWindowCount,
            })}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={onFind} loading={busy} size="lg">
          {t("Find me a date")}
        </Button>
        <LinkButton to="/availability" variant="secondary" size="lg">
          {t("Add another time")}
        </LinkButton>
      </div>
    </Card>
  );
}

/* ------------------------- live matching progress -------------------------- */

const STAGES = [
  { key: "hard_filter", label: "Checking who's free when you are" },
  { key: "ai_ranking", label: "Finding compatible people" },
  { key: "research", label: "Researching real date ideas" },
  { key: "inviting", label: "Building your DateDrop" },
] as const;

const STAGE_ORDER: Record<string, number> = {
  hard_filter: 0,
  scoring: 0,
  ai_ranking: 1,
  research: 2,
  planning: 2,
  inviting: 3,
  done: 4,
  failed: 4,
};

/**
 * Every row here maps to a real stage recorded on the matchingRuns document —
 * nothing is faked to look busy.
 */
function SearchProgress({ stage }: { stage: string }) {
  const current = STAGE_ORDER[stage] ?? 0;
  const { t } = useI18n();

  return (
    <Card className="p-6 sm:p-7">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember-300 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ember-400" />
        </span>
        <span className="docket-label text-[var(--tint-ember-strong)]">
          {t("Working on it")}
        </span>
      </div>

      <h2 className="font-display text-[24px] leading-tight">
        {t("We're looking for your DateDrop.")}
      </h2>

      <ol className="mt-6 space-y-3.5">
        {STAGES.map((item, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={item.key} className="flex items-center gap-3">
              <span
                className={cx(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                  done
                    ? "border-sage-500 bg-sage-500 text-white"
                    : active
                      ? "border-ember-400 bg-[var(--tint-ember-bg)]"
                      : "border-[var(--border-strong)]",
                )}
              >
                {done ? (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M3.5 8.5l3 3 6-7" />
                  </svg>
                ) : active ? (
                  <span className="h-2 w-2 animate-pulse-soft rounded-full bg-ember-400" />
                ) : null}
              </span>
              <span
                className={cx(
                  "text-[15px]",
                  done ? "text-muted" : active ? "font-medium" : "text-muted",
                )}
              >
                {t(item.label)}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="mt-6 text-[13.5px] leading-relaxed text-muted">
        {t(
          "This usually takes under a minute. You can close this page — we'll email you the moment there's something to look at.",
        )}
      </p>
    </Card>
  );
}
