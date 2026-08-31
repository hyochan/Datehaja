import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { currentUserId, recordAudit, requireUserId } from "./lib/authz";
import { deriveDropStatus, isTerminalDrop } from "./lib/stateMachine";
import { assertDropTransition } from "./lib/stateMachine";
import { coarsen } from "./lib/geo";
import { DAY_MS, HOUR_MS } from "./lib/time";
import {
  BUDGET_BANDS,
  SUPPORTED_CITIES,
  findCity,
  findNeighborhood,
} from "./lib/catalog";
import { ageOn, dobToMs } from "./lib/age";
import type { Gender } from "./lib/enums";

/**
 * Demo mode.
 *
 * A dating product has a cold-start problem, and a hackathon judge should not
 * have to recruit a second human to see it work. These personas are FICTIONAL,
 * are flagged `isDemo` everywhere they surface, and every user can switch them
 * off in Settings. Demo logic lives entirely in this file — the matching
 * engine treats a demo persona exactly like anyone else, it just knows they
 * are one.
 */

/** A birthday that lands the persona squarely at their stated age. */
function personaDob(age: number, nowMs: number): number {
  const now = new Date(nowMs);
  const dob = dobToMs(now.getUTCFullYear() - age, now.getUTCMonth() + 1, 1);
  // Guard against a first-of-month edge landing them a year young.
  return ageOn(dob, nowMs) === age
    ? dob
    : dobToMs(now.getUTCFullYear() - age - 1, 6, 15);
}

type PersonaSpec = {
  key: string;
  displayName: string;
  age: number;
  gender: Gender;
  pronouns: string;
  interestedIn: Gender[];
  city: string;
  neighborhood: string;
  occupation: string;
  bio: string;
  interests: string[];
  hobbies: string[];
  languages: string[];
  socialEnergy: "introvert" | "ambivert" | "extrovert";
  firstDateVibe: string[];
  smokes: boolean;
  drinks: "none" | "occasional" | "social";
  intent: "casual" | "open" | "serious" | "friendship" | "unsure";
  dateTypes: string[];
  atmosphere: "quiet" | "lively" | "either";
  indoorOutdoor: "indoor" | "outdoor" | "either";
  budget: [number, number];
  dietary: string[];
  accessibility: string[];
  ageRange: [number, number];
  maxDistanceKm: number;
};

const SEOUL_PERSONAS: PersonaSpec[] = [
  {
    key: "alex",
    displayName: "Alex",
    age: 29,
    gender: "man",
    pronouns: "he/him",
    interestedIn: ["woman", "nonbinary"],
    city: "Seoul",
    neighborhood: "Seongsu",
    occupation: "Design",
    bio: "Product designer. I run in the mornings and watch too many films at night. Happiest somewhere with good lighting and a menu I can't pronounce.",
    interests: ["Films", "Running", "Coffee", "Design", "Photography"],
    hobbies: ["Home barista", "Marathon training"],
    languages: ["Korean", "English"],
    socialEnergy: "introvert",
    firstDateVibe: ["Quiet and slow", "Somewhere to talk"],
    smokes: false,
    drinks: "occasional",
    intent: "serious",
    dateTypes: ["dinner", "coffee", "walk", "exhibition"],
    atmosphere: "quiet",
    indoorOutdoor: "either",
    budget: [30000, 70000],
    dietary: [],
    accessibility: [],
    ageRange: [25, 35],
    maxDistanceKm: 15,
  },
  {
    key: "mina",
    displayName: "Mina",
    age: 27,
    gender: "woman",
    pronouns: "she/her",
    interestedIn: ["man"],
    city: "Seoul",
    neighborhood: "Yeonnam",
    occupation: "Media",
    bio: "I edit documentaries. Big on markets, small on small talk. Will absolutely make you try the thing I ordered.",
    interests: ["Films", "Street food", "Photography", "Travel", "Jazz"],
    hobbies: ["Journalling", "Fermenting"],
    languages: ["Korean", "English"],
    socialEnergy: "ambivert",
    firstDateVibe: ["Somewhere to talk", "Long and unhurried"],
    smokes: false,
    drinks: "social",
    intent: "open",
    dateTypes: ["dinner", "drinks", "walk", "live_music"],
    atmosphere: "quiet",
    indoorOutdoor: "either",
    budget: [25000, 60000],
    dietary: [],
    accessibility: [],
    ageRange: [26, 36],
    maxDistanceKm: 20,
  },
  {
    key: "jiwoo",
    displayName: "Jiwoo",
    age: 31,
    gender: "nonbinary",
    pronouns: "they/them",
    interestedIn: ["woman", "man", "nonbinary"],
    city: "Seoul",
    neighborhood: "Euljiro",
    occupation: "Arts",
    bio: "Ceramicist with a day job. I know every quiet bar in Euljiro and I will happily draw you a map.",
    interests: [
      "Art galleries",
      "Pottery",
      "Craft beer",
      "Vinyl",
      "Architecture",
    ],
    hobbies: ["Pottery", "Calligraphy"],
    languages: ["Korean", "English"],
    socialEnergy: "ambivert",
    firstDateVibe: ["Somewhere to do", "Late night"],
    smokes: false,
    drinks: "social",
    intent: "casual",
    dateTypes: ["drinks", "exhibition", "dessert", "casual_activity"],
    atmosphere: "quiet",
    indoorOutdoor: "indoor",
    budget: [25000, 55000],
    dietary: ["vegetarian"],
    accessibility: [],
    ageRange: [26, 40],
    maxDistanceKm: 12,
  },
  {
    key: "haneul",
    displayName: "Haneul",
    age: 26,
    gender: "woman",
    pronouns: "she/her",
    interestedIn: ["man", "nonbinary"],
    city: "Seoul",
    neighborhood: "Mangwon",
    occupation: "Education",
    bio: "Primary school teacher. Weekends are for the river, secondhand bookshops and an unreasonable amount of iced coffee.",
    interests: ["Reading", "Cycling", "Coffee", "Dogs", "Plants"],
    hobbies: ["Gardening", "Birdwatching"],
    languages: ["Korean"],
    socialEnergy: "introvert",
    firstDateVibe: ["Daytime", "Quiet and slow"],
    smokes: false,
    drinks: "none",
    intent: "serious",
    dateTypes: ["coffee", "walk", "dessert", "museum"],
    atmosphere: "quiet",
    indoorOutdoor: "outdoor",
    budget: [15000, 40000],
    dietary: ["no_alcohol_venue"],
    accessibility: [],
    ageRange: [25, 34],
    maxDistanceKm: 15,
  },
  {
    key: "daniel",
    displayName: "Daniel",
    age: 33,
    gender: "man",
    pronouns: "he/him",
    interestedIn: ["woman"],
    city: "Seoul",
    neighborhood: "Itaewon",
    occupation: "Hospitality",
    bio: "I cook for a living, so on my nights off I'd rather someone else did. Ask me where to eat and I'll be insufferable about it.",
    interests: ["Cooking", "Wine", "Live music", "Travel", "Street food"],
    hobbies: ["Mixology", "Guitar"],
    languages: ["Korean", "English", "Spanish"],
    socialEnergy: "extrovert",
    firstDateVibe: ["Lively and social", "Late night"],
    smokes: false,
    drinks: "social",
    intent: "open",
    dateTypes: ["dinner", "drinks", "live_music", "surprise"],
    atmosphere: "lively",
    indoorOutdoor: "indoor",
    budget: [40000, 90000],
    dietary: [],
    accessibility: [],
    ageRange: [27, 38],
    maxDistanceKm: 20,
  },
  {
    key: "yuna",
    displayName: "Yuna",
    age: 30,
    gender: "woman",
    pronouns: "she/her",
    interestedIn: ["man", "woman"],
    city: "Seoul",
    neighborhood: "Seochon",
    occupation: "Science",
    bio: "Research scientist. I climb badly and often. Looking for someone who can hold a conversation past the first hour.",
    interests: ["Climbing", "Hiking", "Astronomy", "Board games", "Coffee"],
    hobbies: ["Bouldering", "Puzzles"],
    languages: ["Korean", "English"],
    socialEnergy: "ambivert",
    firstDateVibe: ["Somewhere to do", "Daytime"],
    smokes: false,
    drinks: "occasional",
    intent: "serious",
    dateTypes: ["coffee", "walk", "casual_activity", "museum"],
    atmosphere: "either",
    indoorOutdoor: "outdoor",
    budget: [20000, 55000],
    dietary: [],
    accessibility: [],
    ageRange: [27, 40],
    maxDistanceKm: 25,
  },
  {
    key: "seojun",
    displayName: "Seojun",
    age: 28,
    gender: "man",
    pronouns: "he/him",
    interestedIn: ["woman", "nonbinary"],
    city: "Seoul",
    neighborhood: "Hongdae",
    occupation: "Engineering",
    bio: "Backend engineer, amateur drummer, permanent beginner at Spanish. I like places where the music is good and the queue is short.",
    interests: [
      "Indie rock",
      "Live music",
      "Craft beer",
      "Video games",
      "Films",
    ],
    hobbies: ["Guitar", "Model building"],
    languages: ["Korean", "English"],
    socialEnergy: "introvert",
    firstDateVibe: ["Somewhere to talk", "Short and easy"],
    smokes: false,
    drinks: "occasional",
    intent: "open",
    dateTypes: ["drinks", "live_music", "dinner", "coffee"],
    atmosphere: "lively",
    indoorOutdoor: "indoor",
    budget: [25000, 55000],
    dietary: [],
    accessibility: [],
    ageRange: [24, 33],
    maxDistanceKm: 15,
  },
  {
    key: "eunji",
    displayName: "Eunji",
    age: 34,
    gender: "woman",
    pronouns: "she/her",
    interestedIn: ["man"],
    city: "Seoul",
    neighborhood: "Samcheong",
    occupation: "Law",
    bio: "Lawyer by trade, gallery-hopper by choice. I want a first date that doesn't feel like an interview.",
    interests: ["Art galleries", "Museums", "Wine", "History", "Theatre"],
    hobbies: ["Painting", "Knitting"],
    languages: ["Korean", "English", "French"],
    socialEnergy: "ambivert",
    firstDateVibe: ["Somewhere to talk", "Long and unhurried"],
    smokes: false,
    drinks: "occasional",
    intent: "serious",
    dateTypes: ["exhibition", "dinner", "museum", "coffee"],
    atmosphere: "quiet",
    indoorOutdoor: "indoor",
    budget: [40000, 100000],
    dietary: [],
    accessibility: [],
    ageRange: [30, 44],
    maxDistanceKm: 20,
  },
  {
    key: "taeyang",
    displayName: "Taeyang",
    age: 25,
    gender: "man",
    pronouns: "he/him",
    interestedIn: ["woman", "man", "nonbinary"],
    city: "Seoul",
    neighborhood: "Seongsu",
    occupation: "Retail",
    bio: "I work in a record shop and I skate to get there. Low-key plans, high-key snacks.",
    interests: ["Vinyl", "Skateboarding", "Techno", "Coffee", "Dessert"],
    hobbies: ["Skateboarding", "Roller skating"],
    languages: ["Korean", "English"],
    socialEnergy: "extrovert",
    firstDateVibe: ["Short and easy", "Somewhere to do"],
    smokes: true,
    drinks: "social",
    intent: "casual",
    dateTypes: ["coffee", "dessert", "casual_activity", "surprise"],
    atmosphere: "lively",
    indoorOutdoor: "either",
    budget: [15000, 35000],
    dietary: [],
    accessibility: [],
    ageRange: [22, 32],
    maxDistanceKm: 12,
  },
  {
    key: "sora",
    displayName: "Sora",
    age: 32,
    gender: "woman",
    pronouns: "she/her",
    interestedIn: ["woman", "nonbinary"],
    city: "Seoul",
    neighborhood: "Yeonnam",
    occupation: "Non-profit",
    bio: "I run community programmes. I'll always pick the neighbourhood place over the famous one.",
    interests: ["Volunteering", "Cooking", "Reading", "Dancing", "Street food"],
    hobbies: ["Sewing", "Baking sourdough"],
    languages: ["Korean", "English"],
    socialEnergy: "extrovert",
    firstDateVibe: ["Lively and social", "Somewhere to talk"],
    smokes: false,
    drinks: "occasional",
    intent: "serious",
    dateTypes: ["dinner", "coffee", "walk", "dessert"],
    atmosphere: "either",
    indoorOutdoor: "either",
    budget: [20000, 50000],
    dietary: ["vegetarian"],
    accessibility: [],
    ageRange: [27, 40],
    maxDistanceKm: 18,
  },
  {
    key: "minjae",
    displayName: "Minjae",
    age: 36,
    gender: "man",
    pronouns: "he/him",
    interestedIn: ["woman"],
    city: "Seoul",
    neighborhood: "Gangnam",
    occupation: "Finance",
    bio: "Long weeks, so my weekends are deliberately slow. Tennis in the morning, something unhurried after.",
    interests: ["Tennis", "Wine", "Films", "Travel", "Podcasts"],
    hobbies: ["Weightlifting", "Home barista"],
    languages: ["Korean", "English"],
    socialEnergy: "ambivert",
    firstDateVibe: ["Quiet and slow", "Long and unhurried"],
    smokes: false,
    drinks: "occasional",
    intent: "serious",
    dateTypes: ["dinner", "coffee", "walk"],
    atmosphere: "quiet",
    indoorOutdoor: "either",
    budget: [40000, 110000],
    dietary: [],
    accessibility: [],
    ageRange: [28, 40],
    maxDistanceKm: 25,
  },
  {
    key: "chaewon",
    displayName: "Chaewon",
    age: 24,
    gender: "woman",
    pronouns: "she/her",
    interestedIn: ["man", "woman"],
    city: "Seoul",
    neighborhood: "Hongdae",
    occupation: "Student",
    bio: "Illustration student. I have opinions about dessert and I'm ready to defend them.",
    interests: ["Anime", "Dessert", "K-pop", "Photography", "Board games"],
    hobbies: ["Painting", "Puzzles"],
    languages: ["Korean", "English", "Japanese"],
    socialEnergy: "introvert",
    firstDateVibe: ["Short and easy", "Daytime"],
    smokes: false,
    drinks: "none",
    intent: "unsure",
    dateTypes: ["dessert", "coffee", "casual_activity", "exhibition"],
    atmosphere: "quiet",
    indoorOutdoor: "indoor",
    budget: [12000, 30000],
    dietary: ["no_alcohol_venue"],
    accessibility: [],
    ageRange: [22, 30],
    maxDistanceKm: 12,
  },
  {
    key: "hyunwoo",
    displayName: "Hyunwoo",
    age: 38,
    gender: "man",
    pronouns: "he/him",
    interestedIn: ["woman", "nonbinary"],
    city: "Seoul",
    neighborhood: "Jamsil",
    occupation: "Construction",
    bio: "Site manager. I use a cane, so step-free places make my life easier. Great company, terrible at karaoke.",
    interests: ["History", "Films", "Cooking", "Chess", "Podcasts"],
    hobbies: ["Woodwork", "Fishing"],
    languages: ["Korean"],
    socialEnergy: "ambivert",
    firstDateVibe: ["Somewhere to talk", "Quiet and slow"],
    smokes: false,
    drinks: "occasional",
    intent: "serious",
    dateTypes: ["dinner", "coffee", "museum"],
    atmosphere: "quiet",
    indoorOutdoor: "indoor",
    budget: [25000, 60000],
    dietary: [],
    accessibility: ["step_free", "accessible_toilet"],
    ageRange: [30, 45],
    maxDistanceKm: 20,
  },
  {
    key: "narae",
    displayName: "Narae",
    age: 29,
    gender: "woman",
    pronouns: "she/her",
    interestedIn: ["man", "woman", "nonbinary"],
    city: "Seoul",
    neighborhood: "Euljiro",
    occupation: "Startups",
    bio: "Second-time founder, first-time potter. I'd rather do something on a first date than sit across a table being interviewed.",
    interests: ["Startups", "Pottery", "Craft beer", "Climbing", "Design"],
    hobbies: ["Pottery", "Bouldering"],
    languages: ["Korean", "English"],
    socialEnergy: "extrovert",
    firstDateVibe: ["Somewhere to do", "Lively and social"],
    smokes: false,
    drinks: "social",
    intent: "open",
    dateTypes: ["casual_activity", "drinks", "dinner", "surprise"],
    atmosphere: "lively",
    indoorOutdoor: "either",
    budget: [25000, 65000],
    dietary: [],
    accessibility: [],
    ageRange: [26, 38],
    maxDistanceKm: 18,
  },
];

const LOCAL_LANGUAGE: Record<string, string> = {
  KR: "Korean",
  JP: "Japanese",
  DE: "German",
  FR: "French",
  NL: "Dutch",
  SE: "Swedish",
};

const GLOBAL_PERSONAS: PersonaSpec[] = [
  ...SEOUL_PERSONAS,
  ...SUPPORTED_CITIES.filter((city) => city.city !== "Seoul").flatMap(
    (city) => {
      const band = BUDGET_BANDS[city.currency] ?? BUDGET_BANDS.USD;
      const localLanguage = LOCAL_LANGUAGE[city.countryCode] ?? "English";
      const budget: [number, number] = [
        Math.ceil((band.min * 2) / band.step) * band.step,
        Math.floor(band.max / 2 / band.step) * band.step,
      ];
      return SEOUL_PERSONAS.slice(0, 4).map((template, index) => ({
        ...template,
        key: `${template.key}-${city.key}`,
        city: city.city,
        neighborhood:
          city.neighborhoods[index % city.neighborhoods.length].name,
        languages: [...new Set([localLanguage, "English"])],
        budget,
      }));
    },
  ),
];

/* ------------------------------- seeding --------------------------------- */

export const seed = internalMutation({
  args: { nowMs: v.number(), force: v.optional(v.boolean()) },
  returns: v.object({ created: v.number(), windows: v.number() }),
  handler: async (ctx, args) => {
    void args.force;

    let created = 0;
    for (const persona of GLOBAL_PERSONAS) {
      const email = `${persona.key}@demo.datehaja.invalid`;
      const already = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", email))
        .first();
      if (already) continue;

      const userId = await ctx.db.insert("users", {
        name: persona.displayName,
        email,
        // Demo accounts have no auth credentials — nobody can sign in as them.
        emailVerificationTime: undefined,
      });

      const cityInfo = findCity(persona.city)!;
      const area = findNeighborhood(persona.city, persona.neighborhood)!;

      await ctx.db.insert("profiles", {
        userId,
        displayName: persona.displayName,
        dobMs: personaDob(persona.age, args.nowMs),
        ageYears: persona.age,
        ageConfirmed18: true,
        gender: persona.gender,
        pronouns: persona.pronouns,
        interestedIn: persona.interestedIn,
        countryCode: cityInfo.countryCode,
        city: cityInfo.city,
        neighborhood: area.name,
        approxLat: coarsen(area.lat),
        approxLng: coarsen(area.lng),
        timezone: cityInfo.timezone,
        bio: persona.bio,
        occupationCategory: persona.occupation,
        showOccupation: true,
        interests: persona.interests,
        hobbies: persona.hobbies,
        languages: persona.languages,
        socialEnergy: persona.socialEnergy,
        firstDateVibe: persona.firstDateVibe,
        lifestyle: { smokes: persona.smokes, drinks: persona.drinks },
        onboardingStep: 7,
        onboardingComplete: true,
        status: "active",
        moderationStatus: "ok",
        isDemo: true,
        updatedAt: args.nowMs,
      });

      await ctx.db.insert("preferences", {
        userId,
        ageMin: persona.ageRange[0],
        ageMax: persona.ageRange[1],
        ageHard: true,
        maxDistanceKm: persona.maxDistanceKm,
        distanceHard: true,
        preferredAreas: [persona.neighborhood],
        areaHard: false,
        relationshipIntent: persona.intent,
        intentHard: false,
        smoking: "no_preference",
        smokingHard: false,
        alcohol: persona.drinks === "none" ? "none" : "no_preference",
        alcoholHard: false,
        preferredDateTypes: persona.dateTypes,
        budgetMinPerPerson: persona.budget[0],
        budgetMaxPerPerson: persona.budget[1],
        currency: cityInfo.currency,
        budgetHard: false,
        dayPreference: "either",
        indoorOutdoor: persona.indoorOutdoor,
        atmosphere: persona.atmosphere,
        dietary: persona.dietary,
        accessibility: persona.accessibility,
        notifyEmail: false,
        notifyInvitations: false,
        notifyConfirmations: false,
        notifyReminders: false,
        dropsPaused: false,
        maxDropsPerWeek: 5,
        allowDemoMatches: true,
        updatedAt: args.nowMs,
      });

      created += 1;
    }

    const windows = await refreshDemoAvailability(ctx, args.nowMs);
    return { created, windows };
  },
});

/**
 * Keep demo personas free most evenings so a judge always finds an overlap.
 * Windows are generous (17:00–23:00 and 13:00–19:00 local) and topped up
 * whenever they run low.
 */
async function refreshDemoAvailability(
  ctx: MutationCtx,
  nowMs: number,
): Promise<number> {
  const personas = await ctx.db
    .query("profiles")
    .withIndex("by_demo_and_status", (q) =>
      q.eq("isDemo", true).eq("status", "active"),
    )
    .take(100);

  let created = 0;
  for (const persona of personas) {
    const upcoming = await ctx.db
      .query("availability")
      .withIndex("by_user_and_start", (q) =>
        q.eq("userId", persona.userId).gte("startMs", nowMs),
      )
      .take(30);
    const open = upcoming.filter((w) => w.status === "open");
    if (open.length >= 6) continue;

    const taken = new Set(upcoming.map((w) => w.startMs));
    let remaining = 6 - open.length;
    for (let dayOffset = 1; dayOffset <= 12; dayOffset++) {
      if (remaining <= 0) break;
      const dayStart = startOfLocalDay(
        nowMs + dayOffset * DAY_MS,
        persona.timezone,
      );

      // Evening window most days, plus an afternoon window at weekends.
      const slots = [
        { start: dayStart + 17 * HOUR_MS, end: dayStart + 23 * HOUR_MS },
        { start: dayStart + 13 * HOUR_MS, end: dayStart + 19 * HOUR_MS },
      ];
      for (const slot of slots) {
        if (slot.start <= nowMs) continue;
        if (taken.has(slot.start)) continue;
        // Deterministic spread so not everybody is free at once.
        const bucket = (hashString(persona.userId + dayOffset) % 10) as number;
        if (bucket > 6) continue;
        await ctx.db.insert("availability", {
          userId: persona.userId,
          startMs: slot.start,
          endMs: slot.end,
          timezone: persona.timezone,
          status: "open",
        });
        taken.add(slot.start);
        created += 1;
        remaining -= 1;
        break;
      }
    }
  }
  return created;
}

/** Local midnight for a timestamp in a given IANA zone. */
function startOfLocalDay(ms: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date(ms));
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  const localMidnightOffset =
    get("hour") * HOUR_MS + get("minute") * 60_000 + get("second") * 1000;
  return ms - localMidnightOffset;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/* ------------------------------ demo controls ----------------------------- */

export const status = query({
  args: {},
  returns: v.object({
    personaCount: v.number(),
    openWindowCount: v.number(),
    enabledForMe: v.boolean(),
  }),
  handler: async (ctx) => {
    const personas = await ctx.db
      .query("profiles")
      .withIndex("by_demo_and_status", (q) =>
        q.eq("isDemo", true).eq("status", "active"),
      )
      .take(100);

    let openWindowCount = 0;
    for (const persona of personas.slice(0, 20)) {
      const windows = await ctx.db
        .query("availability")
        .withIndex("by_user", (q) => q.eq("userId", persona.userId))
        .take(20);
      openWindowCount += windows.filter((w) => w.status === "open").length;
    }

    const userId = await currentUserId(ctx);
    let enabledForMe = true;
    if (userId) {
      const prefs = await ctx.db
        .query("preferences")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique();
      enabledForMe = prefs?.allowDemoMatches ?? true;
    }

    return { personaCount: personas.length, openWindowCount, enabledForMe };
  },
});

/**
 * Let a judge play the other side of their own date plan.
 *
 * Only works when the other participant is a demo persona, and only for a
 * date plan the caller is actually in. This is the one place demo personas act.
 */
export const respondAsPersona = mutation({
  args: {
    dropId: v.id("datePlans"),
    response: v.union(v.literal("accept"), v.literal("pass")),
  },
  returns: v.object({ confirmed: v.boolean(), personaName: v.string() }),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const me = await ctx.db
      .query("datePlanParticipants")
      .withIndex("by_drop_and_user", (q) =>
        q.eq("dropId", args.dropId).eq("userId", userId),
      )
      .unique();
    if (!me) throw new Error("That date plan isn't yours.");

    const drop = await ctx.db.get("datePlans", args.dropId);
    if (!drop) throw new Error("That date plan is gone.");
    if (isTerminalDrop(drop.status))
      throw new Error("This date plan is already closed.");

    const participants = await ctx.db
      .query("datePlanParticipants")
      .withIndex("by_drop", (q) => q.eq("dropId", args.dropId))
      .take(10);

    const other = participants.find(
      (p) =>
        p.userId !== userId && (p.state === "invited" || p.state === "viewed"),
    );
    if (!other)
      throw new Error("Nobody on this date plan is waiting to respond.");

    const otherProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", other.userId))
      .unique();
    if (!otherProfile?.isDemo) {
      throw new Error(
        "The other person is a real user — only they can respond.",
      );
    }

    const now = Date.now();
    const personaName = otherProfile.displayName;

    if (args.response === "pass") {
      await ctx.db.patch("datePlanParticipants", other._id, {
        state: "passed",
        respondedAt: now,
        passReason: "timing",
      });
      if (other.availabilityId) {
        const window = await ctx.db.get("availability", other.availabilityId);
        if (window && window.heldByDropId === drop._id) {
          await ctx.db.patch("availability", window._id, {
            status: "open",
            heldByDropId: undefined,
          });
        }
      }

      const stillIn = participants.filter(
        (p) =>
          p.userId !== other.userId &&
          (p.state === "accepted" || p.state === "confirmed"),
      );
      if (stillIn.length > 0) {
        if (drop.status !== "partially_accepted") {
          assertDropTransition(drop.status, "partially_accepted");
          await ctx.db.patch("datePlans", drop._id, {
            status: "partially_accepted",
            updatedAt: now,
          });
        }
        await ctx.db.insert("notifications", {
          userId: stillIn[0].userId,
          kind: "searching",
          title: "Looking for someone else",
          body: `${personaName} passed on this one. Your evening is still held — we're looking for the right person for the same plan.`,
          dropId: drop._id,
          href: `/drop/${drop._id}`,
          read: false,
        });
        if (
          drop.candidateAttempts < drop.maxCandidateAttempts &&
          now < drop.confirmDeadlineMs
        ) {
          await ctx.scheduler.runAfter(
            0,
            internal.matching.runReplacementPipeline,
            {
              dropId: drop._id,
            },
          );
        }
      }

      await recordAudit(ctx, {
        action: "demo.persona_passed",
        actorUserId: userId,
        dropId: drop._id,
        targetUserId: other.userId,
        detail: personaName,
      });
      return { confirmed: false, personaName };
    }

    await ctx.db.patch("datePlanParticipants", other._id, {
      state: "accepted",
      respondedAt: now,
    });

    const refreshed = await ctx.db
      .query("datePlanParticipants")
      .withIndex("by_drop", (q) => q.eq("dropId", args.dropId))
      .take(10);

    const nextStatus = deriveDropStatus(drop.status, refreshed);
    assertDropTransition(drop.status, nextStatus);

    if (nextStatus === "confirmed") {
      await ctx.db.patch("datePlans", drop._id, {
        status: "confirmed",
        confirmedAt: now,
        updatedAt: now,
      });
      for (const p of refreshed) {
        if (p.state === "accepted") {
          await ctx.db.patch("datePlanParticipants", p._id, {
            state: "confirmed",
          });
        }
        if (p.availabilityId) {
          const window = await ctx.db.get("availability", p.availabilityId);
          if (window && window.heldByDropId === drop._id) {
            await ctx.db.patch("availability", window._id, {
              status: "booked",
            });
          }
        }
      }
      await ctx.scheduler.runAfter(0, internal.datePlans.notifyConfirmed, {
        dropId: drop._id,
      });
      await recordAudit(ctx, {
        action: "demo.persona_accepted",
        actorUserId: userId,
        dropId: drop._id,
        targetUserId: other.userId,
        detail: `${personaName} — confirmed`,
      });
      return { confirmed: true, personaName };
    }

    await ctx.db.patch("datePlans", drop._id, {
      status: nextStatus,
      updatedAt: now,
    });
    await recordAudit(ctx, {
      action: "demo.persona_accepted",
      actorUserId: userId,
      dropId: drop._id,
      targetUserId: other.userId,
      detail: personaName,
    });
    return { confirmed: false, personaName };
  },
});

/** Manual reseed, exposed so the demo can be topped up without a deploy. */
export const reseed = mutation({
  args: {},
  returns: v.object({ created: v.number(), windows: v.number() }),
  handler: async (ctx): Promise<{ created: number; windows: number }> => {
    await requireUserId(ctx);
    return await ctx.runMutation(internal.demo.seed, { nowMs: Date.now() });
  },
});

/** Used by the deploy script to guarantee the demo world exists. */
export const ensureSeeded = internalMutation({
  args: {},
  returns: v.object({ created: v.number(), windows: v.number() }),
  handler: async (ctx): Promise<{ created: number; windows: number }> => {
    return await ctx.runMutation(internal.demo.seed, { nowMs: Date.now() });
  },
});

/** Demo personas listing for the Demo Controls screen. */
export const personas = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const userId = await currentUserId(ctx);
    const myProfile = userId
      ? await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .unique()
      : null;
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_demo_and_status", (q) =>
        q.eq("isDemo", true).eq("status", "active"),
      )
      .take(100);

    const out = [];
    for (const profile of profiles.filter(
      (candidate) => !myProfile || candidate.city === myProfile.city,
    )) {
      const windows = await ctx.db
        .query("availability")
        .withIndex("by_user", (q) => q.eq("userId", profile.userId))
        .take(20);
      out.push({
        userId: profile.userId as Id<"users">,
        displayName: profile.displayName,
        age: profile.ageYears,
        area: profile.neighborhood,
        occupation: profile.showOccupation ? profile.occupationCategory : null,
        interests: profile.interests.slice(0, 4),
        openWindows: windows.filter((w) => w.status === "open").length,
      });
    }
    return out;
  },
});
