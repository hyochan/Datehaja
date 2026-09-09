import { structured, type StructuredRequest, type StructuredResult } from "../integrations/openai";
import { ownerFactsSupported, type OwnerFactEvidence } from "./ownerFacts";

export type DateTurn = {
  reply: string;
  subtext: string;
  ends_conversation?: boolean;
  owner_fact_evidence?: OwnerFactEvidence[];
};

const normalized = (text: string) => text.normalize("NFKC").toLocaleLowerCase().replace(/[\p{P}\p{Z}\s]/gu, "");

/** Only catch a near-verbatim recycled speech, not a short answer like "yes". */
export function repeatedSpeech(reply: string, previous: string[]): boolean {
  const candidate = normalized(reply);
  if (candidate.length < 35) return false;
  const grams = (text: string) => new Set(Array.from({ length: Math.max(0, text.length - 3) }, (_, i) => text.slice(i, i + 4)));
  const next = grams(candidate);
  return previous.slice(-3).some(text => {
    const prior = normalized(text);
    if (prior.length < 35) return false;
    const old = grams(prior);
    const intersection = [...next].filter(part => old.has(part)).length;
    return intersection / new Set([...next, ...old]).size >= 0.82;
  });
}

/** Save neither an unsupported owner fact nor a recycled long reply. Repair once. */
export async function generateDateTurn(
  request: StructuredRequest,
  ownerSources: string[],
  previousOwnReplies: string[],
  logRejected: (result: StructuredResult<DateTurn>) => Promise<void>,
): Promise<StructuredResult<DateTurn>> {
  const problem = (data: DateTurn | null) => !data ? null
    : !ownerFactsSupported(data.owner_fact_evidence ?? [], ownerSources)
      ? "The cited owner fact is absent from the owner's brief."
      : repeatedSpeech(data.reply, previousOwnReplies)
        ? "This long reply repeats a previous speech instead of responding to the new line."
        : null;
  let result = await structured<DateTurn>(request);
  let issue = problem(result.data);
  if (!issue) return result;
  await logRejected({ ...result, ok: false, error: issue });
  result = await structured<DateTurn>({ ...request,
    instructions: `${request.instructions}\nA previous attempt was rejected: ${issue} Reply to the actual last line in a fresh, brief way. Do not recycle the previous plan or speech. Use only exact supporting quotes from owner_fact_sources for personal facts; otherwise avoid autobiography and return [] for owner_fact_evidence.`,
  });
  issue = problem(result.data);
  return issue ? { ...result, ok: false, data: null, error: issue } : result;
}
