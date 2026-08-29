import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { modelCandidates, structured } from "./openai";
import { search, scrape } from "./firecrawl";
import { deleteWebhook, parseAddress, safeIdempotencyKey } from "./agentmail";
import { extractVenues } from "../lib/venueHeuristics";
import { buildFallbackPlan } from "../lib/fallbackPlan";
import { buildSearchQueries } from "../research";

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

/* --------------------------- deterministic fallbacks ----------------------- */

describe("activity-led venue research", () => {
  it("uses the person's specific date idea as the first search", () => {
    const queries = buildSearchQueries({
      city: "Seoul",
      area: "Seongsu",
      whenIso: "2026-08-29T10:00:00.000Z",
      timezone: "Asia/Seoul",
      budgetMin: 10_000,
      budgetMax: 30_000,
      currency: "KRW",
      interests: ["Films"],
      dateTypes: ["film"],
      dateIdea: "Watch an indie film",
      vibe: "quiet",
      dietary: [],
      accessibility: [],
      indoorOutdoor: "indoor",
      desiredDurationMin: 120,
    });
    expect(queries[0]).toContain("Watch an indie film");
    expect(queries[0]).toContain("Seongsu Seoul");
  });
});

describe("venue extraction without a model", () => {
  const page = {
    url: "https://guide.test/seongsu",
    title: "The 20 Best Italian Restaurants near Seongsu",
    content: [
      "# The 20 Best Italian Restaurants near Seongsu",
      "",
      "## Sediciseoul",
      "A small trattoria with an open kitchen. Handmade pasta and a short wine list.",
      "Open Tue–Sun 17:00–23:00. ₩25,000–40,000 per person.",
      "12 Seongsui-ro, Seongdong-gu",
      "",
      "## CAUTION: DROOL-WORTHY CONTENT AHEAD!",
      "Some editorial filler that is definitely not a restaurant at all, honestly.",
      "",
      "## Where we ate last week",
      "More filler text that goes on for a little while so it passes the length gate.",
      "",
      "## [Parco Pizzeria](https://parco.example.com)",
      "Neapolitan pizza in a converted garage. Loud, cheap and very good indeed.",
    ].join("\n"),
  };

  it("finds real venue names in a listicle", () => {
    const venues = extractVenues(page, "Seongsu");
    const names = venues.map((v) => v.name);
    expect(names).toContain("Sediciseoul");
    expect(names).toContain("Parco Pizzeria");
  });

  it("rejects editorial shouting and sentence-shaped headings", () => {
    const names = extractVenues(page, "Seongsu").map((v) => v.name);
    expect(names).not.toContain("CAUTION: DROOL-WORTHY CONTENT AHEAD!");
    expect(names.some((n) => n.startsWith("Where we"))).toBe(false);
  });

  it("captures hours, price and address when the page states them", () => {
    const sedici = extractVenues(page, "Seongsu").find(
      (v) => v.name === "Sediciseoul",
    );
    expect(sedici?.openingHours).toMatch(/17:00/);
    expect(sedici?.approximatePrice).toMatch(/25,000/);
    expect(sedici?.address).toMatch(/Seongsui-ro/);
  });

  it("drops a price capture that dragged prose along with it", () => {
    const messy = {
      url: "https://x.test",
      title: "Cafe list",
      content: [
        "## Soha Salt Pond",
        "A calm room with good light and better filter coffee, honestly one of",
        "the nicer ones. Around ₩3,000)**, and I totally get it – ** per person.",
      ].join("\n"),
    };
    const venue = extractVenues(messy, "Seongsu")[0];
    expect(venue).toBeDefined();
    // Better to say nothing than to quote mangled markdown as a price.
    expect(
      venue.approximatePrice === null ||
        /^[₩$€£¥][\d,]+$/.test(venue.approximatePrice),
    ).toBe(true);
  });

  it("never claims more than low confidence", () => {
    for (const venue of extractVenues(page, "Seongsu")) {
      expect(venue.confidence).toBe("low");
      expect(venue.tags).toContain("extracted-without-model");
    }
  });

  it("unwraps a markdown link around the name", () => {
    const names = extractVenues(page, "Seongsu").map((v) => v.name);
    expect(names).toContain("Parco Pizzeria");
    expect(names.some((n) => n.includes("["))).toBe(false);
  });

  it("classifies categories from the surrounding text", () => {
    const venues = extractVenues(page, "Seongsu");
    expect(venues.find((v) => v.name === "Parco Pizzeria")?.category).toBe(
      "restaurant",
    );
  });

  it("recognises an independent cinema as a date venue", () => {
    const venues = extractVenues(
      {
        url: "https://cinema.test",
        title: "Moveseed Cinema",
        content: [
          "## Moveseed Cinema",
          "An independent cinema with nightly film screenings and reserved seating.",
          "Open daily 14:00-23:00.",
          "22 Seongsui-ro, Seongdong-gu",
        ].join("\n"),
      },
      "Seongsu",
    );
    expect(venues[0]?.category).toBe("cinema");
  });

  it("rejects a blog section heading with nothing venue-like around it", () => {
    const blog = {
      url: "https://blog.test/seoul",
      title: "Winter trip notes",
      content: [
        "## Perjalanan Musim Dingin ke Seoul",
        "Catatan perjalanan saya selama seminggu, foto-foto dan cerita ringan",
        "tentang cuaca dan suasana kota pada bulan Desember lalu.",
        "",
        "## Momen Trip Terkait",
        "Beberapa tautan ke tulisan lain yang mungkin menarik untuk dibaca juga.",
      ].join("\n"),
    };
    expect(extractVenues(blog, "Seongsu")).toEqual([]);
  });

  it("keeps a heading the page corroborates with hours, price or an address", () => {
    const corroborated = {
      url: "https://blog.test/seoul",
      title: "Winter trip notes",
      content: [
        "## Onion Seongsu",
        "Sebuah tempat yang tenang dengan roti yang sangat enak sekali.",
        "Open daily 08:00-22:00.",
      ].join("\n"),
    };
    expect(extractVenues(corroborated, "Seongsu").map((v) => v.name)).toContain(
      "Onion Seongsu",
    );
  });

  it("returns nothing from a page with no headings and no usable title", () => {
    expect(
      extractVenues(
        {
          url: "https://x.test",
          title: "Best guide to things to do",
          content: "short",
        },
        "Seongsu",
      ),
    ).toEqual([]);
  });
});

describe("plan composition without a model", () => {
  const base = {
    area: "Seongsu",
    city: "Seoul",
    budgetLow: 30000,
    budgetHigh: 60000,
    availableMinutes: 180,
    sharedInterests: ["Films", "Coffee"],
    sharedDateTypes: ["dinner", "dessert"],
    atmosphere: "quiet",
    dietary: [] as string[],
    aName: "Alice",
    bName: "Bob",
    venues: [
      {
        name: "Sediciseoul",
        category: "restaurant",
        district: "Seongsu",
        approximatePrice: "₩30,000",
        confidence: "medium" as const,
        tags: [],
      },
      {
        name: "Quiet Dessert Bar",
        category: "dessert",
        district: "Seongsu",
        approximatePrice: null,
        confidence: "low" as const,
        tags: [],
      },
      {
        name: "Loud Cocktail Room",
        category: "bar",
        district: "Seongsu",
        approximatePrice: null,
        confidence: "low" as const,
        tags: [],
      },
    ],
  };

  it("builds a two-stop plan when there's time and a complementary venue", () => {
    const plan = buildFallbackPlan(base)!;
    expect(plan.stops).toHaveLength(2);
    expect(plan.stops[0].venueIndex).toBe(0);
    expect(plan.stops[1].startOffsetMin).toBeGreaterThan(
      plan.stops[0].durationMin - 1,
    );
  });

  it("keeps a specific movie idea to one complete stop", () => {
    const plan = buildFallbackPlan({
      ...base,
      dateIdea: "Watch an indie film",
      sharedDateTypes: ["film"],
      venues: [
        {
          name: "Moveseed Cinema",
          category: "cinema",
          district: "Seongsu",
          approximatePrice: "₩15,000",
          confidence: "high" as const,
          tags: [],
        },
        ...base.venues,
      ],
    })!;
    expect(plan.stops).toHaveLength(1);
    expect(plan.stops[0].venueIndex).toBe(0);
    expect(plan.title).toContain("Watch an indie film");
  });

  it("keeps the cost inside the agreed range", () => {
    const plan = buildFallbackPlan(base)!;
    expect(plan.estimatedCostPerPerson).toBeGreaterThanOrEqual(base.budgetLow);
    expect(plan.estimatedCostPerPerson).toBeLessThanOrEqual(base.budgetHigh);
  });

  it("builds a single-stop plan when the window is short", () => {
    const plan = buildFallbackPlan({ ...base, availableMinutes: 120 })!;
    expect(plan.stops).toHaveLength(1);
  });

  it("never sends an alcohol-free user to a bar", () => {
    const plan = buildFallbackPlan({
      ...base,
      dietary: ["no_alcohol_venue"],
      venues: [base.venues[2], base.venues[1]],
    })!;
    const chosen = plan.stops.map(
      (s) => [base.venues[2], base.venues[1]][s.venueIndex],
    );
    expect(chosen.some((v) => v.category === "bar")).toBe(false);
  });

  it("returns null when there is nothing to work with", () => {
    expect(buildFallbackPlan({ ...base, venues: [] })).toBeNull();
  });

  it("names what the two people actually share", () => {
    const plan = buildFallbackPlan(base)!;
    expect(plan.whyItFits).toContain("Films");
    expect(plan.whyItFits).toContain("Coffee");
  });

  it("never asks the two people to exchange contact details", () => {
    const plan = buildFallbackPlan(base)!;
    const allText = [
      plan.summary,
      plan.whyItFits,
      plan.meetingInstructions,
    ].join(" ");
    // Reassurance ("you won't need to swap numbers") is fine; an instruction is not.
    expect(allText).not.toMatch(
      /(?<!(?:won't|will not|do not|don't|no) need to )(?<!never )(swap|exchange|share|send|give)\s+(?:them\s+)?(?:your\s+)?(numbers?|phone|contact|instagram|whatsapp|kakao|email)/i,
    );
    expect(allText).not.toMatch(/text (?:them|each other)/i);
  });
});
