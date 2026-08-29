import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { LEGAL_CONTACT_EMAIL, LEGAL_EFFECTIVE_DATE } from "@convex/lib/legal";
import { LegalSection } from "../components/legal/LegalDocument";
import { PageIntro } from "../components/layout/PageIntro";
import {
  Card,
  Chip,
  SectionHeading,
  Skeleton,
  Tag,
} from "../components/ui/primitives";
import { useI18n } from "../i18n";

/**
 * The privacy page shows the user their own real projection — the exact object
 * another person receives — rather than describing it in prose and hoping.
 */
export default function PrivacyPage() {
  const visibility = useQuery(api.safety.myVisibility);
  const { t } = useI18n();

  return (
    <div className="product-page mx-auto max-w-3xl space-y-10">
      <PageIntro
        eyebrow={t("Public record · Privacy")}
        title={t("Privacy")}
        description={t(
          "Datehaja's whole promise is that you can meet someone without handing over anything you'd rather keep. Here is exactly what that means.",
        )}
        motif="◎"
        tone="sage"
      />

      <Card className="legal-document-meta p-4 sm:p-5">
        <div>
          <div className="docket-label text-[var(--accent-text)]">
            Privacy Notice · effective {LEGAL_EFFECTIVE_DATE}
          </div>
          <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-soft">
            Datehaja is an independent, pre-commercial beta operated from the
            Republic of Korea. Privacy questions and data requests:{" "}
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
          </p>
        </div>
        <div className="rounded-full bg-[var(--tint-sage-bg)] px-3 py-2 text-[11px] font-bold text-[var(--tint-sage-fg)]">
          No sale · No targeted ads
        </div>
      </Card>

      <LegalSection number="01" title="The data we process and why">
        <p>
          To provide the service, Datehaja processes account and authentication
          data; age and date of birth; profile, gender, match, activity,
          availability, location-at-neighbourhood-level, budget, dietary and
          accessibility preferences; preferred meeting areas and whether they
          are strict boundaries; self-described personality and style; optional
          photos and their visibility setting; invitations and answers; safety
          reports, blocks, trusted-contact details and private feedback;
          calendar-feed state; and technical, email-delivery, research, AI, and
          audit records.
        </p>
        <p>
          Core account, matching, invitation, venue-planning, calendar, and
          safety processing is necessary to provide the service you request.
          Abuse prevention, security, debugging, and service integrity support
          Datehaja&apos;s legitimate interests. Optional photo, trusted-contact,
          and feedback features run only when you choose to use them. Datehaja
          does not use profile data for targeted advertising.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Automation and service providers">
        <p>
          Deterministic rules enforce age, mutual interest, availability,
          distance, blocks, and other hard requirements. AI may rank only the
          eligible shortlist and compose a plan from researched venue evidence.
          AI payloads exclude email, exact coordinates, date of birth, phone
          number, and surname. There is no solely automated decision with legal
          or similarly significant effect: you decide whether to accept and
          attend.
        </p>
        <p>
          Matching may use stated activity, personality and style preferences,
          including “no preference”, plus a conservatively weighted trust signal
          based on profile accuracy, attendance, respect and safety feedback.
          “Meet again” answers and attractiveness are never used as popularity
          scores. The main reasons for a match are shown on its profile card.
        </p>
        <p>
          Datehaja uses Convex for application data and authentication, OpenAI
          for eligible-candidate ranking and plan composition, Firecrawl for
          public-web venue research, AgentMail for separate private emails, and
          Vercel/Convex for web delivery. These providers may process data in
          other countries under their contractual and legal transfer safeguards.
          Google Calendar, Apple Calendar, maps, and venue sites receive data
          only when you choose to open or subscribe to them.
        </p>
      </LegalSection>

      <LegalSection number="03" title="Retention, security, and your choices">
        <p>
          Account and date data is kept while your account is active and as
          needed to provide history, resolve a live plan, secure the service,
          investigate a safety report, meet legal obligations, or resolve a
          dispute. Datehaja deletes or de-identifies data when it is no longer
          needed under those criteria; limited backup copies may remain until
          normal backup rotation completes. Safety, fraud, and audit records may
          be retained longer when necessary to protect people.
        </p>
        <p>
          You can correct profile and preference data in the app, pause matching
          immediately, revoke a private calendar feed, remove optional data, or
          ask for access, correction, export, restriction, objection, or
          deletion by emailing{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
          Datehaja may verify that a request comes from the account holder and
          may retain information where law or safety requires it. You may also
          complain to Korea&apos;s Personal Information Protection Commission or
          the data-protection authority where you live.
        </p>
      </LegalSection>

      <LegalSection number="04" title="Local storage, age, and changes">
        <p>
          Datehaja does not run advertising trackers. Essential authentication
          state keeps you signed in; local storage remembers language and theme.
          The service is for adults aged 18 or over and is not directed to
          children. If this notice changes materially, the effective date and
          version change and signed-in users are asked to review it again when
          required.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Private reviews and mutual follow-up">
        <p>
          Each participant may privately review whether the date happened,
          profile accuracy, respect, conversational comfort, safety, the venue,
          and whether they would meet again. Review text and individual answers
          are not shown to the other participant. If and only if both people
          explicitly choose “yes” to meeting again, Datehaja tells both that the
          interest is mutual. A no, maybe, non-response, and who answered first
          remain private.
        </p>
      </LegalSection>

      {visibility === undefined ? (
        <Skeleton className="h-64 w-full rounded-card" />
      ) : visibility === null ? (
        <Card className="p-6 text-[15px] text-soft">
          {t("Sign in to see your own profile exactly as a match would.")}
        </Card>
      ) : (
        <>
          <section>
            <SectionHeading
              eyebrow={t("Your match card")}
              title={t("What a match sees")}
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
              {visibility.beforeMatch.bio && (
                <p className="mt-4 whitespace-pre-line text-[14.5px] leading-relaxed text-soft">
                  {visibility.beforeMatch.bio}
                </p>
              )}
              <p className="mt-4 text-[13.5px] leading-relaxed text-muted">
                {t(
                  "Plus one or two sentences we write about why the two of you fit. That's the entire payload.",
                )}
              </p>
            </Card>
          </section>

          <section>
            <SectionHeading
              eyebrow={t("After you both accept")}
              title={t("What gets added")}
            />
            <Card className="p-5">
              <p className="text-[15px] leading-relaxed">
                {visibility.afterMatch.photo === "No photo uploaded"
                  ? t(
                      "Nothing new about you — you haven't added a photo. The venue's public address becomes visible to you both.",
                    )
                  : visibility.afterMatch.photoVisibility === "with_match"
                    ? t(
                        "Your photo is already on the match card by your choice. The venue's public address is added after you both accept.",
                      )
                    : t(
                        "Your photo, and the venue's public address. Nothing else.",
                      )}
              </p>
            </Card>
          </section>

          <section>
            <SectionHeading
              eyebrow={t("Never")}
              title={t("What we never share")}
            />
            <Card className="p-5">
              <ul className="space-y-2.5">
                {visibility.neverShared.map((item: string) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[15px]"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-400" />
                    {t(item)}
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        </>
      )}

      <section>
        <SectionHeading
          eyebrow={t("How it works")}
          title={t("Why the email comes from us")}
        />
        <Card className="p-5">
          <p className="text-[15px] leading-relaxed">
            {t("Every invitation, confirmation and reminder is sent by")}{" "}
            <strong className="font-medium">Datehaja Concierge</strong>{" "}
            {t(
              "from our own inbox. Your address is the recipient, never the sender, and never a CC. Two people on the same date plan are always emailed separately, so neither can see the other's address in a header.",
            )}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed">
            {t(
              "If you reply to one of those emails, it comes back to us — not to your match.",
            )}
          </p>
        </Card>
      </section>

      <section>
        <SectionHeading
          eyebrow={t("Location")}
          title={t("How precise your location is")}
        />
        <Card className="p-5">
          <p className="text-[15px] leading-relaxed">
            {t(
              "You pick a neighbourhood, not an address. We store the neighbourhood's approximate centre rounded to about a kilometre, and use it only to work out roughly where a date should happen. Your match sees the neighbourhood name and nothing more precise — never a distance in kilometres, because a distance plus a map inverts to a location.",
            )}
          </p>
        </Card>
      </section>

      <section>
        <SectionHeading eyebrow={t("Text")} title={t("What we strip out")} />
        <Card className="p-5">
          <p className="text-[15px] leading-relaxed">
            {t(
              "Bios and notes are scrubbed for email addresses, phone numbers, links and messenger handles before anyone else can read them. It isn't that we don't trust you — it's that the product only works if nobody feels pressure to hand over contact details before they've met.",
            )}
          </p>
        </Card>
      </section>

      <section>
        <SectionHeading eyebrow={t("Honesty")} title={t("What we don't do")} />
        <Card className="p-5">
          <div className="mb-3">
            <Tag tone="warn">{t("No identity verification")}</Tag>
          </div>
          <p className="text-[15px] leading-relaxed">
            {t(
              "Datehaja does not verify anyone's identity. There is no ID check, no photo verification, and no background check. Please treat every match as someone you met on the internet, and read the",
            )}{" "}
            <Link to="/safety" className="underline underline-offset-2">
              {t("Safety Center")}
            </Link>{" "}
            {t("before your first date.")}
          </p>
        </Card>
      </section>
    </div>
  );
}
