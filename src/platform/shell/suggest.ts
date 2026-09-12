/**
 * The rest of the line the reader is probably typing, shown in grey after
 * the cursor, the way fish does it. What was typed before wins over what
 * merely could be completed, most recent first, because a person who typed
 * `cd essays` a minute ago and now types `cd e` almost always means it again.
 * An empty line is offered `help`, which is the one word that opens the rest.
 */
export function suggest(line: string, history: readonly string[], completions: readonly string[]): string {
  if (line === "") return "help";
  const remembered = [...history].reverse();
  const match = [...remembered, ...completions].find((candidate) => candidate.startsWith(line) && candidate !== line);
  return match ? match.slice(line.length) : "";
}
