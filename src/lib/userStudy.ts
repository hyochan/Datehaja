export type StudyResponse = {
  schemaVersion: 1;
  evidence: "participant_self_report";
  participantCode: string;
  locale: "ko" | "en";
  recordedAt: string;
  onboarding: "alone" | "help" | "stopped" | "not_tried";
  firstDate: "completed" | "waiting" | "failed" | "not_tried";
  before: number | null;
  feedback: "saved" | "failed" | "not_tried";
  secondDate: "completed" | "waiting" | "failed" | "not_tried";
  after: number | null;
  contactRule: "both_humans" | "agents" | "one_human" | "unsure";
  returnIntent: "yes" | "maybe" | "no";
  blocker: "none" | "signup" | "setup" | "waiting" | "dialogue" | "feedback" | "privacy" | "other";
};

/** Only closed answers: no names, email, profile, conversation or private memory. */
export function studyResponse(form: FormData, locale: "ko" | "en"): StudyResponse {
  const value = (key: string) => String(form.get(key) ?? "");
  const pick = <T extends string>(key: string, values: readonly T[]): T => {
    const result = value(key);
    if (!values.includes(result as T)) throw new Error("Complete all questions before downloading.");
    return result as T;
  };
  const rating = (key: string) => {
    const answer = value(key);
    if (answer === "not_rated") return null;
    if (!/^[1-5]$/.test(answer)) throw new Error("Choose a rating or Not rated.");
    return Number(answer);
  };
  const participantCode = value("participantCode").toUpperCase().trim();
  if (!/^P(?:0[1-9]|[1-9][0-9])$/.test(participantCode)) throw new Error("Use the participant code from your host, such as P01.");
  const firstDate = pick("firstDate", ["completed", "waiting", "failed", "not_tried"]);
  const secondDate = pick("secondDate", ["completed", "waiting", "failed", "not_tried"]);
  const feedback = pick("feedback", ["saved", "failed", "not_tried"]);
  const before = rating("before"), after = rating("after");
  if (firstDate !== "completed" && before !== null) throw new Error("Rate your Agent only after reading a completed date.");
  if (secondDate !== "completed" && after !== null) throw new Error("A waiting or failed second date cannot have an after rating.");
  if (after !== null && (feedback !== "saved" || firstDate !== "completed")) throw new Error("An after rating needs a completed first date and saved feedback.");
  return {
    schemaVersion: 1, evidence: "participant_self_report", participantCode, locale, recordedAt: new Date().toISOString(),
    onboarding: pick("onboarding", ["alone", "help", "stopped", "not_tried"]),
    firstDate, before, feedback, secondDate, after,
    contactRule: pick("contactRule", ["both_humans", "agents", "one_human", "unsure"]),
    returnIntent: pick("returnIntent", ["yes", "maybe", "no"]),
    blocker: pick("blocker", ["none", "signup", "setup", "waiting", "dialogue", "feedback", "privacy", "other"]),
  };
}
