import type { DateActivity } from "@convex/lib/dateActivity";
import type { SceneKind } from "@convex/lib/dateStory";
import type { AvatarConfig } from "../components/agent/AgentAvatar";
import type { TranscriptLine } from "../components/agent/DateTranscript";

export type LearningProof = {
  recordedAt: string;
  dates: Array<{
    label: string; reviewStatus: "reviewed" | "withheld" | "recovered"; reviewRecoveredAt?: number; setting: string; sceneKind: SceneKind; situation: string;
    mine: { name: string; avatar: Partial<AvatarConfig> | null };
    counterpart: { name: string; avatar: Partial<AvatarConfig> | null };
    turns: TranscriptLine[]; journal?: DateActivity;
    letter: string; verdict: string; nextSearchNote: string | null;
    transcriptHash: string;
  }>;
  feedback: Array<{ dateIndex: number; target: "self" | "counterpart"; round: number; content: string; reply: string; memory: string }>;
};

export function speakingStats(turns: TranscriptLine[]) {
  const own = turns.filter(turn => turn.isMine);
  return { replies: own.length, averageLength: own.length ? Math.round(own.reduce((sum, turn) => sum + [...turn.content].length, 0) / own.length) : 0,
    questions: own.filter(turn => /[?？]/u.test(turn.content)).length };
}
