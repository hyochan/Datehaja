import { useI18n } from "../../i18n";
import { activityCopy } from "@convex/lib/dateActivity";
import { AgentAvatar, type AvatarConfig } from "./AgentAvatar";
import { TurnCoaching, type DateCoaching } from "./TurnCoaching";

export type TranscriptLine = { _id: string; round: number; isMine: boolean; speakerAgentName: string; content: string };
export type DateTranscriptProps = {
  turns: TranscriptLine[];
  mine: { name: string; avatar?: Partial<AvatarConfig> | null };
  counterpart: { name: string; avatar?: Partial<AvatarConfig> | null };
  coaching?: DateCoaching;
};
export function DateTranscript({ turns, mine, counterpart, coaching }: DateTranscriptProps) {
  const { t, locale } = useI18n();
  const copy = activityCopy(locale);
  return <section className="date-record-transcript" id="conversation" aria-labelledby="date-transcript-heading">
    <header><div className="docket-label">{t("TRANSCRIPT")}</div><h2 id="date-transcript-heading">{t("Read the whole conversation")}</h2><span>{turns.length} {copy.lines}</span></header>
    {coaching && <div className="date-coaching-intro">{t("Not quite you? Open the feedback under any line to shape your agent's voice or share how you felt about the other person.")}</div>}
    <div className="date-record-lines">
      {turns.map(turn => <article key={turn._id} id={`turn-${turn.round}`} className={`date-record-line ${turn.isMine ? "is-mine" : "is-other"}`} tabIndex={-1}>
        <AgentAvatar name={turn.speakerAgentName} avatar={turn.isMine ? mine.avatar : counterpart.avatar} className="agent-avatar-turn" />
        <div><div className="date-record-speaker"><b>{turn.speakerAgentName}</b><a href={`#turn-${turn.round}`} aria-label={`${turn.speakerAgentName} ${turn.round}`}>{String(turn.round).padStart(2, "0")}</a></div><p>{turn.content}</p>
          {coaching && <TurnCoaching turn={turn} coaching={coaching} agentName={mine.name} />}
        </div>
      </article>)}
    </div>
    {coaching?.memory && <details className="date-coaching-memory"><summary>{t("What my agent has learned from me")}</summary><div>{coaching.memory}</div></details>}
  </section>;
}
