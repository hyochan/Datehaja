import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { DropCard, type DropSummary } from "../components/dates/DropCard";
import {
  Button,
  Card,
  Notice,
  SectionHeading,
  Skeleton,
  Tag,
} from "../components/ui/primitives";
import { readableError, useToast } from "../components/ui/Toast";

/**
 * Demo controls.
 *
 * A dating product needs two people. This screen lets one person experience the
 * whole loop by playing the other side — but only when the other side is a
 * clearly-marked fictional persona, and only on a DateDrop they're already in.
 */
export default function DemoPage() {
  const status = useQuery(api.demo.status);
  const personas = useQuery(api.demo.personas);
  const board = useQuery(api.dateDrops.dashboard);
  const respond = useMutation(api.demo.respondAsPersona);
  const reseed = useMutation(api.demo.reseed);
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const actionable = [
    ...((board?.waiting ?? []) as DropSummary[]),
    ...((board?.invitations ?? []) as DropSummary[]),
  ].filter((drop) => drop.isDemo || drop.match?.isDemo);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <div className="mb-2">
          <Tag tone="dusk">Demo mode</Tag>
        </div>
        <h1 className="text-[28px] leading-tight">Demo controls</h1>
        <p className="mt-1.5 text-[15.5px] leading-relaxed text-soft">
          DateDrop needs two people. These are fictional profiles seeded into this
          deployment so you can watch the whole loop — matching, research,
          invitation, acceptance, confirmation — without recruiting a friend.
        </p>
      </header>

      <Notice tone="info" title="These people are not real">
        Every persona below is invented. They are labelled as demo profiles
        everywhere they appear, they never receive email, and you can switch them
        off entirely in{" "}
        <Link to="/settings" className="underline underline-offset-2">
          Settings
        </Link>
        .
      </Notice>

      {status && !status.enabledForMe && (
        <Notice tone="warn" title="Demo matching is off for your account">
          Turn "Include demo profiles" back on in Settings to be matched with
          these personas.
        </Notice>
      )}

      {/* -------------------------- act as a persona ------------------------- */}
      <section>
        <SectionHeading
          eyebrow="The other side"
          title="Respond on their behalf"
        />
        {board === undefined ? (
          <Skeleton className="h-28 w-full rounded-card" />
        ) : actionable.length === 0 ? (
          <Card className="p-5">
            <p className="text-[15px] leading-relaxed text-soft">
              Nothing to respond to yet. Accept a DateDrop with a demo profile
              first — then come back here and play their side.
            </p>
            <div className="mt-4">
              <Link
                to="/dashboard"
                className="text-[14px] font-medium text-[var(--accent-text)] hover:underline"
              >
                Go to your DateDrops
              </Link>
            </div>
          </Card>
        ) : (
          <ul className="space-y-4">
            {actionable.map((drop) => (
              <li key={drop.dropId}>
                <ul className="mb-2">
                  <DropCard drop={drop} />
                </ul>
                <div className="flex flex-wrap gap-2 px-1">
                  <Button
                    size="sm"
                    loading={busy === `${drop.dropId}-accept`}
                    onClick={async () => {
                      setBusy(`${drop.dropId}-accept`);
                      try {
                        const result = await respond({
                          dropId: drop.dropId as Id<"dateDrops">,
                          response: "accept",
                        });
                        toast(
                          result.confirmed
                            ? `${result.personaName} accepted — it's a date.`
                            : `${result.personaName} accepted.`,
                          "success",
                        );
                      } catch (e) {
                        toast(readableError(e), "error");
                      } finally {
                        setBusy(null);
                      }
                    }}
                  >
                    They accept
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={busy === `${drop.dropId}-pass`}
                    onClick={async () => {
                      setBusy(`${drop.dropId}-pass`);
                      try {
                        const result = await respond({
                          dropId: drop.dropId as Id<"dateDrops">,
                          response: "pass",
                        });
                        toast(
                          `${result.personaName} passed — we're looking for a replacement.`,
                          "info",
                        );
                      } catch (e) {
                        toast(readableError(e), "error");
                      } finally {
                        setBusy(null);
                      }
                    }}
                  >
                    They pass
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 px-1 text-[13px] leading-relaxed text-muted">
          "They pass" is the interesting one: DateDrop keeps your acceptance
          alive and starts looking for someone else who fits the same plan,
          rather than cancelling on you.
        </p>
      </section>

      {/* ------------------------------ personas ----------------------------- */}
      <section>
        <SectionHeading
          eyebrow={`${status?.personaCount ?? 0} personas · ${status?.openWindowCount ?? 0} open windows`}
          title="Who's in the pool"
          action={
            <Button
              variant="ghost"
              size="sm"
              loading={busy === "reseed"}
              onClick={async () => {
                setBusy("reseed");
                try {
                  const result = await reseed({});
                  toast(
                    `Topped up: ${result.created} personas, ${result.windows} windows.`,
                    "success",
                  );
                } catch (e) {
                  toast(readableError(e), "error");
                } finally {
                  setBusy(null);
                }
              }}
            >
              Top up availability
            </Button>
          }
        />
        {personas === undefined ? (
          <Skeleton className="h-64 w-full rounded-card" />
        ) : (
          <Card className="divide-y divide-[var(--border)]">
            {personas.map(
              (persona: {
                userId: string;
                displayName: string;
                age: number;
                area: string;
                occupation: string | null | undefined;
                interests: string[];
                openWindows: number;
              }) => (
                <div key={persona.userId} className="flex items-center gap-4 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--tint-dusk-bg)] text-[15px] font-semibold text-[var(--tint-dusk-fg)]">
                    {persona.displayName.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-medium">
                      {persona.displayName} · {persona.age}
                    </div>
                    <div className="truncate text-[13px] text-muted">
                      {persona.area}
                      {persona.occupation ? ` · ${persona.occupation}` : ""} ·{" "}
                      {persona.interests.join(" · ")}
                    </div>
                  </div>
                  <span className="shrink-0 text-[12.5px] text-muted">
                    {persona.openWindows} free
                  </span>
                </div>
              ),
            )}
          </Card>
        )}
      </section>

      <section>
        <SectionHeading eyebrow="For judges" title="The 60-second run-through" />
        <Card className="p-5">
          <ol className="space-y-2.5 text-[15px] leading-relaxed">
            {[
              "Add an evening you're free on the Availability page.",
              "Hit “Find me a date” on the dashboard and watch the stages advance — each one is a real Convex document update, not a timer.",
              "Open the DateDrop that lands. Expand “How we built this” to see the live pages Firecrawl crawled and the model runs behind the plan.",
              "Accept it.",
              "Come back here and hit “They accept”. If you have a second browser open on the same account, watch it flip to “It's a date” without a refresh.",
              "Or hit “They pass” instead, and watch DateDrop go looking for a replacement while keeping your evening held.",
            ].map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="mt-0.5 w-4 shrink-0 text-[13px] font-semibold text-[var(--accent-text)]">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Card>
      </section>
    </div>
  );
}
