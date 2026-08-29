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

type Prefs = {
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

export default function PreferencesPage() {
  const me = useQuery(api.profiles.me);
  const saveDating = useMutation(api.profiles.saveDatingPreferences);
  const saveDate = useMutation(api.profiles.saveDatePreferences);
  const toast = useToast();
  const { t } = useI18n();

  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [p, setP] = useState<Prefs | null>(null);

  useEffect(() => {
    if (loaded || !me?.preferences) return;
    const preferences = me.preferences as Prefs;
    const profile = me.profile as { city: string; neighborhood: string } | null;
    setP({
      ...preferences,
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
  }, [me, loaded]);

  if (me === undefined)
    return <Skeleton className="h-96 w-full rounded-card" />;
  if (!p) return null;

  const band = BUDGET_BANDS[p.currency] ?? BUDGET_BANDS.USD;
  const profile = me?.profile as { city: string; neighborhood: string } | null;
  const city = profile ? findCity(profile.city) : undefined;
  const set = <K extends keyof Prefs>(key: K, value: Prefs[K]) =>
    setP((current) => (current ? { ...current, [key]: value } : current));

  async function save() {
    if (!p) return;
    setError(null);
    setBusy(true);
    try {
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
      toast("Preferences saved.", "success");
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
        eyebrow="Your boundaries"
        title="Matching preferences"
        description="Hard requirements protect your boundaries. Everything else helps us find a more natural fit."
        motif="↔"
        tone="lilac"
      />

      {error && <Notice tone="warn">{error}</Notice>}

      <section>
        <SectionHeading eyebrow="Who" title="People" />
        <Card className="p-5">
          <Field label="Age range" hint={`${p.ageMin} to ${p.ageMax}`}>
            <div className="flex items-center gap-3">
              <TextInput
                type="number"
                min={18}
                max={99}
                value={p.ageMin}
                aria-label="Minimum age"
                onChange={(e) => set("ageMin", Number(e.target.value))}
              />
              <span className="text-muted">to</span>
              <TextInput
                type="number"
                min={18}
                max={99}
                value={p.ageMax}
                aria-label="Maximum age"
                onChange={(e) => set("ageMax", Number(e.target.value))}
              />
            </div>
            <Hard checked={p.ageHard} onChange={(v) => set("ageHard", v)} />
          </Field>

          <Field
            label="How far you'll travel"
            hint={`Up to ${p.maxDistanceKm} km`}
          >
            <input
              type="range"
              min={2}
              max={50}
              value={p.maxDistanceKm}
              onChange={(e) => set("maxDistanceKm", Number(e.target.value))}
              className="w-full accent-[var(--color-ember-400)]"
              aria-label="Maximum distance"
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
                  options={city.neighborhoods.map((area) => area.name)}
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

          <Field label="What you're looking for">
            <ChipRadio
              options={[
                { key: "casual" as const, label: "Something casual" },
                { key: "open" as const, label: "Open to anything" },
                { key: "serious" as const, label: "Something serious" },
                { key: "friendship" as const, label: "Friendship first" },
                { key: "unsure" as const, label: "Still working it out" },
              ]}
              value={p.relationshipIntent}
              onChange={(next) => set("relationshipIntent", next)}
              ariaLabel="Relationship intent"
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
                  options={PERSONALITY_TRAIT_OPTIONS}
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
                  options={STYLE_TAG_OPTIONS}
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

          <Field label="Smoking">
            <SegmentedControl
              value={p.smoking}
              onChange={(v) => set("smoking", v)}
              ariaLabel="Smoking"
              options={[
                { value: "no_preference", label: "No preference" },
                { value: "non_smoker_only", label: "Non-smokers" },
                { value: "smoker_ok", label: "Either" },
              ]}
            />
            {p.smoking === "non_smoker_only" && (
              <Hard
                checked={p.smokingHard}
                onChange={(v) => set("smokingHard", v)}
              />
            )}
          </Field>

          <Field label="Alcohol">
            <SegmentedControl
              value={p.alcohol}
              onChange={(v) => set("alcohol", v)}
              ariaLabel="Alcohol"
              options={[
                { value: "no_preference", label: "No preference" },
                { value: "occasional", label: "A drink is fine" },
                { value: "none", label: "Alcohol-free" },
              ]}
            />
            {p.alcohol === "none" && (
              <Hard
                checked={p.alcoholHard}
                onChange={(v) => set("alcoholHard", v)}
              />
            )}
          </Field>

          <Field label="Best days">
            <SegmentedControl
              value={p.dayPreference}
              onChange={(v) => set("dayPreference", v)}
              ariaLabel="Day preference"
              options={[
                { value: "either", label: "Either" },
                { value: "weekday", label: "Weekdays" },
                { value: "weekend", label: "Weekends" },
              ]}
            />
          </Field>
        </Card>
      </section>

      <section>
        <SectionHeading eyebrow="What" title="The date itself" />
        <Card className="p-5">
          <Field
            label="What you'd genuinely like to do"
            hint="The activity comes first. One good stop is enough."
          >
            <ChipGroup
              options={DATE_TYPE_OPTIONS.map((d) => ({
                key: d.key,
                label: d.label,
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
              ariaLabel="Date types"
            />
            <SelectionCount count={p.preferredDateTypes.length} min={1} />
          </Field>

          <Field label="Indoors or outdoors">
            <SegmentedControl
              value={p.indoorOutdoor}
              onChange={(v) => set("indoorOutdoor", v)}
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
              value={p.atmosphere}
              onChange={(v) => set("atmosphere", v)}
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
            hint={`${formatMoney(p.budgetMinPerPerson, p.currency)} – ${formatMoney(p.budgetMaxPerPerson, p.currency)}`}
          >
            <div className="flex items-center gap-3">
              <TextInput
                type="number"
                min={0}
                step={band.step}
                value={p.budgetMinPerPerson}
                aria-label="Minimum budget"
                onChange={(e) =>
                  set("budgetMinPerPerson", Number(e.target.value))
                }
              />
              <span className="text-muted">to</span>
              <TextInput
                type="number"
                min={0}
                step={band.step}
                value={p.budgetMaxPerPerson}
                aria-label="Maximum budget"
                onChange={(e) =>
                  set("budgetMaxPerPerson", Number(e.target.value))
                }
              />
            </div>
            <Hard
              checked={p.budgetHard}
              onChange={(v) => set("budgetHard", v)}
              label="Never plan anything outside this"
            />
          </Field>

          <Field label="Dietary requirements" optional>
            <ChipGroup
              options={DIETARY_OPTIONS.map((d) => ({
                key: d.key,
                label: d.label,
              }))}
              selected={p.dietary}
              onChange={(update) =>
                setP((cur) =>
                  cur ? { ...cur, dietary: update(cur.dietary) } : cur,
                )
              }
              ariaLabel="Dietary requirements"
            />
          </Field>

          <Field
            label="Accessibility needs"
            optional
            hint="Used when choosing venues. Never shared with your match."
          >
            <ChipGroup
              options={ACCESSIBILITY_OPTIONS.map((a) => ({
                key: a.key,
                label: a.label,
              }))}
              selected={p.accessibility}
              onChange={(update) =>
                setP((cur) =>
                  cur
                    ? { ...cur, accessibility: update(cur.accessibility) }
                    : cur,
                )
              }
              ariaLabel="Accessibility needs"
            />
          </Field>

          <Button onClick={save} loading={busy} size="lg">
            Save preferences
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
  return (
    <div className="mt-2">
      <Toggle
        checked={checked}
        onChange={onChange}
        label={label}
        description={
          checked
            ? "We'll never match you outside this."
            : "We'll prefer this, but won't rule someone out for it."
        }
      />
    </div>
  );
}
