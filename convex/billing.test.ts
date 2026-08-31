import { afterEach, describe, expect, it } from "vitest";
import type { ActionCtx } from "./_generated/server";
import { getScoutAccess } from "./billing";

const originalDemoBilling = process.env.DATEHAJA_DEMO_BILLING;

afterEach(() => {
  if (originalDemoBilling === undefined) {
    delete process.env.DATEHAJA_DEMO_BILLING;
  } else {
    process.env.DATEHAJA_DEMO_BILLING = originalDemoBilling;
  }
});

describe("Scout Pass access", () => {
  it("keeps live billing locked while merchant review is pending", async () => {
    delete process.env.DATEHAJA_DEMO_BILLING;

    await expect(
      getScoutAccess({} as ActionCtx, "test-subject"),
    ).resolves.toEqual({
      allowed: false,
      mode: "locked",
      configured: false,
    });
  });

  it("grants only labelled, non-paying development demo access", async () => {
    process.env.DATEHAJA_DEMO_BILLING = "1";

    await expect(
      getScoutAccess({} as ActionCtx, "test-subject"),
    ).resolves.toEqual({
      allowed: true,
      mode: "demo",
      configured: false,
    });
  });
});
