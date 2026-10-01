import { describe, expect, it } from "vitest";
import { answerOf } from "./answerOf";

const ORIGIN = "https://david-rodenas.com";

describe("what an agent is answered", () => {
  it("is the same shape from every tool: the words, the figures, and the page as an address", () => {
    const answer = answerOf({ summary: "100 €", data: { grownEuros: 100 }, route: "/money/" }, ORIGIN);
    expect(answer).toEqual({ summary: "100 €", data: { grownEuros: 100 }, url: "https://david-rodenas.com/money/" });
  });

  it("says who publishes the figures and when they were brought up to date, when they are someone else's", () => {
    const answer = answerOf({ summary: "40 µg/m³", source: "Generalitat de Catalunya", refreshed: "2026-09-20" }, ORIGIN);
    expect(answer).toEqual({ summary: "40 µg/m³", source: "Generalitat de Catalunya", refreshed: "2026-09-20" });
  });

  it("says whether the reader was shown it, when the tool has something to show", () => {
    expect(answerOf({ summary: "100 €" }, ORIGIN, true)).toEqual({ summary: "100 €", shown: true });
    expect(answerOf({ summary: "100 €" }, ORIGIN, false)).toEqual({ summary: "100 €", shown: false });
  });

  it("is a refusal said in words, and nothing else, when nothing was answered", () => {
    expect(answerOf({ refused: "rate: 99 is outside 0 to 20" }, ORIGIN, false)).toEqual({ summary: "Refused, nothing was run: rate: 99 is outside 0 to 20", refused: true });
  });
});
