# First-use study — ready to run, participant results pending

No independent human sessions have been completed or claimed in this work.
The generated showcase, learning rehearsal and automated tests are separate
evidence. Do not count them as participants, testimonials, retention or demand.

## Recruit 3–5 adults who have not used Datehaja

Use participant codes P01–P05. Keep the code-to-person mapping privately,
outside this public repository. Include at least one English-speaking person
and one mobile user if available. Do not brief people on the intended answer
or show the polished demo before the first-use task.

Recruitment draft — Korean:

> 내가 만든 AI 데이트 앱을 처음 써보는 관점으로 20분 정도 봐줄 수 있어요?
> 만 18세 이상만 참여할 수 있고, 실제 만남이나 연락처 교환은 필요 없어요.
> 잘 안 되거나 다시 쓰고 싶지 않아도 그 반응이 도움이 돼요. 가능한 만큼만
> 사용하고 언제든 멈춰도 됩니다. 비공개 대화나 화면 녹화는 보내지 않아도 돼요.
> 가능하다면 편한 시간과 한국어/영어 중 선호 언어를 알려주세요.

Recruitment draft — English:

> Could you spend about 20 minutes trying an AI dating app I built, as a
> first-time user? Participants must be 18 or older. You do not need to meet
> anyone or exchange contact details. Confusion, failures and not wanting to
> use it again are useful feedback. Try only what you are comfortable with;
> you can stop at any time. You do not need to share private chats or a recording.
> If interested, let me know a convenient time and whether you prefer Korean or English.

These are unsent drafts. Choose recipients and approve the exact message
before asking an agent to send invitations. Do not solicit testimonials in
exchange for help, rewards or a favorable result.

## Host setup

Candidate: https://adorable-boar-359.convex.site . Confirm the release checks in
SUBMISSION_READINESS.md before inviting people. Final public target is
https://merry-bass-190.convex.site after approved publication.

Give each participant the ordinary home URL and their code. Let them use
their own email and choose their own preferences. Never give an external
participant an internal OTP bypass or silently opt them into real search.
They may use the explicitly labeled fictional demo. Never create a fake real
match just so the session can finish.

Keep notes in `.scratch/user-study/` (gitignored). Record device, language,
session date, observed task completion and help given. Do not record names,
email addresses, private briefs, conversation text or actual location.

## Neutral tasks

1. Open the home page. After 30 seconds, ask: “What do you think this does?”
   Write a brief paraphrase, not a leading yes/no question.
2. “If you want to try it, make an Agent in a way that feels comfortable to you.”
   Time from the first action to completion or stopping. Do not guide clicks.
3. “See what your Agent can do. Tell me what you think is happening.”
   Observe whether they distinguish a fictional demo from an opted-in real search.
4. After a completed date, privately ask how much the Agent sounds like them
   (1–5 or not rated). They need not show or quote their private text.
5. “Is there anything you would want it to keep or change? Try telling it.”
   Do not dictate a correction. Note whether the participant can find feedback,
   get a reply, and explain what they expect to happen next.
6. When a **new date with a different partner** completes, ask the same 1–5
   question. Replaying an old date is not an after observation. If no new date
   completes during the session, record waiting/failed and schedule one optional
   follow-up; never fill in an expected after score.
7. Ask: “When would contact details become available?” and “Would you choose
   to come back yourself? Why or why not?” Accept uncertainty or a no.
8. Send the participant to `/feedback` only now. Their answers download locally.
   Let them choose whether to return the JSON to you through your existing private
   channel. The form does not transmit answers to the app's server.

## A small-sample decision rule

Report raw counts and denominators, not generalized percentages or a chance of
winning. One repeated blocking issue in two independent sessions gets priority.
Any misunderstanding that Agents can consent for people requires copy/flow repair.

Report these separately:

- Unassisted Agent creation: completed alone / attempted; include time and help.
- First-date completion: completed / attempted; list waiting and failed separately.
- Representation: first rating; later rating only for a completed new encounter
  after saved feedback. Report increased / unchanged / decreased with its denominator.
- Consent understanding and voluntary return intent (yes / maybe / no).
- Observations made by the host vs participant self-report. A JSON file alone
  does not prove an independent human session took place.

Use `node scripts/summarize-user-study.mjs .scratch/user-study/responses` to
validate and summarize returned answer files. The report remains explicitly
self-reported and refuses duplicate participant codes. Do not publish a quote
or identifiable screenshot without that participant's separate permission.

## Results

Independent human participants verified: **0**. This is a pending study, not a
zero satisfaction score. Add session evidence and actual returned files before
changing the count or making a usefulness claim in the submission.
