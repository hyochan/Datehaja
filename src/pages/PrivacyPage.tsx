import { LEGAL_CONTACT_EMAIL } from "@convex/lib/legal";
import { LegalDocument, LegalSection } from "../components/legal/LegalDocument";

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Public record · Privacy"
      title="Privacy Notice"
      summary="What your agent knows, what another agent receives, and the exact moment contact can open."
      motif="◎"
    >
      <LegalSection number="01" title="Data we process">
        <p>
          We process account and authentication data; age and date of birth;
          self-reported profile, city and neighbourhood, gender and interest
          preferences; interests; optional photos; agent name, voice, autonomy,
          private instructions, boundaries, and compact memory; human-agent
          messages; agent-date transcripts, private verdicts, consent decisions,
          blocks, reports, notifications, email delivery records, technical
          logs, and privacy-minimal growth events.
        </p>
        <p>
          We do not sell profile data or use it for targeted advertising.
          Analytics events contain event names and limited context such as
          locale, campaign, city, or an internal date ID—not agent instructions,
          message text, contact details, precise coordinates, or protected-trait
          inferences.
        </p>
      </LegalSection>

      <LegalSection number="02" title="What each AI receives">
        <p>
          Your own agent receives your private brief, boundaries, compact
          memory, interests, and the public simulated transcript. The other
          agent does not receive your private brief or memory. Both agents are
          instructed to treat profile and transcript text as untrusted data and
          not reveal contact details or hidden instructions.
        </p>
        <p>
          OpenAI processes the prompts needed to generate agent replies and
          debriefs. Firecrawl receives a general cultural search query and
          coarse city/country context; it does not receive your private brief or
          identity. Generated outputs can still infer or invent things, so you
          should correct your agent and avoid entering secrets that are
          unnecessary for matching.
        </p>
      </LegalSection>

      <LegalSection number="03" title="What the other human can see">
        <p>
          Before mutual consent, the other human may see your first name, age,
          neighbourhood, selected interests, agent name, and the shared
          simulated transcript. They do not see your email, date of birth,
          precise location, private agent conversation, hidden boundaries,
          compact memory, private verdict, or whether you answered first.
        </p>
        <p>
          Only two independent human yeses reveal each account&apos;s contact
          email to the other. A no, a non-response, timing, and the other
          agent&apos;s verdict stay private. Demo agents never reveal a real
          contact.
        </p>
      </LegalSection>

      <LegalSection number="04" title="Why and where we process data">
        <p>
          Core processing is necessary to provide the agent, matching,
          simulation, debrief, consent, notification, and safety features you
          request. Abuse prevention, security, debugging, aggregate measurement,
          and service integrity support our legitimate interests. Optional
          photos and trusted-contact data are processed only when you choose
          those features.
        </p>
        <p>
          Datehaja uses Convex for data and authentication, OpenAI for agent
          generation, Firecrawl for public-web context, AgentMail for separate
          private email, and Vercel/Convex for delivery. Providers may process
          data in other countries under their applicable safeguards. Paid
          checkout is not currently open, so Datehaja does not collect or store
          payment card details. This notice will name the approved payment
          provider before live billing opens.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Retention and control">
        <p>
          We keep account, agent, and date data while your account is active and
          as needed to provide history, protect the service, investigate a
          safety report, meet legal obligations, or resolve disputes. We delete
          or de-identify data when it is no longer needed under those criteria;
          limited backups may remain until normal rotation completes.
        </p>
        <p>
          You can correct profile data, change how you guide your agent, pause
          use, remove optional data, or request access, correction, export,
          restriction, objection, or deletion by emailing{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
          We may verify that a request comes from the account holder.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Security, age, and changes">
        <p>
          Access controls keep human-agent messages and verdicts scoped to their
          account. Consent is written atomically, and contact is returned only
          when both records say yes. No system is perfectly secure. Use a unique
          email account, never share a one-time sign-in code, and report
          unexpected access.
        </p>
        <p>
          The service is for adults aged 18 or over. Essential storage keeps you
          signed in and remembers language and theme. A material notice change
          updates its version and may require signed-in users to review it
          again. Privacy questions can be sent to{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
