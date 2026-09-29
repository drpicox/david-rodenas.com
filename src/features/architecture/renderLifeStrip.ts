import { fixed } from "../../platform/charts/fixed";
import type { Life } from "./Life";

const W = 300;
const H = 12;
const PAD = 3;

/** A file's life on a line as long as `span` commits, to the commit shown, the `commits`th: a dot where it was written, a mark for every commit that changed it. */
export function renderLifeStrip(life: Life, commits: number, span = commits): string {
  const x = (at: number) => fixed(PAD + (at / Math.max(1, span - 1)) * (W - PAD * 2));
  const end = life.went ?? commits - 1;
  const changes = life.changed.map((at) => `<line class="change" x1="${x(at)}" x2="${x(at)}" y1="1.5" y2="${H - 1.5}"/>`).join("");
  return (
    `<svg class="life" viewBox="0 0 ${W} ${H}" role="img" aria-label="written at commit ${life.born + 1}, changed at ${life.changed.length} commits after">` +
    `<line class="lived" x1="${x(life.born)}" x2="${x(end)}" y1="${H / 2}" y2="${H / 2}"/>${changes}<circle class="written" cx="${x(life.born)}" cy="${H / 2}" r="2.4"/></svg>`
  );
}
