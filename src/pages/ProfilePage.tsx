/* oxlint-disable react/set-state-in-effect -- hydrate an editable form once from the live query */
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { PageIntro } from "../components/layout/PageIntro";
import {
  FIRST_DATE_VIBE_OPTIONS,
  HOBBY_OPTIONS,
  INTEREST_OPTIONS,
  LANGUAGE_OPTIONS,
  OCCUPATION_CATEGORIES,
  PERSONALITY_TRAIT_OPTIONS,
  STYLE_TAG_OPTIONS,
} from "@convex/lib/catalog";
import { ChipGroup, SelectionCount } from "../components/forms/ChipGroup";
import {
  Button,
  Card,
  Field,
  Notice,
  SectionHeading,
  SegmentedControl,
  Select,
  Skeleton,
  TextArea,
  Toggle,
} from "../components/ui/primitives";
import { readableError, useToast } from "../components/ui/Toast";
import { useI18n } from "../i18n";

export default function ProfilePage() {
  const me = useQuery(api.profiles.me);
  const saveAbout = useMutation(api.profiles.saveAbout);
  const generateUploadUrl = useMutation(api.profiles.generatePhotoUploadUrl);
  const setPhoto = useMutation(api.profiles.setPhoto);
  const setPhotoVisibility = useMutation(api.profiles.setPhotoVisibility);
  const toast = useToast();
  const { t } = useI18n();
  const fileInput = useRef<HTMLInputElement>(null);

  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (loaded || !me?.profile) return;
    const p = me.profile as {
      bio: string;
      occupationCategory?: string;
      showOccupation: boolean;
      interests: string[];
      hobbies: string[];
      languages: string[];
      socialEnergy: "introvert" | "ambivert" | "extrovert";
      firstDateVibe: string[];
      personalityTraits?: string[];
      styleTags?: string[];
      profileTruthConfirmed?: boolean;
      photoVisibility?: "with_match" | "after_accept";
      lifestyle: { smokes: boolean; drinks: "none" | "occasional" | "social" };
    };
    setBio(p.bio);
    setOccupation(p.occupationCategory ?? "");
    setShowOccupation(p.showOccupation);
    setInterests(p.interests);
    setHobbies(p.hobbies);
    setLanguages(p.languages);
    setSocialEnergy(p.socialEnergy);
    setFirstDateVibe(p.firstDateVibe);
    setPersonalityTraits(p.personalityTraits ?? []);
    setStyleTags(p.styleTags ?? []);
    setProfileTruthConfirmed(p.profileTruthConfirmed ?? false);
    setPhotoVisibilityState(p.photoVisibility ?? "after_accept");
    setSmokes(p.lifestyle.smokes);
    setDrinks(p.lifestyle.drinks);
    setLoaded(true);
  }, [me, loaded]);

  if (me === undefined)
    return <Skeleton className="h-96 w-full rounded-card" />;
  if (!me?.profile) return null;

  const profile = me.profile as {
    displayName: string;
    ageYears: number;
    neighborhood: string;
    city: string;
    pronouns?: string;
  };

  async function handlePhoto(file: File) {
    setUploading(true);
    try {
      const url = await generateUploadUrl({});
      const result = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!result.ok) throw new Error("Upload failed.");
      const { storageId } = (await result.json()) as {
        storageId: Id<"_storage">;
      };
      await setPhoto({ storageId });
      toast(t("Photo saved. Choose when a match can see it below."), "success");
    } catch (e) {
      toast(readableError(e), "error");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setError(null);
    setBusy(true);
    try {
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
      toast("Profile saved.", "success");
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
        eyebrow={t("The human behind your Dating Agent")}
        title={t("Your human profile")}
        description={`${profile.displayName} · ${profile.ageYears} · ${profile.neighborhood}, ${profile.city}`}
        motif={profile.displayName.slice(0, 1).toUpperCase()}
        tone="butter"
      />

      <section>
        <SectionHeading eyebrow={t("Optional")} title={t("Photo")} />
        <Card className="flex items-center gap-5 p-5">
          {me.photoUrl ? (
            <img
              src={me.photoUrl}
              alt="Your profile photo"
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-sunken)] font-display text-[26px] text-muted">
              {profile.displayName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[14px] leading-relaxed text-soft">
              {t(
              "A photo is optional. You decide whether another human sees it with your post-date profile card or only after mutual consent.",
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                loading={uploading}
                onClick={() => fileInput.current?.click()}
              >
                {me.photoUrl ? t("Replace") : t("Add a photo")}
              </Button>
              {me.photoUrl && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    try {
                      await setPhoto({ storageId: null });
                      toast("Photo removed.", "success");
                    } catch (e) {
                      toast(readableError(e), "error");
                    }
                  }}
                >
                  {t("Remove")}
                </Button>
              )}
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handlePhoto(file);
                e.target.value = "";
              }}
            />
            {me.photoUrl && (
              <div className="mt-4 max-w-md">
                <SegmentedControl
                  value={photoVisibility}
                  onChange={async (visibility) => {
                    setPhotoVisibilityState(visibility);
                    try {
                      await setPhotoVisibility({ visibility });
                      toast(t("Photo privacy saved."), "success");
                    } catch (error) {
                      toast(readableError(error), "error");
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
          </div>
        </Card>
      </section>

      <section>
        <SectionHeading eyebrow={t("What your Dating Agent can represent")} title={t("About you")} />
        <Card className="p-5">
          {error && (
            <div className="mb-5">
              <Notice tone="warn">{error}</Notice>
            </div>
          )}

          <Field
            label={t("Introduce yourself")}
            hint={t("Contact details are removed automatically before anyone sees this.")}
            htmlFor="bio"
          >
            <TextArea
              id="bio"
              value={bio}
              maxLength={600}
              onChange={(e) => setBio(e.target.value)}
            />
            <p className="mt-1.5 text-right text-[12px] text-muted">
              {bio.length}/600
            </p>
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
            hint={t("Optional and self-described — never an appearance score.")}
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

          <Field label={t("What you do")} optional htmlFor="occupation">
            <Select
              id="occupation"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
            >
              <option value="">{t("Prefer not to say")}</option>
              {OCCUPATION_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {t(option)}
                </option>
              ))}
            </Select>
            {occupation && (
              <div className="mt-2">
                <Toggle
                  checked={showOccupation}
                  onChange={setShowOccupation}
                  label={t("Show this to matches")}
                />
              </div>
            )}
          </Field>

          <Field
            label={t("Interests")}
            hint={t("At least three — this drives matching.")}
          >
            <ChipGroup
              options={INTEREST_OPTIONS}
              selected={interests}
              onChange={setInterests}
              max={12}
              ariaLabel={t("Interests")}
            />
            <SelectionCount count={interests.length} min={3} max={12} />
          </Field>

          <Field label={t("Hobbies")} optional>
            <ChipGroup
              options={HOBBY_OPTIONS}
              selected={hobbies}
              onChange={setHobbies}
              max={8}
              ariaLabel={t("Hobbies")}
            />
          </Field>

          <Field label={t("Languages")}>
            <ChipGroup
              options={LANGUAGE_OPTIONS}
              selected={languages}
              onChange={setLanguages}
              max={6}
              ariaLabel={t("Languages")}
            />
          </Field>

          <Field label={t("On a night out, you're")}>
            <SegmentedControl
              value={socialEnergy}
              onChange={setSocialEnergy}
              ariaLabel={t("Social energy")}
              options={[
                { value: "introvert", label: t("Introvert") },
                { value: "ambivert", label: t("In between") },
                { value: "extrovert", label: t("Extrovert") },
              ]}
            />
          </Field>

          <Field label={t("Your ideal first date feels")} optional>
            <ChipGroup
              options={FIRST_DATE_VIBE_OPTIONS}
              selected={firstDateVibe}
              onChange={setFirstDateVibe}
              max={5}
              ariaLabel={t("First date vibe")}
            />
          </Field>

          <Field label={t("Lifestyle")}>
            <Toggle checked={smokes} onChange={setSmokes} label={t("I smoke")} />
            <div className="mt-3">
              <span className="mb-2 block text-[13px] font-medium text-soft">
                {t("I drink")}
              </span>
              <SegmentedControl
                value={drinks}
                onChange={setDrinks}
                ariaLabel={t("Drinking")}
                options={[
                  { value: "none", label: t("Not at all") },
                  { value: "occasional", label: t("Occasionally") },
                  { value: "social", label: t("Socially") },
                ]}
              />
            </div>
          </Field>

          <div className="mb-6 rounded-xl border border-[var(--tint-sage-border)] bg-[var(--tint-sage-bg)] p-4">
            <Toggle
              checked={profileTruthConfirmed}
              onChange={setProfileTruthConfirmed}
              label={t("This profile reflects who I am today")}
              description={t(
                "Honest details lead to fewer awkward surprises and better matches. Private post-date feedback checks profile accuracy, not attractiveness.",
              )}
            />
          </div>

          <Button
            onClick={save}
            loading={busy}
            disabled={!profileTruthConfirmed}
            size="lg"
          >
            {t("Save profile")}
          </Button>
        </Card>
      </section>
    </div>
  );
}
