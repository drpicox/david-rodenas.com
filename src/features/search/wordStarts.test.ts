import { describe, expect, it } from "vitest";
import { wordStarts } from "./wordStarts";

describe("where a word starts a word of a text", () => {
  it("is every place a word of the text begins with it, and never the middle of a word", () => {
    expect(wordStarts("brain, rain and rainfall", "rain")).toEqual([7, 16]);
  });

  it("counts a word after a stroke or a quote as a word: hot-nights, l'ebre", () => {
    expect(wordStarts("/projects/hot-nights/ l'ebre", "nights")).toEqual([14]);
    expect(wordStarts("/projects/hot-nights/ l'ebre", "ebre")).toEqual([24]);
  });

  it("is nowhere for no word", () => {
    expect(wordStarts("anything", "")).toEqual([]);
  });
});
