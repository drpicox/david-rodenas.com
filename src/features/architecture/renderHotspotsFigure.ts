import { breakablePath } from "./breakablePath";
import type { Coverage } from "./Coverage";
import type { Life } from "./Life";
import { renderLifeStrip } from "./renderLifeStrip";

/**
 * The files that change most, which Adam Tornhill calls a code base's
 * hotspots: how often each changed, how long it is, how much of it the tests
 * run, and its life along the whole history — whether it changed in a burst
 * and settled, or keeps being changed. A hotspot no test runs is where a
 * change most easily breaks something without anyone knowing. Only the
 * files that ship, and are still there. Shown at a commit before the last, the
 * lives are drawn on the line of the whole history, `span` commits long, so
 * that as the history plays they grow along it instead of being stretched.
 */
export function renderHotspotsFigure(lives: readonly Life[], commits: number, coverage: Coverage | null, count = 12, span = commits): string {
  const hottest = lives
    .filter((life) => !life.test && life.went === undefined)
    .sort((a, b) => b.changed.length - a.changed.length || b.lines - a.lines || a.path.localeCompare(b.path))
    .slice(0, count);
  const tested = (life: Life) => coverage?.lines[life.path];
  const rows = hottest
    .map((life) => {
      const share = tested(life);
      return `<tr><td><code>${breakablePath(life.path)}</code></td><td>${life.changed.length}</td><td>${life.lines}</td><td>${share === undefined ? "–" : `${Math.round(share)}%`}</td><td>${renderLifeStrip(life, commits, span)}</td></tr>`;
    })
    .join("");
  const untested = hottest.filter((life) => tested(life) === 0).length;
  const said = [
    `The ${hottest.length} files changed most, each one's life on the same line of commits, from the first to the last: a dot where it was written, and a mark for every commit that changed it.`,
    coverage ? `${untested} of them ${untested === 1 ? "has" : "have"} no line a test runs.` : "",
  ].join(" ");
  return (
    `<figure class="changes-figure"><table class="hotspots"><thead><tr><th>file</th><th>changes</th><th>lines</th><th>tests run</th><th>its life, commit by commit</th></tr></thead>` +
    `<tbody>${rows}</tbody></table><figcaption>${said.trim()}</figcaption></figure>`
  );
}
