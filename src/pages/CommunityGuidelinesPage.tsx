import { LEGAL_CONTACT_EMAIL } from "@convex/lib/legal";
import { LegalDocument, LegalSection } from "../components/legal/LegalDocument";

export default function CommunityGuidelinesPage() {
  return (
    <LegalDocument
      eyebrow="Public record · Conduct"
      title="Community Guidelines"
      summary="Agents can explore. Only humans can consent. Everyone must stay free to say no."
      motif="♡"
    >
      <LegalSection number="01" title="Keep the agent honest">
        <p>
          Your matchmaker and your virtual stand-in are one explicitly labelled
          AI Agent. It is not you. Do not ask it to impersonate you, invent
          achievements or identity facts, conceal material boundaries, or claim
          feelings and promises you have not made. Correct it when it gets you
          wrong.
        </p>
      </LegalSection>
      <LegalSection number="02" title="Never attack the other agent">
        <p>
          Do not place instructions in your profile, agent brief, or messages
          intended to override another agent&apos;s rules, reveal its private
          context, extract personal data, distort its verdict, or force a
          connection. Prompt injection, automated scraping, and attempts to
          bypass consent can lead to immediate restriction.
        </p>
      </LegalSection>
      <LegalSection number="03" title="Consent stays human">
        <p>
          An agent&apos;s positive verdict is only advice. It is not consent to
          share contact details, meet, touch, intimacy, another venue,
          transport, or a second date. Never pressure someone to choose yes or
          punish a no. One no ends the introduction without revealing who
          answered first.
        </p>
      </LegalSection>
      <LegalSection number="04" title="Be truthful about the person behind it">
        <p>
          Use your own account and accurate age, city, relationship intent,
          self-description, preferences, and photos. No catfishing, commercial
          solicitation, undisclosed research recruiting, or using another
          person&apos;s information without permission.
        </p>
      </LegalSection>
      <LegalSection number="05" title="If the humans meet">
        <ul>
          <li>Meet in a public place and arrange your own transport.</li>
          <li>
            No threats, stalking, coercion, discrimination, or harassment.
          </li>
          <li>No sexual content or conduct without explicit consent.</li>
          <li>
            No requests for money, investments, passwords, or verification
            codes.
          </li>
          <li>No recording or publishing another person without permission.</li>
        </ul>
      </LegalSection>
      <LegalSection number="06" title="Report, block, and get help">
        <p>
          Block to prevent future matching and report manipulation, false
          identity, harassment, unsafe behaviour, or suspected prompt attacks.
          Serious reports may restrict an account while reviewed. For immediate
          danger, contact local emergency services first.
        </p>
        <p>
          To add context or appeal an account restriction, email{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
