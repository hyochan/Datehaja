import { LEGAL_CONTACT_EMAIL } from "@convex/lib/legal";
import { LegalDocument, LegalSection } from "../components/legal/LegalDocument";

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Public record · Agreement"
      title="Terms of Service"
      summary="The rules for using Datehaja, written for a real person rather than hidden behind legal theatre."
      motif="§"
    >
      <LegalSection number="01" title="Who we are and what this is">
        <p>
          Datehaja is an independent, pre-commercial hackathon beta operated
          from the Republic of Korea. In these Terms, “Datehaja”, “we”, and “us”
          mean the operator of datehaja.com. You can reach the service at{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
        </p>
        <p>
          Datehaja is a date-concierge service: you provide an activity idea,
          availability, profile information, and matching preferences; the
          service may identify a compatible person, research a public venue,
          create a plan, and send each participant a private invitation.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Eligibility and your account">
        <ul>
          <li>You must be at least 18 years old.</li>
          <li>
            You must provide accurate information and keep your account secure.
          </li>
          <li>
            One person may not impersonate another, create deceptive accounts,
            or use Datehaja for commercial solicitation.
          </li>
          <li>
            Datehaja does not perform identity, photo, criminal-record, or
            background verification. Profile details are self-reported.
          </li>
        </ul>
      </LegalSection>

      <LegalSection number="03" title="How a date plan works">
        <p>
          A match, venue, route, price, opening time, or reservation is never
          guaranteed. Venue information comes from third-party public sources
          and can change after research. Check the venue before travelling and
          make any required booking yourself.
        </p>
        <p>
          Each participant answers privately. A first acceptance may reserve an
          evening; only two acceptances finalize the plan. A pass, withdrawal,
          expiry, venue problem, or safety action can change or cancel it.
        </p>
        <p>
          After a completed date, either person may leave a private review. We
          disclose a wish to meet again only when both people explicitly answer
          yes. Every other answer remains private. Accuracy, attendance,
          respect, and safety feedback may influence future matching; we do not
          create or use attractiveness rankings.
        </p>
      </LegalSection>

      <LegalSection number="04" title="Conduct and safety">
        <p>
          The Community Guidelines are part of these Terms. You must respect
          consent and boundaries, meet only at the public venue in the plan, and
          never harass, threaten, discriminate, pressure someone for contact
          details, or request money. You can leave any date at any time.
        </p>
        <p>
          Datehaja is not an emergency, transportation, reservation, medical,
          legal, or law-enforcement service. If there is immediate danger,
          contact local emergency services first.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Your content and our limited licence">
        <p>
          You keep ownership of your profile text, preferences, date ideas, and
          photos. You give Datehaja a limited, worldwide, non-exclusive licence
          to host, process, redact, and show that content only as needed to run,
          secure, and improve the service. This licence ends when the data is
          deleted, except for lawful backups, safety records, or records needed
          to resolve a dispute.
        </p>
        <p>
          Do not upload content you do not have the right to use, or content
          that is illegal, exploitative, hateful, sexually explicit, or reveals
          another person’s private information.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Automation and third-party services">
        <p>
          Programmatic rules apply hard requirements such as age, mutual
          interest, availability, distance, blocks, and a prior private decision
          not to meet the same person again. If both people set strict meeting
          areas, at least one area must overlap. Stated preferences and
          conservative trust signals help rank eligible candidates. AI may rank
          that shortlist and compose a plan from researched sources; it cannot
          override a hard rule. Automated results can still be incomplete or
          wrong, and you remain responsible for deciding whether to attend.
        </p>
        <p>
          Datehaja relies on service providers for hosting, authentication,
          email delivery, web research, and AI processing. Maps, calendars,
          venue sites, and other external links have their own terms and privacy
          practices.
        </p>
      </LegalSection>

      <LegalSection number="07" title="Suspension and ending your use">
        <p>
          You may pause matching at any time. We may restrict or suspend an
          account when reasonably necessary to protect people, investigate a
          report, comply with law, prevent abuse, or enforce these Terms. We may
          preserve limited records where needed for safety, fraud prevention,
          legal obligations, or dispute resolution.
        </p>
      </LegalSection>

      <LegalSection number="08" title="Beta availability and responsibility">
        <p>
          The beta is provided without a fee and may change, pause, or end. To
          the maximum extent permitted by law, it is provided “as is” without a
          promise that a match will be found, a person will attend, or a venue
          will be suitable. Nothing in these Terms excludes rights or liability
          that cannot legally be excluded, including mandatory consumer rights.
        </p>
      </LegalSection>

      <LegalSection number="09" title="Law, changes, and contact">
        <p>
          These Terms are governed by the laws of the Republic of Korea, without
          taking away mandatory rights you have where you live. Before material
          changes apply, Datehaja will update the effective date and ask signed-
          in users to review and accept the new version when required.
        </p>
        <p>
          Questions, legal notices, or account concerns can be sent to{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
