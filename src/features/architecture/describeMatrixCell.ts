import { dayOf } from "./dayOf";
import type { Commit } from "./History";
import type { MatrixCell } from "./matrixCellsOf";

const SHOWN = 3;

/** A few files by name, the rest counted: a cell of a feature being written can hold thirty. */
function namesOf(paths: readonly string[]): string {
  const names = paths.map((path) => path.split("/").pop() ?? path);
  if (names.length > SHOWN) return `${names.slice(0, SHOWN).join(", ")} and ${names.length - SHOWN} more`;
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : (names[0] ?? "");
}

/** One cell of the picture of changes in words: the box, the day, what the commit did there, and what it said it did. */
export function describeMatrixCell(box: string | null, commit: Commit, { changed, written }: MatrixCell): string {
  const done = [changed.length > 0 ? `changed ${namesOf(changed)}` : "", written.length > 0 ? `wrote ${namesOf(written)}` : ""].filter(Boolean).join("; ");
  return `${box ?? "the files now gone"}, ${dayOf(commit)}: ${done || "nothing"} — ${commit.subject}`;
}
