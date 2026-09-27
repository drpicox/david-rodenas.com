/**
 * Which lines of a file are new since the version before: every line that is
 * not part of the longest run of lines the two share in order. What a diff
 * would mark with a plus, for a reader following a kata step by step.
 */
export function changedLines(before: string, after: string): boolean[] {
  const a = before === "" ? [] : before.split("\n");
  const b = after.split("\n");
  const longest = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i -= 1)
    for (let j = b.length - 1; j >= 0; j -= 1)
      longest[i]![j] = a[i] === b[j] ? (longest[i + 1]![j + 1] ?? 0) + 1 : Math.max(longest[i + 1]![j] ?? 0, longest[i]![j + 1] ?? 0);
  const changed = new Array<boolean>(b.length).fill(true);
  for (let i = 0, j = 0; i < a.length && j < b.length; ) {
    if (a[i] === b[j]) {
      changed[j] = false;
      i += 1;
      j += 1;
    } else if ((longest[i + 1]![j] ?? 0) >= (longest[i]![j + 1] ?? 0)) i += 1;
    else j += 1;
  }
  return changed;
}
