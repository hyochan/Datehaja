import { useId, type CSSProperties } from "react";
import type { AvatarConfig } from "./AgentAvatar";

type Paint = { background: string; glow: string; primary: string; deep: string; ink: string };
type PartProps = { config: AvatarConfig; colors: Paint; id: string };

/** A shallow, articulated character: all views use the same editable parts.
 * Light comes from the upper left; the warm bounce and cool occlusion are
 * painted separately so the face, hair and tailoring read as rounded forms. */
export function AgentCharacterArt({ config, colors, fullBody = false, className = "", motionDelay = 0 }: PartPropsWithoutId & {
  fullBody?: boolean;
  className?: string;
  motionDelay?: number;
}) {
  const id = `character-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const paint = (part: string) => `url(#${id}-${part})`;
  const woman = config.gender !== "male";
  const parts = { config, colors, id };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={fullBody ? "0 0 320 800" : "0 0 320 400"}
      className={`agent-character-art ${className}`.trim()} focusable="false" aria-hidden="true"
      style={{ "--character-delay": `${-motionDelay}s` } as CSSProperties}
      data-character-gender={woman ? "female" : "male"} data-character-hair={config.hair}
      data-character-outfit={config.outfit} data-character-accessory={config.accessory}
      data-character-face={config.face} data-character-view={fullBody ? "figure" : "portrait"}>
      <CharacterPaint {...parts} />
      {!fullBody && <g data-character-layer="backdrop">
        <rect x="8" y="8" width="304" height="384" rx="76" fill={paint("back")} />
        <ellipse cx="150" cy="171" rx="125" ry="148" fill={paint("halo")} />
        <path d="M36 329c62-36 184-38 249-2" fill="none" stroke={colors.primary} strokeOpacity=".13" />
        <rect x="13" y="13" width="294" height="374" rx="72" stroke="white" strokeOpacity=".7" fill="none" />
      </g>}
      <g clipPath={fullBody ? undefined : paint("frame")}>
        {fullBody && <>
          <g data-character-layer="ground-shadow">
            <ellipse cx="160" cy="788" rx="91" ry="9" fill={paint("ground")} />
            <ellipse cx="113" cy="784" rx="31" ry="5" fill={paint("ground")} />
            <ellipse cx="207" cy="784" rx="31" ry="5" fill={paint("ground")} />
          </g>
          <Legs {...parts} />
        </>}
        <g className="character-head-position" transform={fullBody ? "translate(16 23) scale(.9)" : undefined}>
          <g className="character-look"><g className="character-head"><Hair {...parts} back /></g></g>
        </g>
        <g className="character-torso">
          <Clothing {...parts} />
          <path d="M139 196h45l7 56c-13 20-48 20-62 0Z" fill={paint("neck")} />
          <path d="M139 202c11 21 28 30 48 27l-3-32Z" fill="#70413e" opacity=".24" />
          <Collar {...parts} />
          {config.accessory === "scarf" && <g data-character-layer="accessory">
            <path d="M127 241c13 15 45 21 67 0l9 23c-17 20-57 22-83 0Z" fill={paint("scarf")} />
            <path d="m163 274 19-4 14 117-29 4-14-112Z" fill={paint("scarf")} />
            <path d="M127 253c20 16 49 16 70 0m-31 32 13 91" fill="none" stroke={colors.glow} strokeWidth="2" opacity=".6" />
          </g>}
        </g>
        <g className="character-head-position" transform={fullBody ? "translate(16 23) scale(.9)" : undefined}>
          <g className="character-look"><g className="character-head">
            <Face {...parts} />
            <Hair {...parts} />
            <Accessories {...parts} />
          </g></g>
        </g>
      </g>
    </svg>
  );
}
type PartPropsWithoutId = Omit<PartProps, "id">;

function CharacterPaint({ colors, config, id }: PartProps) {
  const woman = config.gender !== "male";
  return <defs>
    <linearGradient id={`${id}-back`} x1="0" y1="0" x2=".9" y2="1">
      <stop stopColor={colors.glow} /><stop offset=".6" stopColor={colors.background} /><stop offset="1" stopColor={colors.primary} stopOpacity=".5" />
    </linearGradient>
    <radialGradient id={`${id}-halo`}><stop stopColor="#fffdf7" stopOpacity=".94" /><stop offset=".75" stopColor={colors.glow} stopOpacity=".35" /><stop offset="1" stopColor={colors.glow} stopOpacity="0" /></radialGradient>
    <radialGradient id={`${id}-skin`} cx=".29" cy=".26" r=".88" fx=".3" fy=".24">
      <stop stopColor="#fff1e3" /><stop offset=".32" stopColor="#f6d2b8" /><stop offset=".62" stopColor="#e9b194" /><stop offset=".84" stopColor="#ce8c76" /><stop offset="1" stopColor="#a66560" />
    </radialGradient>
    <radialGradient id={`${id}-light`}><stop stopColor="#fff8df" stopOpacity=".75" /><stop offset="1" stopColor="#fff8df" stopOpacity="0" /></radialGradient>
    <radialGradient id={`${id}-blush`}><stop stopColor="#d76564" stopOpacity={woman ? ".3" : ".15"} /><stop offset="1" stopColor="#df8674" stopOpacity="0" /></radialGradient>
    <radialGradient id={`${id}-socket`}><stop stopColor="#85504b" stopOpacity=".42" /><stop offset="1" stopColor="#ae7366" stopOpacity="0" /></radialGradient>
    <linearGradient id={`${id}-neck`} x1=".15" y1="0" x2=".9" y2=".7"><stop stopColor="#e9b093" /><stop offset=".45" stopColor="#f3c6a7" /><stop offset="1" stopColor="#b87769" /></linearGradient>
    <linearGradient id={`${id}-nose`} x1="0" x2="1" y2=".1"><stop stopColor="#e6a28a" /><stop offset=".35" stopColor="#ffe1bc" /><stop offset=".68" stopColor="#f2bca0" /><stop offset="1" stopColor="#ba7c68" /></linearGradient>
    <radialGradient id={`${id}-hair`} cx=".25" cy=".15" r=".96"><stop stopColor={woman ? "#a07358" : "#696475"} /><stop offset=".29" stopColor={woman ? "#654337" : "#393644"} /><stop offset=".6" stopColor={woman ? "#35262a" : "#22222d"} /><stop offset="1" stopColor="#171621" /></radialGradient>
    <linearGradient id={`${id}-hair-sheen`} x1="0" y1=".1" x2="1" y2=".7"><stop stopColor="#ecc39a" stopOpacity=".55" /><stop offset=".48" stopColor="#b18470" stopOpacity=".15" /><stop offset="1" stopColor="#675d76" stopOpacity=".03" /></linearGradient>
    <linearGradient id={`${id}-coat`} x1="0" y1=".12" x2="1" y2=".65"><stop stopColor={colors.background} /><stop offset=".28" stopColor={colors.primary} /><stop offset=".65" stopColor={colors.primary} /><stop offset="1" stopColor={colors.deep} /></linearGradient>
    <linearGradient id={`${id}-lapel`} x1="0" x2="1" y2=".7"><stop stopColor={colors.primary} /><stop offset=".45" stopColor={colors.deep} /><stop offset="1" stopColor={colors.ink} /></linearGradient>
    <linearGradient id={`${id}-sleeve`} x1="0" x2="1"><stop stopColor={colors.deep} /><stop offset=".25" stopColor={colors.primary} /><stop offset=".55" stopColor={colors.primary} /><stop offset="1" stopColor={colors.deep} /></linearGradient>
    <linearGradient id={`${id}-shirt`} x1="0" x2="1" y2=".6"><stop stopColor="#fffdf1" /><stop offset=".55" stopColor="#f1e8d9" /><stop offset="1" stopColor="#c9b7aa" /></linearGradient>
    <linearGradient id={`${id}-pants`} x1="0" x2="1"><stop stopColor={woman ? "#b9aa9e" : colors.ink} /><stop offset=".3" stopColor={woman ? "#f3ede0" : colors.deep} /><stop offset=".5" stopColor={woman ? "#ede3d3" : colors.primary} /><stop offset="1" stopColor={woman ? "#a29692" : colors.ink} /></linearGradient>
    <linearGradient id={`${id}-scarf`} x1="0" x2="1" y2=".4"><stop stopColor={colors.glow} /><stop offset=".4" stopColor={colors.background} /><stop offset="1" stopColor={colors.primary} /></linearGradient>
    <linearGradient id={`${id}-gold`} x1="0" x2="1" y2=".8"><stop stopColor="#fff0bf" /><stop offset=".3" stopColor="#d7b273" /><stop offset=".7" stopColor="#a27b49" /><stop offset="1" stopColor="#f6dfaa" /></linearGradient>
    <radialGradient id={`${id}-ground`}><stop stopColor="#302834" stopOpacity=".26" /><stop offset=".45" stopColor="#302834" stopOpacity=".16" /><stop offset="1" stopColor="#302834" stopOpacity="0" /></radialGradient>
    <linearGradient id={`${id}-buzz`} x1=".2" x2="1" y2=".7"><stop stopColor={woman ? "#68514a" : "#56505c"} /><stop offset="1" stopColor="#282631" /></linearGradient>
    <pattern id={`${id}-stubble`} width="4" height="4" patternUnits="userSpaceOnUse"><path d="m1 1 .5 1.3" stroke="#c6a994" strokeOpacity=".23" strokeWidth=".7" strokeLinecap="round" /></pattern>
    <radialGradient id={`${id}-iris`} cx=".4" cy=".7"><stop stopColor={woman ? "#ab895d" : "#829b92"} /><stop offset=".6" stopColor={woman ? "#655141" : "#4a6062"} /><stop offset="1" stopColor="#2d2831" /></radialGradient>
    <linearGradient id={`${id}-lip`} x2=".2" y2="1"><stop stopColor={woman ? "#a35c5b" : "#95635d"} /><stop offset=".5" stopColor={woman ? "#d88c82" : "#bd8b7a"} /><stop offset="1" stopColor="#efb5a0" /></linearGradient>
    <filter id={`${id}-soft`} x="-30%" y="-40%" width="160%" height="180%"><feGaussianBlur stdDeviation="2.3" /></filter>
    <filter id={`${id}-contact`} x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="1.5" dy="3" stdDeviation="2.2" floodColor="#312334" floodOpacity=".25" /></filter>
    <clipPath id={`${id}-frame`}><rect x="8" y="8" width="304" height="384" rx="76" /></clipPath>
    <clipPath id={`${id}-face`}><path d={faceShape(woman)} /></clipPath>
  </defs>;
}

function faceShape(woman: boolean) {
  return woman
    ? "M104 112c-2-35 17-63 53-64 37-1 63 25 62 62l-4 44c-3 25-18 48-37 60-8 5-14 7-20 6-22-5-44-29-49-54Z"
    : "M102 111c-1-36 20-65 57-65 39 0 63 27 61 65l-3 47c-2 20-10 36-23 47l-20 14q-17 9-34-1l-18-13c-13-12-21-28-23-48Z";
}

function Face({ config, id }: PartProps) {
  const woman = config.gender !== "male";
  const bright = config.face === "bright";
  const cool = config.face === "cool";
  const curious = config.face === "curious";
  const p = (part: string) => `url(#${id}-${part})`;
  const lid = cool ? "M116 136q14-7 32-1" : woman ? "M116 135q13-15 32-1" : "M116 135q14-11 32-1";
  const eye = `${lid}${cool ? "-13 13-32 1Z" : woman ? "-12 17-32 1Z" : "-13 14-32 1Z"}`;
  return <g data-character-layer="head">
    <ellipse cx="103" cy="149" rx="10" ry="18" fill={p("skin")} /><ellipse cx="217" cy="148" rx="9" ry="17" fill={p("skin")} />
    <path d="M101 141q-6 4 0 16m118-17q5 5-1 14" fill="none" stroke="#ad7468" strokeWidth="2" strokeLinecap="round" />
    <path d={faceShape(woman)} fill={p("skin")} />
    <g clipPath={p("face")}>
      <path d="M202 99c19 49 6 86-34 115 31 2 58-37 58-82Z" fill="#91626b" opacity=".19" filter={p("soft")} />
      <ellipse cx="135" cy="101" rx="40" ry="46" fill={p("light")} />
      <ellipse cx="126" cy="164" rx="22" ry="18" fill={p("light")} />
      <ellipse cx="119" cy="168" rx="24" ry="18" fill={p("blush")} /><ellipse cx="198" cy="167" rx="22" ry="17" fill={p("blush")} />
      <ellipse cx="132" cy="132" rx="24" ry="16" fill={p("socket")} /><ellipse cx="191" cy="132" rx="24" ry="16" fill={p("socket")} />
      <path d="M113 85c-2 23 22 35 53 20 20-10 30-2 44 22l4-42Z" fill="#624444" opacity=".13" filter={p("soft")} />
      {!woman && <path d="M111 176q14 28 48 39 25-11 48-40-4 28-40 48-37-8-56-47Z" fill="#775d63" opacity=".09" />}
    </g>
    <g className="character-face-direction">
      <g data-character-layer="brows" fill={woman ? "#543b36" : "#35303a"}>
        <path d={curious ? "M114 115q14-15 34-5l-2 4q-18-6-32 5Z" : cool ? "M115 120q16-6 34-1l-2 4q-19-3-32 0Z" : "M114 120q15-10 35-4l-2 4q-19-3-33 3Z"} />
        <path d={woman ? "M176 117q18-6 31 5l-1 2q-14-6-30-3Z" : "M174 116q20-5 34 7l-2 3q-16-7-32-4Z"} />
      </g>
      <g className="agent-avatar-eyes" data-character-layer="eyes">
        {[0, 1].map(side => <g key={side} transform={side ? "translate(322 0) scale(-1 1)" : undefined}>
          <defs><clipPath id={`${id}-eye-${side}`}><path d={eye} /></clipPath></defs>
          <path d={eye} fill="#fff9ef" />
          <g clipPath={p(`eye-${side}`)}>
            <g className="character-pupil" data-eye-reflection={side ? "right" : "left"}>
              <ellipse cx={curious ? "134" : "133"} cy="135" rx={woman ? "7" : "6.4"} ry="8.5" fill={p("iris")} />
              <ellipse cx={curious ? "134" : "133"} cy="134" rx="3.4" ry="5.1" fill="#24232c" />
              <circle cx={side ? "136" : "130.5"} cy="131.5" r="2.3" fill="#fff" />
            </g>
          </g>
          <path d={lid} stroke="#423039" strokeWidth={woman ? "2.7" : "2.2"} strokeLinecap="round" fill="none" />
          <path d="M120 141q12 7 25-1" stroke="#b97e70" strokeWidth="1.1" fill="none" opacity=".75" />
          {woman && <path d="m116 135-4-3" fill="none" stroke="#423039" strokeWidth="1.9" strokeLinecap="round" />}
        </g>)}
      </g>
      <g data-character-layer="nose">
        <path d="M162 140c8 6 4 15 13 25 2 6-7 11-16 7" fill="#a7685c" opacity=".3" filter={p("soft")} />
        <path d={woman ? "M158 135c0 14-2 20-5 30 2 8 15 10 20 2-6-6-8-20-8-30Z" : "M158 131c-1 17-3 26-6 35 3 9 17 10 22 1-6-10-9-26-9-35Z"} fill={p("nose")} />
        <path d="M156 169q3-2 5 0m7 0 2-1" stroke="#a16c62" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <ellipse cx="162" cy="160" rx="4.5" ry="7" fill={p("light")} />
      </g>
      <g className="character-mouth" data-character-layer="mouth">
        <path d={bright ? "M141 183q19 8 40-1c-7 22-28 23-40 1Z" : "M142 183q10 0 19 1 9-2 20-4-17 22-39 3Z"} fill={p("lip")} />
        {bright ? <><path d="M145 186q17 5 32-1c-3 12-23 14-32 1Z" fill="#6e4347" /><path d="M146 186q15 4 31-1l-4 6q-13 3-24 0Z" fill="#fff7e5" /></> : <path d={cool ? "M144 185q16 3 34-1" : "M144 184q17 8 34-2"} stroke="#9b625f" strokeWidth="1.3" fill="none" strokeLinecap="round" />}
        <path d="M155 193q8 2 15-1" stroke="#ffe1cb" strokeWidth="1.6" opacity=".7" strokeLinecap="round" fill="none" />
      </g>
      <ellipse cx="160" cy="205" rx="13" ry="5" fill={p("light")} />
    </g>
  </g>;
}

function Hair({ config, id, back = false }: PartProps & { back?: boolean }) {
  const woman = config.gender !== "male";
  const long = config.hair === "wave" && woman;
  const bob = config.hair === "bob";
  const p = (part: string) => `url(#${id}-${part})`;
  if (back) return <g className="character-back-hair" data-character-layer="back-hair" fill={p("hair")}>
    {long && <>
      <path d="M103 69c-27 28-22 72-26 108-4 29-16 41-9 66 3 16 0 25-7 34 25 27 60 28 92 12l21-17c27 24 61 28 91 11-17-18-10-31-8-49 4-26-16-44-13-73 4-37-7-70-28-92-28-29-83-26-113 0Z" />
      <path d="M102 112c-7 35 5 45-6 79-10 28 7 42 0 67-3 11-7 16-11 20 22 5 35-7 34-24-2-24-16-36-7-61 9-28-7-47 5-73Z" fill={p("hair-sheen")} />
      <path d="M218 111c14 23-1 50 9 78 12 28-1 47 8 66l10 19c-28-3-30-21-27-39 7-26-10-44-8-65Z" fill={p("hair-sheen")} opacity=".65" />
      <path d="M91 138c10 43-17 51-1 83 10 24-2 44-10 50m151-129c-9 35 17 46 4 76-8 19-2 41 10 52" stroke="#d8ab80" strokeOpacity=".16" strokeWidth="2" fill="none" />
    </>}
    {bob && <>
      <path d="M95 75c-28 32-12 79-22 124-3 19-6 30-3 42 22 18 51 22 88 9 37 13 70 8 91-11-9-20-6-39-12-65-4-21 6-63-17-93-29-36-93-44-125-6Z" />
      <path d="M92 113c-9 35 1 73-5 112 8 7 19 11 28 10-14-34-6-78-5-117Zm132 4c-3 53 7 70 3 108l-20 11c9-29 2-73 1-111Z" fill={p("hair-sheen")} />
    </>}
    {config.hair === "bun" && <g className="character-hair-tip">
      <ellipse cx="193" cy="50" rx="35" ry="30" fill={p("hair")} />
      <path d="M172 43c4-21 40-22 43-2-2 16-25 26-38 10 13 6 32-3 26-15" stroke="#bc9272" strokeOpacity=".38" strokeWidth="3" strokeLinecap="round" fill="none" />
    </g>}
  </g>;
  return <g data-character-layer="front-hair" fill={p("hair")} filter={config.hair === "buzz" ? undefined : p("contact")}>
    {config.hair === "wave" && (woman ? <>
      <path d="M102 154c-19-17-22-54-10-78 14-37 43-48 71-41 31-8 65 15 69 44 6 27-3 53-16 74l-5-35c-13-20-31-26-48-57-8 27-26 46-52 58Z" />
      <path d="M160 45c-28-1-53 25-59 49 21-6 43-24 48-40-3 22-17 42-35 53 27-7 44-32 46-62Z" fill={p("hair-sheen")} />
      <path d="M170 48c25 6 43 26 45 48-22-12-39-33-45-48Z" fill={p("hair-sheen")} />
      <path d="M151 49c-22 9-37 23-45 43m60-45c-1 26-23 52-46 63m54-56c6 16 16 29 29 38" stroke="#edc09a" strokeOpacity=".25" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </> : <>
      <path d="M101 151c-9-13-13-33-13-56-5-20 10-44 33-50 15-19 37-18 51-12 26-4 52 12 54 35 14 19 8 54-11 80l-5-36c-21-8-33-27-40-46-13 28-35 41-60 46Z" />
      <path d="M162 40c-21-3-47 14-55 42 24-5 49-19 59-36-3 19-26 44-52 53 34-5 59-26 62-49Z" fill={p("hair-sheen")} />
      <path d="M181 49c23 7 33 29 32 42-14-8-25-25-32-42Z" fill={p("hair-sheen")} />
      <path d="M156 44c-17 7-30 17-40 31m56-26c-10 24-27 40-51 47m63-39c5 12 14 23 22 29" stroke="#bbb0b6" strokeOpacity=".22" strokeWidth="2" strokeLinecap="round" fill="none" />
    </>)}
    {config.hair === "crop" && <>
      <path d="M101 151c-10-15-15-31-13-56-3-40 20-61 58-61 15-9 32-6 44 3 22-1 37 14 37 29 9 25 4 60-12 83l-5-43c-18-2-31-10-41-26-17 15-38 24-61 26Z" />
      <path d="M99 79c13-29 43-40 76-35-13 21-42 33-76 35Z" fill={p("hair-sheen")} />
      <path d="M103 88c31-2 50-13 69-34m10-8c14 5 28 22 29 38" fill="none" stroke="#d8b499" strokeOpacity=".25" strokeWidth="2.5" strokeLinecap="round" />
    </>}
    {bob && <>
      <path d="M95 161c-22-40-13-87 17-111 22-17 47-19 65-8 30 0 53 33 53 65 0 19-5 37-14 53l-5-43c-26-12-37-31-47-52-12 28-34 44-55 53l-2 48Z" />
      <path d="M154 47c-28 1-49 22-54 54 24-8 44-29 54-54Zm24 4c21 11 33 32 34 49-18-12-30-29-34-49Z" fill={p("hair-sheen")} />
      <path d="M157 51c-12 27-33 47-51 57m70-52c9 24 23 39 36 47" stroke="#e0b38b" strokeOpacity=".24" strokeWidth="1.7" fill="none" strokeLinecap="round" />
    </>}
    {config.hair === "bun" && <>
      <path d="M102 150c-18-26-20-66 0-91 28-34 77-34 105-3 22 24 28 60 9 94l-6-44c-21-12-37-31-47-49-12 23-32 41-52 49Z" />
      <path d="M151 44c-25 6-41 24-47 46 17-10 38-27 47-46Zm20 2c26 8 38 29 42 49-18-10-31-29-42-49Z" fill={p("hair-sheen")} />
      <path d="M156 46c-10 23-33 40-47 49m59-47c10 23 26 37 40 48" stroke="#d5ae85" strokeOpacity=".3" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </>}
    {config.hair === "buzz" && <>
      <path d="M102 145c-11-21-11-50-3-69 10-24 31-38 60-38 28 0 50 14 59 38 7 20 7 47-4 68l-6-52c-28-11-63-10-98 3Z" fill={p("buzz")} />
      <path d="M102 145c-11-21-11-50-3-69 10-24 31-38 60-38 28 0 50 14 59 38 7 20 7 47-4 68l-6-52c-28-11-63-10-98 3Z" fill={p("stubble")} />
    </>}
  </g>;
}

function Clothing({ config, colors, id }: PartProps) {
  const woman = config.gender !== "male";
  const p = (part: string) => `url(#${id}-${part})`;
  return <g data-character-layer="outfit">
    <g className="character-arm character-arm-left">
      <path d={woman ? "M104 244c-27-1-43 23-47 54l-14 126 30 7 28-119 16-41Z" : "M94 242c-35 3-51 27-52 61l-10 124 35 6 30-125 18-47Z"} fill={p("sleeve")} />
      <path d="M68 289 54 406" stroke={colors.glow} strokeOpacity=".28" strokeWidth="3" strokeLinecap="round" />
      <g fill={p("skin")}>
        <path d="m47 425-5 26c-4 15-1 27 5 31 4 3 6-2 4-7l-2-9 6 18c2 5 6 3 5-2l-3-19 6 14c2 4 6 2 4-3l-5-23c6 4 6 13 10 9 3-3-1-15-7-20l6-12Z" />
      </g>
      <path d="m45 416 29 5-3 12-28-6Z" fill={p("coat")} stroke={colors.deep} strokeOpacity=".22" />
    </g>
    <g className="character-arm character-arm-right">
      <path d={woman ? "M214 243c27 0 44 23 47 52l18 129-31 8-28-119-17-43Z" : "M225 244c34 2 50 28 52 62l10 119-34 8-29-123-18-49Z"} fill={p("sleeve")} />
      <path d="m256 294 12 105" stroke={colors.ink} strokeWidth="2" strokeOpacity=".25" strokeLinecap="round" />
      <path d="m250 427 5 18c-5 6-9 18-5 21 4 2 5-8 9-9l-1 19c0 6 5 6 6 1l2-12 1 18c0 6 5 5 6 0l1-19 2 15c1 5 5 4 5-1l1-17c0-8-3-14-6-20l-3-18Z" fill={p("skin")} />
      <path d="m248 420 31-6 2 13-31 8Z" fill={p("coat")} stroke={colors.deep} strokeOpacity=".24" />
    </g>
    <path d={woman ? "M109 242c25-8 80-8 103 0l23 53-19 75 7 68c-34 19-93 20-126 0l7-69-17-74Z" : "M102 241c33-10 85-11 120 1l17 50-18 151c-34 11-88 11-122-1L82 293Z"} fill={p("coat")} />
    <path d="M204 267q18 70 2 166l17 4-3-72 14-71Z" fill={colors.ink} opacity=".13" />
    {config.outfit === "hoodie" ? <>
      <path d="M136 269q24 13 48 0l12 159h-71Z" fill={p("coat")} />
      <path d="m124 371-11 39q47 12 93-1l-11-38" fill="none" stroke={colors.deep} strokeOpacity=".45" strokeWidth="2" />
      <path d="M109 431q50 13 104 0" stroke={colors.deep} strokeOpacity=".3" strokeWidth="6" fill="none" />
    </> : <>
      <path d="M135 249q26 21 51 0l12 187h-77Z" fill={p("shirt")} />
      <path d="M147 291c-7 30-10 86-8 134m37-93 5 92" stroke="#d4c5b7" strokeWidth="1.2" fill="none" opacity=".6" />
      {config.outfit === "cardigan" && <>
        <path d="m132 245-23 177 11 16 28-162Zm57 0-15 31 28 162 13-16Z" fill={p("coat")} />
        <path d="m133 263-19 158m73-158 21 158" stroke={colors.glow} strokeOpacity=".45" strokeWidth="2" fill="none" />
        {[307, 347, 387].map(y => <g key={y}><circle cx={188+(y-307)/8} cy={y+1} r="4" fill={colors.deep} opacity=".45" /><circle cx={188+(y-307)/8} cy={y} r="3.3" fill={p("gold")} /></g>)}
        <path d="m121 384 19 1m44 0 18-1" stroke={colors.deep} strokeWidth="2" fill="none" opacity=".3" />
      </>}
      {config.outfit === "blazer" && <>
        <path d="m133 239-30 10-6 194h48l8-161Zm53 0 30 11 7 193h-59l-6-161Z" fill={p("coat")} />
        <path d="m134 239-31 11-13 42 24-5-13 23 46 49 7-77Zm51 0 31 11 14 41-26-4 14 23-47 49-13-77Z" fill={p("lapel")} />
        <path d="m111 258 34 83m64-82-34 82m22 33 29-2" stroke={colors.background} strokeOpacity=".7" strokeWidth="1.8" fill="none" />
        <circle cx="162" cy="405" r="4.5" fill={p("gold")} />
      </>}
      {config.outfit === "starlight" && <>
        <path d="M132 242q28 29 56 0l28 197c-33 17-80 17-112 0Z" fill={p("lapel")} />
        <path d="M135 252q26 30 49 0" fill="none" stroke={p("gold")} strokeWidth="2.5" />
        <path d="m154 307 3 9 9 3-9 3-3 9-3-9-9-3 9-3Zm36 61 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill={p("gold")} />
        <circle cx="181" cy="298" r="2" fill="#f5d499" /><circle cx="138" cy="368" r="1.6" fill="#f5d499" />
      </>}
    </>}
    <path d="M93 269q12-15 24-17m98 1 12 14" stroke={colors.glow} strokeWidth="2" strokeLinecap="round" fill="none" opacity=".45" />
  </g>;
}

function Collar({ config, colors, id }: PartProps) {
  const p = (part: string) => `url(#${id}-${part})`;
  return <g data-character-layer="collar">
    {config.outfit === "hoodie" ? <>
      <path d="M132 235c-23-2-36 13-33 26 11 24 39 35 62 33 28 0 53-12 63-34 0-14-13-26-35-24l-28 31Z" fill={p("scarf")} />
      <path d="M112 258q20 24 49 23 34 1 50-23" fill="none" stroke={colors.primary} strokeWidth="2" opacity=".55" />
      <path d="M143 290v38m36-38v37" stroke={colors.glow} strokeWidth="3" strokeLinecap="round" />
      <path d="M143 323v8m36-8v8" stroke={colors.deep} strokeWidth="4" strokeLinecap="round" />
    </> : <>
      <path d="M136 249q27 25 50 0" fill="none" stroke="#cab6a3" strokeWidth="3" />
      <path d="M139 249q24 21 45 0" fill="none" stroke="#fff8e9" strokeWidth="3" />
    </>}
  </g>;
}

function Legs({ config, id }: PartProps) {
  const woman = config.gender !== "male";
  const p = (part: string) => `url(#${id}-${part})`;
  return <g data-character-layer="legs">
    <path d="M105 419h109l1 85-52 18-61-18Z" fill={p("pants")} />
    <g className="character-leg character-leg-left">
      <path d={woman ? "M104 443h55c6 44 2 80-4 115l-20 177-41-4 9-179c-12-46-12-81 1-109Z" : "M102 442h58c7 48 3 84-4 119l-18 175-46-4 10-177c-11-45-11-80 0-113Z"} fill={p("pants")} />
      <path d="M130 487c8 56-14 149-14 229" stroke={woman ? "#fff8e9" : "#b8b5c2"} strokeWidth="2" opacity=".26" fill="none" />
      <path d="m107 731-3 27h37l-1-27Z" fill={p("skin")} />
      <path d="M105 752c-6 9-23 15-25 26-1 9 19 10 37 8l32-5-7-30Z" fill={woman ? "#6f5148" : "#33323f"} />
      <path d="m106 765 31-2" stroke={p("gold")} strokeWidth="3" strokeLinecap="round" />
      <path d="M83 780q24 6 61-2" fill="none" stroke="#171b28" strokeWidth="3" />
    </g>
    <g className="character-leg character-leg-right">
      <path d={woman ? "M163 443h51l5 114-1 181h-43l-13-196Z" : "M162 442h57l9 110-5 186h-45l-18-180Z"} fill={p("pants")} />
      <path d="M192 491c8 82 1 150 5 224" stroke={woman ? "#fff8e9" : "#b8b5c2"} strokeWidth="2" opacity=".24" fill="none" />
      <path d="m178 731 1 27h35l-1-27Z" fill={p("skin")} />
      <path d="m179 751-6 31c13 7 58 6 64 0 7-7-12-19-23-30Z" fill={woman ? "#6f5148" : "#33323f"} />
      <path d="m185 764 27 3" stroke={p("gold")} strokeWidth="3" strokeLinecap="round" />
      <path d="M176 781q28 7 58-1" fill="none" stroke="#171b28" strokeWidth="3" />
    </g>
    <path d="m114 451 9-18m75 18-10-18" stroke="#5b5052" strokeOpacity=".25" strokeWidth="1.4" />
  </g>;
}

function Accessories({ config, colors, id }: PartProps) {
  const p = (part: string) => `url(#${id}-${part})`;
  return <g data-character-layer="accessory">
    {config.accessory === "glasses" && <g fill="none" stroke={colors.deep} strokeWidth="2" filter={p("contact")}>
      <rect x="109" y="125" width="43" height="29" rx="12" fill="#f4f7fa" fillOpacity=".12" />
      <rect x="171" y="125" width="43" height="29" rx="12" fill="#f4f7fa" fillOpacity=".12" />
      <path d="M152 133q10-5 19 0m-62-4-8-4m113 4 7-4" />
      <path d="m116 133 12-4m50 4 12-4" stroke="#fff5df" strokeOpacity=".65" strokeWidth="2" strokeLinecap="round" />
    </g>}
    {config.accessory === "headphones" && <g filter={p("contact")}>
      <path d="M89 142V102c0-43 26-68 72-68s72 25 72 68v40" fill="none" stroke={colors.deep} strokeWidth="11" />
      <path d="M93 90c5-36 30-51 68-51s62 16 68 51" stroke={colors.background} strokeWidth="3" fill="none" />
      <rect x="80" y="128" width="23" height="41" rx="11" fill={p("lapel")} stroke={colors.primary} strokeWidth="2" />
      <rect x="219" y="128" width="23" height="41" rx="11" fill={p("lapel")} stroke={colors.primary} strokeWidth="2" />
      <path d="M87 138v19m139-19v19" stroke={colors.background} strokeWidth="3" strokeLinecap="round" opacity=".6" />
    </g>}
    {config.accessory === "star" && <g transform={`translate(210 ${config.hair === "buzz" ? 82 : 105}) rotate(18)`} filter={p("contact")}>
      <path d="m0-13 4 9 10 1-8 7 2 11-8-6-9 6 3-11-8-7 10-1Z" fill={p("gold")} stroke="#f9e7b9" strokeWidth="1" />
      <circle cx="0" cy="1" r="3" fill="#fff0c8" />
    </g>}
  </g>;
}
