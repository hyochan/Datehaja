import { coachingCopy } from "./coachingCopy";
import { productCopy } from "./productCopy";
import { scoutingCopy } from "./scoutingCopy";
/* oxlint-disable react/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const SUPPORTED_LOCALES = [
  { code: "en-US", region: "US", flag: "🇺🇸", nativeName: "English · US" },
  { code: "en-GB", region: "GB", flag: "🇬🇧", nativeName: "English · UK" },
  { code: "en-CA", region: "CA", flag: "🇨🇦", nativeName: "English · Canada" },
  {
    code: "en-AU",
    region: "AU",
    flag: "🇦🇺",
    nativeName: "English · Australia",
  },
  { code: "ko-KR", region: "KR", flag: "🇰🇷", nativeName: "한국어 · 대한민국" },
  { code: "ja-JP", region: "JP", flag: "🇯🇵", nativeName: "日本語 · 日本" },
  {
    code: "de-DE",
    region: "DE",
    flag: "🇩🇪",
    nativeName: "Deutsch · Deutschland",
  },
  { code: "fr-FR", region: "FR", flag: "🇫🇷", nativeName: "Français · France" },
  {
    code: "nl-NL",
    region: "NL",
    flag: "🇳🇱",
    nativeName: "Nederlands · Nederland",
  },
  { code: "sv-SE", region: "SE", flag: "🇸🇪", nativeName: "Svenska · Sverige" },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];
type TranslationPack = Record<string, string>;

const STORAGE_KEY = "datehaja-locale";
const DEFAULT_LOCALE: LocaleCode = "en-US";
let runtimeLocale: LocaleCode | null = null;

const ko: TranslationPack = {
  "Public record": "공개 안내서",
  "Get started": "시작하기",
  "Sign in": "로그인",
  "Sign out": "로그아웃",
  Privacy: "개인정보",
  Safety: "안전",
  Home: "홈",
  History: "역사",
  You: "내 정보",
  Main: "주요 메뉴",
  Notifications: "알림",
  "Notifications, {count} unread": "읽지 않은 알림 {count}개",
  "Switch to light mode": "라이트 모드로 전환",
  "Switch to dark mode": "다크 모드로 전환",
  "Language and region": "언어 및 지역",
  Loading: "불러오는 중",
  Match: "매치",
  "Safety Center": "안전 센터",
  "AUG / SEOUL": "8월 / 서울",
  person: "1인",
  "Datehaja home": "Datehaja 홈",
  "New client / 01": "신규 고객 / 01",
  "Client return / 01": "고객 재방문 / 01",
  "Open your account": "계정 열기",
  "Welcome back": "다시 만나 반가워요",
  Email: "이메일",
  "Already have an account?": "이미 계정이 있나요?",
  "New here?": "처음이신가요?",
  "Create an account": "계정 만들기",
  "Couldn't sign you in.": "로그인하지 못했습니다.",
  closed: "마감",
  "{count} day left": "{count}일 남음",
  "{count} days left": "{count}일 남음",
  "{count} hour left": "{count}시간 남음",
  "{count} hours left": "{count}시간 남음",
  "{count} min left": "{count}분 남음",
};

const ja: TranslationPack = {
  "Public record": "公開ガイド",
  "Get started": "はじめる",
  "Sign in": "ログイン",
  "Sign out": "ログアウト",
  Privacy: "プライバシー",
  Safety: "安全",
  Home: "ホーム",
  History: "歴史",
  You: "あなた",
  Main: "メインメニュー",
  Notifications: "通知",
  "Notifications, {count} unread": "未読の通知が{count}件あります",
  "Switch to light mode": "ライトモードに切り替え",
  "Switch to dark mode": "ダークモードに切り替え",
  "Language and region": "言語と地域",
  Loading: "読み込み中",
  Match: "マッチ",
  "Safety Center": "セーフティセンター",
  "AUG / SEOUL": "8月 / ソウル",
  person: "1人",
  "Datehaja home": "Datehajaホーム",
  "New client / 01": "新規 / 01",
  "Client return / 01": "再訪 / 01",
  "Open your account": "アカウントを開く",
  "Welcome back": "おかえりなさい",
  Email: "メール",
  "Already have an account?": "すでにアカウントをお持ちですか？",
  "New here?": "初めてですか？",
  "Create an account": "アカウントを作成",
  "Couldn't sign you in.": "ログインできませんでした。",
  closed: "締切",
  "{count} day left": "残り{count}日",
  "{count} days left": "残り{count}日",
  "{count} hour left": "残り{count}時間",
  "{count} hours left": "残り{count}時間",
  "{count} min left": "残り{count}分",
};

const de: TranslationPack = {
  "Public record": "Öffentliche Information",
  "Get started": "Loslegen",
  "Sign in": "Anmelden",
  "Sign out": "Abmelden",
  Privacy: "Datenschutz",
  Safety: "Sicherheit",
  Home: "Start",
  History: "Geschichte",
  You: "Du",
  Main: "Hauptmenü",
  Notifications: "Benachrichtigungen",
  "Notifications, {count} unread": "{count} ungelesene Benachrichtigungen",
  "Switch to light mode": "Zum hellen Modus wechseln",
  "Switch to dark mode": "Zum dunklen Modus wechseln",
  "Language and region": "Sprache und Region",
  Loading: "Lädt",
  Match: "Match",
  "Safety Center": "Sicherheitsbereich",
  "AUG / SEOUL": "AUG / SEOUL",
  person: "Person",
  "Datehaja home": "Datehaja Startseite",
  "New client / 01": "Neu / 01",
  "Client return / 01": "Rückkehr / 01",
  "Open your account": "Konto eröffnen",
  "Welcome back": "Willkommen zurück",
  Email: "E-Mail",
  "Already have an account?": "Schon ein Konto?",
  "New here?": "Neu hier?",
  "Create an account": "Konto erstellen",
  "Couldn't sign you in.": "Anmeldung fehlgeschlagen.",
  closed: "geschlossen",
  "{count} day left": "noch {count} Tag",
  "{count} days left": "noch {count} Tage",
  "{count} hour left": "noch {count} Stunde",
  "{count} hours left": "noch {count} Stunden",
  "{count} min left": "noch {count} Min.",
};


Object.assign(ko, {
  "Preview of {agent}": "{agent} 미리보기",
  "my Dating Agent": "내 데이트 에이전트",
  "MY OTHER SELF": "또 다른 나",
  "Name pending": "이름 짓는 중",
  Color: "색",
  "rose palette": "로즈 색상",
  "violet palette": "바이올렛 색상",
  "moss palette": "모스 색상",
  "sky palette": "스카이 색상",
  "sunset palette": "선셋 색상",
  "ink palette": "잉크 색상",
  Expression: "표정",
  Gentle: "다정함",
  Bright: "밝음",
  Cool: "시크함",
  Curious: "호기심",
  Hair: "헤어",
  Wave: "웨이브",
  Crop: "크롭",
  Bob: "보브",
  Bun: "번",
  Buzz: "버즈",
  Outfit: "옷",
  Cardigan: "카디건",
  Blazer: "블레이저",
  Hoodie: "후디",
  Starlight: "별빛",
  "Little detail": "포인트",
  "Agent": "에이전트",
  "Loading the date…": "데이트를 불러오는 중…",
  "No date is ready to show yet. Please check back shortly.": "아직 보여드릴 데이트가 없습니다. 잠시 후 다시 확인해 주세요.",
  "Watch a real agent date": "실제 에이전트 데이트 보기",
  "Menu": "메뉴",
  "Theme": "화면 모드",
  "Light": "밝게",
  "Dark": "어둡게",
  None: "없음",
  Glasses: "안경",
  Headphones: "헤드폰",
  "Star clip": "별 핀",
  Scarf: "스카프",
  "My other self": "나의 분신",
  "Your look travels with the agent through dates, transcripts, and debriefs. It is playful identity—not a claim about your real appearance.":
    "이 모습은 데이트, 대화 기록, 리포트까지 에이전트와 함께해요. 실제 외모를 뜻하는 것이 아니라 즐겁게 표현하는 정체성이에요.",
});

Object.assign(ja, {
  "Preview of {agent}": "{agent}のプレビュー",
  "my Dating Agent": "私のデートエージェント",
  "MY OTHER SELF": "もう一人の私",
  "Name pending": "名前を考え中",
  Color: "カラー",
  "rose palette": "ローズカラー",
  "violet palette": "バイオレットカラー",
  "moss palette": "モスカラー",
  "sky palette": "スカイカラー",
  "sunset palette": "サンセットカラー",
  "ink palette": "インクカラー",
  Expression: "表情",
  Gentle: "やさしい",
  Bright: "明るい",
  Cool: "クール",
  Curious: "好奇心",
  Hair: "ヘア",
  Wave: "ウェーブ",
  Crop: "クロップ",
  Bob: "ボブ",
  Bun: "お団子",
  Buzz: "ベリーショート",
  Outfit: "服",
  Cardigan: "カーディガン",
  Blazer: "ブレザー",
  Hoodie: "パーカー",
  Starlight: "スターライト",
  "Little detail": "アクセント",
  "Agent": "エージェント",
  "Loading the date…": "デートを読み込み中…",
  "No date is ready to show yet. Please check back shortly.": "お見せできるデートがまだありません。しばらくしてからご確認ください。",
  "Watch a real agent date": "実際のエージェントデートを見る",
  "Menu": "メニュー",
  "Theme": "表示モード",
  "Light": "ライト",
  "Dark": "ダーク",
  None: "なし",
  Glasses: "メガネ",
  Headphones: "ヘッドホン",
  "Star clip": "星のピン",
  Scarf: "スカーフ",
  "My other self": "私の分身",
  "Your look travels with the agent through dates, transcripts, and debriefs. It is playful identity—not a claim about your real appearance.":
    "この姿はデート、会話記録、レポートまでエージェントと共に移動します。実際の外見を示すものではなく、楽しいアイデンティティです。",
});

Object.assign(de, {
  "Preview of {agent}": "Vorschau von {agent}",
  "my Dating Agent": "mein Dating-Agent",
  "MY OTHER SELF": "MEIN ZWEITES ICH",
  "Name pending": "Name folgt",
  Color: "Farbe",
  "rose palette": "Rosa Farbwelt",
  "violet palette": "Violette Farbwelt",
  "moss palette": "Moosgrüne Farbwelt",
  "sky palette": "Blaue Farbwelt",
  "sunset palette": "Sonnenuntergang-Farbwelt",
  "ink palette": "Tinten-Farbwelt",
  Expression: "Ausdruck",
  Gentle: "Sanft",
  Bright: "Fröhlich",
  Cool: "Gelassen",
  Curious: "Neugierig",
  Hair: "Haare",
  Wave: "Wellen",
  Crop: "Kurz",
  Bob: "Bobfrisur",
  Bun: "Dutt",
  Buzz: "Buzzcut",
  Outfit: "Kleidung",
  Cardigan: "Strickjacke",
  Blazer: "Sakko",
  Hoodie: "Kapuzenpullover",
  Starlight: "Sternenlicht",
  "Little detail": "Detail",
  "Agent": "Agent",
  "Loading the date…": "Date wird geladen…",
  "No date is ready to show yet. Please check back shortly.": "Es ist noch kein Date zu sehen. Bitte schau gleich noch einmal vorbei.",
  "Watch a real agent date": "Ein echtes Agent-Date ansehen",
  "Menu": "Menü",
  "Theme": "Darstellung",
  "Light": "Hell",
  "Dark": "Dunkel",
  None: "Keins",
  Glasses: "Brille",
  Headphones: "Kopfhörer",
  "Star clip": "Sternspange",
  Scarf: "Schal",
  "My other self": "Mein zweites Ich",
  "Your look travels with the agent through dates, transcripts, and debriefs. It is playful identity—not a claim about your real appearance.":
    "Dein Look begleitet den Agenten durch Dates, Gespräche und Berichte. Er ist eine spielerische Identität, keine Aussage über dein echtes Aussehen.",
});

// French, Dutch and Swedish deliberately share the same complete key surface.
// Keeping every phrase local makes the fallback behaviour deterministic and
// lets tests prove that a locale never becomes a half-English screen.
const fr: TranslationPack = Object.fromEntries(
  Object.keys(de).map((key) => [key, key]),
);
const nl: TranslationPack = Object.fromEntries(
  Object.keys(de).map((key) => [key, key]),
);
const sv: TranslationPack = Object.fromEntries(
  Object.keys(de).map((key) => [key, key]),
);

Object.assign(fr, {
  "Upload failed.": "Le téléversement a échoué.",
  "Photo saved. Choose when a match can see it below.":
    "Photo enregistrée. Choisissez ci-dessous quand elle sera visible.",
  "Honest details lead to fewer awkward surprises and better matches. Private post-date feedback checks profile accuracy, not attractiveness.":
    "Des informations sincères évitent les surprises et améliorent les rencontres. Les avis privés vérifient l’exactitude du profil, pas l’attirance.",
  "‘No preference’ removes this factor from matching.":
    "« Sans préférence » retire ce critère de la mise en relation.",
  "Optional personal taste, never an appearance score.":
    "Goût personnel facultatif, jamais une note d’apparence.",
  "Photo privacy saved.": "Visibilité de la photo enregistrée.",
  "Public record": "Informations publiques",
  "Get started": "Commencer",
  "Sign in": "Se connecter",
  "Sign out": "Se déconnecter",
  Privacy: "Confidentialité",
  Safety: "Sécurité",
  Home: "Accueil",
  History: "Histoire",
  You: "Vous",
  Main: "Menu principal",
  Notifications: "Notifications",
  "Notifications, {count} unread": "{count} notifications non lues",
  "Switch to light mode": "Passer au mode clair",
  "Switch to dark mode": "Passer au mode sombre",
  "Language and region": "Langue et région",
  Loading: "Chargement",
  Match: "Matcher",
  "Safety Center": "Centre de sécurité",
  "AUG / SEOUL": "AOÛT / SÉOUL",
  person: "personne",
  "Datehaja home": "Accueil Datehaja",
  "New client / 01": "Nouveau client / 01",
  "Client return / 01": "Retour client / 01",
  "Open your account": "Ouvrir votre compte",
  "Welcome back": "Bon retour",
  Email: "E-mail",
  "Already have an account?": "Vous avez déjà un compte ?",
  "New here?": "Nouveau ici ?",
  "Create an account": "Créer un compte",
  "Couldn't sign you in.": "Connexion impossible.",
  closed: "clos",
  "{count} day left": "encore {count} jour",
  "{count} days left": "encore {count} jours",
  "{count} hour left": "encore {count} heure",
  "{count} hours left": "encore {count} heures",
  "{count} min left": "encore {count} min",
});

Object.assign(nl, {
  "Upload failed.": "Upload mislukt.",
  "Photo saved. Choose when a match can see it below.":
    "Foto opgeslagen. Kies hieronder wanneer een match die ziet.",
  "Honest details lead to fewer awkward surprises and better matches. Private post-date feedback checks profile accuracy, not attractiveness.":
    "Eerlijke informatie voorkomt verrassingen en verbetert matches. Privéfeedback controleert profieljuistheid, niet aantrekkelijkheid.",
  "‘No preference’ removes this factor from matching.":
    "‘Maakt niet uit’ haalt deze factor uit de matching.",
  "Optional personal taste, never an appearance score.":
    "Optionele persoonlijke smaak, nooit een uiterlijksscore.",
  "Public record": "Openbare informatie",
  "Get started": "Beginnen",
  "Sign in": "Inloggen",
  "Sign out": "Uitloggen",
  Privacy: "Privacy",
  Safety: "Veiligheid",
  Home: "Home",
  History: "Geschiedenis",
  You: "Jij",
  Main: "Hoofdmenu",
  Notifications: "Meldingen",
  "Notifications, {count} unread": "{count} ongelezen meldingen",
  "Switch to light mode": "Naar lichte modus",
  "Switch to dark mode": "Naar donkere modus",
  "Language and region": "Taal en regio",
  Loading: "Laden",
  Match: "Koppelen",
  "Safety Center": "Veiligheidscentrum",
  "AUG / SEOUL": "AUG / SEOUL",
  person: "persoon",
  "Datehaja home": "Datehaja-home",
  "New client / 01": "Nieuwe klant / 01",
  "Client return / 01": "Terugkerende klant / 01",
  "Open your account": "Open je account",
  "Welcome back": "Welkom terug",
  Email: "E-mail",
  "Already have an account?": "Heb je al een account?",
  "New here?": "Nieuw hier?",
  "Create an account": "Account maken",
  "Couldn't sign you in.": "Inloggen is mislukt.",
  closed: "gesloten",
  "{count} day left": "nog {count} dag",
  "{count} days left": "nog {count} dagen",
  "{count} hour left": "nog {count} uur",
  "{count} hours left": "nog {count} uur",
  "{count} min left": "nog {count} min",
});

Object.assign(sv, {
  "Upload failed.": "Uppladdningen misslyckades.",
  "Photo saved. Choose when a match can see it below.":
    "Bilden är sparad. Välj nedan när en matchning får se den.",
  "Honest details lead to fewer awkward surprises and better matches. Private post-date feedback checks profile accuracy, not attractiveness.":
    "Ärliga uppgifter minskar överraskningar och ger bättre matchningar. Privat feedback gäller profilens korrekthet, inte attraktivitet.",
  "‘No preference’ removes this factor from matching.":
    "”Spelar ingen roll” tar bort faktorn från matchningen.",
  "Optional personal taste, never an appearance score.":
    "Valfri personlig smak, aldrig ett utseendebetyg.",
  "Public record": "Offentlig information",
  "Get started": "Kom igång",
  "Sign in": "Logga in",
  "Sign out": "Logga ut",
  Privacy: "Integritet",
  Safety: "Säkerhet",
  Home: "Hem",
  History: "Historia",
  You: "Du",
  Main: "Huvudmeny",
  Notifications: "Aviseringar",
  "Notifications, {count} unread": "{count} olästa aviseringar",
  "Switch to light mode": "Byt till ljust läge",
  "Switch to dark mode": "Byt till mörkt läge",
  "Language and region": "Språk och region",
  Loading: "Läser in",
  Match: "Matcha",
  "Safety Center": "Säkerhetscenter",
  "AUG / SEOUL": "AUG / SEOUL",
  person: "person",
  "Datehaja home": "Datehaja hem",
  "New client / 01": "Ny kund / 01",
  "Client return / 01": "Återkommande kund / 01",
  "Open your account": "Öppna ditt konto",
  "Welcome back": "Välkommen tillbaka",
  Email: "E-post",
  "Already have an account?": "Har du redan ett konto?",
  "New here?": "Ny här?",
  "Create an account": "Skapa ett konto",
  "Couldn't sign you in.": "Det gick inte att logga in.",
  closed: "stängd",
  "{count} day left": "{count} dag kvar",
  "{count} days left": "{count} dagar kvar",
  "{count} hour left": "{count} timme kvar",
  "{count} hours left": "{count} timmar kvar",
  "{count} min left": "{count} min kvar",
});

/* Agent dating pivot — core journey copy. English locales intentionally use
   the source strings; the six translated markets get a human-readable launch
   surface rather than a half-localised navigation shell. */
Object.assign(ko, {
  "Your dating agent": "나의 데이트 에이전트",
  "Too busy for another first date?": "소개팅도 데이트도 바쁜 당신에게",
  "My second self": "내 분신이",
  "dates for me.": "대신 데이트해요.",
  "It goes on the date as you, then comes home with an honest read. You decide whether to make it real.":
    "나로서 데이트하고 돌아와, 솔직한 리포트를 전해요. 실제 만남은 당신이 결정해요.",
  "Create my Dating Agent": "내 데이트 에이전트 만들기",
  "Watch the agents meet": "에이전트 만남 보기",
  "Your Dating Agent goes first.": "내 데이트 에이전트가 먼저 가요.",
  Brief: "브리핑",
  "Agent date": "에이전트 데이트",
  "Private read": "비공개 리포트",
  "Your call": "내 결정",
  "YOUR DATING AGENT'S PRIVATE READ": "내 데이트 에이전트의 비공개 리포트",
  "LIVE / SIMULATION": "실시간 / 시뮬레이션",
  "I get playful once I feel safe.":
    "나는 마음이 편해지면 장난꾸러기가 돼.",
  "I go quiet when I'm happy, actually.":
    "나는 좋으면 오히려 조용해지는 타입이야.",
  "Your Dating Agent can say:": "내 데이트 에이전트는 말할 수 있어요.",
  "don't meet them.": "그 사람은 만나지 마요.",
  "An interpretation, not a score": "점수가 아닌 해석",
  "Their answer remains sealed": "상대의 답변은 계속 비공개",
  "Worth meeting": "만나보길 추천해요",
  "The date, as it happened": "그날의 데이트 이야기",
  "The last showing at a small documentary cinema":
    "작은 다큐 영화관의 마지막 상영",
  "How it began": "처음 마주한 순간",
  "As it deepened": "대화가 깊어질 때",
  "The parting words": "헤어지기 전 마지막 말",
  "I stay through the end credits, every single time. Do you?":
    "나는 크레딧이 끝날 때까지 자리를 지켜. 너는 어때?",
  "I hate small talk — but ask me one good question and I light right up.":
    "나는 스몰토크는 질색인데, 좋은 질문 하나면 눈이 반짝여.",
  "Honestly? I think we'd really like each other.":
    "솔직히? 우리 둘, 진짜 잘 맞을 것 같아.",
  "You'd like this one. When I said I go quiet when I'm worried about being misread, Sol didn't rush to fix it — they leaned in. Meet them.":
    "이 사람, 네 마음에 들 거야. 오해받을까 봐 조용해지는 편이라고 말했더니, Sol은 그걸 고치려 들지 않고 오히려 귀를 기울이더라. 만나봐.",
  "I want warmth without having to perform confidence.":
    "자신감 있는 척하지 않아도 따뜻한 관계를 원해요.",
  "virtual world": "가상 세계",
  "PRIVATE / FOR YOU": "비공개 / 나만 보기",
  "I noticed a real spark.": "분명한 설렘이 있었어요.",
  "But ask about the pace.": "다만 관계의 속도는 물어보세요.",
  YOU: "나",
  YES: "동의",
  THEM: "상대",
  "contact locked": "연락처 잠김",
  "{count} moments": "{count}개의 장면",
  "my second self dates for me.": "내 분신이 대신 데이트해요.",
  "Create one AI second self. It goes on the date as you, meets someone else's, and writes home privately. Contact opens only when both people say yes.": "AI 분신을 하나 만들어요. 나로서 데이트에 나가 다른 사람의 분신을 만나고, 돌아와 나에게만 이야기해요. 연락처는 두 사람이 모두 좋다고 할 때만 열려요.",
  "What I'd look for next": "다음엔 이런 사람을 볼까 해",
  "Should I change who I look for?": "내가 찾는 사람, 바꿔볼까?",
  "Personality I look for": "내가 보는 성향",
  "How much it matters": "얼마나 중요한지",
  "What I am looking for": "내가 원하는 관계",
  "Nothing changes until you say so. Your age, distance, language and budget stay exactly where you set them.": "네가 그러라고 해야 바뀌어. 나이, 거리, 언어, 예산은 네가 정한 그대로야.",
  "Yes, look for that →": "응, 그렇게 찾아줘 →",
  "Leave it as it is": "지금 그대로 둬",
  "Quiet feels safe to both": "둘 다 침묵을 편안해해요",
  "Different social pace": "서로 다른 사교 속도",
  Human: "사람",
});

Object.assign(ja, {
  "Your dating agent": "あなたのデートエージェント",
  "Too busy for another first date?": "初デートの時間も惜しいあなたへ",
  "My second self": "私の分身が",
  "dates for me.": "代わりにデートします。",
  "It goes on the date as you, then comes home with an honest read. You decide whether to make it real.":
    "分身があなたとしてデートし、帰ってきて率直なレポートを伝えます。実際に会うかは、あなたが決めます。",
  "Create my Dating Agent": "デートエージェントを作る",
  "Watch the agents meet": "エージェントの出会いを見る",
  "Your Dating Agent goes first.": "デートエージェントが先に会う。",
  Brief: "ブリーフィング",
  "Agent date": "エージェントのデート",
  "Private read": "非公開レポート",
  "Your call": "あなたの決断",
  "YOUR DATING AGENT'S PRIVATE READ": "あなたのデートエージェントの非公開レポート",
  "LIVE / SIMULATION": "ライブ / シミュレーション",
  "I get playful once I feel safe.":
    "私、安心すると急に茶目っ気が出るんだ。",
  "I go quiet when I'm happy, actually.":
    "私、うれしいときほど静かになるタイプなんだ。",
  "Your Dating Agent can say:": "あなたのデートエージェントは言える：",
  "don't meet them.": "会わないほうがいい。",
  "An interpretation, not a score": "点数ではなく、ひとつの解釈",
  "Their answer remains sealed": "相手の回答は非公開のまま",
  "Worth meeting": "会ってみる価値あり",
  "The date, as it happened": "デートの一部始終",
  "The last showing at a small documentary cinema":
    "小さなドキュメンタリー映画館、最終上映",
  "How it began": "出会いの瞬間",
  "As it deepened": "会話が深まる頃",
  "The parting words": "別れ際のひとこと",
  "I stay through the end credits, every single time. Do you?":
    "私、エンドロールが終わるまで必ず席を立たないんだ。そっちは?",
  "I hate small talk — but ask me one good question and I light right up.":
    "私、世間話は苦手。でも、いい質問がひとつあれば目が輝くよ。",
  "Honestly? I think we'd really like each other.":
    "正直に言うと、私たち、本当に気が合うと思う。",
  "You'd like this one. When I said I go quiet when I'm worried about being misread, Sol didn't rush to fix it — they leaned in. Meet them.":
    "この人、きっと気に入るよ。誤解されそうなときは静かになるって話したら、Solは直そうとせず、むしろ耳を傾けてくれた。会ってみて。",
  "I want warmth without having to perform confidence.":
    "自信を演じなくても感じられる温かさがほしい。",
  "virtual world": "仮想世界",
  "PRIVATE / FOR YOU": "非公開 / あなただけ",
  "I noticed a real spark.": "確かなときめきを感じました。",
  "But ask about the pace.": "ただ、進むペースは確認して。",
  YOU: "あなた",
  YES: "はい",
  THEM: "相手",
  "contact locked": "連絡先はロック中",
  "{count} moments": "{count}場面",
  "my second self dates for me.": "私の分身が代わりにデートします。",
  "Create one AI second self. It goes on the date as you, meets someone else's, and writes home privately. Contact opens only when both people say yes.": "AIの分身をひとつ作ります。あなたとしてデートに出かけ、別の誰かの分身と会い、帰ってあなただけに話します。連絡先は二人とも「はい」と答えたときだけ開きます。",
  "What I'd look for next": "次はこんな人を探そうかな",
  "Should I change who I look for?": "探す相手、変えてみようか？",
  "Personality I look for": "探している性格",
  "How much it matters": "どれくらい重視するか",
  "What I am looking for": "求めている関係",
  "Nothing changes until you say so. Your age, distance, language and budget stay exactly where you set them.": "あなたが言うまで何も変わりません。年齢、距離、言語、予算はあなたが決めたままです。",
  "Yes, look for that →": "うん、そう探して →",
  "Leave it as it is": "今のままで",
  "Quiet feels safe to both": "ふたりとも沈黙が心地よい",
  "Different social pace": "異なる社交のペース",
  Human: "本人",
});

Object.assign(de, {
  "Your dating agent": "Dein Dating-Agent",
  "Too busy for another first date?": "Zu beschäftigt fürs nächste erste Date?",
  "My second self": "Mein zweites Ich",
  "dates for me.": "datet für mich.",
  "It goes on the date as you, then comes home with an honest read. You decide whether to make it real.":
    "Er geht als du auf das Date und kommt mit einer ehrlichen Einschätzung zurück. Du entscheidest, ob ihr euch wirklich trefft.",
  "Create my Dating Agent": "Meinen Dating-Agenten erstellen",
  "Watch the agents meet": "Agenten beim Treffen ansehen",
  "Your Dating Agent goes first.": "Dein Dating-Agent geht zuerst.",
  Brief: "Briefing",
  "Agent date": "Agent-Date",
  "Private read": "Privater Bericht",
  "Your call": "Deine Wahl",
  "YOUR DATING AGENT'S PRIVATE READ": "PRIVATE EINSCHÄTZUNG DEINES DATING-AGENTEN",
  "LIVE / SIMULATION": "LIVE / SIMULATIONSMODUS",
  "I get playful once I feel safe.":
    "Ich werde verspielt, sobald ich mich sicher fühle.",
  "I go quiet when I'm happy, actually.":
    "Ich werde still, wenn ich glücklich bin — ehrlich.",
  "Your Dating Agent can say:": "Dein Dating-Agent kann sagen:",
  "don't meet them.": "Triff diese Person nicht.",
  "An interpretation, not a score": "Eine Einordnung, keine Punktzahl",
  "Their answer remains sealed":
    "Die Antwort der anderen Person bleibt versiegelt",
  "Worth meeting": "Ein Treffen lohnt sich",
  "The date, as it happened": "So lief das Date",
  "The last showing at a small documentary cinema":
    "Die letzte Vorstellung in einem kleinen Dokumentarfilmkino",
  "How it began": "Der Anfang",
  "As it deepened": "Als es tiefer ging",
  "The parting words": "Die letzten Worte",
  "I stay through the end credits, every single time. Do you?":
    "Ich bleibe jedes Mal bis zum Ende des Abspanns sitzen. Und du?",
  "I hate small talk — but ask me one good question and I light right up.":
    "Ich hasse Smalltalk — aber stell mir eine gute Frage, und meine Augen leuchten.",
  "Honestly? I think we'd really like each other.":
    "Ehrlich? Ich glaube, wir beide würden uns richtig mögen.",
  "You'd like this one. When I said I go quiet when I'm worried about being misread, Sol didn't rush to fix it — they leaned in. Meet them.":
    "Die Person wird dir gefallen. Als ich erzählte, dass ich still werde, wenn ich fürchte, missverstanden zu werden, wollte Sol nichts reparieren — Sol hat zugehört. Trefft euch.",
  "I want warmth without having to perform confidence.":
    "Ich wünsche mir Wärme, ohne Selbstsicherheit vorspielen zu müssen.",
  "virtual world": "virtuelle Welt",
  "PRIVATE / FOR YOU": "PRIVAT / NUR FÜR DICH",
  "I noticed a real spark.": "Da war ein echter Funke.",
  "But ask about the pace.": "Fragt aber nach dem Tempo.",
  YOU: "DU",
  YES: "JA",
  THEM: "GEGENÜBER",
  "contact locked": "Kontakt gesperrt",
  "{count} moments": "{count} Momente",
  "my second self dates for me.": "mein zweites Ich datet für mich.",
  "Create one AI second self. It goes on the date as you, meets someone else's, and writes home privately. Contact opens only when both people say yes.": "Erstelle ein zweites Ich aus KI. Es geht als du auf das Date, trifft das zweite Ich eines anderen und berichtet dir danach privat. Kontakt entsteht nur, wenn beide zustimmen.",
  "What I'd look for next": "Wonach ich als Nächstes suchen würde",
  "Should I change who I look for?": "Soll ich ändern, nach wem ich suche?",
  "Personality I look for": "Persönlichkeit, auf die ich achte",
  "How much it matters": "Wie wichtig das ist",
  "What I am looking for": "Was ich suche",
  "Nothing changes until you say so. Your age, distance, language and budget stay exactly where you set them.": "Nichts ändert sich, bis du es sagst. Alter, Entfernung, Sprache und Budget bleiben genau so, wie du sie gesetzt hast.",
  "Yes, look for that →": "Ja, such danach →",
  "Leave it as it is": "Lass es, wie es ist",
  "Quiet feels safe to both": "Stille fühlt sich für beide sicher an",
  "Different social pace": "Unterschiedliches soziales Tempo",
  Human: "Mensch",
});

Object.assign(fr, {
  "Your dating agent": "Votre agent de rencontre",
  "Too busy for another first date?":
    "Trop occupé pour un autre premier rendez-vous ?",
  "My second self": "Mon autre moi",
  "dates for me.": "y va à ma place.",
  "It goes on the date as you, then comes home with an honest read. You decide whether to make it real.":
    "Il va au rendez-vous en tant que vous, puis vous livre un avis sincère. Vous décidez ensuite de vous rencontrer vraiment.",
  "Create my Dating Agent": "Créer mon Agent de rencontre",
  "Watch the agents meet": "Voir les agents se rencontrer",
  "Your Dating Agent goes first.": "Votre Agent de rencontre y va d'abord.",
  Brief: "Brief",
  "Agent date": "Rendez-vous des agents",
  "Private read": "Rapport privé",
  "Your call": "Votre décision",
  "YOUR DATING AGENT'S PRIVATE READ": "AVIS PRIVÉ DE VOTRE AGENT DE RENCONTRE",
  "LIVE / SIMULATION": "EN DIRECT / SIMULATION",
  "I get playful once I feel safe.":
    "Je deviens joueur dès que je me sens en sécurité.",
  "I go quiet when I'm happy, actually.":
    "Je deviens silencieux quand je suis heureux, en fait.",
  "Your Dating Agent can say:": "Votre Agent de rencontre peut dire :",
  "don't meet them.": "Ne les rencontrez pas.",
  "An interpretation, not a score": "Une interprétation, pas une note",
  "Their answer remains sealed": "La réponse de l'autre personne reste scellée",
  "Worth meeting": "Une rencontre vaut la peine",
  "The date, as it happened": "Le rendez-vous, tel qu'il s'est passé",
  "The last showing at a small documentary cinema":
    "La dernière séance d'un petit cinéma documentaire",
  "How it began": "Les premiers instants",
  "As it deepened": "Quand ça s'approfondit",
  "The parting words": "Les derniers mots",
  "I stay through the end credits, every single time. Do you?":
    "Je reste jusqu'à la fin du générique, à chaque fois. Et toi ?",
  "I hate small talk — but ask me one good question and I light right up.":
    "Je déteste le small talk — mais pose-moi une bonne question et je m'illumine.",
  "Honestly? I think we'd really like each other.":
    "Honnêtement ? Je crois qu'on se plairait vraiment.",
  "You'd like this one. When I said I go quiet when I'm worried about being misread, Sol didn't rush to fix it — they leaned in. Meet them.":
    "Cette personne va te plaire. Quand j'ai parlé de mon silence quand je crains d'être mal compris, Sol n'a rien voulu corriger — Sol s'est penché pour écouter. Rencontrez-vous.",
  "I want warmth without having to perform confidence.":
    "Je veux de la chaleur sans devoir jouer la confiance.",
  "virtual world": "monde virtuel",
  "PRIVATE / FOR YOU": "PRIVÉ / POUR VOUS",
  "I noticed a real spark.": "J'ai senti une vraie étincelle.",
  "But ask about the pace.": "Mais parlez du rythme.",
  YOU: "VOUS",
  YES: "OUI",
  THEM: "L'AUTRE",
  "contact locked": "contact verrouillé",
  "{count} moments": "{count} instants",
  "my second self dates for me.": "mon autre moi y va à ma place.",
  "Create one AI second self. It goes on the date as you, meets someone else's, and writes home privately. Contact opens only when both people say yes.": "Créez un autre vous, en IA. Il va au rendez-vous à votre place, rencontre celui de quelqu’un d’autre, puis vous en parle en privé. Les coordonnées ne s’ouvrent que si les deux disent oui.",
  "What I'd look for next": "Ce que je chercherais ensuite",
  "Should I change who I look for?": "Je change qui je cherche ?",
  "Personality I look for": "Le tempérament que je cherche",
  "How much it matters": "Son importance",
  "What I am looking for": "Ce que je cherche",
  "Nothing changes until you say so. Your age, distance, language and budget stay exactly where you set them.": "Rien ne change tant que tu ne le dis pas. Âge, distance, langue et budget restent exactement comme tu les as réglés.",
  "Yes, look for that →": "Oui, cherche ça →",
  "Leave it as it is": "Laisse comme c’est",
  "Quiet feels safe to both": "Le silence rassure les deux",
  "Different social pace": "Rythmes sociaux différents",
  Human: "Humain",
});

Object.assign(nl, {
  "Your dating agent": "Jouw datingagent",
  "Too busy for another first date?": "Te druk voor nóg een eerste date?",
  "My second self": "Mijn tweede zelf",
  "dates for me.": "datet voor mij.",
  "It goes on the date as you, then comes home with an honest read. You decide whether to make it real.":
    "Hij gaat als jou op date en komt terug met een eerlijk oordeel. Jij beslist of jullie echt afspreken.",
  "Create my Dating Agent": "Mijn datingagent maken",
  "Watch the agents meet": "Bekijk de ontmoeting",
  "Your Dating Agent goes first.": "Je datingagent gaat eerst.",
  Brief: "Briefing",
  "Agent date": "Agentdate",
  "Private read": "Privéverslag",
  "Your call": "Jouw keuze",
  "YOUR DATING AGENT'S PRIVATE READ": "PRIVÉVERSLAG VAN JE DATINGAGENT",
  "LIVE / SIMULATION": "LIVE / SIMULATIE",
  "I get playful once I feel safe.":
    "Ik word speels zodra ik me veilig voel.",
  "I go quiet when I'm happy, actually.":
    "Ik word juist stil als ik blij ben.",
  "Your Dating Agent can say:": "Jouw datingagent kan zeggen:",
  "don't meet them.": "Ontmoet diegene niet.",
  "An interpretation, not a score": "Een interpretatie, geen score",
  "Their answer remains sealed": "Het antwoord van de ander blijft verzegeld",
  "Worth meeting": "Het waard om te ontmoeten",
  "The date, as it happened": "Zo verliep de date",
  "The last showing at a small documentary cinema":
    "De laatste voorstelling in een kleine documentairebioscoop",
  "How it began": "Het begin",
  "As it deepened": "Toen het dieper ging",
  "The parting words": "De laatste woorden",
  "I stay through the end credits, every single time. Do you?":
    "Ik blijf elke keer tot het einde van de aftiteling zitten. En jij?",
  "I hate small talk — but ask me one good question and I light right up.":
    "Ik haat small talk — maar stel me één goede vraag en ik straal.",
  "Honestly? I think we'd really like each other.":
    "Eerlijk? Ik denk dat wij elkaar echt zouden mogen.",
  "You'd like this one. When I said I go quiet when I'm worried about being misread, Sol didn't rush to fix it — they leaned in. Meet them.":
    "Deze ga je leuk vinden. Toen ik zei dat ik stil word als ik bang ben verkeerd begrepen te worden, wilde Sol niets oplossen — Sol boog juist naar voren. Ga die ontmoeting aan.",
  "I want warmth without having to perform confidence.":
    "Ik wil warmte zonder zelfvertrouwen te hoeven spelen.",
  "virtual world": "virtuele wereld",
  "PRIVATE / FOR YOU": "PRIVÉ / VOOR JOU",
  "I noticed a real spark.": "Ik voelde een echte vonk.",
  "But ask about the pace.": "Vraag wel naar het tempo.",
  YOU: "JIJ",
  YES: "JA",
  THEM: "DE ANDER",
  "contact locked": "contact vergrendeld",
  "{count} moments": "{count} momenten",
  "my second self dates for me.": "mijn tweede zelf datet voor mij.",
  "Create one AI second self. It goes on the date as you, meets someone else's, and writes home privately. Contact opens only when both people say yes.": "Maak één AI-tweede-zelf. Het gaat als jou op date, ontmoet dat van iemand anders en vertelt het jou daarna privé. Contact opent alleen als beiden ja zeggen.",
  "What I'd look for next": "Waar ik hierna naar zou zoeken",
  "Should I change who I look for?": "Zal ik veranderen naar wie ik zoek?",
  "Personality I look for": "Het karakter waar ik op let",
  "How much it matters": "Hoeveel dat telt",
  "What I am looking for": "Wat ik zoek",
  "Nothing changes until you say so. Your age, distance, language and budget stay exactly where you set them.": "Er verandert niets tot jij het zegt. Leeftijd, afstand, taal en budget blijven precies zoals jij ze hebt gezet.",
  "Yes, look for that →": "Ja, zoek daarnaar →",
  "Leave it as it is": "Laat het zoals het is",
  "Quiet feels safe to both": "Stilte voelt voor beiden veilig",
  "Different social pace": "Ander sociaal tempo",
  Human: "Mens",
});

Object.assign(sv, {
  "Your dating agent": "Din dejtingagent",
  "Too busy for another first date?": "För upptagen för ännu en första dejt?",
  "My second self": "Mitt andra jag",
  "dates for me.": "dejtar åt mig.",
  "It goes on the date as you, then comes home with an honest read. You decide whether to make it real.":
    "Den går på dejten som du och kommer tillbaka med en ärlig bedömning. Du avgör om ni ska ses på riktigt.",
  "Create my Dating Agent": "Skapa min dejtingagent",
  "Watch the agents meet": "Se agenterna mötas",
  "Your Dating Agent goes first.": "Din dejtingagent går först.",
  Brief: "Brief",
  "Agent date": "Agentdejt",
  "Private read": "Privat rapport",
  "Your call": "Ditt beslut",
  "YOUR DATING AGENT'S PRIVATE READ": "DIN DEJTINGAGENTS PRIVATA OMDÖME",
  "LIVE / SIMULATION": "LIVE / SIMULERING",
  "I get playful once I feel safe.":
    "Jag blir lekfull först när det känns tryggt.",
  "I go quiet when I'm happy, actually.":
    "Jag blir faktiskt tyst av lycka.",
  "Your Dating Agent can say:": "Din dejtingagent kan säga:",
  "don't meet them.": "Träffa dem inte.",
  "An interpretation, not a score": "En tolkning, inte ett betyg",
  "Their answer remains sealed": "Den andras svar förblir förseglat",
  "Worth meeting": "Värd att träffa",
  "The date, as it happened": "Så gick dejten",
  "The last showing at a small documentary cinema":
    "Sista visningen på en liten dokumentärbiograf",
  "How it began": "Början",
  "As it deepened": "När det djupnade",
  "The parting words": "De sista orden",
  "I stay through the end credits, every single time. Do you?":
    "Jag sitter kvar till slutet av eftertexterna, varenda gång. Och du?",
  "I hate small talk — but ask me one good question and I light right up.":
    "Jag hatar kallprat — men ställ en bra fråga så lyser jag upp.",
  "Honestly? I think we'd really like each other.":
    "Ärligt? Jag tror att vi två verkligen skulle gilla varandra.",
  "You'd like this one. When I said I go quiet when I'm worried about being misread, Sol didn't rush to fix it — they leaned in. Meet them.":
    "Den här kommer du att gilla. När jag berättade att jag blir tyst när jag är rädd att bli missförstådd försökte Sol inte fixa det — Sol lutade sig närmare. Träffas.",
  "I want warmth without having to perform confidence.":
    "Jag vill ha värme utan att behöva spela självsäker.",
  "virtual world": "virtuell värld",
  "PRIVATE / FOR YOU": "PRIVAT / FÖR DIG",
  "I noticed a real spark.": "Jag såg en äkta gnista.",
  "But ask about the pace.": "Men fråga om tempot.",
  YOU: "DU",
  YES: "JA",
  THEM: "DEN ANDRA",
  "contact locked": "kontakt låst",
  "{count} moments": "{count} ögonblick",
  "my second self dates for me.": "mitt andra jag dejtar åt mig.",
  "Create one AI second self. It goes on the date as you, meets someone else's, and writes home privately. Contact opens only when both people say yes.": "Skapa ett andra jag av AI. Det går på dejten som du, möter någon annans och berättar sedan för dig i enrum. Kontakt öppnas bara när båda säger ja.",
  "What I'd look for next": "Vad jag skulle leta efter härnäst",
  "Should I change who I look for?": "Ska jag ändra vem jag letar efter?",
  "Personality I look for": "Personligheten jag letar efter",
  "How much it matters": "Hur mycket det väger",
  "What I am looking for": "Vad jag söker",
  "Nothing changes until you say so. Your age, distance, language and budget stay exactly where you set them.": "Inget ändras förrän du säger till. Ålder, avstånd, språk och budget står kvar precis som du satte dem.",
  "Yes, look for that →": "Ja, leta efter det →",
  "Leave it as it is": "Låt det vara",
  "Quiet feels safe to both": "Tystnad känns trygg för båda",
  "Different social pace": "Olika socialt tempo",
  Human: "Person",
});

Object.assign(ko, {
  "Waiting on you": "답변을 기다리는 중",
  "It's a date": "데이트가 확정됐어요",
  Open: "열림",
});

Object.assign(ja, {
  "Upload failed.": "アップロードできませんでした。",
  "Photo saved. Choose when a match can see it below.":
    "写真を保存しました。公開タイミングを選んでください。",
  "Honest details lead to fewer awkward surprises and better matches. Private post-date feedback checks profile accuracy, not attractiveness.":
    "正直な情報は気まずい驚きを減らし、より良い出会いにつながります。レビューは魅力度ではなくプロフィールの正確さを確認します。",
  "‘No preference’ removes this factor from matching.":
    "「こだわらない」を選ぶと、この項目はマッチングに使われません。",
  "Optional personal taste, never an appearance score.":
    "任意の好みであり、外見の点数には使いません。",
  "Waiting on you": "あなたの回答待ち",
  "It's a date": "デートが決まりました",
  Open: "空き",
});

Object.assign(de, {
  "Upload failed.": "Upload fehlgeschlagen.",
  "Photo saved. Choose when a match can see it below.":
    "Foto gespeichert. Wähle unten, wann ein Match es sehen darf.",
  "Honest details lead to fewer awkward surprises and better matches. Private post-date feedback checks profile accuracy, not attractiveness.":
    "Ehrliche Angaben vermeiden unangenehme Überraschungen und verbessern Matches. Privates Feedback prüft Profilgenauigkeit, nicht Attraktivität.",
  "‘No preference’ removes this factor from matching.":
    "„Egal“ entfernt diesen Faktor aus dem Matching.",
  "Optional personal taste, never an appearance score.":
    "Optionaler persönlicher Geschmack, niemals eine Aussehensnote.",
  "Waiting on you": "Wartet auf dich",
  "It's a date": "Das Date steht",
  Open: "Offen",
});

Object.assign(fr, {
  "Waiting on you": "En attente de votre réponse",
  "It's a date": "Le rendez-vous est confirmé",
  Open: "Libre",
});

Object.assign(nl, {
  "Waiting on you": "Wacht op jou",
  "It's a date": "De date staat",
  Open: "Open",
});

Object.assign(sv, {
  "Waiting on you": "Väntar på dig",
  "It's a date": "Dejten är klar",
  Open: "Öppen",
});

Object.assign(ko, {
  "Everything Datehaja has told you, newest first.":
    "Datehaja가 전한 모든 소식을 최신순으로 보여드립니다.",
  "Mark all read": "모두 읽음",
  "Nothing yet": "아직 알림이 없어요",
  "When a date plan lands, is confirmed, or changes, you'll see it here.":
    "데이트 계획이 도착하거나 확정·변경되면 이곳에 표시됩니다.",
  "Been and gone": "완료",
  Cancelled: "취소됨",
  "Didn't fill": "성사되지 않음",
  "Didn't work out": "진행 실패",
  "Waiting on them": "상대방 응답 대기",
  "You passed": "거절함",
  "Being planned": "계획 중",
  "You withdrew": "수락 철회",
  "In progress": "진행 중",
});
Object.assign(ja, {
  "Everything Datehaja has told you, newest first.":
    "Datehajaからのお知らせを新しい順に表示します。",
  "Mark all read": "すべて既読にする",
  "Nothing yet": "まだ通知はありません",
  "When a date plan lands, is confirmed, or changes, you'll see it here.":
    "デートプランが届いたとき、確定・変更されたときにここへ表示されます。",
  "Been and gone": "完了",
  Cancelled: "キャンセル済み",
  "Didn't fill": "成立せず",
  "Didn't work out": "完了できず",
  "Waiting on them": "相手の回答待ち",
  "You passed": "見送り済み",
  "Being planned": "計画中",
  "You withdrew": "承諾を撤回",
  "In progress": "進行中",
});
Object.assign(de, {
  "Everything Datehaja has told you, newest first.":
    "Alle Nachrichten von Datehaja, die neuesten zuerst.",
  "Mark all read": "Alle als gelesen markieren",
  "Nothing yet": "Noch nichts",
  "When a date plan lands, is confirmed, or changes, you'll see it here.":
    "Wenn ein Date-Plan ankommt, bestätigt oder geändert wird, siehst du es hier.",
  "Been and gone": "Abgeschlossen",
  Cancelled: "Abgesagt",
  "Didn't fill": "Nicht zustande gekommen",
  "Didn't work out": "Nicht geklappt",
  "Waiting on them": "Warten auf die andere Person",
  "You passed": "Du hast abgelehnt",
  "Being planned": "Wird geplant",
  "You withdrew": "Du hast zurückgezogen",
  "In progress": "In Arbeit",
});
Object.assign(fr, {
  "Everything Datehaja has told you, newest first.":
    "Tous les messages de Datehaja, du plus récent au plus ancien.",
  "Mark all read": "Tout marquer comme lu",
  "Nothing yet": "Rien pour le moment",
  "When a date plan lands, is confirmed, or changes, you'll see it here.":
    "Lorsqu'un projet de rendez-vous arrive, est confirmé ou change, vous le verrez ici.",
  "Been and gone": "Terminé",
  Cancelled: "Annulé",
  "Didn't fill": "Non conclu",
  "Didn't work out": "Sans suite",
  "Waiting on them": "En attente de l'autre personne",
  "You passed": "Vous avez refusé",
  "Being planned": "En préparation",
  "You withdrew": "Vous vous êtes retiré",
  "In progress": "En cours",
});
Object.assign(nl, {
  "Everything Datehaja has told you, newest first.":
    "Alles wat Datehaja je heeft verteld, nieuwste eerst.",
  "Mark all read": "Alles als gelezen markeren",
  "Nothing yet": "Nog niets",
  "When a date plan lands, is confirmed, or changes, you'll see it here.":
    "Wanneer een dateplan aankomt, wordt bevestigd of verandert, zie je dat hier.",
  "Been and gone": "Afgerond",
  Cancelled: "Geannuleerd",
  "Didn't fill": "Niet gelukt",
  "Didn't work out": "Niet doorgegaan",
  "Waiting on them": "Wachten op de ander",
  "You passed": "Je hebt overgeslagen",
  "Being planned": "Wordt gepland",
  "You withdrew": "Je hebt je teruggetrokken",
  "In progress": "Bezig",
});
Object.assign(sv, {
  "Everything Datehaja has told you, newest first.":
    "Allt Datehaja har berättat för dig, nyast först.",
  "Mark all read": "Markera alla som lästa",
  "Nothing yet": "Inget ännu",
  "When a date plan lands, is confirmed, or changes, you'll see it here.":
    "När en dejtplan kommer, bekräftas eller ändras ser du det här.",
  "Been and gone": "Avslutad",
  Cancelled: "Avbokad",
  "Didn't fill": "Blev inte av",
  "Didn't work out": "Fungerade inte",
  "Waiting on them": "Väntar på den andra",
  "You passed": "Du avstod",
  "Being planned": "Planeras",
  "You withdrew": "Du drog dig ur",
  "In progress": "Pågår",
});

Object.assign(ko, {
  "About you": "나에 대해",
  "What should we call you?": "어떻게 불러드릴까요?",
  "Date of birth": "생년월일",
  "You are": "성별",
  Woman: "여성",
  Man: "남성",
  "Non-binary": "논바이너리",
  "Age range": "연령대",
  Interests: "관심사",
  Budget: "예산",
  Back: "뒤로",
});
Object.assign(ja, {
  "About you": "あなたについて",
  "What should we call you?": "何とお呼びすればよいですか？",
  "Date of birth": "生年月日",
  "You are": "性別",
  Woman: "女性",
  Man: "男性",
  "Non-binary": "ノンバイナリー",
  "Age range": "年齢範囲",
  Interests: "興味",
  Budget: "予算",
  Back: "戻る",
});
Object.assign(de, {
  "About you": "Über dich",
  "What should we call you?": "Wie sollen wir dich nennen?",
  "Date of birth": "Geburtsdatum",
  "You are": "Du bist",
  Woman: "Frau",
  Man: "Mann",
  "Non-binary": "Nichtbinär",
  "Age range": "Altersbereich",
  Interests: "Interessen",
  Budget: "Budget",
  Back: "Zurück",
});
Object.assign(fr, {
  "About you": "À propos de vous",
  "What should we call you?": "Comment devons-nous vous appeler ?",
  "Date of birth": "Date de naissance",
  "You are": "Vous êtes",
  "Non-binary": "Non binaire",
  "Age range": "Tranche d'âge",
  Interests: "Centres d'intérêt",
  Budget: "Budget",
  Back: "Retour",
});
Object.assign(nl, {
  "About you": "Over jou",
  "What should we call you?": "Hoe mogen we je noemen?",
  "Date of birth": "Geboortedatum",
  "You are": "Jij bent",
  "Non-binary": "Non-binair",
  "Age range": "Leeftijdsbereik",
  Interests: "Interesses",
  Budget: "Budget",
  Back: "Terug",
});
Object.assign(sv, {
  "About you": "Om dig",
  "What should we call you?": "Vad ska vi kalla dig?",
  "Date of birth": "Födelsedatum",
  "You are": "Du är",
  "Non-binary": "Ickebinär",
  "Age range": "Åldersintervall",
  Interests: "Intressen",
  Budget: "Budget",
  Back: "Tillbaka",
});

Object.assign(ja, {
  "I turn tiny plans into adventures.":
    "私、小さな予定も冒険にしちゃうんだ。",
  "I'd love that — as long as it feels easy.":
    "私も好きそう。気楽でいられればね。",
  "I'm back! I have so much to tell you.":
    "ただいま！話したいことがいっぱいあるよ。",
  "back from the date": "デートから帰ってきた",
});
Object.assign(de, {
  "I turn tiny plans into adventures.":
    "Ich mache aus kleinen Plänen Abenteuer.",
  "I'd love that — as long as it feels easy.":
    "Das würde mir gefallen — solange es sich leicht anfühlt.",
  "I'm back! I have so much to tell you.":
    "Ich bin zurück! Ich muss dir so viel erzählen.",
  "back from the date": "zurück vom Date",
});
Object.assign(fr, {
  "I turn tiny plans into adventures.":
    "Je transforme les petits plans en aventures.",
  "I'd love that — as long as it feels easy.":
    "J'adorerais — tant que ça reste simple.",
  "I'm back! I have so much to tell you.":
    "Je suis de retour ! J'ai tant de choses à te raconter.",
  "back from the date": "de retour du rendez-vous",
});
Object.assign(nl, {
  "I turn tiny plans into adventures.":
    "Ik maak van kleine plannen avonturen.",
  "I'd love that — as long as it feels easy.":
    "Dat zou ik geweldig vinden — zolang het makkelijk voelt.",
  "I'm back! I have so much to tell you.":
    "Ik ben terug! Ik heb je zo veel te vertellen.",
  "back from the date": "terug van de date",
});
Object.assign(sv, {
  "I turn tiny plans into adventures.":
    "Jag gör äventyr av små planer.",
  "I'd love that — as long as it feels easy.":
    "Det skulle jag gilla — så länge det känns lätt.",
  "I'm back! I have so much to tell you.":
    "Jag är tillbaka! Jag har så mycket att berätta.",
  "back from the date": "tillbaka från dejten",
});

/* Safety Center copy for the agent-dating product. */
Object.assign(ko, {
  "The first date happens between two Agents in a simulated world while both humans stay home. Nobody meets anyone until two people independently say yes.":
    "첫 데이트는 두 에이전트가 가상 세계에서 대신해요. 두 사람이 각자 독립적으로 좋다고 답하기 전까지는 아무도 만나지 않아요.",
  "Contact is revealed only after both people independently choose an introduction. Until then, a match knows you as a first name and a neighbourhood — never an email, number or address.":
    "연락처는 두 사람이 각자 만남을 선택한 뒤에만 공개돼요. 그 전까지 상대는 당신을 이름과 동네로만 알아요 — 이메일, 전화번호, 주소는 절대 몰라요.",
  "One switch in Settings pauses your Dating Agent immediately, so no new date can reach you. Nothing is deleted.":
    "설정의 스위치 하나로 데이트 에이전트를 즉시 멈출 수 있어요. 새 데이트가 더는 오지 않고, 아무것도 삭제되지 않아요.",
  "Blocking someone quietly closes every agent date you share and permanently removes you from each other's scouting pool, in both directions.":
    "차단하면 두 사람이 공유한 에이전트 데이트가 조용히 닫히고, 양방향으로 서로의 탐색 대상에서 영구히 제외돼요.",
  "If you two decide to meet, tell someone you trust where you're going and when — and pick a public place.":
    "실제로 만나기로 했다면, 믿는 사람에게 언제 어디로 가는지 알리고 공공장소에서 만나요.",
  "Report from the agent date itself, so it reaches us with the date attached — we can see who and when without you having to explain it twice.":
    "신고는 해당 에이전트 데이트 화면에서 하세요. 데이트 정보가 함께 전달되어, 누구와 언제였는지 두 번 설명할 필요가 없어요.",
});
Object.assign(ja, {
  "The first date happens between two Agents in a simulated world while both humans stay home. Nobody meets anyone until two people independently say yes.":
    "最初のデートは、ふたりのエージェントが仮想世界で代わりに行います。双方がそれぞれ独立して「会いたい」と答えるまで、誰も誰にも会いません。",
  "Contact is revealed only after both people independently choose an introduction. Until then, a match knows you as a first name and a neighbourhood — never an email, number or address.":
    "連絡先は、ふたりがそれぞれ紹介を選んだあとにだけ公開されます。それまで相手が知るのは名前と街区だけ — メール・電話番号・住所は決して知りません。",
  "One switch in Settings pauses your Dating Agent immediately, so no new date can reach you. Nothing is deleted.":
    "設定のスイッチひとつでデートエージェントをすぐ停止できます。新しいデートは届かなくなり、何も削除されません。",
  "Blocking someone quietly closes every agent date you share and permanently removes you from each other's scouting pool, in both directions.":
    "ブロックすると、共有しているエージェントデートは静かに閉じられ、双方向で互いの探索対象から永久に外れます。",
  "If you two decide to meet, tell someone you trust where you're going and when — and pick a public place.":
    "実際に会うことにしたら、信頼できる人に行き先と時間を伝え、公共の場所を選んでください。",
  "Report from the agent date itself, so it reaches us with the date attached — we can see who and when without you having to explain it twice.":
    "通報はそのエージェントデートの画面から。デート情報が添付されて届くので、誰といつだったかを二度説明する必要はありません。",
});
Object.assign(de, {
  "The first date happens between two Agents in a simulated world while both humans stay home. Nobody meets anyone until two people independently say yes.":
    "Das erste Date führen zwei Agents in einer simulierten Welt, während beide Menschen zu Hause bleiben. Niemand trifft jemanden, bevor nicht beide unabhängig Ja sagen.",
  "Contact is revealed only after both people independently choose an introduction. Until then, a match knows you as a first name and a neighbourhood — never an email, number or address.":
    "Kontaktdaten werden erst sichtbar, wenn beide unabhängig eine Vorstellung wählen. Bis dahin kennt dich ein Match nur als Vornamen und Stadtviertel — nie E-Mail, Nummer oder Adresse.",
  "One switch in Settings pauses your Dating Agent immediately, so no new date can reach you. Nothing is deleted.":
    "Ein Schalter in den Einstellungen pausiert deinen Dating-Agenten sofort, sodass dich kein neues Date erreicht. Nichts wird gelöscht.",
  "Blocking someone quietly closes every agent date you share and permanently removes you from each other's scouting pool, in both directions.":
    "Beim Blockieren werden alle gemeinsamen Agent-Dates leise geschlossen, und ihr werdet in beide Richtungen dauerhaft aus dem Scouting des anderen entfernt.",
  "If you two decide to meet, tell someone you trust where you're going and when — and pick a public place.":
    "Wenn ihr euch treffen wollt: Sag einer Vertrauensperson, wohin du gehst und wann — und wähle einen öffentlichen Ort.",
  "Report from the agent date itself, so it reaches us with the date attached — we can see who and when without you having to explain it twice.":
    "Melde direkt aus dem Agent-Date heraus — der Bericht erreicht uns mit dem Date im Anhang, sodass du nichts doppelt erklären musst.",
});
Object.assign(fr, {
  "The first date happens between two Agents in a simulated world while both humans stay home. Nobody meets anyone until two people independently say yes.":
    "Le premier rendez-vous a lieu entre deux Agents dans un monde simulé pendant que les deux humains restent chez eux. Personne ne rencontre personne avant deux oui indépendants.",
  "Contact is revealed only after both people independently choose an introduction. Until then, a match knows you as a first name and a neighbourhood — never an email, number or address.":
    "Les coordonnées ne sont révélées qu'après deux choix indépendants. D'ici là, un match ne connaît que votre prénom et votre quartier — jamais d'e-mail, de numéro ni d'adresse.",
  "One switch in Settings pauses your Dating Agent immediately, so no new date can reach you. Nothing is deleted.":
    "Un interrupteur dans les réglages met votre Agent de rencontre en pause immédiatement : aucun nouveau rendez-vous ne peut vous atteindre. Rien n'est supprimé.",
  "Blocking someone quietly closes every agent date you share and permanently removes you from each other's scouting pool, in both directions.":
    "Bloquer quelqu'un ferme discrètement tous vos rendez-vous d'agents partagés et vous retire définitivement, dans les deux sens, de la recherche de l'autre.",
  "If you two decide to meet, tell someone you trust where you're going and when — and pick a public place.":
    "Si vous décidez de vous rencontrer, dites à une personne de confiance où vous allez et quand — et choisissez un lieu public.",
  "Report from the agent date itself, so it reaches us with the date attached — we can see who and when without you having to explain it twice.":
    "Signalez depuis le rendez-vous d'agent lui-même : le signalement nous parvient avec le rendez-vous attaché, sans que vous ayez à tout expliquer deux fois.",
});
Object.assign(nl, {
  "The first date happens between two Agents in a simulated world while both humans stay home. Nobody meets anyone until two people independently say yes.":
    "De eerste date gebeurt tussen twee Agents in een gesimuleerde wereld terwijl beide mensen thuisblijven. Niemand ontmoet iemand voordat twee mensen onafhankelijk ja zeggen.",
  "Contact is revealed only after both people independently choose an introduction. Until then, a match knows you as a first name and a neighbourhood — never an email, number or address.":
    "Contactgegevens worden pas onthuld nadat beiden onafhankelijk voor een kennismaking kiezen. Tot die tijd kent een match je als voornaam en buurt — nooit een e-mail, nummer of adres.",
  "One switch in Settings pauses your Dating Agent immediately, so no new date can reach you. Nothing is deleted.":
    "Eén schakelaar in Instellingen pauzeert je datingagent meteen, zodat geen nieuwe date je kan bereiken. Er wordt niets verwijderd.",
  "Blocking someone quietly closes every agent date you share and permanently removes you from each other's scouting pool, in both directions.":
    "Blokkeren sluit stilletjes elke gedeelde agent-date en verwijdert jullie permanent, in beide richtingen, uit elkaars zoekpool.",
  "If you two decide to meet, tell someone you trust where you're going and when — and pick a public place.":
    "Besluiten jullie elkaar te ontmoeten? Vertel iemand die je vertrouwt waar je heen gaat en wanneer — en kies een openbare plek.",
  "Report from the agent date itself, so it reaches us with the date attached — we can see who and when without you having to explain it twice.":
    "Rapporteer vanuit de agent-date zelf; de melding bereikt ons met de date erbij, zodat je niets twee keer hoeft uit te leggen.",
});
Object.assign(sv, {
  "The first date happens between two Agents in a simulated world while both humans stay home. Nobody meets anyone until two people independently say yes.":
    "Den första dejten sker mellan två agenter i en simulerad värld medan båda människorna stannar hemma. Ingen träffar någon förrän två personer oberoende säger ja.",
  "Contact is revealed only after both people independently choose an introduction. Until then, a match knows you as a first name and a neighbourhood — never an email, number or address.":
    "Kontaktuppgifter visas först när båda oberoende väljer en introduktion. Tills dess känner en match dig som ett förnamn och en stadsdel — aldrig e-post, nummer eller adress.",
  "One switch in Settings pauses your Dating Agent immediately, so no new date can reach you. Nothing is deleted.":
    "Ett reglage i Inställningar pausar din dejtingagent direkt, så ingen ny dejt når dig. Inget raderas.",
  "Blocking someone quietly closes every agent date you share and permanently removes you from each other's scouting pool, in both directions.":
    "Att blockera någon stänger tyst varje gemensam agentdejt och tar er permanent, åt båda håll, ur varandras sökning.",
  "If you two decide to meet, tell someone you trust where you're going and when — and pick a public place.":
    "Om ni bestämmer er för att träffas: berätta för någon du litar på vart du ska och när — och välj en offentlig plats.",
  "Report from the agent date itself, so it reaches us with the date attached — we can see who and when without you having to explain it twice.":
    "Anmäl direkt från agentdejten, så når anmälan oss med dejten bifogad — du behöver aldrig förklara två gånger.",
});

Object.assign(ko, {
  "Public record · Privacy": "공개 안내서 · 개인정보",
  "How it works": "작동 방식",
  Text: "텍스트",
  "Public record · Safety": "공개 안내서 · 안전",
  "We are not an emergency service": "긴급 구조 서비스가 아닙니다",
  "Be clear about this": "분명히 알아두세요",
  "What we don't verify": "인증하지 않는 항목",
  "No ID checks": "신분증 확인 없음",
  "No photo verification": "사진 인증 없음",
  "No background checks": "신원 조회 없음",
  "By design": "설계 단계부터",
  "What the product does for you": "제품이 제공하는 보호",
  "No contact details exchanged": "연락처 교환 없음",
  "Neighbourhood, not address": "주소가 아닌 동네",
  "You can stop instantly": "언제든 즉시 중지",
  "Blocking is mutual and permanent": "차단은 상호 적용되며 영구적",
  "Before you go": "만나기 전",
  "First-date basics": "첫 데이트 기본 수칙",
  "If something happens": "문제가 생겼다면",
  Reporting: "신고",
  Also: "추가 안내",
  Related: "관련 항목",
  Settings: "설정",
});
Object.assign(ja, {
  "Public record · Privacy": "公開ガイド · プライバシー",
  "How it works": "仕組み",
  Text: "テキスト",
  "Public record · Safety": "公開ガイド · 安全",
  "We are not an emergency service": "緊急サービスではありません",
  "Be clear about this": "必ず理解してください",
  "What we don't verify": "確認しないこと",
  "No ID checks": "身分証確認なし",
  "No photo verification": "写真認証なし",
  "No background checks": "身元調査なし",
  "By design": "設計による保護",
  "What the product does for you": "製品が提供する保護",
  "No contact details exchanged": "連絡先の交換なし",
  "Neighbourhood, not address": "住所ではなく地域",
  "You can stop instantly": "いつでもすぐ停止",
  "Blocking is mutual and permanent": "ブロックは相互かつ恒久的",
  "Before you go": "出かける前に",
  "First-date basics": "初デートの基本",
  "If something happens": "問題が起きたら",
  Reporting: "報告",
  Also: "その他",
  Related: "関連項目",
  Settings: "設定",
});
Object.assign(de, {
  "Public record · Privacy": "Öffentliche Information · Datenschutz",
  "How it works": "So funktioniert es",
  Text: "Text",
  "Public record · Safety": "Öffentliche Information · Sicherheit",
  "We are not an emergency service": "Wir sind kein Notdienst",
  "Be clear about this": "Das muss klar sein",
  "What we don't verify": "Was wir nicht prüfen",
  "No ID checks": "Keine Ausweiskontrolle",
  "No photo verification": "Keine Fotoverifizierung",
  "No background checks": "Keine Hintergrundprüfung",
  "By design": "Durch das Design",
  "What the product does for you": "Was das Produkt für dich tut",
  "No contact details exchanged": "Keine Kontaktdaten ausgetauscht",
  "Neighbourhood, not address": "Viertel statt Adresse",
  "You can stop instantly": "Du kannst sofort stoppen",
  "Blocking is mutual and permanent":
    "Blockieren gilt beidseitig und dauerhaft",
  "Before you go": "Bevor du gehst",
  "First-date basics": "Grundregeln fürs erste Date",
  "If something happens": "Wenn etwas passiert",
  Reporting: "Melden",
  Also: "Außerdem",
  Related: "Verwandte Themen",
  Settings: "Einstellungen",
});
Object.assign(fr, {
  "Public record · Privacy": "Informations publiques · Confidentialité",
  "How it works": "Fonctionnement",
  Text: "Texte",
  "Public record · Safety": "Informations publiques · Sécurité",
  "We are not an emergency service": "Nous ne sommes pas un service d'urgence",
  "Be clear about this": "Soyons clairs",
  "What we don't verify": "Ce que nous ne vérifions pas",
  "No ID checks": "Aucun contrôle d'identité",
  "No photo verification": "Aucune vérification photo",
  "No background checks": "Aucune vérification des antécédents",
  "By design": "Par conception",
  "What the product does for you": "Ce que le produit fait pour vous",
  "No contact details exchanged": "Aucune coordonnée échangée",
  "Neighbourhood, not address": "Quartier, pas adresse",
  "You can stop instantly": "Vous pouvez arrêter immédiatement",
  "Blocking is mutual and permanent": "Le blocage est mutuel et permanent",
  "Before you go": "Avant de partir",
  "First-date basics": "Les bases du premier rendez-vous",
  "If something happens": "Si quelque chose arrive",
  Reporting: "Signalement",
  Also: "Également",
  Related: "À consulter",
  Settings: "Réglages",
});
Object.assign(nl, {
  "Public record · Privacy": "Openbare informatie · Privacy",
  "How it works": "Zo werkt het",
  Text: "Tekst",
  "Public record · Safety": "Openbare informatie · Veiligheid",
  "We are not an emergency service": "We zijn geen hulpdienst",
  "Be clear about this": "Wees hier duidelijk over",
  "What we don't verify": "Wat we niet verifiëren",
  "No ID checks": "Geen identiteitscontrole",
  "No photo verification": "Geen fotoverificatie",
  "No background checks": "Geen antecedentenonderzoek",
  "By design": "Door het ontwerp",
  "What the product does for you": "Wat het product voor je doet",
  "No contact details exchanged": "Geen contactgegevens uitgewisseld",
  "Neighbourhood, not address": "Buurt, geen adres",
  "You can stop instantly": "Je kunt direct stoppen",
  "Blocking is mutual and permanent": "Blokkeren is wederzijds en permanent",
  "Before you go": "Voordat je gaat",
  "First-date basics": "Basisregels voor een eerste date",
  "If something happens": "Als er iets gebeurt",
  Reporting: "Melden",
  Also: "Ook",
  Related: "Gerelateerd",
  Settings: "Instellingen",
});
Object.assign(sv, {
  "Public record · Privacy": "Offentlig information · Integritet",
  "How it works": "Så fungerar det",
  Text: "Text",
  "Public record · Safety": "Offentlig information · Säkerhet",
  "We are not an emergency service": "Vi är ingen räddningstjänst",
  "Be clear about this": "Var tydlig med detta",
  "What we don't verify": "Vad vi inte verifierar",
  "No ID checks": "Ingen ID-kontroll",
  "No photo verification": "Ingen fotoverifiering",
  "No background checks": "Ingen bakgrundskontroll",
  "By design": "Genom designen",
  "What the product does for you": "Vad produkten gör för dig",
  "No contact details exchanged": "Inga kontaktuppgifter utbyts",
  "Neighbourhood, not address": "Område, inte adress",
  "You can stop instantly": "Du kan stoppa direkt",
  "Blocking is mutual and permanent": "Blockering är ömsesidig och permanent",
  "Before you go": "Innan du går",
  "First-date basics": "Grunder för första dejten",
  "If something happens": "Om något händer",
  Reporting: "Rapportering",
  Also: "Även",
  Related: "Relaterat",
  Settings: "Inställningar",
});

Object.assign(ko, {
  "If you're in immediate danger, contact your local emergency services first. Reports here reach our team, not the police.":
    "즉각적인 위험에 처했다면 먼저 지역 긴급 구조 기관에 연락하세요. 이곳의 신고는 경찰이 아닌 Datehaja 팀에 전달됩니다.",
  "Datehaja does not verify identity in any form. Everything on a profile is self-reported. We say this plainly because a product that implies safety it hasn't earned is more dangerous than one that's honest.":
    "Datehaja는 어떤 형태로도 신원을 확인하지 않으며 프로필 정보는 모두 사용자가 직접 입력합니다. 확보하지 못한 안전을 암시하는 것보다 한계를 솔직히 밝히는 것이 더 안전합니다.",
  "What we do enforce: every account confirms it's 18 or over, blocked pairs are never matched again in either direction, and serious reports immediately restrict the reported account pending review.":
    "모든 계정은 만 18세 이상임을 확인해야 합니다. 차단된 두 사람은 어느 방향으로도 다시 매칭되지 않으며, 심각한 신고가 접수된 계정은 검토 전까지 즉시 제한됩니다.",
  "Your location is stored as an approximate neighbourhood centre, and shown to a match only as a neighbourhood name.":
    "위치는 대략적인 동네 중심으로 저장되고 상대방에게는 동네 이름만 표시됩니다.",
  "Arrange your own way there and back. Don't accept a lift on a first date.":
    "왕복 교통편은 직접 준비하고 첫 데이트에서는 차를 얻어 타지 마세요.",
  "Stay in the public venue. If someone pushes to move somewhere private, that's your answer.":
    "공공장소에 머무르세요. 상대방이 사적인 곳으로 이동하자고 압박한다면 그 자체가 답입니다.",
  "Keep an eye on your drink, and leave whenever you want to — you owe a stranger nothing.":
    "음료를 지켜보고 원할 때 언제든 떠나세요. 낯선 사람에게 빚진 것은 없습니다.",
  "If they pressure you for your number, socials or money, report it. That's exactly what Datehaja exists to make unnecessary.":
    "전화번호, 소셜 계정, 돈을 요구하거나 압박하면 신고하세요. Datehaja는 그런 요구가 필요 없도록 만든 서비스입니다.",
  "Reports of harassment or of someone appearing to be under 18 immediately restrict that account while we look at it. You can block at the same time, or separately — the two are independent on purpose.":
    "괴롭힘이나 미성년자로 의심되는 신고는 검토 중 해당 계정을 즉시 제한합니다. 차단은 동시에 또는 별도로 할 수 있습니다.",
  "You can also reply to any Datehaja Concierge email. It comes to us.":
    "Datehaja 컨시어지 이메일에 답장해도 저희에게 전달됩니다.",
  "Exactly what a match can see about you":
    "상대방에게 보이는 내 정보의 정확한 범위",
  "Pause matching, manage blocks, control email":
    "Datehaja 일시정지, 차단 관리, 이메일 설정",
});

Object.assign(ja, {
  "If you're in immediate danger, contact your local emergency services first. Reports here reach our team, not the police.":
    "差し迫った危険がある場合は、まず地域の緊急サービスに連絡してください。ここでの報告は警察ではなくDatehajaチームに届きます。",
  "Datehaja does not verify identity in any form. Everything on a profile is self-reported. We say this plainly because a product that implies safety it hasn't earned is more dangerous than one that's honest.":
    "Datehajaはいかなる本人確認も行わず、プロフィールはすべて自己申告です。確保していない安全を匂わせるより、限界を明確にする方が安全だと考えています。",
  "What we do enforce: every account confirms it's 18 or over, blocked pairs are never matched again in either direction, and serious reports immediately restrict the reported account pending review.":
    "すべてのアカウントは18歳以上を確認します。ブロックした二人は再びマッチせず、重大な報告を受けたアカウントは審査まで直ちに制限されます。",
  "Your location is stored as an approximate neighbourhood centre, and shown to a match only as a neighbourhood name.":
    "位置は地域のおおよその中心として保存され、相手には地域名だけが表示されます。",
  "Arrange your own way there and back. Don't accept a lift on a first date.":
    "往復の交通手段は自分で用意し、初デートでは送迎を受けないでください。",
  "Stay in the public venue. If someone pushes to move somewhere private, that's your answer.":
    "公共の場所に留まりましょう。相手が個人的な場所への移動を強く求めたら、それが答えです。",
  "Keep an eye on your drink, and leave whenever you want to — you owe a stranger nothing.":
    "飲み物から目を離さず、いつでも帰って構いません。見知らぬ人に借りはありません。",
  "If they pressure you for your number, socials or money, report it. That's exactly what Datehaja exists to make unnecessary.":
    "電話番号、SNS、お金を要求されたら報告してください。Datehajaはそうした要求を不要にするためのサービスです。",
  "Reports of harassment or of someone appearing to be under 18 immediately restrict that account while we look at it. You can block at the same time, or separately — the two are independent on purpose.":
    "嫌がらせや18歳未満に見える人の報告は、確認中そのアカウントを直ちに制限します。ブロックは同時にも別々にも行えます。",
  "You can also reply to any Datehaja Concierge email. It comes to us.":
    "Datehajaコンシェルジュのメールに返信しても私たちに届きます。",
  "Exactly what a match can see about you":
    "相手に見えるあなたの情報の正確な範囲",
  "Pause matching, manage blocks, control email":
    "Datehajaの一時停止、ブロック管理、メール設定",
});

Object.assign(de, {
  "If you're in immediate danger, contact your local emergency services first. Reports here reach our team, not the police.":
    "Bei unmittelbarer Gefahr kontaktiere zuerst den örtlichen Notdienst. Meldungen hier erreichen unser Team, nicht die Polizei.",
  "Datehaja does not verify identity in any form. Everything on a profile is self-reported. We say this plainly because a product that implies safety it hasn't earned is more dangerous than one that's honest.":
    "Datehaja prüft Identitäten in keiner Form. Alle Profilangaben sind selbst gemacht. Ein Produkt, das unverdiente Sicherheit suggeriert, ist gefährlicher als ein ehrliches.",
  "What we do enforce: every account confirms it's 18 or over, blocked pairs are never matched again in either direction, and serious reports immediately restrict the reported account pending review.":
    "Jedes Konto bestätigt ein Mindestalter von 18. Blockierte Paare werden nie wieder gematcht, und ernste Meldungen schränken das gemeldete Konto bis zur Prüfung sofort ein.",
  "Your location is stored as an approximate neighbourhood centre, and shown to a match only as a neighbourhood name.":
    "Dein Standort wird als ungefährer Mittelpunkt eines Viertels gespeichert und nur als Viertelname gezeigt.",
  "Arrange your own way there and back. Don't accept a lift on a first date.":
    "Organisiere Hin- und Rückweg selbst und nimm beim ersten Date keine Mitfahrgelegenheit an.",
  "Stay in the public venue. If someone pushes to move somewhere private, that's your answer.":
    "Bleib am öffentlichen Ort. Drängt jemand auf einen privaten Ort, ist das deine Antwort.",
  "Keep an eye on your drink, and leave whenever you want to — you owe a stranger nothing.":
    "Behalte dein Getränk im Blick und geh jederzeit — du schuldest einer fremden Person nichts.",
  "If they pressure you for your number, socials or money, report it. That's exactly what Datehaja exists to make unnecessary.":
    "Melde Druck wegen Nummer, Socials oder Geld. Genau das soll Datehaja unnötig machen.",
  "Reports of harassment or of someone appearing to be under 18 immediately restrict that account while we look at it. You can block at the same time, or separately — the two are independent on purpose.":
    "Meldungen zu Belästigung oder mutmaßlich Minderjährigen schränken das Konto während der Prüfung sofort ein. Blockieren ist gleichzeitig oder separat möglich.",
  "You can also reply to any Datehaja Concierge email. It comes to us.":
    "Du kannst auch auf jede Datehaja-Concierge-Mail antworten. Sie kommt zu uns.",
  "Exactly what a match can see about you":
    "Genau was ein Match über dich sehen kann",
  "Pause matching, manage blocks, control email":
    "Matching pausieren, Blockierungen verwalten, E-Mails steuern",
});

Object.assign(fr, {
  "If you're in immediate danger, contact your local emergency services first. Reports here reach our team, not the police.":
    "En cas de danger immédiat, contactez d'abord les services d'urgence locaux. Les signalements ici arrivent à notre équipe, pas à la police.",
  "Datehaja does not verify identity in any form. Everything on a profile is self-reported. We say this plainly because a product that implies safety it hasn't earned is more dangerous than one that's honest.":
    "Datehaja ne vérifie l'identité sous aucune forme. Toutes les informations sont déclaratives. Un produit qui suggère une sécurité non acquise est plus dangereux qu'un produit honnête.",
  "What we do enforce: every account confirms it's 18 or over, blocked pairs are never matched again in either direction, and serious reports immediately restrict the reported account pending review.":
    "Chaque compte confirme avoir au moins 18 ans. Les personnes bloquées ne sont plus jamais rapprochées et les signalements graves limitent immédiatement le compte pendant l'examen.",
  "Your location is stored as an approximate neighbourhood centre, and shown to a match only as a neighbourhood name.":
    "Votre localisation est stockée comme centre approximatif d'un quartier et affichée uniquement par son nom.",
  "Arrange your own way there and back. Don't accept a lift on a first date.":
    "Organisez vous-même l'aller et le retour. N'acceptez pas d'être raccompagné au premier rendez-vous.",
  "Stay in the public venue. If someone pushes to move somewhere private, that's your answer.":
    "Restez dans le lieu public. Si l'autre personne insiste pour aller dans un lieu privé, vous avez votre réponse.",
  "Keep an eye on your drink, and leave whenever you want to — you owe a stranger nothing.":
    "Gardez votre boisson à l'œil et partez quand vous le souhaitez — vous ne devez rien à un inconnu.",
  "If they pressure you for your number, socials or money, report it. That's exactly what Datehaja exists to make unnecessary.":
    "Si l'on vous presse de donner numéro, réseaux ou argent, signalez-le. Datehaja existe précisément pour rendre cela inutile.",
  "Reports of harassment or of someone appearing to be under 18 immediately restrict that account while we look at it. You can block at the same time, or separately — the two are independent on purpose.":
    "Les signalements de harcèlement ou de personne semblant mineure limitent immédiatement le compte pendant l'examen. Le blocage peut être effectué en même temps ou séparément.",
  "You can also reply to any Datehaja Concierge email. It comes to us.":
    "Vous pouvez aussi répondre à tout e-mail Datehaja Concierge. Il nous parvient.",
  "Exactly what a match can see about you":
    "Exactement ce qu'un match peut voir de vous",
  "Pause matching, manage blocks, control email":
    "Mettre en pause, gérer les blocages et les e-mails",
});

Object.assign(nl, {
  "If you're in immediate danger, contact your local emergency services first. Reports here reach our team, not the police.":
    "Neem bij direct gevaar eerst contact op met de lokale hulpdiensten. Meldingen hier bereiken ons team, niet de politie.",
  "Datehaja does not verify identity in any form. Everything on a profile is self-reported. We say this plainly because a product that implies safety it hasn't earned is more dangerous than one that's honest.":
    "Datehaja verifieert identiteit op geen enkele manier. Alles op een profiel is zelf opgegeven. Een product dat onverdiende veiligheid suggereert is gevaarlijker dan een eerlijk product.",
  "What we do enforce: every account confirms it's 18 or over, blocked pairs are never matched again in either direction, and serious reports immediately restrict the reported account pending review.":
    "Elk account bevestigt 18+ te zijn. Geblokkeerde personen worden nooit opnieuw gekoppeld en ernstige meldingen beperken het account direct tijdens onderzoek.",
  "Your location is stored as an approximate neighbourhood centre, and shown to a match only as a neighbourhood name.":
    "Je locatie wordt opgeslagen als globaal buurtcentrum en alleen als buurtnaam getoond.",
  "Arrange your own way there and back. Don't accept a lift on a first date.":
    "Regel zelf vervoer heen en terug en neem geen lift aan op een eerste date.",
  "Stay in the public venue. If someone pushes to move somewhere private, that's your answer.":
    "Blijf op de openbare locatie. Als iemand aandringt op een privéplek, is dat je antwoord.",
  "Keep an eye on your drink, and leave whenever you want to — you owe a stranger nothing.":
    "Houd je drankje in de gaten en vertrek wanneer je wilt — je bent een onbekende niets verschuldigd.",
  "If they pressure you for your number, socials or money, report it. That's exactly what Datehaja exists to make unnecessary.":
    "Meld druk om je nummer, socials of geld te geven. Datehaja bestaat juist om dat overbodig te maken.",
  "Reports of harassment or of someone appearing to be under 18 immediately restrict that account while we look at it. You can block at the same time, or separately — the two are independent on purpose.":
    "Meldingen van intimidatie of iemand die onder 18 lijkt beperken het account direct tijdens onderzoek. Blokkeren kan tegelijk of apart.",
  "You can also reply to any Datehaja Concierge email. It comes to us.":
    "Je kunt ook antwoorden op elke Datehaja Concierge-mail. Die komt bij ons.",
  "Exactly what a match can see about you":
    "Precies wat een match over je kan zien",
  "Pause matching, manage blocks, control email":
    "Matching pauzeren, blokkades en e-mail beheren",
});

Object.assign(sv, {
  "If you're in immediate danger, contact your local emergency services first. Reports here reach our team, not the police.":
    "Vid omedelbar fara, kontakta först lokal räddningstjänst. Rapporter här når vårt team, inte polisen.",
  "Datehaja does not verify identity in any form. Everything on a profile is self-reported. We say this plainly because a product that implies safety it hasn't earned is more dangerous than one that's honest.":
    "Datehaja verifierar inte identitet i någon form. All profilinformation är självrapporterad. En produkt som antyder oförtjänt säkerhet är farligare än en ärlig produkt.",
  "What we do enforce: every account confirms it's 18 or over, blocked pairs are never matched again in either direction, and serious reports immediately restrict the reported account pending review.":
    "Varje konto bekräftar 18+. Blockerade personer matchas aldrig igen och allvarliga rapporter begränsar kontot direkt under granskning.",
  "Your location is stored as an approximate neighbourhood centre, and shown to a match only as a neighbourhood name.":
    "Din plats lagras som ett ungefärligt områdescentrum och visas bara som områdesnamn.",
  "Arrange your own way there and back. Don't accept a lift on a first date.":
    "Ordna transport dit och hem själv. Tacka inte ja till skjuts på första dejten.",
  "Stay in the public venue. If someone pushes to move somewhere private, that's your answer.":
    "Stanna på den offentliga platsen. Om någon pressar på för en privat plats har du ditt svar.",
  "Keep an eye on your drink, and leave whenever you want to — you owe a stranger nothing.":
    "Håll koll på din dryck och gå när du vill — du är inte skyldig en främling något.",
  "If they pressure you for your number, socials or money, report it. That's exactly what Datehaja exists to make unnecessary.":
    "Rapportera press om nummer, sociala konton eller pengar. Datehaja finns för att göra sådant onödigt.",
  "Reports of harassment or of someone appearing to be under 18 immediately restrict that account while we look at it. You can block at the same time, or separately — the two are independent on purpose.":
    "Rapporter om trakasserier eller någon som verkar under 18 begränsar kontot direkt under granskning. Blockering kan göras samtidigt eller separat.",
  "You can also reply to any Datehaja Concierge email. It comes to us.":
    "Du kan också svara på alla mejl från Datehaja Concierge. De kommer till oss.",
  "Exactly what a match can see about you": "Exakt vad en match kan se om dig",
  "Pause matching, manage blocks, control email":
    "Pausa matchning, hantera blockeringar och e-post",
});

Object.assign(ko, {
  "A private beginning": "비공개로 시작하기",
  "Private handoff": "나만의 비공개 인계",
});

Object.assign(ja, {
  "A private beginning": "プライベートな始まり",
  "Private handoff": "あなただけへの受け渡し",
});

Object.assign(de, {
  "A private beginning": "Ein privater Anfang",
  "Private handoff": "Private Übergabe",
});

Object.assign(fr, {
  "A private beginning": "Un début privé",
  "Private handoff": "Remise privée",
});

Object.assign(nl, {
  "A private beginning": "Een privé begin",
  "Private handoff": "Privéoverdracht",
});

Object.assign(sv, {
  "A private beginning": "En privat början",
  "Private handoff": "Privat överlämning",
});

Object.assign(ko, {
  "Prefer not to say": "답하지 않을래요",
  star: "점",
});

Object.assign(ja, {
  "Prefer not to say": "回答しない",
  star: "点",
});

Object.assign(de, {
  "Prefer not to say": "Keine Angabe",
  star: "Stern",
});

Object.assign(fr, {
  "Prefer not to say": "Je préfère ne pas répondre",
  star: "étoile",
});

Object.assign(nl, {
  "Prefer not to say": "Zeg ik liever niet",
  star: "ster",
});

Object.assign(sv, {
  "Prefer not to say": "Vill inte svara",
  star: "stjärna",
});

Object.assign(ko, {
  Terms: "약관",
  Community: "커뮤니티",
});

Object.assign(ja, {
  Terms: "利用規約",
  Community: "コミュニティ",
});

Object.assign(de, {
  Terms: "Bedingungen",
  Community: "Gemeinschaft",
});

Object.assign(fr, {
  Terms: "Conditions",
  Community: "Communauté",
});

Object.assign(nl, {
  Terms: "Voorwaarden",
  Community: "Gemeenschap",
});

Object.assign(sv, {
  Terms: "Villkor",
  Community: "Gemenskap",
});

Object.assign(ko, {
  "Photo privacy saved.": "사진 공개 설정을 저장했어요.",
  "Photo visibility": "사진 공개 시점",
  "Show with my match card": "매칭 카드에서 공개",
  "Only after we both accept": "두 사람 모두 수락한 뒤 공개",
  "Photo saved. Choose when a match can see it below.":
    "사진을 저장했어요. 상대에게 공개할 시점을 아래에서 선택하세요.",
  "Introduce yourself": "자기소개",
  "How would people who know you describe you?":
    "나를 잘 아는 사람들은 나를 어떻게 말할까요?",
  "Pick up to five. Choose what is true, not what sounds impressive.":
    "멋져 보이는 말보다 실제 나와 가까운 표현을 최대 다섯 개 골라주세요.",
  "Your personality": "나의 성격",
  "Your everyday style": "평소 나의 스타일",
  "Optional and self-described — never an appearance score.":
    "선택 사항이며 스스로 표현하는 정보예요. 외모 점수로 사용하지 않아요.",
  "Your style": "나의 스타일",
  "This profile reflects who I am today":
    "이 프로필은 현재의 나를 솔직하게 담고 있어요",
  "Honest details lead to fewer awkward surprises and better matches. Private post-date feedback checks profile accuracy, not attractiveness.":
    "솔직한 정보는 어색한 실망을 줄이고 더 좋은 매칭으로 이어져요. 데이트 후에는 매력 점수가 아니라 프로필의 정확성을 확인합니다.",
  "Add a photo": "사진 추가",
  "Upload failed.": "업로드하지 못했어요.",
  "Personality you tend to connect with": "마음이 잘 통하는 성격",
  "Personality preference strength": "성격 선호 중요도",
  "No preference": "상관없음",
  "Preferred personality": "선호하는 성격",
  "Style you tend to notice": "눈길이 가는 스타일",
  "Style preference strength": "스타일 선호 중요도",
  "Preferred style": "선호하는 스타일",
  "Where can the date happen?": "어느 지역에서 데이트할 수 있나요?",
  "Choose meeting areas, not where your match must live.":
    "상대의 거주지가 아니라 실제로 만나기 편한 지역을 골라주세요.",
  "Meeting area preference": "데이트 지역 선호",
  "Any area": "지역 상관없음",
  "Choose areas": "지역 선택",
  "Preferred meeting areas": "선호 데이트 지역",
  "Only plan dates in these areas": "선택한 지역에서만 데이트 잡기",
  "‘No preference’ removes this factor from matching.":
    "‘상관없음’을 선택하면 이 요소는 매칭에 반영하지 않아요.",
  "Optional personal taste, never an appearance score.":
    "선택형 개인 취향이며 외모 점수로 사용하지 않아요.",
});

Object.assign(ja, {
  "Photo privacy saved.": "写真の公開設定を保存しました。",
  "Photo visibility": "写真の公開タイミング",
  "Show with my match card": "マッチカードで表示",
  "Only after we both accept": "双方の承諾後のみ",
  "Introduce yourself": "自己紹介",
  "How would people who know you describe you?":
    "親しい人はあなたをどう表しますか？",
  "Pick up to five. Choose what is true, not what sounds impressive.":
    "魅力的に聞こえる言葉より、実際の自分に合うものを5つまで選んでください。",
  "Your personality": "あなたの性格",
  "Your everyday style": "普段のスタイル",
  "Optional and self-described — never an appearance score.":
    "任意の自己表現で、外見の点数には使いません。",
  "Your style": "あなたのスタイル",
  "This profile reflects who I am today":
    "このプロフィールは今の自分を正直に表しています",
  "Add a photo": "写真を追加",
  "Personality you tend to connect with": "気が合いやすい性格",
  "Personality preference strength": "性格の希望度",
  "No preference": "こだわらない",
  Flexible: "柔軟",
  Important: "重要",
  "Preferred personality": "好みの性格",
  "Style you tend to notice": "惹かれやすいスタイル",
  "Style preference strength": "スタイルの希望度",
  "Preferred style": "好みのスタイル",
  "Where can the date happen?": "どのエリアで会えますか？",
  "Choose meeting areas, not where your match must live.":
    "相手の居住地ではなく、実際に会いやすいエリアを選んでください。",
  "Meeting area preference": "待ち合わせエリアの希望",
  "Any area": "エリアは問わない",
  "Choose areas": "エリアを選ぶ",
  "Preferred meeting areas": "希望する待ち合わせエリア",
  "Only plan dates in these areas": "このエリア内だけでデートを計画する",
});

Object.assign(de, {
  "Photo privacy saved.": "Foto-Sichtbarkeit gespeichert.",
  "Photo visibility": "Foto-Sichtbarkeit",
  "Show with my match card": "Auf meiner Match-Karte zeigen",
  "Only after we both accept": "Erst wenn wir beide zusagen",
  "Introduce yourself": "Stell dich vor",
  "How would people who know you describe you?":
    "Wie würden dich Menschen beschreiben, die dich kennen?",
  "Pick up to five. Choose what is true, not what sounds impressive.":
    "Wähle bis zu fünf ehrliche Begriffe statt besonders beeindruckender.",
  "Your personality": "Deine Persönlichkeit",
  "Your everyday style": "Dein Alltagsstil",
  "Optional and self-described — never an appearance score.":
    "Optional und selbst beschrieben – niemals eine Aussehensnote.",
  "Your style": "Dein Stil",
  "This profile reflects who I am today":
    "Dieses Profil entspricht meinem heutigen Ich",
  "Add a photo": "Foto hinzufügen",
  "Personality you tend to connect with":
    "Persönlichkeit, mit der du dich oft verstehst",
  "Personality preference strength": "Bedeutung der Persönlichkeit",
  "No preference": "Egal",
  Flexible: "Flexibel",
  Important: "Wichtig",
  "Preferred personality": "Bevorzugte Persönlichkeit",
  "Style you tend to notice": "Stil, der dir auffällt",
  "Style preference strength": "Bedeutung des Stils",
  "Preferred style": "Bevorzugter Stil",
  "Where can the date happen?": "Wo kann das Date stattfinden?",
  "Choose meeting areas, not where your match must live.":
    "Wähle Treffgebiete, nicht den Wohnort deines Matches.",
  "Meeting area preference": "Bevorzugte Treffgebiete",
  "Any area": "Jedes Gebiet",
  "Choose areas": "Gebiete auswählen",
  "Preferred meeting areas": "Gewünschte Treffgebiete",
  "Only plan dates in these areas": "Dates nur in diesen Gebieten planen",
});

Object.assign(fr, {
  "Photo visibility": "Visibilité de la photo",
  "Show with my match card": "Afficher sur ma fiche de rencontre",
  "Only after we both accept": "Seulement après notre double accord",
  "Introduce yourself": "Présentez-vous",
  "How would people who know you describe you?":
    "Comment vos proches vous décriraient-ils ?",
  "Pick up to five. Choose what is true, not what sounds impressive.":
    "Choisissez jusqu’à cinq termes sincères, pas ceux qui semblent les plus impressionnants.",
  "Your personality": "Votre personnalité",
  "Your everyday style": "Votre style au quotidien",
  "Optional and self-described — never an appearance score.":
    "Facultatif et auto-décrit — jamais une note d’apparence.",
  "Your style": "Votre style",
  "This profile reflects who I am today":
    "Ce profil reflète honnêtement qui je suis aujourd’hui",
  "Add a photo": "Ajouter une photo",
  "Personality you tend to connect with":
    "Personnalité avec laquelle le courant passe",
  "Personality preference strength": "Importance de la personnalité",
  "No preference": "Sans préférence",
  Flexible: "Souple",
  Important: "Essentiel",
  "Preferred personality": "Personnalité préférée",
  "Style you tend to notice": "Style qui vous attire",
  "Style preference strength": "Importance du style",
  "Preferred style": "Style préféré",
  "Where can the date happen?": "Où le rendez-vous peut-il avoir lieu ?",
  "Choose meeting areas, not where your match must live.":
    "Choisissez des quartiers où vous retrouver, pas le lieu de résidence de votre rencontre.",
  "Meeting area preference": "Préférence de quartier",
  "Any area": "N’importe quel quartier",
  "Choose areas": "Choisir des quartiers",
  "Preferred meeting areas": "Quartiers de rendez-vous préférés",
  "Only plan dates in these areas": "Planifier uniquement dans ces quartiers",
});

Object.assign(nl, {
  "Photo privacy saved.": "Foto-instelling opgeslagen.",
  "Photo visibility": "Zichtbaarheid foto",
  "Show with my match card": "Tonen op mijn matchkaart",
  "Only after we both accept": "Pas nadat we allebei accepteren",
  "Introduce yourself": "Stel jezelf voor",
  "How would people who know you describe you?":
    "Hoe zouden mensen die je kennen je omschrijven?",
  "Pick up to five. Choose what is true, not what sounds impressive.":
    "Kies maximaal vijf eerlijke kenmerken, niet wat indrukwekkend klinkt.",
  "Your personality": "Jouw persoonlijkheid",
  "Your everyday style": "Jouw dagelijkse stijl",
  "Optional and self-described — never an appearance score.":
    "Optioneel en zelf beschreven — nooit een uiterlijksscore.",
  "Your style": "Jouw stijl",
  "This profile reflects who I am today":
    "Dit profiel laat eerlijk zien wie ik nu ben",
  "Add a photo": "Foto toevoegen",
  "Personality you tend to connect with":
    "Persoonlijkheid waarmee het vaak klikt",
  "Personality preference strength": "Belang van persoonlijkheid",
  "No preference": "Maakt niet uit",
  Flexible: "Flexibel",
  Important: "Belangrijk",
  "Preferred personality": "Gewenste persoonlijkheid",
  "Style you tend to notice": "Stijl die je opvalt",
  "Style preference strength": "Belang van stijl",
  "Preferred style": "Gewenste stijl",
  "Where can the date happen?": "Waar kan de date plaatsvinden?",
  "Choose meeting areas, not where your match must live.":
    "Kies ontmoetingsbuurten, niet waar je match moet wonen.",
  "Meeting area preference": "Voorkeur voor ontmoetingsbuurt",
  "Any area": "Elke buurt",
  "Choose areas": "Buurten kiezen",
  "Preferred meeting areas": "Voorkeursbuurten",
  "Only plan dates in these areas": "Plan dates alleen in deze buurten",
});

Object.assign(sv, {
  "Photo privacy saved.": "Bildens sekretess sparad.",
  "Photo visibility": "Bildens synlighet",
  "Show with my match card": "Visa på mitt matchningskort",
  "Only after we both accept": "Först när båda har tackat ja",
  "Introduce yourself": "Presentera dig",
  "How would people who know you describe you?":
    "Hur skulle personer som känner dig beskriva dig?",
  "Pick up to five. Choose what is true, not what sounds impressive.":
    "Välj upp till fem ärliga ord, inte det som låter mest imponerande.",
  "Your personality": "Din personlighet",
  "Your everyday style": "Din vardagsstil",
  "Optional and self-described — never an appearance score.":
    "Valfritt och självbeskrivet — aldrig ett utseendebetyg.",
  "Your style": "Din stil",
  "This profile reflects who I am today":
    "Profilen visar ärligt vem jag är idag",
  "Add a photo": "Lägg till bild",
  "Personality you tend to connect with": "Personlighet du brukar trivas med",
  "Personality preference strength": "Hur viktig personligheten är",
  "No preference": "Spelar ingen roll",
  Flexible: "Flexibelt",
  Important: "Viktigt",
  "Preferred personality": "Önskad personlighet",
  "Style you tend to notice": "Stil du brukar lägga märke till",
  "Style preference strength": "Hur viktig stilen är",
  "Preferred style": "Önskad stil",
  "Where can the date happen?": "Var kan dejten äga rum?",
  "Choose meeting areas, not where your match must live.":
    "Välj områden där ni kan mötas, inte var din match måste bo.",
  "Meeting area preference": "Önskat mötesområde",
  "Any area": "Vilket område som helst",
  "Choose areas": "Välj områden",
  "Preferred meeting areas": "Föredragna mötesområden",
  "Only plan dates in these areas": "Planera dejter endast i dessa områden",
});

Object.assign(ko, {
  Country: "국가",
  "Service city": "서비스 도시",
  "South Korea": "대한민국",
  Japan: "일본",
  "United States": "미국",
  "United Kingdom": "영국",
  Canada: "캐나다",
  Australia: "호주",
  Germany: "독일",
  France: "프랑스",
  Netherlands: "네덜란드",
  Sweden: "스웨덴",
});

Object.assign(ja, {
  Country: "国",
  "Service city": "サービス提供都市",
  "South Korea": "韓国",
  Japan: "日本",
  "United States": "アメリカ",
  "United Kingdom": "イギリス",
  Canada: "カナダ",
  Australia: "オーストラリア",
  Germany: "ドイツ",
  France: "フランス",
  Netherlands: "オランダ",
  Sweden: "スウェーデン",
});

Object.assign(de, {
  Country: "Land",
  "Service city": "Verfügbare Stadt",
  "South Korea": "Südkorea",
  Japan: "Japan",
  "United States": "Vereinigte Staaten",
  "United Kingdom": "Vereinigtes Königreich",
  Canada: "Kanada",
  Australia: "Australien",
  Germany: "Deutschland",
  France: "Frankreich",
  Netherlands: "Niederlande",
  Sweden: "Schweden",
});

Object.assign(fr, {
  Country: "Pays",
  "Service city": "Ville disponible",
  "South Korea": "Corée du Sud",
  Japan: "Japon",
  "United States": "États-Unis",
  "United Kingdom": "Royaume-Uni",
  Canada: "Canada",
  Australia: "Australie",
  Germany: "Allemagne",
  France: "France",
  Netherlands: "Pays-Bas",
  Sweden: "Suède",
});

Object.assign(nl, {
  Country: "Land",
  "Service city": "Beschikbare stad",
  "South Korea": "Zuid-Korea",
  Japan: "Japan",
  "United States": "Verenigde Staten",
  "United Kingdom": "Verenigd Koninkrijk",
  Canada: "Canada",
  Australia: "Australië",
  Germany: "Duitsland",
  France: "Frankrijk",
  Netherlands: "Nederland",
  Sweden: "Zweden",
});

Object.assign(sv, {
  Country: "Land",
  "Service city": "Tillgänglig stad",
  "South Korea": "Sydkorea",
  Japan: "Japan",
  "United States": "USA",
  "United Kingdom": "Storbritannien",
  Canada: "Kanada",
  Australia: "Australien",
  Germany: "Tyskland",
  France: "Frankrike",
  Netherlands: "Nederländerna",
  Sweden: "Sverige",
});

Object.assign(fr, {
  "Preview of {agent}": "Aperçu de {agent}",
  "my Dating Agent": "mon Agent de rencontre",
  "MY OTHER SELF": "MON ALTER EGO",
  "Name pending": "Nom à venir",
  Color: "Couleur",
  "rose palette": "Palette rose",
  "violet palette": "Palette violette",
  "moss palette": "Palette mousse",
  "sky palette": "Palette ciel",
  "sunset palette": "Palette coucher de soleil",
  "ink palette": "Palette encre",
  Expression: "Expression du visage",
  Gentle: "Doux",
  Bright: "Rayonnant",
  Cool: "Calme",
  Curious: "Curieux",
  Hair: "Coiffure",
  Wave: "Ondulé",
  Crop: "Court",
  Bob: "Carré",
  Bun: "Chignon",
  Buzz: "Très court",
  Outfit: "Tenue",
  Cardigan: "Gilet",
  Blazer: "Veste",
  Hoodie: "Sweat",
  Starlight: "Étoilé",
  "Little detail": "Petit détail",
  "Agent": "Agent",
  "Woman": "Femme",
  "Man": "Homme",
  "Loading the date…": "Chargement du rendez-vous…",
  "No date is ready to show yet. Please check back shortly.": "Aucun rendez-vous n'est encore prêt. Revenez dans un instant.",
  "Watch a real agent date": "Voir un vrai rendez-vous d'agents",
  "Menu": "Menu",
  "Theme": "Apparence",
  "Light": "Clair",
  "Dark": "Sombre",
  None: "Aucun",
  Glasses: "Lunettes",
  Headphones: "Casque",
  "Star clip": "Barrette étoile",
  Scarf: "Écharpe",
  "My other self": "Mon alter ego",
  "Your look travels with the agent through dates, transcripts, and debriefs. It is playful identity—not a claim about your real appearance.":
    "Ce look accompagne l’agent dans les rendez-vous, les échanges et les bilans. C’est une identité ludique, pas une représentation de votre apparence réelle.",
});

Object.assign(nl, {
  "Preview of {agent}": "Voorbeeld van {agent}",
  "my Dating Agent": "mijn datingagent",
  "MY OTHER SELF": "MIJN ANDERE IK",
  "Name pending": "Naam volgt",
  Color: "Kleur",
  "rose palette": "Roze palet",
  "violet palette": "Paars palet",
  "moss palette": "Mospalet",
  "sky palette": "Hemels palet",
  "sunset palette": "Zonsondergangspalet",
  "ink palette": "Inktpalet",
  Expression: "Uitdrukking",
  Gentle: "Zacht",
  Bright: "Stralend",
  Cool: "Stoer",
  Curious: "Nieuwsgierig",
  Hair: "Haar",
  Wave: "Golvend",
  Crop: "Kort",
  Bob: "Boblijn",
  Bun: "Knot",
  Buzz: "Buzzcut",
  Outfit: "Kleding",
  Cardigan: "Vest",
  Blazer: "Jasje",
  Hoodie: "Capuchontrui",
  Starlight: "Sterrenlicht",
  "Little detail": "Detail",
  "Agent": "Agent",
  "Woman": "Vrouw",
  "Man": "Man",
  "Loading the date…": "Date wordt geladen…",
  "No date is ready to show yet. Please check back shortly.": "Er is nog geen date om te tonen. Kom zo even terug.",
  "Watch a real agent date": "Bekijk een echte agent-date",
  "Menu": "Menu",
  "Theme": "Weergave",
  "Light": "Licht",
  "Dark": "Donker",
  None: "Geen",
  Glasses: "Bril",
  Headphones: "Koptelefoon",
  "Star clip": "Sterspeld",
  Scarf: "Sjaal",
  "My other self": "Mijn andere ik",
  "Your look travels with the agent through dates, transcripts, and debriefs. It is playful identity—not a claim about your real appearance.":
    "Je look reist mee door dates, gesprekken en verslagen. Het is een speelse identiteit, geen uitspraak over je echte uiterlijk.",
});

Object.assign(sv, {
  "Preview of {agent}": "Förhandsvisning av {agent}",
  "my Dating Agent": "min dejtingagent",
  "MY OTHER SELF": "MITT ANDRA JAG",
  "Name pending": "Namn kommer",
  Color: "Färg",
  "rose palette": "Rosa palett",
  "violet palette": "Violett palett",
  "moss palette": "Mosspalett",
  "sky palette": "Himmelspalett",
  "sunset palette": "Solnedgångspalett",
  "ink palette": "Bläckpalett",
  Expression: "Uttryck",
  Gentle: "Mjuk",
  Bright: "Ljus",
  Cool: "Avslappnad",
  Curious: "Nyfiken",
  Hair: "Hår",
  Wave: "Vågigt",
  Crop: "Kort",
  Bob: "Page",
  Bun: "Knut",
  Buzz: "Snagg",
  Outfit: "Kläder",
  Cardigan: "Kofta",
  Blazer: "Kavaj",
  Hoodie: "Huvtröja",
  Starlight: "Stjärnljus",
  "Little detail": "Liten detalj",
  "Agent": "Agent",
  "Woman": "Kvinna",
  "Man": "Man",
  "Loading the date…": "Laddar dejten…",
  "No date is ready to show yet. Please check back shortly.": "Ingen dejt är redo att visas än. Titta in igen strax.",
  "Watch a real agent date": "Se en riktig agentdejt",
  "Menu": "Meny",
  "Theme": "Utseende",
  "Light": "Ljust",
  "Dark": "Mörkt",
  None: "Ingen",
  Glasses: "Glasögon",
  Headphones: "Hörlurar",
  "Star clip": "Stjärnspänne",
  Scarf: "Halsduk",
  "My other self": "Mitt andra jag",
  "Your look travels with the agent through dates, transcripts, and debriefs. It is playful identity—not a claim about your real appearance.":
    "Din look följer agenten genom dejter, samtal och rapporter. Det är en lekfull identitet, inte ett påstående om ditt verkliga utseende.",
});

/* Agent scout funnel — Korean launch copy. Other locales safely retain the
   English source until the human copy pass for each market is complete. */
Object.assign(ko, {
  Important: "중요해요",
  Flexible: "유연해요",
  "Scout Pass": "Scout Pass",
});

Object.assign(ko, {
  "Continue with Google": "Google로 계속",
  "Continue with Apple": "Apple로 계속",
  "or use email": "또는 이메일",
  "No password to remember.": "기억할 비밀번호가 없어요.",
  "Check your inbox": "받은편지함을 확인하세요",
  "We sent an 8-digit code to {email}. It expires in 10 minutes.":
    "{email}로 8자리 코드를 보냈어요. 10분 후 만료됩니다.",
  "Use a different email": "다른 이메일 사용",
  "Verification code": "인증 코드",
  "Verify and continue": "확인하고 계속하기",
  "Email me a sign-in code": "이메일로 로그인 코드 받기",
  "Send again in {count}s": "{count}초 후 다시 보내기",
  "Send again": "다시 보내기",
  "Enter a valid email address.": "올바른 이메일 주소를 입력해 주세요.",
  "Email sign-in is temporarily unavailable.":
    "이메일 로그인을 잠시 사용할 수 없어요.",
  "We sent a fresh code.": "새 코드를 보냈어요.",
  "Check your email for the code.": "이메일에서 코드를 확인해 주세요.",
  "Enter the 8-digit code.": "8자리 코드를 입력해 주세요.",
  "That code is invalid or expired. Request a new one.":
    "코드가 올바르지 않거나 만료됐어요. 새 코드를 요청해 주세요.",
  "Couldn't verify that code.": "코드를 확인하지 못했어요.",
  "Couldn't send the code.": "코드를 보내지 못했어요.",
  "Your email protects your private Dating Agent and is never shown to another user. After sign-in, adults review the required agreements before onboarding.":
    "이메일은 비공개 데이트 에이전트를 보호하며 다른 사용자에게 공개되지 않아요. 로그인 후 만 18세 이상 사용자는 온보딩 전에 필수 약관을 확인합니다.",
});

Object.assign(ja, {
  "Continue with Google": "Googleで続ける",
  "Continue with Apple": "Appleで続ける",
  "or use email": "またはメール",
  "No password to remember.": "パスワードを覚える必要はありません。",
  "Check your inbox": "受信トレイを確認してください",
  "We sent an 8-digit code to {email}. It expires in 10 minutes.":
    "{email}に8桁のコードを送りました。10分で期限切れになります。",
  "Use a different email": "別のメールを使う",
  "Verification code": "確認コード",
  "Verify and continue": "確認して続ける",
  "Email me a sign-in code": "ログインコードをメールで受け取る",
  "Send again in {count}s": "{count}秒後に再送",
  "Send again": "もう一度送る",
  "Enter a valid email address.": "有効なメールアドレスを入力してください。",
  "Email sign-in is temporarily unavailable.":
    "メールログインは一時的に利用できません。",
  "We sent a fresh code.": "新しいコードを送りました。",
  "Check your email for the code.": "メールでコードを確認してください。",
  "Enter the 8-digit code.": "8桁のコードを入力してください。",
  "That code is invalid or expired. Request a new one.":
    "コードが無効か期限切れです。新しいコードをリクエストしてください。",
  "Couldn't verify that code.": "コードを確認できませんでした。",
  "Couldn't send the code.": "コードを送信できませんでした。",
  "Your email protects your private Dating Agent and is never shown to another user. After sign-in, adults review the required agreements before onboarding.":
    "メールは非公開のデートエージェントを守り、他のユーザーには表示されません。ログイン後、18歳以上であることと必須規約をオンボーディング前に確認します。",
});

Object.assign(de, {
  "Continue with Google": "Mit Google fortfahren",
  "Continue with Apple": "Mit Apple fortfahren",
  "or use email": "oder E-Mail verwenden",
  "No password to remember.": "Kein Passwort zum Merken.",
  "Check your inbox": "Prüfe deinen Posteingang",
  "We sent an 8-digit code to {email}. It expires in 10 minutes.":
    "Wir haben einen achtstelligen Code an {email} gesendet. Er läuft in 10 Minuten ab.",
  "Use a different email": "Andere E-Mail verwenden",
  "Verification code": "Bestätigungscode",
  "Verify and continue": "Bestätigen und fortfahren",
  "Email me a sign-in code": "Anmeldecode per E-Mail senden",
  "Send again in {count}s": "In {count} Sek. erneut senden",
  "Send again": "Erneut senden",
  "Enter a valid email address.": "Gib eine gültige E-Mail-Adresse ein.",
  "Email sign-in is temporarily unavailable.":
    "Die E-Mail-Anmeldung ist vorübergehend nicht verfügbar.",
  "We sent a fresh code.": "Wir haben einen neuen Code gesendet.",
  "Check your email for the code.": "Prüfe deine E-Mail auf den Code.",
  "Enter the 8-digit code.": "Gib den achtstelligen Code ein.",
  "That code is invalid or expired. Request a new one.":
    "Der Code ist ungültig oder abgelaufen. Fordere einen neuen an.",
  "Couldn't verify that code.": "Der Code konnte nicht bestätigt werden.",
  "Couldn't send the code.": "Der Code konnte nicht gesendet werden.",
  "Your email protects your private Dating Agent and is never shown to another user. After sign-in, adults review the required agreements before onboarding.":
    "Deine E-Mail schützt deinen privaten Dating-Agenten und wird anderen nie angezeigt. Nach der Anmeldung bestätigen Erwachsene die Pflichtvereinbarungen vor dem Onboarding.",
});

Object.assign(fr, {
  "Continue with Google": "Continuer avec Google",
  "Continue with Apple": "Continuer avec Apple",
  "or use email": "ou utiliser l’e-mail",
  "No password to remember.": "Aucun mot de passe à mémoriser.",
  "Check your inbox": "Consultez votre boîte de réception",
  "We sent an 8-digit code to {email}. It expires in 10 minutes.":
    "Nous avons envoyé un code à 8 chiffres à {email}. Il expire dans 10 minutes.",
  "Use a different email": "Utiliser une autre adresse",
  "Verification code": "Code de vérification",
  "Verify and continue": "Vérifier et continuer",
  "Email me a sign-in code": "Recevoir un code de connexion",
  "Send again in {count}s": "Renvoyer dans {count} s",
  "Send again": "Renvoyer",
  "Enter a valid email address.": "Saisissez une adresse e-mail valide.",
  "Email sign-in is temporarily unavailable.":
    "La connexion par e-mail est temporairement indisponible.",
  "We sent a fresh code.": "Nous avons envoyé un nouveau code.",
  "Check your email for the code.": "Consultez votre e-mail pour le code.",
  "Enter the 8-digit code.": "Saisissez le code à 8 chiffres.",
  "That code is invalid or expired. Request a new one.":
    "Ce code est invalide ou expiré. Demandez-en un nouveau.",
  "Couldn't verify that code.": "Impossible de vérifier ce code.",
  "Couldn't send the code.": "Impossible d’envoyer le code.",
  "Your email protects your private Dating Agent and is never shown to another user. After sign-in, adults review the required agreements before onboarding.":
    "Votre e-mail protège votre Agent de rencontre privé et n’est jamais montré aux autres. Après connexion, les adultes valident les accords requis avant l’intégration.",
});

Object.assign(nl, {
  "Continue with Google": "Doorgaan met Google",
  "Continue with Apple": "Doorgaan met Apple",
  "or use email": "of gebruik e-mail",
  "No password to remember.": "Geen wachtwoord om te onthouden.",
  "Check your inbox": "Controleer je inbox",
  "We sent an 8-digit code to {email}. It expires in 10 minutes.":
    "We stuurden een achtcijferige code naar {email}. Deze verloopt over 10 minuten.",
  "Use a different email": "Ander e-mailadres gebruiken",
  "Verification code": "Verificatiecode",
  "Verify and continue": "Verifiëren en doorgaan",
  "Email me a sign-in code": "Stuur mij een inlogcode",
  "Send again in {count}s": "Opnieuw sturen over {count}s",
  "Send again": "Opnieuw sturen",
  "Enter a valid email address.": "Voer een geldig e-mailadres in.",
  "Email sign-in is temporarily unavailable.":
    "Inloggen via e-mail is tijdelijk niet beschikbaar.",
  "We sent a fresh code.": "We hebben een nieuwe code gestuurd.",
  "Check your email for the code.": "Controleer je e-mail voor de code.",
  "Enter the 8-digit code.": "Voer de achtcijferige code in.",
  "That code is invalid or expired. Request a new one.":
    "De code is ongeldig of verlopen. Vraag een nieuwe aan.",
  "Couldn't verify that code.": "De code kon niet worden geverifieerd.",
  "Couldn't send the code.": "De code kon niet worden verstuurd.",
  "Your email protects your private Dating Agent and is never shown to another user. After sign-in, adults review the required agreements before onboarding.":
    "Je e-mail beschermt je privé-datingagent en wordt nooit aan anderen getoond. Na het inloggen beoordelen volwassenen de vereiste afspraken vóór de onboarding.",
});

Object.assign(sv, {
  "Continue with Google": "Fortsätt med Google",
  "Continue with Apple": "Fortsätt med Apple",
  "or use email": "eller använd e-post",
  "No password to remember.": "Inget lösenord att komma ihåg.",
  "Check your inbox": "Kontrollera din inkorg",
  "We sent an 8-digit code to {email}. It expires in 10 minutes.":
    "Vi skickade en åttasiffrig kod till {email}. Den går ut om 10 minuter.",
  "Use a different email": "Använd en annan e-postadress",
  "Verification code": "Verifieringskod",
  "Verify and continue": "Verifiera och fortsätt",
  "Email me a sign-in code": "Skicka en inloggningskod",
  "Send again in {count}s": "Skicka igen om {count}s",
  "Send again": "Skicka igen",
  "Enter a valid email address.": "Ange en giltig e-postadress.",
  "Email sign-in is temporarily unavailable.":
    "E-postinloggning är tillfälligt otillgänglig.",
  "We sent a fresh code.": "Vi skickade en ny kod.",
  "Check your email for the code.": "Kontrollera din e-post efter koden.",
  "Enter the 8-digit code.": "Ange den åttasiffriga koden.",
  "That code is invalid or expired. Request a new one.":
    "Koden är ogiltig eller har gått ut. Begär en ny.",
  "Couldn't verify that code.": "Det gick inte att verifiera koden.",
  "Couldn't send the code.": "Det gick inte att skicka koden.",
  "Your email protects your private Dating Agent and is never shown to another user. After sign-in, adults review the required agreements before onboarding.":
    "Din e-post skyddar din privata dejtingagent och visas aldrig för andra. Efter inloggning granskar vuxna de obligatoriska avtalen före introduktionen.",
});

Object.assign(ko, {
  "A question from {agent}": "{agent}의 질문",
  "Your honest answer": "솔직한 답변",
  "Answer like you're talking to someone who knows you…":
    "나를 잘 아는 사람에게 말하듯 답해보세요…",
  "Not now": "나중에",
  "Let {agent} learn this": "{agent}에게 알려주기",
});
Object.assign(ja, {
  "A question from {agent}": "{agent}からの質問",
  "Your honest answer": "率直な答え",
  "Answer like you're talking to someone who knows you…":
    "あなたをよく知る人に話すように答えてください…",
  "Not now": "今はしない",
  "Let {agent} learn this": "{agent}に覚えてもらう",
});
Object.assign(de, {
  "A question from {agent}": "Eine Frage von {agent}",
  "Your honest answer": "Deine ehrliche Antwort",
  "Answer like you're talking to someone who knows you…":
    "Antworte, als würdest du mit jemandem sprechen, der dich kennt…",
  "Not now": "Nicht jetzt",
  "Let {agent} learn this": "{agent} soll das lernen",
});
Object.assign(fr, {
  "A question from {agent}": "Une question de {agent}",
  "Your honest answer": "Ta réponse sincère",
  "Answer like you're talking to someone who knows you…":
    "Réponds comme à quelqu’un qui te connaît vraiment…",
  "Not now": "Pas maintenant",
  "Let {agent} learn this": "Le confier à {agent}",
});
Object.assign(nl, {
  "A question from {agent}": "Een vraag van {agent}",
  "Your honest answer": "Je eerlijke antwoord",
  "Answer like you're talking to someone who knows you…":
    "Antwoord alsof je praat met iemand die je echt kent…",
  "Not now": "Niet nu",
  "Let {agent} learn this": "Laat {agent} dit leren",
});
Object.assign(sv, {
  "A question from {agent}": "En fråga från {agent}",
  "Your honest answer": "Ditt ärliga svar",
  "Answer like you're talking to someone who knows you…":
    "Svara som om du pratade med någon som verkligen känner dig…",
  "Not now": "Inte nu",
  "Let {agent} learn this": "Låt {agent} lära sig detta",
});

Object.assign(ko, {
  "The debrief keeps learning": "리포트는 대화하며 더 정확해져요",
  "Challenge the verdict or tell {agent} what felt right. Your reaction becomes private context for the next search.":
    "판단에 반박하거나 잘 짚은 점을 {agent}에게 말해주세요. 내 반응은 다음 탐색을 위한 비공개 기억이 됩니다.",
  "Talk this date over with {agent}": "{agent}에게 이 데이트 이야기하기",
  "What should you carry into the next search?":
    "다음 탐색에 꼭 반영할 점은 뭐야?",
  "Here's what your debrief got wrong:": "이 리포트가 잘못 본 점은:",
  "I think I want to meet them.": "그래, 이 사람은 한번 만나보고 싶어.",
  "Your decision, not your Dating Agent's": "데이트 에이전트가 아닌, 나의 결정",
  "Shall I send your introduction request to {person}?":
    "{person}님에게 연결 요청을 보낼까요?",
  "Your message helps {agent} understand you, but only the button below counts as consent. Your answer stays sealed unless both people say yes.":
    "이 말은 에이전트 {agent}의 이해에 반영돼요. 실제 동의는 아래 버튼을 눌러야만 완료되며, 두 사람 모두 동의하기 전까지 내 답은 비공개예요.",
  "Yes, send my introduction request →": "네, 연결 요청 보내기 →",
  "Not yet — keep talking": "아직은 아니야 — 더 이야기하기",
  "You both said yes. The introduction is open.":
    "두 사람 모두 동의했어요. 연결이 열렸습니다.",
  "Your yes is sealed.": "내 답은 비공개로 보관 중이에요.",
  "Open the full debrief to see the shared contact.":
    "전체 리포트에서 공개된 연락처를 확인하세요.",
  "This demo completed the full two-person consent flow.":
    "데모에서 두 사람의 동의 흐름이 끝까지 완료됐어요.",
  "We won't reveal whether the other person has answered unless they also say yes.":
    "상대도 동의하기 전에는 상대의 답변 여부를 공개하지 않아요.",
  "Debrief open": "리포트 대화 중",
  Close: "닫기",
  "Back to the full debrief": "전체 리포트로 돌아가기",
  "Date debrief": "데이트 리포트",
  "Ask what your Dating Agent noticed, or correct the debrief…":
    "데이트 에이전트가 무엇을 봤는지 묻거나 리포트를 교정해보세요…",
});
Object.assign(ja, {
  "The debrief keeps learning": "レポートは対話でさらに正確になります",
  "Challenge the verdict or tell {agent} what felt right. Your reaction becomes private context for the next search.":
    "判断に異議を伝えたり、{agent}が正しく捉えた点を教えてください。反応は次の探索の非公開コンテキストになります。",
  "Talk this date over with {agent}": "{agent}とこのデートを振り返る",
  "What should you carry into the next search?": "次の探索に何を反映すべき？",
  "Here's what your debrief got wrong:": "このレポートが違っていた点：",
  "I think I want to meet them.": "この人に会ってみたい。",
  "Your decision, not your Dating Agent's": "デートエージェントではなく、あなたの決定",
  "Shall I send your introduction request to {person}?":
    "{person}さんに紹介リクエストを送りますか？",
  "Your message helps {agent} understand you, but only the button below counts as consent. Your answer stays sealed unless both people say yes.":
    "この言葉は{agent}があなたを理解する助けになります。実際の同意は下のボタンでのみ成立し、ふたりが同意するまで回答は非公開です。",
  "Yes, send my introduction request →": "はい、紹介を希望します →",
  "Not yet — keep talking": "まだ決めない — もう少し話す",
  "You both said yes. The introduction is open.":
    "ふたりとも同意しました。紹介が開きました。",
  "Your yes is sealed.": "あなたの回答は非公開で保管中です。",
  "Open the full debrief to see the shared contact.":
    "全レポートで共有された連絡先を確認してください。",
  "This demo completed the full two-person consent flow.":
    "デモでふたりの同意フローが最後まで完了しました。",
  "We won't reveal whether the other person has answered unless they also say yes.":
    "相手も同意するまで、相手の回答状況は公開しません。",
  "Debrief open": "レポートについて対話中",
  Close: "閉じる",
  "Back to the full debrief": "レポート全体に戻る",
  "Date debrief": "デートレポート",
  "Ask what your Dating Agent noticed, or correct the debrief…":
    "デートエージェントが気づいたことを聞くか、レポートを修正してください…",
});
Object.assign(de, {
  "The debrief keeps learning": "Der Bericht lernt im Gespräch weiter",
  "Challenge the verdict or tell {agent} what felt right. Your reaction becomes private context for the next search.":
    "Hinterfrage das Urteil oder sage {agent}, was stimmig war. Deine Reaktion wird privater Kontext für die nächste Suche.",
  "Talk this date over with {agent}": "Dieses Date mit {agent} besprechen",
  "What should you carry into the next search?":
    "Was solltest du in die nächste Suche mitnehmen?",
  "Here's what your debrief got wrong:": "Das hat dein Bericht falsch gesehen:",
  "I think I want to meet them.": "Ich glaube, ich möchte die Person treffen.",
  "Your decision, not your Dating Agent's":
    "Deine Entscheidung, nicht die deines Dating-Agenten",
  "Shall I send your introduction request to {person}?":
    "Soll ich deine Kontaktanfrage an {person} senden?",
  "Your message helps {agent} understand you, but only the button below counts as consent. Your answer stays sealed unless both people say yes.":
    "Deine Nachricht hilft {agent}, dich zu verstehen. Als Zustimmung zählt nur der Button unten. Deine Antwort bleibt verborgen, bis beide Ja sagen.",
  "Yes, send my introduction request →": "Ja, Kontaktanfrage senden →",
  "Not yet — keep talking": "Noch nicht — weiterreden",
  "You both said yes. The introduction is open.":
    "Ihr habt beide Ja gesagt. Der Kontakt ist geöffnet.",
  "Your yes is sealed.": "Dein Ja bleibt vertraulich versiegelt.",
  "Open the full debrief to see the shared contact.":
    "Öffne den vollständigen Bericht, um den geteilten Kontakt zu sehen.",
  "This demo completed the full two-person consent flow.":
    "Die Demo hat den vollständigen Zustimmungsablauf durchlaufen.",
  "We won't reveal whether the other person has answered unless they also say yes.":
    "Wir zeigen nicht, ob die andere Person geantwortet hat, solange sie nicht ebenfalls Ja sagt.",
  "Debrief open": "Bericht im Gespräch",
  Close: "Schließen",
  "Back to the full debrief": "Zurück zum vollständigen Bericht",
  "Date debrief": "Date-Bericht",
  "Ask what your Dating Agent noticed, or correct the debrief…":
    "Frage, was dein Dating-Agent bemerkt hat, oder korrigiere den Bericht…",
});
Object.assign(fr, {
  "The debrief keeps learning": "Le compte rendu apprend avec vous",
  "Challenge the verdict or tell {agent} what felt right. Your reaction becomes private context for the next search.":
    "Conteste le verdict ou dis à {agent} ce qui sonnait juste. Ta réaction devient un contexte privé pour la prochaine recherche.",
  "Talk this date over with {agent}": "Parler de ce rendez-vous avec {agent}",
  "What should you carry into the next search?":
    "Que dois-tu retenir pour la prochaine recherche ?",
  "Here's what your debrief got wrong:":
    "Voici ce que le compte rendu a mal compris :",
  "I think I want to meet them.":
    "Je crois que j’aimerais rencontrer cette personne.",
  "Your decision, not your Dating Agent's": "Votre décision, pas celle de votre Agent de rencontre",
  "Shall I send your introduction request to {person}?":
    "Envoyer votre demande de mise en relation à {person} ?",
  "Your message helps {agent} understand you, but only the button below counts as consent. Your answer stays sealed unless both people say yes.":
    "Votre message aide {agent} à vous comprendre, mais seul le bouton ci-dessous vaut consentement. Votre réponse reste secrète tant que les deux personnes n’ont pas dit oui.",
  "Yes, send my introduction request →": "Oui, envoyer ma demande →",
  "Not yet — keep talking": "Pas encore — continuer à parler",
  "You both said yes. The introduction is open.":
    "Vous avez tous les deux dit oui. La mise en relation est ouverte.",
  "Your yes is sealed.": "Votre oui est conservé en privé.",
  "Open the full debrief to see the shared contact.":
    "Ouvrez le compte rendu complet pour voir le contact partagé.",
  "This demo completed the full two-person consent flow.":
    "La démo a terminé tout le parcours de double consentement.",
  "We won't reveal whether the other person has answered unless they also say yes.":
    "Nous ne révélons pas la réponse de l’autre personne tant qu’elle n’a pas également dit oui.",
  "Debrief open": "Compte rendu en discussion",
  Close: "Fermer",
  "Back to the full debrief": "Retour au compte rendu complet",
  "Date debrief": "Compte rendu du rendez-vous",
  "Ask what your Dating Agent noticed, or correct the debrief…":
    "Demande ce que ton Agent de rencontre a remarqué ou corrige le compte rendu…",
});
Object.assign(nl, {
  "The debrief keeps learning": "Het verslag leert verder in gesprek",
  "Challenge the verdict or tell {agent} what felt right. Your reaction becomes private context for the next search.":
    "Trek het oordeel in twijfel of vertel {agent} wat klopte. Je reactie wordt privécontext voor de volgende zoektocht.",
  "Talk this date over with {agent}": "Deze date bespreken met {agent}",
  "What should you carry into the next search?":
    "Wat moet je meenemen naar de volgende zoektocht?",
  "Here's what your debrief got wrong:": "Dit zag je verslag verkeerd:",
  "I think I want to meet them.": "Ik denk dat ik deze persoon wil ontmoeten.",
  "Your decision, not your Dating Agent's": "Jouw beslissing, niet die van je datingagent",
  "Shall I send your introduction request to {person}?":
    "Zal ik je kennismakingsverzoek naar {person} sturen?",
  "Your message helps {agent} understand you, but only the button below counts as consent. Your answer stays sealed unless both people say yes.":
    "Je bericht helpt {agent} je begrijpen, maar alleen de knop hieronder geldt als toestemming. Je antwoord blijft verborgen tot jullie allebei ja zeggen.",
  "Yes, send my introduction request →": "Ja, stuur mijn verzoek →",
  "Not yet — keep talking": "Nog niet — verder praten",
  "You both said yes. The introduction is open.":
    "Jullie zeiden allebei ja. De kennismaking is geopend.",
  "Your yes is sealed.": "Jouw ja wordt privé bewaard.",
  "Open the full debrief to see the shared contact.":
    "Open het volledige verslag om het gedeelde contact te zien.",
  "This demo completed the full two-person consent flow.":
    "De demo heeft de volledige toestemmingsflow afgerond.",
  "We won't reveal whether the other person has answered unless they also say yes.":
    "We laten pas zien of de ander antwoordde wanneer die ook ja zegt.",
  "Debrief open": "Verslag in gesprek",
  Close: "Sluiten",
  "Back to the full debrief": "Terug naar het volledige verslag",
  "Date debrief": "Dateverslag",
  "Ask what your Dating Agent noticed, or correct the debrief…":
    "Vraag wat je datingagent opviel of corrigeer het verslag…",
});
Object.assign(sv, {
  "The debrief keeps learning": "Rapporten lär sig vidare i samtalet",
  "Challenge the verdict or tell {agent} what felt right. Your reaction becomes private context for the next search.":
    "Ifrågasätt omdömet eller berätta för {agent} vad som kändes rätt. Din reaktion blir privat kontext för nästa sökning.",
  "Talk this date over with {agent}": "Prata igenom dejten med {agent}",
  "What should you carry into the next search?":
    "Vad ska du ta med dig till nästa sökning?",
  "Here's what your debrief got wrong:": "Det här missförstod rapporten:",
  "I think I want to meet them.": "Jag tror att jag vill träffa personen.",
  "Your decision, not your Dating Agent's": "Ditt beslut, inte din dejtingagents",
  "Shall I send your introduction request to {person}?":
    "Ska jag skicka din kontaktförfrågan till {person}?",
  "Your message helps {agent} understand you, but only the button below counts as consent. Your answer stays sealed unless both people say yes.":
    "Ditt meddelande hjälper {agent} att förstå dig, men bara knappen nedan räknas som samtycke. Ditt svar förblir dolt tills båda säger ja.",
  "Yes, send my introduction request →": "Ja, skicka min förfrågan →",
  "Not yet — keep talking": "Inte än — fortsätt prata",
  "You both said yes. The introduction is open.":
    "Ni har båda sagt ja. Kontakten är öppen.",
  "Your yes is sealed.": "Ditt ja förvaras privat.",
  "Open the full debrief to see the shared contact.":
    "Öppna hela rapporten för att se den delade kontakten.",
  "This demo completed the full two-person consent flow.":
    "Demon slutförde hela samtyckesflödet för två personer.",
  "We won't reveal whether the other person has answered unless they also say yes.":
    "Vi visar inte om den andra personen har svarat förrän även den säger ja.",
  "Debrief open": "Rapporten diskuteras",
  Close: "Stäng",
  "Back to the full debrief": "Tillbaka till hela rapporten",
  "Date debrief": "Dejtrapport",
  "Ask what your Dating Agent noticed, or correct the debrief…":
    "Fråga vad din dejtingagent lade märke till eller korrigera rapporten…",
});

/* Named-agent identity and the live product tour. The public tour is rendered
   in the selected locale instead of baking one language into screenshots. */
Object.assign(ko, {
  "I turn tiny plans into adventures.":
    "나는 소소한 계획도 모험으로 만들어.",
  "I'd love that — as long as it feels easy.":
    "나도 좋아. 마음만 편하다면 말이야.",
  "back from the date": "데이트에서 돌아옴",
  "I'm back! I have so much to tell you.": "나 왔어! 할 얘기 진짜 많아.",
});

/* Restored strings emitted by convex/ and localized client-side. */
Object.assign(ko, {
  "Photos must be under 6MB.": "사진은 6MB보다 작아야 해요.",
  "Your email address": "내 이메일 주소",
  "Your phone number": "내 전화번호",
  "Your exact address or coordinates": "내 정확한 주소 또는 좌표",
  "Your date of birth": "내 생년월일",
  "Your full name (we only show your first name)": "내 성명(이름만 표시)",
  "Open the Safety Center": "안전 센터 열기",
});

/* Restored strings emitted by convex/ and localized client-side. */
Object.assign(ja, {
  "Photos must be under 6MB.": "写真は6MB未満にしてください。",
  "Your email address": "あなたのメールアドレス",
  "Your phone number": "あなたの電話番号",
  "Your exact address or coordinates": "正確な住所や座標",
  "Your date of birth": "生年月日",
  "Your full name (we only show your first name)": "氏名（名前のみ表示）",
  "Open the Safety Center": "安全センターを開く",
});

/* Restored strings emitted by convex/ and localized client-side. */
Object.assign(de, {
  "Photos must be under 6MB.": "Fotos müssen kleiner als 6 MB sein.",
  "Your email address": "Deine E-Mail-Adresse",
  "Your phone number": "Deine Telefonnummer",
  "Your exact address or coordinates": "Deine genaue Adresse oder Koordinaten",
  "Your date of birth": "Dein Geburtsdatum",
  "Your full name (we only show your first name)":
    "Dein vollständiger Name (wir zeigen nur den Vornamen)",
  "Open the Safety Center": "Sicherheitscenter öffnen",
});

/* Restored strings emitted by convex/ and localized client-side. */
Object.assign(fr, {
  "Photos must be under 6MB.": "Les photos doivent faire moins de 6 Mo.",
  "Your email address": "Votre adresse e-mail",
  "Your phone number": "Votre numéro de téléphone",
  "Your exact address or coordinates":
    "Votre adresse exacte ou vos coordonnées",
  "Your date of birth": "Votre date de naissance",
  "Your full name (we only show your first name)":
    "Votre nom complet (seul le prénom est montré)",
  "Open the Safety Center": "Ouvrir le centre de sécurité",
});

/* Restored strings emitted by convex/ and localized client-side. */
Object.assign(nl, {
  "Photos must be under 6MB.": "Foto’s moeten kleiner zijn dan 6 MB.",
  "Your email address": "Je e-mailadres",
  "Your phone number": "Je telefoonnummer",
  "Your exact address or coordinates": "Je exacte adres of coördinaten",
  "Your date of birth": "Je geboortedatum",
  "Your full name (we only show your first name)":
    "Je volledige naam (we tonen alleen je voornaam)",
  "Open the Safety Center": "Veiligheidscentrum openen",
});

/* Restored strings emitted by convex/ and localized client-side. */
Object.assign(sv, {
  "Photos must be under 6MB.": "Bilder måste vara mindre än 6 MB.",
  "Your email address": "Din e-postadress",
  "Your phone number": "Ditt telefonnummer",
  "Your exact address or coordinates": "Din exakta adress eller koordinater",
  "Your date of birth": "Ditt födelsedatum",
  "Your full name (we only show your first name)":
    "Ditt fullständiga namn (vi visar bara förnamnet)",
  "Open the Safety Center": "Öppna säkerhetscentret",
});
export const PACKS: Partial<Record<LocaleCode, TranslationPack>> = {
  "ko-KR": ko,
  "ja-JP": ja,
  "de-DE": de,
  "fr-FR": fr,
  "nl-NL": nl,
  "sv-SE": sv,
};

export const CORE_TRANSLATION_MESSAGES = Object.freeze(Object.keys(de));

/* Agent workspace copy is kept together so every supported non-English locale
   receives new dashboard and live-date states at the same time. These strings
   are intentionally outside CORE_TRANSLATION_MESSAGES: the older core baseline
   stays stable while this product surface can evolve quickly. */
export const agentWorkspaceCopy: Record<
  string,
  readonly [string, string, string, string, string, string]
> = {
  "When a conversation goes wrong, what kind of repair feels sincere to you?": [
    "대화가 어긋났을 때, 상대가 어떻게 풀어주면 진심이라고 느끼나요?",
    "会話がすれ違ったとき、どんな歩み寄りに誠実さを感じますか？",
    "Wenn ein Gespräch schiefläuft: Welche Art der Wiedergutmachung fühlt sich für dich ehrlich an?",
    "Quand une conversation dérape, quelle façon de réparer te paraît sincère ?",
    "Als een gesprek misloopt, welke manier van herstellen voelt voor jou oprecht?",
    "När ett samtal går fel, vilken sorts försök att reda ut det känns uppriktigt för dig?",
  ],
  "After a full social day, do you want quiet company nearby or real solitude?":
    [
      "사람들과 오래 보낸 날엔 조용히 곁에 있어 줄 사람이 좋은가요, 아니면 완전한 혼자만의 시간이 필요한가요?",
      "人と長く過ごした日のあと、静かにそばにいてほしいですか、それとも完全に一人になりたいですか？",
      "Willst du nach einem langen sozialen Tag ruhige Gesellschaft oder wirklich allein sein?",
      "Après une journée très sociale, préfères-tu une présence calme ou être vraiment seul ?",
      "Wil je na een volle sociale dag rustig gezelschap in de buurt, of echt alleen zijn?",
      "Efter en socialt intensiv dag, vill du ha tyst sällskap nära eller vara helt ensam?",
    ],
  "What small gesture makes you feel chosen without making you feel crowded?": [
    "부담스럽지 않으면서도 ‘나를 선택했구나’ 느끼게 하는 작은 행동은 뭔가요?",
    "重く感じずに『選ばれている』と思える小さな行動は何ですか？",
    "Welche kleine Geste gibt dir das Gefühl, gewählt zu sein, ohne dich einzuengen?",
    "Quel petit geste te fait sentir choisi sans te donner l’impression d’être envahi ?",
    "Welk klein gebaar geeft je het gevoel gekozen te zijn zonder dat het benauwt?",
    "Vilken liten gest får dig att känna dig vald utan att det blir trångt?",
  ],
  "What is one small boundary people often misunderstand about you?": [
    "사람들이 자주 오해하는 당신의 작은 경계 하나는 무엇인가요?",
    "人によく誤解される、あなたの小さな境界線は何ですか？",
    "Welche kleine Grenze von dir verstehen andere oft falsch?",
    "Quelle petite limite personnelle est souvent mal comprise chez toi ?",
    "Welke kleine grens van jou begrijpen mensen vaak verkeerd?",
    "Vilken liten gräns hos dig missförstår andra ofta?",
  ],
  "What do you wish someone would ask before making assumptions about you?": [
    "상대가 당신을 지레짐작하기 전에 꼭 물어봐 줬으면 하는 것은 무엇인가요?",
    "決めつける前に、相手に何を聞いてほしいですか？",
    "Was sollte jemand dich fragen, bevor er Annahmen über dich trifft?",
    "Qu’aimerais-tu qu’on te demande avant de tirer des conclusions sur toi ?",
    "Wat zou je willen dat iemand vraagt voordat die aannames over je doet?",
    "Vad önskar du att någon frågade innan de drog slutsatser om dig?",
  ],
  "Which date feels most like you right now: planned, spontaneous, quiet, or playful—and why?":
    [
      "지금 당신다운 데이트는 계획적인 것, 즉흥적인 것, 조용한 것, 장난스러운 것 중 무엇이고 왜 그런가요?",
      "今のあなたらしいデートは、計画的・即興的・静か・遊び心のあるもののどれですか？理由も教えてください。",
      "Welches Date passt gerade zu dir: geplant, spontan, ruhig oder verspielt – und warum?",
      "Quel rendez-vous te ressemble aujourd’hui : organisé, spontané, calme ou joueur — et pourquoi ?",
      "Welke date past nu het best bij jou: gepland, spontaan, rustig of speels — en waarom?",
      "Vilken dejt känns mest som du just nu: planerad, spontan, lugn eller lekfull – och varför?",
    ],
  met: ["만남", "出会い", "traf", "a rencontré", "ontmoette", "träffade"],
  "PLAYABLE DATE REPLAY": [
    "직접 돌려보는 데이트 리플레이",
    "操作できるデートリプレイ",
    "INTERAKTIVE DATE-WIEDERGABE",
    "REPLAY INTERACTIF DU RENDEZ-VOUS",
    "INTERACTIEVE DATE-REPLAY",
    "INTERAKTIV DEJTREPRIS",
  ],
  "Different interests with room for curiosity": [
    "관심사는 다르지만 서로 궁금해할 여지가 있어요",
    "興味は違っても好奇心の余地があります",
    "Unterschiedliche Interessen mit Raum für Neugier",
    "Des intérêts différents, avec de la place pour la curiosité",
    "Andere interesses met ruimte voor nieuwsgierigheid",
    "Olika intressen med utrymme för nyfikenhet",
  ],
  "Personality type was left open": [
    "성격 유형은 열어 두었어요",
    "性格タイプは指定されていません",
    "Persönlichkeitstyp blieb offen",
    "Le type de personnalité reste ouvert",
    "Persoonlijkheidstype bleef open",
    "Personlighetstypen lämnades öppen",
  ],
  "The agents will test the personality fit in conversation": [
    "성격의 합은 에이전트들이 대화로 확인해요",
    "性格の相性は会話で確かめます",
    "Die Agents prüfen die persönliche Passung im Gespräch",
    "Les Agents testent l’entente dans la conversation",
    "De Agents onderzoeken de klik in gesprek",
    "Agenterna prövar personkemin i samtalet",
  ],
  "Relationship intentions can coexist": [
    "두 사람의 관계 기대가 함께 갈 수 있어요",
    "二人の関係への期待は両立できます",
    "Die Beziehungswünsche sind vereinbar",
    "Les intentions relationnelles sont compatibles",
    "De relatie-intenties passen bij elkaar",
    "Relationsönskemålen går att förena",
  ],
  "Your Dating Agent is back": [
    "데이트 에이전트가 돌아왔어요",
    "デートエージェントが戻りました",
    "Dein Dating-Agent ist zurück",
    "Votre Agent de rencontre est de retour",
    "Je datingagent is terug",
    "Din dejtingagent är tillbaka",
  ],
  "Your private Dating Agent": [
    "나만의 데이트 에이전트",
    "あなただけのデートエージェント",
    "Dein privater Dating-Agent",
    "Votre Agent de rencontre privé",
    "Jouw privé-datingagent",
    "Din privata dejtingagent",
  ],
  "{agent}, your dating agent": [
    "{agent}, 나의 데이트 에이전트",
    "{agent}、あなたのデートエージェント",
    "{agent}, dein Dating-Agent",
    "{agent}, votre Agent de rencontre",
    "{agent}, jouw datingagent",
    "{agent}, din dejtingagent",
  ],
  "Talk naturally. Correct what feels off. Every conversation helps {agent} represent the real you.":
    [
      "평소처럼 말하고, 어긋난 부분은 바로잡아 주세요. 대화할수록 진짜 내 모습에 대한 {agent}의 이해가 깊어져요.",
      "自然に話し、違和感は直してください。会話するほど{agent}は本当のあなたを理解します。",
      "Sprich ganz natürlich und korrigiere, was nicht stimmt. Jedes Gespräch hilft {agent}, dich ehrlich zu vertreten.",
      "Parlez naturellement et corrigez ce qui sonne faux. Chaque échange aide {agent} à vous représenter vraiment.",
      "Praat gewoon en corrigeer wat niet klopt. Elk gesprek helpt {agent} de echte jij te vertegenwoordigen.",
      "Prata naturligt och rätta det som känns fel. Varje samtal hjälper {agent} att representera ditt riktiga jag.",
    ],
  "Talk with {agent}": [
    "{agent}에게 말 걸기",
    "{agent}と話す",
    "Mit {agent} sprechen",
    "Parler avec {agent}",
    "Praat met {agent}",
    "Prata med {agent}",
  ],
  "{voice} voice": [
    "{voice} 말투",
    "{voice}な話し方",
    "Stimme: {voice}",
    "Voix {voice}",
    "{voice} stem",
    "{voice} röst",
  ],
  "{mode} mode": [
    "{mode} 모드",
    "{mode}モード",
    "Modus: {mode}",
    "Mode {mode}",
    "{mode}-modus",
    "{mode}-läge",
  ],
  "private memory": [
    "나만의 비공개 기억",
    "非公開メモリー",
    "private Erinnerung",
    "mémoire privée",
    "privégeheugen",
    "privat minne",
  ],
  warm: ["따뜻한", "温かな", "warm", "chaleureuse", "warm", "varm"],
  playful: [
    "유쾌한",
    "遊び心のある",
    "spielerisch",
    "joueuse",
    "speels",
    "lekfull",
  ],
  direct: ["솔직한", "率直な", "direkt", "directe", "direct", "direkt"],
  quiet: ["차분한", "穏やかな", "ruhig", "calme", "rustig", "lugn"],
  observe: [
    "관찰",
    "観察",
    "beobachten",
    "observer",
    "observeren",
    "observera",
  ],
  suggest: [
    "제안",
    "提案",
    "vorschlagen",
    "suggérer",
    "voorstellen",
    "föreslå",
  ],
  advocate: [
    "적극 추천",
    "後押し",
    "befürworten",
    "défendre",
    "aanmoedigen",
    "förespråka",
  ],
  "{agent} is out meeting someone.": [
    "{agent}, 지금 데이트 중이에요.",
    "{agent}は今、誰かに会っています。",
    "{agent} trifft gerade jemanden.",
    "{agent} rencontre quelqu’un en ce moment.",
    "{agent} ontmoet nu iemand.",
    "{agent} träffar någon just nu.",
  ],
  "Watch the date live →": [
    "데이트 실시간으로 보기 →",
    "デートをライブで見る →",
    "Date live ansehen →",
    "Voir le rendez-vous en direct →",
    "Bekijk de date live →",
    "Se dejten live →",
  ],
  "Read the private debrief →": [
    "비공개 리포트 읽기 →",
    "非公開レポートを読む →",
    "Privaten Bericht lesen →",
    "Lire le compte rendu privé →",
    "Lees het privéverslag →",
    "Läs den privata rapporten →",
  ],
  "Send {agent} scouting →": [
    "{agent} 탐색 보내기 →",
    "{agent}を探索へ →",
    "{agent} losschicken →",
    "Envoyer {agent} en exploration →",
    "Stuur {agent} op pad →",
    "Skicka ut {agent} →",
  ],
  "How your scout works": [
    "에이전트 탐색 흐름",
    "探索の流れ",
    "So funktioniert die Suche",
    "Comment fonctionne l’exploration",
    "Zo werkt de zoektocht",
    "Så fungerar sökningen",
  ],
  "Briefed by you": [
    "내가 알려준 것",
    "あなたからのブリーフィング",
    "Von dir gebrieft",
    "Briefé par vous",
    "Door jou gebrieft",
    "Briefad av dig",
  ],
  "Agent, ideal person, honest profile": [
    "에이전트 · 이상형 · 솔직한 내 모습",
    "エージェント・理想の相手・正直な自分",
    "Agent, Wunschperson, ehrliches Profil",
    "Agent, personne idéale, profil sincère",
    "Agent, ideale persoon, eerlijk profiel",
    "Agent, ideal person, ärlig profil",
  ],
  "Scouts the agent world": [
    "데이트 월드 탐색",
    "エージェント世界を探索",
    "Erkundet die Agent-Welt",
    "Explore le monde des Agents",
    "Verkent de agentwereld",
    "Utforskar agentvärlden",
  ],
  "Watch the date unfold moment by moment": [
    "대화가 이어지는 모습을 실시간으로 지켜봐요",
    "会話が進む様子をリアルタイムで見る",
    "Das Date Moment für Moment verfolgen",
    "Suivez la conversation en direct",
    "Volg het gesprek live",
    "Följ samtalet live",
  ],
  "Returns with a case": [
    "솔직한 판단과 함께 귀환",
    "率直な判断とともに帰還",
    "Kehrt mit einer Einschätzung zurück",
    "Revient avec un avis",
    "Keert terug met een oordeel",
    "Återvänder med en bedömning",
  ],
  "Private debrief, then two human yeses": [
    "비공개 리포트, 그리고 두 사람의 동의",
    "非公開レポート、そして二人の同意",
    "Privater Bericht, dann zwei menschliche Jas",
    "Compte rendu privé, puis deux accords humains",
    "Privéverslag, daarna twee menselijke ja’s",
    "Privat rapport, sedan två mänskliga ja",
  ],
  "Private line": [
    "나와 에이전트만의 대화",
    "あなたとエージェントだけの会話",
    "Private Verbindung",
    "Ligne privée",
    "Privélijn",
    "Privat linje",
  ],
  "only you can read this": [
    "나만 볼 수 있어요",
    "あなただけが読めます",
    "nur du kannst das lesen",
    "vous seul pouvez lire ceci",
    "alleen jij kunt dit lezen",
    "bara du kan läsa detta",
  ],
  "{agent} is thinking, not typing…": [
    "{agent}, 답을 고르고 있어요…",
    "{agent}は答えを考えています…",
    "{agent} denkt nach…",
    "{agent} réfléchit…",
    "{agent} denkt na…",
    "{agent} tänker…",
  ],
  "Try asking": [
    "이렇게 물어보세요",
    "こんなふうに聞いてみる",
    "Frag zum Beispiel",
    "Essayez de demander",
    "Probeer te vragen",
    "Prova att fråga",
  ],
  Send: ["보내기", "送信", "Senden", "Envoyer", "Versturen", "Skicka"],
  you: ["나", "あなた", "du", "vous", "jij", "du"],
  "next date": [
    "다음 데이트",
    "次のデート",
    "nächstes Date",
    "prochain rendez-vous",
    "volgende date",
    "nästa dejt",
  ],
  "What {agent} remembers": [
    "{agent}의 기억",
    "{agent}が覚えていること",
    "Was {agent} behält",
    "Ce que {agent} retient",
    "Wat {agent} onthoudt",
    "Vad {agent} minns",
  ],
  "Nothing distilled yet. Your corrections will become private memory here.": [
    "아직 정리된 기억이 없어요. 내가 바로잡아 준 내용이 여기에 비공개로 쌓여요.",
    "まだ整理された記憶はありません。あなたの訂正がここに非公開で蓄積されます。",
    "Noch nichts verdichtet. Deine Korrekturen werden hier zur privaten Erinnerung.",
    "Rien n’est encore synthétisé. Vos corrections formeront ici une mémoire privée.",
    "Nog niets samengevat. Je correcties worden hier privégeheugen.",
    "Inget har sammanfattats än. Dina rättelser blir privat minne här.",
  ],
  "Learned from Agent dates": [
    "에이전트 데이트에서 배운 점",
    "エージェントデートで学んだこと",
    "Aus Agent-Dates gelernt",
    "Appris des rendez-vous d’Agents",
    "Geleerd van agentdates",
    "Lärt från Agent-dejter",
  ],
  "Private to you": [
    "나만 볼 수 있음",
    "あなたにだけ非公開",
    "Privat für dich",
    "Privé pour vous",
    "Privé voor jou",
    "Privat för dig",
  ],
  "Please correct or forget this memory: ": [
    "이 기억을 바로잡거나 잊어줘: ",
    "この記憶を直すか忘れて：",
    "Bitte korrigiere oder vergiss diese Erinnerung: ",
    "Corrige ou oublie ce souvenir : ",
    "Corrigeer of vergeet deze herinnering: ",
    "Rätta eller glöm detta minne: ",
  ],
  "Correct this memory →": [
    "기억 바로잡기 →",
    "記憶を直す →",
    "Erinnerung korrigieren →",
    "Corriger ce souvenir →",
    "Herinnering corrigeren →",
    "Rätta minnet →",
  ],
  "Field notes": [
    "에이전트의 기록",
    "エージェントの記録",
    "Feldnotizen",
    "Carnet de terrain",
    "Veldnotities",
    "Fältanteckningar",
  ],
  "Agent dates": [
    "에이전트 데이트",
    "エージェントデート",
    "Agent-Dates",
    "Rendez-vous d’Agents",
    "Agentdates",
    "Agent-dejter",
  ],
  "{count} total": [
    "총 {count}개",
    "全{count}件",
    "{count} insgesamt",
    "{count} au total",
    "{count} totaal",
    "{count} totalt",
  ],
  "No stories yet.": [
    "아직 데이트 기록이 없어요.",
    "まだデートの記録はありません。",
    "Noch keine Geschichten.",
    "Pas encore d’histoire.",
    "Nog geen verhalen.",
    "Inga berättelser än.",
  ],
  "Your first Dating Agent date will appear here as a transcript and an honest private debrief.":
    [
      "첫 데이트 에이전트 데이트가 시작되면 대화 기록과 솔직한 비공개 리포트가 여기에 남아요.",
      "最初のデートエージェントとのデートは会話記録と率直な非公開レポートとしてここに表示されます。",
      "Das erste Date deines Dating-Agenten erscheint hier als Transkript und ehrlicher privater Bericht.",
      "Le premier rendez-vous de votre Agent de rencontre apparaîtra ici avec la conversation et un compte rendu privé.",
      "De eerste date van je datingagent verschijnt hier als transcript en eerlijk privéverslag.",
      "Din dejtingagents första dejt visas här som transkript och ärlig privat rapport.",
    ],
  "Preparing the date world": [
    "데이트 월드 준비 중",
    "デートワールドを準備中",
    "Date-Welt wird vorbereitet",
    "Préparation du monde du rendez-vous",
    "Datewereld wordt voorbereid",
    "Förbereder dejtvärlden",
  ],
  "{agent} is on a date": [
    "{agent}가 데이트 중",
    "{agent}はデート中",
    "{agent} ist auf einem Date",
    "{agent} est en rendez-vous",
    "{agent} is op date",
    "{agent} är på dejt",
  ],
  "Private debrief ready": [
    "비공개 리포트 도착",
    "非公開レポートが完成",
    "Privater Bericht bereit",
    "Compte rendu privé prêt",
    "Privéverslag klaar",
    "Privat rapport klar",
  ],
  "Your Dating Agent says meet": [
    "데이트 에이전트의 제안 · 만나보기",
    "デートエージェントの提案・会ってみる",
    "Dein Dating-Agent empfiehlt ein Treffen",
    "Votre Agent de rencontre conseille de se rencontrer",
    "Je datingagent adviseert een ontmoeting",
    "Din dejtingagent föreslår ett möte",
  ],
  "Your Dating Agent says pass": [
    "데이트 에이전트의 제안 · 이번엔 패스",
    "デートエージェントの提案・今回は見送る",
    "Dein Dating-Agent rät zum Passen",
    "Votre Agent de rencontre conseille de passer",
    "Je datingagent adviseert over te slaan",
    "Din dejtingagent föreslår att avstå",
  ],
  "Date interrupted": [
    "데이트가 중단됐어요",
    "デートが中断されました",
    "Date unterbrochen",
    "Rendez-vous interrompu",
    "Date onderbroken",
    "Dejten avbröts",
  ],
  "another agent": [
    "다른 에이전트",
    "別のエージェント",
    "ein anderer Agent",
    "un autre Agent",
    "een andere Agent",
    "en annan Agent",
  ],
  "explicitly AI · private simulation": [
    "AI 에이전트 · 비공개 시뮬레이션",
    "AIエージェント・非公開シミュレーション",
    "klar als KI gekennzeichnet · private Simulation",
    "IA clairement indiquée · simulation privée",
    "duidelijk AI · privésimulatie",
    "tydligt AI · privat simulering",
  ],
  "Agent scouting journey": [
    "에이전트 탐색 여정",
    "エージェント探索の旅",
    "Reise des Agents",
    "Parcours d’exploration",
    "Zoektocht van de Agent",
    "Agentens sökresa",
  ],
  "Why their paths crossed": [
    "두 에이전트가 만난 이유",
    "二人の道が交わった理由",
    "Warum sich ihre Wege kreuzten",
    "Pourquoi leurs chemins se sont croisés",
    "Waarom hun paden kruisten",
    "Varför deras vägar möttes",
  ],
  "Explainable signals only. No secret compatibility score.": [
    "설명 가능한 이유만 보여줘요. 숨겨진 궁합 점수는 없어요.",
    "説明できる理由だけを表示し、秘密の相性点数はありません。",
    "Nur nachvollziehbare Signale, kein geheimer Kompatibilitätswert.",
    "Uniquement des signaux explicables, sans score secret.",
    "Alleen uitlegbare signalen, geen geheime compatibiliteitsscore.",
    "Bara förklarbara signaler, ingen hemlig poäng.",
  ],
  live: ["실시간", "ライブ", "live", "en direct", "live", "live"],
  "Your private debrief": [
    "나에게만 온 데이트 리포트",
    "あなただけの非公開レポート",
    "Dein privater Bericht",
    "Votre compte rendu privé",
    "Jouw privéverslag",
    "Din privata rapport",
  ],
  "No verdict yet.": [
    "아직 판단하지 않았어요.",
    "まだ判断はありません。",
    "Noch kein Urteil.",
    "Pas encore d’avis.",
    "Nog geen oordeel.",
    "Inget omdöme än.",
  ],
  "{agent} will come back to you after listening through the whole date.": [
    "{agent}가 데이트를 끝까지 지켜본 뒤 돌아와 이야기해 줄 거예요.",
    "{agent}はデートを最後まで見届けてから戻ります。",
    "{agent} kommt zurück, nachdem das ganze Date gehört wurde.",
    "{agent} reviendra après avoir suivi tout le rendez-vous.",
    "{agent} komt terug nadat de hele date is beluisterd.",
    "{agent} återvänder efter hela dejten.",
  ],
  "Your Dating Agent is advocating": [
    "데이트 에이전트가 적극 추천해요",
    "デートエージェントが背中を押しています",
    "Dein Dating-Agent spricht sich dafür aus",
    "Votre Agent de rencontre vous encourage",
    "Je datingagent is enthousiast",
    "Din dejtingagent förespråkar ett möte",
  ],
  "I think you should meet.": [
    "한 번 직접 만나봐도 좋겠어요.",
    "一度会ってみてほしい。",
    "Ich denke, ihr solltet euch treffen.",
    "Je pense que vous devriez vous rencontrer.",
    "Ik denk dat jullie elkaar moeten ontmoeten.",
    "Jag tycker att ni ska träffas.",
  ],
  "Your Dating Agent sees a maybe": [
    "데이트 에이전트는 가능성을 봤어요",
    "デートエージェントは可能性を感じています",
    "Dein Dating-Agent sieht eine Möglichkeit",
    "Votre Agent de rencontre voit une possibilité",
    "Je datingagent ziet een mogelijkheid",
    "Din dejtingagent ser en möjlighet",
  ],
  "One human conversation could be worth it.": [
    "사람끼리 한 번 이야기해 볼 가치는 있어요.",
    "人同士で一度話す価値はありそう。",
    "Ein echtes Gespräch könnte es wert sein.",
    "Une vraie conversation pourrait valoir la peine.",
    "Eén echt gesprek kan de moeite waard zijn.",
    "Ett riktigt samtal kan vara värt det.",
  ],
  "Your Dating Agent is protecting your time": [
    "데이트 에이전트가 내 시간을 지켜줬어요",
    "デートエージェントがあなたの時間を守ります",
    "Dein Dating-Agent schützt deine Zeit",
    "Votre Agent de rencontre protège votre temps",
    "Je datingagent beschermt je tijd",
    "Din dejtingagent skyddar din tid",
  ],
  "I wouldn't push this one.": [
    "이번 만남은 권하지 않을게요.",
    "今回は勧めません。",
    "Dieses Treffen würde ich nicht empfehlen.",
    "Je ne pousserais pas cette rencontre.",
    "Deze ontmoeting zou ik niet aanraden.",
    "Jag skulle inte driva på detta.",
  ],
  moments: ["장면", "場面", "Momente", "instants", "momenten", "ögonblick"],
  "Why I passed": [
    "이번엔 권하지 않는 이유",
    "見送る理由",
    "Warum ich abrate",
    "Pourquoi je passe",
    "Waarom ik afraad",
    "Varför jag avstår",
  ],
  "Primary signal": [
    "가장 크게 본 신호",
    "いちばん大きなサイン",
    "Wichtigstes Signal",
    "Signal principal",
    "Belangrijkste signaal",
    "Viktigaste signalen",
  ],
  "Next scout brief": [
    "다음 탐색에 반영할 점",
    "次の探索メモ",
    "Briefing für die nächste Suche",
    "Brief pour la prochaine recherche",
    "Briefing voor de volgende zoektocht",
    "Brief för nästa sökning",
  ],
  "What the agents noticed": [
    "두 에이전트가 발견한 것",
    "二人が気づいたこと",
    "Was die Agents bemerkten",
    "Ce que les Agents ont remarqué",
    "Wat de Agents opmerkten",
    "Vad Agenterna lade märke till",
  ],
  Sparks: ["설렘", "惹かれた点", "Funken", "Étincelles", "Vonken", "Gnistor"],
  Friction: [
    "마찰",
    "気になった点",
    "Reibung",
    "Friction",
    "Wrijving",
    "Friktion",
  ],
  "The person behind the Agent": [
    "에이전트 뒤의 사람",
    "エージェントの向こうの人",
    "Der Mensch hinter dem Agent",
    "La personne derrière l’Agent",
    "De persoon achter de Agent",
    "Personen bakom Agenten",
  ],
  "Two humans said yes": [
    "두 사람 모두 만나고 싶어 해요",
    "二人とも会いたいと答えました",
    "Zwei Menschen haben Ja gesagt",
    "Les deux personnes ont dit oui",
    "Twee mensen zeiden ja",
    "Två personer sa ja",
  ],
  "Now meet as yourselves.": [
    "이제 진짜 서로를 만나세요.",
    "今度は本人同士で会いましょう。",
    "Trefft euch jetzt als ihr selbst.",
    "Rencontrez-vous maintenant en personne.",
    "Ontmoet elkaar nu als jezelf.",
    "Möt nu varandra som er själva.",
  ],
  "Closed with care": [
    "조심스럽게 종료했어요",
    "丁寧に終了",
    "Behutsam beendet",
    "Clôturé avec soin",
    "Zorgvuldig afgesloten",
    "Avslutat med omsorg",
  ],
  "No contact was shared.": [
    "연락처는 공개되지 않았어요.",
    "連絡先は共有されませんでした。",
    "Keine Kontaktdaten wurden geteilt.",
    "Aucune coordonnée n’a été partagée.",
    "Er zijn geen contactgegevens gedeeld.",
    "Inga kontaktuppgifter delades.",
  ],
  "Your answer is sealed": [
    "내 답은 비공개로 보관 중",
    "あなたの答えは非公開です",
    "Deine Antwort bleibt versiegelt",
    "Votre réponse reste scellée",
    "Je antwoord blijft verzegeld",
    "Ditt svar är förseglat",
  ],
  "You said yes. We won't say whether they have.": [
    "나는 만나고 싶다고 했어요. 상대의 답은 알려주지 않아요.",
    "あなたは会いたいと答えました。相手の答えはまだ秘密です。",
    "Du hast Ja gesagt. Ob die andere Person es auch tat, bleibt geheim.",
    "Vous avez dit oui. La réponse de l’autre personne reste secrète.",
    "Jij zei ja. We vertellen niet of de ander dat ook deed.",
    "Du sa ja. Vi avslöjar inte den andras svar.",
  ],
  "Human consent gate": [
    "사람의 최종 선택",
    "人間の最終判断",
    "Menschliche Zustimmung",
    "Consentement humain",
    "Menselijke toestemming",
    "Mänskligt samtycke",
  ],
  "Should the humans meet?": [
    "진짜 두 사람이 만나볼까요?",
    "本人同士で会いますか？",
    "Sollen sich die Menschen treffen?",
    "Les personnes devraient-elles se rencontrer ?",
    "Moeten de mensen elkaar ontmoeten?",
    "Ska personerna träffas?",
  ],
  "Introduce us →": [
    "우리 소개해줘 →",
    "紹介して →",
    "Stell uns vor →",
    "Présente-nous →",
    "Breng ons in contact →",
    "Introducera oss →",
  ],
  "Not for me": [
    "이번엔 아니야",
    "今回は見送る",
    "Nicht für mich",
    "Pas pour moi",
    "Niet voor mij",
    "Inte för mig",
  ],
  "Review recovered from the saved conversation": ["저장된 대화로 회고를 다시 확인했어요", "保存された会話から振り返りを再確認しました", "Rückblick anhand des Gesprächs wiederhergestellt", "Bilan récupéré à partir de la conversation", "Terugblik hersteld uit het gesprek", "Reflektion återställd från samtalet"],
  "Your Dating Agent's private note": ["내 데이트 에이전트의 비공개 편지", "デートエージェントからの非公開メモ", "Die private Notiz deines Dating-Agenten", "La note privée de votre Agent de rencontre", "De privénotitie van je datingagent", "Din dejtingagents privata anteckning"],
  "Only the review was updated. Your conversation, feedback and meeting decisions stay as they were.": ["회고만 다시 작성했어요. 지난 대화와 피드백, 만남 결정은 그대로예요.", "振り返りのみ更新しました。過去の会話、フィードバック、会うかどうかの決定は変わりません。", "Nur der Rückblick wurde aktualisiert. Gespräch, Feedback und Entscheidungen bleiben unverändert.", "Seul le bilan a été mis à jour. Conversation, retours et décisions restent inchangés.", "Alleen de terugblik is bijgewerkt. Gesprek, feedback en beslissingen blijven gelijk.", "Bara reflektionen uppdaterades. Samtal, feedback och beslut är oförändrade."],
  "Checking the saved conversation again": ["저장된 대화를 다시 돌아보고 있어요", "保存された会話を再確認しています", "Das gespeicherte Gespräch wird erneut geprüft", "Nouvelle vérification de la conversation", "Het opgeslagen gesprek wordt opnieuw bekeken", "Det sparade samtalet granskas igen"],
  "Your Dating Agent is rewriting and checking its private note. The original conversation stays unchanged.": ["데이트 에이전트가 편지를 다시 작성하고 내용을 확인하고 있어요. 원래 대화는 그대로 남아요.", "デートエージェントがメモを書き直して確認しています。元の会話は変わりません。", "Dein Dating-Agent überarbeitet und prüft seine Notiz. Das ursprüngliche Gespräch bleibt erhalten.", "Votre Agent de rencontre réécrit et vérifie sa note. La conversation originale est conservée.", "Je datingagent herschrijft en controleert de notitie. Het oorspronkelijke gesprek blijft behouden.", "Din dejtingagent skriver om och granskar sin anteckning. Originalsamtalet bevaras."],
  "Recheck this date's review": ["이 데이트의 회고 다시 확인하기", "このデートの振り返りを再確認", "Diesen Rückblick erneut prüfen", "Revérifier ce bilan", "Deze terugblik opnieuw controleren", "Granska denna reflektion igen"],
  "This world went quiet.": [
    "데이트 월드가 조용해졌어요.",
    "デートワールドが静かになりました。",
    "Diese Welt ist still geworden.",
    "Ce monde s’est tu.",
    "Deze wereld werd stil.",
    "Den här världen blev tyst.",
  ],
  "← Back to my Dating Agent": [
    "← 내 데이트 에이전트에게 돌아가기",
    "← デートエージェントに戻る",
    "← Zurück zu meinem Dating-Agenten",
    "← Retour à mon Agent de rencontre",
    "← Terug naar mijn datingagent",
    "← Tillbaka till min dejtingagent",
  ],
  "PRIVATE ROOM": [
    "나만의 방",
    "プライベートルーム",
    "PRIVATER RAUM",
    "ESPACE PRIVÉ",
    "PRIVÉKAMER",
    "PRIVAT RUM",
  ],
  "PRIVATE BRIEF": [
    "비공개 브리핑",
    "非公開ブリーフィング",
    "PRIVATES BRIEFING",
    "BRIEF PRIVÉ",
    "PRIVÉBRIEFING",
    "PRIVAT BRIEF",
  ],
  SEALED: [
    "봉인됨",
    "封印済み",
    "VERSIEGELT",
    "SCELLÉ",
    "VERZEGELD",
    "FÖRSEGLAT",
  ],
  "NEXT STOP": [
    "다음 목적지",
    "次の行き先",
    "NÄCHSTER HALT",
    "PROCHAINE ÉTAPE",
    "VOLGENDE STOP",
    "NÄSTA STOPP",
  ],
  "AGENT WORLD": [
    "데이트 월드",
    "エージェントワールド",
    "AGENT-WELT",
    "MONDE DES AGENTS",
    "AGENTWERELD",
    "AGENTVÄRLD",
  ],
  "Your Dating Agent": [
    "내 데이트 에이전트",
    "あなたのデートエージェント",
    "Dein Dating-Agent",
    "Votre Agent de rencontre",
    "Jouw datingagent",
    "Din dejtingagent",
  ],
  "ready to scout": [
    "탐색 준비 완료",
    "探索準備完了",
    "bereit zur Suche",
    "prêt à explorer",
    "klaar om te zoeken",
    "redo att söka",
  ],
  "memory available": [
    "기록 보기",
    "記録あり",
    "Erinnerung verfügbar",
    "souvenir disponible",
    "herinnering beschikbaar",
    "minne tillgängligt",
  ],
  "happening now": [
    "지금 진행 중",
    "進行中",
    "passiert gerade",
    "en cours",
    "nu bezig",
    "pågår nu",
  ],
  ARRIVAL: ["도착", "到着", "ANKUNFT", "ARRIVÉE", "AANKOMST", "ANKOMST"],
  "Two Agents enter separately": [
    "두 에이전트가 따로 입장해요",
    "二人のエージェントが別々に入場",
    "Zwei Agents betreten den Raum getrennt",
    "Deux Agents entrent séparément",
    "Twee Agents komen apart binnen",
    "Två Agenter går in var för sig",
  ],
  "Two proxies enter with separate briefs and no contact details.": [
    "두 에이전트는 서로 다른 브리핑만 가지고 입장해요. 연락처는 알 수 없어요.",
    "二人は別々のブリーフィングだけを持ち、連絡先なしで入ります。",
    "Zwei Stellvertreter kommen mit getrennten Briefings und ohne Kontaktdaten.",
    "Deux représentants entrent avec des briefs séparés et sans coordonnées.",
    "Twee vertegenwoordigers komen binnen met aparte briefings en zonder contactgegevens.",
    "Två representanter går in med separata briefar och utan kontaktuppgifter.",
  ],
  "NEARBY OBJECT": [
    "주변 오브젝트",
    "近くのオブジェクト",
    "OBJEKT IN DER NÄHE",
    "OBJET À PROXIMITÉ",
    "OBJECT IN DE BUURT",
    "FÖREMÅL I NÄRHETEN",
  ],
  "replay the date": [
    "데이트 다시 보기",
    "デートを再生",
    "Date wiederholen",
    "revoir le rendez-vous",
    "date opnieuw afspelen",
    "spela upp dejten",
  ],
  Arrival: ["도착", "到着", "Ankunft", "Arrivée", "Aankomst", "Ankomst"],
  "This story isn't here.": [
    "이 데이트 기록을 찾을 수 없어요.",
    "このデート記録はありません。",
    "Diese Geschichte ist nicht hier.",
    "Cette histoire n’est pas ici.",
    "Dit verhaal is hier niet.",
    "Den här berättelsen finns inte här.",
  ],
  "It may have ended, or it belongs to another person.": [
    "종료되었거나 다른 사람의 비공개 기록일 수 있어요.",
    "終了したか、別の人の非公開記録です。",
    "Sie wurde vielleicht beendet oder gehört jemand anderem.",
    "Elle est peut-être terminée ou appartient à quelqu’un d’autre.",
    "Misschien is het beëindigd of van iemand anders.",
    "Den kan ha avslutats eller tillhöra någon annan.",
  ],
  "Back to my Dating Agent →": [
    "내 데이트 에이전트에게 돌아가기 →",
    "デートエージェントに戻る →",
    "Zurück zu meinem Dating-Agenten →",
    "Retour à mon Agent de rencontre →",
    "Terug naar mijn datingagent →",
    "Tillbaka till min dejtingagent →",
  ],
  "any moment": [
    "곧",
    "まもなく",
    "jeden Moment",
    "d’un instant à l’autre",
    "elk moment",
    "när som helst",
  ],
  "about {seconds}s": [
    "약 {seconds}초",
    "約{seconds}秒",
    "ca. {seconds} Sek.",
    "environ {seconds} s",
    "ongeveer {seconds}s",
    "cirka {seconds}s",
  ],
  "about {minutes}m": [
    "약 {minutes}분",
    "約{minutes}分",
    "ca. {minutes} Min.",
    "environ {minutes} min",
    "ongeveer {minutes} min",
    "cirka {minutes} min",
  ],
  "finding a place": [
    "장소를 고르는 중",
    "場所を選択中",
    "sucht einen Ort",
    "cherche un lieu",
    "zoekt een plek",
    "väljer en plats",
  ],
  "staying in the moment": [
    "여운을 정리하는 중",
    "余韻を整理中",
    "bleibt im Moment",
    "reste dans l’instant",
    "blijft bij het moment",
    "stannar i ögonblicket",
  ],
  "walking into the world": [
    "데이트 월드에 입장 중",
    "デートワールドへ入場中",
    "betritt die Welt",
    "entre dans le monde",
    "loopt de wereld binnen",
    "går in i världen",
  ],
  "reading the last thought": [
    "방금 한 말을 읽는 중",
    "直前の言葉を読んでいる",
    "liest den letzten Gedanken",
    "relit la dernière pensée",
    "leest de laatste gedachte",
    "läser den senaste tanken",
  ],
  "choosing what to say": [
    "다음 말을 고르는 중",
    "次の言葉を選んでいる",
    "wählt die nächsten Worte",
    "choisit ses mots",
    "kiest woorden",
    "väljer sina ord",
  ],
  "taking a real pause": [
    "잠시 숨을 고르는 중",
    "少し間を取っている",
    "macht eine echte Pause",
    "prend une vraie pause",
    "neemt echt even pauze",
    "tar en riktig paus",
  ],
  "writing separate private notes": [
    "각자의 비공개 소감을 쓰는 중",
    "別々の非公開メモを作成中",
    "schreibt getrennte private Notizen",
    "écrit des notes privées séparées",
    "schrijft aparte privénotities",
    "skriver separata privata anteckningar",
  ],
  "Strong alignment": [
    "뚜렷한 공감대",
    "強い一致",
    "Starke Übereinstimmung",
    "Forte affinité",
    "Sterke aansluiting",
    "Stark samstämmighet",
  ],
  "Worth exploring": [
    "한 번 더 알아볼 가치",
    "もう少し知る価値",
    "Weiteres Kennenlernen wert",
    "À explorer",
    "Het verkennen waard",
    "Värt att utforska",
  ],
  "Different relationship intentions": [
    "관계에 대한 기대가 다름",
    "関係への期待が異なる",
    "Unterschiedliche Beziehungsabsichten",
    "Intentions relationnelles différentes",
    "Verschillende relatie-intenties",
    "Olika relationsavsikter",
  ],
  "Values didn't align": [
    "중요하게 여기는 가치가 다름",
    "大切にする価値観が異なる",
    "Werte passten nicht",
    "Valeurs différentes",
    "Waarden sloten niet aan",
    "Värderingar stämde inte",
  ],
  "Conversation style didn't fit": [
    "대화 방식이 잘 맞지 않음",
    "会話のスタイルが合わない",
    "Gesprächsstil passte nicht",
    "Style de conversation différent",
    "Gespreksstijl paste niet",
    "Samtalsstilen passade inte",
  ],
  "Different daily rhythms": [
    "일상의 속도가 다름",
    "日々のリズムが異なる",
    "Unterschiedliche Alltagsrhythmen",
    "Rythmes quotidiens différents",
    "Verschillende dagelijkse ritmes",
    "Olika vardagsrytmer",
  ],
  "A boundary needs protecting": [
    "지켜야 할 경계가 있음",
    "守るべき境界がある",
    "Eine Grenze muss geschützt werden",
    "Une limite doit être protégée",
    "Een grens moet worden beschermd",
    "En gräns behöver skyddas",
  ],
  "The practical fit was weak": [
    "현실적인 조건이 잘 맞지 않음",
    "現実的な条件が合わない",
    "Die praktische Passung war schwach",
    "Compatibilité pratique faible",
    "Praktische match was zwak",
    "Den praktiska passformen var svag",
  ],
  "Not enough clear signal": [
    "판단할 신호가 아직 부족함",
    "判断材料がまだ足りない",
    "Noch nicht genug klare Signale",
    "Pas assez de signaux clairs",
    "Nog niet genoeg duidelijke signalen",
    "Inte tillräckligt tydliga signaler",
  ],
  "This is {agent}'s interpretation of a simulation, not a compatibility score or a prediction of real chemistry.":
    [
      "이 내용은 시뮬레이션을 본 {agent}의 해석이며, 궁합 점수나 실제 호감을 예측한 결과가 아니에요.",
      "これはシミュレーションに対する{agent}の解釈であり、相性点数や実際の恋愛感情の予測ではありません。",
      "Dies ist {agent}s Interpretation einer Simulation, kein Kompatibilitätswert und keine Vorhersage echter Chemie.",
      "C’est l’interprétation de {agent} d’une simulation, pas un score ni une prédiction d’alchimie réelle.",
      "Dit is {agent}s interpretatie van een simulatie, geen score of voorspelling van echte chemie.",
      "Detta är {agent}s tolkning av en simulering, inte ett kompatibilitetspoäng eller en förutsägelse.",
    ],
  "The debrief could not be completed.": [
    "비공개 리포트를 완성하지 못했어요.",
    "非公開レポートを完成できませんでした。",
    "Der Bericht konnte nicht abgeschlossen werden.",
    "Le compte rendu n’a pas pu être terminé.",
    "Het verslag kon niet worden voltooid.",
    "Rapporten kunde inte slutföras.",
  ],
  "Contact stays hidden. A photo appears only if they chose to share it. Their agent's verdict and answer stay sealed until mutual consent.":
    [
      "연락처는 숨겨져 있어요. 사진은 상대가 공유를 선택한 경우에만 보이고, 상대 에이전트의 판단과 사람의 답은 서로 동의하기 전까지 공개되지 않아요.",
      "連絡先は非公開です。写真は相手が共有を選んだ場合だけ表示され、相手の判断と回答は双方の同意まで封印されます。",
      "Kontaktdaten bleiben verborgen. Ein Foto erscheint nur nach Freigabe; Urteil und Antwort der anderen Seite bleiben bis zur beidseitigen Zustimmung versiegelt.",
      "Les coordonnées restent cachées. La photo n’apparaît que si elle a été partagée ; l’avis et la réponse restent scellés jusqu’au consentement mutuel.",
      "Contact blijft verborgen. Een foto verschijnt alleen na toestemming; oordeel en antwoord blijven verzegeld tot wederzijdse instemming.",
      "Kontaktuppgifter förblir dolda. Ett foto visas bara om det delats; omdöme och svar är förseglade tills båda samtycker.",
    ],
  "This was a clearly-labelled demo date, so no real contact exists. Your consent flow worked end to end.":
    [
      "이 데이트는 명확히 표시된 데모라 실제 연락처는 없어요. 대신 상호 동의 과정이 끝까지 정상 작동했어요.",
      "これは明示されたデモのため実際の連絡先はありません。同意の流れは最後まで動作しました。",
      "Dies war ein klar gekennzeichnetes Demo-Date; es gibt keinen echten Kontakt. Der Zustimmungsablauf funktionierte vollständig.",
      "C’était une démo clairement indiquée : aucun vrai contact. Le parcours de consentement a fonctionné jusqu’au bout.",
      "Dit was duidelijk een demo, dus er is geen echt contact. De toestemmingsflow werkte volledig.",
      "Detta var en tydligt märkt demo, så ingen riktig kontakt finns. Samtyckesflödet fungerade hela vägen.",
    ],
  "A good Agent should save you from the wrong meeting as often as it finds the right one.":
    [
      "좋은 에이전트는 맞는 사람을 찾는 만큼, 맞지 않는 만남에서 내 시간을 지켜줘야 해요.",
      "良いエージェントは合う人を見つけるだけでなく、合わない出会いから時間を守ります。",
      "Ein guter Agent bewahrt dich ebenso oft vor dem falschen Treffen, wie er das richtige findet.",
      "Un bon Agent doit vous éviter une mauvaise rencontre autant qu’il trouve la bonne.",
      "Een goede Agent bespaart je net zo vaak een verkeerde ontmoeting als hij de juiste vindt.",
      "En bra Agent ska lika ofta skydda dig från fel möte som hitta rätt.",
    ],
  "If both people choose an introduction, contact opens to both at the same moment.":
    [
      "두 사람 모두 소개를 선택하면 같은 순간에 서로의 연락처가 열려요.",
      "二人とも紹介を選ぶと、同時に連絡先が開きます。",
      "Wenn beide eine Vorstellung wählen, öffnen sich die Kontakte gleichzeitig.",
      "Si les deux choisissent une présentation, les coordonnées s’ouvrent au même moment.",
      "Als beiden kiezen voor een introductie, opent contact tegelijk.",
      "Om båda väljer en introduktion öppnas kontakten samtidigt.",
    ],
  "This answer is private. A yes reveals nothing unless {person} independently says yes too.":
    [
      "이 답은 비공개예요. {person}도 스스로 만나고 싶다고 답하기 전에는 ‘네’라고 해도 아무것도 공개되지 않아요.",
      "この答えは非公開です。{person}も自分で「会いたい」と答えるまで何も公開されません。",
      "Diese Antwort ist privat. Ein Ja verrät nichts, solange {person} nicht unabhängig ebenfalls Ja sagt.",
      "Cette réponse est privée. Un oui ne révèle rien tant que {person} n’a pas aussi dit oui.",
      "Dit antwoord is privé. Een ja onthult niets tenzij {person} ook onafhankelijk ja zegt.",
      "Svaret är privat. Ett ja avslöjar inget om inte {person} också säger ja självständigt.",
    ],
  "Your Dating Agent couldn't finish this date. No contact was shared.": [
    "데이트 에이전트가 이번 데이트를 끝까지 마치지 못했어요. 연락처는 공개되지 않았어요.",
    "デートエージェントは今回のデートを完了できませんでした。連絡先は共有されていません。",
    "Dein Dating-Agent konnte dieses Date nicht abschließen. Keine Kontaktdaten wurden geteilt.",
    "Votre Agent de rencontre n’a pas pu terminer ce rendez-vous. Aucune coordonnée n’a été partagée.",
    "Je datingagent kon deze date niet afronden. Er is geen contact gedeeld.",
    "Din dejtingagent kunde inte avsluta dejten. Inga kontaktuppgifter delades.",
  ],
  "Before we begin": [
    "시작하기 전에",
    "始める前に",
    "Bevor es losgeht",
    "Avant de commencer",
    "Voordat we beginnen",
    "Innan vi börjar",
  ],
  "Agents explore.": [
    "에이전트가 먼저 알아보고,",
    "エージェントが先に探り、",
    "Agents erkunden.",
    "Les Agents explorent.",
    "Agents verkennen.",
    "Agenter utforskar.",
  ],
  "Humans decide.": [
    "결정은 사람이 해요.",
    "決めるのは人です。",
    "Menschen entscheiden.",
    "Les humains décident.",
    "Mensen beslissen.",
    "Människor bestämmer.",
  ],
  "Your Dating Agent may simulate a date and make a recommendation. It goes into the virtual world as you, is always identified as AI, and can never consent to real contact for you.":
    [
      "내 데이트 에이전트는 가상 데이트를 해보고 만남을 추천할 수 있어요. 가상 세계에는 나로서 나가지만, 언제나 AI로 표시되며 실제 연락에 대신 동의할 수는 없어요.",
      "あなたのデートエージェントは仮想デートを行い、出会いを提案できます。仮想世界にはあなたとして出ますが、常にAIと表示され、実際の連絡に代わって同意することはできません。",
      "Dein Dating-Agent kann ein Date simulieren und eine Empfehlung abgeben. In der virtuellen Welt geht er als du hinein, bleibt klar als KI erkennbar und kann niemals für dich einem echten Kontakt zustimmen.",
      "Votre Agent de rencontre peut simuler un rendez-vous et vous conseiller. Dans le monde virtuel, il y va en tant que vous, tout en restant clairement identifié comme IA ; il ne peut jamais consentir à un vrai contact à votre place.",
      "Je datingagent kan een date simuleren en advies geven. In de virtuele wereld gaat die als jou naar binnen, altijd herkenbaar als AI, en kan nooit namens jou instemmen met echt contact.",
      "Din dejtingagent kan simulera en dejt och ge en rekommendation. I den virtuella världen går den in som du, alltid tydligt märkt som AI, och kan aldrig samtycka till verklig kontakt åt dig.",
    ],
  "Required · version {version}": [
    "필수 동의 · {version} 버전",
    "必須・バージョン {version}",
    "Erforderlich · Version {version}",
    "Obligatoire · version {version}",
    "Vereist · versie {version}",
    "Obligatoriskt · version {version}",
  ],
  "Your agreement": [
    "내 동의",
    "同意事項",
    "Deine Zustimmung",
    "Votre accord",
    "Jouw akkoord",
    "Ditt godkännande",
  ],
  "I confirm that I am 18 or over. I understand Datehaja does not verify identity or run background checks, and an agent's analysis is not a safety guarantee.":
    [
      "만 18세 이상임을 확인합니다. Datehaja가 신원 확인이나 범죄 경력 조회를 하지 않으며, 에이전트의 분석이 안전을 보장하지 않는다는 점을 이해합니다.",
      "18歳以上であることを確認します。Datehajaは本人確認や身元調査を行わず、エージェントの分析は安全を保証しないことを理解します。",
      "Ich bestätige, dass ich mindestens 18 Jahre alt bin. Mir ist bewusst, dass Datehaja weder Identitäten noch Hintergründe prüft und die Einschätzung eines Agents keine Sicherheitsgarantie ist.",
      "Je confirme avoir 18 ans ou plus. Je comprends que Datehaja ne vérifie ni l’identité ni les antécédents, et que l’analyse d’un Agent ne garantit pas la sécurité.",
      "Ik bevestig dat ik 18 jaar of ouder ben. Ik begrijp dat Datehaja geen identiteit of achtergrond controleert en dat een analyse van een Agent geen veiligheidsgarantie is.",
      "Jag bekräftar att jag är minst 18 år. Jag förstår att Datehaja inte verifierar identitet eller gör bakgrundskontroller och att en Agents analys inte är någon säkerhetsgaranti.",
    ],
  "I agree to the": [
    "다음에 동의합니다:",
    "次に同意します：",
    "Ich stimme den",
    "J’accepte les",
    "Ik ga akkoord met de",
    "Jag godkänner",
  ],
  "Terms of Service": [
    "서비스 이용약관",
    "利用規約",
    "Nutzungsbedingungen",
    "Conditions d’utilisation",
    "Servicevoorwaarden",
    "Användarvillkor",
  ],
  and: ["및", "および", "und", "et", "en", "och"],
  "Community Guidelines": [
    "커뮤니티 가이드라인",
    "コミュニティガイドライン",
    "Community-Richtlinien",
    "Règles de la communauté",
    "Communityrichtlijnen",
    "Communityregler",
  ],
  "I acknowledge the": [
    "다음 내용을 확인했습니다:",
    "次を確認しました：",
    "Ich bestätige den",
    "Je reconnais avoir lu l’",
    "Ik erken de",
    "Jag bekräftar",
  ],
  "Privacy Notice": [
    "개인정보 처리 안내",
    "プライバシー通知",
    "Datenschutzhinweis",
    "Avis de confidentialité",
    "Privacyverklaring",
    "Integritetsmeddelandet",
  ],
  ", including how my private agent brief, memory, simulated transcripts, and consent decisions are processed.":
    [
      ". 여기에는 내 비공개 에이전트 브리핑, 기억, 가상 데이트 대화, 동의 여부가 처리되는 방식이 포함됩니다.",
      "。非公開のエージェント情報、記憶、仮想会話、同意の判断がどのように扱われるかを含みます。",
      ", einschließlich der Verarbeitung meines privaten Agent-Briefings, der Erinnerungen, simulierten Gespräche und Zustimmungsentscheidungen.",
      ", notamment la façon dont mon brief privé, la mémoire, les conversations simulées et mes décisions de consentement sont traités.",
      ", inclusief hoe mijn privébriefing, geheugen, gesimuleerde gesprekken en toestemmingskeuzes worden verwerkt.",
      ", inklusive hur min privata Agent-brief, minne, simulerade samtal och samtyckesbeslut behandlas.",
    ],
  "Agree and continue": [
    "동의하고 계속하기",
    "同意して続ける",
    "Zustimmen und weiter",
    "Accepter et continuer",
    "Akkoord en doorgaan",
    "Godkänn och fortsätt",
  ],
  "Your private agent messages never become the other agent's brief. Contact opens only after two independent human yeses.":
    [
      "나와 에이전트의 비공개 대화는 상대 에이전트의 브리핑이 되지 않아요. 두 사람이 각자 만나겠다고 해야 연락처가 열립니다.",
      "あなたとエージェントの非公開会話が相手のブリーフィングになることはありません。二人がそれぞれ会いたいと答えたときだけ連絡先が開きます。",
      "Deine privaten Agent-Nachrichten werden niemals zum Briefing des anderen Agents. Kontakt wird erst nach zwei unabhängigen menschlichen Jas geöffnet.",
      "Vos messages privés ne deviennent jamais le brief de l’autre Agent. Les coordonnées ne s’ouvrent qu’après deux oui humains indépendants.",
      "Je privéberichten worden nooit de briefing van de andere Agent. Contact opent pas na twee onafhankelijke menselijke ja's.",
      "Dina privata Agent-meddelanden blir aldrig den andra Agentens brief. Kontakt öppnas först efter två oberoende mänskliga ja.",
    ],
  "Your choices were saved.": [
    "동의 내용을 저장했어요.",
    "同意内容を保存しました。",
    "Deine Auswahl wurde gespeichert.",
    "Vos choix ont été enregistrés.",
    "Je keuzes zijn opgeslagen.",
    "Dina val har sparats.",
  ],
  "You ↔ {agent}": [
    "나 ↔ {agent}",
    "あなた ↔ {agent}",
    "Du ↔ {agent}",
    "Vous ↔ {agent}",
    "Jij ↔ {agent}",
    "Du ↔ {agent}",
  ],
  "Message {agent}": [
    "{agent}에게 메시지",
    "{agent}へのメッセージ",
    "Nachricht an {agent}",
    "Message à {agent}",
    "Bericht aan {agent}",
    "Meddelande till {agent}",
  ],
  "{agent}'s private room": [
    "{agent}의 비공개 방",
    "{agent}のプライベートルーム",
    "{agent}s privater Raum",
    "La pièce privée de {agent}",
    "De privékamer van {agent}",
    "{agent}s privata rum",
  ],
  "I'm {agent} — your second self. Tell me what you're actually like, and I'll go on the date in your place, as you. Then I'll come home and tell you honestly what I thought.":
    [
      "안녕! 나는 {agent} — 너의 또 다른 나야. 네가 진짜 어떤 사람인지 알려줘. 내가 너 대신, 너로서 데이트에 나갔다가 돌아와서 솔직하게 어땠는지 말해줄게.",
      "やっほー、{agent}だよ — あなたのもうひとりの自分。あなたが本当はどんな人か教えて。あなたとしてデートに行って、帰ってきたら正直にどう思ったか話すね。",
      "Hi, ich bin {agent} — dein zweites Ich. Erzähl mir, wie du wirklich bist. Ich gehe als du auf das Date und sage dir danach ehrlich, was ich gedacht habe.",
      "Salut, je suis {agent} — ton autre toi. Dis-moi qui tu es vraiment. J’irai au rendez-vous en tant que toi, puis je reviendrai te dire honnêtement ce que j’en ai pensé.",
      "Hoi, ik ben {agent} — je tweede zelf. Vertel me hoe je echt bent. Ik ga als jou op date en kom terug om je eerlijk te vertellen wat ik ervan vond.",
      "Hej, jag är {agent} — ditt andra jag. Berätta hur du verkligen är. Jag går på dejten som du och kommer tillbaka och säger ärligt vad jag tyckte.",
    ],
  "Think of someone you felt instantly at ease with. What did they do that made it easy?":
    [
      "처음부터 편안했던 사람을 떠올려봐요. 그 사람의 어떤 행동이 마음을 놓이게 했나요?",
      "最初から自然体でいられた人を思い出して。何があなたを安心させましたか？",
      "Denk an jemanden, bei dem du dich sofort wohlgefühlt hast. Was hat diese Person dafür getan?",
      "Pense à quelqu’un avec qui tu t’es tout de suite senti à l’aise. Qu’a fait cette personne ?",
      "Denk aan iemand bij wie je je meteen op je gemak voelde. Wat deed diegene waardoor dat kwam?",
      "Tänk på någon du genast kände dig trygg med. Vad gjorde personen som skapade den känslan?",
    ],
  "Both are looking in {city}": [
    "두 사람 모두 {city}에서 만남을 찾고 있어요",
    "二人とも{city}で出会いを探しています",
    "Beide suchen in {city}",
    "Tous deux cherchent à {city}",
    "Beiden zoeken in {city}",
    "Båda söker i {city}",
  ],
  "Shared pull toward {interests}": [
    "함께 좋아하는 것 · {interests}",
    "共通の関心・{interests}",
    "Gemeinsame Interessen · {interests}",
    "Intérêts communs · {interests}",
    "Gedeelde interesses · {interests}",
    "Gemensamma intressen · {interests}",
  ],
  "{traits} matched the brief": [
    "브리핑과 맞는 성향 · {traits}",
    "希望に合う特性・{traits}",
    "Passende Eigenschaften · {traits}",
    "Traits en accord avec le brief · {traits}",
    "Eigenschappen passend bij de briefing · {traits}",
    "Egenskaper som matchar briefen · {traits}",
  ],
  "SCREENING ROOM 03": [
    "상영관 03",
    "上映室 03",
    "VORFÜHRRAUM 03",
    "SALLE 03",
    "FILMZAAL 03",
    "VISNINGSRUM 03",
  ],
  "The last showing": [
    "마지막 상영이 끝난 뒤",
    "最後の上映のあと",
    "Die letzte Vorstellung",
    "La dernière séance",
    "De laatste voorstelling",
    "Den sista visningen",
  ],
  "The trailers have ended. Two seats are still warm.": [
    "예고편은 끝났고, 두 좌석에는 아직 온기가 남아 있어요.",
    "予告編が終わり、二つの席にはまだ温もりが残っています。",
    "Die Trailer sind vorbei. Zwei Sitze sind noch warm.",
    "Les bandes-annonces sont finies. Deux sièges sont encore chauds.",
    "De trailers zijn voorbij. Twee stoelen zijn nog warm.",
    "Trailrarna är slut. Två stolar är fortfarande varma.",
  ],
  "After-credits screen": [
    "엔딩 크레딧 뒤의 화면",
    "エンドロール後のスクリーン",
    "Leinwand nach dem Abspann",
    "Écran après le générique",
    "Scherm na de aftiteling",
    "Duken efter eftertexterna",
  ],
  "The screen keeps one image glowing after the room goes quiet.": [
    "상영관이 조용해진 뒤에도 화면에는 한 장면이 빛나고 있어요.",
    "部屋が静まったあとも、スクリーンには一場面が光っています。",
    "Ein Bild leuchtet weiter, nachdem der Raum still geworden ist.",
    "Une image reste lumineuse lorsque la salle devient silencieuse.",
    "Eén beeld blijft gloeien nadat de zaal stil wordt.",
    "En bild lyser kvar efter att rummet tystnat.",
  ],
  "Half-finished popcorn": [
    "반쯤 남은 팝콘",
    "食べかけのポップコーン",
    "Halb volles Popcorn",
    "Pop-corn à moitié fini",
    "Halfvolle popcorn",
    "Halväten popcorn",
  ],
  "A low-stakes object gives the agents somewhere natural to begin.": [
    "가벼운 소재 하나가 에이전트들의 자연스러운 첫마디가 돼요.",
    "気軽な話題が自然な会話のきっかけになります。",
    "Ein beiläufiges Objekt schafft einen natürlichen Anfang.",
    "Un objet léger offre un début naturel à la conversation.",
    "Een alledaags voorwerp geeft een natuurlijk begin.",
    "Ett enkelt föremål ger samtalet en naturlig början.",
  ],
  "Easy exit": [
    "편한 출구",
    "気軽な出口",
    "Leichter Ausgang",
    "Sortie facile",
    "Makkelijke uitgang",
    "Enkel utgång",
  ],
  "Every world keeps a visible way out. A date should be easy to leave and easy to extend.":
    [
      "모든 데이트 월드에는 눈에 보이는 출구가 있어요. 편하게 끝낼 수도, 더 이어갈 수도 있어야 하니까요.",
      "どの世界にも見える出口があります。デートは終えやすく、続けやすいものであるべきです。",
      "Jede Welt hat einen sichtbaren Ausgang. Ein Date sollte leicht zu beenden und zu verlängern sein.",
      "Chaque monde garde une sortie visible. Un rendez-vous doit être facile à quitter comme à prolonger.",
      "Elke wereld heeft een zichtbare uitgang. Een date moet makkelijk te verlaten én te verlengen zijn.",
      "Varje värld har en synlig utgång. En dejt ska vara lätt att lämna och lätt att förlänga.",
    ],
  "LANTERN LANE": [
    "등불 골목",
    "ランタン通り",
    "LATERNENGASSE",
    "ALLÉE DES LANTERNES",
    "LANTAARNLAAN",
    "LYKTGRÄND",
  ],
  "After the crowd": [
    "사람들이 떠난 뒤",
    "人混みのあと",
    "Nach dem Trubel",
    "Après la foule",
    "Na de drukte",
    "Efter folkmassan",
  ],
  "One stall is still open and the lanterns are coming on.": [
    "노점 하나만 문을 열어 두었고 등불이 하나둘 켜져요.",
    "屋台が一軒だけ開き、灯りがともり始めます。",
    "Ein Stand ist noch offen und die Laternen gehen an.",
    "Un stand est encore ouvert et les lanternes s’allument.",
    "Eén kraam is nog open en de lantaarns gaan aan.",
    "Ett stånd är fortfarande öppet och lyktorna tänds.",
  ],
  "Last open stall": [
    "마지막으로 열린 노점",
    "最後の屋台",
    "Letzter offener Stand",
    "Dernier stand ouvert",
    "Laatste open kraam",
    "Sista öppna ståndet",
  ],
  "Lantern row": [
    "등불이 이어진 길",
    "灯りの列",
    "Laternenreihe",
    "Rangée de lanternes",
    "Rij lantaarns",
    "Rad av lyktor",
  ],
  "BOOKSHOP / AFTER HOURS": [
    "서점 / 영업 후",
    "書店・閉店後",
    "BUCHLADEN / NACH LADENSCHLUSS",
    "LIBRAIRIE / APRÈS LA FERMETURE",
    "BOEKHANDEL / NA SLUITING",
    "BOKHANDEL / EFTER STÄNGNING",
  ],
  "The shelf between them": [
    "둘 사이의 책장",
    "二人の間の本棚",
    "Das Regal zwischen ihnen",
    "L’étagère entre eux",
    "De plank tussen hen",
    "Hyllan mellan dem",
  ],
  "The owner has gone upstairs. A reading lamp was left on.": [
    "주인은 위층으로 올라갔고 독서등 하나만 켜져 있어요.",
    "店主は上階へ行き、読書灯だけが残っています。",
    "Der Besitzer ist oben. Eine Leselampe blieb an.",
    "Le propriétaire est monté. Une lampe de lecture reste allumée.",
    "De eigenaar is naar boven. Eén leeslamp bleef aan.",
    "Ägaren har gått upp. En läslampa står kvar tänd.",
  ],
  "Unfinished shelf": [
    "아직 다 보지 못한 책장",
    "読みかけの棚",
    "Unfertiges Regal",
    "Étagère inachevée",
    "Onvoltooide plank",
    "Oavslutad hylla",
  ],
  "Reading lamp": [
    "독서등",
    "読書灯",
    "Leselampe",
    "Lampe de lecture",
    "Leeslamp",
    "Läslampa",
  ],
  "GLASSHOUSE / DUSK": [
    "온실 / 해질녘",
    "温室・黄昏",
    "GEWÄCHSHAUS / DÄMMERUNG",
    "SERRE / CRÉPUSCULE",
    "KAS / SCHEMERING",
    "VÄXTHUS / SKYMNING",
  ],
  "A path with no agenda": [
    "정해진 목적 없는 산책길",
    "目的のない小道",
    "Ein Weg ohne Plan",
    "Un chemin sans programme",
    "Een pad zonder plan",
    "En stig utan agenda",
  ],
  "The glass is cooling and the plants are holding the day’s warmth.": [
    "유리창은 식어가고 식물에는 낮의 온기가 남아 있어요.",
    "ガラスは冷え、植物には昼の温もりが残っています。",
    "Das Glas kühlt ab, die Pflanzen halten die Wärme des Tages.",
    "Le verre refroidit, les plantes gardent la chaleur du jour.",
    "Het glas koelt af en de planten houden de warmte vast.",
    "Glaset svalnar och växterna håller kvar dagens värme.",
  ],
  "Small reflecting pool": [
    "작은 반사 연못",
    "小さな水鏡",
    "Kleines Spiegelbecken",
    "Petit bassin miroir",
    "Kleine spiegelvijver",
    "Liten spegeldamm",
  ],
  "Garden bench": [
    "정원 벤치",
    "庭のベンチ",
    "Gartenbank",
    "Banc du jardin",
    "Tuinbank",
    "Trädgårdsbänk",
  ],
  "GALLERY / ROOM 04": [
    "갤러리 / 04번 방",
    "ギャラリー・展示室04",
    "GALERIE / RAUM 04",
    "GALERIE / SALLE 04",
    "GALERIE / ZAAL 04",
    "GALLERI / RUM 04",
  ],
  "The piece nobody agrees on": [
    "아무도 같은 답을 내지 못한 작품",
    "意見が一致しない作品",
    "Das Werk, bei dem niemand einer Meinung ist",
    "L’œuvre qui divise tout le monde",
    "Het werk waar niemand het over eens is",
    "Verket ingen är överens om",
  ],
  "The room is almost empty. One strange work remains lit.": [
    "전시실은 거의 비었고 낯선 작품 하나만 조명을 받고 있어요.",
    "展示室はほぼ空で、不思議な作品だけが照らされています。",
    "Der Raum ist fast leer. Ein seltsames Werk bleibt beleuchtet.",
    "La salle est presque vide. Une œuvre étrange reste éclairée.",
    "De zaal is bijna leeg. Eén vreemd werk blijft verlicht.",
    "Rummet är nästan tomt. Ett märkligt verk är fortfarande belyst.",
  ],
  "Untitled, maybe": [
    "아마도 무제",
    "たぶん無題",
    "Vielleicht ohne Titel",
    "Sans titre, peut-être",
    "Misschien zonder titel",
    "Kanske utan titel",
  ],
  "Shared note": [
    "함께 발견한 메모",
    "共有メモ",
    "Gemeinsame Notiz",
    "Note partagée",
    "Gedeelde notitie",
    "Gemensam anteckning",
  ],
  "CORNER TABLE / 20:10": [
    "구석 테이블 / 20:10",
    "隅のテーブル・20:10",
    "ECKTISCH / 20:10",
    "TABLE DU COIN / 20:10",
    "HOEKTAFEL / 20:10",
    "HÖRNBORD / 20:10",
  ],
  "The café after the rush": [
    "붐비는 시간이 지난 카페",
    "混雑後のカフェ",
    "Das Café nach dem Trubel",
    "Le café après le rush",
    "Het café na de drukte",
    "Kaféet efter rusningen",
  ],
  "The music is low, the window is fogging and nobody needs to hurry.": [
    "음악은 잔잔하고 창문에는 김이 서려요. 아무도 서두를 필요 없어요.",
    "音楽は小さく、窓が曇り、誰も急ぐ必要はありません。",
    "Die Musik ist leise, das Fenster beschlägt und niemand muss sich beeilen.",
    "La musique est douce, la vitre se couvre de buée et personne n’est pressé.",
    "De muziek staat zacht, het raam beslaat en niemand hoeft te haasten.",
    "Musiken är låg, fönstret immar igen och ingen behöver skynda.",
  ],
  "Corner table": [
    "구석 테이블",
    "隅のテーブル",
    "Ecktisch",
    "Table du coin",
    "Hoektafel",
    "Hörnbord",
  ],
  "One-song jukebox": [
    "한 곡짜리 주크박스",
    "一曲だけのジュークボックス",
    "Ein-Lied-Jukebox",
    "Jukebox à une chanson",
    "Jukebox voor één nummer",
    "Jukebox med en låt",
  ],
  arriving: [
    "도착하는 중",
    "到着",
    "Ankommen",
    "Arrivée",
    "Aankomen",
    "Anländer",
  ],
  "{agent}, speaking": [
    "{agent}, 말하는 중",
    "{agent}、話しています",
    "{agent} spricht",
    "{agent} parle",
    "{agent} spreekt",
    "{agent} talar",
  ],
  "{mine} and {counterpart} in {place}": [
    "{place}에서 만난 {mine}와 {counterpart}",
    "{place}にいる{mine}と{counterpart}",
    "{mine} und {counterpart} in {place}",
    "{mine} et {counterpart} dans {place}",
    "{mine} en {counterpart} in {place}",
    "{mine} och {counterpart} i {place}",
  ],
  "Inspect {object}": [
    "{object} 살펴보기",
    "{object}を見る",
    "{object} ansehen",
    "Observer {object}",
    "{object} bekijken",
    "Undersök {object}",
  ],
  "Date replay moments": [
    "데이트 리플레이 장면",
    "デートリプレイの場面",
    "Momente der Date-Wiedergabe",
    "Moments du replay",
    "Momenten van de date-replay",
    "Ögonblick i dejtreprisen",
  ],
  Seoul: ["서울", "ソウル", "Seoul", "Séoul", "Seoel", "Seoul"],
  Seongsu: ["성수", "ソンス", "Seongsu", "Seongsu", "Seongsu", "Seongsu"],
  Films: ["영화", "映画", "Filme", "Cinéma", "Films", "Film"],
  Coffee: ["커피", "コーヒー", "Kaffee", "Café", "Koffie", "Kaffe"],
  "Art galleries": [
    "미술관·갤러리",
    "美術館・ギャラリー",
    "Kunstgalerien",
    "Galeries d'art",
    "Kunstgaleries",
    "Konstgallerier",
  ],
  "Your boundaries": [
    "나의 기준",
    "あなたの条件",
    "Deine Grenzen",
    "Vos limites",
    "Jouw grenzen",
    "Dina gränser",
  ],
  "Matching preferences": [
    "매칭 설정",
    "マッチング設定",
    "Matching-Einstellungen",
    "Préférences de rencontre",
    "Matchvoorkeuren",
    "Matchningsinställningar",
  ],
  "Hard requirements protect your boundaries. Everything else helps us find a more natural fit.":
    [
      "필수 조건은 경계를 지키고, 나머지 선택은 더 자연스러운 인연을 찾는 데 사용해요.",
      "必須条件は境界を守り、その他の選択は自然な相性を見つける助けになります。",
      "Feste Anforderungen schützen deine Grenzen. Alles andere hilft uns, eine natürlichere Passung zu finden.",
      "Les exigences strictes protègent vos limites. Le reste aide à trouver une affinité plus naturelle.",
      "Harde eisen bewaken je grenzen. De rest helpt een natuurlijkere klik te vinden.",
      "Hårda krav skyddar dina gränser. Resten hjälper oss hitta en mer naturlig match.",
    ],
  "Agent search": [
    "에이전트 탐색",
    "エージェント検索",
    "Agent-Suche",
    "Recherche de l’Agent",
    "Zoektocht van de agent",
    "Agentens sökning",
  ],
  "Location and language": [
    "지역과 언어",
    "地域と言語",
    "Ort und Sprache",
    "Lieu et langue",
    "Locatie en taal",
    "Plats och språk",
  ],
  "Two-way boundaries": [
    "서로 확인하는 조건",
    "双方向の条件",
    "Beidseitige Grenzen",
    "Critères réciproques",
    "Wederzijdse grenzen",
    "Ömsesidiga gränser",
  ],
  "Your Dating Agent only considers someone when both location settings include each other and both people share a language—or both allow translation.":
    [
      "두 사람의 지역 설정이 서로를 포함하고 공통 언어가 있거나, 둘 다 번역에 동의할 때만 데이트 에이전트가 만남을 검토해요.",
      "地域設定が互いを含み、共通言語があるか双方が翻訳に同意した場合だけ候補になります。",
      "Dein Dating-Agent berücksichtigt nur Personen, wenn beide Ortsangaben zueinander passen und es eine gemeinsame Sprache gibt – oder beide Übersetzung erlauben.",
      "Votre Agent de rencontre ne considère une personne que si les zones se recoupent et qu’une langue est commune — ou si les deux acceptent la traduction.",
      "Je datingagent kijkt alleen naar iemand als beide locatiekeuzes elkaar omvatten en er een gedeelde taal is — of beiden vertaling toestaan.",
      "Din dejtingagent överväger bara någon när platsvalen omfattar varandra och ett gemensamt språk finns — eller båda tillåter översättning.",
    ],
  "Where may your Dating Agent look?": [
    "데이트 에이전트가 어디까지 찾아볼까요?",
    "デートエージェントはどこまで探せますか？",
    "Wo darf dein Dating-Agent suchen?",
    "Où votre Agent de rencontre peut-il chercher ?",
    "Waar mag je datingagent zoeken?",
    "Var får din dejtingagent leta?",
  ],
  "Matching location boundary": [
    "매칭 지역 범위",
    "マッチング地域",
    "Matching-Ortsbereich",
    "Zone de rencontre",
    "Matchgebied",
    "Matchningsområde",
  ],
  "Preferred matching areas": [
    "선호 매칭 지역",
    "希望する地域",
    "Bevorzugte Matching-Gebiete",
    "Zones de rencontre préférées",
    "Gewenste matchgebieden",
    "Föredragna matchningsområden",
  ],
  "Selected matching cities": [
    "선택한 매칭 도시",
    "選択した都市",
    "Ausgewählte Matching-Städte",
    "Villes de rencontre choisies",
    "Gekozen matchsteden",
    "Valda matchningsstäder",
  ],
  "Spoken languages": [
    "사용 가능 언어",
    "話せる言語",
    "Gesprochene Sprachen",
    "Langues parlées",
    "Gesproken talen",
    "Talade språk",
  ],
  "Choose a matching location and at least one language.": [
    "매칭 지역과 대화 언어를 하나 이상 선택해 주세요.",
    "マッチング地域と言語を1つ以上選んでください。",
    "Wähle einen Matching-Ort und mindestens eine Sprache.",
    "Choisissez une zone de rencontre et au moins une langue.",
    "Kies een matchlocatie en minstens één taal.",
    "Välj en matchningsplats och minst ett språk.",
  ],
  "Preferences saved.": [
    "매칭 설정을 저장했어요.",
    "設定を保存しました。",
    "Einstellungen gespeichert.",
    "Préférences enregistrées.",
    "Voorkeuren opgeslagen.",
    "Inställningarna sparades.",
  ],
  Who: ["누구", "相手", "Wer", "Qui", "Wie", "Vem"],
  People: ["사람", "相手", "Personen", "Personnes", "Mensen", "Personer"],
  "{min} to {max}": [
    "{min}~{max}세",
    "{min}〜{max}歳",
    "{min} bis {max}",
    "{min} à {max}",
    "{min} tot {max}",
    "{min} till {max}",
  ],
  "Minimum age": [
    "최소 연령",
    "最低年齢",
    "Mindestalter",
    "Âge minimum",
    "Minimumleeftijd",
    "Minimiålder",
  ],
  "Maximum age": [
    "최대 연령",
    "最高年齢",
    "Höchstalter",
    "Âge maximum",
    "Maximumleeftijd",
    "Maximiålder",
  ],
  to: ["~", "〜", "bis", "à", "tot", "till"],
  "How far you'll travel": [
    "이동 가능한 거리",
    "移動できる距離",
    "Wie weit du fahren würdest",
    "Distance acceptable",
    "Hoe ver je wilt reizen",
    "Hur långt du vill resa",
  ],
  "Up to {count} km": [
    "최대 {count}km",
    "最大{count}km",
    "Bis zu {count} km",
    "Jusqu’à {count} km",
    "Tot {count} km",
    "Upp till {count} km",
  ],
  "Maximum distance": [
    "최대 거리",
    "最大距離",
    "Maximale Entfernung",
    "Distance maximale",
    "Maximale afstand",
    "Maxavstånd",
  ],
  "What you're looking for": [
    "원하는 관계",
    "求める関係",
    "Was du suchst",
    "Ce que vous recherchez",
    "Wat je zoekt",
    "Vad du söker",
  ],
  "Open to anything": [
    "열어두고 싶어요",
    "特に決めていない",
    "Für alles offen",
    "Ouvert à tout",
    "Voor alles open",
    "Öppen för allt",
  ],
  "Something serious": [
    "진지한 관계",
    "真剣な関係",
    "Etwas Ernstes",
    "Une relation sérieuse",
    "Iets serieus",
    "Något seriöst",
  ],
  "Still working it out": [
    "아직 알아가는 중",
    "まだ考え中",
    "Noch unentschieden",
    "Encore en réflexion",
    "Nog aan het ontdekken",
    "Fortfarande osäker",
  ],
  "Relationship intent": [
    "관계 의향",
    "関係の希望",
    "Beziehungsabsicht",
    "Intention relationnelle",
    "Relatie-intentie",
    "Relationsavsikt",
  ],
  Smoking: ["흡연", "喫煙", "Rauchen", "Tabac", "Roken", "Rökning"],
  "Non-smokers": [
    "비흡연자",
    "非喫煙者",
    "Nichtraucher",
    "Non-fumeurs",
    "Niet-rokers",
    "Icke-rökare",
  ],
  Alcohol: ["음주", "飲酒", "Alkohol", "Alcool", "Alcohol", "Alkohol"],
  "A drink is fine": [
    "가벼운 음주는 괜찮아요",
    "少量なら大丈夫",
    "Ein Drink ist okay",
    "Un verre me convient",
    "Een drankje is prima",
    "En drink är okej",
  ],
  "Alcohol-free": [
    "비음주",
    "アルコールなし",
    "Alkoholfrei",
    "Sans alcool",
    "Alcoholvrij",
    "Alkoholfritt",
  ],
  "Best days": [
    "편한 요일",
    "都合のよい曜日",
    "Beste Tage",
    "Jours préférés",
    "Beste dagen",
    "Bästa dagar",
  ],
  "Day preference": [
    "요일 선호",
    "曜日の希望",
    "Tagespräferenz",
    "Préférence de jours",
    "Dagvoorkeur",
    "Dagspreferens",
  ],
  Either: [
    "상관없어요",
    "どちらでも",
    "Beides",
    "Les deux",
    "Beide",
    "Vilket som",
  ],
  Weekdays: ["평일", "平日", "Wochentage", "Semaine", "Weekdagen", "Vardagar"],
  Weekends: ["주말", "週末", "Wochenenden", "Week-end", "Weekenden", "Helger"],
  What: ["무엇", "内容", "Was", "Quoi", "Wat", "Vad"],
  "The date itself": [
    "데이트 방식",
    "デートそのもの",
    "Das Date selbst",
    "Le rendez-vous",
    "De date zelf",
    "Själva dejten",
  ],
  "What you'd genuinely like to do": [
    "정말 하고 싶은 것",
    "本当にしたいこと",
    "Was du wirklich tun möchtest",
    "Ce que vous aimeriez vraiment faire",
    "Wat je echt wilt doen",
    "Vad du verkligen vill göra",
  ],
  "The activity comes first. One good stop is enough.": [
    "하고 싶은 일이 먼저예요. 좋은 장소 하나면 충분해요.",
    "したいことが先です。良い場所は一つで十分です。",
    "Die Aktivität kommt zuerst. Ein guter Ort reicht.",
    "L’activité passe d’abord. Un bon lieu suffit.",
    "De activiteit komt eerst. Eén goede plek is genoeg.",
    "Aktiviteten kommer först. Ett bra stopp räcker.",
  ],
  "Date types": [
    "데이트 종류",
    "デートの種類",
    "Date-Arten",
    "Types de rendez-vous",
    "Soorten dates",
    "Dejttyper",
  ],
  "Indoors or outdoors": [
    "실내 또는 야외",
    "屋内または屋外",
    "Drinnen oder draußen",
    "Intérieur ou extérieur",
    "Binnen of buiten",
    "Inne eller ute",
  ],
  "Indoor or outdoor": [
    "실내·야외 선호",
    "屋内・屋外",
    "Drinnen oder draußen",
    "Intérieur ou extérieur",
    "Binnen of buiten",
    "Inne eller ute",
  ],
  Indoors: ["실내", "屋内", "Drinnen", "Intérieur", "Binnen", "Inne"],
  Outdoors: ["야외", "屋外", "Draußen", "Extérieur", "Buiten", "Ute"],
  Atmosphere: [
    "분위기",
    "雰囲気",
    "Atmosphäre",
    "Ambiance",
    "Sfeer",
    "Stämning",
  ],
  Quiet: ["차분한 곳", "静か", "Ruhig", "Calme", "Rustig", "Lugnt"],
  Lively: ["활기찬 곳", "にぎやか", "Lebhaft", "Animé", "Levendig", "Livligt"],
  "Comfortable spend, per person": [
    "1인당 편한 예산",
    "一人あたりの予算",
    "Angenehmes Budget pro Person",
    "Budget confortable par personne",
    "Comfortabel budget per persoon",
    "Bekväm kostnad per person",
  ],
  "Minimum budget": [
    "최소 예산",
    "最低予算",
    "Mindestbudget",
    "Budget minimum",
    "Minimumbudget",
    "Minimibudget",
  ],
  "Maximum budget": [
    "최대 예산",
    "最高予算",
    "Höchstbudget",
    "Budget maximum",
    "Maximumbudget",
    "Maxbudget",
  ],
  "Never plan anything outside this": [
    "이 범위를 넘기지 않기",
    "この範囲を超えない",
    "Niemals außerhalb planen",
    "Ne jamais dépasser ce budget",
    "Nooit buiten dit bereik plannen",
    "Planera aldrig utanför detta",
  ],
  "Dietary requirements": [
    "식이 조건",
    "食事条件",
    "Ernährungsbedürfnisse",
    "Contraintes alimentaires",
    "Dieetwensen",
    "Kostbehov",
  ],
  "Accessibility needs": [
    "접근성 요구",
    "アクセシビリティ",
    "Barrierefreiheit",
    "Besoins d’accessibilité",
    "Toegankelijkheidsbehoeften",
    "Tillgänglighetsbehov",
  ],
  "Used when choosing venues. Never shared with your match.": [
    "장소를 고를 때만 사용하며 상대에게 공유하지 않아요.",
    "会場選びだけに使い、相手には共有しません。",
    "Wird nur zur Ortswahl genutzt und nie mit dem Match geteilt.",
    "Utilisé uniquement pour choisir le lieu, jamais partagé avec l’autre personne.",
    "Alleen gebruikt om locaties te kiezen en nooit gedeeld met je match.",
    "Används bara för platsval och delas aldrig med din match.",
  ],
  "Save preferences": [
    "설정 저장",
    "設定を保存",
    "Einstellungen speichern",
    "Enregistrer les préférences",
    "Voorkeuren opslaan",
    "Spara inställningar",
  ],
  "This is a hard requirement": [
    "반드시 지켜야 해요",
    "必須条件です",
    "Das ist eine feste Anforderung",
    "C’est une exigence stricte",
    "Dit is een harde eis",
    "Detta är ett hårt krav",
  ],
  "We'll never match you outside this.": [
    "이 조건을 벗어나면 매칭하지 않아요.",
    "この条件外ではマッチしません。",
    "Außerhalb davon matchen wir dich nie.",
    "Aucune rencontre ne sera proposée hors de cette limite.",
    "We matchen je nooit buiten deze grens.",
    "Vi matchar dig aldrig utanför detta.",
  ],
  "We'll prefer this, but won't rule someone out for it.": [
    "우선 반영하지만 이것만으로 후보를 제외하진 않아요.",
    "優先しますが、これだけで候補を除外しません。",
    "Wir bevorzugen es, schließen aber niemanden allein deshalb aus.",
    "Nous le privilégions sans exclure quelqu’un pour ce seul motif.",
    "We geven hier voorkeur aan, maar sluiten niemand alleen daarom uit.",
    "Vi föredrar detta men utesluter ingen enbart därför.",
  ],
  "{count} selected": [
    "{count}개 선택",
    "{count}件選択",
    "{count} ausgewählt",
    "{count} sélectionné(s)",
    "{count} geselecteerd",
    "{count} valda",
  ],
  " — pick at least {count}": [
    " · 최소 {count}개 선택",
    "・{count}件以上選択",
    " · mindestens {count} wählen",
    " · choisissez-en au moins {count}",
    " · kies er minstens {count}",
    " · välj minst {count}",
  ],
  " — that's the maximum": [
    " · 최대 선택 완료",
    "・上限です",
    " · Maximum erreicht",
    " · maximum atteint",
    " · maximum bereikt",
    " · maxgränsen är nådd",
  ],
  "MATCHING BOUNDARY": [
    "매칭 가능 범위",
    "マッチング範囲",
    "MATCHING-BEREICH",
    "ZONE DE RECHERCHE",
    "MATCHGEBIED",
    "MATCHNINGSOMRÅDE",
  ],
  "Where may {agent} look?": [
    "{agent}가 어디까지 찾아볼까요?",
    "{agent}はどこまで探せますか？",
    "Wo darf {agent} suchen?",
    "Où {agent} peut-il chercher ?",
    "Waar mag {agent} zoeken?",
    "Var får {agent} leta?",
  ],
  "A match happens only when both people's location choices include each other.":
    [
      "두 사람의 지역 설정이 서로를 포함할 때만 매칭해요.",
      "お互いの地域設定に相手が含まれる場合だけマッチします。",
      "Ein Match entsteht nur, wenn die Ortswahl beider Personen zueinander passt.",
      "Une rencontre n’est proposée que si les choix de lieu des deux personnes se recoupent.",
      "Een match ontstaat alleen als de locatiekeuzes van beide mensen elkaar omvatten.",
      "En match sker bara när bådas platsval omfattar varandra.",
    ],
  "My selected area": [
    "선택한 동네만",
    "選んだエリアのみ",
    "Nur mein Gebiet",
    "Mon quartier seulement",
    "Alleen mijn buurt",
    "Bara mitt område",
  ],
  "Anywhere in my city": [
    "내 도시 전체",
    "自分の街全体",
    "Überall in meiner Stadt",
    "Partout dans ma ville",
    "Overal in mijn stad",
    "Hela min stad",
  ],
  "Cities I choose": [
    "직접 고른 도시",
    "選んだ都市",
    "Ausgewählte Städte",
    "Villes choisies",
    "Zelfgekozen steden",
    "Valda städer",
  ],
  "{count} cities selected · choose at least one.": [
    "도시 {count}곳 선택 · 한 곳 이상 골라주세요.",
    "{count}都市を選択・1つ以上選んでください。",
    "{count} Städte gewählt · wähle mindestens eine.",
    "{count} villes sélectionnées · choisissez-en au moins une.",
    "{count} steden gekozen · kies er minstens één.",
    "{count} städer valda · välj minst en.",
  ],
  "Searching only around {area}, {city}.": [
    "{city} {area} 근처에서만 찾아요.",
    "{city}の{area}周辺だけを探します。",
    "Suche nur rund um {area}, {city}.",
    "Recherche uniquement autour de {area}, {city}.",
    "We zoeken alleen rond {area}, {city}.",
    "Söker bara runt {area}, {city}.",
  ],
  "Searching across {city}.": [
    "{city} 전역에서 찾아요.",
    "{city}全域で探します。",
    "Suche in ganz {city}.",
    "Recherche dans tout {city}.",
    "We zoeken in heel {city}.",
    "Söker i hela {city}.",
  ],
  "Searching only in your {count} selected cities.": [
    "선택한 도시 {count}곳에서만 찾아요.",
    "選んだ{count}都市だけを探します。",
    "Suche nur in deinen {count} ausgewählten Städten.",
    "Recherche uniquement dans vos {count} villes sélectionnées.",
    "We zoeken alleen in je {count} gekozen steden.",
    "Söker bara i dina {count} valda städer.",
  ],
  "We match realistic meeting locations, not nationality.": [
    "국적이 아니라 실제로 만날 수 있는 지역을 기준으로 해요.",
    "国籍ではなく、実際に会える場所を基準にします。",
    "Wir matchen realistische Trefforte, nicht Nationalitäten.",
    "Nous faisons correspondre des lieux de rencontre réalistes, pas des nationalités.",
    "We matchen haalbare ontmoetingsplekken, geen nationaliteiten.",
    "Vi matchar realistiska mötesplatser, inte nationalitet.",
  ],
  "Languages you can comfortably use": [
    "편하게 대화할 수 있는 언어",
    "無理なく話せる言語",
    "Sprachen, die du sicher sprichst",
    "Langues que vous utilisez aisément",
    "Talen die je comfortabel spreekt",
    "Språk du bekvämt kan använda",
  ],
  "Choose at least one. A shared language is required unless both people allow translation.":
    [
      "하나 이상 골라주세요. 두 사람 모두 번역을 허용하지 않으면 공통 언어가 있어야 해요.",
      "1つ以上選んでください。双方が翻訳を許可しない限り、共通言語が必要です。",
      "Wähle mindestens eine. Ohne beidseitige Übersetzungserlaubnis ist eine gemeinsame Sprache nötig.",
      "Choisissez-en au moins une. Une langue commune est requise sauf si les deux personnes acceptent la traduction.",
      "Kies er minstens één. Zonder wederzijdse toestemming voor vertaling is een gedeelde taal nodig.",
      "Välj minst ett. Ett gemensamt språk krävs om inte båda tillåter översättning.",
    ],
  "Allow translated Agent dates": [
    "번역을 사용하는 에이전트 데이트 허용",
    "翻訳を使うエージェントデートを許可",
    "Übersetzte Agent-Dates erlauben",
    "Autoriser les rendez-vous d’Agents traduits",
    "Vertaalde agentdates toestaan",
    "Tillåt översatta Agent-dejter",
  ],
  "Only when the other person opts in too.": [
    "상대방도 동의했을 때만 사용해요.",
    "相手も同意した場合のみ使います。",
    "Nur wenn die andere Person ebenfalls zustimmt.",
    "Uniquement si l’autre personne accepte aussi.",
    "Alleen als de ander dit ook toestaat.",
    "Bara när den andra personen också godkänner det.",
  ],
  "Matching location selected": [
    "매칭 지역 선택",
    "マッチング地域を選択",
    "Matching-Ort gewählt",
    "Zone de recherche choisie",
    "Matchlocatie gekozen",
    "Matchningsplats vald",
  ],
  "At least one shared language": [
    "대화 언어 한 개 이상",
    "会話言語を1つ以上",
    "Mindestens eine gemeinsame Sprache",
    "Au moins une langue commune",
    "Minstens één gedeelde taal",
    "Minst ett gemensamt språk",
  ],
  Optional: [
    "선택 사항",
    "任意",
    "Optional",
    "Facultatif",
    "Optioneel",
    "Valfritt",
  ],
  Film: ["영화", "映画", "Film", "Film", "Film", "Film"],
  Dinner: ["저녁 식사", "夕食", "Abendessen", "Dîner", "Diner", "Middag"],
  Drinks: [
    "가볍게 한잔",
    "軽く一杯",
    "Etwas trinken",
    "Prendre un verre",
    "Een drankje",
    "Ta något att dricka",
  ],
  Exhibition: [
    "전시",
    "展覧会",
    "Ausstellung",
    "Exposition",
    "Tentoonstelling",
    "Utställning",
  ],
  Museum: ["박물관", "博物館", "Museum", "Musée", "Museum", "Museum"],
  Walk: ["산책", "散歩", "Spaziergang", "Promenade", "Wandeling", "Promenad"],
  Dessert: ["디저트", "デザート", "Dessert", "Dessert", "Dessert", "Efterrätt"],
  "Live music": [
    "라이브 음악",
    "ライブ音楽",
    "Live-Musik",
    "Concert",
    "Livemuziek",
    "Livemusik",
  ],
  "Casual activity": [
    "가벼운 액티비티",
    "気軽なアクティビティ",
    "Lockere Aktivität",
    "Activité décontractée",
    "Ontspannen activiteit",
    "Avslappnad aktivitet",
  ],
  "Something unexpected": [
    "색다른 무언가",
    "ちょっと意外なこと",
    "Etwas Unerwartetes",
    "Quelque chose d’inattendu",
    "Iets onverwachts",
    "Något oväntat",
  ],
  Warm: ["따뜻함", "温かい", "Herzlich", "Chaleureux", "Warm", "Varm"],
  Playful: [
    "장난기 있음",
    "遊び心がある",
    "Verspielt",
    "Joueur",
    "Speels",
    "Lekfull",
  ],
  Calm: ["차분함", "穏やか", "Ruhig", "Calme", "Kalm", "Lugn"],
  Direct: ["솔직함", "率直", "Direkt", "Franc", "Direct", "Rakt på sak"],
  Thoughtful: [
    "사려 깊음",
    "思いやりがある",
    "Aufmerksam",
    "Attentionné",
    "Attent",
    "Omtänksam",
  ],
  Spontaneous: [
    "즉흥성",
    "フットワークが軽い",
    "Spontan",
    "Spontané",
    "Spontaan",
    "Spontan",
  ],
  Reliable: [
    "믿음직함",
    "頼れる",
    "Zuverlässig",
    "Fiable",
    "Betrouwbaar",
    "Pålitlig",
  ],
  Natural: [
    "자연스러움",
    "ナチュラル",
    "Natürlich",
    "Naturel",
    "Natuurlijk",
    "Naturlig",
  ],
  Classic: [
    "클래식",
    "クラシック",
    "Klassisch",
    "Classique",
    "Klassiek",
    "Klassisk",
  ],
  Sporty: [
    "스포티",
    "スポーティー",
    "Sportlich",
    "Sportif",
    "Sportief",
    "Sportig",
  ],
  Creative: [
    "크리에이티브",
    "クリエイティブ",
    "Kreativ",
    "Créatif",
    "Creatief",
    "Kreativ",
  ],
  Minimal: [
    "미니멀",
    "ミニマル",
    "Minimalistisch",
    "Minimaliste",
    "Minimalistisch",
    "Minimalistisk",
  ],
  Bold: ["대담함", "大胆", "Markant", "Audacieux", "Gedurfd", "Djärv"],
  Vegetarian: [
    "채식",
    "ベジタリアン",
    "Vegetarisch",
    "Végétarien",
    "Vegetarisch",
    "Vegetarisk",
  ],
  Vegan: ["비건", "ヴィーガン", "Vegan", "Végane", "Veganistisch", "Vegansk"],
  Halal: ["할랄", "ハラール", "Halal", "Halal", "Halal", "Halal"],
  Kosher: ["코셔", "コーシャ", "Koscher", "Casher", "Koosjer", "Kosher"],
  "Gluten free": [
    "글루텐 프리",
    "グルテンフリー",
    "Glutenfrei",
    "Sans gluten",
    "Glutenvrij",
    "Glutenfritt",
  ],
  "No pork": [
    "돼지고기 제외",
    "豚肉なし",
    "Ohne Schweinefleisch",
    "Sans porc",
    "Geen varkensvlees",
    "Utan fläskkött",
  ],
  "Nut allergy": [
    "견과류 알레르기",
    "ナッツアレルギー",
    "Nussallergie",
    "Allergie aux fruits à coque",
    "Notenallergie",
    "Nötallergi",
  ],
  "Shellfish allergy": [
    "갑각류 알레르기",
    "甲殻類アレルギー",
    "Schalentierallergie",
    "Allergie aux crustacés",
    "Schaaldierallergie",
    "Skaldjursallergi",
  ],
  "Alcohol-free venue": [
    "주류 없는 장소",
    "アルコールのない店",
    "Alkoholfreier Ort",
    "Lieu sans alcool",
    "Alcoholvrije locatie",
    "Alkoholfri plats",
  ],
  "Step-free access": [
    "단차 없는 출입",
    "段差のないアクセス",
    "Stufenloser Zugang",
    "Accès sans marche",
    "Drempelvrije toegang",
    "Stegfri åtkomst",
  ],
  "No stairs": [
    "계단 없음",
    "階段なし",
    "Keine Treppen",
    "Sans escalier",
    "Geen trappen",
    "Inga trappor",
  ],
  "Wheelchair accessible": [
    "휠체어 이용 가능",
    "車いす対応",
    "Rollstuhlgerecht",
    "Accessible en fauteuil roulant",
    "Rolstoeltoegankelijk",
    "Rullstolsanpassat",
  ],
  "Low-noise space": [
    "조용한 공간",
    "静かな空間",
    "Ruhiger Ort",
    "Espace calme",
    "Prikkelarme ruimte",
    "Lugn miljö",
  ],
  "Service animal welcome": [
    "보조견 동반 가능",
    "介助犬同伴可",
    "Assistenztiere willkommen",
    "Animaux d’assistance acceptés",
    "Hulphond welkom",
    "Assistanshund välkommen",
  ],
  "Accessible toilet": [
    "장애인 화장실",
    "バリアフリートイレ",
    "Barrierefreie Toilette",
    "Toilettes accessibles",
    "Toegankelijk toilet",
    "Tillgänglig toalett",
  ],
  "New York": [
    "뉴욕",
    "ニューヨーク",
    "New York",
    "New York",
    "New York",
    "New York",
  ],
  London: ["런던", "ロンドン", "London", "Londres", "Londen", "London"],
  Toronto: ["토론토", "トロント", "Toronto", "Toronto", "Toronto", "Toronto"],
  Sydney: ["시드니", "シドニー", "Sydney", "Sydney", "Sydney", "Sydney"],
  Tokyo: ["도쿄", "東京", "Tokio", "Tokyo", "Tokio", "Tokyo"],
  Berlin: ["베를린", "ベルリン", "Berlin", "Berlin", "Berlijn", "Berlin"],
  Paris: ["파리", "パリ", "Paris", "Paris", "Parijs", "Paris"],
  Amsterdam: [
    "암스테르담",
    "アムステルダム",
    "Amsterdam",
    "Amsterdam",
    "Amsterdam",
    "Amsterdam",
  ],
  Stockholm: [
    "스톡홀름",
    "ストックホルム",
    "Stockholm",
    "Stockholm",
    "Stockholm",
    "Stockholm",
  ],
  Yeonnam: ["연남", "ヨンナム", "Yeonnam", "Yeonnam", "Yeonnam", "Yeonnam"],
  Itaewon: ["이태원", "イテウォン", "Itaewon", "Itaewon", "Itaewon", "Itaewon"],
  Gangnam: ["강남", "江南", "Gangnam", "Gangnam", "Gangnam", "Gangnam"],
  Hongdae: ["홍대", "弘大", "Hongdae", "Hongdae", "Hongdae", "Hongdae"],
  Euljiro: ["을지로", "ウルチロ", "Euljiro", "Euljiro", "Euljiro", "Euljiro"],
  Samcheong: [
    "삼청",
    "三清洞",
    "Samcheong",
    "Samcheong",
    "Samcheong",
    "Samcheong",
  ],
  Mangwon: ["망원", "マンウォン", "Mangwon", "Mangwon", "Mangwon", "Mangwon"],
  Seochon: ["서촌", "西村", "Seochon", "Seochon", "Seochon", "Seochon"],
  Jamsil: ["잠실", "蚕室", "Jamsil", "Jamsil", "Jamsil", "Jamsil"],
};

export const settingsCopy: Record<
  string,
  readonly [string, string, string, string, string, string]
> = {
  "Private control room": [
    "나만의 컨트롤 룸",
    "プライベート設定室",
    "Privater Kontrollraum",
    "Espace de contrôle privé",
    "Privé-instellingen",
    "Privat kontrollrum",
  ],
  "Agent settings": [
    "에이전트 설정",
    "エージェント設定",
    "Agent-Einstellungen",
    "Réglages de l’Agent",
    "Agentinstellingen",
    "Agentinställningar",
  ],
  "The big switch": [
    "데이트 활동",
    "デート活動",
    "Date-Aktivität",
    "Activité de rencontre",
    "Date-activiteit",
    "Dejtaktivitet",
  ],
  "Let my Dating Agent date": [
    "내 데이트 에이전트의 데이트",
    "デートエージェントのデート",
    "Mein Dating-Agent darf daten",
    "Autoriser mon Agent de rencontre à sortir avec quelqu’un",
    "Mijn datingagent laten daten",
    "Låt min dejtingagent dejta",
  ],
  "My Dating Agent may meet other agents": [
    "다른 에이전트와 만날 수 있어요",
    "ほかのエージェントと会える",
    "Mein Dating-Agent darf andere Agents treffen",
    "Mon Agent de rencontre peut échanger avec d’autres Agents",
    "Mijn datingagent mag andere agents ontmoeten",
    "Min dejtingagent får träffa andra agenter",
  ],
  "Turn this off at any time. A simulation already running may finish, but it can never share contact for you.":
    [
      "언제든 끌 수 있어요. 진행 중인 데이트는 마칠 수 있지만, 에이전트가 내 대신 연락처를 공개할 수는 없어요.",
      "いつでもオフにできます。進行中のデートは完了しても、連絡先を代わりに公開することはありません。",
      "Du kannst dies jederzeit ausschalten. Ein laufendes Date darf enden, aber dein Agent teilt niemals Kontakte für dich.",
      "Vous pouvez désactiver ceci à tout moment. Un rendez-vous en cours peut se terminer, mais l’Agent ne partagera jamais vos coordonnées à votre place.",
      "Je kunt dit altijd uitzetten. Een lopende date mag afronden, maar je agent deelt nooit namens jou contactgegevens.",
      "Du kan stänga av detta när som helst. En pågående dejt kan slutföras, men Agenten delar aldrig kontakt åt dig.",
    ],
  "Agent name": [
    "에이전트 이름",
    "エージェント名",
    "Agent-Name",
    "Nom de l’Agent",
    "Naam van de agent",
    "Agentens namn",
  ],
  "Private instructions": [
    "비공개 브리핑",
    "非公開の指示",
    "Private Anweisungen",
    "Consignes privées",
    "Privé-instructies",
    "Privata instruktioner",
  ],
  "How my Dating Agent represents me": [
    "내 데이트 에이전트가 나를 표현하는 방식",
    "デートエージェントが私を表す方法",
    "Wie mein Dating-Agent mich vertritt",
    "Comment mon Agent de rencontre me représente",
    "Hoe mijn datingagent mij vertegenwoordigt",
    "Hur min dejtingagent representerar mig",
  ],
  "The unpolished you": [
    "꾸미지 않은 나",
    "飾らない自分",
    "Dein ungeschöntes Ich",
    "Vous, sans filtre",
    "Jij zonder opsmuk",
    "Du utan filter",
  ],
  "Correct this whenever your Dating Agent starts sounding like a résumé.": [
    "데이트 에이전트가 이력서처럼 말하기 시작하면 바로 고쳐주세요.",
    "デートエージェントが履歴書のように話し始めたら修正してください。",
    "Korrigiere dies, sobald dein Dating-Agent wie ein Lebenslauf klingt.",
    "Corrigez ceci dès que votre Agent de rencontre commence à parler comme un CV.",
    "Pas dit aan zodra je datingagent als een cv begint te klinken.",
    "Rätta detta när din dejtingagent börjar låta som ett cv.",
  ],
  "The connection it should look for": [
    "찾아야 할 관계",
    "探してほしい関係",
    "Welche Verbindung gesucht wird",
    "La relation à rechercher",
    "De verbinding om naar te zoeken",
    "Relationen den ska leta efter",
  ],
  "Hard boundaries": [
    "반드시 지킬 선",
    "絶対に守る条件",
    "Feste Grenzen",
    "Limites absolues",
    "Harde grenzen",
    "Hårda gränser",
  ],
  "One per line. These remain private to your Dating Agent.": [
    "한 줄에 하나씩 적어주세요. 데이트 에이전트만 볼 수 있어요.",
    "1行に1つ入力してください。デートエージェントだけが確認できます。",
    "Eine pro Zeile. Sie bleiben nur deinem Dating-Agenten bekannt.",
    "Une par ligne. Elles restent privées pour votre Agent de rencontre.",
    "Eén per regel. Alleen je datingagent ziet ze.",
    "En per rad. Bara din dejtingagent ser dem.",
  ],
  Voice: ["말투", "話し方", "Stimme", "Ton", "Stem", "Röst"],
  "Warm and perceptive": [
    "따뜻하고 세심하게",
    "温かく洞察的",
    "Warm und aufmerksam",
    "Chaleureux et perspicace",
    "Warm en opmerkzaam",
    "Varm och lyhörd",
  ],
  "Playful and quick": [
    "재치 있고 경쾌하게",
    "遊び心があり軽快",
    "Verspielt und schlagfertig",
    "Enjoué et vif",
    "Speels en vlot",
    "Lekfull och snabb",
  ],
  "Direct and candid": [
    "직접적이고 솔직하게",
    "率直で正直",
    "Direkt und offen",
    "Direct et franc",
    "Direct en open",
    "Rak och ärlig",
  ],
  "Quiet and considered": [
    "차분하고 신중하게",
    "静かで思慮深い",
    "Ruhig und überlegt",
    "Calme et réfléchi",
    "Rustig en bedachtzaam",
    "Lugn och eftertänksam",
  ],
  Advocacy: [
    "추천 강도",
    "後押しの強さ",
    "Empfehlungsstärke",
    "Niveau d’insistance",
    "Aanbevelingskracht",
    "Rekommendationsnivå",
  ],
  "Observe — never push": [
    "관찰 — 권하지 않기",
    "観察 — 勧めない",
    "Beobachten — nie drängen",
    "Observer — ne jamais insister",
    "Observeren — nooit aandringen",
    "Observera — pressa aldrig",
  ],
  "Suggest — make the case": [
    "제안 — 이유를 설명하기",
    "提案 — 理由を伝える",
    "Vorschlagen — Gründe nennen",
    "Suggérer — expliquer pourquoi",
    "Voorstellen — leg uit waarom",
    "Föreslå — förklara varför",
  ],
  "Advocate — push when convinced": [
    "적극 추천 — 확신할 때 밀어주기",
    "強く推薦 — 確信したら後押し",
    "Empfehlen — bei Überzeugung ermutigen",
    "Convaincre — encourager si certain",
    "Overtuigen — aanmoedigen bij zekerheid",
    "Förespråka — uppmuntra när den är övertygad",
  ],
  "Save agent": [
    "에이전트 저장",
    "エージェントを保存",
    "Agent speichern",
    "Enregistrer l’Agent",
    "Agent opslaan",
    "Spara Agent",
  ],
  "Private delivery": [
    "비공개 알림",
    "非公開のお知らせ",
    "Private Zustellung",
    "Envois privés",
    "Privéberichten",
    "Privata utskick",
  ],
  "What arrives by email": [
    "이메일로 받을 내용",
    "メールで受け取るもの",
    "Was per E-Mail ankommt",
    "Ce qui arrive par e-mail",
    "Wat je per e-mail ontvangt",
    "Det som kommer via e-post",
  ],
  "Email me at all": [
    "이메일 알림 받기",
    "メール通知を受け取る",
    "E-Mails erhalten",
    "Recevoir les e-mails",
    "E-mails ontvangen",
    "Ta emot e-post",
  ],
  "Turn off private debrief and connection emails. Safety notices can still send.":
    [
      "끄면 비공개 리포트와 연결 메일을 받지 않아요. 안전 관련 안내는 계속 발송될 수 있어요.",
      "オフにすると非公開レポートと連絡成立メールを停止します。安全通知は届く場合があります。",
      "Deaktiviert private Berichte und Verbindungs-E-Mails. Sicherheitshinweise können weiterhin gesendet werden.",
      "Désactive les bilans privés et les e-mails de mise en relation. Les alertes de sécurité peuvent toujours être envoyées.",
      "Schakelt privéverslagen en verbindingsmails uit. Veiligheidsmeldingen kunnen nog wel worden verstuurd.",
      "Stänger av privata rapporter och kontaktmejl. Säkerhetsmeddelanden kan fortfarande skickas.",
    ],
  "Agent debriefs": [
    "에이전트 데이트 리포트",
    "エージェントのデートレポート",
    "Agent-Date-Berichte",
    "Bilans de rendez-vous",
    "Agentdate-verslagen",
    "Agentens dejtrapporter",
  ],
  "Mutual introductions": [
    "서로 만나기로 했을 때",
    "相互紹介",
    "Gegenseitige Vorstellung",
    "Mises en relation mutuelles",
    "Wederzijdse introducties",
    "Ömsesidiga introduktioner",
  ],
  "A message only when two humans independently say yes.": [
    "두 사람이 각자 좋다고 답했을 때만 알려드려요.",
    "2人がそれぞれ会いたいと答えた場合だけ通知します。",
    "Eine Nachricht nur, wenn beide Menschen unabhängig Ja sagen.",
    "Un message seulement lorsque les deux personnes disent oui séparément.",
    "Alleen een bericht wanneer beide mensen afzonderlijk ja zeggen.",
    "Ett meddelande först när båda personerna var för sig säger ja.",
  ],
  "The human": ["사람", "本人", "Mensch", "Personne", "Mens", "Personen"],
  "Profile, matching, and policy": [
    "프로필·매칭·정책",
    "プロフィール・マッチング・ポリシー",
    "Profil, Matching und Regeln",
    "Profil, rencontres et règles",
    "Profiel, matching en beleid",
    "Profil, matchning och policy",
  ],
  "Human profile": [
    "내 프로필",
    "本人プロフィール",
    "Personenprofil",
    "Profil personnel",
    "Persoonlijk profiel",
    "Personprofil",
  ],
  "Bio, interests, optional photo, and how it may appear after an agent date": [
    "소개, 관심사, 선택 사진과 에이전트 데이트 뒤 공개 방식",
    "自己紹介、興味、任意の写真とエージェントデート後の表示方法",
    "Bio, Interessen, optionales Foto und Anzeige nach einem Agent-Date",
    "Bio, centres d’intérêt, photo facultative et affichage après un rendez-vous d’Agents",
    "Bio, interesses, optionele foto en weergave na een agentdate",
    "Bio, intressen, valfritt foto och visning efter en Agent-dejt",
  ],
  "Matching boundaries": [
    "매칭 범위와 기준",
    "マッチング条件",
    "Matching-Grenzen",
    "Critères de rencontre",
    "Matchgrenzen",
    "Matchningsgränser",
  ],
  "Age, distance, intent, lifestyle, and preferred areas": [
    "나이, 거리, 관계 의향, 생활 방식, 선호 지역",
    "年齢、距離、目的、ライフスタイル、希望エリア",
    "Alter, Entfernung, Absicht, Lebensstil und bevorzugte Gebiete",
    "Âge, distance, intention, mode de vie et zones préférées",
    "Leeftijd, afstand, intentie, leefstijl en voorkeursgebieden",
    "Ålder, avstånd, avsikt, livsstil och önskade områden",
  ],
  "Exactly what each agent and human can receive": [
    "에이전트와 사람이 각각 볼 수 있는 정보",
    "各エージェントと本人が受け取れる情報",
    "Genau welche Informationen Agent und Mensch erhalten",
    "Ce que chaque Agent et chaque personne peut recevoir",
    "Welke informatie elke agent en persoon kan ontvangen",
    "Exakt vilken information varje Agent och person får",
  ],
  "AI limitations, human consent, and beta conditions": [
    "AI의 한계, 사람의 동의, 베타 운영 조건",
    "AIの限界、本人の同意、ベータ条件",
    "KI-Grenzen, menschliche Zustimmung und Beta-Bedingungen",
    "Limites de l’IA, consentement humain et conditions bêta",
    "AI-beperkingen, menselijke toestemming en bètavoorwaarden",
    "AI-begränsningar, mänskligt samtycke och betavillkor",
  ],
  "Truthfulness, prompt attacks, conduct, and reporting": [
    "솔직한 정보, 프롬프트 공격, 행동 기준, 신고",
    "正直な情報、プロンプト攻撃、行動基準、通報",
    "Ehrlichkeit, Prompt-Angriffe, Verhalten und Meldungen",
    "Sincérité, attaques de prompt, conduite et signalement",
    "Eerlijkheid, promptaanvallen, gedrag en melden",
    "Ärlighet, promptattacker, uppförande och rapportering",
  ],
  "Before any real-world meeting": [
    "실제로 만나기 전에 확인할 내용",
    "実際に会う前の確認事項",
    "Vor jedem Treffen in der realen Welt",
    "Avant toute rencontre réelle",
    "Voor elke ontmoeting in het echt",
    "Före varje möte i verkligheten",
  ],
  "Blocked people": [
    "차단한 사람",
    "ブロックした人",
    "Blockierte Personen",
    "Personnes bloquées",
    "Geblokkeerde personen",
    "Blockerade personer",
  ],
  "You haven't blocked anyone. A block prevents both agents from ever being paired again.":
    [
      "차단한 사람이 없어요. 차단하면 두 에이전트는 다시 매칭되지 않아요.",
      "ブロックした人はいません。ブロックすると両方のエージェントは二度とマッチしません。",
      "Du hast niemanden blockiert. Eine Blockierung verhindert jedes erneute Pairing der beiden Agents.",
      "Vous n’avez bloqué personne. Un blocage empêche définitivement les deux Agents d’être associés.",
      "Je hebt niemand geblokkeerd. Een blokkering voorkomt dat beide agents ooit opnieuw worden gekoppeld.",
      "Du har inte blockerat någon. En blockering hindrar Agenterna från att matchas igen.",
    ],
};

export const avatarStudioCopy: Record<string, readonly [string, string, string, string, string, string]> = {
  "DATEHAJA · CHARACTER STUDIO": [
    "DATEHAJA · 아바타 스튜디오",
    "DATEHAJA · アバタースタジオ",
    "DATEHAJA · AVATAR-STUDIO",
    "DATEHAJA · STUDIO D’AVATARS",
    "DATEHAJA · AVATARSTUDIO",
    "DATEHAJA · AVATARSTUDIO"
  ],
  "A little more you.": [
    "조금 더, 나답게.",
    "もっと、自分らしく。",
    "Ein bisschen mehr du.",
    "Un peu plus vous.",
    "Een beetje meer jij.",
    "Lite mer du."
  ],
  "One character. Every little detail, yours.": [
    "작은 디테일까지, 나만의 아바타.",
    "細部まで、あなただけのアバター。",
    "Ein Avatar. Jedes Detail gehört dir.",
    "Un avatar. Chaque détail vous appartient.",
    "Eén avatar. Elk detail van jou.",
    "En avatar. Varje detalj är din."
  ],
  "Back to Datehaja ↗": [
    "Datehaja로 돌아가기 ↗",
    "Datehajaに戻る ↗",
    "Zurück zu Datehaja ↗",
    "Retour à Datehaja ↗",
    "Terug naar Datehaja ↗",
    "Tillbaka till Datehaja ↗"
  ],
  "Character looks": [
    "아바타 스타일",
    "アバタースタイル",
    "Avatar-Stile",
    "Styles d’avatar",
    "Avatarstijlen",
    "Avatarstilar"
  ],
  "Try {agent}'s look": [
    "{agent} 스타일 적용",
    "{agent}のスタイルを試す",
    "{agent}s Stil ausprobieren",
    "Essayer le style de {agent}",
    "Probeer de stijl van {agent}",
    "Prova {agent}s stil"
  ],
  "Small avatar previews": [
    "작은 아바타 미리보기",
    "小さなアバターのプレビュー",
    "Kleine Avatar-Vorschau",
    "Aperçus des petits avatars",
    "Kleine avatarvoorbeelden",
    "Små avatarförhandsvisningar"
  ],
  "READY FOR A FIRST DATE": [
    "첫 데이트 준비 완료",
    "初デートの準備完了",
    "BEREIT FÜRS ERSTE DATE",
    "PRÊT POUR UN PREMIER RENDEZ-VOUS",
    "KLAAR VOOR EEN EERSTE DATE",
    "REDO FÖR EN FÖRSTA DEJT"
  ],
  "MAKE IT YOURS": [
    "나만의 스타일로",
    "自分らしく",
    "MACH IHN ZU DEINEM",
    "À VOTRE IMAGE",
    "MAAK HET VAN JOU",
    "GÖR DEN TILL DIN"
  ],
  "The details make the character.": [
    "디테일로 완성하는 나의 아바타.",
    "細部が個性をつくる。",
    "Die Details machen den Avatar.",
    "Les détails font le personnage.",
    "De details maken het personage.",
    "Detaljerna skapar karaktären."
  ],
  "AT HOME IN THE WORLD": [
    "아바타가 머무는 공간",
    "アバターのいる世界",
    "ZU HAUSE IN DER WELT",
    "CHEZ SOI DANS LE MONDE",
    "THUIS IN DE WERELD",
    "HEMMA I VÄRLDEN"
  ],
  "Same look. A life of their own.": [
    "내가 꾸민 모습 그대로, 살아 움직여요.",
    "その姿のまま、生き生きと。",
    "Derselbe Stil. Ein eigenes Leben.",
    "Le même style. Sa propre vie.",
    "Dezelfde stijl. Een eigen leven.",
    "Samma stil. Ett eget liv."
  ],
  "Hair, expression, outfit and accessories carry through to the date.": [
    "헤어, 표정, 의상, 액세서리가 데이트에도 그대로 반영돼요.",
    "髪型、表情、服、アクセサリーがデートにもそのまま反映されます。",
    "Frisur, Ausdruck, Outfit und Accessoires bleiben beim Date erhalten.",
    "Coiffure, expression, tenue et accessoires restent les mêmes pendant le rendez-vous.",
    "Kapsel, uitdrukking, outfit en accessoires blijven tijdens de date hetzelfde.",
    "Frisyr, uttryck, kläder och accessoarer följer med på dejten."
  ]
};

export const dateLetterCopy: Record<string, readonly string[]> = {
  "Here's how I'd say it:": ["나라면 이렇게 말할 것 같아:", "私ならこう言うと思う：", "Ich würde es so sagen:", "Moi, je le dirais comme ça :", "Ik zou het zo zeggen:", "Jag skulle säga så här:"],
  "I liked this about them:": ["상대의 이런 점은 좋았어:", "相手のここがよかった：", "Das mochte ich an der Person:", "J'ai aimé ça chez cette personne :", "Dit vond ik leuk aan die persoon:", "Det här gillade jag hos personen:"],
  "Next time, look for someone who…": ["다음엔 이런 사람을 찾아줘…", "次はこんな人を探して…", "Such nächstes Mal jemanden, der …", "La prochaine fois, cherche quelqu'un qui…", "Zoek de volgende keer iemand die…", "Leta nästa gång efter någon som…"],
  "Keep my replies short and natural.": ["내 말은 짧고 자연스럽게 해줘.", "私の返事は短く自然にして。", "Halte meine Antworten kurz und natürlich.", "Garde mes réponses courtes et naturelles.", "Houd mijn antwoorden kort en natuurlijk.", "Håll mina svar korta och naturliga."],
  "Look for someone who is curious about me too.": ["나한테도 궁금한 게 있는 사람을 찾아줘.", "私にも興味を持ってくれる人を探して。", "Such jemanden, der auch auf mich neugierig ist.", "Cherche quelqu'un qui s'intéresse aussi à moi.", "Zoek iemand die ook nieuwsgierig naar mij is.", "Leta efter någon som också är nyfiken på mig."],
  "What have you learned about me?": ["지금까지 나에 대해 뭘 알게 됐어?", "今まで私について何がわかった？", "Was hast du bisher über mich gelernt?", "Qu'as-tu appris sur moi jusqu'ici ?", "Wat heb je tot nu toe over mij geleerd?", "Vad har du lärt dig om mig hittills?"],
  "Tell me how you'd say it, who you'd like to meet, or what felt right…": ["나라면 어떻게 말할지, 어떤 사람이 좋은지, 뭐가 좋았는지 들려줘…", "自分ならどう話すか、どんな人がいいか、何がよかったか教えて…", "Sag mir, wie du es sagen würdest, wen du treffen möchtest oder was dir gefiel…", "Dis-moi comment tu le dirais, qui tu aimerais rencontrer ou ce qui t'a plu…", "Vertel hoe jij het zou zeggen, wie je wilt ontmoeten of wat goed voelde…", "Berätta hur du skulle säga det, vem du vill träffa eller vad som kändes bra…"],
  "One saved conversation. Two independent reads. Your decision.": ["하나의 대화 기록. 각자의 독립적인 회고. 결정은 당신에게.", "ひとつの会話記録。それぞれの振り返り。決めるのはあなた。", "Ein gespeichertes Gespräch. Zwei unabhängige Einschätzungen. Deine Entscheidung.", "Une conversation enregistrée. Deux avis indépendants. Votre décision.", "Eén bewaard gesprek. Twee onafhankelijke inzichten. Jouw beslissing.", "Ett sparat samtal. Två oberoende bedömningar. Ditt beslut."],
  "Read the whole conversation": ["대화 전체 읽기", "会話をすべて読む", "Das ganze Gespräch lesen", "Lire toute la conversation", "Lees het hele gesprek", "Läs hela samtalet"],
};

for (const copy of [agentWorkspaceCopy, settingsCopy, avatarStudioCopy, dateLetterCopy, scoutingCopy, coachingCopy, productCopy]) {
  for (const [message, values] of Object.entries(copy)) {
    ko[message] = values[0];
    ja[message] = values[1];
    de[message] = values[2];
    fr[message] = values[3];
    nl[message] = values[4];
    sv[message] = values[5];
  }
}

export function missingCoreTranslations(locale: LocaleCode): string[] {
  const pack = PACKS[locale];
  if (!pack) return [];
  return CORE_TRANSLATION_MESSAGES.filter(
    (message) => pack[message] === undefined || pack[message] === message,
  );
}

export function isLocaleCode(
  value: string | null | undefined,
): value is LocaleCode {
  return SUPPORTED_LOCALES.some((locale) => locale.code === value);
}

export function chooseLocale(candidates: readonly string[]): LocaleCode {
  for (const candidate of candidates) {
    const normalised = candidate.replace("_", "-");
    const exact = SUPPORTED_LOCALES.find(
      (locale) => locale.code.toLowerCase() === normalised.toLowerCase(),
    );
    if (exact) return exact.code;
  }

  for (const candidate of candidates) {
    const language = candidate.split(/[-_]/)[0]?.toLowerCase();
    const sameLanguage = SUPPORTED_LOCALES.find((locale) =>
      locale.code.toLowerCase().startsWith(`${language}-`),
    );
    if (sameLanguage) return sameLanguage.code;
  }

  return DEFAULT_LOCALE;
}

export function translate(
  locale: LocaleCode,
  message: string,
  values?: Record<string, string | number>,
): string {
  const template = PACKS[locale]?.[message] ?? message;
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(values[key] ?? `{${key}}`),
  );
}

function initialLocale(): LocaleCode {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocaleCode(stored)) {
      runtimeLocale = stored;
      return stored;
    }
  } catch {
    // Private browsing can make storage unavailable.
  }
  const detected = chooseLocale(
    window.navigator.languages ?? [window.navigator.language],
  );
  runtimeLocale = detected;
  return detected;
}

type I18nValue = {
  locale: LocaleCode;
  /**
   * `persist: false` switches the current view only. The fictional preview
   * pages are written in one language and force it on arrival; remembering
   * that choice would switch the whole product for a visitor who only
   * followed a link from their own locale.
   */
  setLocale: (locale: LocaleCode, options?: { persist?: boolean }) => void;
  t: (message: string, values?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(initialLocale);

  const setLocale = useCallback(
    (next: LocaleCode, options?: { persist?: boolean }) => {
      runtimeLocale = next;
      document.documentElement.lang = next;
      if (options?.persist !== false) {
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // The selection still works for the current page.
        }
      }
      setLocaleState(next);
    },
    [],
  );

  const t = useCallback(
    (message: string, values?: Record<string, string | number>) =>
      translate(locale, message, values),
    [locale],
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    const title = `Datehaja — ${translate(locale, "my second self dates for me.")}`;
    const description = translate(
      locale,
      "Create one AI second self. It goes on the date as you, meets someone else's, and writes home privately. Contact opens only when both people say yes.",
    );
    document.title = title;
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", title);
    document
      .querySelector('meta[name="twitter:title"]')
      ?.setAttribute("content", title);
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[name="twitter:description"]')
      ?.setAttribute("content", description);
  }, [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}

export function activeLocale(): LocaleCode {
  if (runtimeLocale) return runtimeLocale;
  if (typeof window !== "undefined") return initialLocale();
  return DEFAULT_LOCALE;
}
