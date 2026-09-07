/* oxlint-disable react/only-export-components -- theme selection is tested beside the visual it controls */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  avatarForName,
  AgentCharacter,
  type AvatarConfig,
} from "./AgentAvatar";
import { useI18n } from "../../i18n";

type WorldTurn = {
  _id: string;
  round: number;
  speakerAgentName: string;
  content: string;
};

type WorldPerson = {
  name: string;
  avatar?: Partial<AvatarConfig> | null;
};

export type AgentWorldTheme = {
  key: "cinema" | "market" | "bookshop" | "garden" | "gallery" | "cafe";
  kicker: string;
  title: string;
  arrival: string;
  objects: Array<{
    key: string;
    icon: string;
    label: string;
    note: string;
    x: number;
    y: number;
  }>;
};

const COMMON_OBJECTS = {
  note: {
    key: "note",
    icon: "✎",
    label: "Shared note",
    note: "A tiny detail both agents can notice without exchanging private briefs.",
    x: 18,
    y: 28,
  },
  exit: {
    key: "exit",
    icon: "↗",
    label: "Easy exit",
    note: "Every world keeps a visible way out. A date should be easy to leave and easy to extend.",
    x: 88,
    y: 18,
  },
};

export function worldThemeFor(text: string): AgentWorldTheme {
  const value = text.toLowerCase();
  if (/film|movie|cinema|screen|director/.test(value)) {
    return {
      key: "cinema",
      kicker: "SCREENING ROOM 03",
      title: "The last showing",
      arrival: "The trailers have ended. Two seats are still warm.",
      objects: [
        {
          key: "screen",
          icon: "▶",
          label: "After-credits screen",
          note: "The screen keeps one image glowing after the room goes quiet.",
          x: 50,
          y: 17,
        },
        {
          key: "popcorn",
          icon: "✦",
          label: "Half-finished popcorn",
          note: "A low-stakes object gives the agents somewhere natural to begin.",
          x: 22,
          y: 72,
        },
        COMMON_OBJECTS.exit,
      ],
    };
  }
  if (/market|street|stall|night|food/.test(value)) {
    return {
      key: "market",
      kicker: "LANTERN LANE",
      title: "After the crowd",
      arrival: "One stall is still open and the lanterns are coming on.",
      objects: [
        {
          key: "stall",
          icon: "♨",
          label: "Last open stall",
          note: "Steam, a shared menu and one easy thing to be curious about.",
          x: 50,
          y: 20,
        },
        {
          key: "lantern",
          icon: "◉",
          label: "Lantern row",
          note: "The world changes gently as the conversation gets less guarded.",
          x: 18,
          y: 25,
        },
        COMMON_OBJECTS.exit,
      ],
    };
  }
  if (/book|library|poem|writing|novel/.test(value)) {
    return {
      key: "bookshop",
      kicker: "BOOKSHOP / AFTER HOURS",
      title: "The shelf between them",
      arrival: "The owner has gone upstairs. A reading lamp was left on.",
      objects: [
        {
          key: "shelf",
          icon: "▥",
          label: "Unfinished shelf",
          note: "Each agent can choose one title as a question instead of a résumé.",
          x: 20,
          y: 22,
        },
        {
          key: "lamp",
          icon: "☼",
          label: "Reading lamp",
          note: "A small pool of light turns the middle of the room into a private area.",
          x: 70,
          y: 37,
        },
        COMMON_OBJECTS.exit,
      ],
    };
  }
  if (/park|garden|walk|river|flower|outdoor/.test(value)) {
    return {
      key: "garden",
      kicker: "GLASSHOUSE / DUSK",
      title: "A path with no agenda",
      arrival:
        "The glass is cooling and the plants are holding the day’s warmth.",
      objects: [
        {
          key: "pond",
          icon: "≈",
          label: "Small reflecting pool",
          note: "A quiet object creates a pause without making silence feel like failure.",
          x: 53,
          y: 27,
        },
        {
          key: "bench",
          icon: "⌑",
          label: "Garden bench",
          note: "The agents can sit, move on, or keep walking. The scene never traps them.",
          x: 19,
          y: 67,
        },
        COMMON_OBJECTS.exit,
      ],
    };
  }
  if (/gallery|museum|art|exhibit|painting/.test(value)) {
    return {
      key: "gallery",
      kicker: "GALLERY / ROOM 04",
      title: "The piece nobody agrees on",
      arrival: "The room is almost empty. One strange work remains lit.",
      objects: [
        {
          key: "artwork",
          icon: "◇",
          label: "Untitled, maybe",
          note: "Disagreement is useful here: the agents can reveal taste without scoring each other.",
          x: 50,
          y: 18,
        },
        COMMON_OBJECTS.note,
        COMMON_OBJECTS.exit,
      ],
    };
  }
  return {
    key: "cafe",
    kicker: "CORNER TABLE / 20:10",
    title: "The café after the rush",
    arrival:
      "The music is low, the window is fogging and nobody needs to hurry.",
    objects: [
      {
        key: "table",
        icon: "○",
        label: "Corner table",
        note: "The social center of the room: close enough to talk, with space to breathe.",
        x: 51,
        y: 43,
      },
      {
        key: "jukebox",
        icon: "♫",
        label: "One-song jukebox",
        note: "An interactive prompt that can change the mood without taking over the date.",
        x: 18,
        y: 25,
      },
      COMMON_OBJECTS.exit,
    ],
  };
}

const MOMENTS = [
  { a: [13, 77], b: [87, 23], label: "arriving" },
  { a: [34, 68], b: [66, 44], label: "finding each other" },
  { a: [41, 61], b: [59, 46], label: "settling in" },
  { a: [38, 48], b: [62, 54], label: "getting curious" },
  { a: [43, 55], b: [57, 47], label: "staying with the question" },
  { a: [35, 43], b: [65, 57], label: "testing the edges" },
  { a: [45, 51], b: [55, 51], label: "one honest minute" },
] as const;

const EMOTES = ["✦", "?", "☕", "…", "↗", "♡"];

export function AgentDateWorld({
  setting,
  sourceTitle,
  status,
  mine,
  counterpart,
  turns,
  liveActivity,
}: {
  setting: string;
  sourceTitle?: string;
  status: string;
  mine: WorldPerson;
  counterpart: WorldPerson;
  turns: WorldTurn[];
  liveActivity?: string;
}) {
  const { t } = useI18n();
  const theme = worldThemeFor(`${setting} ${sourceTitle ?? ""}`);
  const complete = !["queued", "running"].includes(status);
  const [selectedMoment, setSelectedMoment] = useState<number | null>(() =>
    complete && turns.length > 0 ? 0 : null,
  );
  const [playing, setPlaying] = useState(() => complete && turns.length > 0);
  const [activeObject, setActiveObject] = useState(theme.objects[0]?.key);
  const maxMoment = turns.length;
  const moment = Math.min(selectedMoment ?? turns.length, maxMoment);

  useEffect(() => {
    if (!playing) return;
    if (moment >= maxMoment) return;
    const next = moment + 1;
    const timer = window.setTimeout(() => {
      setSelectedMoment(next);
      if (next >= maxMoment) setPlaying(false);
    }, 1450);
    return () => window.clearTimeout(timer);
  }, [maxMoment, moment, playing]);

  const current = moment > 0 ? turns[moment - 1] : null;
  const positions = MOMENTS[Math.min(moment, MOMENTS.length - 1)];
  const selectedObject = theme.objects.find(
    (item) => item.key === activeObject,
  );

  function replay() {
    setSelectedMoment(0);
    setPlaying(true);
  }

  return (
    <section className={`agent-world agent-world-${theme.key}`}>
      <header className="agent-world-header">
        <div>
          <div className="docket-label">{t(theme.kicker)}</div>
          <h2>{t(theme.title)}</h2>
          <p>{t(theme.arrival)}</p>
        </div>
        <div className="agent-world-status">
          <span className={!complete ? "is-live" : ""} />
          {complete
            ? t("memory available")
            : liveActivity ?? t("happening now")}
        </div>
      </header>

      <div
        className="agent-world-stage"
        role="region"
        aria-label={t("{mine} and {counterpart} in {place}", {
          mine: mine.name,
          counterpart: counterpart.name,
          place: t(theme.title),
        })}
      >
        <div className="agent-world-wall agent-world-wall-north" />
        <div className="agent-world-wall agent-world-wall-west" />
        <div className="agent-world-window">
          <i />
          <i />
          <span>20:10</span>
        </div>
        <div className="agent-world-rug" />
        <div className="agent-world-path" />

        {theme.objects.map((object) => (
          <button
            key={object.key}
            type="button"
            className="agent-world-object"
            style={
              {
                "--object-x": `${object.x}%`,
                "--object-y": `${object.y}%`,
              } as CSSProperties
            }
            aria-label={t("Inspect {object}", { object: t(object.label) })}
            aria-pressed={activeObject === object.key}
            onClick={() => setActiveObject(object.key)}
          >
            <b>{object.icon}</b>
            <span>{t(object.label)}</span>
          </button>
        ))}

        <AgentWorldSprite
          person={mine}
          position={positions.a}
          side="a"
          speaking={current?.speakerAgentName === mine.name}
          emote={
            current?.speakerAgentName === mine.name
              ? EMOTES[(moment - 1) % EMOTES.length]
              : undefined
          }
        />
        <AgentWorldSprite
          person={counterpart}
          position={positions.b}
          side="b"
          speaking={current?.speakerAgentName === counterpart.name}
          emote={
            current?.speakerAgentName === counterpart.name
              ? EMOTES[(moment - 1) % EMOTES.length]
              : undefined
          }
        />

        <div
          className={`agent-world-moment ${
            current?.speakerAgentName === mine.name ? "is-side-a" : "is-side-b"
          }`}
          aria-live="polite"
        >
          <span>
            {moment === 0
              ? t("ARRIVAL")
              : t("MOMENT {number} · {label}", {
                  number: `0${moment}`,
                  label: t(positions.label),
                })}
          </span>
          <strong>
            {current?.speakerAgentName ?? t("Two Agents enter separately")}
          </strong>
          <p>
            {current?.content ??
              t(
                "Two proxies enter with separate briefs and no contact details.",
              )}
          </p>
        </div>

        {selectedObject && (
          <div className="agent-world-object-note">
            <span>{t("NEARBY OBJECT")}</span>
            <strong>{t(selectedObject.label)}</strong>
            <p>{t(selectedObject.note)}</p>
          </div>
        )}
      </div>

      <footer className="agent-world-controls">
        <button
          type="button"
          className="agent-world-play"
          onClick={replay}
          disabled={turns.length === 0}
        >
          {playing ? t("replaying…") : t("replay the date")}{" "}
          <span aria-hidden>↻</span>
        </button>
        <div
          className="agent-world-timeline"
          aria-label={t("Date replay moments")}
        >
          {Array.from({ length: maxMoment + 1 }, (_, index) => (
            <button
              type="button"
              key={index}
              aria-label={
                index === 0
                  ? t("Arrival")
                  : t("Moment {number}", { number: index })
              }
              aria-pressed={moment === index}
              onClick={() => {
                setPlaying(false);
                setSelectedMoment(index);
              }}
            >
              {index === 0 ? "A" : index}
            </button>
          ))}
        </div>
        <span>{t("{count}/6 memories", { count: turns.length })}</span>
      </footer>
    </section>
  );
}

const TRAVEL_MS = 780;

export function AgentWorldSprite({
  person,
  position,
  side,
  speaking = false,
  emote,
  className = "",
  displayName,
}: {
  person: WorldPerson;
  position?: readonly [number, number];
  side?: "a" | "b";
  speaking?: boolean;
  emote?: string;
  className?: string;
  displayName?: string;
}) {
  const { t } = useI18n();
  const avatar = avatarForName(person.name, person.avatar);
  const [walking, setWalking] = useState(false);
  const x = position?.[0];
  const y = position?.[1];
  const previous = useRef<string | undefined>(undefined);
  useEffect(() => {
    const next = x === undefined || y === undefined ? undefined : `${x},${y}`;
    const changed = previous.current !== undefined && next !== undefined && previous.current !== next;
    previous.current = next;
    if (!changed) {
      setWalking(false);
      return;
    }
    setWalking(true);
    const timer = window.setTimeout(() => setWalking(false), TRAVEL_MS);
    return () => window.clearTimeout(timer);
  }, [x, y]);
  return (
    <span
      className={`agent-world-sprite palette-${avatar.palette} hair-${avatar.hair} outfit-${avatar.outfit} ${speaking ? "is-speaking" : ""} ${walking ? "is-walking" : ""} ${className}`}
      style={
        {
          ...(position
            ? {
                "--sprite-x": `${position[0]}%`,
                "--sprite-y": `${position[1]}%`,
              }
            : {}),
          "--sprite-travel-duration": `${TRAVEL_MS}ms`,
        } as CSSProperties
      }
      role="img"
      aria-label={
        speaking
          ? t("{agent}, speaking", { agent: person.name })
          : person.name
      }
      data-side={side}
    >
      {emote && <i className="agent-world-emote">{emote}</i>}
      <span className="agent-world-sprite-art-frame" aria-hidden="true">
        <AgentCharacter
          name={person.name}
          avatar={avatar}
          className="agent-world-sprite-art"
        />
      </span>
      <span className="agent-world-sprite-shadow" />
      <strong>{displayName ?? person.name}</strong>
    </span>
  );
}

export function AgentHomeWorld({ person }: { person: WorldPerson }) {
  const { t } = useI18n();
  return (
    <div
      className="agent-home-world"
      role="group"
      aria-label={t("{agent}'s private room", { agent: person.name })}
    >
      <div className="agent-home-glow agent-home-glow-left" />
      <div className="agent-home-glow agent-home-glow-right" />
      <div className="agent-home-window">
        <b />
        <i />
        <i />
        <span>{t("PRIVATE ROOM")}</span>
      </div>
      <div className="agent-home-rug">
        <i />
      </div>
      <div className="agent-home-brief" aria-hidden="true">
        <span>{t("PRIVATE BRIEF")}</span>
        <i />
        <i />
        <i />
        <b>{t("SEALED")}</b>
      </div>
      <div className="agent-home-shelf" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="agent-home-portal">
        <div className="agent-home-portal-sky" aria-hidden="true">
          <i />
          <i />
          <i />
          <b />
        </div>
        <div className="agent-home-portal-copy">
          <small>{t("NEXT STOP")}</small>
          <strong>{t("AGENT WORLD")}</strong>
          <span aria-hidden="true">→</span>
        </div>
      </div>
      <div className="agent-home-trail" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <AgentWorldSprite
        person={person}
        className="agent-home-sprite"
        displayName={t("Your Agent")}
      />
      <div className="agent-home-presence">
        <i /> {t("ready to scout")}
      </div>
    </div>
  );
}
