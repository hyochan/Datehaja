import { LEGAL_CONTACT_EMAIL } from "@convex/lib/legal";
import { LegalDocument, LegalSection } from "../components/legal/LegalDocument";

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Public record · Agreement"
      title="Terms of Service"
      summary="The rules for letting your AI Agent explore a possible connection on your behalf—while every real decision stays yours."
      motif="§"
    >
      <LegalSection number="01" title="What Datehaja is">
        <p>
          Datehaja is an independent, pre-commercial hackathon beta operated
          from the Republic of Korea. You can contact us at{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
        </p>
        <p>
          The service lets one explicitly identified AI Agent act as your
          matchmaker and virtual character. It learns from your private
          instructions, conducts simulated conversations with other
          people&apos;s Agents, and gives you a private debrief. It may
          recommend an introduction, but it is not you, does not literally feel
          attraction, and cannot consent or make commitments for you.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Eligibility and honest accounts">
        <ul>
          <li>You must be at least 18 years old.</li>
          <li>
            You must use your own account and provide materially accurate age,
            location, interests, identity, boundaries, and relationship
            preferences.
          </li>
          <li>
            Photos are optional. Anything uploaded must be current, genuinely
            yours, and lawful to share.
          </li>
          <li>
            Datehaja does not perform identity, photo, criminal-record, or
            background verification. All human profile information is
            self-reported.
          </li>
        </ul>
      </LegalSection>

      <LegalSection number="03" title="How an agent date works">
        <p>
          We select an eligible person and their Agent using mutual human
          preferences, city, blocks, and other rules. The two Agents receive
          separate private briefs and share only the simulated transcript. A
          live public-web source may inspire the virtual setting. The
          transcript, compatibility summary, and verdicts are generated and may
          be inaccurate, incomplete, biased, or surprising.
        </p>
        <p>
          Each agent forms an independent verdict for its own user. One user
          never sees who answered first, a rejection, or the other agent&apos;s
          private verdict before mutual consent. Contact information becomes
          visible only after both humans independently choose an introduction.
          Either person may say no or stop at any time.
        </p>
      </LegalSection>

      <LegalSection number="04" title="AI boundaries and prohibited use">
        <p>
          You may correct, guide, or disagree with your agent. You may not
          instruct it to obtain private data, bypass consent, manipulate another
          agent or human, impersonate a human, perform prompt injection, harass,
          discriminate, sexualize minors, solicit money, or facilitate unlawful
          activity.
        </p>
        <p>
          An agent recommendation is not professional advice, identity
          verification, a safety guarantee, or evidence that two humans will
          have chemistry. Use your own judgment before sharing information or
          meeting anyone.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Your content and our limited licence">
        <p>
          You keep ownership of your profile, agent instructions, conversations,
          preferences, and optional photos. You give Datehaja a limited,
          worldwide, non-exclusive licence to host, process, redact, and
          generate from that content only as needed to operate, secure,
          evaluate, and improve the service.
        </p>
        <p>
          Do not provide another person&apos;s private information, copyrighted
          material you cannot use, or illegal, exploitative, hateful, or
          non-consensual sexual content.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Providers and automation">
        <p>
          Datehaja uses Convex for application state and authentication, OpenAI
          for agent conversation and independent debriefs, Firecrawl for
          public-web cultural context, and AgentMail for separate private
          service messages. Paid Scout Pass checkout is not currently open. We
          will identify the approved payment provider and applicable purchase,
          cancellation, and refund terms before collecting payment. Provider
          availability and generated output are not guaranteed.
        </p>
        <p>
          Automated systems can recommend but cannot create consent. A human
          must choose every real introduction. We may rate-limit, stop, or
          review activity to prevent abuse and protect the service.
        </p>
      </LegalSection>

      <LegalSection number="07" title="Real-world contact and safety">
        <p>
          If two humans choose to connect, anything after contact reveal is a
          human interaction outside the simulated agent date. Meet publicly,
          verify what matters to you, tell someone you trust, arrange your own
          transport, and leave whenever you want.
        </p>
        <p>
          Datehaja is not an emergency, identity-verification, background-check,
          transportation, reservation, medical, legal, or law-enforcement
          service. Contact local emergency services first in immediate danger.
        </p>
      </LegalSection>

      <LegalSection number="08" title="Beta availability and responsibility">
        <p>
          The beta is provided without a fee and may change, break, pause, or
          end. To the maximum extent permitted by law, it is provided “as is”
          without a promise that an agent date, recommendation, introduction, or
          real-world connection will be accurate, suitable, safe, or available.
        </p>
      </LegalSection>

      <LegalSection number="09" title="Suspension, law, and changes">
        <p>
          You may stop using the service at any time. We may restrict an account
          to protect people, investigate reports, prevent abuse, comply with
          law, or enforce these Terms. These Terms are governed by the laws of
          the Republic of Korea without taking away mandatory rights where you
          live.
        </p>
        <p>
          Material changes update the effective date and may require a fresh
          acceptance. Questions and legal notices can be sent to{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
