import type { ReactNode } from "react";
import { cx } from "../ui/primitives";

type PageIntroTone = "coral" | "butter" | "lilac" | "sage";

export function PageIntro({
  eyebrow,
  title,
  description,
  motif = "♡",
  tone = "coral",
  action,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  motif?: ReactNode;
  tone?: PageIntroTone;
  action?: ReactNode;
}) {
  return (
    <div className={cx("page-intro", `page-intro-${tone}`)}>
      <div className="page-intro-copy">
        {eyebrow && <div className="page-intro-eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {action && <div className="page-intro-action">{action}</div>}
      </div>

      <div className="page-intro-motif" aria-hidden="true">
        <span>{motif}</span>
      </div>
      <span className="page-intro-orbit page-intro-orbit-one" aria-hidden />
      <span className="page-intro-orbit page-intro-orbit-two" aria-hidden />
    </div>
  );
}
