export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-wordmark ${className}`} aria-label="Datehaja">
      <span className="wordmark-date" aria-hidden="true">
        Date
      </span>
      <span className="wordmark-haja" aria-hidden="true">
        haja
      </span>
    </span>
  );
}
