/** A line of the file after a commit, or of the file before it that the commit took away. */
export interface DiffLine {
  readonly kind: "same" | "added" | "removed";
  readonly line: string;
}

/**
 * What a commit did to a file, the way a diff shows it: the longest run of
 * lines the two share in order stays; around it, what went is kept where it
 * was, and what came is where it came, the going before the coming.
 */
export function lineDiff(before: string, after: string): DiffLine[] {
  const a = before === "" ? [] : before.split("\n");
  const b = after.split("\n");
  const longest = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i -= 1)
    for (let j = b.length - 1; j >= 0; j -= 1)
      longest[i]![j] = a[i] === b[j] ? (longest[i + 1]![j + 1] ?? 0) + 1 : Math.max(longest[i + 1]![j] ?? 0, longest[i]![j + 1] ?? 0);
  const lines: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      lines.push({ kind: "same", line: b[j]! });
      i += 1;
      j += 1;
    } else if (i < a.length && (j >= b.length || (longest[i + 1]![j] ?? 0) >= (longest[i]![j + 1] ?? 0))) {
      lines.push({ kind: "removed", line: a[i]! });
      i += 1;
    } else {
      lines.push({ kind: "added", line: b[j]! });
      j += 1;
    }
  }
  return lines;
}
