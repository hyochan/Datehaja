/* oxlint-disable react/set-state-in-effect -- hydrate one editable agent form */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { PageIntro } from "../components/layout/PageIntro";
import {
  Button,
  Card,
  Field,
  SectionHeading,
  Select,
  Skeleton,
  TextArea,
  TextInput,
  Toggle,
} from "../components/ui/primitives";
import { readableError, useToast } from "../components/ui/Toast";
import { useI18n } from "../i18n";
import {
  avatarForName,
  DEFAULT_AVATAR,
  type AvatarConfig,
} from "../components/agent/AgentAvatar";
import { AgentAvatarEditor } from "../components/agent/AgentAvatarEditor";

type Preferences = {
  notifyEmail: boolean;
  notifyInvitations: boolean;
  notifyConfirmations: boolean;
  dropsPaused: boolean;
  allowDemoMatches: boolean;
};

type Agent = {
  name: string;
  avatar?: AvatarConfig;
  essence: string;
  desiredConnection: string;
  boundaries: string[];
  voice: "warm" | "playful" | "direct" | "quiet";
  autonomy: "observe" | "suggest" | "advocate";
};

export default function SettingsPage() {
  const me = useQuery(api.profiles.me);
  const mine = useQuery(api.agents.mine);
  const blocked = useQuery(api.safety.blockedList);
  const updatePrefs = useMutation(api.profiles.updateNotificationPreferences);
  const setStatus = useMutation(api.profiles.setStatus);
  const updateAgent = useMutation(api.agents.update);
  const unblock = useMutation(api.safety.unblock);
  const { signOut } = useAuthActions();
  const toast = useToast();
  const { t } = useI18n();
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [essence, setEssence] = useState("");
  const [desired, setDesired] = useState("");
  const [boundaries, setBoundaries] = useState("");
  const [voice, setVoice] = useState<Agent["voice"]>("warm");
  const [autonomy, setAutonomy] = useState<Agent["autonomy"]>("suggest");

  useEffect(() => {
    if (hydrated || !mine?.agent) return;
    const agent = mine.agent as Agent;
    setName(agent.name);
    setAvatar(avatarForName(agent.name, agent.avatar));
    setEssence(agent.essence);
    setDesired(agent.desiredConnection);
    setBoundaries(agent.boundaries.join("\n"));
    setVoice(agent.voice);
    setAutonomy(agent.autonomy);
    setHydrated(true);
  }, [hydrated, mine]);

  if (me === undefined || mine === undefined) {
    return <Skeleton className="h-96 w-full rounded-card" />;
  }
  if (!me || !mine) return null;

  const prefs = me.preferences as Preferences | null;
  const profile = me.profile as { status?: string } | null;
  const paused = prefs?.dropsPaused === true || profile?.status === "paused";

  async function updatePreferences(patch: Partial<Preferences>) {
    setBusy(true);
    try {
      await updatePrefs(patch);
    } catch (error) {
      toast(readableError(error), "error");
    } finally {
      setBusy(false);
    }
  }

  async function saveAgent() {
    setBusy(true);
    try {
      await updateAgent({
        name,
        avatar,
        essence,
        desiredConnection: desired,
        boundaries: boundaries
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        voice,
        autonomy,
      });
      toast(t("Your agent was updated."), "success");
    } catch (error) {
      toast(readableError(error), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="product-page mx-auto max-w-3xl space-y-10">
      <PageIntro
        eyebrow={t("Private control room")}
        title={t("Agent settings")}
        description={t(
          "Change how your Agent sounds, what it protects, and when it may date. Your private memory is never shown here as a public profile.",
        )}
        motif="◌"
        tone="sage"
      />

      <section>
        <SectionHeading
          eyebrow={t("The big switch")}
          title={t("Let my agent date")}
        />
        <Card className="p-2">
          <Toggle
            checked={!paused}
            disabled={busy}
            onChange={async (next) => {
              setBusy(true);
              try {
                await updatePrefs({ dropsPaused: !next });
                await setStatus({ status: next ? "active" : "paused" });
                toast(
                  next
                    ? t("Your agent is available again.")
                    : t("Your agent is staying home."),
                  "success",
                );
              } catch (error) {
                toast(readableError(error), "error");
              } finally {
                setBusy(false);
              }
            }}
            label={
              paused
                ? t("Agent dates are paused")
                : t("My agent may meet other agents")
            }
            description={
              paused
                ? t(
                    "No new agent date can begin. Your conversations and past debriefs remain.",
                  )
                : t(
                    "Turn this off at any time. A simulation already running may finish, but it can never share contact for you.",
                  )
            }
          />
          <Toggle
            checked={prefs?.allowDemoMatches ?? true}
            disabled={busy}
            onChange={(next) =>
              void updatePreferences({ allowDemoMatches: next })
            }
            label={t("Include clearly labelled demo agents")}
            description={t(
              "Useful while the network is small. A demo can complete the consent flow but never reveals a real person or contact.",
            )}
          />
        </Card>
      </section>

      <section>
        <SectionHeading
          eyebrow={t("My other self")}
          title={t("Name and style my Agent")}
        />
        <Card className="p-5 sm:p-7">
          <Field
            label={t("Agent name")}
            hint={t(
              "Other Agents meet this name—not your account name. Change it anytime.",
            )}
            htmlFor="settings-agent-name"
          >
            <TextInput
              id="settings-agent-name"
              value={name}
              placeholder={t("e.g. Juno")}
              maxLength={32}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <AgentAvatarEditor name={name} value={avatar} onChange={setAvatar} />
          <p className="mt-5 text-[13px] leading-relaxed text-muted">
            {t(
              "Your look travels with the agent through dates, transcripts, and debriefs. It is playful identity—not a claim about your real appearance.",
            )}
          </p>
          <Button
            className="mt-5"
            loading={busy}
            onClick={() => void saveAgent()}
          >
            {t("Save name and look")}
          </Button>
        </Card>
      </section>

      <section>
        <SectionHeading
          eyebrow={t("Private instructions")}
          title={t("How my agent represents me")}
        />
        <Card className="p-5 sm:p-7">
          <Field
            label={t("The unpolished you")}
            hint={t(
              "Correct this whenever your agent starts sounding like a résumé.",
            )}
            htmlFor="settings-agent-essence"
          >
            <TextArea
              id="settings-agent-essence"
              rows={6}
              value={essence}
              maxLength={1200}
              onChange={(event) => setEssence(event.target.value)}
            />
          </Field>
          <Field
            label={t("The connection it should look for")}
            htmlFor="settings-agent-desired"
          >
            <TextArea
              id="settings-agent-desired"
              rows={4}
              value={desired}
              maxLength={700}
              onChange={(event) => setDesired(event.target.value)}
            />
          </Field>
          <Field
            label={t("Hard boundaries")}
            hint={t("One per line. These remain private to your agent.")}
            htmlFor="settings-agent-boundaries"
          >
            <TextArea
              id="settings-agent-boundaries"
              rows={4}
              value={boundaries}
              onChange={(event) => setBoundaries(event.target.value)}
            />
          </Field>
          <div className="grid gap-x-5 sm:grid-cols-2">
            <Field label={t("Voice")} htmlFor="settings-agent-voice">
              <Select
                id="settings-agent-voice"
                value={voice}
                onChange={(event) =>
                  setVoice(event.target.value as Agent["voice"])
                }
              >
                <option value="warm">{t("Warm and perceptive")}</option>
                <option value="playful">{t("Playful and quick")}</option>
                <option value="direct">{t("Direct and candid")}</option>
                <option value="quiet">{t("Quiet and considered")}</option>
              </Select>
            </Field>
            <Field label={t("Advocacy")} htmlFor="settings-agent-autonomy">
              <Select
                id="settings-agent-autonomy"
                value={autonomy}
                onChange={(event) =>
                  setAutonomy(event.target.value as Agent["autonomy"])
                }
              >
                <option value="observe">{t("Observe — never push")}</option>
                <option value="suggest">{t("Suggest — make the case")}</option>
                <option value="advocate">
                  {t("Advocate — push when convinced")}
                </option>
              </Select>
            </Field>
          </div>
          <Button size="lg" loading={busy} onClick={() => void saveAgent()}>
            {t("Save agent")}
          </Button>
        </Card>
      </section>

      <section>
        <SectionHeading
          eyebrow={t("Private delivery")}
          title={t("What arrives by email")}
        />
        <Card className="p-2">
          <Toggle
            checked={prefs?.notifyEmail ?? true}
            disabled={busy}
            onChange={(next) => void updatePreferences({ notifyEmail: next })}
            label={t("Email me at all")}
            description={t(
              "Turn off private debrief and connection emails. Safety notices can still send.",
            )}
          />
          <Toggle
            checked={prefs?.notifyInvitations ?? true}
            disabled={busy || prefs?.notifyEmail === false}
            onChange={(next) =>
              void updatePreferences({ notifyInvitations: next })
            }
            label={t("Agent debriefs")}
            description={t(
              "A separate private message when your agent returns.",
            )}
          />
          <Toggle
            checked={prefs?.notifyConfirmations ?? true}
            disabled={busy || prefs?.notifyEmail === false}
            onChange={(next) =>
              void updatePreferences({ notifyConfirmations: next })
            }
            label={t("Mutual introductions")}
            description={t(
              "A message only when two humans independently say yes.",
            )}
          />
        </Card>
      </section>

      <section>
        <SectionHeading
          eyebrow={t("The human")}
          title={t("Profile, matching, and policy")}
        />
        <Card className="divide-y divide-[var(--border)]">
          <SettingsLink
            to="/profile"
            title={t("Human profile")}
            body={t(
              "Bio, interests, optional photo, and how it may appear after an agent date",
            )}
          />
          <SettingsLink
            to="/preferences"
            title={t("Matching boundaries")}
            body={t("Age, distance, intent, lifestyle, and preferred areas")}
          />
          <SettingsLink
            to="/privacy"
            title={t("Privacy Notice")}
            body={t("Exactly what each agent and human can receive")}
          />
          <SettingsLink
            to="/terms"
            title={t("Terms of Service")}
            body={t("AI limitations, human consent, and beta conditions")}
          />
          <SettingsLink
            to="/community-guidelines"
            title={t("Community Guidelines")}
            body={t("Truthfulness, prompt attacks, conduct, and reporting")}
          />
          <SettingsLink
            to="/safety"
            title={t("Safety Center")}
            body={t("Before any real-world meeting")}
          />
        </Card>
      </section>

      <section>
        <SectionHeading eyebrow={t("Safety")} title={t("Blocked people")} />
        {blocked === undefined ? (
          <Skeleton className="h-16 w-full rounded-card" />
        ) : blocked.length === 0 ? (
          <Card className="p-5 text-[14.5px] text-muted">
            {t(
              "You haven't blocked anyone. A block prevents both agents from ever being paired again.",
            )}
          </Card>
        ) : (
          <Card className="divide-y divide-[var(--border)]">
            {blocked.map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center justify-between gap-3 p-4"
              >
                <span className="text-[15px]">{entry.displayName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    try {
                      await unblock({ userId: entry.userId as Id<"users"> });
                      toast(t("Unblocked."), "success");
                    } catch (error) {
                      toast(readableError(error), "error");
                    }
                  }}
                >
                  {t("Unblock")}
                </Button>
              </div>
            ))}
          </Card>
        )}
      </section>

      <div className="pb-4">
        <Button variant="secondary" onClick={() => void signOut()}>
          {t("Sign out")}
        </Button>
      </div>
    </div>
  );
}

function SettingsLink({
  to,
  title,
  body,
}: {
  to: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-[var(--bg-sunken)]"
    >
      <span className="min-w-0">
        <span className="block text-[15px] font-medium">{title}</span>
        <span className="mt-0.5 block text-[13.5px] text-muted">{body}</span>
      </span>
      <span className="shrink-0 text-muted" aria-hidden>
        →
      </span>
    </Link>
  );
}
