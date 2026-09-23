import { describe, expect, it } from "vitest";
import { glyphs } from "./glyphs";
import { LetterReader } from "./LetterReader";

const best = (reader: LetterReader, pixels: readonly number[]) => reader.read(pixels).reduce((a, b) => (b.score > a.score ? b : a)).letter;
const flipped = (pixels: readonly number[], at: number) => pixels.map((pixel, i) => (i === at ? 1 - pixel : pixel));

describe("a reader of letters on a grid of five by five", () => {
  it("draws every letter it knows on the same twenty-five cells", () => {
    for (const pixels of Object.values(glyphs)) expect(pixels).toHaveLength(25);
  });

  it("tells A from B once it has been taught, and says how sure it is of each", () => {
    const reader = new LetterReader(["A", "B"], 1);
    reader.train(200);
    expect(best(reader, glyphs.A!)).toBe("A");
    expect(best(reader, glyphs.B!)).toBe("B");
    expect(reader.read(glyphs.A!).map(({ letter }) => letter)).toEqual(["A", "B"]);
    expect(reader.rounds).toBe(200);
  });

  it("still reads a letter with a cell wrong, because it was taught on letters with a cell wrong", () => {
    const reader = new LetterReader(["A", "B"], 1);
    reader.train(200);
    for (let at = 0; at < 25; at += 1) expect(best(reader, flipped(glyphs.A!, at))).toBe("A");
  });

  it("learns every letter it knows at once, given the rounds", () => {
    const letters = Object.keys(glyphs);
    const reader = new LetterReader(letters, 1);
    reader.train(400);
    for (const letter of letters) expect(best(reader, glyphs[letter]!)).toBe(letter);
  });

  it("is the same reader, taught the same way, every time it starts from the same seed", () => {
    const one = new LetterReader(["A", "B"], 9);
    const two = new LetterReader(["A", "B"], 9);
    one.train(20);
    two.train(10);
    two.train(10);
    expect(one.read(glyphs.A!)).toEqual(two.read(glyphs.A!));
  });
});
