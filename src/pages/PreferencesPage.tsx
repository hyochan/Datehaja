/* oxlint-disable react/set-state-in-effect -- hydrate an editable form once from the live query */
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { PageIntro } from "../components/layout/PageIntro";
import {
  ACCESSIBILITY_OPTIONS,
  BUDGET_BANDS,
  DATE_TYPE_OPTIONS,
  DIETARY_OPTIONS,
  LANGUAGE_OPTIONS,
  SUPPORTED_CITIES,
  SUPPORTED_COUNTRIES,
  findCity,
  PERSONALITY_TRAIT_OPTIONS,
  STYLE_TAG_OPTIONS,
} from "@convex/lib/catalog";
import {
  ChipGroup,
  ChipRadio,
  SelectionCount,
} from "../components/forms/ChipGroup";
import {
  Button,
  Card,
  Field,
  Notice,
  SectionHeading,
  SegmentedControl,
  Skeleton,
  TextInput,
  Toggle,
} from "../components/ui/primitives";
import { readableError, useToast } from "../components/ui/Toast";
import { formatMoney } from "../lib/format";
import { useI18n } from "../i18n";
import {
  LANGUAGE_NATIVE_NAMES,
  defaultLanguageForLocale,
  type MatchLocationScope,
} from "../lib/matchingPreferences";

type Prefs = {
  matchLocationScope: MatchLocationScope;
  preferredCountryCodes: string[];
  preferredCities: string[];
  allowTranslatedDates: boolean;
  languages: string[];
  ageMin: number;
  ageMax: number;
  ageHard: boolean;
  maxDistanceKm: number;
  distanceHard: boolean;
  preferredAreas: string[];
  areaHard: boolean;
  relationshipIntent: "casual" | "open" | "serious" | "friendship" | "unsure";
  intentHard: boolean;
  smoking: "no_preference" | "non_smoker_only" | "smoker_ok";
  smokingHard: boolean;
  alcohol: "none" | "occasional" | "social" | "no_preference";
  alcoholHard: boolean;
  dayPreference: "weekday" | "weekend" | "either";
  preferredDateTypes: string[];
  preferredPersonalityTraits: string[];
  personalityPreference: "important" | "flexible" | "no_preference";
  preferredStyleTags: string[];
  stylePreference: "important" | "flexible" | "no_preference";
  indoorOutdoor: "indoor" | "outdoor" | "either";
  atmosphere: "quiet" | "lively" | "either";
  budgetMinPerPerson: number;
  budgetMaxPerPerson: number;
  budgetHard: boolean;
  currency: string;
  dietary: string[];
  accessibility: string[];
};

type StoredPrefs = Omit<
  Prefs,
  | "languages"
  | "matchLocationScope"
  | "preferredCountryCodes"
  | "preferredCities"
  | "allowTranslatedDates"
> &
  Partial<
    Pick<
      Prefs,
      | "matchLocationScope"
      | "preferredCountryCodes"
      | "preferredCities"
      | "allowTranslatedDates"
    >
  >;

export default function PreferencesPage() {
  const me = useQuery(api.profiles.me);
  const saveDating = useMutation(api.profiles.saveDatingPreferences);
  const saveDate = useMutation(api.profiles.saveDatePreferences);
  const saveMatchingBoundaries = useMutation(
    api.profiles.saveAgentMatchingBoundaries,
  );
  const toast = useToast();
  const { locale, t } = useI18n();

  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [p, setP] = useState<Prefs | null>(null);

  useEffect(() => {
    if (loaded || !me?.preferences) return;
    const preferences = me.preferences as StoredPrefs;
    const profile = me.profile as {
      countryCode: string;
      city: string;
      neighborhood: string;
      languages?: string[];
    } | null;
    setP({
      ...preferences,
      matchLocationScope: preferences.matchLocationScope ?? "city",
      preferredCountryCodes:
        preferences.preferredCountryCodes ??
        (profile?.countryCode ? [profile.countryCode] : []),
      preferredCities:
        preferences.preferredCities ?? (profile?.city ? [profile.city] : []),
      allowTranslatedDates: preferences.allowTranslatedDates ?? false,
      languages: profile?.languages?.length
        ? profile.languages
        : [defaultLanguageForLocale(locale)],
      preferredAreas:
        preferences.preferredAreas ??
        (profile?.neighborhood ? [profile.neighborhood] : []),
      areaHard: preferences.areaHard ?? false,
      preferredPersonalityTraits: preferences.preferredPersonalityTraits ?? [],
      personalityPreference:
        preferences.personalityPreference ?? "no_preference",
      preferredStyleTags: preferences.preferredStyleTags ?? [],
      stylePreference: preferences.stylePreference ?? "no_preference",
    });
    setLoaded(true);
  }, [me, loaded, locale]);

  if (me === undefined)
    return <Skeleton className="h-96 w-full rounded-card" />;
  if (!p) return null;

  const band = BUDGET_BANDS[p.currency] ?? BUDGET_BANDS.USD;
  const profile = me?.profile as {
    countryCode: string;
    city: string;
    neighborhood: string;
    languages?: string[];
  } | null;
  const city = profile ? findCity(profile.city) : undefined;
  const matchingCities =
    p.matchLocationScope === "selected_cities"
      ? p.preferredCities
      : profile?.city
        ? [profile.city]
        : [];
  const matchingCountries: string[] = [
    ...new Set(
      matchingCities
        .map(
          (cityName) =>
            SUPPORTED_CITIES.find((option) => option.city === cityName)
              ?.countryCode,
        )
        .filter(
          (
            countryCode,
          ): countryCode is Exclude<typeof countryCode, undefined> =>
            countryCode !== undefined,
        ),
    ),
  ];
  const matchingComplete =
    matchingCities.length > 0 &&
    p.languages.length > 0 &&
    (p.matchLocationScope !== "area" || p.preferredAreas.length > 0);
  const set = <K extends keyof Prefs>(key: K, value: Prefs[K]) =>
    setP((current) => (current ? { ...current, [key]: value } : current));

  async function save() {
    if (!p) return;
    setError(null);
    setBusy(true);
    try {
      if (!matchingComplete) {
        throw new Error(
          t("Choose a matching location and at least one language."),
        );
      }
      await saveMatchingBoundaries({
        languages: p.languages,
        matchLocationScope: p.matchLocationScope,
        preferredCountryCodes: matchingCountries,
        preferredCities: matchingCities,
        preferredAreas: p.matchLocationScope === "area" ? p.preferredAreas : [],
        allowTranslatedDates: p.allowTranslatedDates,
      });
      await saveDating({
        ageMin: p.ageMin,
        ageMax: p.ageMax,
        ageHard: p.ageHard,
        maxDistanceKm: p.maxDistanceKm,
        distanceHard: p.distanceHard,
        preferredAreas: p.preferredAreas,
        areaHard: p.areaHard,
        relationshipIntent: p.relationshipIntent,
        intentHard: p.intentHard,
        smoking: p.smoking,
        smokingHard: p.smokingHard,
        alcohol: p.alcohol,
        alcoholHard: p.alcoholHard,
        dayPreference: p.dayPreference,
        preferredPersonalityTraits: p.preferredPersonalityTraits,
        personalityPreference: p.personalityPreference,
        preferredStyleTags: p.preferredStyleTags,
        stylePreference: p.stylePreference,
      });
      await saveDate({
        preferredDateTypes: p.preferredDateTypes,
        indoorOutdoor: p.indoorOutdoor,
        atmosphere: p.atmosphere,
        budgetMinPerPerson: p.budgetMinPerPerson,
        budgetMaxPerPerson: p.budgetMaxPerPerson,
        budgetHard: p.budgetHard,
        dietary: p.dietary,
        accessibility: p.accessibility,
      });
      toast(t("Preferences saved."), "success");
    } catch (e) {
      const message = readableError(e);
      setError(message);
      toast(message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="product-page mx-auto max-w-3xl space-y-10 pb-8">
      <PageIntro
        eyebrow={t("Your boundaries")}
        title={t("Matching preferences")}
        description={t(
          "Hard requirements protect your boundaries. Everything else helps us find a more natural fit.",
        )}
        motif="↔"
        tone="lilac"
      />

      {error && <Notice tone="warn">{error}</Notice>}

      <section>
        <SectionHeading
          eyebrow={t("Agent search")}
          title={t("Location and language")}
        />
        <Card className="p-5 sm:p-7">
          <Notice tone="info" title={t("Two-way boundaries")}>
            {t(
              "Your Agent only considers someone when both location settings include each other and both people share a language—or both allow translation.",
            )}
          </Notice>
          <Field
            label={t("Where may your Agent look?")}
            hint={t("We match realistic meeting locations, not nationality.")}
          >
            <SegmentedControl
              value={p.matchLocationScope}
              onChange={(value) => {
                set("matchLocationScope", value);
                if (
                  value === "area" &&
                  p.preferredAreas.length === 0 &&
                  profile
                ) {
                  set("preferredAreas", [profile.neighborhood]);
                }
              }}
              ariaLabel={t("Matching location boundary")}
              options={[
                { value: "area", label: t("My selected area") },
                { value: "city", label: t("Anywhere in my city") },
                { value: "selected_cities", label: t("Cities I choose") },
              ]}
            />
            {p.matchLocationScope === "area" && city && (
              <div className="mt-4">
                <ChipGroup
                  options={city.neighborhoods.map((area) => ({
                    key: area.name,
                    label: t(area.name),
                  }))}
                  selected={p.preferredAreas}
                  onChange={(update) =>
                    setP((current) =>
                      current
                        ? {
                            ...current,
                            preferredAreas: update(current.preferredAreas),
                          }
                        : current,
                    )
                  }
                  max={8}
                  ariaLabel={t("Preferred matching areas")}
                />
                <SelectionCount count={p.preferredAreas.length} min={1} />
              </div>
            )}
            {p.matchLocationScope === "selected_cities" && (
              <div className="mt-4">
                <ChipGroup
                  options={SUPPORTED_CITIES.map((option) => ({
                    key: option.city,
                    label: t(option.city),
                    emoji: SUPPORTED_COUNTRIES.find(
                      (country) => country.code === option.countryCode,
                    )?.flag,
                  }))}
                  selected={p.preferredCities}
                  onChange={(update) =>
                    setP((current) =>
                      current
                        ? {
                            ...current,
                            preferredCities: update(current.preferredCities),
                          }
                        : current,
                    )
                  }
                  max={10}
                  ariaLabel={t("Selected matching cities")}
                />
                <SelectionCount count={p.preferredCities.length} min={1} />
              </div>
            )}
          </Field>
          <Field
            label={t("Languages you can comfortably use")}
            hint={t(
              "Choose at least one. A shared language is required unless both people allow translation.",
            )}
          >
            <ChipGroup
              options={LANGUAGE_OPTIONS.map((language) => ({
                key: language,
                label: LANGUAGE_NATIVE_NAMES[language] ?? language,
              }))}
              selected={p.languages}
              onChange={(update) =>
                setP((current) =>
                  current
                    ? { ...current, languages: update(current.languages) }
                    : current,
                )
              }
              max={8}
              ariaLabel={t("Spoken languages")}
            />
            <SelectionCount count={p.languages.length} min={1} max={8} />
          </Field>
          <Toggle
            checked={p.allowTranslatedDates}
            onChange={(value) => set("allowTranslatedDates", value)}
            label={t("Allow translated Agent dates")}
            description={t("Only when the other person opts in too.")}
          />
        </Card>
      </section>

      <section>
        <SectionHeading eyebrow={t("Who")} title={t("People")} />
        <Card className="p-5">
          <Field
            label={t("Age range")}
            hint={t("{min} to {max}", { min: p.ageMin, max: p.ageMax })}
          >
            <div className="flex items-center gap-3">
              <TextInput
                type="number"
                min={18}
                max={99}
                value={p.ageMin}
                aria-label={t("Minimum age")}
                onChange={(e) => set("ageMin", Number(e.target.value))}
              />
              <span className="text-muted">{t("to")}</span>
              <TextInput
                type="number"
                min={18}
                max={99}
                value={p.ageMax}
                aria-label={t("Maximum age")}
                onChange={(e) => set("ageMax", Number(e.target.value))}
              />
            </div>
            <Hard checked={p.ageHard} onChange={(v) => set("ageHard", v)} />
          </Field>

          <Field
            label={t("How far you'll travel")}
            hint={t("Up to {count} km", { count: p.maxDistanceKm })}
          >
            <input
              type="range"
              min={2}
              max={50}
              value={p.maxDistanceKm}
              onChange={(e) => set("maxDistanceKm", Number(e.target.value))}
              className="w-full accent-[var(--color-ember-400)]"
              aria-label={t("Maximum distance")}
            />
            <Hard
              checked={p.distanceHard}
              onChange={(v) => set("distanceHard", v)}
            />
          </Field>

          <Field
            label={t("Where can the date happen?")}
            hint={t("Choose meeting areas, not where your match must live.")}
          >
            <SegmentedControl
              value={p.preferredAreas.length > 0 ? "selected" : "no_preference"}
              onChange={(value) => {
                if (value === "no_preference") {
                  set("preferredAreas", []);
                  set("areaHard", false);
                } else if (p.preferredAreas.length === 0 && profile) {
                  set("preferredAreas", [profile.neighborhood]);
                }
              }}
              ariaLabel={t("Meeting area preference")}
              options={[
                { value: "no_preference", label: t("Any area") },
                { value: "selected", label: t("Choose areas") },
              ]}
            />
            {p.preferredAreas.length > 0 && city && (
              <div className="mt-3">
                <ChipGroup
                  options={city.neighborhoods.map((area) => ({
                    key: area.name,
                    label: t(area.name),
                  }))}
                  selected={p.preferredAreas}
                  onChange={(update) =>
                    setP((current) => {
                      if (!current) return current;
                      const next = update(current.preferredAreas);
                      return {
                        ...current,
                        preferredAreas: next,
                        areaHard: next.length > 0 && current.areaHard,
                      };
                    })
                  }
                  max={6}
                  ariaLabel={t("Preferred meeting areas")}
                />
                <Hard
                  checked={p.areaHard}
                  onChange={(value) => set("areaHard", value)}
                  label={t("Only plan dates in these areas")}
                />
              </div>
            )}
          </Field>

          <Field label={t("What you're looking for")}>
            <ChipRadio
              options={[
                { key: "casual" as const, label: t("Something casual") },
                { key: "open" as const, label: t("Open to anything") },
                { key: "serious" as const, label: t("Something serious") },
                { key: "friendship" as const, label: t("Friendship first") },
                { key: "unsure" as const, label: t("Still working it out") },
              ]}
              value={p.relationshipIntent}
              onChange={(next) => set("relationshipIntent", next)}
              ariaLabel={t("Relationship intent")}
            />
            <Hard
              checked={p.intentHard}
              onChange={(v) => set("intentHard", v)}
            />
          </Field>

          <Field
            label={t("Personality you tend to connect with")}
            hint={t("‘No preference’ removes this factor from matching.")}
          >
            <SegmentedControl
              value={p.personalityPreference}
              onChange={(value) => {
                set("personalityPreference", value);
                if (value === "no_preference") {
                  set("preferredPersonalityTraits", []);
                }
              }}
              ariaLabel={t("Personality preference strength")}
              options={[
                { value: "no_preference", label: t("No preference") },
                { value: "flexible", label: t("Flexible") },
                { value: "important", label: t("Important") },
              ]}
            />
            {p.personalityPreference !== "no_preference" && (
              <div className="mt-3">
                <ChipGroup
                  options={PERSONALITY_TRAIT_OPTIONS.map((trait) => ({
                    key: trait,
                    label: t(trait),
                  }))}
                  selected={p.preferredPersonalityTraits}
                  onChange={(update) =>
                    setP((current) =>
                      current
                        ? {
                            ...current,
                            preferredPersonalityTraits: update(
                              current.preferredPersonalityTraits,
                            ),
                          }
                        : current,
                    )
                  }
                  max={5}
                  ariaLabel={t("Preferred personality")}
                />
              </div>
            )}
          </Field>

          <Field
            label={t("Style you tend to notice")}
            hint={t("Optional personal taste, never an appearance score.")}
          >
            <SegmentedControl
              value={p.stylePreference}
              onChange={(value) => {
                set("stylePreference", value);
                if (value === "no_preference") {
                  set("preferredStyleTags", []);
                }
              }}
              ariaLabel={t("Style preference strength")}
              options={[
                { value: "no_preference", label: t("No preference") },
                { value: "flexible", label: t("Flexible") },
                { value: "important", label: t("Important") },
              ]}
            />
            {p.stylePreference !== "no_preference" && (
              <div className="mt-3">
                <ChipGroup
                  options={STYLE_TAG_OPTIONS.map((style) => ({
                    key: style,
                    label: t(style),
                  }))}
                  selected={p.preferredStyleTags}
                  onChange={(update) =>
                    setP((current) =>
                      current
                        ? {
                            ...current,
                            preferredStyleTags: update(
                              current.preferredStyleTags,
                            ),
                          }
                        : current,
                    )
                  }
                  max={3}
                  ariaLabel={t("Preferred style")}
                />
              </div>
            )}
          </Field>

          <Field label={t("Smoking")}>
            <SegmentedControl
              value={p.smoking}
              onChange={(v) => set("smoking", v)}
              ariaLabel={t("Smoking")}
              options={[
                { value: "no_preference", label: t("No preference") },
                { value: "non_smoker_only", label: t("Non-smokers") },
                { value: "smoker_ok", label: t("Either") },
              ]}
            />
            {p.smoking === "non_smoker_only" && (
              <Hard
                checked={p.smokingHard}
                onChange={(v) => set("smokingHard", v)}
              />
            )}
          </Field>

          <Field label={t("Alcohol")}>
            <SegmentedControl
              value={p.alcohol}
              onChange={(v) => set("alcohol", v)}
              ariaLabel={t("Alcohol")}
              options={[
                { value: "no_preference", label: t("No preference") },
                { value: "occasional", label: t("A drink is fine") },
                { value: "none", label: t("Alcohol-free") },
              ]}
            />
            {p.alcohol === "none" && (
              <Hard
                checked={p.alcoholHard}
                onChange={(v) => set("alcoholHard", v)}
              />
            )}
          </Field>

          <Field label={t("Best days")}>
            <SegmentedControl
              value={p.dayPreference}
              onChange={(v) => set("dayPreference", v)}
              ariaLabel={t("Day preference")}
              options={[
                { value: "either", label: t("Either") },
                { value: "weekday", label: t("Weekdays") },
                { value: "weekend", label: t("Weekends") },
              ]}
            />
          </Field>
        </Card>
      </section>

      <section>
        <SectionHeading eyebrow={t("What")} title={t("The date itself")} />
        <Card className="p-5">
          <Field
            label={t("What you'd genuinely like to do")}
            hint={t("The activity comes first. One good stop is enough.")}
          >
            <ChipGroup
              options={DATE_TYPE_OPTIONS.map((d) => ({
                key: d.key,
                label: t(d.label),
                emoji: d.emoji,
              }))}
              selected={p.preferredDateTypes}
              onChange={(update) =>
                setP((cur) =>
                  cur
                    ? {
                        ...cur,
                        preferredDateTypes: update(cur.preferredDateTypes),
                      }
                    : cur,
                )
              }
              ariaLabel={t("Date types")}
            />
            <SelectionCount count={p.preferredDateTypes.length} min={1} />
          </Field>

          <Field label={t("Indoors or outdoors")}>
            <SegmentedControl
              value={p.indoorOutdoor}
              onChange={(v) => set("indoorOutdoor", v)}
              ariaLabel={t("Indoor or outdoor")}
              options={[
                { value: "either", label: t("Either") },
                { value: "indoor", label: t("Indoors") },
                { value: "outdoor", label: t("Outdoors") },
              ]}
            />
          </Field>

          <Field label={t("Atmosphere")}>
            <SegmentedControl
              value={p.atmosphere}
              onChange={(v) => set("atmosphere", v)}
              ariaLabel={t("Atmosphere")}
              options={[
                { value: "either", label: t("Either") },
                { value: "quiet", label: t("Quiet") },
                { value: "lively", label: t("Lively") },
              ]}
            />
          </Field>

          <Field
            label={t("Comfortable spend, per person")}
            hint={`${formatMoney(p.budgetMinPerPerson, p.currency)} – ${formatMoney(p.budgetMaxPerPerson, p.currency)}`}
          >
            <div className="flex items-center gap-3">
              <TextInput
                type="number"
                min={0}
                step={band.step}
                value={p.budgetMinPerPerson}
                aria-label={t("Minimum budget")}
                onChange={(e) =>
                  set("budgetMinPerPerson", Number(e.target.value))
                }
              />
              <span className="text-muted">{t("to")}</span>
              <TextInput
                type="number"
                min={0}
                step={band.step}
                value={p.budgetMaxPerPerson}
                aria-label={t("Maximum budget")}
                onChange={(e) =>
                  set("budgetMaxPerPerson", Number(e.target.value))
                }
              />
            </div>
            <Hard
              checked={p.budgetHard}
              onChange={(v) => set("budgetHard", v)}
              label={t("Never plan anything outside this")}
            />
          </Field>

          <Field label={t("Dietary requirements")} optional>
            <ChipGroup
              options={DIETARY_OPTIONS.map((d) => ({
                key: d.key,
                label: t(d.label),
              }))}
              selected={p.dietary}
              onChange={(update) =>
                setP((cur) =>
                  cur ? { ...cur, dietary: update(cur.dietary) } : cur,
                )
              }
              ariaLabel={t("Dietary requirements")}
            />
          </Field>

          <Field
            label={t("Accessibility needs")}
            optional
            hint={t("Used when choosing venues. Never shared with your match.")}
          >
            <ChipGroup
              options={ACCESSIBILITY_OPTIONS.map((a) => ({
                key: a.key,
                label: t(a.label),
              }))}
              selected={p.accessibility}
              onChange={(update) =>
                setP((cur) =>
                  cur
                    ? { ...cur, accessibility: update(cur.accessibility) }
                    : cur,
                )
              }
              ariaLabel={t("Accessibility needs")}
            />
          </Field>

          <Button
            onClick={save}
            loading={busy}
            disabled={!matchingComplete}
            size="lg"
          >
            {t("Save preferences")}
          </Button>
        </Card>
      </section>
    </div>
  );
}

function Hard({
  checked,
  onChange,
  label = "This is a hard requirement",
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="mt-2">
      <Toggle
        checked={checked}
        onChange={onChange}
        label={t(label)}
        description={
          checked
            ? t("We'll never match you outside this.")
            : t("We'll prefer this, but won't rule someone out for it.")
        }
      />
    </div>
  );
}
