import { changeMatrixOf } from "./changeMatrixOf";
import type { Commit } from "./History";
import { historyUpTo } from "./historyUpTo";
import { layoutArchitecture } from "./layoutArchitecture";
import { plural } from "./plural";
import type { HistoryRead } from "./readHistory";
import { renderChangeMatrix } from "./renderChangeMatrix";
import { SWEEP } from "./SWEEP";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** From one commit's day to another's, saying the month and the year once when they are the same. */
function spanOf(first: Commit, last: Commit): string {
  const [y1, m1 = 1, d1] = first.date.slice(0, 10).split("-").map(Number);
  const [y2, m2 = 1, d2] = last.date.slice(0, 10).split("-").map(Number);
  const [month1, month2] = [MONTHS[m1 - 1], MONTHS[m2 - 1]];
  if (y1 !== y2) return `from ${d1} ${month1} ${y1} to ${d2} ${month2} ${y2}`;
  if (m1 !== m2) return `from ${d1} ${month1} to ${d2} ${month2} ${y2}`;
  return d1 === d2 ? `on ${d1} ${month1} ${y1}` : `from ${d1} to ${d2} ${month2} ${y2}`;
}

/**
 * Where the changes went, as a figure: the picture of every box at every
 * commit, a key to its marks, and what it counts. The boxes are grouped as
 * the picture of the architecture stands them, what needs above what is
 * needed. At a commit before the last, the picture still spans the whole
 * history, with what came after faded, and the counts stop at that commit.
 */
export function renderChangeMatrixFigure(read: HistoryRead, at = read.history.commits.length - 1): string {
  const { history, snapshots, lives } = read;
  const last = snapshots.at(-1) ?? { modules: [], dependencies: [] };
  const bands = layoutArchitecture(last).bands.map((band) => band.name);
  const sweeps = new Set(history.changes.flatMap((change, commit) => (change.changed.length > SWEEP ? [commit] : [])));
  const then = historyUpTo(read, at);
  const shipped = then.lives.filter((life) => !life.test);
  const changes = shipped.reduce((sum, life) => sum + life.changed.length, 0);
  const [first, shown] = [history.commits[0], then.history.commits.at(-1)];
  const count = then.history.commits.length === history.commits.length ? plural(history.commits.length, "commit") : `${then.history.commits.length} of ${plural(history.commits.length, "commit")}`;
  const span = first && shown ? `${count}, ${spanOf(first, shown)}` : "no commits";
  const key = (className: string, words: string) => `<span class="key ${className}"></span>${words}`;
  // The keys are shaded by the same rule as the cells, at the shade one, two, four and eight files get.
  const shade = (v: number, words: string) => `<span class="key shade" style="--v:${v}"></span>${words}`;
  return (
    `<figure class="changes-figure">${renderChangeMatrix(changeMatrixOf(lives, bands), history.commits, sweeps, then.history.commits.length - 1)}` +
    // Where a commit pointed at on the picture is said, by the script that listens for it.
    `<p class="changes-pointed" aria-live="polite"></p>` +
    `<p class="changes-legend">${shade(0.25, "one file changed")}${shade(0.5, "two")}${shade(0.75, "four")}${shade(1, "eight or more")}${key("written", "a file written")}${key("sweep", `a sweep, over ${SWEEP} files at once`)}</p>` +
    `<figcaption>${span}: ${plural(changes, "change")} to files that ship, and ${plural(shipped.length, "file")} written.</figcaption></figure>`
  );
}
