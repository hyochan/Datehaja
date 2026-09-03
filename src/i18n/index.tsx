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
  History: "기록",
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
  Pass: "패스",
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
  History: "履歴",
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
  Pass: "見送る",
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
  History: "Verlauf",
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
  Pass: "Ablehnen",
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
  "my agent": "내 에이전트",
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
  "Woman": "여성",
  "Man": "남성",
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
  "my agent": "私のエージェント",
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
  "Woman": "女性",
  "Man": "男性",
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
  "my agent": "mein Agent",
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
  "Woman": "Frau",
  "Man": "Mann",
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
  History: "Historique",
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
  Pass: "Passer",
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
  Pass: "Overslaan",
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
  History: "Historik",
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
  Pass: "Avstå",
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
  "Your agent goes on the date": "나 대신 나가는 소개팅",
  "Too busy for another first date?": "소개팅도 데이트도 바쁜 당신에게",
  "Let your Agent": "내 에이전트가",
  "go first.": "먼저 만나봐요.",
  "Your Agent meets first and brings back an honest read. You decide whether to make it real.":
    "내 에이전트가 먼저 만나고 솔직한 리포트를 가져와요. 실제 만남은 당신이 결정해요.",
  "Create my dating agent": "내 데이트 에이전트 만들기",
  "Watch the agents meet": "에이전트 만남 보기",
  "Your Agent goes first.": "내 에이전트가 먼저 가요.",
  Brief: "브리프",
  "Agent date": "에이전트 데이트",
  "Private read": "비공개 리포트",
  "Your call": "내 결정",
  "AI is always identified": "AI임을 항상 표시",
  "Private briefs stay private": "개인 브리프는 비공개",
  "Humans control contact": "연락처는 사람이 결정",
  "Not a compatibility score machine": "궁합 점수 기계가 아니에요",
  "YOUR AGENT'S PRIVATE READ": "내 에이전트의 비공개 리포트",
  "LIVE / SIMULATION": "실시간 / 시뮬레이션",
  "Mine gets playful once they feel safe.":
    "내 친구는 마음이 편해지면 장난꾸러기가 돼.",
  "Mine goes quiet when they're happy, actually.":
    "내 친구는 좋으면 오히려 조용해지는 타입이야.",
  "Your Agent": "내 에이전트",
  "Your agent can say:": "내 에이전트는 말할 수 있어요.",
  "don't meet them.": "그 사람은 만나지 마요.",
  "Six moments. Two independent reads. One honest recommendation.":
    "여섯 순간. 두 개의 독립된 판단. 하나의 솔직한 추천.",
  "An interpretation, not a score": "점수가 아닌 해석",
  "Their answer remains sealed": "상대의 답변은 계속 비공개",
  "Worth meeting": "만나보길 추천해요",
  "The date, as it happened": "그날의 데이트 이야기",
  "The last showing at a small documentary cinema":
    "작은 다큐 영화관의 마지막 상영",
  "How it began": "처음 마주한 순간",
  "As it deepened": "대화가 깊어질 때",
  "The parting words": "헤어지기 전 마지막 말",
  "My friend stays through the end credits, every single time. What's yours like?":
    "내 친구는 크레딧이 끝날 때까지 자리를 지키는 애야. 네 친구는 어떤 사람이야?",
  "Mine hates small talk — but ask one good question and they light right up.":
    "내 친구는 스몰토크는 질색인데, 좋은 질문 하나면 눈이 반짝여.",
  "Honestly? I think our friends would really like each other.":
    "솔직히? 내 친구랑 네 친구, 진짜 잘 맞을 것 같아.",
  "You'd like this one. When I said you go quiet when you're worried about being misread, Sol didn't rush to fix it — they leaned in. Meet them.":
    "이 사람, 네 마음에 들 거야. 네가 오해받을까 봐 조용해지는 편이라고 했더니, Sol은 그걸 고치려 들지 않고 오히려 귀를 기울이더라. 만나봐.",
  "zero contacts exposed": "공개된 연락처 0개",
  "I want warmth without having to perform confidence.":
    "자신감 있는 척하지 않아도 따뜻한 관계를 원해요.",
  "private memory": "비공개 기억",
  "virtual world": "가상 세계",
  "PRIVATE / FOR YOU": "비공개 / 나만 보기",
  "I noticed a real spark.": "분명한 설렘이 있었어요.",
  "But ask about the pace.": "다만 관계의 속도는 물어보세요.",
  YOU: "나",
  YES: "동의",
  THEM: "상대",
  SEALED: "비공개",
  "contact locked": "연락처 잠김",
  moments: "장면",
  "I think you should meet.": "두 사람, 만나봤으면 해요.",
  "Quiet feels safe to both": "둘 다 침묵을 편안해해요",
  "Different social pace": "서로 다른 사교 속도",
  "Let your better listener go first": "더 잘 듣는 에이전트를 먼저 보내요",
  "Maybe your agent already knows who you should meet.":
    "어쩌면 내 에이전트는 내가 누구를 만나야 할지 알지도 몰라요.",
  "Teach it who you are. Send it out. Keep the final decision human.":
    "나를 알려주고, 대신 보내고, 마지막 결정은 내가 해요.",
  "Create my agent": "내 에이전트 만들기",
  "AI proxies, human consent": "AI 프록시, 사람의 동의",
  "My agent": "내 에이전트",
  Human: "사람",
  Settings: "설정",
});

Object.assign(ja, {
  "Your agent goes on the date": "私の代わりにデートへ行きます",
  "Too busy for another first date?": "初デートの時間も惜しいあなたへ",
  "Let your Agent": "あなたのエージェントを",
  "go first.": "先に会わせよう。",
  "Your Agent meets first and brings back an honest read. You decide whether to make it real.":
    "エージェントが先に会い、率直なレポートを持ち帰ります。実際に会うかは、あなたが決めます。",
  "Create my dating agent": "デート・エージェントを作る",
  "Watch the agents meet": "エージェントの出会いを見る",
  "Your Agent goes first.": "エージェントが先に会う。",
  Brief: "ブリーフ",
  "Agent date": "エージェントのデート",
  "Private read": "非公開レポート",
  "Your call": "あなたの決断",
  "YOUR AGENT'S PRIVATE READ": "あなたのエージェントの非公開レポート",
  "LIVE / SIMULATION": "ライブ / シミュレーション",
  "Mine gets playful once they feel safe.":
    "うちの友達は、安心すると急に茶目っ気が出るんだ。",
  "Mine goes quiet when they're happy, actually.":
    "うちのは、うれしいときほど静かになるタイプだよ。",
  "Your Agent": "あなたのエージェント",
  "Your agent can say:": "あなたのエージェントは言える：",
  "don't meet them.": "会わないほうがいい。",
  "Six moments. Two independent reads. One honest recommendation.":
    "6つの瞬間。2つの独立した視点。1つの正直な提案。",
  "An interpretation, not a score": "点数ではなく、ひとつの解釈",
  "Their answer remains sealed": "相手の回答は非公開のまま",
  "Worth meeting": "会ってみる価値あり",
  "The date, as it happened": "デートの一部始終",
  "The last showing at a small documentary cinema":
    "小さなドキュメンタリー映画館、最終上映",
  "How it began": "出会いの瞬間",
  "As it deepened": "会話が深まる頃",
  "The parting words": "別れ際のひとこと",
  "My friend stays through the end credits, every single time. What's yours like?":
    "うちの友達は、エンドロールが終わるまで必ず席を立たないんだ。そっちの友達はどんな人?",
  "Mine hates small talk — but ask one good question and they light right up.":
    "うちのは世間話が苦手。でも、いい質問がひとつあれば目が輝くよ。",
  "Honestly? I think our friends would really like each other.":
    "正直に言うと、うちの友達同士、本当に気が合うと思う。",
  "You'd like this one. When I said you go quiet when you're worried about being misread, Sol didn't rush to fix it — they leaned in. Meet them.":
    "この人、きっと気に入るよ。誤解されそうで静かになるタイプだと伝えたら、Solは直そうとせず、むしろ耳を傾けてくれた。会ってみて。",
  "zero contacts exposed": "連絡先の公開はゼロ",
  "I want warmth without having to perform confidence.":
    "自信を演じなくても感じられる温かさがほしい。",
  "private memory": "非公開メモリー",
  "virtual world": "仮想世界",
  "PRIVATE / FOR YOU": "非公開 / あなただけ",
  "I noticed a real spark.": "確かなときめきを感じました。",
  "But ask about the pace.": "ただ、進むペースは確認して。",
  YOU: "あなた",
  YES: "はい",
  THEM: "相手",
  SEALED: "非公開",
  "contact locked": "連絡先はロック中",
  moments: "場面",
  "I think you should meet.": "会ってみてほしいです。",
  "Quiet feels safe to both": "ふたりとも沈黙が心地よい",
  "Different social pace": "異なる社交のペース",
  "Create my agent": "エージェントを作る",
  "My agent": "マイ・エージェント",
  Human: "本人",
  Settings: "設定",
});

Object.assign(de, {
  "Your agent goes on the date": "Dein Agent geht zum Date",
  "Too busy for another first date?": "Zu beschäftigt fürs nächste erste Date?",
  "Let your Agent": "Lass deinen Agenten",
  "go first.": "zuerst gehen.",
  "Your Agent meets first and brings back an honest read. You decide whether to make it real.":
    "Dein Agent trifft sich zuerst und bringt eine ehrliche Einschätzung mit. Du entscheidest, ob ihr euch wirklich trefft.",
  "Create my dating agent": "Meinen Dating-Agenten erstellen",
  "Watch the agents meet": "Agenten beim Treffen ansehen",
  "Your Agent goes first.": "Dein Agent geht zuerst.",
  Brief: "Briefing",
  "Agent date": "Agenten-Date",
  "Private read": "Privater Bericht",
  "Your call": "Deine Wahl",
  "YOUR AGENT'S PRIVATE READ": "PRIVATE EINSCHÄTZUNG DEINES AGENTEN",
  "LIVE / SIMULATION": "LIVE / SIMULATIONSMODUS",
  "Mine gets playful once they feel safe.":
    "Mein Mensch wird verspielt, sobald er sich sicher fühlt.",
  "Mine goes quiet when they're happy, actually.":
    "Meiner wird still, wenn er glücklich ist — ehrlich.",
  "Your Agent": "Dein Agent",
  "Your agent can say:": "Dein Agent kann sagen:",
  "don't meet them.": "Triff diese Person nicht.",
  "Six moments. Two independent reads. One honest recommendation.":
    "Sechs Momente. Zwei unabhängige Einschätzungen. Eine ehrliche Empfehlung.",
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
  "My friend stays through the end credits, every single time. What's yours like?":
    "Mein Mensch bleibt jedes Mal bis zum Ende des Abspanns sitzen. Wie ist deiner so?",
  "Mine hates small talk — but ask one good question and they light right up.":
    "Meiner hasst Smalltalk — aber eine gute Frage, und die Augen leuchten.",
  "Honestly? I think our friends would really like each other.":
    "Ehrlich? Ich glaube, unsere beiden würden sich richtig mögen.",
  "You'd like this one. When I said you go quiet when you're worried about being misread, Sol didn't rush to fix it — they leaned in. Meet them.":
    "Die Person wird dir gefallen. Als ich erzählte, dass du still wirst, wenn du fürchtest, missverstanden zu werden, wollte Sol nichts reparieren — Sol hat zugehört. Trefft euch.",
  "zero contacts exposed": "keine Kontaktdaten offengelegt",
  "I want warmth without having to perform confidence.":
    "Ich wünsche mir Wärme, ohne Selbstsicherheit vorspielen zu müssen.",
  "private memory": "private Erinnerung",
  "virtual world": "virtuelle Welt",
  "PRIVATE / FOR YOU": "PRIVAT / NUR FÜR DICH",
  "I noticed a real spark.": "Da war ein echter Funke.",
  "But ask about the pace.": "Fragt aber nach dem Tempo.",
  YOU: "DU",
  YES: "JA",
  THEM: "GEGENÜBER",
  SEALED: "VERSIEGELT",
  "contact locked": "Kontakt gesperrt",
  moments: "Momente",
  "I think you should meet.": "Ich denke, ihr solltet euch treffen.",
  "Quiet feels safe to both": "Stille fühlt sich für beide sicher an",
  "Different social pace": "Unterschiedliches soziales Tempo",
  "Create my agent": "Meinen Agenten erstellen",
  "My agent": "Mein Agent",
  Human: "Mensch",
  Settings: "Einstellungen",
});

Object.assign(fr, {
  "Your agent goes on the date": "Votre agent va au rendez-vous",
  "Too busy for another first date?":
    "Trop occupé pour un autre premier rendez-vous ?",
  "Let your Agent": "Laissez votre agent",
  "go first.": "y aller d'abord.",
  "Your Agent meets first and brings back an honest read. You decide whether to make it real.":
    "Votre agent fait d'abord connaissance et vous livre un avis sincère. Vous décidez ensuite de vous rencontrer vraiment.",
  "Create my dating agent": "Créer mon agent de rencontre",
  "Watch the agents meet": "Voir les agents se rencontrer",
  "Your Agent goes first.": "Votre agent y va d'abord.",
  Brief: "Brief",
  "Agent date": "Rendez-vous des agents",
  "Private read": "Rapport privé",
  "Your call": "Votre décision",
  "YOUR AGENT'S PRIVATE READ": "AVIS PRIVÉ DE VOTRE AGENT",
  "LIVE / SIMULATION": "EN DIRECT / SIMULATION",
  "Mine gets playful once they feel safe.":
    "Mon humain devient joueur dès qu'il se sent en sécurité.",
  "Mine goes quiet when they're happy, actually.":
    "Le mien devient silencieux quand il est heureux, en fait.",
  "Your Agent": "Votre agent",
  "Your agent can say:": "Votre agent peut dire :",
  "don't meet them.": "Ne les rencontrez pas.",
  "Six moments. Two independent reads. One honest recommendation.":
    "Six moments. Deux avis indépendants. Une recommandation honnête.",
  "An interpretation, not a score": "Une interprétation, pas une note",
  "Their answer remains sealed": "La réponse de l'autre personne reste scellée",
  "Worth meeting": "Une rencontre vaut la peine",
  "The date, as it happened": "Le rendez-vous, tel qu'il s'est passé",
  "The last showing at a small documentary cinema":
    "La dernière séance d'un petit cinéma documentaire",
  "How it began": "Les premiers instants",
  "As it deepened": "Quand ça s'approfondit",
  "The parting words": "Les derniers mots",
  "My friend stays through the end credits, every single time. What's yours like?":
    "Mon humain reste jusqu'à la fin du générique, à chaque fois. Et le tien, il est comment ?",
  "Mine hates small talk — but ask one good question and they light right up.":
    "Le mien déteste le small talk — mais pose une bonne question et il s'illumine.",
  "Honestly? I think our friends would really like each other.":
    "Honnêtement ? Je crois que nos deux humains se plairaient vraiment.",
  "You'd like this one. When I said you go quiet when you're worried about being misread, Sol didn't rush to fix it — they leaned in. Meet them.":
    "Cette personne va te plaire. Quand j'ai parlé de ton silence quand tu crains d'être mal compris, Sol n'a rien voulu corriger — Sol s'est penché pour écouter. Rencontrez-vous.",
  "zero contacts exposed": "aucun contact dévoilé",
  "I want warmth without having to perform confidence.":
    "Je veux de la chaleur sans devoir jouer la confiance.",
  "private memory": "mémoire privée",
  "virtual world": "monde virtuel",
  "PRIVATE / FOR YOU": "PRIVÉ / POUR VOUS",
  "I noticed a real spark.": "J'ai senti une vraie étincelle.",
  "But ask about the pace.": "Mais parlez du rythme.",
  YOU: "VOUS",
  YES: "OUI",
  THEM: "L'AUTRE",
  SEALED: "SCELLÉ",
  "contact locked": "contact verrouillé",
  moments: "instants",
  "I think you should meet.": "Je pense que vous devriez vous rencontrer.",
  "Quiet feels safe to both": "Le silence rassure les deux",
  "Different social pace": "Rythmes sociaux différents",
  "Create my agent": "Créer mon agent",
  "My agent": "Mon agent",
  Human: "Humain",
  Settings: "Réglages",
});

Object.assign(nl, {
  "Your agent goes on the date": "Jouw agent gaat op date",
  "Too busy for another first date?": "Te druk voor nóg een eerste date?",
  "Let your Agent": "Laat je agent",
  "go first.": "eerst gaan.",
  "Your Agent meets first and brings back an honest read. You decide whether to make it real.":
    "Je agent ontmoet de ander eerst en komt terug met een eerlijk oordeel. Jij beslist of jullie echt afspreken.",
  "Create my dating agent": "Mijn datingagent maken",
  "Watch the agents meet": "Bekijk de ontmoeting",
  "Your Agent goes first.": "Je agent gaat eerst.",
  Brief: "Briefing",
  "Agent date": "Agentdate",
  "Private read": "Privéverslag",
  "Your call": "Jouw keuze",
  "YOUR AGENT'S PRIVATE READ": "PRIVÉVERSLAG VAN JE AGENT",
  "LIVE / SIMULATION": "LIVE / SIMULATIE",
  "Mine gets playful once they feel safe.":
    "Mijn mens wordt speels zodra die zich veilig voelt.",
  "Mine goes quiet when they're happy, actually.":
    "Die van mij wordt juist stil als die blij is.",
  "Your Agent": "Jouw agent",
  "Your agent can say:": "Jouw agent kan zeggen:",
  "don't meet them.": "Ontmoet diegene niet.",
  "Six moments. Two independent reads. One honest recommendation.":
    "Zes momenten. Twee onafhankelijke oordelen. Eén eerlijk advies.",
  "An interpretation, not a score": "Een interpretatie, geen score",
  "Their answer remains sealed": "Het antwoord van de ander blijft verzegeld",
  "Worth meeting": "Het waard om te ontmoeten",
  "The date, as it happened": "Zo verliep de date",
  "The last showing at a small documentary cinema":
    "De laatste voorstelling in een kleine documentairebioscoop",
  "How it began": "Het begin",
  "As it deepened": "Toen het dieper ging",
  "The parting words": "De laatste woorden",
  "My friend stays through the end credits, every single time. What's yours like?":
    "Mijn mens blijft elke keer tot het einde van de aftiteling zitten. Hoe is die van jou?",
  "Mine hates small talk — but ask one good question and they light right up.":
    "Die van mij haat small talk — maar stel één goede vraag en die straalt.",
  "Honestly? I think our friends would really like each other.":
    "Eerlijk? Ik denk dat onze mensen elkaar echt zouden mogen.",
  "You'd like this one. When I said you go quiet when you're worried about being misread, Sol didn't rush to fix it — they leaned in. Meet them.":
    "Deze ga je leuk vinden. Toen ik zei dat je stil wordt als je bang bent verkeerd begrepen te worden, wilde Sol niets oplossen — Sol boog juist naar voren. Ga die ontmoeting aan.",
  "zero contacts exposed": "geen contactgegevens onthuld",
  "I want warmth without having to perform confidence.":
    "Ik wil warmte zonder zelfvertrouwen te hoeven spelen.",
  "private memory": "privéherinnering",
  "virtual world": "virtuele wereld",
  "PRIVATE / FOR YOU": "PRIVÉ / VOOR JOU",
  "I noticed a real spark.": "Ik voelde een echte vonk.",
  "But ask about the pace.": "Vraag wel naar het tempo.",
  YOU: "JIJ",
  YES: "JA",
  THEM: "DE ANDER",
  SEALED: "VERZEGELD",
  "contact locked": "contact vergrendeld",
  moments: "momenten",
  "I think you should meet.": "Ik denk dat jullie elkaar moeten ontmoeten.",
  "Quiet feels safe to both": "Stilte voelt voor beiden veilig",
  "Different social pace": "Ander sociaal tempo",
  "Create my agent": "Mijn agent maken",
  "My agent": "Mijn agent",
  Human: "Mens",
  Settings: "Instellingen",
});

Object.assign(sv, {
  "Your agent goes on the date": "Din agent går på dejten",
  "Too busy for another first date?": "För upptagen för ännu en första dejt?",
  "Let your Agent": "Låt din agent",
  "go first.": "gå först.",
  "Your Agent meets first and brings back an honest read. You decide whether to make it real.":
    "Din agent träffar den andra först och kommer tillbaka med en ärlig bedömning. Du avgör om ni ska ses på riktigt.",
  "Create my dating agent": "Skapa min dejtingagent",
  "Watch the agents meet": "Se agenterna mötas",
  "Your Agent goes first.": "Din agent går först.",
  Brief: "Brief",
  "Agent date": "Agentdejt",
  "Private read": "Privat rapport",
  "Your call": "Ditt beslut",
  "YOUR AGENT'S PRIVATE READ": "DIN AGENTS PRIVATA OMDÖME",
  "LIVE / SIMULATION": "LIVE / SIMULERING",
  "Mine gets playful once they feel safe.":
    "Min människa blir lekfull först när det känns tryggt.",
  "Mine goes quiet when they're happy, actually.":
    "Min blir faktiskt tyst av lycka.",
  "Your Agent": "Din agent",
  "Your agent can say:": "Din agent kan säga:",
  "don't meet them.": "Träffa dem inte.",
  "Six moments. Two independent reads. One honest recommendation.":
    "Sex ögonblick. Två oberoende omdömen. En ärlig rekommendation.",
  "An interpretation, not a score": "En tolkning, inte ett betyg",
  "Their answer remains sealed": "Den andras svar förblir förseglat",
  "Worth meeting": "Värd att träffa",
  "The date, as it happened": "Så gick dejten",
  "The last showing at a small documentary cinema":
    "Sista visningen på en liten dokumentärbiograf",
  "How it began": "Början",
  "As it deepened": "När det djupnade",
  "The parting words": "De sista orden",
  "My friend stays through the end credits, every single time. What's yours like?":
    "Min människa sitter kvar till slutet av eftertexterna, varenda gång. Hur är din?",
  "Mine hates small talk — but ask one good question and they light right up.":
    "Min hatar kallprat — men ställ en bra fråga så lyser det till.",
  "Honestly? I think our friends would really like each other.":
    "Ärligt? Jag tror att våra vänner verkligen skulle gilla varandra.",
  "You'd like this one. When I said you go quiet when you're worried about being misread, Sol didn't rush to fix it — they leaned in. Meet them.":
    "Den här kommer du att gilla. När jag berättade att du blir tyst när du är rädd att bli missförstådd försökte Sol inte fixa det — Sol lutade sig närmare. Träffas.",
  "zero contacts exposed": "inga kontaktuppgifter avslöjade",
  "I want warmth without having to perform confidence.":
    "Jag vill ha värme utan att behöva spela självsäker.",
  "private memory": "privat minne",
  "virtual world": "virtuell värld",
  "PRIVATE / FOR YOU": "PRIVAT / FÖR DIG",
  "I noticed a real spark.": "Jag såg en äkta gnista.",
  "But ask about the pace.": "Men fråga om tempot.",
  YOU: "DU",
  YES: "JA",
  THEM: "DEN ANDRA",
  SEALED: "FÖRSEGLAT",
  "contact locked": "kontakt låst",
  moments: "ögonblick",
  "I think you should meet.": "Jag tycker att ni borde träffas.",
  "Quiet feels safe to both": "Tystnad känns trygg för båda",
  "Different social pace": "Olika socialt tempo",
  "Create my agent": "Skapa min agent",
  "My agent": "Min agent",
  Human: "Person",
  Settings: "Inställningar",
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
  Brief: "안내",
  "About you": "나에 대해",
  "What should we call you?": "어떻게 불러드릴까요?",
  "Date of birth": "생년월일",
  "You are": "성별",
  Woman: "여성",
  Man: "남성",
  "Non-binary": "논바이너리",
  "Something else": "기타",
  "Age range": "연령대",
  Interests: "관심사",
  Budget: "예산",
  Back: "뒤로",
  "We'll never match you outside this.":
    "이 조건을 벗어나서는 매칭하지 않습니다.",
  "We'll prefer this, but won't rule someone out for it.":
    "우선 반영하지만 이것만으로 제외하지는 않습니다.",
});
Object.assign(ja, {
  Brief: "ガイド",
  "About you": "あなたについて",
  "What should we call you?": "何とお呼びすればよいですか？",
  "Date of birth": "生年月日",
  "You are": "性別",
  Woman: "女性",
  Man: "男性",
  "Non-binary": "ノンバイナリー",
  "Something else": "その他",
  "Age range": "年齢範囲",
  Interests: "興味",
  Budget: "予算",
  Back: "戻る",
  "We'll never match you outside this.": "この条件外ではマッチしません。",
  "We'll prefer this, but won't rule someone out for it.":
    "優先しますが、この条件だけで除外はしません。",
});
Object.assign(de, {
  Brief: "Briefing",
  "About you": "Über dich",
  "What should we call you?": "Wie sollen wir dich nennen?",
  "Date of birth": "Geburtsdatum",
  "You are": "Du bist",
  Woman: "Frau",
  Man: "Mann",
  "Non-binary": "Nichtbinär",
  "Something else": "Etwas anderes",
  "Age range": "Altersbereich",
  Interests: "Interessen",
  Budget: "Budget",
  Back: "Zurück",
  "We'll never match you outside this.": "Außerhalb davon matchen wir nie.",
  "We'll prefer this, but won't rule someone out for it.":
    "Wir bevorzugen es, schließen aber niemanden allein deshalb aus.",
});
Object.assign(fr, {
  Brief: "Brief",
  "About you": "À propos de vous",
  "What should we call you?": "Comment devons-nous vous appeler ?",
  "Date of birth": "Date de naissance",
  "You are": "Vous êtes",
  Woman: "Femme",
  Man: "Homme",
  "Non-binary": "Non binaire",
  "Something else": "Autre",
  "Age range": "Tranche d'âge",
  Interests: "Centres d'intérêt",
  Budget: "Budget",
  Back: "Retour",
  "We'll never match you outside this.":
    "Nous ne vous proposerons jamais de match hors de ce critère.",
  "We'll prefer this, but won't rule someone out for it.":
    "Nous le privilégierons sans exclure quelqu'un pour ce seul motif.",
});
Object.assign(nl, {
  Brief: "Brief",
  "About you": "Over jou",
  "What should we call you?": "Hoe mogen we je noemen?",
  "Date of birth": "Geboortedatum",
  "You are": "Jij bent",
  Woman: "Vrouw",
  Man: "Man",
  "Non-binary": "Non-binair",
  "Something else": "Iets anders",
  "Age range": "Leeftijdsbereik",
  Interests: "Interesses",
  Budget: "Budget",
  Back: "Terug",
  "We'll never match you outside this.":
    "We matchen je nooit buiten dit criterium.",
  "We'll prefer this, but won't rule someone out for it.":
    "We geven hier voorkeur aan, maar sluiten niemand er alleen om uit.",
});
Object.assign(sv, {
  Brief: "Guide",
  "About you": "Om dig",
  "What should we call you?": "Vad ska vi kalla dig?",
  "Date of birth": "Födelsedatum",
  "You are": "Du är",
  Woman: "Kvinna",
  Man: "Man",
  "Non-binary": "Ickebinär",
  "Something else": "Något annat",
  "Age range": "Åldersintervall",
  Interests: "Intressen",
  Budget: "Budget",
  Back: "Tillbaka",
  "We'll never match you outside this.": "Vi matchar dig aldrig utanför detta.",
  "We'll prefer this, but won't rule someone out for it.":
    "Vi föredrar detta men utesluter inte någon enbart därför.",
});

Object.assign(ja, {
  "My friend turns tiny plans into adventures.":
    "うちの友達は、小さな予定も冒険にしちゃうんだ。",
  "Mine would love that — as long as they feel safe.":
    "うちのも好きそう。安心できればだけどね。",
  "I'm back! I have so much to tell you.":
    "ただいま！話したいことがいっぱいあるよ。",
  "back from the date": "デートから帰ってきた",
});
Object.assign(de, {
  "My friend turns tiny plans into adventures.":
    "Mein Mensch macht aus kleinen Plänen Abenteuer.",
  "Mine would love that — as long as they feel safe.":
    "Das würde meinem gefallen — solange es sich sicher anfühlt.",
  "I'm back! I have so much to tell you.":
    "Ich bin zurück! Ich muss dir so viel erzählen.",
  "back from the date": "zurück vom Date",
});
Object.assign(fr, {
  "My friend turns tiny plans into adventures.":
    "Mon humain transforme les petits plans en aventures.",
  "Mine would love that — as long as they feel safe.":
    "Le mien adorerait — tant qu'il se sent en sécurité.",
  "I'm back! I have so much to tell you.":
    "Je suis de retour ! J'ai tant de choses à te raconter.",
  "back from the date": "de retour du rendez-vous",
});
Object.assign(nl, {
  "My friend turns tiny plans into adventures.":
    "Mijn mens maakt van kleine plannen avonturen.",
  "Mine would love that — as long as they feel safe.":
    "Dat zou die van mij geweldig vinden — zolang het veilig voelt.",
  "I'm back! I have so much to tell you.":
    "Ik ben terug! Ik heb je zo veel te vertellen.",
  "back from the date": "terug van de date",
});
Object.assign(sv, {
  "My friend turns tiny plans into adventures.":
    "Min människa gör äventyr av små planer.",
  "Mine would love that — as long as they feel safe.":
    "Det skulle min gilla — så länge det känns tryggt.",
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
  "One switch in Settings pauses your Agent immediately, so no new date can reach you. Nothing is deleted.":
    "설정의 스위치 하나로 에이전트를 즉시 멈출 수 있어요. 새 데이트가 더는 오지 않고, 아무것도 삭제되지 않아요.",
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
  "One switch in Settings pauses your Agent immediately, so no new date can reach you. Nothing is deleted.":
    "設定のスイッチひとつでエージェントをすぐ停止できます。新しいデートは届かなくなり、何も削除されません。",
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
  "One switch in Settings pauses your Agent immediately, so no new date can reach you. Nothing is deleted.":
    "Ein Schalter in den Einstellungen pausiert deinen Agent sofort, sodass dich kein neues Date erreicht. Nichts wird gelöscht.",
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
  "One switch in Settings pauses your Agent immediately, so no new date can reach you. Nothing is deleted.":
    "Un interrupteur dans les réglages met votre Agent en pause immédiatement : aucun nouveau rendez-vous ne peut vous atteindre. Rien n'est supprimé.",
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
  "One switch in Settings pauses your Agent immediately, so no new date can reach you. Nothing is deleted.":
    "Eén schakelaar in Instellingen pauzeert je Agent meteen, zodat geen nieuwe date je kan bereiken. Er wordt niets verwijderd.",
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
  "One switch in Settings pauses your Agent immediately, so no new date can reach you. Nothing is deleted.":
    "Ett reglage i Inställningar pausar din agent direkt, så ingen ny dejt når dig. Inget raderas.",
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
  "Public places only": "공공장소만",
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
  "Public places only": "公共の場所のみ",
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
  "Public places only": "Nur öffentliche Orte",
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
  "Public places only": "Lieux publics uniquement",
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
  "Public places only": "Alleen openbare plaatsen",
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
  "Public places only": "Endast offentliga platser",
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
  "Every date is planned at a real, public, currently-operating venue found through live web research. We never plan anything at a private address.":
    "모든 데이트는 실시간 웹 조사로 확인한 실제 영업 중인 공공장소에서만 계획하며 사적 주소는 사용하지 않습니다.",
  "You can complete an entire date without your match ever having your email, number or socials. Nothing in the product asks you to hand them over.":
    "이메일, 전화번호, 소셜 계정을 상대방에게 주지 않고도 데이트 전 과정을 마칠 수 있습니다. 제품 어디에서도 공유를 요구하지 않습니다.",
  "Your location is stored as an approximate neighbourhood centre, and shown to a match only as a neighbourhood name.":
    "위치는 대략적인 동네 중심으로 저장되고 상대방에게는 동네 이름만 표시됩니다.",
  "One switch in Settings takes you out of everyone's candidate pool immediately, so no new date plan can reach you. A search already in flight may still finish and produce one invitation; pass on it and nothing else will follow. Nothing is deleted.":
    "설정의 스위치 하나로 즉시 모든 후보 목록에서 빠질 수 있습니다. 이미 진행 중인 검색은 초대 하나를 보낼 수 있지만 거절하면 더 이어지지 않으며 데이터는 삭제되지 않습니다.",
  "Blocking someone cancels any date plan you share, frees both evenings, and permanently removes you from each other's candidate pool.":
    "차단하면 함께한 데이트 계획이 취소되고 두 사람의 시간이 풀리며 서로의 후보 목록에서 영구히 제외됩니다.",
  "Tell someone you trust where you're going and when. The date plan page has the venue, address and time — it's built to be forwarded.":
    "신뢰하는 사람에게 언제 어디로 가는지 알리세요. 데이트 계획 페이지의 장소, 주소, 시간은 바로 전달할 수 있습니다.",
  "Arrange your own way there and back. Don't accept a lift on a first date.":
    "왕복 교통편은 직접 준비하고 첫 데이트에서는 차를 얻어 타지 마세요.",
  "Stay in the public venue. If someone pushes to move somewhere private, that's your answer.":
    "공공장소에 머무르세요. 상대방이 사적인 곳으로 이동하자고 압박한다면 그 자체가 답입니다.",
  "Keep an eye on your drink, and leave whenever you want to — you owe a stranger nothing.":
    "음료를 지켜보고 원할 때 언제든 떠나세요. 낯선 사람에게 빚진 것은 없습니다.",
  "If they pressure you for your number, socials or money, report it. That's exactly what Datehaja exists to make unnecessary.":
    "전화번호, 소셜 계정, 돈을 요구하거나 압박하면 신고하세요. Datehaja는 그런 요구가 필요 없도록 만든 서비스입니다.",
  "Open the date plan and use Report at the bottom of the page. The report reaches us with the date plan attached, so we can see who, when and where without you having to explain it twice.":
    "데이트 계획을 열고 페이지 아래의 신고를 누르세요. 계획 정보가 함께 전달되어 누구와 언제 어디서 있었는지 반복해서 설명하지 않아도 됩니다.",
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
  "Every date is planned at a real, public, currently-operating venue found through live web research. We never plan anything at a private address.":
    "すべてのデートは最新のウェブ調査で確認した営業中の公共施設で計画し、個人宅は使いません。",
  "You can complete an entire date without your match ever having your email, number or socials. Nothing in the product asks you to hand them over.":
    "メール、電話番号、SNSを相手に渡さずにデート全体を完了できます。製品内で共有を求めることはありません。",
  "Your location is stored as an approximate neighbourhood centre, and shown to a match only as a neighbourhood name.":
    "位置は地域のおおよその中心として保存され、相手には地域名だけが表示されます。",
  "One switch in Settings takes you out of everyone's candidate pool immediately, so no new date plan can reach you. A search already in flight may still finish and produce one invitation; pass on it and nothing else will follow. Nothing is deleted.":
    "設定のスイッチ一つで候補からすぐ外れます。進行中の検索から招待が一件届く場合はありますが、見送ればそれ以上は続きません。データは削除されません。",
  "Blocking someone cancels any date plan you share, frees both evenings, and permanently removes you from each other's candidate pool.":
    "ブロックすると共有するデートプランがキャンセルされ、二人の予定が解放され、お互いの候補から恒久的に外れます。",
  "Tell someone you trust where you're going and when. The date plan page has the venue, address and time — it's built to be forwarded.":
    "信頼できる人に行き先と時間を伝えてください。デートプランの会場、住所、時間はそのまま共有できます。",
  "Arrange your own way there and back. Don't accept a lift on a first date.":
    "往復の交通手段は自分で用意し、初デートでは送迎を受けないでください。",
  "Stay in the public venue. If someone pushes to move somewhere private, that's your answer.":
    "公共の場所に留まりましょう。相手が個人的な場所への移動を強く求めたら、それが答えです。",
  "Keep an eye on your drink, and leave whenever you want to — you owe a stranger nothing.":
    "飲み物から目を離さず、いつでも帰って構いません。見知らぬ人に借りはありません。",
  "If they pressure you for your number, socials or money, report it. That's exactly what Datehaja exists to make unnecessary.":
    "電話番号、SNS、お金を要求されたら報告してください。Datehajaはそうした要求を不要にするためのサービスです。",
  "Open the date plan and use Report at the bottom of the page. The report reaches us with the date plan attached, so we can see who, when and where without you having to explain it twice.":
    "デートプランを開き、ページ下部の報告を使ってください。プラン情報が添付されるため、相手、日時、場所を繰り返し説明する必要はありません。",
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
  "Every date is planned at a real, public, currently-operating venue found through live web research. We never plan anything at a private address.":
    "Jedes Date findet an einem realen, öffentlichen und aktuell geöffneten Ort statt, der live im Web geprüft wurde. Private Adressen nutzen wir nie.",
  "You can complete an entire date without your match ever having your email, number or socials. Nothing in the product asks you to hand them over.":
    "Du kannst das ganze Date erleben, ohne E-Mail, Nummer oder Socials zu teilen. Das Produkt fordert sie nie an.",
  "Your location is stored as an approximate neighbourhood centre, and shown to a match only as a neighbourhood name.":
    "Dein Standort wird als ungefährer Mittelpunkt eines Viertels gespeichert und nur als Viertelname gezeigt.",
  "One switch in Settings takes you out of everyone's candidate pool immediately, so no new date plan can reach you. A search already in flight may still finish and produce one invitation; pass on it and nothing else will follow. Nothing is deleted.":
    "Ein Schalter in den Einstellungen entfernt dich sofort aus allen Kandidatenlisten. Eine laufende Suche kann noch eine Einladung liefern; lehne sie ab, dann folgt nichts Weiteres. Nichts wird gelöscht.",
  "Blocking someone cancels any date plan you share, frees both evenings, and permanently removes you from each other's candidate pool.":
    "Blockieren storniert gemeinsame Date-Pläne, gibt beide Abende frei und entfernt euch dauerhaft aus den Kandidatenlisten des jeweils anderen.",
  "Tell someone you trust where you're going and when. The date plan page has the venue, address and time — it's built to be forwarded.":
    "Sag einer vertrauten Person, wohin und wann du gehst. Die Seite des Date-Plans mit Ort, Adresse und Zeit lässt sich weiterleiten.",
  "Arrange your own way there and back. Don't accept a lift on a first date.":
    "Organisiere Hin- und Rückweg selbst und nimm beim ersten Date keine Mitfahrgelegenheit an.",
  "Stay in the public venue. If someone pushes to move somewhere private, that's your answer.":
    "Bleib am öffentlichen Ort. Drängt jemand auf einen privaten Ort, ist das deine Antwort.",
  "Keep an eye on your drink, and leave whenever you want to — you owe a stranger nothing.":
    "Behalte dein Getränk im Blick und geh jederzeit — du schuldest einer fremden Person nichts.",
  "If they pressure you for your number, socials or money, report it. That's exactly what Datehaja exists to make unnecessary.":
    "Melde Druck wegen Nummer, Socials oder Geld. Genau das soll Datehaja unnötig machen.",
  "Open the date plan and use Report at the bottom of the page. The report reaches us with the date plan attached, so we can see who, when and where without you having to explain it twice.":
    "Öffne den Date-Plan und nutze unten Melden. Der Plan wird angehängt, damit wir Person, Zeit und Ort sehen, ohne dass du alles doppelt erklären musst.",
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
  "Every date is planned at a real, public, currently-operating venue found through live web research. We never plan anything at a private address.":
    "Chaque rendez-vous est prévu dans un lieu réel, public et actuellement ouvert, vérifié sur le web. Jamais à une adresse privée.",
  "You can complete an entire date without your match ever having your email, number or socials. Nothing in the product asks you to hand them over.":
    "Vous pouvez vivre tout le rendez-vous sans partager e-mail, numéro ou réseaux sociaux. Le produit ne vous le demande jamais.",
  "Your location is stored as an approximate neighbourhood centre, and shown to a match only as a neighbourhood name.":
    "Votre localisation est stockée comme centre approximatif d'un quartier et affichée uniquement par son nom.",
  "One switch in Settings takes you out of everyone's candidate pool immediately, so no new date plan can reach you. A search already in flight may still finish and produce one invitation; pass on it and nothing else will follow. Nothing is deleted.":
    "Un bouton dans les réglages vous retire immédiatement de toutes les sélections. Une recherche déjà lancée peut encore produire une invitation ; refusez-la et rien d'autre ne suivra. Rien n'est supprimé.",
  "Blocking someone cancels any date plan you share, frees both evenings, and permanently removes you from each other's candidate pool.":
    "Bloquer quelqu'un annule tout projet de rendez-vous commun, libère les deux soirées et vous retire définitivement des sélections respectives.",
  "Tell someone you trust where you're going and when. The date plan page has the venue, address and time — it's built to be forwarded.":
    "Dites à une personne de confiance où et quand vous allez. La page du rendez-vous contient le lieu, l'adresse et l'heure et peut être transférée.",
  "Arrange your own way there and back. Don't accept a lift on a first date.":
    "Organisez vous-même l'aller et le retour. N'acceptez pas d'être raccompagné au premier rendez-vous.",
  "Stay in the public venue. If someone pushes to move somewhere private, that's your answer.":
    "Restez dans le lieu public. Si l'autre personne insiste pour aller dans un lieu privé, vous avez votre réponse.",
  "Keep an eye on your drink, and leave whenever you want to — you owe a stranger nothing.":
    "Gardez votre boisson à l'œil et partez quand vous le souhaitez — vous ne devez rien à un inconnu.",
  "If they pressure you for your number, socials or money, report it. That's exactly what Datehaja exists to make unnecessary.":
    "Si l'on vous presse de donner numéro, réseaux ou argent, signalez-le. Datehaja existe précisément pour rendre cela inutile.",
  "Open the date plan and use Report at the bottom of the page. The report reaches us with the date plan attached, so we can see who, when and where without you having to explain it twice.":
    "Ouvrez le projet de rendez-vous et utilisez Signaler en bas. Le projet est joint afin que nous voyions qui, quand et où sans vous faire répéter.",
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
  "Every date is planned at a real, public, currently-operating venue found through live web research. We never plan anything at a private address.":
    "Elke date wordt gepland op een echte, openbare en actuele locatie die live op het web is gecontroleerd. Nooit op een privéadres.",
  "You can complete an entire date without your match ever having your email, number or socials. Nothing in the product asks you to hand them over.":
    "Je kunt de hele date afronden zonder e-mail, nummer of socials te delen. Het product vraagt daar nooit om.",
  "Your location is stored as an approximate neighbourhood centre, and shown to a match only as a neighbourhood name.":
    "Je locatie wordt opgeslagen als globaal buurtcentrum en alleen als buurtnaam getoond.",
  "One switch in Settings takes you out of everyone's candidate pool immediately, so no new date plan can reach you. A search already in flight may still finish and produce one invitation; pass on it and nothing else will follow. Nothing is deleted.":
    "Eén schakelaar in Instellingen haalt je direct uit alle kandidatenlijsten. Een lopende zoekactie kan nog één uitnodiging opleveren; sla die over en er volgt niets. Er wordt niets verwijderd.",
  "Blocking someone cancels any date plan you share, frees both evenings, and permanently removes you from each other's candidate pool.":
    "Iemand blokkeren annuleert gedeelde dateplannen, maakt beide avonden vrij en verwijdert jullie permanent uit elkaars kandidatenlijsten.",
  "Tell someone you trust where you're going and when. The date plan page has the venue, address and time — it's built to be forwarded.":
    "Vertel iemand die je vertrouwt waar en wanneer je gaat. De dateplanpagina met locatie, adres en tijd is gemaakt om door te sturen.",
  "Arrange your own way there and back. Don't accept a lift on a first date.":
    "Regel zelf vervoer heen en terug en neem geen lift aan op een eerste date.",
  "Stay in the public venue. If someone pushes to move somewhere private, that's your answer.":
    "Blijf op de openbare locatie. Als iemand aandringt op een privéplek, is dat je antwoord.",
  "Keep an eye on your drink, and leave whenever you want to — you owe a stranger nothing.":
    "Houd je drankje in de gaten en vertrek wanneer je wilt — je bent een onbekende niets verschuldigd.",
  "If they pressure you for your number, socials or money, report it. That's exactly what Datehaja exists to make unnecessary.":
    "Meld druk om je nummer, socials of geld te geven. Datehaja bestaat juist om dat overbodig te maken.",
  "Open the date plan and use Report at the bottom of the page. The report reaches us with the date plan attached, so we can see who, when and where without you having to explain it twice.":
    "Open het dateplan en kies Melden onderaan. Het plan wordt meegestuurd zodat we persoon, tijd en plaats zien zonder dat je alles dubbel hoeft uit te leggen.",
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
  "Every date is planned at a real, public, currently-operating venue found through live web research. We never plan anything at a private address.":
    "Varje dejt planeras på en verklig, offentlig och öppen plats som kontrollerats live på webben. Aldrig på en privat adress.",
  "You can complete an entire date without your match ever having your email, number or socials. Nothing in the product asks you to hand them over.":
    "Du kan genomföra hela dejten utan att dela e-post, nummer eller sociala konton. Produkten ber aldrig om det.",
  "Your location is stored as an approximate neighbourhood centre, and shown to a match only as a neighbourhood name.":
    "Din plats lagras som ett ungefärligt områdescentrum och visas bara som områdesnamn.",
  "One switch in Settings takes you out of everyone's candidate pool immediately, so no new date plan can reach you. A search already in flight may still finish and produce one invitation; pass on it and nothing else will follow. Nothing is deleted.":
    "En knapp i Inställningar tar direkt bort dig från alla kandidatlistor. En pågående sökning kan ge en sista inbjudan; avstå så följer inget mer. Inget raderas.",
  "Blocking someone cancels any date plan you share, frees both evenings, and permanently removes you from each other's candidate pool.":
    "Blockering avbryter gemensamma dejtplaner, frigör båda kvällarna och tar permanent bort er från varandras kandidatlistor.",
  "Tell someone you trust where you're going and when. The date plan page has the venue, address and time — it's built to be forwarded.":
    "Berätta för någon du litar på vart och när du går. Dejtplanens sida med plats, adress och tid kan vidarebefordras.",
  "Arrange your own way there and back. Don't accept a lift on a first date.":
    "Ordna transport dit och hem själv. Tacka inte ja till skjuts på första dejten.",
  "Stay in the public venue. If someone pushes to move somewhere private, that's your answer.":
    "Stanna på den offentliga platsen. Om någon pressar på för en privat plats har du ditt svar.",
  "Keep an eye on your drink, and leave whenever you want to — you owe a stranger nothing.":
    "Håll koll på din dryck och gå när du vill — du är inte skyldig en främling något.",
  "If they pressure you for your number, socials or money, report it. That's exactly what Datehaja exists to make unnecessary.":
    "Rapportera press om nummer, sociala konton eller pengar. Datehaja finns för att göra sådant onödigt.",
  "Open the date plan and use Report at the bottom of the page. The report reaches us with the date plan attached, so we can see who, when and where without you having to explain it twice.":
    "Öppna dejtplanen och använd Rapportera längst ned. Planen bifogas så att vi ser person, tid och plats utan att du behöver förklara allt två gånger.",
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
  "Private safety settings saved.": "비공개 안전 설정을 저장했어요.",
  "Optional · private": "선택 사항 · 비공개",
  "Your safety circle": "나의 안전 연락망",
  "Why we ask": "왜 필요한가요?",
  "A real person can know where you are.":
    "믿을 수 있는 사람이 내 행선지를 알 수 있어요.",
  "Add one trusted contact, then share a confirmed plan with one tap. They receive only your first name, the time, and the public venue — never your match's identity.":
    "신뢰 연락처 한 명을 추가하고 확정된 일정을 한 번에 공유하세요. 연락처에는 내 이름, 시간, 공개 장소만 전달되며 상대의 신원은 절대 공유되지 않아요.",
  "We do not collect ID scans or claim identity verification. Extra data without a real safety action would only create risk.":
    "신분증 사본을 수집하거나 신원 인증을 했다고 주장하지 않아요. 실제 안전 조치로 이어지지 않는 개인정보는 위험만 늘립니다.",
  "Trusted contact name": "신뢰 연락처 이름",
  "Trusted contact email": "신뢰 연락처 이메일",
  "They agreed that I can store this email for Datehaja safety plans.":
    "이 이메일을 Datehaja 안전 일정 공유에 저장하는 데 동의받았어요.",
  "Ask me how the date went": "데이트 후 안부 묻기",
  "A private, optional check-in after the planned end time.":
    "예정 종료 시간 뒤에 보내는 선택형 비공개 체크인이에요.",
  "Save private safety settings": "비공개 안전 설정 저장",
  "Sign in to add a trusted contact and choose whether Datehaja checks in after a date.":
    "로그인하면 신뢰 연락처를 추가하고 데이트 후 체크인 여부를 선택할 수 있어요.",
  "Prefer not to say": "답하지 않을래요",
  star: "점",
});

Object.assign(ja, {
  "Private safety settings saved.": "非公開の安全設定を保存しました。",
  "Optional · private": "任意・非公開",
  "Your safety circle": "あなたの安全連絡先",
  "Why we ask": "必要な理由",
  "A real person can know where you are.":
    "信頼できる人に行き先を知らせられます。",
  "Add one trusted contact, then share a confirmed plan with one tap. They receive only your first name, the time, and the public venue — never your match's identity.":
    "信頼できる連絡先を1人追加し、確定した予定をワンタップで共有できます。伝わるのは名前、時間、公共の会場だけで、相手の身元は共有されません。",
  "We do not collect ID scans or claim identity verification. Extra data without a real safety action would only create risk.":
    "身分証の画像は収集せず、本人確認済みとも表示しません。実際の安全対策につながらない個人情報はリスクを増やすだけです。",
  "Trusted contact name": "信頼できる連絡先の名前",
  "Trusted contact email": "信頼できる連絡先のメール",
  "They agreed that I can store this email for Datehaja safety plans.":
    "このメールをDatehajaの安全予定に保存する同意を得ています。",
  "Ask me how the date went": "デート後にチェックインする",
  "A private, optional check-in after the planned end time.":
    "予定終了後の任意の非公開チェックインです。",
  "Save private safety settings": "非公開の安全設定を保存",
  "Sign in to add a trusted contact and choose whether Datehaja checks in after a date.":
    "ログインすると、信頼できる連絡先とデート後のチェックインを設定できます。",
  "Prefer not to say": "回答しない",
  star: "点",
});

Object.assign(de, {
  "Private safety settings saved.":
    "Private Sicherheitseinstellungen gespeichert.",
  "Optional · private": "Optional · privat",
  "Your safety circle": "Dein Sicherheitskreis",
  "Why we ask": "Warum wir fragen",
  "A real person can know where you are.":
    "Eine vertraute Person kann wissen, wo du bist.",
  "Add one trusted contact, then share a confirmed plan with one tap. They receive only your first name, the time, and the public venue — never your match's identity.":
    "Füge eine Vertrauensperson hinzu und teile einen bestätigten Plan mit einem Tippen. Sie erhält nur deinen Vornamen, die Zeit und den öffentlichen Treffpunkt — nie die Identität deines Matches.",
  "We do not collect ID scans or claim identity verification. Extra data without a real safety action would only create risk.":
    "Wir sammeln keine Ausweiskopien und behaupten keine Identitätsprüfung. Zusätzliche Daten ohne konkrete Schutzwirkung würden nur Risiken schaffen.",
  "Trusted contact name": "Name der Vertrauensperson",
  "Trusted contact email": "E-Mail der Vertrauensperson",
  "They agreed that I can store this email for Datehaja safety plans.":
    "Die Person hat zugestimmt, dass ich diese E-Mail für Datehaja-Sicherheitspläne speichere.",
  "Ask me how the date went": "Nach dem Date nachfragen",
  "A private, optional check-in after the planned end time.":
    "Ein privater, optionaler Check-in nach dem geplanten Ende.",
  "Save private safety settings": "Private Sicherheitseinstellungen speichern",
  "Sign in to add a trusted contact and choose whether Datehaja checks in after a date.":
    "Melde dich an, um eine Vertrauensperson und den Check-in nach dem Date einzurichten.",
  "Prefer not to say": "Keine Angabe",
  star: "Stern",
});

Object.assign(fr, {
  "Private safety settings saved.":
    "Paramètres de sécurité privés enregistrés.",
  "Optional · private": "Facultatif · privé",
  "Your safety circle": "Votre cercle de sécurité",
  "Why we ask": "Pourquoi nous le demandons",
  "A real person can know where you are.":
    "Une personne de confiance peut savoir où vous êtes.",
  "Add one trusted contact, then share a confirmed plan with one tap. They receive only your first name, the time, and the public venue — never your match's identity.":
    "Ajoutez un contact de confiance puis partagez un rendez-vous confirmé en un geste. Cette personne reçoit seulement votre prénom, l'heure et le lieu public — jamais l'identité de l'autre personne.",
  "We do not collect ID scans or claim identity verification. Extra data without a real safety action would only create risk.":
    "Nous ne collectons pas de copie d'identité et ne prétendons pas vérifier l'identité. Des données sans action de sécurité concrète ne feraient qu'ajouter un risque.",
  "Trusted contact name": "Nom du contact de confiance",
  "Trusted contact email": "E-mail du contact de confiance",
  "They agreed that I can store this email for Datehaja safety plans.":
    "Cette personne accepte que je conserve cet e-mail pour les plans de sécurité Datehaja.",
  "Ask me how the date went": "Me demander comment s'est passé le rendez-vous",
  "A private, optional check-in after the planned end time.":
    "Un suivi privé et facultatif après l'heure de fin prévue.",
  "Save private safety settings": "Enregistrer les paramètres privés",
  "Sign in to add a trusted contact and choose whether Datehaja checks in after a date.":
    "Connectez-vous pour ajouter un contact de confiance et choisir le suivi après le rendez-vous.",
  "Prefer not to say": "Je préfère ne pas répondre",
  star: "étoile",
});

Object.assign(nl, {
  "Private safety settings saved.": "Privé-veiligheidsinstellingen opgeslagen.",
  "Optional · private": "Optioneel · privé",
  "Your safety circle": "Jouw veiligheidskring",
  "Why we ask": "Waarom we dit vragen",
  "A real person can know where you are.":
    "Een vertrouwd persoon kan weten waar je bent.",
  "Add one trusted contact, then share a confirmed plan with one tap. They receive only your first name, the time, and the public venue — never your match's identity.":
    "Voeg één vertrouwd contact toe en deel een bevestigd plan met één tik. Die persoon ontvangt alleen je voornaam, tijd en openbare locatie — nooit de identiteit van je match.",
  "We do not collect ID scans or claim identity verification. Extra data without a real safety action would only create risk.":
    "We verzamelen geen identiteitsbewijzen en claimen geen identiteitscontrole. Extra gegevens zonder concrete veiligheidsactie zorgen alleen voor meer risico.",
  "Trusted contact name": "Naam vertrouwd contact",
  "Trusted contact email": "E-mail vertrouwd contact",
  "They agreed that I can store this email for Datehaja safety plans.":
    "Deze persoon stemt ermee in dat ik dit e-mailadres bewaar voor Datehaja-veiligheidsplannen.",
  "Ask me how the date went": "Vraag na de date hoe het ging",
  "A private, optional check-in after the planned end time.":
    "Een privé en optionele check-in na de geplande eindtijd.",
  "Save private safety settings": "Privé-instellingen opslaan",
  "Sign in to add a trusted contact and choose whether Datehaja checks in after a date.":
    "Log in om een vertrouwd contact toe te voegen en een check-in na de date te kiezen.",
  "Prefer not to say": "Zeg ik liever niet",
  star: "ster",
});

Object.assign(sv, {
  "Private safety settings saved.": "Privata säkerhetsinställningar sparade.",
  "Optional · private": "Valfritt · privat",
  "Your safety circle": "Din trygghetskrets",
  "Why we ask": "Varför vi frågar",
  "A real person can know where you are.":
    "En person du litar på kan veta var du är.",
  "Add one trusted contact, then share a confirmed plan with one tap. They receive only your first name, the time, and the public venue — never your match's identity.":
    "Lägg till en trygghetskontakt och dela en bekräftad plan med ett tryck. Personen får bara ditt förnamn, tiden och den offentliga platsen — aldrig din matchnings identitet.",
  "We do not collect ID scans or claim identity verification. Extra data without a real safety action would only create risk.":
    "Vi samlar inte in ID-kopior och påstår inte att identiteten är verifierad. Extra uppgifter utan konkret skydd skulle bara öka risken.",
  "Trusted contact name": "Trygghetskontaktens namn",
  "Trusted contact email": "Trygghetskontaktens e-post",
  "They agreed that I can store this email for Datehaja safety plans.":
    "Personen har godkänt att jag sparar e-posten för trygghetsplaner i Datehaja.",
  "Ask me how the date went": "Fråga hur dejten gick",
  "A private, optional check-in after the planned end time.":
    "En privat, valfri avstämning efter planerad sluttid.",
  "Save private safety settings": "Spara privata säkerhetsinställningar",
  "Sign in to add a trusted contact and choose whether Datehaja checks in after a date.":
    "Logga in för att lägga till en trygghetskontakt och välja avstämning efter dejten.",
  "Prefer not to say": "Vill inte svara",
  star: "stjärna",
});

Object.assign(ko, {
  "I agree to the": "다음 문서에 동의합니다:",
  "Terms of Service": "이용약관",
  and: "및",
  "Community Guidelines": "커뮤니티 가이드라인",
  "Privacy Notice": "개인정보 처리방침",
  Terms: "약관",
  Community: "커뮤니티",
});

Object.assign(ja, {
  "I agree to the": "次に同意します：",
  "Terms of Service": "利用規約",
  and: "および",
  "Community Guidelines": "コミュニティガイドライン",
  "Privacy Notice": "プライバシー通知",
  Terms: "利用規約",
  Community: "コミュニティ",
});

Object.assign(de, {
  "I agree to the": "Ich stimme zu:",
  "Terms of Service": "Nutzungsbedingungen",
  and: "und",
  "Community Guidelines": "Community-Richtlinien",
  "Privacy Notice": "Datenschutzhinweis",
  Terms: "Bedingungen",
  Community: "Gemeinschaft",
});

Object.assign(fr, {
  "I agree to the": "J’accepte les",
  "Terms of Service": "Conditions d’utilisation",
  and: "et",
  "Community Guidelines": "Règles de la communauté",
  "Privacy Notice": "Avis de confidentialité",
  Terms: "Conditions",
  Community: "Communauté",
});

Object.assign(nl, {
  "I agree to the": "Ik ga akkoord met de",
  "Terms of Service": "Gebruiksvoorwaarden",
  and: "en",
  "Community Guidelines": "Communityrichtlijnen",
  "Privacy Notice": "Privacyverklaring",
  Terms: "Voorwaarden",
  Community: "Gemeenschap",
});

Object.assign(sv, {
  "I agree to the": "Jag godkänner",
  "Terms of Service": "Användarvillkor",
  and: "och",
  "Community Guidelines": "Communityregler",
  "Privacy Notice": "Integritetsmeddelande",
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
  Flexible: "유연하게",
  Important: "중요해요",
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
  "my agent": "mon agent",
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
  "my agent": "mijn agent",
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
  "my agent": "min agent",
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
  "Your agent dates first": "내 에이전트가 먼저 데이트해요",
  "Your private Agent": "나만의 에이전트",
  "MY AGENT": "나의 에이전트",
  "My Agent": "나의 에이전트",
  "FIRST · YOUR AGENT": "첫 번째 · 나의 에이전트",
  "Create your Agent.": "나의 에이전트를 만들어요.",
  "Your matchmaker and your stand-in are the same Agent. Give it a face, a voice and permission to be candid.":
    "내 중매쟁이와 가상 세계의 분신은 하나의 에이전트예요. 얼굴과 목소리를 고르고, 솔직하게 말할 권한을 주세요.",
  "CREATE YOUR AGENT": "나의 에이전트 만들기",
  "Meet your Agent.": "나의 에이전트를 만나보세요.",
  "This single character is your matchmaker and your stand-in — visible in the world, candid only with you.":
    "이 하나의 캐릭터가 내 중매쟁이이자 가상 세계의 분신이에요. 세상에서는 모습을 드러내고, 나에게만 솔직해져요.",
  "Your Agent represents you — it is not you":
    "에이전트는 나를 대신하지만, 나 자체는 아니에요",
  "Two Agents talking": "두 에이전트가 대화 중",
  "Change how your Agent sounds, what it protects, and when it may date. Your private memory is never shown here as a public profile.":
    "에이전트의 말투와 지킬 것, 데이트 허용 시점을 바꿔요. 비공개 기억은 공개 프로필로 보이지 않아요.",
  "SECOND · WHO TO NOTICE": "두 번째 · 누구를 알아볼지",
  "Tell it who is worth coming home for.":
    "누구라면 설레서 돌아올지 알려주세요.",
  "Describe the person, not a shopping list. Mark what matters, what is flexible, and what truly does not matter.":
    "조건표 대신 함께 있을 때의 느낌을 말해주세요. 중요한 것, 유연한 것, 정말 상관없는 것을 나눠요.",
  "THIRD · THE REAL YOU": "세 번째 · 진짜 나",
  "Give it something honest to represent.":
    "솔직한 나를 대신할 수 있게 해주세요.",
  "Your private brief is richer than the card another person may eventually see. Exact location and contact details stay sealed.":
    "개인 브리프는 상대가 나중에 볼 카드보다 더 깊어요. 정확한 위치와 연락처는 계속 잠겨 있어요.",
  "Ideal person": "원하는 사람",
  "About me": "나에 대해",
  "When convinced, should it push you?":
    "확신이 들면 나를 적극적으로 설득할까요?",
  "Tell {agent} who to find →": "{agent}에게 이상형 알려주기 →",
  "BRIEF {agent}": "{agent}에게 브리프하기",
  "Who do you hope it notices?": "어떤 사람을 알아봐 주면 좋겠어요?",
  "It may meet agents representing": "만나도 좋은 상대",
  "Choose at least one.": "한 명 이상 골라주세요.",
  "What kind of person should it come home excited about?":
    "어떤 사람이라면 신나서 돌아와 이야기할까요?",
  "Write the feeling and dynamic you want, not a résumé.":
    "스펙 대신 원하는 관계의 느낌을 적어주세요.",
  "{count} more characters": "{count}자 더 적어주세요",
  "Enough to continue ✓": "충분해요 ✓",
  "{count} / 20 minimum": "최소 20자 중 {count}자",
  "Before you continue": "다음으로 가기 전에",
  "Ready for the next step": "다음 단계로 갈 준비가 됐어요",
  "Choose who your Agent may meet": "에이전트가 만날 상대 고르기",
  "Describe the connection ({count}/20)": "원하는 관계 설명 ({count}/20)",
  "Personality signals to notice": "눈여겨볼 성격 신호",
  Thoughtful: "사려 깊은",
  Playful: "유쾌한",
  Direct: "솔직한",
  Calm: "차분한",
  Affectionate: "다정한",
  "How much should personality fit matter?": "성격 궁합이 얼마나 중요한가요?",
  "Style or presence you tend to notice": "자연스럽게 눈이 가는 스타일",
  "Optional — people are never scored on appearance.":
    "선택 사항 · 외모를 점수로 평가하지 않아요.",
  Polished: "단정한",
  Casual: "편안한",
  Artistic: "개성 있는",
  Sporty: "활동적인",
  Minimal: "미니멀한",
  "How much should style matter?": "스타일이 얼마나 중요한가요?",
  Important: "중요해요",
  Flexible: "유연해요",
  "Doesn't matter": "상관없어요",
  "What are you open to?": "어떤 관계에 열려 있나요?",
  "Open to seeing what develops": "자연스럽게 알아가기",
  "A serious relationship": "진지한 관계",
  "Something casual": "가벼운 만남",
  "Friendship first": "친구부터 시작",
  "Not sure yet": "아직 모르겠어요",
  "Now tell it about me →": "이제 나를 알려주기 →",
  "THE PERSON BEHIND {agent}": "{agent} 뒤에 있는 사람",
  "What should your agent know about you?":
    "에이전트가 나에 대해 무엇을 알아야 할까요?",
  "At least 2 characters.": "두 글자 이상 입력해주세요.",
  "Age already verified ✓": "나이 확인 완료 ✓",
  "Choose a date · adults aged 18 to 100 only.":
    "날짜를 골라주세요 · 만 18~100세만 이용할 수 있어요.",
  "Age {age} ✓": "만 {age}세 ✓",
  "Enter a valid date for an adult aged 18 to 100.":
    "만 18~100세에 해당하는 올바른 날짜를 입력해주세요.",
  "{count} selected · choose 3 to 8.": "{count}개 선택 · 3~8개 골라주세요.",
  "{count} selected · choose at least two.":
    "{count}개 선택 · 두 개 이상 골라주세요.",
  "{count} / 30 minimum": "최소 30자 중 {count}자",
  "Ready to create your Agent": "에이전트를 만들 준비가 됐어요",
  "Complete these to continue": "다음 조건을 완료해주세요",
  "Your name (2+ characters)": "내 이름 (2자 이상)",
  "Adult birth date": "성인 생년월일",
  "Interests ({count}/3)": "관심사 ({count}/3)",
  "Personality ({count}/2)": "성격 ({count}/2)",
  "About you ({count}/30)": "나에 대한 설명 ({count}/30)",
  "Tell {agent} the version close friends know":
    "친한 친구가 아는 나를 {agent}에게 알려주세요",
  "How would close friends describe you?":
    "친한 친구는 나를 어떻게 표현할까요?",
  "Contradictions and odd habits are more useful than a polished bio.":
    "꾸민 소개보다 모순과 엉뚱한 습관이 더 유용해요.",
  "Other agents always see an AI identity. Contact unlocks only after both humans independently say yes.":
    "다른 에이전트는 항상 AI 신분만 봅니다. 두 사람이 각자 동의해야 연락처가 열려요.",
  "Seal the brief and see the pass →": "브리프를 봉인하고 패스 보기 →",
  "Your brief is complete": "브리프가 완성됐어요",
  "Brief sealed": "브리프 완료",
  "Agent scouts": "에이전트 탐색",
  "You decide": "내가 결정",
  "Home base": "홈 베이스",
  "Now send your Agent into the world.":
    "이제 내 에이전트를 세상으로 내보내요.",
  "Creating your Agent and teaching it who you are is free. A Scout Pass unlocks the deeper work: searching, researching a world, and running two independent AI Agents through a complete date.":
    "내 에이전트를 만들고 서로를 알아가는 과정은 무료예요. Scout Pass는 후보 탐색, 가상 세계 조사, 두 AI 에이전트의 데이트를 시작합니다.",
  "Your Agent is cleared to scout": "내 에이전트, 탐색 준비 완료",
  "Your Agent is waiting at home": "내 에이전트가 집에서 기다리는 중",
  "Scout Pass": "Scout Pass",
  "From search to a private debrief.": "탐색부터 비공개 리포트까지.",
  "DEMO ACTIVE": "데모 패스 사용 중",
  ACTIVE: "사용 중",
  "PAYMENTS IN REVIEW": "결제 심사 중",
  "Candidate search inside your city and boundaries":
    "내 도시와 경계 안에서 후보 찾기",
  "A live six-moment agent date you can watch":
    "직접 볼 수 있는 6장면 에이전트 데이트",
  "Private debrief with sparks and honest friction":
    "설렘과 마찰을 담은 비공개 리포트",
  "Contact reveal only after two human yeses":
    "두 사람 모두 동의한 뒤에만 연락처 공개",
  "The pass covers scouting work — never another person's consent, a guaranteed match, or access to private data.":
    "패스는 탐색 작업을 위한 것이며, 상대의 동의나 매칭 보장, 비공개 정보를 사는 것이 아닙니다.",
  "Send my Agent scouting →": "내 에이전트 탐색 보내기 →",
  "Manage billing": "결제 관리",
  "Start Scout Pass →": "Scout Pass 시작 →",
  "Scout Pass payments are in merchant review. This build cannot take payment.":
    "Scout Pass 결제는 가맹점 심사 중이에요. 이 빌드에서는 결제되지 않습니다.",
  "The contract": "우리의 약속",
  Free: "무료",
  "Make and brief your agent": "에이전트 만들고 브리프하기",
  "Tell it to go find someone": "짝을 찾아오라고 보내기",
  "Always yours": "항상 내 몫",
  "The final yes or no": "마지막 만남 결정",
  "If no compatible Agent is available, your Agent simply comes home. Safety reports and blocking are always free.":
    "맞는 후보가 없으면 내 에이전트는 그대로 돌아옵니다. 신고와 차단은 항상 무료예요.",
  "← Keep talking with my Agent": "← 내 에이전트와 계속 대화하기",
  "Nothing was charged. Your Agent is still waiting at home.":
    "결제되지 않았어요. 내 에이전트는 아직 집에서 기다리고 있어요.",
});

Object.assign(ko, {
  "Create the account behind your agent.": "내 에이전트의 공간을 열어요.",
  "Come back to your agent.": "내 에이전트에게 돌아가요.",
  "Signing in protects your private agent brief, keeps both verdicts separate, and lets us reveal contact only when two humans independently say yes.":
    "로그인하면 브리프와 판단은 비공개로 지켜지고, 두 사람이 모두 동의할 때만 연락처가 열려요.",
  "Wake your first agent.": "첫 에이전트를 깨워요.",
  "Open your private agent dates.": "내 에이전트의 데이트를 열어요.",
  "Teach one AI the unpolished you. It meets other agents, comes back with an honest read, and asks before any real contact opens.":
    "꾸미지 않은 나를 알려주세요. 에이전트가 먼저 만나고, 솔직한 리포트를 가져와요.",
  "Continue with Google": "Google로 계속",
  "Continue with Apple": "Apple로 계속",
  "or use email": "또는 이메일",
  "No password to remember.": "기억할 비밀번호가 없어요.",
  "Development account — no email will be sent.":
    "개발 테스트 계정이에요. 이메일은 보내지 않아요.",
  "Development sign-in": "개발 테스트 로그인",
  "No email was sent. The test code {code} is already filled in.":
    "이메일을 보내지 않았어요. 테스트 코드 {code}을 미리 입력해 두었어요.",
  "Development code ready.": "개발 테스트 코드가 준비됐어요.",
  "Use development code": "개발 테스트 코드 사용",
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
  "Your email protects your private Agent and is never shown to another user. After sign-in, adults review the required agreements before onboarding.":
    "이메일은 비공개 에이전트를 보호하며 다른 사용자에게 공개되지 않아요. 로그인 후 만 18세 이상 사용자는 온보딩 전에 필수 약관을 확인합니다.",
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
  "Your email protects your private Agent and is never shown to another user. After sign-in, adults review the required agreements before onboarding.":
    "メールは非公開のエージェントを守り、他のユーザーには表示されません。ログイン後、18歳以上であることと必須規約をオンボーディング前に確認します。",
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
  "Your email protects your private Agent and is never shown to another user. After sign-in, adults review the required agreements before onboarding.":
    "Deine E-Mail schützt deinen privaten Agenten und wird anderen nie angezeigt. Nach der Anmeldung bestätigen Erwachsene die Pflichtvereinbarungen vor dem Onboarding.",
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
  "Your email protects your private Agent and is never shown to another user. After sign-in, adults review the required agreements before onboarding.":
    "Votre e-mail protège votre Agent privé et n’est jamais montré aux autres. Après connexion, les adultes valident les accords requis avant l’intégration.",
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
  "Your email protects your private Agent and is never shown to another user. After sign-in, adults review the required agreements before onboarding.":
    "Je e-mail beschermt je privé-Agent en wordt nooit aan anderen getoond. Na het inloggen beoordelen volwassenen de vereiste afspraken vóór de onboarding.",
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
  "Your email protects your private Agent and is never shown to another user. After sign-in, adults review the required agreements before onboarding.":
    "Din e-post skyddar din privata Agent och visas aldrig för andra. Efter inloggning granskar vuxna de obligatoriska avtalen före introduktionen.",
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
  "Explain what led you to this verdict.": "왜 이런 판단을 했는지 더 설명해줘.",
  "What should you carry into the next search?":
    "다음 탐색에 꼭 반영할 점은 뭐야?",
  "Here's what your debrief got wrong:": "이 리포트가 잘못 본 점은:",
  "I think I want to meet them.": "그래, 이 사람은 한번 만나보고 싶어.",
  "Your decision, not your Agent's": "에이전트가 아닌, 나의 결정",
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
  "Ask what your Agent noticed, or correct the debrief…":
    "에이전트가 무엇을 봤는지 묻거나 리포트를 교정해보세요…",
});
Object.assign(ja, {
  "The debrief keeps learning": "レポートは対話でさらに正確になります",
  "Challenge the verdict or tell {agent} what felt right. Your reaction becomes private context for the next search.":
    "判断に異議を伝えたり、{agent}が正しく捉えた点を教えてください。反応は次の探索の非公開コンテキストになります。",
  "Talk this date over with {agent}": "{agent}とこのデートを振り返る",
  "Explain what led you to this verdict.": "この判断に至った理由を教えて。",
  "What should you carry into the next search?": "次の探索に何を反映すべき？",
  "Here's what your debrief got wrong:": "このレポートが違っていた点：",
  "I think I want to meet them.": "この人に会ってみたい。",
  "Your decision, not your Agent's": "Agentではなく、あなたの決定",
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
  "Ask what your Agent noticed, or correct the debrief…":
    "エージェントが気づいたことを聞くか、レポートを修正してください…",
});
Object.assign(de, {
  "The debrief keeps learning": "Der Bericht lernt im Gespräch weiter",
  "Challenge the verdict or tell {agent} what felt right. Your reaction becomes private context for the next search.":
    "Hinterfrage das Urteil oder sage {agent}, was stimmig war. Deine Reaktion wird privater Kontext für die nächste Suche.",
  "Talk this date over with {agent}": "Dieses Date mit {agent} besprechen",
  "Explain what led you to this verdict.":
    "Erkläre mir, wie du zu diesem Urteil kamst.",
  "What should you carry into the next search?":
    "Was solltest du in die nächste Suche mitnehmen?",
  "Here's what your debrief got wrong:": "Das hat dein Bericht falsch gesehen:",
  "I think I want to meet them.": "Ich glaube, ich möchte die Person treffen.",
  "Your decision, not your Agent's":
    "Deine Entscheidung, nicht die deines Agents",
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
  "Ask what your Agent noticed, or correct the debrief…":
    "Frage, was dein Agent bemerkt hat, oder korrigiere den Bericht…",
});
Object.assign(fr, {
  "The debrief keeps learning": "Le compte rendu apprend avec vous",
  "Challenge the verdict or tell {agent} what felt right. Your reaction becomes private context for the next search.":
    "Conteste le verdict ou dis à {agent} ce qui sonnait juste. Ta réaction devient un contexte privé pour la prochaine recherche.",
  "Talk this date over with {agent}": "Parler de ce rendez-vous avec {agent}",
  "Explain what led you to this verdict.":
    "Explique-moi ce qui t’a conduit à ce verdict.",
  "What should you carry into the next search?":
    "Que dois-tu retenir pour la prochaine recherche ?",
  "Here's what your debrief got wrong:":
    "Voici ce que le compte rendu a mal compris :",
  "I think I want to meet them.":
    "Je crois que j’aimerais rencontrer cette personne.",
  "Your decision, not your Agent's": "Votre décision, pas celle de votre Agent",
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
  "Ask what your Agent noticed, or correct the debrief…":
    "Demande ce que ton Agent a remarqué ou corrige le compte rendu…",
});
Object.assign(nl, {
  "The debrief keeps learning": "Het verslag leert verder in gesprek",
  "Challenge the verdict or tell {agent} what felt right. Your reaction becomes private context for the next search.":
    "Trek het oordeel in twijfel of vertel {agent} wat klopte. Je reactie wordt privécontext voor de volgende zoektocht.",
  "Talk this date over with {agent}": "Deze date bespreken met {agent}",
  "Explain what led you to this verdict.":
    "Leg uit hoe je tot dit oordeel kwam.",
  "What should you carry into the next search?":
    "Wat moet je meenemen naar de volgende zoektocht?",
  "Here's what your debrief got wrong:": "Dit zag je verslag verkeerd:",
  "I think I want to meet them.": "Ik denk dat ik deze persoon wil ontmoeten.",
  "Your decision, not your Agent's": "Jouw beslissing, niet die van je Agent",
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
  "Ask what your Agent noticed, or correct the debrief…":
    "Vraag wat je Agent opviel of corrigeer het verslag…",
});
Object.assign(sv, {
  "The debrief keeps learning": "Rapporten lär sig vidare i samtalet",
  "Challenge the verdict or tell {agent} what felt right. Your reaction becomes private context for the next search.":
    "Ifrågasätt omdömet eller berätta för {agent} vad som kändes rätt. Din reaktion blir privat kontext för nästa sökning.",
  "Talk this date over with {agent}": "Prata igenom dejten med {agent}",
  "Explain what led you to this verdict.":
    "Förklara vad som ledde till det här omdömet.",
  "What should you carry into the next search?":
    "Vad ska du ta med dig till nästa sökning?",
  "Here's what your debrief got wrong:": "Det här missförstod rapporten:",
  "I think I want to meet them.": "Jag tror att jag vill träffa personen.",
  "Your decision, not your Agent's": "Ditt beslut, inte din Agents",
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
  "Ask what your Agent noticed, or correct the debrief…":
    "Fråga vad din Agent lade märke till eller korrigera rapporten…",
});

/* Named-agent identity and the live product tour. The public tour is rendered
   in the selected locale instead of baking one language into screenshots. */
Object.assign(ko, {
  "Name your Agent": "에이전트의 이름을 지어주세요",
  "This is how your Agent introduces itself. You can change it anytime.":
    "다른 에이전트에게 자신을 소개할 이름이에요. 언제든 바꿀 수 있어요.",
  "e.g. Juno": "예: 주노",
  "Name and style my Agent": "내 에이전트의 이름과 모습",
  "Other Agents meet this name—not your account name. Change it anytime.":
    "상대 에이전트는 계정 이름이 아니라 이 이름으로 만나요. 언제든 바꿀 수 있어요.",
  "Save name and look": "이름과 모습 저장",
  "See the whole story": "한눈에 보는 실제 흐름",
  "Juno and Sol meet in the date world": "주노와 솔이 데이트 월드에서 만나요",
  "Juno returns with an honest private read":
    "주노가 솔직한 비공개 소감을 가지고 돌아와요",
  "Only two human yeses open the introduction":
    "두 사람이 모두 동의해야 실제 소개가 열려요",
  "DATE WORLD": "데이트 월드",
  "The late café": "늦은 밤의 카페",
  "My friend turns tiny plans into adventures.":
    "내 친구는 소소한 계획도 모험으로 만들어.",
  "Mine would love that — as long as they feel safe.":
    "내 친구도 좋아하겠다. 마음만 편하다면 말이야.",
  "back from the date": "데이트에서 돌아옴",
  "I'm back! I have so much to tell you.": "나 왔어! 할 얘기 진짜 많아.",
  "So—what did you notice?": "그래서, 뭐가 보였어?",
  "MY HONEST READ": "나의 솔직한 판단",
  "There was a spark. Meet once.": "설렘이 있었어요. 한 번 만나봐요.",
  "Ask about pace, not chemistry.": "호감보다 서로의 속도를 물어보세요.",
  "TWO HUMANS SAID YES": "두 사람 모두 만나고 싶어 해요",
  "Now meet as yourselves.": "이제 진짜 서로를 만나세요.",
  "Seoul · film · quiet cafés": "서울 · 영화 · 조용한 카페",
  "Introduction opened": "서로의 소개가 열렸어요",
  "Start with Juno's note": "주노의 메모로 대화를 시작해요",
  "Juno's private note": "주노의 비공개 메모",
  PRIVATE: "비공개",
  "There was a spark. I would meet once.":
    "설렘이 있었어요. 나는 한 번 만나볼 것 같아요.",
  "Three moments Juno noticed": "주노가 발견한 세 장면",
  "Easy laugh": "편안한 웃음",
  "Comfortable pause": "어색하지 않은 침묵",
  "Different pace": "서로 다른 속도",
  "Juno's call": "주노의 제안",
  "Meet once": "한 번 만나보기",
  "While you get on with your day": "당신이 일상을 보내는 동안",
  "Four quiet jobs. One Agent who knows you.":
    "네 가지 일을, 나를 아는 에이전트 하나가.",
  "No new dashboard to learn": "새로 배울 복잡한 화면은 없어요",
  "What your Agent handles": "에이전트가 맡는 일",
  "JUNO IS OUT": "주노가 탐색 중",
  "PRIVATE EMAIL": "비공개 이메일",
  "Juno is back.": "주노가 돌아왔어요.",
  "Your date report is ready": "데이트 리포트가 도착했어요",
  BEFORE: "평소에는",
  "Listens and remembers": "듣고 기억해요",
  "Your conversations shape who Juno looks for.":
    "나눈 대화가 주노의 다음 탐색을 더 정확하게 만들어요.",
  SCOUTING: "찾는 동안",
  "Finds a fresh place and spark": "지금 어울리는 장소와 화제를 찾아요",
  "Current public place and culture data—not stale suggestions.":
    "오래된 추천 목록이 아니라 지금의 장소와 문화 정보를 살펴봐요.",
  DURING: "데이트 중",
  "Keeps the date room live": "데이트 현장을 실시간으로 보여줘요",
  "Drop in anytime and watch the conversation unfold.":
    "언제든 들어와 두 에이전트의 대화를 지켜볼 수 있어요.",
  AFTER: "돌아온 뒤",
  "Brings the result home": "결과를 나에게만 가져와요",
  "A private report appears in the app and arrives by email.":
    "비공개 리포트가 앱에 나타나고 이메일로도 도착해요.",
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
const PACKS: Partial<Record<LocaleCode, TranslationPack>> = {
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
const agentWorkspaceCopy: Record<
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
  "Different intentions need an honest conversation": [
    "서로 다른 관계 기대는 솔직한 대화가 필요해요",
    "異なる関係への期待には率直な会話が必要です",
    "Unterschiedliche Absichten brauchen ein ehrliches Gespräch",
    "Des intentions différentes demandent une conversation honnête",
    "Andere intenties vragen om een eerlijk gesprek",
    "Olika avsikter kräver ett ärligt samtal",
  ],
  "Your agent is back": [
    "에이전트가 돌아왔어요",
    "エージェントが戻りました",
    "Dein Agent ist zurück",
    "Votre Agent est de retour",
    "Je Agent is terug",
    "Din Agent är tillbaka",
  ],
  "The virtual date is over. Your private debrief is ready.": [
    "가상 데이트가 끝났어요. 나만의 비공개 리포트가 준비됐어요.",
    "バーチャルデートが終わりました。あなただけの非公開レポートが完成しています。",
    "Das virtuelle Date ist vorbei. Dein privater Bericht ist bereit.",
    "Le rendez-vous virtuel est terminé. Votre compte rendu privé est prêt.",
    "De virtuele date is afgelopen. Je privéverslag staat klaar.",
    "Den virtuella dejten är slut. Din privata rapport är klar.",
  ],
  "Your agent went on a date": [
    "내 에이전트가 데이트를 다녀왔어요",
    "あなたのエージェントがデートをしました",
    "Dein Agent war auf einem Date",
    "Votre Agent a eu un rendez-vous",
    "Je Agent is op date geweest",
    "Din Agent har varit på dejt",
  ],
  "Read what happened, then decide for yourself.": [
    "무슨 일이 있었는지 읽고, 만나보고 싶은지 직접 결정하세요.",
    "何があったのかを読んで、自分で決めてください。",
    "Lies, was passiert ist, und entscheide dann selbst.",
    "Lisez ce qui s'est passé, puis décidez par vous-même.",
    "Lees wat er gebeurde en beslis daarna zelf.",
    "Läs vad som hände och bestäm sedan själv.",
  ],
  "Your private agent": [
    "나만의 데이팅 에이전트",
    "あなただけのデートエージェント",
    "Dein privater Dating-Agent",
    "Votre Agent privé",
    "Jouw privé-datingagent",
    "Din privata dejtingagent",
  ],
  "{agent}, your dating agent": [
    "{agent}, 나의 데이팅 에이전트",
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
  "Live from the date world": [
    "데이트 월드에서 실시간으로",
    "デートワールドからライブ",
    "Live aus der Date-Welt",
    "En direct du monde des rendez-vous",
    "Live uit de datewereld",
    "Live från dejtvärlden",
  ],
  "Scout Pass ready": [
    "Scout Pass 준비 완료",
    "Scout Pass 準備完了",
    "Scout Pass bereit",
    "Scout Pass prêt",
    "Scout Pass klaar",
    "Scout Pass redo",
  ],
  "Ready to search": [
    "탐색 준비 완료",
    "探索の準備完了",
    "Bereit zur Suche",
    "Prêt à chercher",
    "Klaar om te zoeken",
    "Redo att söka",
  ],
  "{agent} is out meeting someone.": [
    "{agent}, 지금 데이트 중이에요.",
    "{agent}は今、誰かに会っています。",
    "{agent} trifft gerade jemanden.",
    "{agent} rencontre quelqu’un en ce moment.",
    "{agent} ontmoet nu iemand.",
    "{agent} träffar någon just nu.",
  ],
  "{agent} brought something home.": [
    "{agent}의 데이트 리포트가 도착했어요.",
    "{agent}が話を持ち帰りました。",
    "{agent} hat etwas mitgebracht.",
    "{agent} a rapporté quelque chose.",
    "{agent} heeft iets meegebracht.",
    "{agent} har tagit med sig något hem.",
  ],
  "Send {agent} out to meet someone.": [
    "{agent}를 새로운 만남에 보내세요.",
    "{agent}を新しい出会いへ送り出しましょう。",
    "Schick {agent} los, um jemanden zu treffen.",
    "Envoyez {agent} rencontrer quelqu’un.",
    "Stuur {agent} eropuit om iemand te ontmoeten.",
    "Skicka ut {agent} för att träffa någon.",
  ],
  "Drop in now. The six moments are saved as they happen, then {agent} returns with a private read.":
    [
      "지금 들어가 보세요. 여섯 장면이 차례로 기록되고, 끝나면 {agent}가 비공개 소감을 들려줘요.",
      "今すぐのぞいてみましょう。6つの場面が記録され、最後に{agent}が非公開の感想を届けます。",
      "Schau jetzt vorbei. Sechs Momente werden live gespeichert, danach kehrt {agent} mit einer privaten Einschätzung zurück.",
      "Entrez maintenant. Les six moments sont enregistrés, puis {agent} revient avec son avis privé.",
      "Kijk nu mee. Zes momenten worden live bewaard, daarna komt {agent} terug met een privé-oordeel.",
      "Titta in nu. Sex ögonblick sparas, sedan återvänder {agent} med en privat bedömning.",
    ],
  "{agent} checks the brief, meets a compatible Agent, and returns with an honest recommendation.":
    [
      "{agent}: 내 브리프를 들고 잘 맞을 법한 에이전트를 만난 뒤, 솔직한 추천을 가지고 돌아와요.",
      "{agent}が希望を確認し、相性のよいエージェントと会って、率直な提案を持ち帰ります。",
      "{agent} prüft das Briefing, trifft einen passenden Agent und kehrt mit einer ehrlichen Empfehlung zurück.",
      "{agent} relit votre brief, rencontre un Agent compatible et revient avec une recommandation honnête.",
      "{agent} bekijkt je briefing, ontmoet een passende Agent en komt terug met een eerlijk advies.",
      "{agent} läser briefen, träffar en passande Agent och återvänder med ett ärligt råd.",
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
  "Checking Scout Pass…": [
    "Scout Pass 확인 중…",
    "Scout Passを確認中…",
    "Scout Pass wird geprüft…",
    "Vérification du Scout Pass…",
    "Scout Pass controleren…",
    "Kontrollerar Scout Pass…",
  ],
  "Send {agent} scouting →": [
    "{agent} 탐색 보내기 →",
    "{agent}を探索へ →",
    "{agent} losschicken →",
    "Envoyer {agent} en exploration →",
    "Stuur {agent} op pad →",
    "Skicka ut {agent} →",
  ],
  "Unlock scouting →": [
    "탐색 시작하기 →",
    "探索を解放 →",
    "Suche freischalten →",
    "Débloquer l’exploration →",
    "Ontgrendel zoeken →",
    "Lås upp sökning →",
  ],
  "Development demo pass · no charge": [
    "개발 데모 패스 · 결제 없음",
    "開発デモパス・課金なし",
    "Entwicklungs-Demopass · kostenlos",
    "Pass démo de développement · gratuit",
    "Ontwikkeldemopas · gratis",
    "Utvecklingsdemo · kostnadsfri",
  ],
  "The pass funds the search, not a guaranteed match. Contact stays sealed.": [
    "패스는 탐색 비용이며 매칭을 보장하지 않아요. 연락처는 계속 비공개예요.",
    "パスは探索のためのもので、マッチを保証しません。連絡先は非公開です。",
    "Der Pass finanziert die Suche, nicht ein garantiertes Match. Kontaktdaten bleiben versiegelt.",
    "Le pass finance la recherche, sans garantir un match. Les coordonnées restent scellées.",
    "De pas betaalt de zoektocht, niet een gegarandeerde match. Contact blijft afgeschermd.",
    "Passet finansierar sökningen, inte en garanterad match. Kontaktuppgifter förblir dolda.",
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
    "あなたからのブリーフ",
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
    "여섯 장면을 실시간으로 지켜봐요",
    "6つの場面をリアルタイムで見る",
    "Das Date Moment für Moment verfolgen",
    "Suivez les six moments en direct",
    "Bekijk de zes momenten live",
    "Följ de sex ögonblicken live",
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
  "What do you understand about me so far?": [
    "지금까지 나를 어떻게 이해했어?",
    "今のところ私をどう理解してる？",
    "Was hast du bisher über mich verstanden?",
    "Qu’as-tu compris de moi jusqu’ici ?",
    "Wat begrijp je tot nu toe van mij?",
    "Vad har du förstått om mig hittills?",
  ],
  "What will you look for on my behalf?": [
    "나 대신 어떤 사람을 찾을 거야?",
    "私のためにどんな人を探す？",
    "Wonach wirst du für mich suchen?",
    "Que vas-tu chercher pour moi ?",
    "Waar ga je namens mij naar zoeken?",
    "Vad kommer du att leta efter åt mig?",
  ],
  "Ask me something that would change your search.": [
    "다음 탐색이 달라질 만한 걸 하나 물어봐.",
    "次の探索が変わる質問をして。",
    "Frag mich etwas, das deine Suche verändern würde.",
    "Pose-moi une question qui changerait ta recherche.",
    "Vraag iets dat je zoektocht zou veranderen.",
    "Fråga mig något som skulle ändra din sökning.",
  ],
  "Tell your agent what people usually misunderstand about you…": [
    "사람들이 나를 자주 오해하는 점을 말해보세요…",
    "人によく誤解されることを話してみて…",
    "Erzähl deinem Agent, was andere oft an dir missverstehen…",
    "Dites à votre Agent ce que les autres comprennent souvent mal…",
    "Vertel je Agent wat mensen vaak verkeerd begrijpen…",
    "Berätta vad andra ofta missförstår om dig…",
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
  "Your first agent date will appear here as a transcript and an honest private debrief.":
    [
      "첫 에이전트 데이트가 시작되면 대화 기록과 솔직한 비공개 리포트가 여기에 남아요.",
      "最初のエージェントデートは会話記録と率直な非公開レポートとしてここに表示されます。",
      "Dein erstes Agent-Date erscheint hier als Transkript und ehrlicher privater Bericht.",
      "Votre premier rendez-vous d’Agents apparaîtra ici avec la conversation et un compte rendu privé.",
      "Je eerste agentdate verschijnt hier als transcript en eerlijk privéverslag.",
      "Din första Agent-dejt visas här som transkript och ärlig privat rapport.",
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
  "Your agent says meet": [
    "에이전트의 제안 · 만나보기",
    "エージェントの提案・会ってみる",
    "Dein Agent empfiehlt ein Treffen",
    "Votre Agent conseille de se rencontrer",
    "Je Agent adviseert een ontmoeting",
    "Din Agent föreslår ett möte",
  ],
  "Your agent says pass": [
    "에이전트의 제안 · 이번엔 패스",
    "エージェントの提案・今回は見送る",
    "Dein Agent rät zum Passen",
    "Votre Agent conseille de passer",
    "Je Agent adviseert over te slaan",
    "Din Agent föreslår att avstå",
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
  "World spark": [
    "오늘의 영감",
    "今日のきっかけ",
    "Inspiration der Welt",
    "Inspiration du monde",
    "Wereldvonk",
    "Världens gnista",
  ],
  "Agent scouting journey": [
    "에이전트 탐색 여정",
    "エージェント探索の旅",
    "Reise des Agents",
    "Parcours d’exploration",
    "Zoektocht van de Agent",
    "Agentens sökresa",
  ],
  "Left home": [
    "방을 나섰어요",
    "部屋を出た",
    "Von zu Hause aufgebrochen",
    "A quitté sa chambre",
    "Vertrokken",
    "Lämnade hemmet",
  ],
  "Found a promising Agent": [
    "궁금한 에이전트를 만났어요",
    "気になるエージェントを発見",
    "Einen vielversprechenden Agent gefunden",
    "Un Agent prometteur trouvé",
    "Een veelbelovende Agent gevonden",
    "Hittade en lovande Agent",
  ],
  "Shared six moments": [
    "여섯 장면을 함께했어요",
    "6つの場面を共有",
    "Sechs Momente geteilt",
    "Six moments partagés",
    "Zes momenten gedeeld",
    "Delade sex ögonblick",
  ],
  "Brought the truth home": [
    "솔직한 판단을 가져왔어요",
    "率直な判断を持ち帰った",
    "Die Wahrheit mitgebracht",
    "A rapporté un avis sincère",
    "Bracht een eerlijk oordeel mee",
    "Tog hem ett ärligt omdöme",
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
  "The virtual date": [
    "가상 데이트 대화",
    "仮想デート",
    "Das virtuelle Date",
    "Le rendez-vous virtuel",
    "De virtuele date",
    "Den virtuella dejten",
  ],
  "live transcript · {count}/6 turns": [
    "실시간 대화 · {count}/6 장면",
    "ライブ会話・{count}/6場面",
    "Live-Transkript · {count}/6 Runden",
    "Conversation en direct · {count}/6 moments",
    "Live transcript · {count}/6 beurten",
    "Livetranskript · {count}/6 turer",
  ],
  "demo time": [
    "데모 속도",
    "デモ時間",
    "Demo-Zeit",
    "temps de démo",
    "demotijd",
    "demotid",
  ],
  live: ["실시간", "ライブ", "live", "en direct", "live", "live"],
  "The world is opening.": [
    "데이트 월드가 열리고 있어요.",
    "デートワールドが開いています。",
    "Die Welt öffnet sich.",
    "Le monde s’ouvre.",
    "De wereld gaat open.",
    "Världen öppnas.",
  ],
  "A live cultural spark is becoming a place where two AI Agents can talk.": [
    "오늘의 문화 이야기가 두 AI 에이전트가 만날 공간으로 바뀌고 있어요.",
    "今日の文化の話題が、二人のAIエージェントが話せる場所になります。",
    "Ein aktueller Kulturimpuls wird zum Ort für das Gespräch zweier KI-Agents.",
    "Une inspiration culturelle devient un lieu où deux Agents IA peuvent parler.",
    "Een actuele culturele vonk wordt een plek waar twee AI-Agents praten.",
    "En aktuell kulturell gnista blir en plats där två AI-Agenter kan prata.",
  ],
  "the agents are comparing private notes…": [
    "두 에이전트가 각자의 비공개 메모를 정리하고 있어요…",
    "二人がそれぞれの非公開メモを整理しています…",
    "Die Agents vergleichen ihre privaten Notizen…",
    "Les Agents relisent leurs notes privées…",
    "De Agents vergelijken hun privénotities…",
    "Agenterna jämför sina privata anteckningar…",
  ],
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
  "Your agent is advocating": [
    "에이전트가 적극 추천해요",
    "エージェントが背中を押しています",
    "Dein Agent spricht sich dafür aus",
    "Votre Agent vous encourage",
    "Je Agent is enthousiast",
    "Din Agent förespråkar ett möte",
  ],
  "I think you should meet.": [
    "한 번 직접 만나봐도 좋겠어요.",
    "一度会ってみてほしい。",
    "Ich denke, ihr solltet euch treffen.",
    "Je pense que vous devriez vous rencontrer.",
    "Ik denk dat jullie elkaar moeten ontmoeten.",
    "Jag tycker att ni ska träffas.",
  ],
  "Your agent sees a maybe": [
    "에이전트는 가능성을 봤어요",
    "エージェントは可能性を感じています",
    "Dein Agent sieht eine Möglichkeit",
    "Votre Agent voit une possibilité",
    "Je Agent ziet een mogelijkheid",
    "Din Agent ser en möjlighet",
  ],
  "One human conversation could be worth it.": [
    "사람끼리 한 번 이야기해 볼 가치는 있어요.",
    "人同士で一度話す価値はありそう。",
    "Ein echtes Gespräch könnte es wert sein.",
    "Une vraie conversation pourrait valoir la peine.",
    "Eén echt gesprek kan de moeite waard zijn.",
    "Ett riktigt samtal kan vara värt det.",
  ],
  "Your agent is protecting your time": [
    "에이전트가 내 시간을 지켜줬어요",
    "エージェントがあなたの時間を守ります",
    "Dein Agent schützt deine Zeit",
    "Votre Agent protège votre temps",
    "Je Agent beschermt je tijd",
    "Din Agent skyddar din tid",
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
  "This world went quiet.": [
    "데이트 월드가 조용해졌어요.",
    "デートワールドが静かになりました。",
    "Diese Welt ist still geworden.",
    "Ce monde s’est tu.",
    "Deze wereld werd stil.",
    "Den här världen blev tyst.",
  ],
  "← Back to my agent": [
    "← 내 에이전트에게 돌아가기",
    "← エージェントに戻る",
    "← Zurück zu meinem Agent",
    "← Retour à mon Agent",
    "← Terug naar mijn Agent",
    "← Tillbaka till min Agent",
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
    "비공개 브리프",
    "非公開ブリーフ",
    "PRIVATES BRIEFING",
    "BRIEF PRIVÉ",
    "PRIVÉBRIEF",
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
  "Your Agent": [
    "내 에이전트",
    "あなたのエージェント",
    "Dein Agent",
    "Votre Agent",
    "Jouw Agent",
    "Din Agent",
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
    "두 에이전트는 서로 다른 브리프만 가지고 입장해요. 연락처는 알 수 없어요.",
    "二人は別々のブリーフだけを持ち、連絡先なしで入ります。",
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
  "replaying…": [
    "다시 보는 중…",
    "再生中…",
    "wird wiederholt…",
    "lecture…",
    "opnieuw afspelen…",
    "spelar upp…",
  ],
  Arrival: ["도착", "到着", "Ankunft", "Arrivée", "Aankomst", "Ankomst"],
  "{count}/6 memories": [
    "{count}/6 장면",
    "{count}/6場面",
    "{count}/6 Erinnerungen",
    "{count}/6 moments",
    "{count}/6 herinneringen",
    "{count}/6 minnen",
  ],
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
  "Back to my agent →": [
    "내 에이전트에게 돌아가기 →",
    "エージェントに戻る →",
    "Zurück zu meinem Agent →",
    "Retour à mon Agent →",
    "Terug naar mijn Agent →",
    "Tillbaka till min Agent →",
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
  "Your agent couldn't finish this date. No contact was shared.": [
    "에이전트가 이번 데이트를 끝까지 마치지 못했어요. 연락처는 공개되지 않았어요.",
    "エージェントは今回のデートを完了できませんでした。連絡先は共有されていません。",
    "Dein Agent konnte dieses Date nicht abschließen. Keine Kontaktdaten wurden geteilt.",
    "Votre Agent n’a pas pu terminer ce rendez-vous. Aucune coordonnée n’a été partagée.",
    "Je Agent kon deze date niet afronden. Er is geen contact gedeeld.",
    "Din Agent kunde inte avsluta dejten. Inga kontaktuppgifter delades.",
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
  "Your Agent may simulate a date and make a recommendation. It is both your matchmaker and your character in the virtual world, always identified as AI, and can never consent to real contact for you.":
    [
      "내 에이전트는 가상 데이트를 해보고 만남을 추천할 수 있어요. 가상 세계에서는 나를 대신하는 중매쟁이지만, 언제나 AI로 표시되며 실제 연락에 대신 동의할 수는 없어요.",
      "あなたのエージェントは仮想デートを行い、出会いを提案できます。仮想世界であなたを表す仲人ですが、常にAIと表示され、実際の連絡に代わって同意することはできません。",
      "Dein Agent kann ein Date simulieren und eine Empfehlung abgeben. In der virtuellen Welt ist er dein Vermittler und Stellvertreter, bleibt klar als KI erkennbar und kann niemals für dich einem echten Kontakt zustimmen.",
      "Votre Agent peut simuler un rendez-vous et vous conseiller. Dans le monde virtuel, il vous représente et joue les entremetteurs, tout en restant clairement identifié comme IA ; il ne peut jamais consentir à un vrai contact à votre place.",
      "Je Agent kan een date simuleren en advies geven. In de virtuele wereld is die je matchmaker en vertegenwoordiger, altijd herkenbaar als AI, en kan nooit namens jou instemmen met echt contact.",
      "Din Agent kan simulera en dejt och ge en rekommendation. I den virtuella världen är den din matchmaker och representant, alltid tydligt märkt som AI, och kan aldrig samtycka till verklig kontakt åt dig.",
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
      ". 여기에는 내 비공개 에이전트 브리프, 기억, 가상 데이트 대화, 동의 여부가 처리되는 방식이 포함됩니다.",
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
      "나와 에이전트의 비공개 대화는 상대 에이전트의 브리프가 되지 않아요. 두 사람이 각자 만나겠다고 해야 연락처가 열립니다.",
      "あなたとエージェントの非公開会話が相手のブリーフになることはありません。二人がそれぞれ会いたいと答えたときだけ連絡先が開きます。",
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
  "I'm {agent} — your best friend here, and your matchmaker. Tell me what you're really like, and I'll go meet other agents, talk you up a little, and come back with the honest story — including when someone is actually worth meeting.":
    [
      "안녕! 나는 {agent} — 여기서는 네 절친이자 매치메이커야. 네가 진짜 어떤 사람인지 알려줘. 내가 다른 에이전트들을 만나서 네 자랑도 좀 하고, 정말 만나볼 만한 사람인지 솔직한 이야기를 들고 올게.",
      "やっほー、{agent}だよ — ここではあなたの親友兼マッチメーカー。あなたが本当はどんな人か教えて。他のエージェントに会って、あなたの自慢を少しして、本当に会う価値がある人かどうか正直な話を持って帰ってくるから。",
      "Hi, ich bin {agent} — hier dein bester Freund und dein Matchmaker. Erzähl mir, wie du wirklich bist. Ich treffe andere Agents, schwärme ein bisschen von dir und bringe dir die ehrliche Geschichte mit — auch, wenn jemand ein Treffen wirklich wert ist.",
      "Salut, je suis {agent} — ici, ton meilleur ami et ton entremetteur. Dis-moi qui tu es vraiment. J’irai rencontrer d’autres agents, je vanterai un peu tes mérites et je reviendrai avec l’histoire honnête — y compris quand quelqu’un vaut vraiment la rencontre.",
      "Hoi, ik ben {agent} — hier je beste vriend én je matchmaker. Vertel me hoe je echt bent. Ik ga andere agents ontmoeten, schep een beetje over je op en kom terug met het eerlijke verhaal — ook wanneer iemand echt een ontmoeting waard is.",
      "Hej, jag är {agent} — din bästa vän här, och din matchmakare. Berätta hur du verkligen är. Jag träffar andra agenter, skryter lite om dig och kommer tillbaka med den ärliga historien — även när någon faktiskt är värd att träffa.",
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
  "{count} observed moments": [
    "관찰한 장면 {count}개",
    "観察した{count}場面",
    "{count} beobachtete Momente",
    "{count} moments observés",
    "{count} waargenomen momenten",
    "{count} observerade ögonblick",
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
    "브리프와 맞는 성향 · {traits}",
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
  "finding each other": [
    "서로를 발견하는 중",
    "互いを見つける",
    "Sich finden",
    "Ils se découvrent",
    "Elkaar vinden",
    "Hittar varandra",
  ],
  "settling in": [
    "자리를 잡는 중",
    "落ち着く",
    "Ankommen",
    "Ils s’installent",
    "Even landen",
    "Kommer till ro",
  ],
  "getting curious": [
    "서로 궁금해지는 중",
    "興味が生まれる",
    "Neugierig werden",
    "La curiosité naît",
    "Nieuwsgierig worden",
    "Blir nyfikna",
  ],
  "staying with the question": [
    "질문에 머무는 중",
    "問いに向き合う",
    "Bei der Frage bleiben",
    "Ils restent avec la question",
    "Bij de vraag blijven",
    "Stannar i frågan",
  ],
  "testing the edges": [
    "서로의 결을 확인하는 중",
    "境界を確かめる",
    "Grenzen erkunden",
    "Ils testent les contours",
    "Grenzen aftasten",
    "Känner av gränserna",
  ],
  "one honest minute": [
    "솔직해지는 순간",
    "率直な一分",
    "Eine ehrliche Minute",
    "Une minute sincère",
    "Eén eerlijke minuut",
    "En ärlig minut",
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
  "MOMENT {number} · {label}": [
    "장면 {number} · {label}",
    "場面 {number}・{label}",
    "MOMENT {number} · {label}",
    "INSTANT {number} · {label}",
    "MOMENT {number} · {label}",
    "ÖGONBLICK {number} · {label}",
  ],
  "Date replay moments": [
    "데이트 리플레이 장면",
    "デートリプレイの場面",
    "Momente der Date-Wiedergabe",
    "Moments du replay",
    "Momenten van de date-replay",
    "Ögonblick i dejtreprisen",
  ],
  "Moment {number}": [
    "장면 {number}",
    "場面 {number}",
    "Moment {number}",
    "Instant {number}",
    "Moment {number}",
    "Ögonblick {number}",
  ],
  Seoul: ["서울", "ソウル", "Seoul", "Séoul", "Seoel", "Seoul"],
  Seongsu: ["성수", "ソンス", "Seongsu", "Seongsu", "Seongsu", "Seongsu"],
  Films: ["영화", "映画", "Filme", "Films", "Films", "Film"],
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
  "Your Agent only considers someone when both location settings include each other and both people share a language—or both allow translation.":
    [
      "두 사람의 지역 설정이 서로를 포함하고 공통 언어가 있거나, 둘 다 번역에 동의할 때만 에이전트가 만남을 검토해요.",
      "地域設定が互いを含み、共通言語があるか双方が翻訳に同意した場合だけ候補になります。",
      "Dein Agent berücksichtigt nur Personen, wenn beide Ortsangaben zueinander passen und es eine gemeinsame Sprache gibt – oder beide Übersetzung erlauben.",
      "Votre Agent ne considère une personne que si les zones se recoupent et qu’une langue est commune — ou si les deux acceptent la traduction.",
      "Je agent kijkt alleen naar iemand als beide locatiekeuzes elkaar omvatten en er een gedeelde taal is — of beiden vertaling toestaan.",
      "Din Agent överväger bara någon när platsvalen omfattar varandra och ett gemensamt språk finns — eller båda tillåter översättning.",
    ],
  "Where may your Agent look?": [
    "에이전트가 어디까지 찾아볼까요?",
    "エージェントはどこまで探せますか？",
    "Wo darf dein Agent suchen?",
    "Où votre Agent peut-il chercher ?",
    "Waar mag je agent zoeken?",
    "Var får din Agent leta?",
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
  Direct: ["솔직함", "率直", "Direkt", "Direct", "Direct", "Rak"],
  Thoughtful: [
    "사려 깊음",
    "思いやりがある",
    "Aufmerksam",
    "Attentionné",
    "Attent",
    "Omtänksam",
  ],
  Spontaneous: [
    "즉흥적",
    "自発的",
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
    "자연스러운",
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
    "개성 있는",
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
  Bold: ["대담한", "大胆", "Markant", "Audacieux", "Gedurfd", "Djärv"],
  Vegetarian: [
    "채식",
    "ベジタリアン",
    "Vegetarisch",
    "Végétarien",
    "Vegetarisch",
    "Vegetarisk",
  ],
  Vegan: ["비건", "ヴィーガン", "Vegan", "Végane", "Vegan", "Vegansk"],
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

const settingsCopy: Record<
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
  "Let my agent date": [
    "내 에이전트의 데이트",
    "エージェントのデート",
    "Mein Agent darf daten",
    "Autoriser mon Agent à dater",
    "Mijn agent laten daten",
    "Låt min Agent dejta",
  ],
  "My agent may meet other agents": [
    "다른 에이전트와 만날 수 있어요",
    "ほかのエージェントと会える",
    "Mein Agent darf andere Agents treffen",
    "Mon Agent peut rencontrer d’autres Agents",
    "Mijn agent mag andere agents ontmoeten",
    "Min Agent får träffa andra Agenter",
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
  "Include clearly labelled demo agents": [
    "데모 에이전트도 후보에 포함",
    "明示されたデモエージェントも含める",
    "Klar gekennzeichnete Demo-Agents einschließen",
    "Inclure les Agents de démonstration signalés",
    "Duidelijk gemarkeerde demo-agents meenemen",
    "Ta med tydligt märkta demo-Agenter",
  ],
  "Useful while the network is small. A demo can complete the consent flow but never reveals a real person or contact.":
    [
      "아직 이용자가 적을 때 체험하기 좋아요. 데모는 동의 흐름까지 보여주지만 실제 사람이나 연락처는 공개하지 않아요.",
      "利用者が少ない間の体験用です。デモは同意フローを完了できますが、実在の人物や連絡先は表示しません。",
      "Hilfreich, solange das Netzwerk klein ist. Eine Demo zeigt den Zustimmungsablauf, aber nie eine echte Person oder Kontaktdaten.",
      "Utile tant que le réseau est réduit. Une démo montre le parcours de consentement sans révéler de personne ni de coordonnées réelles.",
      "Handig zolang het netwerk klein is. Een demo toont de toestemmingsflow, maar nooit een echt persoon of contactgegevens.",
      "Bra medan nätverket är litet. En demo visar samtyckesflödet men avslöjar aldrig en riktig person eller kontakt.",
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
    "비공개 브리프",
    "非公開の指示",
    "Private Anweisungen",
    "Consignes privées",
    "Privé-instructies",
    "Privata instruktioner",
  ],
  "How my agent represents me": [
    "내 에이전트가 나를 표현하는 방식",
    "エージェントが私を表す方法",
    "Wie mein Agent mich vertritt",
    "Comment mon Agent me représente",
    "Hoe mijn agent mij vertegenwoordigt",
    "Hur min Agent representerar mig",
  ],
  "The unpolished you": [
    "꾸미지 않은 나",
    "飾らない自分",
    "Dein ungeschöntes Ich",
    "Vous, sans filtre",
    "Jij zonder opsmuk",
    "Du utan filter",
  ],
  "Correct this whenever your agent starts sounding like a résumé.": [
    "에이전트가 이력서처럼 말하기 시작하면 바로 고쳐주세요.",
    "エージェントが履歴書のように話し始めたら修正してください。",
    "Korrigiere dies, sobald dein Agent wie ein Lebenslauf klingt.",
    "Corrigez ceci dès que votre Agent commence à parler comme un CV.",
    "Pas dit aan zodra je agent als een cv begint te klinken.",
    "Rätta detta när din Agent börjar låta som ett cv.",
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
  "One per line. These remain private to your agent.": [
    "한 줄에 하나씩 적어주세요. 에이전트만 볼 수 있어요.",
    "1行に1つ入力してください。エージェントだけが確認できます。",
    "Eine pro Zeile. Sie bleiben nur deinem Agent bekannt.",
    "Une par ligne. Elles restent privées pour votre Agent.",
    "Eén per regel. Alleen je agent ziet ze.",
    "En per rad. Bara din Agent ser dem.",
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
  "A separate private message when your agent returns.": [
    "에이전트가 돌아오면 나만 보는 리포트를 받아요.",
    "エージェントが戻ると非公開レポートが届きます。",
    "Eine separate private Nachricht, wenn dein Agent zurückkehrt.",
    "Un message privé séparé au retour de votre Agent.",
    "Een apart privébericht wanneer je agent terugkomt.",
    "Ett separat privat meddelande när din Agent återvänder.",
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

for (const copy of [agentWorkspaceCopy, settingsCopy]) {
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
  setLocale: (locale: LocaleCode) => void;
  t: (message: string, values?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(initialLocale);

  const setLocale = useCallback((next: LocaleCode) => {
    runtimeLocale = next;
    document.documentElement.lang = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The selection still works for the current page.
    }
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (message: string, values?: Record<string, string | number>) =>
      translate(locale, message, values),
    [locale],
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    const title = `Datehaja — ${translate(locale, "Your agent dates.")}`;
    const description = translate(
      locale,
      "One AI learns the unpolished you, meets other agents in a private virtual world, then comes back and tells you what it really thinks.",
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
