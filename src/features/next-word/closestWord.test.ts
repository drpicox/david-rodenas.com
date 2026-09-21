import { describe, expect, it } from "vitest";
import { closestWord } from "./closestWord";

describe("a word the model never saw", () => {
  it("is taken for the word it knows that is fewest letters away", () => {
    expect(closestWord("cats", ["dog", "cat", "sleeps"])).toBe("cat");
    expect(closestWord("slepes", ["dog", "cat", "sleeps"])).toBe("sleeps");
  });

  it("is itself when it is known", () => {
    expect(closestWord("dog", ["dot", "dog"])).toBe("dog");
  });

  it("is nothing when the model knows no words", () => {
    expect(closestWord("dog", [])).toBeNull();
  });
});
