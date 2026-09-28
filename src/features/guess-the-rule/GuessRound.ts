import type { Rule } from "./RULES";

/** A sequence tested, as the table shows it: whether the rule lets it through, and whether it is the one just tried. */
export interface Row {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly holds: boolean;
  readonly last: boolean;
}

/** As far as a guess is checked: every sequence with its three numbers from here to there. */
const LOW = -100;
const HIGH = 100;

const keyOf = (a: number, b: number, c: number) => `${a},${b},${c}`;

/**
 * One round of "Guess the rule", as my old site played it in 2020, its words
 * kept: the reader tests sequences, each marked ✅ or ❌ by a rule they cannot
 * see, and guesses the rule as a JavaScript expression of a, b and c. A guess
 * is right only if it agrees with the rule on every sequence it is checked
 * on; and there is one guess for each sequence tested, so that looking comes
 * before guessing.
 */
export class GuessRound {
  readonly #rule: Rule;
  readonly #tried: { a: number; b: number; c: number }[] = [{ a: 2, b: 4, c: 8 }];
  #last: string | null = null;
  #guesses = 0;

  constructor(rule: Rule) {
    this.#rule = rule;
  }

  /** The sequences tested: the ones the rule lets through first, then in order of their numbers. */
  get rows(): Row[] {
    return this.#tried
      .map(({ a, b, c }) => ({ a, b, c, holds: this.#rule.holds(a, b, c), last: keyOf(a, b, c) === this.#last }))
      .sort((x, y) => Number(y.holds) - Number(x.holds) || x.a - y.a || x.b - y.b || x.c - y.c);
  }

  /** Tries a sequence; says what is wrong with it, or nothing. */
  test(a: number, b: number, c: number): string {
    if ([a, b, c].some(Number.isNaN)) return "Ops! Invalid numbers.";
    this.#last = keyOf(a, b, c);
    if (this.#tried.some((row) => keyOf(row.a, row.b, row.c) === this.#last)) return "Ops! Sequence already present.";
    this.#tried.push({ a, b, c });
    return "";
  }

  /** Tries a rule, written as JavaScript; says how it went. */
  guess(text: string): string {
    if (this.#guesses >= this.#tried.length) return "Ops! Add another sequence test before a guess.";
    const unreadable = "Ops! Cannot compile rule, please check your javascript rule or console for more information.";
    let guessed: (a: number, b: number, c: number) => unknown;
    try {
      guessed = new Function(`'use strict';return (a,b,c) => ${text}`)();
    } catch {
      return unreadable;
    }
    this.#guesses += 1;
    try {
      for (let a = LOW; a <= HIGH; a += 1)
        for (let b = LOW; b <= HIGH; b += 1)
          for (let c = LOW; c <= HIGH; c += 1) if (guessed(a, b, c) !== this.#rule.holds(a, b, c)) return "Ops! This is not the rule. Test more sequences and guess again.";
    } catch {
      return unreadable;
    }
    return `Good! "${text}" is the rule.`;
  }
}
