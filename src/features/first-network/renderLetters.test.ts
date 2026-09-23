import { describe, expect, it } from "vitest";
import { glyphs } from "./glyphs";
import { LetterReader } from "./LetterReader";
import { renderLetters } from "./renderLetters";

describe("the board of the letter reader", () => {
  it("draws the twenty-five cells as buttons, pressed where the drawing is ink", () => {
    const html = renderLetters(new LetterReader(["A", "B"], 1), glyphs.T!);
    expect(html.match(/<button[^>]*data-at=/g)).toHaveLength(25);
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(glyphs.T!.filter(Boolean).length);
  });

  it("says, for each letter it was taught, how sure it is, and which it reads", () => {
    const reader = new LetterReader(["A", "B"], 1);
    reader.train(200);
    const html = renderLetters(reader, glyphs.B!);
    expect(html).toMatch(/It reads <b>B<\/b>/);
    expect(html).toMatch(/A<\/th><td[^>]*>.*?\d+%/s);
    expect(html).toContain("200 rounds");
  });

  it("says so when it has not been taught anything yet", () => {
    expect(renderLetters(new LetterReader(["A", "B"], 1), glyphs.A!)).toContain("not been taught");
  });
});
