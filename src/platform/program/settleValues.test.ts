import { describe, expect, it } from "vitest";
import { aProgram } from "./aProgram";
import { settleValues } from "./settleValues";

describe("what a program is told, before it is run", () => {
  it("starts from the initial value of whatever was not said", () => {
    expect(settleValues(aProgram, { rate: 5 })).toEqual({ values: { sum: 100, rate: 5, years: 2 } });
  });

  it("takes numbers written as words, as a command line writes them", () => {
    expect(settleValues(aProgram, { years: "10" })).toEqual({ values: { sum: 100, rate: 10, years: 10 } });
  });

  it("refuses a name the program does not have, and says which ones it has", () => {
    expect(settleValues(aProgram, { colour: 3 })).toEqual({ error: "no option colour: choose sum, rate or years" });
  });

  it("refuses what is not a number", () => {
    expect(settleValues(aProgram, { rate: "lots" })).toEqual({ error: "rate: lots is not a number" });
  });

  it("refuses what is outside the dial rather than quietly moving it", () => {
    expect(settleValues(aProgram, { rate: 30 })).toEqual({ error: "rate: 30 is outside 0 to 20" });
  });

  it("lets a value fall between the dial's steps: the steps are the dial's, not the program's", () => {
    expect(settleValues(aProgram, { rate: 3.14 })).toEqual({ values: { sum: 100, rate: 3.14, years: 2 } });
  });
});
