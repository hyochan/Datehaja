import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { DateTranscript, type DateTranscriptProps } from "./DateTranscript";

export function CoachedDateTranscript({ agentDateId, ...props }: DateTranscriptProps & { agentDateId: Id<"agentDates"> }) {
  const coaching = useQuery(api.agents.dateCoaching, { agentDateId });
  const send = useMutation(api.agents.send);
  return <DateTranscript {...props} coaching={{ ...coaching, pending: !coaching || coaching.pending,
    send: (content, turn) => send({ agentDateId, content, turnRound: turn.round, feedbackTarget: turn.isMine ? "self" : "counterpart" }),
  }} />;
}
