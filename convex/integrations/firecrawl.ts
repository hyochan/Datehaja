/**
 * Firecrawl client — live web research for real venues.
 *
 * Uses the v2 HTTP API directly so it runs in Convex's default V8 action
 * runtime. `FIRECRAWL_API_KEY` is used when configured; Firecrawl also serves
 * unauthenticated requests at a lower rate limit, and the `Authorization`
 * header must be omitted entirely (not sent empty) for that to work.
 */

const FIRECRAWL_BASE = "https://api.firecrawl.dev";

export function hasFirecrawlKey(): boolean {
  return Boolean(process.env.FIRECRAWL_API_KEY);
}

function headers(): Record<string, string> {
  const key = process.env.FIRECRAWL_API_KEY;
  return key
    ? { "Content-Type": "application/json", Authorization: `Bearer ${key}` }
    : { "Content-Type": "application/json" };
}

export type CallLog = {
  endpoint: string;
  query: string;
  httpStatus: number;
  ms: number;
  resultCount: number;
  error?: string;
};

export type SearchHit = {
  url: string;
  title: string;
  description: string;
  position: number;
  category?: string;
  /** Present when `scrapeOptions` was supplied. */
  markdown?: string;
};

type SearchResponse = {
  success?: boolean;
  data?: {
    web?: Array<{
      url?: string;
      title?: string;
      description?: string;
      position?: number;
      category?: string;
      markdown?: string;
    }>;
  };
  creditsUsed?: number;
  error?: string;
};

/**
 * POST /v2/search. Note the response is grouped by source (`data.web`), not a
 * flat array — a common way to get zero results by accident.
 */
export async function search(
  query: string,
  opts: {
    limit?: number;
    country?: string;
    location?: string;
    excludeDomains?: string[];
    /** Ask Firecrawl to also scrape each hit; costs more credits but saves a round trip. */
    withMarkdown?: boolean;
    timeoutMs?: number;
  } = {},
): Promise<{ hits: SearchHit[]; log: CallLog }> {
  const started = Date.now();
  const body: Record<string, unknown> = {
    query: query.slice(0, 500),
    limit: opts.limit ?? 6,
    sources: [{ type: "web" }],
    timeout: opts.timeoutMs ?? 45_000,
  };
  if (opts.country) body.country = opts.country;
  if (opts.location) body.location = opts.location;
  if (opts.excludeDomains?.length) body.excludeDomains = opts.excludeDomains;
  if (opts.withMarkdown) {
    body.scrapeOptions = { formats: ["markdown"], onlyMainContent: true };
  }

  try {
    const res = await fetch(`${FIRECRAWL_BASE}/v2/search`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
    const ms = Date.now() - started;

    if (!res.ok) {
      const text = await res.text();
      return {
        hits: [],
        log: {
          endpoint: "/v2/search",
          query,
          httpStatus: res.status,
          ms,
          resultCount: 0,
          error: text.slice(0, 300),
        },
      };
    }

    const json = (await res.json()) as SearchResponse;
    const hits: SearchHit[] = (json.data?.web ?? [])
      .filter((h): h is { url: string } & typeof h => typeof h.url === "string")
      .map((h, i) => ({
        url: h.url,
        title: h.title ?? "",
        description: h.description ?? "",
        position: h.position ?? i + 1,
        category: h.category,
        markdown: h.markdown,
      }));

    return {
      hits,
      log: {
        endpoint: "/v2/search",
        query,
        httpStatus: res.status,
        ms,
        resultCount: hits.length,
      },
    };
  } catch (e) {
    return {
      hits: [],
      log: {
        endpoint: "/v2/search",
        query,
        httpStatus: 0,
        ms: Date.now() - started,
        resultCount: 0,
        error: String(e).slice(0, 300),
      },
    };
  }
}

export type ScrapeResult = {
  url: string;
  markdown: string;
  title: string;
  json: unknown;
  log: CallLog;
};

/**
 * POST /v2/scrape. `jsonSchema` uses the supported `json` format rather than
 * the deprecated /v2/extract endpoint.
 */
export async function scrape(
  url: string,
  opts: {
    jsonSchema?: Record<string, unknown>;
    jsonPrompt?: string;
    timeoutMs?: number;
    maxAgeMs?: number;
  } = {},
): Promise<ScrapeResult> {
  const started = Date.now();
  const formats: unknown[] = ["markdown"];
  if (opts.jsonSchema) {
    formats.push({
      type: "json",
      schema: opts.jsonSchema,
      ...(opts.jsonPrompt ? { prompt: opts.jsonPrompt } : {}),
    });
  }

  const body: Record<string, unknown> = {
    url,
    formats,
    onlyMainContent: true,
    timeout: opts.timeoutMs ?? 40_000,
  };
  if (opts.maxAgeMs) body.maxAge = opts.maxAgeMs;

  try {
    const res = await fetch(`${FIRECRAWL_BASE}/v2/scrape`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
    const ms = Date.now() - started;

    if (!res.ok) {
      const text = await res.text();
      return {
        url,
        markdown: "",
        title: "",
        json: null,
        log: {
          endpoint: "/v2/scrape",
          query: url,
          httpStatus: res.status,
          ms,
          resultCount: 0,
          error: text.slice(0, 300),
        },
      };
    }

    const json = (await res.json()) as {
      data?: {
        markdown?: string;
        json?: unknown;
        metadata?: { title?: string; statusCode?: number };
      };
    };

    const markdown = json.data?.markdown ?? "";
    return {
      url,
      markdown,
      title: json.data?.metadata?.title ?? "",
      json: json.data?.json ?? null,
      log: {
        endpoint: "/v2/scrape",
        query: url,
        httpStatus: res.status,
        ms,
        resultCount: markdown ? 1 : 0,
      },
    };
  } catch (e) {
    return {
      url,
      markdown: "",
      title: "",
      json: null,
      log: {
        endpoint: "/v2/scrape",
        query: url,
        httpStatus: 0,
        ms: Date.now() - started,
        resultCount: 0,
        error: String(e).slice(0, 300),
      },
    };
  }
}

/**
 * Domains that are never useful as a venue source, plus the ones Firecrawl
 * refuses outright ("we do not support this site", HTTP 403). Excluding them at
 * search time saves a wasted scrape and a misleading error in the run log.
 */
export const NOISE_DOMAINS = [
  "pinterest.com",
  "facebook.com",
  "instagram.com",
  "x.com",
  "twitter.com",
  "tiktok.com",
  "youtube.com",
  "reddit.com",
  "quora.com",
];
