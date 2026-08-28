import { AvailabilityEditor } from "../components/forms/AvailabilityEditor";
import { Notice } from "../components/ui/primitives";
import { useI18n } from "../i18n";

export default function AvailabilityPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-[28px] leading-tight">{t("When you're free")}</h1>
        <p className="mt-1.5 text-[15.5px] leading-relaxed text-soft">
          {t(
            "This is the only thing DateHaja ever asks of you. The more windows you leave open, the better the match we can find.",
          )}
        </p>
      </header>

      <AvailabilityEditor />

      <Notice tone="info" title={t("How we use this")}>
        {t(
          "We only match you with someone whose window genuinely overlaps yours by at least 90 minutes — enough time for a real date, not a coffee you'd rush. Nobody sees your calendar.",
        )}
      </Notice>
    </div>
  );
}
