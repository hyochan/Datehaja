/**
 * OpenAI client — plain `fetch` against /v1/responses.
 *
 * Runs only inside Convex actions, so the API key never leaves the server.
 * Every call is structured: a strict JSON Schema goes out, a validated object
 * comes back. Free-text answers are never parsed by hand.
 */

const OPENAI_BASE = "https://api.openai.com/v1";

/**
 * Model ladder. `OPENAI_MODEL` overrides the head of the list; if a model is
 * not available to the account we fall through rather than failing the drop.
 */
const MODEL_LADDER = [
  "gpt-5.6-terra",
  "gpt-5.6",
  "gpt-5.4-mini",
  "gpt-5-mini",
  "gpt-4.1-mini",
];

export function modelCandidates(): string[] {
  const configured = process.env.OPENAI_MODEL?.trim();
  if (!configured) return MODEL_LADDER;
  return [configured, ...MODEL_LADDER.filter((m) => m !== configured)];
}

export function hasOpenAI(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export type StructuredResult<T> = {
  ok: boolean;
  data: T | null;
  model: string;
  endpoint: string;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  error?: string;
  requestId?: string;
  outputPreview: string;
};

export type StructuredRequest = {
  /** Terse system framing. */
  instructions: string;
  input: string;
  schemaName: string;
  /** Must satisfy OpenAI strict mode: object root, additionalProperties:false,
   *  every property in `required`. */
  schema: Record<string, unknown>;
  maxOutputTokens?: number;
  reasoningEffort?: "none" | "low" | "medium" | "high";
  verbosity?: "low" | "medium" | "high";
};

const HARD_STOP_CODES = new Set([
  "credit_balance_exhausted",
  "organization_spend_limit_exceeded",
  "project_spend_limit_exceeded",
  "organization_usage_limit_exceeded",
  "invalid_api_key",
  "insufficient_quota",
]);

/**
 * One structured call. Walks the model ladder on `model_not_found`, retries
 * once on a retryable 429/5xx, and gives up cleanly otherwise — a failed model
 * call must degrade the DateDrop, never corrupt it.
 */
export async function structured<T>(
  req: StructuredRequest,
): Promise<StructuredResult<T>> {
  const started = Date.now();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      data: null,
      model: "none",
      endpoint: "/v1/responses",
      latencyMs: 0,
      error: "OPENAI_API_KEY is not configured on this deployment.",
      outputPreview: "",
    };
  }

  let lastError = "Unknown error";
  let requestId: string | undefined;

  for (const model of modelCandidates()) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const body = {
        model,
        instructions: req.instructions,
        input: req.input,
        max_output_tokens: req.maxOutputTokens ?? 2000,
        reasoning: { effort: req.reasoningEffort ?? "low" },
        text: {
          verbosity: req.verbosity ?? "low",
          format: {
            type: "json_schema",
            name: req.schemaName,
            strict: true,
            schema: req.schema,
          },
        },
      };

      let res: Response;
      try {
        res = await fetch(`${OPENAI_BASE}/responses`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
      } catch (e) {
        lastError = `Network error: ${String(e)}`;
        continue;
      }

      requestId = res.headers.get("x-request-id") ?? undefined;

      if (!res.ok) {
        const errText = await res.text();
        let code: string | undefined;
        let message = errText.slice(0, 400);
        try {
          const parsed = JSON.parse(errText) as {
            error?: { code?: string; message?: string };
          };
          code = parsed.error?.code ?? undefined;
          message = parsed.error?.message ?? message;
        } catch {
          /* keep the raw text */
        }
        lastError = `${res.status} ${code ?? ""} ${message}`.trim();

        if (res.status === 404 || code === "model_not_found") break; // next model
        if (code && HARD_STOP_CODES.has(code)) {
          return fail(lastError, model, started, requestId);
        }
        if (res.status === 429 && res.headers.get("retry-after")) {
          await sleep(Math.min(4000, Number(res.headers.get("retry-after")) * 1000));
          continue; // retry same model
        }
        if (res.status >= 500) {
          await sleep(700);
          continue;
        }
        return fail(lastError, model, started, requestId);
      }

      const json = (await res.json()) as ResponsesPayload;

      if (json.status === "incomplete") {
        lastError = `Truncated: ${json.incomplete_details?.reason ?? "unknown"}`;
        // A bigger budget rarely helps twice; move on.
        break;
      }

      const extracted = extractOutput(json);
      if (extracted.refusal) {
        return fail(`Model refusal: ${extracted.refusal}`, model, started, requestId);
      }
      if (!extracted.text) {
        lastError = "Model returned no output_text item.";
        continue;
      }

      let data: T;
      try {
        data = JSON.parse(extracted.text) as T;
      } catch {
        lastError = "Model output was not valid JSON.";
        continue;
      }

      return {
        ok: true,
        data,
        model,
        endpoint: "/v1/responses",
        latencyMs: Date.now() - started,
        promptTokens: json.usage?.input_tokens,
        completionTokens: json.usage?.output_tokens,
        totalTokens: json.usage?.total_tokens,
        requestId,
        outputPreview: extracted.text.slice(0, 900),
      };
    }
  }

  return fail(lastError, "none", started, requestId);
}

function fail(
  error: string,
  model: string,
  started: number,
  requestId?: string,
): StructuredResult<never> {
  return {
    ok: false,
    data: null,
    model,
    endpoint: "/v1/responses",
    latencyMs: Date.now() - started,
    error: error.slice(0, 500),
    requestId,
    outputPreview: "",
  };
}

type ResponsesPayload = {
  status?: string;
  incomplete_details?: { reason?: string };
  usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number };
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string; refusal?: string }>;
  }>;
};

/**
 * Reasoning models emit `type: "reasoning"` items before the message, so the
 * output array is walked rather than indexed.
 */
function extractOutput(json: ResponsesPayload): {
  text: string | null;
  refusal: string | null;
} {
  for (const item of json.output ?? []) {
    if (item.type !== "message") continue;
    for (const content of item.content ?? []) {
      if (content.type === "refusal" && content.refusal) {
        return { text: null, refusal: content.refusal };
      }
      if (content.type === "output_text" && typeof content.text === "string") {
        return { text: content.text, refusal: null };
      }
    }
  }
  return { text: null, refusal: null };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ------------------------- schema building helpers ------------------------ */

/** Strict mode forbids optional keys — nullability is expressed as a union. */
export function nullableString(description?: string) {
  return { type: ["string", "null"], ...(description ? { description } : {}) };
}

export function obj(
  properties: Record<string, unknown>,
  description?: string,
): Record<string, unknown> {
  return {
    type: "object",
    ...(description ? { description } : {}),
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
  };
}
