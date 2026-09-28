import { fixed } from "../../platform/charts/fixed";
import { breakablePath } from "./breakablePath";
import type { Coverage } from "./Coverage";
import type { Life } from "./Life";

const W = 300;
const H = 12;
const PAD = 3;

/** A file's life on a line as long as the whole history, to the commit shown: a dot where it was written, a mark for every commit that changed it. */
function lifeOf(life: Life, commits: number, span: number): string {
  const x = (at: number) => fixed(PAD + (at / Math.max(1, span - 1)) * (W - PAD * 2));
  const end = life.went ?? commits - 1;
  const changes = life.changed.map((at) => `<line class="change" x1="${x(at)}" x2="${x(at)}" y1="1.5" y2="${H - 1.5}"/>`).join("");
  return (
    `<svg class="life" viewBox="0 0 ${W} ${H}" role="img" aria-label="written at commit ${life.born + 1}, changed at ${life.changed.length} commits after">` +
    `<line class="lived" x1="${x(life.born)}" x2="${x(end)}" y1="${H / 2}" y2="${H / 2}"/>${changes}<circle class="written" cx="${x(life.born)}" cy="${H / 2}" r="2.4"/></svg>`
  );
}

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
      return `<tr><td><code>${breakablePath(life.path)}</code></td><td>${life.changed.length}</td><td>${life.lines}</td><td>${share === undefined ? "–" : `${Math.round(share)}%`}</td><td>${lifeOf(life, commits, span)}</td></tr>`;
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
