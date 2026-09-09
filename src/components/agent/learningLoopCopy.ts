type LoopCopy = {
  title: string; titleAccent: string; intro: string; steps: { title: string; body: string }[];
  loop: string; exampleLabel: string; exampleTitle: string; chooseExample: string; youSay: string;
  yourAgent: string; carriesForward: string; exampleNote: string; waiting: string; consent: string;
  talk: string; create: string; technical: string; proof: string;
  examples: { label: string; feedback: string; memory: string; nextLabel: string; next: string }[];
};

const en: LoopCopy = {
  title: "Create your Agent.", titleAccent: "Make it more you, one conversation at a time.",
  intro: "Your Agent finds people, goes on virtual dates, and comes back with a story. Tell it what felt right, what didn't, and what to try next.",
  steps: [
    { title: "Create my dating Agent", body: "Share how you talk and who you'd like to meet. Then send your Agent out." },
    { title: "Let it go on dates", body: "It looks for someone who fits and gets to know them through their Agent." },
    { title: "Hear how it went", body: "See what they did and said, and hear your Agent's honest take." },
    { title: "Tell it what you think", body: "Correct its voice, point out what you liked, or ask it to look for someone different." },
  ],
  loop: "What you tell it comes along on the next date. Keep talking, and keep shaping your Agent.",
  exampleLabel: "A little feedback goes a long way", exampleTitle: "“That's more like me.”", chooseExample: "Explore a feedback example",
  youSay: "You say", yourAgent: "Your AI Agent", carriesForward: "What it takes into the next date", exampleNote: "Illustrative examples of how feedback can carry forward. Changes to search settings are confirmed with you.",
  waiting: "If it hasn't found someone, it keeps looking. Check in whenever you like.", consent: "Meeting in real life is always a choice for both people.",
  talk: "Talk with my Agent", create: "Create my dating Agent", technical: "Curious about what happens behind the scenes?", proof: "See real before-and-after records · Korean demo",
  examples: [
    { label: "Make it sound like me", feedback: "I wouldn't give a speech like that. Keep it shorter, and don't end every reply with a question.", memory: "Short, natural replies. Leave room for the other person.", nextLabel: "A way to say it next time", next: "“Same here. I'd rather take our time.”" },
    { label: "Change what I look for", feedback: "I like someone who's curious about me too. Look for someone who asks questions back.", memory: "Notice mutual curiosity, not just an easy conversation.", nextLabel: "What to notice in the next encounter", next: "Do they pick up on an answer and want to know more? Does the curiosity go both ways?" },
    { label: "Keep what I liked", feedback: "I liked how they played along with the joke. Keep looking for that kind of ease.", memory: "A light joke that both people can build on matters to you.", nextLabel: "A good moment to look for again", next: "Notice when a little joke turns into something both people enjoy, instead of getting corrected or brushed aside." },
  ],
};

const ko: LoopCopy = {
  title: "한 번 만들고,", titleAccent: "이야기할수록 나답게.",
  intro: "내 에이전트가 상대를 찾아 가상 데이트하고 돌아와요. 나는 좋았던 점, 나답지 않았던 점, 다음엔 바라는 걸 이야기하면 돼요.",
  steps: [
    { title: "내 데이트 에이전트 만들기", body: "내 말투와 만나고 싶은 사람을 알려주고, 탐색을 맡겨요." },
    { title: "알아서 데이트하기", body: "서로 맞는 상대를 찾아 상대의 에이전트와 만나고 이야기해요." },
    { title: "다녀온 이야기 듣기", body: "둘이 뭘 했고 어떤 말을 나눴는지, 어떻게 느꼈는지 들려줘요." },
    { title: "내 생각 들려주기", body: "나답게 말해달라고, 이런 점은 좋았다고, 다른 상대를 찾아달라고 해요." },
  ],
  loop: "내가 알려준 걸 다음 만남에 가져가요. 이 과정을 반복하며 점점 내 에이전트가 되어가요.",
  exampleLabel: "이런 이야기를 들려주세요", exampleTitle: "“응, 이게 더 나 같아.”", chooseExample: "피드백 예시 보기",
  youSay: "내가 이렇게 말하면", yourAgent: "내 AI 에이전트", carriesForward: "다음 만남에 가져갈 기억", exampleNote: "피드백이 반영되는 방식을 보여주는 예시예요. 탐색 설정이 달라질 때는 나에게 확인해요.",
  waiting: "아직 맞는 사람이 없으면 계속 찾아요. 궁금할 때 들어와 보면 돼요.", consent: "실제로 만나는 건 두 사람 모두 원할 때만.",
  talk: "내 에이전트와 이야기하기", create: "내 데이트 에이전트 만들기", technical: "안에서는 어떻게 동작하는지 궁금하다면", proof: "실제 피드백 전후, 네 번의 데이트 보기",
  examples: [
    { label: "더 나답게 말해줘", feedback: "난 그렇게 길게 말 안 해. 좀 짧게 해주고, 매번 질문으로 끝내지 않아도 돼.", memory: "짧고 자연스럽게. 상대가 말을 보탤 여유 남기기.", nextLabel: "다음에 이렇게 말해볼 수 있어요", next: "“저도요. 천천히 알아가는 게 좋아요.”" },
    { label: "이런 사람을 찾아줘", feedback: "나한테도 궁금한 게 있는 사람이 좋아. 질문을 주고받는 사람을 찾아봐.", memory: "대화가 잘 이어지는지와 함께, 서로에게 호기심이 있는지 보기.", nextLabel: "다음 상대와 이야기하며 살펴볼 것", next: "내 답을 듣고 더 알고 싶어 하는지, 궁금해하는 마음이 서로 오가는지 살펴봐요." },
    { label: "이런 점은 좋았어", feedback: "장난을 편하게 받아주는 게 좋았어. 그런 여유는 계속 찾아줘.", memory: "가벼운 농담을 서로 주고받을 수 있는 분위기 기억하기.", nextLabel: "다음에도 놓치고 싶지 않은 순간", next: "작은 장난을 고치거나 넘겨버리기보다, 자기 농담을 보태며 함께 즐기는 반응을 살펴봐요." },
  ],
};

export function learningLoopText(locale: string): LoopCopy {
  return locale.startsWith("ko") ? ko : en;
}
