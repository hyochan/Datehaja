/* oxlint-disable react/only-export-components -- component utilities and primitives share one module */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

/* --------------------------------- utils --------------------------------- */

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* -------------------------------- Button ---------------------------------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "quiet";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full border font-bold tracking-[-0.01em] transition-[transform,background-color,border-color,color,box-shadow] duration-200 active:translate-y-px disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "border-ember-600 bg-ember-600 text-white shadow-[0_12px_24px_-14px_var(--shadow-ink)] hover:-translate-y-0.5 hover:bg-ember-700 hover:shadow-[0_16px_30px_-14px_var(--shadow-ink)]",
  secondary:
    "border-[var(--border)] bg-[var(--bg-raised)] text-[var(--text)] shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:border-[var(--tint-ember-border)] hover:bg-[var(--tint-ember-bg)]",
  ghost:
    "border-transparent text-[var(--text-soft)] hover:border-[var(--border)] hover:text-[var(--text)]",
  quiet:
    "border-[var(--border)] bg-[var(--bg-sunken)] text-[var(--text)] hover:border-[var(--tint-ember-border)] hover:bg-[var(--tint-ember-bg)]",
  danger:
    "border-[var(--tint-ember-border)] bg-[var(--bg-raised)] text-[var(--tint-ember-strong)] hover:bg-[var(--tint-ember-bg)]",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5.5 text-[15px]",
  lg: "h-13 px-7.5 text-[16px]",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cx(
        BUTTON_BASE,
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        fullWidth && "w-full",
        className,
      )}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function LinkButton({
  to,
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
}: {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cx(
        BUTTON_BASE,
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        fullWidth && "w-full",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/* -------------------------------- Spinner --------------------------------- */

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cx("animate-spin", className ?? "h-5 w-5")}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.22"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* --------------------------------- Card ----------------------------------- */

export function Card({
  children,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  return <As className={cx("surface", className)}>{children}</As>;
}

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading mb-5 flex items-end justify-between gap-4">
      <div className="section-heading-copy">
        {eyebrow && (
          <div className="section-heading-eyebrow docket-label mb-1 text-muted">
            {eyebrow}
          </div>
        )}
        <h2 className="text-[22px] leading-tight">{title}</h2>
      </div>
      <span className="section-heading-rule" aria-hidden />
      {action}
    </div>
  );
}

/* --------------------------------- Chip ----------------------------------- */

export function Chip({
  selected,
  onClick,
  children,
  disabled,
  size = "md",
}: {
  /** Omit entirely for a one-shot action chip — `aria-pressed` is only
   *  correct on a chip that actually toggles. */
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  const Tag = onClick ? "button" : "span";
  const isToggle = onClick !== undefined && selected !== undefined;
  return (
    <Tag
      {...(onClick ? { type: "button" as const, onClick, disabled } : {})}
      aria-pressed={isToggle ? Boolean(selected) : undefined}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border transition-colors duration-150",
        size === "sm" ? "px-2.5 py-1 text-[12px]" : "px-3.5 py-2 text-[14px]",
        selected
          ? "border-[var(--tint-ember-border)] bg-[var(--tint-ember-bg)] text-[var(--tint-ember-fg)] font-medium"
          : "border-[var(--border-strong)] bg-[var(--bg-raised)] text-[var(--text-soft)]",
        onClick &&
          !selected &&
          "hover:border-[var(--tint-ember-border)] hover:text-[var(--text)]",
        disabled && "opacity-40 pointer-events-none",
      )}
    >
      {children}
    </Tag>
  );
}

export function Tag({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "ember" | "sage" | "dusk" | "warn";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-[var(--bg-sunken)] text-[var(--text-soft)]",
    ember: "bg-[var(--tint-ember-bg)] text-[var(--tint-ember-fg)]",
    sage: "bg-[var(--tint-sage-bg)] text-[var(--tint-sage-fg)]",
    dusk: "bg-[var(--tint-dusk-bg)] text-[var(--tint-dusk-fg)]",
    warn: "bg-[var(--tint-warn-bg)] text-[var(--tint-warn-fg)]",
  };
  return (
    <span
      className={cx(
        "docket-label inline-flex items-center gap-1 rounded-full border border-transparent px-2.5 py-1",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

/* --------------------------------- Fields --------------------------------- */

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
  optional,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
  htmlFor?: string;
  optional?: boolean;
}) {
  return (
    <div className="mb-5">
      <label
        htmlFor={htmlFor}
        className="mb-1.5 flex items-baseline gap-2 text-[14px] font-medium"
      >
        {label}
        {optional && (
          <span className="text-[12px] font-normal text-muted">optional</span>
        )}
      </label>
      {hint && (
        <p className="mb-2 text-[13px] leading-relaxed text-muted">{hint}</p>
      )}
      {children}
      {error && (
        <p
          role="alert"
          className="mt-1.5 text-[13px] text-[var(--tint-ember-strong)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

const CONTROL =
  "w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-3 text-[15px] shadow-[0_5px_18px_-16px_var(--shadow-ink)] transition-[border-color,box-shadow] placeholder:text-[var(--text-muted)] focus:border-ember-400 focus:outline-none focus-visible:outline-none focus:ring-3 focus:ring-ember-200/30";

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean },
) {
  const { className, invalid, ...rest } = props;
  return (
    <input
      {...rest}
      aria-invalid={invalid || undefined}
      className={cx(
        CONTROL,
        invalid && "border-[var(--tint-ember-border)]",
        className,
      )}
    />
  );
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const { className, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={cx(CONTROL, "min-h-28 resize-y", className)}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, children, ...rest } = props;
  return (
    <select
      {...rest}
      className={cx(CONTROL, "appearance-none pr-9", className)}
    >
      {children}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        "flex w-full items-start gap-3.5 rounded-2xl border border-transparent px-3.5 py-3 text-left transition-colors hover:border-[var(--border)] hover:bg-[var(--bg-sunken)]",
        disabled && "opacity-50 pointer-events-none",
      )}
    >
      <span
        className={cx(
          "mt-0.5 inline-flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors",
          checked ? "bg-ember-400" : "bg-[var(--border-strong)]",
        )}
      >
        <span
          className={cx(
            "h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-medium">{label}</span>
        {description && (
          <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (next: T) => void;
  options: Array<{ value: T; label: string }>;
  ariaLabel?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-sunken)] p-1"
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          // A radiogroup is a single tab stop; arrows move within it.
          tabIndex={value === option.value ? 0 : -1}
          onKeyDown={(event) => {
            const delta =
              event.key === "ArrowRight" || event.key === "ArrowDown"
                ? 1
                : event.key === "ArrowLeft" || event.key === "ArrowUp"
                  ? -1
                  : 0;
            if (delta === 0) return;
            event.preventDefault();
            const next =
              options[(index + delta + options.length) % options.length];
            onChange(next.value);
            const group = event.currentTarget.parentElement;
            const buttons =
              group?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
            buttons?.[
              (index + delta + options.length) % options.length
            ]?.focus();
          }}
          onClick={() => onChange(option.value)}
          className={cx(
            "flex-1 rounded-xl border px-3 py-2 text-[14px] font-medium transition-colors",
            value === option.value
              ? "border-[var(--border-strong)] bg-[var(--bg-raised)] text-[var(--text)]"
              : "border-transparent text-muted hover:text-[var(--text)]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------- Empty state ------------------------------ */

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {icon && <div className="mb-4 text-ember-300">{icon}</div>}
      <h3 className="mb-2 text-[19px]">{title}</h3>
      <p className="mx-auto mb-5 max-w-sm text-[14.5px] leading-relaxed text-muted">
        {body}
      </p>
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton", className ?? "h-4 w-full")} />;
}

/* --------------------------------- Alert ---------------------------------- */

export function Notice({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warn" | "success";
  title?: string;
  children: ReactNode;
}) {
  const tones = {
    info: "border-[var(--tint-dusk-border)] bg-[var(--tint-dusk-bg)]",
    warn: "border-[var(--tint-ember-border)] bg-[var(--tint-ember-bg)]",
    success: "border-[var(--tint-sage-border)] bg-[var(--tint-sage-bg)]",
  };
  return (
    <div
      className={cx("rounded-2xl border px-4 py-3.5 text-[14px]", tones[tone])}
    >
      {title && <div className="mb-1 font-semibold">{title}</div>}
      <div className="leading-relaxed text-[var(--text-soft)]">{children}</div>
    </div>
  );
}
