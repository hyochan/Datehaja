import { AvailabilityEditor } from "../components/forms/AvailabilityEditor";
import { PageIntro } from "../components/layout/PageIntro";
import { Notice } from "../components/ui/primitives";
import { useI18n } from "../i18n";

export default function AvailabilityPage() {
  const { t } = useI18n();

  return (
    <div className="product-page mx-auto max-w-3xl space-y-8">
      <PageIntro
        eyebrow={t("Your availability")}
        title={t("What would you like to do?")}
        description={t(
          "Start with the date, not the profile. A film by itself is a complete plan.",
        )}
        motif="↗"
        tone="butter"
      />

      <AvailabilityEditor />

      <Notice tone="info" title={t("How we use this")}>
        {t(
          "We only match you with someone whose window genuinely overlaps yours by at least 90 minutes — enough time for a real date, not a coffee you'd rush. Nobody sees your calendar.",
        )}
      </Notice>
    </div>
  );
}
