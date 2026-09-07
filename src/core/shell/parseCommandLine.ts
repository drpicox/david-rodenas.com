/**
 * A line is one or more commands, separated by `;` or `&&`, each a list of
 * words. There is no quoting: nothing on this site has a space in its name.
 */
export function parseCommandLine(line: string): string[][] {
  return line
    .split(/\s*(?:;|&&)\s*/)
    .map((command) => command.trim().split(/\s+/).filter(Boolean))
    .filter((words) => words.length > 0);
}
