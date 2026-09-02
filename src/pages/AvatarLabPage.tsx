import { useCallback, useState } from "react";
import {
  AVATAR_OPTIONS,
  AgentAvatar,
  DEFAULT_AVATAR,
  spriteForAvatar,
  type AvatarConfig,
} from "../components/agent/AgentAvatar";
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
export default function AvatarLabPage() {
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [activity, setActivity] = useState<RiveActivity>("idle");
  const [verdict, setVerdict] = useState<RiveVerdict>("none");
  const [speaking, setSpeaking] = useState(false);
  const [triggers, setTriggers] = useState<RiveAgentTriggers | null>(null);
  const onReady = useCallback((t: RiveAgentTriggers) => setTriggers(t), []);

  const select = <K extends keyof AvatarConfig>(key: K) => (
    <label key={key} className="flex flex-col gap-1 text-xs uppercase tracking-wide text-stone-500">
      {key}
      <select
        className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm normal-case text-stone-900"
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
      </select>
    </label>
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 bg-stone-50 px-6 py-10 text-stone-900">
      <header>
        <h1 className="font-serif text-3xl">Avatar lab</h1>
        <p className="text-sm text-stone-600">
          PNG sprite (static) · SVG avatar (CSS idle) · Rive agent (rigged,
          data-bound). Same editor values drive all three.
        </p>
      </header>

      <section className="flex flex-wrap gap-4">
        {(["gender", "palette", "face", "hair", "outfit", "accessory"] as const).map(
          (key) => select(key),
        )}
        <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-stone-500">
          activity
          <select
            className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm normal-case text-stone-900"
            value={activity}
            onChange={(event) => setActivity(event.target.value as RiveActivity)}
          >
            {Object.keys(RIVE_ACTIVITY).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-stone-500">
          verdict
          <select
            className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm normal-case text-stone-900"
            value={verdict}
            onChange={(event) => setVerdict(event.target.value as RiveVerdict)}
          >
            {Object.keys(RIVE_VERDICT).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="rounded-full border border-stone-300 bg-white px-3 py-1 text-sm"
            onClick={() => setSpeaking((value) => !value)}
          >
            speaking: {speaking ? "on" : "off"}
          </button>
          <button
            type="button"
            className="rounded-full bg-stone-900 px-3 py-1 text-sm text-white disabled:opacity-40"
            disabled={!triggers}
            onClick={() => triggers?.wave()}
          >
            wave
          </button>
          <button
            type="button"
            className="rounded-full bg-stone-900 px-3 py-1 text-sm text-white disabled:opacity-40"
            disabled={!triggers}
            onClick={() => triggers?.arrive()}
          >
            arrive
          </button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <figure className="flex flex-col items-center gap-3 rounded-3xl border border-stone-200 bg-white p-6">
          <img
            src={spriteForAvatar(avatar)}
            alt=""
            className="h-[384px] w-auto"
            draggable={false}
          />
          <figcaption className="text-sm text-stone-600">
            PNG sprite — gender, palette and expression; blink + breathe via CSS in the world
          </figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-3 rounded-3xl border border-stone-200 bg-white p-6">
          <AgentAvatar name="Juno" avatar={avatar} className="h-[256px] w-[224px]" />
          <figcaption className="text-sm text-stone-600">
            SVG avatar — full editor, CSS breathe + blink only
          </figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-3 rounded-3xl border border-stone-200 bg-white p-6">
          <RiveAgent
            avatar={avatar}
            activity={activity}
            speaking={speaking}
            verdict={verdict}
            onReady={onReady}
            className="h-[384px] w-[256px]"
          />
          <figcaption className="text-sm text-stone-600">
            Rive agent — full editor + idle/arrive/read/think/wander/wrap-up,
            wave, speaking, verdict
          </figcaption>
        </figure>
      </section>
    </main>
  );
}
