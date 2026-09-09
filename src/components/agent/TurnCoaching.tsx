import { useState } from "react";
import { useI18n } from "../../i18n";
import { Button } from "../ui/primitives";
import { readableError } from "../ui/Toast";
import type { TranscriptLine } from "./DateTranscript";

export type DateCoaching = {
  preview?: boolean;
  pending?: boolean;
  memory?: string;
  messages?: Array<{ _id: string; role: "human" | "agent"; content: string; turnRound?: number; feedbackTarget?: "self" | "counterpart" }>;
  send?: (content: string, turn: TranscriptLine) => Promise<unknown>;
};

export function TurnCoaching({ turn, coaching, agentName }: { turn: TranscriptLine; coaching: DateCoaching; agentName: string }) {
  const { t } = useI18n();
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const target = turn.isMine ? "self" : "counterpart";
  const messages = coaching.messages?.filter(m => m.turnRound === turn.round && m.feedbackTarget === target) ?? [];
  return <details className="turn-coaching">
    <summary>{t(turn.isMine ? "Make this more like me" : "How I felt about this")}{messages.length > 0 && <span> · <span className="sr-only">{t("Saved feedback")} </span>{messages.filter(m => m.role === "human").length}</span>}</summary>
    <div className="turn-coaching-panel">
      <h3>{t(turn.isMine ? "How would you say it?" : "What stood out about their reply?")}</h3>
      <div className="turn-coaching-hint">{t(turn.isMine
        ? "Tell your agent how you talk, or write your version of this line. Your guidance carries into future dates."
        : "Tell your agent what you liked or disliked, and whether it matters in future matches. This stays between you and your agent.")}</div>
      {messages.length > 0 && <ol className="turn-coaching-history" aria-label={t("Saved feedback")} aria-live="polite">
        {messages.map(m => <li key={m._id} className={m.role === "human" ? "is-owner" : "is-agent"}>
          <b>{m.role === "human" ? t("My feedback") : agentName}</b><div>{m.content}</div>
        </li>)}
      </ol>}
      {coaching.preview && <div className="turn-coaching-preview">{t("Preview only. This fictional character does not learn from this form. On your own date, your feedback is saved privately and your agent replies here.")}</div>}
      <form onSubmit={async e => {
        e.preventDefault();
        if (!coaching.send || !content.trim() || busy || coaching.pending) return;
        setBusy(true); setError(undefined);
        try { await coaching.send(content.trim(), turn); setContent(""); }
        catch (cause) { setError(readableError(cause)); }
        finally { setBusy(false); }
      }}>
        <label htmlFor={`coaching-${turn.round}`}>{t(turn.isMine ? "My voice guidance" : "My feedback about this person")}</label>
        <textarea id={`coaching-${turn.round}`} value={content} onChange={e => setContent(e.target.value)} maxLength={1200} rows={4}
          placeholder={t(turn.isMine
            ? "I don't explain so much. I'd say: ‘Okay, but you're carrying the popcorn.’ Keep it short and don't end every reply with a question."
            : "I liked that they played along. But I'm not comfortable when every reply becomes another question.")} />
        <div className="turn-coaching-actions">
          <Button type="submit" size="sm" disabled={Boolean(coaching.preview || coaching.pending || !content.trim())} loading={busy}>{t("Tell my agent")}</Button>
          <span>{t("Only your agent sees this")}</span>
        </div>
        {coaching.pending && <div className="turn-coaching-status" role="status">{t("Your agent is reading your feedback. You can add more when it replies.")}</div>}
        {error && <div className="turn-coaching-error" role="alert">{error}</div>}
      </form>
    </div>
  </details>;
}
