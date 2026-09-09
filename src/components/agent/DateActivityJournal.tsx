import { useI18n } from "../../i18n";
import { activityCopy, type DateActivity } from "@convex/lib/dateActivity";
import { DateSceneArt } from "./DateSceneArt";

export function DateActivityJournal({ journal, totalLines, onReplay }: {
  journal?: DateActivity; totalLines: number; onReplay?: (round: number) => void;
}) {
  const { locale, t } = useI18n();
  const copy = activityCopy(locale);
  return <section className="date-journal" id="activity" aria-labelledby="date-journal-heading">
    <header className="date-journal-heading">
      <div><span className="docket-label">{t("DATE JOURNAL")}</span><h2 id="date-journal-heading">{copy.heading}</h2></div>
      <span className="date-journal-count">{totalLines} {copy.lines}</span>
    </header>
    {journal ? <>
      <p className="date-journal-overview">{journal.overview}</p>
      <ol className="date-journal-events">
        {journal.events.map((event, index) => <li key={`${index}-${event.rounds[0]}`} className={`date-journal-event is-${event.kind}`}>
          <div className="date-journal-illustration" aria-hidden="true">
            <DateSceneArt kind={event.sceneKind} />
            <span className="date-journal-number">{String(index + 1).padStart(2, "0")}</span>
          </div>
          <div className="date-journal-body">
            <span className={`date-journal-kind is-${event.kind}`}>{copy[event.kind]}</span>
            <h3>{event.title}</h3>
            <p>{event.detail}</p>
            <div className="date-journal-evidence">
              <a href={`#turn-${event.rounds[0]}`}>{copy.read} <span>{event.rounds.map(r => String(r).padStart(2, "0")).join(" · ")}</span> ↓</a>
              {onReplay && <button type="button" onClick={() => onReplay(event.rounds[0])} aria-label={`${copy.replay}: ${event.title}`}>▶ {copy.replay}</button>}
            </div>
          </div>
        </li>)}
      </ol>
    </> : <p className="date-journal-overview">{copy.unavailable}</p>}
  </section>;
}
