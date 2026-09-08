export interface FrontMatter {
  readonly fields: Readonly<Record<string, string>>;
  readonly body: string;
}

const FENCE = "---";

function unquote(value: string): string {
  const quoted = /^"(.*)"$/.exec(value) ?? /^'(.*)'$/.exec(value);
  return quoted?.[1] ?? value;
}

/**
 * The header of a content file: `key: value`, one per line, between two `---`.
 * Deliberately not YAML — a file that needs more structure than this wants to
 * be code, not content.
 */
export function parseFrontMatter(source: string): FrontMatter {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  if (lines[0]?.trim() !== FENCE) return { fields: {}, body: source.trim() };

  const end = lines.indexOf(FENCE, 1);
  if (end < 0) return { fields: {}, body: source.trim() };

  const fields: Record<string, string> = {};
  for (const line of lines.slice(1, end)) {
    const at = line.indexOf(":");
    if (at <= 0) continue;
    fields[line.slice(0, at).trim()] = unquote(line.slice(at + 1).trim());
  }

  return { fields, body: lines.slice(end + 1).join("\n").trim() };
}
