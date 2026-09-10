import { useEffect, useState, type CSSProperties } from "react";
import { AgentWorldSprite } from "./AgentDateWorld";

type Translate = (key: string) => string;

const FRAMES = ["Brief", "Agent date", "Private read", "Your call"] as const;

const YOUR_AGENT = {
  name: "Juno",
  avatar: {
    palette: "rose" as const,
    face: "gentle" as const,
    hair: "wave" as const,
    outfit: "cardigan" as const,
    accessory: "star" as const,
  },
};

const THEIR_AGENT = {
  name: "Sol",
  avatar: {
    gender: "male" as const,
    palette: "violet" as const,
    face: "curious" as const,
    hair: "crop" as const,
    outfit: "starlight" as const,
    accessory: "glasses" as const,
  },
};

export function AgentLoopPlayer({
  t,
  compact = false,
}: {
  t: Translate;
  compact?: boolean;
}) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(
      () => setFrame((current) => (current + 1) % FRAMES.length),
      compact ? 2_800 : 3_400,
    );
    return () => window.clearTimeout(timer);
  }, [compact, frame, playing]);

  const yourPosition = [
    [32, 72],
    [38, 72],
    [24, 72],
    [23, 72],
  ][frame] as [number, number];
  const theirPosition = [
    [86, 24],
    [67, 68],
    [88, 26],
    [88, 26],
  ][frame] as [number, number];

  function chooseFrame(index: number) {
    setFrame(index);
    setPlaying(false);
  }

  return (
    <section
      className={`agent-loop-player ${compact ? "is-compact" : ""}`}
      aria-label={t("How it works")}
    >
      <header className="agent-loop-toolbar">
        <div>
          <i aria-hidden="true" />
          <span>{t("LIVE / SIMULATION")}</span>
        </div>
        <button
          type="button"
          onClick={() => setPlaying((current) => !current)}
          aria-label={playing ? t("Pause preview") : t("Play preview")}
        >
          {playing ? "Ⅱ" : "▶"}
        </button>
      </header>

      <div
        className={`agent-loop-stage is-frame-${frame}`}
        style={{ "--loop-progress": `${(frame + 1) * 25}%` } as CSSProperties}
      >
        <div className="agent-loop-grid" aria-hidden="true" />
        <div className="agent-loop-window" aria-hidden="true">
          <i />
          <span>{frame === 1 ? t("virtual world") : t("private memory")}</span>
        </div>
        <div className="agent-loop-rug" aria-hidden="true" />
        <div className="agent-loop-exit" aria-hidden="true">
          ↗
        </div>

        <AgentWorldSprite
          person={YOUR_AGENT}
          displayName="Juno"
          position={yourPosition}
          side="a"
          speaking={frame === 1 || frame === 3}
          emote={frame === 0 ? "?" : frame === 2 ? "✦" : undefined}
          className="agent-loop-sprite is-yours"
        />
        <AgentWorldSprite
          person={THEIR_AGENT}
          displayName="Sol"
          position={theirPosition}
          side="b"
          speaking={frame === 1}
          className="agent-loop-sprite is-theirs"
        />

        <div className="agent-loop-brief" aria-hidden={frame !== 0}>
          <small>{t("PRIVATE / FOR YOU")}</small>
          <b>“{t("I want warmth without having to perform confidence.")}”</b>
          <span>
            <i />
            <i />
            <i />
          </span>
          <em>{t("private memory")}</em>
        </div>

        <div className="agent-loop-date-chat" aria-hidden={frame !== 1}>
          <p>
            <b>Juno</b>
            {t("I get playful once I feel safe.")}
          </p>
          <p>
            <b>Sol</b>
            {t("I go quiet when I'm happy, actually.")}
          </p>
          <span className="agent-loop-typing" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>

        <div className="agent-loop-report" aria-hidden={frame !== 2}>
          <header>
            <span>{t("PRIVATE / FOR YOU")}</span>
            <b>✦</b>
          </header>
          <strong>{t("I noticed a real spark.")}</strong>
          <p>{t("But ask about the pace.")}</p>
          <div>
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>

        <div className="agent-loop-choice" aria-hidden={frame !== 3}>
          <div className="agent-loop-mini-chat">
            <p>
              <span>{t("YOU")}</span>
              {t("Here's what your debrief got wrong:")}
            </p>
            <p>
              <span>Juno</span>
              {t("What should you carry into the next search?")}
            </p>
          </div>
          <div className="agent-loop-consent">
            <span>
              <small>{t("YOU")}</small>
              <b>{t("YES")}</b>
            </span>
            <i>♡</i>
            <span>
              <small>{t("THEM")}</small>
              <b>{t("SEALED")}</b>
            </span>
            <em>{t("contact locked")}</em>
          </div>
        </div>
      </div>

      <nav className="agent-loop-scenes" aria-label={t("How it works")}>
        {FRAMES.map((label, index) => (
          <button
            key={label}
            type="button"
            className={frame === index ? "is-active" : ""}
            aria-pressed={frame === index}
            onClick={() => chooseFrame(index)}
          >
            <span>0{index + 1}</span>
            <b>{t(label)}</b>
          </button>
        ))}
      </nav>
    </section>
  );
}
