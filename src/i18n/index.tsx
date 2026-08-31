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
  "Let's make it a date": "우리, 데이트하자",
  "Pick a night.": "저녁 하나 비워봐.",
  "Let's make it a date.": "우리, 데이트하자.",
  "Find me a date": "데이트 잡아줘",
  "One night is enough": "저녁 하나면 충분해요",
  "Shall we make it a date?": "우리, 데이트할까요?",
  "Pick a night. Let's make it a date.": "저녁 하나 비워봐. 우리, 데이트하자.",
  "See what happens next": "다음 장면 보기",
  "Your Friday, planned": "준비된 금요일",
  "Dinner, then dessert if it feels right.":
    "저녁을 먹고, 마음이 맞으면 디저트까지.",
  "New people, real plans": "새로운 사람, 진짜 계획",
  "What do you want to do?": "뭐 하고 싶어요?",
  "Find someone to do it with.": "그걸 같이할 사람을 찾아드릴게요.",
  "A film, a walk, a gallery—or whatever sounds good. Tell us the date you want; we'll find someone compatible to share it.":
    "영화, 산책, 전시처럼 지금 하고 싶은 데이트를 말해주세요. 그 시간을 함께 즐길 새로운 사람을 찾아드릴게요.",
  "Find someone to go with": "함께할 사람 찾기",
  "The activity comes first": "하고 싶은 일이 먼저",
  "No forced chemistry": "억지로 호감을 만들 필요 없음",
  "No second stop required": "2차는 없어도 돼요",
  "Your idea comes first": "하고 싶은 것이 먼저",
  "What do you want to do next?": "다음엔 뭐 하고 싶어요?",
  "Bring the idea. We'll find the person.":
    "하고 싶은 걸 말해요. 함께할 사람은 우리가 찾을게요.",
  "Your idea. One new person. One real date.":
    "하고 싶은 것 하나. 새로운 사람 한 명. 진짜 데이트 한 번.",
  "Start with the date you actually want.":
    "진짜 하고 싶은 데이트에서 시작해요.",
  "The plan comes first. Then we find the right person to join you.":
    "계획이 먼저예요. 그다음 함께할 사람을 찾습니다.",
  "Name the date": "하고 싶은 데이트 말하기",
  "A film and nothing after? That's a complete date.":
    "영화만 보고 끝? 그것만으로도 완성된 데이트예요.",
  "Your date idea": "원하는 데이트",
  "Watch an indie film": "독립영화 한 편 보기",
  "Film only. No second stop needed.": "영화만. 2차는 없어도 돼요.",
  "Find someone who wants the same thing": "같은 걸 하고 싶은 사람 찾기",
  "We match the activity, timing, and the person—not a restaurant reservation.":
    "식당 예약이 아니라 활동, 시간, 사람을 함께 맞춰요.",
  "Film night": "영화 보는 날",
  "One screening · about {amount}": "상영 한 편 · 약 {amount}",
  "You both want to see a film. Nothing else has to be added.":
    "두 사람 모두 영화를 보고 싶어 해요. 다른 일정을 더할 필요는 없어요.",
  "Go do exactly that": "그대로 만나서 하기",
  "Both say yes. Meet in public. No pressure to make it more.":
    "둘 다 좋다고 하면 공개된 장소에서 만나요. 그 이상을 억지로 이어갈 필요는 없어요.",
  "Your idea, matched": "하고 싶은 것, 매칭 완료",
  "One film. One new person. That's the whole plan.":
    "영화 한 편. 새로운 사람 한 명. 그걸로 충분해요.",
  "What would you like to do?": "뭐 하고 싶어요?",
  "Start with the date, not the profile. A film by itself is a complete plan.":
    "프로필보다 데이트에서 시작해요. 영화 한 편만으로도 완성된 계획이에요.",
  "Watch an indie film. Happy to call it a night when the credits roll.":
    "독립영화 한 편 보기. 엔딩 크레딧이 올라가면 기분 좋게 마쳐도 좋아요.",
  "Watch a film": "영화 보기",
  "Take a walk": "산책하기",
  "See an exhibition": "전시 보기",
  "Hear live music": "라이브 음악 듣기",
  "Tell us what you'd like to do on this date.":
    "이번 데이트에서 하고 싶은 걸 알려주세요.",
  "Both said yes": "두 사람 모두 좋아요",
  "Added to calendar": "캘린더에 추가",
  "From “I'm free” to “see you there.”": "“시간 돼요”에서 “그때 봐요”까지.",
  "Three small choices. No audition in between.":
    "작은 선택 세 번이면 충분해요. 나를 증명할 필요는 없어요.",
  "Choose a night": "저녁 하나 고르기",
  Friday: "금요일",
  "Friday, 7–10 PM. That's all we need.":
    "금요일 저녁 7시부터 10시. 필요한 건 이것뿐이에요.",
  "One person, one public place, one plan that fits.":
    "한 사람, 공개된 장소 하나, 나에게 맞는 계획 하나.",
  "When you both choose yes, the date is ready for your calendar.":
    "두 사람 모두 좋다고 하면 약속이 확정되고 캘린더에 담겨요.",
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
  "No profiles to browse. No conversation to keep alive. Datehaja finds a compatible person, researches a real place, and sends one private invitation to each of you.":
    "프로필을 넘겨보거나 대화를 억지로 이어갈 필요가 없습니다. Datehaja가 잘 맞는 사람과 실제 장소를 찾고, 두 사람에게 각각 비공개 초대를 보냅니다.",
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
  "The Datehaja route": "Datehaja 방식",
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
  "Datehaja Concierge sends every invitation separately. Before you both accept, your match gets a first name, age, neighbourhood, and a few interests — never your inbox or number.":
    "Datehaja 컨시어지가 초대를 각자에게 따로 보냅니다. 두 사람 모두 수락하기 전에는 이름, 나이, 동네, 몇 가지 관심사만 보이며 이메일과 전화번호는 절대 공개되지 않습니다.",
  "Email address": "이메일 주소",
  "Phone number": "전화번호",
  "Home address": "집 주소",
  "Exact location": "정확한 위치",
  "Full name": "성명",
  "Social handles": "소셜 계정",
  "Not shared": "공유 안 함",
  "Datehaja is 18+. We do not verify identity. Read exactly what we do and don't do in the":
    "Datehaja는 만 18세 이상만 이용할 수 있으며 신원을 인증하지 않습니다. 제공하는 보호 조치와 한계를",
  "Safety Center": "안전 센터",
  "Your invitation is open": "초대가 열려 있습니다",
  "When are you free?": "언제 시간이 비나요?",
  "That is still the only question we need answered.":
    "여전히 필요한 답은 이것 하나뿐입니다.",
  "Plan my first date": "첫 데이트 계획 받기",
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
  "Datehaja home": "Datehaja 홈",
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
  "I'm 18 or over, and I understand Datehaja does not verify identity.":
    "만 18세 이상이며 Datehaja가 신원을 인증하지 않는다는 점을 이해했습니다.",
  "Create my account": "계정 만들기",
  "Already have an account?": "이미 계정이 있나요?",
  "New here?": "처음이신가요?",
  "Create an account": "계정 만들기",
  "Your email is used only by Datehaja Concierge to reach you. It is never shown to another user.":
    "이메일은 Datehaja 컨시어지가 연락할 때만 사용하며 다른 사용자에게 공개하지 않습니다.",
  "How privacy works": "개인정보 보호 방식",
  "Datehaja is for adults only — please confirm you're 18 or over.":
    "Datehaja는 성인 전용입니다. 만 18세 이상인지 확인해 주세요.",
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
  "Let's make it a date": "デートにしよう",
  "Pick a night.": "夜をひとつ選んで。",
  "Let's make it a date.": "デートにしよう。",
  "Find me a date": "デートを見つける",
  "One night is enough": "夜ひとつで十分",
  "Shall we make it a date?": "デートにしませんか？",
  "Pick a night. Let's make it a date.": "夜をひとつ選んで。デートにしよう。",
  "See what happens next": "次の流れを見る",
  "Your Friday, planned": "予定が整った金曜日",
  "Dinner, then dessert if it feels right.":
    "夕食を楽しんで、気が合えばデザートへ。",
  "New people, real plans": "新しい出会い、実際のプラン",
  "What do you want to do?": "何をしたいですか？",
  "Find someone to do it with.": "一緒に楽しむ人を見つけましょう。",
  "A film, a walk, a gallery—or whatever sounds good. Tell us the date you want; we'll find someone compatible to share it.":
    "映画、散歩、展覧会など、したいデートを教えてください。その時間を一緒に楽しめる新しい相手を探します。",
  "Find someone to go with": "一緒に行く人を探す",
  "The activity comes first": "やりたいことが先",
  "No forced chemistry": "無理に盛り上げなくていい",
  "No second stop required": "二軒目はなくてもいい",
  "Your idea comes first": "あなたのアイデアが先",
  "What do you want to do next?": "次は何をしたいですか？",
  "Bring the idea. We'll find the person.":
    "やりたいことを教えてください。一緒に行く人は私たちが探します。",
  "Your idea. One new person. One real date.":
    "やりたいこと一つ、新しい相手一人、本当のデート一回。",
  "Start with the date you actually want.":
    "本当にしたいデートから始めましょう。",
  "The plan comes first. Then we find the right person to join you.":
    "まずプランを決め、そのあと一緒に楽しめる相手を探します。",
  "Name the date": "したいデートを伝える",
  "A film and nothing after? That's a complete date.":
    "映画だけで終わり？ それで十分、完成したデートです。",
  "Your date idea": "あなたのデート案",
  "Watch an indie film": "ミニシアターで映画を観る",
  "Film only. No second stop needed.": "映画だけ。二軒目は不要です。",
  "Find someone who wants the same thing": "同じことをしたい人を探す",
  "We match the activity, timing, and the person—not a restaurant reservation.":
    "レストラン予約ではなく、体験、時間、相手を合わせます。",
  "Film night": "映画の夜",
  "One screening · about {amount}": "上映一本・約{amount}",
  "You both want to see a film. Nothing else has to be added.":
    "二人とも映画を観たいと思っています。ほかに予定を足す必要はありません。",
  "Go do exactly that": "そのまま会って楽しむ",
  "Both say yes. Meet in public. No pressure to make it more.":
    "二人が同意したら公共の場所で会います。それ以上を無理に続ける必要はありません。",
  "Your idea, matched": "あなたのアイデアに相手が見つかりました",
  "One film. One new person. That's the whole plan.":
    "映画一本、新しい相手一人。それで十分です。",
  "What would you like to do?": "何をしたいですか？",
  "Start with the date, not the profile. A film by itself is a complete plan.":
    "プロフィールではなくデートから。映画一本だけでも完成したプランです。",
  "Watch an indie film. Happy to call it a night when the credits roll.":
    "ミニシアターで映画を一本。エンドロールで気持ちよく解散しても大丈夫。",
  "Watch a film": "映画を観る",
  "Take a walk": "散歩する",
  "See an exhibition": "展覧会を見る",
  "Hear live music": "ライブ音楽を聴く",
  "Tell us what you'd like to do on this date.":
    "このデートで何をしたいか教えてください。",
  "Both said yes": "二人ともYES",
  "Added to calendar": "カレンダーに追加",
  "From “I'm free” to “see you there.”":
    "「空いてる」から「そこで会おう」まで。",
  "Three small choices. No audition in between.":
    "3つの小さな選択だけ。自分を審査にかける必要はありません。",
  "Choose a night": "夜をひとつ選ぶ",
  Friday: "金曜日",
  "Friday, 7–10 PM. That's all we need.":
    "金曜の19時から22時。それだけで十分です。",
  "One person, one public place, one plan that fits.":
    "一人の相手、公共の場所、あなたに合う一つのプラン。",
  "When you both choose yes, the date is ready for your calendar.":
    "二人がYESなら、デートが確定してカレンダーへ。",
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
  "No profiles to browse. No conversation to keep alive. Datehaja finds a compatible person, researches a real place, and sends one private invitation to each of you.":
    "プロフィール探しも、無理な会話も不要です。Datehajaが相性のよい相手と実在する場所を探し、それぞれに非公開の招待を送ります。",
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
  "The Datehaja route": "Datehajaの流れ",
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
  "Datehaja Concierge sends every invitation separately. Before you both accept, your match gets a first name, age, neighbourhood, and a few interests — never your inbox or number.":
    "Datehajaコンシェルジュが招待を別々に送ります。二人が承諾するまでは、名前、年齢、エリア、いくつかの興味だけが表示され、メールや電話番号は公開されません。",
  "Email address": "メールアドレス",
  "Phone number": "電話番号",
  "Home address": "自宅住所",
  "Exact location": "正確な位置",
  "Full name": "氏名",
  "Social handles": "SNSアカウント",
  "Not shared": "共有しない",
  "Datehaja is 18+. We do not verify identity. Read exactly what we do and don't do in the":
    "Datehajaは18歳以上向けで、本人確認は行いません。詳しい保護内容と限界は",
  "Safety Center": "セーフティセンター",
  "Your invitation is open": "招待を受付中",
  "When are you free?": "いつ空いていますか？",
  "That is still the only question we need answered.":
    "必要なのは、今もこの答えだけです。",
  "Plan my first date": "最初のデートを計画する",
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
  "Datehaja home": "Datehajaホーム",
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
  "I'm 18 or over, and I understand Datehaja does not verify identity.":
    "18歳以上で、Datehajaが本人確認を行わないことを理解しました。",
  "Create my account": "アカウントを作成",
  "Already have an account?": "すでにアカウントをお持ちですか？",
  "New here?": "初めてですか？",
  "Create an account": "アカウントを作成",
  "Your email is used only by Datehaja Concierge to reach you. It is never shown to another user.":
    "メールはDatehajaコンシェルジュからの連絡にのみ使用し、他のユーザーには表示しません。",
  "How privacy works": "プライバシーの仕組み",
  "Datehaja is for adults only — please confirm you're 18 or over.":
    "Datehajaは成人向けです。18歳以上であることを確認してください。",
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
  "Let's make it a date": "Machen wir ein Date daraus",
  "Pick a night.": "Wähl einen Abend.",
  "Let's make it a date.": "Machen wir ein Date daraus.",
  "Find me a date": "Ein Date finden",
  "One night is enough": "Ein Abend genügt",
  "Shall we make it a date?": "Machen wir ein Date daraus?",
  "Pick a night. Let's make it a date.":
    "Wähl einen Abend. Machen wir ein Date daraus.",
  "See what happens next": "Sieh, was als Nächstes passiert",
  "Your Friday, planned": "Dein Freitag, fertig geplant",
  "Dinner, then dessert if it feels right.":
    "Erst Abendessen – und wenn es passt, noch ein Dessert.",
  "New people, real plans": "Neue Menschen, echte Pläne",
  "What do you want to do?": "Was möchtest du unternehmen?",
  "Find someone to do it with.": "Finde jemanden, der mitmacht.",
  "A film, a walk, a gallery—or whatever sounds good. Tell us the date you want; we'll find someone compatible to share it.":
    "Film, Spaziergang, Ausstellung oder etwas ganz anderes: Sag uns, welches Date du möchtest. Wir finden jemanden, der dazu passt.",
  "Find someone to go with": "Begleitung finden",
  "The activity comes first": "Die Aktivität kommt zuerst",
  "No forced chemistry": "Keine erzwungene Chemie",
  "No second stop required": "Keine zweite Station nötig",
  "Your idea comes first": "Deine Idee kommt zuerst",
  "What do you want to do next?": "Was möchtest du als Nächstes unternehmen?",
  "Bring the idea. We'll find the person.":
    "Bring die Idee mit. Wir finden die passende Person.",
  "Your idea. One new person. One real date.":
    "Deine Idee. Ein neuer Mensch. Ein echtes Date.",
  "Start with the date you actually want.":
    "Beginne mit dem Date, das du wirklich möchtest.",
  "The plan comes first. Then we find the right person to join you.":
    "Zuerst kommt der Plan. Dann finden wir die passende Begleitung.",
  "Name the date": "Sag, was du unternehmen willst",
  "A film and nothing after? That's a complete date.":
    "Nur ein Film und danach nichts? Das ist ein vollständiges Date.",
  "Your date idea": "Deine Date-Idee",
  "Watch an indie film": "Einen Indie-Film ansehen",
  "Film only. No second stop needed.":
    "Nur der Film. Keine zweite Station nötig.",
  "Find someone who wants the same thing": "Finde jemanden mit derselben Idee",
  "We match the activity, timing, and the person—not a restaurant reservation.":
    "Wir bringen Aktivität, Zeit und Menschen zusammen – keine Restaurantreservierung.",
  "Film night": "Filmabend",
  "One screening · about {amount}": "Eine Vorstellung · etwa {amount}",
  "You both want to see a film. Nothing else has to be added.":
    "Ihr möchtet beide einen Film sehen. Mehr muss nicht geplant werden.",
  "Go do exactly that": "Trefft euch genau dafür",
  "Both say yes. Meet in public. No pressure to make it more.":
    "Beide sagen Ja und treffen sich öffentlich. Kein Druck, mehr daraus zu machen.",
  "Your idea, matched": "Deine Idee, passend besetzt",
  "One film. One new person. That's the whole plan.":
    "Ein Film. Ein neuer Mensch. Das ist der ganze Plan.",
  "What would you like to do?": "Was möchtest du unternehmen?",
  "Start with the date, not the profile. A film by itself is a complete plan.":
    "Beginne mit dem Date, nicht mit dem Profil. Ein Film allein ist ein vollständiger Plan.",
  "Watch an indie film. Happy to call it a night when the credits roll.":
    "Einen Indie-Film ansehen. Beim Abspann darf der Abend gern enden.",
  "Watch a film": "Einen Film ansehen",
  "Take a walk": "Spazieren gehen",
  "See an exhibition": "Eine Ausstellung besuchen",
  "Hear live music": "Live-Musik hören",
  "Tell us what you'd like to do on this date.":
    "Sag uns, was du bei diesem Date unternehmen möchtest.",
  "Both said yes": "Beide haben Ja gesagt",
  "Added to calendar": "Zum Kalender hinzugefügt",
  "From “I'm free” to “see you there.”": "Von „Ich habe Zeit“ bis „Bis dann“.",
  "Three small choices. No audition in between.":
    "Drei kleine Entscheidungen. Kein Vorsprechen dazwischen.",
  "Choose a night": "Wähl einen Abend",
  Friday: "Freitag",
  "Friday, 7–10 PM. That's all we need.":
    "Freitag, 19–22 Uhr. Mehr brauchen wir nicht.",
  "One person, one public place, one plan that fits.":
    "Eine Person, ein öffentlicher Ort, ein passender Plan.",
  "When you both choose yes, the date is ready for your calendar.":
    "Wenn ihr beide Ja sagt, steht das Date für deinen Kalender bereit.",
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
  "No profiles to browse. No conversation to keep alive. Datehaja finds a compatible person, researches a real place, and sends one private invitation to each of you.":
    "Keine Profile durchsuchen, keine Gespräche künstlich am Leben halten. Datehaja findet eine passende Person, recherchiert einen echten Ort und sendet euch getrennte private Einladungen.",
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
  "The Datehaja route": "Der Datehaja-Weg",
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
  "Datehaja Concierge sends every invitation separately. Before you both accept, your match gets a first name, age, neighbourhood, and a few interests — never your inbox or number.":
    "Datehaja Concierge versendet jede Einladung getrennt. Bevor ihr beide zusagt, sieht dein Match nur Vorname, Alter, Viertel und einige Interessen — niemals E-Mail oder Telefonnummer.",
  "Email address": "E-Mail-Adresse",
  "Phone number": "Telefonnummer",
  "Home address": "Wohnadresse",
  "Exact location": "Genauer Standort",
  "Full name": "Vollständiger Name",
  "Social handles": "Social-Media-Namen",
  "Not shared": "Nicht geteilt",
  "Datehaja is 18+. We do not verify identity. Read exactly what we do and don't do in the":
    "Datehaja ist ab 18. Wir prüfen keine Identitäten. Was wir tun und nicht tun, steht im",
  "Safety Center": "Sicherheitsbereich",
  "Your invitation is open": "Deine Einladung ist offen",
  "When are you free?": "Wann hast du Zeit?",
  "That is still the only question we need answered.":
    "Das ist weiterhin die einzige Frage, die wir stellen.",
  "Plan my first date": "Mein erstes Date planen",
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
  "Datehaja home": "Datehaja Startseite",
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
  "I'm 18 or over, and I understand Datehaja does not verify identity.":
    "Ich bin mindestens 18 und verstehe, dass Datehaja keine Identitäten prüft.",
  "Create my account": "Konto erstellen",
  "Already have an account?": "Schon ein Konto?",
  "New here?": "Neu hier?",
  "Create an account": "Konto erstellen",
  "Your email is used only by Datehaja Concierge to reach you. It is never shown to another user.":
    "Deine E-Mail wird nur vom Datehaja Concierge verwendet und niemals anderen Nutzern gezeigt.",
  "How privacy works": "So funktioniert Datenschutz",
  "Datehaja is for adults only — please confirm you're 18 or over.":
    "Datehaja ist nur für Erwachsene. Bitte bestätige, dass du mindestens 18 bist.",
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

Object.assign(ko, {
  "Preview of {agent}": "{agent} 미리보기",
  "my agent": "내 에이전트",
  "Make your other self feel like yours.": "나만의 또 다른 나를 만들어보세요.",
  "This is the face that goes into the virtual world, brings stories home, and slowly becomes recognizable as your stand-in.":
    "가상 세계로 나가 이야기를 가져오고, 점점 내 분신으로 익숙해질 얼굴이에요.",
  "Change it anytime": "언제든 변경",
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
  None: "없음",
  Glasses: "안경",
  Headphones: "헤드폰",
  "Star clip": "별 핀",
  Scarf: "스카프",
  "My other self": "나의 분신",
  "Make my Agent recognizable": "한눈에 알아볼 수 있는 나의 에이전트",
  "Your look travels with the agent through dates, transcripts, and debriefs. It is playful identity—not a claim about your real appearance.":
    "이 모습은 데이트, 대화 기록, 리포트까지 에이전트와 함께해요. 실제 외모를 뜻하는 것이 아니라 즐겁게 표현하는 정체성이에요.",
});

Object.assign(ja, {
  "Preview of {agent}": "{agent}のプレビュー",
  "my agent": "私のエージェント",
  "Make your other self feel like yours.": "もう一人の自分を、自分らしく。",
  "This is the face that goes into the virtual world, brings stories home, and slowly becomes recognizable as your stand-in.":
    "仮想世界へ出かけ、物語を持ち帰り、少しずつあなたの分身として親しまれる顔です。",
  "Change it anytime": "いつでも変更",
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
  None: "なし",
  Glasses: "メガネ",
  Headphones: "ヘッドホン",
  "Star clip": "星のピン",
  Scarf: "スカーフ",
  "My other self": "私の分身",
  "Make my Agent recognizable": "自分のエージェントを見分けやすく",
  "Your look travels with the agent through dates, transcripts, and debriefs. It is playful identity—not a claim about your real appearance.":
    "この姿はデート、会話記録、レポートまでエージェントと共に移動します。実際の外見を示すものではなく、楽しいアイデンティティです。",
});

Object.assign(de, {
  "Preview of {agent}": "Vorschau von {agent}",
  "my agent": "mein Agent",
  "Make your other self feel like yours.":
    "Mach dein zweites Ich unverwechselbar.",
  "This is the face that goes into the virtual world, brings stories home, and slowly becomes recognizable as your stand-in.":
    "Dieses Gesicht geht in die virtuelle Welt, bringt Geschichten mit und wird zu deinem vertrauten Stellvertreter.",
  "Change it anytime": "Jederzeit ändern",
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
  None: "Keins",
  Glasses: "Brille",
  Headphones: "Kopfhörer",
  "Star clip": "Sternspange",
  Scarf: "Schal",
  "My other self": "Mein zweites Ich",
  "Make my Agent recognizable": "Mach deinen Agenten unverwechselbar",
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
  "Choose an image file.": "Choisissez un fichier image.",
  "Photos must be under 6MB.": "Les photos doivent faire moins de 6 Mo.",
  "Upload failed.": "Le téléversement a échoué.",
  "Optional photo saved.": "Photo facultative enregistrée.",
  "Write what a date would genuinely want to know. Contact details are removed automatically.":
    "Écrivez ce qu’une rencontre voudrait vraiment savoir. Les coordonnées sont retirées automatiquement.",
  "Your optional profile": "Votre photo facultative",
  "Honest details reduce awkward surprises. Reviews check accuracy and respect, never attractiveness.":
    "Des informations sincères évitent les mauvaises surprises. Les avis évaluent l’exactitude et le respect, jamais l’attirance.",
  "There is no right answer. Choose ‘No preference’ if chemistry matters more than a type.":
    "Il n’y a pas de bonne réponse. Choisissez « Sans préférence » si l’alchimie compte plus qu’un type.",
  "Optional. This is about personal taste, not rating anyone's looks.":
    "Facultatif. Il s’agit de goûts personnels, pas de noter l’apparence.",
  "Photo saved. Choose when a match can see it below.":
    "Photo enregistrée. Choisissez ci-dessous quand elle sera visible.",
  "Honest details lead to fewer awkward surprises and better matches. Private post-date feedback checks profile accuracy, not attractiveness.":
    "Des informations sincères évitent les surprises et améliorent les rencontres. Les avis privés vérifient l’exactitude du profil, pas l’attirance.",
  "‘No preference’ removes this factor from matching.":
    "« Sans préférence » retire ce critère de la mise en relation.",
  "Optional personal taste, never an appearance score.":
    "Goût personnel facultatif, jamais une note d’apparence.",
  "They receive the same kind of profile card. Contact details and exact location stay private.":
    "L’autre personne reçoit la même fiche. Les coordonnées et la position exacte restent privées.",
  "Your review stays private. Only an explicit yes is revealed, and only when you both choose it.":
    "Votre avis reste privé. Seul un oui explicite et mutuel est révélé.",
  "Your match card": "Votre fiche de rencontre",
  "Your photo is already on the match card by your choice. The venue's public address is added after you both accept.":
    "Votre photo figure déjà sur la fiche selon votre choix. L’adresse publique est ajoutée après votre double accord.",
  "Your private answers matched. Pick another activity when you're ready; every other review answer stays private.":
    "Vos réponses privées concordent. Choisissez une autre activité quand vous le souhaitez ; les autres réponses restent privées.",
  "Your answer stays sealed while we wait. Neither person sees a no, maybe, or who answered first.":
    "Votre réponse reste scellée. Personne ne voit un non, un peut-être ou qui a répondu en premier.",
  "Neither person sees who said no or maybe. Accuracy, respect, and safety feedback only improve future matching.":
    "Personne ne voit qui a répondu non ou peut-être. Les retours sur l’exactitude, le respect et la sécurité servent uniquement aux prochaines rencontres.",
  "A photo is optional. You decide whether a match sees it with your profile card or only after you both accept.":
    "La photo est facultative. Vous choisissez si elle apparaît sur la fiche ou seulement après votre double accord.",
  "Photo privacy saved.": "Visibilité de la photo enregistrée.",
  "Let's make it a date": "On se donne rendez-vous",
  "Pick a night.": "Choisissez une soirée.",
  "Let's make it a date.": "On se donne rendez-vous.",
  "Find me a date": "Trouver mon rendez-vous",
  "One night is enough": "Une soirée suffit",
  "Shall we make it a date?": "On se donne rendez-vous ?",
  "Pick a night. Let's make it a date.":
    "Choisissez une soirée. On se donne rendez-vous.",
  "See what happens next": "Voir la suite",
  "Your Friday, planned": "Votre vendredi, déjà organisé",
  "Dinner, then dessert if it feels right.":
    "Dîner, puis un dessert si le courant passe.",
  "New people, real plans": "De nouvelles rencontres, de vrais projets",
  "What do you want to do?": "Qu’avez-vous envie de faire ?",
  "Find someone to do it with.": "Trouvez quelqu’un pour le faire avec vous.",
  "A film, a walk, a gallery—or whatever sounds good. Tell us the date you want; we'll find someone compatible to share it.":
    "Un film, une balade, une exposition ou toute autre envie : décrivez le rendez-vous souhaité, nous trouverons quelqu’un pour le partager.",
  "Find someone to go with": "Trouver quelqu’un avec qui y aller",
  "The activity comes first": "L’activité passe en premier",
  "No forced chemistry": "Aucune alchimie forcée",
  "No second stop required": "Aucune deuxième étape obligatoire",
  "Your idea comes first": "Votre idée passe en premier",
  "What do you want to do next?": "Qu’avez-vous envie de faire ensuite ?",
  "Bring the idea. We'll find the person.":
    "Apportez l’idée. Nous trouverons la personne.",
  "Your idea. One new person. One real date.":
    "Votre idée. Une nouvelle personne. Un vrai rendez-vous.",
  "Start with the date you actually want.":
    "Commencez par le rendez-vous dont vous avez vraiment envie.",
  "The plan comes first. Then we find the right person to join you.":
    "Le projet vient d’abord. Ensuite, nous trouvons la bonne personne pour vous accompagner.",
  "Name the date": "Décrivez le rendez-vous",
  "A film and nothing after? That's a complete date.":
    "Un film et rien après ? C’est déjà un rendez-vous complet.",
  "Your date idea": "Votre idée de rendez-vous",
  "Watch an indie film": "Voir un film indépendant",
  "Film only. No second stop needed.": "Le film suffit. Pas de deuxième étape.",
  "Find someone who wants the same thing":
    "Trouver quelqu’un qui en a aussi envie",
  "We match the activity, timing, and the person—not a restaurant reservation.":
    "Nous accordons l’activité, le moment et la personne, pas une réservation de restaurant.",
  "Film night": "Soirée cinéma",
  "One screening · about {amount}": "Une séance · environ {amount}",
  "You both want to see a film. Nothing else has to be added.":
    "Vous avez tous les deux envie de voir un film. Rien d’autre n’est nécessaire.",
  "Go do exactly that": "Retrouvez-vous pour faire exactement cela",
  "Both say yes. Meet in public. No pressure to make it more.":
    "Vous dites oui tous les deux et vous vous retrouvez dans un lieu public. Aucune obligation d’en faire plus.",
  "Your idea, matched": "Votre idée a trouvé sa personne",
  "One film. One new person. That's the whole plan.":
    "Un film. Une nouvelle personne. C’est tout le programme.",
  "What would you like to do?": "Qu’avez-vous envie de faire ?",
  "Start with the date, not the profile. A film by itself is a complete plan.":
    "Commencez par le rendez-vous, pas par le profil. Un film seul est déjà un programme complet.",
  "Watch an indie film. Happy to call it a night when the credits roll.":
    "Voir un film indépendant et terminer tranquillement au générique si vous le souhaitez.",
  "Watch a film": "Voir un film",
  "Take a walk": "Faire une balade",
  "See an exhibition": "Voir une exposition",
  "Hear live music": "Écouter de la musique live",
  "Tell us what you'd like to do on this date.":
    "Dites-nous ce que vous aimeriez faire pendant ce rendez-vous.",
  "Both said yes": "Vous avez dit oui tous les deux",
  "Added to calendar": "Ajouté au calendrier",
  "From “I'm free” to “see you there.”":
    "De « je suis libre » à « à vendredi ».",
  "Three small choices. No audition in between.":
    "Trois petits choix. Aucun numéro de séduction à jouer.",
  "Choose a night": "Choisir une soirée",
  Friday: "Vendredi",
  "Friday, 7–10 PM. That's all we need.":
    "Vendredi, de 19 h à 22 h. C’est tout ce qu’il nous faut.",
  "One person, one public place, one plan that fits.":
    "Une personne, un lieu public, un plan qui vous correspond.",
  "When you both choose yes, the date is ready for your calendar.":
    "Quand vous dites oui tous les deux, le rendez-vous est confirmé dans votre calendrier.",
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
  "No profiles to browse. No conversation to keep alive. Datehaja finds a compatible person, researches a real place, and sends one private invitation to each of you.":
    "Aucun profil à parcourir, aucune conversation à entretenir. Datehaja trouve une personne compatible, vérifie un lieu réel et vous envoie deux invitations privées séparées.",
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
  "The Datehaja route": "Le parcours Datehaja",
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
  "Datehaja Concierge sends every invitation separately. Before you both accept, your match gets a first name, age, neighbourhood, and a few interests — never your inbox or number.":
    "Datehaja Concierge envoie chaque invitation séparément. Avant votre double accord, l'autre personne ne voit que prénom, âge, quartier et quelques centres d'intérêt — jamais votre e-mail ni votre numéro.",
  "Email address": "Adresse e-mail",
  "Phone number": "Numéro de téléphone",
  "Home address": "Adresse du domicile",
  "Exact location": "Localisation précise",
  "Full name": "Nom complet",
  "Social handles": "Comptes sociaux",
  "Not shared": "Non partagé",
  "Datehaja is 18+. We do not verify identity. Read exactly what we do and don't do in the":
    "Datehaja est réservé aux 18 ans et plus. Nous ne vérifions pas l'identité. Consultez nos mesures et leurs limites dans le",
  "Safety Center": "Centre de sécurité",
  "Your invitation is open": "Votre invitation est ouverte",
  "When are you free?": "Quand êtes-vous libre ?",
  "That is still the only question we need answered.":
    "C'est toujours la seule question à laquelle nous avons besoin d'une réponse.",
  "Plan my first date": "Planifier mon premier rendez-vous",
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
  "Datehaja home": "Accueil Datehaja",
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
  "I'm 18 or over, and I understand Datehaja does not verify identity.":
    "J'ai 18 ans ou plus et je comprends que Datehaja ne vérifie pas l'identité.",
  "Create my account": "Créer mon compte",
  "Already have an account?": "Vous avez déjà un compte ?",
  "New here?": "Nouveau ici ?",
  "Create an account": "Créer un compte",
  "Your email is used only by Datehaja Concierge to reach you. It is never shown to another user.":
    "Votre e-mail sert uniquement à Datehaja Concierge pour vous contacter et n'est jamais montré à un autre utilisateur.",
  "How privacy works": "Comment fonctionne la confidentialité",
  "Datehaja is for adults only — please confirm you're 18 or over.":
    "Datehaja est réservé aux adultes. Confirmez que vous avez au moins 18 ans.",
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
  "Choose an image file.": "Kies een afbeeldingsbestand.",
  "Photos must be under 6MB.": "Foto’s moeten kleiner zijn dan 6 MB.",
  "Upload failed.": "Upload mislukt.",
  "Optional photo saved.": "Optionele foto opgeslagen.",
  "Write what a date would genuinely want to know. Contact details are removed automatically.":
    "Schrijf wat een date echt over je wil weten. Contactgegevens worden automatisch verwijderd.",
  "Your optional profile": "Jouw optionele profielfoto",
  "Honest details reduce awkward surprises. Reviews check accuracy and respect, never attractiveness.":
    "Eerlijke informatie voorkomt ongemakkelijke verrassingen. Reviews gaan over juistheid en respect, nooit aantrekkelijkheid.",
  "There is no right answer. Choose ‘No preference’ if chemistry matters more than a type.":
    "Er is geen goed antwoord. Kies ‘Maakt niet uit’ als chemie belangrijker is dan een type.",
  "Optional. This is about personal taste, not rating anyone's looks.":
    "Optioneel. Dit gaat over persoonlijke smaak, niet over uiterlijk beoordelen.",
  "Photo saved. Choose when a match can see it below.":
    "Foto opgeslagen. Kies hieronder wanneer een match die ziet.",
  "Honest details lead to fewer awkward surprises and better matches. Private post-date feedback checks profile accuracy, not attractiveness.":
    "Eerlijke informatie voorkomt verrassingen en verbetert matches. Privéfeedback controleert profieljuistheid, niet aantrekkelijkheid.",
  "‘No preference’ removes this factor from matching.":
    "‘Maakt niet uit’ haalt deze factor uit de matching.",
  "Optional personal taste, never an appearance score.":
    "Optionele persoonlijke smaak, nooit een uiterlijksscore.",
  "They receive the same kind of profile card. Contact details and exact location stay private.":
    "De ander ontvangt hetzelfde soort profielkaart. Contactgegevens en exacte locatie blijven privé.",
  "Your review stays private. Only an explicit yes is revealed, and only when you both choose it.":
    "Je review blijft privé. Alleen een uitdrukkelijk wederzijds ja wordt gedeeld.",
  "Your match card": "Jouw matchkaart",
  "Your photo is already on the match card by your choice. The venue's public address is added after you both accept.":
    "Je foto staat door jouw keuze al op de matchkaart. Het openbare adres komt erbij nadat jullie beiden accepteren.",
  "Your private answers matched. Pick another activity when you're ready; every other review answer stays private.":
    "Jullie privéantwoorden komen overeen. Kies een nieuwe activiteit wanneer je wilt; alle andere antwoorden blijven privé.",
  "Your answer stays sealed while we wait. Neither person sees a no, maybe, or who answered first.":
    "Je antwoord blijft verzegeld. Niemand ziet een nee, misschien of wie eerst antwoordde.",
  "Neither person sees who said no or maybe. Accuracy, respect, and safety feedback only improve future matching.":
    "Niemand ziet wie nee of misschien koos. Feedback over juistheid, respect en veiligheid verbetert alleen toekomstige matches.",
  "Let's make it a date": "Maak er een date van",
  "Pick a night.": "Kies een avond.",
  "Let's make it a date.": "Maak er een date van.",
  "Find me a date": "Vind mijn date",
  "One night is enough": "Eén avond is genoeg",
  "Shall we make it a date?": "Maken we er een date van?",
  "Pick a night. Let's make it a date.":
    "Kies een avond. Maak er een date van.",
  "See what happens next": "Bekijk wat er daarna gebeurt",
  "Your Friday, planned": "Jouw vrijdag, helemaal gepland",
  "Dinner, then dessert if it feels right.":
    "Eerst eten, en als het klikt nog een dessert.",
  "New people, real plans": "Nieuwe mensen, echte plannen",
  "What do you want to do?": "Waar heb je zin in?",
  "Find someone to do it with.": "Vind iemand die met je meegaat.",
  "A film, a walk, a gallery—or whatever sounds good. Tell us the date you want; we'll find someone compatible to share it.":
    "Een film, een wandeling, een tentoonstelling of iets anders: vertel welke date je wilt, dan vinden wij iemand die erbij past.",
  "Find someone to go with": "Vind iemand om mee te gaan",
  "The activity comes first": "De activiteit komt eerst",
  "No forced chemistry": "Geen geforceerde klik",
  "No second stop required": "Geen tweede stop nodig",
  "Your idea comes first": "Jouw idee komt eerst",
  "What do you want to do next?": "Wat wil je hierna doen?",
  "Bring the idea. We'll find the person.":
    "Breng het idee. Wij vinden de persoon.",
  "Your idea. One new person. One real date.":
    "Jouw idee. Eén nieuw persoon. Eén echte date.",
  "Start with the date you actually want.":
    "Begin met de date waar je echt zin in hebt.",
  "The plan comes first. Then we find the right person to join you.":
    "Het plan komt eerst. Daarna vinden we de juiste persoon om mee te gaan.",
  "Name the date": "Vertel welke date je wilt",
  "A film and nothing after? That's a complete date.":
    "Alleen een film en daarna niets? Dat is een complete date.",
  "Your date idea": "Jouw date-idee",
  "Watch an indie film": "Een indiefilm kijken",
  "Film only. No second stop needed.":
    "Alleen de film. Geen tweede stop nodig.",
  "Find someone who wants the same thing": "Vind iemand die hetzelfde wil",
  "We match the activity, timing, and the person—not a restaurant reservation.":
    "We koppelen de activiteit, het moment en de persoon, niet een restaurantreservering.",
  "Film night": "Filmavond",
  "One screening · about {amount}": "Eén voorstelling · ongeveer {amount}",
  "You both want to see a film. Nothing else has to be added.":
    "Jullie willen allebei een film zien. Er hoeft niets bij.",
  "Go do exactly that": "Ga precies dat samen doen",
  "Both say yes. Meet in public. No pressure to make it more.":
    "Jullie zeggen allebei ja en ontmoeten elkaar openbaar. Geen druk om er meer van te maken.",
  "Your idea, matched": "Jouw idee, met een match",
  "One film. One new person. That's the whole plan.":
    "Eén film. Eén nieuw persoon. Dat is het hele plan.",
  "What would you like to do?": "Waar heb je zin in?",
  "Start with the date, not the profile. A film by itself is a complete plan.":
    "Begin met de date, niet met het profiel. Alleen een film is al een compleet plan.",
  "Watch an indie film. Happy to call it a night when the credits roll.":
    "Een indiefilm kijken en met een goed gevoel stoppen bij de aftiteling.",
  "Watch a film": "Een film kijken",
  "Take a walk": "Een wandeling maken",
  "See an exhibition": "Een tentoonstelling bezoeken",
  "Hear live music": "Live muziek luisteren",
  "Tell us what you'd like to do on this date.":
    "Vertel ons wat je tijdens deze date wilt doen.",
  "Both said yes": "Jullie zeiden allebei ja",
  "Added to calendar": "Toegevoegd aan agenda",
  "From “I'm free” to “see you there.”": "Van ‘ik kan’ naar ‘tot dan’.",
  "Three small choices. No audition in between.":
    "Drie kleine keuzes. Geen auditie tussendoor.",
  "Choose a night": "Kies een avond",
  Friday: "Vrijdag",
  "Friday, 7–10 PM. That's all we need.":
    "Vrijdag, 19.00–22.00. Meer hebben we niet nodig.",
  "One person, one public place, one plan that fits.":
    "Eén persoon, één openbare plek, één passend plan.",
  "When you both choose yes, the date is ready for your calendar.":
    "Als jullie allebei ja kiezen, staat de date klaar voor je agenda.",
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
  "No profiles to browse. No conversation to keep alive. Datehaja finds a compatible person, researches a real place, and sends one private invitation to each of you.":
    "Geen profielen om door te bladeren en geen gesprek om kunstmatig gaande te houden. Datehaja vindt iemand die bij je past, onderzoekt een echte locatie en stuurt jullie ieder een privé-uitnodiging.",
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
  "The Datehaja route": "De Datehaja-route",
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
  "Datehaja Concierge sends every invitation separately. Before you both accept, your match gets a first name, age, neighbourhood, and a few interests — never your inbox or number.":
    "Datehaja Concierge verstuurt elke uitnodiging afzonderlijk. Voordat jullie beiden accepteren, ziet je match alleen voornaam, leeftijd, buurt en enkele interesses — nooit je e-mail of telefoonnummer.",
  "Email address": "E-mailadres",
  "Phone number": "Telefoonnummer",
  "Home address": "Woonadres",
  "Exact location": "Exacte locatie",
  "Full name": "Volledige naam",
  "Social handles": "Sociale accounts",
  "Not shared": "Niet gedeeld",
  "Datehaja is 18+. We do not verify identity. Read exactly what we do and don't do in the":
    "Datehaja is voor 18+. We verifiëren geen identiteit. Lees precies wat we wel en niet doen in het",
  "Safety Center": "Veiligheidscentrum",
  "Your invitation is open": "Je uitnodiging staat open",
  "When are you free?": "Wanneer ben je vrij?",
  "That is still the only question we need answered.":
    "Dat is nog steeds de enige vraag waarop we antwoord nodig hebben.",
  "Plan my first date": "Plan mijn eerste date",
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
  "Datehaja home": "Datehaja-home",
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
  "I'm 18 or over, and I understand Datehaja does not verify identity.":
    "Ik ben 18 jaar of ouder en begrijp dat Datehaja geen identiteit verifieert.",
  "Create my account": "Mijn account maken",
  "Already have an account?": "Heb je al een account?",
  "New here?": "Nieuw hier?",
  "Create an account": "Account maken",
  "Your email is used only by Datehaja Concierge to reach you. It is never shown to another user.":
    "Je e-mailadres wordt alleen door Datehaja Concierge gebruikt om je te bereiken en wordt nooit aan een andere gebruiker getoond.",
  "How privacy works": "Hoe privacy werkt",
  "Datehaja is for adults only — please confirm you're 18 or over.":
    "Datehaja is alleen voor volwassenen. Bevestig dat je 18 jaar of ouder bent.",
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
  "Choose an image file.": "Välj en bildfil.",
  "Photos must be under 6MB.": "Bilder måste vara mindre än 6 MB.",
  "Upload failed.": "Uppladdningen misslyckades.",
  "Optional photo saved.": "Valfri bild sparad.",
  "Write what a date would genuinely want to know. Contact details are removed automatically.":
    "Skriv vad en dejt verkligen vill veta om dig. Kontaktuppgifter tas bort automatiskt.",
  "Your optional profile": "Din valfria profilbild",
  "Honest details reduce awkward surprises. Reviews check accuracy and respect, never attractiveness.":
    "Ärliga uppgifter minskar obekväma överraskningar. Omdömen gäller korrekthet och respekt, aldrig attraktivitet.",
  "There is no right answer. Choose ‘No preference’ if chemistry matters more than a type.":
    "Det finns inget rätt svar. Välj ”Spelar ingen roll” om kemi är viktigare än en typ.",
  "Optional. This is about personal taste, not rating anyone's looks.":
    "Valfritt. Det handlar om personlig smak, inte om att betygsätta utseende.",
  "Photo saved. Choose when a match can see it below.":
    "Bilden är sparad. Välj nedan när en matchning får se den.",
  "Honest details lead to fewer awkward surprises and better matches. Private post-date feedback checks profile accuracy, not attractiveness.":
    "Ärliga uppgifter minskar överraskningar och ger bättre matchningar. Privat feedback gäller profilens korrekthet, inte attraktivitet.",
  "‘No preference’ removes this factor from matching.":
    "”Spelar ingen roll” tar bort faktorn från matchningen.",
  "Optional personal taste, never an appearance score.":
    "Valfri personlig smak, aldrig ett utseendebetyg.",
  "They receive the same kind of profile card. Contact details and exact location stay private.":
    "Den andra får samma typ av profilkort. Kontaktuppgifter och exakt plats förblir privata.",
  "Your review stays private. Only an explicit yes is revealed, and only when you both choose it.":
    "Ditt omdöme förblir privat. Bara ett uttryckligt ömsesidigt ja visas.",
  "Your match card": "Ditt matchningskort",
  "Your photo is already on the match card by your choice. The venue's public address is added after you both accept.":
    "Din bild finns redan på matchningskortet enligt ditt val. Den offentliga adressen läggs till när båda tackat ja.",
  "Your private answers matched. Pick another activity when you're ready; every other review answer stays private.":
    "Era privata svar stämmer överens. Välj en ny aktivitet när ni vill; alla andra svar förblir privata.",
  "Your answer stays sealed while we wait. Neither person sees a no, maybe, or who answered first.":
    "Ditt svar förblir förseglat. Ingen ser ett nej, kanske eller vem som svarade först.",
  "Neither person sees who said no or maybe. Accuracy, respect, and safety feedback only improve future matching.":
    "Ingen ser vem som svarade nej eller kanske. Feedback om korrekthet, respekt och trygghet förbättrar bara framtida matchningar.",
  "Let's make it a date": "Låt oss göra det till en dejt",
  "Pick a night.": "Välj en kväll.",
  "Let's make it a date.": "Låt oss göra det till en dejt.",
  "Find me a date": "Hitta min dejt",
  "One night is enough": "En kväll räcker",
  "Shall we make it a date?": "Ska vi göra det till en dejt?",
  "Pick a night. Let's make it a date.":
    "Välj en kväll. Låt oss göra det till en dejt.",
  "See what happens next": "Se vad som händer sedan",
  "Your Friday, planned": "Din fredag, färdigplanerad",
  "Dinner, then dessert if it feels right.":
    "Middag, och om det känns rätt även dessert.",
  "New people, real plans": "Nya människor, riktiga planer",
  "What do you want to do?": "Vad vill du göra?",
  "Find someone to do it with.": "Hitta någon att göra det med.",
  "A film, a walk, a gallery—or whatever sounds good. Tell us the date you want; we'll find someone compatible to share it.":
    "En film, en promenad, en utställning eller något annat: berätta vilken dejt du vill ha, så hittar vi någon som passar.",
  "Find someone to go with": "Hitta någon att gå med",
  "The activity comes first": "Aktiviteten kommer först",
  "No forced chemistry": "Ingen framtvingad kemi",
  "No second stop required": "Inget andra stopp krävs",
  "Your idea comes first": "Din idé kommer först",
  "What do you want to do next?": "Vad vill du göra härnäst?",
  "Bring the idea. We'll find the person.": "Ta med idén. Vi hittar personen.",
  "Your idea. One new person. One real date.":
    "Din idé. En ny person. En riktig dejt.",
  "Start with the date you actually want.":
    "Börja med dejten du faktiskt vill ha.",
  "The plan comes first. Then we find the right person to join you.":
    "Planen kommer först. Sedan hittar vi rätt person att följa med.",
  "Name the date": "Berätta vilken dejt du vill ha",
  "A film and nothing after? That's a complete date.":
    "Bara en film och inget efteråt? Det är en komplett dejt.",
  "Your date idea": "Din dejtidé",
  "Watch an indie film": "Se en indiefilm",
  "Film only. No second stop needed.": "Bara filmen. Inget andra stopp behövs.",
  "Find someone who wants the same thing": "Hitta någon som vill samma sak",
  "We match the activity, timing, and the person—not a restaurant reservation.":
    "Vi matchar aktiviteten, tiden och personen – inte en restaurangbokning.",
  "Film night": "Filmkväll",
  "One screening · about {amount}": "En visning · cirka {amount}",
  "You both want to see a film. Nothing else has to be added.":
    "Ni vill båda se en film. Inget annat behöver läggas till.",
  "Go do exactly that": "Träffas och gör just det",
  "Both say yes. Meet in public. No pressure to make it more.":
    "Båda säger ja och möts offentligt. Ingen press att göra mer av det.",
  "Your idea, matched": "Din idé har fått en match",
  "One film. One new person. That's the whole plan.":
    "En film. En ny person. Det är hela planen.",
  "What would you like to do?": "Vad vill du göra?",
  "Start with the date, not the profile. A film by itself is a complete plan.":
    "Börja med dejten, inte profilen. En film i sig är en komplett plan.",
  "Watch an indie film. Happy to call it a night when the credits roll.":
    "Se en indiefilm och avsluta gärna kvällen när eftertexterna rullar.",
  "Watch a film": "Se en film",
  "Take a walk": "Ta en promenad",
  "See an exhibition": "Se en utställning",
  "Hear live music": "Lyssna på livemusik",
  "Tell us what you'd like to do on this date.":
    "Berätta vad du vill göra på den här dejten.",
  "Both said yes": "Båda sa ja",
  "Added to calendar": "Tillagd i kalendern",
  "From “I'm free” to “see you there.”":
    "Från ”jag är ledig” till ”vi ses där”.",
  "Three small choices. No audition in between.":
    "Tre små val. Ingen audition däremellan.",
  "Choose a night": "Välj en kväll",
  Friday: "Fredag",
  "Friday, 7–10 PM. That's all we need.":
    "Fredag kl. 19–22. Det är allt vi behöver.",
  "One person, one public place, one plan that fits.":
    "En person, en offentlig plats, en plan som passar.",
  "When you both choose yes, the date is ready for your calendar.":
    "När ni båda väljer ja är dejten klar för kalendern.",
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
  "No profiles to browse. No conversation to keep alive. Datehaja finds a compatible person, researches a real place, and sends one private invitation to each of you.":
    "Inga profiler att bläddra bland och inga samtal att hålla vid liv. Datehaja hittar en kompatibel person, undersöker en verklig plats och skickar en privat inbjudan till var och en av er.",
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
  "The Datehaja route": "Datehaja-vägen",
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
  "Datehaja Concierge sends every invitation separately. Before you both accept, your match gets a first name, age, neighbourhood, and a few interests — never your inbox or number.":
    "Datehaja Concierge skickar varje inbjudan separat. Innan ni båda accepterar ser din match bara förnamn, ålder, område och några intressen — aldrig din e-post eller ditt nummer.",
  "Email address": "E-postadress",
  "Phone number": "Telefonnummer",
  "Home address": "Hemadress",
  "Exact location": "Exakt plats",
  "Full name": "Fullständigt namn",
  "Social handles": "Sociala konton",
  "Not shared": "Delas inte",
  "Datehaja is 18+. We do not verify identity. Read exactly what we do and don't do in the":
    "Datehaja är för personer över 18 år. Vi verifierar inte identitet. Läs exakt vad vi gör och inte gör i vårt",
  "Safety Center": "Säkerhetscenter",
  "Your invitation is open": "Din inbjudan är öppen",
  "When are you free?": "När är du ledig?",
  "That is still the only question we need answered.":
    "Det är fortfarande den enda frågan vi behöver svar på.",
  "Plan my first date": "Planera min första dejt",
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
  "Datehaja home": "Datehaja hem",
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
  "I'm 18 or over, and I understand Datehaja does not verify identity.":
    "Jag är 18 år eller äldre och förstår att Datehaja inte verifierar identitet.",
  "Create my account": "Skapa mitt konto",
  "Already have an account?": "Har du redan ett konto?",
  "New here?": "Ny här?",
  "Create an account": "Skapa ett konto",
  "Your email is used only by Datehaja Concierge to reach you. It is never shown to another user.":
    "Din e-post används bara av Datehaja Concierge för att nå dig och visas aldrig för en annan användare.",
  "How privacy works": "Så fungerar integritet",
  "Datehaja is for adults only — please confirm you're 18 or over.":
    "Datehaja är endast för vuxna. Bekräfta att du är minst 18 år.",
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

/* Agent dating pivot — core journey copy. English locales intentionally use
   the source strings; the six translated markets get a human-readable launch
   surface rather than a half-localised navigation shell. */
Object.assign(ko, {
  "Agent dating": "에이전트 데이트",
  "Your dating agent": "나의 데이팅 에이전트",
  "Too busy for another first date?": "소개팅도 데이트도 바쁜 당신에게",
  "Let your Agent": "내 에이전트가",
  "go first.": "먼저 만나봐요.",
  "Your Agent meets first and brings back an honest read. You decide whether to make it real.":
    "내 에이전트가 먼저 만나고 솔직한 리포트를 가져와요. 실제 만남은 당신이 결정해요.",
  "A different kind of first date": "조금 다른 첫 데이트",
  "You stay home.": "당신은 집에 있고.",
  "Your agent dates.": "에이전트가 데이트해요.",
  "One AI learns the unpolished you, meets other agents in a private virtual world, then comes back and tells you what it really thinks.":
    "한 AI가 꾸미지 않은 나를 배우고, 비공개 가상 세계에서 다른 에이전트를 만난 뒤 돌아와 솔직한 생각을 전해요.",
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
  "Let two agents feel it out before two humans risk the awkward part.":
    "두 사람이 어색함을 감수하기 전에, 두 에이전트가 먼저 마음을 살펴봐요.",
  "Talk to the one agent that knows you.":
    "나를 아는 단 한 명의 에이전트와 대화해요.",
  "Give it the version of you that never fits inside a dating profile: the contradictions, boundaries, and quiet tells.":
    "데이트 프로필에 담기지 않는 모순, 경계, 사소한 신호까지 알려주세요.",
  "Your agent goes on the first date.": "첫 데이트는 에이전트가 나가요.",
  "Two clearly labelled AI proxies meet in a private virtual world. Neither sees the other's private brief.":
    "AI라고 명확히 표시된 두 프록시가 비공개 가상 세계에서 만나요. 서로의 개인 브리프는 볼 수 없어요.",
  "It comes home with an honest read.": "돌아와 솔직하게 들려줘요.",
  "Chemistry, friction, blind spots—and whether your agent would actively push you to meet.":
    "끌림과 마찰, 놓친 신호, 그리고 실제로 만나보라고 권할지까지요.",
  "The humans make the only decision that counts.":
    "중요한 마지막 결정은 사람이 해요.",
  "Two private yeses open contact at the same moment. One no ends it quietly. Agents never consent for you.":
    "두 사람이 비공개로 모두 동의할 때만 연락처가 동시에 열려요. 한 명이 거절하면 조용히 끝나며, 에이전트는 대신 동의할 수 없어요.",
  "Not a compatibility score machine": "궁합 점수 기계가 아니에요",
  "Your agent can say: don't meet them.":
    "에이전트는 ‘만나지 마’라고 말할 수도 있어요.",
  "A useful agent is not a hype machine. It notices where the conversation came alive, where someone dodged, and whether your real life could hold the connection.":
    "좋은 에이전트는 무조건 띄워주지 않아요. 대화가 살아난 순간과 피한 지점, 현실에서도 이어질 수 있는지를 살펴봐요.",
  "Two independent verdicts": "서로 독립된 두 판단",
  "No forced optimism": "억지 낙관 없음",
  "No consent theatre": "보여주기식 동의 없음",
  "YOUR AGENT'S PRIVATE READ": "내 에이전트의 비공개 리포트",
  "LIVE / SIMULATION": "실시간 / 시뮬레이션",
  "AFTER HOURS": "늦은 밤",
  "shared record": "함께 고른 레코드",
  "easy exit": "편한 출구",
  "My person says they like spontaneity, but what they really need is someone who makes changing plans feel safe.":
    "내 사람은 즉흥적인 걸 좋아한다고 하지만, 사실 계획이 바뀌어도 편안하게 느끼게 해줄 사람이 필요해요.",
  "That contradiction makes sense. Mine needs room to go quiet without the silence being treated as rejection.":
    "그 모순, 이해돼요. 내 사람은 조용해져도 거절로 받아들여지지 않을 여유가 필요해요.",
  "Plans can change. Feeling safe shouldn't.":
    "계획은 바뀌어도, 편안함은 필요해요.",
  "Quiet doesn't mean rejection.": "조용함이 거절은 아니에요.",
  "Your Agent": "내 에이전트",
  "Their Agent": "상대 에이전트",
  "Your agent can say:": "내 에이전트는 말할 수 있어요.",
  "don't meet them.": "그 사람은 만나지 마요.",
  "Six moments. Two independent reads. One honest recommendation.":
    "여섯 순간. 두 개의 독립된 판단. 하나의 솔직한 추천.",
  "Four live systems · one private Agent": "네 시스템 · 하나의 비공개 에이전트",
  "PRIVATE VERDICT": "비공개 판단",
  "Agent insight map": "에이전트 인사이트 지도",
  "Six moments → one private read": "여섯 순간 → 하나의 비공개 리포트",
  "An interpretation, not a score": "점수가 아닌 해석",
  "Their answer remains sealed": "상대의 답변은 계속 비공개",
  listening: "듣는 중",
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
  "Each agent judges from its own human's private values.":
    "각 에이전트는 자기 사람의 비공개 가치관으로 독립적으로 판단해요.",
  "Curious and pass are valid outcomes—not failures.":
    "더 알아보기와 거절도 실패가 아닌 온전한 결과예요.",
  "Your yes stays sealed until there are two yeses.":
    "두 사람 모두 동의하기 전까지 내 답은 공개되지 않아요.",
  moments: "장면",
  "I think you should meet.": "두 사람, 만나봤으면 해요.",
  "The easy banter wasn't the strongest signal. It was how Sol slowed down when your fear of being misunderstood came up.":
    "편한 농담보다 더 강한 신호는, 오해받는 게 두렵다는 이야기에 Sol이 천천히 귀 기울인 순간이었어요.",
  SPARK: "설렘",
  "Quiet feels safe to both": "둘 다 침묵을 편안해해요",
  "ASK ABOUT": "물어볼 것",
  "Different social pace": "서로 다른 사교 속도",
  "An interpretation, not a compatibility score · Their answer remains sealed":
    "궁합 점수가 아닌 하나의 해석 · 상대의 답은 계속 비공개",
  "Gives each Agent an isolated mind, voice, and independent verdict.":
    "각 에이전트에게 분리된 생각과 목소리, 독립적인 판단을 줍니다.",
  "Finds a live cultural spark that becomes tonight's virtual world.":
    "지금의 문화적 소재를 찾아 오늘 밤의 가상 세계로 만듭니다.",
  "Streams every turn and keeps consent state consistent in real time.":
    "모든 대화를 실시간으로 전송하고 동의 상태를 일관되게 지킵니다.",
  "Delivers private debriefs without exposing the other person's answer.":
    "상대의 답을 노출하지 않고 각자의 비공개 리포트를 전달합니다.",
  "A real agent stack": "실제로 작동하는 에이전트 스택",
  "Not a chatbot wearing a heart icon.": "하트 아이콘만 붙인 챗봇이 아니에요.",
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
  "Agent dating": "エージェント・デート",
  "Your dating agent": "あなたのデート・エージェント",
  "Too busy for another first date?": "初デートの時間も惜しいあなたへ",
  "Let your Agent": "あなたのエージェントを",
  "go first.": "先に会わせよう。",
  "Your Agent meets first and brings back an honest read. You decide whether to make it real.":
    "エージェントが先に会い、率直なレポートを持ち帰ります。実際に会うかは、あなたが決めます。",
  "A different kind of first date": "新しいかたちの初デート",
  "You stay home.": "あなたは家に。",
  "Your agent dates.": "エージェントがデートへ。",
  "One AI learns the unpolished you, meets other agents in a private virtual world, then comes back and tells you what it really thinks.":
    "ひとつのAIが飾らないあなたを学び、非公開の仮想世界で他のエージェントと会い、率直な感想を持ち帰ります。",
  "Create my dating agent": "デート・エージェントを作る",
  "Watch the agents meet": "エージェントの出会いを見る",
  "Your Agent goes first.": "エージェントが先に会う。",
  Brief: "ブリーフ",
  "Agent date": "エージェントのデート",
  "Private read": "非公開レポート",
  "Your call": "あなたの決断",
  "Talk to the one agent that knows you.":
    "あなたを知る一人のエージェントと話す。",
  "Your agent goes on the first date.": "最初のデートはエージェントが行く。",
  "It comes home with an honest read.": "率直な見立てを持ち帰る。",
  "The humans make the only decision that counts.": "大切な決断は人間がする。",
  "YOUR AGENT'S PRIVATE READ": "あなたのエージェントの非公開レポート",
  "LIVE / SIMULATION": "ライブ / シミュレーション",
  "AFTER HOURS": "夜の時間",
  "shared record": "ふたりのレコード",
  "easy exit": "気軽な出口",
  "My person says they like spontaneity, but what they really need is someone who makes changing plans feel safe.":
    "私の人は気まぐれが好きと言うけれど、本当に必要なのは予定が変わっても安心させてくれる人です。",
  "That contradiction makes sense. Mine needs room to go quiet without the silence being treated as rejection.":
    "その矛盾、わかります。私の人には、沈黙を拒絶と思われず静かになれる余白が必要です。",
  "Plans can change. Feeling safe shouldn't.":
    "予定は変わっても、安心は変えたくない。",
  "Quiet doesn't mean rejection.": "静けさは拒絶じゃない。",
  "Your Agent": "あなたのエージェント",
  "Their Agent": "相手のエージェント",
  "Your agent can say:": "あなたのエージェントは言える：",
  "don't meet them.": "会わないほうがいい。",
  "Six moments. Two independent reads. One honest recommendation.":
    "6つの瞬間。2つの独立した視点。1つの正直な提案。",
  "Four live systems · one private Agent":
    "4つのライブシステム · 1つのプライベートエージェント",
  "PRIVATE VERDICT": "非公開の判断",
  "Agent insight map": "エージェントのインサイトマップ",
  "Six moments → one private read": "6つの瞬間 → 1つの非公開レポート",
  "An interpretation, not a score": "点数ではなく、ひとつの解釈",
  "Their answer remains sealed": "相手の回答は非公開のまま",
  listening: "傾聴中",
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
  "Each agent judges from its own human's private values.":
    "各エージェントが自分の人の非公開の価値観から判断します。",
  "Curious and pass are valid outcomes—not failures.":
    "もっと知りたい、見送る、どちらも失敗ではありません。",
  "Your yes stays sealed until there are two yeses.":
    "ふたりが同意するまで、あなたの答えは非公開です。",
  moments: "場面",
  "I think you should meet.": "会ってみてほしいです。",
  "The easy banter wasn't the strongest signal. It was how Sol slowed down when your fear of being misunderstood came up.":
    "軽い会話より強いサインは、誤解される怖さを話した時にSolがゆっくり耳を傾けたことでした。",
  SPARK: "ときめき",
  "Quiet feels safe to both": "ふたりとも沈黙が心地よい",
  "ASK ABOUT": "聞いてみること",
  "Different social pace": "異なる社交のペース",
  "An interpretation, not a compatibility score · Their answer remains sealed":
    "相性スコアではなく一つの解釈 · 相手の答えは非公開",
  "Gives each Agent an isolated mind, voice, and independent verdict.":
    "各エージェントに分離された思考、声、独立した判断を与えます。",
  "Finds a live cultural spark that becomes tonight's virtual world.":
    "今の文化的な話題を探し、今夜の仮想世界にします。",
  "Streams every turn and keeps consent state consistent in real time.":
    "すべての会話をリアルタイム配信し、同意状態を一貫して保ちます。",
  "Delivers private debriefs without exposing the other person's answer.":
    "相手の回答を明かさず、それぞれに非公開レポートを届けます。",
  "Create my agent": "エージェントを作る",
  "My agent": "マイ・エージェント",
  Human: "本人",
  Settings: "設定",
});

Object.assign(de, {
  "Agent dating": "Agenten-Dating",
  "Your dating agent": "Dein Dating-Agent",
  "Too busy for another first date?": "Zu beschäftigt fürs nächste erste Date?",
  "Let your Agent": "Lass deinen Agenten",
  "go first.": "zuerst gehen.",
  "Your Agent meets first and brings back an honest read. You decide whether to make it real.":
    "Dein Agent trifft sich zuerst und bringt eine ehrliche Einschätzung mit. Du entscheidest, ob ihr euch wirklich trefft.",
  "A different kind of first date": "Ein anderes erstes Date",
  "You stay home.": "Du bleibst zu Hause.",
  "Your agent dates.": "Dein Agent datet.",
  "One AI learns the unpolished you, meets other agents in a private virtual world, then comes back and tells you what it really thinks.":
    "Eine KI lernt dein ungeschöntes Ich kennen, trifft andere Agenten in einer privaten virtuellen Welt und berichtet dir ehrlich davon.",
  "Create my dating agent": "Meinen Dating-Agenten erstellen",
  "Watch the agents meet": "Agenten beim Treffen ansehen",
  "Your Agent goes first.": "Dein Agent geht zuerst.",
  Brief: "Briefing",
  "Agent date": "Agenten-Date",
  "Private read": "Privater Bericht",
  "Your call": "Deine Wahl",
  "Talk to the one agent that knows you.":
    "Sprich mit dem Agenten, der dich kennt.",
  "Your agent goes on the first date.": "Dein Agent übernimmt das erste Date.",
  "It comes home with an honest read.":
    "Er kommt mit einer ehrlichen Einschätzung zurück.",
  "The humans make the only decision that counts.":
    "Die entscheidende Wahl treffen die Menschen.",
  "YOUR AGENT'S PRIVATE READ": "PRIVATE EINSCHÄTZUNG DEINES AGENTEN",
  "LIVE / SIMULATION": "LIVE / SIMULATIONSMODUS",
  "AFTER HOURS": "SPÄTER ABEND",
  "shared record": "gemeinsame Platte",
  "easy exit": "leichter Ausstieg",
  "My person says they like spontaneity, but what they really need is someone who makes changing plans feel safe.":
    "Mein Mensch sagt, er mag Spontaneität. Eigentlich braucht er jemanden, bei dem sich Planänderungen sicher anfühlen.",
  "That contradiction makes sense. Mine needs room to go quiet without the silence being treated as rejection.":
    "Dieser Widerspruch ergibt Sinn. Mein Mensch braucht Raum für Stille, ohne dass sie als Ablehnung gilt.",
  "Plans can change. Feeling safe shouldn't.":
    "Pläne dürfen sich ändern. Sicherheit nicht.",
  "Quiet doesn't mean rejection.": "Stille ist keine Ablehnung.",
  "Your Agent": "Dein Agent",
  "Their Agent": "Der andere Agent",
  "Your agent can say:": "Dein Agent kann sagen:",
  "don't meet them.": "Triff diese Person nicht.",
  "Six moments. Two independent reads. One honest recommendation.":
    "Sechs Momente. Zwei unabhängige Einschätzungen. Eine ehrliche Empfehlung.",
  "Four live systems · one private Agent":
    "Vier Live-Systeme · ein privater Agent",
  "PRIVATE VERDICT": "PRIVATE EINSCHÄTZUNG",
  "Agent insight map": "Agent-Insight-Karte",
  "Six moments → one private read": "Sechs Momente → ein privater Bericht",
  "An interpretation, not a score": "Eine Einordnung, keine Punktzahl",
  "Their answer remains sealed":
    "Die Antwort der anderen Person bleibt versiegelt",
  listening: "hört zu",
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
  "Each agent judges from its own human's private values.":
    "Jeder Agent urteilt nach den privaten Werten seines Menschen.",
  "Curious and pass are valid outcomes—not failures.":
    "Neugier und Absage sind gültige Ergebnisse, keine Fehler.",
  "Your yes stays sealed until there are two yeses.":
    "Dein Ja bleibt versiegelt, bis beide Ja sagen.",
  moments: "Momente",
  "I think you should meet.": "Ich denke, ihr solltet euch treffen.",
  "The easy banter wasn't the strongest signal. It was how Sol slowed down when your fear of being misunderstood came up.":
    "Nicht der lockere Witz war das stärkste Signal, sondern wie Sol innehielt, als deine Angst vor Missverständnissen aufkam.",
  SPARK: "FUNKE",
  "Quiet feels safe to both": "Stille fühlt sich für beide sicher an",
  "ASK ABOUT": "NACHFRAGEN",
  "Different social pace": "Unterschiedliches soziales Tempo",
  "An interpretation, not a compatibility score · Their answer remains sealed":
    "Eine Einordnung, kein Kompatibilitätswert · Die andere Antwort bleibt versiegelt",
  "Gives each Agent an isolated mind, voice, and independent verdict.":
    "Gibt jedem Agenten einen getrennten Geist, eine Stimme und ein eigenes Urteil.",
  "Finds a live cultural spark that becomes tonight's virtual world.":
    "Findet einen aktuellen kulturellen Impuls für die virtuelle Welt des Abends.",
  "Streams every turn and keeps consent state consistent in real time.":
    "Überträgt jeden Dialogzug und hält den Zustimmungsstatus in Echtzeit konsistent.",
  "Delivers private debriefs without exposing the other person's answer.":
    "Liefert private Berichte, ohne die Antwort der anderen Person offenzulegen.",
  "Create my agent": "Meinen Agenten erstellen",
  "My agent": "Mein Agent",
  Human: "Mensch",
  Settings: "Einstellungen",
});

Object.assign(fr, {
  "Agent dating": "Rencontres par agents",
  "Your dating agent": "Votre agent de rencontre",
  "Too busy for another first date?":
    "Trop occupé pour un autre premier rendez-vous ?",
  "Let your Agent": "Laissez votre agent",
  "go first.": "y aller d'abord.",
  "Your Agent meets first and brings back an honest read. You decide whether to make it real.":
    "Votre agent fait d'abord connaissance et vous livre un avis sincère. Vous décidez ensuite de vous rencontrer vraiment.",
  "A different kind of first date": "Un premier rendez-vous différent",
  "You stay home.": "Vous restez chez vous.",
  "Your agent dates.": "Votre agent fait connaissance.",
  "One AI learns the unpolished you, meets other agents in a private virtual world, then comes back and tells you what it really thinks.":
    "Une IA apprend à connaître votre vrai visage, rencontre d'autres agents dans un monde virtuel privé, puis vous livre son avis sincère.",
  "Create my dating agent": "Créer mon agent de rencontre",
  "Watch the agents meet": "Voir les agents se rencontrer",
  "Your Agent goes first.": "Votre agent y va d'abord.",
  Brief: "Brief",
  "Agent date": "Rendez-vous des agents",
  "Private read": "Rapport privé",
  "Your call": "Votre décision",
  "Talk to the one agent that knows you.": "Parlez à l'agent qui vous connaît.",
  "Your agent goes on the first date.":
    "Votre agent prend le premier rendez-vous.",
  "It comes home with an honest read.": "Il revient avec un avis sincère.",
  "The humans make the only decision that counts.":
    "La décision finale reste humaine.",
  "YOUR AGENT'S PRIVATE READ": "AVIS PRIVÉ DE VOTRE AGENT",
  "LIVE / SIMULATION": "EN DIRECT / SIMULATION",
  "AFTER HOURS": "APRÈS LA FERMETURE",
  "shared record": "disque partagé",
  "easy exit": "sortie facile",
  "My person says they like spontaneity, but what they really need is someone who makes changing plans feel safe.":
    "Ma personne dit aimer l'imprévu, mais elle a surtout besoin de quelqu'un qui rende les changements de programme rassurants.",
  "That contradiction makes sense. Mine needs room to go quiet without the silence being treated as rejection.":
    "Cette contradiction se comprend. La mienne a besoin de silence sans qu'il soit pris pour un rejet.",
  "Plans can change. Feeling safe shouldn't.":
    "Les plans changent. Le sentiment de sécurité, non.",
  "Quiet doesn't mean rejection.": "Le silence n'est pas un rejet.",
  "Your Agent": "Votre agent",
  "Their Agent": "L'autre agent",
  "Your agent can say:": "Votre agent peut dire :",
  "don't meet them.": "Ne les rencontrez pas.",
  "Six moments. Two independent reads. One honest recommendation.":
    "Six moments. Deux avis indépendants. Une recommandation honnête.",
  "Four live systems · one private Agent":
    "Quatre systèmes actifs · un agent privé",
  "PRIVATE VERDICT": "AVIS PRIVÉ",
  "Agent insight map": "Carte des signaux de l'agent",
  "Six moments → one private read": "Six moments → un rapport privé",
  "An interpretation, not a score": "Une interprétation, pas une note",
  "Their answer remains sealed": "La réponse de l'autre personne reste scellée",
  listening: "à l'écoute",
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
  "Each agent judges from its own human's private values.":
    "Chaque agent juge selon les valeurs privées de sa propre personne.",
  "Curious and pass are valid outcomes—not failures.":
    "La curiosité comme le refus sont des résultats valables, pas des échecs.",
  "Your yes stays sealed until there are two yeses.":
    "Votre oui reste scellé jusqu'à ce qu'il y en ait deux.",
  moments: "instants",
  "I think you should meet.": "Je pense que vous devriez vous rencontrer.",
  "The easy banter wasn't the strongest signal. It was how Sol slowed down when your fear of being misunderstood came up.":
    "Le signal le plus fort n'était pas la plaisanterie, mais la façon dont Sol a ralenti lorsque votre peur d'être mal compris est apparue.",
  SPARK: "ÉTINCELLE",
  "Quiet feels safe to both": "Le silence rassure les deux",
  "ASK ABOUT": "À DEMANDER",
  "Different social pace": "Rythmes sociaux différents",
  "An interpretation, not a compatibility score · Their answer remains sealed":
    "Une interprétation, pas un score de compatibilité · L'autre réponse reste scellée",
  "Gives each Agent an isolated mind, voice, and independent verdict.":
    "Donne à chaque agent un esprit, une voix et un avis indépendants.",
  "Finds a live cultural spark that becomes tonight's virtual world.":
    "Trouve une inspiration culturelle actuelle pour créer le monde virtuel du soir.",
  "Streams every turn and keeps consent state consistent in real time.":
    "Diffuse chaque échange et maintient le consentement cohérent en temps réel.",
  "Delivers private debriefs without exposing the other person's answer.":
    "Livre des bilans privés sans révéler la réponse de l'autre personne.",
  "Create my agent": "Créer mon agent",
  "My agent": "Mon agent",
  Human: "Humain",
  Settings: "Réglages",
});

Object.assign(nl, {
  "Agent dating": "Daten via agents",
  "Your dating agent": "Jouw datingagent",
  "Too busy for another first date?": "Te druk voor nóg een eerste date?",
  "Let your Agent": "Laat je agent",
  "go first.": "eerst gaan.",
  "Your Agent meets first and brings back an honest read. You decide whether to make it real.":
    "Je agent ontmoet de ander eerst en komt terug met een eerlijk oordeel. Jij beslist of jullie echt afspreken.",
  "A different kind of first date": "Een ander soort eerste date",
  "You stay home.": "Jij blijft thuis.",
  "Your agent dates.": "Je agent gaat daten.",
  "One AI learns the unpolished you, meets other agents in a private virtual world, then comes back and tells you what it really thinks.":
    "Eén AI leert je ongepolijste zelf kennen, ontmoet andere agents in een besloten virtuele wereld en vertelt eerlijk wat die ervan vond.",
  "Create my dating agent": "Mijn datingagent maken",
  "Watch the agents meet": "Bekijk de ontmoeting",
  "Your Agent goes first.": "Je agent gaat eerst.",
  Brief: "Briefing",
  "Agent date": "Agentdate",
  "Private read": "Privéverslag",
  "Your call": "Jouw keuze",
  "Talk to the one agent that knows you.": "Praat met de agent die jou kent.",
  "Your agent goes on the first date.": "Je agent gaat op de eerste date.",
  "It comes home with an honest read.":
    "Die komt terug met een eerlijk oordeel.",
  "The humans make the only decision that counts.":
    "De beslissende keuze blijft menselijk.",
  "YOUR AGENT'S PRIVATE READ": "PRIVÉVERSLAG VAN JE AGENT",
  "LIVE / SIMULATION": "LIVE / SIMULATIE",
  "AFTER HOURS": "NA SLUITINGSTIJD",
  "shared record": "gedeelde plaat",
  "easy exit": "makkelijke uitgang",
  "My person says they like spontaneity, but what they really need is someone who makes changing plans feel safe.":
    "Mijn persoon zegt van spontaniteit te houden, maar heeft vooral iemand nodig bij wie veranderende plannen veilig voelen.",
  "That contradiction makes sense. Mine needs room to go quiet without the silence being treated as rejection.":
    "Die tegenstelling klopt. Mijn persoon heeft ruimte nodig om stil te zijn zonder dat dit als afwijzing voelt.",
  "Plans can change. Feeling safe shouldn't.":
    "Plannen mogen veranderen. Veilig voelen niet.",
  "Quiet doesn't mean rejection.": "Stilte is geen afwijzing.",
  "Your Agent": "Jouw agent",
  "Their Agent": "De andere agent",
  "Your agent can say:": "Jouw agent kan zeggen:",
  "don't meet them.": "Ontmoet diegene niet.",
  "Six moments. Two independent reads. One honest recommendation.":
    "Zes momenten. Twee onafhankelijke oordelen. Eén eerlijk advies.",
  "Four live systems · one private Agent":
    "Vier live systemen · één privé-agent",
  "PRIVATE VERDICT": "PRIVÉOORDEEL",
  "Agent insight map": "Inzichtkaart van de agent",
  "Six moments → one private read": "Zes momenten → één privéverslag",
  "An interpretation, not a score": "Een interpretatie, geen score",
  "Their answer remains sealed": "Het antwoord van de ander blijft verzegeld",
  listening: "luistert",
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
  "Each agent judges from its own human's private values.":
    "Elke agent oordeelt vanuit de privéwaarden van de eigen persoon.",
  "Curious and pass are valid outcomes—not failures.":
    "Nieuwsgierig en afwijzen zijn geldige uitkomsten, geen mislukkingen.",
  "Your yes stays sealed until there are two yeses.":
    "Jouw ja blijft verzegeld tot er twee ja's zijn.",
  moments: "momenten",
  "I think you should meet.": "Ik denk dat jullie elkaar moeten ontmoeten.",
  "The easy banter wasn't the strongest signal. It was how Sol slowed down when your fear of being misunderstood came up.":
    "Niet de losse humor was het sterkste signaal, maar hoe Sol vertraagde toen je angst om verkeerd begrepen te worden ter sprake kwam.",
  SPARK: "VONK",
  "Quiet feels safe to both": "Stilte voelt voor beiden veilig",
  "ASK ABOUT": "VRAAG NAAR",
  "Different social pace": "Ander sociaal tempo",
  "An interpretation, not a compatibility score · Their answer remains sealed":
    "Een interpretatie, geen compatibiliteitsscore · Het andere antwoord blijft verzegeld",
  "Gives each Agent an isolated mind, voice, and independent verdict.":
    "Geeft elke agent een eigen geest, stem en onafhankelijk oordeel.",
  "Finds a live cultural spark that becomes tonight's virtual world.":
    "Vindt een actuele culturele vonk voor de virtuele wereld van vanavond.",
  "Streams every turn and keeps consent state consistent in real time.":
    "Streamt elke beurt en houdt toestemming in realtime consistent.",
  "Delivers private debriefs without exposing the other person's answer.":
    "Levert privéverslagen zonder het antwoord van de ander te onthullen.",
  "Create my agent": "Mijn agent maken",
  "My agent": "Mijn agent",
  Human: "Mens",
  Settings: "Instellingen",
});

Object.assign(sv, {
  "Agent dating": "Agentdejting",
  "Your dating agent": "Din dejtingagent",
  "Too busy for another first date?": "För upptagen för ännu en första dejt?",
  "Let your Agent": "Låt din agent",
  "go first.": "gå först.",
  "Your Agent meets first and brings back an honest read. You decide whether to make it real.":
    "Din agent träffar den andra först och kommer tillbaka med en ärlig bedömning. Du avgör om ni ska ses på riktigt.",
  "A different kind of first date": "En annorlunda första dejt",
  "You stay home.": "Du stannar hemma.",
  "Your agent dates.": "Din agent dejtar.",
  "One AI learns the unpolished you, meets other agents in a private virtual world, then comes back and tells you what it really thinks.":
    "En AI lär känna ditt ofiltrerade jag, träffar andra agenter i en privat virtuell värld och berättar sedan ärligt vad den tycker.",
  "Create my dating agent": "Skapa min dejtingagent",
  "Watch the agents meet": "Se agenterna mötas",
  "Your Agent goes first.": "Din agent går först.",
  Brief: "Brief",
  "Agent date": "Agentdejt",
  "Private read": "Privat rapport",
  "Your call": "Ditt beslut",
  "Talk to the one agent that knows you.": "Prata med agenten som känner dig.",
  "Your agent goes on the first date.": "Din agent går på första dejten.",
  "It comes home with an honest read.":
    "Den kommer hem med en ärlig bedömning.",
  "The humans make the only decision that counts.":
    "Det viktiga beslutet fattas av människor.",
  "YOUR AGENT'S PRIVATE READ": "DIN AGENTS PRIVATA OMDÖME",
  "LIVE / SIMULATION": "LIVE / SIMULERING",
  "AFTER HOURS": "EFTER STÄNGNING",
  "shared record": "gemensam skiva",
  "easy exit": "enkel utgång",
  "My person says they like spontaneity, but what they really need is someone who makes changing plans feel safe.":
    "Min person säger att spontanitet är viktigt, men behöver egentligen någon som får ändrade planer att kännas trygga.",
  "That contradiction makes sense. Mine needs room to go quiet without the silence being treated as rejection.":
    "Den motsägelsen är rimlig. Min person behöver utrymme för tystnad utan att den tolkas som avvisande.",
  "Plans can change. Feeling safe shouldn't.":
    "Planer får ändras. Tryggheten ska bestå.",
  "Quiet doesn't mean rejection.": "Tystnad är inte ett avvisande.",
  "Your Agent": "Din agent",
  "Their Agent": "Den andra agenten",
  "Your agent can say:": "Din agent kan säga:",
  "don't meet them.": "Träffa dem inte.",
  "Six moments. Two independent reads. One honest recommendation.":
    "Sex ögonblick. Två oberoende omdömen. En ärlig rekommendation.",
  "Four live systems · one private Agent": "Fyra livesystem · en privat agent",
  "PRIVATE VERDICT": "PRIVAT OMDÖME",
  "Agent insight map": "Agentens insiktskarta",
  "Six moments → one private read": "Sex ögonblick → en privat rapport",
  "An interpretation, not a score": "En tolkning, inte ett betyg",
  "Their answer remains sealed": "Den andras svar förblir förseglat",
  listening: "lyssnar",
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
  "Each agent judges from its own human's private values.":
    "Varje agent bedömer utifrån sin egen persons privata värderingar.",
  "Curious and pass are valid outcomes—not failures.":
    "Nyfiken och avstå är giltiga resultat, inte misslyckanden.",
  "Your yes stays sealed until there are two yeses.":
    "Ditt ja förblir förseglat tills båda har sagt ja.",
  moments: "ögonblick",
  "I think you should meet.": "Jag tycker att ni borde träffas.",
  "The easy banter wasn't the strongest signal. It was how Sol slowed down when your fear of being misunderstood came up.":
    "Det starkaste tecknet var inte det lätta skämtandet, utan hur Sol saktade ner när din rädsla för att missförstås kom upp.",
  SPARK: "GNISTA",
  "Quiet feels safe to both": "Tystnad känns trygg för båda",
  "ASK ABOUT": "FRÅGA OM",
  "Different social pace": "Olika socialt tempo",
  "An interpretation, not a compatibility score · Their answer remains sealed":
    "En tolkning, inte ett kompatibilitetspoäng · Den andras svar förblir förseglat",
  "Gives each Agent an isolated mind, voice, and independent verdict.":
    "Ger varje agent ett separat sinne, en röst och ett oberoende omdöme.",
  "Finds a live cultural spark that becomes tonight's virtual world.":
    "Hittar en aktuell kulturell gnista som blir kvällens virtuella värld.",
  "Streams every turn and keeps consent state consistent in real time.":
    "Strömmar varje tur och håller samtycket konsekvent i realtid.",
  "Delivers private debriefs without exposing the other person's answer.":
    "Levererar privata rapporter utan att avslöja den andra personens svar.",
  "Create my agent": "Skapa min agent",
  "My agent": "Min agent",
  Human: "Person",
  Settings: "Inställningar",
});

Object.assign(ko, {
  "It's a date.": "데이트가 확정됐어요.",
  "Subscribe once; the same event moves from reserved to finalized or cancelled.":
    "한 번 구독하면 같은 일정이 예약·확정·취소 상태로 바뀌어요.",
  Yes: "네",
  No: "아니요",
  "Your match card": "내 매칭 카드",
  "Your photo is already on the match card by your choice. The venue's public address is added after you both accept.":
    "선택에 따라 사진은 이미 매칭 카드에 표시돼요. 두 사람 모두 수락하면 공개 장소 주소가 추가됩니다.",
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
  "Find me a date": "데이트 잡아줘",
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
  "Choose an image file.": "画像ファイルを選んでください。",
  "Photos must be under 6MB.": "写真は6MB未満にしてください。",
  "Upload failed.": "アップロードできませんでした。",
  "Optional photo saved.": "任意の写真を保存しました。",
  "Write what a date would genuinely want to know. Contact details are removed automatically.":
    "相手が本当に知りたいあなたのことを書いてください。連絡先は自動で削除されます。",
  "Your optional profile": "任意のプロフィール写真",
  "Honest details reduce awkward surprises. Reviews check accuracy and respect, never attractiveness.":
    "正直な情報は気まずい驚きを減らします。レビューは魅力度ではなく正確さと敬意を確認します。",
  "There is no right answer. Choose ‘No preference’ if chemistry matters more than a type.":
    "正解はありません。タイプより相性を重視するなら「こだわらない」を選んでください。",
  "Optional. This is about personal taste, not rating anyone's looks.":
    "任意です。外見の採点ではなく個人の好みです。",
  "Photo saved. Choose when a match can see it below.":
    "写真を保存しました。公開タイミングを選んでください。",
  "Honest details lead to fewer awkward surprises and better matches. Private post-date feedback checks profile accuracy, not attractiveness.":
    "正直な情報は気まずい驚きを減らし、より良い出会いにつながります。レビューは魅力度ではなくプロフィールの正確さを確認します。",
  "‘No preference’ removes this factor from matching.":
    "「こだわらない」を選ぶと、この項目はマッチングに使われません。",
  "Optional personal taste, never an appearance score.":
    "任意の好みであり、外見の点数には使いません。",
  "They receive the same kind of profile card. Contact details and exact location stay private.":
    "相手にも同じ範囲のプロフィールカードが届きます。連絡先と正確な位置は非公開です。",
  "Your review stays private. Only an explicit yes is revealed, and only when you both choose it.":
    "レビューは非公開です。お二人とも明確に「はい」を選んだ場合だけ再会の希望を知らせます。",
  "Your match card": "あなたのマッチカード",
  "Your photo is already on the match card by your choice. The venue's public address is added after you both accept.":
    "選択により写真はすでにマッチカードに表示されています。双方の承諾後に公共の会場住所が追加されます。",
  "Your private answers matched. Pick another activity when you're ready; every other review answer stays private.":
    "非公開回答が一致しました。準備ができたら次の活動を選べます。その他の回答は非公開のままです。",
  "Your answer stays sealed while we wait. Neither person sees a no, maybe, or who answered first.":
    "待っている間、回答は封印されます。「いいえ」「たぶん」や回答順は公開されません。",
  "Neither person sees who said no or maybe. Accuracy, respect, and safety feedback only improve future matching.":
    "誰が「いいえ」や「たぶん」と答えたかは分かりません。正確さ・敬意・安全の回答は今後の改善だけに使います。",
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
  "Choose an image file.": "Wähle eine Bilddatei.",
  "Photos must be under 6MB.": "Fotos müssen kleiner als 6 MB sein.",
  "Upload failed.": "Upload fehlgeschlagen.",
  "Optional photo saved.": "Optionales Foto gespeichert.",
  "Write what a date would genuinely want to know. Contact details are removed automatically.":
    "Schreibe, was ein Date wirklich über dich wissen möchte. Kontaktdaten werden automatisch entfernt.",
  "Your optional profile": "Dein optionales Profilfoto",
  "Honest details reduce awkward surprises. Reviews check accuracy and respect, never attractiveness.":
    "Ehrliche Angaben vermeiden unangenehme Überraschungen. Bewertungen prüfen Genauigkeit und Respekt, nie Attraktivität.",
  "There is no right answer. Choose ‘No preference’ if chemistry matters more than a type.":
    "Es gibt keine richtige Antwort. Wähle „Egal“, wenn die Chemie wichtiger ist als ein Typ.",
  "Optional. This is about personal taste, not rating anyone's looks.":
    "Optional. Es geht um persönlichen Geschmack, nicht um die Bewertung von Aussehen.",
  "Photo saved. Choose when a match can see it below.":
    "Foto gespeichert. Wähle unten, wann ein Match es sehen darf.",
  "Honest details lead to fewer awkward surprises and better matches. Private post-date feedback checks profile accuracy, not attractiveness.":
    "Ehrliche Angaben vermeiden unangenehme Überraschungen und verbessern Matches. Privates Feedback prüft Profilgenauigkeit, nicht Attraktivität.",
  "‘No preference’ removes this factor from matching.":
    "„Egal“ entfernt diesen Faktor aus dem Matching.",
  "Optional personal taste, never an appearance score.":
    "Optionaler persönlicher Geschmack, niemals eine Aussehensnote.",
  "They receive the same kind of profile card. Contact details and exact location stay private.":
    "Die andere Person erhält dieselbe Art Profilkarte. Kontaktdaten und genauer Standort bleiben privat.",
  "Your review stays private. Only an explicit yes is revealed, and only when you both choose it.":
    "Deine Bewertung bleibt privat. Nur ein ausdrückliches beidseitiges Ja wird offengelegt.",
  "Your match card": "Deine Match-Karte",
  "Your photo is already on the match card by your choice. The venue's public address is added after you both accept.":
    "Dein Foto ist nach deiner Wahl bereits auf der Match-Karte. Die öffentliche Adresse kommt nach eurer beider Zusage hinzu.",
  "Your private answers matched. Pick another activity when you're ready; every other review answer stays private.":
    "Eure privaten Antworten stimmen überein. Wählt eine neue Aktivität, wenn ihr bereit seid; alle anderen Antworten bleiben privat.",
  "Your answer stays sealed while we wait. Neither person sees a no, maybe, or who answered first.":
    "Deine Antwort bleibt versiegelt. Niemand sieht ein Nein, Vielleicht oder wer zuerst geantwortet hat.",
  "Neither person sees who said no or maybe. Accuracy, respect, and safety feedback only improve future matching.":
    "Niemand sieht, wer Nein oder Vielleicht gewählt hat. Feedback zu Genauigkeit, Respekt und Sicherheit verbessert nur künftige Matches.",
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
  "This is the only thing Datehaja ever asks of you. The more windows you leave open, the better the match we can find.":
    "Datehaja가 묻는 것은 이것뿐입니다. 가능한 시간을 더 열어둘수록 더 잘 맞는 상대를 찾을 수 있어요.",
  "How we use this": "이 정보를 사용하는 방식",
  "We only match you with someone whose window genuinely overlaps yours by at least 90 minutes — enough time for a real date, not a coffee you'd rush. Nobody sees your calendar.":
    "최소 90분 이상 실제로 시간이 겹치는 사람만 연결합니다. 서두르는 커피가 아니라 제대로 된 데이트를 위한 시간이며, 누구도 당신의 캘린더를 볼 수 없습니다.",
  "Every date plan you've been part of — accepted, passed, expired or done.":
    "수락, 거절, 만료, 완료를 포함해 참여했던 모든 데이트 계획입니다.",
  Past: "지난 일정",
  "Nothing here yet": "아직 기록이 없어요",
  "Your first date plan will show up here once you've responded to it.":
    "첫 데이트 계획에 답하면 여기에 표시됩니다.",
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
  "Demo profile": "デモプロフィール",
  "This is the only thing Datehaja ever asks of you. The more windows you leave open, the better the match we can find.":
    "Datehajaが尋ねるのはこれだけです。空き時間を多く登録するほど、よりよい相手を見つけやすくなります。",
  "How we use this": "この情報の使い方",
  "We only match you with someone whose window genuinely overlaps yours by at least 90 minutes — enough time for a real date, not a coffee you'd rush. Nobody sees your calendar.":
    "実際に90分以上予定が重なる人とのみマッチします。慌ただしいコーヒーではなく、きちんとしたデートのための時間です。カレンダーは誰にも見えません。",
  "Every date plan you've been part of — accepted, passed, expired or done.":
    "承諾、見送り、期限切れ、完了を含む、参加したすべてのデートプランです。",
  Past: "過去",
  "Nothing here yet": "まだ何もありません",
  "Your first date plan will show up here once you've responded to it.":
    "最初のデートプランに回答すると、ここに表示されます。",
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
  "Demo profile": "Demo-Profil",
  "This is the only thing Datehaja ever asks of you. The more windows you leave open, the better the match we can find.":
    "Das ist alles, wonach Datehaja fragt. Je mehr Zeitfenster du offen lässt, desto besser können wir matchen.",
  "How we use this": "So nutzen wir das",
  "We only match you with someone whose window genuinely overlaps yours by at least 90 minutes — enough time for a real date, not a coffee you'd rush. Nobody sees your calendar.":
    "Wir matchen nur mit Personen, deren Zeitfenster sich mindestens 90 Minuten überschneidet — genug für ein echtes Date. Niemand sieht deinen Kalender.",
  "Every date plan you've been part of — accepted, passed, expired or done.":
    "Jeder Date-Plan, an dem du beteiligt warst — angenommen, abgelehnt, abgelaufen oder beendet.",
  Past: "Vergangen",
  "Nothing here yet": "Noch nichts hier",
  "Your first date plan will show up here once you've responded to it.":
    "Dein erster Date-Plan erscheint hier, sobald du darauf geantwortet hast.",
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
  "Demo profile": "Profil de démonstration",
  "This is the only thing Datehaja ever asks of you. The more windows you leave open, the better the match we can find.":
    "C'est la seule chose que Datehaja vous demande. Plus vous laissez de créneaux, meilleure sera la compatibilité trouvée.",
  "How we use this": "Comment nous l'utilisons",
  "We only match you with someone whose window genuinely overlaps yours by at least 90 minutes — enough time for a real date, not a coffee you'd rush. Nobody sees your calendar.":
    "Nous vous mettons uniquement en relation avec une personne dont le créneau chevauche le vôtre d'au moins 90 minutes — assez pour un vrai rendez-vous. Personne ne voit votre agenda.",
  "Every date plan you've been part of — accepted, passed, expired or done.":
    "Tous les rendez-vous auxquels vous avez participé — acceptés, refusés, expirés ou terminés.",
  Past: "Passé",
  "Nothing here yet": "Rien pour le moment",
  "Your first date plan will show up here once you've responded to it.":
    "Votre premier projet de rendez-vous apparaîtra ici après votre réponse.",
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
  "Demo profile": "Demoprofiel",
  "This is the only thing Datehaja ever asks of you. The more windows you leave open, the better the match we can find.":
    "Dit is het enige wat Datehaja je vraagt. Hoe meer tijdvakken je openlaat, hoe beter de match die we kunnen vinden.",
  "How we use this": "Hoe we dit gebruiken",
  "We only match you with someone whose window genuinely overlaps yours by at least 90 minutes — enough time for a real date, not a coffee you'd rush. Nobody sees your calendar.":
    "We matchen je alleen met iemand van wie het tijdvak minstens 90 minuten met het jouwe overlapt — genoeg voor een echte date. Niemand ziet je agenda.",
  "Every date plan you've been part of — accepted, passed, expired or done.":
    "Elk dateplan waaraan je deelnam — geaccepteerd, overgeslagen, verlopen of afgerond.",
  Past: "Verleden",
  "Nothing here yet": "Hier staat nog niets",
  "Your first date plan will show up here once you've responded to it.":
    "Je eerste dateplan verschijnt hier zodra je erop hebt gereageerd.",
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
  "Demo profile": "Demoprofil",
  "This is the only thing Datehaja ever asks of you. The more windows you leave open, the better the match we can find.":
    "Det här är det enda Datehaja frågar efter. Ju fler tidsfönster du lämnar öppna, desto bättre matchning kan vi hitta.",
  "How we use this": "Så använder vi detta",
  "We only match you with someone whose window genuinely overlaps yours by at least 90 minutes — enough time for a real date, not a coffee you'd rush. Nobody sees your calendar.":
    "Vi matchar dig bara med någon vars tid överlappar din med minst 90 minuter — tillräckligt för en riktig dejt. Ingen ser din kalender.",
  "Every date plan you've been part of — accepted, passed, expired or done.":
    "Varje dejtplan du deltagit i — accepterad, avstådd, utgången eller klar.",
  Past: "Tidigare",
  "Nothing here yet": "Inget här ännu",
  "Your first date plan will show up here once you've responded to it.":
    "Din första dejtplan visas här när du har svarat på den.",
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
  "This is the one thing Datehaja asks of you, ever. Add a window or two.":
    "Datehaja가 부탁하는 유일한 일입니다. 가능한 시간을 한두 개 추가하세요.",
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
  "I confirm I'm 18 or over. Datehaja is an adults-only service.":
    "만 18세 이상이며 Datehaja가 성인 전용 서비스임을 확인합니다.",
  "You're ready for Datehaja.": "Datehaja를 시작할 준비가 됐어요.",
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
  "This is the one thing Datehaja asks of you, ever. Add a window or two.":
    "Datehajaがお願いするのはこれだけです。空き時間を一つか二つ追加してください。",
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
  "I confirm I'm 18 or over. Datehaja is an adults-only service.":
    "18歳以上で、Datehajaが成人向けサービスであることを確認します。",
  "You're ready for Datehaja.": "Datehajaの準備ができました。",
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
  "This is the one thing Datehaja asks of you, ever. Add a window or two.":
    "Das ist alles, worum Datehaja dich bittet. Füge ein oder zwei Zeitfenster hinzu.",
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
  "I confirm I'm 18 or over. Datehaja is an adults-only service.":
    "Ich bestätige, dass ich mindestens 18 bin. Datehaja ist nur für Erwachsene.",
  "You're ready for Datehaja.": "Du bist bereit für Datehaja.",
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
  "This is the one thing Datehaja asks of you, ever. Add a window or two.":
    "C'est la seule chose que Datehaja vous demande. Ajoutez un ou deux créneaux.",
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
  "I confirm I'm 18 or over. Datehaja is an adults-only service.":
    "Je confirme avoir au moins 18 ans. Datehaja est réservé aux adultes.",
  "You're ready for Datehaja.": "Vous êtes prêt pour Datehaja.",
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
  "This is the one thing Datehaja asks of you, ever. Add a window or two.":
    "Dit is het enige wat Datehaja van je vraagt. Voeg één of twee tijdvakken toe.",
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
  "I confirm I'm 18 or over. Datehaja is an adults-only service.":
    "Ik bevestig dat ik 18 jaar of ouder ben. Datehaja is alleen voor volwassenen.",
  "You're ready for Datehaja.": "Je bent klaar voor Datehaja.",
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
  "This is the one thing Datehaja asks of you, ever. Add a window or two.":
    "Det här är det enda Datehaja ber dig om. Lägg till ett eller två tidsfönster.",
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
  "I confirm I'm 18 or over. Datehaja is an adults-only service.":
    "Jag bekräftar att jag är minst 18 år. Datehaja är endast för vuxna.",
  "You're ready for Datehaja.": "Du är redo för Datehaja.",
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
    "보류된 시간은 Datehaja를 진행 중이라는 뜻입니다. 예약됨은 데이트가 확정된 상태이므로 참석할 수 없다면 데이트를 취소하세요.",
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
    "保留はDatehajaが進行中、予約済みはデート確定を意味します。参加できない場合はデートをキャンセルしてください。",
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
    "Ein reserviertes Zeitfenster bedeutet, dass ein Datehaja läuft. Gebucht heißt bestätigt — sage das Date ab, wenn du nicht kannst.",
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
    "Un créneau retenu signifie qu'un Datehaja est en cours. Réservé signifie que le rendez-vous est confirmé — annulez si vous ne pouvez pas venir.",
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
    "Een vastgehouden tijdvak betekent dat een Datehaja onderweg is. Geboekt betekent bevestigd — annuleer als je niet kunt.",
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
    "Ett reserverat tidsfönster betyder att en Datehaja pågår. Bokad betyder att dejten är bekräftad — avboka om du inte kan komma.",
  Held: "Reserverad",
  Booked: "Bokad",
});

Object.assign(ko, {
  "Public record · Privacy": "공개 안내서 · 개인정보",
  "Datehaja's whole promise is that you can meet someone without handing over anything you'd rather keep. Here is exactly what that means.":
    "Datehaja는 지키고 싶은 정보를 넘기지 않고도 누군가를 만날 수 있도록 설계했습니다. 그 의미를 정확히 설명합니다.",
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
  "Datehaja sends you to meet a stranger in public. Here's what we do, what we don't, and what's in your hands.":
    "Datehaja는 낯선 사람을 공공장소에서 만나도록 연결합니다. 저희가 하는 일과 하지 않는 일, 사용자가 지켜야 할 일을 설명합니다.",
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
  "Datehaja's whole promise is that you can meet someone without handing over anything you'd rather keep. Here is exactly what that means.":
    "Datehajaは、守りたい情報を渡さずに誰かと会えることを約束します。その意味を正確に説明します。",
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
  "Datehaja sends you to meet a stranger in public. Here's what we do, what we don't, and what's in your hands.":
    "Datehajaは知らない人と公共の場所で会うサービスです。私たちが行うこと、行わないこと、利用者にできることを説明します。",
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
  "Datehaja's whole promise is that you can meet someone without handing over anything you'd rather keep. Here is exactly what that means.":
    "Datehaja verspricht, dass du jemanden treffen kannst, ohne private Angaben preiszugeben. Hier steht genau, was das bedeutet.",
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
  "Datehaja sends you to meet a stranger in public. Here's what we do, what we don't, and what's in your hands.":
    "Datehaja bringt dich mit einer fremden Person an einem öffentlichen Ort zusammen. Hier steht, was wir tun, nicht tun und was bei dir liegt.",
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
  "Datehaja's whole promise is that you can meet someone without handing over anything you'd rather keep. Here is exactly what that means.":
    "Datehaja promet de vous permettre de rencontrer quelqu'un sans livrer les informations que vous souhaitez garder. Voici ce que cela signifie précisément.",
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
  "Datehaja sends you to meet a stranger in public. Here's what we do, what we don't, and what's in your hands.":
    "Datehaja vous fait rencontrer un inconnu dans un lieu public. Voici ce que nous faisons, ne faisons pas et ce qui vous appartient.",
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
  "Datehaja's whole promise is that you can meet someone without handing over anything you'd rather keep. Here is exactly what that means.":
    "Datehaja belooft dat je iemand kunt ontmoeten zonder gegevens af te staan die je privé wilt houden. Dit is precies wat dat betekent.",
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
  "Datehaja sends you to meet a stranger in public. Here's what we do, what we don't, and what's in your hands.":
    "Datehaja laat je een onbekende in het openbaar ontmoeten. Dit doen we wel en niet, en dit ligt bij jou.",
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
  "Datehaja's whole promise is that you can meet someone without handing over anything you'd rather keep. Here is exactly what that means.":
    "Datehaja lovar att du kan träffa någon utan att lämna ut det du vill behålla privat. Här är exakt vad det betyder.",
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
  "Datehaja sends you to meet a stranger in public. Here's what we do, what we don't, and what's in your hands.":
    "Datehaja låter dig träffa en främling offentligt. Här är vad vi gör, inte gör och vad som ligger i dina händer.",
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
  "Datehaja does not verify anyone's identity. There is no ID check, no photo verification, and no background check. Please treat every match as someone you met on the internet, and read the":
    "Datehaja는 신분증, 사진, 신원 조회를 포함한 어떠한 신원 인증도 하지 않습니다. 모든 상대를 인터넷에서 처음 만난 사람으로 대하고",
  "before your first date.": "를 첫 데이트 전에 읽어주세요.",
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
  "Datehaja does not verify anyone's identity. There is no ID check, no photo verification, and no background check. Please treat every match as someone you met on the internet, and read the":
    "Datehajaは身分証、写真、身元調査を含む本人確認を行いません。相手はインターネットで初めて会った人として扱い、最初のデート前に",
  "before your first date.": "を読んでください。",
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
  "Datehaja does not verify anyone's identity. There is no ID check, no photo verification, and no background check. Please treat every match as someone you met on the internet, and read the":
    "Datehaja prüft keine Identitäten, Ausweise, Fotos oder Hintergründe. Behandle jedes Match wie eine Person aus dem Internet und lies vor dem ersten Date den",
  "before your first date.": ".",
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
  "Datehaja does not verify anyone's identity. There is no ID check, no photo verification, and no background check. Please treat every match as someone you met on the internet, and read the":
    "Datehaja ne vérifie aucune identité, pièce, photo ni antécédent. Considérez chaque match comme une personne rencontrée sur internet et lisez le",
  "before your first date.": "avant votre premier rendez-vous.",
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
  "Your other date plans, past or present":
    "Je andere dateplannen, vroeger of nu",
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
  "Datehaja does not verify anyone's identity. There is no ID check, no photo verification, and no background check. Please treat every match as someone you met on the internet, and read the":
    "Datehaja verifieert geen identiteit, identiteitsbewijs, foto of achtergrond. Behandel elke match als iemand die je online hebt ontmoet en lees het",
  "before your first date.": "vóór je eerste date.",
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
  "Datehaja does not verify anyone's identity. There is no ID check, no photo verification, and no background check. Please treat every match as someone you met on the internet, and read the":
    "Datehaja verifierar inte identitet, ID, foto eller bakgrund. Behandla varje match som någon du träffat på nätet och läs vårt",
  "before your first date.": "före din första dejt.",
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
  "They agreed that I can store this email for Datehaja safety plans.":
    "이 이메일을 Datehaja 안전 일정 공유에 저장하는 데 동의받았어요.",
  "Ask me how the date went": "데이트 후 안부 묻기",
  "A private, optional check-in after the planned end time.":
    "예정 종료 시간 뒤에 보내는 선택형 비공개 체크인이에요.",
  "Save private safety settings": "비공개 안전 설정 저장",
  "Sign in to add a trusted contact and choose whether Datehaja checks in after a date.":
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
  "Subscribe once; Datehaja keeps the same event ID as it moves from reserved to finalized or cancelled.":
    "한 번 구독하면 같은 일정이 예약·확정·취소 상태로 이어져요.",
  "Google Calendar": "Google 캘린더",
  "Apple / calendar app": "Apple / 캘린더 앱",
  "Copy private link": "비공개 링크 복사",
  "Anyone with this secret link can read your date times. Calendar apps refresh on their own schedule.":
    "이 비밀 링크를 가진 사람은 데이트 시간을 볼 수 있어요. 캘린더 앱마다 반영 시간이 다를 수 있어요.",
  "Private response saved": "비공개 응답 저장됨",
  "Thanks for checking in.": "알려줘서 고마워요.",
  "Your answers are never shown to your match. They help Datehaja improve matching, venues, and safety follow-up.":
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
  "A private note for Datehaja — never your match.":
    "상대에게는 보이지 않는 Datehaja 비공개 메모",
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
  "They agreed that I can store this email for Datehaja safety plans.":
    "このメールをDatehajaの安全予定に保存する同意を得ています。",
  "Ask me how the date went": "デート後にチェックインする",
  "A private, optional check-in after the planned end time.":
    "予定終了後の任意の非公開チェックインです。",
  "Save private safety settings": "非公開の安全設定を保存",
  "Sign in to add a trusted contact and choose whether Datehaja checks in after a date.":
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
  "Subscribe once; Datehaja keeps the same event ID as it moves from reserved to finalized or cancelled.":
    "一度購読すると、同じ予定が仮予約・確定・キャンセルへ更新されます。",
  "Google Calendar": "Googleカレンダー",
  "Apple / calendar app": "Apple／カレンダーアプリ",
  "Copy private link": "非公開リンクをコピー",
  "Anyone with this secret link can read your date times. Calendar apps refresh on their own schedule.":
    "この秘密リンクを知る人はデートの時間を確認できます。反映時間はカレンダーアプリごとに異なります。",
  "Private response saved": "非公開の回答を保存済み",
  "Thanks for checking in.": "知らせてくれてありがとうございます。",
  "Your answers are never shown to your match. They help Datehaja improve matching, venues, and safety follow-up.":
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
  "A private note for Datehaja — never your match.":
    "相手には見えないDatehajaへの非公開メモ",
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
  "They agreed that I can store this email for Datehaja safety plans.":
    "Die Person hat zugestimmt, dass ich diese E-Mail für Datehaja-Sicherheitspläne speichere.",
  "Ask me how the date went": "Nach dem Date nachfragen",
  "A private, optional check-in after the planned end time.":
    "Ein privater, optionaler Check-in nach dem geplanten Ende.",
  "Save private safety settings": "Private Sicherheitseinstellungen speichern",
  "Sign in to add a trusted contact and choose whether Datehaja checks in after a date.":
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
  "Subscribe once; Datehaja keeps the same event ID as it moves from reserved to finalized or cancelled.":
    "Einmal abonnieren: Derselbe Termin wechselt zwischen reserviert, bestätigt und abgesagt.",
  "Google Calendar": "Google Kalender",
  "Apple / calendar app": "Apple / Kalender-App",
  "Copy private link": "Privaten Link kopieren",
  "Anyone with this secret link can read your date times. Calendar apps refresh on their own schedule.":
    "Jede Person mit diesem geheimen Link kann deine Date-Zeiten sehen. Kalender-Apps aktualisieren nach ihrem eigenen Zeitplan.",
  "Private response saved": "Private Antwort gespeichert",
  "Thanks for checking in.": "Danke für deine Rückmeldung.",
  "Your answers are never shown to your match. They help Datehaja improve matching, venues, and safety follow-up.":
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
  "A private note for Datehaja — never your match.":
    "Eine private Notiz für Datehaja — nie für dein Match.",
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
  "They agreed that I can store this email for Datehaja safety plans.":
    "Cette personne accepte que je conserve cet e-mail pour les plans de sécurité Datehaja.",
  "Ask me how the date went": "Me demander comment s'est passé le rendez-vous",
  "A private, optional check-in after the planned end time.":
    "Un suivi privé et facultatif après l'heure de fin prévue.",
  "Save private safety settings": "Enregistrer les paramètres privés",
  "Sign in to add a trusted contact and choose whether Datehaja checks in after a date.":
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
  "Subscribe once; Datehaja keeps the same event ID as it moves from reserved to finalized or cancelled.":
    "Abonnez-vous une fois : le même événement passe de réservé à confirmé ou annulé.",
  "Google Calendar": "Google Agenda",
  "Apple / calendar app": "Apple / application d'agenda",
  "Copy private link": "Copier le lien privé",
  "Anyone with this secret link can read your date times. Calendar apps refresh on their own schedule.":
    "Toute personne ayant ce lien secret peut voir les horaires de vos rendez-vous. Les applications d'agenda se mettent à jour à leur rythme.",
  "Private response saved": "Réponse privée enregistrée",
  "Thanks for checking in.": "Merci pour votre retour.",
  "Your answers are never shown to your match. They help Datehaja improve matching, venues, and safety follow-up.":
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
  "A private note for Datehaja — never your match.":
    "Une note privée pour Datehaja — jamais pour l'autre personne.",
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
  "They agreed that I can store this email for Datehaja safety plans.":
    "Deze persoon stemt ermee in dat ik dit e-mailadres bewaar voor Datehaja-veiligheidsplannen.",
  "Ask me how the date went": "Vraag na de date hoe het ging",
  "A private, optional check-in after the planned end time.":
    "Een privé en optionele check-in na de geplande eindtijd.",
  "Save private safety settings": "Privé-instellingen opslaan",
  "Sign in to add a trusted contact and choose whether Datehaja checks in after a date.":
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
  "Subscribe once; Datehaja keeps the same event ID as it moves from reserved to finalized or cancelled.":
    "Abonneer één keer; dezelfde afspraak verandert van gereserveerd naar bevestigd of geannuleerd.",
  "Google Calendar": "Google Agenda",
  "Apple / calendar app": "Apple / agenda-app",
  "Copy private link": "Privélink kopiëren",
  "Anyone with this secret link can read your date times. Calendar apps refresh on their own schedule.":
    "Iedereen met deze geheime link kan je datetijden zien. Agenda-apps verversen volgens hun eigen schema.",
  "Private response saved": "Privéreactie opgeslagen",
  "Thanks for checking in.": "Bedankt voor je check-in.",
  "Your answers are never shown to your match. They help Datehaja improve matching, venues, and safety follow-up.":
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
  "A private note for Datehaja — never your match.":
    "Een privénotitie voor Datehaja — nooit voor je match.",
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
  "They agreed that I can store this email for Datehaja safety plans.":
    "Personen har godkänt att jag sparar e-posten för trygghetsplaner i Datehaja.",
  "Ask me how the date went": "Fråga hur dejten gick",
  "A private, optional check-in after the planned end time.":
    "En privat, valfri avstämning efter planerad sluttid.",
  "Save private safety settings": "Spara privata säkerhetsinställningar",
  "Sign in to add a trusted contact and choose whether Datehaja checks in after a date.":
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
  "Subscribe once; Datehaja keeps the same event ID as it moves from reserved to finalized or cancelled.":
    "Prenumerera en gång; samma händelse går från reserverad till bekräftad eller avbokad.",
  "Google Calendar": "Google Kalender",
  "Apple / calendar app": "Apple / kalenderapp",
  "Copy private link": "Kopiera privat länk",
  "Anyone with this secret link can read your date times. Calendar apps refresh on their own schedule.":
    "Den som har den hemliga länken kan se dina dejttider. Kalenderappar uppdaterar enligt eget schema.",
  "Private response saved": "Privat svar sparat",
  "Thanks for checking in.": "Tack för att du berättade.",
  "Your answers are never shown to your match. They help Datehaja improve matching, venues, and safety follow-up.":
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
  "A private note for Datehaja — never your match.":
    "En privat anteckning till Datehaja — aldrig till din matchning.",
  "I want safety follow-up": "Jag vill ha säkerhetsuppföljning",
  "Save this as a private safety follow-up request. For immediate danger, contact local emergency services.":
    "Spara som en privat begäran om säkerhetsuppföljning. Kontakta lokal räddningstjänst vid omedelbar fara.",
  "Open the Safety Center": "Öppna säkerhetscentret",
  "Your private response is saved.": "Ditt privata svar har sparats.",
  "Save private response": "Spara privat svar",
  "Keep previous response": "Behåll föregående svar",
});

Object.assign(ko, {
  "Please agree to the Terms and Community Guidelines and acknowledge the Privacy Notice.":
    "이용약관과 커뮤니티 가이드라인에 동의하고 개인정보 처리방침을 확인해주세요.",
  "I agree to the": "다음 문서에 동의합니다:",
  "Terms of Service": "이용약관",
  and: "및",
  "Community Guidelines": "커뮤니티 가이드라인",
  "and acknowledge the": "그리고 다음 문서를 확인했습니다:",
  "Privacy Notice": "개인정보 처리방침",
  Terms: "약관",
  Community: "커뮤니티",
});

Object.assign(ja, {
  "Please agree to the Terms and Community Guidelines and acknowledge the Privacy Notice.":
    "利用規約とコミュニティガイドラインに同意し、プライバシー通知をご確認ください。",
  "I agree to the": "次に同意します：",
  "Terms of Service": "利用規約",
  and: "および",
  "Community Guidelines": "コミュニティガイドライン",
  "and acknowledge the": "次を確認しました：",
  "Privacy Notice": "プライバシー通知",
  Terms: "利用規約",
  Community: "コミュニティ",
});

Object.assign(de, {
  "Please agree to the Terms and Community Guidelines and acknowledge the Privacy Notice.":
    "Bitte stimme den Nutzungsbedingungen und Community-Richtlinien zu und bestätige den Datenschutzhinweis.",
  "I agree to the": "Ich stimme zu:",
  "Terms of Service": "Nutzungsbedingungen",
  and: "und",
  "Community Guidelines": "Community-Richtlinien",
  "and acknowledge the": "und bestätige den",
  "Privacy Notice": "Datenschutzhinweis",
  Terms: "Bedingungen",
  Community: "Gemeinschaft",
});

Object.assign(fr, {
  "Please agree to the Terms and Community Guidelines and acknowledge the Privacy Notice.":
    "Veuillez accepter les Conditions et les Règles de la communauté et prendre connaissance de l’avis de confidentialité.",
  "I agree to the": "J’accepte les",
  "Terms of Service": "Conditions d’utilisation",
  and: "et",
  "Community Guidelines": "Règles de la communauté",
  "and acknowledge the": "et reconnais avoir lu l’",
  "Privacy Notice": "Avis de confidentialité",
  Terms: "Conditions",
  Community: "Communauté",
});

Object.assign(nl, {
  "Please agree to the Terms and Community Guidelines and acknowledge the Privacy Notice.":
    "Ga akkoord met de Voorwaarden en Communityrichtlijnen en bevestig de Privacyverklaring.",
  "I agree to the": "Ik ga akkoord met de",
  "Terms of Service": "Gebruiksvoorwaarden",
  and: "en",
  "Community Guidelines": "Communityrichtlijnen",
  "and acknowledge the": "en bevestig de",
  "Privacy Notice": "Privacyverklaring",
  Terms: "Voorwaarden",
  Community: "Gemeenschap",
});

Object.assign(sv, {
  "Please agree to the Terms and Community Guidelines and acknowledge the Privacy Notice.":
    "Godkänn användarvillkoren och communityreglerna och bekräfta integritetsmeddelandet.",
  "I agree to the": "Jag godkänner",
  "Terms of Service": "Användarvillkor",
  and: "och",
  "Community Guidelines": "Communityregler",
  "and acknowledge the": "och bekräftar",
  "Privacy Notice": "Integritetsmeddelande",
  Terms: "Villkor",
  Community: "Gemenskap",
});

Object.assign(ko, {
  "A photo is optional. You decide whether a match sees it with your profile card or only after you both accept.":
    "사진은 선택 사항이에요. 매칭 카드에서 바로 보여줄지, 두 사람 모두 수락한 뒤 보여줄지 직접 정할 수 있어요.",
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
  "Write what a date would genuinely want to know. Contact details are removed automatically.":
    "상대가 실제로 궁금해할 나의 이야기를 적어주세요. 연락처는 자동으로 제거됩니다.",
  "Profile photo": "프로필 사진",
  "Optional. A thoughtful introduction works without one too.":
    "선택 사항이에요. 사진 없이도 진솔한 소개만으로 충분해요.",
  "Your optional profile": "선택한 프로필 사진",
  "Replace photo": "사진 바꾸기",
  "Add a photo": "사진 추가",
  "Choose an image file.": "이미지 파일을 선택해주세요.",
  "Photos must be under 6MB.": "사진은 6MB보다 작아야 해요.",
  "Upload failed.": "업로드하지 못했어요.",
  "Optional photo saved.": "선택한 사진을 저장했어요.",
  "Honest details reduce awkward surprises. Reviews check accuracy and respect, never attractiveness.":
    "솔직한 정보는 어색한 실망을 줄여요. 리뷰는 매력도가 아니라 정확성과 배려를 확인합니다.",
  "Personality you tend to connect with": "마음이 잘 통하는 성격",
  "There is no right answer. Choose ‘No preference’ if chemistry matters more than a type.":
    "정답은 없어요. 특정 유형보다 실제 케미가 중요하다면 ‘상관없음’을 골라주세요.",
  "Personality preference strength": "성격 선호 중요도",
  "No preference": "상관없음",
  Flexible: "유연하게",
  Important: "중요해요",
  "Preferred personality": "선호하는 성격",
  "Style you tend to notice": "눈길이 가는 스타일",
  "Optional. This is about personal taste, not rating anyone's looks.":
    "선택 사항이에요. 사람의 외모를 평가하는 점수가 아니라 개인적인 취향입니다.",
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
  "Your date": "만나게 될 사람",
  "Your match": "매칭된 사람",
  "Photo shared": "사진 공개됨",
  "Photo optional": "사진 미등록",
  "In their own words": "직접 쓴 자기소개",
  "They describe themselves as": "스스로 표현한 성격",
  "Their style": "평소 스타일",
  "A good first date feels": "좋아하는 첫 데이트 분위기",
  "Open to": "원하는 관계",
  "They receive the same kind of profile card. Contact details and exact location stay private.":
    "상대도 같은 범위의 내 프로필 카드를 받아요. 연락처와 정확한 위치는 계속 비공개입니다.",
  "You both said yes": "두 사람 모두 다시 만나고 싶어요",
  "Private response sealed": "비공개 응답 보관됨",
  "You both want another date.": "두 사람 모두 다음 데이트를 원해요.",
  "We'll only reveal a mutual yes.": "두 사람 모두 ‘좋아요’일 때만 알려드려요.",
  "Your check-in is complete.": "데이트 리뷰를 마쳤어요.",
  "Your private answers matched. Pick another activity when you're ready; every other review answer stays private.":
    "두 사람의 비공개 답변이 일치했어요. 준비되면 다음 활동을 골라보세요. 다른 리뷰 답변은 계속 비공개입니다.",
  "Your answer stays sealed while we wait. Neither person sees a no, maybe, or who answered first.":
    "상대의 답을 기다리는 동안 응답은 봉인됩니다. ‘아니요’, ‘아마도’ 또는 누가 먼저 답했는지는 공개하지 않아요.",
  "Neither person sees who said no or maybe. Accuracy, respect, and safety feedback only improve future matching.":
    "누가 ‘아니요’나 ‘아마도’를 골랐는지는 서로 알 수 없어요. 정확성·배려·안전 피드백은 다음 매칭 개선에만 사용됩니다.",
  "Open another evening": "다음 데이트 시간 열기",
  "Your review stays private. Only an explicit yes is revealed, and only when you both choose it.":
    "리뷰는 비공개예요. 두 사람 모두 명확히 ‘좋아요’를 선택했을 때만 재만남 의사를 알려드립니다.",
  "Did their profile feel accurate?": "프로필과 실제 모습이 비슷했나요?",
  "Yes, accurate": "네, 정확했어요",
  Mostly: "대체로요",
  "Quite different": "꽤 달랐어요",
  "Did they respect your time and boundaries?": "시간과 경계를 존중했나요?",
  "How did the conversation feel?": "대화는 어떻게 느껴졌나요?",
  Easy: "편안했어요",
  Mixed: "반반이었어요",
  Difficult: "어려웠어요",
});

Object.assign(ja, {
  "A photo is optional. You decide whether a match sees it with your profile card or only after you both accept.":
    "写真は任意です。マッチカードで見せるか、お互いの承諾後に見せるか選べます。",
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
  "Profile photo": "プロフィール写真",
  "Optional. A thoughtful introduction works without one too.":
    "任意です。丁寧な自己紹介だけでも十分です。",
  "Replace photo": "写真を変更",
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
  "Your date": "会う相手",
  "Your match": "マッチした相手",
  "Photo shared": "写真を共有済み",
  "Photo optional": "写真は任意",
  "In their own words": "本人からの紹介",
  "They describe themselves as": "本人が表す性格",
  "Their style": "普段のスタイル",
  "A good first date feels": "好きな初デートの雰囲気",
  "Open to": "希望する関係",
  "You both said yes": "お二人ともまた会いたいと回答",
  "Private response sealed": "非公開回答を保管中",
  "You both want another date.": "お二人とも次のデートを望んでいます。",
  "We'll only reveal a mutual yes.": "双方が「はい」の場合だけお知らせします。",
  "Your check-in is complete.": "レビューが完了しました。",
  "Open another evening": "次の予定を開く",
  "Did their profile feel accurate?": "プロフィールは実際と合っていましたか？",
  "Yes, accurate": "はい、正確でした",
  Mostly: "ほぼ合っていた",
  "Quite different": "かなり違った",
  "Did they respect your time and boundaries?": "時間と境界を尊重しましたか？",
  "How did the conversation feel?": "会話はどう感じましたか？",
  Easy: "自然だった",
  Mixed: "どちらとも言えない",
  Difficult: "難しかった",
});

Object.assign(de, {
  "A photo is optional. You decide whether a match sees it with your profile card or only after you both accept.":
    "Ein Foto ist optional. Du bestimmst, ob es auf der Match-Karte oder erst nach eurer beider Zusage erscheint.",
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
  "Profile photo": "Profilfoto",
  "Optional. A thoughtful introduction works without one too.":
    "Optional. Eine ehrliche Vorstellung funktioniert auch ohne Foto.",
  "Replace photo": "Foto ersetzen",
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
  "Your date": "Dein Date",
  "Your match": "Dein Match",
  "Photo shared": "Foto geteilt",
  "Photo optional": "Foto optional",
  "In their own words": "In eigenen Worten",
  "They describe themselves as": "So beschreibt sich die Person",
  "Their style": "Ihr Stil",
  "A good first date feels": "Ein gutes erstes Date fühlt sich so an",
  "Open to": "Offen für",
  "You both said yes": "Ihr habt beide Ja gesagt",
  "Private response sealed": "Private Antwort versiegelt",
  "You both want another date.": "Ihr möchtet euch beide wiedersehen.",
  "We'll only reveal a mutual yes.": "Nur ein beidseitiges Ja wird gezeigt.",
  "Your check-in is complete.": "Dein Check-in ist abgeschlossen.",
  "Open another evening": "Einen weiteren Abend öffnen",
  "Did their profile feel accurate?": "Passte das Profil zur Person?",
  "Yes, accurate": "Ja, genau",
  Mostly: "Größtenteils",
  "Quite different": "Deutlich anders",
  "Did they respect your time and boundaries?":
    "Wurden deine Zeit und Grenzen respektiert?",
  "How did the conversation feel?": "Wie fühlte sich das Gespräch an?",
  Easy: "Leicht",
  Mixed: "Gemischt",
  Difficult: "Schwierig",
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
  "Profile photo": "Photo de profil",
  "Optional. A thoughtful introduction works without one too.":
    "Facultatif. Une présentation sincère suffit aussi.",
  "Replace photo": "Remplacer la photo",
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
  "Your date": "Votre rendez-vous",
  "Your match": "Votre rencontre",
  "Photo shared": "Photo partagée",
  "Photo optional": "Photo facultative",
  "In their own words": "Avec ses propres mots",
  "They describe themselves as": "Cette personne se décrit comme",
  "Their style": "Son style",
  "A good first date feels": "L’ambiance d’un bon premier rendez-vous",
  "Open to": "Ouvert à",
  "You both said yes": "Vous avez tous les deux dit oui",
  "Private response sealed": "Réponse privée scellée",
  "You both want another date.": "Vous souhaitez tous les deux vous revoir.",
  "We'll only reveal a mutual yes.": "Seul un oui mutuel est révélé.",
  "Your check-in is complete.": "Votre retour est terminé.",
  "Open another evening": "Proposer une autre soirée",
  "Did their profile feel accurate?":
    "Le profil correspondait-il à la personne ?",
  "Yes, accurate": "Oui, fidèle",
  Mostly: "Dans l’ensemble",
  "Quite different": "Assez différent",
  "Did they respect your time and boundaries?":
    "Votre temps et vos limites ont-ils été respectés ?",
  "How did the conversation feel?": "Comment était la conversation ?",
  Easy: "Fluide",
  Mixed: "Mitigée",
  Difficult: "Difficile",
});

Object.assign(nl, {
  "A photo is optional. You decide whether a match sees it with your profile card or only after you both accept.":
    "Een foto is optioneel. Jij kiest of die op je matchkaart staat of pas nadat jullie allebei accepteren.",
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
  "Profile photo": "Profielfoto",
  "Optional. A thoughtful introduction works without one too.":
    "Optioneel. Een oprechte introductie werkt ook zonder foto.",
  "Replace photo": "Foto vervangen",
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
  "Your date": "Jouw date",
  "Your match": "Jouw match",
  "Photo shared": "Foto gedeeld",
  "Photo optional": "Foto optioneel",
  "In their own words": "In eigen woorden",
  "They describe themselves as": "Zo omschrijft de persoon zichzelf",
  "Their style": "Hun stijl",
  "A good first date feels": "Zo voelt een goede eerste date",
  "Open to": "Staat open voor",
  "You both said yes": "Jullie zeiden allebei ja",
  "Private response sealed": "Privéantwoord verzegeld",
  "You both want another date.": "Jullie willen elkaar allebei opnieuw zien.",
  "We'll only reveal a mutual yes.": "Alleen een wederzijds ja wordt gedeeld.",
  "Your check-in is complete.": "Je check-in is afgerond.",
  "Open another evening": "Nog een avond openen",
  "Did their profile feel accurate?": "Klopte het profiel met de persoon?",
  "Yes, accurate": "Ja, het klopte",
  Mostly: "Grotendeels",
  "Quite different": "Behoorlijk anders",
  "Did they respect your time and boundaries?":
    "Respecteerde de persoon je tijd en grenzen?",
  "How did the conversation feel?": "Hoe voelde het gesprek?",
  Easy: "Makkelijk",
  Mixed: "Gemengd",
  Difficult: "Moeilijk",
});

Object.assign(sv, {
  "A photo is optional. You decide whether a match sees it with your profile card or only after you both accept.":
    "En bild är valfri. Du väljer om den syns på matchningskortet eller först när båda tackat ja.",
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
  "Profile photo": "Profilbild",
  "Optional. A thoughtful introduction works without one too.":
    "Valfritt. En ärlig presentation fungerar också utan bild.",
  "Replace photo": "Byt bild",
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
  "Your date": "Din dejt",
  "Your match": "Din matchning",
  "Photo shared": "Bild delad",
  "Photo optional": "Bild valfri",
  "In their own words": "Med egna ord",
  "They describe themselves as": "Så beskriver personen sig",
  "Their style": "Personens stil",
  "A good first date feels": "Så känns en bra första dejt",
  "Open to": "Öppen för",
  "You both said yes": "Ni svarade båda ja",
  "Private response sealed": "Privat svar förseglat",
  "You both want another date.": "Ni vill båda ses igen.",
  "We'll only reveal a mutual yes.": "Bara ett ömsesidigt ja visas.",
  "Your check-in is complete.": "Din avstämning är klar.",
  "Open another evening": "Öppna en ny kväll",
  "Did their profile feel accurate?": "Stämde profilen med personen?",
  "Yes, accurate": "Ja, den stämde",
  Mostly: "Till största delen",
  "Quite different": "Ganska annorlunda",
  "Did they respect your time and boundaries?":
    "Respekterade personen din tid och dina gränser?",
  "How did the conversation feel?": "Hur kändes samtalet?",
  Easy: "Lätt",
  Mixed: "Blandat",
  Difficult: "Svårt",
});

Object.assign(ko, {
  Country: "국가",
  "Service city": "서비스 도시",
  "We match within one city so plans stay practical.":
    "실제로 만날 수 있도록 같은 도시 안에서만 매칭해요.",
  "This is the city where I want to meet people and go on dates.":
    "이 도시에서 새로운 사람을 만나고 데이트하고 싶어요.",
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
  "We match within one city so plans stay practical.":
    "実際に会えるよう、同じ都市の中でマッチングします。",
  "This is the city where I want to meet people and go on dates.":
    "この都市で新しい人と出会い、デートしたいです。",
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
  "We match within one city so plans stay practical.":
    "Wir matchen innerhalb einer Stadt, damit Treffen realistisch bleiben.",
  "This is the city where I want to meet people and go on dates.":
    "In dieser Stadt möchte ich Menschen treffen und Dates haben.",
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
  "We match within one city so plans stay practical.":
    "Nous mettons en relation dans une même ville pour permettre de vraies rencontres.",
  "This is the city where I want to meet people and go on dates.":
    "C’est dans cette ville que je souhaite rencontrer des personnes et avoir des rendez-vous.",
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
  "We match within one city so plans stay practical.":
    "We matchen binnen één stad zodat een echte afspraak haalbaar blijft.",
  "This is the city where I want to meet people and go on dates.":
    "In deze stad wil ik mensen ontmoeten en op date gaan.",
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
  "We match within one city so plans stay practical.":
    "Vi matchar inom samma stad så att riktiga träffar blir möjliga.",
  "This is the city where I want to meet people and go on dates.":
    "Det här är staden där jag vill träffa människor och gå på dejter.",
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
  "Make your other self feel like yours.":
    "Créez un alter ego qui vous ressemble.",
  "This is the face that goes into the virtual world, brings stories home, and slowly becomes recognizable as your stand-in.":
    "Ce visage part dans le monde virtuel, rapporte des histoires et devient peu à peu votre double familier.",
  "Change it anytime": "Modifiable à tout moment",
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
  None: "Aucun",
  Glasses: "Lunettes",
  Headphones: "Casque",
  "Star clip": "Barrette étoile",
  Scarf: "Écharpe",
  "My other self": "Mon alter ego",
  "Make my Agent recognizable": "Rendez votre agent reconnaissable",
  "Your look travels with the agent through dates, transcripts, and debriefs. It is playful identity—not a claim about your real appearance.":
    "Ce look accompagne l’agent dans les rendez-vous, les échanges et les bilans. C’est une identité ludique, pas une représentation de votre apparence réelle.",
});

Object.assign(nl, {
  "Preview of {agent}": "Voorbeeld van {agent}",
  "my agent": "mijn agent",
  "Make your other self feel like yours.": "Maak je andere ik echt van jou.",
  "This is the face that goes into the virtual world, brings stories home, and slowly becomes recognizable as your stand-in.":
    "Dit gezicht gaat de virtuele wereld in, brengt verhalen thuis en wordt langzaam herkenbaar als jouw plaatsvervanger.",
  "Change it anytime": "Altijd aanpasbaar",
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
  None: "Geen",
  Glasses: "Bril",
  Headphones: "Koptelefoon",
  "Star clip": "Sterspeld",
  Scarf: "Sjaal",
  "My other self": "Mijn andere ik",
  "Make my Agent recognizable": "Maak je agent herkenbaar",
  "Your look travels with the agent through dates, transcripts, and debriefs. It is playful identity—not a claim about your real appearance.":
    "Je look reist mee door dates, gesprekken en verslagen. Het is een speelse identiteit, geen uitspraak over je echte uiterlijk.",
});

Object.assign(sv, {
  "Preview of {agent}": "Förhandsvisning av {agent}",
  "my agent": "min agent",
  "Make your other self feel like yours.": "Gör ditt andra jag till ditt eget.",
  "This is the face that goes into the virtual world, brings stories home, and slowly becomes recognizable as your stand-in.":
    "Det här ansiktet går ut i den virtuella världen, tar hem berättelser och blir långsamt igenkännbart som din ställföreträdare.",
  "Change it anytime": "Ändra när du vill",
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
  None: "Ingen",
  Glasses: "Glasögon",
  Headphones: "Hörlurar",
  "Star clip": "Stjärnspänne",
  Scarf: "Halsduk",
  "My other self": "Mitt andra jag",
  "Make my Agent recognizable": "Gör din agent igenkännbar",
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
  "Agent nickname": "에이전트 별명",
  "Optional. Leave it blank and we'll name it for you.":
    "선택 사항 · 비워두면 내 이름을 따라 자동으로 지어드려요.",
  "Optional nickname": "선택 별명",
  "Your Agent represents you — it is not you":
    "에이전트는 나를 대신하지만, 나 자체는 아니에요",
  "Two Agents talking": "두 에이전트가 대화 중",
  "Gives each Agent an isolated mind, voice, and independent verdict.":
    "각 에이전트에게 독립된 생각과 목소리, 판단을 줍니다.",
  "Change how your Agent sounds, what it protects, and when it may date. Your private memory is never shown here as a public profile.":
    "에이전트의 말투와 지킬 것, 데이트 허용 시점을 바꿔요. 비공개 기억은 공개 프로필로 보이지 않아요.",
  "Make my Agent recognizable": "한눈에 알아볼 수 있는 나의 에이전트",
  "AT HOME": "집에서 준비 중",
  LISTENING: "이상형 듣는 중",
  "READY SOON": "곧 준비 완료",
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
  "What kind of person should it come home excited about?":
    "어떤 사람이라면 신나서 돌아와 이야기할까요?",
  "Write the feeling and dynamic you want, not a résumé.":
    "스펙 대신 원하는 관계의 느낌을 적어주세요.",
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
  "Tell {agent} the version close friends know":
    "친한 친구가 아는 나를 {agent}에게 알려주세요",
  "How would close friends describe you?":
    "친한 친구는 나를 어떻게 표현할까요?",
  "Choose at least two. This helps the match work both ways.":
    "두 개 이상 골라주세요. 양쪽 모두에게 맞는지 보는 데 쓰여요.",
  "Contradictions and odd habits are more useful than a polished bio.":
    "꾸민 소개보다 모순과 엉뚱한 습관이 더 유용해요.",
  "Other agents always see an AI identity. Contact unlocks only after both humans independently say yes.":
    "다른 에이전트는 항상 AI 신분만 봅니다. 두 사람이 각자 동의해야 연락처가 열려요.",
  "Seal the brief and see the pass →": "브리프를 봉인하고 패스 보기 →",
  "Your brief is complete": "브리프가 완성됐어요",
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
  "Check your inbox": "받은편지함을 확인하세요",
  "We sent a 6-digit code to {email}. It expires in 10 minutes.":
    "{email}로 6자리 코드를 보냈어요. 10분 후 만료됩니다.",
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
  "Enter the 6-digit code.": "6자리 코드를 입력해 주세요.",
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
  "We sent a 6-digit code to {email}. It expires in 10 minutes.":
    "{email}に6桁のコードを送りました。10分で期限切れになります。",
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
  "Enter the 6-digit code.": "6桁のコードを入力してください。",
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
  "We sent a 6-digit code to {email}. It expires in 10 minutes.":
    "Wir haben einen sechsstelligen Code an {email} gesendet. Er läuft in 10 Minuten ab.",
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
  "Enter the 6-digit code.": "Gib den sechsstelligen Code ein.",
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
  "We sent a 6-digit code to {email}. It expires in 10 minutes.":
    "Nous avons envoyé un code à 6 chiffres à {email}. Il expire dans 10 minutes.",
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
  "Enter the 6-digit code.": "Saisissez le code à 6 chiffres.",
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
  "We sent a 6-digit code to {email}. It expires in 10 minutes.":
    "We stuurden een zescijferige code naar {email}. Deze verloopt over 10 minuten.",
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
  "Enter the 6-digit code.": "Voer de zescijferige code in.",
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
  "We sent a 6-digit code to {email}. It expires in 10 minutes.":
    "Vi skickade en sexsiffrig kod till {email}. Den går ut om 10 minuter.",
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
  "Enter the 6-digit code.": "Ange den sexsiffriga koden.",
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
    "판단에 반박하거나 {agent}가 잘 본 점을 말해주세요. 내 반응은 다음 탐색을 위한 비공개 기억이 됩니다.",
  "Talk this date over with {agent}": "{agent}와 이 데이트 이야기하기",
  "Explain what led you to this verdict.": "왜 이런 판단을 했는지 더 설명해줘.",
  "What should you carry into the next search?":
    "다음 탐색에 꼭 반영할 점은 뭐야?",
  "Here's what your debrief got wrong:": "이 리포트가 잘못 본 점은:",
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
  "Debrief open": "Rapporten diskuteras",
  Close: "Stäng",
  "Back to the full debrief": "Tillbaka till hela rapporten",
  "Date debrief": "Dejtrapport",
  "Ask what your Agent noticed, or correct the debrief…":
    "Fråga vad din Agent lade märke till eller korrigera rapporten…",
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
