/** A rule over three numbers, and the words it is written in — which the reader is never shown. */
export interface Rule {
  readonly text: string;
  readonly holds: (a: number, b: number, c: number) => boolean;
}

const rule = (text: string): Rule => ({ text, holds: new Function("a", "b", "c", `return ${text};`) as Rule["holds"] });

/**
 * The rules of "Guess the rule", from the page my old site had in 2020, word
 * for word: every one of them holds for 2, 4, 8, so the first row says
 * nothing about which it is. Two of them are the same rule written twice —
 * `a + b < c` and `c - a > b` — as they were.
 */
export const RULES: readonly Rule[] = [
  "a < b && b < c",
  "a + 1 < b && b + 1 < c",
  "a + 1 < b && b + 2 < c",
  "a <= b && b <= c",
  "a <= b && b < c",
  "a < b && b <= c",
  "2 * a === b && 2 * b === c",
  "a > 0 && b > 0 && c > 0",
  "a === 2",
  "b === 4",
  "c === 8",
  "c > 3",
  "a + b + c > 5",
  "a + b + c >= 5",
  "a + b < c",
  "a + b <= c",
  "c - a > b",
  "a * b === c",
  "a * b <= c",
  "a * b >= c",
  "a !== b && b !== c && a !== c",
  "a === 2 && b === 4 && c === 8",
  "a % 2 === 0 && b % 2 === 0 && c % 2 === 0",
].map(rule);
