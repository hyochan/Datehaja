export type CalendarEventStatus = "TENTATIVE" | "CONFIRMED" | "CANCELLED";

export type CalendarEvent = {
  uid: string;
  startMs: number;
  endMs: number;
  updatedAt: number;
  status: CalendarEventStatus;
  summary: string;
  description: string;
  location: string;
  url: string;
};

const CANCELLED_DROP_STATES = new Set([
  "cancelled",
  "expired_no_match",
  "failed",
]);

const CANCELLED_PARTICIPANT_STATES = new Set([
  "passed",
  "withdrawn",
  "expired",
  "cancelled",
  "replaced",
]);

/**
 * Calendar state is derived from the same DateDrop + participant state used by
 * the app. `reservedAt` prevents a declined invitation from appearing as a
 * cancellation in a calendar that never contained it.
 */
export function calendarEventStatus(args: {
  dropStatus: string;
  participantState: string;
  reservedAt?: number;
}): CalendarEventStatus | null {
  if (
    args.participantState === "confirmed" &&
    (args.dropStatus === "confirmed" || args.dropStatus === "completed")
  ) {
    return "CONFIRMED";
  }

  if (
    args.reservedAt &&
    (CANCELLED_DROP_STATES.has(args.dropStatus) ||
      CANCELLED_PARTICIPANT_STATES.has(args.participantState))
  ) {
    return "CANCELLED";
  }

  if (args.participantState === "accepted" && args.reservedAt) {
    return "TENTATIVE";
  }

  return null;
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function utc(ms: number): string {
  return new Date(ms)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function fold(line: string): string[] {
  const chunks: string[] = [];
  let rest = line;
  while (rest.length > 72) {
    chunks.push(rest.slice(0, 72));
    rest = ` ${rest.slice(72)}`;
  }
  chunks.push(rest);
  return chunks;
}

export function buildCalendar(events: CalendarEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DateDrop//Private Date Concierge//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:DateDrop",
    "REFRESH-INTERVAL;VALUE=DURATION:PT15M",
    "X-PUBLISHED-TTL:PT15M",
  ];

  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${escapeText(event.uid)}`,
      `DTSTAMP:${utc(event.updatedAt)}`,
      `LAST-MODIFIED:${utc(event.updatedAt)}`,
      `SEQUENCE:${Math.max(0, Math.floor(event.updatedAt / 1000))}`,
      `DTSTART:${utc(event.startMs)}`,
      `DTEND:${utc(event.endMs)}`,
      `STATUS:${event.status}`,
      `SUMMARY:${escapeText(event.summary)}`,
      `DESCRIPTION:${escapeText(event.description)}`,
      `LOCATION:${escapeText(event.location)}`,
      `URL:${event.url}`,
      "TRANSP:OPAQUE",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return `${lines.flatMap(fold).join("\r\n")}\r\n`;
}
