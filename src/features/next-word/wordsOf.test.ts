import { describe, expect, it } from "vitest";
import { wordsOf } from "./wordsOf";

describe("a text as the model sees it", () => {
  it("is lower-case words, with each punctuation mark a word of its own", () => {
    expect(wordsOf("The cat sleeps. The dog, too!")).toEqual(["the", "cat", "sleeps", ".", "the", "dog", ",", "too", "!"]);
  });

  it("keeps an apostrophe and an accent inside the word they belong to", () => {
    expect(wordsOf("It's l'olor de Gràcia")).toEqual(["it's", "l'olor", "de", "gràcia"]);
  });

  it("does not see what markdown is written with", () => {
    expect(wordsOf("## A **bold** [link](/somewhere/) and `code`")).toEqual(["a", "bold", "link", "and", "code"]);
  });

  it("is nothing for nothing", () => {
    expect(wordsOf("  \n ")).toEqual([]);
  });
});
