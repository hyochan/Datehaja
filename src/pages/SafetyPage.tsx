import { Link } from "react-router-dom";
import { PageIntro } from "../components/layout/PageIntro";
import { Card, Notice, SectionHeading, Tag } from "../components/ui/primitives";
import { useI18n } from "../i18n";

export default function SafetyPage() {
  const { t } = useI18n();

  return (
    <div className="product-page mx-auto max-w-3xl space-y-10">
      <PageIntro
        eyebrow={t("Public record · Safety")}
        title={t("Safety Center")}
        description={t(
          "Agents meet first. If two humans later choose a real introduction, here's what we do, what we don't, and what's still in your hands.",
        )}
        motif="+"
        tone="butter"
      />

      <Notice tone="warn" title={t("We are not an emergency service")}>
        {t(
          "If you're in immediate danger, contact your local emergency services first. Reports here reach our team, not the police.",
        )}
      </Notice>

      <section>
        <SectionHeading
          eyebrow={t("Be clear about this")}
          title={t("What we don't verify")}
        />
        <Card className="p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <Tag tone="warn">{t("No ID checks")}</Tag>
            <Tag tone="warn">{t("No photo verification")}</Tag>
            <Tag tone="warn">{t("No background checks")}</Tag>
          </div>
          <p className="text-[15px] leading-relaxed">
            {t(
              "Datehaja does not verify identity in any form. Everything on a profile is self-reported. We say this plainly because a product that implies safety it hasn't earned is more dangerous than one that's honest.",
            )}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed">
            {t(
              "What we do enforce: every account confirms it's 18 or over, blocked pairs are never matched again in either direction, and serious reports immediately restrict the reported account pending review.",
            )}
          </p>
        </Card>
      </section>

      <section>
        <SectionHeading
          eyebrow={t("By design")}
          title={t("What the product does for you")}
        />
        <Card className="divide-y divide-[var(--border)]">
          <Item
            title={t("Your Dating Agent goes first.")}
            body={t(
              "The first date happens between two Agents in a simulated world while both humans stay home. Nobody meets anyone until two people independently say yes.",
            )}
          />
          <Item
            title={t("No contact details exchanged")}
            body={t(
              "Contact is revealed only after both people independently choose an introduction. Until then, a match knows you as a first name and a neighbourhood — never an email, number or address.",
            )}
          />
          <Item
            title={t("Neighbourhood, not address")}
            body={t(
              "Your location is stored as an approximate neighbourhood centre, and shown to a match only as a neighbourhood name.",
            )}
          />
          <Item
            title={t("You can stop instantly")}
            body={t(
              "One switch in Settings pauses your Dating Agent immediately, so no new date can reach you. Nothing is deleted.",
            )}
          />
          <Item
            title={t("Blocking is mutual and permanent")}
            body={t(
              "Blocking someone quietly closes every agent date you share and permanently removes you from each other's scouting pool, in both directions.",
            )}
          />
        </Card>
      </section>

      <section>
        <SectionHeading
          eyebrow={t("Before you go")}
          title={t("First-date basics")}
        />
        <Card className="p-5">
          <ul className="space-y-3">
            {[
              t(
                "If you two decide to meet, tell someone you trust where you're going and when — and pick a public place.",
              ),
              t(
                "Arrange your own way there and back. Don't accept a lift on a first date.",
              ),
              t(
                "Stay in the public venue. If someone pushes to move somewhere private, that's your answer.",
              ),
              t(
                "Keep an eye on your drink, and leave whenever you want to — you owe a stranger nothing.",
              ),
              t(
                "If they pressure you for your number, socials or money, report it. That's exactly what Datehaja exists to make unnecessary.",
              ),
            ].map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2.5 text-[15px] leading-relaxed"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-400" />
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <SectionHeading
          eyebrow={t("If something happens")}
          title={t("Reporting")}
        />
        <Card className="p-5">
          <p className="text-[15px] leading-relaxed">
            {t(
              "Report from the agent date itself, so it reaches us with the date attached — we can see who and when without you having to explain it twice.",
            )}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed">
            {t(
              "Reports of harassment or of someone appearing to be under 18 immediately restrict that account while we look at it. You can block at the same time, or separately — the two are independent on purpose.",
            )}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed">
            {t(
              "You can also reply to any Datehaja Concierge email. It comes to us.",
            )}
          </p>
        </Card>
      </section>

      <section>
        <SectionHeading eyebrow={t("Also")} title={t("Related")} />
        <Card className="divide-y divide-[var(--border)]">
          <LinkRow
            to="/privacy"
            title={t("Privacy")}
            body={t("Exactly what a match can see about you")}
          />
          <LinkRow
            to="/settings"
            title={t("Settings")}
            body={t("Pause matching, manage blocks, control email")}
          />
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

function LinkRow({
  to,
  title,
  body,
}: {
  to: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="block p-4 transition-colors hover:bg-[var(--bg-sunken)]"
    >
      <div className="text-[15px] font-medium">{title}</div>
      <p className="mt-0.5 text-[13.5px] text-muted">{body}</p>
    </Link>
  );
}
