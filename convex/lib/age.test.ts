import { describe, expect, it } from "vitest";
import { ageOn, parseDobString } from "./age";

describe("calendar age validation", () => {
  it("accepts real calendar dates including leap day", () => {
    expect(parseDobString("2000-02-29")).toBe(Date.UTC(2000, 1, 29, 12));
  });

  it("rejects impossible and malformed dates instead of normalising them", () => {
    expect(parseDobString("2001-02-29")).toBeNull();
    expect(parseDobString("1993-04-31")).toBeNull();
    expect(parseDobString("06/15/1993")).toBeNull();
  });

  it("changes age exactly on the birthday", () => {
    const dob = parseDobString("2008-08-29")!;
    expect(ageOn(dob, Date.UTC(2026, 7, 28, 23, 59))).toBe(17);
    expect(ageOn(dob, Date.UTC(2026, 7, 29, 0, 0))).toBe(18);
  });
});
