import { useCallback, useState } from "react";
import {
  AVATAR_OPTIONS,
  AgentAvatar,
  DEFAULT_AVATAR,
  spriteForAvatar,
  type AvatarConfig,
} from "../components/agent/AgentAvatar";
import { Button, Select } from "../components/ui/primitives";
import {
  RIVE_ACTIVITY,
  RIVE_VERDICT,
  RiveAgent,
  type RiveActivity,
  type RiveAgentTriggers,
  type RiveVerdict,
} from "../components/agent/RiveAgent";

/**
 * Dev-only comparison bench: the static v2 PNG sprite, the SVG avatar and the
 * rigged Rive agent side by side, driven by the same editor controls.
 * Mounted at /lab/avatar in development builds only.
 */
const LAB_LABEL =
  "flex flex-col gap-1 text-xs uppercase tracking-wide text-[var(--text-muted)]";

export default function AvatarLabPage() {
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [activity, setActivity] = useState<RiveActivity>("idle");
  const [verdict, setVerdict] = useState<RiveVerdict>("none");
  const [speaking, setSpeaking] = useState(false);
  const [triggers, setTriggers] = useState<RiveAgentTriggers | null>(null);
  const onReady = useCallback((t: RiveAgentTriggers) => setTriggers(t), []);

  const select = <K extends keyof AvatarConfig>(key: K) => (
    <label key={key} className={LAB_LABEL}>
      {key}
      <Select
        compact
        className="normal-case"
        value={avatar[key] ?? ""}
        onChange={(event) =>
          setAvatar((prev) => ({ ...prev, [key]: event.target.value }))
        }
      >
        {AVATAR_OPTIONS[key].map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </label>
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 bg-[var(--bg)] px-6 py-10 text-[var(--text)]">
      <header>
        <h1 className="font-serif text-3xl">Avatar lab</h1>
        <p className="text-sm text-[var(--text-muted)]">
          PNG sprite (static) · SVG avatar (CSS idle) · Rive agent (rigged,
          data-bound). Same editor values drive all three.
        </p>
      </header>

      <section className="flex flex-wrap gap-4">
        {(["gender", "palette", "face", "hair", "outfit", "accessory"] as const).map(
          (key) => select(key),
        )}
        <label className={LAB_LABEL}>
          activity
          <Select
            compact
            className="normal-case"
            value={activity}
            onChange={(event) => setActivity(event.target.value as RiveActivity)}
          >
            {Object.keys(RIVE_ACTIVITY).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </label>
        <label className={LAB_LABEL}>
          verdict
          <Select
            compact
            className="normal-case"
            value={verdict}
            onChange={(event) => setVerdict(event.target.value as RiveVerdict)}
          >
            {Object.keys(RIVE_VERDICT).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </label>
        <div className="flex items-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            aria-pressed={speaking}
            onClick={() => setSpeaking((value) => !value)}
          >
            speaking: {speaking ? "on" : "off"}
          </Button>
          <Button size="sm" disabled={!triggers} onClick={() => triggers?.wave()}>
            wave
          </Button>
          <Button size="sm" disabled={!triggers} onClick={() => triggers?.arrive()}>
            arrive
          </Button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <figure className="flex flex-col items-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--bg-raised)] p-6">
          <img
            src={spriteForAvatar(avatar)}
            alt=""
            className="h-[384px] w-auto"
            draggable={false}
          />
          <figcaption className="text-sm text-[var(--text-muted)]">
            PNG sprite — gender, palette and expression; blink + breathe via CSS in the world
          </figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--bg-raised)] p-6">
          <AgentAvatar name="Juno" avatar={avatar} className="h-[256px] w-[224px]" />
          <figcaption className="text-sm text-[var(--text-muted)]">
            SVG avatar — full editor, CSS breathe + blink only
          </figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--bg-raised)] p-6">
          <RiveAgent
            avatar={avatar}
            activity={activity}
            speaking={speaking}
            verdict={verdict}
            onReady={onReady}
            className="h-[384px] w-[256px]"
          />
          <figcaption className="text-sm text-[var(--text-muted)]">
            Rive agent — full editor + idle/arrive/read/think/wander/wrap-up,
            wave, speaking, verdict
          </figcaption>
        </figure>
      </section>
    </main>
  );
}
