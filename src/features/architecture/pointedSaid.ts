import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { boxOf } from "./boxOf";
import type { Pointing } from "./lensesOf";
import type { Pointed } from "./pointedAt";

const NAMED = 3;
const DEPTH: Readonly<Record<string, number>> = { "1": 1, "2": 2, "3": 3, all: Infinity };
const nameOf = (path: string) => path.split("/").pop() ?? path;
const rest = (count: number) => (count > NAMED ? ` and ${count - NAMED} more` : "");

/**
 * What pointing at a file brought out, in words for the line beside the
 * picture, where they cover none of it: the file; then its arrows, counted
 * as far as they were asked for, each kind keyed to the colour it is drawn
 * in; its group, and the boxes in it; or the files it changed with, the most
 * often first — and how much of it the tests run, where that was counted.
 */
export function pointedSaid(path: string, pointing: Pointing, pointed: Pointed, paths: ReadonlyMap<number, string>, share?: number): string {
  const run = share === undefined ? "" : ` · tests run ${Math.round(share)}% of it`;
  const named = `<code>${escapeHtml(path)}</code> · `;
  if (pointing === "group") {
    const boxes = new Map<string, number>();
    for (const id of pointed.tied) {
      const box = boxOf(paths.get(id) ?? "");
      boxes.set(box, (boxes.get(box) ?? 0) + 1);
    }
    const most = [...boxes].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const said = most.slice(0, NAMED).map(([box, count]) => `${nameOf(box)} ${count}`).join(", ");
    return `${named}<span class="key group"></span>${escapeHtml(`its group: ${pointed.tied.size} files in ${most.length} ${most.length === 1 ? "box" : "boxes"}: ${said}${rest(most.length)}`)}${run}`;
  }
  if (pointing === "together") {
    const said = pointed.partners.slice(0, NAMED).map(([id, together]) => `${nameOf(paths.get(id) ?? "")} ${together}×`).join(", ");
    return `${named}<span class="key together"></span>${escapeHtml(pointed.partners.length > 0 ? `changed with ${said}${rest(pointed.partners.length)}` : "changed with no file twice")}${run}`;
  }
  // Those it names itself, and, when the arrows were asked to go further, how many are within that reach.
  const depth = DEPTH[pointing] ?? 1;
  const count = (found: ReadonlyMap<number, number>) => {
    const near = [...found.values()].filter((distance) => distance === 1).length;
    return depth > 1 && found.size > near ? `${near} (${found.size} within ${Number.isFinite(depth) ? depth : "any"})` : `${near}`;
  };
  return `${named}<span class="key needs"></span>needs ${count(pointed.needs)} · <span class="key needed-by"></span>needed by ${count(pointed.neededBy)}${run}`;
}
