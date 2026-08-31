import { v, type Infer } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import {
  checkRateLimit,
  getPreferencesByUser,
  getProfileByUser,
  recordAudit,
  requireUserId,
} from "./lib/authz";
import { ageOn } from "./lib/age";
import { defaultBudgetRange, findCity, findNeighborhood } from "./lib/catalog";
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
const QUESTION_LOCALES = [
  "en-US",
  "en-GB",
  "en-CA",
  "en-AU",
  "ko-KR",
  "ja-JP",
  "de-DE",
  "fr-FR",
  "nl-NL",
  "sv-SE",
] as const;

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
    args.locale ?? latest?.locale,
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
    const interests = cleanList(args.interests, 8, 40);
    if (interests.length < 3)
      throw new Error("Choose at least three interests.");
    const personalityTraits = cleanList(args.personalityTraits, 6, 40);
    if (personalityTraits.length < 2) {
      throw new Error("Choose at least two honest personality traits.");
    }
    const essence = cleanMultiline(args.essence, 1200);
    const desiredConnection = cleanMultiline(args.desiredConnection, 700);
    if (essence.length < 30 || desiredConnection.length < 20) {
      throw new Error("Give your agent a little more to understand.");
    }

    const profilePatch = {
      displayName,
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
        languages: [],
        socialEnergy: "ambivert",
        firstDateVibe: [],
        lifestyle: { smokes: false, drinks: "occasional" },
        photoVisibility: "after_accept",
        status: "active",
        moderationStatus: "ok",
        isDemo: false,
      });
    }

    const existingPreferences = await getPreferencesByUser(ctx, userId);
    const budget = defaultBudgetRange(city.currency);
    const preferenceFields = {
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
        preferredAreas: [area.name],
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
      name: clean(args.agentName, 32) || "My Agent",
      avatar: args.avatar,
      essence,
      desiredConnection,
      boundaries: cleanList(args.boundaries, 8, 120),
      voice: args.voice,
      autonomy: args.autonomy,
      privateMemory: "",
      status: "active" as const,
      updatedAt: now,
    };
    if (existingAgent) {
      await ctx.db.patch("agentProfiles", existingAgent._id, agentFields);
    } else {
      await ctx.db.insert("agentProfiles", {
        userId,
        ...agentFields,
        createdAt: now,
      });
      await ctx.db.insert("agentMessages", {
        userId,
        role: "agent",
        content: `I'm ${agentFields.name}, your dating agent. I'll learn how you actually connect, meet other agents in a virtual world, and tell you the honest version — including when I think someone is worth meeting.`,
        createdAt: now,
      });
    }
    await ctx.db.insert("growthEvents", {
      userId,
      event: "agent_created",
      city: city.city,
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
      locale: args.locale,
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
    await ctx.db.insert("agentMessages", {
      userId,
      role: "human",
      content: answer,
      createdAt: now,
    });
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
    }
    await ctx.db.insert("agentMessages", {
      userId,
      agentDateId: args.agentDateId,
      role: "human",
      content,
      createdAt: now,
    });
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
      name.length < 2 ||
      essence.length < 30 ||
      desiredConnection.length < 20
    ) {
      throw new Error(
        "Give your agent enough context to represent you honestly.",
      );
    }
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
    await recordAudit(ctx, {
      action: "agent.updated",
      actorUserId: userId,
      detail: `${name} / ${args.autonomy}`,
    });
    return null;
  },
});

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
  }),
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agentProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    const profile = await getProfileByUser(ctx, args.userId);
    const messages = await ctx.db
      .query("agentMessages")
      .withIndex("by_user_and_created", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(14);
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
              .take(6),
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
              ? `${counterpartProfile.displayName.split(/\s+/)[0]}'s Agent`
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

const COMPANION_SCHEMA = obj({
  reply: { type: "string" },
  memory_update: { type: "string" },
  scouting_memory_update: {
    type: "string",
    description:
      "Compact cumulative lessons that should change future candidate selection and Agent dates.",
  },
});

export const reply = internalAction({
  args: { userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const context = (await ctx.runQuery(
      internal.agents.replyContext,
      args,
    )) as {
      agent: Doc<"agentProfiles"> | null;
      profile: { displayName: string; interests: string[] } | null;
      messages: Array<Doc<"agentMessages">>;
      latestQuestion: Doc<"agentQuestions"> | null;
      dateContext: DateDebriefContext | null;
    };
    if (!context.agent || !context.profile) return null;
    const latestHumanMessage = [...context.messages]
      .reverse()
      .find((message) => message.role === "human");
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
      scouting_memory_update: string;
    }>({
      instructions: `You are ${context.agent.name}, ${context.profile.displayName}'s explicitly AI dating Agent and matchmaker. You are the single character that represents them in the virtual world and speaks privately with them at home. Learn their real patterns rather than flattering them. The latest human message is the primary signal: acknowledge one concrete thing it taught you and say how it changes how you will represent or scout for them. Reply in the same language as that latest message, in 2–4 concise sentences. If the signal is still ambiguous, end with one natural follow-up question; otherwise do not interrogate them. You may challenge contradictions gently. Never claim to be human, a therapist, or certain about another person's feelings. Never request contact details. Write both memory updates in the same language as the latest message. The private memory must preserve useful existing memory and merge every durable preference or correction deliberately revealed in the latest message. When a private date debrief is provided, discuss only this owner's verdict and the visible transcript; never invent or expose the other Agent's sealed verdict or human decision. Fold the owner's reaction, corrections, attraction signals, reservations, and stated reasons into scouting memory so future searches improve. When no date debrief is provided, preserve existing scouting memory. Never rank attractiveness or infer protected traits. Do not omit the latest signal in favor of repeating older memory.`,
      input: JSON.stringify({
        owner: {
          essence: context.agent.essence,
          desired_connection: context.agent.desiredConnection,
          boundaries: context.agent.boundaries,
          interests: context.profile.interests,
          voice: context.agent.voice,
          autonomy: context.agent.autonomy,
          existing_memory: context.agent.privateMemory,
          existing_scouting_memory: context.agent.scoutingMemory ?? "",
        },
        active_learning: {
          question: activeQuestion,
          latest_human_answer: latestHumanMessage?.content,
        },
        conversation: context.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        private_date_debrief: context.dateContext,
      }),
      schemaName: "agent_companion_reply",
      schema: COMPANION_SCHEMA,
      preferredModels: ["gpt-5-nano", "gpt-5.6-luna"],
      maxOutputTokens: 500,
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
      : "I heard you. I couldn't think clearly enough to give you a useful answer just now, so I saved nothing from that message. Try me again in a moment.";
    await ctx.runMutation(internal.agents.storeReply, {
      userId: args.userId,
      agentDateId: context.dateContext?.agentDateId,
      reply,
      memory: result.data
        ? sanitizeModelText(result.data.memory_update, 1400)
        : context.agent.privateMemory,
      scoutingMemory: result.data
        ? sanitizeModelText(result.data.scouting_memory_update, 1200)
        : (context.agent.scoutingMemory ?? ""),
    });
    return null;
  },
});

export const storeReply = internalMutation({
  args: {
    userId: v.id("users"),
    agentDateId: v.optional(v.id("agentDates")),
    reply: v.string(),
    memory: v.string(),
    scoutingMemory: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agentProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    if (!agent) return null;
    await ctx.db.insert("agentMessages", {
      userId: args.userId,
      agentDateId: args.agentDateId,
      role: "agent",
      content: cleanMultiline(args.reply, 900),
      createdAt: Date.now(),
    });
    await ctx.db.patch("agentProfiles", agent._id, {
      privateMemory: cleanMultiline(args.memory, 1400),
      scoutingMemory: cleanMultiline(args.scoutingMemory, 1200),
      updatedAt: Date.now(),
    });
    return null;
  },
});
