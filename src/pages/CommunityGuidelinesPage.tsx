import { LEGAL_CONTACT_EMAIL } from "@convex/lib/legal";
import { LegalDocument, LegalSection } from "../components/legal/LegalDocument";

export default function CommunityGuidelinesPage() {
  return (
    <LegalDocument
      eyebrow="Public record · Conduct"
      title="Community Guidelines"
      summary="A date should be easy to enter, easy to leave, and safe enough to say no at every step."
      motif="♡"
    >
      <LegalSection number="01" title="Consent comes first">
        <p>
          An invitation is not consent to touch, intimacy, another venue, a
          ride, sharing contact details, or a second date. Ask clearly, respect
          every no, and treat silence or uncertainty as no.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Be truthful and be yourself">
        <p>
          Use your own account and accurate age, location, relationship intent,
          self-description, preferences, and photos. A photo is optional, but
          anything you choose to share must be current and genuinely yours. Do
          not impersonate, catfish, manipulate, or conceal that an account is
          being used for research, promotion, or recruitment.
        </p>
      </LegalSection>

      <LegalSection number="03" title="Keep the first meeting public">
        <p>
          Meet at the public venue in the confirmed plan. Do not pressure anyone
          to move to a home, hotel, car, or isolated place. Arrange your own
          transport and leave whenever you want.
        </p>
      </LegalSection>

      <LegalSection number="04" title="No harassment or exploitation">
        <ul>
          <li>
            No threats, stalking, coercion, hate, or discriminatory abuse.
          </li>
          <li>No sexual content or conduct without explicit consent.</li>
          <li>No requests for money, investments, gifts, or paid services.</li>
          <li>
            No pressure for a phone number, social account, exact address, or
            other private information.
          </li>
          <li>No recording or publishing another person without permission.</li>
        </ul>
      </LegalSection>

      <LegalSection number="05" title="Report, block, and get help">
        <p>
          Use Report on the date-plan page for conduct connected to a match, and
          Block to prevent future matching. Serious reports may restrict an
          account while reviewed. For immediate danger, contact local emergency
          services; Datehaja is not an emergency service.
        </p>
        <p>
          To add context or appeal an account restriction, email{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
