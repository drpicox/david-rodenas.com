/**
 * The words after a program's name, as `--name value` or `--name=value`. What
 * the values mean is not this file's business: a program settles them, the
 * same way it settles what an agent sends.
 */
export function readOptions(args: readonly string[]): { given: Record<string, string> } | { help: true } | { error: string } {
  if (args.includes("--help")) return { help: true };
  const given: Record<string, string> = {};
  for (let at = 0; at < args.length; at += 1) {
    const word = args[at] ?? "";
    if (!word.startsWith("--")) return { error: `${word}: options are written --name value` };
    const equals = word.indexOf("=");
    if (equals > 0) {
      given[word.slice(2, equals)] = word.slice(equals + 1);
      continue;
    }
    const value = args[at + 1];
    if (value === undefined) return { error: `${word} needs a value` };
    given[word.slice(2)] = value;
    at += 1;
  }
  return { given };
}
