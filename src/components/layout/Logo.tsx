import { useId } from "react";

/**
 * A heart with a conversation inside it.
 *
 * The product is not "meet someone" — it is "someone speaks for you, then
 * tells you the truth". So the mark is a heart carrying a speech bubble: the
 * agent's conversation is what happens inside the feeling, on your behalf.
 * The warm gradient and the light falling across the top give it volume at
 * hero sizes; at favicon sizes the bubble simplifies into a bright notch and
 * the silhouette still reads as a heart.
 */
const HEART =
  "M16 26.6C11.2 22.9 5.2 18.4 5.2 13.1 5.2 9.6 7.9 7 11.3 7c2.2 0 4 1.15 4.7 2.9C16.7 8.15 18.5 7 20.7 7 24.1 7 26.8 9.6 26.8 13.1c0 5.3-6 9.8-10.8 13.5Z";
const BUBBLE =
  "M12.95 11h6.1a1.75 1.75 0 0 1 1.75 1.75v2.9a1.75 1.75 0 0 1-1.75 1.75h-2.4l-2.45 2 .26-2h-1.51a1.75 1.75 0 0 1-1.75-1.75v-2.9A1.75 1.75 0 0 1 12.95 11Z";

export function Logo({ className }: { className?: string }) {
  const id = useId().replaceAll(":", "");
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Datehaja"
    >
      <defs>
        <linearGradient
          id={`${id}-body`}
          gradientUnits="userSpaceOnUse"
          x1="6"
          y1="5"
          x2="25"
          y2="26"
        >
          <stop stopColor="#ff9d6e" />
          <stop offset=".48" stopColor="#dd5468" />
          <stop offset="1" stopColor="#93264a" />
        </linearGradient>
        <linearGradient
          id={`${id}-sheen`}
          gradientUnits="userSpaceOnUse"
          x1="16"
          y1="6.5"
          x2="16"
          y2="16"
        >
          <stop stopColor="#fff" stopOpacity=".2" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={HEART} fill={`url(#${id}-body)`} />
      <path d={HEART} fill={`url(#${id}-sheen)`} />
      <path d={BUBBLE} fill="#fff" />
      <g fill="#c2405c">
        <circle cx="14.1" cy="14.2" r=".78" />
        <circle cx="16" cy="14.2" r=".78" />
        <circle cx="17.9" cy="14.2" r=".78" />
      </g>
    </svg>
  );
}
