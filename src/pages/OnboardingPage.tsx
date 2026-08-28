import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  ACCESSIBILITY_OPTIONS,
  BUDGET_BANDS,
  DATE_TYPE_OPTIONS,
  DIETARY_OPTIONS,
  FIRST_DATE_VIBE_OPTIONS,
  HOBBY_OPTIONS,
  INTEREST_OPTIONS,
  LANGUAGE_OPTIONS,
  OCCUPATION_CATEGORIES,
  SUPPORTED_CITIES,
} from "@convex/lib/catalog";
import { Logo } from "../components/layout/Logo";
import { LocaleSwitcher } from "../components/layout/LocaleSwitcher";
import {
  ChipGroup,
  ChipRadio,
  SelectionCount,
} from "../components/forms/ChipGroup";
import { AvailabilityEditor } from "../components/forms/AvailabilityEditor";
import {
  Button,
  Card,
  Field,
  Notice,
  SegmentedControl,
  Select,
  Spinner,
  TextArea,
  TextInput,
  Toggle,
  cx,
} from "../components/ui/primitives";
import { readableError, useToast } from "../components/ui/Toast";
import { ageFromDateString, dobStringToMs, formatMoney } from "../lib/format";
import { useI18n } from "../i18n";

type Gender = "woman" | "man" | "nonbinary" | "other";

const GENDER_OPTIONS: Array<{ key: Gender; label: string }> = [
  { key: "woman", label: "Woman" },
  { key: "man", label: "Man" },
  { key: "nonbinary", label: "Non-binary" },
  { key: "other", label: "Something else" },
];

const STEPS = [
  "Basics",
  "About you",
  "Who you're looking for",
  "Your kind of date",
  "When you're free",
  "Ready",
];

export default function OnboardingPage() {
  const me = useQuery(api.profiles.me);
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useI18n();

  const saveBasics = useMutation(api.profiles.saveBasics);
  const saveAbout = useMutation(api.profiles.saveAbout);
  const saveDating = useMutation(api.profiles.saveDatingPreferences);
  const saveDate = useMutation(api.profiles.saveDatePreferences);
  const complete = useMutation(api.profiles.completeOnboarding);

  const [step, setStep] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------------ form state ------------------------------ */
  const [displayName, setDisplayName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender>("woman");
  const [pronouns, setPronouns] = useState("");
  const [interestedIn, setInterestedIn] = useState<Gender[]>([]);
  const [cityKey, setCityKey] = useState<string>(SUPPORTED_CITIES[0].key);
  const [neighborhood, setNeighborhood] = useState<string>(
    SUPPORTED_CITIES[0].neighborhoods[0].name,
  );
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const [bio, setBio] = useState("");
  const [occupation, setOccupation] = useState("");
  const [showOccupation, setShowOccupation] = useState(true);
  const [interests, setInterests] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [socialEnergy, setSocialEnergy] = useState<
    "introvert" | "ambivert" | "extrovert"
  >("ambivert");
  const [firstDateVibe, setFirstDateVibe] = useState<string[]>([]);
  const [smokes, setSmokes] = useState(false);
  const [drinks, setDrinks] = useState<"none" | "occasional" | "social">(
    "occasional",
  );

  const [ageMin, setAgeMin] = useState(25);
  const [ageMax, setAgeMax] = useState(38);
  const [ageHard, setAgeHard] = useState(true);
  const [maxDistanceKm, setMaxDistanceKm] = useState(15);
  const [distanceHard, setDistanceHard] = useState(true);
  const [intent, setIntent] = useState<
    "casual" | "open" | "serious" | "friendship" | "unsure"
  >("open");
  const [intentHard, setIntentHard] = useState(false);
  const [smoking, setSmoking] = useState<
    "no_preference" | "non_smoker_only" | "smoker_ok"
  >("no_preference");
  const [smokingHard, setSmokingHard] = useState(false);
  const [alcohol, setAlcohol] = useState<
    "none" | "occasional" | "social" | "no_preference"
  >("no_preference");
  const [alcoholHard, setAlcoholHard] = useState(false);
  const [dayPreference, setDayPreference] = useState<
    "weekday" | "weekend" | "either"
  >("either");

  const [dateTypes, setDateTypes] = useState<string[]>(["coffee", "dinner"]);
  const [indoorOutdoor, setIndoorOutdoor] = useState<
    "indoor" | "outdoor" | "either"
  >("either");
  const [atmosphere, setAtmosphere] = useState<"quiet" | "lively" | "either">(
    "either",
  );
  // null means "not chosen yet". Using 0 as the sentinel made the controlled
  // input snap back to the default the moment someone cleared the field.
  const [budgetMin, setBudgetMin] = useState<number | null>(null);
  const [budgetMax, setBudgetMax] = useState<number | null>(null);
  const [budgetHard, setBudgetHard] = useState(false);
  const [dietary, setDietary] = useState<string[]>([]);
  const [accessibility, setAccessibility] = useState<string[]>([]);

  const city = useMemo(
    () =>
      SUPPORTED_CITIES.find((c) => c.key === cityKey) ?? SUPPORTED_CITIES[0],
    [cityKey],
  );
  const band = BUDGET_BANDS[city.currency] ?? BUDGET_BANDS.USD;

  // Hydrate from the server the first time we know what's already saved.
  if (step === null && me !== undefined) {
    const profile = me?.profile as
      | {
          displayName?: string;
          onboardingStep?: number;
          gender?: Gender;
          interestedIn?: Gender[];
          city?: string;
          neighborhood?: string;
          bio?: string;
          interests?: string[];
          hobbies?: string[];
          languages?: string[];
          socialEnergy?: "introvert" | "ambivert" | "extrovert";
          firstDateVibe?: string[];
          occupationCategory?: string;
          showOccupation?: boolean;
          lifestyle?: {
            smokes: boolean;
            drinks: "none" | "occasional" | "social";
          };
          ageConfirmed18?: boolean;
        }
      | null
      | undefined;

    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setGender(profile.gender ?? "woman");
      setInterestedIn(profile.interestedIn ?? []);
      const found = SUPPORTED_CITIES.find((c) => c.city === profile.city);
      if (found) {
        setCityKey(found.key);
        setNeighborhood(profile.neighborhood ?? found.neighborhoods[0].name);
      }
      setBio(profile.bio ?? "");
      setInterests(profile.interests ?? []);
      setHobbies(profile.hobbies ?? []);
      setLanguages(profile.languages ?? []);
      setSocialEnergy(profile.socialEnergy ?? "ambivert");
      setFirstDateVibe(profile.firstDateVibe ?? []);
      setOccupation(profile.occupationCategory ?? "");
      setShowOccupation(profile.showOccupation ?? true);
      setSmokes(profile.lifestyle?.smokes ?? false);
      setDrinks(profile.lifestyle?.drinks ?? "occasional");
      setAgeConfirmed(profile.ageConfirmed18 ?? false);
    }
    const prefs = me?.preferences as
      | {
          budgetMinPerPerson?: number;
          budgetMaxPerPerson?: number;
          preferredDateTypes?: string[];
        }
      | null
      | undefined;
    if (prefs) {
      setBudgetMin(prefs.budgetMinPerPerson ?? null);
      setBudgetMax(prefs.budgetMaxPerPerson ?? null);
      setDateTypes(prefs.preferredDateTypes ?? ["coffee", "dinner"]);
    }
    setStep(Math.max(0, Math.min(5, (profile?.onboardingStep ?? 1) - 1)));
  }

  if (me === undefined || step === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="h-6 w-6 text-ember-400" />
      </div>
    );
  }

  const effectiveBudgetMin = budgetMin ?? Math.round(band.min * 2);
  const effectiveBudgetMax = budgetMax ?? Math.round(band.max / 2.2);

  async function guard(action: () => Promise<void>) {
    setError(null);
    setBusy(true);
    try {
      await action();
    } catch (e) {
      const message = readableError(e);
      setError(message);
      toast(message, "error");
      throw e;
    } finally {
      setBusy(false);
    }
  }

  async function next() {
    try {
      if (step === 0) {
        await guard(async () => {
          await saveBasics({
            displayName,
            dobMs: dobStringToMs(dob),
            gender,
            pronouns: pronouns.trim() || undefined,
            interestedIn,
            city: city.city,
            neighborhood,
            ageConfirmed18: ageConfirmed,
          });
        });
      } else if (step === 1) {
        await guard(async () => {
          await saveAbout({
            bio,
            occupationCategory: occupation || undefined,
            showOccupation,
            interests,
            hobbies,
            languages,
            socialEnergy,
            firstDateVibe,
            smokes,
            drinks,
          });
        });
      } else if (step === 2) {
        await guard(async () => {
          await saveDating({
            ageMin,
            ageMax,
            ageHard,
            maxDistanceKm,
            distanceHard,
            relationshipIntent: intent,
            intentHard,
            smoking,
            smokingHard,
            alcohol,
            alcoholHard,
            dayPreference,
          });
        });
      } else if (step === 3) {
        await guard(async () => {
          await saveDatePreferences();
        });
      } else if (step === 5) {
        await guard(async () => {
          await complete({});
          navigate("/dashboard", { replace: true });
        });
        return;
      }
      setStep((s) => Math.min(5, (s ?? 0) + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      /* error already surfaced */
    }
  }

  async function saveDatePreferences() {
    await saveDate({
      preferredDateTypes: dateTypes,
      indoorOutdoor,
      atmosphere,
      budgetMinPerPerson: effectiveBudgetMin,
      budgetMaxPerPerson: effectiveBudgetMax,
      budgetHard,
      dietary,
      accessibility,
    });
  }

  // dobMs is never returned to the client, so after a reload the age comes from
  // the denormalised ageYears the server keeps for exactly this reason.
  const savedAge = (me?.profile as { ageYears?: number } | null | undefined)
    ?.ageYears;
  const age = ageFromDateString(dob) ?? savedAge ?? null;
  const canContinue = (() => {
    switch (step) {
      case 0:
        return (
          displayName.trim().length >= 2 &&
          age !== null &&
          age >= 18 &&
          interestedIn.length > 0 &&
          ageConfirmed
        );
      case 1:
        return interests.length >= 3;
      case 2:
        return ageMax >= ageMin;
      case 3:
        return dateTypes.length > 0;
      case 4:
        return me?.hasAvailability === true;
      default:
        return true;
    }
  })();

  return (
    <div className="min-h-dvh">
      <header className="glass-bar sticky top-0 z-20 border-b border-[var(--border)]">
        <div className="mx-auto max-w-2xl px-5 py-4 sm:px-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Logo className="h-6 w-6" />
              <span className="brand-wordmark text-[18px] font-medium">
                Datehaja
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LocaleSwitcher compact />
              <span className="docket-label text-muted">
                {t("Brief")} {String(step + 1).padStart(2, "0")} /{" "}
                {String(STEPS.length).padStart(2, "0")}
              </span>
            </div>
          </div>
          <div
            className="flex gap-1.5"
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-label={t("Onboarding progress")}
          >
            {STEPS.map((label, index) => (
              <div
                key={label}
                className={cx(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  index <= step ? "bg-ember-400" : "bg-[var(--border)]",
                )}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-32 pt-8 sm:px-8 sm:pt-12">
        <div className="docket-label mb-3 text-[var(--accent-text)]">
          {t(STEPS[step])}
        </div>
        <h1 className="mb-2 text-[28px] leading-tight">{t(stepTitle(step))}</h1>
        <p className="mb-8 text-[15.5px] leading-relaxed text-soft">
          {t(stepBlurb(step))}
        </p>

        {error && (
          <div className="mb-6">
            <Notice tone="warn">{error}</Notice>
          </div>
        )}

        {step === 0 && (
          <div className="animate-fade-up">
            <Field
              label={t("What should we call you?")}
              hint={t("Matches only ever see your first name.")}
              htmlFor="name"
            >
              <TextInput
                id="name"
                value={displayName}
                maxLength={40}
                autoComplete="given-name"
                placeholder="Mina"
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </Field>

            <Field
              label={t("Date of birth")}
              hint={t(
                "Used to check you're 18+ and to match age ranges. Never shown to anyone.",
              )}
              htmlFor="dob"
              error={
                dob && age !== null && age < 18
                  ? t("You must be 18 or over.")
                  : null
              }
            >
              <TextInput
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
              {age !== null && age >= 18 && (
                <p className="mt-1.5 text-[13px] text-muted">
                  {t("You'll appear as {age}.", { age })}
                </p>
              )}
            </Field>

            <Field label={t("You are")}>
              <ChipRadio
                options={GENDER_OPTIONS.map((option) => ({
                  ...option,
                  label: t(option.label),
                }))}
                value={gender}
                onChange={setGender}
                ariaLabel={t("Your gender")}
              />
            </Field>

            <Field label={t("Pronouns")} optional htmlFor="pronouns">
              <TextInput
                id="pronouns"
                value={pronouns}
                maxLength={24}
                placeholder="she/her"
                onChange={(e) => setPronouns(e.target.value)}
              />
            </Field>

            <Field
              label={t("You'd like to meet")}
              hint={t("Pick everyone you'd be happy to be matched with.")}
            >
              <ChipGroup
                options={GENDER_OPTIONS.map((option) => ({
                  ...option,
                  label: t(option.label),
                }))}
                selected={interestedIn}
                onChange={(update) =>
                  setInterestedIn((previous) => update(previous) as Gender[])
                }
                ariaLabel={t("Who you'd like to meet")}
              />
            </Field>

            <Field label={t("City")} htmlFor="city">
              <Select
                id="city"
                value={cityKey}
                onChange={(e) => {
                  const nextCity =
                    SUPPORTED_CITIES.find((c) => c.key === e.target.value) ??
                    SUPPORTED_CITIES[0];
                  setCityKey(nextCity.key);
                  setNeighborhood(nextCity.neighborhoods[0].name);
                  setBudgetMin(null);
                  setBudgetMax(null);
                }}
              >
                {SUPPORTED_CITIES.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.city}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label={t("Roughly where")}
              hint={t(
                "Neighbourhood only — we never store or share your address.",
              )}
            >
              <ChipRadio
                options={city.neighborhoods.map((n) => ({
                  key: n.name,
                  label: n.name,
                }))}
                value={neighborhood}
                onChange={setNeighborhood}
                ariaLabel={t("Your neighbourhood")}
              />
            </Field>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border-strong)] p-4 text-[14.5px] leading-relaxed">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-ember-400)]"
              />
              <span>
                {t(
                  "I confirm I'm 18 or over. Datehaja is an adults-only service.",
                )}
              </span>
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-up">
            <Field
              label="A line or two about you"
              hint="What a stranger would actually want to know. Contact details are removed automatically."
              htmlFor="bio"
            >
              <TextArea
                id="bio"
                value={bio}
                maxLength={600}
                placeholder="I edit documentaries. Big on markets, small on small talk."
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="mt-1.5 text-right text-[12px] text-muted">
                {bio.length}/600
              </p>
            </Field>

            <Field label="What you do" optional htmlFor="occupation">
              <Select
                id="occupation"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              >
                <option value="">Prefer not to say</option>
                {OCCUPATION_CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              {occupation && (
                <div className="mt-2">
                  <Toggle
                    checked={showOccupation}
                    onChange={setShowOccupation}
                    label="Show this to matches"
                    description="Off means it's used for nothing at all."
                  />
                </div>
              )}
            </Field>

            <Field
              label="Interests"
              hint="This is the single biggest input to matching. Pick at least three."
            >
              <ChipGroup
                options={INTEREST_OPTIONS}
                selected={interests}
                onChange={setInterests}
                max={12}
                ariaLabel="Your interests"
              />
              <SelectionCount count={interests.length} min={3} max={12} />
            </Field>

            <Field label="Hobbies" optional>
              <ChipGroup
                options={HOBBY_OPTIONS}
                selected={hobbies}
                onChange={setHobbies}
                max={8}
                ariaLabel="Your hobbies"
              />
            </Field>

            <Field label="Languages you're comfortable dating in">
              <ChipGroup
                options={LANGUAGE_OPTIONS}
                selected={languages}
                onChange={setLanguages}
                max={6}
                ariaLabel="Languages"
              />
            </Field>

            <Field label="On a night out, you're">
              <SegmentedControl
                value={socialEnergy}
                onChange={setSocialEnergy}
                ariaLabel="Social energy"
                options={[
                  { value: "introvert", label: "Introvert" },
                  { value: "ambivert", label: "In between" },
                  { value: "extrovert", label: "Extrovert" },
                ]}
              />
            </Field>

            <Field label="Your ideal first date feels" optional>
              <ChipGroup
                options={FIRST_DATE_VIBE_OPTIONS}
                selected={firstDateVibe}
                onChange={setFirstDateVibe}
                max={5}
                ariaLabel="First date vibe"
              />
            </Field>

            <Field label="Lifestyle">
              <div className="space-y-1">
                <Toggle checked={smokes} onChange={setSmokes} label="I smoke" />
              </div>
              <div className="mt-3">
                <span className="mb-2 block text-[13px] font-medium text-soft">
                  I drink
                </span>
                <SegmentedControl
                  value={drinks}
                  onChange={setDrinks}
                  ariaLabel="Drinking"
                  options={[
                    { value: "none", label: "Not at all" },
                    { value: "occasional", label: "Occasionally" },
                    { value: "social", label: "Socially" },
                  ]}
                />
              </div>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-up">
            <Field label="Age range" hint={`${ageMin} to ${ageMax}`}>
              <div className="flex items-center gap-3">
                <TextInput
                  type="number"
                  min={18}
                  max={99}
                  value={ageMin}
                  aria-label="Minimum age"
                  onChange={(e) => setAgeMin(Number(e.target.value))}
                />
                <span className="text-muted">to</span>
                <TextInput
                  type="number"
                  min={18}
                  max={99}
                  value={ageMax}
                  aria-label="Maximum age"
                  onChange={(e) => setAgeMax(Number(e.target.value))}
                />
              </div>
              <HardToggle
                checked={ageHard}
                onChange={setAgeHard}
                label="This is a hard requirement"
              />
            </Field>

            <Field
              label="How far you'll travel"
              hint={`Up to ${maxDistanceKm} km`}
            >
              <input
                type="range"
                min={2}
                max={50}
                step={1}
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                className="w-full accent-[var(--color-ember-400)]"
                aria-label="Maximum distance in kilometres"
              />
              <HardToggle
                checked={distanceHard}
                onChange={setDistanceHard}
                label="This is a hard requirement"
              />
            </Field>

            <Field label="What you're looking for">
              <ChipRadio
                options={[
                  { key: "casual" as const, label: "Something casual" },
                  { key: "open" as const, label: "Open to anything" },
                  { key: "serious" as const, label: "Something serious" },
                  { key: "friendship" as const, label: "Friendship first" },
                  { key: "unsure" as const, label: "Still working it out" },
                ]}
                value={intent}
                onChange={setIntent}
                ariaLabel="Relationship intent"
              />
              <HardToggle
                checked={intentHard}
                onChange={setIntentHard}
                label="Only match me with compatible intent"
              />
            </Field>

            <Field label="Smoking">
              <SegmentedControl
                value={smoking}
                onChange={setSmoking}
                ariaLabel="Smoking preference"
                options={[
                  { value: "no_preference", label: "No preference" },
                  { value: "non_smoker_only", label: "Non-smokers" },
                  { value: "smoker_ok", label: "Fine either way" },
                ]}
              />
              {smoking === "non_smoker_only" && (
                <HardToggle
                  checked={smokingHard}
                  onChange={setSmokingHard}
                  label="This is a hard requirement"
                />
              )}
            </Field>

            <Field label="Alcohol on a date">
              <SegmentedControl
                value={alcohol}
                onChange={setAlcohol}
                ariaLabel="Alcohol preference"
                options={[
                  { value: "no_preference", label: "No preference" },
                  { value: "occasional", label: "A drink is fine" },
                  { value: "none", label: "Alcohol-free" },
                ]}
              />
              {alcohol === "none" && (
                <HardToggle
                  checked={alcoholHard}
                  onChange={setAlcoholHard}
                  label="This is a hard requirement"
                />
              )}
            </Field>

            <Field label="Best days for you">
              <SegmentedControl
                value={dayPreference}
                onChange={setDayPreference}
                ariaLabel="Day preference"
                options={[
                  { value: "either", label: "Either" },
                  { value: "weekday", label: "Weekdays" },
                  { value: "weekend", label: "Weekends" },
                ]}
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-up">
            <Field
              label="Kinds of date you'd enjoy"
              hint="Pick as many as apply."
            >
              <ChipGroup
                options={DATE_TYPE_OPTIONS.map((d) => ({
                  key: d.key,
                  label: d.label,
                  emoji: d.emoji,
                }))}
                selected={dateTypes}
                onChange={setDateTypes}
                ariaLabel="Preferred date types"
              />
              <SelectionCount count={dateTypes.length} min={1} />
            </Field>

            <Field label="Indoors or outdoors">
              <SegmentedControl
                value={indoorOutdoor}
                onChange={setIndoorOutdoor}
                ariaLabel="Indoor or outdoor"
                options={[
                  { value: "either", label: "Either" },
                  { value: "indoor", label: "Indoors" },
                  { value: "outdoor", label: "Outdoors" },
                ]}
              />
            </Field>

            <Field label="Atmosphere">
              <SegmentedControl
                value={atmosphere}
                onChange={setAtmosphere}
                ariaLabel="Atmosphere"
                options={[
                  { value: "either", label: "Either" },
                  { value: "quiet", label: "Quiet" },
                  { value: "lively", label: "Lively" },
                ]}
              />
            </Field>

            <Field
              label="Comfortable spend, per person"
              hint={`${formatMoney(effectiveBudgetMin, city.currency)} – ${formatMoney(effectiveBudgetMax, city.currency)}`}
            >
              <div className="flex items-center gap-3">
                <TextInput
                  type="number"
                  min={0}
                  step={band.step}
                  value={effectiveBudgetMin}
                  aria-label="Minimum budget"
                  onChange={(e) =>
                    setBudgetMin(
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                />
                <span className="text-muted">to</span>
                <TextInput
                  type="number"
                  min={0}
                  step={band.step}
                  value={effectiveBudgetMax}
                  aria-label="Maximum budget"
                  onChange={(e) =>
                    setBudgetMax(
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                />
              </div>
              <HardToggle
                checked={budgetHard}
                onChange={setBudgetHard}
                label="Never plan anything outside this"
              />
            </Field>

            <Field label="Dietary requirements" optional>
              <ChipGroup
                options={DIETARY_OPTIONS.map((d) => ({
                  key: d.key,
                  label: d.label,
                }))}
                selected={dietary}
                onChange={setDietary}
                ariaLabel="Dietary requirements"
              />
            </Field>

            <Field
              label="Accessibility needs"
              optional
              hint="We'll only ever plan somewhere that meets these. Shared with venues, never with your match."
            >
              <ChipGroup
                options={ACCESSIBILITY_OPTIONS.map((a) => ({
                  key: a.key,
                  label: a.label,
                }))}
                selected={accessibility}
                onChange={setAccessibility}
                ariaLabel="Accessibility needs"
              />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-up">
            <AvailabilityEditor compact />
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade-up">
            <Card className="p-7 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tint-ember-bg)]">
                <Logo className="h-8 w-8" />
              </div>
              <h2 className="mb-2 text-[24px]">
                {t("You're ready for Datehaja.")}
              </h2>
              <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-soft">
                {t(
                  "From here we do the work. When we find someone compatible who's free at the same time, we'll plan a real date and send it to you both.",
                )}
              </p>

              <dl className="mx-auto mt-7 max-w-sm space-y-3 text-left">
                <SummaryRow
                  label={t("You")}
                  value={`${displayName}, ${age ?? "—"}`}
                />
                <SummaryRow
                  label={t("Area")}
                  value={`${neighborhood}, ${city.city}`}
                />
                <SummaryRow
                  label={t("Looking for")}
                  value={interestedIn
                    .map(
                      (g) =>
                        GENDER_OPTIONS.find((o) => o.key === g)?.label ?? g,
                    )
                    .join(", ")}
                />
                <SummaryRow
                  label={t("Age range")}
                  value={`${ageMin}–${ageMax}`}
                />
                <SummaryRow
                  label={t("Interests")}
                  value={interests.slice(0, 4).join(" · ")}
                />
                <SummaryRow
                  label={t("Budget")}
                  value={`${formatMoney(effectiveBudgetMin, city.currency)}–${formatMoney(effectiveBudgetMax, city.currency)}`}
                />
              </dl>
            </Card>

            <div className="mt-4">
              <Notice tone="info" title={t("Demo profiles are on")}>
                {t(
                  "This deployment includes clearly-marked fictional demo profiles so you can see the whole flow immediately. Turn them off any time in Settings.",
                )}
              </Notice>
            </div>
          </div>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_92%,transparent)] pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-5 py-4 sm:px-8">
          {step > 0 && (
            <Button
              variant="ghost"
              onClick={() => {
                setError(null);
                setStep((s) => Math.max(0, (s ?? 0) - 1));
              }}
            >
              {t("Back")}
            </Button>
          )}
          <div className="flex-1" />
          <Button
            onClick={next}
            loading={busy}
            disabled={!canContinue}
            size="lg"
            className="min-w-40"
          >
            {step === 5 ? t("Find me a date") : t("Continue")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function HardToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  const { t } = useI18n();

  return (
    <div className="mt-2">
      <Toggle
        checked={checked}
        onChange={onChange}
        label={label}
        description={
          checked
            ? t("We'll never match you outside this.")
            : t("We'll prefer this, but won't rule someone out for it.")
        }
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-2.5">
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className="text-right text-[14.5px] font-medium">{value || "—"}</dd>
    </div>
  );
}

function stepTitle(step: number): string {
  return [
    "The basics",
    "About you",
    "Who you're looking for",
    "Your kind of date",
    "When are you free?",
    "You're ready.",
  ][step];
}

function stepBlurb(step: number): string {
  return [
    "Just enough to know who to introduce you to.",
    "The parts we actually match on. Be specific rather than impressive.",
    "Mark the things that genuinely rule someone out — everything else we treat as a preference.",
    "This is what we hand to the research engine when it goes looking for places.",
    "This is the one thing Datehaja asks of you, ever. Add a window or two.",
    "That's everything. We'll take it from here.",
  ][step];
}
