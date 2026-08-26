import { Chip } from "../ui/primitives";

export function ChipGroup({
  options,
  selected,
  onChange,
  max,
  ariaLabel,
}: {
  options: ReadonlyArray<string | { key: string; label: string; emoji?: string }>;
  selected: string[];
  onChange: (next: string[]) => void;
  max?: number;
  ariaLabel?: string;
}) {
  const normalised = options.map((option) =>
    typeof option === "string"
      ? { key: option, label: option, emoji: undefined }
      : option,
  );
  const atMax = max !== undefined && selected.length >= max;

  function toggle(key: string) {
    if (selected.includes(key)) {
      onChange(selected.filter((s) => s !== key));
    } else if (!atMax) {
      onChange([...selected, key]);
    }
  }

  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {normalised.map((option) => {
        const isSelected = selected.includes(option.key);
        return (
          <Chip
            key={option.key}
            selected={isSelected}
            disabled={!isSelected && atMax}
            onClick={() => toggle(option.key)}
          >
            {option.emoji && <span aria-hidden>{option.emoji}</span>}
            {option.label}
          </Chip>
        );
      })}
    </div>
  );
}

export function SelectionCount({
  count,
  min,
  max,
}: {
  count: number;
  min?: number;
  max?: number;
}) {
  const short = min !== undefined && count < min;
  return (
    <p className={`mt-2 text-[13px] ${short ? "text-[var(--tint-ember-strong)]" : "text-muted"}`}>
      {count} selected
      {min !== undefined && count < min && ` — pick at least ${min}`}
      {max !== undefined && count >= max && ` — that's the maximum`}
    </p>
  );
}
