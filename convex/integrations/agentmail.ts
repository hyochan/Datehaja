/**
 * AgentMail client — Datehaja's own email identity.
 *
 * Datehaja Concierge sends every message from its own inbox, so two people can
 * be introduced, invited, confirmed and reminded without either of them ever
 * seeing the other's email address.
 *
 * Raw REST via fetch so this runs in Convex's V8 action runtime.
 */

const AGENTMAIL_BASE = "https://api.agentmail.to/v0";

export function hasAgentMail(): boolean {
  return Boolean(process.env.AGENTMAIL_API_KEY);
}

export function conciergeInboxId(): string | null {
  return process.env.AGENTMAIL_INBOX_ID?.trim() || null;
}

/** `inbox_id` is an email address and `message_id` carries angle brackets;
 *  both are URL path segments and must be percent-encoded. */
export const pathId = (s: string) => encodeURIComponent(s);

/**
 * AgentMail rejects an `Idempotency-Key` containing anything outside
 * `A-Z a-z 0-9 - . _ ~`. Keys here are built from ids, addresses and
 * timestamps, so an `@` or a `:` slips in easily and the send fails with a
 * 400 that looks nothing like the real cause. Sanitise at the boundary so no
 * call site has to remember.
 */
export function safeIdempotencyKey(raw: string): string {
  const cleaned = raw.replace(/[^A-Za-z0-9\-._~]/g, "-").slice(0, 200);
  return cleaned || "datehaja";
}

export class AgentMailError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(`AgentMail ${status}: ${body.slice(0, 300)}`);
    this.name = "AgentMailError";
    this.status = status;
    this.body = body;
  }
}

async function am<T>(
  path: string,
  init: RequestInit & { idempotencyKey?: string } = {},
): Promise<T> {
  const apiKey = process.env.AGENTMAIL_API_KEY;
  if (!apiKey)
    throw new AgentMailError(0, "AGENTMAIL_API_KEY is not configured.");

  const { idempotencyKey, headers, ...rest } = init;
  const res = await fetch(`${AGENTMAIL_BASE}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      ...(headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) throw new AgentMailError(res.status, await res.text());
  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

/* --------------------------------- inbox --------------------------------- */

export type Inbox = {
  pod_id: string;
  inbox_id: string;
  email: string;
  display_name?: string;
  client_id?: string;
  created_at: string;
  updated_at: string;
};

export async function createInbox(args: {
  username?: string;
  displayName?: string;
  clientId?: string;
}): Promise<Inbox> {
  return am<Inbox>("/inboxes", {
    method: "POST",
    body: JSON.stringify({
      ...(args.username ? { username: args.username } : {}),
      ...(args.displayName ? { display_name: args.displayName } : {}),
      // client_id makes creation idempotent across retries.
      ...(args.clientId ? { client_id: args.clientId } : {}),
    }),
  });
}

export async function listInboxes(): Promise<{
  inboxes: Inbox[];
  count: number;
}> {
  return am<{ inboxes: Inbox[]; count: number }>("/inboxes?limit=20");
}

/* -------------------------------- messages -------------------------------- */

export type SendResult = { message_id: string; thread_id: string };

export async function sendMessage(args: {
  inboxId: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  labels?: string[];
  headers?: Record<string, string>;
  /** Retry-safe: the same key returns the original send instead of a duplicate. */
  idempotencyKey?: string;
}): Promise<SendResult> {
  return am<SendResult>(`/inboxes/${pathId(args.inboxId)}/messages/send`, {
    method: "POST",
    idempotencyKey: args.idempotencyKey
      ? safeIdempotencyKey(args.idempotencyKey)
      : undefined,
    body: JSON.stringify({
      to: [args.to],
      subject: args.subject,
      text: args.text,
      html: args.html,
      ...(args.labels ? { labels: args.labels } : {}),
      ...(args.headers ? { headers: args.headers } : {}),
    }),
  });
}

export async function replyToMessage(args: {
  inboxId: string;
  messageId: string;
  text: string;
  html: string;
  idempotencyKey?: string;
}): Promise<SendResult> {
  return am<SendResult>(
    `/inboxes/${pathId(args.inboxId)}/messages/${pathId(args.messageId)}/reply`,
    {
      method: "POST",
      idempotencyKey: args.idempotencyKey
        ? safeIdempotencyKey(args.idempotencyKey)
        : undefined,
      body: JSON.stringify({
        text: args.text,
        html: args.html,
        reply_all: false,
      }),
    },
  );
}

export type AgentMailMessage = {
  inbox_id: string;
  thread_id: string;
  message_id: string;
  labels: string[];
  timestamp: string;
  from: string;
  to: string[];
  subject?: string;
  preview?: string;
  text?: string;
  extracted_text?: string;
};

export async function getMessage(
  inboxId: string,
  messageId: string,
): Promise<AgentMailMessage> {
  return am<AgentMailMessage>(
    `/inboxes/${pathId(inboxId)}/messages/${pathId(messageId)}`,
  );
}

export async function listMessages(
  inboxId: string,
  limit = 20,
): Promise<{ count: number; messages: AgentMailMessage[] }> {
  return am<{ count: number; messages: AgentMailMessage[] }>(
    `/inboxes/${pathId(inboxId)}/messages?limit=${limit}`,
  );
}

/* -------------------------------- webhooks -------------------------------- */

export type Webhook = {
  webhook_id: string;
  url: string;
  secret: string;
  enabled: boolean;
  event_types?: string[];
};

export async function createWebhook(args: {
  url: string;
  eventTypes: string[];
  inboxIds?: string[];
  clientId?: string;
}): Promise<Webhook> {
  return am<Webhook>("/webhooks", {
    method: "POST",
    body: JSON.stringify({
      url: args.url,
      event_types: args.eventTypes,
      ...(args.inboxIds?.length ? { inbox_ids: args.inboxIds } : {}),
      ...(args.clientId ? { client_id: args.clientId } : {}),
    }),
  });
}

export async function listWebhooks(): Promise<{ webhooks: Webhook[] }> {
  return am<{ webhooks: Webhook[] }>("/webhooks");
}

export async function deleteWebhook(webhookId: string): Promise<void> {
  await am<null>(`/webhooks/${pathId(webhookId)}`, { method: "DELETE" });
}

/* --------------------------- webhook verification -------------------------- */

const b64ToBytes = (b64: string) =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const bytesToB64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));

export type VerifyOutcome = { ok: true } | { ok: false; reason: string };

/**
 * AgentMail signs webhooks with Svix. The `svix` npm package needs Node crypto
 * and cannot run in an httpAction, so the (short) algorithm is implemented here
 * with Web Crypto: HMAC-SHA256 over `${id}.${timestamp}.${rawBody}`, keyed by
 * the base64-decoded secret with its `whsec_` prefix stripped.
 *
 * `rawBody` must be the exact bytes received — re-serialising parsed JSON
 * changes them and the signature will never match.
 */
export async function verifyWebhookSignature(args: {
  secret: string;
  svixId: string | null;
  svixTimestamp: string | null;
  svixSignature: string | null;
  rawBody: string;
  nowMs: number;
  toleranceSeconds?: number;
}): Promise<VerifyOutcome> {
  const { secret, svixId, svixTimestamp, svixSignature, rawBody, nowMs } = args;
  if (!svixId || !svixTimestamp || !svixSignature) {
    return { ok: false, reason: "missing_svix_headers" };
  }

  const ts = Number(svixTimestamp);
  if (!Number.isFinite(ts)) return { ok: false, reason: "bad_timestamp" };
  const tolerance = args.toleranceSeconds ?? 300;
  if (Math.abs(Math.floor(nowMs / 1000) - ts) > tolerance) {
    return { ok: false, reason: "timestamp_outside_tolerance" };
  }

  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey(
      "raw",
      b64ToBytes(secret.replace(/^whsec_/, "")),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
  } catch {
    return { ok: false, reason: "bad_secret" };
  }

  const mac = new Uint8Array(
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`${svixId}.${svixTimestamp}.${rawBody}`),
    ),
  );
  const expected = bytesToB64(mac);

  const matched = svixSignature.split(" ").some((part) => {
    const [version, sig] = part.split(",");
    if (version !== "v1" || !sig || sig.length !== expected.length)
      return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) {
      diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return diff === 0;
  });

  return matched ? { ok: true } : { ok: false, reason: "signature_mismatch" };
}

/** Pull a bare address out of `Jane Doe <jane@example.com>`. */
export function parseAddress(value: string): string {
  const match = value.match(/<([^>]+)>/);
  return (match ? match[1] : value).trim().toLowerCase();
}
