import { afterEach, describe, expect, it } from "vitest";
import type { ActionCtx } from "./_generated/server";
import { getScoutAccess } from "./billing";

const GATES = ["DATEHAJA_OPEN_TRIAL", "DATEHAJA_DEMO_BILLING"] as const;
const original = new Map(GATES.map((name) => [name, process.env[name]]));

afterEach(() => {
  for (const name of GATES) {
    const value = original.get(name);
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

function clearGates() {
  for (const name of GATES) delete process.env[name];
}

describe("Scout Pass access", () => {
  it("keeps live billing locked while merchant review is pending", async () => {
    clearGates();

    await expect(
      getScoutAccess({} as ActionCtx, "test-subject"),
    ).resolves.toEqual({
      allowed: false,
      mode: "locked",
      configured: false,
    });
  });

  // The submitted deployment carries this one. A judge who finishes the brief
  // and then finds the scouting button dead is the failure it exists to stop,
  // so the public deployment is expected to open the trial, not forbidden to.
  it("grants labelled, non-paying trial access on any deployment", async () => {
    clearGates();
    process.env.DATEHAJA_OPEN_TRIAL = "1";

    await expect(
      getScoutAccess({} as ActionCtx, "test-subject"),
    ).resolves.toEqual({
      allowed: true,
      mode: "demo",
      configured: false,
    });
  });

  it("still honours the development deployment's older gate name", async () => {
    clearGates();
    process.env.DATEHAJA_DEMO_BILLING = "1";

    await expect(
      getScoutAccess({} as ActionCtx, "test-subject"),
    ).resolves.toEqual({
      allowed: true,
      mode: "demo",
      configured: false,
    });
  });

  it("treats any value other than 1 as locked", async () => {
    clearGates();
    process.env.DATEHAJA_OPEN_TRIAL = "true";

    await expect(
      getScoutAccess({} as ActionCtx, "test-subject"),
    ).resolves.toMatchObject({ allowed: false, mode: "locked" });
  });
});
