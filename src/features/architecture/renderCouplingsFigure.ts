import { breakablePath } from "./breakablePath";
import type { Coupling } from "./couplingsOf";
import { joinedBy } from "./joinedBy";
import type { Life } from "./Life";
import type { Snapshot } from "./Snapshot";

/**
 * What changes together, as a figure: the pairs of files that ship that
 * changed in the same commits most often, and what joins them in the source
 * now — an arrow, arrows through other files, or nothing at all. A pair that
 * changes together with no arrow between them shares something the compiler
 * cannot see: a shape of markup, a name, an order, a convention.
 */
export function renderCouplingsFigure(couplings: readonly Coupling[], lives: readonly Life[], snapshot: Snapshot, count = 12): string {
  const lifeOf = new Map(lives.map((life) => [life.id, life]));
  const standing = new Set(snapshot.modules.map((module) => module.id));
  const ships = (id: number) => standing.has(id) && lifeOf.get(id)?.test === false;
  const links = snapshot.dependencies.map(({ from, to }) => [from, to] as const);
  const WORDS = { arrow: "an arrow", through: "arrows through others", none: "no arrow at all" } as const;
  const joined = (a: number, b: number) => WORDS[joinedBy(links, a, b)];
  const shown = couplings.filter(({ a, b }) => ships(a) && ships(b)).slice(0, count);
  const rows = shown.map(({ a, b, together }) => ({ together, a: lifeOf.get(a)?.path ?? "", b: lifeOf.get(b)?.path ?? "", joined: joined(a, b) }));
  const hidden = rows.filter((row) => row.joined === "no arrow at all").length;
  const body = rows
    .map((row) => `<tr${row.joined === "no arrow at all" ? ' class="hidden"' : ""}><td>${row.together}</td><td><code>${breakablePath(row.a)}</code></td><td><code>${breakablePath(row.b)}</code></td><td>${row.joined}</td></tr>`)
    .join("");
  const said = `The ${rows.length} pairs of files that changed together most, the tests and the sweeps left out, and what joins them in the source now. ${hidden} of them ${hidden === 1 ? "has" : "have"} no arrow between them, near or far.`;
  return (
    `<figure class="changes-figure"><table class="together"><thead><tr><th>commits</th><th>one file</th><th>and the other</th><th>between them</th></tr></thead>` +
    `<tbody>${body}</tbody></table><figcaption>${said}</figcaption></figure>`
  );
}
