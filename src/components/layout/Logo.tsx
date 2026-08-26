/**
 * The DateDrop mark: a drop, not a heart. The product is about a plan landing
 * in your inbox, not about swiping through faces.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="DateDrop"
    >
      <path
        d="M16 3.5c4.1 4.6 7.3 8.8 7.3 13.1 0 4.6-3.3 7.6-7.3 7.6s-7.3-3-7.3-7.6c0-4.3 3.2-8.5 7.3-13.1Z"
        fill="currentColor"
        className="text-ember-400"
      />
      <circle cx="16" cy="17.5" r="2.9" className="fill-[var(--bg)]" />
      <path
        d="M9.5 27.5h13"
        stroke="currentColor"
        className="text-ember-300"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
