import { LEGAL_CONTACT_EMAIL } from "@convex/lib/legal";
import { LegalDocument, LegalSection } from "../components/legal/LegalDocument";
import { useI18n } from "../i18n";
import { legalText } from "./legalCopy";

/** Splits on the {email} placeholder so the address stays a real mailto link. */
function Prose({ text }: { text: string }) {
  const parts = text.split("{email}");
  return (
    <>
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 && (
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>
          )}
        </span>
      ))}
    </>
  );
}

export default function PrivacyPage() {
  const { locale } = useI18n();
  const doc = legalText(locale).privacy;
  return (
    <LegalDocument
      eyebrow={doc.eyebrow}
      title={doc.title}
      summary={doc.summary}
      motif="◎"
    >
      {doc.sections.map((section) => (
        <LegalSection
          key={section.number}
          number={section.number}
          title={section.title}
        >
          {section.body.map((paragraph, index) => (
            <p key={index}>
              <Prose text={paragraph} />
            </p>
          ))}
          {section.items.length > 0 && (
            <ul>
              {section.items.map((item, index) => (
                <li key={index}>
                  <Prose text={item} />
                </li>
              ))}
            </ul>
          )}
        </LegalSection>
      ))}
    </LegalDocument>
  );
}
