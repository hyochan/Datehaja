import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  ACCESSIBILITY_OPTIONS,
  BUDGET_BANDS,
  DATE_TYPE_OPTIONS,
  defaultBudgetRange,
  DIETARY_OPTIONS,
  FIRST_DATE_VIBE_OPTIONS,
  HOBBY_OPTIONS,
  INTEREST_OPTIONS,
  LANGUAGE_OPTIONS,
  OCCUPATION_CATEGORIES,
  PERSONALITY_TRAIT_OPTIONS,
  STYLE_TAG_OPTIONS,
  SUPPORTED_CITIES,
  SUPPORTED_COUNTRIES,
  citiesForCountry,
  suggestCity,
} from "@convex/lib/catalog";
import { Logo } from "../components/layout/Logo";
import { Wordmark } from "../components/layout/Wordmark";
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
  "Your date idea",
  "Ready",
];

export default function OnboardingPage() {
  const me = useQuery(api.profiles.me);
  const navigate = useNavigate();
  const toast = useToast();
  const { locale, t } = useI18n();
  const browserTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );
  const suggestedCity = useMemo(
    () => suggestCity(locale.split("-")[1], browserTimezone),
    [browserTimezone, locale],
  );

  const saveBasics = useMutation(api.profiles.saveBasics);
  const saveAbout = useMutation(api.profiles.saveAbout);
  const saveDating = useMutation(api.profiles.saveDatingPreferences);
  const saveDate = useMutation(api.profiles.saveDatePreferences);
  const complete = useMutation(api.profiles.completeOnboarding);
  const generateUploadUrl = useMutation(api.profiles.generatePhotoUploadUrl);
  const setPhoto = useMutation(api.profiles.setPhoto);
  const setPhotoVisibility = useMutation(api.profiles.setPhotoVisibility);
  const fileInput = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------------ form state ------------------------------ */
  const [displayName, setDisplayName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender>("woman");
  const [pronouns, setPronouns] = useState("");
  const [interestedIn, setInterestedIn] = useState<Gender[]>([]);
  const [cityKey, setCityKey] = useState<string>(suggestedCity.key);
  const [neighborhood, setNeighborhood] = useState<string>(
    suggestedCity.neighborhoods[0].name,
  );
  const [locationConfirmed, setLocationConfirmed] = useState(false);
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
  const [personalityTraits, setPersonalityTraits] = useState<string[]>([]);
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [profileTruthConfirmed, setProfileTruthConfirmed] = useState(false);
  const [photoVisibility, setPhotoVisibilityState] = useState<
    "with_match" | "after_accept"
  >("after_accept");
  const [smokes, setSmokes] = useState(false);
  const [drinks, setDrinks] = useState<"none" | "occasional" | "social">(
    "occasional",
  );

  const [ageMin, setAgeMin] = useState(25);
  const [ageMax, setAgeMax] = useState(38);
  const [ageHard, setAgeHard] = useState(true);
  const [maxDistanceKm, setMaxDistanceKm] = useState(15);
  const [distanceHard, setDistanceHard] = useState(true);
  const [preferredAreas, setPreferredAreas] = useState<string[]>([
    suggestedCity.neighborhoods[0].name,
  ]);
  const [areaHard, setAreaHard] = useState(false);
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
  const [preferredPersonalityTraits, setPreferredPersonalityTraits] = useState<
    string[]
  >([]);
  const [personalityPreference, setPersonalityPreference] = useState<
    "important" | "flexible" | "no_preference"
  >("no_preference");
  const [preferredStyleTags, setPreferredStyleTags] = useState<string[]>([]);
  const [stylePreference, setStylePreference] = useState<
    "important" | "flexible" | "no_preference"
  >("no_preference");

  const [dateTypes, setDateTypes] = useState<string[]>([
    "film",
    "walk",
    "coffee",
  ]);
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
  const countryCities = useMemo(
    () => citiesForCountry(city.countryCode),
    [city.countryCode],
  );
  const band = BUDGET_BANDS[city.currency] ?? BUDGET_BANDS.USD;
  const defaultBudget = defaultBudgetRange(city.currency);

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
          personalityTraits?: string[];
          styleTags?: string[];
          profileTruthConfirmed?: boolean;
          photoVisibility?: "with_match" | "after_accept";
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
        setLocationConfirmed(true);
      }
      setBio(profile.bio ?? "");
      setInterests(profile.interests ?? []);
      setHobbies(profile.hobbies ?? []);
      setLanguages(profile.languages ?? []);
      setSocialEnergy(profile.socialEnergy ?? "ambivert");
      setFirstDateVibe(profile.firstDateVibe ?? []);
      setPersonalityTraits(profile.personalityTraits ?? []);
      setStyleTags(profile.styleTags ?? []);
      setProfileTruthConfirmed(profile.profileTruthConfirmed ?? false);
      setPhotoVisibilityState(profile.photoVisibility ?? "after_accept");
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
          preferredAreas?: string[];
          areaHard?: boolean;
          preferredPersonalityTraits?: string[];
          personalityPreference?: "important" | "flexible" | "no_preference";
          preferredStyleTags?: string[];
          stylePreference?: "important" | "flexible" | "no_preference";
        }
      | null
      | undefined;
    if (prefs) {
      setBudgetMin(prefs.budgetMinPerPerson ?? null);
      setBudgetMax(prefs.budgetMaxPerPerson ?? null);
      setDateTypes(prefs.preferredDateTypes ?? ["film", "walk", "coffee"]);
      setPreferredAreas(
        prefs.preferredAreas ??
          (profile?.neighborhood ? [profile.neighborhood] : []),
      );
      setAreaHard(prefs.areaHard ?? false);
      setPreferredPersonalityTraits(prefs.preferredPersonalityTraits ?? []);
      setPersonalityPreference(prefs.personalityPreference ?? "no_preference");
      setPreferredStyleTags(prefs.preferredStyleTags ?? []);
      setStylePreference(prefs.stylePreference ?? "no_preference");
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

  const effectiveBudgetMin = budgetMin ?? defaultBudget.min;
  const effectiveBudgetMax = budgetMax ?? defaultBudget.max;

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

  async function handlePhoto(file: File) {
    if (!file.type.startsWith("image/")) {
      toast(t("Choose an image file."), "error");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      toast(t("Photos must be under 6MB."), "error");
      return;
    }
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl({});
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!result.ok) throw new Error(t("Upload failed."));
      const { storageId } = (await result.json()) as {
        storageId: Id<"_storage">;
      };
      await setPhoto({ storageId });
      toast(t("Optional photo saved."), "success");
    } catch (uploadError) {
      toast(readableError(uploadError), "error");
    } finally {
      setUploading(false);
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
            personalityTraits,
            styleTags,
            profileTruthConfirmed,
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
            preferredAreas,
            areaHard,
            relationshipIntent: intent,
            intentHard,
            smoking,
            smokingHard,
            alcohol,
            alcoholHard,
            dayPreference,
            preferredPersonalityTraits,
            personalityPreference,
            preferredStyleTags,
            stylePreference,
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
          locationConfirmed &&
          ageConfirmed
        );
      case 1:
        return interests.length >= 3 && profileTruthConfirmed;
      case 2:
        return (
          ageMax >= ageMin &&
          (!areaHard || preferredAreas.length > 0) &&
          (personalityPreference === "no_preference" ||
            preferredPersonalityTraits.length > 0) &&
          (stylePreference === "no_preference" || preferredStyleTags.length > 0)
        );
      case 3:
        return dateTypes.length > 0;
      case 4:
        return me?.hasAvailability === true;
      default:
        return true;
    }
  })();

  return (
    <div className="onboarding-page min-h-dvh">
      <header className="onboarding-header glass-bar sticky top-0 z-20 border-b border-[var(--border)]">
        <div className="mx-auto max-w-2xl px-5 py-4 sm:px-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Logo className="h-6 w-6" />
              <Wordmark className="text-[20px]" />
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

      <main className="onboarding-main mx-auto max-w-2xl px-5 pb-32 pt-8 sm:px-8 sm:pt-12">
        <div
          className={cx(
            "onboarding-step-intro",
            `onboarding-step-intro-${step % 4}`,
          )}
        >
          <div className="relative z-[1] max-w-lg">
            <div className="docket-label mb-3 text-current opacity-70">
              {t(STEPS[step])}
            </div>
            <h1 className="text-[clamp(2.35rem,8vw,3.85rem)] leading-[0.98] tracking-[-0.04em]">
              {t(stepTitle(step))}
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-[1.65] opacity-75">
              {t(stepBlurb(step))}
            </p>
          </div>
          <span className="onboarding-step-number" aria-hidden>
            {String(step + 1).padStart(2, "0")}
          </span>
        </div>

        {error && (
          <div className="mb-6 mt-6">
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
                type="text"
                inputMode="numeric"
                autoComplete="bday"
                placeholder="YYYY-MM-DD"
                pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                value={dob}
                onChange={(e) => setDob(e.target.value.slice(0, 10))}
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

            <Field label={t("Country")} htmlFor="country">
              <Select
                id="country"
                value={city.countryCode}
                onChange={(event) => {
                  const available = citiesForCountry(event.target.value);
                  const nextCity =
                    available.find(
                      (option) => option.timezone === browserTimezone,
                    ) ?? available[0];
                  if (!nextCity) return;
                  setCityKey(nextCity.key);
                  setNeighborhood(nextCity.neighborhoods[0].name);
                  setPreferredAreas([nextCity.neighborhoods[0].name]);
                  setAreaHard(false);
                  setLocationConfirmed(false);
                  setBudgetMin(null);
                  setBudgetMax(null);
                }}
              >
                {SUPPORTED_COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {t(country.name)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label={t("Service city")}
              hint={t("We match within one city so plans stay practical.")}
              htmlFor="city"
            >
              <Select
                id="city"
                value={cityKey}
                onChange={(e) => {
                  const nextCity =
                    SUPPORTED_CITIES.find((c) => c.key === e.target.value) ??
                    SUPPORTED_CITIES[0];
                  setCityKey(nextCity.key);
                  setNeighborhood(nextCity.neighborhoods[0].name);
                  setPreferredAreas([nextCity.neighborhoods[0].name]);
                  setAreaHard(false);
                  setLocationConfirmed(false);
                  setBudgetMin(null);
                  setBudgetMax(null);
                }}
              >
                {countryCities.map((option) => (
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
                onChange={(nextNeighborhood) => {
                  setNeighborhood(nextNeighborhood);
                  if (preferredAreas.length <= 1) {
                    setPreferredAreas([nextNeighborhood]);
                  }
                }}
                ariaLabel={t("Your neighbourhood")}
              />
            </Field>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--tint-sage-border)] bg-[var(--tint-sage-bg)] p-4 text-[14.5px] leading-relaxed">
              <input
                type="checkbox"
                checked={locationConfirmed}
                onChange={(event) => setLocationConfirmed(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-ember-400)]"
              />
              <span>
                {t(
                  "This is the city where I want to meet people and go on dates.",
                )}
              </span>
            </label>

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
              hint={t(
                "Write what a date would genuinely want to know. Contact details are removed automatically.",
              )}
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

            <Field
              label={t("Profile photo")}
              hint={t(
                "Optional. A thoughtful introduction works without one too.",
              )}
              optional
            >
              <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-sunken)] p-4">
                {me?.photoUrl ? (
                  <img
                    src={me.photoUrl}
                    alt={t("Your optional profile")}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--tint-ember-bg)] font-display text-[22px] text-[var(--accent-text)]">
                    {(displayName || "D").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={uploading}
                    onClick={() => fileInput.current?.click()}
                  >
                    {t(me?.photoUrl ? "Replace photo" : "Add a photo")}
                  </Button>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handlePhoto(file);
                      event.target.value = "";
                    }}
                  />
                </div>
              </div>
              {me?.photoUrl && (
                <div className="mt-3">
                  <SegmentedControl
                    value={photoVisibility}
                    onChange={async (visibility) => {
                      setPhotoVisibilityState(visibility);
                      try {
                        await setPhotoVisibility({ visibility });
                      } catch (visibilityError) {
                        toast(readableError(visibilityError), "error");
                      }
                    }}
                    ariaLabel={t("Photo visibility")}
                    options={[
                      {
                        value: "with_match",
                        label: t("Show with my match card"),
                      },
                      {
                        value: "after_accept",
                        label: t("Only after we both accept"),
                      },
                    ]}
                  />
                </div>
              )}
            </Field>

            <Field
              label={t("How would people who know you describe you?")}
              hint={t(
                "Pick up to five. Choose what is true, not what sounds impressive.",
              )}
            >
              <ChipGroup
                options={PERSONALITY_TRAIT_OPTIONS}
                selected={personalityTraits}
                onChange={setPersonalityTraits}
                max={5}
                ariaLabel={t("Your personality")}
              />
            </Field>

            <Field
              label={t("Your everyday style")}
              hint={t(
                "Optional and self-described — never an appearance score.",
              )}
              optional
            >
              <ChipGroup
                options={STYLE_TAG_OPTIONS}
                selected={styleTags}
                onChange={setStyleTags}
                max={3}
                ariaLabel={t("Your style")}
              />
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

            <div className="rounded-xl border border-[var(--tint-sage-border)] bg-[var(--tint-sage-bg)] p-4">
              <Toggle
                checked={profileTruthConfirmed}
                onChange={setProfileTruthConfirmed}
                label={t("This profile reflects who I am today")}
                description={t(
                  "Honest details reduce awkward surprises. Reviews check accuracy and respect, never attractiveness.",
                )}
              />
            </div>
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

            <Field
              label={t("Where can the date happen?")}
              hint={t("Choose meeting areas, not where your match must live.")}
            >
              <SegmentedControl
                value={preferredAreas.length > 0 ? "selected" : "no_preference"}
                onChange={(value) => {
                  if (value === "no_preference") {
                    setPreferredAreas([]);
                    setAreaHard(false);
                  } else if (preferredAreas.length === 0) {
                    setPreferredAreas([neighborhood]);
                  }
                }}
                ariaLabel={t("Meeting area preference")}
                options={[
                  { value: "no_preference", label: t("Any area") },
                  { value: "selected", label: t("Choose areas") },
                ]}
              />
              {preferredAreas.length > 0 && (
                <div className="mt-3">
                  <ChipGroup
                    options={city.neighborhoods.map((area) => area.name)}
                    selected={preferredAreas}
                    onChange={(update) => {
                      const next = update(preferredAreas);
                      setPreferredAreas(next);
                      if (next.length === 0) setAreaHard(false);
                    }}
                    max={6}
                    ariaLabel={t("Preferred meeting areas")}
                  />
                  <HardToggle
                    checked={areaHard}
                    onChange={setAreaHard}
                    label={t("Only plan dates in these areas")}
                  />
                </div>
              )}
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

            <Field
              label={t("Personality you tend to connect with")}
              hint={t(
                "There is no right answer. Choose ‘No preference’ if chemistry matters more than a type.",
              )}
            >
              <SegmentedControl
                value={personalityPreference}
                onChange={(value) => {
                  setPersonalityPreference(value);
                  if (value === "no_preference") {
                    setPreferredPersonalityTraits([]);
                  }
                }}
                ariaLabel={t("Personality preference strength")}
                options={[
                  { value: "no_preference", label: t("No preference") },
                  { value: "flexible", label: t("Flexible") },
                  { value: "important", label: t("Important") },
                ]}
              />
              {personalityPreference !== "no_preference" && (
                <div className="mt-3">
                  <ChipGroup
                    options={PERSONALITY_TRAIT_OPTIONS}
                    selected={preferredPersonalityTraits}
                    onChange={setPreferredPersonalityTraits}
                    max={5}
                    ariaLabel={t("Preferred personality")}
                  />
                </div>
              )}
            </Field>

            <Field
              label={t("Style you tend to notice")}
              hint={t(
                "Optional. This is about personal taste, not rating anyone's looks.",
              )}
            >
              <SegmentedControl
                value={stylePreference}
                onChange={(value) => {
                  setStylePreference(value);
                  if (value === "no_preference") setPreferredStyleTags([]);
                }}
                ariaLabel={t("Style preference strength")}
                options={[
                  { value: "no_preference", label: t("No preference") },
                  { value: "flexible", label: t("Flexible") },
                  { value: "important", label: t("Important") },
                ]}
              />
              {stylePreference !== "no_preference" && (
                <div className="mt-3">
                  <ChipGroup
                    options={STYLE_TAG_OPTIONS}
                    selected={preferredStyleTags}
                    onChange={setPreferredStyleTags}
                    max={3}
                    ariaLabel={t("Preferred style")}
                  />
                </div>
              )}
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
              label="What would you genuinely like to do with someone new?"
              hint="Choose the activities first. A film by itself is already a complete date."
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
                  "The plan comes first. Then we find the right person to join you.",
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
            {step === 5 ? t("Find someone to go with") : t("Continue")}
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
