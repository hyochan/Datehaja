import { Link } from "react-router-dom";
import { Card } from "../ui/primitives";
import { useI18n } from "../../i18n";

/** Shared empty state when a date id in the URL cannot be shown. */
export function MissingDate({ to = "/dashboard" }: { to?: string }) {
  const { t } = useI18n();

  return (
    <div role="alert">
      <Card className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-[32px]">{t("This story isn't here.")}</h1>
        <p className="mt-3 text-soft">
          {t("It may have ended, or it belongs to another person.")}
        </p>
        <Link
          to={to}
          className="mt-6 inline-block text-[14px] font-bold text-[var(--accent-text)]"
        >
          {t("Back to my Dating Agent →")}
        </Link>
      </Card>
    </div>
  );
}
