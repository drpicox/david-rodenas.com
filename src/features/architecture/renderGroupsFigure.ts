import { fixed } from "../../platform/charts/fixed";
import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { bandOf } from "./bandOf";
import { boxOf } from "./boxOf";
import { modularityOf } from "./modularityOf";
import { plural } from "./plural";
import type { Snapshot } from "./Snapshot";

const W = 720;
const BAR = 240;
const ROW = 20;
const THICK = 12;
/** Groups smaller than this are counted, not drawn: a file alone is no structure. */
const LEAST = 3;
const NAMED = 3;

const KIND: Readonly<Record<string, string>> = { platform: "frame", features: "feature" };

/**
 * The groups the arrows make of the files, set against the boxes: each group
 * of the Louvain method as a bar of the boxes its files are in, the frame's in
 * one tone and the features' in another, the biggest first; and the two
 * modularities, the boxes' and the groups', which say how much of the arrows
 * each grouping keeps inside itself beyond what chance would.
 */
export function renderGroupsFigure(snapshot: Snapshot, groups: ReadonlyMap<number, number>): string {
  const pathOf = new Map(snapshot.modules.map((module) => [module.id, module.path]));
  const members = new Map<number, Map<string, number>>();
  for (const [id, group] of groups) {
    const box = boxOf(pathOf.get(id) ?? "");
    const boxes = members.get(group) ?? new Map<string, number>();
    boxes.set(box, (boxes.get(box) ?? 0) + 1);
    members.set(group, boxes);
  }
  const sized = [...members.values()]
    .map((boxes) => ({ boxes: [...boxes].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])), files: [...boxes.values()].reduce((sum, count) => sum + count, 0) }))
    .sort((a, b) => b.files - a.files || (a.boxes[0]?.[0] ?? "").localeCompare(b.boxes[0]?.[0] ?? ""));
  const drawnGroups = sized.filter((group) => group.files >= LEAST);
  const largest = Math.max(1, ...drawnGroups.map((group) => group.files));
  const rows = drawnGroups
    .map((group, index) => {
      const y = 6 + index * ROW;
      let x = 0;
      const parts = group.boxes
        .map(([box, count]) => {
          const width = (count / largest) * BAR;
          const part = `<rect class="part ${KIND[bandOf(box)] ?? "root"}" x="${fixed(x)}" y="${fixed(y)}" width="${fixed(Math.max(1, width - 2))}" height="${THICK}" rx="2"><title>${escapeHtml(`${box}: ${count}`)}</title></rect>`;
          x += width;
          return part;
        })
        .join("");
      const named = group.boxes.slice(0, NAMED).map(([box, count]) => `${box.split("/").pop()} ${count}`).join(", ");
      const rest = group.boxes.length > NAMED ? ` and ${group.boxes.length - NAMED} more` : "";
      return `${parts}<text class="group" x="${BAR + 12}" y="${fixed(y + THICK - 2)}">${escapeHtml(`${plural(group.files, "file")}: ${named}${rest}`)}</text>`;
    })
    .join("");
  const height = 6 + drawnGroups.length * ROW + 4;
  const svg = `<svg class="groups" viewBox="0 0 ${W} ${height}" role="img" aria-label="The groups the arrows make of the files, each as the boxes its files are in">${rows}</svg>`;

  const boxes = new Map(snapshot.modules.filter((module) => !module.test).map((module) => [module.id, boxOf(module.path)]));
  const names = [...new Set(boxes.values())];
  const byBox = new Map([...boxes].map(([id, box]) => [id, names.indexOf(box)]));
  const single = sized.filter((group) => group.boxes.length === 1).length;
  const alone = sized.length - drawnGroups.length;
  const said =
    `The arrows alone, with no box said, gather the ${plural(groups.size, "file")} that ship into ${plural(sized.length, "group")}` +
    `${alone > 0 ? `, ${plural(alone, "group")} of fewer than ${LEAST} files among them, not drawn` : ""}. ${single} of them hold the files of a single box. ` +
    `Drawn as the boxes say, the source has a modularity of ${modularityOf(snapshot, byBox).toFixed(2)}; drawn as the arrows would, ${modularityOf(snapshot, groups).toFixed(2)}.`;
  const key = (kind: string, words: string) => `<span class="key ${kind}"></span>${words}`;
  return `<figure class="changes-figure">${svg}<p class="changes-legend">${key("frame", "a box of the frame")}${key("feature", "a feature")}${key("root", "the top of the source")}</p><figcaption>${escapeHtml(said)}</figcaption></figure>`;
}
