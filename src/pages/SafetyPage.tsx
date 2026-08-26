import { Link } from "react-router-dom";
import { Card, Notice, SectionHeading, Tag } from "../components/ui/primitives";

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <h1 className="text-[28px] leading-tight">Safety Center</h1>
        <p className="mt-1.5 text-[15.5px] leading-relaxed text-soft">
          DateDrop sends you to meet a stranger in public. Here's what we do, what
          we don't, and what's in your hands.
        </p>
      </header>

      <Notice tone="warn" title="We are not an emergency service">
        If you're in immediate danger, contact your local emergency services
        first. Reports here reach our team, not the police.
      </Notice>

      <section>
        <SectionHeading eyebrow="Be clear about this" title="What we don't verify" />
        <Card className="p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <Tag tone="warn">No ID checks</Tag>
            <Tag tone="warn">No photo verification</Tag>
            <Tag tone="warn">No background checks</Tag>
          </div>
          <p className="text-[15px] leading-relaxed">
            DateDrop does not verify identity in any form. Everything on a profile
            is self-reported. We say this plainly because a product that implies
            safety it hasn't earned is more dangerous than one that's honest.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed">
            What we do enforce: every account confirms it's 18 or over, blocked
            pairs are never matched again in either direction, and serious reports
            immediately restrict the reported account pending review.
          </p>
        </Card>
      </section>

      <section>
        <SectionHeading eyebrow="By design" title="What the product does for you" />
        <Card className="divide-y divide-[var(--border)]">
          <Item
            title="Public places only"
            body="Every DateDrop is planned at a real, public, currently-operating venue found through live web research. We never plan anything at a private address."
          />
          <Item
            title="No contact details exchanged"
            body="You can complete an entire date without your match ever having your email, number or socials. Nothing in the product asks you to hand them over."
          />
          <Item
            title="Neighbourhood, not address"
            body="Your location is stored as an approximate neighbourhood centre, and shown to a match only as a neighbourhood name."
          />
          <Item
            title="You can stop instantly"
            body="One switch in Settings pauses DateDrops entirely — including searches already running. Nothing is deleted."
          />
          <Item
            title="Blocking is mutual and permanent"
            body="Blocking someone cancels any DateDrop you share, frees both evenings, and permanently removes you from each other's candidate pool."
          />
        </Card>
      </section>

      <section>
        <SectionHeading eyebrow="Before you go" title="First-date basics" />
        <Card className="p-5">
          <ul className="space-y-3">
            {[
              "Tell someone you trust where you're going and when. The DateDrop page has the venue, address and time — it's built to be forwarded.",
              "Arrange your own way there and back. Don't accept a lift on a first date.",
              "Stay in the public venue. If someone pushes to move somewhere private, that's your answer.",
              "Keep an eye on your drink, and leave whenever you want to — you owe a stranger nothing.",
              "If they pressure you for your number, socials or money, report it. That's exactly what DateDrop exists to make unnecessary.",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2.5 text-[15px] leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-400" />
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <SectionHeading eyebrow="If something happens" title="Reporting" />
        <Card className="p-5">
          <p className="text-[15px] leading-relaxed">
            Open the DateDrop and use <strong className="font-medium">Report</strong> at
            the bottom of the page. The report reaches us with the DateDrop
            attached, so we can see who, when and where without you having to
            explain it twice.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed">
            Reports of harassment or of someone appearing to be under 18
            immediately restrict that account while we look at it. You can block at
            the same time, or separately — the two are independent on purpose.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed">
            You can also reply to any DateDrop Concierge email. It comes to us.
          </p>
        </Card>
      </section>

      <section>
        <SectionHeading eyebrow="Also" title="Related" />
        <Card className="divide-y divide-[var(--border)]">
          <LinkRow to="/privacy" title="Privacy" body="Exactly what a match can see about you" />
          <LinkRow to="/settings" title="Settings" body="Pause DateDrops, manage blocks, control email" />
        </Card>
      </section>
    </div>
  );
}

function Item({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-4">
      <div className="text-[15px] font-medium">{title}</div>
      <p className="mt-1 text-[14px] leading-relaxed text-soft">{body}</p>
    </div>
  );
}

function LinkRow({ to, title, body }: { to: string; title: string; body: string }) {
  return (
    <Link to={to} className="block p-4 transition-colors hover:bg-[var(--bg-sunken)]">
      <div className="text-[15px] font-medium">{title}</div>
      <p className="mt-0.5 text-[13.5px] text-muted">{body}</p>
    </Link>
  );
}
