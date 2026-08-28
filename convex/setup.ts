import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  createInbox,
  createWebhook,
  hasAgentMail,
  listInboxes,
  listWebhooks,
  sendMessage,
} from "./integrations/agentmail";
import { hasFirecrawlKey, search } from "./integrations/firecrawl";
import { hasOpenAI, obj, structured } from "./integrations/openai";

/**
 * Operational actions used to provision and verify the third-party
 * integrations. These are internal-only — they are run from the CLI during
 * setup and by `scripts/verify-integrations.ts`, never from the browser.
 */

/** Create (or find) the DateHaja Concierge inbox and its webhook. */
export const provisionAgentMail = internalAction({
  args: {
    username: v.optional(v.string()),
    webhookUrl: v.string(),
  },
  returns: v.any(),
  handler: async (_ctx, args) => {
    if (!hasAgentMail()) {
      return { ok: false, error: "AGENTMAIL_API_KEY is not set on this deployment." };
    }

    const username = args.username ?? "datehaja-concierge";
    let inboxId: string;
    let inboxEmail: string;

    try {
      const inbox = await createInbox({
        username,
        displayName: "DateHaja Concierge",
        clientId: "datehaja-concierge-v1",
      });
      inboxId = inbox.inbox_id;
      inboxEmail = inbox.email ?? inbox.inbox_id;
    } catch (e) {
      // The username may already be taken by a previous run — fall back to lookup.
      const existing = await listInboxes().catch(() => null);
      const match = existing?.inboxes?.find((i) => i.inbox_id.startsWith(username));
      if (!match) {
        return { ok: false, error: `Could not create or find inbox: ${String(e)}` };
      }
      inboxId = match.inbox_id;
      inboxEmail = match.email ?? match.inbox_id;
    }

    let webhookId: string | null = null;
    let webhookSecret: string | null = null;
    let webhookError: string | null = null;

    try {
      const hook = await createWebhook({
        url: args.webhookUrl,
        eventTypes: [
          "message.received",
          "message.sent",
          "message.delivered",
          "message.bounced",
        ],
        clientId: "datehaja-webhook-v1",
      });
      webhookId = hook.webhook_id;
      webhookSecret = hook.secret;
    } catch (e) {
      webhookError = String(e);
      const existing = await listWebhooks().catch(() => null);
      const match = existing?.webhooks?.find((w) => w.url === args.webhookUrl);
      if (match) {
        webhookId = match.webhook_id;
        webhookSecret = match.secret ?? null;
        webhookError = null;
      }
    }

    return {
      ok: true,
      inboxId,
      inboxEmail,
      webhookId,
      webhookSecret,
      webhookUrl: args.webhookUrl,
      webhookError,
      next: [
        `npx convex env set AGENTMAIL_INBOX_ID "${inboxId}"`,
        webhookSecret
          ? "npx convex env set AGENTMAIL_WEBHOOK_SECRET \"<secret from this output>\""
          : "Create the webhook manually in the AgentMail console, then set AGENTMAIL_WEBHOOK_SECRET.",
      ],
    };
  },
});

/**
 * End-to-end integration check. Makes one REAL call to each provider and
 * reports exactly what happened — no mocks, no assumptions.
 */
export const verifyIntegrations = internalAction({
  args: { sendTestEmailTo: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, args) => {
    const report: Record<string, unknown> = {};

    /* ---------------------------- Firecrawl ---------------------------- */
    const fcStarted = Date.now();
    const fc = await search("quiet dessert cafe Seongsu Seoul opening hours", {
      limit: 3,
      country: "KR",
    });
    report.firecrawl = {
      configured: hasFirecrawlKey() ? "api_key" : "keyless",
      httpStatus: fc.log.httpStatus,
      ms: Date.now() - fcStarted,
      resultCount: fc.hits.length,
      sampleUrls: fc.hits.slice(0, 3).map((h) => h.url),
      error: fc.log.error ?? null,
      ok: fc.log.httpStatus === 200 && fc.hits.length > 0,
    };

    /* ------------------------------ OpenAI ----------------------------- */
    if (hasOpenAI()) {
      const result = await structured<{ ok: boolean; city: string }>({
        instructions:
          "You are verifying an API connection. Answer with the requested structure only.",
        input: 'Set ok to true and city to "Seoul".',
        schemaName: "connection_check",
        schema: obj({ ok: { type: "boolean" }, city: { type: "string" } }),
        maxOutputTokens: 300,
        reasoningEffort: "none",
      });
      report.openai = {
        configured: true,
        ok: result.ok,
        model: result.model,
        latencyMs: result.latencyMs,
        totalTokens: result.totalTokens ?? null,
        data: result.data,
        error: result.error ?? null,
        requestId: result.requestId ?? null,
      };
      await ctx.runMutation(internal.ai.recordRun, {
        purpose: "moderation",
        model: result.model,
        endpoint: result.endpoint,
        inputSummary: "Integration verification ping",
        outputPreview: result.outputPreview,
        latencyMs: result.latencyMs,
        totalTokens: result.totalTokens,
        status: result.ok ? "succeeded" : "failed",
        error: result.error,
      });
    } else {
      report.openai = {
        configured: false,
        ok: false,
        error: "OPENAI_API_KEY is not set on this deployment.",
      };
    }

    /* ----------------------------- AgentMail --------------------------- */
    if (hasAgentMail()) {
      const inboxId = process.env.AGENTMAIL_INBOX_ID;
      const agentmail: Record<string, unknown> = {
        configured: true,
        inboxId: inboxId ?? null,
        webhookSecretSet: Boolean(process.env.AGENTMAIL_WEBHOOK_SECRET),
      };
      try {
        const inboxes = await listInboxes();
        agentmail.inboxCount = inboxes.count ?? inboxes.inboxes?.length ?? 0;
        agentmail.inboxes = (inboxes.inboxes ?? []).map((i) => i.inbox_id);
      } catch (e) {
        agentmail.listError = String(e);
      }
      try {
        const hooks = await listWebhooks();
        agentmail.webhooks = (hooks.webhooks ?? []).map((w) => ({
          url: w.url,
          enabled: w.enabled,
          eventTypes: w.event_types ?? [],
        }));
      } catch (e) {
        agentmail.webhookListError = String(e);
      }

      if (args.sendTestEmailTo && inboxId) {
        try {
          const sent = await sendMessage({
            inboxId,
            to: args.sendTestEmailTo,
            subject: "DateHaja Concierge — integration check",
            text: "This is a live delivery test from the DateHaja Concierge inbox. Reply to this message to exercise the inbound webhook.",
            html: "<p>This is a live delivery test from the <strong>DateHaja Concierge</strong> inbox.</p><p>Reply to this message to exercise the inbound webhook.</p>",
            labels: ["integration_check"],
            idempotencyKey: `verify-${args.sendTestEmailTo}-${new Date().toISOString().slice(0, 13)}`,
          });
          agentmail.testSend = { ok: true, ...sent };
        } catch (e) {
          agentmail.testSend = { ok: false, error: String(e) };
        }
      }

      agentmail.ok = Boolean(inboxId) && !agentmail.listError;
      report.agentmail = agentmail;
    } else {
      report.agentmail = {
        configured: false,
        ok: false,
        error: "AGENTMAIL_API_KEY is not set on this deployment.",
      };
    }

    report.siteUrl = process.env.SITE_URL ?? null;
    report.convexSiteUrl = process.env.CONVEX_SITE_URL ?? null;
    report.checkedAt = new Date().toISOString();
    return report;
  },
});

/** Live end-to-end research probe: Firecrawl → OpenAI → Convex venues. */
export const probeResearch = internalAction({
  args: {
    city: v.optional(v.string()),
    area: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const { researchDateOptions } = await import("./research");
    const start = Date.now();
    const outcome = await researchDateOptions(ctx, {
      countryCode: "KR",
      query: {
        city: args.city ?? "Seoul",
        area: args.area ?? "Seongsu",
        whenIso: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        timezone: "Asia/Seoul",
        budgetMin: 25000,
        budgetMax: 70000,
        currency: "KRW",
        interests: ["Films", "Coffee"],
        dateTypes: ["dinner", "dessert"],
        vibe: "quiet",
        dietary: [],
        accessibility: [],
        indoorOutdoor: "indoor",
        desiredDurationMin: 150,
      },
    });
    return { ...outcome, elapsedMs: Date.now() - start };
  },
});
