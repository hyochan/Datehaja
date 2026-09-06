import { useId } from "react";
import type { AvatarConfig } from "./AgentAvatar";

type Paint = {
  background: string;
  glow: string;
  primary: string;
  deep: string;
  ink: string;
};

/** One layered character for the portrait, editor and world. No image overlays:
 * hair, clothes and expressions stay editable, including during a blink. */
export function AgentCharacterArt({
  config,
  colors,
  fullBody = false,
  className,
}: {
  config: AvatarConfig;
  colors: Paint;
  fullBody?: boolean;
  className?: string;
}) {
  const id = `character-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const fill = (name: string) => `url(#${id}-${name})`;
  const woman = config.gender !== "male";
  const longHair = config.hair === "wave" && woman;
  const bob = config.hair === "bob";
  const hairColor = woman ? "#30221f" : "#242329";
  const hairLight = woman ? "#765044" : "#53505a";
  const skinShadow = "#d79781";
  const cool = config.face === "cool";
  const bright = config.face === "bright";
  const curious = config.face === "curious";
  const eyeShape = cool ? "M86 115q12-5 25-1-11 11-25 1Z" : "M86 115q11-12 25-1-12 12-25 1Z";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={fullBody ? "0 0 240 640" : "0 0 240 280"}
      className={className}
      focusable="false"
      aria-hidden="true"
      data-character-gender={woman ? "female" : "male"}
      data-character-hair={config.hair}
      data-character-outfit={config.outfit}
      data-character-accessory={config.accessory}
      data-character-face={config.face}
    >
      <defs>
        <linearGradient id={`${id}-back`} x2=".8" y2="1">
          <stop stopColor={colors.glow} />
          <stop offset="1" stopColor={colors.background} />
        </linearGradient>
        <linearGradient id={`${id}-hair`} x1="0" x2="1" y2=".8">
          <stop stopColor={hairLight} />
          <stop offset=".4" stopColor={hairColor} />
          <stop offset=".8" stopColor={hairColor} />
          <stop offset="1" stopColor={hairLight} />
        </linearGradient>
        <radialGradient id={`${id}-skin`} cx=".38" cy=".28" r=".8">
          <stop stopColor="#fff1e3" />
          <stop offset=".55" stopColor="#f5cdb6" />
          <stop offset="1" stopColor="#dca08a" />
        </radialGradient>
        <linearGradient id={`${id}-neck`} x1="0" x2=".8" y2="1">
          <stop stopColor="#c68b78" />
          <stop offset=".6" stopColor="#f2c9b1" />
          <stop offset="1" stopColor="#f9deca" />
        </linearGradient>
        <linearGradient id={`${id}-coat`} x1="0" x2="1" y2=".6">
          <stop stopColor={colors.background} />
          <stop offset=".28" stopColor={colors.primary} />
          <stop offset=".8" stopColor={colors.primary} />
          <stop offset="1" stopColor={colors.deep} />
        </linearGradient>
        <linearGradient id={`${id}-pants`} x2="1" y2=".1">
          <stop stopColor={woman ? "#e6d9c9" : colors.deep} />
          <stop offset=".4" stopColor={woman ? "#fcf3e7" : colors.ink} />
          <stop offset=".55" stopColor={woman ? "#d2c1b3" : colors.deep} />
          <stop offset="1" stopColor={woman ? "#eee2d5" : colors.deep} />
        </linearGradient>
        <radialGradient id={`${id}-blush`}>
          <stop stopColor="#dc877f" stopOpacity={woman ? ".3" : ".14"} />
          <stop offset="1" stopColor="#dc877f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-iris`} x2="0" y2="1">
          <stop stopColor="#30252a" />
          <stop offset="1" stopColor={woman ? "#a4744d" : "#777369"} />
        </linearGradient>
        <clipPath id={`${id}-frame`}>
          <rect x="4" y="4" width="232" height="272" rx="55" />
        </clipPath>
      </defs>

      {!fullBody && (
        <>
          <rect x="4" y="4" width="232" height="272" rx="55" fill={fill("back")} />
          <circle cx="122" cy="108" r="85" fill={colors.glow} opacity=".62" />
          <path d="M22 217c58-28 142-33 199 4" fill="none" stroke={colors.primary} strokeOpacity=".12" />
          <rect x="9" y="9" width="222" height="262" rx="50" fill="none" stroke="#fff" strokeOpacity=".65" />
        </>
      )}

      <g clipPath={fullBody ? undefined : fill("frame")}>
        {fullBody && (
          <g data-character-layer="legs">
            <path d={woman
              ? "M80 309h79c9 27 7 48 3 77l-4 194h-36l-4-184-8 184H74l-1-190c-3-36-1-59 7-81Z"
              : "M75 309h90c6 32 4 52-1 80l-1 191h-38l-6-176-10 176H71l2-191c-4-35-4-57 2-80Z"}
              fill={fill("pants")} />
            <path d="M118 317v48m-35-29 13-17m56 18-11-18M95 393l-6 170m54-170 2 170" fill="none" stroke={woman ? "#b7a697" : colors.ink} strokeWidth="1.4" opacity=".5" />
            <path d="M82 578v17h19v-17m30 0v17h20v-17" fill={fill("skin")} />
            <path d="M81 589c-2 11-15 15-18 23-2 7 6 10 22 9l22-3-3-29Zm49 0-3 27c11 6 33 6 41 1 4-6-11-14-17-28Z" fill={woman ? "#60463f" : "#30303b"} />
            <path d="m76 605 25-1m31 0 23 2" stroke="#c5a879" strokeWidth={woman ? "3" : "1.5"} strokeLinecap="round" />
            <path d="M64 616c13 4 27 2 40 0m25 0c11 4 23 4 37 0" fill="none" stroke="#211c23" strokeWidth="2" />
          </g>
        )}

        <g transform={fullBody ? "translate(19.2 15) scale(.84)" : undefined}>
          {/* Hair behind the shoulders gives long styles a real silhouette. */}
          {(longHair || bob) && (
            <g data-character-layer="back-hair">
              <path d={longHair
                ? "M72 61c-24 27-14 55-23 81-8 23 9 35 1 53-6 21 8 36 34 33l38-12 35 8c28 3 43-12 32-35-8-18 7-31-3-51-8-18 0-57-19-79-25-30-72-28-95 2Z"
                : "M69 65c-14 21-13 55-14 77l-2 27c16 17 36 14 66 12 31 2 52 3 68-13l-4-31c1-35-3-59-19-76-24-25-69-24-95 4Z"}
                fill={fill("hair")} />
              <path d={longHair ? "M65 103c-14 40 13 46-1 76-6 16 2 28 14 31m89-110c19 36-10 54 8 82 5 13 0 23-10 28" : "M66 109v47q1 10 9 13m99-61 2 49q-1 10-10 14"}
                stroke={hairLight} strokeWidth="3" fill="none" strokeLinecap="round" opacity=".52" />
            </g>
          )}

          {config.hair === "bun" && (
            <g data-character-layer="bun">
              <ellipse cx="145" cy="37" rx="26" ry="23" fill={fill("hair")} />
              <path d="M126 34c4-15 26-16 33-3m-24-9c-8 11-3 25 8 30" fill="none" stroke={hairLight} strokeWidth="2" opacity=".7" />
            </g>
          )}

          {/* The same neckline and tailoring continue into the full figure. */}
          <g data-character-layer="outfit" transform={fullBody ? "translate(0 -45) scale(1 1.25)" : undefined}>
            <path d={woman ? "M105 155v23c-4 8-15 11-24 15l39 33 40-33c-13-4-23-8-25-15v-23Z" : "M101 153v25c-5 8-17 12-31 16l50 36 51-36c-15-4-26-8-30-17v-25Z"} fill={fill("neck")} />
            <path d={woman
              ? "M81 189c-19 7-26 13-31 33l-12 83 27 5 15-63 6 68h69l6-68 16 63 27-5-14-83c-4-19-14-28-31-33l-23-7c-8 17-24 18-33 0Z"
              : "M77 186c-27 8-36 17-39 37l-9 84 29 6 15-65 5 68h86l4-68 14 65 29-6-10-84c-3-22-14-31-40-37l-21-5c-9 13-27 14-38 0Z"}
              fill={fill("coat")} />
            <path d={woman ? "M101 187c10 14 27 14 38 0l9 116H92Z" : "M100 185c12 13 29 13 42 0l11 119H88Z"} fill="#fff3e5" />
            <path d="M104 198q16 10 33-1" fill="none" stroke="#d3bca9" strokeWidth="1.5" />

            {config.outfit === "cardigan" && (
              <g>
                <path d="M99 187 84 311H69l8-110m65-15 17 126h16l-12-111" fill={fill("coat")} />
                <path d="m97 201-12 96m58-96 13 96" stroke={colors.deep} strokeWidth="1.2" fill="none" opacity=".5" />
                {[221, 247, 273].map((y) => <circle key={y} cx={147 + (y - 221) / 10} cy={y} r="2.8" fill="#fce9cb" stroke={colors.deep} strokeWidth=".6" />)}
                <path d="m54 283 21 4m96 0 22-4M91 293h59" stroke={colors.deep} strokeOpacity=".28" strokeWidth="2" fill="none" />
              </g>
            )}
            {config.outfit === "blazer" && (
              <g>
                <path d="M98 184 77 196l-5 117h42l2-99Zm45 0 20 11 10 118h-46l-2-99Z" fill={fill("coat")} />
                <path d="m98 184-18 9-8 29 17-3-8 15 29 39 5-59Zm45 0 18 8 10 30-18-3 9 15-30 39-7-59Z" fill={colors.deep} />
                <path d="m86 199 17 50m51-50-18 50M153 267h22" stroke={colors.glow} strokeOpacity=".4" fill="none" strokeWidth="1.5" />
                <circle cx="128" cy="289" r="3" fill="#c4a779" />
              </g>
            )}
            {config.outfit === "hoodie" && (
              <g>
                <path d="M99 179c-19-2-28 10-29 24 6 15 27 24 50 25 23-2 43-10 50-25-2-13-12-25-28-24l-22 29Z" fill={colors.background} />
                <path d="M81 213c25 15 53 15 78 0l8 99H73Z" fill={fill("coat")} />
                <path d="M106 224v34m28-34v34M91 275l-7 22h73l-7-22" stroke={colors.glow} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".8" />
              </g>
            )}
            {config.outfit === "starlight" && (
              <g>
                <path d="M99 186q21 18 44 0l19 127H76Z" fill={colors.deep} />
                <path d="M98 188q22 28 47 0" stroke="#dcc299" strokeWidth="2" fill="none" />
                <path d="m102 239 2 7 7 2-7 2-2 7-2-7-7-2 7-2Zm36 34 1.5 5 5 1.5-5 1.5-1.5 5-1.5-5-5-1.5 5-1.5Z" fill="#f8e2b8" />
                <g fill="#f8e2b8" opacity=".8"><circle cx="139" cy="228" r="1.5" /><circle cx="122" cy="263" r="1" /><circle cx="93" cy="285" r="1.5" /></g>
              </g>
            )}
            {/* Seams read as tailoring at large sizes, quiet shading in chips. */}
            <path d="m61 222-10 60m130-60 10 60" stroke={colors.deep} strokeOpacity=".32" strokeWidth="1.5" fill="none" />
            {woman && config.outfit !== "hoodie" && (
              <g fill="none" stroke="#bd955d" strokeWidth="1.3">
                <path d="M103 177q16 24 34 0" />
                <ellipse cx="120" cy="191" rx="2.3" ry="3" fill="#eac68b" />
              </g>
            )}
          </g>

          {fullBody && (
            <g data-character-layer="hands" transform="translate(0 32)" fill={fill("skin")}>
              <path d="m40 306-6 32c-1 10 2 18 6 22 2 2 4 0 3-3l-2-11 3 13c2 4 5 3 4-1l-1-13 4 11c2 3 5 2 4-2l-3-18c5 0 4 9 7 8 4-1 0-13-4-18l5-17Z" />
              <path d="m183 309 2 26c-4 6-7 18-3 19 3 1 4-8 7-8l-1 15c0 4 3 5 4 1l3-13-1 14c0 4 3 5 4 1l3-14-1 11c0 4 3 4 4 1 3-6 5-13 3-22l-4-34Z" />
            </g>
          )}

          <g data-character-layer="head">
            <ellipse cx="75" cy="117" rx="8" ry="13" fill={fill("skin")} />
            <ellipse cx="165" cy="117" rx="8" ry="13" fill={fill("skin")} />
            <path d="M73 114q-3 1 1 9m92-9q3 1-1 9" stroke={skinShadow} strokeWidth="1.5" fill="none" />
            <path d={woman
              ? "M76 91c0-31 19-48 44-48s44 17 44 48l-2 34c-2 21-24 43-42 45-18-2-40-24-42-45Z"
              : "M74 91c0-30 20-48 46-48s46 18 46 48l-2 37c-2 16-12 31-22 38l-22 10-23-11c-11-8-19-22-21-38Z"}
              fill={fill("skin")} />
            <path d={woman ? "M80 130c7 20 24 35 40 38-20-1-35-18-40-38Z" : "M78 131c6 17 17 29 42 43l-23-10c-11-9-18-22-19-33Z"} fill={skinShadow} opacity=".26" />
            <ellipse cx="90" cy="133" rx="16" ry="10" fill={fill("blush")} />
            <ellipse cx="150" cy="133" rx="16" ry="10" fill={fill("blush")} />

            <g data-character-layer="brows" fill={hairColor}>
              <path d={woman ? (curious ? "M86 99q11-11 24-5l-1 3q-11-4-23 2Z" : "M86 101q11-8 24-3l-1 3q-12-3-23 0Z") : (curious ? "M84 96q12-9 26-2v4q-15-4-26 2Z" : "M84 100q12-7 26-3v5q-13-4-26 1Z")} />
              <path d={woman ? "M132 99q12-5 23 3l-1 1q-12-4-22-1Z" : "M132 98q13-4 25 4l-1 2q-14-4-24-1Z"} />
            </g>

            <g className="agent-avatar-eyes" data-character-layer="eyes">
              {[0, 1].map((side) => (
                <g key={side} transform={side ? "translate(240 0) scale(-1 1)" : undefined}>
                  <defs>
                    <clipPath id={`${id}-eye-${side}`}><path d={eyeShape} /></clipPath>
                  </defs>
                  <path d={eyeShape} fill="#fff9ef" />
                  <g clipPath={fill(`eye-${side}`)}>
                  <ellipse cx={curious ? 101 : 100} cy="114.5" rx={woman ? "4.8" : "4.3"} ry={cool ? "3.8" : "5.5"} fill={fill("iris")} />
                  <ellipse cx={curious ? 101 : 100} cy="114" rx="2.2" ry="3.4" fill="#282229" />
                  <circle cx={side ? 102 : 98.5} cy="112.5" r="1.4" fill="#fff" />
                  </g>
                  <path d={cool ? "M86 115q12-5 25-1" : "M86 115q11-12 25-1"} fill="none" stroke={hairColor} strokeWidth={woman ? "2.2" : "1.9"} strokeLinecap="round" />
                  <path d="M89 118q10 6 19 0" fill="none" stroke="#ad7666" strokeOpacity=".55" strokeWidth=".9" />
                  {woman && <path d="m86 115-3-3" stroke={hairColor} strokeWidth="1.5" strokeLinecap="round" />}
                </g>
              ))}
            </g>
            <path d={woman ? "m121 117-3 14 6 2" : "m121 113-4 19 8 2"} fill="none" stroke="#c28873" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M116 135q4 2 8 0" fill="none" stroke="#c28873" strokeWidth="1.2" strokeLinecap="round" />
            <path d="m121 120 1 9" stroke="#fff1e1" strokeWidth="2" strokeLinecap="round" opacity=".8" />

            <g data-character-layer="mouth">
              {bright ? (
                <>
                  <path d="M108 144q12 5 25-1c-3 15-20 16-25 1Z" fill="#8b4e4d" />
                  <path d="M110 145q11 3 21-1l-2 5q-9 3-17 0Z" fill="#fff8e9" />
                  <path d="M115 154q6-4 13-1-6 5-13 1Z" fill="#d8877e" />
                </>
              ) : (
                <>
                  <path d={cool ? "M109 146q6-4 11-1 6-2 12 0-11 10-23 1Z" : "M108 145q7-3 12-1 6-3 13-1-12 14-25 2Z"} fill={woman ? "#cf7a77" : "#c7897a"} />
                  <path d={curious ? "M109 146q14 3 24-4" : "M109 146q12 4 23-2"} fill="none" stroke="#925a54" strokeWidth="1.1" strokeLinecap="round" />
                  <path d="M116 150q5 2 10-1" stroke="#f7b4a4" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                </>
              )}
            </g>
            <ellipse cx="121" cy="160" rx="7" ry="2" fill="#fff1df" opacity=".4" />
          </g>

          <g data-character-layer="front-hair" fill={fill("hair")}>
            {config.hair === "wave" && (woman ? (
              <>
                <path d="M74 112c-12-10-14-39-2-58 12-23 35-29 52-21 21-9 49 4 53 31 5 20-2 33-13 48 1-25-10-40-35-59-4 28-25 40-46 48l-2 37c-10-2-12-15-7-26Z" />
                <path d="M118 42C88 42 70 65 75 89m49-46c-6 27-22 40-38 47m46-47c18 9 31 24 35 46" fill="none" stroke={hairLight} strokeWidth="2.8" strokeLinecap="round" />
                <path d="M119 46c-11 23-23 29-36 35m52-32c13 9 21 19 25 29" fill="none" stroke="#b08063" strokeWidth="1.3" opacity=".45" />
              </>
            ) : (
              <>
                <path d="M75 113c-6-8-9-20-8-34l-6-6 6-17-5-6 22-9c9-16 29-20 42-11 17-7 37 5 42 15l12 3-6 13c7 18 2 38-10 54l-3-26c-16-5-27-17-32-31-6 18-25 31-46 35Z" />
                <path d="M119 37c-18 0-30 13-35 28m39-27c-4 21-19 38-39 45m46-43c5 18 16 28 29 32" stroke={hairLight} strokeWidth="2.8" strokeLinecap="round" fill="none" />
                <path d="M114 46c-6 14-16 24-27 28m48-22 14 14" stroke="#92807b" strokeWidth="1.2" opacity=".55" fill="none" />
              </>
            ))}
            {config.hair === "crop" && (
              <>
                <path d="m74 115-9-30c-7-34 14-55 46-57 17-4 38 1 46 12l18 4-7 14c9 21 5 43-4 58l-3-32c-13-2-20-9-28-20-13 13-35 23-53 25Z" />
                <path d="M83 69c19-2 37-14 46-30m-34 10c14-11 27-13 40-12m4 12c6 13 13 21 23 24" stroke={hairLight} strokeWidth="2.8" strokeLinecap="round" fill="none" />
              </>
            )}
            {bob && (
              <>
                <path d="M64 124c-10-33-3-66 19-81 18-14 43-14 57-5 31 3 45 39 36 86l-12-12-3-30c-15-5-29-15-35-28-5 15-25 29-47 35l-3 28Z" />
                <path d="M119 42c-20-2-41 18-46 42m56-40c7 16 17 26 31 32" stroke={hairLight} strokeWidth="2.8" strokeLinecap="round" fill="none" />
              </>
            )}
            {config.hair === "bun" && (
              <>
                <path d="M75 114c-11-22-12-52 5-69 22-23 60-19 79-1 18 16 22 45 7 70l-5-36c-17-9-30-22-35-32-10 20-26 32-45 36Z" />
                <path d="M121 38C101 40 82 58 77 77m55-39c17 6 29 22 32 36" stroke={hairLight} strokeWidth="2.3" strokeLinecap="round" fill="none" />
              </>
            )}
            {config.hair === "buzz" && (
              <>
                <path d="M74 113c-7-13-10-33-4-49 6-23 23-33 49-34 25 0 43 12 48 35 5 15 3 34-3 47l-6-35c-23-10-51-9-76 0Z" />
                <path d="M83 59c19-17 53-18 72 1" stroke={hairLight} strokeWidth="6" strokeLinecap="round" fill="none" opacity=".45" />
              </>
            )}
          </g>

          {woman && config.accessory !== "headphones" && (
            <g fill="none" stroke="#c7a063" strokeWidth="2">
              <ellipse cx="74" cy="132" rx="3" ry="5" /><ellipse cx="166" cy="132" rx="3" ry="5" />
            </g>
          )}
          <g data-character-layer="accessory">
            {config.accessory === "glasses" && (
              <g fill="none" stroke={colors.deep} strokeWidth="1.8">
                <rect x="82" y="105" width="32" height="22" rx="8" fill="#fff" fillOpacity=".08" />
                <rect x="126" y="105" width="32" height="22" rx="8" fill="#fff" fillOpacity=".08" />
                <path d="M114 112q6-4 12 0m-44-3-7-3m83 3 7-3" />
                <path d="m86 111 6-3m38 3 6-3" stroke="#fff" strokeOpacity=".65" strokeWidth="1.2" />
              </g>
            )}
            {config.accessory === "headphones" && (
              <g>
                <path d="M65 113V84c0-33 21-56 55-56s55 23 55 56v29" stroke={colors.deep} strokeWidth="7" fill="none" />
                <path d="M69 72c5-25 24-39 51-39s46 14 51 39" stroke={colors.background} strokeWidth="2" fill="none" />
                <rect x="59" y="102" width="15" height="29" rx="7" fill={colors.deep} stroke={colors.background} strokeWidth="2" />
                <rect x="166" y="102" width="15" height="29" rx="7" fill={colors.deep} stroke={colors.background} strokeWidth="2" />
              </g>
            )}
            {config.accessory === "star" && (
              <g transform="translate(159 79) rotate(14)">
                <path d="m0-10 3 7 8 1-6 5 1 8-6-4-7 4 2-8-6-5 8-1Z" fill="#e4bc78" stroke="#fff1c9" strokeWidth="1" />
                <circle cx="0" cy="1" r="2" fill="#fff3d6" />
              </g>
            )}
            {config.accessory === "scarf" && (
              <g>
                <path d="m94 178 10 42 9 56 17-5-14-52 31-24-5-16c-14 12-32 14-48-1Z" fill={colors.background} />
                <path d="M97 183q24 17 47 0m-36 36 9 47m-2-69 18 10" stroke={colors.primary} strokeWidth="2" fill="none" opacity=".6" />
              </g>
            )}
          </g>
        </g>
      </g>
    </svg>
  );
}
