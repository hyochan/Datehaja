#!/usr/bin/env node
/**
 * Push the secrets in .env to a Convex deployment.
 *
 * Convex actions read `process.env` from the DEPLOYMENT, not from a local file,
 * so a .env alone does nothing for the running app. This hands the file to
 * `convex env set --from-file`, minus the variables that must never be pushed.
 *
 *   node scripts/push-env.mjs           -> dev
 *   node scripts/push-env.mjs --prod    -> production
 */

import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const prod = process.argv.includes("--prod");
const target = prod ? "production (merry-bass-190)" : "dev";

/**
 * Secrets can live in either file. `.env.local` is where `convex dev` writes
 * CONVEX_DEPLOYMENT and VITE_CONVEX_URL, and keeping secrets alongside them is
 * fine — Vite only exposes VITE_*-prefixed variables to the browser, and the
 * NEVER_PUSH list below stops the deployment-specific ones being sent anywhere.
 */
const explicit = process.argv.find((a) => a.startsWith("--file="))?.slice(7);
const CANDIDATES = explicit ? [explicit] : [".env", ".env.local"];

/**
 * Refused outright. These are either deployment-specific (pushing one value to
 * both deployments breaks auth and email links), generated rather than typed,
 * or platform-provided and not settable at all.
 */
const NEVER_PUSH = new Set([
  "CONVEX_DEPLOYMENT",
  "CONVEX_SITE_URL",
  "CONVEX_CLOUD_URL",
  "CONVEX_DEPLOY_KEY",
  "VITE_CONVEX_URL",
  "VITE_CONVEX_SITE_URL",
  "JWT_PRIVATE_KEY",
  "JWKS",
  "SITE_URL",
]);

/** Everything DateHaja's own code actually reads. */
const KNOWN = new Set([
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "FIRECRAWL_API_KEY",
  "AGENTMAIL_API_KEY",
  "AGENTMAIL_INBOX_ID",
  "AGENTMAIL_WEBHOOK_SECRET",
]);

const PLACEHOLDER = /^(sk|am|fc|whsec)-?\.\.\.$|^$|\.\.\.$/;

const sourceFile = CANDIDATES.find((f) => existsSync(f));
if (!sourceFile) {
  console.error(
    `No ${CANDIDATES.join(" or ")} found.\n\n  cp .env.example .env\n`,
  );
  process.exit(1);
}

const lines = readFileSync(sourceFile, "utf8").split("\n");
const push = [];
const skipped = [];
const placeholders = [];
const unknown = [];

for (const raw of lines) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  const eq = line.indexOf("=");
  if (eq < 1) continue;

  const name = line.slice(0, eq).trim();
  // Strip matching surrounding quotes, and anything after an unquoted #.
  let value = line.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  if (NEVER_PUSH.has(name)) {
    skipped.push(name);
    continue;
  }
  if (PLACEHOLDER.test(value)) {
    placeholders.push(name);
    continue;
  }
  if (!KNOWN.has(name)) unknown.push(name);
  push.push([name, value]);
}

if (push.length === 0) {
  console.error(
    `Nothing to push — every secret in ${sourceFile} is still a placeholder.\n` +
      `Fill in at least OPENAI_API_KEY or AGENTMAIL_API_KEY.\n`,
  );
  process.exit(1);
}

console.log(`\nPushing ${push.length} variable(s) from ${sourceFile} to ${target}:\n`);
for (const [name, value] of push) {
  const shown = value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : "••••";
  console.log(`  ${name.padEnd(26)} ${shown}`);
}
if (unknown.length) {
  console.log(`\n  note: not read by DateHaja — ${unknown.join(", ")}`);
}
if (skipped.length) {
  console.log(`  skipped (deployment-specific or generated): ${skipped.join(", ")}`);
}
if (placeholders.length) {
  console.log(`  still placeholders: ${placeholders.join(", ")}`);
}

const tmp = join(tmpdir(), `datehaja-env-${process.pid}`);
try {
  writeFileSync(tmp, push.map(([n, v]) => `${n}=${v}`).join("\n") + "\n", {
    mode: 0o600,
  });

  const args = ["convex", "env", "set", "--from-file", tmp, "--force"];
  if (prod) args.push("--prod");

  const result = spawnSync("npx", args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
} finally {
  try {
    unlinkSync(tmp);
  } catch {
    /* already gone */
  }
}

console.log(
  `\nDone. Prove each one with a real call:\n` +
    `  bun run ${prod ? "verify:prod" : "verify"}\n`,
);
