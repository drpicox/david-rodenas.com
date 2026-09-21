import { describe, expect, it } from "vitest";
import { sentenceOf } from "./sentenceOf";

describe("the model's words, put back the way people write them", () => {
  it("hangs punctuation on the word before it", () => {
    expect(sentenceOf(["the", "cat", "sleeps", ".", "the", "dog", ",", "too", "!"])).toBe("the cat sleeps. the dog, too!");
  });
});
