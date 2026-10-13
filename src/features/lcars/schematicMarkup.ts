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

/** A conduit being run by hand: where from, what could take it, and where the hand is. */
export interface Joining {
  /** The module it is run from, and the port of it the hand took, where it took one. */
  readonly from: { readonly node: string; readonly port?: string };
  /** The inputs that could take it, by module. */
  readonly into: ReadonlyMap<string, readonly string[]>;
  /** Where the hand is, in the schematic's own pixels, while it drags. */
  readonly at?: { readonly x: number; readonly y: number };
  /** The module the hand is over, and the input of it, where it is over one. */
  readonly over?: { readonly node: string; readonly pin?: string };
  /** The input whose conduit the hand lifted off it. */
  readonly lifted?: { readonly node: string; readonly pin: string };
}

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
  /** The conduit a hand is running, while one is. */
  readonly joining?: Joining;
  /** The rows a hand put modules on: each stands there, and the rest around them. */
  readonly put?: ReadonlyMap<string, number>;
  /** The module a hand is moving, and how far down the schematic the hand has it. */
  readonly moving?: { readonly node: string; readonly top: number };
}

/**
 * A blueprint as an LCARS display would show it: every node a module and
 * every wire a conduit, in the colour of what flows along it. A module is
 * read from left to right, as the data flows: a port for each input a
 * conduit feeds, called as the input is; its name, in the colour of what it
 * is for; and the port its conduits leave from, carrying its figure. An end
 * nothing joins is rounded. Under it, what is written on the inputs no
 * conduit feeds, and what came out. A module is a button, pressed to ask
 * what it is. While a hand runs a conduit, the module it leaves, those that
 * could take it and the inputs it could go into are marked, and the conduit
 * is drawn out to where the hand is. A module a hand is moving is drawn
 * where the hand has it, over the place it would land; and the schematic
 * says of itself which row and column each module stands in, and where its
 * rows are, so that a hand on it is read against what is drawn and nothing
 * else. Markup, so that it is made the same wherever it is made, and drawn
 * again in place.
 */
export function schematicMarkup({ blueprint, kit, evaluation, chosen = null, pointed = null, runs = new Map(), set = new Map(), read = () => "", joining, put, moving }: SchematicShown): string {
  const faces = new Map(blueprint.nodes.map((node) => [node.id, faceOf(node, blueprint, kit, evaluation, read)]));
  const schematic = schematicOf(blueprint, new Map([...faces].map(([id, face]) => [id, { ins: face.ins.map((port) => port.pin), outs: face.outs.map((port) => port.pin), rows: face.rows.length }])), put);
  const placed = new Map(schematic.modules.map((module) => [module.id, module]));
  const byId = new Map(blueprint.nodes.map((node) => [node.id, node]));
  const feeding = new Set(schematic.conduits.map(({ wire }) => wire.from.node));
  const flow = flowOf(schematic);
  const ran = (id: string) => (runs.get(id) ? `${runs.get(id)! % 2}` : null);

  const conduits = schematic.conduits.map(({ wire, points }) => {
    const from = byId.get(wire.from.node);
    const type = kit.kinds.get(from?.kind ?? "")?.outputs.find((pin) => pin.name === wire.from.pin)?.type ?? "value";
    const d = conduitPath(points, SCHEMATIC.curve);
    const names = [
      "lc-conduit",
      evaluation.get(wire.from.node)?.state === "done" ? "" : "idle",
      ran(wire.from.node) ? `flow-${ran(wire.from.node)}` : "",
      chosen !== null && (wire.from.node === chosen || wire.to.node === chosen) ? "near" : "",
      joining?.lifted?.node === wire.to.node && joining.lifted.pin === wire.to.pin ? "lifted" : "",
    ];
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

  /** What marks an input of a module while a conduit is run: that it could take it, and that the hand is over it. */
  const taking = (id: string, pin: string) => [joining?.into.get(id)?.includes(pin) ? "fits" : "", joining?.over?.node === id && joining.over.pin === pin ? "over" : ""];
  const ports = (side: string, all: readonly Port[], id: string) =>
    all.length > 0
      ? tag(
          "span",
          { class: side },
          all.map((port) => tag("i", { class: ["lc-tab", port.figure ? "lc-figure" : "", ...(side === "lc-ins" ? taking(id, port.pin) : [])].filter(Boolean).join(" "), "data-pin": port.pin, style: `--pin: var(${port.colour})` }, port.said)),
        )
      : null;
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
      joining?.from.node === node.id ? "feeds" : "",
      joining?.into.has(node.id) ? "takes" : "",
      joining?.over?.node === node.id ? "over" : "",
      moving?.node === node.id ? "moving" : "",
    ];
    // Held by a hand, it is drawn where the hand has it: its place in the grid is the one it would land on.
    const held = moving?.node === node.id && at ? `; transform: translateY(${moving.top - at.y}px)` : "";
    return tag(
      "button",
      { type: "button", class: names.filter(Boolean).join(" "), "data-key": `node:${node.id}`, "data-node": node.id, "data-column": at?.column ?? 0, "data-row": at?.row ?? 0, "aria-pressed": node.id === chosen ? "true" : "false", title: kind?.summary ?? `There is no kind of node called ${node.kind}.`, style: `left: ${at?.x ?? 0}px; top: ${at?.y ?? 0}px; width: ${at?.width ?? 0}px; --lc-step: ${at?.column ?? 0}${held}` },
      tag("span", { class: "lc-pad" }, ports("lc-ins", face?.ins ?? [], node.id), tag("span", { class: "lc-name" }, tag("b", {}, node.title ?? kind?.title ?? node.kind)), ports("lc-outs", face?.outs ?? [], node.id)),
      face?.rows.length
        ? tag(
            "span",
            { class: "lc-told" },
            face.rows.map((row) => tag("span", { class: ["lc-row", row.how, ...taking(node.id, row.pin)].filter(Boolean).join(" "), "data-pin": row.pin }, tag("i", {}, row.label), tag("b", {}, row.value))),
          )
        : null,
      tag("span", { class: "lc-said" }, said),
    );
  });

  // The conduit a hand is running: out of the port it took, turning once it is clear of the module, and level to where the hand is.
  const source = joining ? placed.get(joining.from.node) : undefined;
  const taken = kit.kinds.get(byId.get(joining?.from.node ?? "")?.kind ?? "")?.outputs.find((pin) => pin.name === joining?.from.port);
  const rubber = (() => {
    if (!joining?.at || !source) return null;
    const from = { x: source.x + source.width, y: source.outs[joining.from.port ?? ""] ?? source.y + SCHEMATIC.pad / 2 };
    const turn = from.x + SCHEMATIC.channel / 2;
    return tag("path", { class: "lc-rubber", d: conduitPath([from, { x: turn, y: from.y }, { x: turn, y: joining.at.y }, joining.at], SCHEMATIC.curve) });
  })();

  const landing = moving ? placed.get(moving.node) : undefined;
  const [width, height] = [schematic.width, schematic.height];
  return tag(
    "div",
    {
      class: ["lc-world", chosen !== null ? "tracing" : "", joining ? "joining" : ""].filter(Boolean).join(" "),
      style: `width: ${width}px; height: ${height}px${joining ? `; --join: var(${kit.types.get(taken?.type ?? "")?.colour ?? "--dim"})` : ""}`,
      // How far down each row begins, and how high it is.
      "data-rows": schematic.rows.map((row) => `${row.top}:${row.height}`).join(" "),
    },
    tag("svg", { class: "lc-conduits", width, height, viewBox: `0 0 ${width} ${height}`, "aria-hidden": "true" }, conduits, rubber),
    landing ? tag("i", { class: "lc-slot", style: `left: ${landing.x}px; top: ${landing.y}px; width: ${landing.width}px` }) : null,
    modules,
  ).html;
}
