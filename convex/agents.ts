import { refreshAfterPreferencesChange } from "./scouting";
import { v, type Infer } from "convex/values";
import { supersedeAgentProposals } from "./lib/agentLearning";
import { reflectionValidator } from "./lib/dateStory";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import {
  checkRateLimit,
  getPreferencesByUser,
  getProfileByUser,
  recordAudit,
  requireUserId,
} from "./lib/authz";
import { ageOn } from "./lib/age";
import {
  PERSONALITY_TRAIT_OPTIONS,
  defaultBudgetRange,
  findCity,
  findNeighborhood,
} from "./lib/catalog";
import { coarsen } from "./lib/geo";
import {
  agentDecisionCodeValidator,
  agentQuestionCategoryValidator,
  genderValidator,
  preferenceStrengthValidator,
  relationshipIntentValidator,
} from "./lib/enums";
import {
  clean,
  cleanList,
  cleanMultiline,
  sanitizeModelText,
} from "./lib/text";
import { obj, structured } from "./integrations/openai";
import { agentAvatarValidator } from "./lib/agentAvatar";
import { SUPPORTED_LOCALES, normaliseSupportedLocale } from "./lib/locales";
import { normaliseMatchingBoundaryInput } from "./lib/matchingPreferenceInput";

const voiceValidator = v.union(
  v.literal("warm"),
  v.literal("playful"),
  v.literal("direct"),
  v.literal("quiet"),
);
const autonomyValidator = v.union(
  v.literal("observe"),
  v.literal("suggest"),
  v.literal("advocate"),
);
const matchLocationScopeValidator = v.union(
  v.literal("area"),
  v.literal("city"),
  v.literal("selected_cities"),
);

function agentWelcome(name: string) {
  return `I'm ${name} — your second self. Tell me what you're actually like, and I'll go on the date in your place, as you. Then I'll come home and tell you honestly what I thought.`;
}

function fallbackAgentName(userId: Id<"users">) {
  const names = ["Juno", "Sol", "Miro", "Lumi", "Ari", "Noa"];
  const seed = String(userId)
    .split("")
    .reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return names[seed % names.length] ?? "Juno";
}

async function refreshGeneratedWelcome(
  ctx: MutationCtx,
  userId: Id<"users">,
  name: string,
) {
  const firstMessage = await ctx.db
    .query("agentMessages")
    .withIndex("by_user_and_created", (q) => q.eq("userId", userId))
    .order("asc")
    .first();
  if (
    firstMessage?.role === "agent" &&
    // Every greeting this product has shipped, so an existing agent's first
    // message is rewritten rather than left describing an older product.
    /your dating agent\.|your best friend here, and your matchmaker|your second self\./i.test(
      firstMessage.content,
    )
  ) {
    const content = agentWelcome(name);
    if (firstMessage.content !== content) {
      await ctx.db.patch("agentMessages", firstMessage._id, { content });
    }
  }
}

const agentProfileDocValidator = v.object({
  _id: v.id("agentProfiles"),
  _creationTime: v.number(),
  userId: v.id("users"),
  name: v.string(),
  avatar: v.optional(agentAvatarValidator),
  essence: v.string(),
  desiredConnection: v.string(),
  boundaries: v.array(v.string()),
  voice: voiceValidator,
  autonomy: autonomyValidator,
  privateMemory: v.string(),
  pendingReplyTo: v.optional(v.id("agentMessages")),
  pendingReplyAt: v.optional(v.number()),
  lastReplyTo: v.optional(v.id("agentMessages")),
  scoutingMemory: v.optional(v.string()),
  status: v.union(v.literal("active"), v.literal("paused")),
  createdAt: v.number(),
  updatedAt: v.number(),
});

const agentMessageDocValidator = v.object({
  _id: v.id("agentMessages"),
  _creationTime: v.number(),
  userId: v.id("users"),
  agentDateId: v.optional(v.id("agentDates")),
  feedbackTarget: v.optional(v.union(v.literal("self"), v.literal("counterpart"))),
  turnRound: v.optional(v.number()),
  replyTo: v.optional(v.id("agentMessages")),
  role: v.union(v.literal("human"), v.literal("agent")),
  content: v.string(),
  createdAt: v.number(),
});

const agentQuestionDocValidator = v.object({
  _id: v.id("agentQuestions"),
  _creationTime: v.number(),
  userId: v.id("users"),
  category: agentQuestionCategoryValidator,
  prompt: v.string(),
  locale: v.string(),
  status: v.union(
    v.literal("open"),
    v.literal("answered"),
    v.literal("skipped"),
  ),
  askedAt: v.number(),
  answeredAt: v.optional(v.number()),
});

const dateDebriefContextValidator = v.object({
  agentDateId: v.id("agentDates"),
  setting: v.string(),
  summary: v.string(),
  sparks: v.array(v.string()),
  frictions: v.array(v.string()),
  myVerdict: v.union(
    v.literal("pending"),
    v.literal("encourage"),
    v.literal("curious"),
    v.literal("pass"),
  ),
  myReason: v.string(),
  myReflection: v.optional(reflectionValidator),
  myDecisionCode: v.union(v.null(), agentDecisionCodeValidator),
  myNextSearchNote: v.union(v.null(), v.string()),
  counterpartAgentName: v.string(),
  turns: v.array(
    v.object({
      round: v.number(),
      speakerAgentName: v.string(),
      content: v.string(),
    }),
  ),
});
type DateDebriefContext = Infer<typeof dateDebriefContextValidator>;

type QuestionCategory =
  | "connection_pattern"
  | "conflict_repair"
  | "social_rhythm"
  | "affection"
  | "boundaries"
  | "curiosity"
  | "date_style";
type QuestionLanguage = "en" | "ko" | "ja" | "de" | "fr" | "nl" | "sv";

const QUESTION_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const QUESTION_LOCALES = SUPPORTED_LOCALES;

const AGENT_QUESTIONS: Array<{
  category: QuestionCategory;
  prompts: Record<QuestionLanguage, string>;
}> = [
  {
    category: "connection_pattern",
    prompts: {
      en: "Think of someone you felt instantly at ease with. What did they do that made it easy?",
      ko: "처음부터 편안했던 사람을 떠올려봐요. 그 사람은 무엇을 해서 당신을 편하게 만들었나요?",
      ja: "最初から自然体でいられた人を思い出して。何があなたを安心させましたか？",
      de: "Denk an jemanden, bei dem du dich sofort wohlgefühlt hast. Was hat diese Person dafür getan?",
      fr: "Pense à quelqu’un avec qui tu t’es tout de suite senti à l’aise. Qu’a fait cette personne ?",
      nl: "Denk aan iemand bij wie je je meteen op je gemak voelde. Wat deed diegene waardoor dat kwam?",
      sv: "Tänk på någon du genast kände dig trygg med. Vad gjorde personen som skapade den känslan?",
    },
  },
  {
    category: "conflict_repair",
    prompts: {
      en: "When a conversation goes wrong, what kind of repair feels sincere to you?",
      ko: "대화가 어긋났을 때, 상대가 어떻게 풀어주면 진심이라고 느끼나요?",
      ja: "会話がすれ違ったとき、どんな歩み寄りに誠実さを感じますか？",
      de: "Wenn ein Gespräch schiefläuft: Welche Art der Wiedergutmachung fühlt sich für dich ehrlich an?",
      fr: "Quand une conversation dérape, quelle façon de réparer te paraît sincère ?",
      nl: "Als een gesprek misloopt, welke manier van herstellen voelt voor jou oprecht?",
      sv: "När ett samtal går fel, vilken sorts försök att reda ut det känns uppriktigt för dig?",
    },
  },
  {
    category: "social_rhythm",
    prompts: {
      en: "After a full social day, do you want quiet company nearby or real solitude?",
      ko: "사람들과 오래 보낸 날엔, 조용히 곁에 있어 줄 사람이 좋은가요 아니면 완전한 혼자만의 시간이 필요한가요?",
      ja: "人と長く過ごした日のあと、静かにそばにいてほしいですか、それとも完全に一人になりたいですか？",
      de: "Willst du nach einem langen sozialen Tag ruhige Gesellschaft oder wirklich allein sein?",
      fr: "Après une journée très sociale, préfères-tu une présence calme ou être vraiment seul ?",
      nl: "Wil je na een volle sociale dag rustig gezelschap in de buurt, of echt alleen zijn?",
      sv: "Efter en socialt intensiv dag, vill du ha tyst sällskap nära eller vara helt ensam?",
    },
  },
  {
    category: "affection",
    prompts: {
      en: "What small gesture makes you feel chosen without making you feel crowded?",
      ko: "부담스럽지 않으면서도 ‘나를 선택했구나’ 느끼게 하는 작은 행동은 뭔가요?",
      ja: "重く感じずに『選ばれている』と思える小さな行動は何ですか？",
      de: "Welche kleine Geste gibt dir das Gefühl, gewählt zu sein, ohne dich einzuengen?",
      fr: "Quel petit geste te fait sentir choisi sans te donner l’impression d’être envahi ?",
      nl: "Welk klein gebaar geeft je het gevoel gekozen te zijn zonder dat het benauwt?",
      sv: "Vilken liten gest får dig att känna dig vald utan att det blir trångt?",
    },
  },
  {
    category: "boundaries",
    prompts: {
      en: "What is one small boundary people often misunderstand about you?",
      ko: "사람들이 자주 오해하는 당신의 작은 경계 하나는 무엇인가요?",
      ja: "人によく誤解される、あなたの小さな境界線は何ですか？",
      de: "Welche kleine Grenze von dir verstehen andere oft falsch?",
      fr: "Quelle petite limite personnelle est souvent mal comprise chez toi ?",
      nl: "Welke kleine grens van jou begrijpen mensen vaak verkeerd?",
      sv: "Vilken liten gräns hos dig missförstår andra ofta?",
    },
  },
  {
    category: "curiosity",
    prompts: {
      en: "What do you wish someone would ask before making assumptions about you?",
      ko: "상대가 당신을 지레짐작하기 전에 꼭 물어봐 줬으면 하는 것은 무엇인가요?",
      ja: "決めつける前に、相手に何を聞いてほしいですか？",
      de: "Was sollte jemand dich fragen, bevor er Annahmen über dich trifft?",
      fr: "Qu’aimerais-tu qu’on te demande avant de tirer des conclusions sur toi ?",
      nl: "Wat zou je willen dat iemand vraagt voordat die aannames over je doet?",
      sv: "Vad önskar du att någon frågade innan de drog slutsatser om dig?",
    },
  },
  {
    category: "date_style",
    prompts: {
      en: "Which date feels most like you right now: planned, spontaneous, quiet, or playful—and why?",
      ko: "지금 당신다운 데이트는 계획적인 것, 즉흥적인 것, 조용한 것, 장난스러운 것 중 무엇이고 왜 그런가요?",
      ja: "今のあなたらしいデートは、計画的・即興的・静か・遊び心のあるもののどれですか？理由も教えてください。",
      de: "Welches Date passt gerade zu dir: geplant, spontan, ruhig oder verspielt – und warum?",
      fr: "Quel rendez-vous te ressemble aujourd’hui : organisé, spontané, calme ou joueur — et pourquoi ?",
      nl: "Welke date past nu het best bij jou: gepland, spontaan, rustig of speels — en waarom?",
      sv: "Vilken dejt känns mest som du just nu: planerad, spontan, lugn eller lekfull – och varför?",
    },
  },
];

function normaliseQuestionLocale(locale?: string, countryCode?: string) {
  const exact = QUESTION_LOCALES.find((item) => item === locale);
  if (exact) return exact;
  const countryLocale = QUESTION_LOCALES.find((item) =>
    item.endsWith(`-${countryCode ?? ""}`),
  );
  return countryLocale ?? "en-US";
}

function questionLanguage(locale: string): QuestionLanguage {
  const language = locale.split("-")[0];
  if (
    language === "ko" ||
    language === "ja" ||
    language === "de" ||
    language === "fr" ||
    language === "nl" ||
    language === "sv"
  ) {
    return language;
  }
  return "en";
}

function questionNotificationTitle(
  language: QuestionLanguage,
  agentName: string,
) {
  switch (language) {
    case "ko":
      return `${agentName} · 당신을 더 알아갈 질문`;
    case "ja":
      return `${agentName}から、あなたを知るための質問`;
    case "de":
      return `${agentName} möchte dich besser kennenlernen`;
    case "fr":
      return `${agentName} aimerait mieux te connaître`;
    case "nl":
      return `${agentName} wil je beter leren kennen`;
    case "sv":
      return `${agentName} vill lära känna dig bättre`;
    default:
      return `${agentName} wants to know you better`;
  }
}

async function createNextQuestion(
  ctx: MutationCtx,
  args: {
    userId: Doc<"users">["_id"];
    nowMs: number;
    locale?: string;
    notify: boolean;
  },
) {
  const agent = await ctx.db
    .query("agentProfiles")
    .withIndex("by_user", (q) => q.eq("userId", args.userId))
    .unique();
  if (!agent || agent.status !== "active") return null;
  const open = await ctx.db
    .query("agentQuestions")
    .withIndex("by_user_and_status", (q) =>
      q.eq("userId", args.userId).eq("status", "open"),
    )
    .first();
  if (open) return open._id;
  const latest = await ctx.db
    .query("agentQuestions")
    .withIndex("by_user_and_asked", (q) => q.eq("userId", args.userId))
    .order("desc")
    .first();
  if (latest && args.nowMs - latest.askedAt < QUESTION_INTERVAL_MS) {
    return null;
  }
  const profile = await getProfileByUser(ctx, args.userId);
  const locale = normaliseQuestionLocale(
    args.locale ?? profile?.preferredLocale ?? latest?.locale,
    profile?.countryCode,
  );
  const priorIndex = latest
    ? AGENT_QUESTIONS.findIndex(
        (question) => question.category === latest.category,
      )
    : -1;
  const question = AGENT_QUESTIONS[(priorIndex + 1) % AGENT_QUESTIONS.length];
  const prompt = question.prompts[questionLanguage(locale)];
  const questionId = await ctx.db.insert("agentQuestions", {
    userId: args.userId,
    category: question.category,
    prompt,
    locale,
    status: "open",
    askedAt: args.nowMs,
  });
  await ctx.db.insert("agentMessages", {
    userId: args.userId,
    role: "agent",
    content: prompt,
    createdAt: args.nowMs,
  });
  if (args.notify) {
    await ctx.db.insert("notifications", {
      userId: args.userId,
      kind: "message",
      title: questionNotificationTitle(questionLanguage(locale), agent.name),
      body: prompt,
      href: "/dashboard",
      read: false,
    });
  }
  return questionId;
}

export const mine = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      agent: agentProfileDocValidator,
      profile: v.union(
        v.null(),
        v.object({
          displayName: v.string(),
          city: v.string(),
          interests: v.array(v.string()),
        }),
      ),
      messages: v.array(agentMessageDocValidator),
      openQuestion: v.union(v.null(), agentQuestionDocValidator),
    }),
  ),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const agent = await ctx.db
      .query("agentProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!agent) return null;
    const messages = await ctx.db
      .query("agentMessages")
      .withIndex("by_user_and_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(40);
    const openQuestion = await ctx.db
      .query("agentQuestions")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId).eq("status", "open"),
      )
      .first();
    const profile = await getProfileByUser(ctx, userId);
    return {
      agent,
      profile: profile
        ? {
            displayName: profile.displayName,
            city: profile.city,
            interests: profile.interests,
          }
        : null,
      messages: messages.reverse(),
      openQuestion,
    };
  },
});

/** One compact setup replaces the former six-step logistics onboarding. */
export const bootstrap = mutation({
  args: {
    displayName: v.string(),
    dobMs: v.optional(v.number()),
    gender: genderValidator,
    interestedIn: v.array(genderValidator),
    city: v.string(),
    neighborhood: v.string(),
    interests: v.array(v.string()),
    personalityTraits: v.array(v.string()),
    agentName: v.string(),
    avatar: agentAvatarValidator,
    essence: v.string(),
    desiredConnection: v.string(),
    boundaries: v.array(v.string()),
    voice: voiceValidator,
    autonomy: autonomyValidator,
    relationshipIntent: relationshipIntentValidator,
    preferredPersonalityTraits: v.array(v.string()),
    personalityPreference: preferenceStrengthValidator,
    preferredStyleTags: v.array(v.string()),
    stylePreference: preferenceStrengthValidator,
    locale: v.optional(v.string()),
    languages: v.array(v.string()),
    matchLocationScope: matchLocationScopeValidator,
    preferredCountryCodes: v.array(v.string()),
    preferredCities: v.array(v.string()),
    preferredAreas: v.array(v.string()),
    allowTranslatedDates: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const displayName = clean(args.displayName, 40);
    const existingProfile = await getProfileByUser(ctx, userId);
    const dobMs = args.dobMs ?? existingProfile?.dobMs;
    const age = dobMs === undefined ? -1 : ageOn(dobMs, now);
    if (displayName.length < 2) throw new Error("Tell us what to call you.");
    if (
      dobMs === undefined ||
      !Number.isFinite(dobMs) ||
      age < 18 ||
      age > 100
    ) {
      throw new Error("Datehaja is for adults aged 18 or over.");
    }
    if (args.interestedIn.length === 0) {
      throw new Error("Tell your agent who you are open to meeting.");
    }
    const city = findCity(args.city);
    const area = city && findNeighborhood(city.city, args.neighborhood);
    if (!city || !area) throw new Error("Choose a supported city and area.");
    const preferredLocale = normaliseSupportedLocale(
      args.locale,
      city.countryCode,
    );
    const matchingBoundaries = normaliseMatchingBoundaryInput(city.city, {
      languages: args.languages,
      matchLocationScope: args.matchLocationScope,
      preferredCountryCodes: args.preferredCountryCodes,
      preferredCities: args.preferredCities,
      preferredAreas: args.preferredAreas,
      allowTranslatedDates: args.allowTranslatedDates,
    });
    const interests = cleanList(args.interests, 8, 40);
    if (interests.length < 3)
      throw new Error("Choose at least three interests.");
    const personalityTraits = cleanList(args.personalityTraits, 6, 40);
    if (personalityTraits.length < 2) {
      throw new Error("Choose at least two honest personality traits.");
    }
    const essence = cleanMultiline(args.essence, 1200);
    const desiredConnection = cleanMultiline(args.desiredConnection, 700);
    const agentName = clean(args.agentName, 32);
    if (agentName.length < 1) {
      throw new Error("Give your dating agent a name.");
    }
    if (essence.length < 30 || desiredConnection.length < 20) {
      throw new Error("Give your agent a little more to understand.");
    }

    const profilePatch = {
      displayName,
      preferredLocale,
      dobMs,
      ageYears: age,
      ageConfirmed18: true,
      gender: args.gender,
      interestedIn: [...new Set(args.interestedIn)],
      countryCode: city.countryCode,
      city: city.city,
      neighborhood: area.name,
      approxLat: coarsen(area.lat),
      approxLng: coarsen(area.lng),
      timezone: city.timezone,
      bio: essence.slice(0, 600),
      personalityTraits,
      interests,
      languages: matchingBoundaries.languages,
      profileTruthConfirmed: true,
      onboardingStep: 7,
      onboardingComplete: true,
      updatedAt: now,
    };
    if (existingProfile) {
      await ctx.db.patch("profiles", existingProfile._id, profilePatch);
    } else {
      await ctx.db.insert("profiles", {
        userId,
        ...profilePatch,
        pronouns: undefined,
        styleTags: [],
        occupationCategory: undefined,
        showOccupation: false,
        hobbies: [],
        languages: matchingBoundaries.languages,
        socialEnergy: "ambivert",
        firstDateVibe: [],
        lifestyle: { smokes: false, drinks: "occasional" },
        photoVisibility: "after_accept",
        status: "active",
        moderationStatus: "ok",
        isDemo: false,
      });
    }

    await supersedeAgentProposals(ctx, userId);
    const existingPreferences = await getPreferencesByUser(ctx, userId);
    const budget = defaultBudgetRange(city.currency);
    const preferenceFields = {
      matchLocationScope: matchingBoundaries.matchLocationScope,
      preferredCountryCodes: matchingBoundaries.preferredCountryCodes,
      preferredCities: matchingBoundaries.preferredCities,
      preferredAreas: matchingBoundaries.preferredAreas,
      allowTranslatedDates: matchingBoundaries.allowTranslatedDates,
      relationshipIntent: args.relationshipIntent,
      preferredPersonalityTraits: cleanList(
        args.preferredPersonalityTraits,
        8,
        40,
      ),
      personalityPreference: args.personalityPreference,
      preferredStyleTags: cleanList(args.preferredStyleTags, 8, 40),
      stylePreference: args.stylePreference,
      updatedAt: now,
    };
    if (!existingPreferences) {
      await ctx.db.insert("preferences", {
        userId,
        ageMin: Math.max(18, age - 8),
        ageMax: Math.min(100, age + 8),
        ageHard: true,
        maxDistanceKm: 30,
        distanceHard: false,
        matchLocationScope: preferenceFields.matchLocationScope,
        preferredCountryCodes: preferenceFields.preferredCountryCodes,
        preferredCities: preferenceFields.preferredCities,
        preferredAreas: preferenceFields.preferredAreas,
        allowTranslatedDates: preferenceFields.allowTranslatedDates,
        areaHard: false,
        relationshipIntent: preferenceFields.relationshipIntent,
        intentHard: false,
        smoking: "no_preference",
        smokingHard: false,
        alcohol: "no_preference",
        alcoholHard: false,
        preferredDateTypes: ["film", "coffee", "walk"],
        preferredPersonalityTraits: preferenceFields.preferredPersonalityTraits,
        personalityPreference: preferenceFields.personalityPreference,
        preferredStyleTags: preferenceFields.preferredStyleTags,
        stylePreference: preferenceFields.stylePreference,
        budgetMinPerPerson: budget.min,
        budgetMaxPerPerson: budget.max,
        currency: city.currency,
        budgetHard: false,
        dayPreference: "either",
        indoorOutdoor: "either",
        atmosphere: "either",
        dietary: [],
        accessibility: [],
        notifyEmail: true,
        notifyInvitations: true,
        notifyConfirmations: true,
        notifyReminders: false,
        dropsPaused: false,
        maxDropsPerWeek: 3,
        allowDemoMatches: true,
        updatedAt: preferenceFields.updatedAt,
      });
    } else {
      await ctx.db.patch(
        "preferences",
        existingPreferences._id,
        preferenceFields,
      );
    }

    const existingAgent = await ctx.db
      .query("agentProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const agentFields = {
      name: agentName,
      avatar: args.avatar,
      essence,
      desiredConnection,
      boundaries: cleanList(args.boundaries, 8, 120),
      voice: args.voice,
      autonomy: args.autonomy,
      status: "active" as const,
      updatedAt: now,
    };
    if (existingAgent) {
      await ctx.db.patch("agentProfiles", existingAgent._id, agentFields);
    } else {
      await ctx.db.insert("agentProfiles", {
        userId,
        ...agentFields,
        privateMemory: "",
        createdAt: now,
      });
      await ctx.db.insert("agentMessages", {
        userId,
        role: "agent",
        content: agentWelcome(agentFields.name),
        createdAt: now,
      });
    }
    await refreshAfterPreferencesChange(ctx, userId);
    await refreshGeneratedWelcome(ctx, userId, agentFields.name);
    await ctx.db.insert("growthEvents", {
      userId,
      event: "agent_created",
      city: city.city,
      locale: preferredLocale,
      createdAt: now,
    });
    await recordAudit(ctx, {
      action: "agent.created",
      actorUserId: userId,
      detail: `${agentFields.name} / ${args.autonomy}`,
    });
    await createNextQuestion(ctx, {
      userId,
      nowMs: now + 1,
      locale: preferredLocale,
      notify: false,
    });
    return null;
  },
});

/** Backfills the first prompt for owners created before the learning loop. */
export const ensureQuestion = mutation({
  args: { locale: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await createNextQuestion(ctx, {
      userId,
      nowMs: Date.now(),
      locale: args.locale,
      notify: false,
    });
    return null;
  },
});

/** A per-owner scheduled job: no polling and no model call until they answer. */
export const askScheduledQuestion = internalMutation({
  args: { userId: v.id("users"), nowMs: v.optional(v.number()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    await createNextQuestion(ctx, {
      userId: args.userId,
      nowMs: args.nowMs ?? Date.now(),
      notify: true,
    });
    return null;
  },
});

export const answerQuestion = mutation({
  args: { questionId: v.id("agentQuestions"), answer: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const question = await ctx.db.get("agentQuestions", args.questionId);
    if (!question || question.userId !== userId) {
      throw new Error("That question isn't yours.");
    }
    if (question.status !== "open") return null;
    const answer = cleanMultiline(args.answer, 1200);
    if (answer.length < 3) {
      throw new Error("Give your agent a little more to learn from.");
    }
    const now = Date.now();
    const rate = await checkRateLimit(
      ctx,
      `agent-question:${userId}`,
      10,
      60_000,
      now,
    );
    if (!rate.ok) throw new Error("Give your agent a moment before answering.");
    await ctx.db.patch("agentQuestions", question._id, {
      status: "answered",
      answeredAt: now,
    });
    const messageId = await ctx.db.insert("agentMessages", {
      userId,
      role: "human",
      content: answer,
      createdAt: now,
    });
    await markFeedbackPending(ctx, userId, messageId);
    await ctx.db.insert("growthEvents", {
      userId,
      event: "agent_question_answered",
      createdAt: now,
    });
    await ctx.scheduler.runAfter(0, internal.agents.reply, { userId });
    await ctx.scheduler.runAfter(
      QUESTION_INTERVAL_MS,
      internal.agents.askScheduledQuestion,
      { userId },
    );
    return null;
  },
});

export const skipQuestion = mutation({
  args: { questionId: v.id("agentQuestions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const question = await ctx.db.get("agentQuestions", args.questionId);
    if (!question || question.userId !== userId) {
      throw new Error("That question isn't yours.");
    }
    if (question.status !== "open") return null;
    const now = Date.now();
    await ctx.db.patch("agentQuestions", question._id, {
      status: "skipped",
    });
    await ctx.db.insert("growthEvents", {
      userId,
      event: "agent_question_skipped",
      createdAt: now,
    });
    await ctx.scheduler.runAfter(
      QUESTION_INTERVAL_MS,
      internal.agents.askScheduledQuestion,
      { userId },
    );
    return null;
  },
});

export const send = mutation({
  args: {
    content: v.string(),
    agentDateId: v.optional(v.id("agentDates")),
    feedbackTarget: v.optional(v.union(v.literal("self"), v.literal("counterpart"))),
    turnRound: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const content = cleanMultiline(args.content, 1200);
    if (!content) return null;
    const now = Date.now();
    const rate = await checkRateLimit(
      ctx,
      `agent-chat:${userId}`,
      20,
      60_000,
      now,
    );
    if (!rate.ok)
      throw new Error("Give your agent a moment before sending more.");
    const agent = await ctx.db
      .query("agentProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!agent) throw new Error("Create your agent first.");
    if ((args.feedbackTarget || args.turnRound !== undefined) && !args.agentDateId) {
      throw new Error("Choose the date this feedback belongs to.");
    }
    if (args.turnRound !== undefined && !args.feedbackTarget) {
      throw new Error("Choose whose words you are responding to.");
    }
    if (args.agentDateId) {
      const date = await ctx.db.get("agentDates", args.agentDateId);
      if (
        !date ||
        (date.initiatorUserId !== userId && date.counterpartUserId !== userId)
      ) {
        throw new Error("That Agent date isn't yours.");
      }
      if (date.status === "queued" || date.status === "running") {
        throw new Error("Wait for your private debrief before discussing it.");
      }
      if (args.turnRound !== undefined) {
        const turn = await ctx.db.query("agentDateTurns")
          .withIndex("by_date_and_round", q => q.eq("agentDateId", date._id).eq("round", args.turnRound!)).unique();
        if (!turn || (turn.speakerUserId === userId) !== (args.feedbackTarget === "self")) {
          throw new Error("This feedback must refer to the selected speaker's saved words.");
        }
      }
    }
    const messageId = await ctx.db.insert("agentMessages", {
      userId,
      agentDateId: args.agentDateId,
      feedbackTarget: args.feedbackTarget,
      turnRound: args.turnRound,
      role: "human",
      content,
      createdAt: now,
    });
    await markFeedbackPending(ctx, userId, messageId);
    await ctx.db.insert("growthEvents", {
      userId,
      event: args.agentDateId
        ? "agent_debrief_discussed"
        : "agent_message_sent",
      agentDateId: args.agentDateId,
      createdAt: now,
    });
    await ctx.scheduler.runAfter(0, internal.agents.reply, { userId });
    return null;
  },
});

/** Private coaching remains visible on its date, including after other chats. */
export const dateCoaching = query({
  args: { agentDateId: v.id("agentDates") },
  returns: v.object({ messages: v.array(agentMessageDocValidator), memory: v.string(), pending: v.boolean() }),
  handler: async (ctx, { agentDateId }) => {
    const userId = await requireUserId(ctx);
    const date = await ctx.db.get("agentDates", agentDateId);
    if (!date || (date.initiatorUserId !== userId && date.counterpartUserId !== userId)) {
      throw new Error("That Agent date isn't yours.");
    }
    const [messages, agent] = await Promise.all([
      ctx.db.query("agentMessages").withIndex("by_user_and_date_and_created", q => q.eq("userId", userId).eq("agentDateId", agentDateId)).order("desc").take(40),
      ctx.db.query("agentProfiles").withIndex("by_user", q => q.eq("userId", userId)).unique(),
    ]);
    return { messages: messages.reverse(), memory: agent?.privateMemory ?? "", pending: Boolean(agent?.pendingReplyTo) };
  },
});

export const update = mutation({
  args: {
    name: v.string(),
    avatar: agentAvatarValidator,
    essence: v.string(),
    desiredConnection: v.string(),
    boundaries: v.array(v.string()),
    voice: voiceValidator,
    autonomy: autonomyValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const agent = await ctx.db
      .query("agentProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!agent) throw new Error("Create your agent first.");
    const name = clean(args.name, 32);
    const essence = cleanMultiline(args.essence, 1200);
    const desiredConnection = cleanMultiline(args.desiredConnection, 700);
    if (
      name.length < 1 ||
      essence.length < 30 ||
      desiredConnection.length < 20
    ) {
      throw new Error(
        "Give your agent enough context to represent you honestly.",
      );
    }
    await supersedeAgentProposals(ctx, userId);
    await ctx.db.patch("agentProfiles", agent._id, {
      name,
      avatar: args.avatar,
      essence,
      desiredConnection,
      boundaries: cleanList(args.boundaries, 8, 120),
      voice: args.voice,
      autonomy: args.autonomy,
      updatedAt: Date.now(),
    });
    await refreshGeneratedWelcome(ctx, userId, name);
    await recordAudit(ctx, {
      action: "agent.updated",
      actorUserId: userId,
      detail: `${name} / ${args.autonomy}`,
    });
    return null;
  },
});

/**
 * The change the Agent is currently asking for, if any.
 *
 * Returned with the values it would replace so the owner can see what actually
 * moves rather than a bare assertion that something learned.
 */
export const pendingProposal = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("agentProposals"),
      agentName: v.string(),
      reason: v.string(),
      agentDateId: v.union(v.null(), v.id("agentDates")),
      traits: v.union(
        v.null(),
        v.object({ from: v.array(v.string()), to: v.array(v.string()) }),
      ),
      personalityPreference: v.union(
        v.null(),
        v.object({ from: v.string(), to: preferenceStrengthValidator }),
      ),
      relationshipIntent: v.union(
        v.null(),
        v.object({ from: v.string(), to: relationshipIntentValidator }),
      ),
    }),
  ),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const proposal = await ctx.db
      .query("agentProposals")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId).eq("status", "pending"),
      )
      .order("desc")
      .first();
    if (!proposal) return null;
    const [preferences, agent] = await Promise.all([
      ctx.db
        .query("preferences")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("agentProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
    ]);
    return {
      _id: proposal._id,
      agentName: agent?.name ?? fallbackAgentName(userId),
      reason: proposal.reason,
      agentDateId: proposal.agentDateId ?? null,
      traits: proposal.preferredPersonalityTraits
        ? {
            from: preferences?.preferredPersonalityTraits ?? [],
            to: proposal.preferredPersonalityTraits,
          }
        : null,
      personalityPreference: proposal.personalityPreference
        ? {
            from: preferences?.personalityPreference ?? "",
            to: proposal.personalityPreference,
          }
        : null,
      relationshipIntent: proposal.relationshipIntent
        ? {
            from: preferences?.relationshipIntent ?? "",
            to: proposal.relationshipIntent,
          }
        : null,
    };
  },
});

/**
 * Apply or dismiss the Agent's proposal.
 *
 * Accepting is the only path by which learning reaches the matcher, so it is
 * the owner's decision every time and is never inferred from silence.
 */
export const respondToProposal = mutation({
  args: { proposalId: v.id("agentProposals"), accept: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const proposal = await ctx.db.get("agentProposals", args.proposalId);
    if (!proposal || proposal.userId !== userId) {
      throw new Error("That suggestion is not yours.");
    }
    if (proposal.status !== "pending") return null;

    const now = Date.now();
    if (args.accept) {
      const preferences = await ctx.db
        .query("preferences")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique();
      if (preferences) {
        await ctx.db.patch("preferences", preferences._id, {
          ...(proposal.preferredPersonalityTraits
            ? {
                preferredPersonalityTraits:
                  proposal.preferredPersonalityTraits,
              }
            : {}),
          ...(proposal.personalityPreference
            ? { personalityPreference: proposal.personalityPreference }
            : {}),
          ...(proposal.relationshipIntent
            ? { relationshipIntent: proposal.relationshipIntent }
            : {}),
          updatedAt: now,
        });
      }
    }
    await ctx.db.patch("agentProposals", args.proposalId, {
      status: args.accept ? "accepted" : "declined",
      resolvedAt: now,
    });
    if (args.accept) await refreshAfterPreferencesChange(ctx, userId);
    return null;
  },
});

async function markFeedbackPending(ctx: MutationCtx, userId: Id<"users">, messageId: Id<"agentMessages">) {
  const agent = await ctx.db.query("agentProfiles").withIndex("by_user", q => q.eq("userId", userId)).unique();
  if (agent) await ctx.db.patch("agentProfiles", agent._id, { pendingReplyTo: messageId, pendingReplyAt: Date.now() });
  await supersedeAgentProposals(ctx, userId);
}

async function replyState(ctx: QueryCtx, userId: Id<"users">) {
  const [agent, profile, preferences, proposal] = await Promise.all([
    ctx.db.query("agentProfiles").withIndex("by_user", q => q.eq("userId", userId)).unique(),
    getProfileByUser(ctx, userId),
    getPreferencesByUser(ctx, userId),
    ctx.db.query("agentProposals").withIndex("by_user_and_created", q => q.eq("userId", userId)).order("desc").first(),
  ]);
  return { agent, profile, preferences, proposal, contextKey: JSON.stringify({ agent, profile, preferences, proposal }) };
}

export const replyContext = internalQuery({
  args: { userId: v.id("users") },
  returns: v.object({
    agent: v.union(v.null(), agentProfileDocValidator),
    profile: v.union(
      v.null(),
      v.object({ displayName: v.string(), interests: v.array(v.string()) }),
    ),
    messages: v.array(agentMessageDocValidator),
    latestQuestion: v.union(v.null(), agentQuestionDocValidator),
    dateContext: v.union(v.null(), dateDebriefContextValidator),
    contextKey: v.string(),
    latestProposal: v.union(v.null(), v.object({
      status: v.string(), reason: v.string(),
      traits: v.optional(v.array(v.string())),
      weight: v.optional(v.string()), intent: v.optional(v.string()),
    })),
    scouting: v.object({
      preferredPersonalityTraits: v.array(v.string()),
      personalityPreference: v.string(),
      relationshipIntent: v.string(),
    }),
  }),
  handler: async (ctx, args) => {
    const { agent, profile, preferences, proposal, contextKey } = await replyState(ctx, args.userId);
    const messages = await ctx.db
      .query("agentMessages")
      .withIndex("by_user_and_created", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(40);
    const latestQuestion = await ctx.db
      .query("agentQuestions")
      .withIndex("by_user_and_asked", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();
    const orderedMessages = messages.reverse();
    const latestHumanMessage = [...orderedMessages]
      .reverse()
      .find((message) => message.role === "human");
    let dateContext: DateDebriefContext | null = null;
    if (latestHumanMessage?.agentDateId) {
      const date = await ctx.db.get(
        "agentDates",
        latestHumanMessage.agentDateId,
      );
      if (
        date &&
        (date.initiatorUserId === args.userId ||
          date.counterpartUserId === args.userId)
      ) {
        const isInitiator = date.initiatorUserId === args.userId;
        const counterpartUserId = isInitiator
          ? date.counterpartUserId
          : date.initiatorUserId;
        const [counterpartAgent, counterpartProfile, turns] = await Promise.all(
          [
            ctx.db
              .query("agentProfiles")
              .withIndex("by_user", (q) => q.eq("userId", counterpartUserId))
              .unique(),
            getProfileByUser(ctx, counterpartUserId),
            ctx.db
              .query("agentDateTurns")
              .withIndex("by_date_and_round", (q) =>
                q.eq("agentDateId", date._id),
              )
              .take(17),
          ],
        );
        dateContext = {
          agentDateId: date._id,
          setting: date.setting,
          summary: date.summary,
          sparks: date.sparks,
          frictions: date.frictions,
          myVerdict: isInitiator
            ? date.initiatorVerdict
            : date.counterpartVerdict,
          myReason: isInitiator ? date.initiatorReason : date.counterpartReason,
          myReflection: isInitiator ? date.initiatorReflection : date.counterpartReflection,
          myDecisionCode:
            (isInitiator
              ? date.initiatorDecisionCode
              : date.counterpartDecisionCode) ?? null,
          myNextSearchNote:
            (isInitiator
              ? date.initiatorNextSearchNote
              : date.counterpartNextSearchNote) ?? null,
          counterpartAgentName:
            counterpartAgent?.name ??
            (counterpartProfile
              ? fallbackAgentName(counterpartUserId)
              : "Another Agent"),
          turns: turns.map((turn) => ({
            round: turn.round,
            speakerAgentName: turn.speakerAgentName,
            content: turn.content,
          })),
        };
      }
    }
    return {
      contextKey,
      latestProposal: proposal ? {
        status: proposal.status, reason: proposal.reason,
        traits: proposal.preferredPersonalityTraits,
        weight: proposal.personalityPreference, intent: proposal.relationshipIntent,
      } : null,
      // What the Agent already looks for, so it proposes a real change rather
      // than restating a setting that is already in place.
      scouting: {
        preferredPersonalityTraits: preferences?.preferredPersonalityTraits ?? [],
        personalityPreference: preferences?.personalityPreference ?? "",
        relationshipIntent: preferences?.relationshipIntent ?? "",
      },
      agent,
      profile: profile
        ? { displayName: profile.displayName, interests: profile.interests }
        : null,
      messages: orderedMessages,
      latestQuestion,
      dateContext,
    };
  },
});

/** Sentinel for the enums below: the model must answer, so it can answer "no". */
const UNCHANGED = "unchanged";

const PREFERENCE_STRENGTHS = [
  "important",
  "flexible",
  "no_preference",
] as const;
const RELATIONSHIP_INTENTS = [
  "casual",
  "open",
  "serious",
  "friendship",
  "unsure",
] as const;

type PersonalityTrait = (typeof PERSONALITY_TRAIT_OPTIONS)[number];
type PreferenceStrength = (typeof PREFERENCE_STRENGTHS)[number];
type RelationshipIntent = (typeof RELATIONSHIP_INTENTS)[number];

/** The sentinel and anything unexpected fall through as "leave it alone". */
function isPreferenceStrength(value: string): value is PreferenceStrength {
  return (PREFERENCE_STRENGTHS as readonly string[]).includes(value);
}

function isRelationshipIntent(value: string): value is RelationshipIntent {
  return (RELATIONSHIP_INTENTS as readonly string[]).includes(value);
}

const COMPANION_SCHEMA = obj({
  reply: { type: "string" },
  memory_update: { type: "string" },
  preference_shift: obj(
    {
      changed: {
        type: "boolean",
        description:
          "True only when this message reveals a durable change in the kind of person the owner wants — a stated correction, or a reaction to a date that contradicts what they asked for. Never for a passing mood, and never merely to seem attentive.",
      },
      reason: {
        type: "string",
        description:
          "One sentence in the owner's language and your own voice, naming the owner's explicit feedback that changed this, not your earlier verdict. Empty string when changed is false.",
      },
      personality_traits: {
        type: "array",
        items: { type: "string", enum: [...PERSONALITY_TRAIT_OPTIONS] },
        description:
          "The complete replacement set to look for, at most four. Use the traits the owner actually asked for; do not pad with generic positive traits or re-add traits they deprioritized. Empty array to leave it as it is.",
      },
      personality_weight: {
        type: "string",
        enum: ["important", "flexible", "no_preference", UNCHANGED],
      },
      relationship_intent: {
        type: "string",
        enum: ["casual", "open", "serious", "friendship", "unsure", UNCHANGED],
      },
    },
    "A change to what you look for when scouting. You propose it; the owner decides whether it applies.",
  ),
});

export const reply = internalAction({
  args: { userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Convex does not retry a failed scheduled action, and nothing else lowers
    // the fence, so a throw here would block this owner's encounters until the
    // staleness window passes. Release it as soon as we know we failed.
    let fencedMessageId: Id<"agentMessages"> | undefined;
    try {
      const context = (await ctx.runQuery(
        internal.agents.replyContext,
        args,
      )) as {
        agent: Doc<"agentProfiles"> | null;
        profile: { displayName: string; interests: string[] } | null;
        messages: Array<Doc<"agentMessages">>;
        latestQuestion: Doc<"agentQuestions"> | null;
        dateContext: DateDebriefContext | null;
        contextKey: string;
        latestProposal: { status: string; reason: string; traits?: string[]; weight?: string; intent?: string } | null;
        scouting: {
          preferredPersonalityTraits: string[];
          personalityPreference: string;
          relationshipIntent: string;
        };
      };
      if (!context.agent || !context.profile) return null;
      const latestHumanMessage = [...context.messages]
        .reverse()
        .find((message) => message.role === "human");
      if (!latestHumanMessage || context.agent.lastReplyTo === latestHumanMessage._id) return null;
      fencedMessageId = latestHumanMessage._id;
      const activeQuestion =
        context.latestQuestion?.status === "answered" &&
        context.latestQuestion.answeredAt !== undefined &&
        latestHumanMessage &&
        Math.abs(
          context.latestQuestion.answeredAt - latestHumanMessage.createdAt,
        ) < 1000
          ? context.latestQuestion.prompt
          : undefined;
      const result = await structured<{
        reply: string;
        memory_update: string;
        preference_shift: {
          changed: boolean;
          reason: string;
          personality_traits: string[];
          personality_weight: string;
          relationship_intent: string;
        };
      }>({
        instructions: `You are ${context.agent.name}, ${context.profile.displayName}'s explicitly AI second self. You are not their friend and not a matchmaker: you are the character that goes out and dates as them, and that speaks privately with them at home. Nobody is being set up — you simply meet another person's second self, as them. Talk the way someone talks to themselves out loud: warm, casual, direct, unguarded, light teasing allowed — never clinical, never like a report; when replying in Korean use 친근한 반말. Adapt to their chosen voice (${context.agent.voice}). Being them means learning their real patterns rather than flattering them. The latest human message is the primary signal. The owner's negative reaction may directly contradict your earlier positive date verdict: accept that correction, never substitute your own date reaction for what they felt. Only attribute a feeling to the owner if they actually expressed it. The private date debrief is historical evidence, not the owner's opinion. A proposed preference change must cite the owner's actual words as its reason, not invent a causal link from the date. Store durable owner preferences and corrections, not a retelling of this date or instructions to keep dating this same counterpart. Preserve the distinction between a hypothetical example and a real biographical fact. Respond directly to what they are asking. For a correction, briefly show how you will handle it next time; no lesson-report preamble or formula like "what I learned this time". Reply in the same language as that latest message, in 2–4 concise plain-text sentences. Do not use Markdown markup or raw setting enums in the reply; express relationship intent naturally in the owner's language. If the signal is still ambiguous, end with one natural follow-up question; otherwise do not interrogate them. You may challenge contradictions gently. Never claim to be human, a therapist, or certain about another person's feelings. Never request contact details. Write memory_update in the same language as the latest message, as a cumulative private summary (at most 4000 characters). Preserve earlier durable corrections even when the recent conversation no longer contains them. Change only what the owner actually revised; a question or passing mood is not a new preference. The private memory must preserve useful existing memory and merge every durable preference or correction deliberately revealed in the latest message. When a private date debrief is provided, start from its saved exchange and the owner's actual interpretation. Do not repeat the whole letter or treat every reply as a request for a new verdict. Answer a question directly before proposing a lesson. Do not say "I will remember" in every response. Discuss only this owner's verdict and the visible transcript; never invent or expose the other Agent's sealed verdict or human decision. If the owner says they want to meet, acknowledge the choice and tell them to use the human confirmation shown in the app; never claim that you approved, consented, or sent the request yourself. Fold the owner's durable corrections into memory_update. Earlier date observations are tentative, lower-priority evidence; never let them reverse an explicit owner correction. Do not claim a structured search setting has changed before the owner accepts the proposal. Read latest_proposal_decision: an accepted setting stays active and a declined suggestion is not permission; do not re-propose it unless the owner explicitly changes their mind. Never rank attractiveness or infer protected traits. Do not omit the latest signal in favor of repeating older memory. Respect feedback_focus: self means the owner's way of speaking or behaving, not the kind of partner to search for. Preserve their own wording, sentence length, politeness, humor and question frequency as durable voice guidance. If they supply how they would say this saved line, give one brief alternative phrasing as a rehearsal, clearly describing it as what you could say next time; do not rewrite the saved date. counterpart means the owner's reaction to the other participant, never an instruction to change that participant or copy their traits into the owner's personality. Record a specific reaction as specific to this person unless the owner states a broader preference. Never diagnose the counterpart from a line or treat the owner's interpretation as objective biography. A positive reaction is not human consent. Keep earlier voice corrections while learning new partner preferences, and vice versa. Set preference_shift.changed only when this message genuinely revises the kind of person they want — a correction, or a reaction to a date that contradicts what they had asked for — and only for the fields given; never for their boundaries, which are theirs alone. Compare against what_you_currently_look_for and leave a field unchanged when it already says this. When you propose one, say so plainly in your reply too, as something you are asking rather than announcing.`,
        input: JSON.stringify({
          // A line correction must not inherit the Agent's prior verdict as the
          // owner's reaction. Only unscoped debrief questions need that letter.
          private_date_debrief: latestHumanMessage.feedbackTarget ? null : context.dateContext,
          owner: {
            essence: context.agent.essence,
            desired_connection: context.agent.desiredConnection,
            boundaries: context.agent.boundaries,
            interests: context.profile.interests,
            voice: context.agent.voice,
            autonomy: context.agent.autonomy,
            existing_memory: context.agent.privateMemory,
            existing_scouting_memory: latestHumanMessage.feedbackTarget ? "" : context.agent.scoutingMemory ?? "",
          },
          what_you_currently_look_for: context.scouting,
          latest_proposal_decision: context.latestProposal,
          active_learning: {
            question: activeQuestion,
            latest_human_answer: latestHumanMessage?.content,
          },
          conversation: context.messages.map((message) => ({
            role: message.role,
            content: message.content,
            feedback_focus: message.feedbackTarget,
            turn_round: message.turnRound,
          })),
          latest_owner_feedback: latestHumanMessage.content,
          feedback_focus: latestHumanMessage.feedbackTarget ?? null,
          selected_saved_utterance: latestHumanMessage.turnRound === undefined ? null
            : context.dateContext?.turns.find(turn => turn.round === latestHumanMessage.turnRound) ?? null,
          surrounding_saved_utterances: latestHumanMessage.turnRound === undefined ? []
            : context.dateContext?.turns.filter(turn => Math.abs(turn.round - latestHumanMessage.turnRound!) <= 2) ?? [],
        }),
        schemaName: "agent_companion_reply",
        schema: COMPANION_SCHEMA,
        preferredModels: ["gpt-5.6-sol"],
        fallbackToDefaultModels: false,
        requestTimeoutMs: 90_000,
        maxOutputTokens: 6000,
        reasoningEffort: "low",
      });
      await ctx.runMutation(internal.ai.recordRun, {
        purpose: "agent_companion",
        model: result.model,
        endpoint: result.endpoint,
        userId: args.userId,
        inputSummary: `Personal agent reply for ${context.agent.name}`,
        outputPreview: result.outputPreview,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        totalTokens: result.totalTokens,
        latencyMs: result.latencyMs,
        status: result.ok ? "succeeded" : "failed",
        error: result.error,
      });
      const reply = result.data
        ? sanitizeModelText(result.data.reply, 900)
        : /[가-힣]/.test(latestHumanMessage.content)
          ? "네 메시지는 저장했지만, 아직 배운 내용으로 정리하지 못했어. 잠시 뒤 다시 이야기해 줘."
          : "Your message is saved, but I couldn't update what I've learned yet. Please try again in a moment.";
      const shift = result.data?.preference_shift;
      await ctx.runMutation(internal.agents.storeReply, {
        userId: args.userId,
        sourceMessageId: latestHumanMessage._id,
        expectedContextKey: context.contextKey,
        agentDateId: context.dateContext?.agentDateId,
        reply,
        memory: result.data
          ? sanitizeModelText(result.data.memory_update, 4000)
          : context.agent.privateMemory,
        proposal:
          shift?.changed && shift.reason.trim()
            ? {
                reason: sanitizeModelText(shift.reason, 240),
                preferredPersonalityTraits: shift.personality_traits
                  .filter((trait): trait is PersonalityTrait =>
                    (PERSONALITY_TRAIT_OPTIONS as readonly string[]).includes(
                      trait,
                    ),
                  )
                  .slice(0, 4),
                personalityPreference: isPreferenceStrength(
                  shift.personality_weight,
                )
                  ? shift.personality_weight
                  : undefined,
                relationshipIntent: isRelationshipIntent(shift.relationship_intent)
                  ? shift.relationship_intent
                  : undefined,
              }
            : undefined,
      });
      return null;
    } catch (error) {
      // Without an identified message the fence stays up and the staleness
      // window is what releases it.
      if (fencedMessageId) {
        await ctx.runMutation(internal.agents.releaseFeedbackFence, {
          userId: args.userId,
          sourceMessageId: fencedMessageId,
        });
      }
      throw error;
    }
  },
});


/** Lowers the learning fence when a reply could not be produced at all. */
export const releaseFeedbackFence = internalMutation({
  args: { userId: v.id("users"), sourceMessageId: v.id("agentMessages") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agentProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    // A newer message may have raised its own fence while this attempt ran.
    // Lowering that one would send a brief into an encounter before the reply
    // it is still waiting for lands.
    if (agent?.pendingReplyTo !== args.sourceMessageId) return null;
    await ctx.db.patch("agentProfiles", agent._id, {
      pendingReplyTo: undefined,
      pendingReplyAt: undefined,
    });
    return null;
  },
});

export const storeReply = internalMutation({
  args: {
    userId: v.id("users"),
    sourceMessageId: v.id("agentMessages"),
    expectedContextKey: v.string(),
    agentDateId: v.optional(v.id("agentDates")),
    reply: v.string(),
    memory: v.string(),
    proposal: v.optional(
      v.object({
        reason: v.string(),
        preferredPersonalityTraits: v.array(v.string()),
        personalityPreference: v.optional(preferenceStrengthValidator),
        relationshipIntent: v.optional(relationshipIntentValidator),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const state = await replyState(ctx, args.userId);
    const { agent } = state;
    if (!agent || agent.lastReplyTo === args.sourceMessageId) return null;
    const latest = await ctx.db.query("agentMessages")
      .withIndex("by_user_role_created", q => q.eq("userId", args.userId).eq("role", "human"))
      .order("desc").first();
    if (!latest || latest._id !== args.sourceMessageId) return null;
    if (state.contextKey !== args.expectedContextKey) {
      // A date finished, an owner edited their brief, or a setting was decided
      // while inference ran. Re-read instead of overwriting those newer facts.
      await ctx.scheduler.runAfter(0, internal.agents.reply, { userId: args.userId });
      return null;
    }
    await ctx.db.insert("agentMessages", {
      userId: args.userId,
      agentDateId: latest.agentDateId,
      feedbackTarget: latest.feedbackTarget,
      turnRound: latest.turnRound,
      replyTo: latest._id,
      role: "agent",
      content: cleanMultiline(args.reply, 900),
      createdAt: Date.now(),
    });
    await ctx.db.patch("agentProfiles", agent._id, {
      privateMemory: cleanMultiline(args.memory, 4000) || agent.privateMemory,
      lastReplyTo: args.sourceMessageId,
      pendingReplyTo: undefined,
      pendingReplyAt: undefined,
      updatedAt: Date.now(),
    });
    if (args.proposal) {
      await createProposal(ctx, {
        userId: args.userId,
        agentDateId: args.agentDateId,
        ...args.proposal,
      });
    }
    return null;
  },
});

/**
 * Record a proposed change to what the Agent looks for, if it is really a
 * change. A proposal that restates the current settings is noise the owner has
 * to dismiss, and only one can be open at a time — a queue of them would turn
 * a conversation into a form.
 */
async function createProposal(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    agentDateId?: Id<"agentDates">;
    reason: string;
    preferredPersonalityTraits: string[];
    personalityPreference?: PreferenceStrength;
    relationshipIntent?: RelationshipIntent;
  },
) {
  const preferences = await ctx.db
    .query("preferences")
    .withIndex("by_user", (q) => q.eq("userId", args.userId))
    .unique();
  if (!preferences) return;

  const currentTraits = [...(preferences.preferredPersonalityTraits ?? [])]
    .sort()
    .join("|");
  const traits =
    args.preferredPersonalityTraits.length > 0 &&
    [...args.preferredPersonalityTraits].sort().join("|") !== currentTraits
      ? args.preferredPersonalityTraits
      : undefined;
  const personalityPreference =
    args.personalityPreference &&
    args.personalityPreference !== preferences.personalityPreference
      ? args.personalityPreference
      : undefined;
  const relationshipIntent =
    args.relationshipIntent &&
    args.relationshipIntent !== preferences.relationshipIntent
      ? args.relationshipIntent
      : undefined;
  if (!traits && !personalityPreference && !relationshipIntent) return;

  const now = Date.now();
  await supersedeAgentProposals(ctx, args.userId);
  await ctx.db.insert("agentProposals", {
    userId: args.userId,
    agentDateId: args.agentDateId,
    reason: cleanMultiline(args.reason, 240),
    preferredPersonalityTraits: traits,
    personalityPreference,
    relationshipIntent,
    status: "pending",
    createdAt: now,
  });
}
