import { Link } from "react-router-dom";
import { Card, Tag, cx } from "../ui/primitives";
import { Logo } from "../layout/Logo";
import { countdown, formatDateTime } from "../../lib/format";
import { dropStatusLabel } from "../../lib/status";

export type DropSummary = {
  dropId: string;
  status: string;
  myState: string;
  title: string;
  theme: string;
  area: string;
  city: string;
  timezone: string;
  startMs: number;
  costLabel: string;
  confirmDeadlineMs: number;
  isDemo: boolean;
  awaitingOther: boolean;
  match: {
    displayName: string;
    age: number;
    area: string;
    occupation: string | null;
    interests: string[];
    isDemo: boolean;
  } | null;
};

export function DropCard({
  drop,
  variant = "default",
}: {
  drop: DropSummary;
  variant?: "default" | "invitation" | "confirmed";
}) {
  return (
    <Card
      as="li"
      className={cx(
        "group overflow-hidden transition-[transform,box-shadow] duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[var(--shadow-lift)]",
        variant === "invitation" && "border-[var(--tint-ember-border)]",
        variant === "confirmed" && "border-[var(--tint-sage-border)]",
      )}
    >
      <Link to={`/drop/${drop.dropId}`} className="block p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <StatusTag drop={drop} variant={variant} />
          {variant === "invitation" && (
            <span className="text-[12.5px] font-medium text-muted">
              {countdown(drop.confirmDeadlineMs)}
            </span>
          )}
        </div>

        <div className="font-display text-[21px] leading-tight">
          {formatDateTime(drop.startMs, drop.timezone)}
        </div>
        <div className="mt-1 text-[14.5px] text-soft">
          {drop.area}, {drop.city}
        </div>

        <p className="mt-3 text-[15px] leading-relaxed">
          {drop.theme || drop.title}
        </p>

        {drop.match && (
          <div className="mt-4 flex items-center gap-2.5 border-t border-[var(--border)] pt-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] border border-[var(--tint-ember-border)] bg-[var(--tint-ember-bg)] font-mono text-[12px] font-semibold text-[var(--tint-ember-strong)]">
              {drop.match.displayName.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-medium">
                {drop.match.displayName} · {drop.match.age}
                {drop.match.occupation ? ` · ${drop.match.occupation}` : ""}
              </div>
              <div className="truncate text-[12.5px] text-muted">
                {drop.match.interests.slice(0, 3).join(" · ")}
              </div>
            </div>
            <span className="shrink-0 font-mono text-[11px] text-muted">
              {drop.costLabel}
            </span>
          </div>
        )}

        {drop.isDemo && (
          <div className="mt-3">
            <Tag tone="dusk">Demo profile</Tag>
          </div>
        )}
      </Link>
    </Card>
  );
}

function StatusTag({
  drop,
  variant,
}: {
  drop: DropSummary;
  variant: "default" | "invitation" | "confirmed";
}) {
  if (variant === "invitation") {
    return (
      <span className="docket-label inline-flex items-center gap-1.5 rounded-[2px] border border-[var(--tint-ember-border)] bg-[var(--tint-ember-bg)] px-2.5 py-1 text-[var(--tint-ember-fg)]">
        <Logo className="h-3.5 w-3.5" />
        New DateDrop
      </span>
    );
  }
  const { label, tone } = dropStatusLabel(drop.status, drop.myState);
  return <Tag tone={tone}>{label}</Tag>;
}
