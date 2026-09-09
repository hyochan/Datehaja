import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { dateScene, type SceneKind } from "@convex/lib/dateStory";
import { AgentAvatar, type AvatarConfig } from "./AgentAvatar";
import { useI18n } from "../../i18n";

type Encounter = {
  _id: string; sceneKind?: SceneKind; isSearchEncounter?: boolean; status: string;
  createdAt?: number; introductionReady?: boolean; myHeadline?: string; myNextSearchNote?: string;
  counterpart?: { agentName: string } | null;
};
const PLACES: Array<{ kind: SceneKind; x: number; y: number; label: string }> = [
  { kind: "cinema", x: 120, y: 83, label: "Cinema" },
  { kind: "gallery", x: 340, y: 76, label: "Gallery" },
  { kind: "bookshop", x: 68, y: 190, label: "Bookshop" },
  { kind: "garden", x: 397, y: 185, label: "Garden" },
  { kind: "cafe", x: 170, y: 274, label: "Café" },
  { kind: "market", x: 317, y: 283, label: "Market" },
];

function Building({ kind }: { kind: SceneKind }) {
  if (kind === "garden") return <g>
    <path d="M-39 15V-20L0-49 39-20V15Z" fill="#6d9e91" stroke="#b6d1bd" strokeWidth="2" />
    <path d="M-39-20H39M0-49V15M-20-34V15M20-34V15M-39-2H39" stroke="#c4dcbb" strokeWidth="2" />
    <path d="M-26 12Q-41-17-21-7Q-11-29-8 12M14 12Q2-15 17-6Q30-25 30 12" fill="#284f40" />
  </g>;
  if (kind === "market") return <g>
    <path d="M-38-15H38V17H-38Z" fill="#b88563" /><path d="M-43-15L-31-40H31L43-15Z" fill="#dd987e" />
    <path d="M-26-15L-19-40H-7L-10-15ZM9-15L7-40H19L26-15Z" fill="#f1d4a7" />
    <path d="M-43-15H43V-8H-43Z" fill="#eed8ae" /><path d="M-29 1H29V17H-29Z" fill="#634e41" />
    <circle cx="-21" cy="3" r="5" fill="#babc76" /><circle cx="-8" cy="3" r="5" fill="#d2976c" /><path d="M8-4H26V7H8Z" fill="#b6b075" />
  </g>;
  return <g>
    <path d="M-35 17V-29H29L39-20V17Z" fill={kind === "cinema" ? "#997272" : kind === "gallery" ? "#d0c3a0" : "#b99175"} />
    <path d="M-40-29L-23-47H20L36-29Z" fill={kind === "bookshop" ? "#789892" : "#806764"} />
    <path d="M-35 17H39V22H-35Z" fill="#30433b" />
    <path d="M5-10H21V17H5Z" fill="#3c5149" /><path d="M8-7H18V8H8Z" fill="#f4dca0" />
    {kind === "cinema" ? <><path d="M-40-28H35V-13H-40Z" fill="#ead1a8" /><path d="M-28-20H23" stroke="#b27565" strokeWidth="3" /><circle cx="-31" cy="-20" r="1.5" fill="#fff4c2" /><circle cx="28" cy="-20" r="1.5" fill="#fff4c2" /><path d="M-27-6H-4V10H-27Z" fill="#374c45" /><path d="M-19-3L-11 2-19 7Z" fill="#d8ba91" /></>
      : kind === "gallery" ? <><path d="M-28-16H-5V7H-28Z" fill="#f2e6c9" /><circle cx="-16" cy="-5" r="6" fill="#7b9990" /><path d="M-24 5L-13-7-5 5Z" fill="#b7836d" /></>
      : kind === "bookshop" ? <><path d="M-28-17H-4V9H-28Z" fill="#374b45" /><path d="M-25-12V6M-20-12V6M-14-14V6M-8-10V6" stroke="#e0bd8b" strokeWidth="3" /></>
      : <><path d="M-39-26H32L37-12H-43Z" fill="#d8b28a" /><path d="M-27-5H-9V7H-27Z" fill="#e8d4a7" /><path d="M-9-3Q1-3-3 4H-9" fill="none" stroke="#e8d4a7" strokeWidth="2" /></>}
  </g>;
}

/** The map is a stage. Markers, conversation stops and lessons come only from saved encounters. */
export function AgentSearchWorld({ name, avatar, encounters, currentDateId }: {
  name: string; avatar?: AvatarConfig; encounters: Encounter[]; currentDateId?: string;
}) {
  const { locale, t } = useI18n();
  const [selectedId, setSelectedId] = useState<string>();
  const real = encounters.filter(item => item.isSearchEncounter).sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  const selected = real.find(item => item._id === selectedId) ?? real.find(item => item._id === currentDateId) ?? real[0];
  const current = real.find(item => item._id === currentDateId && ["running", "queued"].includes(item.status));
  const selectedPlace = PLACES.find(place => place.kind === selected?.sceneKind);
  return <div className="agent-search-world" role="group" aria-label={t("Your Agent's world")}>
    <div className="agent-search-world-heading"><span>{t("AGENT WORLD")}</span><small>{t("A little world. Real discoveries.")}</small></div>
    <div className="agent-search-map">
      <svg viewBox="0 0 480 350" fill="none" aria-hidden="true">
        <ellipse cx="240" cy="194" rx="217" ry="138" fill="#162c28" />
        <path d="M40 135Q62 27 185 36Q318 7 414 82Q478 144 431 252Q368 339 216 324Q60 314 31 230Q13 176 40 135Z" fill="#344d42" />
        <path d="M148 85Q265 114 340 78M244 103Q294 157 388 187M240 109Q170 169 75 192M150 175Q201 220 169 278M201 220Q294 200 317 279" stroke="#62715b" strokeWidth="15" strokeLinecap="round" />
        <path d="M148 85Q265 114 340 78M244 103Q294 157 388 187M240 109Q170 169 75 192M150 175Q201 220 169 278M201 220Q294 200 317 279" stroke="#8b9374" strokeOpacity=".55" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
        <ellipse cx="278" cy="151" rx="35" ry="18" transform="rotate(-20 278 151)" fill="#759b91" />
        <path d="M254 153L276 144M275 157L295 150" stroke="#abc0a3" strokeWidth="2" strokeLinecap="round" />
        {[[62,91],[198,64],[432,126],[107,270],[245,297],[361,236],[207,144],[324,40]].map(([x,y]) => <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}><path d="M0-8V11" stroke="#a8ae82" strokeWidth="3" /><ellipse cy="-14" rx="13" ry="20" fill="#587d59" /><ellipse cx="-4" cy="-20" rx="7" ry="11" fill="#7f986b" /></g>)}
        {[[204,102],[132,199],[329,184],[241,235]].map(([x,y]) => <g key={x}><path d={`M${x} ${y}v-16`} stroke="#cbb38b" strokeWidth="2" /><circle cx={x} cy={y-18} r="10" fill="#efd493" opacity=".08" /><circle cx={x} cy={y-18} r="3" fill="#eed599" /></g>)}
        {PLACES.map(place => <g key={place.kind} transform={`translate(${place.x} ${place.y})`}><ellipse cy="21" rx="46" ry="12" fill="#1c342b" opacity=".5" /><Building kind={place.kind} /></g>)}
      </svg>
      {PLACES.map(place => {
        const atPlace = real.find(item => item.sceneKind === place.kind);
        const isCurrent = current?.sceneKind === place.kind;
        const style = { left: `${place.x / 4.8}%`, top: `${place.y / 3.5}%` } as CSSProperties;
        const content = <><span className="agent-search-place-label">{t(place.label)}{atPlace && <i aria-hidden>·</i>}</span>{isCurrent && <AgentAvatar name={name} avatar={avatar} className="agent-search-marker" />}</>;
        return atPlace ? <button type="button" key={place.kind} style={style} className={`agent-search-place is-visited${selectedPlace?.kind === place.kind ? " is-selected" : ""}${isCurrent ? " is-current" : ""}`} onClick={() => setSelectedId(atPlace._id)} aria-label={`${t(place.label)} · ${t("Open the encounter")}`} aria-pressed={selectedPlace?.kind === place.kind}>{content}</button>
          : <span key={place.kind} style={style} className="agent-search-place" aria-label={`${t(place.label)} · ${t("No encounter here yet")}`}>{content}</span>;
      })}
    </div>
    {selected ? <div className="agent-search-discovery" aria-live="polite">
      {real.length > 1 && <div className="agent-search-stops" aria-label={t("Recent encounters")}>{real.slice(0, 4).reverse().map((item, index) => <button key={item._id} type="button" onClick={() => setSelectedId(item._id)} aria-pressed={selected._id === item._id}>{String(index + 1).padStart(2, "0")} · {item.counterpart?.agentName ?? t("Agent")}</button>)}</div>}
      <div className="agent-search-discovery-meta">{["queued", "running"].includes(selected.status) ? t("A conversation is unfolding") : t("A saved encounter")}<span>{name} × {selected.counterpart?.agentName ?? t("Agent")}</span></div>
      <Link className="agent-search-discovery-title" to={`/agent-date/${selected._id}`}>{selected.myHeadline || (selected.sceneKind ? dateScene(selected.sceneKind, 0, locale).title : t("Open the encounter"))}<span aria-hidden>↗</span></Link>
      {selected.myNextSearchNote && <div className="agent-search-lesson"><small>{t("What I'll carry forward")}</small><p>{selected.myNextSearchNote}</p></div>}
    </div> : <p className="agent-search-empty-note">{t("The first conversation will leave a footprint.")}</p>}
  </div>;
}
