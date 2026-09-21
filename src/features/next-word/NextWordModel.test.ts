import { describe, expect, it } from "vitest";
import { NextWordModel } from "./NextWordModel";

const text = "the cat sleeps. the cat eats. the dog sleeps. a dog barks.";

describe("a model that has only counted which word follows which", () => {
  it("offers the words that followed, most likely first, with how often it saw each", () => {
    const model = new NextWordModel(text, 1);
    expect(model.after(["the"])).toEqual({
      context: ["the"],
      candidates: [
        { word: "cat", count: 2, probability: 2 / 3 },
        { word: "dog", count: 1, probability: 1 / 3 },
      ],
    });
  });

  it("looks only as far back as it was told to", () => {
    const one = new NextWordModel(text, 1);
    const two = new NextWordModel(text, 2);
    expect(one.after(["a", "dog"]).candidates.map(({ word }) => word)).toEqual(["sleeps", "barks"]);
    expect(two.after(["a", "dog"]).candidates.map(({ word }) => word)).toEqual(["barks"]);
  });

  it("falls back to a shorter memory when it has never seen the longer one, and says which it used", () => {
    const two = new NextWordModel(text, 2);
    expect(two.after(["purple", "dog"])).toMatchObject({ context: ["dog"] });
    expect(two.after(["purple", "dog"]).candidates).toHaveLength(2);
  });

  it("has nothing to offer after a word it never saw followed by anything", () => {
    expect(new NextWordModel("hello", 1).after(["hello"]).candidates).toEqual([]);
  });

  it("knows its words, and which one it saw most", () => {
    const model = new NextWordModel(text, 1);
    expect(model.vocabulary).toContain("barks");
    expect(model.vocabulary).toHaveLength(8);
    expect(model.commonest).toBe(".");
  });

  it("lists every transition it learnt, the surest first", () => {
    const transitions = new NextWordModel("a b. a b. a c.", 1).transitions();
    expect(transitions[0]).toEqual({ context: ["b"], word: ".", count: 2, probability: 1 });
    expect(transitions).toContainEqual({ context: ["a"], word: "c", count: 1, probability: 1 / 3 });
  });
});
