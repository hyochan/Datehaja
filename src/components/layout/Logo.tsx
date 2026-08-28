/** Two people, one shared table, and a small spark between them. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="DateHaja"
    >
      <circle cx="16" cy="16" r="15" className="fill-[var(--tint-ember-bg)]" />
      <circle cx="10.7" cy="11.6" r="2.6" className="fill-ember-400" />
      <circle cx="21.3" cy="11.6" r="2.6" className="fill-ember-400" />
      <path
        d="M7.2 20.3c1.3-2.8 3-4.2 5.1-4.2 1.4 0 2.6.6 3.7 1.8 1.1-1.2 2.3-1.8 3.7-1.8 2.1 0 3.8 1.4 5.1 4.2"
        stroke="currentColor"
        className="text-ember-400"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M12.1 23.2h7.8M16 18.4v4.8"
        stroke="currentColor"
        className="text-ember-300"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
