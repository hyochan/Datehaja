import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { systemDiagramText } from "./systemDiagramCopy";
import "./agent-system-diagram.css";

type Step = "brief" | "search" | "date" | "review" | "letter" | "consent" | "memory";
type Node = { id: string; step: Step; col: number; row: number; title: string; caption: string; kind?: "gate" | "store" };

export function AgentSystemDiagram({ standalone = false, embedded = false }: { standalone?: boolean; embedded?: boolean }) {
  const { locale } = useI18n();
  const copy = systemDiagramText(locale);
  const [view, setView] = useState<"system" | "learning">("system");
  const [selected, setSelected] = useState<Step>("search");
  const id = useId();
  const arrow = `${id}-arrow`;
  const detail = copy.details[selected];
  const Heading = standalone ? "h1" : "h3";
  const DetailHeading = standalone ? "h2" : "h4";
  const selectStep = (step: Step) => {
    setSelected(step);
    if (window.matchMedia("(min-width: 700px) and (max-width: 1199px)").matches) {
      requestAnimationFrame(() => document.getElementById(`${id}-detail`)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }));
    }
  };
  const nodes: Node[] = [
    { id: "brief-a", step: "brief", col: 0, row: 0, title: copy.briefA, caption: copy.briefCaption, kind: "store" },
    { id: "search", step: "search", col: 1, row: 0, title: copy.search, caption: copy.searchCaption },
    { id: "brief-b", step: "brief", col: 2, row: 0, title: copy.briefB, caption: copy.briefCaption, kind: "store" },
    { id: "agent-a", step: "date", col: 0, row: 1, title: copy.agentA, caption: copy.agentCaption },
    { id: "transcript", step: "date", col: 1, row: 1, title: copy.transcript, caption: copy.transcriptCaption, kind: "store" },
    { id: "agent-b", step: "date", col: 2, row: 1, title: copy.agentB, caption: copy.agentCaption },
    { id: "review-a", step: "review", col: 0, row: 2, title: copy.reviewA, caption: copy.reviewCaption },
    { id: "recommend", step: "letter", col: 1, row: 2, title: copy.recommend, caption: copy.recommendCaption, kind: "gate" },
    { id: "review-b", step: "review", col: 2, row: 2, title: copy.reviewB, caption: copy.reviewCaption },
    { id: "human-a", step: "consent", col: 0, row: 3, title: copy.humanA, caption: copy.humanCaption },
    { id: "connect", step: "consent", col: 1, row: 3, title: copy.connect, caption: copy.connectCaption, kind: "gate" },
    { id: "human-b", step: "consent", col: 2, row: 3, title: copy.humanB, caption: copy.humanCaption },
  ];
  const stepOrder: Step[] = ["brief", "search", "date", "review", "letter", "consent"];
  const source: Record<Step, string> = {
    brief: "agentProfiles · preferences",
    search: "scouting.advance → agentDates.createDateRequest",
    date: "agentDates.runTurn → agentDateTurns",
    review: "dateReview · dateActivityReview",
    letter: "agentDates.finalize → deliverDebriefs",
    consent: "agentDates.consent → deliverConnection",
    memory: "agents.send → reply → storeReply",
  };

  return (
    <div className="system-diagram" id={embedded ? "agent-system-details" : "agent-system"}>
      <div className="system-diagram-intro">
        <div>
          <p className="system-diagram-eyebrow">SYSTEM DESIGN / 01</p>
          <Heading className="system-diagram-title">{copy.title}</Heading>
          <p>{copy.intro}</p>
        </div>
        <div className="system-diagram-switch" role="group" aria-label={copy.viewLabel}>
          <button type="button" aria-pressed={view === "system"} onClick={() => { setView("system"); setSelected("search"); }}>{copy.systemView}</button>
          <button type="button" aria-pressed={view === "learning"} onClick={() => { setView("learning"); setSelected("memory"); }}>{copy.learningView}</button>
        </div>
      </div>

      <div className="system-diagram-legend">
        <span><i className="legend-process" />{copy.process}</span>
        <span><i className="legend-store" />{copy.savedData}</span>
        <span><i className="legend-gate" />{copy.decision}</span>
        <span><i className="legend-private" />{copy.privatePath}</span>
      </div>

      <div className="system-diagram-layout">
        <div>
          {view === "system" ? <>
            <div className="system-map" aria-label={copy.systemView}>
              <div className="system-lane lane-a"><span>{copy.yourSide}</span></div>
              <div className="system-lane lane-world"><span>{copy.sharedWorld}</span></div>
              <div className="system-lane lane-b"><span>{copy.theirSide}</span></div>
              <svg className="system-wires" viewBox="0 0 1000 880" preserveAspectRatio="none" aria-hidden="true">
                <defs><marker id={arrow} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
                <g markerEnd={`url(#${arrow})`}>
                  <path d="M 300 112 H 370" /><path d="M 700 112 H 630" />
                  <path className="private-wire" d="M 170 176 V 252" /><path className="private-wire" d="M 830 176 V 252" />
                  <path d="M 500 176 V 252" />
                  <path markerStart={`url(#${arrow})`} d="M 300 316 H 370" /><path markerStart={`url(#${arrow})`} d="M 630 316 H 700" />
                  <path d="M 170 380 V 456" /><path d="M 830 380 V 456" />
                  <path d="M 300 520 H 370" /><path d="M 700 520 H 630" />
                  <path d="M 435 584 V 654 H 170 V 716" /><path d="M 565 584 V 654 H 830 V 716" />
                  <path className="private-wire" d="M 500 584 V 610" />
                  <path d="M 300 780 H 370" /><path d="M 700 780 H 630" />
                </g>
              </svg>
              <span className="system-edge-label label-settings-a">{copy.settings}</span>
              <span className="system-edge-label label-settings-b">{copy.settings}</span>
              <span className="system-edge-label label-private-a">{copy.ownBriefOnly}</span>
              <span className="system-edge-label label-private-b">{copy.ownBriefOnly}</span>
              <span className="system-edge-label label-eligible">{copy.eligiblePair}</span>
              <span className="system-edge-label label-read-a">{copy.readTranscript}</span>
              <span className="system-edge-label label-read-b">{copy.readTranscript}</span>
              <span className="system-edge-label label-letter-a">{copy.ifBothRecommend}</span>
              <span className="system-edge-label label-letter-b">{copy.ifBothRecommend}</span>
              {nodes.map((node) => <button
                key={node.id} type="button"
                className={`system-node node-${node.kind ?? "process"} ${selected === node.step ? "is-selected" : ""}`}
                style={{ left: `${4 + node.col * 33}%`, top: [48, 252, 456, 716][node.row] }}
                aria-pressed={selected === node.step} aria-controls={`${id}-detail`}
                onClick={() => selectStep(node.step)}
              >
                <span className="system-node-type">{node.kind === "gate" ? "◇" : node.kind === "store" ? "▱" : `${stepOrder.indexOf(node.step) + 1}`.padStart(2, "0")}</span>
                <strong>{node.title}</strong><span>{node.caption}</span>
              </button>)}
              <button className="system-return" type="button" onClick={() => selectStep("search")} aria-controls={`${id}-detail`}>↺ {copy.otherwiseSearch}</button>
            </div>

            <ol className="system-mobile-flow" aria-label={copy.systemView}>
              {stepOrder.map((step, index) => <li key={step}>
                <button type="button" aria-pressed={selected === step} aria-controls={`${id}-detail`} onClick={() => setSelected(step)}>
                  <span className="system-mobile-number">{String(index + 1).padStart(2, "0")}</span>
                  <span><strong>{copy.details[step].title.replace(/^\d{2} \/ /, "")}</strong><span>{copy.mobile[index]}</span></span>
                  <span aria-hidden="true">{selected === step ? "✓" : "→"}</span>
                </button>
                {selected === step && <div className="system-mobile-detail"><p>{detail.body}</p><p>↳ {detail.rule}</p></div>}
                {step === "search" && <p className="system-mobile-branch">↺ {copy.waiting}</p>}
                {step === "letter" && <p className="system-mobile-branch">↺ {copy.otherwiseSearch}</p>}
              </li>)}
            </ol>

            <div className="system-loop-note"><span aria-hidden="true">↺</span><p><strong>{copy.waiting}</strong>{copy.waitingDetail}</p></div>
          </> : <div className="system-learning">
            <div className="sequence-heading"><span>SEQUENCE / 02</span><DetailHeading>{copy.sequenceTitle}</DetailHeading><p>{copy.sequenceIntro}</p></div>
            <div className="system-sequence" role="img" aria-label={copy.sequenceAlt}>
              <div className="sequence-actors">{[copy.owner, copy.agentA, copy.memory, copy.nextDate].map((actor) => <strong key={actor}>{actor}</strong>)}</div>
              <div className="sequence-lifelines" aria-hidden="true"><i /><i /><i /><i /></div>
              {copy.messages.map((message, index) => <div key={message} className={`sequence-message sequence-message-${index}`}><span>{String(index + 1).padStart(2, "0")} · {message}</span><i aria-hidden="true" /></div>)}
            </div>
            <ol className="sequence-mobile">{copy.messages.map((message, index) => <li key={message}><small>{copy.sequenceRoutes[index]}</small><p>{message}</p></li>)}</ol>
            <div className="system-feedback-types">
              <div><span>SELF</span><strong>{copy.selfTitle}</strong><p>{copy.selfDetail}</p></div>
              <div><span>COUNTERPART</span><strong>{copy.otherTitle}</strong><p>{copy.otherDetail}</p></div>
            </div>
            <div className="system-approval"><span aria-hidden="true">◇</span><p><strong>{copy.approvalTitle}</strong>{copy.approvalDetail}</p></div>
          </div>}
        </div>

        <aside className="system-detail" id={`${id}-detail`} aria-label={copy.detailLabel}>
          <p className="system-diagram-eyebrow">{copy.detailLabel}</p>
          <div aria-live="polite" aria-atomic="true">
            <DetailHeading className="system-detail-title">{detail.title}</DetailHeading>
            <p>{detail.body}</p>
            <dl><dt>{copy.input}</dt><dd>{detail.input}</dd><dt>{copy.output}</dt><dd>{detail.output}</dd></dl>
            <div className="system-detail-rule"><span aria-hidden="true">↳</span><p>{detail.rule}</p></div>
            <details className="system-source"><summary>{copy.codePath}</summary><code>{source[selected]}</code></details>
          </div>
          <p className="system-selection-hint">{copy.selectHint}</p>
          <a className="system-back-link" href={embedded ? "#agent-system-details" : "#agent-system"}>↑ {copy.back}</a>
          <Link to="/preview/agent-coaching" className="system-example-link">{copy.example} <span aria-hidden="true">↗</span></Link>
        </aside>
      </div>
      <p className="system-diagram-footnote">{copy.footnote}</p>
    </div>
  );
}
