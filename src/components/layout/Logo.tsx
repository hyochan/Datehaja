/** Two open availability windows meeting in one date spark. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Datehaja"
    >
      <circle
        cx="16"
        cy="16"
        r="15"
        className="fill-[var(--tint-ember-bg)] stroke-[var(--tint-ember-border)]"
        strokeWidth="0.8"
      />
      <circle
        cx="16"
        cy="16"
        r="12.2"
        className="stroke-[var(--accent-text)]"
        strokeWidth="0.55"
        opacity="0.2"
      />
      <path
        d="M14 8.3h-1.7a5.8 5.8 0 0 0-5.8 5.8v3.8a5.8 5.8 0 0 0 5.8 5.8H14"
        stroke="currentColor"
        className="text-ember-400"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 8.3h1.7a5.8 5.8 0 0 1 5.8 5.8v3.8a5.8 5.8 0 0 1-5.8 5.8H18"
        stroke="currentColor"
        className="text-ember-300"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 19.2c-2.55-1.5-3.6-2.85-3.6-4.15 0-1.15.85-2.05 2.05-2.05.7 0 1.25.3 1.55.85.35-.55.9-.85 1.6-.85 1.2 0 2.05.9 2.05 2.05 0 1.3-1.05 2.65-3.65 4.15Z"
        className="fill-ember-400"
      />
    </svg>
  );
}
