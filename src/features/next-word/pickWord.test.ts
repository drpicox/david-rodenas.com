import { describe, expect, it } from "vitest";
import { pickWord } from "./pickWord";

const candidates = [
  { word: "cat", count: 3, probability: 0.75 },
  { word: "dog", count: 1, probability: 0.25 },
];

describe("choosing the next word", () => {
  it("is a throw of the dice, weighed by the chances", () => {
    expect(pickWord(candidates, () => 0.1)).toBe("cat");
    expect(pickWord(candidates, () => 0.74)).toBe("cat");
    expect(pickWord(candidates, () => 0.76)).toBe("dog");
  });

  it("still chooses when rounding leaves the dice just past the last chance", () => {
    expect(pickWord(candidates, () => 0.9999999)).toBe("dog");
  });

  it("has nothing to choose from nothing", () => {
    expect(pickWord([], () => 0.5)).toBeNull();
  });
});
