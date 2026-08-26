import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { DropCard, type DropSummary } from "../components/dates/DropCard";
import { Card, EmptyState, LinkButton, Skeleton } from "../components/ui/primitives";

export default function HistoryPage() {
  const board = useQuery(api.dateDrops.dashboard);

  if (board === undefined) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-28 w-full rounded-card" />
        <Skeleton className="h-28 w-full rounded-card" />
      </div>
    );
  }

  const history = (board?.history ?? []) as DropSummary[];
  const upcoming = (board?.upcoming ?? []) as DropSummary[];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <h1 className="text-[28px] leading-tight">History</h1>
        <p className="mt-1.5 text-[15px] text-soft">
          Every DateDrop you've been part of — accepted, passed, expired or done.
        </p>
      </header>

      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-3 text-[19px]">Coming up</h2>
          <ul className="space-y-3">
            {upcoming.map((drop) => (
              <DropCard key={drop.dropId} drop={drop} variant="confirmed" />
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-[19px]">Past</h2>
        {history.length === 0 ? (
          <Card>
            <EmptyState
              title="Nothing here yet"
              body="Your first DateDrop will show up here once you've responded to it."
              action={<LinkButton to="/availability">Add availability</LinkButton>}
            />
          </Card>
        ) : (
          <ul className="space-y-3">
            {history.map((drop) => (
              <DropCard key={drop.dropId} drop={drop} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
