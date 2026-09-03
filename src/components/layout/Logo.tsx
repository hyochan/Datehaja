/**
 * Two agents, one heart.
 *
 * The heart is split down a seam: my agent on the left, theirs on the right.
 * The three dots sit in my half because that is the side doing the talking —
 * the agent goes to the date in my place and comes back with what it heard.
 * At favicon sizes the seam and the dots fall away and it still reads as a
 * heart, which is the fallback the mark is designed to degrade to.
 */
const LEFT_HALF =
  "M15.86 27C11 23.2 4.9 18.6 4.9 13.15 4.9 9.6 7.55 6.95 10.95 6.95c2.25 0 4.05 1.5 4.47 3.35Z";
const CONVERSATION_DOTS =
  "M7.35 13.15a.86.86 0 1 0 1.72 0 .86.86 0 1 0-1.72 0Z" +
  "M9.95 13.15a.86.86 0 1 0 1.72 0 .86.86 0 1 0-1.72 0Z" +
  "M12.55 13.15a.86.86 0 1 0 1.72 0 .86.86 0 1 0-1.72 0Z";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Datehaja"
    >
      <path
        fillRule="evenodd"
        d={`${LEFT_HALF}${CONVERSATION_DOTS}`}
        className="fill-[var(--brand-mark-lead)]"
      />
      <g transform="translate(32 0) scale(-1 1)">
        <path d={LEFT_HALF} className="fill-[var(--brand-mark-follow)]" />
      </g>
    </svg>
  );
}
