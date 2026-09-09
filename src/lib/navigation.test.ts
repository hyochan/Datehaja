import { describe, expect, test } from "vitest";
import { safeAppDestination } from "./navigation";
describe("mail sign-in destinations", () => {
  test("preserves the private date and exact evidence anchor", () => {
    expect(safeAppDestination("/agent-date/abc?from=letter#turn-12")).toBe("/agent-date/abc?from=letter#turn-12");
    expect(safeAppDestination("/agent-date/abc#activity")).toBe("/agent-date/abc#activity");
  });
  test.each([null, "https://elsewhere.test", "//elsewhere.test", "/\\elsewhere.test", "/\n/elsewhere.test"])("rejects a non-app destination: %s", next => {
    expect(safeAppDestination(next)).toBe("/dashboard");
  });
});
