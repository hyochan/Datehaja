/* oxlint-disable react/set-state-in-effect -- hydrate a migration form once */
import {
  anonymousVisitorId,
  firstTimeThisSession,
  isAutomatedBrowser,
} from "../lib/growthView";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "@convex/_generated/api";
import {
  INTEREST_OPTIONS,
  LANGUAGE_OPTIONS,
  PERSONALITY_TRAIT_OPTIONS,
  STYLE_TAG_OPTIONS,
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
import { useAuthActions } from "@convex-dev/auth/react";
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
import {
  defaultLanguageForLocale,
  type MatchLocationScope,
} from "../lib/matchingPreferences";
import {
  ABOUT_ME_MAX_INTERESTS,
  ABOUT_ME_MIN_ESSENCE_CHARACTERS,
  ABOUT_ME_MIN_NAME_CHARACTERS,
  IDEAL_PERSON_MIN_CHARACTERS,
  getAboutMeProgress,
  getIdealPersonProgress,
  getMatchingBoundaryProgress,
} from "../lib/onboardingValidation";

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

// The same vocabularies Preferences and Profile render. Onboarding used to have
// its own lists, so a trait picked here had no chip there and was dropped on the
// next save.
const PERSONALITIES = PERSONALITY_TRAIT_OPTIONS;

const STYLES = STYLE_TAG_OPTIONS;

const STEP_COPY = {
  1: {
    kicker: "FIRST · YOUR DATING AGENT",
    title: "Create your Dating Agent.",
    body: "Your Dating Agent is your second self. Give it a face, a voice and permission to be candid.",
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

function isoDateYearsAgo(years: number): string {
  const now = new Date();
  const year = now.getFullYear() - years;
  const month = now.getMonth();
  const day = Math.min(now.getDate(), new Date(year, month + 1, 0).getDate());
  return [
    year,
    String(month + 1).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

export default function AgentOnboardingPage() {
  const me = useQuery(api.profiles.me);
  const bootstrap = useMutation(api.agents.bootstrap);
  const navigate = useNavigate();
  const { locale, t } = useI18n();
  const { signOut } = useAuthActions();
  const track = useMutation(api.growth.track);
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
  const [matchLocationScope, setMatchLocationScope] =
    useState<MatchLocationScope>("city");
  const [selectedCityKeys, setSelectedCityKeys] = useState<string[]>([
    suggested.key,
  ]);
  const [languages, setLanguages] = useState<string[]>([
    defaultLanguageForLocale(locale),
  ]);
  const [allowTranslatedDates, setAllowTranslatedDates] = useState(false);
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

  // Reaching this page is the step before agent_created, which only fires once
  // the whole brief is sealed. Recording it is what lets a review distinguish
  // a CTA nobody presses from a form everybody abandons.
  useEffect(() => {
    try {
      if (isAutomatedBrowser()) return;
      if (!firstTimeThisSession("datehaja-onboarding-start")) return;
      void track({
        anonymousId: anonymousVisitorId(),
        event: "agent_onboarding_started",
        locale,
      }).catch(() => undefined);
    } catch {
      // Analytics must never block the product, including in strict privacy mode.
    }
  }, [locale, track]);

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
      languages?: string[];
    } | null;
    const preferences = me?.preferences as {
      matchLocationScope?: MatchLocationScope;
      preferredCities?: string[];
      allowTranslatedDates?: boolean;
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
      if (profile.languages?.length) setLanguages(profile.languages);
      setEssence(profile.bio ?? "");
    }
    if (preferences?.matchLocationScope) {
      setMatchLocationScope(preferences.matchLocationScope);
    }
    if (preferences?.preferredCities?.length) {
      const cityKeys = SUPPORTED_CITIES.filter((option) =>
        preferences.preferredCities?.includes(option.city),
      ).map((option) => option.key);
      if (cityKeys.length) setSelectedCityKeys(cityKeys);
    }
    if (preferences?.allowTranslatedDates !== undefined) {
      setAllowTranslatedDates(preferences.allowTranslatedDates);
    }
    setHydrated(true);
  }, [hydrated, me]);

  const city =
    SUPPORTED_CITIES.find((option) => option.key === cityKey) ?? suggested;
  const agentDisplayName = agentName.trim() || t("Your Dating Agent");
  const existingAge = (me?.profile as { ageYears?: number } | null | undefined)
    ?.ageYears;
  const idealPersonProgress = getIdealPersonProgress(
    interestedIn,
    desiredConnection,
  );
  const aboutMeProgress = getAboutMeProgress({
    displayName,
    dob,
    existingAge,
    interests,
    personalityTraits,
    essence,
  });
  const selectedMatchCities = SUPPORTED_CITIES.filter((option) =>
    selectedCityKeys.includes(option.key),
  );
  const matchingProgress = getMatchingBoundaryProgress({
    locationScope: matchLocationScope,
    hasCity: Boolean(city.city),
    hasArea: Boolean(neighborhood),
    selectedCityCount: selectedMatchCities.length,
    languageCount: languages.length,
  });
  const matchingLocationReady = matchingProgress.hasLocation;
  const languagesReady = matchingProgress.hasLanguage;
  const dobHint = !dob
    ? existingAge !== undefined
      ? t("Age already verified ✓")
      : t("Choose a date · adults aged 18 to 100 only.")
    : aboutMeProgress.hasAdultDob
      ? t("Age {age} ✓", { age: aboutMeProgress.age ?? "" })
      : t("Enter a valid date for an adult aged 18 to 100.");
  const stepReady = {
    1: agentName.trim().length >= 1,
    2: idealPersonProgress.isReady,
    3: aboutMeProgress.isReady && matchingLocationReady && languagesReady,
  } satisfies Record<Step, boolean>;

  function toggle<T>(value: T, values: T[], update: (next: T[]) => void) {
    update(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );
  }

  function toggleInterest(interest: string) {
    if (interests.includes(interest)) {
      setInterests(interests.filter((item) => item !== interest));
      return;
    }
    if (interests.length < ABOUT_ME_MAX_INTERESTS) {
      setInterests([...interests, interest]);
    }
  }

  function toggleMatchCity(cityKey: string) {
    setSelectedCityKeys((current) =>
      current.includes(cityKey)
        ? current.filter((key) => key !== cityKey)
        : [...current, cityKey],
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
        languages,
        matchLocationScope,
        preferredCountryCodes: [
          ...new Set(
            (matchLocationScope === "selected_cities"
              ? selectedMatchCities
              : [city]
            ).map((option) => option.countryCode),
          ),
        ],
        preferredCities:
          matchLocationScope === "selected_cities"
            ? selectedMatchCities.map((option) => option.city)
            : [city.city],
        preferredAreas: matchLocationScope === "area" ? [neighborhood] : [],
        allowTranslatedDates,
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
        <div className="mx-auto flex h-[5rem] max-w-[80rem] items-center justify-between px-5 sm:h-[5.5rem] sm:px-8">
          <a
            href="/"
            className="brand-lockup flex items-center gap-2.5 sm:gap-3"
            aria-label={t("Datehaja home")}
          >
            <Logo className="brand-lockup-logo h-9 w-9 sm:h-11 sm:w-11" />
            <span className="leading-none">
              <Wordmark className="text-[24px] sm:text-[28px]" />
              <span className="docket-label mt-1.5 hidden text-[8px] text-muted sm:block sm:text-[9px]">
                {t("Your Dating Agent dates first")}
              </span>
            </span>
          </a>
          <div className="flex items-center gap-2">
            <LocaleSwitcher compact />
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-full border border-[var(--border)] px-3 py-2 text-[12px] font-semibold text-muted transition-colors hover:bg-[var(--bg-raised)] hover:text-[var(--text)]"
            >
              {t("Sign out")}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[80rem] gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:py-16">
        <aside className="lg:sticky lg:top-10 lg:self-start">
          <div className="agent-onboarding-studio">
            <span className="agent-onboarding-studio-label">
              {t("MY DATING AGENT")}
            </span>
            <AgentAvatar
              name={agentDisplayName}
              avatar={avatar}
              className="agent-avatar-onboarding"
              label={t("Preview of {agent}", {
                agent: agentDisplayName,
              })}
            />
            <div className="agent-onboarding-identity">
              <span aria-hidden />
              <strong>{agentDisplayName}</strong>
            </div>
          </div>
          <div className="docket-label mt-7 text-[var(--accent-text)]">
            {t(copy.kicker)}
          </div>
          <h1 className="agent-onboarding-title mt-3 max-w-md text-[clamp(2.85rem,5.4vw,4.5rem)] leading-[1]">
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
                    ? "My Dating Agent"
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
                  {t("CREATE YOUR DATING AGENT")}
                </div>
                <h2 className="text-[34px]">{t("Meet your Dating Agent.")}</h2>
                <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-soft">
                  {t(
                    "This one character goes out into the world as you, and is candid only with you.",
                  )}
                </p>
                <Field
                  label={t("Name your Dating Agent")}
                  hint={t(
                    "This is how your Dating Agent introduces itself. You can change it anytime.",
                  )}
                  htmlFor="agent-name"
                >
                  <TextInput
                    id="agent-name"
                    value={agentName}
                    placeholder={t("e.g. Juno")}
                    maxLength={32}
                    onChange={(event) => setAgentName(event.target.value)}
                  />
                </Field>
                <div className="mt-7">
                  <AgentAvatarEditor
                    name={agentDisplayName}
                    value={avatar}
                    onChange={setAvatar}
                    showPreview={false}
                  />
                </div>
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
                <Field
                  label={t("It may meet agents representing")}
                  hint={t("Choose at least one.")}
                >
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
                    minLength={IDEAL_PERSON_MIN_CHARACTERS}
                    aria-describedby="desired-connection-progress"
                    placeholder={t(
                      "Someone I can disagree with safely, who enjoys their own life and still makes room for another person…",
                    )}
                    onChange={(event) =>
                      setDesiredConnection(event.target.value)
                    }
                  />
                  <div
                    id="desired-connection-progress"
                    className="onboarding-character-progress"
                    data-complete={idealPersonProgress.hasEnoughDescription}
                  >
                    <div>
                      <span>
                        {idealPersonProgress.hasEnoughDescription
                          ? t("Enough to continue ✓")
                          : t("{count} more characters", {
                              count: idealPersonProgress.descriptionRemaining,
                            })}
                      </span>
                      <strong>
                        {t("{count} / 20 minimum", {
                          count: idealPersonProgress.descriptionLength,
                        })}
                      </strong>
                    </div>
                    <span aria-hidden="true">
                      <i
                        style={{
                          width: `${Math.min(
                            100,
                            (idealPersonProgress.descriptionLength /
                              IDEAL_PERSON_MIN_CHARACTERS) *
                              100,
                          )}%`,
                        }}
                      />
                    </span>
                  </div>
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
                <Field label={t("What are you open to?")} hint={t(relationshipIntent === "serious" ? "Serious relationships are matched with people seeking the same." : "Your Dating Agent looks for people whose relationship goals fit yours.")}>
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
                  {t("What should your Dating Agent know about you?")}
                </h2>
                <div className="mt-6 grid gap-x-5 sm:grid-cols-2">
                  <Field
                    label={t("What should we call you?")}
                    hint={t("At least 2 characters.")}
                    htmlFor="display-name"
                  >
                    <TextInput
                      id="display-name"
                      value={displayName}
                      minLength={ABOUT_ME_MIN_NAME_CHARACTERS}
                      onChange={(event) => setDisplayName(event.target.value)}
                    />
                  </Field>
                  <Field
                    label={t("Date of birth")}
                    hint={dobHint}
                    htmlFor="dob"
                  >
                    <TextInput
                      id="dob"
                      type="date"
                      min={isoDateYearsAgo(100)}
                      max={isoDateYearsAgo(18)}
                      value={dob}
                      onChange={(event) => setDob(event.target.value)}
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
                <div className="onboarding-match-boundary">
                  <div>
                    <span className="docket-label text-[var(--accent-text)]">
                      {t("MATCHING BOUNDARY")}
                    </span>
                    <h3 className="mt-2 text-[24px]">
                      {t("Where may {agent} look?", {
                        agent: agentDisplayName,
                      })}
                    </h3>
                    <p className="mt-2 text-[13px] leading-[1.7] text-soft">
                      {t(
                        "A match happens only when both people's location choices include each other.",
                      )}
                    </p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {(
                      [
                        ["area", "My selected area"],
                        ["city", "Anywhere in my city"],
                        ["selected_cities", "Cities I choose"],
                      ] as Array<[MatchLocationScope, string]>
                    ).map(([scope, label]) => (
                      <Chip
                        key={scope}
                        selected={matchLocationScope === scope}
                        onClick={() => setMatchLocationScope(scope)}
                      >
                        {t(label)}
                      </Chip>
                    ))}
                  </div>
                  {matchLocationScope === "selected_cities" && (
                    <div className="mt-5">
                      <p className="mb-3 text-[12px] font-bold text-soft">
                        {t("{count} cities selected · choose at least one.", {
                          count: selectedMatchCities.length,
                        })}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {SUPPORTED_CITIES.map((option) => {
                          const country = SUPPORTED_COUNTRIES.find(
                            (item) => item.code === option.countryCode,
                          );
                          return (
                            <Chip
                              key={option.key}
                              selected={selectedCityKeys.includes(option.key)}
                              onClick={() => toggleMatchCity(option.key)}
                            >
                              {country?.flag} {t(option.city)}
                            </Chip>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-sunken)] px-4 py-3 text-[12px] leading-[1.65] text-soft">
                    {matchLocationScope === "area"
                      ? t("Searching only around {area}, {city}.", {
                          area: neighborhood,
                          city: city.city,
                        })
                      : matchLocationScope === "city"
                        ? t("Searching across {city}.", { city: city.city })
                        : t("Searching only in your {count} selected cities.", {
                            count: selectedMatchCities.length,
                          })}
                    <br />
                    {t(
                      "We match realistic meeting locations, not nationality.",
                    )}
                  </div>
                </div>
                <Field
                  label={t("Languages you can comfortably use")}
                  hint={t(
                    "Choose at least one. A shared language is required unless both people allow translation.",
                  )}
                >
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map((language) => (
                      <Chip
                        key={language}
                        selected={languages.includes(language)}
                        onClick={() =>
                          toggle(language, languages, setLanguages)
                        }
                      >
                        {t(language)}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <button
                  type="button"
                  className="onboarding-translation-consent"
                  aria-pressed={allowTranslatedDates}
                  onClick={() => setAllowTranslatedDates((value) => !value)}
                >
                  <span aria-hidden="true">
                    {allowTranslatedDates ? "✓" : "○"}
                  </span>
                  <span>
                    <strong>{t("Allow translated Agent dates")}</strong>
                    <small>
                      {t("Only when the other person opts in too.")}
                    </small>
                  </span>
                </button>
                <Field
                  label={t("What reliably lights you up?")}
                  hint={t("{count} selected · choose 3 to 8.", {
                    count: interests.length,
                  })}
                >
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.slice(0, 36).map((interest) => (
                      <Chip
                        key={interest}
                        selected={interests.includes(interest)}
                        disabled={
                          interests.length >= ABOUT_ME_MAX_INTERESTS &&
                          !interests.includes(interest)
                        }
                        onClick={() => toggleInterest(interest)}
                      >
                        {t(interest)}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <Field
                  label={t("How would close friends describe you?")}
                  hint={t("{count} selected · choose at least two.", {
                    count: personalityTraits.length,
                  })}
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
                    minLength={ABOUT_ME_MIN_ESSENCE_CHARACTERS}
                    aria-describedby="agent-essence-progress"
                    placeholder={t(
                      "I look outgoing, but I need quiet after crowded rooms. I fall for people who are curious without performing it…",
                    )}
                    onChange={(event) => setEssence(event.target.value)}
                  />
                  <div
                    id="agent-essence-progress"
                    className="onboarding-character-progress"
                    data-complete={aboutMeProgress.hasEssence}
                  >
                    <div>
                      <span>
                        {aboutMeProgress.hasEssence
                          ? t("Enough to continue ✓")
                          : t("{count} more characters", {
                              count: aboutMeProgress.essenceRemaining,
                            })}
                      </span>
                      <strong>
                        {t("{count} / 30 minimum", {
                          count: aboutMeProgress.essenceLength,
                        })}
                      </strong>
                    </div>
                    <span aria-hidden="true">
                      <i
                        style={{
                          width: `${Math.min(
                            100,
                            (aboutMeProgress.essenceLength /
                              ABOUT_ME_MIN_ESSENCE_CHARACTERS) *
                              100,
                          )}%`,
                        }}
                      />
                    </span>
                  </div>
                </Field>
                <Notice
                  tone="info"
                  title={t("Your Dating Agent represents you — it is not you")}
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

            {step === 2 && (
              <div
                id="ideal-person-requirements"
                className="onboarding-requirements"
                data-complete={idealPersonProgress.isReady}
              >
                <div className="onboarding-requirements-title">
                  <span aria-hidden="true">
                    {idealPersonProgress.isReady
                      ? "✓"
                      : `${idealPersonProgress.completedRequirements}/2`}
                  </span>
                  <strong>
                    {idealPersonProgress.isReady
                      ? t("Ready for the next step")
                      : t("Before you continue")}
                  </strong>
                </div>
                <div className="onboarding-requirements-items">
                  <span data-complete={idealPersonProgress.hasAudience}>
                    <i aria-hidden="true">
                      {idealPersonProgress.hasAudience ? "✓" : "○"}
                    </i>
                    {t("Choose who your Dating Agent may meet")}
                  </span>
                  <span
                    data-complete={idealPersonProgress.hasEnoughDescription}
                  >
                    <i aria-hidden="true">
                      {idealPersonProgress.hasEnoughDescription ? "✓" : "○"}
                    </i>
                    {t("Describe the connection ({count}/20)", {
                      count: idealPersonProgress.descriptionLength,
                    })}
                  </span>
                </div>
              </div>
            )}

            {step === 3 && (
              <div
                id="about-me-requirements"
                className="onboarding-requirements onboarding-requirements-wide"
                data-complete={aboutMeProgress.isReady}
              >
                <div className="onboarding-requirements-title">
                  <span aria-hidden="true">
                    {aboutMeProgress.isReady
                      ? "✓"
                      : `${
                          aboutMeProgress.completedRequirements +
                          Number(matchingLocationReady) +
                          Number(languagesReady)
                        }/7`}
                  </span>
                  <strong>
                    {aboutMeProgress.isReady
                      ? t("Ready to create your Dating Agent")
                      : t("Complete these to continue")}
                  </strong>
                </div>
                <div className="onboarding-requirements-items">
                  <Requirement
                    complete={aboutMeProgress.hasName}
                    label={t("Your name (2+ characters)")}
                  />
                  <Requirement
                    complete={aboutMeProgress.hasAdultDob}
                    label={t("Adult birth date")}
                  />
                  <Requirement
                    complete={aboutMeProgress.hasInterests}
                    label={t("Interests ({count}/3)", {
                      count: Math.min(interests.length, 3),
                    })}
                  />
                  <Requirement
                    complete={aboutMeProgress.hasPersonality}
                    label={t("Personality ({count}/2)", {
                      count: Math.min(personalityTraits.length, 2),
                    })}
                  />
                  <Requirement
                    complete={aboutMeProgress.hasEssence}
                    label={t("About you ({count}/30)", {
                      count: Math.min(aboutMeProgress.essenceLength, 30),
                    })}
                  />
                  <Requirement
                    complete={matchingLocationReady}
                    label={t("Matching location selected")}
                  />
                  <Requirement
                    complete={languagesReady}
                    label={t("At least one shared language")}
                  />
                </div>
              </div>
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
                  aria-describedby={
                    step === 2 ? "ideal-person-requirements" : undefined
                  }
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
                  aria-describedby="about-me-requirements"
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

function Requirement({
  complete,
  label,
}: {
  complete: boolean;
  label: string;
}) {
  return (
    <span data-complete={complete}>
      <i aria-hidden="true">{complete ? "✓" : "○"}</i>
      {label}
    </span>
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
