import { useId } from "react";
import type { SceneKind } from "@convex/lib/dateStory";

/** The same little set appears in the live room and in its email postcard. */
export function DateSceneArt({ kind }: { kind: SceneKind }) {
  // Several scenes share a page (the world plus one per journal event), and
  // url(#id) resolves against the whole document — without a unique suffix
  // every scene would paint with the first one’s gradients.
  const uid = useId();
  const colors = {
    cinema: ["#25263c", "#635079", "#edb991"],
    market: ["#28374b", "#69727c", "#f3ae71"],
    bookshop: ["#354641", "#768271", "#e7c897"],
    garden: ["#254e53", "#779c8e", "#ecdfa7"],
    gallery: ["#887b77", "#d0bda7", "#fae6c4"],
    cafe: ["#344a5b", "#829296", "#f0cd9c"],
  }[kind];
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1040 520" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${kind} · illustrated simulation setting`}>
    <defs>
      <linearGradient id={`room-${uid}`} x2="0" y2="1"><stop stopColor={colors[0]} /><stop offset="1" stopColor={colors[1]} /></linearGradient>
      <linearGradient id={`floor-${uid}`} x2="0" y2="1"><stop stopColor={colors[1]} /><stop offset="1" stopColor={colors[0]} /></linearGradient>
      <radialGradient id={`glow-${uid}`}><stop stopColor={colors[2]} stopOpacity=".7" /><stop offset="1" stopColor={colors[2]} stopOpacity="0" /></radialGradient>
      <pattern id={`grain-${uid}`} width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1" cy="2" r=".55" fill="#fff" opacity=".09" /></pattern>
    </defs>
    <path fill={`url(#room-${uid})`} d="M0 0h1040v520H0z" />
    <path fill={`url(#floor-${uid})`} d="M0 335h1040v185H0z" />
    <ellipse cx="520" cy="424" rx="305" ry="62" fill={colors[0]} opacity=".34" />
    {kind === "cinema" && <>
      <path d="M245 60h550v238H245z" fill="#242339" /><path d="M258 72h524v212H258z" fill="#cec7c7" />
      <circle cx="616" cy="138" r="36" fill="#ebd9b9" /><path d="M258 232l115-69 91 45 97-38 221 77v37H258z" fill="#9b9da9" /><path d="M258 261l180-46 169 45 175-46v70H258z" fill="#777e98" />
      <path d="M152 0h75v346h-75zM813 0h75v346h-75z" fill="#654251" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <g key={i} transform={`translate(${80 + i * 136},420)`}><rect width="99" height="80" rx="19" fill="#352c40" /><rect x="7" y="7" width="85" height="56" rx="14" fill="#734b60" /></g>)}
    </>}
    {kind === "cafe" && <>
      <rect x="542" y="40" width="387" height="283" rx="110" fill="#b2bcbc" /><path d="M557 166a177 116 0 0 1 357 0v141H557z" fill="#3a586b" />
      {[0,1,2,3,4,5,6,7,8].map((i) => <path key={i} d={`M${580+i*37} ${120+(i%3)*45}l-14 57m10 12l-9 37`} stroke="#b9d0cf" strokeWidth="2" opacity=".5" />)}
      <path d="M735 54v268M550 206h368" stroke="#d0c3b0" strokeWidth="9" />
      <ellipse cx="268" cy="229" rx="153" ry="140" fill={`url(#glow-${uid})`} /><path d="M268 0v97" stroke="#c4a58e" strokeWidth="3" /><path d="M214 122l26-39h57l26 39z" fill="#e6bf87" />
      <ellipse cx="520" cy="351" rx="113" ry="30" fill="#dcb68d" /><path d="M520 378v100" stroke="#5a514f" strokeWidth="14" /><rect x="484" y="326" width="21" height="19" rx="4" fill="#f4e7d0" /><rect x="545" y="329" width="20" height="18" rx="4" fill="#d8dcc3" />
    </>}
    {kind === "bookshop" && <>
      {[100,690].map((x) => <g key={x}><rect x={x} y="40" width="240" height="308" fill="#253831" />{[0,1,2].map((row) => <g key={row}>{Array.from({length: 11},(_,i) => <rect key={i} x={x+13+i*20} y={67+row*91+(i%3)*8} width={13+i%3} height={62-i%3*8} fill={["#b4a080","#948a75","#9a6d59","#628b83"][i%4]} />)}<path d={`M${x} ${137+row*91}h240`} stroke="#786b50" strokeWidth="9" /></g>)}</g>)}
      <ellipse cx="515" cy="243" rx="214" ry="179" fill={`url(#glow-${uid})`} /><path d="M537 216v171m-33 0h65" stroke="#75603e" strokeWidth="8" /><path d="M479 222l28-57h59l24 57z" fill="#d3bd7c" />
      <path d="M439 350l70-14 72 18-71 23z" fill="#ecdcbf" /><path d="M510 337v38" stroke="#b09874" strokeWidth="2" />
    </>}
    {kind === "gallery" && <>
      <path d="M0 341h1040M167 0v342M882 0v342" stroke="#9f9187" strokeWidth="2" />
      <rect x="330" y="55" width="381" height="247" fill="#5b5357" /><rect x="343" y="68" width="355" height="221" fill="#d9b486" />
      <circle cx="478" cy="171" r="77" fill="#647b77" /><path d="M477 259L554 93l102 166z" fill="#c4765b" /><circle cx="599" cy="164" r="34" fill="#efe0b1" />
      <rect x="754" y="247" width="66" height="7" fill="#6b6664" opacity=".6" /><rect x="754" y="262" width="45" height="4" fill="#6b6664" opacity=".4" />
      <path d="M405 392h233v22H405zM425 414v41M616 414v41" stroke="#806951" strokeWidth="13" />
    </>}
    {kind === "garden" && <>
      <path d="M110 340V133L520-44l410 177v207M520 0v340M300 47v293M740 47v293M110 181h820" fill="none" stroke="#a5b9a5" strokeWidth="8" opacity=".65" />
      <circle cx="781" cy="110" r="38" fill="#ede1b5" />
      {[110,196,817,903].map((x,i) => <g key={x}><path d={`M${x} 383v-156`} stroke="#3f6656" strokeWidth="8" /><ellipse cx={x-24} cy={253+i%2*27} rx="39" ry="18" transform={`rotate(33 ${x-24} 253)`} fill="#789b6b" /><ellipse cx={x+24} cy="300" rx="43" ry="18" transform={`rotate(-35 ${x+24} 300)`} fill="#47795f" /><path d={`M${x-32} 353h64l-10 51h-43z`} fill="#8e8370" /></g>)}
      <ellipse cx="520" cy="395" rx="179" ry="42" fill="#9ebeb1" opacity=".6" /><ellipse cx="520" cy="392" rx="160" ry="31" fill="#426f72" /><path d="M408 389h109m30 12h79" stroke="#b9d3bc" strokeWidth="2" opacity=".6" />
    </>}
    {kind === "market" && <>
      <path d="M0 37q520 155 1040 0" stroke="#172f40" strokeWidth="5" />
      {[96,263,435,608,780,948].map((x,i) => <g key={x}><path d={`M${x} ${63+(2-Math.abs(i-2))*16}v44`} stroke="#cfb59a" strokeWidth="3" /><ellipse cx={x} cy={119+(2-Math.abs(i-2))*16} rx="27" ry="35" fill={i%2 ? "#e6b573" : "#d88468"} /><path d={`M${x} ${91+(2-Math.abs(i-2))*16}v56`} stroke="#ffe2a9" opacity=".4" strokeWidth="3" /></g>)}
      <path d="M251 199h537l31 68H220z" fill="#c1a38a" /><path d="M230 266h573v25H230z" fill="#a67766" /><path d="M265 290v124m489-124v124" stroke="#574952" strokeWidth="15" />
      <path d="M301 351h416v61H301z" fill="#9e7360" /><ellipse cx="428" cy="335" rx="39" ry="16" fill="#c7b698" /><ellipse cx="589" cy="335" rx="39" ry="16" fill="#b4bb91" />
    </>}
    <path fill={`url(#grain-${uid})`} d="M0 0h1040v520H0z" />
  </svg>;
}
