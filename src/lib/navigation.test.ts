import { describe, expect, test } from "vitest";
import { parseAgentDateSearchParam, safeAppDestination } from "./navigation";

describe("dashboard date search params", () => {
  test("accepts the well-formed ids the dashboard already used to query", () => {
    expect(parseAgentDateSearchParam("aaaaaaaaaaaaaaaaaaaa")).toBe(
      "aaaaaaaaaaaaaaaaaaaa",
    );
    expect(
      parseAgentDateSearchParam("k57aaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
    ).toBe("k57aaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
  });

  test("treats a missing, short, or punctuated value as unusable", () => {
    expect(parseAgentDateSearchParam(null)).toBeNull();
    expect(parseAgentDateSearchParam("")).toBeNull();
    expect(parseAgentDateSearchParam("not-a-real-id")).toBeNull();
    expect(parseAgentDateSearchParam("shortid")).toBeNull();
  });
});

describe("mail sign-in destinations", () => {
  test("preserves the private date and exact evidence anchor", () => {
    expect(safeAppDestination("/agent-date/abc?from=letter#turn-12")).toBe("/agent-date/abc?from=letter#turn-12");
    expect(safeAppDestination("/agent-date/abc#activity")).toBe("/agent-date/abc#activity");
  });
  test.each([null, "https://elsewhere.test", "//elsewhere.test", "/\\elsewhere.test", "/\n/elsewhere.test"])("rejects a non-app destination: %s", next => {
    expect(safeAppDestination(next)).toBe("/dashboard");
  });
});
