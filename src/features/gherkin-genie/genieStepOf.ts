/** How a sentence is known: the name its method answers to, and the values taken out of it. */
export interface GenieStep {
  readonly matchName: string;
  readonly args: readonly (string | number)[];
}

const ESCAPES: Readonly<Record<string, string>> = { n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", v: "\v", 0: "\0", s: " " };

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

/** A quoted piece runs on, space by space, until a quote of its own kind closes it unescaped. */
function closes(string: string, quote: string): boolean {
  if (!string.endsWith(quote)) return false;
  return string.at(-2) !== "\\" || /(^|[^\\])(\\\\)+.$/.test(string);
}

/**
 * A step's sentence read the way Gherkin Genie reads it — a port of its
 * `parseStepAndGenerateArguments`, so that nothing needs to match anything:
 * a quoted string is taken out and leaves an `S`, a number leaves an `N`,
 * whatever has no letters at all leaves an `X`, and every other word gives
 * its letters, capitalised. The name is the sentence.
 */
export function genieStepOf(sentence: string): GenieStep {
  const fragments = sentence.split(" ");
  const words: string[] = [];
  const args: (string | number)[] = [];
  for (let index = 0; index < fragments.length; ) {
    const fragment = fragments[index] ?? "";
    const quote = fragment[0];
    if (quote === '"' || quote === "'") {
      let string = fragments[index++] ?? "";
      while (index < fragments.length && !closes(string, quote)) string += ` ${fragments[index++]}`;
      args.push(string.slice(1, -1).replace(/\\(.)/g, (_, char: string) => ESCAPES[char] ?? char));
      words.push("S");
      continue;
    }
    index += 1;
    if (fragment && !Number.isNaN(Number(fragment))) {
      args.push(Number(fragment));
      words.push("N");
      continue;
    }
    const letters = fragment.normalize("NFD").replace(/([^\w]|\d)/g, "");
    if (letters) words.push(capitalize(letters));
    else if (fragment) {
      words.push("X");
      args.push(fragment);
    }
  }
  return { matchName: words.map(capitalize).join(""), args };
}
