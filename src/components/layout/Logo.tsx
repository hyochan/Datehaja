/** A warm little drop: the plan lands first, then the spark can follow. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="DateDrop"
    >
      <circle cx="16" cy="16" r="15" className="fill-[var(--tint-ember-bg)]" />
      <path
        d="M16 5.3c3.5 4 6.2 7.5 6.2 11.1 0 4-2.8 6.5-6.2 6.5s-6.2-2.5-6.2-6.5c0-3.6 2.7-7.1 6.2-11.1Z"
        fill="currentColor"
        className="text-ember-400"
      />
      <path
        d="M12.9 16.7c0-1.6 2-2.1 3.1-.7 1.1-1.4 3.1-.9 3.1.7 0 1.5-1.4 2.6-3.1 3.7-1.7-1.1-3.1-2.2-3.1-3.7Z"
        className="fill-white"
      />
      <path
        d="M11 26.6c2.9.8 7.1.8 10 0"
        stroke="currentColor"
        className="text-ember-300"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
