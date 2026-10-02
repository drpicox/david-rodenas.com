import { describe, expect, it } from "vitest";
import { askedQuestion } from "./askedQuestion";

describe("what an agent asks of the weather, as the page's own question", () => {
  it("is the page's own first question when nothing is said: torrid nights over the whole year, at the first station", () => {
    expect(askedQuestion({})).toEqual({ codes: ["WU"], kind: "torrid-nights", question: { variable: "tn", atLeast: true, threshold: 25, months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] } });
  });

  it("counts months from 1, as people do, and keeps each once, in order", () => {
    expect(askedQuestion({ months: [8, 6, 7, 7] })).toMatchObject({ question: { months: [5, 6, 7] } });
    expect(askedQuestion({ months: 7 })).toMatchObject({ question: { months: [6] } });
  });

  it("is every station when asked for all, and a kind's threshold moved when one is given", () => {
    expect(askedQuestion({ station: "all", kind: "frost-days", threshold: "-2" })).toMatchObject({ codes: ["WU", "X4", "X8", "D5", "UP", "XF", "XJ", "XE", "VK"], question: { variable: "tn", atLeast: false, threshold: -2 } });
  });

  it("takes the years to list, and refuses what is not one", () => {
    expect(askedQuestion({ from: 2010, to: "2020" })).toMatchObject({ from: 2010, to: 2020 });
    expect(askedQuestion({ to: "soon" })).toEqual({ refused: "to: soon is not a year" });
  });
});
