import { Link } from "react-router-dom";
import { AgentLearningLoop } from "../components/agent/AgentLearningLoop";
import { ThemeToggle } from "../components/layout/AppShell";
import { LocaleSwitcher } from "../components/layout/LocaleSwitcher";
import { Wordmark } from "../components/layout/Wordmark";
import { useI18n } from "../i18n";

export default function HowItWorksPage() {
  const { t } = useI18n();
  return <div className="agent-landing min-h-dvh">
    <header className="glass-bar sticky top-0 z-30 border-b border-[var(--border)]">
      <div className="mx-auto flex min-h-20 max-w-[80rem] items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" aria-label={t("Home")} className="inline-flex min-h-11 items-center gap-3"><span aria-hidden="true">←</span><Wordmark className="text-[25px]" /></Link>
        <div className="flex items-center gap-3"><LocaleSwitcher compact /><ThemeToggle /></div>
      </div>
    </header>
    <main className="mx-auto max-w-[80rem] px-5 py-8 sm:px-8 sm:py-12"><AgentLearningLoop standalone /></main>
  </div>;
}
