import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { modelCandidates, structured } from "./openai";
import { search, scrape } from "./firecrawl";
import { deleteWebhook, parseAddress, safeIdempotencyKey, sendMessage, prepareInlineMail, type InlineMailImage } from "./agentmail";

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };

function mockFetch(handler: (url: string, init?: RequestInit) => Response) {
  globalThis.fetch = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) =>
      handler(String(input), init),
  ) as unknown as typeof fetch;
}

function json(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

beforeEach(() => {
  process.env.OPENAI_API_KEY = "sk-test";
  delete process.env.OPENAI_MODEL;
  delete process.env.FIRECRAWL_API_KEY;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

/* --------------------------------- OpenAI --------------------------------- */

describe("OpenAI structured output", () => {
  it("walks past reasoning items to find the message content", async () => {
    mockFetch(() =>
      json({
        status: "completed",
        output: [
          { type: "reasoning", content: [] },
          {
            type: "message",
            content: [{ type: "output_text", text: '{"ok":true,"n":3}' }],
          },
        ],
        usage: { input_tokens: 10, output_tokens: 5, total_tokens: 15 },
      }),
    );

    const result = await structured<{ ok: boolean; n: number }>({
      instructions: "x",
      input: "y",
      schemaName: "s",
      schema: {
        type: "object",
        properties: {},
        required: [],
        additionalProperties: false,
      },
    });

    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ ok: true, n: 3 });
    expect(result.totalTokens).toBe(15);
  });

  it("surfaces a refusal instead of trying to parse it", async () => {
    mockFetch(() =>
      json({
        status: "completed",
        output: [
          {
            type: "message",
            content: [{ type: "refusal", refusal: "I can't help." }],
          },
        ],
      }),
    );
    const result = await structured({
      instructions: "x",
      input: "y",
      schemaName: "s",
      schema: {},
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/refusal/i);
  });

  it("does not parse a truncated response", async () => {
    mockFetch(() =>
      json({
        status: "incomplete",
        incomplete_details: { reason: "max_output_tokens" },
        output: [
          {
            type: "message",
            content: [{ type: "output_text", text: '{"a":' }],
          },
        ],
      }),
    );
    const result = await structured({
      instructions: "x",
      input: "y",
      schemaName: "s",
      schema: {},
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/truncated/i);
  });

  it("falls through the model ladder on model_not_found", async () => {
    const seen: string[] = [];
    mockFetch((_url, init) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      seen.push(body.model);
      if (seen.length < 2) {
        return json(
          { error: { code: "model_not_found", message: "nope" } },
          404,
        );
      }
      return json({
        status: "completed",
        output: [
          { type: "message", content: [{ type: "output_text", text: "{}" }] },
        ],
      });
    });

    const result = await structured({
      instructions: "x",
      input: "y",
      schemaName: "s",
      schema: {},
    });
    expect(result.ok).toBe(true);
    expect(seen.length).toBeGreaterThanOrEqual(2);
    expect(seen[0]).not.toBe(seen[1]);
  });

  it("drops to the next model when the payload exceeds this model's TPM limit", async () => {
    const seen: string[] = [];
    mockFetch((_url, init) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      seen.push(body.model);
      if (seen.length === 1) {
        // No retry-after: the request will never fit this model on this account.
        return json(
          {
            error: {
              code: "rate_limit_exceeded",
              message: "Request too large for gpt-5.6-luna on tokens per min",
            },
          },
          429,
        );
      }
      return json({
        status: "completed",
        output: [
          { type: "message", content: [{ type: "output_text", text: "{}" }] },
        ],
      });
    });

    const result = await structured({
      instructions: "x",
      input: "y",
      schemaName: "s",
      schema: {},
    });
    expect(result.ok).toBe(true);
    expect(seen.length).toBe(2);
    expect(seen[1]).not.toBe(seen[0]);
  });

  it("stops immediately on a billing failure rather than burning the ladder", async () => {
    let calls = 0;
    mockFetch(() => {
      calls += 1;
      return json(
        { error: { code: "credit_balance_exhausted", message: "no credit" } },
        429,
      );
    });
    const result = await structured({
      instructions: "x",
      input: "y",
      schemaName: "s",
      schema: {},
    });
    expect(result.ok).toBe(false);
    expect(calls).toBe(1);
  });

  it("reports missing configuration without calling out", async () => {
    delete process.env.OPENAI_API_KEY;
    const calls = vi.fn();
    globalThis.fetch = calls as unknown as typeof fetch;
    const result = await structured({
      instructions: "x",
      input: "y",
      schemaName: "s",
      schema: {},
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/OPENAI_API_KEY/);
    expect(calls).not.toHaveBeenCalled();
  });

  it("puts the configured model at the head of the ladder", () => {
    process.env.OPENAI_MODEL = "gpt-custom";
    const ladder = modelCandidates();
    expect(ladder[0]).toBe("gpt-custom");
    expect(new Set(ladder).size).toBe(ladder.length);
  });

  it("lets cost-sensitive Agent work prefer nano ahead of the global model", () => {
    process.env.OPENAI_MODEL = "gpt-5.6-luna";
    const ladder = modelCandidates(["gpt-5-nano", "gpt-5.6-luna"]);
    expect(ladder[0]).toBe("gpt-5-nano");
    expect(ladder[1]).toBe("gpt-5.6-luna");
    expect(new Set(ladder).size).toBe(ladder.length);
  });

  it("sends the strict json_schema in the Responses shape", async () => {
    let sent: Record<string, unknown> = {};
    mockFetch((_url, init) => {
      sent = JSON.parse(String(init?.body));
      return json({
        status: "completed",
        output: [
          { type: "message", content: [{ type: "output_text", text: "{}" }] },
        ],
      });
    });
    await structured({
      instructions: "x",
      input: "y",
      schemaName: "my_schema",
      schema: { type: "object" },
    });
    const text = sent.text as { format: Record<string, unknown> };
    expect(text.format.type).toBe("json_schema");
    expect(text.format.name).toBe("my_schema");
    expect(text.format.strict).toBe(true);
  });
});

describe("non-reasoning model fallback", () => {
  it("omits unsupported GPT-5 controls when a truncated response falls back to GPT-4.1", async () => {
    const bodies: Record<string, any>[] = [];
    mockFetch((_url, init) => {
      const body = JSON.parse(String(init?.body));
      bodies.push(body);
      return body.model === "gpt-4.1-mini"
        ? json({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: '{"ok":true}' }] }] })
        : json({ status: "incomplete", incomplete_details: { reason: "max_output_tokens" } });
    });
    const result = await structured({ instructions: "x", input: "y", schemaName: "s", schema: {}, preferredModels: ["gpt-5.6-luna", "gpt-4.1-mini"] });
    expect(result.ok).toBe(true);
    expect(bodies[0].reasoning).toBeDefined();
    expect(bodies[1].reasoning).toBeUndefined();
    expect(bodies[1].text.verbosity).toBeUndefined();
    expect(bodies[1].text.format.strict).toBe(true);
  });
});

/* -------------------------------- Firecrawl -------------------------------- */

describe("Firecrawl normalisation", () => {
  it("reads results out of the grouped data.web shape", async () => {
    mockFetch(() =>
      json({
        success: true,
        data: {
          web: [
            {
              url: "https://a.test",
              title: "A",
              description: "d",
              position: 1,
            },
            { url: "https://b.test", title: "B", position: 2, markdown: "# B" },
          ],
        },
        creditsUsed: 2,
      }),
    );

    const { hits, log } = await search("q");
    expect(hits).toHaveLength(2);
    expect(hits[1].markdown).toBe("# B");
    expect(log.httpStatus).toBe(200);
    expect(log.resultCount).toBe(2);
  });

  it("never throws on an HTTP error — it reports it", async () => {
    mockFetch(() => new Response("rate limited", { status: 429 }));
    const { hits, log } = await search("q");
    expect(hits).toEqual([]);
    expect(log.httpStatus).toBe(429);
    expect(log.error).toContain("rate limited");
  });

  it("never throws on a network failure", async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error("ECONNRESET");
    }) as unknown as typeof fetch;
    const { hits, log } = await search("q");
    expect(hits).toEqual([]);
    expect(log.httpStatus).toBe(0);
    expect(log.error).toContain("ECONNRESET");
  });

  it("omits the Authorization header entirely when running keyless", async () => {
    let headers: Record<string, string> = {};
    mockFetch((_url, init) => {
      headers = (init?.headers ?? {}) as Record<string, string>;
      return json({ success: true, data: { web: [] } });
    });
    await search("q");
    expect(headers.Authorization).toBeUndefined();

    process.env.FIRECRAWL_API_KEY = "fc-test";
    await search("q");
    expect(headers.Authorization).toBe("Bearer fc-test");
  });

  it("tolerates a result row with no url", async () => {
    mockFetch(() =>
      json({
        success: true,
        data: { web: [{ title: "no url" }, { url: "https://ok.test" }] },
      }),
    );
    const { hits } = await search("q");
    expect(hits).toHaveLength(1);
    expect(hits[0].url).toBe("https://ok.test");
  });

  it("extracts markdown and json from a scrape", async () => {
    mockFetch(() =>
      json({
        success: true,
        data: {
          markdown: "# Example",
          json: { title: "Example" },
          metadata: { title: "Example Domain", statusCode: 200 },
        },
      }),
    );
    const result = await scrape("https://example.com");
    expect(result.markdown).toBe("# Example");
    expect(result.title).toBe("Example Domain");
    expect(result.json).toEqual({ title: "Example" });
  });
});

/* ------------------------------- AgentMail --------------------------------- */

describe("AgentMail helpers", () => {
  it("sends inline images to exactly the requested recipient with a retry-safe key", async () => {
    process.env.AGENTMAIL_API_KEY = "am-test";
    mockFetch((url, init) => {
      expect(url).toContain("/inboxes/preview%40agentmail.to/messages/send");
      expect(new Headers(init?.headers).get("Idempotency-Key")).toBe("preview-hyo-hyo.dev");
      const body = JSON.parse(String(init?.body));
      expect(body.to).toEqual(["hyo@hyo.dev"]);
      expect(body.attachments).toEqual([{ filename: "scene.png", content_type: "image/png", content_disposition: "inline", content_id: expect.stringMatching(/^[a-f0-9]{64}@images\.datehaja\.com$/), content: "aW1hZ2U=" }]);
      expect(body.html).toBe(`<img src="cid:${body.attachments[0].content_id}">`);
      return new Response(JSON.stringify({ message_id: "message-1", thread_id: "thread-1" }));
    });
    await expect(sendMessage({ inboxId: "preview@agentmail.to", to: "hyo@hyo.dev", subject: "Preview", text: "Preview", html: '<img src="cid:scene">', idempotencyKey: "preview-hyo@hyo.dev", attachments: [{ filename: "scene.png", content_type: "image/png", content_disposition: "inline", content_id: "scene", content: "aW1hZ2U=" }] })).resolves.toEqual({ message_id: "message-1", thread_id: "thread-1" });
  });

  const inlineImage: InlineMailImage = { filename: "scene.png", content_type: "image/png", content_disposition: "inline", content_id: "scene", content: "aW1hZ2U=" };

  it("keeps repeated image references and prefix-like IDs distinct across stable retries", async () => {
    const attachments = [inlineImage, { ...inlineImage, content_id: "scene-small", content: "c21hbGw=" }];
    const html = '<img src="cid:scene"><img src="cid:scene-small"><img src="cid:scene">';
    const result = await prepareInlineMail(html, attachments);
    const ids = result.attachments.map(a => a.content_id);
    expect(ids[0]).not.toBe(ids[1]);
    expect(result.html).toBe(`<img src="cid:${ids[0]}"><img src="cid:${ids[1]}"><img src="cid:${ids[0]}">`);
    expect(await prepareInlineMail(html, attachments)).toEqual(result);
    expect(await prepareInlineMail(result.html, result.attachments)).toEqual(result);
  });

  it("accepts bracketed MIME IDs and percent-encoded CID URLs without double wrapping", async () => {
    const result = await prepareInlineMail('<img src="cid:scene%40datehaja.com">', [{ ...inlineImage, content_id: "<scene@datehaja.com>" }]);
    expect(result.html).toBe('<img src="cid:scene@datehaja.com">');
    expect(result.attachments[0].content_id).toBe("scene@datehaja.com");
  });

  it("blocks a dangling or ambiguous CID before contacting the mail provider", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await expect(sendMessage({ inboxId: "test@agentmail.to", to: "hyo@hyo.dev", subject: "Test", text: "Test", html: '<img src="cid:missing">' })).rejects.toThrow("no matching attachment");
    await expect(prepareInlineMail('<img src="cid:scene">', [inlineImage, inlineImage])).rejects.toThrow("unique");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("pulls a bare address out of a display-name header", () => {
    expect(parseAddress("Jane Doe <jane@example.com>")).toBe(
      "jane@example.com",
    );
    expect(parseAddress("  JANE@example.com ")).toBe("jane@example.com");
  });

  describe("idempotency keys", () => {
    // AgentMail 400s on anything outside A-Z a-z 0-9 - . _ ~ , and the error
    // names the header rather than the offending character.
    const ALLOWED = /^[A-Za-z0-9\-._~]+$/;

    it("strips an email address's @", () => {
      const key = safeIdempotencyKey("verify-hyo@hyo.dev-2026-08-27T21");
      expect(key).toMatch(ALLOWED);
      expect(key).not.toContain("@");
    });

    it("strips colons from an ISO timestamp", () => {
      expect(safeIdempotencyKey("run-2026-08-27T21:15:00Z")).toMatch(ALLOWED);
    });

    it("leaves an already-safe key untouched", () => {
      const safe = "invite-ks78m3xeetdz-n976kt8n8evq";
      expect(safeIdempotencyKey(safe)).toBe(safe);
    });

    it("never returns an empty key", () => {
      expect(safeIdempotencyKey("@@@")).not.toBe("");
      expect(safeIdempotencyKey("")).toBe("datehaja");
    });

    it("caps the length", () => {
      expect(safeIdempotencyKey("a".repeat(500)).length).toBeLessThanOrEqual(
        200,
      );
    });
  });

  it("deletes a duplicate webhook through the encoded REST path", async () => {
    process.env.AGENTMAIL_API_KEY = "am-test";
    mockFetch((url, init) => {
      expect(url).toBe("https://api.agentmail.to/v0/webhooks/hook%2Flegacy");
      expect(init?.method).toBe("DELETE");
      expect(new Headers(init?.headers).get("Authorization")).toBe(
        "Bearer am-test",
      );
      return new Response(null, { status: 204 });
    });

    await expect(deleteWebhook("hook/legacy")).resolves.toBeUndefined();
  });
});
