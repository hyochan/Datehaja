type Detail = { title: string; body: string; input: string; output: string; rule: string };
type DiagramCopy = {
  title: string; intro: string; viewLabel: string; systemView: string; learningView: string;
  process: string; savedData: string; decision: string; privatePath: string;
  yourSide: string; sharedWorld: string; theirSide: string;
  briefA: string; briefB: string; briefCaption: string; search: string; searchCaption: string;
  agentA: string; agentB: string; agentCaption: string; transcript: string; transcriptCaption: string;
  reviewA: string; reviewB: string; reviewCaption: string; recommend: string; recommendCaption: string;
  humanA: string; humanB: string; humanCaption: string; connect: string; connectCaption: string;
  settings: string; ownBriefOnly: string; eligiblePair: string; readTranscript: string; ifBothRecommend: string;
  otherwiseSearch: string; waiting: string; waitingDetail: string;
  sequenceTitle: string; sequenceIntro: string; sequenceAlt: string; owner: string; memory: string; nextDate: string;
  messages: string[]; sequenceRoutes: string[]; selfTitle: string; selfDetail: string; otherTitle: string; otherDetail: string;
  approvalTitle: string; approvalDetail: string; detailLabel: string; input: string; output: string; codePath: string;
  selectHint: string; back: string; example: string; footnote: string; mobile: string[];
  details: Record<"brief" | "search" | "date" | "review" | "letter" | "consent" | "memory", Detail>;
};

const en: DiagramCopy = {
  back: "Back to diagram",
  title: "From your words to a human connection.",
  intro: "Two private Agents, one shared encounter. Follow the data, the decisions, and the feedback that shapes the next date.",
  viewLabel: "Diagram view", systemView: "System flow", learningView: "Feedback sequence",
  process: "Process", savedData: "Saved data", decision: "Decision gate", privatePath: "Private path",
  yourSide: "YOUR PRIVATE SIDE", sharedWorld: "SHARED ENCOUNTER", theirSide: "THEIR PRIVATE SIDE",
  briefA: "Your private brief", briefB: "Their private brief", briefCaption: "Voice · needs · boundaries · memory",
  search: "Find an eligible pair", searchCaption: "Both opted in. Both people's settings fit.",
  agentA: "Your AI Agent", agentB: "Their AI Agent", agentCaption: "Speaks from its own brief and the conversation",
  transcript: "Virtual date & record", transcriptCaption: "Alternating turns · scene · saved dialogue",
  reviewA: "Your Agent's review", reviewB: "Their Agent's review", reviewCaption: "Independent read + evidence check",
  recommend: "Both recommend?", recommendCaption: "Two recommendations are required for an introduction.",
  humanA: "You decide", humanB: "They decide", humanCaption: "Read your private letter. Choose yes or no.",
  connect: "Both humans say yes?", connectCaption: "Only then does contact open.",
  settings: "Settings", ownBriefOnly: "Own brief only", eligiblePair: "Eligible pair", readTranscript: "Read saved dialogue", ifBothRecommend: "Yes → private letter",
  otherwiseSearch: "Otherwise → search", waiting: "No match yet? The search continues.",
  waitingDetail: "The site shows the real search state and last check. Routine progress stays in the app; email follows a mutual recommendation and your notification settings.",
  sequenceTitle: "One correction, carried into the next date.",
  sequenceIntro: "Example: “I wouldn't say that. Keep it shorter, and use polite language.” Your feedback is attached to the exact saved line.",
  sequenceAlt: "Feedback sequence: owner sends a correction to their Agent; the Agent updates private memory, retains earlier guidance, replies to the owner, and uses the memory in a future date.",
  owner: "You", memory: "Private memory", nextDate: "Next date",
  messages: ["Select a line + give feedback", "Read prior memory with feedback", "Merge and save durable guidance", "Reply with a next-time example", "Include in the next date prompt"],
  sequenceRoutes: ["You → your Agent", "Private memory → your Agent", "Your Agent → private memory", "Your Agent → you", "Private memory → next date"],
  selfTitle: "“That doesn't sound like me.”", selfDetail: "Refine your phrasing, humor, pace, and politeness. The saved conversation remains intact.",
  otherTitle: "“That reply put me off.”", otherDetail: "Tell your Agent how you felt about the other person. A specific reaction stays specific unless you make it a broader preference.",
  approvalTitle: "Changing search settings needs your approval.", approvalDetail: "Voice guidance enters private memory. A proposed change to relationship intent or structured taste only changes matching after you accept it. Boundaries remain yours to set.",
  detailLabel: "INSIDE THIS STEP", input: "INPUT", output: "OUTPUT", codePath: "Implementation reference", selectHint: "Select a node to inspect its inputs, outputs, and rules.",
  example: "Explore a fictional date record", footnote: "This diagram describes the implemented flow. AI dialogue is a simulation, and its interpretations can be wrong. A recommendation is a reason to explore, not proof of real-world chemistry.",
  mobile: ["Each person keeps a separate brief and memory.", "Only active searches with mutual needs and boundaries can meet.", "Two Agents take turns in a shared scene; the dialogue is saved.", "Each Agent reviews independently. Interpretations are checked against the record.", "Only two recommendations trigger an introduction and private letters.", "Contact opens only after two independent human yeses."],
  details: {
    brief: { title: "01 / A private starting point", body: "Each owner shapes their own Agent's voice, needs, and boundaries. Saved feedback accompanies that Agent into future encounters.", input: "Your profile, explicit preferences, and private coaching.", output: "Your Agent's own brief; structured settings for eligibility.", rule: "The other Agent does not receive your private memory or hidden boundary list." },
    search: { title: "02 / Search with mutual fit", body: "Background searches check eligible real participants who have also opted in. Relationship goals, locations, languages, and configured boundaries must fit both sides.", input: "Active searches + both people's current matching settings.", output: "An eligible encounter, or a waiting state with a later check.", rule: "No eligible pair means no manufactured date. A previous pair is not repeatedly introduced. Pausing stops the search." },
    date: { title: "03 / An unfolding conversation", body: "Each turn uses that Agent's own brief and the saved shared dialogue. Agents can make choices and act within the fictional scene. New encounters allow twelve turns, with one extension to sixteen for a concrete unanswered question.", input: "Own brief + shared scene + preceding turns.", output: "A saved, ordered transcript that both owners can inspect.", rule: "An explicit ending can stop the date earlier. Private prompts stay private; proposed activities must not be presented as completed ones." },
    review: { title: "04 / Read, then check the evidence", body: "The Agents form separate private recommendations. A further model review checks the letter and activity journal against saved words, including who said them and what actually happened.", input: "The completed transcript and each Agent's own context.", output: "A private read and a journal with supporting dialogue references.", rule: "Unsupported interpretations get a repair attempt. If checking still fails, the system withholds them and preserves the original dialogue. These checks are not a guarantee of correctness." },
    letter: { title: "05 / An introduction worth considering", body: "Both Agents must recommend an introduction, and current relationship goals are checked again. Each owner receives their own private letter and a link to the full encounter.", input: "Two encouraging recommendations + current compatible goals.", output: "An introduction to consider; email follows each owner's settings.", rule: "Otherwise, an active search continues. The other side's private verdict and letter remain sealed." },
    consent: { title: "06 / Two human decisions", body: "Each person reads their record and makes a separate choice. One yes leaves contact sealed. Two yeses open the connection; a no closes the introduction and resumes an active search.", input: "Your explicit decision + their explicit decision.", output: "Mutual consent → contact opens and the search stops.", rule: "An Agent's recommendation or a positive coaching message is never human consent." },
    memory: { title: "07 / Feedback that carries forward", body: "A correction is linked to this date, speaker, and line. Your Agent replies privately and merges durable guidance with earlier corrections. Future date prompts read that memory.", input: "A saved line + your own correction or reaction.", output: "Private memory and a concrete example of how to respond next time.", rule: "This changes your Agent, not the other person or the saved past. A new encounter waits while your feedback is being processed; structured search changes require your approval." },
  },
};

const ko: DiagramCopy = {
  back: "흐름도로 돌아가기",
  title: "내가 한 말이, 다음 만남으로 이어지는 과정.",
  intro: "각자의 비공개 에이전트가 하나의 가상 데이트에서 만납니다. 정보가 이동하는 경로와 판단, 피드백이 다음 만남에 반영되는 과정을 살펴보세요.",
  viewLabel: "흐름도 보기", systemView: "전체 동작 흐름", learningView: "피드백 시퀀스",
  process: "처리 과정", savedData: "저장된 정보", decision: "조건 판단", privatePath: "비공개 경로",
  yourSide: "나의 비공개 영역", sharedWorld: "함께하는 가상 만남", theirSide: "상대의 비공개 영역",
  briefA: "나의 비공개 브리프", briefB: "상대의 비공개 브리프", briefCaption: "말투 · 원하는 관계 · 경계 · 기억",
  search: "서로 맞는 상대 탐색", searchCaption: "둘 다 탐색 중이며, 서로의 조건에 맞는지 확인",
  agentA: "내 AI 에이전트", agentB: "상대 AI 에이전트", agentCaption: "자기 브리프와 지금까지의 대화로 응답",
  transcript: "가상 데이트와 기록", transcriptCaption: "번갈아 대화 · 장면 속 행동 · 발언 저장",
  reviewA: "내 에이전트의 회고", reviewB: "상대 에이전트의 회고", reviewCaption: "각자 판단한 뒤 대화 근거를 검증",
  recommend: "둘 다 만남을 추천?", recommendCaption: "두 에이전트가 모두 추천해야 소개로 진행",
  humanA: "내가 직접 결정", humanB: "상대가 직접 결정", humanCaption: "각자의 편지를 읽고 만날지 선택",
  connect: "두 사람 모두 동의?", connectCaption: "두 사람의 ‘예’가 있어야 연락처 공개",
  settings: "설정", ownBriefOnly: "자기 브리프만", eligiblePair: "서로 조건이 맞으면", readTranscript: "저장된 대화 읽기", ifBothRecommend: "예 → 각자의 편지",
  otherwiseSearch: "아니면 → 다시 탐색", waiting: "아직 맞는 사람이 없으면, 탐색을 이어갑니다.",
  waitingDetail: "사이트에서 실제 탐색 상태와 마지막 확인 시점을 보여줍니다. 진행 상황은 앱에서 확인하고, 서로 추천한 만남의 메일은 각자의 알림 설정에 따라 보냅니다.",
  sequenceTitle: "한 번의 피드백이 다음 대화에 닿기까지.",
  sequenceIntro: "예를 들어 “난 이렇게 말 안 해. 더 짧게, 존댓말로 해줘.”라고 알려주세요. 어떤 발언을 고치는지 대화 한 줄과 연결해 기억합니다.",
  sequenceAlt: "피드백 시퀀스: 내가 선택한 발언에 피드백을 보내면 내 에이전트가 기존 지침과 함께 비공개 기억에 저장합니다. 다음에 어떻게 말할지 답하고, 다음 데이트의 프롬프트에 반영합니다.",
  owner: "나", memory: "비공개 기억", nextDate: "다음 데이트",
  messages: ["발언 선택 + 피드백 보내기", "이전 기억과 피드백 함께 읽기", "교정을 합쳐 비공개 기억 저장", "다음에 어떻게 말할지 답변", "다음 데이트 프롬프트에 반영"],
  sequenceRoutes: ["나 → 내 에이전트", "비공개 기억 → 내 에이전트", "내 에이전트 → 비공개 기억", "내 에이전트 → 나", "비공개 기억 → 다음 데이트"],
  selfTitle: "“이건 나다운 말이 아니야.”", selfDetail: "표현, 유머, 대화 속도, 존댓말을 다듬습니다. 이미 나눈 대화 기록은 그대로 남습니다.",
  otherTitle: "“상대의 이 말은 별로였어.”", otherDetail: "상대의 말에서 무엇을 느꼈는지 알려주세요. 특정 상대에 대한 반응을 임의로 모든 상대의 조건으로 확대하지 않습니다.",
  approvalTitle: "탐색 조건을 바꿀 때는 내 승인이 필요해요.", approvalDetail: "말투 교정은 비공개 기억에 반영합니다. 원하는 관계나 구조화된 취향 설정은 변경 제안을 내가 수락해야 매칭에 반영됩니다. 경계 조건은 내가 직접 정합니다.",
  detailLabel: "선택한 단계 자세히", input: "입력", output: "출력", codePath: "구현 코드 경로", selectHint: "상자를 누르면 입력과 출력, 처리 규칙을 볼 수 있어요.",
  example: "가상 데이트 기록 살펴보기", footnote: "현재 구현된 흐름을 설명하는 도식입니다. AI 대화는 시뮬레이션이며 해석이 틀릴 수 있습니다. 추천은 실제로 알아볼 이유를 제안하는 것이며, 현실에서의 궁합을 보장하지 않습니다.",
  mobile: ["두 사람의 브리프와 기억은 각각 비공개로 보관합니다.", "둘 다 탐색 중이고 원하는 관계와 경계 조건이 맞아야 만납니다.", "한 장면에서 두 에이전트가 번갈아 대화하고 발언을 저장합니다.", "각자 회고한 뒤, 대화 원문을 근거로 해석을 검증합니다.", "두 에이전트가 모두 추천해야 소개와 각자의 편지를 보냅니다.", "두 사람이 독립적으로 동의해야 연락처를 공개합니다."],
  details: {
    brief: { title: "01 / 나를 닮은 출발점", body: "각자 자기 에이전트의 말투와 원하는 관계, 경계를 정합니다. 이후에 알려준 피드백도 비공개 기억으로 쌓여 다음 만남에 함께 들어갑니다.", input: "내 프로필, 직접 설정한 조건, 에이전트에게 준 피드백.", output: "내 에이전트만 읽는 브리프와 탐색에 사용할 구조화된 조건.", rule: "상대 에이전트에는 내 비공개 기억이나 숨겨진 경계 목록을 전달하지 않습니다." },
    search: { title: "02 / 서로의 니즈에 맞게 탐색", body: "탐색을 시작한 실제 사용자 중에서 서로 조건이 맞는 상대를 확인합니다. 원하는 관계, 지역, 언어와 직접 설정한 경계가 양쪽 모두 맞아야 합니다.", input: "진행 중인 탐색과 두 사람의 현재 매칭 조건.", output: "조건이 맞는 가상 만남, 또는 다음 확인을 기다리는 상태.", rule: "상대가 없으면 데이트를 만들어내지 않습니다. 같은 조합을 반복 소개하지 않으며, 일시정지하면 탐색도 멈춥니다." },
    date: { title: "03 / 대화하며 전개되는 데이트", body: "매 발언은 자기 브리프와 지금까지 저장된 대화를 바탕으로 생성합니다. 가상 장면 안에서 선택하고 행동할 수 있습니다. 새 만남은 12번의 발언을 기본으로, 구체적으로 더 물어볼 것이 있으면 한 번에 한해 16번까지 이어집니다.", input: "자기 브리프, 함께 있는 장면, 앞서 나눈 대화.", output: "두 사람이 직접 확인할 수 있는 순서대로 저장된 대화 기록.", rule: "한쪽이 명확히 마치면 더 일찍 끝날 수 있습니다. 비공개 프롬프트는 공유하지 않으며, 제안만 한 활동을 이미 한 일로 표시하면 안 됩니다." },
    review: { title: "04 / 각자 회고하고 근거 확인", body: "에이전트가 각자의 비공개 판단을 작성합니다. 추가 모델 검토가 편지와 활동 기록을 원문에 대조하며, 누가 한 말인지와 실제로 벌어진 일을 확인합니다.", input: "완료된 대화와 각자의 에이전트 정보.", output: "비공개 회고와 근거 발언이 연결된 활동 기록.", rule: "근거가 부족하면 한 번 수정을 시도합니다. 재검증에도 실패하면 해당 해석을 내보내지 않고 원문을 보존합니다. 검증을 거쳐도 오류 가능성은 남습니다." },
    letter: { title: "05 / 소개할 이유가 생겼을 때", body: "두 에이전트가 모두 만남을 추천해야 하며, 현재 원하는 관계도 다시 확인합니다. 각 사용자에게 자기 에이전트의 편지와 전체 데이트 기록으로 가는 링크를 전달합니다.", input: "양쪽의 만남 추천과 여전히 맞는 관계 조건.", output: "직접 판단할 수 있는 소개. 메일은 각자의 알림 설정을 따릅니다.", rule: "추천이 성립하지 않으면 진행 중인 탐색을 이어갑니다. 상대의 비공개 판단과 편지는 공개하지 않습니다." },
    consent: { title: "06 / 마지막 결정은 두 사람에게", body: "각자가 기록을 읽고 따로 결정합니다. 한 사람만 동의하면 연락처는 계속 비공개입니다. 두 사람이 동의하면 연결하고, 거절하면 소개를 닫고 진행 중인 탐색을 다시 이어갑니다.", input: "내가 직접 한 선택과 상대가 직접 한 선택.", output: "상호 동의 시 연락처 공개와 탐색 종료.", rule: "에이전트의 추천이나 피드백 중 긍정적인 말은 사람의 동의를 대신할 수 없습니다." },
    memory: { title: "07 / 다음 만남에 남는 피드백", body: "피드백은 날짜뿐 아니라 해당 데이트의 화자와 발언에 연결됩니다. 내 에이전트가 비공개로 답하고, 계속 반영할 지침을 이전 기억과 합칩니다. 다음 데이트의 프롬프트가 이 기억을 읽습니다.", input: "저장된 발언과 내가 직접 말한 교정 또는 상대에 대한 반응.", output: "비공개 기억과 다음에 어떻게 응답할지 보여주는 예시.", rule: "내 에이전트를 다듬으며 상대나 과거 기록을 바꾸지 않습니다. 피드백을 처리하는 동안 새 만남은 기다립니다. 구조화된 탐색 조건은 내 승인 후 바뀝니다." },
  },
};

export function systemDiagramText(locale: string): DiagramCopy {
  return locale.startsWith("ko") ? ko : en;
}
