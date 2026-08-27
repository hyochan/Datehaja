import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Card,
  Chip,
  SectionHeading,
  Skeleton,
  Tag,
} from "../components/ui/primitives";

/**
 * The privacy page shows the user their own real projection — the exact object
 * another person receives — rather than describing it in prose and hoping.
 */
export default function PrivacyPage() {
  const visibility = useQuery(api.safety.myVisibility);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <div className="docket-label mb-2 text-[var(--accent-text)]">
          Public record · Privacy
        </div>
        <h1 className="text-[28px] leading-tight">Privacy</h1>
        <p className="mt-1.5 text-[15.5px] leading-relaxed text-soft">
          DateDrop's whole promise is that you can meet someone without handing
          over anything you'd rather keep. Here is exactly what that means.
        </p>
      </header>

      {visibility === undefined ? (
        <Skeleton className="h-64 w-full rounded-card" />
      ) : visibility === null ? (
        <Card className="p-6 text-[15px] text-soft">
          Sign in to see your own profile exactly as a match would.
        </Card>
      ) : (
        <>
          <section>
            <SectionHeading
              eyebrow="Before you both accept"
              title="What a match sees"
            />
            <Card className="p-5">
              <div className="text-[18px] font-medium">
                {visibility.beforeMatch.displayName} ·{" "}
                {visibility.beforeMatch.age}
              </div>
              <div className="mt-0.5 text-[14.5px] text-soft">
                {visibility.beforeMatch.area}
                {visibility.beforeMatch.occupation
                  ? ` · ${visibility.beforeMatch.occupation}`
                  : ""}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {visibility.beforeMatch.interests.map((interest: string) => (
                  <Chip key={interest} size="sm">
                    {interest}
                  </Chip>
                ))}
              </div>
              <p className="mt-4 text-[13.5px] leading-relaxed text-muted">
                Plus one or two sentences we write about why the two of you fit.
                That's the entire payload.
              </p>
            </Card>
          </section>

          <section>
            <SectionHeading
              eyebrow="After you both accept"
              title="What gets added"
            />
            <Card className="p-5">
              <p className="text-[15px] leading-relaxed">
                {visibility.afterMatch.photo === "No photo uploaded"
                  ? "Nothing new about you — you haven't added a photo. The venue's public address becomes visible to you both."
                  : "Your photo, and the venue's public address. Nothing else."}
              </p>
            </Card>
          </section>

          <section>
            <SectionHeading eyebrow="Never" title="What we never share" />
            <Card className="p-5">
              <ul className="space-y-2.5">
                {visibility.neverShared.map((item: string) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[15px]"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        </>
      )}

      <section>
        <SectionHeading
          eyebrow="How it works"
          title="Why the email comes from us"
        />
        <Card className="p-5">
          <p className="text-[15px] leading-relaxed">
            Every invitation, confirmation and reminder is sent by{" "}
            <strong className="font-medium">DateDrop Concierge</strong> from our
            own inbox. Your address is the recipient, never the sender, and
            never a CC. Two people on the same DateDrop are always emailed
            separately, so neither can see the other's address in a header.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed">
            If you reply to one of those emails, it comes back to us — not to
            your match.
          </p>
        </Card>
      </section>

      <section>
        <SectionHeading
          eyebrow="Location"
          title="How precise your location is"
        />
        <Card className="p-5">
          <p className="text-[15px] leading-relaxed">
            You pick a neighbourhood, not an address. We store the
            neighbourhood's approximate centre rounded to about a kilometre, and
            use it only to work out roughly where a date should happen. Your
            match sees the neighbourhood name and nothing more precise — never a
            distance in kilometres, because a distance plus a map inverts to a
            location.
          </p>
        </Card>
      </section>

      <section>
        <SectionHeading eyebrow="Text" title="What we strip out" />
        <Card className="p-5">
          <p className="text-[15px] leading-relaxed">
            Bios and notes are scrubbed for email addresses, phone numbers,
            links and messenger handles before anyone else can read them. It
            isn't that we don't trust you — it's that the product only works if
            nobody feels pressure to hand over contact details before they've
            met.
          </p>
        </Card>
      </section>

      <section>
        <SectionHeading eyebrow="Honesty" title="What we don't do" />
        <Card className="p-5">
          <div className="mb-3">
            <Tag tone="warn">No identity verification</Tag>
          </div>
          <p className="text-[15px] leading-relaxed">
            DateDrop does <strong className="font-medium">not</strong> verify
            anyone's identity. There is no ID check, no photo verification, and
            no background check. Please treat every match as someone you met on
            the internet, and read the{" "}
            <Link to="/safety" className="underline underline-offset-2">
              Safety Center
            </Link>{" "}
            before your first date.
          </p>
        </Card>
      </section>
    </div>
  );
}
