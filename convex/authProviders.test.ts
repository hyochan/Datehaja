/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, expect, test, vi } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
const modules = import.meta.glob("./**/*.ts");
afterEach(() => vi.unstubAllEnvs());

test("local development OTP can be reached without an email provider", async () => {
  vi.stubEnv("ENVIRONMENT", "development");
  vi.stubEnv("AGENTMAIL_API_KEY", "");
  vi.stubEnv("AGENTMAIL_INBOX_ID", "");
  expect((await convexTest(schema, modules).query(api.authProviders.available, {})).email).toBe(true);
});

test("a production deployment still needs configured email delivery", async () => {
  vi.stubEnv("ENVIRONMENT", "production");
  vi.stubEnv("AGENTMAIL_API_KEY", "");
  vi.stubEnv("AGENTMAIL_INBOX_ID", "");
  expect((await convexTest(schema, modules).query(api.authProviders.available, {})).email).toBe(false);
});
