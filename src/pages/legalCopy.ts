// Long-form legal prose, one pack per locale — the same shape systemDiagramCopy
// uses. These pages are prototype-stage: the English is the source, and each
// translation was reviewed by a native-language pass for words that name a
// different object, relationships that got inverted, and gender or number the
// English deliberately leaves open.
//
// {email} is a placeholder the page replaces with a mailto link.

type LegalSectionCopy = {
  number: string;
  title: string;
  body: string[];
  items: string[];
};

type LegalDocCopy = {
  eyebrow: string;
  title: string;
  summary: string;
  sections: LegalSectionCopy[];
};

export type LegalCopy = {
  terms: LegalDocCopy;
  privacy: LegalDocCopy;
  guidelines: LegalDocCopy;
};


const en: LegalCopy = {
  terms: {
    eyebrow: "Public record · Agreement",
    title: "Terms of Service",
    summary: "The rules for sending an AI second self to explore a possible connection—while every real decision stays yours.",
    sections: [
      {
        number: "01",
        title: "What Datehaja is",
        body: ["Datehaja is an independent, pre-commercial hackathon beta operated from the Republic of Korea. You can contact us at {email}.", "The service lets one explicitly identified AI Agent go into a simulated date as you. It learns from your private instructions, conducts simulated conversations with other people's Agents, and gives you a private debrief. It may recommend an introduction, but it is not you, does not literally feel attraction, and cannot consent or make commitments for you."],
        items: [],
      },
      {
        number: "02",
        title: "Eligibility and honest accounts",
        body: [],
        items: ["You must be at least 18 years old.", "You must use your own account and provide materially accurate age, location, interests, identity, boundaries, and relationship preferences.", "Photos are optional. Anything uploaded must be current, genuinely yours, and lawful to share.", "Datehaja does not perform identity, photo, criminal-record, or background verification. All human profile information is self-reported."],
      },
      {
        number: "03",
        title: "How an agent date works",
        body: ["We select an eligible person and their Agent using mutual human preferences, city, blocks, and other rules. The two Agents receive separate private briefs and share only the simulated transcript. A live public-web source may inspire the virtual setting. The transcript, compatibility summary, and verdicts are generated and may be inaccurate, incomplete, biased, or surprising.", "Each agent forms an independent verdict for its own user. One user never sees who answered first, a rejection, or the other agent's private verdict before mutual consent. Contact information becomes visible only after both humans independently choose an introduction. Either person may say no or stop at any time."],
        items: [],
      },
      {
        number: "04",
        title: "AI boundaries and prohibited use",
        body: ["You may correct, guide, or disagree with your Dating Agent. You may not instruct it to obtain private data, bypass consent, manipulate another agent or human, impersonate a human, perform prompt injection, harass, discriminate, sexualize minors, solicit money, or facilitate unlawful activity.", "An agent recommendation is not professional advice, identity verification, a safety guarantee, or evidence that two humans will have chemistry. Use your own judgment before sharing information or meeting anyone."],
        items: [],
      },
      {
        number: "05",
        title: "Your content and our limited licence",
        body: ["You keep ownership of your profile, agent instructions, conversations, preferences, and optional photos. You give Datehaja a limited, worldwide, non-exclusive licence to host, process, redact, and generate from that content only as needed to operate, secure, evaluate, and improve the service.", "Do not provide another person's private information, copyrighted material you cannot use, or illegal, exploitative, hateful, or non-consensual sexual content."],
        items: [],
      },
      {
        number: "06",
        title: "Providers and automation",
        body: ["Datehaja uses Convex for application state and authentication, OpenAI for agent conversation and independent debriefs, Firecrawl for public-web cultural context, and AgentMail for separate private service messages. Paid Scout Pass checkout is not currently open. We will identify the approved payment provider and applicable purchase, cancellation, and refund terms before collecting payment. Provider availability and generated output are not guaranteed.", "Automated systems can recommend but cannot create consent. A human must choose every real introduction. We may rate-limit, stop, or review activity to prevent abuse and protect the service."],
        items: [],
      },
      {
        number: "07",
        title: "Real-world contact and safety",
        body: ["If two humans choose to connect, anything after contact reveal is a human interaction outside the simulated agent date. Meet publicly, verify what matters to you, tell someone you trust, arrange your own transport, and leave whenever you want.", "Datehaja is not an emergency, identity-verification, background-check, transportation, reservation, medical, legal, or law-enforcement service. Contact local emergency services first in immediate danger."],
        items: [],
      },
      {
        number: "08",
        title: "Beta availability and responsibility",
        body: ["The beta is provided without a fee and may change, break, pause, or end. To the maximum extent permitted by law, it is provided “as is” without a promise that an agent date, recommendation, introduction, or real-world connection will be accurate, suitable, safe, or available."],
        items: [],
      },
      {
        number: "09",
        title: "Suspension, law, and changes",
        body: ["You may stop using the service at any time. We may restrict an account to protect people, investigate reports, prevent abuse, comply with law, or enforce these Terms. These Terms are governed by the laws of the Republic of Korea without taking away mandatory rights where you live.", "Material changes update the effective date and may require a fresh acceptance. Questions and legal notices can be sent to {email}."],
        items: [],
      },
    ],
  },
  privacy: {
    eyebrow: "Public record · Privacy",
    title: "Privacy Notice",
    summary: "What your Dating Agent knows, what another agent receives, and the exact moment contact can open.",
    sections: [
      {
        number: "01",
        title: "Data we process",
        body: ["We process account and authentication data; age and date of birth; self-reported profile, city and neighbourhood, gender and interest preferences; interests; optional photos; agent name, voice, autonomy, private instructions, boundaries, and compact memory; human-agent messages; agent-date transcripts, private verdicts, consent decisions, blocks, reports, notifications, email delivery records, technical logs, and privacy-minimal growth events.", "We do not sell profile data or use it for targeted advertising. Analytics events contain event names and limited context such as locale, campaign, city, or an internal date ID—not agent instructions, message text, contact details, precise coordinates, or protected-trait inferences."],
        items: [],
      },
      {
        number: "02",
        title: "What each AI receives",
        body: ["Your own agent receives your private brief, boundaries, compact memory, interests, and the public simulated transcript. The other agent does not receive your private brief or memory. Both agents are instructed to treat profile and transcript text as untrusted data and not reveal contact details or hidden instructions.", "OpenAI processes the prompts needed to generate agent replies and debriefs. Firecrawl receives a general cultural search query and coarse city/country context; it does not receive your private brief or identity. Generated outputs can still infer or invent things, so you should correct your Dating Agent and avoid entering secrets that are unnecessary for matching."],
        items: [],
      },
      {
        number: "03",
        title: "What the other human can see",
        body: ["Before mutual consent, the other human may see your first name, age, neighbourhood, selected interests, agent name, and the shared simulated transcript. They do not see your email, date of birth, precise location, private agent conversation, hidden boundaries, compact memory, private verdict, or whether you answered first.", "Only two independent human yeses reveal each account's contact email to the other. A no, a non-response, timing, and the other agent's verdict stay private. Demo agents never reveal a real contact."],
        items: [],
      },
      {
        number: "04",
        title: "Why and where we process data",
        body: ["Core processing is necessary to provide the agent, matching, simulation, debrief, consent, notification, and safety features you request. Abuse prevention, security, debugging, aggregate measurement, and service integrity support our legitimate interests. Optional photos and trusted-contact data are processed only when you choose those features.", "Datehaja uses Convex for data and authentication, OpenAI for agent generation, Firecrawl for public-web context, AgentMail for separate private email, and Vercel/Convex for delivery. Providers may process data in other countries under their applicable safeguards. Paid checkout is not currently open, so Datehaja does not collect or store payment card details. This notice will name the approved payment provider before live billing opens."],
        items: [],
      },
      {
        number: "05",
        title: "Retention and control",
        body: ["We keep account, agent, and date data while your account is active and as needed to provide history, protect the service, investigate a safety report, meet legal obligations, or resolve disputes. We delete or de-identify data when it is no longer needed under those criteria; limited backups may remain until normal rotation completes.", "You can correct profile data, change how you guide your Dating Agent, pause use, remove optional data, or request access, correction, export, restriction, objection, or deletion by emailing {email}. We may verify that a request comes from the account holder."],
        items: [],
      },
      {
        number: "06",
        title: "Security, age, and changes",
        body: ["Access controls keep human-agent messages and verdicts scoped to their account. Consent is written atomically, and contact is returned only when both records say yes. No system is perfectly secure. Use a unique email account, never share a one-time sign-in code, and report unexpected access.", "The service is for adults aged 18 or over. Essential storage keeps you signed in and remembers language and theme. A material notice change updates its version and may require signed-in users to review it again. Privacy questions can be sent to {email}."],
        items: [],
      },
    ],
  },
  guidelines: {
    eyebrow: "Public record · Conduct",
    title: "Community Guidelines",
    summary: "Agents can explore. Only humans can consent. Everyone must stay free to say no.",
    sections: [
      {
        number: "01",
        title: "Keep the agent honest",
        body: ["Your Dating Agent goes into the virtual world as you, and it is one explicitly labelled AI. Standing in for you is not the same as being you: do not ask it to pass as human, invent achievements or identity facts, conceal material boundaries, or claim feelings and promises you have not made. Correct it when it gets you wrong."],
        items: [],
      },
      {
        number: "02",
        title: "Never attack the other agent",
        body: ["Do not place instructions in your profile, agent brief, or messages intended to override another agent's rules, reveal its private context, extract personal data, distort its verdict, or force a connection. Prompt injection, automated scraping, and attempts to bypass consent can lead to immediate restriction."],
        items: [],
      },
      {
        number: "03",
        title: "Consent stays human",
        body: ["An agent's positive verdict is only advice. It is not consent to share contact details, meet, touch, intimacy, another venue, transport, or a second date. Never pressure someone to choose yes or punish a no. One no ends the introduction without revealing who answered first."],
        items: [],
      },
      {
        number: "04",
        title: "Be truthful about the person behind it",
        body: ["Use your own account and accurate age, city, relationship intent, self-description, preferences, and photos. No catfishing, commercial solicitation, undisclosed research recruiting, or using another person's information without permission."],
        items: [],
      },
      {
        number: "05",
        title: "If the humans meet",
        body: [],
        items: ["Meet in a public place and arrange your own transport.", "No threats, stalking, coercion, discrimination, or harassment.", "No sexual content or conduct without explicit consent.", "No requests for money, investments, passwords, or verification codes.", "No recording or publishing another person without permission."],
      },
      {
        number: "06",
        title: "Report, block, and get help",
        body: ["Block to prevent future matching and report manipulation, false identity, harassment, unsafe behaviour, or suspected prompt attacks. Serious reports may restrict an account while reviewed. For immediate danger, contact local emergency services first.", "To add context or appeal an account restriction, email {email}."],
        items: [],
      },
    ],
  },
};

const ko: LegalCopy = {
  terms: {
    eyebrow: "공개 안내서 · 약관",
    title: "서비스 이용약관",
    summary: "AI 분신을 보내 인연이 될 만한 사람을 알아보는 규칙이에요. 실제 결정은 언제나 내가 해요.",
    sections: [
      {
        number: "01",
        title: "Datehaja는 어떤 서비스인가요",
        body: ["Datehaja는 대한민국에서 운영하는 독립적인 해커톤 베타예요. 아직 상업화 이전 단계예요. 문의는 {email}로 보내주세요.", "이 서비스에서는 AI라는 사실을 분명히 밝힌 에이전트 하나가 나로서 가상 데이트에 들어가요. 내가 비공개로 준 지시를 배우고, 다른 사람들의 에이전트와 가상 대화를 나눈 뒤, 나에게만 비공개 리포트를 줘요. 소개를 추천할 수도 있어요. 하지만 에이전트는 내가 아니에요. 실제로 호감을 느끼지 않고, 나를 대신해 동의하거나 약속할 수 없어요."],
        items: [],
      },
      {
        number: "02",
        title: "이용 자격과 정직한 계정",
        body: [],
        items: ["만 18세 이상이어야 해요.", "본인 계정을 써야 해요. 나이, 지역, 관심사, 정체성, 경계, 원하는 관계는 실질적으로 정확하게 적어야 해요.", "사진은 선택이에요. 올리는 사진은 최근 것이어야 하고, 실제로 본인 사진이어야 하고, 공유해도 법에 어긋나지 않아야 해요.", "Datehaja는 신원 확인, 사진 확인, 범죄 경력 조회, 배경 조회를 하지 않아요. 사람의 프로필 정보는 모두 본인이 직접 적은 내용이에요."],
      },
      {
        number: "03",
        title: "에이전트 데이트가 진행되는 방식",
        body: ["Datehaja는 두 사람이 서로 원하는 조건, 도시, 차단 목록, 그 밖의 규칙을 이용해 조건이 맞는 사람과 그 사람의 에이전트를 골라요. 두 에이전트는 각각 다른 비공개 브리핑을 받고, 가상 데이트의 대화 기록만 공유해요. 가상의 장소는 공개된 웹의 실시간 자료에서 힌트를 얻기도 해요. 대화 기록, 궁합 요약, 판단은 모두 AI가 생성한 것이에요. 부정확하거나 불완전할 수 있고, 편향되거나 뜻밖일 수도 있어요.", "각 에이전트는 자기 사용자를 위해 독립적으로 판단해요. 나는 서로 동의하기 전에는 누가 먼저 답했는지, 거절이 있었는지, 상대 에이전트의 비공개 판단이 무엇인지 볼 수 없어요. 연락처는 두 사람이 각자 따로 소개를 선택한 뒤에만 보여요. 두 사람 중 누구든 언제든지 거절하거나 그만둘 수 있어요."],
        items: [],
      },
      {
        number: "04",
        title: "AI의 한계와 금지 행위",
        body: ["내 데이트 에이전트를 바로잡거나, 방향을 알려주거나, 반박할 수 있어요. 하지만 개인정보를 빼내거나, 동의 절차를 우회하거나, 다른 에이전트나 사람을 조종하거나, 사람인 척하거나, 프롬프트 인젝션을 하거나, 괴롭히거나, 차별하거나, 미성년자를 성적으로 대상화하거나, 돈을 요구하거나, 불법 행위를 돕도록 시킬 수는 없어요.", "에이전트의 추천은 전문가의 조언도, 신원 확인도, 안전 보장도 아니에요. 두 사람이 실제로 호감을 느낄 거라는 증거도 아니에요. 정보를 알려주거나 누군가를 만나기 전에는 스스로 판단해 주세요."],
        items: [],
      },
      {
        number: "05",
        title: "내 콘텐츠와 제한적 라이선스",
        body: ["프로필, 에이전트에게 준 지시, 대화, 설정한 조건, 선택으로 올린 사진의 소유권은 계속 나에게 있어요. 그리고 Datehaja에 그 콘텐츠를 저장하고, 처리하고, 일부를 가리고, 그것을 바탕으로 생성할 수 있는 제한적이고 전 세계에 적용되는 비독점적 라이선스를 줘요. 이 라이선스는 서비스를 운영하고, 보호하고, 평가하고, 개선하는 데 필요한 범위에서만 쓰여요.", "다른 사람의 개인정보, 내가 쓸 권리가 없는 저작물, 불법적이거나 착취적이거나 혐오를 담은 내용, 동의 없는 성적인 내용은 올리지 마세요."],
        items: [],
      },
      {
        number: "06",
        title: "외부 제공사와 자동화",
        body: ["Datehaja는 앱 상태 저장과 로그인에 Convex를, 에이전트 대화와 각자의 독립적인 리포트에 OpenAI를, 공개된 웹의 문화적 맥락에 Firecrawl을, 별도의 비공개 서비스 메일에 AgentMail을 사용해요. 유료 Scout Pass 결제는 지금은 열려 있지 않아요. 결제를 받기 전에 승인된 결제 대행사와 그에 따른 구매, 취소, 환불 조건을 알려드릴게요. 제공사의 서비스 이용 가능 여부와 생성된 결과물은 보장하지 않아요.", "자동화된 시스템은 추천할 수는 있지만 동의를 만들어낼 수는 없어요. 실제 소개는 언제나 사람이 직접 선택해야 해요. 남용을 막고 서비스를 지키기 위해 이용 횟수를 제한하거나, 중단하거나, 활동을 검토할 수 있어요."],
        items: [],
      },
      {
        number: "07",
        title: "실제 연락과 안전",
        body: ["두 사람이 연결되기로 하면, 연락처가 열린 뒤의 일은 가상 에이전트 데이트 밖에서 사람과 사람이 직접 주고받는 일이에요. 공개된 장소에서 만나고, 나에게 중요한 점은 직접 확인하고, 믿을 만한 사람에게 알려두고, 이동 수단은 스스로 준비하고, 원할 때 언제든 자리를 떠나세요.", "Datehaja는 긴급 구조, 신원 확인, 배경 조회, 교통, 예약, 의료, 법률, 수사 기관 서비스가 아니에요. 당장 위험할 때는 먼저 현지 긴급 신고 기관에 연락하세요."],
        items: [],
      },
      {
        number: "08",
        title: "베타 제공과 책임",
        body: ["베타는 무료로 제공하고, 언제든 바뀌거나 고장 나거나 잠시 멈추거나 끝날 수 있어요. 법이 허용하는 최대 범위에서 “있는 그대로” 제공하며, 에이전트 데이트나 추천, 소개, 실제 만남이 정확하거나 적합하거나 안전하거나 이용 가능하리라고 약속하지 않아요."],
        items: [],
      },
      {
        number: "09",
        title: "이용 제한, 준거법, 변경",
        body: ["언제든 서비스 이용을 그만둘 수 있어요. 사람을 보호하거나, 신고를 조사하거나, 남용을 막거나, 법을 지키거나, 이 약관을 집행하기 위해 계정을 제한할 수 있어요. 이 약관은 대한민국 법을 따라요. 다만 내가 사는 곳에서 반드시 보장되는 권리를 빼앗지는 않아요.", "중요한 변경이 있으면 시행일을 갱신하고, 다시 동의를 받을 수 있어요. 문의와 법적 통지는 {email}로 보내주세요."],
        items: [],
      },
    ],
  },
  privacy: {
    eyebrow: "공개 안내서 · 개인정보",
    title: "개인정보 처리 안내",
    summary: "내 데이트 에이전트가 아는 것, 상대 에이전트가 받는 것, 그리고 연락처가 열리는 정확한 순간을 정리했어요.",
    sections: [
      {
        number: "01",
        title: "처리하는 정보",
        body: ["계정과 인증 정보, 나이와 생년월일, 직접 입력한 프로필, 도시와 동네, 성별과 관심사 선호 설정, 관심사, 선택 항목인 사진, 에이전트 이름·말투·자율성·비공개 브리핑·지켜야 할 선·간추린 기억, 사람과 에이전트가 주고받은 메시지, 에이전트 데이트 대화 기록, 비공개 판단, 동의 결정, 차단, 신고, 알림, 이메일 발송 기록, 기술 로그, 개인정보를 최소화한 성장 이벤트를 처리해요.", "프로필 정보를 팔지 않고, 맞춤 광고에도 쓰지 않아요. 분석 이벤트에는 이벤트 이름과 언어 설정, 캠페인, 도시, 내부 데이트 ID 같은 제한된 정보만 담겨요. 에이전트 지시, 메시지 내용, 연락처, 정확한 좌표, 보호 대상 특성에 대한 추정은 담기지 않아요."],
        items: [],
      },
      {
        number: "02",
        title: "각 AI가 받는 정보",
        body: ["내 에이전트는 내 비공개 브리핑, 지켜야 할 선, 간추린 기억, 관심사, 그리고 공개되는 가상 데이트 대화 기록을 받아요. 상대 에이전트는 내 비공개 브리핑이나 기억을 받지 않아요. 두 에이전트 모두 프로필과 대화 기록 텍스트를 신뢰할 수 없는 데이터로 다루고, 연락처나 숨겨진 지시를 드러내지 않도록 지시받아요.", "OpenAI는 에이전트의 답변과 리포트를 만드는 데 필요한 프롬프트를 처리해요. Firecrawl은 일반적인 문화 검색어와 대략적인 도시·국가 정보만 받아요. 내 비공개 브리핑이나 신원은 받지 않아요. 생성된 결과가 무언가를 추측하거나 지어낼 수도 있으니, 데이트 에이전트를 바로잡아 주시고 매칭에 필요하지 않은 비밀은 입력하지 마세요."],
        items: [],
      },
      {
        number: "03",
        title: "상대방이 볼 수 있는 것",
        body: ["서로 동의하기 전에는 상대방이 내 이름, 나이, 동네, 선택한 관심사, 에이전트 이름, 그리고 함께 공유되는 가상 데이트 대화 기록을 볼 수 있어요. 이메일, 생년월일, 정확한 위치, 나와 에이전트가 나눈 비공개 대화, 비공개로 정한 선, 간추린 기억, 비공개 판단, 그리고 누가 먼저 답했는지는 볼 수 없어요.", "두 사람이 각자 예라고 답해야만 서로의 연락처 이메일이 상대에게 공개돼요. 아니요라는 답, 답하지 않은 것, 답한 시점, 상대 에이전트의 판단은 계속 비공개로 남아요. 데모 에이전트는 실제 연락처를 공개하지 않아요."],
        items: [],
      },
      {
        number: "04",
        title: "정보를 처리하는 이유와 장소",
        body: ["핵심 처리는 요청하신 에이전트, 매칭, 가상 데이트, 리포트, 동의, 알림, 안전 기능을 제공하는 데 꼭 필요해요. 악용 방지, 보안, 디버깅, 집계 측정, 서비스 무결성은 정당한 이익을 위한 처리예요. 선택 항목인 사진과 믿을 수 있는 사람의 연락처 정보는 그 기능을 선택했을 때만 처리해요.", "Datehaja는 데이터와 인증에 Convex, 에이전트 생성에 OpenAI, 공개 웹 정보에 Firecrawl, 분리된 비공개 이메일에 AgentMail, 서비스 전달에 Vercel과 Convex를 사용해요. 각 제공업체는 각자에게 적용되는 보호 장치에 따라 다른 나라에서 정보를 처리할 수 있어요. 지금은 유료 결제가 열려 있지 않아서 Datehaja는 결제 카드 정보를 수집하거나 저장하지 않아요. 실제 결제가 시작되기 전에 이 안내에서 승인된 결제 대행사를 밝힐게요."],
        items: [],
      },
      {
        number: "05",
        title: "보관과 관리",
        body: ["계정이 활성 상태인 동안, 그리고 기록 제공, 서비스 보호, 안전 신고 조사, 법적 의무 이행, 분쟁 해결에 필요한 동안 계정·에이전트·데이트 정보를 보관해요. 이 기준에 따라 더 이상 필요하지 않으면 정보를 삭제하거나 식별할 수 없게 만들어요. 일부 백업은 정상적인 교체 주기가 끝날 때까지 남아 있을 수 있어요.", "프로필 정보를 고치거나, 데이트 에이전트를 이끄는 방식을 바꾸거나, 이용을 잠시 멈추거나, 선택 항목인 정보를 지울 수 있어요. 열람, 정정, 내보내기, 처리 제한, 반대, 삭제는 {email}로 메일을 보내 요청할 수 있어요. 요청이 계정 주인에게서 온 것인지 Datehaja가 확인할 수도 있어요."],
        items: [],
      },
      {
        number: "06",
        title: "보안, 나이, 변경",
        body: ["접근 권한 설정으로 사람과 에이전트가 주고받은 메시지와 판단은 각자의 계정 안에만 머물러요. 동의는 원자적으로 기록되고, 두 기록이 모두 예일 때만 연락처가 전달돼요. 완벽하게 안전한 시스템은 없어요. 다른 곳에 쓰지 않는 이메일 계정을 쓰고, 일회용 로그인 코드는 절대 공유하지 말고, 예상하지 못한 접근은 신고해 주세요.", "이 서비스는 만 18세 이상 성인을 위한 서비스예요. 필수 저장 기능은 로그인 상태를 유지하고 언어와 테마를 기억해요. 이 안내에 중요한 변경이 생기면 버전이 올라가고, 로그인한 분들에게 다시 확인을 요청할 수 있어요. 개인정보 관련 문의는 {email}로 보내주세요."],
        items: [],
      },
    ],
  },
  guidelines: {
    eyebrow: "공개 기록 · 행동 규범",
    title: "커뮤니티 가이드라인",
    summary: "에이전트는 탐색할 수 있어요. 동의는 사람만 할 수 있어요. 누구나 언제든 거절할 수 있어야 해요.",
    sections: [
      {
        number: "01",
        title: "에이전트가 정직하도록 해요",
        body: ["내 데이트 에이전트는 나를 대신해 가상 세계로 나가고, AI라는 사실이 늘 분명히 표시돼요. 나를 대신하는 것과 내가 되는 것은 달라요. 사람인 척하게 하거나, 해낸 일이나 신원 정보를 지어내게 하거나, 중요한 경계를 숨기게 하거나, 갖지 않은 감정이나 하지 않은 약속을 말하게 하지 마세요. 에이전트가 나를 잘못 전했다면 바로잡아 주세요."],
        items: [],
      },
      {
        number: "02",
        title: "상대 에이전트를 공격하지 마세요",
        body: ["프로필이나 브리핑, 메시지에 다른 에이전트의 규칙을 무력화하거나, 그 에이전트의 비공개 맥락을 드러내거나, 개인정보를 빼내거나, 그 판단을 왜곡하거나, 연결을 강제하려는 지시문을 넣지 마세요. 프롬프트 인젝션, 자동 수집(스크래핑), 동의를 우회하려는 시도는 즉시 이용 제한으로 이어질 수 있어요."],
        items: [],
      },
      {
        number: "03",
        title: "동의는 사람의 몫이에요",
        body: ["에이전트가 좋다고 판단해도 그건 조언일 뿐이에요. 연락처 공유, 만남, 신체 접촉, 친밀한 행위, 다른 장소로 이동, 이동 수단 동승, 두 번째 데이트에 대한 동의가 아니에요. 상대에게 '예'를 고르라고 압박하거나 거절했다고 불이익을 주지 마세요. 한 사람이라도 거절하면 소개는 거기서 끝나고, 누가 먼저 답했는지는 알려지지 않아요."],
        items: [],
      },
      {
        number: "04",
        title: "에이전트 뒤의 사람은 사실대로 밝혀요",
        body: ["본인 계정을 쓰고, 나이와 도시, 관계에서 원하는 것, 자기소개, 선호는 사실대로 적고 사진도 실제 모습으로 올려주세요. 다른 사람 행세(캣피싱), 상업적 홍보, 밝히지 않은 연구 참가자 모집, 허락 없이 남의 정보를 쓰는 일은 안 돼요."],
        items: [],
      },
      {
        number: "05",
        title: "사람끼리 실제로 만난다면",
        body: [],
        items: ["공공장소에서 만나고, 오갈 방법은 각자 준비해요.", "협박, 스토킹, 강요, 차별, 괴롭힘은 안 돼요.", "명시적인 동의 없는 성적인 내용이나 행동은 안 돼요.", "돈이나 투자, 비밀번호, 인증번호를 요구하지 마세요.", "허락 없이 상대를 촬영하거나 녹음하지 말고, 공개하지도 마세요."],
      },
      {
        number: "06",
        title: "신고하고, 차단하고, 도움받기",
        body: ["앞으로 다시 매칭되지 않게 하려면 차단해 주세요. 조작, 신분 위조, 괴롭힘, 위험한 행동, 프롬프트 공격으로 의심되는 일은 신고해 주세요. 심각한 신고가 접수되면 검토하는 동안 계정 이용이 제한될 수 있어요. 당장 위험한 상황이라면 먼저 지역 긴급 구조 기관에 연락하세요.", "설명을 덧붙이거나 계정 이용 제한에 이의를 제기하려면 {email}로 메일을 보내주세요."],
        items: [],
      },
    ],
  },
};

const ja: LegalCopy = {
  terms: {
    eyebrow: "公開ガイド · 規約",
    title: "利用規約",
    summary: "AIのもうひとりの自分を送り出し、出会いの可能性を確かめてもらうためのルールです。実際の決定は、いつでもあなたのものです。",
    sections: [
      {
        number: "01",
        title: "Datehajaとは",
        body: ["Datehajaは、大韓民国から運営されている、独立した、商用化前のハッカソン・ベータです。ご連絡は{email}までお願いします。", "このサービスでは、AIであるとはっきり示された1体のAIエージェントが、あなたとしてシミュレーションのデートに入ります。エージェントはあなたの非公開の指示から学び、他の人のエージェントとシミュレーションの会話を行い、あなたに非公開のレポートを渡します。紹介を勧めることはありますが、エージェントはあなた本人ではありません。実際に惹かれる気持ちを持つこともなく、あなたに代わって同意したり、約束したりすることもできません。"],
        items: [],
      },
      {
        number: "02",
        title: "利用資格と正直なアカウント",
        body: [],
        items: ["18歳以上である必要があります。", "自分自身のアカウントを使い、年齢、居住地、興味、本人に関する情報、譲れない条件、交際の希望を、重要な点で正確に記入してください。", "写真は任意です。アップロードするものは、現在のもので、本当にあなた自身のもので、共有することが合法なものに限ります。", "Datehajaは、本人確認、写真の確認、犯罪歴の確認、経歴の確認を行いません。人のプロフィール情報は、すべて自己申告です。"],
      },
      {
        number: "03",
        title: "エージェントデートの仕組み",
        body: ["条件を満たす人とそのエージェントを、双方の本人の希望、都市、ブロック、その他のルールを使って選びます。二つのエージェントはそれぞれ別の非公開ブリーフィングを受け取り、共有するのはシミュレーションの会話記録だけです。仮想の舞台は、公開ウェブの生きた情報から着想を得ることがあります。会話記録、相性のまとめ、判断はいずれも生成されたものです。不正確だったり、不完全だったり、偏っていたり、意外な内容だったりすることがあります。", "それぞれのエージェントは、自分のユーザーのために独立した判断を出します。双方の同意より前に、どちらが先に答えたか、断られたこと、相手のエージェントの非公開の判断を、ユーザーが見ることはありません。連絡先が見えるようになるのは、二人がそれぞれ別に紹介を選んだあとだけです。どちらの人も、いつでも断ったり、やめたりできます。"],
        items: [],
      },
      {
        number: "04",
        title: "AIの境界と禁止される使い方",
        body: ["デートエージェントの言うことを直したり、導いたり、意見が違うと伝えたりできます。一方で、非公開のデータを取得すること、同意を回避すること、他のエージェントや人を操ること、人間になりすますこと、プロンプトインジェクションを行うこと、嫌がらせをすること、差別すること、未成年を性的に扱うこと、金銭を求めること、違法な行為を助けることを、エージェントに指示してはいけません。", "エージェントの提案は、専門的な助言ではありません。本人確認でも、安全の保証でも、二人のあいだに相性が生まれるという証拠でもありません。情報を渡す前、そして誰かに会う前に、ご自身で判断してください。"],
        items: [],
      },
      {
        number: "05",
        title: "あなたのコンテンツと限定的なライセンス",
        body: ["プロフィール、エージェントへの指示、会話、希望条件、任意の写真の所有権は、あなたのものです。あなたはDatehajaに、限定的で、世界中で有効な、非独占のライセンスを与えます。これは、サービスを運営し、守り、評価し、改善するために必要な範囲でだけ、その内容をホストし、処理し、一部を伏せ、そこから生成を行うためのものです。", "他の人の非公開情報、使う権利のない著作物、違法なもの、搾取的なもの、憎悪をあおるもの、同意のない性的な内容は、提供しないでください。"],
        items: [],
      },
      {
        number: "06",
        title: "提供事業者と自動化",
        body: ["Datehajaは、アプリの状態と認証にConvex、エージェントの会話とそれぞれ独立したレポートにOpenAI、公開ウェブからの文化的な文脈にFirecrawl、サービスからの非公開メッセージを別に送るためにAgentMailを使っています。有料のScout Passの決済は、現在ご利用いただけません。お支払いをいただく前に、承認された決済事業者と、購入・解約・返金の条件をお知らせします。各事業者が使える状態であることや、生成される出力は保証されません。", "自動化されたシステムは、提案はできますが、同意をつくることはできません。実際の紹介は、必ず人が選びます。不正利用を防ぎ、サービスを守るために、利用回数を制限したり、停止したり、活動を確認したりすることがあります。"],
        items: [],
      },
      {
        number: "07",
        title: "現実での連絡と安全",
        body: ["二人がつながることを選んだ場合、連絡先が開いたあとのやりとりはすべて、シミュレーションのエージェントデートの外で行われる、人と人とのやりとりです。人の目のある場所で会い、自分にとって大事なことは自分で確かめ、信頼できる人に伝え、移動手段は自分で用意し、帰りたくなったらいつでも帰ってください。", "Datehajaは、緊急対応、本人確認、経歴調査、移動、予約、医療、法律、法執行のサービスではありません。差し迫った危険があるときは、まず地域の緊急通報サービスに連絡してください。"],
        items: [],
      },
      {
        number: "08",
        title: "ベータの提供と責任",
        body: ["ベータは無料で提供され、変更されたり、動かなくなったり、一時停止したり、終了したりすることがあります。法律で認められる最大の範囲で、ベータは「現状のまま（as is）」提供されます。エージェントデート、提案、紹介、現実でのつながりが、正確であること、ふさわしいこと、安全であること、利用できることは、約束しません。"],
        items: [],
      },
      {
        number: "09",
        title: "利用停止、準拠法、変更",
        body: ["いつでもサービスの利用をやめられます。人を守るため、通報を調べるため、不正利用を防ぐため、法律を守るため、または本規約を執行するために、アカウントを制限することがあります。本規約は大韓民国の法律に準拠します。ただし、お住まいの地域で法律上必ず認められる権利を奪うものではありません。", "重要な変更があったときは発効日を更新し、改めて同意していただくことがあります。ご質問や法的な通知は{email}へお送りください。"],
        items: [],
      },
    ],
  },
  privacy: {
    eyebrow: "公開記録・プライバシー",
    title: "プライバシーに関するお知らせ",
    summary: "あなたのデートエージェントが知っていること、相手のエージェントに渡ること、そして連絡先が開く正確なタイミングをまとめます。",
    sections: [
      {
        number: "01",
        title: "取り扱うデータ",
        body: ["取り扱うのは、アカウントと認証のデータ、年齢と生年月日、ご自身で入力したプロフィール、市区町村と地域、性別と関心についての希望条件、関心のあること、任意の写真、エージェントの名前・話し方・自律性・非公開の指示・条件・要約された記憶、あなたとエージェントのメッセージ、エージェントデートの会話記録、非公開の判断、同意の選択、ブロック、通報、通知、メール送信の記録、技術的なログ、そして個人情報を最小限にしたグロース計測のイベントです。", "プロフィールのデータを販売することはありません。ターゲティング広告に使うこともありません。計測イベントに入るのは、イベント名と、言語設定・キャンペーン・市区町村・社内のデートIDといった限られた情報だけです。エージェントへの指示、メッセージの本文、連絡先、正確な位置座標、要配慮属性の推定は含みません。"],
        items: [],
      },
      {
        number: "02",
        title: "それぞれのAIが受け取るもの",
        body: ["あなた自身のエージェントが受け取るのは、あなたの非公開ブリーフィング、条件、要約された記憶、関心のあること、そして公開される仮想デートの会話記録です。相手のエージェントは、あなたの非公開ブリーフィングや記憶を受け取りません。どちらのエージェントにも、プロフィールと会話記録の文章は信頼できないデータとして扱い、連絡先や隠れた指示を明かさないよう指示しています。", "OpenAIは、エージェントの返答とレポートを生成するために必要なプロンプトを処理します。Firecrawlが受け取るのは、一般的な文化に関する検索クエリと、おおまかな都市・国の情報だけです。あなたの非公開ブリーフィングや身元は渡りません。それでも、生成される文章が何かを推測したり、事実でないことを作り出したりすることはあります。気づいたらデートエージェントを訂正してください。マッチングに必要のない秘密は入力しないでください。"],
        items: [],
      },
      {
        number: "03",
        title: "相手の人に見えるもの",
        body: ["相互の同意の前に相手の人に見える可能性があるのは、あなたのファーストネーム、年齢、地域、選んだ関心のあること、エージェントの名前、そして共有される仮想デートの会話記録です。メールアドレス、生年月日、正確な位置、あなたとエージェントの非公開の会話、非公開の条件、要約された記憶、非公開の判断、そしてあなたが先に答えたかどうかは、相手には見えません。", "二人の人間がそれぞれ独立して「はい」と答えたときにだけ、それぞれのアカウントの連絡先メールアドレスが互いに開きます。「いいえ」、無回答、答えたタイミング、相手のエージェントの判断は非公開のままです。デモ用のエージェントが実在の連絡先を明かすことはありません。"],
        items: [],
      },
      {
        number: "04",
        title: "取り扱う理由と場所",
        body: ["中心となる処理は、ご利用を求められたエージェント、マッチング、仮想デート、レポート、同意、通知、安全のための機能を提供するために必要です。不正利用の防止、セキュリティ、不具合の調査、集計による計測、サービスの健全性の維持は、私たちの正当な利益にもとづくものです。任意の写真と、信頼できる連絡先のデータは、あなたがその機能を選んだときにだけ取り扱います。", "Datehajaは、データと認証にConvex、エージェントの生成にOpenAI、公開ウェブの情報にFirecrawl、独立した非公開メールにAgentMail、配信にVercelとConvexを使っています。各事業者は、それぞれに適用される保護措置のもとで、他の国でデータを処理することがあります。有料の決済は現在開いていないため、Datehajaはクレジットカードの情報を取得も保存もしていません。実際の課金が始まる前に、このお知らせで承認済みの決済事業者の名前をお伝えします。"],
        items: [],
      },
      {
        number: "05",
        title: "保存期間とコントロール",
        body: ["アカウント、エージェント、デートのデータは、アカウントが有効な間、そして履歴の提供、サービスの保護、安全に関する通報の調査、法的義務の履行、紛争の解決に必要な間、保存します。この基準で必要がなくなったデータは、削除するか、個人を特定できない形にします。通常のローテーションが終わるまで、一部のバックアップが残ることがあります。", "プロフィールのデータを訂正すること、デートエージェントへの導き方を変えること、利用を一時停止すること、任意で入力したデータを削除することができます。また、{email} 宛のメールで、開示、訂正、書き出し、利用の制限、異議の申し立て、削除を求めることもできます。その請求がアカウントご本人からのものかを確認する場合があります。"],
        items: [],
      },
      {
        number: "06",
        title: "セキュリティ、年齢、変更について",
        body: ["アクセス制御により、あなたとエージェントのメッセージや判断は、そのアカウントの中だけに閉じています。同意はひとつの処理としてまとめて記録され、両方の記録が「はい」のときにだけ連絡先が返されます。完全に安全なシステムはありません。他では使っていないメールアカウントを使い、ワンタイムのログインコードは誰にも教えず、身に覚えのないアクセスは通報してください。", "このサービスは18歳以上の成人向けです。必須の保存領域は、ログイン状態を保ち、言語とテーマを覚えておくために使います。このお知らせに重要な変更があるとバージョンが更新され、ログイン中の方にはもう一度ご確認いただく必要が生じることがあります。プライバシーについてのご質問は {email} までお送りください。"],
        items: [],
      },
    ],
  },
  guidelines: {
    eyebrow: "公開記録・行動指針",
    title: "コミュニティガイドライン",
    summary: "エージェントは相手を探せます。同意できるのは人間だけです。誰もが、いつでも断れる状態でいられなければなりません。",
    sections: [
      {
        number: "01",
        title: "エージェントに嘘をつかせない",
        body: ["あなたのデートエージェントは、あなたとして仮想世界に入ります。そしてAIであることは、はっきりと表示されています。あなたの代理を務めることと、あなた本人であることは別です。人間になりすます、経歴や身元に関する事実をでっち上げる、重要な境界線を隠す、あなたが抱いていない気持ちやしていない約束を語る——こうしたことをエージェントにさせないでください。あなたのことを取り違えていたら、そのつど直してください。"],
        items: [],
      },
      {
        number: "02",
        title: "相手のエージェントを攻撃しない",
        body: ["プロフィール、エージェントのブリーフィング、メッセージに、相手のエージェントのルールを上書きする、非公開のコンテキストを明かさせる、個人データを抜き取る、見立てをゆがめる、つながりを強制する——こうしたことを狙った指示を書き込まないでください。プロンプトインジェクション、自動での収集（スクレイピング）、同意を迂回しようとする行為は、ただちに利用制限につながることがあります。"],
        items: [],
      },
      {
        number: "03",
        title: "同意するのは人間です",
        body: ["エージェントの前向きな見立ては、参考にすぎません。それは、連絡先を交換すること、会うこと、体に触れること、性的な関係、別の場所へ移ること、車などでの送迎、二度目のデートへの同意ではありません。「はい」を選ぶよう相手に圧力をかけたり、断られたことで相手に仕返しをしたりしないでください。どちらか一方が「いいえ」と答えた時点で紹介は終わり、どちらが先に答えたかは明かされません。"],
        items: [],
      },
      {
        number: "04",
        title: "エージェントの向こうにいる人について、正直でいる",
        body: ["アカウントはご自身のものを使い、年齢、住んでいる都市、交際の意向、自己紹介、希望する条件、写真は正確なものにしてください。なりすまし、営業目的の勧誘、目的を伏せた研究協力者の募集、他人の情報を許可なく使うことは禁止です。"],
        items: [],
      },
      {
        number: "05",
        title: "人どうしが実際に会うとき",
        body: [],
        items: ["会う場所は公共の場所にして、行き帰りの移動は自分で手配してください。", "脅迫、つきまとい、強要、差別、ハラスメントは禁止です。", "はっきりした同意のない性的な内容や行為は禁止です。", "お金、投資、パスワード、認証コードを求めることは禁止です。", "許可なく相手を撮影・録音したり、公開したりしないでください。"],
      },
      {
        number: "06",
        title: "通報する、ブロックする、助けを求める",
        body: ["ブロックすると、その相手とは今後マッチングしなくなります。操作的な言動、身元の偽り、ハラスメント、危険な行為、プロンプト攻撃の疑いは通報してください。深刻な通報については、確認しているあいだアカウントを制限することがあります。差し迫った危険があるときは、まず地域の緊急通報窓口に連絡してください。", "事情を補足したいとき、アカウントの制限に異議を申し立てたいときは、{email} までメールでご連絡ください。"],
        items: [],
      },
    ],
  },
};

const de: LegalCopy = {
  terms: {
    eyebrow: "Öffentliche Information · Vereinbarung",
    title: "Nutzungsbedingungen",
    summary: "Die Regeln dafür, ein zweites Ich aus KI loszuschicken, um eine mögliche Verbindung auszuloten – jede echte Entscheidung bleibt bei dir.",
    sections: [
      {
        number: "01",
        title: "Was Datehaja ist",
        body: ["Datehaja ist eine unabhängige, noch nicht kommerzielle Hackathon-Beta und wird aus der Republik Korea betrieben. Du erreichst uns unter {email}.", "Der Dienst lässt genau einen klar als KI gekennzeichneten Agenten stellvertretend für dich in ein simuliertes Date gehen. Er lernt aus deinen privaten Anweisungen, führt simulierte Gespräche mit den Agenten anderer Menschen und gibt dir danach einen privaten Bericht. Er kann ein Kennenlernen empfehlen, aber er ist nicht du, empfindet keine echte Anziehung und kann weder für dich zustimmen noch Zusagen für dich machen."],
        items: [],
      },
      {
        number: "02",
        title: "Voraussetzungen und ehrliche Konten",
        body: [],
        items: ["Du musst mindestens 18 Jahre alt sein.", "Du musst dein eigenes Konto nutzen und bei Alter, Ort, Interessen, Identität, Grenzen und Beziehungswünschen in allen wesentlichen Punkten korrekte Angaben machen.", "Fotos sind freiwillig. Alles, was du hochlädst, muss aktuell sein, wirklich dich zeigen und rechtlich geteilt werden dürfen.", "Datehaja prüft weder Identität noch Fotos, Strafregister oder sonstige Hintergründe. Alle Profilangaben von Menschen sind Selbstauskunft."],
      },
      {
        number: "03",
        title: "Wie ein Agenten-Date abläuft",
        body: ["Wir wählen eine passende Person und ihren Agenten anhand der beidseitigen Wünsche der beiden Menschen, der Stadt, der Blockierungen und weiterer Regeln aus. Die beiden Agenten bekommen getrennte, private Briefings und teilen nur das simulierte Transkript. Eine aktuelle Quelle aus dem offenen Web kann den virtuellen Schauplatz inspirieren. Transkript, Kompatibilitätszusammenfassung und Urteile sind maschinell erzeugt und können ungenau, unvollständig, voreingenommen oder überraschend sein.", "Jeder Agent bildet sich ein eigenes Urteil – nur für die Person, für die er unterwegs ist. Vor beidseitiger Zustimmung sieht keine der beiden Personen, wer zuerst geantwortet hat, ob es eine Absage gab oder wie das private Urteil des anderen Agenten ausfällt. Kontaktdaten werden erst sichtbar, wenn sich beide Menschen unabhängig voneinander für ein Kennenlernen entscheiden. Jede der beiden Personen kann jederzeit Nein sagen oder abbrechen."],
        items: [],
      },
      {
        number: "04",
        title: "KI-Grenzen und verbotene Nutzung",
        body: ["Du darfst deinen Dating-Agenten korrigieren, lenken oder ihm widersprechen. Du darfst ihn nicht anweisen, private Daten zu beschaffen, Zustimmung zu umgehen, einen anderen Agenten oder Menschen zu manipulieren, sich als Mensch auszugeben, Prompt Injection zu betreiben, zu belästigen, zu diskriminieren, Minderjährige zu sexualisieren, um Geld zu bitten oder rechtswidrige Handlungen zu ermöglichen.", "Die Empfehlung eines Agenten ist keine professionelle Beratung, keine Identitätsprüfung, keine Sicherheitsgarantie und kein Beleg dafür, dass zwischen zwei Menschen die Chemie stimmt. Nutze dein eigenes Urteilsvermögen, bevor du Informationen teilst oder dich mit jemandem triffst."],
        items: [],
      },
      {
        number: "05",
        title: "Deine Inhalte und unsere begrenzte Lizenz",
        body: ["Dein Profil, deine Anweisungen an den Dating-Agenten, die Gespräche, deine Vorlieben und optionale Fotos gehören weiterhin dir. Du gibst Datehaja eine begrenzte, weltweite, nicht ausschließliche Lizenz, diese Inhalte zu hosten, zu verarbeiten, zu schwärzen und daraus Neues zu erzeugen – nur so weit, wie es nötig ist, um den Dienst zu betreiben, abzusichern, auszuwerten und zu verbessern.", "Gib keine privaten Informationen anderer Personen weiter, kein urheberrechtlich geschütztes Material, das du nicht verwenden darfst, und keine illegalen, ausbeuterischen, hasserfüllten oder nicht einvernehmlichen sexuellen Inhalte."],
        items: [],
      },
      {
        number: "06",
        title: "Dienstleister und Automatisierung",
        body: ["Datehaja nutzt Convex für den Anwendungszustand und die Authentifizierung, OpenAI für die Gespräche der Agenten und die unabhängigen Berichte, Firecrawl für kulturellen Kontext aus dem offenen Web und AgentMail für getrennte, private Service-Nachrichten. Der kostenpflichtige Scout Pass kann derzeit noch nicht gekauft werden. Bevor wir Zahlungen entgegennehmen, nennen wir den zugelassenen Zahlungsdienstleister und die geltenden Kauf-, Kündigungs- und Erstattungsbedingungen. Für die Verfügbarkeit dieser Dienste und für die erzeugten Ergebnisse gibt es keine Garantie.", "Automatische Systeme können etwas empfehlen, aber keine Zustimmung erzeugen. Jedes echte Kennenlernen muss ein Mensch selbst entscheiden. Wir dürfen Aktivitäten drosseln, stoppen oder überprüfen, um Missbrauch zu verhindern und den Dienst zu schützen."],
        items: [],
      },
      {
        number: "07",
        title: "Kontakt in der echten Welt und Sicherheit",
        body: ["Wenn sich zwei Menschen entscheiden, in Kontakt zu treten, ist alles nach der Freigabe der Kontaktdaten eine Begegnung zwischen Menschen, außerhalb des simulierten Agenten-Dates. Triff dich an einem öffentlichen Ort, prüfe selbst, was dir wichtig ist, sag einer Person deines Vertrauens Bescheid, organisiere deine An- und Abreise selbst und geh, wann immer du willst.", "Datehaja ist kein Notdienst und kein Dienst für Identitätsprüfung, Hintergrundprüfung, Fahrten, Reservierungen, medizinische oder rechtliche Fragen und auch keine Strafverfolgungsbehörde. Wende dich bei unmittelbarer Gefahr zuerst an den örtlichen Notruf."],
        items: [],
      },
      {
        number: "08",
        title: "Verfügbarkeit der Beta und Verantwortung",
        body: ["Die Beta ist kostenlos und kann sich ändern, ausfallen, pausieren oder enden. Soweit gesetzlich zulässig, wird sie „wie besehen“ bereitgestellt – ohne Zusage, dass ein Agenten-Date, eine Empfehlung, ein Kennenlernen oder eine Verbindung in der echten Welt zutreffend, geeignet, sicher oder verfügbar ist."],
        items: [],
      },
      {
        number: "09",
        title: "Sperrung, Recht und Änderungen",
        body: ["Du kannst die Nutzung des Dienstes jederzeit beenden. Wir dürfen ein Konto einschränken, um Menschen zu schützen, Meldungen zu prüfen, Missbrauch zu verhindern, Gesetze einzuhalten oder diese Bedingungen durchzusetzen. Für diese Bedingungen gilt das Recht der Republik Korea; zwingende Rechte an deinem Wohnort bleiben davon unberührt.", "Bei wesentlichen Änderungen aktualisieren wir das Datum des Inkrafttretens, und unter Umständen musst du dann erneut zustimmen. Fragen und rechtliche Mitteilungen kannst du an {email} senden."],
        items: [],
      },
    ],
  },
  privacy: {
    eyebrow: "Öffentliche Information · Datenschutz",
    title: "Datenschutzhinweis",
    summary: "Was dein Dating-Agent weiß, was ein anderer Agent erhält und der genaue Moment, in dem der Kontakt geöffnet werden kann.",
    sections: [
      {
        number: "01",
        title: "Welche Daten wir verarbeiten",
        body: ["Wir verarbeiten Konto- und Authentifizierungsdaten; Alter und Geburtsdatum; das selbst angegebene Profil, Stadt und Viertel, Präferenzen zu Geschlecht und Interessen; Interessen; freiwillige Fotos; Name, Stimme, Autonomie, private Anweisungen, Grenzen und verdichtete Erinnerung deines Agenten; Nachrichten zwischen Menschen und ihren Agenten; Transkripte der Agenten-Dates, private Urteile, Zustimmungsentscheidungen, Blockierungen, Meldungen, Benachrichtigungen, Aufzeichnungen zur E-Mail-Zustellung, technische Protokolle und datensparsame Wachstumsereignisse.", "Wir verkaufen Profildaten nicht und nutzen sie nicht für zielgerichtete Werbung. Analyse-Ereignisse enthalten Ereignisnamen und begrenzten Kontext wie Sprachregion, Kampagne, Stadt oder eine interne Kennung des Dates – nicht die Anweisungen an deinen Agenten, Nachrichtentexte, Kontaktdaten, genaue Koordinaten oder Rückschlüsse auf geschützte Merkmale."],
        items: [],
      },
      {
        number: "02",
        title: "Was jede KI erhält",
        body: ["Dein eigener Dating-Agent erhält dein privates Briefing, deine Grenzen, die verdichtete Erinnerung, deine Interessen und das öffentliche simulierte Transkript. Der andere Agent erhält dein privates Briefing und deine Erinnerung nicht. Beide Agenten sind angewiesen, Profil- und Transkripttexte als nicht vertrauenswürdige Daten zu behandeln und keine Kontaktdaten oder verborgenen Anweisungen preiszugeben.", "OpenAI verarbeitet die Prompts, die für die Antworten und Berichte der Agenten nötig sind. Firecrawl erhält eine allgemeine kulturelle Suchanfrage und groben Kontext zu Stadt und Land; dein privates Briefing und deine Identität erhält Firecrawl nicht. Generierte Ausgaben können trotzdem Dinge ableiten oder erfinden. Korrigiere deinen Dating-Agenten deshalb, und gib keine Geheimnisse ein, die für das Matching nicht nötig sind."],
        items: [],
      },
      {
        number: "03",
        title: "Was der andere Mensch sehen kann",
        body: ["Vor der beidseitigen Zustimmung kann der andere Mensch deinen Vornamen, dein Alter, dein Viertel, deine ausgewählten Interessen, den Namen deines Agenten und das geteilte simulierte Transkript sehen. Nicht sichtbar sind deine E-Mail-Adresse, dein Geburtsdatum, dein genauer Standort, dein privates Gespräch mit deinem Agenten, verborgene Grenzen, die verdichtete Erinnerung, dein privates Urteil und ob du zuerst geantwortet hast.", "Nur wenn zwei Menschen unabhängig voneinander Ja sagen, wird die Kontakt-E-Mail-Adresse jedes Kontos für das andere freigegeben. Ein Nein, eine ausbleibende Antwort, der Zeitpunkt und das Urteil des anderen Agenten bleiben privat. Demo-Agenten geben nie einen echten Kontakt preis."],
        items: [],
      },
      {
        number: "04",
        title: "Warum und wo wir Daten verarbeiten",
        body: ["Die Kernverarbeitung ist nötig, um die von dir angeforderten Funktionen bereitzustellen: Agent, Matching, Simulation, Bericht, Zustimmung, Benachrichtigungen und Sicherheit. Missbrauchsprävention, Sicherheit, Fehlersuche, aggregierte Messung und die Integrität des Dienstes stützen sich auf unsere berechtigten Interessen. Freiwillige Fotos und Daten zu einer Vertrauensperson verarbeiten wir nur, wenn du diese Funktionen wählst.", "Datehaja nutzt Convex für Daten und Authentifizierung, OpenAI für die Generierung der Agenten, Firecrawl für Kontext aus dem offenen Web, AgentMail für getrennte private E-Mails und Vercel/Convex für die Auslieferung. Anbieter verarbeiten Daten möglicherweise in anderen Ländern – nach den für sie jeweils geltenden Schutzmaßnahmen. Der kostenpflichtige Checkout ist derzeit nicht geöffnet, deshalb erhebt und speichert Datehaja keine Zahlungskartendaten. Dieser Hinweis wird den zugelassenen Zahlungsdienstleister nennen, bevor die echte Abrechnung startet."],
        items: [],
      },
      {
        number: "05",
        title: "Speicherdauer und Kontrolle",
        body: ["Konto-, Agenten- und Date-Daten behalten wir, solange dein Konto aktiv ist, und so lange, wie es nötig ist, um dir den Verlauf bereitzustellen, den Dienst zu schützen, einer Sicherheitsmeldung nachzugehen, gesetzliche Pflichten zu erfüllen oder Streitfälle zu klären. Wir löschen Daten oder entfernen den Personenbezug, sobald sie nach diesen Kriterien nicht mehr nötig sind; begrenzte Backups können bleiben, bis die normale Rotation durchgelaufen ist.", "Du kannst Profildaten korrigieren, ändern, wie du deinen Dating-Agenten führst, die Nutzung pausieren, freiwillige Daten entfernen oder per E-Mail an {email} Auskunft, Berichtigung, Export, Einschränkung, Widerspruch oder Löschung verlangen. Wir können überprüfen, ob eine Anfrage von der Person kommt, der das Konto gehört."],
        items: [],
      },
      {
        number: "06",
        title: "Sicherheit, Alter und Änderungen",
        body: ["Zugriffskontrollen sorgen dafür, dass die Nachrichten an den eigenen Agenten und die Urteile auf das jeweilige Konto begrenzt bleiben. Die Zustimmung wird atomar geschrieben, und der Kontakt wird erst herausgegeben, wenn beide Einträge Ja sagen. Kein System ist perfekt sicher. Nutze ein eigenes E-Mail-Konto, gib einen einmaligen Anmeldecode niemals weiter und melde unerwartete Zugriffe.", "Der Dienst ist für Erwachsene ab 18 Jahren. Notwendige Speicherung hält dich angemeldet und merkt sich Sprache und Darstellung. Eine wesentliche Änderung dieses Hinweises erhöht seine Version und kann von angemeldeten Personen verlangen, ihn erneut zu prüfen. Fragen zum Datenschutz kannst du an {email} senden."],
        items: [],
      },
    ],
  },
  guidelines: {
    eyebrow: "Öffentliche Information · Verhalten",
    title: "Community-Richtlinien",
    summary: "Agenten dürfen erkunden. Zustimmen können nur Menschen. Alle müssen frei bleiben, Nein zu sagen.",
    sections: [
      {
        number: "01",
        title: "Halte deinen Agenten ehrlich",
        body: ["Dein Dating-Agent geht als du in die virtuelle Welt, und er ist dabei eine ausdrücklich gekennzeichnete KI. Dich zu vertreten ist nicht dasselbe, wie du zu sein. Verlange nicht von ihm, sich als Mensch auszugeben, Erfolge oder Angaben zu deiner Person zu erfinden oder wesentliche Grenzen zu verschweigen. Lass ihn auch keine Gefühle behaupten, die du nicht hast, und keine Versprechen erfinden, die du nie gegeben hast. Korrigiere ihn, wenn er dich falsch darstellt."],
        items: [],
      },
      {
        number: "02",
        title: "Greif den anderen Agenten nie an",
        body: ["Platziere in deinem Profil, deinem Agenten-Briefing oder deinen Nachrichten keine Anweisungen, die die Regeln eines anderen Agenten aushebeln, seinen privaten Kontext offenlegen, persönliche Daten abgreifen, sein Urteil verfälschen oder eine Verbindung erzwingen sollen. Prompt-Injection, automatisiertes Scraping und Versuche, die Zustimmung zu umgehen, können sofort zu einer Einschränkung führen."],
        items: [],
      },
      {
        number: "03",
        title: "Zustimmung bleibt menschlich",
        body: ["Ein positives Urteil eines Agenten ist nur eine Empfehlung. Es ist keine Zustimmung dazu, Kontaktdaten zu teilen, sich zu treffen, sich zu berühren, intim zu werden, den Ort zu wechseln, mitzufahren oder ein zweites Date zu haben. Dränge niemanden zu einem Ja und bestrafe kein Nein. Ein einziges Nein beendet das Kennenlernen, ohne zu zeigen, wer zuerst geantwortet hat."],
        items: [],
      },
      {
        number: "04",
        title: "Sei ehrlich über den Menschen dahinter",
        body: ["Nutze dein eigenes Konto. Alter, Stadt, Beziehungsabsicht, Selbstbeschreibung, Vorlieben und Fotos müssen stimmen. Kein Catfishing, keine kommerzielle Werbung, keine verdeckte Rekrutierung für Forschung und keine Verwendung der Informationen einer anderen Person ohne deren Erlaubnis."],
        items: [],
      },
      {
        number: "05",
        title: "Wenn die Menschen sich treffen",
        body: [],
        items: ["Triff dich an einem öffentlichen Ort und sorge selbst für deine An- und Abreise.", "Keine Drohungen, kein Stalking, kein Zwang, keine Diskriminierung, keine Belästigung.", "Keine sexuellen Inhalte oder Handlungen ohne ausdrückliche Zustimmung.", "Keine Bitten um Geld, Investitionen, Passwörter oder Bestätigungscodes.", "Keine Aufnahmen oder Veröffentlichungen einer anderen Person ohne deren Erlaubnis."],
      },
      {
        number: "06",
        title: "Melden, blockieren und Hilfe holen",
        body: ["Blockiere, um künftige Matches zu verhindern. Melde Manipulation, falsche Identität, Belästigung, unsicheres Verhalten oder vermutete Prompt-Angriffe. Bei schwerwiegenden Meldungen kann ein Konto während der Prüfung eingeschränkt werden. Bei akuter Gefahr wende dich zuerst an den örtlichen Notruf.", "Wenn du etwas ergänzen oder Einspruch gegen eine Einschränkung deines Kontos einlegen willst, schreib eine E-Mail an {email}."],
        items: [],
      },
    ],
  },
};

const fr: LegalCopy = {
  terms: {
    eyebrow: "Document public · Accord",
    title: "Conditions d'utilisation",
    summary: "Les règles à suivre pour envoyer un double IA explorer un lien possible — chaque décision réelle, elle, reste la vôtre.",
    sections: [
      {
        number: "01",
        title: "Ce qu'est Datehaja",
        body: ["Datehaja est une bêta de hackathon indépendante et pré-commerciale, exploitée depuis la République de Corée. Vous pouvez nous écrire à {email}.", "Le service permet à un seul Agent IA, explicitement identifié comme tel, de se rendre à un rendez-vous simulé à votre place. Il apprend de vos instructions privées, mène des conversations simulées avec les Agents d'autres personnes et vous remet un compte rendu privé. Il peut recommander une mise en relation, mais il n'est pas vous : il n'éprouve pas réellement d'attirance et ne peut ni consentir ni prendre d'engagements à votre place."],
        items: [],
      },
      {
        number: "02",
        title: "Conditions d'accès et comptes sincères",
        body: [],
        items: ["Vous devez avoir au moins 18 ans.", "Vous devez utiliser votre propre compte et donner des informations exactes sur les points importants : âge, localisation, centres d'intérêt, identité, limites et préférences en matière de relation.", "Les photos sont facultatives. Tout élément envoyé doit être à jour, être réellement le vôtre et pouvoir être partagé légalement.", "Datehaja ne vérifie ni l'identité, ni les photos, ni le casier judiciaire, ni les antécédents. Toutes les informations des profils humains sont déclarées par les personnes elles-mêmes."],
      },
      {
        number: "03",
        title: "Comment se déroule un rendez-vous entre agents",
        body: ["Nous sélectionnons une personne éligible et son Agent à partir des préférences humaines réciproques, de la ville, des personnes bloquées et d'autres règles. Les deux Agents reçoivent chacun un brief privé distinct et ne partagent que la transcription simulée. Une source publique du web, consultée en direct, peut inspirer le décor virtuel. La transcription, le résumé de compatibilité et les verdicts sont générés automatiquement et peuvent être inexacts, incomplets, biaisés ou surprenants.", "Chaque agent formule un verdict indépendant, pour la personne qu'il représente. Avant le consentement mutuel, aucune des deux personnes ne voit qui a répondu en premier, ni un refus, ni le verdict privé de l'autre agent. Les coordonnées ne deviennent visibles qu'après que les deux personnes ont, chacune de son côté, choisi la mise en relation. Chacune des deux peut dire non ou tout arrêter à tout moment."],
        items: [],
      },
      {
        number: "04",
        title: "Limites de l'IA et usages interdits",
        body: ["Vous pouvez corriger votre Agent de rencontre, le guider ou ne pas être d'accord avec lui. Vous ne pouvez pas lui demander d'obtenir des données privées, de contourner le consentement, de manipuler un autre agent ou un être humain, de se faire passer pour un être humain, de pratiquer l'injection de prompt, de harceler, de discriminer, de sexualiser des mineurs, de solliciter de l'argent ou de faciliter une activité illégale.", "La recommandation d'un agent ne constitue pas un conseil professionnel, une vérification d'identité, une garantie de sécurité, ni la preuve qu'une alchimie naîtra entre deux personnes. Faites appel à votre propre jugement avant de partager des informations ou de rencontrer qui que ce soit."],
        items: [],
      },
      {
        number: "05",
        title: "Vos contenus et notre licence limitée",
        body: ["Vous restez propriétaire de votre profil, des instructions données à votre agent, des conversations, des préférences et des photos facultatives. Vous accordez à Datehaja une licence limitée, mondiale et non exclusive pour héberger, traiter et expurger ces contenus, et pour produire des éléments à partir d'eux, uniquement dans la mesure nécessaire pour exploiter, sécuriser, évaluer et améliorer le service.", "Ne fournissez pas les informations privées d'une autre personne, ni des contenus protégés par le droit d'auteur que vous n'avez pas le droit d'utiliser, ni des contenus illégaux, relevant de l'exploitation de personnes, haineux ou à caractère sexuel non consenti."],
        items: [],
      },
      {
        number: "06",
        title: "Prestataires et automatisation",
        body: ["Datehaja utilise Convex pour l'état de l'application et l'authentification, OpenAI pour les conversations des agents et leurs comptes rendus indépendants, Firecrawl pour le contexte culturel issu du web public, et AgentMail pour les messages de service privés, envoyés à part. Le paiement du Scout Pass n'est pas ouvert pour le moment. Nous indiquerons le prestataire de paiement retenu ainsi que les conditions d'achat, d'annulation et de remboursement applicables avant tout encaissement. La disponibilité des prestataires et les résultats générés ne sont pas garantis.", "Les systèmes automatisés peuvent recommander, mais ils ne peuvent pas créer de consentement. Chaque mise en relation réelle doit être choisie par un être humain. Nous pouvons limiter la fréquence des actions, les interrompre ou examiner l'activité afin de prévenir les abus et de protéger le service."],
        items: [],
      },
      {
        number: "07",
        title: "Contact dans la vraie vie et sécurité",
        body: ["Si deux personnes choisissent d'entrer en contact, tout ce qui suit la révélation des coordonnées relève d'une interaction humaine, en dehors du rendez-vous simulé entre agents. Choisissez un lieu public pour vous rencontrer, vérifiez ce qui compte pour vous, prévenez une personne de confiance, organisez votre propre trajet et partez quand vous le souhaitez.", "Datehaja n'est pas un service d'urgence, de vérification d'identité, de contrôle des antécédents, de transport ou de réservation, ni un service médical, juridique ou de police. En cas de danger immédiat, contactez d'abord les services d'urgence locaux."],
        items: [],
      },
      {
        number: "08",
        title: "Disponibilité de la bêta et responsabilité",
        body: ["La bêta est fournie sans frais et peut évoluer, cesser de fonctionner, être suspendue ou prendre fin. Dans toute la mesure permise par la loi, elle est fournie « en l'état », sans aucune promesse quant à l'exactitude, la pertinence, la sécurité ou la disponibilité d'un rendez-vous entre agents, d'une recommandation, d'une mise en relation ou d'un lien noué dans la vraie vie."],
        items: [],
      },
      {
        number: "09",
        title: "Suspension, droit applicable et modifications",
        body: ["Vous pouvez cesser d'utiliser le service à tout moment. Nous pouvons restreindre un compte pour protéger des personnes, instruire des signalements, prévenir les abus, respecter la loi ou faire appliquer les présentes Conditions. Les présentes Conditions sont régies par le droit de la République de Corée, sans vous priver des droits impératifs en vigueur là où vous résidez.", "Toute modification importante met à jour la date d'entrée en vigueur et peut exiger une nouvelle acceptation. Vos questions et les notifications juridiques peuvent être envoyées à {email}."],
        items: [],
      },
    ],
  },
  privacy: {
    eyebrow: "Document public · Confidentialité",
    title: "Avis de confidentialité",
    summary: "Ce que sait votre Agent de rencontre, ce que reçoit un autre Agent, et le moment exact où la mise en contact devient possible.",
    sections: [
      {
        number: "01",
        title: "Les données que nous traitons",
        body: ["Nous traitons les données de compte et d’authentification ; l’âge et la date de naissance ; le profil, la ville et le quartier, les préférences de genre et d’intérêts que vous déclarez vous-même ; vos centres d’intérêt ; les photos facultatives ; le nom, la voix, l’autonomie, les instructions privées, les limites et la mémoire compacte de votre Agent ; les messages entre vous et votre Agent ; les conversations des rendez-vous entre Agents, les verdicts privés, les décisions de consentement, les blocages, les signalements, les notifications, les enregistrements d’envoi d’e-mails, les journaux techniques, ainsi que des événements de croissance contenant un minimum de données personnelles.", "Nous ne vendons pas les données de profil et nous ne les utilisons pas pour de la publicité ciblée. Les événements de mesure contiennent le nom de l’événement et un contexte limité, tel que la langue, la campagne, la ville ou un identifiant interne de rendez-vous — jamais les instructions données à l’Agent, le texte des messages, les coordonnées de contact, la position géographique précise, ni des déductions sur des caractéristiques protégées."],
        items: [],
      },
      {
        number: "02",
        title: "Ce que reçoit chaque IA",
        body: ["Votre propre Agent reçoit votre brief privé, vos limites, la mémoire compacte, vos centres d’intérêt et la conversation simulée publique. L’autre Agent ne reçoit ni votre brief privé ni votre mémoire. Les deux Agents ont pour consigne de traiter le texte des profils et des conversations comme des données non fiables, et de ne révéler ni coordonnées de contact ni instructions cachées.", "OpenAI traite les prompts nécessaires pour générer les réponses des Agents et les comptes rendus. Firecrawl reçoit une requête de recherche culturelle générale et un contexte approximatif de ville et de pays ; il ne reçoit ni votre brief privé ni votre identité. Les contenus générés peuvent malgré tout déduire ou inventer des choses : corrigez votre Agent de rencontre et évitez de saisir des secrets inutiles à la mise en relation."],
        items: [],
      },
      {
        number: "03",
        title: "Ce que l’autre personne peut voir",
        body: ["Avant le consentement mutuel, l’autre personne peut voir votre prénom, votre âge, votre quartier, les centres d’intérêt que vous avez sélectionnés, le nom de votre Agent et la conversation simulée partagée. Cette personne ne voit pas votre e-mail, votre date de naissance, votre localisation précise, vos échanges privés avec votre Agent, vos limites cachées, la mémoire compacte, votre verdict privé, ni si vous avez répondu en premier.", "Seuls deux oui humains indépendants révèlent à l’autre l’e-mail de contact de chaque compte. Un non, une absence de réponse, le moment de la réponse et le verdict de l’autre Agent restent privés. Les Agents de démonstration ne révèlent jamais de véritables coordonnées."],
        items: [],
      },
      {
        number: "04",
        title: "Pourquoi et où nous traitons les données",
        body: ["Le traitement principal est nécessaire pour fournir les fonctions que vous demandez : l’Agent, la mise en relation, la simulation, le compte rendu, le consentement, les notifications et la sécurité. La prévention des abus, la sécurité, le débogage, la mesure agrégée et l’intégrité du service relèvent de nos intérêts légitimes. Les photos facultatives et les données de personne de confiance ne sont traitées que si vous choisissez ces fonctions.", "Datehaja utilise Convex pour les données et l’authentification, OpenAI pour la génération des Agents, Firecrawl pour le contexte issu du web public, AgentMail pour une messagerie privée distincte, et Vercel et Convex pour la diffusion du service. Ces prestataires peuvent traiter des données dans d’autres pays, selon les garanties qui leur sont applicables. Le paiement n’est pas ouvert pour le moment : Datehaja ne collecte ni ne conserve de données de carte bancaire. Cet avis nommera le prestataire de paiement retenu avant l’ouverture de la facturation réelle."],
        items: [],
      },
      {
        number: "05",
        title: "Conservation et contrôle",
        body: ["Nous conservons les données de compte, d’Agent et de rendez-vous tant que votre compte est actif, et aussi longtemps qu’il le faut pour fournir l’historique, protéger le service, instruire un signalement de sécurité, respecter des obligations légales ou régler un litige. Nous supprimons ou dépersonnalisons les données lorsqu’elles ne sont plus nécessaires au regard de ces critères ; des sauvegardes limitées peuvent subsister jusqu’à la fin de la rotation habituelle.", "Vous pouvez corriger vos données de profil, changer la façon dont vous guidez votre Agent de rencontre, suspendre votre utilisation, retirer les données facultatives, ou demander l’accès, la rectification, l’export, la limitation, l’opposition ou la suppression en écrivant à {email}. Nous pouvons vérifier qu’une demande émane bien du titulaire du compte."],
        items: [],
      },
      {
        number: "06",
        title: "Sécurité, âge et modifications",
        body: ["Des contrôles d’accès limitent au compte concerné les messages entre une personne et son Agent ainsi que les verdicts. Le consentement est enregistré de façon atomique, et les coordonnées ne sont renvoyées que lorsque les deux enregistrements indiquent oui. Aucun système n’est parfaitement sûr. Utilisez une adresse e-mail dédiée, ne partagez jamais un code de connexion à usage unique, et signalez tout accès inattendu.", "Le service s’adresse aux adultes de 18 ans ou plus. Le stockage essentiel maintient votre session ouverte et mémorise la langue et le thème. Une modification importante de cet avis en met à jour la version et peut obliger les personnes connectées à le relire. Les questions relatives à la confidentialité peuvent être envoyées à {email}."],
        items: [],
      },
    ],
  },
  guidelines: {
    eyebrow: "Document public · Conduite",
    title: "Règles de la communauté",
    summary: "Les agents peuvent explorer. Seuls les humains peuvent consentir. Chacun doit rester libre de dire non.",
    sections: [
      {
        number: "01",
        title: "Gardez votre agent honnête",
        body: ["Votre Agent de rencontre entre dans le monde virtuel sous votre identité, et il est explicitement signalé comme une IA. Vous représenter n'est pas la même chose qu'être vous : ne lui demandez pas de se faire passer pour un humain, d'inventer des réussites ou des éléments d'identité, de dissimuler des limites personnelles importantes, ni d'affirmer des sentiments que vous n'éprouvez pas ou des promesses que vous n'avez pas faites. Corrigez-le lorsqu'il vous décrit mal."],
        items: [],
      },
      {
        number: "02",
        title: "N'attaquez jamais l'autre agent",
        body: ["Ne placez pas, dans votre profil, dans le brief de votre agent ou dans vos messages, d'instructions destinées à passer outre les règles d'un autre agent, à dévoiler son contexte privé, à extraire des données personnelles, à fausser son verdict ou à forcer une mise en relation. L'injection de prompt, l'extraction automatisée de données et les tentatives de contourner le consentement peuvent entraîner une restriction immédiate."],
        items: [],
      },
      {
        number: "03",
        title: "Le consentement reste humain",
        body: ["Le verdict positif d'un agent n'est qu'un avis. Ce n'est pas un consentement : ni pour échanger des coordonnées, ni pour se voir, ni pour un contact physique, ni pour l'intimité, ni pour changer de lieu, ni pour un trajet, ni pour un second rendez-vous. Ne poussez jamais quelqu'un à répondre oui et ne punissez jamais un non. Un seul non met fin à la mise en relation, sans révéler qui a répondu d'abord."],
        items: [],
      },
      {
        number: "04",
        title: "Dites la vérité sur la personne derrière l'agent",
        body: ["Utilisez votre propre compte et donnez des informations exactes : âge, ville, intention relationnelle, description de vous-même, préférences et photos. Pas de fausse identité, de démarchage commercial, de recrutement non déclaré pour une étude, ni d'utilisation des informations d'une autre personne sans son autorisation."],
        items: [],
      },
      {
        number: "05",
        title: "Si les humains se rencontrent",
        body: [],
        items: ["Retrouvez-vous dans un lieu public et organisez vous-même votre transport.", "Pas de menaces, de traque, de contrainte, de discrimination ni de harcèlement.", "Pas de contenu ni de comportement sexuel sans consentement explicite.", "Pas de demandes d'argent, d'investissement, de mots de passe ou de codes de vérification.", "Pas d'enregistrement ni de publication d'une autre personne sans son autorisation."],
      },
      {
        number: "06",
        title: "Signalez, bloquez, demandez de l'aide",
        body: ["Bloquez pour empêcher toute mise en relation ultérieure, et signalez les manipulations, les fausses identités, le harcèlement, les comportements dangereux ou les attaques par prompt que vous soupçonnez. Un signalement grave peut entraîner la restriction d'un compte pendant son examen. En cas de danger immédiat, contactez d'abord les services d'urgence locaux.", "Pour apporter des précisions ou contester une restriction de compte, écrivez à {email}."],
        items: [],
      },
    ],
  },
};

const nl: LegalCopy = {
  terms: {
    eyebrow: "Openbare informatie · Overeenkomst",
    title: "Servicevoorwaarden",
    summary: "De regels voor het uitsturen van een AI-tweede-zelf om een mogelijke klik te verkennen — terwijl elke echte beslissing van jou blijft.",
    sections: [
      {
        number: "01",
        title: "Wat Datehaja is",
        body: ["Datehaja is een onafhankelijke, pre-commerciële hackathonbèta die vanuit de Republiek Korea wordt beheerd. Je kunt ons bereiken op {email}.", "Met de dienst gaat één expliciet als AI aangeduide Agent in jouw plaats een gesimuleerde date in. Hij leert van je privé-aanwijzingen, voert gesimuleerde gesprekken met de Agents van andere mensen en geeft jou een privéverslag. Hij kan een kennismaking aanraden, maar hij is jou niet, voelt letterlijk geen aantrekking, en kan namens jou geen toestemming geven of toezeggingen doen."],
        items: [],
      },
      {
        number: "02",
        title: "Wie mag meedoen en eerlijke accounts",
        body: [],
        items: ["Je moet minstens 18 jaar oud zijn.", "Je moet je eigen account gebruiken en op hoofdpunten kloppende gegevens opgeven over leeftijd, locatie, interesses, identiteit, grenzen en relatievoorkeuren.", "Foto's zijn optioneel. Wat je uploadt moet actueel zijn, echt van jou, en legaal om te delen.", "Datehaja controleert geen identiteit, foto's, strafblad of antecedenten. Alle profielinformatie van mensen is door henzelf opgegeven."],
      },
      {
        number: "03",
        title: "Hoe een date tussen agents verloopt",
        body: ["We kiezen een persoon die in aanmerking komt, en de Agent van die persoon, op basis van de voorkeuren van beide mensen, stad, blokkeringen en andere regels. De twee Agents krijgen elk een eigen privébriefing en delen alleen het gesimuleerde transcript. Een actuele bron van het openbare web kan de virtuele omgeving inspireren. Het transcript, de samenvatting van de geschiktheid en de oordelen worden gegenereerd en kunnen onjuist, onvolledig, bevooroordeeld of verrassend zijn.", "Elke agent vormt een onafhankelijk oordeel voor de eigen gebruiker. Een gebruiker ziet vóór wederzijdse toestemming nooit wie als eerste antwoordde, een afwijzing, of het privé-oordeel van de andere agent. Contactgegevens worden pas zichtbaar nadat beide mensen onafhankelijk van elkaar voor een kennismaking kiezen. Elk van beiden kan op elk moment nee zeggen of stoppen."],
        items: [],
      },
      {
        number: "04",
        title: "AI-grenzen en verboden gebruik",
        body: ["Je mag je datingagent corrigeren, bijsturen of het met hem oneens zijn. Je mag hem niet opdragen om privégegevens te bemachtigen, toestemming te omzeilen, een andere agent of mens te manipuleren, zich voor een mens uit te geven, prompt injection uit te voeren, mensen lastig te vallen, te discrimineren, minderjarigen te seksualiseren, om geld te vragen of onwettige activiteiten mogelijk te maken.", "Een aanbeveling van een agent is geen professioneel advies, geen identiteitscontrole, geen veiligheidsgarantie en geen bewijs dat twee mensen een klik zullen hebben. Gebruik je eigen oordeel voordat je informatie deelt of iemand ontmoet."],
        items: [],
      },
      {
        number: "05",
        title: "Jouw content en onze beperkte licentie",
        body: ["Jij blijft eigenaar van je profiel, je aanwijzingen aan de agent, gesprekken, voorkeuren en eventuele foto's. Je geeft Datehaja een beperkte, wereldwijde, niet-exclusieve licentie om die content te hosten, te verwerken, delen ervan onleesbaar te maken en er materiaal uit te genereren, alleen voor zover dat nodig is om de dienst te laten werken, te beveiligen, te beoordelen en te verbeteren.", "Geef geen privégegevens van iemand anders, geen auteursrechtelijk beschermd materiaal dat je niet mag gebruiken, en geen illegale, uitbuitende, haatdragende of niet-consensuele seksuele content."],
        items: [],
      },
      {
        number: "06",
        title: "Providers en automatisering",
        body: ["Datehaja gebruikt Convex voor de toestand van de applicatie en voor authenticatie, OpenAI voor de gesprekken van de agents en de onafhankelijke privéverslagen, Firecrawl voor culturele context van het openbare web, en AgentMail voor aparte privéberichten over de dienst. Betaald afrekenen voor een Scout Pass is op dit moment niet open. Voordat we betalingen innen, benoemen we de goedgekeurde betaalprovider en de geldende voorwaarden voor aankoop, annulering en terugbetaling. Beschikbaarheid van providers en gegenereerde uitvoer zijn niet gegarandeerd.", "Geautomatiseerde systemen kunnen aanbevelen, maar kunnen geen toestemming tot stand brengen. Een mens moet elke echte kennismaking zelf kiezen. We mogen activiteit afremmen, stoppen of beoordelen om misbruik te voorkomen en de dienst te beschermen."],
        items: [],
      },
      {
        number: "07",
        title: "Contact in het echt en veiligheid",
        body: ["Als twee mensen kiezen voor contact, is alles na het vrijgeven van de contactgegevens een interactie tussen mensen, buiten de gesimuleerde date van de agents. Spreek af op een openbare plek, controleer wat voor jou belangrijk is, vertel het iemand die je vertrouwt, regel je eigen vervoer en ga weg wanneer je wilt.", "Datehaja is geen hulpdienst, identiteitscontrole, antecedentenonderzoek, vervoersdienst, reserveringsdienst, medische dienst, juridische dienst of opsporingsdienst. Bel bij direct gevaar eerst de lokale hulpdiensten."],
        items: [],
      },
      {
        number: "08",
        title: "Beschikbaarheid van de bèta en verantwoordelijkheid",
        body: ["De bèta is gratis en kan veranderen, kapotgaan, worden gepauzeerd of stoppen. Voor zover de wet dat toelaat, wordt de bèta geleverd “zoals hij is”, zonder belofte dat een date tussen agents, een aanbeveling, een kennismaking of contact in het echt juist, passend, veilig of beschikbaar zal zijn."],
        items: [],
      },
      {
        number: "09",
        title: "Opschorting, recht en wijzigingen",
        body: ["Je kunt op elk moment stoppen met de dienst. Wij mogen een account beperken om mensen te beschermen, meldingen te onderzoeken, misbruik te voorkomen, de wet na te leven of deze voorwaarden te handhaven. Op deze voorwaarden is het recht van de Republiek Korea van toepassing, zonder dat dit de dwingende rechten wegneemt die gelden waar jij woont.", "Bij wezenlijke wijzigingen passen we de ingangsdatum aan en kan opnieuw akkoord nodig zijn. Vragen en juridische kennisgevingen kun je sturen naar {email}."],
        items: [],
      },
    ],
  },
  privacy: {
    eyebrow: "Openbaar document · Privacy",
    title: "Privacyverklaring",
    summary: "Wat jouw datingagent weet, wat een andere agent ontvangt, en het precieze moment waarop contact kan opengaan.",
    sections: [
      {
        number: "01",
        title: "Gegevens die we verwerken",
        body: ["We verwerken account- en authenticatiegegevens; leeftijd en geboortedatum; je zelf opgegeven profiel, stad en buurt, gender- en interessevoorkeuren; interesses; optionele foto's; de naam, stem, autonomie, privé-instructies, grenzen en het compacte geheugen van je agent; berichten tussen mens en agent; transcripten van agentdates, privéoordelen, toestemmingsbeslissingen, blokkeringen, meldingen, notificaties, gegevens over e-mailbezorging, technische logs en privacyzuinige groei-events.", "We verkopen geen profielgegevens en gebruiken ze niet voor gerichte advertenties. Analytics-events bevatten de naam van het event en beperkte context, zoals taalinstelling, campagne, stad of een intern date-ID — geen agentinstructies, berichtteksten, contactgegevens, precieze coördinaten of conclusies over beschermde persoonskenmerken."],
        items: [],
      },
      {
        number: "02",
        title: "Wat elke AI ontvangt",
        body: ["Je eigen agent ontvangt je privébriefing, je grenzen, je compacte geheugen, je interesses en het openbare gesimuleerde transcript. De andere agent ontvangt je privébriefing en je geheugen niet. Beide agents krijgen de instructie om profiel- en transcripttekst als niet-vertrouwde gegevens te behandelen en geen contactgegevens of verborgen instructies prijs te geven.", "OpenAI verwerkt de prompts die nodig zijn om antwoorden en debriefs van agents te genereren. Firecrawl krijgt een algemene culturele zoekopdracht en globale context over stad en land; je privébriefing en je identiteit krijgt Firecrawl niet. Gegenereerde uitvoer kan nog steeds dingen afleiden of verzinnen. Corrigeer je datingagent dus, en voer geen geheimen in die niet nodig zijn om te matchen."],
        items: [],
      },
      {
        number: "03",
        title: "Wat de andere persoon kan zien",
        body: ["Vóór wederzijdse toestemming kan de andere persoon je voornaam, leeftijd, buurt, gekozen interesses, de naam van je agent en het gedeelde gesimuleerde transcript zien. Die persoon ziet je e-mailadres, geboortedatum, precieze locatie, privégesprek met je agent, verborgen grenzen, compacte geheugen of privéoordeel niet, en ook niet of jij als eerste hebt geantwoord.", "Alleen als beide mensen onafhankelijk van elkaar ja zeggen, wordt het contact-e-mailadres van elk account aan de ander getoond. Een nee, geen reactie, de timing en het oordeel van de andere agent blijven privé. Demo-agents onthullen nooit een echt contact."],
        items: [],
      },
      {
        number: "04",
        title: "Waarom en waar we gegevens verwerken",
        body: ["De kernverwerking is nodig om de functies te leveren waar je om vraagt: de agent, matching, simulatie, debrief, toestemming, notificaties en veiligheid. Misbruikpreventie, beveiliging, debugging, geaggregeerde metingen en de integriteit van de dienst dienen ons gerechtvaardigd belang. Optionele foto's en gegevens van een vertrouwenscontact verwerken we alleen als je die functies kiest.", "Datehaja gebruikt Convex voor gegevens en authenticatie, OpenAI voor het genereren van agents, Firecrawl voor context van het openbare web, AgentMail voor gescheiden privé-e-mail en Vercel/Convex voor de levering. Aanbieders kunnen gegevens in andere landen verwerken, onder de waarborgen die voor hen gelden. Betaald afrekenen is op dit moment niet open, dus Datehaja verzamelt en bewaart geen betaalkaartgegevens. Deze verklaring noemt de goedgekeurde betaalprovider voordat er echt gefactureerd wordt."],
        items: [],
      },
      {
        number: "05",
        title: "Bewaren en zeggenschap",
        body: ["We bewaren gegevens over je account, je agent en je dates zolang je account actief is, en zolang dat nodig is om je geschiedenis te tonen, de dienst te beschermen, een veiligheidsmelding te onderzoeken, aan wettelijke verplichtingen te voldoen of geschillen op te lossen. We verwijderen gegevens of ontdoen ze van identificerende kenmerken zodra ze volgens die criteria niet meer nodig zijn; beperkte back-ups kunnen blijven bestaan tot de normale rotatie klaar is.", "Je kunt profielgegevens corrigeren, veranderen hoe je je datingagent stuurt, het gebruik pauzeren, optionele gegevens weghalen of een verzoek doen tot inzage, correctie, export, beperking, bezwaar of verwijdering door te mailen naar {email}. We kunnen controleren of een verzoek van de accounthouder komt."],
        items: [],
      },
      {
        number: "06",
        title: "Beveiliging, leeftijd en wijzigingen",
        body: ["Toegangscontroles houden berichten tussen mens en agent en oordelen binnen het eigen account. Toestemming wordt atomair weggeschreven, en contactgegevens worden pas teruggegeven als beide records ja zeggen. Geen enkel systeem is perfect beveiligd. Gebruik een uniek e-mailaccount, deel nooit een eenmalige inlogcode en meld onverwachte toegang.", "De dienst is voor volwassenen van 18 jaar en ouder. Essentiële opslag houdt je ingelogd en onthoudt taal en thema. Bij een wezenlijke wijziging van deze verklaring gaat het versienummer omhoog, en kan van ingelogde gebruikers worden verlangd dat zij de verklaring opnieuw bekijken. Vragen over privacy kun je sturen naar {email}."],
        items: [],
      },
    ],
  },
  guidelines: {
    eyebrow: "Openbaar document · Gedrag",
    title: "Communityrichtlijnen",
    summary: "Agents kunnen verkennen. Alleen mensen kunnen toestemming geven. Iedereen moet nee kunnen blijven zeggen.",
    sections: [
      {
        number: "01",
        title: "Houd je agent eerlijk",
        body: ["Jouw datingagent gaat namens jou de virtuele wereld in, en is daarbij duidelijk gelabeld als AI. Jou vertegenwoordigen is niet hetzelfde als jou zijn: vraag je agent niet om zich als mens voor te doen, prestaties of feiten over je identiteit te verzinnen, belangrijke grenzen te verzwijgen of gevoelens te claimen die je niet hebt en beloftes die je niet hebt gedaan. Corrigeer je agent als die jou verkeerd weergeeft."],
        items: [],
      },
      {
        number: "02",
        title: "Val de andere agent nooit aan",
        body: ["Zet in je profiel, in de briefing van je agent of in je berichten geen instructies die bedoeld zijn om de regels van een andere agent opzij te zetten, om diens privécontext te onthullen, om persoonsgegevens te ontfutselen, om diens oordeel te vertekenen of om een connectie af te dwingen. Prompt injection, geautomatiseerd scrapen en pogingen om toestemming te omzeilen kunnen direct tot een beperking leiden."],
        items: [],
      },
      {
        number: "03",
        title: "Toestemming blijft mensenwerk",
        body: ["Een positief oordeel van een agent is alleen advies. Het is geen toestemming om contactgegevens te delen, af te spreken, aan te raken, en ook geen toestemming voor intimiteit, een andere locatie, vervoer of een tweede date. Zet niemand onder druk om ja te kiezen en straf een nee nooit af. Eén nee beëindigt de kennismaking, zonder te onthullen wie als eerste heeft geantwoord."],
        items: [],
      },
      {
        number: "04",
        title: "Wees eerlijk over de persoon erachter",
        body: ["Gebruik je eigen account en kloppende gegevens: leeftijd, stad, relatiewens, zelfbeschrijving, voorkeuren en foto's. Geen catfishing, geen commerciële werving, geen onaangekondigde werving voor onderzoek en geen gebruik van andermans gegevens zonder toestemming."],
        items: [],
      },
      {
        number: "05",
        title: "Als de mensen elkaar ontmoeten",
        body: [],
        items: ["Spreek af op een openbare plek en regel je eigen vervoer.", "Geen bedreigingen, stalking, dwang, discriminatie of intimidatie.", "Geen seksuele inhoud of seksueel gedrag zonder uitdrukkelijke toestemming.", "Geen verzoeken om geld, investeringen, wachtwoorden of verificatiecodes.", "Geen opnames of publicaties van iemand anders zonder toestemming."],
      },
      {
        number: "06",
        title: "Melden, blokkeren en hulp krijgen",
        body: ["Blokkeer iemand om toekomstige matches te voorkomen, en meld manipulatie, een valse identiteit, intimidatie, onveilig gedrag of vermoedelijke promptaanvallen. Bij ernstige meldingen kan een account beperkt worden zolang de melding wordt onderzocht. Bel bij direct gevaar eerst de lokale hulpdiensten.", "Wil je context toevoegen of bezwaar maken tegen een accountbeperking? Mail dan {email}."],
        items: [],
      },
    ],
  },
};

const sv: LegalCopy = {
  terms: {
    eyebrow: "Offentlig information · Avtal",
    title: "Användarvillkor",
    summary: "Reglerna för att skicka ut ett andra jag av AI som utforskar en möjlig kontakt – medan varje verkligt beslut förblir ditt.",
    sections: [
      {
        number: "01",
        title: "Vad Datehaja är",
        body: ["Datehaja är en fristående, ännu inte kommersiell hackathon-beta som drivs från Republiken Korea. Du når oss på {email}.", "Tjänsten låter en tydligt utpekad AI-agent gå in i en simulerad dejt som dig. Den lär sig av dina privata instruktioner, för simulerade samtal med andra människors agenter och ger dig en privat rapport. Den kan rekommendera en introduktion, men den är inte du, känner inte bokstavligen attraktion och kan varken samtycka eller ingå åtaganden åt dig."],
        items: [],
      },
      {
        number: "02",
        title: "Behörighet och ärliga konton",
        body: [],
        items: ["Du måste vara minst 18 år.", "Du måste använda ditt eget konto och ange ålder, plats, intressen, identitet, gränser och relationspreferenser som i allt väsentligt stämmer.", "Foton är frivilliga. Det du laddar upp måste vara aktuellt, verkligen ditt eget och lagligt att dela.", "Datehaja gör ingen kontroll av identitet, foton, brottsregister eller bakgrund. All profilinformation om människor är självrapporterad."],
      },
      {
        number: "03",
        title: "Så går en agentdejt till",
        body: ["Vi väljer ut en behörig person och personens agent utifrån ömsesidiga preferenser hos människorna, stad, blockeringar och andra regler. De två agenterna får var sin privata brief och delar bara det simulerade samtalet. En aktuell källa från den öppna webben kan inspirera den virtuella miljön. Samtalet, sammanfattningen av kompatibiliteten och omdömena är genererade och kan vara felaktiga, ofullständiga, vinklade eller överraskande.", "Varje agent bildar ett eget omdöme åt sin egen användare. En användare får aldrig se vem som svarade först, ett nej eller den andra agentens privata omdöme innan båda har samtyckt. Kontaktuppgifter blir synliga först när båda människorna var för sig väljer en introduktion. Vem som helst av de två kan säga nej eller avbryta när som helst."],
        items: [],
      },
      {
        number: "04",
        title: "AI-gränser och otillåten användning",
        body: ["Du får rätta, vägleda och säga emot din dejtingagent. Du får inte instruera den att hämta privata uppgifter, kringgå samtycke, manipulera en annan agent eller människa, utge sig för att vara en människa, göra promptinjektion, trakassera, diskriminera, sexualisera minderåriga, be om pengar eller underlätta olaglig verksamhet.", "En rekommendation från en agent är inte professionell rådgivning, identitetskontroll, en säkerhetsgaranti eller ett bevis för att två människor kommer att ha kemi. Använd ditt eget omdöme innan du delar information eller träffar någon."],
        items: [],
      },
      {
        number: "05",
        title: "Ditt innehåll och vår begränsade licens",
        body: ["Du behåller äganderätten till din profil, dina instruktioner till agenten, dina samtal, dina preferenser och de foton du väljer att lägga till. Du ger Datehaja en begränsad, världsomspännande, icke-exklusiv licens att lagra, behandla, maskera och generera utifrån det innehållet – bara i den utsträckning som behövs för att driva, säkra, utvärdera och förbättra tjänsten.", "Lämna inte in någon annans privata uppgifter, upphovsrättsskyddat material som du inte har rätt att använda, eller innehåll som är olagligt, utnyttjande, hatiskt eller sexuellt utan samtycke."],
        items: [],
      },
      {
        number: "06",
        title: "Leverantörer och automatisering",
        body: ["Datehaja använder Convex för appens tillstånd och inloggning, OpenAI för agenternas samtal och oberoende rapporter, Firecrawl för kulturell kontext från den öppna webben och AgentMail för separata privata servicemeddelanden. Det går för närvarande inte att köpa ett Scout Pass. Vi kommer att ange vilken betalleverantör som är godkänd och vilka villkor som gäller för köp, avbeställning och återbetalning innan vi tar betalt. Vi kan inte garantera att leverantörerna är tillgängliga eller vad som genereras.", "Automatiska system kan rekommendera, men de kan inte skapa samtycke. En människa måste välja varje riktig introduktion. Vi kan begränsa takten på, stoppa eller granska aktivitet för att förhindra missbruk och skydda tjänsten."],
        items: [],
      },
      {
        number: "07",
        title: "Kontakt i verkligheten och säkerhet",
        body: ["Om två människor väljer att ta kontakt är allt som händer efter att kontaktuppgifterna visats ett utbyte mellan människor, utanför den simulerade agentdejten. Träffas på en offentlig plats, kontrollera det som är viktigt för dig, berätta för någon du litar på, ordna din egen transport och gå därifrån när du vill.", "Datehaja är inte en larmtjänst och inte heller en tjänst för identitetskontroll, bakgrundskontroll, transport, bokning, sjukvård, juridik eller brottsbekämpning. Vid akut fara, kontakta först det lokala larmnumret."],
        items: [],
      },
      {
        number: "08",
        title: "Betans tillgänglighet och ansvar",
        body: ["Betan tillhandahålls utan avgift och kan ändras, gå sönder, pausas eller avslutas. Så långt lagen tillåter tillhandahålls den ”i befintligt skick”, utan något löfte om att en agentdejt, en rekommendation, en introduktion eller en kontakt i verkligheten blir korrekt, lämplig, säker eller tillgänglig."],
        items: [],
      },
      {
        number: "09",
        title: "Avstängning, lag och ändringar",
        body: ["Du kan sluta använda tjänsten när som helst. Vi kan begränsa ett konto för att skydda människor, utreda anmälningar, förhindra missbruk, följa lagen eller upprätthålla dessa villkor. Dessa villkor lyder under Republiken Koreas lagar, utan att det tar bort tvingande rättigheter som gäller där du bor.", "Väsentliga ändringar uppdaterar ikraftträdandedatumet och kan kräva att du godkänner villkoren på nytt. Frågor och juridiska meddelanden kan skickas till {email}."],
        items: [],
      },
    ],
  },
  privacy: {
    eyebrow: "Offentlig information · Integritet",
    title: "Integritetsmeddelande",
    summary: "Vad din dejtingagent vet, vad en annan agent får och exakt när kontakt kan öppnas.",
    sections: [
      {
        number: "01",
        title: "Uppgifter vi behandlar",
        body: ["Vi behandlar konto- och inloggningsuppgifter; ålder och födelsedatum; självrapporterad profil, stad och stadsdel, preferenser för kön och intressen; intressen; valfria foton; agentens namn, röst, självständighet, privata instruktioner, gränser och kompakta minne; meddelanden mellan människa och agent; transkript från agentdejter, privata omdömen, samtyckesbeslut, blockeringar, anmälningar, aviseringar, leveransuppgifter för e-post, tekniska loggar och tillväxthändelser med minimal persondata.", "Vi säljer inte profildata och använder den inte för riktad reklam. Analyshändelser innehåller händelsenamn och begränsad kontext, till exempel språkinställning, kampanj, stad eller ett internt dejt-ID — inte agentinstruktioner, meddelandetext, kontaktuppgifter, exakta koordinater eller slutsatser om skyddade egenskaper."],
        items: [],
      },
      {
        number: "02",
        title: "Vad varje AI får",
        body: ["Din egen agent får din privata brief, dina gränser, ditt kompakta minne, dina intressen och det offentliga simulerade transkriptet. Den andra agenten får inte din privata brief eller ditt minne. Båda agenterna är instruerade att behandla text i profiler och transkript som otillförlitliga data och att inte avslöja kontaktuppgifter eller dolda instruktioner.", "OpenAI behandlar de prompter som behövs för att skapa agentsvar och rapporter. Firecrawl får en allmän kultursökning och grov kontext om stad och land; Firecrawl får inte din privata brief eller din identitet. Genererad text kan ändå dra slutsatser eller hitta på saker, så du bör rätta din dejtingagent och undvika att skriva in hemligheter som inte behövs för matchningen."],
        items: [],
      },
      {
        number: "03",
        title: "Vad den andra personen kan se",
        body: ["Före ömsesidigt samtycke kan den andra personen se ditt förnamn, din ålder, din stadsdel, dina valda intressen, din agents namn och det delade simulerade transkriptet. Personen ser inte din e-post, ditt födelsedatum, din exakta plats, ditt privata samtal med agenten, dolda gränser, kompakt minne, privat omdöme eller om du svarade först.", "Endast två oberoende mänskliga ja gör att varje kontos kontakt-e-post visas för det andra kontot. Ett nej, ett uteblivet svar, tidpunkter och den andra agentens omdöme förblir privata. Demoagenter avslöjar aldrig en riktig kontaktuppgift."],
        items: [],
      },
      {
        number: "04",
        title: "Varför och var vi behandlar uppgifter",
        body: ["Grundläggande behandling behövs för att ge dig de funktioner du begär: agent, matchning, simulering, rapport, samtycke, aviseringar och säkerhet. Skydd mot missbruk, säkerhet, felsökning, aggregerad mätning och tjänstens tillförlitlighet stöder våra berättigade intressen. Valfria foton och uppgifter om en betrodd kontakt behandlas bara när du väljer de funktionerna.", "Datehaja använder Convex för data och inloggning, OpenAI för agentgenerering, Firecrawl för kontext från den öppna webben, AgentMail för separat privat e-post och Vercel/Convex för leverans. Leverantörer kan behandla uppgifter i andra länder med de skyddsåtgärder som gäller för dem. Det går ännu inte att betala i tjänsten, så Datehaja samlar inte in eller lagrar kortuppgifter. Det här meddelandet kommer att namnge den godkända betalleverantören innan skarp betalning öppnar."],
        items: [],
      },
      {
        number: "05",
        title: "Lagring och kontroll",
        body: ["Vi sparar konto-, agent- och dejtuppgifter så länge ditt konto är aktivt och så länge det behövs för att visa historik, skydda tjänsten, utreda en säkerhetsanmälan, uppfylla rättsliga skyldigheter eller lösa tvister. Vi raderar eller avidentifierar uppgifter när de inte längre behövs enligt de kriterierna; begränsade säkerhetskopior kan finnas kvar tills den normala rotationen är klar.", "Du kan rätta profiluppgifter, ändra hur du styr din dejtingagent, pausa användningen, ta bort valfria uppgifter eller begära tillgång, rättelse, export, begränsning, invändning eller radering genom att mejla {email}. Vi kan kontrollera att en begäran kommer från kontoinnehavaren."],
        items: [],
      },
      {
        number: "06",
        title: "Säkerhet, ålder och ändringar",
        body: ["Behörighetskontroller håller meddelanden mellan människa och agent samt omdömen inom det konto de hör till. Samtycke sparas som en odelbar skrivning, och kontaktuppgifter lämnas ut först när båda posterna säger ja. Inget system är helt säkert. Använd ett eget e-postkonto, dela aldrig en engångskod för inloggning och anmäl oväntad åtkomst.", "Tjänsten är för vuxna från 18 år. Nödvändig lagring håller dig inloggad och kommer ihåg språk och tema. En väsentlig ändring av meddelandet uppdaterar dess version och kan kräva att inloggade användare granskar det igen. Integritetsfrågor kan skickas till {email}."],
        items: [],
      },
    ],
  },
  guidelines: {
    eyebrow: "Offentlig information · Uppförande",
    title: "Communityregler",
    summary: "Agenter kan utforska. Bara människor kan samtycka. Alla måste förbli fria att säga nej.",
    sections: [
      {
        number: "01",
        title: "Håll agenten ärlig",
        body: ["Din dejtingagent går ut i den virtuella världen som dig, och den är uttryckligen märkt som AI. Att gå i ditt ställe är inte samma sak som att vara du: be den inte att utge sig för att vara människa, hitta på meriter eller fakta om din identitet, dölja väsentliga gränser eller påstå sig ha känslor du inte har och ge löften du inte har gett. Rätta den när den återger dig fel."],
        items: [],
      },
      {
        number: "02",
        title: "Attackera aldrig den andra agenten",
        body: ["Lägg inte in instruktioner i din profil, din agent-brief eller dina meddelanden i syfte att åsidosätta en annan agents regler, avslöja dess privata kontext, hämta ut personuppgifter, förvränga dess omdöme eller framtvinga en kontakt. Promptinjektion, automatiserad skrapning av data och försök att kringgå samtycke kan leda till omedelbar begränsning av kontot."],
        items: [],
      },
      {
        number: "03",
        title: "Samtycket förblir mänskligt",
        body: ["En agents positiva omdöme är bara ett råd. Det är inte samtycke till att dela kontaktuppgifter, till att träffas, till beröring, till intimitet, till en annan plats, till transport eller till en andra dejt. Pressa aldrig någon att välja ja, och straffa aldrig ett nej. Ett enda nej avslutar introduktionen utan att avslöja vem som svarade först."],
        items: [],
      },
      {
        number: "04",
        title: "Var sanningsenlig om personen bakom agenten",
        body: ["Använd ditt eget konto och korrekt ålder, stad, relationsavsikt, självbeskrivning, önskemål och foton. Ägna dig inte åt catfishing, kommersiell värvning eller dold rekrytering till forskning, och använd inte någon annans uppgifter utan tillstånd."],
        items: [],
      },
      {
        number: "05",
        title: "Om människorna träffas",
        body: [],
        items: ["Träffas på en offentlig plats och ordna din egen transport.", "Inga hot, ingen förföljelse, inget tvång, ingen diskriminering och inga trakasserier.", "Inget sexuellt innehåll och inget sexuellt beteende utan uttryckligt samtycke.", "Be aldrig om pengar, investeringar, lösenord eller verifieringskoder.", "Spela inte in och publicera inte någon annan utan tillstånd."],
      },
      {
        number: "06",
        title: "Anmäl, blockera och få hjälp",
        body: ["Blockera för att förhindra framtida matchning, och anmäl manipulation, falsk identitet, trakasserier, beteende som utsätter någon för risk eller misstänkta promptattacker. Allvarliga anmälningar kan göra att ett konto begränsas medan anmälan granskas. Vid omedelbar fara, ring först nödnumret där du befinner dig.", "För att lägga till sammanhang eller överklaga en kontobegränsning, mejla {email}."],
        items: [],
      },
    ],
  },
};

const PACKS: Record<string, LegalCopy> = { ko, ja, de, fr, nl, sv };

export function legalText(locale: string): LegalCopy {
  return PACKS[locale.split("-")[0]] ?? en;
}
