/* oxlint-disable react/set-state-in-effect -- hydrate a migration form once */
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "@convex/_generated/api";
import {
  INTEREST_OPTIONS,
  SUPPORTED_CITIES,
  SUPPORTED_COUNTRIES,
  citiesForCountry,
  suggestCity,
} from "@convex/lib/catalog";
import { AgentAvatarEditor } from "../components/agent/AgentAvatarEditor";
import {
  AgentAvatar,
  DEFAULT_AVATAR,
  type AvatarConfig,
} from "../components/agent/AgentAvatar";
import { AgentWorldSprite } from "../components/agent/AgentDateWorld";
import { Logo } from "../components/layout/Logo";
import { LocaleSwitcher } from "../components/layout/LocaleSwitcher";
import { Wordmark } from "../components/layout/Wordmark";
import {
  Button,
  Card,
  Chip,
  Field,
  Notice,
  Select,
  TextArea,
  TextInput,
} from "../components/ui/primitives";
import { readableError } from "../components/ui/Toast";
import { useI18n } from "../i18n";
import { dobStringToMs } from "../lib/format";

type Gender = "woman" | "man" | "nonbinary" | "other";
type Strength = "important" | "flexible" | "no_preference";
type Intent = "casual" | "open" | "serious" | "friendship" | "unsure";
type Step = 1 | 2 | 3;

const GENDERS: Array<{ key: Gender; label: string }> = [
  { key: "woman", label: "Woman" },
  { key: "man", label: "Man" },
  { key: "nonbinary", label: "Non-binary" },
  { key: "other", label: "Another identity" },
];

const BOUNDARIES = [
  "No sexual pressure",
  "No smoking",
  "No casual-only intent",
  "Kind disagreement matters",
  "Privacy before connection",
  "No pressure to meet quickly",
];

const PERSONALITIES = [
  "Thoughtful",
  "Playful",
  "Direct",
  "Calm",
  "Curious",
  "Affectionate",
];

const STYLES = ["Polished", "Casual", "Artistic", "Sporty", "Minimal"];

const STEP_COPY = {
  1: {
    kicker: "FIRST · YOUR AGENT",
    title: "Create your Agent.",
    body: "Your matchmaker and your stand-in are the same Agent. Give it a face, a voice and permission to be candid.",
  },
  2: {
    kicker: "SECOND · WHO TO NOTICE",
    title: "Tell it who is worth coming home for.",
    body: "Describe the person, not a shopping list. Mark what matters, what is flexible, and what truly does not matter.",
  },
  3: {
    kicker: "THIRD · THE REAL YOU",
    title: "Give it something honest to represent.",
    body: "Your private brief is richer than the card another person may eventually see. Exact location and contact details stay sealed.",
  },
} satisfies Record<Step, { kicker: string; title: string; body: string }>;

export default function AgentOnboardingPage() {
  const me = useQuery(api.profiles.me);
  const bootstrap = useMutation(api.agents.bootstrap);
  const navigate = useNavigate();
  const { locale, t } = useI18n();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const suggested = useMemo(
    () => suggestCity(locale.split("-")[1], timezone),
    [locale, timezone],
  );

  const [step, setStep] = useState<Step>(1);
  const [hydrated, setHydrated] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender>("woman");
  const [interestedIn, setInterestedIn] = useState<Gender[]>([]);
  const [cityKey, setCityKey] = useState(suggested.key);
  const [neighborhood, setNeighborhood] = useState<string>(
    suggested.neighborhoods[0].name,
  );
  const [interests, setInterests] = useState<string[]>([]);
  const [personalityTraits, setPersonalityTraits] = useState<string[]>([]);
  const [agentName, setAgentName] = useState("");
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [essence, setEssence] = useState("");
  const [desiredConnection, setDesiredConnection] = useState("");
  const [boundaries, setBoundaries] = useState<string[]>([
    "Privacy before connection",
  ]);
  const [voice, setVoice] = useState<"warm" | "playful" | "direct" | "quiet">(
    "warm",
  );
  const [autonomy, setAutonomy] = useState<"observe" | "suggest" | "advocate">(
    "suggest",
  );
  const [relationshipIntent, setRelationshipIntent] = useState<Intent>("open");
  const [preferredPersonalityTraits, setPreferredPersonalityTraits] = useState<
    string[]
  >([]);
  const [personalityPreference, setPersonalityPreference] =
    useState<Strength>("flexible");
  const [preferredStyleTags, setPreferredStyleTags] = useState<string[]>([]);
  const [stylePreference, setStylePreference] =
    useState<Strength>("no_preference");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated || me === undefined) return;
    const profile = me?.profile as {
      displayName?: string;
      gender?: Gender;
      interestedIn?: Gender[];
      city?: string;
      neighborhood?: string;
      bio?: string;
      interests?: string[];
    } | null;
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setGender(profile.gender ?? "woman");
      setInterestedIn(profile.interestedIn ?? []);
      const existingCity = SUPPORTED_CITIES.find(
        (option) => option.city === profile.city,
      );
      if (existingCity) {
        setCityKey(existingCity.key);
        setNeighborhood(
          profile.neighborhood ?? existingCity.neighborhoods[0].name,
        );
      }
      setInterests(profile.interests ?? []);
      setEssence(profile.bio ?? "");
    }
    setHydrated(true);
  }, [hydrated, me]);

  const city =
    SUPPORTED_CITIES.find((option) => option.key === cityKey) ?? suggested;
  const ownerFirstName = displayName.trim().split(/\s+/)[0];
  const agentDisplayName =
    agentName.trim() ||
    (ownerFirstName ? `${ownerFirstName}'s Agent` : t("My Agent"));
  const stepReady = {
    1: true,
    2: interestedIn.length > 0 && desiredConnection.trim().length >= 20,
    3:
      displayName.trim().length >= 2 &&
      (dob.length === 10 || Boolean(me?.profile)) &&
      interests.length >= 3 &&
      personalityTraits.length >= 2 &&
      essence.trim().length >= 30,
  } satisfies Record<Step, boolean>;

  function toggle<T>(value: T, values: T[], update: (next: T[]) => void) {
    update(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );
  }

  async function submit() {
    if (!stepReady[3] || busy) return;
    setBusy(true);
    setError(null);
    try {
      await bootstrap({
        locale,
        displayName,
        dobMs: dob ? dobStringToMs(dob) : undefined,
        gender,
        interestedIn,
        city: city.city,
        neighborhood,
        interests,
        personalityTraits,
        agentName: agentDisplayName,
        avatar,
        essence,
        desiredConnection,
        boundaries,
        voice,
        autonomy,
        relationshipIntent,
        preferredPersonalityTraits,
        personalityPreference,
        preferredStyleTags,
        stylePreference,
      });
      navigate("/membership", { replace: true });
    } catch (reason) {
      setError(readableError(reason));
    } finally {
      setBusy(false);
    }
  }

  const copy = STEP_COPY[step];

  return (
    <div className="agent-onboarding min-h-dvh">
      <header className="glass-bar border-b border-[var(--border)]">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a
            href="/"
            className="flex items-center gap-2.5"
            aria-label={t("Datehaja home")}
          >
            <Logo className="h-8 w-8" />
            <span className="leading-none">
              <Wordmark className="text-[22px]" />
              <span className="docket-label mt-1 block text-[8px] text-muted">
                {t("Your agent dates first")}
              </span>
            </span>
          </a>
          <LocaleSwitcher compact />
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:py-16">
        <aside className="lg:sticky lg:top-10 lg:self-start">
          <div className="agent-onboarding-studio">
            <span className="agent-onboarding-studio-label">
              {t("MY AGENT")}
            </span>
            <AgentAvatar
              name={agentDisplayName}
              avatar={avatar}
              className="agent-avatar-onboarding"
              label={t("Preview of {agent}", {
                agent: agentDisplayName,
              })}
            />
            <div className="agent-onboarding-world-preview" aria-hidden>
              <span>
                {step === 1
                  ? t("AT HOME")
                  : step === 2
                    ? t("LISTENING")
                    : t("READY SOON")}
              </span>
              <AgentWorldSprite
                person={{ name: agentDisplayName, avatar }}
                className="agent-onboarding-sprite"
              />
              <i />
            </div>
          </div>
          <div className="docket-label mt-7 text-[var(--accent-text)]">
            {t(copy.kicker)}
          </div>
          <h1 className="mt-3 max-w-md text-[clamp(3rem,7vw,5.2rem)] leading-[0.92]">
            {t(copy.title)}
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-[1.75] text-soft">
            {t(copy.body)}
          </p>
        </aside>

        <Card className="overflow-hidden">
          <div className="onboarding-progress">
            {([1, 2, 3] as Step[]).map((number) => (
              <button
                key={number}
                type="button"
                className={
                  number === step ? "is-active" : number < step ? "is-done" : ""
                }
                disabled={number > step}
                onClick={() => number < step && setStep(number)}
              >
                <span>{number < step ? "✓" : `0${number}`}</span>
                {t(
                  number === 1
                    ? "My Agent"
                    : number === 2
                      ? "Ideal person"
                      : "About me",
                )}
              </button>
            ))}
          </div>

          <div className="p-5 sm:p-8 lg:p-10">
            {step === 1 && (
              <section>
                <div className="docket-label mb-2 text-[var(--accent-text)]">
                  {t("CREATE YOUR AGENT")}
                </div>
                <h2 className="text-[34px]">{t("Meet your Agent.")}</h2>
                <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-soft">
                  {t(
                    "This single character is your matchmaker and your stand-in — visible in the world, candid only with you.",
                  )}
                </p>
                <div className="mt-7">
                  <AgentAvatarEditor
                    name={agentDisplayName}
                    value={avatar}
                    onChange={setAvatar}
                    showPreview={false}
                  />
                </div>
                <Field
                  label={t("Agent nickname")}
                  hint={t(
                    "Optional. Leave it blank and we'll name it for you.",
                  )}
                  htmlFor="agent-name"
                >
                  <TextInput
                    id="agent-name"
                    value={agentName}
                    placeholder={t("Optional nickname")}
                    maxLength={32}
                    onChange={(event) => setAgentName(event.target.value)}
                  />
                </Field>
                <div className="grid gap-x-5 sm:grid-cols-2">
                  <Field label={t("How should it sound?")}>
                    <Select
                      value={voice}
                      onChange={(event) =>
                        setVoice(event.target.value as typeof voice)
                      }
                    >
                      <option value="warm">{t("Warm and perceptive")}</option>
                      <option value="playful">{t("Playful and quick")}</option>
                      <option value="direct">{t("Direct and candid")}</option>
                      <option value="quiet">{t("Quiet and considered")}</option>
                    </Select>
                  </Field>
                  <Field label={t("When convinced, should it push you?")}>
                    <Select
                      value={autonomy}
                      onChange={(event) =>
                        setAutonomy(event.target.value as typeof autonomy)
                      }
                    >
                      <option value="observe">
                        {t("Observe — never push")}
                      </option>
                      <option value="suggest">
                        {t("Suggest — make the case")}
                      </option>
                      <option value="advocate">
                        {t("Advocate — push when convinced")}
                      </option>
                    </Select>
                  </Field>
                </div>
              </section>
            )}

            {step === 2 && (
              <section>
                <div className="docket-label mb-2 text-[var(--accent-text)]">
                  {t("BRIEF {agent}", { agent: agentDisplayName })}
                </div>
                <h2 className="text-[34px]">
                  {t("Who do you hope it notices?")}
                </h2>
                <Field label={t("It may meet agents representing")}>
                  <div className="flex flex-wrap gap-2">
                    {GENDERS.map((option) => (
                      <Chip
                        key={option.key}
                        selected={interestedIn.includes(option.key)}
                        onClick={() =>
                          toggle(option.key, interestedIn, setInterestedIn)
                        }
                      >
                        {t(option.label)}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <Field
                  label={t(
                    "What kind of person should it come home excited about?",
                  )}
                  hint={t(
                    "Write the feeling and dynamic you want, not a résumé.",
                  )}
                  htmlFor="desired-connection"
                >
                  <TextArea
                    id="desired-connection"
                    rows={5}
                    value={desiredConnection}
                    placeholder={t(
                      "Someone I can disagree with safely, who enjoys their own life and still makes room for another person…",
                    )}
                    onChange={(event) =>
                      setDesiredConnection(event.target.value)
                    }
                  />
                </Field>
                <Field label={t("Personality signals to notice")}>
                  <div className="flex flex-wrap gap-2">
                    {PERSONALITIES.map((trait) => (
                      <Chip
                        key={trait}
                        selected={preferredPersonalityTraits.includes(trait)}
                        onClick={() =>
                          toggle(
                            trait,
                            preferredPersonalityTraits,
                            setPreferredPersonalityTraits,
                          )
                        }
                      >
                        {t(trait)}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <StrengthField
                  label={t("How much should personality fit matter?")}
                  value={personalityPreference}
                  onChange={setPersonalityPreference}
                  t={t}
                />
                <Field
                  label={t("Style or presence you tend to notice")}
                  hint={t("Optional — people are never scored on appearance.")}
                >
                  <div className="flex flex-wrap gap-2">
                    {STYLES.map((tag) => (
                      <Chip
                        key={tag}
                        selected={preferredStyleTags.includes(tag)}
                        onClick={() =>
                          toggle(tag, preferredStyleTags, setPreferredStyleTags)
                        }
                      >
                        {t(tag)}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <StrengthField
                  label={t("How much should style matter?")}
                  value={stylePreference}
                  onChange={setStylePreference}
                  t={t}
                />
                <Field label={t("What are you open to?")}>
                  <Select
                    value={relationshipIntent}
                    onChange={(event) =>
                      setRelationshipIntent(event.target.value as Intent)
                    }
                  >
                    <option value="open">
                      {t("Open to seeing what develops")}
                    </option>
                    <option value="serious">
                      {t("A serious relationship")}
                    </option>
                    <option value="casual">{t("Something casual")}</option>
                    <option value="friendship">{t("Friendship first")}</option>
                    <option value="unsure">{t("Not sure yet")}</option>
                  </Select>
                </Field>
                <Field label={t("Hard boundaries")}>
                  <div className="flex flex-wrap gap-2">
                    {BOUNDARIES.map((boundary) => (
                      <Chip
                        key={boundary}
                        selected={boundaries.includes(boundary)}
                        onClick={() =>
                          toggle(boundary, boundaries, setBoundaries)
                        }
                      >
                        {t(boundary)}
                      </Chip>
                    ))}
                  </div>
                </Field>
              </section>
            )}

            {step === 3 && (
              <section>
                <div className="docket-label mb-2 text-[var(--accent-text)]">
                  {t("THE PERSON BEHIND {agent}", { agent: agentDisplayName })}
                </div>
                <h2 className="text-[34px]">
                  {t("What should your agent know about you?")}
                </h2>
                <div className="mt-6 grid gap-x-5 sm:grid-cols-2">
                  <Field
                    label={t("What should we call you?")}
                    htmlFor="display-name"
                  >
                    <TextInput
                      id="display-name"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                    />
                  </Field>
                  <Field
                    label={t("Date of birth")}
                    hint={
                      me?.profile
                        ? t("Already verified — only change it if needed.")
                        : t("Adults only.")
                    }
                    htmlFor="dob"
                  >
                    <TextInput
                      id="dob"
                      placeholder="YYYY-MM-DD"
                      value={dob}
                      onChange={(event) =>
                        setDob(event.target.value.slice(0, 10))
                      }
                    />
                  </Field>
                </div>
                <Field label={t("You are")}>
                  <div className="flex flex-wrap gap-2">
                    {GENDERS.map((option) => (
                      <Chip
                        key={option.key}
                        selected={gender === option.key}
                        onClick={() => setGender(option.key)}
                      >
                        {t(option.label)}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <div className="grid gap-x-5 sm:grid-cols-2">
                  <Field label={t("Country")} htmlFor="country">
                    <Select
                      id="country"
                      value={city.countryCode}
                      onChange={(event) => {
                        const next = citiesForCountry(event.target.value)[0];
                        if (!next) return;
                        setCityKey(next.key);
                        setNeighborhood(next.neighborhoods[0].name);
                      }}
                    >
                      {SUPPORTED_COUNTRIES.map((country) => (
                        <option value={country.code} key={country.code}>
                          {country.flag} {t(country.name)}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label={t("Service city")} htmlFor="city">
                    <Select
                      id="city"
                      value={city.key}
                      onChange={(event) => {
                        const next = SUPPORTED_CITIES.find(
                          (option) => option.key === event.target.value,
                        );
                        if (!next) return;
                        setCityKey(next.key);
                        setNeighborhood(next.neighborhoods[0].name);
                      }}
                    >
                      {citiesForCountry(city.countryCode).map((option) => (
                        <option value={option.key} key={option.key}>
                          {option.city}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <Field
                  label={t("Your general area")}
                  hint={t(
                    "Used for a possible real introduction, never shown precisely.",
                  )}
                >
                  <div className="flex flex-wrap gap-2">
                    {city.neighborhoods.map((area) => (
                      <Chip
                        key={area.name}
                        selected={neighborhood === area.name}
                        onClick={() => setNeighborhood(area.name)}
                      >
                        {area.name}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <Field
                  label={t("What reliably lights you up?")}
                  hint={t("Choose at least three.")}
                >
                  <div className="flex max-h-48 flex-wrap gap-2 overflow-auto pr-2">
                    {INTEREST_OPTIONS.slice(0, 36).map((interest) => (
                      <Chip
                        key={interest}
                        selected={interests.includes(interest)}
                        onClick={() =>
                          toggle(interest, interests, setInterests)
                        }
                      >
                        {t(interest)}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <Field
                  label={t("How would close friends describe you?")}
                  hint={t(
                    "Choose at least two. This helps the match work both ways.",
                  )}
                >
                  <div className="flex flex-wrap gap-2">
                    {PERSONALITIES.map((trait) => (
                      <Chip
                        key={trait}
                        selected={personalityTraits.includes(trait)}
                        onClick={() =>
                          toggle(trait, personalityTraits, setPersonalityTraits)
                        }
                      >
                        {t(trait)}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <Field
                  label={t("Tell {agent} the version close friends know", {
                    agent: agentDisplayName,
                  })}
                  hint={t(
                    "Contradictions and odd habits are more useful than a polished bio.",
                  )}
                  htmlFor="agent-essence"
                >
                  <TextArea
                    id="agent-essence"
                    rows={6}
                    value={essence}
                    placeholder={t(
                      "I look outgoing, but I need quiet after crowded rooms. I fall for people who are curious without performing it…",
                    )}
                    onChange={(event) => setEssence(event.target.value)}
                  />
                </Field>
                <Notice
                  tone="info"
                  title={t("Your Agent represents you — it is not you")}
                >
                  {t(
                    "Other agents always see an AI identity. Contact unlocks only after both humans independently say yes.",
                  )}
                </Notice>
              </section>
            )}

            {error && (
              <p
                className="mt-5 rounded-xl bg-[var(--tint-ember-bg)] p-4 text-[14px] text-[var(--tint-ember-fg)]"
                role="alert"
              >
                {error}
              </p>
            )}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-6">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  onClick={() => setStep((step - 1) as Step)}
                >
                  {t("Back")}
                </Button>
              ) : (
                <span />
              )}
              {step < 3 ? (
                <Button
                  size="lg"
                  disabled={!stepReady[step]}
                  onClick={() => setStep((step + 1) as Step)}
                >
                  {step === 1
                    ? t("Tell {agent} who to find →", {
                        agent: agentDisplayName,
                      })
                    : t("Now tell it about me →")}
                </Button>
              ) : (
                <Button
                  size="lg"
                  loading={busy}
                  disabled={!stepReady[3]}
                  onClick={() => void submit()}
                >
                  {t("Seal the brief and see the pass →")}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

function StrengthField({
  label,
  value,
  onChange,
  t,
}: {
  label: string;
  value: Strength;
  onChange: (value: Strength) => void;
  t: (key: string) => string;
}) {
  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["important", "Important"],
            ["flexible", "Flexible"],
            ["no_preference", "Doesn't matter"],
          ] as Array<[Strength, string]>
        ).map(([key, text]) => (
          <Chip
            key={key}
            selected={value === key}
            onClick={() => onChange(key)}
          >
            {t(text)}
          </Chip>
        ))}
      </div>
    </Field>
  );
}
