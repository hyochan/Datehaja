import { expect, test } from "vitest";
import { studyResponse } from "./userStudy";

function answers() {
  const form = new FormData();
  for (const [key, value] of Object.entries({ participantCode: "P01", onboarding: "alone", firstDate: "completed", before: "2", feedback: "saved", secondDate: "completed", after: "4", contactRule: "both_humans", returnIntent: "maybe", blocker: "dialogue" })) form.set(key, value);
  return form;
}
test("exports only closed self-report fields, never stray personal data", () => {
  const form = answers(); form.set("email", "private@example.test"); form.set("memory", "private conversation");
  const response = studyResponse(form, "en");
  expect(response.evidence).toBe("participant_self_report");
  expect(response.before).toBe(2); expect(response.after).toBe(4);
  expect(JSON.stringify(response)).not.toContain("private");
});
test("does not report a learning result before a new date completes", () => {
  const form = answers(); form.set("secondDate", "waiting");
  expect(() => studyResponse(form, "en")).toThrow("after rating");
  form.set("after", "not_rated");
  expect(studyResponse(form, "en").after).toBeNull();
});
test("rejects identifying participant labels and fabricated rating ranges", () => {
  const form = answers(); form.set("participantCode", "alice@example.com");
  expect(() => studyResponse(form, "en")).toThrow("participant code");
  form.set("participantCode", "P02"); form.set("before", "100");
  expect(() => studyResponse(form, "en")).toThrow("rating");
});
