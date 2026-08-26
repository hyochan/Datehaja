/** Human labels for DateDrop lifecycle states. Users never see a raw enum. */

export type Tone = "neutral" | "ember" | "sage" | "dusk" | "warn";

export function dropStatusLabel(
  status: string,
  myState: string,
): { label: string; tone: Tone } {
  switch (status) {
    case "confirmed":
      return { label: "It's a date", tone: "sage" };
    case "completed":
      return { label: "Been and gone", tone: "neutral" };
    case "cancelled":
      return { label: "Cancelled", tone: "neutral" };
    case "expired_no_match":
      return { label: "Didn't fill", tone: "neutral" };
    case "failed":
      return { label: "Didn't work out", tone: "neutral" };
    case "partially_accepted":
      if (myState === "accepted" || myState === "confirmed") {
        return { label: "Waiting on them", tone: "dusk" };
      }
      if (myState === "passed") return { label: "You passed", tone: "neutral" };
      return { label: "Waiting on you", tone: "ember" };
    case "inviting":
      if (myState === "accepted") return { label: "Waiting on them", tone: "dusk" };
      if (myState === "passed") return { label: "You passed", tone: "neutral" };
      return { label: "Waiting on you", tone: "ember" };
    case "matching":
    case "researching":
      return { label: "Being planned", tone: "dusk" };
    default:
      if (myState === "passed") return { label: "You passed", tone: "neutral" };
      if (myState === "withdrawn") return { label: "You withdrew", tone: "neutral" };
      return { label: "In progress", tone: "neutral" };
  }
}
