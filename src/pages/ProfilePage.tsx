import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  FIRST_DATE_VIBE_OPTIONS,
  HOBBY_OPTIONS,
  INTEREST_OPTIONS,
  LANGUAGE_OPTIONS,
  OCCUPATION_CATEGORIES,
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

export default function ProfilePage() {
  const me = useQuery(api.profiles.me);
  const saveAbout = useMutation(api.profiles.saveAbout);
  const generateUploadUrl = useMutation(api.profiles.generatePhotoUploadUrl);
  const setPhoto = useMutation(api.profiles.setPhoto);
  const toast = useToast();
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
  const [smokes, setSmokes] = useState(false);
  const [drinks, setDrinks] = useState<"none" | "occasional" | "social">("occasional");

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
    setSmokes(p.lifestyle.smokes);
    setDrinks(p.lifestyle.drinks);
    setLoaded(true);
  }, [me, loaded]);

  if (me === undefined) return <Skeleton className="h-96 w-full rounded-card" />;
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
      const { storageId } = (await result.json()) as { storageId: Id<"_storage"> };
      await setPhoto({ storageId });
      toast("Photo saved. Only revealed after you both accept.", "success");
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
    <div className="mx-auto max-w-2xl space-y-8 pb-8">
      <header>
        <h1 className="text-[28px] leading-tight">Your profile</h1>
        <p className="mt-1.5 text-[15px] text-soft">
          {profile.displayName} · {profile.ageYears} · {profile.neighborhood},{" "}
          {profile.city}
        </p>
      </header>

      <section>
        <SectionHeading
          eyebrow="Optional"
          title="Photo"
        />
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
              Only revealed to your match after you've <em>both</em> accepted — never
              before. DateHaja isn't a product you browse by face.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                loading={uploading}
                onClick={() => fileInput.current?.click()}
              >
                {me.photoUrl ? "Replace" : "Add a photo"}
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
                  Remove
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
          </div>
        </Card>
      </section>

      <section>
        <SectionHeading eyebrow="What we match on" title="About you" />
        <Card className="p-5">
          {error && (
            <div className="mb-5">
              <Notice tone="warn">{error}</Notice>
            </div>
          )}

          <Field
            label="Bio"
            hint="Contact details are removed automatically before anyone sees this."
            htmlFor="bio"
          >
            <TextArea
              id="bio"
              value={bio}
              maxLength={600}
              onChange={(e) => setBio(e.target.value)}
            />
            <p className="mt-1.5 text-right text-[12px] text-muted">{bio.length}/600</p>
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
                />
              </div>
            )}
          </Field>

          <Field label="Interests" hint="At least three — this drives matching.">
            <ChipGroup
              options={INTEREST_OPTIONS}
              selected={interests}
              onChange={setInterests}
              max={12}
              ariaLabel="Interests"
            />
            <SelectionCount count={interests.length} min={3} max={12} />
          </Field>

          <Field label="Hobbies" optional>
            <ChipGroup
              options={HOBBY_OPTIONS}
              selected={hobbies}
              onChange={setHobbies}
              max={8}
              ariaLabel="Hobbies"
            />
          </Field>

          <Field label="Languages">
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
            <Toggle checked={smokes} onChange={setSmokes} label="I smoke" />
            <div className="mt-3">
              <span className="mb-2 block text-[13px] font-medium text-soft">I drink</span>
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

          <Button onClick={save} loading={busy} size="lg">
            Save profile
          </Button>
        </Card>
      </section>
    </div>
  );
}
