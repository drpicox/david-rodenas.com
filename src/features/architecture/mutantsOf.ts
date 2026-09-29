/** One small change to a source: where, what it was, what it became, and the whole source with it. */
export interface Mutant {
  readonly line: number;
  readonly from: string;
  readonly to: string;
  readonly text: string;
}

/** Each operator and what it is turned into: a comparison into its opposite, a condition into the other, a bound over, a step by one the other way. */
const OPPOSITES: readonly (readonly [string, string])[] = [
  ["===", "!=="],
  ["!==", "==="],
  ["&&", "||"],
  ["||", "&&"],
  [">=", "<"],
  ["<=", ">"],
  ["+ 1", "- 1"],
  ["- 1", "+ 1"],
];
const WORDS: readonly (readonly [string, string])[] = [
  ["true", "false"],
  ["false", "true"],
];
const PART_OF_A_NAME = /[\w$]/;

/**
 * The mutants of a source: each one small change that a test worth having
 * would catch — `===` into `!==`, `&&` into `||`, `>=` into `<`, `true` into
 * `false`, a step by one the other way — made one at a time, in code only:
 * strings, templates and comments are left alone, and so is what only looks
 * like a comparison, a generic or a shift. Only on the `lines` asked for, if
 * any; and at most `most` of them, the first, the last, and evenly between.
 */
export function mutantsOf(source: string, lines: ReadonlySet<number> | null = null, most = Number.POSITIVE_INFINITY): Mutant[] {
  const found: { at: number; from: string; to: string }[] = [];
  let closing = "";
  for (let at = 0; at < source.length; at += 1) {
    const char = source[at] ?? "";
    if (closing) {
      if (closing !== "\n" && closing !== "*/" && char === "\\") at += 1;
      else if (source.startsWith(closing, at)) {
        at += closing.length - 1;
        closing = "";
      }
      continue;
    }
    if (source.startsWith("//", at)) closing = "\n";
    else if (source.startsWith("/*", at)) closing = "*/";
    else if (char === '"' || char === "'" || char === "`") closing = char;
    if (closing) continue;
    const operator = OPPOSITES.find(([from]) => source.startsWith(from, at));
    // A bound after `<`, `>` or `=` is part of a shift or of something else.
    if (operator && !(operator[0].length === 2 && /[<>=!]/.test(source[at - 1] ?? "") && /[<>]=/.test(operator[0]))) {
      found.push({ at, from: operator[0], to: operator[1] });
      at += operator[0].length - 1;
      continue;
    }
    const word = WORDS.find(([from]) => source.startsWith(from, at) && !PART_OF_A_NAME.test(source[at - 1] ?? "") && !PART_OF_A_NAME.test(source[at + from.length] ?? ""));
    if (word) {
      found.push({ at, from: word[0], to: word[1] });
      at += word[0].length - 1;
    }
  }
  const lineOf = (at: number) => source.slice(0, at).split("\n").length;
  const asked = found.filter(({ at }) => !lines || lines.has(lineOf(at)));
  const kept = asked.length <= most ? asked : Array.from({ length: most }, (_, index) => asked[most === 1 ? 0 : Math.round((index * (asked.length - 1)) / (most - 1))]).filter((one) => one !== undefined);
  return kept.map(({ at, from, to }) => ({ line: lineOf(at), from, to, text: source.slice(0, at) + to + source.slice(at + from.length) }));
}
