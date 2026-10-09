import { describe, expect, it } from "vitest";
import { markedOf } from "./markedOf";

describe("a line with the words looked for marked", () => {
  it("marks every place a word is said, whatever its case or accents, and escapes the rest", () => {
    expect(markedOf("Francesc Salvà measured <the> city; SALVÀ again", ["salva"])).toBe("Francesc <mark>Salvà</mark> measured &lt;the&gt; city; <mark>SALVÀ</mark> again");
  });

  it("marks a word only where a word starts with it, as it is found", () => {
    expect(markedOf("Brain, rain and rainfall", ["rain"])).toBe("Brain, <mark>rain</mark> and <mark>rain</mark>fall");
  });

  it("marks two words where they meet as one stretch, and leaves a line that says none as it was", () => {
    expect(markedOf("hot nights, hot days", ["hot", "nights"])).toBe("<mark>hot nights</mark>, <mark>hot</mark> days");
    expect(markedOf("nothing here", ["sea"])).toBe("nothing here");
  });
});
