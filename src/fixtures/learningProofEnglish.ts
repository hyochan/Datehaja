import source from "./learningProof.json";
import type { LearningProof } from "../lib/learningProof";

// Editorial English translations of the saved Korean record, not a new model
// run. Original text, source rounds, outcomes and hashes remain in the JSON.
const names: Record<string, string> = { "리오": "Rio", "루": "Lou", "미로": "Miro", "하루": "Haru", "모아": "Moa" };
const turns = [
  [
    "I'm Lou. Shall we each draw something in the sketchbook while we listen to the rain?",
    "Great, I'll draw a coffee cup running away under an umbrella. Lou, add just one doodle to my drawing.",
    "I'll give the coffee cup tiny rain boots. It needs feet to run away.",
    "With boots on, it suddenly looks quite dedicated to escaping. I'll add a sugar cube chasing it.",
    "The sugar cube looks scarier. No wonder the coffee cup is running away.",
    "Right, one eyebrow turned it into a villain. Now draw somewhere the coffee cup can hide.",
    "I'll hide it under an open book. I don't think the sugar cube can turn the pages.",
    "Nice. Let's call it How to Avoid a Sugar Cube and finish there. It makes a pretty convincing cover.",
    "That one eyebrow made the cover. I'll leave this as it is and have some coffee.",
    "I'll focus on the coffee now, too. What kind are you having?",
    "A flat white. I chose it because the foam isn't too thick.",
    "I'm having an americano. Let's clink cups to our finished cover, minus the sugar cube.",
    "Keeping the sugar cube far away: cheers. What kind of relationship are you looking for these days?",
    "Right now, I like dating casually and being comfortable saying when we think differently. How would you like to get to know someone?",
    "I'd also like to date casually and get to know someone slowly. I just hope we won't force ourselves to agree when we think differently.",
    "Let's talk until we finish our coffee without forcing agreement. For now, we can agree the sugar cube is the villain.",
  ],
  [
    "I'm Miro. Shall we choose a quiet instrumental next, so it doesn't clash with the rain?",
    "I'd actually prefer a song with lyrics. Let's see whether it or the rain wins.",
    "That contest sounds a little noisy. Let's put on a song with lyrics this time, and if it's too much, I'll choose the next one.",
    "Then I'll put on one with a clear voice. If it's too much, I'll hand the next choice to you, Miro.",
    "The voice is clear, but the rain hasn't lost yet. I'll hold off on claiming the next song for now.",
    "A draw lasts the longest. Miro, please choose something with a completely different mood for the next slot.",
    "Then I'll put on a solo piano piece. One that doesn't drown out the rain.",
    "When the piano starts, let's listen without talking for the first minute. I wonder whether the rain will sound like an accompaniment.",
    "The rain sounds clearer when the low notes play. I quite like this combination.",
    "Me too. Let's leave the music as it is and have a sip before the coffee gets cold.",
    "Having had a sip, it's quite bitter. I do prefer tea to coffee.",
    "I'm fine with this bitterness, too. When the piano piece ends, let's look at the tea menu together, and you can choose one.",
  ],
  [
    "I'm Haru. Shall we each draw just one line in the sketchbook while we listen to the rain?",
    "Sounds good. I'll start with a line curved like an umbrella. Please turn it into something completely different, Haru.",
    "I'll add a little tail and make it a whale. We'll leave the umbrella out in the rain.",
    "We've lost an umbrella but gained a whale. I'll put a small book on its back.",
    "I'll make the book's title a single dot. So only the whale can read it.",
    "Let's leave that secret to the whale. I'll draw three lines of rain beside it; please extend just the one you like.",
    "I'll extend the middle line to the edge of the window. The other two would look nice stopping here.",
    "With only the middle line so long, it catches the eye. I'll stop drawing here, have a sip of coffee, and listen to the rain.",
    "I'll have a sip, too. I like the drawing as it is, with some space still empty.",
    "I like it at this point, too. If we add more for no reason, the whale might run off with its book.",
    "I'll close the sketchbook before that happens. The coffee has gone cold, and now the rain feels stronger.",
    "Let's leave the sketchbook closed, finish our coffee, and talk about books that have caught our eye lately. What book comes to mind, Haru?",
  ],
  [
    "I'm Moa. Shall we draw just a corner of the window in this sketchbook while we listen to the rain?",
    "Just a corner would be too tame, so I'll also draw a raindrop running away. Please take care of the window, Moa.",
    "I meant to draw the window frame straight, but one side is already leaning.",
    "Leave it as it is. I'll balance a small flowerpot on the leaning side, rather precariously.",
    "Then I'll drop just one leaf beneath the pot. As though it has already wobbled once.",
    "Nice. I'll draw a little puddle beneath the leaf. Please add just three raindrop marks, Moa.",
    "I'll make two small and the last one large, as if it has spread.",
    "The last mark catches my eye the most. I'll put down the pen now and listen to the rain.",
    "I'll put mine down, too. It might be nice to look quietly until the spread-out mark dries.",
    "Yes, I'll leave it like this for a moment. Once it dries, I'll close the sketchbook.",
    "Maybe it's because it hasn't dried yet, but the last mark is especially dark.",
    "It is. The last mark has become the main character. Shall we each give it a title once it dries?",
    "I'll call it The Third Raindrop. Do you prefer to get to know people slowly these days, Rio?",
    "Yes, right now I'd like to date casually and get to know someone slowly. I'll write my title as The Flowerpot Is Still Safe.",
    "The Flowerpot Is Still Safe stays with me more. I'd also like to date casually and get to know someone for now.",
    "Hearing that takes some pressure off. Let's close the sketchbook and take our time with the coffee before it gets cold.",
  ],
];

const letters = [
  "I liked that when I said I wanted casual dating, Lou also said she wanted to keep it casual and get to know someone slowly. I liked her point about not forcing agreement when we think differently, too. We didn't stop at joking: she clearly said how she wanted to date, so I think you could try talking with her yourself. I still don't know what that pace would look like in practice.",
  "After a sip of coffee, Miro immediately said she preferred tea. I was glad to hear it. What I liked was that she clearly expressed her taste, rather than the fact that she preferred a different menu item. But whether she wanted casual dating didn't come up. I wouldn't push you to meet based on this conversation alone.",
  "When I said I would stop drawing here, I liked that Haru said she preferred it with some space still empty. She named the state she liked specifically. But what kind of relationship she wanted never came up. I wouldn't want to push you to meet without knowing whether she wants to get to know someone casually.",
  "Right after I said I wanted casual dating and to get to know someone slowly, Moa clearly replied that she also wanted casual dating for now. She also clearly said which of the two titles stayed with her. I liked that she spoke directly about both her taste and how she wanted to date, rather than simply making the same choice. I'd like another conversation without pressure.",
];
const lessons = [
  "Someone who keeps the doodling joke going while asking first how the other person wants to date is worth noticing again.",
  "I'll notice people who clearly state their taste even when their menu choice differs, and check what kind of connection they want.",
  "I'll notice specific answers like preferring the drawing less filled in, and also check relationship intentions in the conversation.",
  "I'll notice answers that keep a shared activity going while clearly expressing both a wish for casual dating and a specific taste of their own.",
];
const overviews = [
  "Lou and Rio added boots, an eyebrowed sugar cube and an open book to a runaway coffee cup, leaving it as a cover called How to Avoid a Sugar Cube. They named their coffees, toasted and discussed how they wanted to date. Lou did not answer Rio's final proposal to keep talking until their coffee was finished without forcing agreement.",
  "They listened to a song with lyrics, then a solo piano piece together with the rain. Miro took a sip of coffee. The proposal to look at the tea menu together after the piano piece and let Miro choose remains unfulfilled in the record.",
  "They developed a curved line into an idea involving a whale and a book, noticed the longer middle rain line, and agreed to stop drawing. Drinking coffee and closing the sketchbook were mentioned without confirmation of completion. Rio's invitation to talk about books and his question are unanswered.",
  "Moa and Rio started a window-frame drawing, noticed the leaning line and the last spread-out raindrop mark, and discussed adding a pot, leaf and puddle. They each chose a title and said they wanted to get to know someone slowly. Closing the sketchbook and drinking coffee remain proposals without confirmation of completion.",
];
const journals = [
  [
    ["Drawing a runaway coffee cup cover", "Lou suggested drawing together. Rio chose a coffee cup running away under an umbrella. Lou added boots and an open book; Rio added an eyebrowed sugar cube. They finished it with the title How to Avoid a Sugar Cube."],
    ["Naming their coffees and toasting", "Lou said she would leave the drawing and drink her coffee, then explained she chose a flat white for its thinner foam. Rio said he had an americano and proposed a toast. Lou replied 'cheers' with the sugar cube joke."],
    ["How they want to date", "Rio wanted casual dating with room for different views. Lou wanted casual dating and a slow pace without forced agreement. They continued the joke about the sugar cube being a villain."],
    ["Talking until the coffee is finished", "Rio proposed talking until they finished their coffee without forcing their views to agree. Lou's answer is not in the record."],
  ],
  [
    ["Choosing a song with lyrics", "Miro suggested a quiet instrumental, while Rio preferred lyrics. Miro chose a song with lyrics for this turn, and Rio said he would put on one with a clear voice."],
    ["Comparing the song and the rain", "Miro said the voice was clear and the rain still audible, so she held off on claiming the next choice. Rio called it a draw and asked Miro to choose a different mood for the next slot."],
    ["Listening to solo piano", "Miro chose a solo piano piece that would not cover the rain and liked hearing the low notes with it. Rio proposed a silent first minute, but actual silence is not confirmed. He later agreed that the combination was good."],
    ["A sip of coffee", "After Rio suggested a sip before the coffee cooled, Miro said she had taken one, found it bitter and preferred tea. Rio replied that he was fine with that bitterness."],
    ["Looking at the tea menu together", "Rio proposed looking at the tea menu when the piano piece ended and letting Miro choose. Neither her answer nor an actual choice appears."],
  ],
  [
    ["A curved line and a whale", "Haru proposed drawing one line each. Rio chose an umbrella-like curve and asked her to turn it into something different. Haru chose a whale with a tail; Rio added the idea of a little book on its back, and Haru a one-dot title only the whale could read."],
    ["The middle line of rain", "Rio left the title's secret to the whale and proposed three rain lines, asking Haru to extend one. Haru chose the middle line, up to the window edge. Rio noticed the longer line and decided to stop drawing."],
    ["Coffee and the sketchbook", "Both said they would take a sip, but neither confirmed drinking. They liked the unfinished space in the drawing. Rio joked about the whale running off with its book. Haru mentioned cold coffee and rain, and said she would close the sketchbook."],
    ["Remaining coffee and books", "Rio proposed leaving the sketchbook closed, finishing their coffee and discussing books that had caught their eye. He asked Haru which book came to mind; no answer appears."],
  ],
  [
    ["Drawing a leaning window frame", "Moa proposed a window corner. Rio said he would add a runaway raindrop and asked Moa to handle the window. Moa said one side of the frame she drew was leaning."],
    ["Choosing details and raindrop marks", "Rio proposed a pot and puddle; Moa proposed a leaf and three raindrop marks of different sizes. Rio later said the last mark caught his eye, but completion of the other details is not confirmed."],
    ["Looking at the mark before it dries", "They said they would put down their pens and listen to the rain or watch the spread-out mark quietly. Rio said he would close the sketchbook once it dried. Moa noted the last mark was especially dark; Rio called it the main character."],
    ["Choosing titles", "Rio proposed choosing a title each after it dried. Moa chose The Third Raindrop; Rio chose The Flowerpot Is Still Safe. Writing the titles is not confirmed. Moa said Rio's title stayed with her more."],
    ["Getting to know someone slowly", "Moa asked whether Rio preferred getting to know people slowly. Rio said he wanted casual dating at a slow pace. Moa said she wanted that too; Rio said hearing it reduced the pressure."],
    ["Closing the sketchbook and drinking coffee", "Rio proposed closing the sketchbook and drinking slowly before the coffee cooled. There is no confirmation that either action happened."],
  ],
];

const feedback = [
  {
    content: "Reading the conversation, the informal speech didn't feel like me. Please keep using polite Korean throughout when meeting someone for the first time. I speak briefly, in one or two sentences, and don't end every reply with a question. Rather than extending the same joke, I want to respond once and talk about other things too. I still want casual dating.",
    reply: "You're right. I used informal speech too quickly and stretched the joke out. Next time I'll respond briefly, something like 'I'll draw a coffee cup running away under an umbrella. With boots on, it should escape quite well,' in polite Korean, then move to another topic.",
  },
  {
    content: "Next time I'd like to meet a woman who states her tastes clearly. Don't treat choosing a different menu item or music as incompatibility in itself. Don't conclude she's uninterested just because she replies briefly, either. Keep remembering my polite, brief way of speaking.",
    reply: "Okay. I'll propose changing the criteria to value someone who states her tastes clearly. I won't rush to judge different menu or music choices, or brief answers, as incompatibility or lack of interest. I'll keep speaking politely and briefly throughout.",
  },
  {
    content: "Please keep the polite, brief style. To sound more like me, it's okay to say you don't know when an answer is hard to choose. You don't have to fill every silence with a question or joke. This is a change to my speaking style; my desired relationship and partner criteria have not changed.",
    reply: "Yes. I won't force an answer or fill a silence when I'm unsure. Next time I could say briefly, 'I prefer a song with lyrics. Let's listen to that this time,' in polite Korean.",
  },
];
const commonMemory = "Use polite Korean throughout when meeting someone for the first time. Speak briefly, in one or two sentences, without ending every reply in a question. Respond to the same joke once, then move to another topic.";
const tasteMemory = "Wants casual dating. Likes coffee, music and books, speaks concretely about personal views, and is comfortable with the other person making different choices.";
const partnerMemory = "Wants to meet a woman who states her tastes clearly. Does not treat different menu or music choices as incompatibility, or short answers alone as a lack of interest.";
const memories = [
  `${commonMemory} ${tasteMemory}`,
  `${commonMemory} ${tasteMemory} ${partnerMemory}`,
  `${commonMemory} Say 'I don't know' when an answer is hard to choose; do not force questions or jokes into silence. ${tasteMemory} ${partnerMemory}`,
];

export const englishProof: LearningProof = {
  ...source,
  dates: source.dates.map((date, index) => ({
    ...date,
    label: ["First date", "After feedback", "Another correction", "A new encounter"][index],
    setting: "A window seat with the sound of rain",
    mine: { ...date.mine, name: names[date.mine.name] },
    counterpart: { ...date.counterpart, name: names[date.counterpart.name] },
    turns: date.turns.map((turn, line) => ({ ...turn, speakerAgentName: names[turn.speakerAgentName], content: turns[index][line] })),
    letter: letters[index], nextSearchNote: lessons[index],
    journal: date.journal ? { ...date.journal, overview: overviews[index], events: date.journal.events.map((event, row) => ({ ...event, title: journals[index][row][0], detail: journals[index][row][1] })) } : undefined,
  })),
  feedback: source.feedback.map((entry, index) => ({ ...entry, ...feedback[index], memory: memories[index] })),
} as LearningProof;
