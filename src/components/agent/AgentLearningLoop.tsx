import { lazy, Suspense, useState } from "react";
import { useConvexAuth } from "convex/react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { AgentAvatar, type AvatarConfig } from "./AgentAvatar";
import { learningLoopText } from "./learningLoopCopy";
import "./agent-learning-loop.css";

const SystemDiagram = lazy(() => import("./AgentSystemDiagram").then(module => ({ default: module.AgentSystemDiagram })));
const avatar: AvatarConfig = { gender: "male", palette: "moss", face: "curious", hair: "crop", outfit: "cardigan", accessory: "none" };

export function AgentLearningLoop({ standalone = false }: { standalone?: boolean }) {
  const { locale, t } = useI18n();
  const { isAuthenticated } = useConvexAuth();
  const copy = learningLoopText(locale);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const example = copy.examples[exampleIndex];
  const Heading = standalone ? "h1" : "h2";
  const Subheading = standalone ? "h2" : "h3";

  return <div className="learning-loop" id="agent-system">
    <header className="learning-loop-heading">
      <span className="docket-label">{t("How it works")}</span>
      <Heading>{copy.title}<br /><em>{copy.titleAccent}</em></Heading>
      <p>{copy.intro}</p>
    </header>

    <ol className="learning-loop-steps">
      {copy.steps.map((step, index) => <li key={step.title}>
        <span className="learning-step-number">{String(index + 1).padStart(2, "0")}</span>
        <Subheading>{step.title}</Subheading><p>{step.body}</p>
      </li>)}
    </ol>
    <div className="learning-loop-return"><span aria-hidden="true">↶</span><p>{copy.loop}</p></div>

    <section className="learning-example" aria-label={copy.exampleLabel}>
      <header><span className="docket-label">{copy.exampleLabel}</span><Subheading>{copy.exampleTitle}</Subheading></header>
      <div className="learning-example-choices" role="group" aria-label={copy.chooseExample}>
        {copy.examples.map((item, index) => <button type="button" key={item.label} aria-pressed={index === exampleIndex} onClick={() => setExampleIndex(index)}>{item.label}</button>)}
      </div>
      <div className="learning-example-story" aria-live="polite" aria-atomic="true">
        <div className="learning-owner-words"><span>{copy.youSay}</span><blockquote>“{example.feedback}”</blockquote></div>
        <div className="learning-agent-change">
          <div className="learning-agent-identity"><AgentAvatar name="Rio" avatar={avatar} className="learning-loop-avatar" /><div><span>{copy.yourAgent}</span><strong>{copy.carriesForward}</strong></div></div>
          <p className="learning-memory"><span aria-hidden="true">↳</span>{example.memory}</p>
          <div className="learning-next-date"><span>{example.nextLabel}</span><p>{example.next}</p></div>
        </div>
      </div>
      <p className="learning-example-caption">{copy.exampleNote}</p>
      <Link className="learning-proof-link" to="/preview/agent-coaching">{copy.proof}<span aria-hidden="true">↗</span></Link>
    </section>

    <div className="learning-loop-bottom">
      <p>{copy.waiting}<br /><span>{copy.consent}</span></p>
      <Link to={isAuthenticated ? "/dashboard#private-line" : "/signup"} className="learning-loop-cta">{isAuthenticated ? copy.talk : copy.create}<span aria-hidden="true">→</span></Link>
    </div>

    <details className="learning-technical" onToggle={event => setTechnicalOpen(event.currentTarget.open)}>
      <summary>{copy.technical}<span aria-hidden="true">+</span></summary>
      {technicalOpen && <Suspense fallback={<p className="learning-technical-loading">{t("Loading")}…</p>}><SystemDiagram embedded /></Suspense>}
    </details>
  </div>;
}
