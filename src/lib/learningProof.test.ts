import { createHash } from "node:crypto";
import { expect, test } from "vitest";
import source from "../fixtures/learningProof.json";
import { englishProof } from "../fixtures/learningProofEnglish";

test("English translations stay attached to the reviewed Korean source", () => {
  // Updating the recorded evidence requires reviewing its translations too.
  expect(createHash("sha256").update(JSON.stringify(source)).digest("hex")).toBe("0883dad9ea25fffa4fd19a569199bd9cf5dc072c1f173ad272c3584fab94f911");
  expect(englishProof.dates).toHaveLength(source.dates.length);
  englishProof.dates.forEach((date, index) => {
    const original = source.dates[index];
    expect(date.turns).toHaveLength(original.turns.length);
    expect(date.verdict).toBe(original.verdict);
    expect(date.reviewStatus).toBe(original.reviewStatus);
    expect(date.transcriptHash).toBe(original.transcriptHash);
    expect(date.journal?.events.map(e => [e.kind, e.rounds])).toEqual(original.journal.events.map(e => [e.kind, e.rounds]));
    date.turns.forEach((turn, line) => {
      expect([turn._id, turn.round, turn.isMine]).toEqual([original.turns[line]._id, original.turns[line].round, original.turns[line].isMine]);
      expect(turn.content.trim().length).toBeGreaterThan(0);
      expect(turn.speakerAgentName).toBeTruthy();
    });
    expect(date.journal?.events.every(e => Boolean(e.title && e.detail))).toBe(true);
  });
  expect(englishProof.feedback.map(f => [f.dateIndex, f.round, f.target])).toEqual(source.feedback.map(f => [f.dateIndex, f.round, f.target]));
});
