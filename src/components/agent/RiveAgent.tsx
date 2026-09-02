/* oxlint-disable react/only-export-components -- the runtime owns its input contract */
import { useEffect, useMemo, useState } from "react";
import {
  Alignment,
  Fit,
  Layout,
  useRive,
  useViewModelInstanceBoolean,
  useViewModelInstanceColor,
  useViewModelInstanceEnum,
  useViewModelInstanceNumber,
  useViewModelInstanceTrigger,
} from "@rive-app/react-canvas";
import { spritePathFor } from "@convex/lib/agentAvatar";
import { PALETTES, type AvatarConfig } from "./AgentAvatar";

/** Values of the `activity` number input on the Rive `Agent` view model. */
export const RIVE_ACTIVITY = {
  idle: 0,
  reading: 2,
  thinking: 3,
  wandering: 4,
  wrapping_up: 5,
} as const;
export type RiveActivity = keyof typeof RIVE_ACTIVITY;

/** Values of the `verdict` number input. */
export const RIVE_VERDICT = {
  none: 0,
  encourage: 1,
  curious: 2,
  pass: 3,
} as const;
export type RiveVerdict = keyof typeof RIVE_VERDICT;

export type RiveAgentTriggers = {
  wave: () => void;
  arrive: () => void;
};

export const AGENT_RIVE_SRC = "/agents/agent.riv";
const STATE_MACHINE = "State Machine 1";

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/**
 * The rigged Rive agent. Mirrors the avatar editor (palette, face, hair,
 * outfit, accessory) through data binding and reacts to the live date state
 * through `activity`, `speaking`, `verdict` and the `wave` / `arrive`
 * triggers. Falls back to the static PNG sprite when the `.riv` cannot load.
 */
export function RiveAgent({
  avatar,
  activity = "idle",
  speaking = false,
  verdict = "none",
  className = "",
  onReady,
}: {
  avatar: AvatarConfig;
  activity?: RiveActivity;
  speaking?: boolean;
  verdict?: RiveVerdict;
  className?: string;
  onReady?: (triggers: RiveAgentTriggers) => void;
}) {
  const [failed, setFailed] = useState(false);
  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const { rive, RiveComponent } = useRive({
    src: AGENT_RIVE_SRC,
    stateMachines: STATE_MACHINE,
    autoplay: !reducedMotion,
    autoBind: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.BottomCenter }),
    onLoadError: () => setFailed(true),
  });
  const instance = rive?.viewModelInstance ?? null;

  const hair = useViewModelInstanceEnum("hair", instance);
  const face = useViewModelInstanceEnum("face", instance);
  const outfit = useViewModelInstanceEnum("outfit", instance);
  const accessory = useViewModelInstanceEnum("accessory", instance);
  const background = useViewModelInstanceColor("background", instance);
  const glow = useViewModelInstanceColor("glow", instance);
  const primary = useViewModelInstanceColor("primary", instance);
  const deep = useViewModelInstanceColor("deep", instance);
  const ink = useViewModelInstanceColor("ink", instance);
  const activityInput = useViewModelInstanceNumber("activity", instance);
  const speakingInput = useViewModelInstanceBoolean("speaking", instance);
  const verdictInput = useViewModelInstanceNumber("verdict", instance);
  const wave = useViewModelInstanceTrigger("wave", instance);
  const arrive = useViewModelInstanceTrigger("arrive", instance);

  useEffect(() => {
    if (!instance) return;
    hair.setValue(avatar.hair);
    face.setValue(avatar.face);
    outfit.setValue(avatar.outfit);
    accessory.setValue(avatar.accessory);
    // The setters are stable per instance; re-run only when the look changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, avatar.hair, avatar.face, avatar.outfit, avatar.accessory]);

  useEffect(() => {
    if (!instance) return;
    const colors = PALETTES[avatar.palette];
    background.setRgb(...hexToRgb(colors.background));
    glow.setRgb(...hexToRgb(colors.glow));
    primary.setRgb(...hexToRgb(colors.primary));
    deep.setRgb(...hexToRgb(colors.deep));
    ink.setRgb(...hexToRgb(colors.ink));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, avatar.palette]);

  useEffect(() => {
    if (!instance) return;
    activityInput.setValue(RIVE_ACTIVITY[activity]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, activity]);

  useEffect(() => {
    if (!instance) return;
    speakingInput.setValue(speaking);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, speaking]);

  useEffect(() => {
    if (!instance) return;
    verdictInput.setValue(RIVE_VERDICT[verdict]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, verdict]);

  useEffect(() => {
    if (!instance || !onReady) return;
    onReady({ wave: wave.trigger, arrive: arrive.trigger });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, onReady]);

  if (failed) {
    return (
      <img
        src={spritePathFor(avatar.palette, avatar.face)}
        alt=""
        className={className}
        draggable={false}
      />
    );
  }
  return <RiveComponent className={className} />;
}
