import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  Button,
  Card,
  Chip,
  EmptyState,
  Notice,
  Spinner,
  TextArea,
  TextInput,
} from "../ui/primitives";
import { readableError, useToast } from "../ui/Toast";
import {
  formatDay,
  formatRange,
  fromDateAndTime,
  localTimezone,
  toDateInputValue,
} from "../../lib/format";
import { useI18n } from "../../i18n";

const QUICK_SLOTS = [
  { label: "Evening", start: "18:00", end: "22:30" },
  { label: "Afternoon", start: "13:00", end: "17:30" },
  { label: "Late", start: "20:00", end: "23:59" },
  { label: "All day", start: "11:00", end: "22:00" },
];

const DATE_IDEA_PRESETS = [
  "Watch a film",
  "Take a walk",
  "See an exhibition",
  "Hear live music",
] as const;

/** The primary action of the whole product: say when you're free. */
export function AvailabilityEditor({ compact }: { compact?: boolean }) {
  const [nowMs] = useState(() => Date.now());
  const me = useQuery(api.profiles.me);
  const windows = useQuery(api.availability.upcoming, { nowMs });
  const addWindow = useMutation(api.availability.add);
  const removeWindow = useMutation(api.availability.remove);
  const toast = useToast();
  const { t } = useI18n();

  // Times are read in the timezone of the city the date will happen in, so
  // "Saturday evening" means the same thing wherever the browser is.
  const zone =
    (me?.profile as { timezone?: string } | null | undefined)?.timezone ??
    localTimezone();
  const [date, setDate] = useState(() =>
    toDateInputValue(nowMs + 2 * 86_400_000, zone),
  );
  const [slot, setSlot] = useState(QUICK_SLOTS[0].label);
  const [customStart, setCustomStart] = useState("18:00");
  const [customEnd, setCustomEnd] = useState("22:30");
  const [dateIdea, setDateIdea] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usingCustom = slot === "Custom";
  const active = QUICK_SLOTS.find((s) => s.label === slot);
  const startTime = usingCustom ? customStart : (active?.start ?? "18:00");
  const endTime = usingCustom ? customEnd : (active?.end ?? "22:30");

  async function handleAdd() {
    setError(null);
    if (dateIdea.trim().length < 3) {
      const message = t("Tell us what you'd like to do on this date.");
      setError(message);
      return;
    }
    const startMs = fromDateAndTime(date, startTime, zone);
    const endMs = fromDateAndTime(date, endTime, zone);
    setBusy(true);
    try {
      await addWindow({ startMs, endMs, note: dateIdea.trim() });
      setDateIdea("");
      toast(t("Added to your availability."), "success");
    } catch (e) {
      const message = readableError(e);
      setError(message);
      toast(message, "error");
    } finally {
      setBusy(false);
    }
  }

  const minDate = toDateInputValue(nowMs, zone);
  const maxDate = toDateInputValue(nowMs + 60 * 86_400_000, zone);

  return (
    <div className="space-y-4">
      <Card className="date-composer p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <label className="flex-1 min-w-40">
            <span className="mb-1.5 block text-[13px] font-medium text-soft">
              {t("Day")}
            </span>
            <TextInput
              type="date"
              value={date}
              min={minDate}
              max={maxDate}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        </div>

        <div className="mb-4">
          <span className="mb-2 block text-[13px] font-medium text-soft">
            {t("When, roughly")}
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_SLOTS.map((option) => (
              <Chip
                key={option.label}
                selected={slot === option.label}
                onClick={() => setSlot(option.label)}
              >
                {t(option.label)}
                <span className="text-[12px] opacity-70">
                  {option.start}–{option.end}
                </span>
              </Chip>
            ))}
            <Chip selected={usingCustom} onClick={() => setSlot("Custom")}>
              {t("Custom")}
            </Chip>
          </div>
        </div>

        {usingCustom && (
          <div className="mb-4 flex items-end gap-3">
            <label className="flex-1">
              <span className="mb-1.5 block text-[13px] font-medium text-soft">
                {t("From")}
              </span>
              <TextInput
                type="time"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
            </label>
            <label className="flex-1">
              <span className="mb-1.5 block text-[13px] font-medium text-soft">
                {t("Until")}
              </span>
              <TextInput
                type="time"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </label>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="date-idea">
            <span className="mb-1.5 block text-[13px] font-medium text-soft">
              {t("What would you like to do?")}
            </span>
            <span className="mb-2 block text-[12px] leading-relaxed text-muted">
              {t(
                "Start with the date, not the profile. A film by itself is a complete plan.",
              )}
            </span>
          </label>
          <TextArea
            id="date-idea"
            value={dateIdea}
            maxLength={140}
            placeholder={t(
              "Watch an indie film. Happy to call it a night when the credits roll.",
            )}
            onChange={(event) => setDateIdea(event.target.value)}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {DATE_IDEA_PRESETS.map((preset) => (
              <Chip key={preset} onClick={() => setDateIdea(t(preset))}>
                {t(preset)}
              </Chip>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4">
            <Notice tone="warn">{error}</Notice>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="text-[12.5px] text-muted">
            {t(
              "Times are local to {zone}. We need at least 90 minutes to plan something worth going to.",
              { zone: zone.split("/").pop()?.replace(/_/g, " ") ?? zone },
            )}
          </p>
          <Button onClick={handleAdd} loading={busy} size="sm">
            {t("Add")}
          </Button>
        </div>
      </Card>

      {windows === undefined ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-5 w-5 text-ember-400" />
        </div>
      ) : windows.length === 0 ? (
        <Card>
          <EmptyState
            title={t("Nothing on the calendar yet")}
            body={t("Tell us what you'd like to do on this date.")}
          />
        </Card>
      ) : (
        <ul className="space-y-2">
          {windows.map((window) => (
            <li key={window._id}>
              <Card className="availability-slip flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-medium">
                    {formatDay(window.startMs, window.timezone)}
                  </div>
                  <div className="text-[13.5px] text-muted">
                    {formatRange(window.startMs, window.endMs, window.timezone)}
                  </div>
                  {window.note && (
                    <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--tint-ember-bg)] px-3 py-1.5 text-[11.5px] font-semibold text-[var(--tint-ember-fg)]">
                      <span aria-hidden>✦</span>
                      <span className="truncate">{window.note}</span>
                    </div>
                  )}
                </div>
                <WindowStatus status={window.status} />
                {window.status !== "booked" && (
                  <button
                    type="button"
                    aria-label={t("Remove this window")}
                    onClick={async () => {
                      try {
                        await removeWindow({
                          availabilityId: window._id as Id<"availability">,
                        });
                      } catch (e) {
                        toast(readableError(e), "error");
                      }
                    }}
                    className="shrink-0 rounded-full p-2 text-muted transition-colors hover:bg-[var(--bg-sunken)] hover:text-[var(--accent-text)]"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      aria-hidden
                    >
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}

      {!compact && windows && windows.length > 0 && (
        <p className="px-1 text-[13px] leading-relaxed text-muted">
          {t(
            "A held window means a date plan is in progress. Booked means the date is confirmed — cancel the date if you can't make it.",
          )}
        </p>
      )}
    </div>
  );
}

function WindowStatus({ status }: { status: string }) {
  const { t } = useI18n();

  if (status === "open") {
    return (
      <span className="shrink-0 rounded-full bg-[var(--tint-sage-bg)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--tint-sage-fg)]">
        {t("Open")}
      </span>
    );
  }
  if (status === "held") {
    return (
      <span className="shrink-0 rounded-full bg-[var(--tint-dusk-bg)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--tint-dusk-fg)]">
        {t("Held")}
      </span>
    );
  }
  if (status === "booked") {
    return (
      <span className="shrink-0 rounded-full bg-[var(--tint-ember-bg)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--tint-ember-fg)]">
        {t("Booked")}
      </span>
    );
  }
  return null;
}
