import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import { mkdirSync, writeFileSync } from 'node:fs';

// This fixture uses actual auth, profile, and search functions, never canned turns.
// Only use an isolated local backend with development OTP and mail disabled.
const url = process.env.DATEHAJA_LOCAL_CONVEX_URL ?? 'http://127.0.0.1:3210';
if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname)) {
  throw new Error('Six-person fixtures are restricted to a local Convex backend.');
}
const run = Date.now().toString(36);
const output = `.scratch/six-person/runs/${run}`;
mkdirSync(output, { recursive: true });
const personas = [
  { displayName: '민준', agentName: '준', gender: 'man', voice: 'quiet', palette: 'sky', interests: ['Reading', 'Coffee', 'Cooking'], traits: ['Thoughtful', 'Calm'], intent: 'serious', essence: '나는 편집자로 일한다. 토요일 아침 장을 보고 남은 재료로 요리하는 걸 좋아한다. 약속을 하루 전에는 정해 두면 편하다. 상대가 지쳤을 때 해결책부터 주기보다는 무엇이 필요한지 묻는다. 시끄러운 술자리는 싫지만 작은 농담을 주고받는 건 좋아한다.', desiredConnection: '생활 속 사소한 일을 같이 즐기고 약속을 지키는 사람. 대화가 잘 통하면 실제로 만나 천천히 진지하게 알아가고 싶다. 매번 취미가 똑같을 필요는 없다.', boundaries: ['No sexual pressure', 'No pressure to meet quickly'] },
  { displayName: '서연', agentName: '봄', gender: 'woman', voice: 'warm', palette: 'rose', interests: ['Reading', 'Cooking', 'Plants'], traits: ['Thoughtful', 'Playful'], intent: 'serious', essence: '도서관에서 일하고 집에서 바질을 키운다. 냉장고에 남은 채소로 같이 저녁을 만들고 수다 떠는 주말이 좋다. 잘 모르면 모른다고 말하는 사람이 편하다. 계획이 갑자기 바뀌면 짜증 내기보다 대안을 같이 정했으면 좋겠다. 친해지면 장난이 많다.', desiredConnection: '배려를 거창한 말보다 작은 행동으로 보이는 사람. 나를 웃게 해 주고 서로의 생활을 존중하는 진지한 관계를 원한다. 처음부터 확신보다는 한 번 더 궁금한 정도면 충분하다.', boundaries: ['No sexual pressure', 'Kind disagreement matters'] },
  { displayName: '도윤', agentName: '레오', gender: 'man', voice: 'playful', palette: 'sunset', interests: ['Live music', 'Dancing', 'Travel'], traits: ['Playful', 'Direct'], intent: 'casual', essence: '공연 일을 해서 일정이 늦게 정해진다. 새벽 공연 끝나고 국수를 먹거나 당일 기차를 타는 편이다. 사귀자는 약속은 지금 못 하며 가볍게 여러 사람을 알아가고 싶다. 이 부분을 처음부터 솔직하게 말한다. 상대를 억지로 설득하는 건 싫다.', desiredConnection: '지금은 가볍고 자유로운 만남을 원하는 사람. 늦은 시간과 즉흥적인 일정이 즐거웠으면 한다. 장기적인 관계나 배타적인 약속을 기대하는 상대와는 시작하지 않는 것이 낫다.', boundaries: ['No sexual pressure', 'Privacy before connection'] },
  { displayName: '지우', agentName: '루', gender: 'woman', voice: 'direct', palette: 'violet', interests: ['Running', 'Hiking', 'Cooking'], traits: ['Direct', 'Calm'], intent: 'serious', essence: '초등학교 교사이고 평일에는 밤 열한 시에 잔다. 일요일 아침 강변 달리기와 맛있는 아침 식사가 좋다. 일정은 미리 맞추는 편이며 연애는 서로에게 집중하는 관계만 원한다. 불편한 이야기도 돌려 말하기보다 부드럽고 명확하게 한다.', desiredConnection: '장기적인 관계를 원하는 사람. 즉흥적인 재미도 좋지만 밤늦게만 만나거나 여러 명을 동시에 만나는 관계는 맞지 않는다. 생활 리듬과 책임감이 서로 맞는지 알고 싶다.', boundaries: ['No casual-only intent', 'Kind disagreement matters'] },
  { displayName: '현우', agentName: '모모', gender: 'man', voice: 'warm', palette: 'moss', interests: ['Photography', 'Art galleries', 'Coffee'], traits: ['Curious', 'Thoughtful'], intent: 'open', essence: '제품 디자이너다. 필름 사진은 잘 못 찍어도 산책하면서 빛을 찾는 게 좋다. 낯가려서 처음엔 말이 적지만 상대가 좋아하는 이유를 묻는 편이다. 계획은 대략만 정하고 걷다가 바꿔도 괜찮다. 연애는 서두르지 않지만 잘 맞으면 진지하게 알아갈 수 있다.', desiredConnection: '서로의 다른 취미를 재미있어하며 작은 실패를 웃어넘길 수 있는 사람. 조용해도 관심이 없는 건 아니라는 점을 이해해 주고 솔직한 질문을 하는 상대면 좋겠다.', boundaries: ['No pressure to meet quickly', 'Privacy before connection'] },
  { displayName: '하나', agentName: '소라', gender: 'woman', voice: 'quiet', palette: 'ink', interests: ['Museums', 'Coffee', 'Reading'], traits: ['Calm', 'Curious'], intent: 'open', languages: ['Japanese'], essence: '서울에서 공부하고 있다. 일본어로 깊은 대화를 나누고 싶고 자동 번역 데이트는 아직 원하지 않는다. 혼자 박물관을 둘러보고 마음에 든 전시를 엽서에 적는다. 말을 많이 하기보다는 질문을 하나씩 천천히 하는 편이다.', desiredConnection: '서울에서 일본어로 편하게 이야기할 수 있는 사람. 기다리는 것은 괜찮지만 내가 허용하지 않은 언어로 대신 만남을 진행하지 않았으면 좋겠다.', boundaries: ['No pressure to meet quickly', 'Privacy before connection'] },
];
const accounts = [];
for (const [i, p] of personas.entries()) {
  const email = `hyo+test-six-${run}-${i + 1}@hyo.dev`;
  const client = new ConvexHttpClient(url);
  await client.action(api.auth.signIn, { provider: 'email', params: { email } });
  const result = await client.action(api.auth.signIn, { provider: 'email', params: { email, code: '68686868' } });
  if (!result.tokens) throw new Error('No authentication tokens');
  client.setAuth(result.tokens.token);
  const legal = await client.query(api.legal.status, {});
  await client.mutation(api.legal.accept, { versions: legal.currentVersions, termsAccepted: true, privacyAcknowledged: true, communityAccepted: true, ageConfirmed: true, locale: 'ko-KR' });
  await client.mutation(api.agents.bootstrap, {
    displayName: p.displayName, agentName: p.agentName,
    dobMs: Date.parse(`199${i + 1}-06-15T00:00:00Z`), gender: p.gender,
    interestedIn: [p.gender === 'man' ? 'woman' : 'man'],
    city: 'Seoul', neighborhood: 'Seongsu', interests: p.interests,
    personalityTraits: p.traits, essence: p.essence, desiredConnection: p.desiredConnection,
    boundaries: p.boundaries, voice: p.voice, autonomy: 'suggest', relationshipIntent: p.intent,
    preferredPersonalityTraits: [], personalityPreference: 'flexible', preferredStyleTags: [], stylePreference: 'no_preference',
    avatar: { palette: p.palette, face: 'curious', hair: 'wave', outfit: 'cardigan', accessory: 'none', gender: p.gender === 'man' ? 'male' : 'female' },
    locale: 'ko-KR', languages: p.languages ?? ['Korean'], matchLocationScope: 'city', preferredCountryCodes: ['KR'], preferredCities: ['Seoul'], preferredAreas: [], allowTranslatedDates: false,
  } as any);
  await client.mutation(api.profiles.updateNotificationPreferences, { notifyEmail: false });
  accounts.push({ ...p, email, tokens: result.tokens });
  if (process.argv.includes('--start')) await client.action(api.scouting.start, {});
  console.log(`Created ${p.displayName} / ${p.agentName}`);
}
writeFileSync(`${output}/accounts.json`, JSON.stringify(accounts, null, 2), { mode: 0o600 });
console.log(`Six fictional test identities saved to ${output}. ${process.argv.includes('--start') ? 'Searches started.' : 'Start each search in the app.'}`);
