import { useId, type CSSProperties } from "react";
import type { AvatarConfig } from "./AgentAvatar";

type Paint = { background: string; glow: string; primary: string; deep: string; ink: string };
const ASSETS = "/agents/pixel-v1";

/** One set of interchangeable pixel illustrations supplies every avatar view.
 * Clothing masks are the only images recolored; faces and skin stay original. */
export function AgentCharacterArt({ config, colors, fullBody = false, className = "", motionDelay = 0 }: {
  config: AvatarConfig;
  colors: Paint;
  fullBody?: boolean;
  className?: string;
  motionDelay?: number;
}) {
  const id = `character-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const paint = (part: string) => `url(#${id}-${part})`;
  const gender = config.gender === "male" ? "male" : "female";
  const head = `${gender}-${config.hair}-${config.face}`;
  const body = `${gender}-${config.outfit}`;
  const channel = (offset: number) => [colors.ink, colors.deep, colors.primary, colors.glow]
    .map((color) => (parseInt(color.slice(offset, offset + 2), 16) / 255).toFixed(4)).join(" ");
  const bodyImage = (pose: string) => <>
    <image href={`${ASSETS}/${body}-${pose}.png`} width="320" height="660" />
    <image href={`${ASSETS}/${body}-${pose}-dye.png`} width="320" height="660" filter={paint("dye")} />
  </>;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={fullBody ? "0 36 320 624" : "0 36 320 400"}
      className={`agent-character-art pixel-character ${className}`.trim()} focusable="false" aria-hidden="true"
      style={{ "--character-delay": `${-motionDelay}s` } as CSSProperties}
      data-character-gender={gender} data-character-hair={config.hair}
      data-character-outfit={config.outfit} data-character-accessory={config.accessory}
      data-character-face={config.face} data-character-view={fullBody ? "figure" : "portrait"}>
      <defs>
        <linearGradient id={`${id}-back`} x2=".9" y2="1"><stop stopColor={colors.glow} /><stop offset="1" stopColor={colors.background} /></linearGradient>
        <radialGradient id={`${id}-halo`}><stop stopColor="#fffdf8" stopOpacity=".8" /><stop offset="1" stopColor="#fffdf8" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${id}-ground`}><stop stopColor="#51465e" stopOpacity=".18" /><stop offset="1" stopColor="#51465e" stopOpacity="0" /></radialGradient>
        <clipPath id={`${id}-frame`}><rect x="8" y="44" width="304" height="384" rx="76" /></clipPath>
        <clipPath id={`${id}-eyes`}>
          <ellipse cx="127" cy="160" rx="20" ry="14" />
          <ellipse cx="184" cy="153" rx="22" ry="14" />
        </clipPath>
        <clipPath id={`${id}-upper`}><rect width="320" height="444" /></clipPath>
        <filter id={`${id}-dye`} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
          <feComponentTransfer>
            <feFuncR type="table" tableValues={channel(1)} />
            <feFuncG type="table" tableValues={channel(3)} />
            <feFuncB type="table" tableValues={channel(5)} />
          </feComponentTransfer>
        </filter>
      </defs>
      {!fullBody && <g data-character-layer="backdrop">
        <rect x="8" y="44" width="304" height="384" rx="76" fill={paint("back")} />
        <ellipse cx="150" cy="207" rx="125" ry="148" fill={paint("halo")} />
        <rect x="13" y="49" width="294" height="374" rx="72" stroke="white" strokeOpacity=".7" fill="none" />
      </g>}
      <g clipPath={fullBody ? undefined : paint("frame")}>
        {fullBody && <ellipse cx="160" cy="635" rx="75" ry="10" fill={paint("ground")} />}
        <g data-character-layer="outfit">
          <g className="pixel-standing">{bodyImage("idle")}</g>
          {fullBody && <g className="pixel-walking" visibility="hidden">
            <g clipPath={paint("upper")}>{bodyImage("idle")}</g>
            <g className="pixel-leg pixel-leg-left">
              <image href={`${ASSETS}/${body}-leg-left.png`} width="320" height="660" />
            </g>
            <g className="pixel-leg pixel-leg-right">
              <image href={`${ASSETS}/${body}-leg-right.png`} width="320" height="660" />
            </g>
          </g>}
        </g>
        {config.accessory === "scarf" && <g data-character-layer="accessory">
          <image href={`${ASSETS}/accessory-scarf.png`} x="108" y="213" width="105" height="133" />
        </g>}
        {/* Align the three-quarter jaw with the body's neck, and scale
            wearables with the head so their anchors stay together. */}
        <g transform={`translate(${gender === "male" ? 152 : 154} 230) scale(.76) translate(-160 -228)`}>
        <g className="character-look"><g className="character-head">
          <g data-character-layer="head">
            <image href={`${ASSETS}/${head}.png`} width="320" height="280" />
            <g className="pixel-blink" opacity="0" clipPath={paint("eyes")}>
              <image href={`${ASSETS}/${gender}-${config.hair}-blink.png`} width="320" height="280" />
            </g>
          </g>
          {config.accessory !== "none" && config.accessory !== "scarf" && <g data-character-layer="accessory">
            {config.accessory === "glasses" && <image href={`${ASSETS}/accessory-glasses.png`} x="105" y="143" width="110" height="31" />}
            {config.accessory === "headphones" && <image href={`${ASSETS}/accessory-headphones.png`} x="70" y="49" width="180" height="174" />}
            {config.accessory === "star" && <image href={`${ASSETS}/accessory-star.png`} x="209" y="114" width="34" height="26" />}
          </g>}
        </g></g>
        </g>
      </g>
    </svg>
  );
}
