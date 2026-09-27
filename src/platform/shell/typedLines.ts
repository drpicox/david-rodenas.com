/**
 * Keys pressed before the prompt could listen, as the lines they would have
 * made: every one Enter finished, and the one still being typed. Backspace
 * takes back what it would have taken back. Nothing pressed is nothing.
 */
export function typedLines(keys: readonly string[]): { finished: string[]; unfinished: string } | null {
  if (keys.length === 0) return null;
  const finished: string[] = [];
  let line = "";
  for (const key of keys) {
    if (key === "Enter") {
      finished.push(line);
      line = "";
    } else if (key === "Backspace") line = line.slice(0, -1);
    else line += key;
  }
  return { finished, unfinished: line };
}
