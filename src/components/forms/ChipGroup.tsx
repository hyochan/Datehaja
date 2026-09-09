import { Chip } from "../ui/primitives";
import { useI18n } from "../../i18n";

/**
 * `onChange` receives an updater rather than the next array.
 *
 * Two taps landing in the same React batch — a fast double tap, an accidental
 * repeat on touch — would both read the same stale selection and the second
 * would silently clobber the first. Passing an updater makes each toggle apply
 * to whatever the selection actually is when React processes it.
 */
export type ChipChange = (updater: (previous: string[]) => string[]) => void;

export function ChipGroup({
  options,
  selected,
  onChange,
  max,
  ariaLabel,
}: {
  options: ReadonlyArray<
    string | { key: string; label: string; emoji?: string }
  >;
  selected: string[];
  onChange: ChipChange;
  max?: number;
  ariaLabel?: string;
}) {
  const { t } = useI18n();
  const normalised = options.map((option) =>
    typeof option === "string"
      ? { key: option, label: option, emoji: undefined }
      : option,
  );
  const atMax = max !== undefined && selected.length >= max;

  function toggle(key: string) {
    onChange((previous) => {
      if (previous.includes(key)) return previous.filter((s) => s !== key);
      if (max !== undefined && previous.length >= max) return previous;
      return [...previous, key];
    });
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
            {t(option.label)}
          </Chip>
        );
      })}
    </div>
  );
}

/** Single-select variant — the same chips, but exactly one stays lit. */
export function ChipRadio<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: ReadonlyArray<{ key: T; label: string; emoji?: string }>;
  value: T;
  onChange: (next: T) => void;
  ariaLabel?: string;
}) {
  const { t } = useI18n();
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Chip
          key={option.key}
          selected={value === option.key}
          onClick={() => onChange(option.key)}
        >
          {option.emoji && <span aria-hidden>{option.emoji}</span>}
          {t(option.label)}
        </Chip>
      ))}
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
  const { t } = useI18n();
  const short = min !== undefined && count < min;
  return (
    <p
      className={`mt-2 text-[13px] ${short ? "text-[var(--tint-ember-strong)]" : "text-muted"}`}
    >
      {t("{count} selected", { count })}
      {min !== undefined &&
        count < min &&
        t(" — pick at least {count}", { count: min })}
      {max !== undefined && count >= max && t(" — that's the maximum")}
    </p>
  );
}
