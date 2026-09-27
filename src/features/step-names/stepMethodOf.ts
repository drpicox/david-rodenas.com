import type { StepMethod } from "./StepMethod";

type Argument = StepMethod["arguments"][number];

/**
 * A sentence read as a call, the way the course's platform read a student's
 * post: every word goes into the method's name, a quoted string becomes an
 * argument and an `S` in the name, a number an argument and an `N`. The first
 * argument of a sentence that says *should be* is the one expected. No step
 * has to be matched against a pattern someone wrote: the sentence is the name.
 * Ported from the platform's `MethodStepParser`, rule for rule.
 */
export function stepMethodOf(text: string): StepMethod {
  let at = 0;
  let name = "";
  const found: Argument[] = [];
  const counts: Record<string, number> = {};

  const accept = (pattern: RegExp) => {
    const match = pattern.exec(text.slice(at));
    if (match) at += match[0].length;
    return match?.[0];
  };
  const word = (piece: string) => {
    name += name.length === 0 ? piece.toLowerCase() : piece[0]?.toUpperCase() + piece.slice(1).toLowerCase();
  };
  const argument = (value: string, hint: "s" | "n", type: Argument["type"]) => {
    const count = counts[hint] ?? 1;
    counts[hint] = count + 1;
    const expects = /shouldBe/i.test(name) && !found.some((one) => one.name === "expected");
    found.push({ value, name: expects ? "expected" : `${hint}${count}`, type });
  };

  let before = -1;
  while (at < text.length && before !== at) {
    before = at;
    accept(/^[^a-z0-9"]+/i);
    const piece = accept(/^[a-z]+/i);
    if (piece) word(piece);
    const quoted = accept(/^"[^"]+"/);
    if (quoted) {
      argument(quoted, "s", "String");
      word("S");
    }
    const number = accept(/^[0-9]+/);
    if (number) {
      argument(number, "n", "int");
      word("N");
    }
  }
  return { name, arguments: found, text };
}
