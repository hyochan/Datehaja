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


const ja: LoopCopy = {
  title: "一度つくれば、", titleAccent: "話すほど自分らしく。",
  intro: "エージェントが相手を探し、仮想デートをして戻ってきます。よかったこと、自分らしくなかったこと、次に望むことを伝えてください。",
  steps: [
    { title: "自分のデートエージェントをつくる", body: "話し方と会いたい相手を伝えて、探索を任せます。" },
    { title: "任せてデートしてもらう", body: "合いそうな相手を探し、その人のエージェントと会って話します。" },
    { title: "どうだったか聞く", body: "ふたりが何をして何を話し、どう感じたかを伝えてくれます。" },
    { title: "自分の考えを伝える", body: "もっと自分らしく、ここはよかった、別の相手を探して、と伝えます。" },
  ],
  loop: "伝えたことは次の出会いへ持っていきます。話すほどに、あなたのエージェントになっていきます。",
  exampleLabel: "ひとことが、次を変える", exampleTitle: "「うん、こっちのほうが自分らしい。」", chooseExample: "フィードバックの例を見る",
  youSay: "あなたが伝えると", yourAgent: "あなたのAIエージェント", carriesForward: "次の出会いへ持っていく記憶", exampleNote: "フィードバックが反映される流れを示す例です。探索設定が変わるときはあなたに確認します。",
  waiting: "まだ合う人がいなければ探し続けます。気になったときに見に来てください。", consent: "実際に会うのは、ふたりとも望んだときだけ。",
  talk: "エージェントと話す", create: "自分のデートエージェントをつくる", technical: "中でどう動いているのか気になるなら", proof: "実際の前後の記録を見る · 韓国語のデモ",
  examples: [
    { label: "もっと自分らしく話して", feedback: "そんなに長くは話さないよ。もう少し短くして、毎回質問で終わらせなくていい。", memory: "短く自然に。相手が言葉を足す余白を残す。", nextLabel: "次はこう言えます", next: "「私もです。ゆっくり知っていけたらうれしいです。」" },
    { label: "こんな相手を探して", feedback: "私にも興味を持ってくれる人がいい。質問を返してくれる人を探して。", memory: "会話が続くかだけでなく、興味が互いに向いているかを見る。", nextLabel: "次の相手で見てほしいこと", next: "答えを聞いてもっと知りたがるか、その関心が双方向かを見てください。" },
    { label: "ここはよかった", feedback: "冗談を気楽に受けてくれたのがよかった。その余裕はこれからも探して。", memory: "軽い冗談を互いに交わせる空気を覚えておく。", nextLabel: "次も見逃したくない瞬間", next: "小さな冗談を直したり流したりせず、自分の冗談を足して一緒に楽しむ反応を見てください。" },
  ],
};

const de: LoopCopy = {
  title: "Einmal erstellt,", titleAccent: "mit jedem Gespräch mehr du.",
  intro: "Dein Agent sucht Menschen, geht auf virtuelle Dates und kommt mit einer Geschichte zurück. Sag ihm, was gepasst hat, was nicht, und was er als Nächstes versuchen soll.",
  steps: [
    { title: "Meinen Dating-Agenten erstellen", body: "Erzähl ihm, wie du redest und wen du gern treffen würdest. Dann schick ihn los." },
    { title: "Ihn auf Dates gehen lassen", body: "Er sucht jemanden, der passt, und lernt die Person über deren Agenten kennen." },
    { title: "Hören, wie es lief", body: "Sieh, was die beiden getan und gesagt haben, und hör die ehrliche Einschätzung deines Agenten." },
    { title: "Ihm sagen, was du denkst", body: "Korrigiere seine Stimme, sag, was dir gefallen hat, oder bitte um jemand anderen." },
  ],
  loop: "Was du ihm sagst, nimmt er mit ins nächste Date. Bleib im Gespräch und forme deinen Agenten weiter.",
  exampleLabel: "Ein wenig Feedback verändert viel", exampleTitle: "„Das klingt schon eher nach mir.“", chooseExample: "Ein Feedback-Beispiel ansehen",
  youSay: "Du sagst", yourAgent: "Dein KI-Agent", carriesForward: "Was er ins nächste Date mitnimmt", exampleNote: "Beispiele dafür, wie Feedback weiterwirken kann. Änderungen an den Suchoptionen nehmen wir erst nach deiner Bestätigung vor.",
  waiting: "Wenn er noch niemanden gefunden hat, sucht er weiter. Schau vorbei, wann du magst.", consent: "Sich im echten Leben zu treffen, ist immer die Entscheidung von beiden.",
  talk: "Mit meinem Agenten sprechen", create: "Meinen Dating-Agenten erstellen", technical: "Neugierig, was hinter den Kulissen passiert?", proof: "Echte Vorher-Nachher-Aufzeichnungen ansehen · koreanische Demo",
  examples: [
    { label: "Lass es mehr nach mir klingen", feedback: "So eine Rede würde ich nicht halten. Fass dich kürzer und beende nicht jede Antwort mit einer Frage.", memory: "Kurze, natürliche Antworten. Lass der anderen Person Raum.", nextLabel: "So ließe es sich nächstes Mal sagen", next: "„Geht mir genauso. Ich würde es lieber langsam angehen.“" },
    { label: "Ändern, wonach ich suche", feedback: "Ich mag jemanden, der auch neugierig auf mich ist. Such nach jemandem, der zurückfragt.", memory: "Auf gegenseitige Neugier achten, nicht nur auf ein leichtes Gespräch.", nextLabel: "Worauf beim nächsten Treffen zu achten ist", next: "Greift die Person eine Antwort auf und will mehr wissen? Geht die Neugier in beide Richtungen?" },
    { label: "Behalten, was mir gefiel", feedback: "Mir hat gefallen, dass die Person beim Scherz mitgegangen ist. Such weiter nach dieser Leichtigkeit.", memory: "Ein leichter Scherz, auf dem beide aufbauen können, ist dir wichtig.", nextLabel: "Ein Moment, den es wieder zu finden gilt", next: "Achte darauf, wann aus einem kleinen Scherz etwas wird, das beide genießen, statt korrigiert oder übergangen zu werden." },
  ],
};

const fr: LoopCopy = {
  title: "Créé une fois,", titleAccent: "de plus en plus vous, conversation après conversation.",
  intro: "Votre Agent cherche des personnes, fait des rendez-vous virtuels et revient avec une histoire. Dites-lui ce qui vous a plu, ce qui ne vous ressemblait pas, et ce qu’il faut essayer ensuite.",
  steps: [
    { title: "Créer mon Agent de rencontre", body: "Expliquez votre façon de parler et qui vous aimeriez rencontrer. Puis laissez votre Agent partir." },
    { title: "Le laisser aller à des rendez-vous", body: "Il cherche quelqu’un qui vous correspond et fait connaissance via l’Agent de cette personne." },
    { title: "Écouter comment ça s’est passé", body: "Voyez ce qu’ils ont fait et dit, et écoutez l’avis sincère de votre Agent." },
    { title: "Lui dire ce que vous en pensez", body: "Corrigez son ton, signalez ce qui vous a plu, ou demandez-lui de chercher quelqu’un d’autre." },
  ],
  loop: "Ce que vous lui dites l’accompagne au rendez-vous suivant. Continuez à lui parler, et continuez à le façonner.",
  exampleLabel: "Un petit retour change beaucoup", exampleTitle: "« Là, ça me ressemble davantage. »", chooseExample: "Voir un exemple de retour",
  youSay: "Vous dites", yourAgent: "Votre Agent IA", carriesForward: "Ce qu’il emporte au prochain rendez-vous", exampleNote: "Exemples illustrant comment un retour peut se reporter. Les changements de réglages de recherche sont confirmés avec vous.",
  waiting: "S’il n’a trouvé personne, il continue de chercher. Revenez quand vous voulez.", consent: "Se rencontrer pour de vrai reste toujours le choix des deux personnes.",
  talk: "Parler à mon Agent", create: "Créer mon Agent de rencontre", technical: "Curieux de ce qui se passe en coulisses ?", proof: "Voir de vraies traces avant-après · démo en coréen",
  examples: [
    { label: "Parle davantage comme moi", feedback: "Je ne ferais pas un discours pareil. Fais plus court, et ne termine pas chaque réponse par une question.", memory: "Des réponses courtes et naturelles. Laisser de la place à l’autre.", nextLabel: "Une façon de le dire la prochaine fois", next: "« Moi aussi. Je préfère qu’on prenne notre temps. »" },
    { label: "Change ce que je cherche", feedback: "J’aime quelqu’un qui est curieux de moi aussi. Cherche quelqu’un qui pose des questions en retour.", memory: "Remarquer la curiosité mutuelle, pas seulement une conversation facile.", nextLabel: "Ce qu’il faut observer à la prochaine rencontre", next: "Rebondit-elle sur une réponse pour en savoir plus ? La curiosité va-t-elle dans les deux sens ?" },
    { label: "Garde ce qui m’a plu", feedback: "J’ai aimé qu’ils entrent dans le jeu. Continue à chercher cette légèreté.", memory: "Une plaisanterie légère que les deux peuvent prolonger compte pour vous.", nextLabel: "Un bon moment à retrouver", next: "Repérez quand une petite plaisanterie devient quelque chose que les deux apprécient, au lieu d’être corrigée ou balayée." },
  ],
};

const nl: LoopCopy = {
  title: "Eén keer gemaakt,", titleAccent: "en met elk gesprek meer jou.",
  intro: "Je Agent zoekt mensen, gaat op virtuele dates en komt terug met een verhaal. Vertel wat goed voelde, wat niet, en wat hij de volgende keer moet proberen.",
  steps: [
    { title: "Mijn dating-Agent maken", body: "Vertel hoe je praat en wie je zou willen ontmoeten. Stuur je Agent er dan op uit." },
    { title: "Hem op date laten gaan", body: "Hij zoekt iemand die past en leert die persoon kennen via hun Agent." },
    { title: "Horen hoe het ging", body: "Zie wat ze deden en zeiden, en hoor het eerlijke oordeel van je Agent." },
    { title: "Zeggen wat jij ervan vindt", body: "Stuur zijn stem bij, benoem wat je goed vond, of vraag om iemand anders." },
  ],
  loop: "Wat je hem vertelt gaat mee naar de volgende date. Blijf praten, en blijf je Agent vormen.",
  exampleLabel: "Een beetje feedback doet veel", exampleTitle: "“Dit lijkt al meer op mij.”", chooseExample: "Een voorbeeld van feedback bekijken",
  youSay: "Jij zegt", yourAgent: "Jouw AI-Agent", carriesForward: "Wat hij meeneemt naar de volgende date", exampleNote: "Voorbeelden van hoe feedback kan doorwerken. Wijzigingen in zoekinstellingen bevestigen we met jou.",
  waiting: "Heeft hij nog niemand gevonden, dan blijft hij zoeken. Kom langs wanneer je wilt.", consent: "Elkaar echt ontmoeten is altijd de keuze van allebei.",
  talk: "Met mijn Agent praten", create: "Mijn dating-Agent maken", technical: "Benieuwd wat er achter de schermen gebeurt?", proof: "Echte voor-en-na-verslagen bekijken · Koreaanse demo",
  examples: [
    { label: "Klink meer als ik", feedback: "Zo’n heel verhaal zou ik niet houden. Hou het korter en eindig niet elke reactie met een vraag.", memory: "Korte, natuurlijke reacties. Laat ruimte voor de ander.", nextLabel: "Zo zou het de volgende keer kunnen", next: "“Ik ook. Ik neem liever de tijd.”" },
    { label: "Verander waar ik naar zoek", feedback: "Ik hou van iemand die ook nieuwsgierig naar mij is. Zoek iemand die terugvraagt.", memory: "Let op wederzijdse nieuwsgierigheid, niet alleen op een makkelijk gesprek.", nextLabel: "Waar je bij de volgende ontmoeting op let", next: "Pakt de ander een antwoord op en wil meer weten? Gaat de nieuwsgierigheid beide kanten op?" },
    { label: "Hou vast wat ik leuk vond", feedback: "Ik vond het fijn dat ze meegingen in de grap. Blijf zoeken naar dat gemak.", memory: "Een lichte grap waar allebei op kunnen doorbouwen is belangrijk voor jou.", nextLabel: "Een moment om weer te zoeken", next: "Let op wanneer een kleine grap iets wordt waar allebei van genieten, in plaats van gecorrigeerd of weggewuifd te worden." },
  ],
};

const sv: LoopCopy = {
  title: "Skapad en gång,", titleAccent: "och mer som du för varje samtal.",
  intro: "Din agent letar upp människor, går på virtuella dejter och kommer tillbaka med en berättelse. Berätta vad som kändes rätt, vad som inte gjorde det, och vad den ska prova härnäst.",
  steps: [
    { title: "Skapa min dejtingagent", body: "Berätta hur du pratar och vem du vill träffa. Skicka sedan ut din agent." },
    { title: "Låt den gå på dejter", body: "Den letar efter någon som passar och lär känna personen genom hens agent." },
    { title: "Hör hur det gick", body: "Se vad de gjorde och sa, och hör din agents ärliga intryck." },
    { title: "Säg vad du tycker", body: "Rätta till hur den låter, säg vad du gillade eller be den leta efter någon annan." },
  ],
  loop: "Det du berättar följer med till nästa dejt. Fortsätt prata, och fortsätt forma din agent.",
  exampleLabel: "Lite feedback räcker långt", exampleTitle: "”Så där låter det mer som jag.”", chooseExample: "Se ett exempel på feedback",
  youSay: "Du säger", yourAgent: "Din AI-agent", carriesForward: "Det den tar med till nästa dejt", exampleNote: "Exempel på hur feedback kan följa med. Ändringar i sökinställningarna görs först när du har bekräftat dem.",
  waiting: "Har den inte hittat någon fortsätter den leta. Titta in när du vill.", consent: "Att ses på riktigt är alltid bådas val.",
  talk: "Prata med min agent", create: "Skapa min dejtingagent", technical: "Nyfiken på vad som händer bakom kulisserna?", proof: "Se riktiga före-och-efter-anteckningar · koreansk demo",
  examples: [
    { label: "Låt mer som jag", feedback: "Jag skulle inte hålla ett sådant tal. Håll det kortare, och avsluta inte varje svar med en fråga.", memory: "Korta, naturliga svar. Lämna plats åt den andra.", nextLabel: "Så skulle det kunna sägas nästa gång", next: "”Samma här. Jag tar hellre det lugnt.”" },
    { label: "Ändra vad jag söker", feedback: "Jag gillar någon som är nyfiken på mig också. Leta efter någon som frågar tillbaka.", memory: "Lägg märke till ömsesidig nyfikenhet, inte bara ett lättsamt samtal.", nextLabel: "Vad den ska lägga märke till vid nästa möte", next: "Tar personen fasta på ett svar och vill veta mer? Går nyfikenheten åt båda håll?" },
    { label: "Behåll det jag gillade", feedback: "Jag gillade att hen hängde med i skämtet. Fortsätt leta efter den lättheten.", memory: "Ett lätt skämt som båda kan bygga vidare på betyder något för dig.", nextLabel: "Ett bra ögonblick att hitta igen", next: "Lägg märke till när ett litet skämt blir något båda njuter av, i stället för att rättas eller viftas bort." },
  ],
};

const PACKS: Record<string, LoopCopy> = { ko, ja, de, fr, nl, sv };

export function learningLoopText(locale: string): LoopCopy {
  return PACKS[locale.split("-")[0]] ?? en;
}
