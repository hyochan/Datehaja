import { httpRouter } from "convex/server";
import { registerStaticRoutes } from "@convex-dev/static-hosting";
import { httpAction } from "./_generated/server";
import { components, internal } from "./_generated/api";
import { auth } from "./auth";
import { parseAddress, verifyWebhookSignature } from "./integrations/agentmail";

const http = httpRouter();

/*
 * Route order matters. Convex Auth owns root-level paths
 * (`/.well-known/openid-configuration`, `/.well-known/jwks.json`, `/api/auth/*`),
 * so those are registered first and the static-site catch-all goes last.
 */
auth.addHttpRoutes(http);

/* ------------------------------ health check ------------------------------- */

http.route({
  path: "/healthz",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({
        ok: true,
        service: "datehaja",
        integrations: {
          openai: Boolean(process.env.OPENAI_API_KEY),
          firecrawl: Boolean(process.env.FIRECRAWL_API_KEY) || "keyless",
          agentmail: Boolean(process.env.AGENTMAIL_API_KEY),
          agentmailInbox: Boolean(process.env.AGENTMAIL_INBOX_ID),
          agentmailWebhook: Boolean(process.env.AGENTMAIL_WEBHOOK_SECRET),
          billing: "merchant_review",
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }),
});

/* --------------------------- AgentMail webhook ----------------------------- */

type AgentMailEvent = {
  type?: string;
  event_type?: string;
  event_id?: string;
  message?: {
    inbox_id?: string;
    thread_id?: string;
    message_id?: string;
    from?: string;
    to?: string[];
    subject?: string;
    preview?: string;
    text?: string;
    extracted_text?: string;
  };
};

/**
 * Inbound mail from AgentMail.
 *
 * Signature is verified against the Svix scheme over the RAW body before the
 * payload is parsed. Processing is idempotent on `event_id`, so a retried
 * delivery is acknowledged and dropped rather than handled twice.
 */
http.route({
  path: "/webhooks/agentmail",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const rawBody = await request.text();
    const secret = process.env.AGENTMAIL_WEBHOOK_SECRET;

    if (!secret) {
      console.error(
        "[agentmail] webhook received but AGENTMAIL_WEBHOOK_SECRET is unset",
      );
      return new Response("Webhook not configured", { status: 503 });
    }

    const verification = await verifyWebhookSignature({
      secret,
      svixId: request.headers.get("svix-id"),
      svixTimestamp: request.headers.get("svix-timestamp"),
      svixSignature: request.headers.get("svix-signature"),
      rawBody,
      nowMs: Date.now(),
    });

    if (!verification.ok) {
      console.warn(`[agentmail] rejected webhook: ${verification.reason}`);
      return new Response("Invalid signature", { status: 400 });
    }

    let event: AgentMailEvent;
    try {
      event = JSON.parse(rawBody) as AgentMailEvent;
    } catch {
      return new Response("Malformed body", { status: 400 });
    }

    const eventType =
      typeof event.event_type === "string" ? event.event_type : "unknown";
    const eventId =
      typeof event.event_id === "string" && event.event_id.length > 0
        ? event.event_id
        : `${eventType}:${event.message?.message_id ?? rawBody.length}`;

    const message = event.message ?? {};
    const { duplicate, eventDocId } = await ctx.runMutation(
      internal.mail.recordEvent,
      {
        eventId,
        eventType,
        inboxId:
          typeof message.inbox_id === "string" ? message.inbox_id : undefined,
        threadId:
          typeof message.thread_id === "string" ? message.thread_id : undefined,
        messageId:
          typeof message.message_id === "string"
            ? message.message_id
            : undefined,
        fromAddress:
          typeof message.from === "string"
            ? parseAddress(message.from)
            : undefined,
        toAddress: Array.isArray(message.to)
          ? String(message.to[0] ?? "")
          : undefined,
        subject:
          typeof message.subject === "string" ? message.subject : undefined,
        preview:
          typeof message.preview === "string"
            ? message.preview
            : typeof message.extracted_text === "string"
              ? message.extracted_text.slice(0, 300)
              : undefined,
        signatureVerified: true,
        rawPreview: rawBody.slice(0, 1500),
      },
    );

    if (duplicate || !eventDocId) {
      return new Response(null, { status: 204 });
    }

    if (eventType.startsWith("message.received")) {
      await ctx.scheduler.runAfter(0, internal.mail.handleInbound, {
        eventDocId,
      });
    } else {
      await ctx.runMutation(internal.mail.markEventProcessed, { eventDocId });
    }

    return new Response(null, { status: 204 });
  }),
});

/* ------------------------- static site (must be last) ---------------------- */

// The installed static-hosting uploader labels .mp4 as application/octet-stream.
// Serve this public demo with the media type browsers need for inline playback.
for (const [path, contentType] of [
  ["/demo/learning-proof.mp4", "video/mp4"],
  ["/demo/Datehaja-demo.mp4", "video/mp4"],
  ["/demo/Datehaja-demo.vtt", "text/vtt; charset=utf-8"],
] as const) http.route({
  path,
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const asset = await ctx.runQuery(components.staticHosting.lib.resolveAssetForHttp, {
      path, spaFallback: false,
    });
    if (!asset?.storageUrl) return new Response("Video not available", { status: 404 });
    const range = request.headers.get("range");
    const stored = await fetch(asset.storageUrl, { headers: range ? { Range: range } : {} });
    if (!stored.ok || !stored.body) return new Response("Video not available", { status: 503 });
    const headers = new Headers({
      "Content-Type": contentType, "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    });
    for (const name of ["content-length", "content-range", "accept-ranges", "etag"]) {
      const value = stored.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(stored.body, { status: stored.status, headers });
  }),
});

registerStaticRoutes(http, components.staticHosting);

export default http;
