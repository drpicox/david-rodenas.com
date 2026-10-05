import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { creditLines } from "../../../platform/blueprint/nodes/creditLines";
import { pickColumn } from "../../../platform/blueprint/pickColumn";
import { layoutArchitecture } from "../layoutArchitecture";
import { renderArchitectureSvg } from "../renderArchitectureSvg";
import type { CodeGraph } from "./CodeGraph";
import { graphTableOf } from "./graphTableOf";
import { renderTangleSvg } from "./renderTangleSvg";
import { tangleLayoutOf } from "./tangleLayoutOf";

const WIDTH = 1100;
const TANGLED = 760;
/** A ball, in boxes, never outgrows the cell it has; tangled, it has more room. */
const SIZES = { boxes: [2.2, 6], tangle: [2.4, 10] } as const;
/** Beyond this many, a tangle takes too long to settle in a page, and is only ink. */
const MOST_TANGLED = 900;

/**
 * The graph drawn, as the architecture page draws the source: in its boxes,
 * or tangled, with no boxes, only the pull of the arrows. A ball can be as big
 * as one column and coloured by another — deep as a number is high, or in a
 * colour a group.
 */
export const pictureNode: NodeKind = {
  name: "picture",
  title: "Picture of the source",
  role: "paint",
  shelf: "This site",
  summary: "The graph drawn in its boxes, or tangled, each ball as big as one column and coloured by another.",
  inputs: [
    { name: "graph", label: "graph", type: "graph" },
    { name: "size", label: "as big as", type: "text", optional: true, editor: { kind: "column", of: "graph", numeric: true } },
    { name: "colour", label: "coloured by", type: "text", optional: true, editor: { kind: "column", of: "graph" } },
    { name: "layout", label: "drawn", type: "text", initial: "boxes", editor: { kind: "choice", choices: [{ value: "boxes", label: "in boxes" }, { value: "tangle", label: "tangled" }] } },
  ],
  outputs: [],
  run: (inputs) => {
    const graph = inputs["graph"] as CodeGraph;
    const table = graphTableOf(graph);
    const key = table.columns[0]?.name ?? "file";
    const idOf = new Map(graph.snapshot.modules.map((module) => [module.path, module.id]));
    const valuesOf = (name: string) => new Map(table.rows.map((row) => [idOf.get(String(row[key])) ?? -1, row[name] ?? null]));
    const tangled = inputs["layout"] === "tangle";
    const [smallest, biggest] = SIZES[tangled ? "tangle" : "boxes"];

    const size = inputs["size"] ? pickColumn(table, inputs["size"] as string, "as big as", { numeric: true }) : undefined;
    const sizes = size ? valuesOf(size.name) : undefined;
    const most = sizes ? Math.max(1e-9, ...[...sizes.values()].map((value) => (typeof value === "number" ? value : 0))) : 1;
    const radii = sizes && new Map([...sizes].map(([id, value]) => [id, smallest + (biggest - smallest) * Math.sqrt(Math.max(0, Number(value ?? 0)) / most)]));

    const colour = inputs["colour"] ? pickColumn(table, inputs["colour"] as string, "coloured by") : undefined;
    const tones = colour ? valuesOf(colour.name) : undefined;
    const numbers = tones ? [...tones.values()].filter((value): value is number => typeof value === "number") : [];
    const [low, high] = [Math.min(...numbers), Math.max(...numbers)];
    const groups = colour?.kind === "text" && tones ? [...new Set([...tones.values()].map(String))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) : [];
    // Most measures of a network are a few files high and the rest low: the square root spreads the low ones, so they do not all fade into the paper.
    const depth = (value: number) => Math.round(30 + 70 * Math.sqrt((value - low) / Math.max(1e-9, high - low)));
    const fills = colour?.kind === "number" && tones ? new Map([...tones].flatMap(([id, value]) => (typeof value === "number" ? [[id, `color-mix(in srgb, var(--bp-heat) ${depth(value)}%, var(--paper))`] as const] : []))) : undefined;
    const classes = groups.length > 0 && tones ? new Map([...tones].map(([id, value]) => [id, `bp-s${groups.indexOf(String(value)) % 8}`])) : undefined;
    const look = { ...(radii && { radii }), ...(fills && { fills }), ...(classes && { classes }) };

    if (tangled && graph.snapshot.modules.length > MOST_TANGLED) throw new Error(`${graph.snapshot.modules.length} ${graph.of} are too many to tangle here: keep some first`);
    const html = tangled
      ? renderTangleSvg(graph.snapshot, tangleLayoutOf(graph.snapshot, WIDTH, TANGLED), look, WIDTH, TANGLED)
      : renderArchitectureSvg(layoutArchitecture(graph.snapshot, { tests: true, width: WIDTH }), look);
    const said = [`${graph.snapshot.modules.length} ${graph.of}`, size && `as big as ${size.name}`, colour && `coloured by ${colour.name}`].filter(Boolean).join(", ");
    return { painting: { html: `<div class="bp-picture">${html}</div>`, caption: said, credits: creditLines(table) } };
  },
};
