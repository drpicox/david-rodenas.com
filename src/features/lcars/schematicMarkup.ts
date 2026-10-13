import type { Blueprint } from "../../platform/blueprint/Blueprint";
import type { Evaluation } from "../../platform/blueprint/Evaluation";
import { footOf } from "../../platform/blueprint/footOf";
import type { Kit } from "../../platform/blueprint/kitOf";
import { tag } from "../../platform/blueprint/tag";
import { conduitPath } from "./conduitPath";
import { faceOf, type Port } from "./faceOf";
import { flowOf } from "./flowOf";
import { SCHEMATIC } from "./SCHEMATIC";
import { schematicOf } from "./schematicOf";

/** What a schematic is drawn from. */
export interface SchematicShown {
  readonly blueprint: Blueprint;
  readonly kit: Kit;
  readonly evaluation: Evaluation;
  /** The module chosen, if one is. */
  readonly chosen?: string | null;
  /** The module pointed at from elsewhere — its dial, its picture on the board — to be lit while it is. */
  readonly pointed?: string | null;
  /** How many times each module has run here: one that runs again is seen to. */
  readonly runs?: ReadonlyMap<string, number>;
  /** What each dial is set to, as a reader would say it: a station by its name, not its code. */
  readonly set?: ReadonlyMap<string, string>;
  /** The files the site serves: what is written on an input is said as its list of choices says it, and some lists are read from a file. */
  readonly read?: (path: string) => string;
}

/**
 * A blueprint as an LCARS display would show it: every node a module and
 * every wire a conduit, in the colour of what flows along it. A module is
 * read from left to right, as the data flows: a port for each input a
 * conduit feeds, called as the input is; its name, in the colour of what it
 * is for; and the port its conduits leave from, carrying its figure. An end
 * nothing joins is rounded. Under it, what is written on the inputs no
 * conduit feeds, and what came out. A module is a button: on this display a
 * blueprint is worked on by pressing, never by dragging. Markup, so that it
 * is made the same wherever it is made, and drawn again in place.
 */
export function schematicMarkup({ blueprint, kit, evaluation, chosen = null, pointed = null, runs = new Map(), set = new Map(), read = () => "" }: SchematicShown): string {
  const faces = new Map(blueprint.nodes.map((node) => [node.id, faceOf(node, blueprint, kit, evaluation, read)]));
  const schematic = schematicOf(blueprint, new Map([...faces].map(([id, face]) => [id, { ins: face.ins.map((port) => port.pin), outs: face.outs.map((port) => port.pin), rows: face.rows.length }])));
  const placed = new Map(schematic.modules.map((module) => [module.id, module]));
  const byId = new Map(blueprint.nodes.map((node) => [node.id, node]));
  const feeding = new Set(schematic.conduits.map(({ wire }) => wire.from.node));
  const flow = flowOf(schematic);
  const ran = (id: string) => (runs.get(id) ? `${runs.get(id)! % 2}` : null);

  const conduits = schematic.conduits.map(({ wire, points }) => {
    const from = byId.get(wire.from.node);
    const type = kit.kinds.get(from?.kind ?? "")?.outputs.find((pin) => pin.name === wire.from.pin)?.type ?? "value";
    const d = conduitPath(points, SCHEMATIC.curve);
    const names = ["lc-conduit", evaluation.get(wire.from.node)?.state === "done" ? "" : "idle", ran(wire.from.node) ? `flow-${ran(wire.from.node)}` : "", chosen !== null && (wire.from.node === chosen || wire.to.node === chosen) ? "near" : ""];
    return tag(
      "g",
      {
        class: names.filter(Boolean).join(" "),
        // Called by both its ends: wired from somewhere else, it is another conduit, and one that begins is seen to.
        "data-key": `wire:${wire.to.node}.${wire.to.pin}:${wire.from.node}.${wire.from.pin}`,
        style: `--pin: var(${kit.types.get(type)?.colour ?? "--dim"}); --lc-step: ${placed.get(wire.from.node)?.column ?? 0}; --lc-from: ${flow.get(wire) ?? 0}`,
      },
      tag("path", { class: "lc-line", d }),
      // What flows along it, all the while: drawn in pixels, so that it goes as fast along a long conduit as along a short one.
      tag("path", { class: "lc-stream", d }),
      // A stroke a hundred long whatever the conduit's length, so that one rule of the stylesheet sends a pulse along any of them.
      tag("path", { class: "lc-pulse", d, pathLength: 100 }),
    );
  });

  const ports = (side: string, all: readonly Port[]) => (all.length > 0 ? tag("span", { class: side }, all.map((port) => tag("i", { class: port.figure ? "lc-tab lc-figure" : "lc-tab", "data-pin": port.pin, style: `--pin: var(${port.colour})` }, port.said))) : null);
  const modules = blueprint.nodes.map((node) => {
    const kind = kit.kinds.get(node.kind);
    const result = evaluation.get(node.id);
    const foot = footOf(result, node.kind);
    const at = placed.get(node.id);
    const face = faces.get(node.id);
    const named = node.title !== undefined && kind !== undefined && node.title !== kind.title;
    const said = [named || kind?.role === "dial" ? kind?.title : "", set.get(node.id) ?? foot.said].filter(Boolean).join(" · ");
    const names = [
      "lc-module",
      `lc-role-${kind?.role ?? "unknown"}`,
      face?.ins.length ? "" : "begins",
      feeding.has(node.id) ? "" : "ends",
      node.id === chosen ? "chosen" : "",
      node.id === pointed ? "pointed" : "",
      foot.trouble ? "trouble" : "",
      result?.state === "waiting" ? "waiting" : "",
      result?.state === "done" || foot.trouble ? "" : "idle",
      ran(node.id) ? `ran-${ran(node.id)}` : "",
    ];
    return tag(
      "button",
      { type: "button", class: names.filter(Boolean).join(" "), "data-key": `node:${node.id}`, "data-node": node.id, "aria-pressed": node.id === chosen ? "true" : "false", title: kind?.summary ?? `There is no kind of node called ${node.kind}.`, style: `left: ${at?.x ?? 0}px; top: ${at?.y ?? 0}px; width: ${at?.width ?? 0}px; --lc-step: ${at?.column ?? 0}` },
      tag("span", { class: "lc-pad" }, ports("lc-ins", face?.ins ?? []), tag("span", { class: "lc-name" }, tag("b", {}, node.title ?? kind?.title ?? node.kind)), ports("lc-outs", face?.outs ?? [])),
      face?.rows.length ? tag("span", { class: "lc-told" }, face.rows.map((row) => tag("span", { class: `lc-row ${row.how}` }, tag("i", {}, row.label), tag("b", {}, row.value)))) : null,
      tag("span", { class: "lc-said" }, said),
    );
  });

  const [width, height] = [schematic.width, schematic.height];
  return tag(
    "div",
    { class: chosen !== null ? "lc-world tracing" : "lc-world", style: `width: ${width}px; height: ${height}px` },
    tag("svg", { class: "lc-conduits", width, height, viewBox: `0 0 ${width} ${height}`, "aria-hidden": "true" }, conduits),
    modules,
  ).html;
}
