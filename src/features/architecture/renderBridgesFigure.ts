import { escapeHtml } from "../../platform/markdown/escapeHtml";
import { breakablePath } from "./breakablePath";
import { percent } from "./percent";
import type { Snapshot } from "./Snapshot";

const SHOWN = 8;

/**
 * The files that stand between the others: those most of the shortest ways
 * between two other files pass through, the arrows read either way — each with
 * the share of all such ways it stands on, what it needs and what needs it.
 * Read either way, the arrows say where the parts of the source meet, not
 * which way a change would go: a file that needs nothing carries no change
 * through it, however much stands on either side of it.
 */
export function renderBridgesFigure(snapshot: Snapshot, between: ReadonlyMap<number, number>): string {
  const shipped = snapshot.modules.filter((module) => !module.test);
  const pathOf = new Map(shipped.map((module) => [module.id, module.path]));
  const count = (key: "from" | "to") => (id: number) => new Set(snapshot.dependencies.filter((dependency) => dependency[key] === id && pathOf.has(key === "from" ? dependency.to : dependency.from)).map((dependency) => (key === "from" ? dependency.to : dependency.from))).size;
  const [needs, neededBy] = [count("from"), count("to")];
  const others = shipped.length - 1;
  const pairs = (others * (others - 1)) / 2;
  const bridges = [...between].filter(([id, value]) => value > 0 && pathOf.has(id)).sort((a, b) => b[1] - a[1]).slice(0, SHOWN);
  const rows = bridges.map(([id, value]) => `<tr><td><code>${breakablePath(pathOf.get(id) ?? "")}</code></td><td>${percent(value, pairs)}</td><td>${needs(id)}</td><td>${neededBy(id)}</td></tr>`).join("");
  const [first] = bridges;
  const said = first
    ? `${pathOf.get(first[0])} stands on ${percent(first[1], pairs)} of the shortest ways between two other files that ship, the arrows read either way; where several ways are as short, each counts for its share.`
    : "No file stands between two others: nothing needs anything.";
  return (
    `<figure class="changes-figure"><table class="bridges"><thead><tr><th>file</th><th>of the ways between two others</th><th>needs</th><th>needed by</th></tr></thead><tbody>${rows}</tbody></table>` +
    `<figcaption>${escapeHtml(said)}</figcaption></figure>`
  );
}
