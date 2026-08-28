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
const LEGACY_STORAGE_KEY = "datedrop-locale";
const DEFAULT_LOCALE: LocaleCode = "en-US";
let runtimeLocale: LocaleCode | null = null;

const ko: TranslationPack = {
  "Private date concierge": "프라이빗 데이트 컨시어지",
  "Public record": "공개 안내서",
  "Get started": "시작하기",
  "Sign in": "로그인",
  "Sign out": "로그아웃",
  Privacy: "개인정보",
  Safety: "안전",
  Home: "홈",
  When: "시간",
  History: "기록",
  You: "내 정보",
  Main: "주요 메뉴",
  Notifications: "알림",
  "Notifications, {count} unread": "읽지 않은 알림 {count}개",
  "Switch to light mode": "라이트 모드로 전환",
  "Switch to dark mode": "다크 모드로 전환",
  "Language and region": "언어 및 지역",
  Loading: "불러오는 중",
  "Service note 001 · Seoul": "서비스 노트 001 · 서울",
  "Service note 001": "서비스 노트 001",
  "Bring us a free evening.": "비어 있는 저녁을 알려주세요.",
  "We'll return a date.": "데이트로 돌려드릴게요.",
  "No profiles to browse. No conversation to keep alive. DateHaja finds a compatible person, researches a real place, and sends one private invitation to each of you.":
    "프로필을 넘겨보거나 대화를 억지로 이어갈 필요가 없습니다. DateHaja가 잘 맞는 사람과 실제 장소를 찾고, 두 사람에게 각각 비공개 초대를 보냅니다.",
  "Open an evening": "저녁 한 칸 열기",
  "Read the two-minute brief": "2분 안내 읽기",
  "No swiping": "스와이프 없음",
  "No chat audition": "채팅 심사 없음",
  "No contacts shared": "연락처 공유 없음",
  "The route": "진행 방식",
  "Less matching.": "매칭은 줄이고,",
  "More meeting.": "만남은 늘리고.",
  "We removed every step that exists only to keep you inside a dating app.":
    "데이트 앱 안에 붙잡아 두기 위한 단계는 모두 걷어냈습니다.",
  "The usual route": "보통의 방식",
  "Browse strangers": "낯선 사람 둘러보기",
  "Swipe on a hunch": "감으로 스와이프하기",
  Match: "매치",
  "Perform small talk": "끝없는 가벼운 대화",
  "Negotiate a plan": "일정과 장소 조율하기",
  "Maybe meet": "어쩌면 만나기",
  "The DateHaja route": "DateHaja 방식",
  "Say when you're free": "가능한 시간 알려주기",
  "Finding the person and the place": "사람과 장소 찾기",
  "Receive one considered plan": "신중하게 짠 계획 하나 받기",
  "Both answer privately": "각자 비공개로 답하기",
  "Meet in public": "공공장소에서 만나기",
  "What arrives": "도착하는 것",
  "A plan,": "프로필이 아닌,",
  "not a profile.": "하나의 계획.",
  "A date plan has a time, a public place, a budget, and one honest reason the two of you might enjoy it. Nothing to research. One decision to make.":
    "데이트 계획에는 시간, 공개된 장소, 예산, 그리고 두 사람이 즐거울 이유가 담깁니다. 따로 알아볼 것 없이 한 번만 결정하면 됩니다.",
  "Places researched on the live web": "실시간 웹에서 조사한 장소",
  "Sources and evidence attached": "출처와 근거 첨부",
  "Constraints and budget respected": "조건과 예산 반영",
  "Private by construction": "처음부터 프라이버시 중심",
  "The date arrives.": "데이트는 도착하지만.",
  "Your details don't.": "개인정보는 가지 않습니다.",
  "DateHaja Concierge sends every invitation separately. Before you both accept, your match gets a first name, age, neighbourhood, and a few interests — never your inbox or number.":
    "DateHaja 컨시어지가 초대를 각자에게 따로 보냅니다. 두 사람 모두 수락하기 전에는 이름, 나이, 동네, 몇 가지 관심사만 보이며 이메일과 전화번호는 절대 공개되지 않습니다.",
  "Email address": "이메일 주소",
  "Phone number": "전화번호",
  "Home address": "집 주소",
  "Exact location": "정확한 위치",
  "Full name": "성명",
  "Social handles": "소셜 계정",
  "Not shared": "공유 안 함",
  "DateHaja is 18+. We do not verify identity. Read exactly what we do and don't do in the":
    "DateHaja는 만 18세 이상만 이용할 수 있으며 신원을 인증하지 않습니다. 제공하는 보호 조치와 한계를",
  "Safety Center": "안전 센터",
  "Your invitation is open": "초대가 열려 있습니다",
  "When are you free?": "언제 시간이 비나요?",
  "That is still the only question we need answered.":
    "여전히 필요한 답은 이것 하나뿐입니다.",
  "Plan my first date": "첫 데이트 계획 받기",
  "Let's date. We'll make the plan.":
    "데이트하자. 계획은 저희가 준비할게요.",
  "Availability docket": "가능 시간 기록",
  Sat: "토",
  "AUG / SEOUL": "8월 / 서울",
  "Window submitted": "시간 제출 완료",
  "One quiet evening. Flexible on neighbourhood.":
    "조용한 저녁 한 번. 동네는 유연하게.",
  "Concierge instruction": "컨시어지 요청",
  "Find someone thoughtful. Keep it easy to leave, easy to extend.":
    "사려 깊은 사람. 편하게 마치거나 이어갈 수 있는 자리.",
  Ready: "준비",
  "Next: compatibility → venue research → private invite":
    "다음: 궁합 확인 → 장소 조사 → 비공개 초대",
  "New date plan": "새 데이트 계획",
  "Preview / grounded live": "미리보기 / 실시간 근거",
  "Preview / localized example": "미리보기 / 지역별 예시",
  Saturday: "토요일",
  Area: "지역",
  "Proposed route": "제안 동선",
  "Dinner · calm room · about ₩28,000": "저녁 · 조용한 공간 · 약 ₩28,000",
  "Dinner · calm room · about {amount}": "저녁 · 조용한 공간 · 약 {amount}",
  "Quiet dessert café": "조용한 디저트 카페",
  "Four minutes on foot · open late": "도보 4분 · 늦게까지 영업",
  "Who you would meet": "만나게 될 사람",
  "Running / Films / Coffee": "러닝 / 영화 / 커피",
  "You both prefer quieter first dates and share an interest in films and running.":
    "두 사람 모두 차분한 첫 만남을 선호하고 영화와 러닝에 관심이 있습니다.",
  Estimate: "예상 비용",
  person: "1인",
  Pass: "패스",
  Accept: "수락",
  "DateHaja home": "DateHaja 홈",
  "Concierge brief": "컨시어지 안내",
  "Your free time is enough to begin.":
    "비어 있는 시간만 있으면 시작할 수 있어요.",
  "One free evening goes in. A real date comes out.":
    "빈 저녁 하나를 넣으면, 진짜 데이트가 나와요.",
  "Give us an evening. We handle compatibility, the place, the plan, and two private invitations.":
    "저녁 한 번을 맡겨주세요. 궁합, 장소, 계획, 두 개의 비공개 초대는 저희가 준비합니다.",
  "Your contact details stay yours": "연락처는 나만 보관",
  "Every venue has a live source": "모든 장소에 실시간 출처",
  "Both people answer in private": "두 사람 모두 비공개 응답",
  "New client / 01": "신규 고객 / 01",
  "Client return / 01": "고객 재방문 / 01",
  "Open your account": "계정 열기",
  "Welcome back": "다시 만나 반가워요",
  "Reserve your first evening.": "첫 저녁을 예약하세요.",
  "Your dates are this way.": "당신의 데이트는 이쪽입니다.",
  "Two minutes of setup. After that, all we ask is when you're free.":
    "설정은 2분이면 됩니다. 그다음에는 가능한 시간만 알려주세요.",
  "Sign in to review invitations, open evenings, and confirmed plans.":
    "로그인하여 초대, 가능한 저녁, 확정된 계획을 확인하세요.",
  Email: "이메일",
  Password: "비밀번호",
  "At least 8 characters.": "8자 이상 입력하세요.",
  "I'm 18 or over, and I understand DateHaja does not verify identity.":
    "만 18세 이상이며 DateHaja가 신원을 인증하지 않는다는 점을 이해했습니다.",
  "Create my account": "계정 만들기",
  "Already have an account?": "이미 계정이 있나요?",
  "New here?": "처음이신가요?",
  "Create an account": "계정 만들기",
  "Your email is used only by DateHaja Concierge to reach you. It is never shown to another user.":
    "이메일은 DateHaja 컨시어지가 연락할 때만 사용하며 다른 사용자에게 공개하지 않습니다.",
  "How privacy works": "개인정보 보호 방식",
  "DateHaja is for adults only — please confirm you're 18 or over.":
    "DateHaja는 성인 전용입니다. 만 18세 이상인지 확인해 주세요.",
  "Use at least 8 characters.": "8자 이상 사용해 주세요.",
  "That email is already registered. Try signing in instead.":
    "이미 등록된 이메일입니다. 로그인해 주세요.",
  "That email and password don't match.":
    "이메일 또는 비밀번호가 일치하지 않습니다.",
  "Couldn't sign you in.": "로그인하지 못했습니다.",
  closed: "마감",
  "{count} day left": "{count}일 남음",
  "{count} days left": "{count}일 남음",
  "{count} hour left": "{count}시간 남음",
  "{count} hours left": "{count}시간 남음",
  "{count} min left": "{count}분 남음",
};

const ja: TranslationPack = {
  "Private date concierge": "プライベート・デートコンシェルジュ",
  "Public record": "公開ガイド",
  "Get started": "はじめる",
  "Sign in": "ログイン",
  "Sign out": "ログアウト",
  Privacy: "プライバシー",
  Safety: "安全",
  Home: "ホーム",
  When: "日時",
  History: "履歴",
  You: "あなた",
  Main: "メインメニュー",
  Notifications: "通知",
  "Notifications, {count} unread": "未読の通知が{count}件あります",
  "Switch to light mode": "ライトモードに切り替え",
  "Switch to dark mode": "ダークモードに切り替え",
  "Language and region": "言語と地域",
  Loading: "読み込み中",
  "Service note 001 · Seoul": "サービスノート 001 · ソウル",
  "Service note 001": "サービスノート 001",
  "Bring us a free evening.": "空いている夜を教えてください。",
  "We'll return a date.": "デートにしてお返しします。",
  "No profiles to browse. No conversation to keep alive. DateHaja finds a compatible person, researches a real place, and sends one private invitation to each of you.":
    "プロフィール探しも、無理な会話も不要です。DateHajaが相性のよい相手と実在する場所を探し、それぞれに非公開の招待を送ります。",
  "Open an evening": "夜をひとつ空ける",
  "Read the two-minute brief": "2分ガイドを読む",
  "No swiping": "スワイプなし",
  "No chat audition": "チャット審査なし",
  "No contacts shared": "連絡先の共有なし",
  "The route": "流れ",
  "Less matching.": "マッチングは少なく。",
  "More meeting.": "出会いは多く。",
  "We removed every step that exists only to keep you inside a dating app.":
    "アプリに留めるためだけの手順をすべて省きました。",
  "The usual route": "よくある流れ",
  "Browse strangers": "知らない人を眺める",
  "Swipe on a hunch": "勘でスワイプ",
  Match: "マッチ",
  "Perform small talk": "延々と雑談",
  "Negotiate a plan": "予定と場所を調整",
  "Maybe meet": "会えるかもしれない",
  "The DateHaja route": "DateHajaの流れ",
  "Say when you're free": "空いている時間を伝える",
  "Finding the person and the place": "相手と場所を探す",
  "Receive one considered plan": "よく考えられた提案を一つ受け取る",
  "Both answer privately": "二人とも個別に回答",
  "Meet in public": "公共の場所で会う",
  "What arrives": "届くもの",
  "A plan,": "プロフィールではなく、",
  "not a profile.": "ひとつのプラン。",
  "A date plan has a time, a public place, a budget, and one honest reason the two of you might enjoy it. Nothing to research. One decision to make.":
    "デートプランには日時、公共の場所、予算、二人が楽しめそうな正直な理由が含まれます。調べ物は不要。決めるのは一度だけです。",
  "Places researched on the live web": "現在のウェブ情報で調べた場所",
  "Sources and evidence attached": "情報源と根拠を添付",
  "Constraints and budget respected": "条件と予算を尊重",
  "Private by construction": "設計からプライベート",
  "The date arrives.": "デートは届く。",
  "Your details don't.": "個人情報は届かない。",
  "DateHaja Concierge sends every invitation separately. Before you both accept, your match gets a first name, age, neighbourhood, and a few interests — never your inbox or number.":
    "DateHajaコンシェルジュが招待を別々に送ります。二人が承諾するまでは、名前、年齢、エリア、いくつかの興味だけが表示され、メールや電話番号は公開されません。",
  "Email address": "メールアドレス",
  "Phone number": "電話番号",
  "Home address": "自宅住所",
  "Exact location": "正確な位置",
  "Full name": "氏名",
  "Social handles": "SNSアカウント",
  "Not shared": "共有しない",
  "DateHaja is 18+. We do not verify identity. Read exactly what we do and don't do in the":
    "DateHajaは18歳以上向けで、本人確認は行いません。詳しい保護内容と限界は",
  "Safety Center": "セーフティセンター",
  "Your invitation is open": "招待を受付中",
  "When are you free?": "いつ空いていますか？",
  "That is still the only question we need answered.":
    "必要なのは、今もこの答えだけです。",
  "Plan my first date": "最初のデートを計画する",
  "Let's date. We'll make the plan.":
    "デートしよう。プランは私たちにおまかせ。",
  "Availability docket": "空き時間票",
  Sat: "土",
  "AUG / SEOUL": "8月 / ソウル",
  "Window submitted": "時間を送信済み",
  "One quiet evening. Flexible on neighbourhood.":
    "静かな夜を一度。エリアは柔軟に。",
  "Concierge instruction": "コンシェルジュへの希望",
  "Find someone thoughtful. Keep it easy to leave, easy to extend.":
    "思いやりのある人。短く終えても、長く続けても自然な場所。",
  Ready: "準備完了",
  "Next: compatibility → venue research → private invite":
    "次：相性確認 → 場所の調査 → 非公開招待",
  "New date plan": "新しいデートプラン",
  "Preview / grounded live": "プレビュー / 最新情報に基づく",
  "Preview / localized example": "プレビュー / 地域別の例",
  Saturday: "土曜日",
  Area: "エリア",
  "Proposed route": "提案プラン",
  "Dinner · calm room · about ₩28,000": "夕食 · 落ち着いた店内 · 約₩28,000",
  "Dinner · calm room · about {amount}": "夕食 · 落ち着いた店内 · 約{amount}",
  "Quiet dessert café": "静かなデザートカフェ",
  "Four minutes on foot · open late": "徒歩4分 · 夜遅くまで営業",
  "Who you would meet": "会う相手",
  "Running / Films / Coffee": "ランニング / 映画 / コーヒー",
  "You both prefer quieter first dates and share an interest in films and running.":
    "二人とも静かな初デートを好み、映画とランニングに関心があります。",
  Estimate: "目安",
  person: "1人",
  Pass: "見送る",
  Accept: "承諾",
  "DateHaja home": "DateHajaホーム",
  "Concierge brief": "コンシェルジュガイド",
  "Your free time is enough to begin.": "空いている時間だけで始められます。",
  "One free evening goes in. A real date comes out.":
    "空いた夜を預けると、本当のデートが届きます。",
  "Give us an evening. We handle compatibility, the place, the plan, and two private invitations.":
    "夜をひとつ預けてください。相性、場所、計画、二通の非公開招待は私たちが準備します。",
  "Your contact details stay yours": "連絡先は自分だけのもの",
  "Every venue has a live source": "すべての場所に最新の情報源",
  "Both people answer in private": "二人とも非公開で回答",
  "New client / 01": "新規 / 01",
  "Client return / 01": "再訪 / 01",
  "Open your account": "アカウントを開く",
  "Welcome back": "おかえりなさい",
  "Reserve your first evening.": "最初の夜を予約しましょう。",
  "Your dates are this way.": "あなたのデートはこちらです。",
  "Two minutes of setup. After that, all we ask is when you're free.":
    "設定は2分だけ。その後は空いている時間を教えるだけです。",
  "Sign in to review invitations, open evenings, and confirmed plans.":
    "ログインして招待、空いている夜、確定した予定を確認できます。",
  Email: "メール",
  Password: "パスワード",
  "At least 8 characters.": "8文字以上。",
  "I'm 18 or over, and I understand DateHaja does not verify identity.":
    "18歳以上で、DateHajaが本人確認を行わないことを理解しました。",
  "Create my account": "アカウントを作成",
  "Already have an account?": "すでにアカウントをお持ちですか？",
  "New here?": "初めてですか？",
  "Create an account": "アカウントを作成",
  "Your email is used only by DateHaja Concierge to reach you. It is never shown to another user.":
    "メールはDateHajaコンシェルジュからの連絡にのみ使用し、他のユーザーには表示しません。",
  "How privacy works": "プライバシーの仕組み",
  "DateHaja is for adults only — please confirm you're 18 or over.":
    "DateHajaは成人向けです。18歳以上であることを確認してください。",
  "Use at least 8 characters.": "8文字以上にしてください。",
  "That email is already registered. Try signing in instead.":
    "そのメールは登録済みです。ログインしてください。",
  "That email and password don't match.":
    "メールまたはパスワードが一致しません。",
  "Couldn't sign you in.": "ログインできませんでした。",
  closed: "締切",
  "{count} day left": "残り{count}日",
  "{count} days left": "残り{count}日",
  "{count} hour left": "残り{count}時間",
  "{count} hours left": "残り{count}時間",
  "{count} min left": "残り{count}分",
};

const de: TranslationPack = {
  "Private date concierge": "Privater Date-Concierge",
  "Public record": "Öffentliche Information",
  "Get started": "Loslegen",
  "Sign in": "Anmelden",
  "Sign out": "Abmelden",
  Privacy: "Datenschutz",
  Safety: "Sicherheit",
  Home: "Start",
  When: "Wann",
  History: "Verlauf",
  You: "Du",
  Main: "Hauptmenü",
  Notifications: "Benachrichtigungen",
  "Notifications, {count} unread": "{count} ungelesene Benachrichtigungen",
  "Switch to light mode": "Zum hellen Modus wechseln",
  "Switch to dark mode": "Zum dunklen Modus wechseln",
  "Language and region": "Sprache und Region",
  Loading: "Lädt",
  "Service note 001 · Seoul": "Service-Notiz 001 · Seoul",
  "Service note 001": "Service-Notiz 001",
  "Bring us a free evening.": "Gib uns einen freien Abend.",
  "We'll return a date.": "Wir machen ein Date daraus.",
  "No profiles to browse. No conversation to keep alive. DateHaja finds a compatible person, researches a real place, and sends one private invitation to each of you.":
    "Keine Profile durchsuchen, keine Gespräche künstlich am Leben halten. DateHaja findet eine passende Person, recherchiert einen echten Ort und sendet euch getrennte private Einladungen.",
  "Open an evening": "Einen Abend freigeben",
  "Read the two-minute brief": "Zwei-Minuten-Info lesen",
  "No swiping": "Kein Swipen",
  "No chat audition": "Kein Chat-Vorsprechen",
  "No contacts shared": "Keine Kontaktdaten geteilt",
  "The route": "Der Ablauf",
  "Less matching.": "Weniger Matching.",
  "More meeting.": "Mehr Treffen.",
  "We removed every step that exists only to keep you inside a dating app.":
    "Wir haben jeden Schritt entfernt, der dich nur in einer Dating-App halten soll.",
  "The usual route": "Der übliche Weg",
  "Browse strangers": "Fremde durchstöbern",
  "Swipe on a hunch": "Nach Gefühl swipen",
  Match: "Match",
  "Perform small talk": "Smalltalk aufführen",
  "Negotiate a plan": "Einen Plan aushandeln",
  "Maybe meet": "Vielleicht treffen",
  "The DateHaja route": "Der DateHaja-Weg",
  "Say when you're free": "Sag, wann du Zeit hast",
  "Finding the person and the place": "Person und Ort finden",
  "Receive one considered plan": "Einen durchdachten Plan erhalten",
  "Both answer privately": "Beide antworten privat",
  "Meet in public": "An einem öffentlichen Ort treffen",
  "What arrives": "Was ankommt",
  "A plan,": "Ein Plan,",
  "not a profile.": "kein Profil.",
  "A date plan has a time, a public place, a budget, and one honest reason the two of you might enjoy it. Nothing to research. One decision to make.":
    "Ein Date-Plan hat eine Zeit, einen öffentlichen Ort, ein Budget und einen ehrlichen Grund, warum er euch gefallen könnte. Nichts nachzurecherchieren. Eine Entscheidung.",
  "Places researched on the live web": "Orte aktuell im Web recherchiert",
  "Sources and evidence attached": "Quellen und Belege beigefügt",
  "Constraints and budget respected": "Vorgaben und Budget berücksichtigt",
  "Private by construction": "Von Grund auf privat",
  "The date arrives.": "Das Date kommt an.",
  "Your details don't.": "Deine Daten nicht.",
  "DateHaja Concierge sends every invitation separately. Before you both accept, your match gets a first name, age, neighbourhood, and a few interests — never your inbox or number.":
    "DateHaja Concierge versendet jede Einladung getrennt. Bevor ihr beide zusagt, sieht dein Match nur Vorname, Alter, Viertel und einige Interessen — niemals E-Mail oder Telefonnummer.",
  "Email address": "E-Mail-Adresse",
  "Phone number": "Telefonnummer",
  "Home address": "Wohnadresse",
  "Exact location": "Genauer Standort",
  "Full name": "Vollständiger Name",
  "Social handles": "Social-Media-Namen",
  "Not shared": "Nicht geteilt",
  "DateHaja is 18+. We do not verify identity. Read exactly what we do and don't do in the":
    "DateHaja ist ab 18. Wir prüfen keine Identitäten. Was wir tun und nicht tun, steht im",
  "Safety Center": "Sicherheitsbereich",
  "Your invitation is open": "Deine Einladung ist offen",
  "When are you free?": "Wann hast du Zeit?",
  "That is still the only question we need answered.":
    "Das ist weiterhin die einzige Frage, die wir stellen.",
  "Plan my first date": "Mein erstes Date planen",
  "Let's date. We'll make the plan.":
    "Lass uns daten. Wir machen den Plan.",
  "Availability docket": "Zeitfenster-Akte",
  Sat: "Sa",
  "AUG / SEOUL": "AUG / SEOUL",
  "Window submitted": "Zeitfenster eingereicht",
  "One quiet evening. Flexible on neighbourhood.":
    "Ein ruhiger Abend. Beim Viertel flexibel.",
  "Concierge instruction": "Wunsch an den Concierge",
  "Find someone thoughtful. Keep it easy to leave, easy to extend.":
    "Eine aufmerksame Person. Leicht zu beenden, leicht zu verlängern.",
  Ready: "Bereit",
  "Next: compatibility → venue research → private invite":
    "Als Nächstes: Kompatibilität → Ortsrecherche → private Einladung",
  "New date plan": "Neuer Date-Plan",
  "Preview / grounded live": "Vorschau / aktuell belegt",
  "Preview / localized example": "Vorschau / lokales Beispiel",
  Saturday: "Samstag",
  Area: "Gegend",
  "Proposed route": "Vorgeschlagener Ablauf",
  "Dinner · calm room · about ₩28,000":
    "Abendessen · ruhiger Raum · ca. ₩28.000",
  "Dinner · calm room · about {amount}":
    "Abendessen · ruhiger Raum · ca. {amount}",
  "Quiet dessert café": "Ruhiges Dessert-Café",
  "Four minutes on foot · open late": "Vier Minuten zu Fuß · lange geöffnet",
  "Who you would meet": "Wen du treffen würdest",
  "Running / Films / Coffee": "Laufen / Filme / Kaffee",
  "You both prefer quieter first dates and share an interest in films and running.":
    "Ihr mögt beide ruhigere erste Dates und interessiert euch für Filme und Laufen.",
  Estimate: "Schätzung",
  person: "Person",
  Pass: "Ablehnen",
  Accept: "Annehmen",
  "DateHaja home": "DateHaja Startseite",
  "Concierge brief": "Concierge-Info",
  "Your free time is enough to begin.":
    "Deine freie Zeit reicht, um zu beginnen.",
  "One free evening goes in. A real date comes out.":
    "Ein freier Abend rein. Ein echtes Date raus.",
  "Give us an evening. We handle compatibility, the place, the plan, and two private invitations.":
    "Gib uns einen Abend. Wir kümmern uns um Kompatibilität, Ort, Plan und zwei private Einladungen.",
  "Your contact details stay yours": "Deine Kontaktdaten bleiben bei dir",
  "Every venue has a live source": "Jeder Ort hat eine aktuelle Quelle",
  "Both people answer in private": "Beide antworten privat",
  "New client / 01": "Neu / 01",
  "Client return / 01": "Rückkehr / 01",
  "Open your account": "Konto eröffnen",
  "Welcome back": "Willkommen zurück",
  "Reserve your first evening.": "Reserviere deinen ersten Abend.",
  "Your dates are this way.": "Hier geht es zu deinen Dates.",
  "Two minutes of setup. After that, all we ask is when you're free.":
    "Zwei Minuten Einrichtung. Danach fragen wir nur noch, wann du Zeit hast.",
  "Sign in to review invitations, open evenings, and confirmed plans.":
    "Melde dich an, um Einladungen, freie Abende und bestätigte Pläne zu sehen.",
  Email: "E-Mail",
  Password: "Passwort",
  "At least 8 characters.": "Mindestens 8 Zeichen.",
  "I'm 18 or over, and I understand DateHaja does not verify identity.":
    "Ich bin mindestens 18 und verstehe, dass DateHaja keine Identitäten prüft.",
  "Create my account": "Konto erstellen",
  "Already have an account?": "Schon ein Konto?",
  "New here?": "Neu hier?",
  "Create an account": "Konto erstellen",
  "Your email is used only by DateHaja Concierge to reach you. It is never shown to another user.":
    "Deine E-Mail wird nur vom DateHaja Concierge verwendet und niemals anderen Nutzern gezeigt.",
  "How privacy works": "So funktioniert Datenschutz",
  "DateHaja is for adults only — please confirm you're 18 or over.":
    "DateHaja ist nur für Erwachsene. Bitte bestätige, dass du mindestens 18 bist.",
  "Use at least 8 characters.": "Verwende mindestens 8 Zeichen.",
  "That email is already registered. Try signing in instead.":
    "Diese E-Mail ist bereits registriert. Bitte melde dich an.",
  "That email and password don't match.":
    "E-Mail und Passwort stimmen nicht überein.",
  "Couldn't sign you in.": "Anmeldung fehlgeschlagen.",
  closed: "geschlossen",
  "{count} day left": "noch {count} Tag",
  "{count} days left": "noch {count} Tage",
  "{count} hour left": "noch {count} Stunde",
  "{count} hours left": "noch {count} Stunden",
  "{count} min left": "noch {count} Min.",
};

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
  "Private date concierge": "Conciergerie de rendez-vous privée",
  "Public record": "Informations publiques",
  "Get started": "Commencer",
  "Sign in": "Se connecter",
  "Sign out": "Se déconnecter",
  Privacy: "Confidentialité",
  Safety: "Sécurité",
  Home: "Accueil",
  When: "Quand",
  History: "Historique",
  You: "Vous",
  Main: "Menu principal",
  Notifications: "Notifications",
  "Notifications, {count} unread": "{count} notifications non lues",
  "Switch to light mode": "Passer au mode clair",
  "Switch to dark mode": "Passer au mode sombre",
  "Language and region": "Langue et région",
  Loading: "Chargement",
  "Service note 001 · Seoul": "Note de service 001 · Séoul",
  "Service note 001": "Note de service 001",
  "Bring us a free evening.": "Confiez-nous une soirée libre.",
  "We'll return a date.": "Nous en ferons un rendez-vous.",
  "No profiles to browse. No conversation to keep alive. DateHaja finds a compatible person, researches a real place, and sends one private invitation to each of you.":
    "Aucun profil à parcourir, aucune conversation à entretenir. DateHaja trouve une personne compatible, vérifie un lieu réel et vous envoie deux invitations privées séparées.",
  "Open an evening": "Libérer une soirée",
  "Read the two-minute brief": "Lire le brief de deux minutes",
  "No swiping": "Aucun swipe",
  "No chat audition": "Aucune audition par chat",
  "No contacts shared": "Aucun contact partagé",
  "The route": "Le parcours",
  "Less matching.": "Moins de matching.",
  "More meeting.": "Plus de rencontres.",
  "We removed every step that exists only to keep you inside a dating app.":
    "Nous avons supprimé chaque étape qui ne sert qu'à vous retenir dans une appli de rencontre.",
  "The usual route": "Le parcours habituel",
  "Browse strangers": "Parcourir des inconnus",
  "Swipe on a hunch": "Swiper à l'intuition",
  Match: "Matcher",
  "Perform small talk": "Faire durer les banalités",
  "Negotiate a plan": "Négocier un programme",
  "Maybe meet": "Peut-être se rencontrer",
  "The DateHaja route": "Le parcours DateHaja",
  "Say when you're free": "Dire quand vous êtes libre",
  "Finding the person and the place": "Trouver la personne et le lieu",
  "Receive one considered plan": "Recevoir un programme réfléchi",
  "Both answer privately": "Répondre séparément",
  "Meet in public": "Se rencontrer dans un lieu public",
  "What arrives": "Ce qui arrive",
  "A plan,": "Un programme,",
  "not a profile.": "pas un profil.",
  "A date plan has a time, a public place, a budget, and one honest reason the two of you might enjoy it. Nothing to research. One decision to make.":
    "Un projet de rendez-vous comprend une heure, un lieu public, un budget et une raison sincère pour laquelle vous pourriez l'apprécier. Rien à rechercher. Une seule décision.",
  "Places researched on the live web": "Lieux vérifiés sur le web en direct",
  "Sources and evidence attached": "Sources et preuves jointes",
  "Constraints and budget respected": "Contraintes et budget respectés",
  "Private by construction": "Privé par conception",
  "The date arrives.": "Le rendez-vous arrive.",
  "Your details don't.": "Pas vos coordonnées.",
  "DateHaja Concierge sends every invitation separately. Before you both accept, your match gets a first name, age, neighbourhood, and a few interests — never your inbox or number.":
    "DateHaja Concierge envoie chaque invitation séparément. Avant votre double accord, l'autre personne ne voit que prénom, âge, quartier et quelques centres d'intérêt — jamais votre e-mail ni votre numéro.",
  "Email address": "Adresse e-mail",
  "Phone number": "Numéro de téléphone",
  "Home address": "Adresse du domicile",
  "Exact location": "Localisation précise",
  "Full name": "Nom complet",
  "Social handles": "Comptes sociaux",
  "Not shared": "Non partagé",
  "DateHaja is 18+. We do not verify identity. Read exactly what we do and don't do in the":
    "DateHaja est réservé aux 18 ans et plus. Nous ne vérifions pas l'identité. Consultez nos mesures et leurs limites dans le",
  "Safety Center": "Centre de sécurité",
  "Your invitation is open": "Votre invitation est ouverte",
  "When are you free?": "Quand êtes-vous libre ?",
  "That is still the only question we need answered.":
    "C'est toujours la seule question à laquelle nous avons besoin d'une réponse.",
  "Plan my first date": "Planifier mon premier rendez-vous",
  "Let's date. We'll make the plan.":
    "On se rencontre. Nous préparons tout.",
  "Availability docket": "Dossier de disponibilité",
  Sat: "Sam",
  "AUG / SEOUL": "AOÛT / SÉOUL",
  "Window submitted": "Créneau envoyé",
  "One quiet evening. Flexible on neighbourhood.":
    "Une soirée calme. Quartier flexible.",
  "Concierge instruction": "Instruction au concierge",
  "Find someone thoughtful. Keep it easy to leave, easy to extend.":
    "Une personne attentionnée. Facile à écourter, facile à prolonger.",
  Ready: "Prêt",
  "Next: compatibility → venue research → private invite":
    "Suite : compatibilité → recherche du lieu → invitation privée",
  "New date plan": "Nouveau projet de rendez-vous",
  "Preview / grounded live": "Aperçu / vérifié en direct",
  "Preview / localized example": "Aperçu / exemple local",
  Saturday: "Samedi",
  Area: "Quartier",
  "Proposed route": "Parcours proposé",
  "Dinner · calm room · about ₩28,000": "Dîner · salle calme · env. 28 000 ₩",
  "Dinner · calm room · about {amount}": "Dîner · salle calme · env. {amount}",
  "Quiet dessert café": "Café à desserts calme",
  "Four minutes on foot · open late": "Quatre minutes à pied · ouvert tard",
  "Who you would meet": "La personne que vous rencontreriez",
  "Running / Films / Coffee": "Course / Films / Café",
  "You both prefer quieter first dates and share an interest in films and running.":
    "Vous préférez tous les deux les premiers rendez-vous calmes et partagez un intérêt pour le cinéma et la course.",
  Estimate: "Estimation",
  person: "personne",
  Pass: "Passer",
  Accept: "Accepter",
  "DateHaja home": "Accueil DateHaja",
  "Concierge brief": "Brief du concierge",
  "Your free time is enough to begin.":
    "Votre temps libre suffit pour commencer.",
  "One free evening goes in. A real date comes out.":
    "Une soirée libre entre. Un vrai rendez-vous en sort.",
  "Give us an evening. We handle compatibility, the place, the plan, and two private invitations.":
    "Confiez-nous une soirée. Nous gérons la compatibilité, le lieu, le programme et deux invitations privées.",
  "Your contact details stay yours": "Vos coordonnées restent à vous",
  "Every venue has a live source": "Chaque lieu a une source actuelle",
  "Both people answer in private": "Chacun répond en privé",
  "New client / 01": "Nouveau client / 01",
  "Client return / 01": "Retour client / 01",
  "Open your account": "Ouvrir votre compte",
  "Welcome back": "Bon retour",
  "Reserve your first evening.": "Réservez votre première soirée.",
  "Your dates are this way.": "Vos rendez-vous sont par ici.",
  "Two minutes of setup. After that, all we ask is when you're free.":
    "Deux minutes de réglages. Ensuite, dites-nous simplement quand vous êtes libre.",
  "Sign in to review invitations, open evenings, and confirmed plans.":
    "Connectez-vous pour consulter vos invitations, soirées libres et programmes confirmés.",
  Email: "E-mail",
  Password: "Mot de passe",
  "At least 8 characters.": "Au moins 8 caractères.",
  "I'm 18 or over, and I understand DateHaja does not verify identity.":
    "J'ai 18 ans ou plus et je comprends que DateHaja ne vérifie pas l'identité.",
  "Create my account": "Créer mon compte",
  "Already have an account?": "Vous avez déjà un compte ?",
  "New here?": "Nouveau ici ?",
  "Create an account": "Créer un compte",
  "Your email is used only by DateHaja Concierge to reach you. It is never shown to another user.":
    "Votre e-mail sert uniquement à DateHaja Concierge pour vous contacter et n'est jamais montré à un autre utilisateur.",
  "How privacy works": "Comment fonctionne la confidentialité",
  "DateHaja is for adults only — please confirm you're 18 or over.":
    "DateHaja est réservé aux adultes. Confirmez que vous avez au moins 18 ans.",
  "Use at least 8 characters.": "Utilisez au moins 8 caractères.",
  "That email is already registered. Try signing in instead.":
    "Cet e-mail est déjà enregistré. Essayez de vous connecter.",
  "That email and password don't match.":
    "L'e-mail et le mot de passe ne correspondent pas.",
  "Couldn't sign you in.": "Connexion impossible.",
  closed: "clos",
  "{count} day left": "encore {count} jour",
  "{count} days left": "encore {count} jours",
  "{count} hour left": "encore {count} heure",
  "{count} hours left": "encore {count} heures",
  "{count} min left": "encore {count} min",
});

Object.assign(nl, {
  "Private date concierge": "Privé-dateconciërge",
  "Public record": "Openbare informatie",
  "Get started": "Beginnen",
  "Sign in": "Inloggen",
  "Sign out": "Uitloggen",
  Privacy: "Privacy",
  Safety: "Veiligheid",
  Home: "Home",
  When: "Wanneer",
  History: "Geschiedenis",
  You: "Jij",
  Main: "Hoofdmenu",
  Notifications: "Meldingen",
  "Notifications, {count} unread": "{count} ongelezen meldingen",
  "Switch to light mode": "Naar lichte modus",
  "Switch to dark mode": "Naar donkere modus",
  "Language and region": "Taal en regio",
  Loading: "Laden",
  "Service note 001 · Seoul": "Servicenotitie 001 · Seoul",
  "Service note 001": "Servicenotitie 001",
  "Bring us a free evening.": "Geef ons een vrije avond.",
  "We'll return a date.": "Wij maken er een date van.",
  "No profiles to browse. No conversation to keep alive. DateHaja finds a compatible person, researches a real place, and sends one private invitation to each of you.":
    "Geen profielen om door te bladeren en geen gesprek om kunstmatig gaande te houden. DateHaja vindt iemand die bij je past, onderzoekt een echte locatie en stuurt jullie ieder een privé-uitnodiging.",
  "Open an evening": "Een avond vrijgeven",
  "Read the two-minute brief": "Lees de uitleg van twee minuten",
  "No swiping": "Niet swipen",
  "No chat audition": "Geen chat-auditie",
  "No contacts shared": "Geen contactgegevens gedeeld",
  "The route": "De route",
  "Less matching.": "Minder matchen.",
  "More meeting.": "Meer ontmoeten.",
  "We removed every step that exists only to keep you inside a dating app.":
    "We hebben elke stap geschrapt die alleen bedoeld is om je in een datingapp te houden.",
  "The usual route": "De gebruikelijke route",
  "Browse strangers": "Onbekenden bekijken",
  "Swipe on a hunch": "Op gevoel swipen",
  Match: "Koppelen",
  "Perform small talk": "Smalltalk volhouden",
  "Negotiate a plan": "Over een plan onderhandelen",
  "Maybe meet": "Misschien afspreken",
  "The DateHaja route": "De DateHaja-route",
  "Say when you're free": "Zeg wanneer je vrij bent",
  "Finding the person and the place": "De persoon en plek vinden",
  "Receive one considered plan": "Ontvang één doordacht plan",
  "Both answer privately": "Beiden antwoorden privé",
  "Meet in public": "Ontmoet elkaar in het openbaar",
  "What arrives": "Wat je ontvangt",
  "A plan,": "Een plan,",
  "not a profile.": "geen profiel.",
  "A date plan has a time, a public place, a budget, and one honest reason the two of you might enjoy it. Nothing to research. One decision to make.":
    "Een dateplan bevat een tijd, een openbare plek, een budget en één eerlijke reden waarom jullie het samen leuk kunnen hebben. Niets om uit te zoeken. Eén beslissing.",
  "Places researched on the live web": "Locaties live op het web onderzocht",
  "Sources and evidence attached": "Bronnen en bewijs toegevoegd",
  "Constraints and budget respected": "Wensen en budget gerespecteerd",
  "Private by construction": "Privé by design",
  "The date arrives.": "De date komt aan.",
  "Your details don't.": "Je gegevens niet.",
  "DateHaja Concierge sends every invitation separately. Before you both accept, your match gets a first name, age, neighbourhood, and a few interests — never your inbox or number.":
    "DateHaja Concierge verstuurt elke uitnodiging afzonderlijk. Voordat jullie beiden accepteren, ziet je match alleen voornaam, leeftijd, buurt en enkele interesses — nooit je e-mail of telefoonnummer.",
  "Email address": "E-mailadres",
  "Phone number": "Telefoonnummer",
  "Home address": "Woonadres",
  "Exact location": "Exacte locatie",
  "Full name": "Volledige naam",
  "Social handles": "Sociale accounts",
  "Not shared": "Niet gedeeld",
  "DateHaja is 18+. We do not verify identity. Read exactly what we do and don't do in the":
    "DateHaja is voor 18+. We verifiëren geen identiteit. Lees precies wat we wel en niet doen in het",
  "Safety Center": "Veiligheidscentrum",
  "Your invitation is open": "Je uitnodiging staat open",
  "When are you free?": "Wanneer ben je vrij?",
  "That is still the only question we need answered.":
    "Dat is nog steeds de enige vraag waarop we antwoord nodig hebben.",
  "Plan my first date": "Plan mijn eerste date",
  "Let's date. We'll make the plan.":
    "Laten we daten. Wij maken het plan.",
  "Availability docket": "Beschikbaarheidsdossier",
  Sat: "Za",
  "AUG / SEOUL": "AUG / SEOUL",
  "Window submitted": "Tijdvak ingediend",
  "One quiet evening. Flexible on neighbourhood.":
    "Eén rustige avond. Flexibel over de buurt.",
  "Concierge instruction": "Instructie voor de conciërge",
  "Find someone thoughtful. Keep it easy to leave, easy to extend.":
    "Iemand die attent is. Makkelijk om af te ronden, makkelijk om te verlengen.",
  Ready: "Gereed",
  "Next: compatibility → venue research → private invite":
    "Hierna: compatibiliteit → locatieonderzoek → privé-uitnodiging",
  "New date plan": "Nieuw dateplan",
  "Preview / grounded live": "Voorbeeld / live onderbouwd",
  "Preview / localized example": "Voorbeeld / lokaal voorbeeld",
  Saturday: "Zaterdag",
  Area: "Buurt",
  "Proposed route": "Voorgestelde route",
  "Dinner · calm room · about ₩28,000":
    "Diner · rustige ruimte · ongeveer ₩28.000",
  "Dinner · calm room · about {amount}":
    "Diner · rustige ruimte · ongeveer {amount}",
  "Quiet dessert café": "Rustig dessertcafé",
  "Four minutes on foot · open late": "Vier minuten lopen · laat open",
  "Who you would meet": "Wie je zou ontmoeten",
  "Running / Films / Coffee": "Hardlopen / Films / Koffie",
  "You both prefer quieter first dates and share an interest in films and running.":
    "Jullie geven allebei de voorkeur aan rustige eerste dates en delen een interesse in films en hardlopen.",
  Estimate: "Schatting",
  person: "persoon",
  Pass: "Overslaan",
  Accept: "Accepteren",
  "DateHaja home": "DateHaja-home",
  "Concierge brief": "Conciergebrief",
  "Your free time is enough to begin.":
    "Je vrije tijd is genoeg om te beginnen.",
  "One free evening goes in. A real date comes out.":
    "Eén vrije avond erin. Een echte date eruit.",
  "Give us an evening. We handle compatibility, the place, the plan, and two private invitations.":
    "Geef ons een avond. Wij regelen de compatibiliteit, de plek, het plan en twee privé-uitnodigingen.",
  "Your contact details stay yours": "Je contactgegevens blijven van jou",
  "Every venue has a live source": "Elke locatie heeft een actuele bron",
  "Both people answer in private": "Beiden antwoorden privé",
  "New client / 01": "Nieuwe klant / 01",
  "Client return / 01": "Terugkerende klant / 01",
  "Open your account": "Open je account",
  "Welcome back": "Welkom terug",
  "Reserve your first evening.": "Reserveer je eerste avond.",
  "Your dates are this way.": "Je dates vind je hier.",
  "Two minutes of setup. After that, all we ask is when you're free.":
    "Twee minuten instellen. Daarna vragen we alleen wanneer je vrij bent.",
  "Sign in to review invitations, open evenings, and confirmed plans.":
    "Log in om uitnodigingen, vrije avonden en bevestigde plannen te bekijken.",
  Email: "E-mail",
  Password: "Wachtwoord",
  "At least 8 characters.": "Minstens 8 tekens.",
  "I'm 18 or over, and I understand DateHaja does not verify identity.":
    "Ik ben 18 jaar of ouder en begrijp dat DateHaja geen identiteit verifieert.",
  "Create my account": "Mijn account maken",
  "Already have an account?": "Heb je al een account?",
  "New here?": "Nieuw hier?",
  "Create an account": "Account maken",
  "Your email is used only by DateHaja Concierge to reach you. It is never shown to another user.":
    "Je e-mailadres wordt alleen door DateHaja Concierge gebruikt om je te bereiken en wordt nooit aan een andere gebruiker getoond.",
  "How privacy works": "Hoe privacy werkt",
  "DateHaja is for adults only — please confirm you're 18 or over.":
    "DateHaja is alleen voor volwassenen. Bevestig dat je 18 jaar of ouder bent.",
  "Use at least 8 characters.": "Gebruik minstens 8 tekens.",
  "That email is already registered. Try signing in instead.":
    "Dit e-mailadres is al geregistreerd. Probeer in te loggen.",
  "That email and password don't match.":
    "E-mailadres en wachtwoord komen niet overeen.",
  "Couldn't sign you in.": "Inloggen is mislukt.",
  closed: "gesloten",
  "{count} day left": "nog {count} dag",
  "{count} days left": "nog {count} dagen",
  "{count} hour left": "nog {count} uur",
  "{count} hours left": "nog {count} uur",
  "{count} min left": "nog {count} min",
});

Object.assign(sv, {
  "Private date concierge": "Privat dejtconcierge",
  "Public record": "Offentlig information",
  "Get started": "Kom igång",
  "Sign in": "Logga in",
  "Sign out": "Logga ut",
  Privacy: "Integritet",
  Safety: "Säkerhet",
  Home: "Hem",
  When: "När",
  History: "Historik",
  You: "Du",
  Main: "Huvudmeny",
  Notifications: "Aviseringar",
  "Notifications, {count} unread": "{count} olästa aviseringar",
  "Switch to light mode": "Byt till ljust läge",
  "Switch to dark mode": "Byt till mörkt läge",
  "Language and region": "Språk och region",
  Loading: "Läser in",
  "Service note 001 · Seoul": "Servicenotis 001 · Seoul",
  "Service note 001": "Servicenotis 001",
  "Bring us a free evening.": "Ge oss en ledig kväll.",
  "We'll return a date.": "Vi gör den till en dejt.",
  "No profiles to browse. No conversation to keep alive. DateHaja finds a compatible person, researches a real place, and sends one private invitation to each of you.":
    "Inga profiler att bläddra bland och inga samtal att hålla vid liv. DateHaja hittar en kompatibel person, undersöker en verklig plats och skickar en privat inbjudan till var och en av er.",
  "Open an evening": "Öppna en kväll",
  "Read the two-minute brief": "Läs tvåminutersguiden",
  "No swiping": "Inget swipande",
  "No chat audition": "Ingen chatt-audition",
  "No contacts shared": "Inga kontaktuppgifter delas",
  "The route": "Vägen",
  "Less matching.": "Mindre matchning.",
  "More meeting.": "Fler möten.",
  "We removed every step that exists only to keep you inside a dating app.":
    "Vi tog bort varje steg som bara finns för att hålla dig kvar i en dejtingapp.",
  "The usual route": "Den vanliga vägen",
  "Browse strangers": "Bläddra bland främlingar",
  "Swipe on a hunch": "Swipa på känsla",
  Match: "Matcha",
  "Perform small talk": "Hålla igång småprat",
  "Negotiate a plan": "Förhandla fram en plan",
  "Maybe meet": "Kanske träffas",
  "The DateHaja route": "DateHaja-vägen",
  "Say when you're free": "Säg när du är ledig",
  "Finding the person and the place": "Hitta personen och platsen",
  "Receive one considered plan": "Få en genomtänkt plan",
  "Both answer privately": "Båda svarar privat",
  "Meet in public": "Träffas offentligt",
  "What arrives": "Det som kommer",
  "A plan,": "En plan,",
  "not a profile.": "inte en profil.",
  "A date plan has a time, a public place, a budget, and one honest reason the two of you might enjoy it. Nothing to research. One decision to make.":
    "En dejtplan har en tid, en offentlig plats, en budget och en ärlig anledning till att ni kan trivas ihop. Inget att undersöka. Ett beslut.",
  "Places researched on the live web": "Platser undersökta på webben i realtid",
  "Sources and evidence attached": "Källor och belägg bifogade",
  "Constraints and budget respected": "Önskemål och budget respekteras",
  "Private by construction": "Privat från grunden",
  "The date arrives.": "Dejten kommer.",
  "Your details don't.": "Inte dina uppgifter.",
  "DateHaja Concierge sends every invitation separately. Before you both accept, your match gets a first name, age, neighbourhood, and a few interests — never your inbox or number.":
    "DateHaja Concierge skickar varje inbjudan separat. Innan ni båda accepterar ser din match bara förnamn, ålder, område och några intressen — aldrig din e-post eller ditt nummer.",
  "Email address": "E-postadress",
  "Phone number": "Telefonnummer",
  "Home address": "Hemadress",
  "Exact location": "Exakt plats",
  "Full name": "Fullständigt namn",
  "Social handles": "Sociala konton",
  "Not shared": "Delas inte",
  "DateHaja is 18+. We do not verify identity. Read exactly what we do and don't do in the":
    "DateHaja är för personer över 18 år. Vi verifierar inte identitet. Läs exakt vad vi gör och inte gör i vårt",
  "Safety Center": "Säkerhetscenter",
  "Your invitation is open": "Din inbjudan är öppen",
  "When are you free?": "När är du ledig?",
  "That is still the only question we need answered.":
    "Det är fortfarande den enda frågan vi behöver svar på.",
  "Plan my first date": "Planera min första dejt",
  "Let's date. We'll make the plan.":
    "Låt oss dejta. Vi fixar planen.",
  "Availability docket": "Tillgänglighetsakt",
  Sat: "Lör",
  "AUG / SEOUL": "AUG / SEOUL",
  "Window submitted": "Tidsfönster skickat",
  "One quiet evening. Flexible on neighbourhood.":
    "En lugn kväll. Flexibel med område.",
  "Concierge instruction": "Instruktion till concierge",
  "Find someone thoughtful. Keep it easy to leave, easy to extend.":
    "Någon omtänksam. Lätt att avsluta, lätt att förlänga.",
  Ready: "Klar",
  "Next: compatibility → venue research → private invite":
    "Nästa: kompatibilitet → platsresearch → privat inbjudan",
  "New date plan": "Ny dejtplan",
  "Preview / grounded live": "Förhandsvisning / livebelagd",
  "Preview / localized example": "Förhandsvisning / lokalt exempel",
  Saturday: "Lördag",
  Area: "Område",
  "Proposed route": "Föreslagen rutt",
  "Dinner · calm room · about ₩28,000": "Middag · lugn miljö · cirka ₩28 000",
  "Dinner · calm room · about {amount}": "Middag · lugn miljö · cirka {amount}",
  "Quiet dessert café": "Lugnt dessertkafé",
  "Four minutes on foot · open late": "Fyra minuter till fots · öppet sent",
  "Who you would meet": "Vem du skulle träffa",
  "Running / Films / Coffee": "Löpning / Film / Kaffe",
  "You both prefer quieter first dates and share an interest in films and running.":
    "Ni föredrar båda lugnare första dejter och delar intresset för film och löpning.",
  Estimate: "Uppskattning",
  person: "person",
  Pass: "Avstå",
  Accept: "Acceptera",
  "DateHaja home": "DateHaja hem",
  "Concierge brief": "Conciergeguide",
  "Your free time is enough to begin.": "Din lediga tid räcker för att börja.",
  "One free evening goes in. A real date comes out.":
    "En ledig kväll in. En riktig dejt ut.",
  "Give us an evening. We handle compatibility, the place, the plan, and two private invitations.":
    "Ge oss en kväll. Vi sköter kompatibiliteten, platsen, planen och två privata inbjudningar.",
  "Your contact details stay yours": "Dina kontaktuppgifter stannar hos dig",
  "Every venue has a live source": "Varje plats har en aktuell källa",
  "Both people answer in private": "Båda svarar privat",
  "New client / 01": "Ny kund / 01",
  "Client return / 01": "Återkommande kund / 01",
  "Open your account": "Öppna ditt konto",
  "Welcome back": "Välkommen tillbaka",
  "Reserve your first evening.": "Reservera din första kväll.",
  "Your dates are this way.": "Dina dejter finns här.",
  "Two minutes of setup. After that, all we ask is when you're free.":
    "Två minuters inställning. Sedan frågar vi bara när du är ledig.",
  "Sign in to review invitations, open evenings, and confirmed plans.":
    "Logga in för att se inbjudningar, lediga kvällar och bekräftade planer.",
  Email: "E-post",
  Password: "Lösenord",
  "At least 8 characters.": "Minst 8 tecken.",
  "I'm 18 or over, and I understand DateHaja does not verify identity.":
    "Jag är 18 år eller äldre och förstår att DateHaja inte verifierar identitet.",
  "Create my account": "Skapa mitt konto",
  "Already have an account?": "Har du redan ett konto?",
  "New here?": "Ny här?",
  "Create an account": "Skapa ett konto",
  "Your email is used only by DateHaja Concierge to reach you. It is never shown to another user.":
    "Din e-post används bara av DateHaja Concierge för att nå dig och visas aldrig för en annan användare.",
  "How privacy works": "Så fungerar integritet",
  "DateHaja is for adults only — please confirm you're 18 or over.":
    "DateHaja är endast för vuxna. Bekräfta att du är minst 18 år.",
  "Use at least 8 characters.": "Använd minst 8 tecken.",
  "That email is already registered. Try signing in instead.":
    "E-postadressen är redan registrerad. Försök logga in.",
  "That email and password don't match.":
    "E-postadress och lösenord stämmer inte.",
  "Couldn't sign you in.": "Det gick inte att logga in.",
  closed: "stängd",
  "{count} day left": "{count} dag kvar",
  "{count} days left": "{count} dagar kvar",
  "{count} hour left": "{count} timme kvar",
  "{count} hours left": "{count} timmar kvar",
  "{count} min left": "{count} min kvar",
});

Object.assign(ko, {
  "On it — we're looking now.": "알겠습니다. 지금 찾고 있어요.",
  "Your concierge desk": "나의 컨시어지 데스크",
  "Hi, {name}.": "안녕하세요, {name}님.",
  "Your dates": "나의 데이트",
  "Tell us when. We handle who & where.":
    "시간만 알려주세요. 사람과 장소는 저희가 맡을게요.",
  "Your next date": "다음 데이트",
  "Waiting on you": "답변을 기다리는 중",
  "Your date plan is ready": "데이트 계획이 도착했어요",
  "{count} date plans are ready": "데이트 계획 {count}개가 도착했어요",
  Confirmed: "확정",
  "It's a date": "데이트가 확정됐어요",
  "You said yes": "수락 완료",
  "Waiting on the other person": "상대방의 답변을 기다리는 중",
  "Your evening is held. If they pass, we look for someone else who fits the same plan rather than cancelling on you.":
    "저녁 시간은 확보해 두었습니다. 상대방이 거절하면 취소하지 않고 같은 계획에 맞는 다른 사람을 찾습니다.",
  "Coming up": "다가오는 일정",
  "Your availability": "가능 시간",
  "When you're free": "비어 있는 시간",
  Edit: "수정",
  "You've still got an evening open.": "아직 가능한 저녁이 하나 있어요.",
  "You've still got {count} evenings open.":
    "아직 가능한 저녁이 {count}개 있어요.",
  "Want another date?": "데이트를 하나 더 찾아볼까요?",
  "Find me a date": "데이트 찾아보기",
  "No open windows": "열린 시간이 없습니다",
  "Add an evening you're free and we'll start looking straight away.":
    "가능한 저녁을 추가하면 바로 찾아볼게요.",
  "Add availability": "가능 시간 추가",
  Open: "열림",
  Previously: "이전 기록",
  "See all": "전체 보기",
  "We only need one thing": "필요한 것은 하나뿐이에요",
  "Tell us when you're free. We'll find someone compatible, plan a real date, and send it to you both.":
    "가능한 시간을 알려주세요. 잘 맞는 사람과 실제 데이트를 계획해 두 사람에게 보내드립니다.",
  "You're free {date}.": "{date}에 시간이 있네요.",
  "You're free soon.": "곧 시간이 있네요.",
  "One window open. Ask us to look now, or add more times to widen the net.":
    "가능한 시간이 하나 있습니다. 지금 찾아보거나 시간을 더 추가해 선택지를 넓혀보세요.",
  "{count} windows open. We'll use whichever finds the best match first.":
    "가능한 시간이 {count}개 있습니다. 가장 잘 맞는 상대를 먼저 찾는 시간을 사용합니다.",
  "Add another time": "다른 시간 추가",
  "Working on it": "찾는 중",
  "We're planning your date.": "데이트를 계획하고 있어요.",
  "Checking who's free when you are": "같은 시간에 가능한 사람 확인",
  "Finding compatible people": "잘 맞는 사람 찾기",
  "Researching real date ideas": "실제 데이트 아이디어 조사",
  "Building your date plan": "데이트 계획 구성",
  "This usually takes under a minute. You can close this page — we'll email you the moment there's something to look at.":
    "보통 1분 안에 끝납니다. 이 페이지를 닫아도 괜찮아요. 확인할 내용이 생기면 바로 이메일로 알려드릴게요.",
});

Object.assign(ja, {
  "On it — we're looking now.": "承知しました。今探しています。",
  "Your concierge desk": "コンシェルジュデスク",
  "Hi, {name}.": "こんにちは、{name}さん。",
  "Your dates": "あなたのデート",
  "Tell us when. We handle who & where.":
    "時間だけ教えてください。相手と場所は私たちが担当します。",
  "Your next date": "次のデート",
  "Waiting on you": "あなたの回答待ち",
  "Your date plan is ready": "デートプランが届きました",
  "{count} date plans are ready": "デートプランが{count}件届きました",
  Confirmed: "確定",
  "It's a date": "デートが決まりました",
  "You said yes": "承諾済み",
  "Waiting on the other person": "相手の回答待ち",
  "Your evening is held. If they pass, we look for someone else who fits the same plan rather than cancelling on you.":
    "夜の予定は確保されています。相手が見送っても中止せず、同じプランに合う別の人を探します。",
  "Coming up": "今後の予定",
  "Your availability": "空き時間",
  "When you're free": "空いている時間",
  Edit: "編集",
  "You've still got an evening open.": "空いている夜がまだ一つあります。",
  "You've still got {count} evenings open.":
    "空いている夜がまだ{count}件あります。",
  "Want another date?": "もう一つデートを探しますか？",
  "Find me a date": "デートを探す",
  "No open windows": "空き時間がありません",
  "Add an evening you're free and we'll start looking straight away.":
    "空いている夜を追加すると、すぐに探し始めます。",
  "Add availability": "空き時間を追加",
  Open: "空き",
  Previously: "以前",
  "See all": "すべて見る",
  "We only need one thing": "必要なのは一つだけ",
  "Tell us when you're free. We'll find someone compatible, plan a real date, and send it to you both.":
    "空いている時間を教えてください。相性のよい人を探し、実際のデートを計画して二人に届けます。",
  "You're free {date}.": "{date}は空いています。",
  "You're free soon.": "もうすぐ空き時間があります。",
  "One window open. Ask us to look now, or add more times to widen the net.":
    "空き時間が一つあります。今すぐ探すか、時間を追加して選択肢を広げましょう。",
  "{count} windows open. We'll use whichever finds the best match first.":
    "空き時間が{count}件あります。最もよい相手が先に見つかる時間を使います。",
  "Add another time": "別の時間を追加",
  "Working on it": "対応中",
  "We're planning your date.": "あなたのデートを計画しています。",
  "Checking who's free when you are": "同じ時間に空いている人を確認",
  "Finding compatible people": "相性のよい人を検索",
  "Researching real date ideas": "実際のデート案を調査",
  "Building your date plan": "デートプランを作成",
  "This usually takes under a minute. You can close this page — we'll email you the moment there's something to look at.":
    "通常1分以内に完了します。このページを閉じても大丈夫です。確認できる内容ができたらすぐメールします。",
});

Object.assign(de, {
  "On it — we're looking now.": "Alles klar — wir suchen jetzt.",
  "Your concierge desk": "Dein Concierge-Schreibtisch",
  "Hi, {name}.": "Hallo, {name}.",
  "Your dates": "Deine Dates",
  "Tell us when. We handle who & where.":
    "Sag uns wann. Wir kümmern uns um Person und Ort.",
  "Your next date": "Dein nächstes Date",
  "Waiting on you": "Wartet auf dich",
  "Your date plan is ready": "Dein Date-Plan ist bereit",
  "{count} date plans are ready": "{count} Date-Pläne sind bereit",
  Confirmed: "Bestätigt",
  "It's a date": "Das Date steht",
  "You said yes": "Du hast zugesagt",
  "Waiting on the other person": "Warten auf die andere Person",
  "Your evening is held. If they pass, we look for someone else who fits the same plan rather than cancelling on you.":
    "Dein Abend bleibt reserviert. Sagt die andere Person ab, suchen wir jemanden, der zum selben Plan passt, statt dir abzusagen.",
  "Coming up": "Demnächst",
  "Your availability": "Deine Verfügbarkeit",
  "When you're free": "Wann du Zeit hast",
  Edit: "Bearbeiten",
  "You've still got an evening open.": "Du hast noch einen freien Abend.",
  "You've still got {count} evenings open.":
    "Du hast noch {count} freie Abende.",
  "Want another date?": "Noch ein Date?",
  "Find me a date": "Ein Date finden",
  "No open windows": "Keine freien Zeitfenster",
  "Add an evening you're free and we'll start looking straight away.":
    "Füge einen freien Abend hinzu und wir suchen sofort.",
  "Add availability": "Verfügbarkeit hinzufügen",
  Open: "Offen",
  Previously: "Bisher",
  "See all": "Alle ansehen",
  "We only need one thing": "Wir brauchen nur eine Sache",
  "Tell us when you're free. We'll find someone compatible, plan a real date, and send it to you both.":
    "Sag uns, wann du Zeit hast. Wir finden eine passende Person, planen ein echtes Date und senden es euch beiden.",
  "You're free {date}.": "Du hast am {date} Zeit.",
  "You're free soon.": "Du hast bald Zeit.",
  "One window open. Ask us to look now, or add more times to widen the net.":
    "Ein Zeitfenster ist offen. Lass uns jetzt suchen oder füge weitere Zeiten hinzu.",
  "{count} windows open. We'll use whichever finds the best match first.":
    "{count} Zeitfenster sind offen. Wir nutzen das, das zuerst den besten Match findet.",
  "Add another time": "Weitere Zeit hinzufügen",
  "Working on it": "Wir arbeiten daran",
  "We're planning your date.": "Wir planen dein Date.",
  "Checking who's free when you are": "Prüfen, wer gleichzeitig Zeit hat",
  "Finding compatible people": "Passende Menschen finden",
  "Researching real date ideas": "Echte Date-Ideen recherchieren",
  "Building your date plan": "Deinen Date-Plan erstellen",
  "This usually takes under a minute. You can close this page — we'll email you the moment there's something to look at.":
    "Das dauert meist weniger als eine Minute. Du kannst die Seite schließen — wir mailen dir, sobald es etwas zu sehen gibt.",
});

Object.assign(fr, {
  "On it — we're looking now.": "C'est parti — nous cherchons maintenant.",
  "Your concierge desk": "Votre bureau de conciergerie",
  "Hi, {name}.": "Bonjour, {name}.",
  "Your dates": "Vos rendez-vous",
  "Tell us when. We handle who & where.":
    "Dites-nous quand. Nous gérons la personne et le lieu.",
  "Your next date": "Votre prochain rendez-vous",
  "Waiting on you": "En attente de votre réponse",
  "Your date plan is ready": "Votre projet de rendez-vous est prêt",
  "{count} date plans are ready": "{count} projets de rendez-vous sont prêts",
  Confirmed: "Confirmé",
  "It's a date": "Le rendez-vous est confirmé",
  "You said yes": "Vous avez accepté",
  "Waiting on the other person": "En attente de l'autre personne",
  "Your evening is held. If they pass, we look for someone else who fits the same plan rather than cancelling on you.":
    "Votre soirée reste réservée. Si l'autre personne refuse, nous cherchons quelqu'un d'autre adapté au même programme au lieu d'annuler.",
  "Coming up": "À venir",
  "Your availability": "Vos disponibilités",
  "When you're free": "Quand vous êtes libre",
  Edit: "Modifier",
  "You've still got an evening open.": "Il vous reste une soirée libre.",
  "You've still got {count} evenings open.":
    "Il vous reste {count} soirées libres.",
  "Want another date?": "Un autre rendez-vous ?",
  "Find me a date": "Trouver un rendez-vous",
  "No open windows": "Aucun créneau libre",
  "Add an evening you're free and we'll start looking straight away.":
    "Ajoutez une soirée libre et nous chercherons immédiatement.",
  "Add availability": "Ajouter une disponibilité",
  Open: "Libre",
  Previously: "Précédemment",
  "See all": "Tout voir",
  "We only need one thing": "Il nous faut une seule chose",
  "Tell us when you're free. We'll find someone compatible, plan a real date, and send it to you both.":
    "Dites-nous quand vous êtes libre. Nous trouverons une personne compatible, préparerons un vrai rendez-vous et vous l'enverrons à tous les deux.",
  "You're free {date}.": "Vous êtes libre {date}.",
  "You're free soon.": "Vous êtes bientôt libre.",
  "One window open. Ask us to look now, or add more times to widen the net.":
    "Un créneau est libre. Lancez la recherche ou ajoutez d'autres horaires pour élargir les possibilités.",
  "{count} windows open. We'll use whichever finds the best match first.":
    "{count} créneaux sont libres. Nous utiliserons celui qui trouve d'abord la meilleure compatibilité.",
  "Add another time": "Ajouter un autre horaire",
  "Working on it": "Recherche en cours",
  "We're planning your date.": "Nous préparons votre rendez-vous.",
  "Checking who's free when you are":
    "Vérification des disponibilités communes",
  "Finding compatible people": "Recherche de personnes compatibles",
  "Researching real date ideas": "Recherche d'idées de rendez-vous réelles",
  "Building your date plan": "Création de votre rendez-vous",
  "This usually takes under a minute. You can close this page — we'll email you the moment there's something to look at.":
    "Cela prend généralement moins d'une minute. Vous pouvez fermer cette page — nous vous écrirons dès qu'il y aura quelque chose à voir.",
});

Object.assign(nl, {
  "On it — we're looking now.": "Begrepen — we zoeken nu.",
  "Your concierge desk": "Je conciergebalie",
  "Hi, {name}.": "Hoi, {name}.",
  "Your dates": "Je dates",
  "Tell us when. We handle who & where.":
    "Zeg ons wanneer. Wij regelen wie en waar.",
  "Your next date": "Je volgende date",
  "Waiting on you": "Wacht op jou",
  "Your date plan is ready": "Je dateplan staat klaar",
  "{count} date plans are ready": "{count} dateplannen staan klaar",
  Confirmed: "Bevestigd",
  "It's a date": "De date staat",
  "You said yes": "Je hebt ja gezegd",
  "Waiting on the other person": "Wachten op de andere persoon",
  "Your evening is held. If they pass, we look for someone else who fits the same plan rather than cancelling on you.":
    "Je avond blijft gereserveerd. Als de ander afzegt, zoeken we iemand die bij hetzelfde plan past in plaats van jou te annuleren.",
  "Coming up": "Binnenkort",
  "Your availability": "Je beschikbaarheid",
  "When you're free": "Wanneer je vrij bent",
  Edit: "Bewerken",
  "You've still got an evening open.": "Je hebt nog een vrije avond.",
  "You've still got {count} evenings open.":
    "Je hebt nog {count} vrije avonden.",
  "Want another date?": "Nog een date?",
  "Find me a date": "Vind een date",
  "No open windows": "Geen vrije tijdvakken",
  "Add an evening you're free and we'll start looking straight away.":
    "Voeg een vrije avond toe en we beginnen meteen met zoeken.",
  "Add availability": "Beschikbaarheid toevoegen",
  Open: "Open",
  Previously: "Eerder",
  "See all": "Alles bekijken",
  "We only need one thing": "We hebben maar één ding nodig",
  "Tell us when you're free. We'll find someone compatible, plan a real date, and send it to you both.":
    "Zeg wanneer je vrij bent. We vinden iemand die bij je past, plannen een echte date en sturen die naar jullie allebei.",
  "You're free {date}.": "Je bent vrij op {date}.",
  "You're free soon.": "Je bent binnenkort vrij.",
  "One window open. Ask us to look now, or add more times to widen the net.":
    "Eén tijdvak is open. Laat ons nu zoeken of voeg meer tijden toe.",
  "{count} windows open. We'll use whichever finds the best match first.":
    "{count} tijdvakken zijn open. We gebruiken het tijdvak dat als eerste de beste match vindt.",
  "Add another time": "Nog een tijd toevoegen",
  "Working on it": "We zijn bezig",
  "We're planning your date.": "We plannen je date.",
  "Checking who's free when you are": "Controleren wie tegelijk vrij is",
  "Finding compatible people": "Compatibele mensen zoeken",
  "Researching real date ideas": "Echte date-ideeën onderzoeken",
  "Building your date plan": "Je dateplan samenstellen",
  "This usually takes under a minute. You can close this page — we'll email you the moment there's something to look at.":
    "Dit duurt meestal minder dan een minuut. Je kunt deze pagina sluiten — we mailen zodra er iets te bekijken is.",
});

Object.assign(sv, {
  "On it — we're looking now.": "Absolut — vi letar nu.",
  "Your concierge desk": "Ditt conciergebord",
  "Hi, {name}.": "Hej, {name}.",
  "Your dates": "Dina dejter",
  "Tell us when. We handle who & where.": "Säg när. Vi ordnar vem och var.",
  "Your next date": "Din nästa dejt",
  "Waiting on you": "Väntar på dig",
  "Your date plan is ready": "Din dejtplan är klar",
  "{count} date plans are ready": "{count} dejtplaner är klara",
  Confirmed: "Bekräftad",
  "It's a date": "Dejten är klar",
  "You said yes": "Du har tackat ja",
  "Waiting on the other person": "Väntar på den andra personen",
  "Your evening is held. If they pass, we look for someone else who fits the same plan rather than cancelling on you.":
    "Din kväll hålls reserverad. Om den andra avstår söker vi någon annan som passar samma plan i stället för att ställa in för dig.",
  "Coming up": "På gång",
  "Your availability": "Din tillgänglighet",
  "When you're free": "När du är ledig",
  Edit: "Redigera",
  "You've still got an evening open.": "Du har fortfarande en ledig kväll.",
  "You've still got {count} evenings open.":
    "Du har fortfarande {count} lediga kvällar.",
  "Want another date?": "Vill du ha en dejt till?",
  "Find me a date": "Hitta en dejt",
  "No open windows": "Inga lediga tidsfönster",
  "Add an evening you're free and we'll start looking straight away.":
    "Lägg till en ledig kväll så börjar vi leta direkt.",
  "Add availability": "Lägg till tillgänglighet",
  Open: "Öppen",
  Previously: "Tidigare",
  "See all": "Visa alla",
  "We only need one thing": "Vi behöver bara en sak",
  "Tell us when you're free. We'll find someone compatible, plan a real date, and send it to you both.":
    "Säg när du är ledig. Vi hittar någon kompatibel, planerar en riktig dejt och skickar den till er båda.",
  "You're free {date}.": "Du är ledig {date}.",
  "You're free soon.": "Du är snart ledig.",
  "One window open. Ask us to look now, or add more times to widen the net.":
    "Ett tidsfönster är öppet. Be oss leta nu eller lägg till fler tider.",
  "{count} windows open. We'll use whichever finds the best match first.":
    "{count} tidsfönster är öppna. Vi använder det som först hittar den bästa matchningen.",
  "Add another time": "Lägg till en tid",
  "Working on it": "Vi arbetar på det",
  "We're planning your date.": "Vi planerar din dejt.",
  "Checking who's free when you are": "Kontrollerar vem som är ledig samtidigt",
  "Finding compatible people": "Hittar kompatibla personer",
  "Researching real date ideas": "Undersöker riktiga dejtidéer",
  "Building your date plan": "Bygger din dejtplan",
  "This usually takes under a minute. You can close this page — we'll email you the moment there's something to look at.":
    "Det tar oftast mindre än en minut. Du kan stänga sidan — vi mejlar så snart det finns något att titta på.",
});

Object.assign(ko, {
  "Demo profile": "데모 프로필",
  "This is the only thing DateHaja ever asks of you. The more windows you leave open, the better the match we can find.":
    "DateHaja가 묻는 것은 이것뿐입니다. 가능한 시간을 더 열어둘수록 더 잘 맞는 상대를 찾을 수 있어요.",
  "How we use this": "이 정보를 사용하는 방식",
  "We only match you with someone whose window genuinely overlaps yours by at least 90 minutes — enough time for a real date, not a coffee you'd rush. Nobody sees your calendar.":
    "최소 90분 이상 실제로 시간이 겹치는 사람만 연결합니다. 서두르는 커피가 아니라 제대로 된 데이트를 위한 시간이며, 누구도 당신의 캘린더를 볼 수 없습니다.",
  "Every date plan you've been part of — accepted, passed, expired or done.":
    "수락, 거절, 만료, 완료를 포함해 참여했던 모든 데이트 계획입니다.",
  Past: "지난 일정",
  "Nothing here yet": "아직 기록이 없어요",
  "Your first date plan will show up here once you've responded to it.":
    "첫 데이트 계획에 답하면 여기에 표시됩니다.",
  "Everything DateHaja has told you, newest first.":
    "DateHaja가 전한 모든 소식을 최신순으로 보여드립니다.",
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
  "Demo profile": "デモプロフィール",
  "This is the only thing DateHaja ever asks of you. The more windows you leave open, the better the match we can find.":
    "DateHajaが尋ねるのはこれだけです。空き時間を多く登録するほど、よりよい相手を見つけやすくなります。",
  "How we use this": "この情報の使い方",
  "We only match you with someone whose window genuinely overlaps yours by at least 90 minutes — enough time for a real date, not a coffee you'd rush. Nobody sees your calendar.":
    "実際に90分以上予定が重なる人とのみマッチします。慌ただしいコーヒーではなく、きちんとしたデートのための時間です。カレンダーは誰にも見えません。",
  "Every date plan you've been part of — accepted, passed, expired or done.":
    "承諾、見送り、期限切れ、完了を含む、参加したすべてのデートプランです。",
  Past: "過去",
  "Nothing here yet": "まだ何もありません",
  "Your first date plan will show up here once you've responded to it.":
    "最初のデートプランに回答すると、ここに表示されます。",
  "Everything DateHaja has told you, newest first.":
    "DateHajaからのお知らせを新しい順に表示します。",
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
  "Demo profile": "Demo-Profil",
  "This is the only thing DateHaja ever asks of you. The more windows you leave open, the better the match we can find.":
    "Das ist alles, wonach DateHaja fragt. Je mehr Zeitfenster du offen lässt, desto besser können wir matchen.",
  "How we use this": "So nutzen wir das",
  "We only match you with someone whose window genuinely overlaps yours by at least 90 minutes — enough time for a real date, not a coffee you'd rush. Nobody sees your calendar.":
    "Wir matchen nur mit Personen, deren Zeitfenster sich mindestens 90 Minuten überschneidet — genug für ein echtes Date. Niemand sieht deinen Kalender.",
  "Every date plan you've been part of — accepted, passed, expired or done.":
    "Jeder Date-Plan, an dem du beteiligt warst — angenommen, abgelehnt, abgelaufen oder beendet.",
  Past: "Vergangen",
  "Nothing here yet": "Noch nichts hier",
  "Your first date plan will show up here once you've responded to it.":
    "Dein erster Date-Plan erscheint hier, sobald du darauf geantwortet hast.",
  "Everything DateHaja has told you, newest first.":
    "Alle Nachrichten von DateHaja, die neuesten zuerst.",
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
  "Demo profile": "Profil de démonstration",
  "This is the only thing DateHaja ever asks of you. The more windows you leave open, the better the match we can find.":
    "C'est la seule chose que DateHaja vous demande. Plus vous laissez de créneaux, meilleure sera la compatibilité trouvée.",
  "How we use this": "Comment nous l'utilisons",
  "We only match you with someone whose window genuinely overlaps yours by at least 90 minutes — enough time for a real date, not a coffee you'd rush. Nobody sees your calendar.":
    "Nous vous mettons uniquement en relation avec une personne dont le créneau chevauche le vôtre d'au moins 90 minutes — assez pour un vrai rendez-vous. Personne ne voit votre agenda.",
  "Every date plan you've been part of — accepted, passed, expired or done.":
    "Tous les rendez-vous auxquels vous avez participé — acceptés, refusés, expirés ou terminés.",
  Past: "Passé",
  "Nothing here yet": "Rien pour le moment",
  "Your first date plan will show up here once you've responded to it.":
    "Votre premier projet de rendez-vous apparaîtra ici après votre réponse.",
  "Everything DateHaja has told you, newest first.":
    "Tous les messages de DateHaja, du plus récent au plus ancien.",
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
  "Demo profile": "Demoprofiel",
  "This is the only thing DateHaja ever asks of you. The more windows you leave open, the better the match we can find.":
    "Dit is het enige wat DateHaja je vraagt. Hoe meer tijdvakken je openlaat, hoe beter de match die we kunnen vinden.",
  "How we use this": "Hoe we dit gebruiken",
  "We only match you with someone whose window genuinely overlaps yours by at least 90 minutes — enough time for a real date, not a coffee you'd rush. Nobody sees your calendar.":
    "We matchen je alleen met iemand van wie het tijdvak minstens 90 minuten met het jouwe overlapt — genoeg voor een echte date. Niemand ziet je agenda.",
  "Every date plan you've been part of — accepted, passed, expired or done.":
    "Elk dateplan waaraan je deelnam — geaccepteerd, overgeslagen, verlopen of afgerond.",
  Past: "Verleden",
  "Nothing here yet": "Hier staat nog niets",
  "Your first date plan will show up here once you've responded to it.":
    "Je eerste dateplan verschijnt hier zodra je erop hebt gereageerd.",
  "Everything DateHaja has told you, newest first.":
    "Alles wat DateHaja je heeft verteld, nieuwste eerst.",
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
  "Demo profile": "Demoprofil",
  "This is the only thing DateHaja ever asks of you. The more windows you leave open, the better the match we can find.":
    "Det här är det enda DateHaja frågar efter. Ju fler tidsfönster du lämnar öppna, desto bättre matchning kan vi hitta.",
  "How we use this": "Så använder vi detta",
  "We only match you with someone whose window genuinely overlaps yours by at least 90 minutes — enough time for a real date, not a coffee you'd rush. Nobody sees your calendar.":
    "Vi matchar dig bara med någon vars tid överlappar din med minst 90 minuter — tillräckligt för en riktig dejt. Ingen ser din kalender.",
  "Every date plan you've been part of — accepted, passed, expired or done.":
    "Varje dejtplan du deltagit i — accepterad, avstådd, utgången eller klar.",
  Past: "Tidigare",
  "Nothing here yet": "Inget här ännu",
  "Your first date plan will show up here once you've responded to it.":
    "Din första dejtplan visas här när du har svarat på den.",
  "Everything DateHaja has told you, newest first.":
    "Allt DateHaja har berättat för dig, nyast först.",
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
  "Onboarding progress": "가입 설정 진행 상황",
  Basics: "기본 정보",
  "About you": "나에 대해",
  "Who you're looking for": "찾고 있는 사람",
  "Your kind of date": "선호하는 데이트",
  Ready: "준비 완료",
  "The basics": "기본 정보",
  "When are you free?": "언제 시간이 비나요?",
  "You're ready.": "준비가 끝났어요.",
  "Just enough to know who to introduce you to.":
    "누구를 소개하면 좋을지 알 수 있을 만큼만 알려주세요.",
  "The parts we actually match on. Be specific rather than impressive.":
    "실제 매칭에 사용하는 정보입니다. 멋져 보이기보다 구체적으로 적어주세요.",
  "Mark the things that genuinely rule someone out — everything else we treat as a preference.":
    "정말 양보할 수 없는 조건만 표시하세요. 나머지는 선호로 반영합니다.",
  "This is what we hand to the research engine when it goes looking for places.":
    "장소를 조사할 때 이 정보를 기준으로 사용합니다.",
  "This is the one thing DateHaja asks of you, ever. Add a window or two.":
    "DateHaja가 부탁하는 유일한 일입니다. 가능한 시간을 한두 개 추가하세요.",
  "That's everything. We'll take it from here.":
    "모두 끝났습니다. 이제 저희가 맡을게요.",
  "What should we call you?": "어떻게 불러드릴까요?",
  "Matches only ever see your first name.": "상대방에게는 이름만 보입니다.",
  "Date of birth": "생년월일",
  "Used to check you're 18+ and to match age ranges. Never shown to anyone.":
    "만 18세 이상 확인과 연령대 매칭에만 사용하며 누구에게도 공개하지 않습니다.",
  "You must be 18 or over.": "만 18세 이상이어야 합니다.",
  "You'll appear as {age}.": "상대방에게 {age}세로 표시됩니다.",
  "You are": "성별",
  Woman: "여성",
  Man: "남성",
  "Non-binary": "논바이너리",
  "Something else": "기타",
  "Your gender": "나의 성별",
  Pronouns: "대명사",
  "You'd like to meet": "만나고 싶은 사람",
  "Pick everyone you'd be happy to be matched with.":
    "매칭되어도 좋은 대상을 모두 선택하세요.",
  "Who you'd like to meet": "만나고 싶은 대상",
  City: "도시",
  "Roughly where": "대략적인 지역",
  "Neighbourhood only — we never store or share your address.":
    "동네만 선택합니다. 주소는 저장하거나 공유하지 않습니다.",
  "Your neighbourhood": "나의 동네",
  "I confirm I'm 18 or over. DateHaja is an adults-only service.":
    "만 18세 이상이며 DateHaja가 성인 전용 서비스임을 확인합니다.",
  "You're ready for DateHaja.": "DateHaja를 시작할 준비가 됐어요.",
  "From here we do the work. When we find someone compatible who's free at the same time, we'll plan a real date and send it to you both.":
    "이제부터는 저희가 진행합니다. 같은 시간에 가능한 잘 맞는 사람을 찾으면 실제 데이트를 계획해 두 사람에게 보내드릴게요.",
  "Looking for": "찾는 대상",
  "Age range": "연령대",
  Interests: "관심사",
  Budget: "예산",
  "Demo profiles are on": "데모 프로필 사용 중",
  "This deployment includes clearly-marked fictional demo profiles so you can see the whole flow immediately. Turn them off any time in Settings.":
    "전체 흐름을 바로 확인할 수 있도록 명확히 표시된 가상 데모 프로필이 포함되어 있습니다. 설정에서 언제든 끌 수 있습니다.",
  Back: "뒤로",
  Continue: "계속",
  "We'll never match you outside this.":
    "이 조건을 벗어나서는 매칭하지 않습니다.",
  "We'll prefer this, but won't rule someone out for it.":
    "우선 반영하지만 이것만으로 제외하지는 않습니다.",
});
Object.assign(ja, {
  Brief: "ガイド",
  "Onboarding progress": "初期設定の進捗",
  Basics: "基本情報",
  "About you": "あなたについて",
  "Who you're looking for": "探している相手",
  "Your kind of date": "好みのデート",
  "The basics": "基本情報",
  "You're ready.": "準備ができました。",
  "Just enough to know who to introduce you to.":
    "誰をご紹介すればよいか分かる程度で十分です。",
  "The parts we actually match on. Be specific rather than impressive.":
    "実際のマッチングに使う項目です。よく見せるより具体的に。",
  "Mark the things that genuinely rule someone out — everything else we treat as a preference.":
    "本当に譲れない条件だけを指定してください。それ以外は希望として扱います。",
  "This is what we hand to the research engine when it goes looking for places.":
    "場所を探す際の調査条件として使います。",
  "This is the one thing DateHaja asks of you, ever. Add a window or two.":
    "DateHajaがお願いするのはこれだけです。空き時間を一つか二つ追加してください。",
  "That's everything. We'll take it from here.":
    "以上です。ここからは私たちにお任せください。",
  "What should we call you?": "何とお呼びすればよいですか？",
  "Matches only ever see your first name.": "相手に見えるのは名前だけです。",
  "Date of birth": "生年月日",
  "Used to check you're 18+ and to match age ranges. Never shown to anyone.":
    "18歳以上の確認と年齢範囲のマッチングにのみ使い、誰にも表示しません。",
  "You must be 18 or over.": "18歳以上である必要があります。",
  "You'll appear as {age}.": "相手には{age}歳と表示されます。",
  "You are": "性別",
  Woman: "女性",
  Man: "男性",
  "Non-binary": "ノンバイナリー",
  "Something else": "その他",
  "Your gender": "あなたの性別",
  Pronouns: "代名詞",
  "You'd like to meet": "会いたい相手",
  "Pick everyone you'd be happy to be matched with.":
    "マッチしてもよい相手をすべて選んでください。",
  "Who you'd like to meet": "会いたい相手",
  City: "都市",
  "Roughly where": "おおよそのエリア",
  "Neighbourhood only — we never store or share your address.":
    "地域だけを選びます。住所は保存も共有もしません。",
  "Your neighbourhood": "あなたの地域",
  "I confirm I'm 18 or over. DateHaja is an adults-only service.":
    "18歳以上で、DateHajaが成人向けサービスであることを確認します。",
  "You're ready for DateHaja.": "DateHajaの準備ができました。",
  "From here we do the work. When we find someone compatible who's free at the same time, we'll plan a real date and send it to you both.":
    "ここからは私たちが進めます。同じ時間に空いている相性のよい人を見つけたら、実際のデートを計画して二人に送ります。",
  "Looking for": "探している相手",
  "Age range": "年齢範囲",
  Interests: "興味",
  Budget: "予算",
  "Demo profiles are on": "デモプロフィールはオン",
  "This deployment includes clearly-marked fictional demo profiles so you can see the whole flow immediately. Turn them off any time in Settings.":
    "全体の流れをすぐ確認できるよう、明記された架空のデモプロフィールが含まれます。設定でいつでもオフにできます。",
  Back: "戻る",
  Continue: "続ける",
  "We'll never match you outside this.": "この条件外ではマッチしません。",
  "We'll prefer this, but won't rule someone out for it.":
    "優先しますが、この条件だけで除外はしません。",
});
Object.assign(de, {
  Brief: "Briefing",
  "Onboarding progress": "Fortschritt der Einrichtung",
  Basics: "Grundlagen",
  "About you": "Über dich",
  "Who you're looking for": "Wen du suchst",
  "Your kind of date": "Deine Art von Date",
  "The basics": "Die Grundlagen",
  "You're ready.": "Du bist bereit.",
  "Just enough to know who to introduce you to.":
    "Gerade genug, um zu wissen, wen wir dir vorstellen sollten.",
  "The parts we actually match on. Be specific rather than impressive.":
    "Darauf basiert das Matching. Sei konkret statt beeindruckend.",
  "Mark the things that genuinely rule someone out — everything else we treat as a preference.":
    "Markiere nur echte Ausschlusskriterien — alles andere behandeln wir als Vorliebe.",
  "This is what we hand to the research engine when it goes looking for places.":
    "Damit sucht unsere Recherche nach passenden Orten.",
  "This is the one thing DateHaja asks of you, ever. Add a window or two.":
    "Das ist alles, worum DateHaja dich bittet. Füge ein oder zwei Zeitfenster hinzu.",
  "That's everything. We'll take it from here.":
    "Das war alles. Ab hier übernehmen wir.",
  "What should we call you?": "Wie sollen wir dich nennen?",
  "Matches only ever see your first name.":
    "Matches sehen nur deinen Vornamen.",
  "Date of birth": "Geburtsdatum",
  "Used to check you're 18+ and to match age ranges. Never shown to anyone.":
    "Nur zur Altersprüfung und für Altersbereiche. Wird niemandem gezeigt.",
  "You must be 18 or over.": "Du musst mindestens 18 sein.",
  "You'll appear as {age}.": "Du wirst als {age} angezeigt.",
  "You are": "Du bist",
  Woman: "Frau",
  Man: "Mann",
  "Non-binary": "Nichtbinär",
  "Something else": "Etwas anderes",
  "Your gender": "Dein Geschlecht",
  Pronouns: "Pronomen",
  "You'd like to meet": "Du möchtest treffen",
  "Pick everyone you'd be happy to be matched with.":
    "Wähle alle, mit denen du gern gematcht würdest.",
  "Who you'd like to meet": "Wen du treffen möchtest",
  City: "Stadt",
  "Roughly where": "Ungefähre Gegend",
  "Neighbourhood only — we never store or share your address.":
    "Nur das Viertel — wir speichern oder teilen nie deine Adresse.",
  "Your neighbourhood": "Dein Viertel",
  "I confirm I'm 18 or over. DateHaja is an adults-only service.":
    "Ich bestätige, dass ich mindestens 18 bin. DateHaja ist nur für Erwachsene.",
  "You're ready for DateHaja.": "Du bist bereit für DateHaja.",
  "From here we do the work. When we find someone compatible who's free at the same time, we'll plan a real date and send it to you both.":
    "Ab hier übernehmen wir. Finden wir eine passende Person mit derselben freien Zeit, planen wir ein echtes Date und senden es euch beiden.",
  "Looking for": "Gesucht",
  "Age range": "Altersbereich",
  Interests: "Interessen",
  Budget: "Budget",
  "Demo profiles are on": "Demo-Profile sind aktiv",
  "This deployment includes clearly-marked fictional demo profiles so you can see the whole flow immediately. Turn them off any time in Settings.":
    "Diese Version enthält klar gekennzeichnete fiktive Demo-Profile. Du kannst sie jederzeit in den Einstellungen ausschalten.",
  Back: "Zurück",
  Continue: "Weiter",
  "We'll never match you outside this.": "Außerhalb davon matchen wir nie.",
  "We'll prefer this, but won't rule someone out for it.":
    "Wir bevorzugen es, schließen aber niemanden allein deshalb aus.",
});
Object.assign(fr, {
  Brief: "Brief",
  "Onboarding progress": "Progression de la configuration",
  Basics: "Essentiel",
  "About you": "À propos de vous",
  "Who you're looking for": "La personne recherchée",
  "Your kind of date": "Votre type de rendez-vous",
  "The basics": "L'essentiel",
  "You're ready.": "Vous êtes prêt.",
  "Just enough to know who to introduce you to.":
    "Juste assez pour savoir qui vous présenter.",
  "The parts we actually match on. Be specific rather than impressive.":
    "Les éléments réellement utilisés pour le matching. Soyez précis plutôt qu'impressionnant.",
  "Mark the things that genuinely rule someone out — everything else we treat as a preference.":
    "Indiquez uniquement les vrais critères d'exclusion — le reste sera traité comme une préférence.",
  "This is what we hand to the research engine when it goes looking for places.":
    "Ce sont les critères transmis au moteur lorsqu'il cherche des lieux.",
  "This is the one thing DateHaja asks of you, ever. Add a window or two.":
    "C'est la seule chose que DateHaja vous demande. Ajoutez un ou deux créneaux.",
  "That's everything. We'll take it from here.":
    "C'est tout. Nous prenons la suite.",
  "What should we call you?": "Comment devons-nous vous appeler ?",
  "Matches only ever see your first name.":
    "Les matchs ne voient que votre prénom.",
  "Date of birth": "Date de naissance",
  "Used to check you're 18+ and to match age ranges. Never shown to anyone.":
    "Utilisée pour vérifier vos 18 ans et les tranches d'âge. Jamais affichée.",
  "You must be 18 or over.": "Vous devez avoir au moins 18 ans.",
  "You'll appear as {age}.": "Vous apparaîtrez avec {age} ans.",
  "You are": "Vous êtes",
  Woman: "Femme",
  Man: "Homme",
  "Non-binary": "Non binaire",
  "Something else": "Autre",
  "Your gender": "Votre genre",
  Pronouns: "Pronoms",
  "You'd like to meet": "Vous souhaitez rencontrer",
  "Pick everyone you'd be happy to be matched with.":
    "Sélectionnez toutes les personnes avec lesquelles vous accepteriez un match.",
  "Who you'd like to meet": "Qui vous souhaitez rencontrer",
  City: "Ville",
  "Roughly where": "Dans quel secteur",
  "Neighbourhood only — we never store or share your address.":
    "Le quartier uniquement — nous ne stockons ni ne partageons votre adresse.",
  "Your neighbourhood": "Votre quartier",
  "I confirm I'm 18 or over. DateHaja is an adults-only service.":
    "Je confirme avoir au moins 18 ans. DateHaja est réservé aux adultes.",
  "You're ready for DateHaja.": "Vous êtes prêt pour DateHaja.",
  "From here we do the work. When we find someone compatible who's free at the same time, we'll plan a real date and send it to you both.":
    "À partir d'ici, nous travaillons. Quand nous trouvons une personne compatible libre au même moment, nous préparons un vrai rendez-vous et vous l'envoyons.",
  "Looking for": "Recherche",
  "Age range": "Tranche d'âge",
  Interests: "Centres d'intérêt",
  Budget: "Budget",
  "Demo profiles are on": "Profils de démonstration activés",
  "This deployment includes clearly-marked fictional demo profiles so you can see the whole flow immediately. Turn them off any time in Settings.":
    "Cette version contient des profils fictifs clairement identifiés pour montrer tout le parcours. Désactivez-les à tout moment dans les réglages.",
  Back: "Retour",
  Continue: "Continuer",
  "We'll never match you outside this.":
    "Nous ne vous proposerons jamais de match hors de ce critère.",
  "We'll prefer this, but won't rule someone out for it.":
    "Nous le privilégierons sans exclure quelqu'un pour ce seul motif.",
});
Object.assign(nl, {
  Brief: "Brief",
  "Onboarding progress": "Voortgang van instellen",
  Basics: "Basis",
  "About you": "Over jou",
  "Who you're looking for": "Wie je zoekt",
  "Your kind of date": "Jouw soort date",
  "The basics": "De basis",
  "You're ready.": "Je bent klaar.",
  "Just enough to know who to introduce you to.":
    "Net genoeg om te weten aan wie we je voorstellen.",
  "The parts we actually match on. Be specific rather than impressive.":
    "Hierop matchen we echt. Wees specifiek, niet indrukwekkend.",
  "Mark the things that genuinely rule someone out — everything else we treat as a preference.":
    "Markeer alleen echte uitsluitingscriteria — de rest behandelen we als voorkeur.",
  "This is what we hand to the research engine when it goes looking for places.":
    "Dit gebruiken we wanneer we naar locaties zoeken.",
  "This is the one thing DateHaja asks of you, ever. Add a window or two.":
    "Dit is het enige wat DateHaja van je vraagt. Voeg één of twee tijdvakken toe.",
  "That's everything. We'll take it from here.":
    "Dat was alles. Wij nemen het vanaf hier over.",
  "What should we call you?": "Hoe mogen we je noemen?",
  "Matches only ever see your first name.": "Matches zien alleen je voornaam.",
  "Date of birth": "Geboortedatum",
  "Used to check you're 18+ and to match age ranges. Never shown to anyone.":
    "Alleen gebruikt voor de 18+-controle en leeftijdsbereiken. Nooit zichtbaar.",
  "You must be 18 or over.": "Je moet 18 jaar of ouder zijn.",
  "You'll appear as {age}.": "Je wordt weergegeven als {age}.",
  "You are": "Jij bent",
  Woman: "Vrouw",
  Man: "Man",
  "Non-binary": "Non-binair",
  "Something else": "Iets anders",
  "Your gender": "Je gender",
  Pronouns: "Voornaamwoorden",
  "You'd like to meet": "Je wilt ontmoeten",
  "Pick everyone you'd be happy to be matched with.":
    "Selecteer iedereen met wie je graag gematcht wordt.",
  "Who you'd like to meet": "Wie je wilt ontmoeten",
  City: "Stad",
  "Roughly where": "Ongeveer waar",
  "Neighbourhood only — we never store or share your address.":
    "Alleen de buurt — we bewaren of delen je adres nooit.",
  "Your neighbourhood": "Je buurt",
  "I confirm I'm 18 or over. DateHaja is an adults-only service.":
    "Ik bevestig dat ik 18 jaar of ouder ben. DateHaja is alleen voor volwassenen.",
  "You're ready for DateHaja.": "Je bent klaar voor DateHaja.",
  "From here we do the work. When we find someone compatible who's free at the same time, we'll plan a real date and send it to you both.":
    "Vanaf hier doen wij het werk. Als we iemand vinden die past en tegelijk vrij is, plannen we een echte date en sturen die naar jullie beiden.",
  "Looking for": "Op zoek naar",
  "Age range": "Leeftijdsbereik",
  Interests: "Interesses",
  Budget: "Budget",
  "Demo profiles are on": "Demoprofielen staan aan",
  "This deployment includes clearly-marked fictional demo profiles so you can see the whole flow immediately. Turn them off any time in Settings.":
    "Deze versie bevat duidelijk gemarkeerde fictieve demoprofielen zodat je direct de hele flow kunt zien. Zet ze uit in Instellingen.",
  Back: "Terug",
  Continue: "Doorgaan",
  "We'll never match you outside this.":
    "We matchen je nooit buiten dit criterium.",
  "We'll prefer this, but won't rule someone out for it.":
    "We geven hier voorkeur aan, maar sluiten niemand er alleen om uit.",
});
Object.assign(sv, {
  Brief: "Guide",
  "Onboarding progress": "Förlopp för inställning",
  Basics: "Grunder",
  "About you": "Om dig",
  "Who you're looking for": "Vem du söker",
  "Your kind of date": "Din typ av dejt",
  "The basics": "Grunderna",
  "You're ready.": "Du är klar.",
  "Just enough to know who to introduce you to.":
    "Precis tillräckligt för att veta vem vi ska presentera dig för.",
  "The parts we actually match on. Be specific rather than impressive.":
    "Det här matchar vi faktiskt på. Var specifik i stället för imponerande.",
  "Mark the things that genuinely rule someone out — everything else we treat as a preference.":
    "Markera bara verkliga krav — allt annat behandlar vi som önskemål.",
  "This is what we hand to the research engine when it goes looking for places.":
    "Det här använder vi när vi söker efter platser.",
  "This is the one thing DateHaja asks of you, ever. Add a window or two.":
    "Det här är det enda DateHaja ber dig om. Lägg till ett eller två tidsfönster.",
  "That's everything. We'll take it from here.":
    "Det var allt. Vi tar över härifrån.",
  "What should we call you?": "Vad ska vi kalla dig?",
  "Matches only ever see your first name.": "Matcher ser bara ditt förnamn.",
  "Date of birth": "Födelsedatum",
  "Used to check you're 18+ and to match age ranges. Never shown to anyone.":
    "Används för 18+-kontroll och åldersintervall. Visas aldrig för någon.",
  "You must be 18 or over.": "Du måste vara minst 18 år.",
  "You'll appear as {age}.": "Du visas som {age} år.",
  "You are": "Du är",
  Woman: "Kvinna",
  Man: "Man",
  "Non-binary": "Ickebinär",
  "Something else": "Något annat",
  "Your gender": "Ditt kön",
  Pronouns: "Pronomen",
  "You'd like to meet": "Du vill träffa",
  "Pick everyone you'd be happy to be matched with.":
    "Välj alla du gärna skulle matchas med.",
  "Who you'd like to meet": "Vem du vill träffa",
  City: "Stad",
  "Roughly where": "Ungefär var",
  "Neighbourhood only — we never store or share your address.":
    "Endast område — vi lagrar eller delar aldrig din adress.",
  "Your neighbourhood": "Ditt område",
  "I confirm I'm 18 or over. DateHaja is an adults-only service.":
    "Jag bekräftar att jag är minst 18 år. DateHaja är endast för vuxna.",
  "You're ready for DateHaja.": "Du är redo för DateHaja.",
  "From here we do the work. When we find someone compatible who's free at the same time, we'll plan a real date and send it to you both.":
    "Härifrån gör vi jobbet. När vi hittar någon kompatibel som är ledig samtidigt planerar vi en riktig dejt och skickar den till er båda.",
  "Looking for": "Söker",
  "Age range": "Åldersintervall",
  Interests: "Intressen",
  Budget: "Budget",
  "Demo profiles are on": "Demoprofiler är aktiva",
  "This deployment includes clearly-marked fictional demo profiles so you can see the whole flow immediately. Turn them off any time in Settings.":
    "Den här versionen innehåller tydligt märkta fiktiva demoprofiler så att du kan se hela flödet direkt. Stäng av dem i Inställningar.",
  Back: "Tillbaka",
  Continue: "Fortsätt",
  "We'll never match you outside this.": "Vi matchar dig aldrig utanför detta.",
  "We'll prefer this, but won't rule someone out for it.":
    "Vi föredrar detta men utesluter inte någon enbart därför.",
});

Object.assign(ko, {
  "Added to your availability.": "가능 시간에 추가했습니다.",
  Day: "날짜",
  "When, roughly": "대략적인 시간",
  Evening: "저녁",
  Afternoon: "오후",
  Late: "늦은 시간",
  "All day": "하루 종일",
  Custom: "직접 설정",
  From: "시작",
  Until: "종료",
  "Times are local to {zone}. We need at least 90 minutes to plan something worth going to.":
    "시간은 {zone} 현지 기준입니다. 충분한 데이트를 계획하려면 최소 90분이 필요합니다.",
  Add: "추가",
  "Nothing on the calendar yet": "아직 일정이 없어요",
  "Add one evening you're free. That's genuinely all we need to start looking.":
    "가능한 저녁을 하나 추가하세요. 찾기 시작하는 데 정말 그것만 필요합니다.",
  "Remove this window": "이 시간 삭제",
  "A held window means a date plan is in progress. Booked means the date is confirmed — cancel the date if you can't make it.":
    "보류된 시간은 DateHaja를 진행 중이라는 뜻입니다. 예약됨은 데이트가 확정된 상태이므로 참석할 수 없다면 데이트를 취소하세요.",
  Held: "보류",
  Booked: "예약됨",
});
Object.assign(ja, {
  "Added to your availability.": "空き時間に追加しました。",
  Day: "日付",
  "When, roughly": "おおよその時間",
  Evening: "夕方",
  Afternoon: "午後",
  Late: "遅い時間",
  "All day": "終日",
  Custom: "カスタム",
  From: "開始",
  Until: "終了",
  "Times are local to {zone}. We need at least 90 minutes to plan something worth going to.":
    "時刻は{zone}の現地時間です。価値のあるデートには最低90分必要です。",
  Add: "追加",
  "Nothing on the calendar yet": "予定はまだありません",
  "Add one evening you're free. That's genuinely all we need to start looking.":
    "空いている夜を一つ追加してください。探し始めるために必要なのは本当にそれだけです。",
  "Remove this window": "この時間を削除",
  "A held window means a date plan is in progress. Booked means the date is confirmed — cancel the date if you can't make it.":
    "保留はDateHajaが進行中、予約済みはデート確定を意味します。参加できない場合はデートをキャンセルしてください。",
  Held: "保留",
  Booked: "予約済み",
});
Object.assign(de, {
  "Added to your availability.": "Zur Verfügbarkeit hinzugefügt.",
  Day: "Tag",
  "When, roughly": "Ungefähr wann",
  Evening: "Abend",
  Afternoon: "Nachmittag",
  Late: "Spät",
  "All day": "Ganztägig",
  Custom: "Eigene Zeit",
  From: "Von",
  Until: "Bis",
  "Times are local to {zone}. We need at least 90 minutes to plan something worth going to.":
    "Die Zeiten gelten lokal für {zone}. Für ein lohnendes Date brauchen wir mindestens 90 Minuten.",
  Add: "Hinzufügen",
  "Nothing on the calendar yet": "Noch nichts im Kalender",
  "Add one evening you're free. That's genuinely all we need to start looking.":
    "Füge einen freien Abend hinzu. Mehr brauchen wir wirklich nicht, um zu suchen.",
  "Remove this window": "Dieses Zeitfenster entfernen",
  "A held window means a date plan is in progress. Booked means the date is confirmed — cancel the date if you can't make it.":
    "Ein reserviertes Zeitfenster bedeutet, dass ein DateHaja läuft. Gebucht heißt bestätigt — sage das Date ab, wenn du nicht kannst.",
  Held: "Reserviert",
  Booked: "Gebucht",
});
Object.assign(fr, {
  "Added to your availability.": "Ajouté à vos disponibilités.",
  Day: "Jour",
  "When, roughly": "À peu près quand",
  Evening: "Soirée",
  Afternoon: "Après-midi",
  Late: "Tard",
  "All day": "Toute la journée",
  Custom: "Personnalisé",
  From: "De",
  Until: "À",
  "Times are local to {zone}. We need at least 90 minutes to plan something worth going to.":
    "Les horaires sont ceux de {zone}. Il nous faut au moins 90 minutes pour préparer un rendez-vous qui en vaut la peine.",
  Add: "Ajouter",
  "Nothing on the calendar yet": "Rien dans l'agenda",
  "Add one evening you're free. That's genuinely all we need to start looking.":
    "Ajoutez une soirée libre. C'est vraiment tout ce qu'il nous faut pour commencer.",
  "Remove this window": "Supprimer ce créneau",
  "A held window means a date plan is in progress. Booked means the date is confirmed — cancel the date if you can't make it.":
    "Un créneau retenu signifie qu'un DateHaja est en cours. Réservé signifie que le rendez-vous est confirmé — annulez si vous ne pouvez pas venir.",
  Held: "Retenu",
  Booked: "Réservé",
});
Object.assign(nl, {
  "Added to your availability.": "Toegevoegd aan je beschikbaarheid.",
  Day: "Dag",
  "When, roughly": "Ongeveer wanneer",
  Evening: "Avond",
  Afternoon: "Middag",
  Late: "Laat",
  "All day": "Hele dag",
  Custom: "Aangepast",
  From: "Van",
  Until: "Tot",
  "Times are local to {zone}. We need at least 90 minutes to plan something worth going to.":
    "Tijden zijn lokaal voor {zone}. We hebben minstens 90 minuten nodig voor een date die de moeite waard is.",
  Add: "Toevoegen",
  "Nothing on the calendar yet": "Nog niets in de agenda",
  "Add one evening you're free. That's genuinely all we need to start looking.":
    "Voeg één vrije avond toe. Dat is echt alles wat we nodig hebben om te beginnen.",
  "Remove this window": "Dit tijdvak verwijderen",
  "A held window means a date plan is in progress. Booked means the date is confirmed — cancel the date if you can't make it.":
    "Een vastgehouden tijdvak betekent dat een DateHaja onderweg is. Geboekt betekent bevestigd — annuleer als je niet kunt.",
  Held: "Vastgehouden",
  Booked: "Geboekt",
});
Object.assign(sv, {
  "Added to your availability.": "Tillagt i din tillgänglighet.",
  Day: "Dag",
  "When, roughly": "Ungefär när",
  Evening: "Kväll",
  Afternoon: "Eftermiddag",
  Late: "Sent",
  "All day": "Hela dagen",
  Custom: "Egen tid",
  From: "Från",
  Until: "Till",
  "Times are local to {zone}. We need at least 90 minutes to plan something worth going to.":
    "Tiderna är lokala för {zone}. Vi behöver minst 90 minuter för att planera något värt att gå på.",
  Add: "Lägg till",
  "Nothing on the calendar yet": "Inget i kalendern ännu",
  "Add one evening you're free. That's genuinely all we need to start looking.":
    "Lägg till en kväll du är ledig. Det är verkligen allt vi behöver för att börja.",
  "Remove this window": "Ta bort tidsfönstret",
  "A held window means a date plan is in progress. Booked means the date is confirmed — cancel the date if you can't make it.":
    "Ett reserverat tidsfönster betyder att en DateHaja pågår. Bokad betyder att dejten är bekräftad — avboka om du inte kan komma.",
  Held: "Reserverad",
  Booked: "Bokad",
});

Object.assign(ko, {
  "Public record · Privacy": "공개 안내서 · 개인정보",
  "DateHaja's whole promise is that you can meet someone without handing over anything you'd rather keep. Here is exactly what that means.":
    "DateHaja는 지키고 싶은 정보를 넘기지 않고도 누군가를 만날 수 있도록 설계했습니다. 그 의미를 정확히 설명합니다.",
  "Sign in to see your own profile exactly as a match would.":
    "로그인하면 상대방에게 보이는 내 프로필을 그대로 확인할 수 있습니다.",
  "Before you both accept": "두 사람 모두 수락하기 전",
  "What a match sees": "상대방에게 보이는 정보",
  "After you both accept": "두 사람 모두 수락한 후",
  "What gets added": "추가로 공개되는 정보",
  Never: "절대",
  "What we never share": "절대 공유하지 않는 정보",
  "How it works": "작동 방식",
  "Why the email comes from us": "이메일을 저희가 보내는 이유",
  Location: "위치",
  "How precise your location is": "위치 정보의 정밀도",
  Text: "텍스트",
  "What we strip out": "자동으로 제거하는 정보",
  Honesty: "투명성",
  "What we don't do": "제공하지 않는 것",
  "No identity verification": "신원 인증 없음",
  "Public record · Safety": "공개 안내서 · 안전",
  "DateHaja sends you to meet a stranger in public. Here's what we do, what we don't, and what's in your hands.":
    "DateHaja는 낯선 사람을 공공장소에서 만나도록 연결합니다. 저희가 하는 일과 하지 않는 일, 사용자가 지켜야 할 일을 설명합니다.",
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
  "DateHaja's whole promise is that you can meet someone without handing over anything you'd rather keep. Here is exactly what that means.":
    "DateHajaは、守りたい情報を渡さずに誰かと会えることを約束します。その意味を正確に説明します。",
  "Sign in to see your own profile exactly as a match would.":
    "ログインすると、相手に見える自分のプロフィールをそのまま確認できます。",
  "Before you both accept": "二人が承諾する前",
  "What a match sees": "相手に見える情報",
  "After you both accept": "二人が承諾した後",
  "What gets added": "追加される情報",
  Never: "決して",
  "What we never share": "共有しない情報",
  "How it works": "仕組み",
  "Why the email comes from us": "メールを私たちが送る理由",
  Location: "位置情報",
  "How precise your location is": "位置情報の精度",
  Text: "テキスト",
  "What we strip out": "自動的に除くもの",
  Honesty: "透明性",
  "What we don't do": "行わないこと",
  "No identity verification": "本人確認なし",
  "Public record · Safety": "公開ガイド · 安全",
  "DateHaja sends you to meet a stranger in public. Here's what we do, what we don't, and what's in your hands.":
    "DateHajaは知らない人と公共の場所で会うサービスです。私たちが行うこと、行わないこと、利用者にできることを説明します。",
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
  "DateHaja's whole promise is that you can meet someone without handing over anything you'd rather keep. Here is exactly what that means.":
    "DateHaja verspricht, dass du jemanden treffen kannst, ohne private Angaben preiszugeben. Hier steht genau, was das bedeutet.",
  "Sign in to see your own profile exactly as a match would.":
    "Melde dich an, um dein Profil genau so zu sehen wie ein Match.",
  "Before you both accept": "Bevor ihr beide zusagt",
  "What a match sees": "Was ein Match sieht",
  "After you both accept": "Nachdem ihr beide zugesagt habt",
  "What gets added": "Was hinzukommt",
  Never: "Niemals",
  "What we never share": "Was wir nie teilen",
  "How it works": "So funktioniert es",
  "Why the email comes from us": "Warum die E-Mail von uns kommt",
  Location: "Standort",
  "How precise your location is": "Wie genau dein Standort ist",
  Text: "Text",
  "What we strip out": "Was wir entfernen",
  Honesty: "Ehrlichkeit",
  "What we don't do": "Was wir nicht tun",
  "No identity verification": "Keine Identitätsprüfung",
  "Public record · Safety": "Öffentliche Information · Sicherheit",
  "DateHaja sends you to meet a stranger in public. Here's what we do, what we don't, and what's in your hands.":
    "DateHaja bringt dich mit einer fremden Person an einem öffentlichen Ort zusammen. Hier steht, was wir tun, nicht tun und was bei dir liegt.",
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
  "DateHaja's whole promise is that you can meet someone without handing over anything you'd rather keep. Here is exactly what that means.":
    "DateHaja promet de vous permettre de rencontrer quelqu'un sans livrer les informations que vous souhaitez garder. Voici ce que cela signifie précisément.",
  "Sign in to see your own profile exactly as a match would.":
    "Connectez-vous pour voir votre profil exactement comme l'autre personne le verrait.",
  "Before you both accept": "Avant votre double accord",
  "What a match sees": "Ce que voit l'autre personne",
  "After you both accept": "Après votre double accord",
  "What gets added": "Ce qui s'ajoute",
  Never: "Jamais",
  "What we never share": "Ce que nous ne partageons jamais",
  "How it works": "Fonctionnement",
  "Why the email comes from us": "Pourquoi l'e-mail vient de nous",
  Location: "Localisation",
  "How precise your location is": "Précision de votre localisation",
  Text: "Texte",
  "What we strip out": "Ce que nous supprimons",
  Honesty: "Transparence",
  "What we don't do": "Ce que nous ne faisons pas",
  "No identity verification": "Aucune vérification d'identité",
  "Public record · Safety": "Informations publiques · Sécurité",
  "DateHaja sends you to meet a stranger in public. Here's what we do, what we don't, and what's in your hands.":
    "DateHaja vous fait rencontrer un inconnu dans un lieu public. Voici ce que nous faisons, ne faisons pas et ce qui vous appartient.",
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
  "DateHaja's whole promise is that you can meet someone without handing over anything you'd rather keep. Here is exactly what that means.":
    "DateHaja belooft dat je iemand kunt ontmoeten zonder gegevens af te staan die je privé wilt houden. Dit is precies wat dat betekent.",
  "Sign in to see your own profile exactly as a match would.":
    "Log in om je profiel precies te zien zoals een match het ziet.",
  "Before you both accept": "Voordat jullie beiden accepteren",
  "What a match sees": "Wat een match ziet",
  "After you both accept": "Nadat jullie beiden accepteren",
  "What gets added": "Wat erbij komt",
  Never: "Nooit",
  "What we never share": "Wat we nooit delen",
  "How it works": "Zo werkt het",
  "Why the email comes from us": "Waarom de e-mail van ons komt",
  Location: "Locatie",
  "How precise your location is": "Hoe precies je locatie is",
  Text: "Tekst",
  "What we strip out": "Wat we verwijderen",
  Honesty: "Eerlijkheid",
  "What we don't do": "Wat we niet doen",
  "No identity verification": "Geen identiteitsverificatie",
  "Public record · Safety": "Openbare informatie · Veiligheid",
  "DateHaja sends you to meet a stranger in public. Here's what we do, what we don't, and what's in your hands.":
    "DateHaja laat je een onbekende in het openbaar ontmoeten. Dit doen we wel en niet, en dit ligt bij jou.",
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
  "DateHaja's whole promise is that you can meet someone without handing over anything you'd rather keep. Here is exactly what that means.":
    "DateHaja lovar att du kan träffa någon utan att lämna ut det du vill behålla privat. Här är exakt vad det betyder.",
  "Sign in to see your own profile exactly as a match would.":
    "Logga in för att se din profil precis som en match ser den.",
  "Before you both accept": "Innan ni båda accepterar",
  "What a match sees": "Vad en match ser",
  "After you both accept": "Efter att ni båda accepterat",
  "What gets added": "Vad som läggs till",
  Never: "Aldrig",
  "What we never share": "Vad vi aldrig delar",
  "How it works": "Så fungerar det",
  "Why the email comes from us": "Varför mejlet kommer från oss",
  Location: "Plats",
  "How precise your location is": "Hur exakt din plats är",
  Text: "Text",
  "What we strip out": "Vad vi tar bort",
  Honesty: "Ärlighet",
  "What we don't do": "Vad vi inte gör",
  "No identity verification": "Ingen identitetsverifiering",
  "Public record · Safety": "Offentlig information · Säkerhet",
  "DateHaja sends you to meet a stranger in public. Here's what we do, what we don't, and what's in your hands.":
    "DateHaja låter dig träffa en främling offentligt. Här är vad vi gör, inte gör och vad som ligger i dina händer.",
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
  "Plus one or two sentences we write about why the two of you fit. That's the entire payload.":
    "두 사람이 잘 맞는 이유를 설명하는 한두 문장이 더해집니다. 공개되는 정보는 이것이 전부입니다.",
  "Nothing new about you — you haven't added a photo. The venue's public address becomes visible to you both.":
    "사진을 추가하지 않았으므로 당신에 관한 새 정보는 없습니다. 두 사람에게 장소의 공개 주소만 표시됩니다.",
  "Your photo, and the venue's public address. Nothing else.":
    "당신의 사진과 장소의 공개 주소만 추가됩니다.",
  "Your email address": "내 이메일 주소",
  "Your phone number": "내 전화번호",
  "Your exact address or coordinates": "내 정확한 주소 또는 좌표",
  "Your date of birth": "내 생년월일",
  "Your full name (we only show your first name)": "내 성명(이름만 표시)",
  "Your other date plans, past or present": "과거 또는 현재의 다른 데이트 계획",
  "Every invitation, confirmation and reminder is sent by":
    "모든 초대, 확정 안내, 알림은",
  "from our own inbox. Your address is the recipient, never the sender, and never a CC. Two people on the same date plan are always emailed separately, so neither can see the other's address in a header.":
    "의 전용 메일함에서 발송됩니다. 당신의 주소는 수신자로만 사용되며 발신자나 참조에 들어가지 않습니다. 같은 데이트 계획의 두 사람에게도 항상 따로 보내므로 메일 헤더에서 상대방 주소를 볼 수 없습니다.",
  "If you reply to one of those emails, it comes back to us — not to your match.":
    "그 이메일에 답장하면 상대방이 아니라 저희에게 도착합니다.",
  "You pick a neighbourhood, not an address. We store the neighbourhood's approximate centre rounded to about a kilometre, and use it only to work out roughly where a date should happen. Your match sees the neighbourhood name and nothing more precise — never a distance in kilometres, because a distance plus a map inverts to a location.":
    "주소가 아닌 동네를 선택합니다. 동네 중심을 약 1km 단위로 둥글게 저장해 데이트 지역을 정할 때만 사용합니다. 상대방은 동네 이름만 볼 수 있으며 거리나 더 정확한 위치는 공개하지 않습니다.",
  "Bios and notes are scrubbed for email addresses, phone numbers, links and messenger handles before anyone else can read them. It isn't that we don't trust you — it's that the product only works if nobody feels pressure to hand over contact details before they've met.":
    "소개글과 메모는 다른 사람이 읽기 전에 이메일, 전화번호, 링크, 메신저 계정을 자동으로 제거합니다. 만나기 전 연락처를 건네야 한다는 부담이 없어야 제품의 약속이 지켜지기 때문입니다.",
  "DateHaja does not verify anyone's identity. There is no ID check, no photo verification, and no background check. Please treat every match as someone you met on the internet, and read the":
    "DateHaja는 신분증, 사진, 신원 조회를 포함한 어떠한 신원 인증도 하지 않습니다. 모든 상대를 인터넷에서 처음 만난 사람으로 대하고",
  "before your first date.": "를 첫 데이트 전에 읽어주세요.",
  "If you're in immediate danger, contact your local emergency services first. Reports here reach our team, not the police.":
    "즉각적인 위험에 처했다면 먼저 지역 긴급 구조 기관에 연락하세요. 이곳의 신고는 경찰이 아닌 DateHaja 팀에 전달됩니다.",
  "DateHaja does not verify identity in any form. Everything on a profile is self-reported. We say this plainly because a product that implies safety it hasn't earned is more dangerous than one that's honest.":
    "DateHaja는 어떤 형태로도 신원을 확인하지 않으며 프로필 정보는 모두 사용자가 직접 입력합니다. 확보하지 못한 안전을 암시하는 것보다 한계를 솔직히 밝히는 것이 더 안전합니다.",
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
  "If they pressure you for your number, socials or money, report it. That's exactly what DateHaja exists to make unnecessary.":
    "전화번호, 소셜 계정, 돈을 요구하거나 압박하면 신고하세요. DateHaja는 그런 요구가 필요 없도록 만든 서비스입니다.",
  "Open the date plan and use Report at the bottom of the page. The report reaches us with the date plan attached, so we can see who, when and where without you having to explain it twice.":
    "데이트 계획을 열고 페이지 아래의 신고를 누르세요. 계획 정보가 함께 전달되어 누구와 언제 어디서 있었는지 반복해서 설명하지 않아도 됩니다.",
  "Reports of harassment or of someone appearing to be under 18 immediately restrict that account while we look at it. You can block at the same time, or separately — the two are independent on purpose.":
    "괴롭힘이나 미성년자로 의심되는 신고는 검토 중 해당 계정을 즉시 제한합니다. 차단은 동시에 또는 별도로 할 수 있습니다.",
  "You can also reply to any DateHaja Concierge email. It comes to us.":
    "DateHaja 컨시어지 이메일에 답장해도 저희에게 전달됩니다.",
  "Exactly what a match can see about you":
    "상대방에게 보이는 내 정보의 정확한 범위",
  "Pause matching, manage blocks, control email":
    "DateHaja 일시정지, 차단 관리, 이메일 설정",
});

Object.assign(ja, {
  "Plus one or two sentences we write about why the two of you fit. That's the entire payload.":
    "二人が合いそうな理由を一、二文添えます。相手に届く情報はそれだけです。",
  "Nothing new about you — you haven't added a photo. The venue's public address becomes visible to you both.":
    "写真がないため、あなたについて新たに見える情報はありません。会場の公開住所だけが二人に表示されます。",
  "Your photo, and the venue's public address. Nothing else.":
    "あなたの写真と会場の公開住所だけです。",
  "Your email address": "あなたのメールアドレス",
  "Your phone number": "あなたの電話番号",
  "Your exact address or coordinates": "正確な住所や座標",
  "Your date of birth": "生年月日",
  "Your full name (we only show your first name)": "氏名（名前のみ表示）",
  "Your other date plans, past or present": "過去・現在のほかのデートプラン",
  "Every invitation, confirmation and reminder is sent by":
    "すべての招待、確定、リマインダーは",
  "from our own inbox. Your address is the recipient, never the sender, and never a CC. Two people on the same date plan are always emailed separately, so neither can see the other's address in a header.":
    "の専用メールボックスから送られます。あなたのアドレスは受信者としてのみ使われ、送信者やCCにはなりません。同じデートプランの二人にも常に別々に送るため、ヘッダーで相手のアドレスを見ることはできません。",
  "If you reply to one of those emails, it comes back to us — not to your match.":
    "返信は相手ではなく私たちに届きます。",
  "You pick a neighbourhood, not an address. We store the neighbourhood's approximate centre rounded to about a kilometre, and use it only to work out roughly where a date should happen. Your match sees the neighbourhood name and nothing more precise — never a distance in kilometres, because a distance plus a map inverts to a location.":
    "住所ではなく地域を選びます。地域のおおよその中心を約1km単位で保存し、デート場所の目安にのみ使います。相手に見えるのは地域名だけで、距離や正確な位置は表示しません。",
  "Bios and notes are scrubbed for email addresses, phone numbers, links and messenger handles before anyone else can read them. It isn't that we don't trust you — it's that the product only works if nobody feels pressure to hand over contact details before they've met.":
    "紹介文やメモは、他の人が読む前にメール、電話番号、リンク、メッセンジャーIDを自動的に除きます。会う前に連絡先を渡す圧力がないことが大切だからです。",
  "DateHaja does not verify anyone's identity. There is no ID check, no photo verification, and no background check. Please treat every match as someone you met on the internet, and read the":
    "DateHajaは身分証、写真、身元調査を含む本人確認を行いません。相手はインターネットで初めて会った人として扱い、最初のデート前に",
  "before your first date.": "を読んでください。",
  "If you're in immediate danger, contact your local emergency services first. Reports here reach our team, not the police.":
    "差し迫った危険がある場合は、まず地域の緊急サービスに連絡してください。ここでの報告は警察ではなくDateHajaチームに届きます。",
  "DateHaja does not verify identity in any form. Everything on a profile is self-reported. We say this plainly because a product that implies safety it hasn't earned is more dangerous than one that's honest.":
    "DateHajaはいかなる本人確認も行わず、プロフィールはすべて自己申告です。確保していない安全を匂わせるより、限界を明確にする方が安全だと考えています。",
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
  "If they pressure you for your number, socials or money, report it. That's exactly what DateHaja exists to make unnecessary.":
    "電話番号、SNS、お金を要求されたら報告してください。DateHajaはそうした要求を不要にするためのサービスです。",
  "Open the date plan and use Report at the bottom of the page. The report reaches us with the date plan attached, so we can see who, when and where without you having to explain it twice.":
    "デートプランを開き、ページ下部の報告を使ってください。プラン情報が添付されるため、相手、日時、場所を繰り返し説明する必要はありません。",
  "Reports of harassment or of someone appearing to be under 18 immediately restrict that account while we look at it. You can block at the same time, or separately — the two are independent on purpose.":
    "嫌がらせや18歳未満に見える人の報告は、確認中そのアカウントを直ちに制限します。ブロックは同時にも別々にも行えます。",
  "You can also reply to any DateHaja Concierge email. It comes to us.":
    "DateHajaコンシェルジュのメールに返信しても私たちに届きます。",
  "Exactly what a match can see about you":
    "相手に見えるあなたの情報の正確な範囲",
  "Pause matching, manage blocks, control email":
    "DateHajaの一時停止、ブロック管理、メール設定",
});

Object.assign(de, {
  "Plus one or two sentences we write about why the two of you fit. That's the entire payload.":
    "Dazu kommen ein oder zwei Sätze, warum ihr zusammenpassen könntet. Mehr wird nicht übermittelt.",
  "Nothing new about you — you haven't added a photo. The venue's public address becomes visible to you both.":
    "Nichts Neues über dich, da du kein Foto hinzugefügt hast. Die öffentliche Adresse des Ortes wird euch beiden angezeigt.",
  "Your photo, and the venue's public address. Nothing else.":
    "Dein Foto und die öffentliche Adresse des Ortes. Sonst nichts.",
  "Your email address": "Deine E-Mail-Adresse",
  "Your phone number": "Deine Telefonnummer",
  "Your exact address or coordinates": "Deine genaue Adresse oder Koordinaten",
  "Your date of birth": "Dein Geburtsdatum",
  "Your full name (we only show your first name)":
    "Dein vollständiger Name (wir zeigen nur den Vornamen)",
  "Your other date plans, past or present":
    "Deine anderen Date-Pläne, vergangen oder aktuell",
  "Every invitation, confirmation and reminder is sent by":
    "Jede Einladung, Bestätigung und Erinnerung wird von",
  "from our own inbox. Your address is the recipient, never the sender, and never a CC. Two people on the same date plan are always emailed separately, so neither can see the other's address in a header.":
    "aus unserem eigenen Postfach gesendet. Deine Adresse ist nur Empfänger, nie Absender oder CC. Beide Personen erhalten getrennte E-Mails und sehen die Adresse der anderen nicht.",
  "If you reply to one of those emails, it comes back to us — not to your match.":
    "Eine Antwort kommt zu uns, nicht zu deinem Match.",
  "You pick a neighbourhood, not an address. We store the neighbourhood's approximate centre rounded to about a kilometre, and use it only to work out roughly where a date should happen. Your match sees the neighbourhood name and nothing more precise — never a distance in kilometres, because a distance plus a map inverts to a location.":
    "Du wählst ein Viertel, keine Adresse. Wir speichern dessen ungefähren Mittelpunkt auf rund einen Kilometer gerundet und nutzen ihn nur für die Date-Gegend. Dein Match sieht nur den Namen des Viertels, nie Entfernung oder genaue Lage.",
  "Bios and notes are scrubbed for email addresses, phone numbers, links and messenger handles before anyone else can read them. It isn't that we don't trust you — it's that the product only works if nobody feels pressure to hand over contact details before they've met.":
    "Bios und Notizen werden vor dem Anzeigen von E-Mails, Telefonnummern, Links und Messenger-Namen bereinigt. Niemand soll sich vor einem Treffen zur Weitergabe von Kontaktdaten gedrängt fühlen.",
  "DateHaja does not verify anyone's identity. There is no ID check, no photo verification, and no background check. Please treat every match as someone you met on the internet, and read the":
    "DateHaja prüft keine Identitäten, Ausweise, Fotos oder Hintergründe. Behandle jedes Match wie eine Person aus dem Internet und lies vor dem ersten Date den",
  "before your first date.": ".",
  "If you're in immediate danger, contact your local emergency services first. Reports here reach our team, not the police.":
    "Bei unmittelbarer Gefahr kontaktiere zuerst den örtlichen Notdienst. Meldungen hier erreichen unser Team, nicht die Polizei.",
  "DateHaja does not verify identity in any form. Everything on a profile is self-reported. We say this plainly because a product that implies safety it hasn't earned is more dangerous than one that's honest.":
    "DateHaja prüft Identitäten in keiner Form. Alle Profilangaben sind selbst gemacht. Ein Produkt, das unverdiente Sicherheit suggeriert, ist gefährlicher als ein ehrliches.",
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
  "If they pressure you for your number, socials or money, report it. That's exactly what DateHaja exists to make unnecessary.":
    "Melde Druck wegen Nummer, Socials oder Geld. Genau das soll DateHaja unnötig machen.",
  "Open the date plan and use Report at the bottom of the page. The report reaches us with the date plan attached, so we can see who, when and where without you having to explain it twice.":
    "Öffne den Date-Plan und nutze unten Melden. Der Plan wird angehängt, damit wir Person, Zeit und Ort sehen, ohne dass du alles doppelt erklären musst.",
  "Reports of harassment or of someone appearing to be under 18 immediately restrict that account while we look at it. You can block at the same time, or separately — the two are independent on purpose.":
    "Meldungen zu Belästigung oder mutmaßlich Minderjährigen schränken das Konto während der Prüfung sofort ein. Blockieren ist gleichzeitig oder separat möglich.",
  "You can also reply to any DateHaja Concierge email. It comes to us.":
    "Du kannst auch auf jede DateHaja-Concierge-Mail antworten. Sie kommt zu uns.",
  "Exactly what a match can see about you":
    "Genau was ein Match über dich sehen kann",
  "Pause matching, manage blocks, control email":
    "Matching pausieren, Blockierungen verwalten, E-Mails steuern",
});

Object.assign(fr, {
  "Plus one or two sentences we write about why the two of you fit. That's the entire payload.":
    "Nous ajoutons une ou deux phrases expliquant votre compatibilité. C'est tout ce qui est transmis.",
  "Nothing new about you — you haven't added a photo. The venue's public address becomes visible to you both.":
    "Rien de plus sur vous puisque vous n'avez pas ajouté de photo. L'adresse publique du lieu devient visible aux deux personnes.",
  "Your photo, and the venue's public address. Nothing else.":
    "Votre photo et l'adresse publique du lieu. Rien d'autre.",
  "Your email address": "Votre adresse e-mail",
  "Your phone number": "Votre numéro de téléphone",
  "Your exact address or coordinates":
    "Votre adresse exacte ou vos coordonnées",
  "Your date of birth": "Votre date de naissance",
  "Your full name (we only show your first name)":
    "Votre nom complet (seul le prénom est montré)",
  "Your other date plans, past or present":
    "Vos autres rendez-vous, passés ou présents",
  "Every invitation, confirmation and reminder is sent by":
    "Chaque invitation, confirmation et rappel est envoyé par",
  "from our own inbox. Your address is the recipient, never the sender, and never a CC. Two people on the same date plan are always emailed separately, so neither can see the other's address in a header.":
    "depuis notre propre boîte. Votre adresse est uniquement destinataire, jamais expéditeur ni en copie. Les deux personnes reçoivent toujours des e-mails séparés et ne voient pas l'adresse de l'autre.",
  "If you reply to one of those emails, it comes back to us — not to your match.":
    "Si vous répondez, le message nous revient — pas à l'autre personne.",
  "You pick a neighbourhood, not an address. We store the neighbourhood's approximate centre rounded to about a kilometre, and use it only to work out roughly where a date should happen. Your match sees the neighbourhood name and nothing more precise — never a distance in kilometres, because a distance plus a map inverts to a location.":
    "Vous choisissez un quartier, pas une adresse. Nous stockons son centre approximatif arrondi à environ un kilomètre et l'utilisons uniquement pour situer le rendez-vous. L'autre personne ne voit que le nom du quartier, jamais une distance ni une position précise.",
  "Bios and notes are scrubbed for email addresses, phone numbers, links and messenger handles before anyone else can read them. It isn't that we don't trust you — it's that the product only works if nobody feels pressure to hand over contact details before they've met.":
    "Les bios et notes sont nettoyées des e-mails, numéros, liens et identifiants avant d'être lues. Personne ne doit se sentir obligé de donner ses coordonnées avant une rencontre.",
  "DateHaja does not verify anyone's identity. There is no ID check, no photo verification, and no background check. Please treat every match as someone you met on the internet, and read the":
    "DateHaja ne vérifie aucune identité, pièce, photo ni antécédent. Considérez chaque match comme une personne rencontrée sur internet et lisez le",
  "before your first date.": "avant votre premier rendez-vous.",
  "If you're in immediate danger, contact your local emergency services first. Reports here reach our team, not the police.":
    "En cas de danger immédiat, contactez d'abord les services d'urgence locaux. Les signalements ici arrivent à notre équipe, pas à la police.",
  "DateHaja does not verify identity in any form. Everything on a profile is self-reported. We say this plainly because a product that implies safety it hasn't earned is more dangerous than one that's honest.":
    "DateHaja ne vérifie l'identité sous aucune forme. Toutes les informations sont déclaratives. Un produit qui suggère une sécurité non acquise est plus dangereux qu'un produit honnête.",
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
  "If they pressure you for your number, socials or money, report it. That's exactly what DateHaja exists to make unnecessary.":
    "Si l'on vous presse de donner numéro, réseaux ou argent, signalez-le. DateHaja existe précisément pour rendre cela inutile.",
  "Open the date plan and use Report at the bottom of the page. The report reaches us with the date plan attached, so we can see who, when and where without you having to explain it twice.":
    "Ouvrez le projet de rendez-vous et utilisez Signaler en bas. Le projet est joint afin que nous voyions qui, quand et où sans vous faire répéter.",
  "Reports of harassment or of someone appearing to be under 18 immediately restrict that account while we look at it. You can block at the same time, or separately — the two are independent on purpose.":
    "Les signalements de harcèlement ou de personne semblant mineure limitent immédiatement le compte pendant l'examen. Le blocage peut être effectué en même temps ou séparément.",
  "You can also reply to any DateHaja Concierge email. It comes to us.":
    "Vous pouvez aussi répondre à tout e-mail DateHaja Concierge. Il nous parvient.",
  "Exactly what a match can see about you":
    "Exactement ce qu'un match peut voir de vous",
  "Pause matching, manage blocks, control email":
    "Mettre en pause, gérer les blocages et les e-mails",
});

Object.assign(nl, {
  "Plus one or two sentences we write about why the two of you fit. That's the entire payload.":
    "Plus één of twee zinnen over waarom jullie bij elkaar passen. Dat is alles wat wordt gedeeld.",
  "Nothing new about you — you haven't added a photo. The venue's public address becomes visible to you both.":
    "Niets nieuws over jou omdat je geen foto hebt toegevoegd. Het openbare adres van de locatie wordt voor jullie beiden zichtbaar.",
  "Your photo, and the venue's public address. Nothing else.":
    "Je foto en het openbare adres van de locatie. Verder niets.",
  "Your email address": "Je e-mailadres",
  "Your phone number": "Je telefoonnummer",
  "Your exact address or coordinates": "Je exacte adres of coördinaten",
  "Your date of birth": "Je geboortedatum",
  "Your full name (we only show your first name)":
    "Je volledige naam (we tonen alleen je voornaam)",
  "Your other date plans, past or present": "Je andere dateplannen, vroeger of nu",
  "Every invitation, confirmation and reminder is sent by":
    "Elke uitnodiging, bevestiging en herinnering wordt verzonden door",
  "from our own inbox. Your address is the recipient, never the sender, and never a CC. Two people on the same date plan are always emailed separately, so neither can see the other's address in a header.":
    "vanuit onze eigen inbox. Je adres is alleen ontvanger, nooit afzender of cc. Beide personen krijgen altijd aparte e-mails en zien elkaars adres niet.",
  "If you reply to one of those emails, it comes back to us — not to your match.":
    "Een antwoord komt bij ons terecht, niet bij je match.",
  "You pick a neighbourhood, not an address. We store the neighbourhood's approximate centre rounded to about a kilometre, and use it only to work out roughly where a date should happen. Your match sees the neighbourhood name and nothing more precise — never a distance in kilometres, because a distance plus a map inverts to a location.":
    "Je kiest een buurt, geen adres. We bewaren het globale middelpunt afgerond op ongeveer een kilometer en gebruiken dat alleen voor de omgeving van de date. Je match ziet uitsluitend de buurtnaam, nooit afstand of exacte locatie.",
  "Bios and notes are scrubbed for email addresses, phone numbers, links and messenger handles before anyone else can read them. It isn't that we don't trust you — it's that the product only works if nobody feels pressure to hand over contact details before they've met.":
    "Bio's en notities worden ontdaan van e-mailadressen, telefoonnummers, links en accounts voordat iemand ze leest. Niemand moet druk voelen om vóór een ontmoeting contactgegevens te delen.",
  "DateHaja does not verify anyone's identity. There is no ID check, no photo verification, and no background check. Please treat every match as someone you met on the internet, and read the":
    "DateHaja verifieert geen identiteit, identiteitsbewijs, foto of achtergrond. Behandel elke match als iemand die je online hebt ontmoet en lees het",
  "before your first date.": "vóór je eerste date.",
  "If you're in immediate danger, contact your local emergency services first. Reports here reach our team, not the police.":
    "Neem bij direct gevaar eerst contact op met de lokale hulpdiensten. Meldingen hier bereiken ons team, niet de politie.",
  "DateHaja does not verify identity in any form. Everything on a profile is self-reported. We say this plainly because a product that implies safety it hasn't earned is more dangerous than one that's honest.":
    "DateHaja verifieert identiteit op geen enkele manier. Alles op een profiel is zelf opgegeven. Een product dat onverdiende veiligheid suggereert is gevaarlijker dan een eerlijk product.",
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
  "If they pressure you for your number, socials or money, report it. That's exactly what DateHaja exists to make unnecessary.":
    "Meld druk om je nummer, socials of geld te geven. DateHaja bestaat juist om dat overbodig te maken.",
  "Open the date plan and use Report at the bottom of the page. The report reaches us with the date plan attached, so we can see who, when and where without you having to explain it twice.":
    "Open het dateplan en kies Melden onderaan. Het plan wordt meegestuurd zodat we persoon, tijd en plaats zien zonder dat je alles dubbel hoeft uit te leggen.",
  "Reports of harassment or of someone appearing to be under 18 immediately restrict that account while we look at it. You can block at the same time, or separately — the two are independent on purpose.":
    "Meldingen van intimidatie of iemand die onder 18 lijkt beperken het account direct tijdens onderzoek. Blokkeren kan tegelijk of apart.",
  "You can also reply to any DateHaja Concierge email. It comes to us.":
    "Je kunt ook antwoorden op elke DateHaja Concierge-mail. Die komt bij ons.",
  "Exactly what a match can see about you":
    "Precies wat een match over je kan zien",
  "Pause matching, manage blocks, control email":
    "Matching pauzeren, blokkades en e-mail beheren",
});

Object.assign(sv, {
  "Plus one or two sentences we write about why the two of you fit. That's the entire payload.":
    "Dessutom en eller två meningar om varför ni passar ihop. Det är allt som delas.",
  "Nothing new about you — you haven't added a photo. The venue's public address becomes visible to you both.":
    "Inget nytt om dig eftersom du inte lagt till ett foto. Platsens offentliga adress blir synlig för er båda.",
  "Your photo, and the venue's public address. Nothing else.":
    "Ditt foto och platsens offentliga adress. Inget annat.",
  "Your email address": "Din e-postadress",
  "Your phone number": "Ditt telefonnummer",
  "Your exact address or coordinates": "Din exakta adress eller koordinater",
  "Your date of birth": "Ditt födelsedatum",
  "Your full name (we only show your first name)":
    "Ditt fullständiga namn (vi visar bara förnamnet)",
  "Your other date plans, past or present":
    "Dina andra dejtplaner, tidigare eller nuvarande",
  "Every invitation, confirmation and reminder is sent by":
    "Varje inbjudan, bekräftelse och påminnelse skickas av",
  "from our own inbox. Your address is the recipient, never the sender, and never a CC. Two people on the same date plan are always emailed separately, so neither can see the other's address in a header.":
    "från vår egen inkorg. Din adress är bara mottagare, aldrig avsändare eller kopia. Båda personerna får separata mejl och kan inte se den andras adress.",
  "If you reply to one of those emails, it comes back to us — not to your match.":
    "Ett svar kommer till oss, inte till din match.",
  "You pick a neighbourhood, not an address. We store the neighbourhood's approximate centre rounded to about a kilometre, and use it only to work out roughly where a date should happen. Your match sees the neighbourhood name and nothing more precise — never a distance in kilometres, because a distance plus a map inverts to a location.":
    "Du väljer ett område, inte en adress. Vi lagrar områdets ungefärliga centrum avrundat till cirka en kilometer och använder det bara för dejtens område. Din match ser bara områdesnamnet, aldrig avstånd eller exakt plats.",
  "Bios and notes are scrubbed for email addresses, phone numbers, links and messenger handles before anyone else can read them. It isn't that we don't trust you — it's that the product only works if nobody feels pressure to hand over contact details before they've met.":
    "Presentationer och anteckningar rensas från e-post, telefonnummer, länkar och konton innan någon läser dem. Ingen ska känna press att lämna kontaktuppgifter före ett möte.",
  "DateHaja does not verify anyone's identity. There is no ID check, no photo verification, and no background check. Please treat every match as someone you met on the internet, and read the":
    "DateHaja verifierar inte identitet, ID, foto eller bakgrund. Behandla varje match som någon du träffat på nätet och läs vårt",
  "before your first date.": "före din första dejt.",
  "If you're in immediate danger, contact your local emergency services first. Reports here reach our team, not the police.":
    "Vid omedelbar fara, kontakta först lokal räddningstjänst. Rapporter här når vårt team, inte polisen.",
  "DateHaja does not verify identity in any form. Everything on a profile is self-reported. We say this plainly because a product that implies safety it hasn't earned is more dangerous than one that's honest.":
    "DateHaja verifierar inte identitet i någon form. All profilinformation är självrapporterad. En produkt som antyder oförtjänt säkerhet är farligare än en ärlig produkt.",
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
  "If they pressure you for your number, socials or money, report it. That's exactly what DateHaja exists to make unnecessary.":
    "Rapportera press om nummer, sociala konton eller pengar. DateHaja finns för att göra sådant onödigt.",
  "Open the date plan and use Report at the bottom of the page. The report reaches us with the date plan attached, so we can see who, when and where without you having to explain it twice.":
    "Öppna dejtplanen och använd Rapportera längst ned. Planen bifogas så att vi ser person, tid och plats utan att du behöver förklara allt två gånger.",
  "Reports of harassment or of someone appearing to be under 18 immediately restrict that account while we look at it. You can block at the same time, or separately — the two are independent on purpose.":
    "Rapporter om trakasserier eller någon som verkar under 18 begränsar kontot direkt under granskning. Blockering kan göras samtidigt eller separat.",
  "You can also reply to any DateHaja Concierge email. It comes to us.":
    "Du kan också svara på alla mejl från DateHaja Concierge. De kommer till oss.",
  "Exactly what a match can see about you": "Exakt vad en match kan se om dig",
  "Pause matching, manage blocks, control email":
    "Pausa matchning, hantera blockeringar och e-post",
});

Object.assign(ko, {
  "A private beginning": "비공개로 시작하기",
  "Private handoff": "나만의 비공개 인계",
  "Start with an account only you can open.":
    "나만 열 수 있는 계정으로 시작하세요.",
  "Come back to your evening.": "당신의 저녁으로 돌아오세요.",
  "Every invitation is private. Signing in lets us show the right plan to the right person, keep each answer secret, and update your calendar without sharing contact details.":
    "모든 초대는 비공개입니다. 로그인하면 알맞은 사람에게 알맞은 계획만 보여주고, 각자의 답을 숨긴 채 연락처 공유 없이 캘린더를 업데이트할 수 있어요.",
  "Your invitation": "나의 초대",
  "Only you can open it.": "나만 열어볼 수 있어요.",
  "Your answer": "나의 답변",
  "Your match never sees a pass.": "패스한 사실은 상대에게 보이지 않아요.",
  "Your calendar": "나의 캘린더",
  "Reserved, finalized, or cancelled.": "예약, 확정, 취소 상태가 이어져요.",
  "Open your private dates.": "비공개 데이트를 열어보세요.",
  "No public profile": "공개 프로필 없음",
});

Object.assign(ja, {
  "A private beginning": "プライベートな始まり",
  "Private handoff": "あなただけへの受け渡し",
  "Start with an account only you can open.":
    "あなただけが開けるアカウントから始めましょう。",
  "Come back to your evening.": "あなたの夜へ戻りましょう。",
  "Every invitation is private. Signing in lets us show the right plan to the right person, keep each answer secret, and update your calendar without sharing contact details.":
    "招待はすべて非公開です。ログインすることで、正しい人に正しいプランだけを表示し、回答を秘密にしたまま、連絡先を共有せずカレンダーを更新できます。",
  "Your invitation": "あなたの招待",
  "Only you can open it.": "開けるのはあなただけ。",
  "Your answer": "あなたの回答",
  "Your match never sees a pass.": "見送ったことは相手に伝わりません。",
  "Your calendar": "あなたのカレンダー",
  "Reserved, finalized, or cancelled.": "仮押さえ、確定、キャンセルを反映。",
  "Open your private dates.": "非公開のデートを開く。",
  "No public profile": "公開プロフィールなし",
});

Object.assign(de, {
  "A private beginning": "Ein privater Anfang",
  "Private handoff": "Private Übergabe",
  "Start with an account only you can open.":
    "Beginne mit einem Konto, das nur du öffnen kannst.",
  "Come back to your evening.": "Komm zurück zu deinem Abend.",
  "Every invitation is private. Signing in lets us show the right plan to the right person, keep each answer secret, and update your calendar without sharing contact details.":
    "Jede Einladung ist privat. Durch die Anmeldung zeigen wir den richtigen Plan nur der richtigen Person, halten Antworten geheim und aktualisieren deinen Kalender ohne Kontaktdaten zu teilen.",
  "Your invitation": "Deine Einladung",
  "Only you can open it.": "Nur du kannst sie öffnen.",
  "Your answer": "Deine Antwort",
  "Your match never sees a pass.": "Dein Match sieht eine Absage nie.",
  "Your calendar": "Dein Kalender",
  "Reserved, finalized, or cancelled.": "Reserviert, bestätigt oder abgesagt.",
  "Open your private dates.": "Öffne deine privaten Dates.",
  "No public profile": "Kein öffentliches Profil",
});

Object.assign(fr, {
  "A private beginning": "Un début privé",
  "Private handoff": "Remise privée",
  "Start with an account only you can open.":
    "Commencez avec un compte que vous seul pouvez ouvrir.",
  "Come back to your evening.": "Revenez à votre soirée.",
  "Every invitation is private. Signing in lets us show the right plan to the right person, keep each answer secret, and update your calendar without sharing contact details.":
    "Chaque invitation est privée. La connexion nous permet de montrer le bon programme à la bonne personne, de garder chaque réponse secrète et de mettre votre calendrier à jour sans partager vos coordonnées.",
  "Your invitation": "Votre invitation",
  "Only you can open it.": "Vous seul pouvez l'ouvrir.",
  "Your answer": "Votre réponse",
  "Your match never sees a pass.": "L'autre personne ne voit jamais un refus.",
  "Your calendar": "Votre calendrier",
  "Reserved, finalized, or cancelled.": "Réservé, confirmé ou annulé.",
  "Open your private dates.": "Ouvrez vos rendez-vous privés.",
  "No public profile": "Aucun profil public",
});

Object.assign(nl, {
  "A private beginning": "Een privé begin",
  "Private handoff": "Privéoverdracht",
  "Start with an account only you can open.":
    "Begin met een account dat alleen jij kunt openen.",
  "Come back to your evening.": "Ga terug naar jouw avond.",
  "Every invitation is private. Signing in lets us show the right plan to the right person, keep each answer secret, and update your calendar without sharing contact details.":
    "Elke uitnodiging is privé. Door in te loggen tonen we het juiste plan alleen aan de juiste persoon, houden we antwoorden geheim en werken we je agenda bij zonder contactgegevens te delen.",
  "Your invitation": "Jouw uitnodiging",
  "Only you can open it.": "Alleen jij kunt die openen.",
  "Your answer": "Jouw antwoord",
  "Your match never sees a pass.": "De ander ziet nooit dat je afwijst.",
  "Your calendar": "Jouw agenda",
  "Reserved, finalized, or cancelled.":
    "Gereserveerd, bevestigd of geannuleerd.",
  "Open your private dates.": "Open je privé-dates.",
  "No public profile": "Geen openbaar profiel",
});

Object.assign(sv, {
  "A private beginning": "En privat början",
  "Private handoff": "Privat överlämning",
  "Start with an account only you can open.":
    "Börja med ett konto som bara du kan öppna.",
  "Come back to your evening.": "Kom tillbaka till din kväll.",
  "Every invitation is private. Signing in lets us show the right plan to the right person, keep each answer secret, and update your calendar without sharing contact details.":
    "Varje inbjudan är privat. Inloggningen gör att rätt plan visas för rätt person, att svaren förblir hemliga och att kalendern uppdateras utan delade kontaktuppgifter.",
  "Your invitation": "Din inbjudan",
  "Only you can open it.": "Bara du kan öppna den.",
  "Your answer": "Ditt svar",
  "Your match never sees a pass.": "Den andra ser aldrig att du avstår.",
  "Your calendar": "Din kalender",
  "Reserved, finalized, or cancelled.": "Reserverad, bekräftad eller avbokad.",
  "Open your private dates.": "Öppna dina privata dejter.",
  "No public profile": "Ingen offentlig profil",
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
  "They agreed that I can store this email for DateHaja safety plans.":
    "이 이메일을 DateHaja 안전 일정 공유에 저장하는 데 동의받았어요.",
  "Ask me how the date went": "데이트 후 안부 묻기",
  "A private, optional check-in after the planned end time.":
    "예정 종료 시간 뒤에 보내는 선택형 비공개 체크인이에요.",
  "Save private safety settings": "비공개 안전 설정 저장",
  "Sign in to add a trusted contact and choose whether DateHaja checks in after a date.":
    "로그인하면 신뢰 연락처를 추가하고 데이트 후 체크인 여부를 선택할 수 있어요.",
  "How did it go?": "데이트는 어땠나요?",
  "The plan is complete. Your private check-in is ready.":
    "일정이 끝났어요. 비공개 체크인을 남길 수 있어요.",
  "You're both in. Here's everything you need.":
    "두 사람 모두 수락했어요. 필요한 정보는 여기 있어요.",
  Reserved: "예약됨",
  "Your evening is held.": "저녁 시간을 잡아두었어요.",
  "The calendar event is tentative while the other person decides.":
    "상대가 결정하는 동안 캘린더에는 잠정 일정으로 표시돼요.",
  Finalized: "확정됨",
  "The date is on.": "데이트가 확정됐어요.",
  "Your calendar receives the public venue and confirmed time.":
    "캘린더에 공개 장소와 확정 시간이 표시돼요.",
  "The evening is released.": "저녁 시간이 다시 비었어요.",
  "Subscribed calendars receive the cancellation from the same event.":
    "구독한 캘린더의 같은 일정에 취소 상태가 반영돼요.",
  "Private calendar link created.": "비공개 캘린더 링크를 만들었어요.",
  "Private calendar link copied.": "비공개 캘린더 링크를 복사했어요.",
  "Paste the copied link into Google Calendar.":
    "복사한 링크를 Google Calendar에 붙여 넣으세요.",
  "Live calendar status": "실시간 캘린더 상태",
  "Subscribe once; DateHaja keeps the same event ID as it moves from reserved to finalized or cancelled.":
    "한 번 구독하면 같은 일정이 예약·확정·취소 상태로 이어져요.",
  "Google Calendar": "Google 캘린더",
  "Apple / calendar app": "Apple / 캘린더 앱",
  "Copy private link": "비공개 링크 복사",
  "Anyone with this secret link can read your date times. Calendar apps refresh on their own schedule.":
    "이 비밀 링크를 가진 사람은 데이트 시간을 볼 수 있어요. 캘린더 앱마다 반영 시간이 다를 수 있어요.",
  "Private response saved": "비공개 응답 저장됨",
  "Thanks for checking in.": "알려줘서 고마워요.",
  "Your answers are never shown to your match. They help DateHaja improve matching, venues, and safety follow-up.":
    "응답은 상대에게 보이지 않으며 매칭, 장소, 안전 후속 조치를 개선하는 데 쓰여요.",
  "Update response": "응답 수정",
  "After the date": "데이트 후",
  "How did it feel?": "어떤 느낌이었나요?",
  "Entirely optional and private. Your match never sees these answers.":
    "완전히 선택 사항이며 비공개예요. 상대에게는 보이지 않아요.",
  "What happened?": "무슨 일이 있었나요?",
  "We met": "만났어요",
  "They didn't show": "상대가 오지 않았어요",
  "I left early": "일찍 나왔어요",
  "I didn't go": "가지 않았어요",
  "Did you feel safe?": "안전하다고 느꼈나요?",
  Uncomfortable: "불편했어요",
  "Prefer not to say": "답하지 않을래요",
  "Would you meet them again?": "다시 만나고 싶나요?",
  Maybe: "아마도요",
  "How was the venue?": "장소는 어땠나요?",
  optional: "선택",
  "Venue rating": "장소 평점",
  star: "점",
  stars: "점",
  "Anything else?": "더 남길 말이 있나요?",
  "A private note for DateHaja — never your match.":
    "상대에게는 보이지 않는 DateHaja 비공개 메모",
  "I want safety follow-up": "안전 관련 후속 연락을 원해요",
  "Save this as a private safety follow-up request. For immediate danger, contact local emergency services.":
    "비공개 안전 후속 요청으로 저장합니다. 즉각적인 위험이라면 지역 응급 서비스에 먼저 연락하세요.",
  "Open the Safety Center": "안전 센터 열기",
  "Your private response is saved.": "비공개 응답을 저장했어요.",
  "Save private response": "비공개 응답 저장",
  "Keep previous response": "이전 응답 유지",
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
  "They agreed that I can store this email for DateHaja safety plans.":
    "このメールをDateHajaの安全予定に保存する同意を得ています。",
  "Ask me how the date went": "デート後にチェックインする",
  "A private, optional check-in after the planned end time.":
    "予定終了後の任意の非公開チェックインです。",
  "Save private safety settings": "非公開の安全設定を保存",
  "Sign in to add a trusted contact and choose whether DateHaja checks in after a date.":
    "ログインすると、信頼できる連絡先とデート後のチェックインを設定できます。",
  "How did it go?": "デートはいかがでしたか？",
  "The plan is complete. Your private check-in is ready.":
    "予定は終了しました。非公開チェックインを回答できます。",
  "You're both in. Here's everything you need.":
    "お二人とも承諾しました。必要な情報はこちらです。",
  Reserved: "仮予約",
  "Your evening is held.": "この夜を仮押さえしました。",
  "The calendar event is tentative while the other person decides.":
    "相手が決める間、カレンダーには仮予定として表示されます。",
  Finalized: "確定",
  "The date is on.": "デートが確定しました。",
  "Your calendar receives the public venue and confirmed time.":
    "カレンダーに公共の会場と確定時間が届きます。",
  "The evening is released.": "この夜は再び空きました。",
  "Subscribed calendars receive the cancellation from the same event.":
    "購読中のカレンダーでは同じ予定がキャンセルに変わります。",
  "Private calendar link created.": "非公開カレンダーリンクを作成しました。",
  "Private calendar link copied.": "非公開カレンダーリンクをコピーしました。",
  "Paste the copied link into Google Calendar.":
    "コピーしたリンクをGoogleカレンダーに貼り付けてください。",
  "Live calendar status": "カレンダーの最新状態",
  "Subscribe once; DateHaja keeps the same event ID as it moves from reserved to finalized or cancelled.":
    "一度購読すると、同じ予定が仮予約・確定・キャンセルへ更新されます。",
  "Google Calendar": "Googleカレンダー",
  "Apple / calendar app": "Apple／カレンダーアプリ",
  "Copy private link": "非公開リンクをコピー",
  "Anyone with this secret link can read your date times. Calendar apps refresh on their own schedule.":
    "この秘密リンクを知る人はデートの時間を確認できます。反映時間はカレンダーアプリごとに異なります。",
  "Private response saved": "非公開の回答を保存済み",
  "Thanks for checking in.": "知らせてくれてありがとうございます。",
  "Your answers are never shown to your match. They help DateHaja improve matching, venues, and safety follow-up.":
    "回答は相手には表示されず、マッチング、会場、安全対応の改善に使われます。",
  "Update response": "回答を更新",
  "After the date": "デートの後",
  "How did it feel?": "どのように感じましたか？",
  "Entirely optional and private. Your match never sees these answers.":
    "完全に任意で非公開です。相手には表示されません。",
  "What happened?": "どうなりましたか？",
  "We met": "会いました",
  "They didn't show": "相手が来ませんでした",
  "I left early": "早めに帰りました",
  "I didn't go": "行きませんでした",
  "Did you feel safe?": "安全だと感じましたか？",
  Uncomfortable: "不快でした",
  "Prefer not to say": "回答しない",
  "Would you meet them again?": "また会いたいですか？",
  Maybe: "たぶん",
  "How was the venue?": "会場はいかがでしたか？",
  optional: "任意",
  "Venue rating": "会場の評価",
  star: "点",
  stars: "点",
  "Anything else?": "ほかにありますか？",
  "A private note for DateHaja — never your match.":
    "相手には見えないDateHajaへの非公開メモ",
  "I want safety follow-up": "安全に関するフォローを希望する",
  "Save this as a private safety follow-up request. For immediate danger, contact local emergency services.":
    "非公開の安全フォロー依頼として保存します。差し迫った危険がある場合は地域の緊急サービスへ連絡してください。",
  "Open the Safety Center": "安全センターを開く",
  "Your private response is saved.": "非公開の回答を保存しました。",
  "Save private response": "非公開の回答を保存",
  "Keep previous response": "以前の回答を維持",
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
  "They agreed that I can store this email for DateHaja safety plans.":
    "Die Person hat zugestimmt, dass ich diese E-Mail für DateHaja-Sicherheitspläne speichere.",
  "Ask me how the date went": "Nach dem Date nachfragen",
  "A private, optional check-in after the planned end time.":
    "Ein privater, optionaler Check-in nach dem geplanten Ende.",
  "Save private safety settings": "Private Sicherheitseinstellungen speichern",
  "Sign in to add a trusted contact and choose whether DateHaja checks in after a date.":
    "Melde dich an, um eine Vertrauensperson und den Check-in nach dem Date einzurichten.",
  "How did it go?": "Wie war das Date?",
  "The plan is complete. Your private check-in is ready.":
    "Der Termin ist vorbei. Dein privater Check-in ist bereit.",
  "You're both in. Here's everything you need.":
    "Ihr habt beide zugesagt. Hier ist alles, was du brauchst.",
  Reserved: "Reserviert",
  "Your evening is held.": "Dein Abend ist reserviert.",
  "The calendar event is tentative while the other person decides.":
    "Der Kalendereintrag bleibt vorläufig, während die andere Person entscheidet.",
  Finalized: "Bestätigt",
  "The date is on.": "Das Date steht.",
  "Your calendar receives the public venue and confirmed time.":
    "Dein Kalender erhält den öffentlichen Treffpunkt und die bestätigte Zeit.",
  "The evening is released.": "Der Abend ist wieder frei.",
  "Subscribed calendars receive the cancellation from the same event.":
    "Abonnierte Kalender erhalten die Absage im selben Termin.",
  "Private calendar link created.": "Privater Kalenderlink erstellt.",
  "Private calendar link copied.": "Privater Kalenderlink kopiert.",
  "Paste the copied link into Google Calendar.":
    "Füge den kopierten Link in Google Kalender ein.",
  "Live calendar status": "Aktueller Kalenderstatus",
  "Subscribe once; DateHaja keeps the same event ID as it moves from reserved to finalized or cancelled.":
    "Einmal abonnieren: Derselbe Termin wechselt zwischen reserviert, bestätigt und abgesagt.",
  "Google Calendar": "Google Kalender",
  "Apple / calendar app": "Apple / Kalender-App",
  "Copy private link": "Privaten Link kopieren",
  "Anyone with this secret link can read your date times. Calendar apps refresh on their own schedule.":
    "Jede Person mit diesem geheimen Link kann deine Date-Zeiten sehen. Kalender-Apps aktualisieren nach ihrem eigenen Zeitplan.",
  "Private response saved": "Private Antwort gespeichert",
  "Thanks for checking in.": "Danke für deine Rückmeldung.",
  "Your answers are never shown to your match. They help DateHaja improve matching, venues, and safety follow-up.":
    "Deine Antworten werden deinem Match nie gezeigt. Sie helfen uns, Matching, Orte und Sicherheitsmaßnahmen zu verbessern.",
  "Update response": "Antwort aktualisieren",
  "After the date": "Nach dem Date",
  "How did it feel?": "Wie hat es sich angefühlt?",
  "Entirely optional and private. Your match never sees these answers.":
    "Völlig freiwillig und privat. Dein Match sieht diese Antworten nie.",
  "What happened?": "Was ist passiert?",
  "We met": "Wir haben uns getroffen",
  "They didn't show": "Die Person kam nicht",
  "I left early": "Ich bin früher gegangen",
  "I didn't go": "Ich bin nicht hingegangen",
  "Did you feel safe?": "Hast du dich sicher gefühlt?",
  Uncomfortable: "Unwohl",
  "Prefer not to say": "Keine Angabe",
  "Would you meet them again?": "Würdest du die Person wiedersehen?",
  Maybe: "Vielleicht",
  "How was the venue?": "Wie war der Ort?",
  optional: "freiwillig",
  "Venue rating": "Bewertung des Ortes",
  star: "Stern",
  stars: "Sterne",
  "Anything else?": "Noch etwas?",
  "A private note for DateHaja — never your match.":
    "Eine private Notiz für DateHaja — nie für dein Match.",
  "I want safety follow-up": "Ich möchte eine Sicherheitsnachfrage",
  "Save this as a private safety follow-up request. For immediate danger, contact local emergency services.":
    "Als private Sicherheitsanfrage speichern. Bei unmittelbarer Gefahr kontaktiere den örtlichen Notruf.",
  "Open the Safety Center": "Sicherheitscenter öffnen",
  "Your private response is saved.": "Deine private Antwort wurde gespeichert.",
  "Save private response": "Private Antwort speichern",
  "Keep previous response": "Vorherige Antwort behalten",
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
  "They agreed that I can store this email for DateHaja safety plans.":
    "Cette personne accepte que je conserve cet e-mail pour les plans de sécurité DateHaja.",
  "Ask me how the date went": "Me demander comment s'est passé le rendez-vous",
  "A private, optional check-in after the planned end time.":
    "Un suivi privé et facultatif après l'heure de fin prévue.",
  "Save private safety settings": "Enregistrer les paramètres privés",
  "Sign in to add a trusted contact and choose whether DateHaja checks in after a date.":
    "Connectez-vous pour ajouter un contact de confiance et choisir le suivi après le rendez-vous.",
  "How did it go?": "Comment cela s'est-il passé ?",
  "The plan is complete. Your private check-in is ready.":
    "Le rendez-vous est terminé. Votre suivi privé est prêt.",
  "You're both in. Here's everything you need.":
    "Vous avez accepté tous les deux. Voici tout ce qu'il vous faut.",
  Reserved: "Réservé",
  "Your evening is held.": "Votre soirée est réservée.",
  "The calendar event is tentative while the other person decides.":
    "L'événement reste provisoire pendant que l'autre personne décide.",
  Finalized: "Confirmé",
  "The date is on.": "Le rendez-vous est confirmé.",
  "Your calendar receives the public venue and confirmed time.":
    "Votre agenda reçoit le lieu public et l'heure confirmée.",
  "The evening is released.": "Votre soirée est à nouveau libre.",
  "Subscribed calendars receive the cancellation from the same event.":
    "Les agendas abonnés reçoivent l'annulation sur le même événement.",
  "Private calendar link created.": "Lien d'agenda privé créé.",
  "Private calendar link copied.": "Lien d'agenda privé copié.",
  "Paste the copied link into Google Calendar.":
    "Collez le lien copié dans Google Agenda.",
  "Live calendar status": "Statut actuel de l'agenda",
  "Subscribe once; DateHaja keeps the same event ID as it moves from reserved to finalized or cancelled.":
    "Abonnez-vous une fois : le même événement passe de réservé à confirmé ou annulé.",
  "Google Calendar": "Google Agenda",
  "Apple / calendar app": "Apple / application d'agenda",
  "Copy private link": "Copier le lien privé",
  "Anyone with this secret link can read your date times. Calendar apps refresh on their own schedule.":
    "Toute personne ayant ce lien secret peut voir les horaires de vos rendez-vous. Les applications d'agenda se mettent à jour à leur rythme.",
  "Private response saved": "Réponse privée enregistrée",
  "Thanks for checking in.": "Merci pour votre retour.",
  "Your answers are never shown to your match. They help DateHaja improve matching, venues, and safety follow-up.":
    "Vos réponses ne sont jamais montrées à l'autre personne. Elles améliorent la mise en relation, les lieux et le suivi de sécurité.",
  "Update response": "Modifier la réponse",
  "After the date": "Après le rendez-vous",
  "How did it feel?": "Comment vous êtes-vous senti ?",
  "Entirely optional and private. Your match never sees these answers.":
    "Entièrement facultatif et privé. L'autre personne ne voit jamais ces réponses.",
  "What happened?": "Que s'est-il passé ?",
  "We met": "Nous nous sommes rencontrés",
  "They didn't show": "La personne n'est pas venue",
  "I left early": "Je suis parti plus tôt",
  "I didn't go": "Je n'y suis pas allé",
  "Did you feel safe?": "Vous êtes-vous senti en sécurité ?",
  Uncomfortable: "Mal à l'aise",
  "Prefer not to say": "Je préfère ne pas répondre",
  "Would you meet them again?": "Souhaiteriez-vous revoir cette personne ?",
  Maybe: "Peut-être",
  "How was the venue?": "Comment était le lieu ?",
  optional: "facultatif",
  "Venue rating": "Note du lieu",
  star: "étoile",
  stars: "étoiles",
  "Anything else?": "Autre chose ?",
  "A private note for DateHaja — never your match.":
    "Une note privée pour DateHaja — jamais pour l'autre personne.",
  "I want safety follow-up": "Je souhaite un suivi de sécurité",
  "Save this as a private safety follow-up request. For immediate danger, contact local emergency services.":
    "Enregistrer comme demande privée de suivi. En cas de danger immédiat, contactez les services d'urgence locaux.",
  "Open the Safety Center": "Ouvrir le centre de sécurité",
  "Your private response is saved.": "Votre réponse privée est enregistrée.",
  "Save private response": "Enregistrer la réponse privée",
  "Keep previous response": "Garder la réponse précédente",
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
  "They agreed that I can store this email for DateHaja safety plans.":
    "Deze persoon stemt ermee in dat ik dit e-mailadres bewaar voor DateHaja-veiligheidsplannen.",
  "Ask me how the date went": "Vraag na de date hoe het ging",
  "A private, optional check-in after the planned end time.":
    "Een privé en optionele check-in na de geplande eindtijd.",
  "Save private safety settings": "Privé-instellingen opslaan",
  "Sign in to add a trusted contact and choose whether DateHaja checks in after a date.":
    "Log in om een vertrouwd contact toe te voegen en een check-in na de date te kiezen.",
  "How did it go?": "Hoe ging het?",
  "The plan is complete. Your private check-in is ready.":
    "Het plan is afgerond. Je privé-check-in staat klaar.",
  "You're both in. Here's everything you need.":
    "Jullie hebben allebei toegezegd. Hier staat alles wat je nodig hebt.",
  Reserved: "Gereserveerd",
  "Your evening is held.": "Je avond is gereserveerd.",
  "The calendar event is tentative while the other person decides.":
    "De agenda-afspraak blijft voorlopig terwijl de ander beslist.",
  Finalized: "Bevestigd",
  "The date is on.": "De date gaat door.",
  "Your calendar receives the public venue and confirmed time.":
    "Je agenda ontvangt de openbare locatie en bevestigde tijd.",
  "The evening is released.": "Je avond is weer vrij.",
  "Subscribed calendars receive the cancellation from the same event.":
    "Geabonneerde agenda's ontvangen de annulering in dezelfde afspraak.",
  "Private calendar link created.": "Privé-agendalink gemaakt.",
  "Private calendar link copied.": "Privé-agendalink gekopieerd.",
  "Paste the copied link into Google Calendar.":
    "Plak de gekopieerde link in Google Agenda.",
  "Live calendar status": "Actuele agendastatus",
  "Subscribe once; DateHaja keeps the same event ID as it moves from reserved to finalized or cancelled.":
    "Abonneer één keer; dezelfde afspraak verandert van gereserveerd naar bevestigd of geannuleerd.",
  "Google Calendar": "Google Agenda",
  "Apple / calendar app": "Apple / agenda-app",
  "Copy private link": "Privélink kopiëren",
  "Anyone with this secret link can read your date times. Calendar apps refresh on their own schedule.":
    "Iedereen met deze geheime link kan je datetijden zien. Agenda-apps verversen volgens hun eigen schema.",
  "Private response saved": "Privéreactie opgeslagen",
  "Thanks for checking in.": "Bedankt voor je check-in.",
  "Your answers are never shown to your match. They help DateHaja improve matching, venues, and safety follow-up.":
    "Je antwoorden worden nooit aan je match getoond. Ze helpen matching, locaties en veiligheidsopvolging te verbeteren.",
  "Update response": "Reactie bijwerken",
  "After the date": "Na de date",
  "How did it feel?": "Hoe voelde het?",
  "Entirely optional and private. Your match never sees these answers.":
    "Helemaal optioneel en privé. Je match ziet deze antwoorden nooit.",
  "What happened?": "Wat is er gebeurd?",
  "We met": "We hebben elkaar ontmoet",
  "They didn't show": "De ander kwam niet opdagen",
  "I left early": "Ik ben vroeg weggegaan",
  "I didn't go": "Ik ben niet gegaan",
  "Did you feel safe?": "Voelde je je veilig?",
  Uncomfortable: "Ongemakkelijk",
  "Prefer not to say": "Zeg ik liever niet",
  "Would you meet them again?": "Zou je die persoon opnieuw ontmoeten?",
  Maybe: "Misschien",
  "How was the venue?": "Hoe was de locatie?",
  optional: "optioneel",
  "Venue rating": "Beoordeling locatie",
  star: "ster",
  stars: "sterren",
  "Anything else?": "Nog iets?",
  "A private note for DateHaja — never your match.":
    "Een privénotitie voor DateHaja — nooit voor je match.",
  "I want safety follow-up": "Ik wil veiligheidsopvolging",
  "Save this as a private safety follow-up request. For immediate danger, contact local emergency services.":
    "Opslaan als privéverzoek om veiligheidsopvolging. Neem bij direct gevaar contact op met lokale hulpdiensten.",
  "Open the Safety Center": "Veiligheidscentrum openen",
  "Your private response is saved.": "Je privéreactie is opgeslagen.",
  "Save private response": "Privéreactie opslaan",
  "Keep previous response": "Vorige reactie behouden",
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
  "They agreed that I can store this email for DateHaja safety plans.":
    "Personen har godkänt att jag sparar e-posten för trygghetsplaner i DateHaja.",
  "Ask me how the date went": "Fråga hur dejten gick",
  "A private, optional check-in after the planned end time.":
    "En privat, valfri avstämning efter planerad sluttid.",
  "Save private safety settings": "Spara privata säkerhetsinställningar",
  "Sign in to add a trusted contact and choose whether DateHaja checks in after a date.":
    "Logga in för att lägga till en trygghetskontakt och välja avstämning efter dejten.",
  "How did it go?": "Hur gick det?",
  "The plan is complete. Your private check-in is ready.":
    "Planen är avslutad. Din privata avstämning är redo.",
  "You're both in. Here's everything you need.":
    "Ni har båda tackat ja. Här är allt du behöver.",
  Reserved: "Reserverad",
  "Your evening is held.": "Din kväll är reserverad.",
  "The calendar event is tentative while the other person decides.":
    "Kalenderhändelsen är preliminär medan den andra personen bestämmer sig.",
  Finalized: "Bekräftad",
  "The date is on.": "Dejten blir av.",
  "Your calendar receives the public venue and confirmed time.":
    "Din kalender får den offentliga platsen och bekräftade tiden.",
  "The evening is released.": "Kvällen är ledig igen.",
  "Subscribed calendars receive the cancellation from the same event.":
    "Prenumererade kalendrar får avbokningen i samma händelse.",
  "Private calendar link created.": "Privat kalenderlänk skapad.",
  "Private calendar link copied.": "Privat kalenderlänk kopierad.",
  "Paste the copied link into Google Calendar.":
    "Klistra in den kopierade länken i Google Kalender.",
  "Live calendar status": "Aktuell kalenderstatus",
  "Subscribe once; DateHaja keeps the same event ID as it moves from reserved to finalized or cancelled.":
    "Prenumerera en gång; samma händelse går från reserverad till bekräftad eller avbokad.",
  "Google Calendar": "Google Kalender",
  "Apple / calendar app": "Apple / kalenderapp",
  "Copy private link": "Kopiera privat länk",
  "Anyone with this secret link can read your date times. Calendar apps refresh on their own schedule.":
    "Den som har den hemliga länken kan se dina dejttider. Kalenderappar uppdaterar enligt eget schema.",
  "Private response saved": "Privat svar sparat",
  "Thanks for checking in.": "Tack för att du berättade.",
  "Your answers are never shown to your match. They help DateHaja improve matching, venues, and safety follow-up.":
    "Dina svar visas aldrig för din matchning. De hjälper oss förbättra matchning, platser och säkerhetsuppföljning.",
  "Update response": "Uppdatera svar",
  "After the date": "Efter dejten",
  "How did it feel?": "Hur kändes det?",
  "Entirely optional and private. Your match never sees these answers.":
    "Helt valfritt och privat. Din matchning ser aldrig svaren.",
  "What happened?": "Vad hände?",
  "We met": "Vi träffades",
  "They didn't show": "Personen kom inte",
  "I left early": "Jag gick tidigt",
  "I didn't go": "Jag gick inte dit",
  "Did you feel safe?": "Kände du dig trygg?",
  Uncomfortable: "Obekvämt",
  "Prefer not to say": "Vill inte svara",
  "Would you meet them again?": "Skulle du träffa personen igen?",
  Maybe: "Kanske",
  "How was the venue?": "Hur var platsen?",
  optional: "valfritt",
  "Venue rating": "Betyg på platsen",
  star: "stjärna",
  stars: "stjärnor",
  "Anything else?": "Något mer?",
  "A private note for DateHaja — never your match.":
    "En privat anteckning till DateHaja — aldrig till din matchning.",
  "I want safety follow-up": "Jag vill ha säkerhetsuppföljning",
  "Save this as a private safety follow-up request. For immediate danger, contact local emergency services.":
    "Spara som en privat begäran om säkerhetsuppföljning. Kontakta lokal räddningstjänst vid omedelbar fara.",
  "Open the Safety Center": "Öppna säkerhetscentret",
  "Your private response is saved.": "Ditt privata svar har sparats.",
  "Save private response": "Spara privat svar",
  "Keep previous response": "Behåll föregående svar",
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
    const stored =
      window.localStorage.getItem(STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_STORAGE_KEY);
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
    const title = `DateHaja — ${translate(locale, "Let's date. We'll make the plan.")}`;
    const description = translate(
      locale,
      "No profiles to browse. No conversation to keep alive. DateHaja finds a compatible person, researches a real place, and sends one private invitation to each of you.",
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
