/**
 * JSON with a line for each key down to a depth, and everything below that on
 * its key's line. Data kept in git is read through its diffs: with the years
 * two levels down, a new year shows up as one new line and nothing else moves.
 */
export function layeredJson(value: unknown, depth: number): string {
  return `${layer(value, depth)}\n`;
}

function layer(value: unknown, depth: number): string {
  const open = depth > 0 && typeof value === "object" && value !== null && !Array.isArray(value);
  if (!open) return JSON.stringify(value);
  const entries = Object.entries(value).map(([key, inner]) => `${JSON.stringify(key)}:${layer(inner, depth - 1)}`);
  return entries.length ? `{\n${entries.join(",\n")}\n}` : "{}";
}
