import { describe, expect, it } from "vitest";
import { GuessRound } from "./GuessRound";
import { RULES } from "./RULES";

const ascending = RULES[0]!;

describe("a round of guess the rule", () => {
  it("starts with 2, 4, 8, which every rule lets through", () => {
    for (const one of RULES) expect(one.holds(2, 4, 8), one.text).toBe(true);
    expect(new GuessRound(ascending).rows).toEqual([{ a: 2, b: 4, c: 8, holds: true, last: false }]);
  });

  it("tests a new sequence, marks it, and keeps the ones that pass first, then in order", () => {
    const round = new GuessRound(ascending);
    expect(round.test(3, 2, 1)).toBe("");
    expect(round.test(1, 2, 3)).toBe("");
    expect(round.rows.map(({ a, b, c, holds }) => `${a},${b},${c} ${holds ? "✅" : "❌"}`)).toEqual(["1,2,3 ✅", "2,4,8 ✅", "3,2,1 ❌"]);
    expect(round.rows.find((row) => row.last)).toMatchObject({ a: 1, b: 2, c: 3 });
  });

  it("says what is wrong with a sequence it cannot test, in the page's own words", () => {
    const round = new GuessRound(ascending);
    expect(round.test(Number.NaN, 1, 2)).toBe("Ops! Invalid numbers.");
    expect(round.test(2, 4, 8)).toBe("Ops! Sequence already present.");
  });

  it("checks a guess against the rule on every sequence from -100 to 100, and says so", () => {
    const round = new GuessRound(ascending);
    expect(round.guess("a < b")).toBe("Ops! This is not the rule. Test more sequences and guess again.");
    round.test(1, 2, 3);
    expect(round.guess("b > a && c > b")).toBe('Good! "b > a && c > b" is the rule.');
  });

  it("asks for another sequence before each new guess, and for a rule it can read", () => {
    const round = new GuessRound(ascending);
    round.guess("true");
    expect(round.guess("false")).toBe("Ops! Add another sequence test before a guess.");
    round.test(0, 0, 0);
    expect(round.guess("a <")).toBe("Ops! Cannot compile rule, please check your javascript rule or console for more information.");
  });
});
