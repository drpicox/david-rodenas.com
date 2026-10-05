import { describe, expect, it } from "vitest";
import { formulaOf } from "./formulaOf";

describe("a formula over the columns of a row", () => {
  it("works out arithmetic with the usual precedence, powers before products before sums", () => {
    expect(formulaOf("1 + 2 * 3 ^ 2").at({})).toBe(19);
    expect(formulaOf("(1 + 2) * 3").at({})).toBe(9);
    expect(formulaOf("2 ^ 3 ^ 2").at({})).toBe(512);
    expect(formulaOf("-2 ^ 2").at({})).toBe(-4);
  });

  it("reads a column's value by its name, and says which columns it reads", () => {
    const range = formulaOf("tx - tn");
    expect(range.at({ tx: 31.5, tn: 22 })).toBe(9.5);
    expect(range.names).toEqual(["tx", "tn"]);
  });

  it("knows a few functions, and the multiplication and division signs as written by hand", () => {
    expect(formulaOf("sqrt(16) + abs(-2) + max(1, 5, 3) + min(4, 2)").at({})).toBe(13);
    expect(formulaOf("round(log10(1000)) × 6 ÷ 3").at({})).toBe(6);
  });

  it("gives nothing for a row where a column it reads holds nothing, or words", () => {
    expect(formulaOf("tx * 2").at({ tx: null })).toBeNull();
    expect(formulaOf("tx * 2").at({ tx: "hot" })).toBeNull();
    expect(formulaOf("1 / 0").at({})).toBeNull();
  });

  it("says, in words, where a formula stops making sense", () => {
    expect(() => formulaOf("tx +")).toThrow("the formula ends where a value was expected");
    expect(() => formulaOf("tx tn")).toThrow("the formula goes on after it should end, at tn");
    expect(() => formulaOf("tx $ 2")).toThrow("the formula has a $, which it cannot read");
    expect(() => formulaOf("cube(2)")).toThrow("there is no function cube: there are abs, sqrt, log, log10, exp, round, floor, ceil, min, max");
  });
});
